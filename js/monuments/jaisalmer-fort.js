import * as THREE from 'three';
import { townHouses, houseRow } from '../details/realism.js';
import { mat, box, at, rng, inst, unitBox, unitCyl, chhatri } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { miniSpireGeo } from '../details/sculpture.js';
import { heightField, rough, smooth, fbm } from '../details/terrain.js';
import { addDetails } from '../details/jaisalmer-fort.js';
import { detail } from '../detail.js';

const GOLD = mat('#d9a85a', 0.85);
const GOLD_DARK = mat('#b8873f', 0.9);
const SAND = mat('#e3c48d', 0.95);

// The golden fort on Trikuta hill at its real size: about 460 × 230 m on top of a hill 76 m high,
// the three-lobed outline of the hill ("Trikuta", three peaks) followed by the upper wall and its 99
// bastions, a lower outer wall round the slope below them, and the town still living inside.
// outline(a): the scale of the top's outline in direction a (an ellipse RX × RZ, lobed).
export const H = 76, RX = 230, RZ = 112;
const lobes = (a) => 1 + 0.1 * Math.cos(3 * a - 0.6) + 0.04 * Math.cos(5 * a + 1);
// How far out (x, z) lies: 1 at the edge of the top.
export const reach = (x, z) => Math.hypot(x / RX, z / RZ) / lobes(Math.atan2(z / RZ, x / RX));
// The point at angle a on the outline at scale e (1 = the top's edge).
export const onOutline = (a, e) => [Math.cos(a) * RX * e * lobes(a), Math.sin(a) * RZ * e * lobes(a)];

// The hill's height at (x, z): the level top, a broken cliff of golden rock at its edge, a talus
// slope below falling to the desert, its foot sinking under the sand. Read by the outer wall, the
// road and the trees.
export function trikuta(x, z) {
  const e = reach(x, z) + rough(x * 0.5, z * 0.5, 0.025, 1.4);
  const cliff = smooth(1.12, 1.0, e), foot = 44 * Math.pow(smooth(2.0, 1.1, e), 1.2) + 3 * fbm(x, z, { scale: 0.02, octaves: 3 }) * smooth(2.0, 1.4, e);
  return Math.max(0, Math.max((H + rough(x, z, 0.8, 0.8)) * cliff, foot * (1 - cliff))) - 0.3;
}

// The 99 bastions of the upper wall, evenly spaced along it, leaving out the three where the
// Akhey Pol stands: [x, z, a] with a their direction from the centre.
export const GATE_A = 1.3;
export function bastions() {
  const pts = [], N = 2000, out = [];
  for (let k = 0; k <= N; k++) { const a = (k / N) * Math.PI * 2; pts.push([...onOutline(a, 0.97), a]); }
  let len = 0;
  const cum = pts.map((p, i) => (i ? (len += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])) : 0));
  for (let k = 0, i = 0; k < 99; k++) {
    const t = (k / 99) * len;
    while (cum[i + 1] < t) i++;
    const [x, z, a] = pts[i];
    if (Math.abs(Math.atan2(Math.sin(a - GATE_A), Math.cos(a - GATE_A))) < 0.05) continue;
    out.push([x, z, a]);
  }
  return out;
}

