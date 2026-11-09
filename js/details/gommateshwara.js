import * as THREE from 'three';
import { mat, box, cyl, at, onFace, FACES } from '../helpers.js';
import { chhajja, frieze, petalRing, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';
import { vindhyagiri } from '../monuments/gommateshwara.js';

// Gommateshwara, finer detail. From photographs of the hilltop enclosure: a sloping eave runs along
// the cloisters round the statue, carved in a band under it; and in the court before the statue
// stands a manastambha, a tall carved pillar on a stepped base with a lotus capital and a small
// pavilion on top. Dimensions follow js/monuments/gommateshwara.js: the hilltop at H = 40, the
// cloister a ring of blocks 4.5 high round a 36 m square.
const GRANITE = mat('#c9c3b6', 0.8);
function architecture(f) {
  const d = new THREE.Group(), H = 40;
  for (const a of FACES) {
    d.add(onFace(at(chhajja(38.6, 1.4, 0.5, 0.14, GRANITE), 0, H + 5, 0), a, 19.1));
    d.add(onFace(box(37.8, 0.7, 0.06, frieze(GRANITE), 0, H + 3.6, 0), a, 19.12));
  }
  const p = at(new THREE.Group(), 11, H + 0.5, 10);
  for (let k = 0; k < 3; k++) p.add(box(5 - k * 1.2, 0.6, 5 - k * 1.2, GRANITE, 0, k * 0.6, 0));
  p.add(cyl(0.45, 0.55, 12, GRANITE, 0, 1.8, 0, 8));
  for (const y of [4, 7.5, 11]) p.add(cyl(0.62, 0.62, 0.4, frieze(GRANITE), 0, y, 0, 8));
  p.add(at(petalRing(0.5, 10, 1.0, 0.6, 0.6, GRANITE), 0, 13.8, 0), box(1.8, 0.3, 1.8, GRANITE, 0, 14.4, 0));
  for (const x of [-0.7, 0.7]) for (const z of [-0.7, 0.7]) p.add(cyl(0.08, 0.08, 1.4, GRANITE, x, 14.7, z, 6));
  p.add(box(2, 0.3, 2, GRANITE, 0, 16.1, 0), cyl(0, 0.9, 1.2, GRANITE, 0, 16.4, 0, 8));
  d.add(p);
  mergeByMaterial(d);
  f.add(d);
}

// Gommateshwara at Shravanabelagola: scrub on the bare granite of the Vindhyagiri, coconut palms
// and tamarinds in the town fields below (none on the stair, which climbs the front between x = -12
// and 12), and the ASI board at the foot of the steps.
export function addDetails(f, g) {
  architecture(f);
  const H = 40;
  const rock = scatter(30, [-75, 75, -75, 75], { seed: 5, gap: 7 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 26 && r < 72 && !(Math.abs(x) < 14 && z > 15); });
  g.add(shrubs(rock.map(([x, z]) => [x, z, 2, vindhyagiri(x, z) - 0.3]), { dry: true, seed: 5 }));
  g.add(trees(scatter(30, [-145, 145, -145, 145], { seed: 6, gap: 14 }).filter(([x, z]) => Math.hypot(x, z) > 88), { kind: 'palm', seed: 6 }));
  g.add(asiBoard('Gommateshwara, Shravanabelagola', 11, 88, 0));
}
