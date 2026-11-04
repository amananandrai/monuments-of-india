import * as THREE from 'three';
import { mat, mesh, box, rng, strut, V } from '../helpers.js';
import { trees, boats, scatter } from './realism.js';

// Omkareshwar on its island in the Narmada: the suspension footbridge from the south bank, the bank
// itself with the town and its trees, and boats on the river below the ghat steps.
const CABLE = mat('#d8d5ce', 0.5, 0.3), DECK = mat('#8a8780', 0.8);
export function addDetails(f, g) {
  const R = rng(9);
  g.add(box(700, 1.2, 110, mat('#a39a72', 0.95), 0, 0, 205), trees(scatter(40, [-320, 320, 160, 245], { seed: 3, gap: 14 }), { kind: 'neem', seed: 3, y: 1.2 }));
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
  const fleet = [];
  for (let i = 0; i < 14; i++) fleet.push([-200 + R() * 400, 40 + R() * 100, R() * 6.28]);
  g.add(boats(fleet, { y: 0.3, size: 1.6, colours: ['#2f5d9a', '#f2d23a', '#c2512a', '#3c8a5a'] }));
}
