import * as THREE from 'three';
import { mat, mesh, box, cyl, at, rng, strut, V, lathe, capsule, ellipsoid } from '../helpers.js';
import { shankaraBody, shankaraSurface } from '../parts/figures.js';
import { snap } from '../sdf.js';
import { detail } from '../detail.js';
import { trees, boats, scatter } from '../parts/realism.js';
import { petalRing, mergeByMaterial } from '../parts/components.js';
import { islandHeight } from '../monuments/omkareshwar-temple.js';

// The Statue of Oneness (Ekatmata ki Pratima, unveiled 2023) on the crest of Mandhata island:
// Adi Shankaracharya as a boy of twelve, 108 ft high in bronze, walking, on a 54 ft pedestal whose
// upper half is a lotus. Here the pedestal and figure are compressed with the rest of the island
// (figure 24, pedestal 9), keeping the 2:1 proportion of figure to pedestal. After photographs:
// the boy (js/parts/figures.js) holds the staff across his body in his right hand, a bundle of
// cloth tied at its top, and the water pot (kamandalu) in his left; a long rudraksha mala hangs to
// his waist and bands of rudraksha ring his upper arms and wrists. Faces south, over the ghats and
// the river.
const BRONZE = mat('#b06a3e', 0.42, 0.55), PLINTH = mat('#d9d2c4', 0.85), LOTUS = mat('#e4dccd', 0.8);
export function statueOfOneness() {
  const g = new THREE.Group(), P = 11, B = BRONZE;
  // A terrace levelled into the hilltop, a broad base, the drum of the pedestal, and the open
  // lotus on it: two rings of petals round its heart, on which he stands.
  g.add(cyl(12, 13, 4.5, PLINTH, 0, -2.5, 0, 32), cyl(8, 8.6, 1.4, PLINTH, 0, 2, 0, 32), cyl(5.6, 6.0, 3.4, PLINTH, 0, 3.4, 0, 32));
  g.add(at(petalRing(5.9, 20, 3.4, 2.3, 0.85, LOTUS, 0.3), 0, 6.6, 0), at(petalRing(4.7, 16, 3.3, 2.1, 0.45, LOTUS, 0.3), 0, 7.4, 0), cyl(4.2, 4.6, 3.6, LOTUS, 0, 7.4, 0, 32));
  // The boy, in his own units (1.5 to the top of his head), and what he holds and wears.
  const fig = new THREE.Group(), F = shankaraSurface();
  fig.add(shankaraBody(B));
  // The staff, crossing in front of him from above his right shoulder to below his left knee,
  // through his right fist; at its top a bundle of cloth tied on.
  const top = V(-0.36, 1.68, 0.12), foot = V(0.1, 0.24, 0.2);
  fig.add(capsule(foot, top, 0.0085, B), ellipsoid(0.02, 0.028, 0.02, B, -0.345, 1.64, 0.12), ellipsoid(0.012, 0.03, 0.01, B, -0.33, 1.6, 0.13));
  // The water pot hanging from his left hand: a round belly, a narrow neck, the spout, and the
  // handle arching up to his grip.
  const pot = at(new THREE.Group(), 0.22, 0.585, 0.075);
  pot.add(lathe([[0, 0], [0.035, 0.004], [0.055, 0.03], [0.058, 0.055], [0.045, 0.082], [0.02, 0.094], [0.024, 0.104], [0, 0.104]], B, 20));
  pot.add(capsule(V(0, 0.06, 0.05), V(0, 0.1, 0.1), 0.007, B, 0.004));
  const handle = mesh(new THREE.TorusGeometry(0.03, 0.004, 6, 16, Math.PI), B, 0, 0.104, 0);
  handle.rotation.y = Math.PI / 2;
  pot.add(handle);
  fig.add(pot);
  // The mala, its beads strung close from the sides of his neck to his waist, laid on the skin.
  const beads = [];
  for (let i = 0; i <= 72; i++) { const t = (i / 72) * 2 - 1; beads.push(snap(F, [0.085 * t, 1.21 - 0.33 * (1 - t * t), 0.16], 0.011)); }
  const bead = new THREE.IcosahedronGeometry(0.0095, detail.low ? 0 : 1);
  beads.forEach((q) => fig.add(mesh(bead, B, ...q)));
  // Three bands of rudraksha round each upper arm and one at each wrist.
  const band = (a, b, t, R) => {
    const A = V(...a), d = V(...b).sub(A), c = A.clone().addScaledVector(d, t), o = mesh(new THREE.TorusGeometry(R, 0.0055, 6, 20), B, c.x, c.y, c.z);
    o.quaternion.setFromUnitVectors(V(0, 0, 1), d.normalize());
    fig.add(o);
  };
  for (const [a, b, R] of [[[-0.16, 1.17, 0], [-0.19, 0.95, -0.015], 0.039], [[0.16, 1.17, 0], [0.195, 0.95, -0.01], 0.039]]) for (const t of [0.45, 0.55, 0.65]) band(a, b, t, R);
  band([-0.19, 0.95, -0.015], [-0.105, 0.86, 0.15], 0.82, 0.03);
  band([0.195, 0.95, -0.01], [0.21, 0.76, 0.05], 0.82, 0.03);
  fig.scale.setScalar(16);
  fig.position.y = P;
  g.add(fig);
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
