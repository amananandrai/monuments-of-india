import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, hemi, inst, unitBox, sheet, planPrism, offsetPlan, curvedBand } from '../helpers.js';
import { mergeByMaterial, windowFrame, keystone } from '../parts/components.js';
import { pediment, column } from '../parts/colonial.js';
import { trees, boats, asiBoard, scatter, townHouses, lampPosts, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, STONE_DARK, LIME, TILE, H, PTS, GATES, bastionPlan } from '../monuments/moti-daman-fort.js';

const ROAD = mat('#6a645a', 0.95), DOOR = mat('#4a3424', 0.8), BLUE = mat('#3e6e9a', 0.8);

// Moti Daman Fort, finer detail. From photographs: the curtain has a rounded cordon a little below
// its parapet and wide embrasures cut through the parapet for guns; a domed sentry box (guarita)
// hangs over the point of each bastion; the land gate's front carries a pediment with the
// Portuguese arms and a cross; Bom Jesus has a two-storey front of pilasters, a carved portal
// between columns, windows and a scrolled gable with a cross. Dimensions follow
// js/monuments/moti-daman-fort.js.
function architecture(f, { cw, ch }) {
  const d = new THREE.Group(), n = PTS.length, notch = [];
  PTS.forEach(([x0, z0], i) => {
    const [x1, z1] = PTS[(i + 1) % n], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    const gate = GATES.find((q) => q.i === i), parts = gate ? [[12 / len, gate.t - 8 / len], [gate.t + 8 / len, 1 - 12 / len]] : [[12 / len, 1 - 12 / len]];
    for (const [t0, t1] of parts) {
      const tm = (t0 + t1) / 2, l = len * (t1 - t0);
      // The cordon, proud of both faces, and the parapet with its embrasures.
      const c = box(l, 0.5, 6.7, STONE_DARK, x0 + (x1 - x0) * tm, H - 1.6, z0 + (z1 - z0) * tm);
      c.rotation.y = ry;
      d.add(c);
      const p = box(l, 1.4, 1.2, STONE, 0, 0, 0);
      p.position.set(x0 + (x1 - x0) * tm, H, z0 + (z1 - z0) * tm);
      // The parapet stands on the outer edge of the wall.
      const nx = Math.sin(ry), nz = Math.cos(ry), out = nx * p.position.x + nz * p.position.z > 0 ? 1 : -1;
      p.position.x += nx * out * 2.4; p.position.z += nz * out * 2.4;
      p.rotation.y = ry;
      d.add(p);
      const k = Math.floor(l / 14);
      for (let m = 0; m < k; m++) {
        const t = t0 + ((m + 0.5) / k) * (t1 - t0);
        notch.push([x0 + (x1 - x0) * t + nx * out * 2.4, H + 0.55, z0 + (z1 - z0) * t + nz * out * 2.4, 1.6, 0.9, 1.26, ry]);
      }
    }
  });
  d.add(inst(unitBox(), notch, M.recess));
  // The bastions' cordon and parapet, and their sentry boxes.
  for (let i = 0; i < n; i++) {
    const plan = bastionPlan(i);
    d.add(planPrism(offsetPlan(plan, 0.35), H - 1.4, 0.5, STONE_DARK));
    const [sx, sz] = plan[2], [vx, vz] = PTS[i], a = Math.atan2(sx - vx, sz - vz), px = sx - Math.sin(a) * 1.1, pz = sz - Math.cos(a) * 1.1;
    d.add(cyl(1.3, 0.3, 1.6, STONE_DARK, px, H - 1.0, pz, 12), cyl(1.3, 1.3, 2.6, LIME, px, H + 0.6, pz, 12), cyl(1.5, 1.5, 0.25, STONE_DARK, px, H + 3.2, pz, 12));
    d.add(at(hemi(1.35, LIME, 12), px, H + 3.45, pz), cyl(0.06, 0.12, 0.7, STONE_DARK, px, H + 4.7, pz, 6));
    d.add(at(onFace(box(0.3, 0.9, 0.06, M.recess, 0, H + 1.4, 0), a, 1.31), px, 0, pz));
  }
  // The land gate's front: a pediment with the arms, a cross, and the arch's keystone.
  {
    const { i, t } = GATES[0], [x0, z0] = PTS[i], [x1, z1] = PTS[(i + 1) % n], ry = Math.atan2(-(z1 - z0), x1 - x0);
    const gf = new THREE.Group();
    gf.add(at(pediment(10, 2.6, 1.0, LIME, STONE_DARK), 0, H + 4, -0.3), box(1.8, 2.2, 0.2, STONE_DARK, 0, H + 4.1, 0.68), box(1.4, 1.6, 0.06, mat('#b8a274', 0.6), 0, H + 4.4, 0.8));
    gf.add(box(0.3, 2.2, 0.3, STONE_DARK, 0, H + 6.5, 0), box(1.2, 0.3, 0.3, STONE_DARK, 0, H + 7.8, 0), at(keystone(0.8, 1.2, 0.4, STONE_DARK), 0, 6.2, 0.35));
    const mx = x0 + (x1 - x0) * t, mz = z0 + (z1 - z0) * t, rot = ry + ((Math.sin(ry) * mx + Math.cos(ry) * mz) > 0 ? 0 : Math.PI);
    gf.position.set(mx + Math.sin(rot) * 4.05, 0, mz + Math.cos(rot) * 4.05);
    gf.rotation.y = rot;
    d.add(gf);
  }
  // Bom Jesus's front (at -40, 30): pilasters on two storeys, a portal between columns, windows,
  // and a cross on the gable.
  const fr = new THREE.Group(), fz = 2.12;
  for (const x of [-9.4, -3.4, 3.4, 9.4]) fr.add(box(0.9, ch + 4.6, 0.3, LIME, x, 0, fz + 0.15));
  fr.add(box(cw + 4.4, 0.5, 0.5, mat('#d9d3c6', 0.85), 0, 8.4, fz + 0.2), box(cw + 4.6, 0.6, 0.6, mat('#d9d3c6', 0.85), 0, ch + 4.4, fz + 0.2));
  fr.add(box(3.2, 5.6, 0.1, DOOR, 0, 0, fz + 0.06));
  for (const s of [-1, 1]) fr.add(at(column(0.3, 6.4, LIME), s * 2.3, 0, fz + 0.5), at(windowFrame(1.4, 2.6, LIME, { shape: 'round', frame: 0.25 }), s * 6.4, 3, fz + 0.03), at(windowFrame(1.4, 2.4, LIME, { shape: 'round', frame: 0.25 }), s * 6.4, 10.2, fz + 0.03));
  fr.add(box(5.6, 0.6, 1.1, LIME, 0, 6.4, fz + 0.55), at(windowFrame(2, 3, LIME, { shape: 'round', frame: 0.3 }), 0, 10, fz + 0.03), at(pediment(5.6, 1.3, 0.7, LIME), 0, 7, fz + 0.2));
  fr.add(box(0.3, 2.4, 0.3, STONE_DARK, 0, ch + 12, 1), box(1.3, 0.3, 0.3, STONE_DARK, 0, ch + 13.4, 1));
  d.add(at(fr, -40, 0, 30));
  f.add(mergeByMaterial(d));
}

