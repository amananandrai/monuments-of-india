import * as THREE from 'three';
import { M, mat, box, at, rng, V, strut, inst, unitBox, sheet } from '../helpers.js';
import { addDetails } from '../details/bandra-worli-sea-link.js';

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
  g.add(sheet(4000, 2400, M.sea, 0, 0.2, 0));
  const deckY = 20, W = 24, H = 128, span = 250;
  // Deck on piers out to the approach viaducts
  f.add(box(520, 2.4, W, CONCRETE, 0, deckY - 2.4, 0), box(520, 0.3, W - 2, M.asphalt, 0, deckY, 0));
  for (const s of [-1, 1]) g.add(box(540, 2.4, W, CONCRETE, s * 530, deckY - 2.4, 0), box(540, 0.3, W - 2, M.asphalt, s * 530, deckY, 0));
  const piers = [];
  for (let x = -790; x <= 790; x += 50) if (Math.abs(x) > 40 && Math.abs(x - 600) > 30) piers.push([x, 0, 0, 4, deckY - 2.4, W * 0.6]);
  g.add(inst(unitBox(), piers, CONCRETE));
  // Two cable-stayed spans: over the Bandra channel the 128 m main pylon with 250 m to either
  // side, and over the Worli channel a second, smaller inverted-Y pylon with 150 m to either side.
  // Each pylon carries a fan of stays to both sides in the central plane, anchored on the median.
  for (const [cx, h, sp, n] of [[0, H, span, 14], [600, 76, 150, 10]]) {
    const t = at(pylon(h, deckY, W), cx, 0, 0);
    f.add(t);
    const drop = (h - deckY) * 0.33 / n;
    for (const side of [-1, 1]) for (let k = 1; k <= n; k++) {
      const x = cx + side * (k / n) * sp, top = h - 4 - k * drop;
      for (const z of [-0.8, 0.8]) f.add(strut(V(cx, top, z), V(x, deckY + 0.3, z * 2), 0.35, CABLE));
    }
  }
  // The Mumbai skyline across the bay
  const city = [];
  // Towers along the Worli and Bandra shores, each a body of light concrete banded with glazing
  // floor by floor, some crowned with a lift room.
  const bands = [], tops = [];
  for (let i = 0; i < 70; i++) {
    const x = -900 + i * 26 + R() * 10, z = -700 - R() * 160, w = 18 + R() * 14, h = 30 + R() * 140, d = 18 + R() * 14;
    city.push([x, 0, z, w, h, d]);
    for (let y = 4; y < h - 2; y += 3.4) bands.push([x, y, z, w + 0.2, 1.3, d + 0.2]);
    if (R() < 0.5) tops.push([x, h, z, w * 0.3, 4, d * 0.3]);
  }
  g.add(inst(unitBox(), city, mat('#c9c6bf', 0.9)), inst(unitBox(), bands, mat('#5a6a78', 0.35, 0.3)), inst(unitBox(), tops, mat('#c9c6bf', 0.9)));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.35, 0.22, 1.2], zoom: 0.55 };
}
