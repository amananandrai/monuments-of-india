import * as THREE from 'three';
import { M, mat, surface, flat, mesh, box, at, onFace, FACES, inst, nagaraProfile } from '../helpers.js';
import { mouldings, medallion, pilasters, mergeByMaterial } from '../parts/components.js';
import { templeDoorway } from '../parts/doorways.js';
import { trees, shrubs, scatter, along, lampPosts, asiBoard, bollards, benches } from '../parts/realism.js';
import { detail } from '../detail.js';

// The fine red brick of Sirpur, darker where it has weathered; and the grey-buff stone of the
// platform and the door.
export const BRICK = surface(mat('#9a5640', 0.93), 'terracotta');
export const BRICK_DARK = surface(mat('#7a4535', 0.95), 'terracotta');
export const STONE = mat('#a8a08c', 0.93);
export const STONE_DARK = mat('#86806f', 0.95);
// The shadowed hollow of a moulded chaitya window: drawn over the brick it lies on.
const HOLLOW = Object.assign(surface(mat('#5e3326', 0.95), 'terracotta'), { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 });

// The horseshoe-shaped chaitya window (gavaksha) moulded in brick, w wide, facing +z on a wall at
// z = 0 from y = 0: a dark round-headed recess in a ring, with a little finial on its crown.
function gavaksha(w) {
  const g = new THREE.Group(), r = w * 0.5;
  g.add(mesh(new THREE.CircleGeometry(r * 0.72, 12, 0, Math.PI), HOLLOW, 0, r * 0.4, 0.04));
  g.add(box(r * 1.44, r * 0.4, 0.04, HOLLOW, 0, 0, 0.02));
  g.add(at(mesh(new THREE.TorusGeometry(r * 0.84, r * 0.14, 4, 12, Math.PI), BRICK), 0, r * 0.4, 0.06));
  for (const s of [-1, 1]) g.add(box(r * 0.26, r * 0.42, 0.12, BRICK, s * r * 0.84, 0, 0.06));
  g.add(box(r * 0.22, r * 0.3, 0.1, BRICK, 0, r * 1.25, 0.05));
  return g;
}

// Laxman temple, finer detail. From photographs: the brick walls are articulated by pilasters on
// every offset, and on each face a false window (a latticed opening in a frame under a chaitya
// arch); the stone base is moulded; up the middle of each face of the tower climbs a band (lata)
// of interlaced chaitya windows, with a larger one at its foot over the vestibule; ribbed brick
// stones (bhumi amalakas) mark the storeys on the corners. The east door, of stone, is carved with
// Vishnu reclining on Shesha. Dimensions follow js/monuments/laxman-temple-sirpur.js.
function architecture(f, { P, sz, B, BW, WH, TW, TH, yb }) {
  const d = new THREE.Group();
  const s = at(new THREE.Group(), 0, 0, sz);
  s.add(mouldings(BW + 0.8, BW + 0.8, [[P + 0.12, 0.18, 0.08, STONE_DARK], [P + 0.42, 0.16, 0.06, STONE_DARK]], STONE));
  s.add(mouldings(BW + 0.9, BW * 0.36, [[yb + 0.5, 0.16, 0.06, BRICK_DARK], [yb + WH - 0.75, 0.18, 0.08, BRICK_DARK]], BRICK));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    // The false window in the middle of the face.
    const w = onFace(at(new THREE.Group(), 0, yb + 0.9, 0), a, (BW + 0.9) / 2);
    w.add(box(1.3, 1.6, 0.05, M.recess, 0, 0, 0.02), box(1.7, 0.2, 0.2, BRICK_DARK, 0, -0.2, 0.08), box(1.7, 0.2, 0.2, BRICK_DARK, 0, 1.6, 0.08));
    for (const k of [-0.4, 0, 0.4]) w.add(box(0.09, 1.6, 0.1, BRICK, k, 0, 0.06));
    for (const x of [-0.85, 0.85]) w.add(box(0.2, 1.8, 0.2, BRICK_DARK, x, -0.2, 0.08));
    w.add(at(gavaksha(1.3), 0, 1.85, 0.02));
    s.add(w);
    // Pilasters on the offsets either side.
    for (const l of [-1, 1]) {
      s.add(onFace(at(pilasters(0.01, 1, 0.35, WH - 1.5, 0.08, BRICK), 0, yb + 0.68, 0), a, (BW + 0.5) / 2, l * BW * 0.25));
      s.add(onFace(at(pilasters(0.01, 1, 0.35, WH - 1.5, 0.08, BRICK), 0, yb + 0.68, 0), a, BW / 2, l * BW * 0.42));
    }
  }
  d.add(s);
  // The tower's bands of chaitya windows, and its corner stones.
  const ar = [], am = new THREE.SphereGeometry(1, detail.low ? 8 : 12, 5), n = 10, y0 = yb + WH;
  for (const a of FACES) for (let k = 0; k < n; k++) {
    const t = (k + 0.3) / n, w = TW * nagaraProfile(t), dist = w * 0.5 + 0.03, gw = w * 0.15;
    for (const l of k % 2 ? [-1, 0, 1] : [-0.5, 0.5]) {
      const o = onFace(at(gavaksha(gw), 0, y0 + t * TH, 0), a, dist, l * gw);
      o.position.z += sz;
      ar.push(o);
    }
  }
  for (const o of ar) d.add(o);
  for (let k = 1; k <= 5; k++) {
    const t = k / 6, wt = TW * nagaraProfile(t), r = wt * 0.06;
    for (const sx of [-1, 1]) for (const sz2 of [-1, 1]) { const o = mesh(am, flat(BRICK), sx * wt * 0.42, y0 + t * TH, sz + sz2 * wt * 0.42); o.scale.set(r, r * 0.45, r); d.add(o); }
  }
  // The great chaitya arch at the foot of the east face (the sukanasa), over the vestibule.
  d.add(at(gavaksha(2.6), 0, y0 + 0.3, sz + TW * nagaraProfile(0.05) * 0.5 + 0.05));
  f.add(mergeByMaterial(d));
  // The stone doorway into the sanctum.
  f.add(at(templeDoorway(1.3, 2.6, { m: STONE, bands: 4, guardians: !detail.low, guardianH: 1.1, hood: false }), 0, yb, sz + BW / 2 + 0.05));
}

