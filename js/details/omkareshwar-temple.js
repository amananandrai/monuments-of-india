import * as THREE from 'three';
import { mat, mesh, box, cyl, at, rng, strut, V, lathe, smoothLathe, capsule, ellipsoid, hemi } from '../helpers.js';
import { trees, boats, scatter } from './realism.js';
import { petalRing, mergeByMaterial } from './components.js';
import { islandHeight } from '../monuments/omkareshwar-temple.js';

// The Statue of Oneness (Ekatmata ki Pratima, unveiled 2023) on the crest of Mandhata island:
// Adi Shankaracharya as a boy of twelve, 108 ft high in metal on a 54 ft pedestal, robed to the
// ankles, his hair falling to his shoulders, a tall staff in his left hand. Here the pedestal and
// figure are compressed with the rest of the island (figure 24, pedestal 9), keeping the 2:1
// proportion of figure to pedestal. Faces south, over the ghats and the river.
const METAL = mat('#8c8172', 0.55, 0.35), PLINTH = mat('#d9d2c4', 0.85);
function statueOfOneness() {
  const g = new THREE.Group(), P = 11, Mt = METAL;
  // A terrace levelled into the hilltop, the lotus base and the drum of the pedestal.
  g.add(cyl(12, 13, 4.5, PLINTH, 0, -2.5, 0, 32), cyl(8, 8.6, 1.4, PLINTH, 0, 2, 0, 32));
  g.add(cyl(5.2, 5.6, 6.2, PLINTH, 0, 3.4, 0, 32), at(petalRing(5.2, 16, 2.4, 1.6, 0.9, Mt), 0, 9.4, 0), cyl(4.6, 4.6, 1.2, Mt, 0, 9.6, 0, 32));
  // The robe from the ankles to the shoulders, with feet showing at its hem.
  g.add(at(smoothLathe([[1.5, 0], [1.9, 0.4], [1.85, 4], [1.7, 9], [1.85, 13], [2.1, 16.5], [2.2, 18], [1.6, 19.6], [0.7, 20.2], [0, 20.3]], Mt), 0, P, 0));
  for (const s of [-1, 1]) g.add(ellipsoid(0.45, 0.3, 0.8, Mt, s * 0.6, P + 0.2, 1.4));
  // Arms: the right bent with the hand raised before the chest, the left hanging to grip the staff.
  g.add(capsule(V(-2.0, P + 17.8, 0), V(-2.4, P + 13.4, 0.5), 0.55, Mt, 0.48), capsule(V(-2.4, P + 13.4, 0.5), V(-1.1, P + 15.2, 1.9), 0.48, Mt, 0.42));
  g.add(capsule(V(2.0, P + 17.8, 0), V(2.6, P + 13.2, 0.3), 0.55, Mt, 0.48), capsule(V(2.6, P + 13.2, 0.3), V(2.9, P + 10.4, 0.9), 0.48, Mt, 0.4));
  // The staff, taller than the boy, held in the left hand.
  g.add(cyl(0.16, 0.16, 25, Mt, 3.0, P, 1.0, 8));
  // Neck, head and the hair falling behind to the shoulders.
  g.add(cyl(0.6, 0.7, 1.0, Mt, 0, P + 20.1, 0, 12), ellipsoid(1.15, 1.45, 1.25, Mt, 0, P + 22.2, 0.1));
  g.add(at(hemi(1.3, Mt, 16), 0, P + 22.3, -0.1), ellipsoid(1.35, 1.6, 0.8, Mt, 0, P + 21.0, -0.7));
  return mergeByMaterial(g);
}

// Omkareshwar on its island in the Narmada: the suspension footbridge from the south bank, the bank
// itself with its trees (clear of the town on it, x -160 to 160, z 155 to 220, built in
// js/monuments/omkareshwar-temple.js), and boats on the river below the ghat steps.
const CABLE = mat('#d8d5ce', 0.5, 0.3), DECK = mat('#8a8780', 0.8);
export function addDetails(f, g) {
  const R = rng(9);
  g.add(box(700, 1.2, 110, mat('#a39a72', 0.95), 0, 0, 205), trees(scatter(40, [-320, 320, 160, 245], { seed: 3, gap: 14, avoid: [[-160, 160, 155, 220]] }), { kind: 'neem', seed: 3, y: 1.2 }));
  // The Mamleshwar footbridge: two towers, a deck, the main cables and the hangers
  const x = -70, z0 = 24, z1 = 152, deckY = 9;
  g.add(box(4, 0.5, z1 - z0, DECK, x, deckY, (z0 + z1) / 2));
  for (const z of [z0 + 18, z1 - 18]) for (const s of [-1, 1]) g.add(strut(V(x + s * 2.4, 0, z), V(x + s * 2.4, deckY + 18, z), 0.8, mat('#c2512a', 0.8)));
  for (const s of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 24; k++) { const t = k / 24, z = z0 + (z1 - z0) * t, mid = Math.abs(z - (z0 + z1) / 2) / ((z1 - z0) / 2 - 18); pts.push(new THREE.Vector3(x + s * 2.4, deckY + 1 + Math.min(17, 17 * mid * mid), z)); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.14, 6, false), CABLE));
    for (let k = 1; k < 24; k++) g.add(strut(new THREE.Vector3(pts[k].x, deckY + 0.3, pts[k].z), pts[k], 0.05, CABLE));
  }
  // The statue on the crest behind the town, its terrace set at the lowest ground under it.
  const sx = -8, sz = -116;
  let lo = Infinity;
  for (let a = 0; a < 6.28; a += 0.4) lo = Math.min(lo, islandHeight(sx + 7 * Math.cos(a), sz + 7 * Math.sin(a)));
  g.add(at(statueOfOneness(), sx, lo + 1.2, sz));
  const fleet = [];
  for (let i = 0; i < 14; i++) fleet.push([-200 + R() * 400, 40 + R() * 100, R() * 6.28]);
  g.add(boats(fleet, { y: 0.3, size: 1.6, colours: ['#2f5d9a', '#f2d23a', '#c2512a', '#3c8a5a'] }));
}
