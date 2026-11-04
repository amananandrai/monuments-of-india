import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES } from '../helpers.js';
import { jharokha, chhajja, windowFrame, archRing, archSlab, mergeByMaterial } from './components.js';
import { trees, shrubs, boats, scatter, along } from './realism.js';

// The City Palace, Udaipur, finer detail. From photographs: the white blocks are hung with
// jharokhas under curved bangla roofs between their arched windows, storey on storey, with a
// course between the storeys and a deep eave at the top; the octagonal towers have windows in their
// upper storeys under an eave; the Lake Palace opens on the water in arcades.
// Dimensions follow js/monuments/city-palace-udaipur.js: the blocks [x, h, w, d] stand on a 14 m
// base, centred on z = -6.
const CREAM = mat('#efe6d2', 0.8), SHADE = mat('#d3c6a8', 0.85);
function architecture(f, g) {
  const d = new THREE.Group();
  const blocks = [[-110, 22, 16, 26], [-84, 34, 22, 28], [-54, 28, 20, 26], [-26, 40, 26, 30], [6, 32, 22, 28], [34, 44, 24, 30], [64, 30, 22, 28], [94, 26, 20, 26], [116, 20, 14, 24]];
  for (const [x, h, w, dd] of blocks) {
    const n = Math.max(2, Math.floor(w / 4)), z = -6 + dd / 2, floors = Math.floor(h / 7);
    for (let fl = 0; fl < floors; fl++) {
      for (let k = 0; k < n - 1; k++) if ((k + fl) % 2 === 0) d.add(at(jharokha(1.5, 2.2, CREAM, { d: 0.75, trim: SHADE }), x - w / 2 + (k + 1) * (w / n), 15.6 + fl * 7, z + 0.02));
      if (fl) d.add(at(box(w, 0.35, 0.3, SHADE, 0, 14 + fl * 7 - 0.5, 0), x, 0, z + 0.14));
    }
    d.add(at(chhajja(w + 0.6, 1.1, 0.4, 0.12, SHADE), x, 14 + h - 0.2, z));
  }
  for (const x of [-72, -40, 20, 50, 80]) {
    const t = at(new THREE.Group(), x, 0, 8);
    for (let k = 0; k < 8; k++) {
      const a = ((k + 0.5) / 8) * Math.PI * 2;
      for (const y of [36, 43]) t.add(onFace(at(windowFrame(1.2, 3, CREAM, { frame: 0.16 }), 0, y, 0), a, 4.04 * Math.cos(Math.PI / 8) + 0.02));
    }
    t.add(cyl(4.5, 4.5, 0.35, SHADE, 0, 40.5, 0, 8), cyl(4.6, 4.6, 0.35, SHADE, 0, 48, 0, 8));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
  // The Lake Palace (60 × 9 × 40 at (30, 3, 160)): an arcade on each face.
  const lp = at(new THREE.Group(), 30, 3, 160);
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? 60 : 40, n = Math.floor(len / 4);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n);
      lp.add(onFace(at(archSlab(2.4, 4.6, true, M.recess, 0.03), 0, 1.2, 0), a, (long ? 20 : 30), lat));
      lp.add(onFace(at(archRing(2.4, 4.6, true, 0.2, 0.1, SHADE), 0, 1.2, 0), a, (long ? 20 : 30), lat));
    }
    lp.add(onFace(at(chhajja(len + 0.6, 1, 0.4, 0.12, SHADE), 0, 8.8, 0), a, long ? 20 : 30));
  }
  g.add(mergeByMaterial(lp));
}

// The City Palace at Udaipur: canopied boats on Lake Pichola and round the Lake Palace, the scrub
// and trees of the ridge behind, and bougainvillea on the terraces.
export function addDetails(f, g) {
  architecture(f, g);
  g.add(boats([[-80, 60, 0.3], [-30, 95, 1.2], [90, 110, -0.5], [120, 60, 2.3], [-120, 130, 0.9], [-10, 150, 1.8], [75, 205, 0.2]], { y: 0.3, size: 1.8, canopy: true, colours: ['#f4f1ea', '#e8d9b0', '#c2512a'] }));
  g.add(trees(scatter(40, [-380, 380, -230, -50], { seed: 3, gap: 16, avoid: [[-130, 130, -30, 20]] }), { kind: 'mango', seed: 3, y: 0.2, h: 8 }));
  f.add(shrubs(along(14, [-120, 9.5], [120, 9.5]).map(([x, z]) => [x, z, 1.6]), { y: 14, flowers: '#d0306f', seed: 4 }));
}
