import * as THREE from 'three';
import { M, mat, box, cyl, at, chhatri, hemi, finial, onFace, archPanel } from '../helpers.js';

const STONE = mat('#c39a6e', 0.88);
const SHADE = mat('#a27b52', 0.9);

// An octagonal storey: eight faces, each with an arch, and a kiosk at every corner.
function octStorey(r, h, m, kiosk) {
  const g = new THREE.Group();
  const body = cyl(r, r, h, m, 0, 0, 0, 8);
  body.rotation.y = Math.PI / 8;
  g.add(body, cyl(r * 1.06, r * 1.06, 0.8, SHADE, 0, h - 0.8, 0, 8).rotateY(Math.PI / 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    g.add(onFace(at(archPanel(r * 0.42, h * 0.7, true, M.recess, 0.3), 0, 0.4, 0), a, r * Math.cos(Math.PI / 8)));
    if (kiosk) {
      const c = a + Math.PI / 8;
      g.add(at(chhatri(kiosk, kiosk * 2.8, m), Math.sin(c) * r, h, Math.cos(c) * r));
    }
  }
  return g;
}

export function buildSherShahSuri() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The square artificial lake and the causeway to the tomb
  g.add(box(260, 0.15, 260, M.grass), box(200, 0.5, 200, M.water, 0, -0.2, 0), box(8, 1.2, 70, SHADE, 0, 0, 66));
  // Stepped square platform with corner pavilions, rising from the water
  f.add(box(80, 4, 80, SHADE), box(66, 4, 66, STONE, 0, 4));
  for (const x of [-30, 30]) for (const z of [-30, 30]) f.add(at(chhatri(3.4, 10, STONE), x, 8, z));
  // The octagonal tomb in three tiers under its broad dome
  f.add(at(octStorey(22, 13, STONE, 2.6), 0, 8, 0), at(octStorey(17, 7, STONE, 2), 0, 21, 0), cyl(14, 14, 3, STONE, 0, 28, 0, 32));
  f.add(at(hemi(14, STONE, 40), 0, 31, 0), cyl(1.6, 2.4, 2.4, STONE, 0, 44.6, 0, 12), at(finial(4), 0, 46.8, 0));
  return { group: g, focus: f, view: [0.55, 0.3, 1.25] };
}
