import * as THREE from 'three';
import { V, mat, mesh, box, at, rng, strut, inst, unitBox, surface, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { heightField, rough, smooth } from '../parts/terrain.js';
import { trees, shrubs, boats, townHouses, scatter } from '../parts/realism.js';
import { track } from '../parts/transport.js';
import { detail } from '../detail.js';

// The New Pamban Bridge, its setting. Behind the new bridge (z = 0) runs the bridge of 1914, 27 m
// off and 3 m lower: 12.2 m plate girders on close-set piers and, over the channel, the Scherzer
// rolling-lift span, its two leaves standing open as they have since trains stopped using it in
// 2022. Further off the Annai Indira Gandhi road bridge climbs to its high span over the channel.
// Mandapam's sandy spit is at +x and Pamban island at -x, with the fishing village at the bridge's
// foot, coconut palms and casuarina along the shores, and the fishing fleet on the shallows.
const HALF = 1035, RAIL_Y = 6.9, OLD_Z = -27, OLD_RAIL = 3.9, ROAD_Z = -190, LAND = 1.6;
const STONE = photo(mat('#9a9388', 0.92), 'concrete'), CONCRETE = photo(mat('#c2beb5', 0.9), 'concrete');
const RUST = surface(mat('#5e4a3f', 0.75, 0.3), 'none'), OLD_STEEL = surface(mat('#84888a', 0.6, 0.4), 'none');
const EARTH = mat('#a89674', 0.95), TARMAC = surface(mat('#46474a', 0.9), 'none'), WEIGHT = surface(mat('#6f6b66', 0.85), 'none');

// Where the sea ends: Pamban island's shore wanders north to south; Mandapam is a spit that
// narrows to the bridges' landing.
const shore = (x, z) => {
  const wob = 26 * Math.sin(z * 0.006 + 1) + 12 * Math.sin(z * 0.021) + 7 * Math.sin(x * 0.017);
  return x < 0 ? -HALF - 12 - 0.1 * Math.abs(z + 80) - x + wob : x - (HALF + 12 + (z + 110) * (z + 110) / 420 + wob);
};
const ground = (x, z) => {
  const d = shore(x, z);
  return d < -40 ? -3 : d < 40 ? -3 + (3 + LAND) * smooth(-40, 40, d) + rough(x, z, 0.25, 2) * smooth(-10, 30, d) : LAND + rough(x, z, 0.3, 0.6);
};
const dry = ([x, z]) => shore(x, z) > 55;

// One leaf of the Scherzer span, heel at the origin and reaching 32.6 m along +x: two trusses deep
// at the heel and shallow at the tip, each ending in the curved segmental girder it rolls back on,
// with the counterweight carried high behind the heel.
function leaf() {
  const g = new THREE.Group(), L = 32.6, R = 7.5, n = 6, top = (x) => 11.5 - 8.3 * (x / L);
  for (const s of [-1, 1]) {
    const z = s * 2.7;
    g.add(strut(V(0, 0.3, z), V(L, 0.3, z), 0.6, OLD_STEEL), strut(V(0, top(0), z), V(L, top(L), z), 0.55, OLD_STEEL));
    for (let k = 0; k <= n; k++) {
      const x = (k / n) * L;
      g.add(strut(V(x, 0.3, z), V(x, top(x), z), 0.34, OLD_STEEL));
      if (k < n) { const b = ((k + 1) / n) * L; g.add(strut(V(x, top(x), z), V(b, 0.3, z), 0.3, OLD_STEEL)); }
    }
    // The rolling segment: a quarter circle from under the heel round to the back, and its spokes.
    let prev = null;
    for (let k = 0; k <= 8; k++) {
      const a = -Math.PI / 2 - (k / 8) * (Math.PI / 2) * 1.1, p = V(R * Math.cos(a), R + R * Math.sin(a), z);
      if (prev) g.add(strut(prev, p, 0.7, OLD_STEEL));
      if (k % 2 === 0) g.add(strut(V(0, R, z), p, 0.3, OLD_STEEL));
      prev = p;
    }
    g.add(strut(V(-R * 0.98, R, z), V(-2.5, 12.5, z), 0.5, OLD_STEEL), strut(V(-2.5, 12.5, z), V(0, top(0), z), 0.5, OLD_STEEL));
  }
  for (let k = 0; k <= n; k++) { const x = (k / n) * L; g.add(box(0.4, 0.5, 5.4, OLD_STEEL, x, 0.05, 0)); if (k < n) g.add(box(0.3, 0.3, 5.4, OLD_STEEL, x, top(x) - 0.3, 0)); }
  g.add(box(L, 0.12, 2.6, RUST, L / 2, 0.55, 0), box(4.6, 3.6, 6.6, WEIGHT, -2.6, 9.6, 0));
  return g;
}

function oldBridge(g) {
  const o = new THREE.Group(), L = 32.6, R = 7.5, open = 0.95, y0 = OLD_RAIL - 0.9;
  // The two leaves, rolled back and standing open at 54°.
  for (const s of [-1, 1]) {
    const l = leaf(), hinge = new THREE.Group();
    l.position.set(0, -R, 0);
    hinge.add(l);
    hinge.rotation.z = open;
    hinge.position.set(-R * open, y0 + R, 0);
    const side = new THREE.Group();
    side.add(hinge);
    side.position.set(s * -L, 0, OLD_Z);
    side.scale.x = s;
    o.add(side);
    // Each leaf's pier, with the level girders it rolls back along.
    o.add(box(13, y0 + 0.8, 8.4, STONE, s * (L + 5.5), -0.8, OLD_Z), box(11, 0.5, 6.4, OLD_STEEL, s * (L + 5), y0 - 0.5, OLD_Z));
  }
  g.add(mergeByMaterial(o));
  // The girder spans: 12.2 m apiece on stone piers, out to both shores.
  const piers = [], webs = [], decks = [], sp = 12.2;
  for (let x = L + 12; x <= HALF + 6; x += sp) for (const s of [-1, 1]) {
    piers.push([s * (x + sp / 2), -0.8, OLD_Z, 1.5, OLD_RAIL - 1.1, 4.6]);
    for (const z of [-0.95, 0.95]) webs.push([s * x, OLD_RAIL - 1.85, OLD_Z + z, sp - 0.2, 1.4, 0.08]);
    decks.push([s * x, OLD_RAIL - 0.47, OLD_Z, sp, 0.05, 2.9]);
  }
  g.add(inst(unitBox(), piers, STONE), inst(unitBox(), webs, RUST), inst(unitBox(), decks, RUST));
  for (const s of [-1, 1]) g.add(at(track(HALF - L - 4, { ballast: false }), s * (L + 6 + (HALF - L - 4) / 2), OLD_RAIL - 0.42, OLD_Z));
}

// The road bridge: a concrete viaduct on paired piers rising in a long curve to the high span over
// the channel.
function roadBridge(g) {
  const deck = (x) => 7.5 + 13.5 * Math.pow(Math.cos(Math.min(1, Math.abs(x) / 820) * Math.PI / 2), 2), end = 1180;
  const s = new THREE.Shape(), N = 60;
  for (let k = 0; k <= N; k++) { const x = -end + (2 * end * k) / N; k ? s.lineTo(x, deck(x)) : s.moveTo(x, deck(x)); }
  for (let k = N; k >= 0; k--) { const x = -end + (2 * end * k) / N; s.lineTo(x, deck(x) - 1.7 - 2.2 * Math.exp(-((Math.abs(x) - 58) ** 2) / 500)); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 10, bevelEnabled: false }).translate(0, 0, ROAD_Z - 5);
  g.add(mesh(geo, CONCRETE));
  const piers = [], kerbs = [];
  for (let x = 58; x <= end; x += 30) for (const e of [-1, 1]) for (const z of [-2.6, 2.6]) piers.push([e * x, -0.8, ROAD_Z + z, x === 58 ? 3.2 : 1.6, deck(x) - 1.2, 1.6]);
  for (let k = 0; k < N; k++) {
    const a = -end + (2 * end * k) / N, b = a + (2 * end) / N;
    for (const z of [-4.9, 4.9]) g.add(strut(V(a, deck(a) + 0.5, ROAD_Z + z), V(b, deck(b) + 0.5, ROAD_Z + z), 0.22, CONCRETE));
    kerbs.push(a);
  }
  g.add(inst(unitBox(), piers, CONCRETE));
  const top = new THREE.Shape();
  for (let k = 0; k <= N; k++) { const x = -end + (2 * end * k) / N; k ? top.lineTo(x, deck(x) + 0.06) : top.moveTo(x, deck(x) + 0.06); }
  for (let k = N; k >= 0; k--) { const x = -end + (2 * end * k) / N; top.lineTo(x, deck(x) + 0.02); }
  g.add(mesh(new THREE.ExtrudeGeometry(top, { depth: 8.6, bevelEnabled: false }).translate(0, 0, ROAD_Z - 4.3), TARMAC));
}