// Sirpur, beside the Mahanadi: the platform in a garden of lawns and clipped hedges, a path from
// the gate to its stairs, the ASI's board, mango and neem trees, and the low brick foundations of
// other buildings excavated round it.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const { PW, PL } = dims;
  g.add(box(260, 0.1, 260, M.grass, 0, -0.1, 0));
  g.add(box(PW + 6, 0.06, PL + 6, M.path, 0, -0.02, 0), box(3.5, 0.06, 40, M.path, 0, -0.02, PL / 2 + 22));
  g.add(bollards([...along(9, [-PW / 2 - 4, PL / 2 + 4], [PW / 2 + 4, PL / 2 + 4])], { h: 0.6 }));
  g.add(asiBoard('Laxman Temple, Sirpur', -5, PL / 2 + 14, 0));
  g.add(lampPosts([...along(4, [-3, PL / 2 + 8], [-3, PL / 2 + 40]), ...along(4, [3, PL / 2 + 8], [3, PL / 2 + 40])]));
  g.add(benches([[-7, PL / 2 + 20, Math.PI / 2], [7, PL / 2 + 20, -Math.PI / 2]]));
  // Excavated foundations: low brick walls of a monastery and small shrines to the north and south.
  const ruins = [];
  for (const [cx, cz, w, dd] of [[-30, -6, 16, 14], [30, 4, 14, 18], [-26, 26, 10, 8]]) {
    for (const s of [-1, 1]) ruins.push([cx, 0, cz + s * dd / 2, w, 0.7, 0.8, 0], [cx + s * w / 2, 0, cz, 0.8, 0.6, dd, 0]);
    ruins.push([cx, 0, cz, w * 0.6, 0.4, 0.6, 0]);
  }
  g.add(inst(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), ruins, BRICK_DARK));
  g.add(shrubs([...along(8, [-PW / 2 - 2.5, -PL / 2 - 2.5], [-PW / 2 - 2.5, PL / 2 + 2.5]), ...along(8, [PW / 2 + 2.5, -PL / 2 - 2.5], [PW / 2 + 2.5, PL / 2 + 2.5])], { size: 0.9, seed: 4 }));
  const keep = [[-45, 45, -30, 70]];
  g.add(trees(scatter(detail.low ? 14 : 28, [-120, 120, -120, 120], { seed: 6, gap: 13, avoid: keep }), { kind: 'mango', seed: 6 }));
  g.add(trees(scatter(detail.low ? 10 : 18, [-130, 130, -130, 130], { seed: 9, gap: 15, avoid: keep }), { kind: 'neem', seed: 9 }));
  g.add(trees([[-22, -30], [24, -32], [40, 30]], { kind: 'peepal', seed: 2 }));
}