// A ring of wall segments along the outline at scale e, each from `base(x, z)` up to height h above
// it, t thick, leaving out those within `gap` radians of the gate.
function wallRing(e, h, t, base, gap) {
  const segs = [], N = 220;
  for (let k = 0; k < N; k++) {
    const a0 = (k / N) * Math.PI * 2, a1 = ((k + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
    if (Math.abs(Math.atan2(Math.sin(am - GATE_A), Math.cos(am - GATE_A))) < gap) continue;
    const [x0, z0] = onOutline(a0, e), [x1, z1] = onOutline(a1, e), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, y = base(mx, mz);
    segs.push([mx, y, mz, Math.hypot(x1 - x0, z1 - z0) + 0.5, h, t, Math.atan2(z0 - z1, x1 - x0)]);
  }
  return segs;
}

export function buildJaisalmer() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(89);
  g.add(f);
  g.add(box(1600, 0.2, 1200, SAND));
  g.add(heightField(940, 620, detail.low ? 140 : 220, trikuta, { rock: ['#c49c62', '#b48c55', '#cfa96e'], cover: '#d6b47c', steep: 0.8, band: 6 }));
  // The upper wall, 10 m high, and its bastions, 13 m and round, on the cliff's edge; the lower
  // outer wall, 7 m high, round the talus below them.
  f.add(inst(unitBox(), wallRing(0.97, 12, 3, () => H - 2, 0.03), GOLD));
  f.add(inst(unitCyl(12), bastions().map(([x, z], k) => [x, H - 3, z, 11, 16 + (k % 3) * 0.25, 11]), GOLD));
  f.add(inst(unitBox(), wallRing(1.22, 9, 2.4, (x, z) => trikuta(x, z) - 2, 0.06), GOLD_DARK));
  // The way up: a road climbing the talus from the desert to the gates, along the slope from the
  // east, with Ganesh Pol and Suraj Pol on it below the Akhey Pol at the top.
  const road = [], [gx, gz] = onOutline(GATE_A, 0.97), N = 70;
  const zAt = (x, y) => { let lo = gz, hi = 330; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (trikuta(x, m) > y) lo = m; else hi = m; } return (lo + hi) / 2; };
  let prev = null;
  for (let k = 0; k <= N; k++) {
    const t = k / N, x = gx + 250 - 250 * t, y = 2 + (H - 2) * Math.pow(t, 0.9), z = k === N ? gz + 6 : zAt(x, y);
    if (prev) {
      const mx = (x + prev[0]) / 2, mz = (z + prev[2]) / 2, my = Math.max(y, prev[1]);
      road.push([mx, Math.min(trikuta(mx, mz), my) - 3, mz, Math.hypot(x - prev[0], z - prev[2]) + 0.6, my - Math.min(trikuta(mx, mz), my) + 3, 7, Math.atan2(prev[2] - z, x - prev[0])]);
    }
    prev = [x, y, z];
  }
  g.add(inst(unitBox(), road, GOLD_DARK));
  for (const t of [0.35, 0.65]) {
    const x = gx + 250 - 250 * t, y = 2 + (H - 2) * Math.pow(t, 0.9), z = zAt(x, y);
    g.add(at(fortGate(12, 11, 7, 4.2, 7, { m: GOLD, trim: GOLD_DARK }), x, y, z).rotateY(-Math.PI / 2));
  }
  f.add(at(fortGate(14, 13, 9, 4.6, 8, { m: GOLD, trim: GOLD_DARK, towers: { r: 4, h: 16, cap: 'merlons', seg: 12 } }), gx, H, gz).rotateY(-GATE_A + Math.PI / 2));

  // Inside: the Raj Mahal over the Dussehra Chowk behind the gate, seven storeys of carved stone;
  // the Laxminath temple; the seven Jain temples to the west, their spires crowded together; and
  // the town of houses and havelis along lanes everywhere else.
  const [px, pz] = onOutline(GATE_A, 0.55);
  const PAL = { x: px, z: pz - 26 };
  f.add(box(56, 26, 22, GOLD, PAL.x, H, PAL.z), box(56.8, 0.8, 22.8, GOLD_DARK, PAL.x, H + 26, PAL.z));
  for (const dx of [-24, -12, 0, 12, 24]) f.add(at(chhatri(2.4, 6, GOLD), PAL.x + dx, H + 26.8, PAL.z + 8));
  const jain = [[-120, -18, 9, 22], [-104, -30, 7, 17], [-136, -34, 7, 16], [-118, -46, 6, 14], [-96, -10, 6, 15], [-140, -4, 6, 14], [-150, -22, 5, 12]];
  f.add(inst(unitBox(), jain.map(([x, z, w, h]) => [x, H, z, w + 2, h * 0.55, w + 2]), GOLD), inst(miniSpireGeo(), jain.map(([x, z, w, h]) => [x, H + h * 0.55, z, w, h, w]), GOLD));
  f.add(box(12, 10, 12, GOLD, -30, H, 6), at(chhatri(4, 10, GOLD), -30, H + 10, 6));
  const clear = [[PAL.x - 34, PAL.x + 34, PAL.z - 16, PAL.z + 44], [-162, -86, -58, 8], [-40, -20, -4, 16]];
  const free = ([x, z, w, d, , ry]) => {
    const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2;
    if ([[-1, -1], [-1, 1], [1, -1], [1, 1]].some(([sx, sz]) => reach(x + sx * hx, z + sz * hz) > 0.9)) return false;
    return !clear.some(([a, b, c2, d2]) => x + hx > a && x - hx < b && z + hz > c2 && z - hz < d2);
  };
  const houses = [];
  for (let zr = -RZ * 1.05, j = 0; zr < RZ * 1.05; zr += 12.5, j++) {
    for (const p of houseRow(R, 'x', zr, -RX * 1.05, RX * 1.05, j % 2 ? Math.PI : 0, { w: [6, 10], d: [8, 10.5], n: [2, 4], lane: 0.18 })) if (free(p)) houses.push([...p, H]);
  }
  // On phones (js/detail.js), one house in two.
  const keep = detail.low ? houses.filter((_, i) => i % 2 === 0) : houses;
  f.add(townHouses(keep, { seed: 61, paint: ['#c9a062', '#b98f55', '#d4ad6e', '#c19656', '#d9b878'], trim: '#dcbf86', fine: !detail.low }));
  addDetails(f, g, PAL);
  return { group: g, focus: f, view: [0.5, 0.3, 1.2] };
}
