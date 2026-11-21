import * as THREE from 'three';
import { mat, mesh, box, at, onFace } from '../helpers.js';
import { pilasters, mergeByMaterial } from './components.js';
import { trees, lampPosts, along, cityAround } from './realism.js';
import { detail } from '../detail.js';

// Baidyanath Dham at Deoghar, finer detail. Dimensions follow js/monuments/baidyanath-temple.js: the
// court 100 × 100 inside walls 5 high and 2 thick, the gate in the east (+z) wall 14 wide; the main
// temple at (0, -14), its spire rising to the panchashula at about 40 m, and Parvati's temple at
// (-19, -4), its spire about 19 m. The court walls get a moulded foot, pilasters and a coping on
// their outer face; and between the tops of Shiva's and Parvati's spires run the red silk threads of
// the gathbandhan, tied by pilgrims to bind the two. Then trees in the corners of the court, lamps
// along the outer path, and the lanes of Deoghar.
const SHADE = mat('#d8c9b0', 0.9), TRIM = mat('#c4b394', 0.9);
const SILK = mat('#c4161c', 0.6, 0, { side: 2 });

function walls(f) {
  const d = new THREE.Group();
  for (const [a, runs] of [[Math.PI, [[-50, 50]]], [0, [[-50, -7], [7, 50]]], [Math.PI / 2, [[-50, 50]]], [-Math.PI / 2, [[-50, 50]]]]) {
    for (const [p, q] of runs) {
      const l = q - p, mid = (p + q) / 2, lat = a === Math.PI || a === Math.PI / 2 ? -mid : mid;
      const g = new THREE.Group().add(box(l, 0.45, 0.2, TRIM, 0, 0, 0.1), box(l + 0.01, 0.35, 2.5, TRIM, 0, 5, -1));
      g.add(at(pilasters(l - 2, Math.max(2, Math.round(l / 5)), 0.55, 3.9, 0.12, SHADE), 0, 0.5, 0));
      d.add(onFace(g, a, 51, lat));
    }
  }
  f.add(mergeByMaterial(d));
}

// The gathbandhan: n silk threads from a to b, each hanging in its own sag, spread a little apart.
function gathbandhan(a, b, n = detail.low ? 4 : 9) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const t0 = (i / Math.max(1, n - 1) - 0.5), off = new THREE.Vector3(t0 * 0.5, t0 * 0.3, t0 * 0.6), sag = 2.2 + Math.abs(t0) * 1.2, pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24, p = new THREE.Vector3().lerpVectors(a, b, t).add(off.clone().multiplyScalar(Math.sin(t * Math.PI)));
      p.y -= Math.sin(t * Math.PI) * sag;
      pts.push(p);
    }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.035, 4, false), SILK));
  }
  return g;
}

export function addDetails(f, g) {
  walls(f);
  f.add(gathbandhan(new THREE.Vector3(0, 39.6, -14), new THREE.Vector3(-19, 18.6, -4)));
  f.add(trees([[-44, 44], [44, 44]], { kind: 'banyan', seed: 4, h: 12 }), trees([[-44, -45], [44, -45]], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(6, [-60, -60], [-60, 60]), ...along(6, [60, -60], [60, 60])]));
  // Deoghar's lanes press close round the temple court, the street to its east gate kept open.
  // Plain houses, for the budget (js/detail.js); on phones two rows, every other plot built.
  g.add(cityAround([-52, 52, -52, 52], { rows: detail.low ? 2 : 3, every: detail.low ? 2 : 1, fine: false, gap: 12, seed: 95, keep: [[-10, 10, 52, 400]] }));
}
