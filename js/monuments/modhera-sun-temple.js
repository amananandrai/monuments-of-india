import * as THREE from 'three';
import { M, box, at, onFace, inst, unitBox, sheet, planPrism, pidaRoof, shikhara } from '../helpers.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { instances, miniSpireGeo } from '../parts/sculpture.js';
import { addDetails, SAND, SHADE, D, KUND, starPlan, PROF } from '../details/modhera-sun-temple.js';

// The Sun Temple at Modhera, on one axis from east (+z) to west: the Surya Kund, a stepped tank
// about 54 m north to south and 37 m east to west; the two pillars of the kirti torana at the head
// of its steps; the open Sabhamandapa on its star-shaped plan; and the Gudhamandapa with the
// shrine behind it, whose spire has fallen. The tank is cut into the ground, so the ground is
// modelled raised: the lawns are at y = D and the floor of the tank near y = 0.
export function buildModhera() {
  const S = SAND, Sd = SHADE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { cz, HX, HZ, T, H, N } = KUND, z0 = cz - HZ, z1 = cz + HZ;
  // The ground round the tank, in four pieces.
  g.add(box(240, D, 110, M.grass, 0, 0, z0 - 55), box(240, D, 70, M.grass, 0, 0, z1 + 35));
  for (const s of [-1, 1]) g.add(box(120 - HX, D, HZ * 2, M.grass, s * (HX + (120 - HX) / 2), 0, cz));
  // Paving: round the rim of the tank and along the axis under the halls.
  for (const s of [-1, 1]) g.add(box(5, 0.08, HZ * 2 + 10, M.path, s * (HX + 2.5), D, cz), box(HX * 2, 0.08, 5, M.path, 0, D, cz + s * (HZ + 2.5)));
  g.add(box(30, 0.08, z0 + 43 - 5, M.path, 0, D, (z0 - 5 - 43) / 2));
  // The rim: the top wall of the tank faced in stone, under a kerb.
  for (const s of [-1, 1]) f.add(box(0.4, H + 0.35, HZ * 2, Sd, s * (HX - 0.2), D - H, cz), box(HX * 2 - 0.8, H + 0.35, 0.4, Sd, 0, D - H, cz + s * (HZ - 0.2)));
  // The tank: four terraces stepping down, each T wide and H below the last, round the pool.
  for (let k = 0; k < N; k++) {
    const y = D - (k + 1) * H, hx = HX - k * T, hz = HZ - k * T;
    for (const s of [-1, 1]) f.add(box(T, y, hz * 2, S, s * (hx - T / 2), 0, cz), box((hx - T) * 2, y, T, S, 0, 0, cz + s * (hz - T / 2)));
  }
  const px = HX - N * T, pz = HZ - N * T;
  f.add(box(px * 2, 0.4, pz * 2, Sd, 0, 0, cz), sheet(px * 2, pz * 2, M.water, 0, 1.1, cz));
  // The flights between the terraces: against every wall, small stairs that climb from both
  // sides to a landing, so each reads as a stepped triangle; and between them the little
  // shrines, each a niche under a spire. On the west the great stair comes down the middle from
  // the torana.
  const stairs = [], cells = [], dark = [], spires = [];
  for (let k = 0; k < N; k++) for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const alongX = a === 0 || a === Math.PI, dist = (alongX ? HZ : HX) - k * T, len = ((alongX ? HX : HZ) - k * T) * 2 - 2;
    const n = Math.max(2, Math.round(len / 2.9)), y = D - (k + 1) * H, c = Math.cos(a), sn = Math.sin(a);
    const put = (l, r) => [sn * r + c * l, cz + c * r - sn * l];
    for (let i = 0; i <= n; i++) {
      const l = -len / 2 + (i / n) * len;
      if (a === Math.PI && Math.abs(l) < 4.6) continue;
      if (k === 0 && a !== Math.PI && Math.abs(l) < 3) continue;
      if ((i + (n % 2 ? 0 : k)) % 2 === 0) {
        for (let j = 0; j < 4; j++) { const [x, z] = put(l, dist - 0.5); stairs.push([x, y + j * (H / 4), z, 2.6 - j * 0.6, H / 4, 1, a]); }
      } else if (k < 3) {
        const [x, z] = put(l, dist - 0.45), [dx, dz] = put(l, dist - 0.92);
        cells.push([x, y, z, 1.1, 1.15, 0.9, a]);
        dark.push([dx, y + 0.2, dz, 0.5, 0.75, 0.06, a]);
        spires.push([x, y + 1.15, z, 1.0, 0.55, 0.85, a]);
      }
    }
  }
  f.add(inst(unitBox(), stairs, S), inst(unitBox(), cells, Sd), inst(unitBox(), dark, M.recess), instances(miniSpireGeo(), spires, S));
  const ns = 24, run = N * T;
  for (let i = 0; i < ns; i++) f.add(box(7, D - (i + 1) * ((D - 1.3) / ns) + 0.12, run / ns, S, 0, 0, z0 + (i + 0.5) * (run / ns)));
  for (const s of [-1, 1]) for (let k = 0; k < N; k++) f.add(box(0.9, D - k * H + 0.5, T, Sd, s * 3.95, 0, z0 + (k + 0.5) * T));
  // The larger shrines in the middle of the north, south and east sides, facing the water.
  const big = new THREE.Group();
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
    const sh = new THREE.Group();
    sh.add(box(2.8, 2.6, 2.4, S, 0, 0, 0), box(3.2, 0.25, 2.8, Sd, 0, 2.6, 0), at(shikhara(2.6, 2.6, S, PROF, 8, S, 0.5), 0, 2.85, 0));
    sh.add(at(templeDoorway(0.8, 1.6, { m: S, guardians: false, shakha: false, hood: false }), 0, 0, 1.2));
    const o = onFace(at(sh, 0, D - H, 0), a, (a === 0 ? HZ : HX) - 1.3);
    o.rotation.y = a + Math.PI;
    o.position.z += cz;
    big.add(o);
  }
  f.add(mergeByMaterial(big));
  // The Sabhamandapa: a plinth and a roof on the star plan. Its pillars, seats and arches are in
  // the details. The roof is a stepped pyramid whose top is lost.
  const sz = -3.5, sab = at(new THREE.Group(), 0, D, sz);
  sab.add(planPrism(starPlan(1.05), 0, 0.5, Sd), planPrism(starPlan(1), 0.5, 0.7, S));
  sab.add(planPrism(starPlan(1), 5.4, 0.55, S), planPrism(starPlan(1.07), 5.95, 0.2, Sd));
  for (let k = 0; k < 6; k++) sab.add(planPrism(starPlan(0.98 - k * 0.1), 6.15 + k * 0.5, 0.36, S), planPrism(starPlan(0.93 - k * 0.1), 6.51 + k * 0.5, 0.14, Sd));
  sab.add(box(5.2, 0.5, 5.2, Sd, 0, 9.15, 0), box(3.4, 0.35, 3, S, 0.3, 9.65, -0.2));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) sab.add(onFace(steps(3.6, 1.2, 5, Sd, 0.36), a, 7.5));
  f.add(mergeByMaterial(sab));
  // The Gudhamandapa (east) and the shrine (west) as one block on a moulded base: 15 m wide and
  // 24 m long, its walls 6.2 m high. The hall keeps the lowest slabs of its roof; over the
  // shrine only the stump of the spire is left.
  const B = 1.6, WH = 6.2, hz = -22, gz = -34, t = at(new THREE.Group(), 0, D, 0);
  t.add(box(15.9, B, 24.9, Sd, 0, 0, -28), box(17.3, B, 7.1, Sd, 0, 0, hz), box(16.3, B, 6.6, Sd, 0, 0, gz), box(8.6, B, 2, Sd, 0, 0, -40.4));
  t.add(box(15, WH, 24, S, 0, B, -28), box(16.4, WH, 6.2, S, 0, B, hz), box(15.4, WH, 5.8, S, 0, B, gz), box(7.8, WH, 1.4, S, 0, B, -40.3));
  t.add(box(15.8, 0.45, 24.8, Sd, 0, B + WH, -28), box(17.2, 0.45, 7, Sd, 0, B + WH, hz), box(16.2, 0.45, 6.6, Sd, 0, B + WH, gz));
  t.add(at(pidaRoof(13.6, 10, 3, 0.42, S, Sd), 0, B + WH + 0.45, hz), box(8.4, 0.5, 8, S, 0.3, B + WH + 2.4, hz - 0.2));
  t.add(box(12, 0.8, 10.4, S, 0, B + WH + 0.45, gz), box(8.6, 0.8, 7.4, Sd, -0.5, B + WH + 1.25, gz + 0.4), box(5, 0.7, 4.6, S, 0.6, B + WH + 2.05, gz - 0.5));
  f.add(mergeByMaterial(t));
  addDetails(f, g, { sz, B, WH, hz, gz });
  // The best-known view: across the tank to the two halls.
  return { group: g, focus: f, view: [0.25, 0.27, 1], zoom: 0.5 };
}
