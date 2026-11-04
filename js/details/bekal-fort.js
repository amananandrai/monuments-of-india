import * as THREE from 'three';
import { M, mat, box, at, onFace, curvedBand } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { trees, shrubs, boats, asiBoard, scatter } from './realism.js';

// Bekal Fort, finer detail. The laterite walls are pierced with loopholes at three levels (the fort
// is known for them: the lowest for the nearest targets, the highest for the furthest), with a
// string course along the round wall; the bastions and the observation tower are banded and slit.
// Dimensions follow js/monuments/bekal-fort.js: the round wall R = 70, 3 thick, from H = 8 to 15.
const LATERITE = mat('#8f4e36', 0.95), LATERITE_DARK = mat('#6e3a27', 0.95);
function architecture(f) {
  const d = new THREE.Group(), R = 70, H = 8, from = 5.445, to = 10.26, pts = [];
  for (let k = 0; k <= 120; k++) { const a = from + ((to - from) * k) / 120; pts.push([Math.cos(a) * R, -Math.sin(a) * R, Math.cos(a), -Math.sin(a)]); }
  d.add(curvedBand(pts, 1.48, 1.75, H + 4.1, H + 4.45, LATERITE_DARK));
  for (let k = 0; k < 60; k++) {
    const a = from + ((to - from) * (k + 0.5)) / 60, ang = Math.atan2(Math.cos(a), -Math.sin(a));
    for (const [y, w, h] of [[H + 1.2, 0.5, 0.4], [H + 2.8, 0.3, 0.8], [H + 5.4, 0.3, 0.9]]) {
      if (y < H + 2 && k % 2) continue;
      d.add(onFace(box(w, h, 0.05, M.recess, 0, y, 0), ang, R + 1.51));
    }
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 7) * Math.PI;
    d.add(at(towerDetail(4.6, 4, 9, LATERITE, LATERITE_DARK, { n: 7, courses: [0.5] }), Math.cos(a) * R, H, -Math.sin(a) * R));
  }
  d.add(at(towerDetail(8, 7, 18, LATERITE, LATERITE_DARK, { n: 10, courses: [0.33, 0.66], slits: [0.15, 0.5, 0.82] }), 0, H, 0));
  for (const s of [-1, 1]) d.add(at(towerDetail(3.24, 3, 11, LATERITE, LATERITE_DARK, { n: 6, courses: [], slits: [0.3, 0.75] }), s * 8.35, H, 124.2));
  mergeByMaterial(d);
  f.add(d);
}

// Bekal Fort: coconut palms along the shore and on the headland, fishing boats drawn up on the
// beach below the walls and more out at sea, and grass and scrub inside the walls.
export function addDetails(f, g) {
  architecture(f);
  const shore = scatter(40, [-190, 190, 135, 330], { seed: 3, gap: 7, avoid: [[-30, 30, 125, 170]] });
  g.add(trees(shore, { kind: 'palm', seed: 3, y: 0.3 }));
  g.add(trees(scatter(14, [-60, 60, -60, 60], { seed: 4, gap: 10 }).filter(([x, z]) => Math.hypot(x, z) > 14 && Math.hypot(x, z) < 62), { kind: 'palm', seed: 4, y: 8 }));
  g.add(shrubs(scatter(30, [-60, 60, -60, 60], { seed: 5, gap: 5 }).filter(([x, z]) => Math.hypot(x, z) > 12 && Math.hypot(x, z) < 64).map(([x, z]) => [x, z, 2]), { y: 8, seed: 5 }));
  g.add(boats([[-120, 104, 0.3], [-108, 102, 0.1], [95, 104, -0.2], [118, 106, 0.4]], { y: 0.4, size: 1.6 }));
  g.add(boats([[-220, -160, 1.2], [180, -240, 2.1], [260, 40, 0.4], [-300, 60, 2.8], [60, -320, 1.7]], { y: 0.2, size: 2 }));
  g.add(asiBoard('Bekal Fort', 26, 150, 0));
}