export function addDetails(f, g) {
  const R = rng(57);
  oldBridge(g);
  roadBridge(g);
  // The two shores, sand under scrub.
  for (const e of [-1, 1]) g.add(heightField(2800, 5600, detail.low ? 80 : 130, ground, { cx: e * (HALF + 1320), rock: ['#d9cba4', '#cfc09a'], cover: '#b9b083', steep: 0.985, band: 3 }));
  // The railway's banks on land, the new line's the higher, each carrying its track on ballast.
  for (const e of [-1, 1]) for (const [z, y, w] of [[0, RAIL_Y - 0.72, 7], [OLD_Z, OLD_RAIL - 0.72, 6]]) {
    const s = new THREE.Shape([[-w / 2 - y * 1.4, 0], [w / 2 + y * 1.4, 0], [w / 2, y], [-w / 2, y]].map(([a, b]) => new THREE.Vector2(a, b)));
    const bank = mesh(new THREE.ExtrudeGeometry(s, { depth: 520, bevelEnabled: false }).rotateY(Math.PI / 2), EARTH, e > 0 ? HALF + 8 : -HALF - 528, 0, z);
    g.add(bank, at(track(500), e * (HALF + 280), y, z));
  }
  for (const e of [-1, 1]) g.add(box(9, RAIL_Y - 0.4, 12, CONCRETE, e * (HALF + 5), -0.6, 0), box(8, OLD_RAIL - 0.4, 7, STONE, e * (HALF + 5), -0.6, OLD_Z));
  // Pamban village at the island end and the smaller settlement at Mandapam: low painted houses
  // clear of the lines and the road.
  const clear = ([x, z]) => dry([x, z]) && Math.abs(z) > 24 && Math.abs(z - OLD_Z) > 20 && Math.abs(z - ROAD_Z) > 22;
  const houses = (spots, seed) => {
    const Rh = rng(seed);
    return townHouses(spots.filter(clear).map(([x, z]) => [x, z, 6 + Rh() * 4, 7 + Rh() * 4, 1 + Math.floor(Rh() * 2.2), Math.floor(Rh() * 4) * Math.PI / 2, LAND + 0.2]), { seed, tanks: 0.3, fine: false });
  };
  g.add(houses(scatter(detail.low ? 50 : 110, [-HALF - 520, -HALF - 40, -430, 380], { seed: 5, gap: 15 }), 5));
  g.add(houses(scatter(detail.low ? 16 : 34, [HALF + 60, HALF + 520, -330, 120], { seed: 9, gap: 17 }), 9));
  // Coconut palms round the village and along the island's shore; casuarina and thorn scrub on the spit.
  const palms = scatter(detail.low ? 70 : 150, [-HALF - 700, -HALF - 20, -900, 800], { seed: 12, gap: 11 }).filter(clear).map(([x, z]) => [x, z, 11 + R() * 5, LAND]);
  g.add(trees(palms, { kind: 'palm', seed: 12 }));
  const pines = scatter(detail.low ? 40 : 90, [HALF + 30, HALF + 700, -420, 220], { seed: 14, gap: 12 }).filter(clear).map(([x, z]) => [x, z, 9 + R() * 4, LAND]);
  g.add(trees(pines, { kind: 'casuarina', seed: 14 }));
  const thorn = [...scatter(40, [HALF + 30, HALF + 800, -500, 300], { seed: 16, gap: 14 }), ...scatter(40, [-HALF - 900, -HALF - 30, -1000, 900], { seed: 17, gap: 16 })].filter(clear);
  g.add(trees(thorn.map(([x, z]) => [x, z, 4 + R() * 2, LAND]), { kind: 'babul', seed: 16 }));
  if (!detail.low) g.add(shrubs(scatter(120, [-HALF - 500, HALF + 500, -420, 380], { seed: 18, gap: 8 }).filter(clear).map(([x, z]) => [x, z, 0.8 + R(), LAND]), { dry: true, seed: 18 }));
  // The fishing fleet: boats at anchor off Pamban's beach on both sides of the bridges, and others
  // out on the shallows and making for the channel.
  const fleet = [];
  for (let i = 0; i < (detail.low ? 30 : 60); i++) {
    const z = -520 + R() * 1000, x = -HALF + 30 + R() * 190 + 0.1 * Math.abs(z + 80);
    if (Math.abs(z) > 16 && Math.abs(z - OLD_Z) > 14 && Math.abs(z - ROAD_Z) > 16) fleet.push([x, z, R() * 6.28]);
  }
  for (let i = 0; i < 26; i++) { const z = (R() < 0.75 ? 1 : -1) * (45 + R() * 420); if (z > 0 || (z < OLD_Z - 16 && Math.abs(z - ROAD_Z) > 18)) fleet.push([-760 + R() * 1500, z, R() * 6.28]); }
  fleet.push([6, 62, 0.25], [-9, 118, -0.2], [14, -92, 0.1]);
  g.add(boats(fleet, { y: 0.02, size: 2.1, colours: ['#2f6fb0', '#d8452f', '#f0c330', '#2f9a6a', '#f2efe6', '#1f8f9a'] }));
}