// The ground inside the walls: streets of tiled houses round Bom Jesus and the square, gardens,
// palms and old trees; outside, the moat, the Damanganga with its fishing boats, Nani Daman across
// it, and the Arabian Sea to the west.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const out = offsetPlan(PTS, 26), moatOut = offsetPlan(PTS, 42);
  // The ground round the fort, and the moat's water between the walls and its counterscarp.
  g.add(sheet(1600, 1400, M.grass, 0, -0.2, 300));
  const ring = new THREE.Shape(moatOut.map(([x, z]) => new THREE.Vector2(x, -z)));
  ring.holes.push(new THREE.Path(out.map(([x, z]) => new THREE.Vector2(x, -z))));
  const moat = new THREE.Mesh(new THREE.ShapeGeometry(ring).rotateX(-Math.PI / 2), M.water);
  moat.position.y = -0.05;
  g.add(moat);
  // The town's ground inside the walls, raised a little, and its streets.
  g.add(planPrism(out, -0.2, 0.2, mat('#8b8a5f', 0.95)));
  const st = new THREE.Group();
  st.add(box(8, 0.06, 220, ROAD, -10, 0, 0), box(260, 0.06, 7, ROAD, 0, 0, 70), box(240, 0.06, 7, ROAD, 0, 0, -20), box(7, 0.06, 200, ROAD, 75, 0, -5), box(7, 0.06, 180, ROAD, -75, 0, 10));
  st.add(box(16, 0.4, 44, STONE_DARK, -10, -0.3, 136), box(14, 0.4, 36, STONE_DARK, 25, -0.3, -140));
  g.add(mergeByMaterial(st));
  // Houses on the blocks between the streets, 1–2 storeys under red tiles.
  const keep = [[-62, -14, -18, 40], [-122, -70, -76, -30], [20, 110, 24, 56], [82, 108, -28, 30], [24, 56, -78, -46], [88, 108, -80, -60], [-14, -6, -120, 120], [-140, 150, 66, 74], [-140, 150, -24, -16], [71, 79, -110, 100], [-79, -71, -90, 100]];
  const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
  const spots = [];
  for (let x = -128; x < 140; x += 12) for (let z = -96; z < 96; z += 15) {
    const w = 8 + R() * 3, dd = 9 + R() * 3, X = x + R() * 3, Z = z + R() * 3;
    const inside = PTS.length && Math.hypot(X / 135, Z / 98) < 1;
    if (!inside || keep.some(([a, b, c, e]) => X + w / 2 > a && X - w / 2 < b && Z + dd / 2 > c && Z - dd / 2 < e)) continue;
    if (detail.low && R() < 0.4) continue;
    spots.push([X, Z, w, dd, 1 + Math.floor(R() * 2), [0, Math.PI / 2, Math.PI, -Math.PI / 2][Math.floor(R() * 4)]]);
  }
  g.add(townHouses(spots, { seed: 5, roof: 'pitched', roofs: ['#a0503a', '#9a4632', '#b25a3c'], paint: ['#f1ede4', '#e7c16d', '#d9a26a', '#c9dbe0', '#e8d6b0'], tanks: 0, fine: !detail.low }));
  // Trees: palms along the streets and in the gardens, banyans and mangoes.
  const free = (pts) => pts.filter(([x, z]) => Math.hypot(x / 140, z / 102) < 1 && !keep.slice(0, 6).some(([a, b, c, e]) => x > a - 3 && x < b + 3 && z > c - 3 && z < e + 3));
  g.add(trees(free(scatter(detail.low ? 30 : 60, [-140, 150, -110, 110], { seed: 4, gap: 10 })), { kind: 'palm', seed: 4 }));
  g.add(trees(free(scatter(detail.low ? 8 : 16, [-140, 150, -110, 110], { seed: 6, gap: 22 })), { kind: 'banyan', seed: 6 }));
  g.add(trees(free(scatter(detail.low ? 8 : 16, [-140, 150, -110, 110], { seed: 8, gap: 18 })), { kind: 'mango', seed: 8 }));
  g.add(trees(scatter(detail.low ? 40 : 90, [-400, 500, 160, 520], { seed: 11, gap: 18 }), { kind: 'palm', seed: 11 }));
  g.add(lampPosts([[-18, 62], [-2, 62], [-18, 120], [-2, 120]]));
  g.add(asiBoard('Fort of Moti Daman', 12, 160, 0.2));
  // The Damanganga to the north, its mouth to the west in the Arabian Sea, with fishing boats.
  g.add(sheet(1600, 360, M.river, 0, -0.35, -330), sheet(700, 1400, M.sea, -1100, -0.36, 300));
  g.add(boats([[-60, -200, 0.4], [-20, -240, 1.2], [40, -210, -0.3], [120, -260, 2.1], [-140, -230, 0.9], [200, -220, 1.6], [10, -290, 0.2]], { y: -0.35, size: 2.4, canopy: true }));
  // Nani Daman on the far bank.
  g.add(cityAround([-500, 500, -900, -540], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, fine: false, gap: 4, storeys: [2, 4], seed: 33, keep: [[-600, 600, -540, -400]] }));
}
