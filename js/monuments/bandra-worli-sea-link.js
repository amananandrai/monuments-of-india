import * as THREE from 'three';
import { M, mat, box, at, rng, V, strut, inst, unitBox } from '../helpers.js';

const CONCRETE = mat('#c9c6bf', 0.85);
const CABLE = mat('#e8e6e1', 0.5, 0.3);

// An inverted-Y pylon: two legs from the deck edges meeting above the road, then one mast.
function pylon(h, deckY, w) {
  const g = new THREE.Group(), meet = deckY + h * 0.38;
  for (const s of [-1, 1]) g.add(strut(V(0, 0, s * (w / 2 + 2)), V(0, meet, 0), 3.4, CONCRETE));
  g.add(box(4.4, h - meet, 5.2, CONCRETE, 0, meet, 0));
  return g;
}

export function buildBandraWorli() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(37);
  g.add(f);
  g.add(box(4000, 0.4, 2400, M.water, 0, -0.2, 0));
  const deckY = 20, W = 24, H = 128, span = 250;
  // Deck on piers out to the approach viaducts
  f.add(box(520, 2.4, W, CONCRETE, 0, deckY - 2.4, 0), box(520, 0.3, W - 2, M.asphalt, 0, deckY, 0));
  for (const s of [-1, 1]) g.add(box(540, 2.4, W, CONCRETE, s * 530, deckY - 2.4, 0), box(540, 0.3, W - 2, M.asphalt, s * 530, deckY, 0));
  const piers = [];
  for (let x = -790; x <= 790; x += 50) if (Math.abs(x) > 40) piers.push([x, 0, 0, 4, deckY - 2.4, W * 0.6]);
  g.add(inst(unitBox(), piers, CONCRETE));
  // The main pylon with fans of stay cables to both sides
  f.add(pylon(H, deckY, W));
  for (const side of [-1, 1]) for (let k = 1; k <= 14; k++) {
    const x = side * (k / 14) * span, top = H - 4 - k * 2.6;
    for (const z of [-0.8, 0.8]) f.add(strut(V(0, top, z), V(x, deckY + 0.3, z * 2), 0.35, CABLE));
  }
  // The Mumbai skyline across the bay
  const city = [];
  for (let i = 0; i < 70; i++) city.push([-900 + i * 26 + R() * 10, 0, -700 - R() * 160, 18 + R() * 14, 30 + R() * 140, 18 + R() * 14]);
  g.add(inst(unitBox(), city, mat('#a9adb4', 0.9)));
  return { group: g, focus: f, view: [0.35, 0.25, 1.2] };
}
