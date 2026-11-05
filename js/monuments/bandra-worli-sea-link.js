import * as THREE from 'three';
import { M, mat, box, at, rng, V, strut, inst, unitBox, sheet, surface } from '../helpers.js';
import { addDetails } from '../details/bandra-worli-sea-link.js';
import { heightField, rough, smooth } from '../details/terrain.js';

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
  // Mahim Bay: the city's shore runs behind the bridge (Worli to the south, Bandra to the north)
  // and each end of the bridge comes ashore on a headland, the bay between. The land is one piece
  // of ground 1.6 m above the sea out past the haze, its coast wandering, with rocks along it.
  const coast = (x) => {
    const t = smooth(760, 980, Math.abs(x));
    return -630 + t * 880 + 22 * Math.sin(x * 0.011) + 12 * Math.sin(x * 0.037 + 1.3) + (1 - t) * 10 * Math.sin(x * 0.05);
  };
  g.add(heightField(14000, 7000, 320, (x, z) => {
    const d = coast(x) - z;
    return d < -6 ? -3 : d < 6 ? -3 + 4.6 * smooth(-6, 6, d) + rough(x, z, 0.4, 3) : 1.6 + rough(x, z, 0.15, 0.5);
  }, { cz: -2800, rock: ['#6f6a5f', '#7d776b'], cover: '#8d8977', steep: 0.6, band: 2 }));
  for (const s of [-1, 1]) {
    // The viaduct carries on 250 m over the headland, then the ramp comes down to the road.
    g.add(box(250, 2.4, W, CONCRETE, s * 925, deckY - 2.4, 0), box(250, 0.3, W - 2, M.asphalt, s * 925, deckY, 0));
    const ramp = box(300, 1.2, W - 2, CONCRETE, 0, -0.6, 0);
    ramp.position.set(s * 1200, (deckY + 1.6) / 2, 0);
    ramp.rotation.z = s * Math.atan2(deckY - 1.6, 300) * -1;
    g.add(ramp);
  }
  const piers = [];
  for (let x = -1040; x <= 1040; x += 50) if (Math.abs(x) > 40 && Math.abs(x - 600) > 30) piers.push([x, 0, 0, 4, deckY - 2.4, W * 0.6]);
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
  // Towers along the Worli and Bandra shores, each a body of light concrete with a band of glazing
  // on every floor, some crowned with a lift room. The glazing is drawn by the wall's surface
  // ('facade' in js/surface.js), not modelled: seen from one to five kilometres off, modelled
  // bands were thinner than a pixel and shimmered, and fought the walls for depth.
  const tops = [];
  for (let i = 0; i < 70; i++) {
    const x = -900 + i * 26 + R() * 10, z = -700 - R() * 160, w = 18 + R() * 14, h = 30 + R() * 140, d = 18 + R() * 14;
    city.push([x, 0, z, w, h, d]);
    if (R() < 0.5) tops.push([x, h, z, w * 0.3, 4, d * 0.3]);
  }
  const wall = surface(mat('#c9c6bf', 0.9), 'facade');
  g.add(inst(unitBox(), city, wall), inst(unitBox(), tops, mat('#c9c6bf', 0.9)));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.35, 0.22, 1.2], zoom: 0.55 };
}
