import * as THREE from 'three';
import { mesh, cyl, at, M, box, mat, rng, inst, unitBox, surface } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { lampPosts, boats, traffic } from './realism.js';
import { detail } from '../detail.js';

// The Bandra–Worli Sea Link, finer detail. The pylon's legs are tied by a cross-beam under the
// deck and its mast is crowned by a cap and a red aviation light; each stay cable ends in an
// anchor block on the deck's central median, and a median barrier runs between the carriageways.
// Every pier carries a hammerhead cap under the deck and stands on a pile cap at the water; the
// pylons stand on larger ones; the eight lanes are marked with dashed lines; and traffic runs on
// the deck. Dimensions follow js/monuments/bandra-worli-sea-link.js: the deck at y = 20; the main mast 128
// high with 14 cables a side over 250 m spans, and the Worli mast 76 high at x = 600 with 10 a side
// over 150 m.
const CONCRETE = mat('#c9c6bf', 0.85), RED = mat('#d0302a', 0.4, 0, { emissive: '#7a1410' });
const PAINT = surface(mat('#eeeae0', 0.7), 'none');
function architecture(f) {
  const d = new THREE.Group(), deckY = 20;
  for (const [cx, H, span, n] of [[0, 128, 250, 14], [600, 76, 150, 10]]) {
    d.add(box(5.6, 3, 21, CONCRETE, cx, deckY - 6, 0));
    d.add(box(5.2, 1.2, 6.0, CONCRETE, cx, H, 0), cyl(0.5, 0.5, 2, CONCRETE, cx, H + 1.2, 0, 10), at(mesh(new THREE.SphereGeometry(0.55, 12, 8), RED), cx, H + 3.4, 0));
    for (const side of [-1, 1]) for (let k = 1; k <= n; k++) d.add(box(1.6, 0.9, 3.4, CONCRETE, cx + side * (k / n) * span, deckY + 0.3, 0));
  }
  d.add(box(1560, 0.9, 0.6, CONCRETE, 0, deckY + 0.3, 0));
  mergeByMaterial(d);
  f.add(d);
  // The piers (every 50 m from -1040 to 1040, as the builder places them): a hammerhead cap under
  // the deck and a pile cap at the water, on those that stand in the sea. Pile caps under the pylons.
  const caps = [], piles = [];
  for (let x = -1040; x <= 1040; x += 50) if (Math.abs(x) > 40 && Math.abs(x - 600) > 30) {
    caps.push([x, deckY - 4.2, 0, 5.4, 1.8, 22]);
    if (Math.abs(x) < 760) piles.push([x, -0.6, 0, 8, 2.6, 19]);
  }
  for (const cx of [0, 600]) piles.push([cx, -0.6, 0, 16, 3.4, 40]);
  f.parent.add(inst(unitBox(), caps, CONCRETE), inst(unitBox(), piles, CONCRETE));
  // Lane lines: three dashed lines on each carriageway (desktops), and solid edge lines.
  const lines = [];
  if (!detail.low) for (const z of [-8.75, -6.4, -4.05, 4.05, 6.4, 8.75]) for (let x = -1040; x < 1040; x += 12) lines.push([x, deckY + 0.3, z, 4.5, 0.03, 0.16]);
  for (const z of [-10.95, -1.85, 1.85, 10.95]) lines.push([0, deckY + 0.3, z, 2080, 0.03, 0.16]);
  const lm = inst(unitBox(), lines, PAINT);
  lm.castShadow = false;
  f.parent.add(lm);
}

// The Bandra–Worli Sea Link: crash barriers and lamp posts along both edges of the deck, and the
// Koli fishing boats of Worli and Mahim out in the bay.
export function addDetails(f, g) {
  architecture(f);
  const deckY = 20.3, R = rng(21);
  for (const s of [-1, 1]) g.add(box(2100, 1.1, 0.4, mat('#d8d5ce', 0.8), 0, deckY, s * 11.6), box(2100, 0.2, 0.6, M.steel, 0, deckY + 1.1, s * 11.6));
  const lamps = [];
  for (let x = -1020; x <= 1020; x += 40) if (Math.abs(x) > 12) lamps.push([x, -11.9], [x, 11.9]);
  g.add(lampPosts(lamps, { h: 10, y: deckY }));
  // Traffic: four lanes each way.
  g.add(traffic([[-9.9, 1], [-7.6, 1], [-5.2, 1], [-2.9, 1], [2.9, -1], [5.2, -1], [7.6, -1], [9.9, -1]], -1040, 1040, { y: deckY, gap: 60, seed: 8, buses: 0.06 }));
  const fleet = [];
  for (let i = 0; i < 18; i++) fleet.push([-500 + R() * 1000, (R() < 0.5 ? -1 : 1) * (90 + R() * 300), R() * 6.28]);
  g.add(boats(fleet, { y: 0.25, size: 2.2, colours: ['#2f5d9a', '#c2512a', '#f2d23a', '#3c8a5a'] }));
}

