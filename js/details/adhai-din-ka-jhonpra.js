import * as THREE from 'three';
import { M, mat, mesh, box, at, inst, unitCyl, unitBox, rise, archWall, archPanel } from '../helpers.js';
import { carved, frieze, jali, archCurve, archRing, medallion, jharokha, mergeByMaterial } from '../parts/components.js';
import { pierced } from '../parts/mughal.js';
import { steps } from '../parts/doorways.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';

// The yellow limestone of the screen, and the same stone weathered darker on the hall and court.
export const LIME = mat('#c7a66c', 0.9);
export const LIME_DARK = mat('#a88a5a', 0.92);
// The screen's carving: Kufic and Tughra script, arabesque scrollwork, and geometric filigree.
const SCRIPT = () => carved(LIME, 'calligraphy'), KUFIC = () => carved(LIME, 'script'), ARABESQUE = () => frieze(LIME);

// A fluted shaft r0 across at its foot tapering to r1 at height h, n flutes round it alternately
// round and angular, as on the Qutb Minar's lowest storey: the screen's minarets and the towers at
// the enclosure's corners.
export function fluted(r0, r1, h, n, m) {
  const sh = new THREE.Shape(), step = (Math.PI * 2) / n, rc = r0 * (1 - 1.1 * Math.sin(step / 2));
  for (let k = 0; k < n; k++) {
    const pts = k % 2 ? [[-1, rc], [0, r0], [1, rc]] : [-1, -0.75, -0.4, 0, 0.4, 0.75, 1].map((t) => [t, rc + (r0 - rc) * Math.sqrt(1 - t * t)]);
    for (const [t, r] of pts) {
      const a = (k + t / 2) * step, x = Math.sin(a) * r, y = Math.cos(a) * r;
      if (t === -1) { if (!k) sh.moveTo(x, y); } else if (t < 1 || k < n - 1) sh.lineTo(x, y);
    }
  }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const s = 1 + (r1 / r0 - 1) * (p.getY(i) / h); p.setXYZ(i, p.getX(i) * s, p.getY(i), p.getZ(i) * s); }
  geo.computeVertexNormals();
  return mesh(geo, m);
}

// The engrailed (cusped) lining of a corbelled arch aw wide and ah to its crown: a band following
// the arch, its inner edge cut into `lobes` scallops a side that meet in points, t thick (z = 0 to
// t), its feet at the springing.
export function engrailed(aw, ah, band, t, m, lobes = 3.5) {
  const r = aw / 2, o = archCurve(r, ah - rise(r, true), true, 21), n = o.length - 1, sh = new THREE.Shape();
  o.forEach((p, i) => (i ? sh.lineTo(p.x, p.y) : sh.moveTo(p.x, p.y)));
  for (let i = n; i >= 0; i--) {
    const a = o[Math.max(0, i - 1)], b = o[Math.min(n, i + 1)], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty);
    const side = 1 - Math.abs(1 - (2 * i) / n), d = band * (1 - 0.72 * Math.abs(Math.sin(side * lobes * Math.PI)));
    sh.lineTo(o[i].x + (ty / l) * d, Math.max(o[0].y, o[i].y - (tx / l) * d));
  }
  return mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), m);
}

// The carving on the screen's east face. From photographs: every arch stands in a rectangular
// frame of bands, script alternating with arabesque and geometric borders; a band of script follows
// the arch itself, the spandrels are filled with scrollwork round bosses, and a small rectangular
// opening pierces each spandrel of the side arches (a carved panel on the middle one). A long band of script runs under
// the cornice of each wing and of the middle section. `arches` are [cx, aw, ah]; z is the face.
export function screenCarving(arches, { SL, SD, CH, SH, CW }) {
  const d = new THREE.Group(), z = SD;
  for (const [cx, aw, ah] of arches) {
    const big = cx === 0, zz = z + (big ? 0.3 : 0), b = big ? 0.75 : 0.45, r = aw / 2, top = ah + (big ? 0.9 : 0.6);
    // The frame: three bands on the middle arch (Tughra, arabesque, Kufic), two on the others.
    const bands = big ? [[b, SCRIPT()], [0.32, ARABESQUE()], [0.5, KUFIC()]] : [[b, SCRIPT()], [0.22, ARABESQUE()]];
    let off = r + (big ? 0.2 : 0.15);
    bands.forEach(([w, m], k) => {
      const ht = top + (off - r) + w, p = 0.1 - k * 0.025;
      for (const s of [-1, 1]) d.add(box(w, ht, p, m, cx + s * (off + w / 2), 0, zz + p / 2));
      d.add(box(2 * off, w, p, m, cx, ht - w, zz + p / 2));
      off += w + 0.06;
    });
    // The band on the arch, the carved spandrels, and their panels and bosses.
    d.add(at(archRing(aw, ah, true, big ? 0.55 : 0.32, 0.07, SCRIPT(), false), cx, 0, zz));
    const fw = aw + (big ? 0.4 : 0.3), ring = big ? 0.6 : 0.36;
    d.add(at(pierced(fw, top, [[0, 0, fw - 0.02, ah + ring]], 0.035, ARABESQUE()), cx, 0, zz));
    for (const s of [-1, 1]) {
      const x = cx + s * r * 0.8, y = top - (big ? 1.5 : 0.95);
      if (big) d.add(box(0.7, 0.9, 0.09, KUFIC(), x, y, zz + 0.045));
      else d.add(box(0.5, 0.65, 0.06, M.recess, x, y, zz + 0.03), box(0.46, 0.61, 0.08, jali(LIME), x, y + 0.02, zz + 0.04));
      if (!detail.low) d.add(at(medallion(big ? 0.28 : 0.16, LIME), cx + s * r * 0.4, top - (big ? 1.0 : 0.5), zz + 0.035));
    }
  }
  // The middle section: narrow geometric borders up its corners, two bands of script and a carved
  // cornice above the arch's frame.
  for (const s of [-1, 1]) d.add(box(0.16, CH - 1.8, 0.06, ARABESQUE(), s * (CW / 2 - 0.1), 0, z + 0.33));
  d.add(box(CW - 0.2, 0.7, 0.08, SCRIPT(), 0, CH - 1.7, z + 0.34), box(CW, 0.3, 0.12, ARABESQUE(), 0, CH - 0.95, z + 0.36), box(CW + 0.3, 0.5, SD + 0.6, LIME_DARK, 0, CH - 0.5, SD / 2 + 0.15));
  // The wings: the long band of script and the cornice.
  for (const s of [-1, 1]) {
    const len = (SL - CW) / 2, cx = s * (CW / 2 + len / 2);
    d.add(box(len - 0.4, 0.55, 0.08, SCRIPT(), cx, SH - 1.05, z + 0.04), box(len, 0.45, SD + 0.3, LIME_DARK, cx, SH - 0.45, SD / 2));
  }
  return d;
}

// The court and the enclosure, 79 m square. From photographs and the plan of 1911: the mosque
// stands on a terrace whose east wall rises some 9 m from the street, with a fluted tower at each
// corner. A long stair climbs to the east gate: a tall block with a doorway under a lintel, a
// carved panel and a pointed arch above it, between two balconies on pillars. A second gate
// projects from the middle of the south side. Of the cloisters that ran round the court only low
// plinths, lengths of wall and a few pillars stand; a paved path runs from the gate to the middle
// arch between old trees. The terrace is P high; the screen's front is at z = SD, the walls' outer
// faces at z = Z0 (west) and Z1 (east).
function court(f, { P, EW, Z0, Z1, SD }) {
  const d = new THREE.Group(), W = EW / 2, GW = 11, GH = 9.4;
  // The enclosure wall above the terrace: the east side either side of the gate, the north and
  // south sides standing to uneven heights, broken where they have fallen.
  for (const s of [-1, 1]) d.add(box(W - GW / 2, 3.4, 1.5, LIME_DARK, s * (W + GW / 2) / 2, P, Z1 - 0.75));
  const R = (k) => ((Math.sin(k * 91.7) * 43758.5) % 1 + 1) % 1;
  for (const s of [-1, 1]) for (let k = 0, z = SD + 2; z < Z1 - 2; k++) {
    const len = 6 + R(k + s) * 7, h = 1.4 + R(k * 3 + s) * 2.6;
    if (!(s < 0 && z < 34 && z + len > 20)) d.add(box(1.5, h, Math.min(len, Z1 - 1.5 - z), LIME_DARK, s * (W - 0.75), P, z + Math.min(len, Z1 - 1.5 - z) / 2));
    z += len;
  }
  // Three small arched niches in the east wall, south of the gate.
  for (const x of [-14, -20, -26]) d.add(at(archPanel(0.9, 1.9, true, M.recess, 0.06), x, P + 0.3, Z1 + 0.01), at(archRing(0.9, 1.9, true, 0.18, 0.06, LIME), x, P + 0.3, Z1 + 0.02));
  // The fluted towers at the corners, girdled by carved bands.
  for (const x of [-W, W]) for (const z of [Z0, Z1]) {
    const h = P + (z > 0 ? 5 : 8.2);
    d.add(at(fluted(2.1, 1.85, h, 12, LIME), x, 0, z));
    for (const [t, r] of [[0.04, 2.2], [0.5, 2.08], [0.94, 1.98]]) d.add(at(mesh(new THREE.CylinderGeometry(r, r, 0.55, 24), ARABESQUE()), x, h * t + 0.3, z));
  }
  // The east gate.
  const gate = new THREE.Group();
  gate.add(at(archWall(GW, GH, 3, 3.2, 8.2, true, LIME), 0, 0, 0), box(GW + 0.3, 0.4, 3.3, LIME_DARK, 0, GH, 0));
  for (const zs of [-1, 1]) {
    const face = new THREE.Group();
    // The lintel over the door, the carved panel on it, and the frame of bands round the whole.
    face.add(box(3.6, 0.5, 0.5, LIME_DARK, 0, 4.3, -0.2), box(3.4, 1.3, 0.3, KUFIC(), 0, 4.8, -0.1));
    for (const s of [-1, 1]) face.add(box(0.45, 8.6, 0.08, ARABESQUE(), s * 2.1, 0, 0.04), box(0.3, 9.05, 0.06, SCRIPT(), s * 2.52, 0, 0.03));
    face.add(box(4.65, 0.45, 0.08, ARABESQUE(), 0, 8.6, 0.04), at(archRing(3.2, 8.2, true, 0.22, 0.1, SCRIPT(), false), 0, 0, 0));
    if (zs > 0) for (const s of [-1, 1]) {
      // The balconies: a canopy on four pillars over a corbelled floor, and the carved niche below.
      face.add(at(jharokha(2.6, 2.7, LIME, { d: 1.7, roof: 'flat', trim: LIME_DARK }), s * 4.0, 4.9, 0));
      face.add(box(1.5, 1.6, 0.08, carved(LIME, 'reliefs'), s * 4.0, 1.6, 0.04));
    }
    gate.add(at(face, 0, 0, zs * 1.5).rotateY(zs > 0 ? 0 : Math.PI));
  }
  d.add(at(gate, 0, P, Z1 - 1.2));
  // The stair: two flights between side walls, a landing half way.
  const st = new THREE.Group(), h2 = P / 2, run = 5.6;
  st.add(box(9, P, 2.2, LIME_DARK, 0, 0, 1.1), at(steps(7, h2, 12, LIME, 0.45), 0, h2, 2.2), box(9, h2, run + 3.4, LIME_DARK, 0, 0, 2.2 + (run + 3.4) / 2));
  st.add(at(steps(7, h2, 12, LIME, 0.45), 0, 0, 2.2 + run + 3.4));
  for (const s of [-1, 1]) st.add(box(1, P + 1, 2.2 + run, LIME_DARK, s * 4, 0, (2.2 + run) / 2), box(1, h2 + 1, 3.4 + run, LIME_DARK, s * 4, 0, 2.2 + run + (3.4 + run) / 2));
  d.add(at(st, 0, 0, Z1 + 0.3));
  // The south gate: a porch standing out from the wall, an arch through it and steps down.
  const sg = new THREE.Group();
  sg.add(at(archWall(9, 7.5, 5, 3, 5.6, true, LIME), 0, 0, 0), box(9.3, 0.4, 5.3, LIME_DARK, 0, 7.5, 0), at(archRing(3, 5.6, true, 0.3, 0.08, SCRIPT()), 0, 0, 2.5));
  sg.add(box(9, P, 5, LIME_DARK, 0, -P, 0), at(steps(5, P, 16, LIME, 0.42), 0, -P, 2.5));
  d.add(at(sg, -W - 1, P, 27).rotateY(-Math.PI / 2));
  // Inside: the plinths of the lost cloisters, a few of their pillars, a small pillared pavilion
  // on the south side, the paved path and a low walled plot of graves beside it.
  const shafts = [], blocks = [];
  for (const s of [-1, 1]) {
    d.add(box(7, 0.5, Z1 - SD - 9, LIME_DARK, s * (W - 5), P, (SD + Z1) / 2 + 1));
    for (let k = 0; k < 9; k++) if (R(k * 7 + s) < 0.45) { const z = SD + 9 + k * 5.2, x = s * (W - 7.6); shafts.push([x, P + 0.9, z, 0.5, 3.6, 0.5]); blocks.push([x, P + 0.5, z, 0.85, 0.4, 0.85], [x, P + 4.5, z, 0.9, 0.35, 0.9]); }
  }
  for (const s of [-1, 1]) d.add(box(EW / 2 - 13.5, 0.5, 6, LIME_DARK, s * (EW / 4 - 3.25), P, Z1 - 4.6));
  for (const x of [-1.9, 1.9]) for (const z of [-1.9, 1.9]) { shafts.push([-24 + x, P + 0.6, 30 + z, 0.42, 2.6, 0.42]); blocks.push([-24 + x, P + 3.2, 30 + z, 0.7, 0.3, 0.7]); }
  d.add(box(6, 0.6, 6, LIME_DARK, -24, P, 30), box(5.4, 0.35, 5.4, LIME_DARK, -24, P + 3.5, 30));
  d.add(inst(unitCyl(8), shafts, LIME), inst(unitBox(), blocks, LIME_DARK));
  d.add(box(5, 0.08, Z1 - SD - 4, M.path, 0, P, (SD + Z1) / 2 - 1.5));
  for (const [x, z, w, l] of [[12, 30, 0.6, 14], [19, 23.3, 14, 0.6], [19, 36.7, 14, 0.6], [26, 30, 0.6, 14]]) d.add(box(w, 1.1, l, LIME_DARK, x, P, z));
  // Fallen and loose blocks in the court.
  const loose = [];
  for (let k = 0; k < 40; k++) loose.push([-28 + R(k) * 56, P, 10 + R(k + 50) * 40, 0.6 + R(k + 9) * 0.8, 0.4 + R(k + 3) * 0.4, 0.5 + R(k + 7) * 0.6, R(k + 1) * 3]);
  d.add(inst(unitBox(), loose.filter(([x, , z]) => Math.abs(x) > 5 && !(Math.abs(x + 24) < 4 && Math.abs(z - 30) < 4) && !(x > 11 && x < 27 && z > 22 && z < 38)), LIME_DARK));
  f.add(mergeByMaterial(d));
}

// The ground: the street's level east and south of the terrace; on the west and north the hillside
// comes up to the terrace's level against the walls, and Taragarh rises steeply beyond.
const bank = (x, z) => Math.max(smooth(-13, -32, z), smooth(38, 54, x) * smooth(74, 40, z));
const hillY = (P) => (x, z) => {
  const t = smooth(110, 420, -z + 0.15 * Math.abs(x));
  return t * (90 + 60 * ridged(x, z, { scale: 0.004, octaves: 4 }) + 25 * fbm(x, z, { scale: 0.01, octaves: 3 })) + (P - 0.5) * bank(x, z) - 0.4;
};

export function addDetails(f, g, dims) {
  const { P, Z1 } = dims, Y = hillY(P), onHill = ([x, z]) => [x, z, 0, Y(x, z)];
  court(f, dims);
  g.add(box(500, 0.2, 500, M.path, 0, -0.2, 40));
  g.add(heightField(1200, 900, detail.low ? 100 : 150, Y, { cz: -300, rock: ['#8b7a5c', '#9a8866'], cover: '#7d7a4e', steep: 0.6, band: 20 }));
  g.add(trees(scatter(10, [-90, 90, 70, 110], { seed: 3, gap: 14, avoid: [[-50, 50, 46, 140]] }), { kind: 'neem', seed: 3 }));
  g.add(trees(scatter(8, [-90, 90, -60, -18], { seed: 5, gap: 16 }).map(onHill), { kind: 'babul', seed: 5 }));
  // The old neems in the court, and dry scrub among the stones.
  g.add(trees([[-13, 34, 11], [-20, 50, 9], [17, 47, 10]], { kind: 'neem', seed: 8, y: P }));
  g.add(shrubs(scatter(20, [-30, 30, 8, Z1 - 8], { seed: 6, gap: 4, avoid: [[-6, 6, 0, 70], [10, 28, 21, 39], [-28, -20, 26, 34]] }), { seed: 6, dry: true, size: 0.7, y: P }));
  g.add(asiBoard('Adhai Din Ka Jhonpra', 9, Z1 + 20, -0.3));
  // The old town of Ajmer round the mosque, the street open before its steps.
  g.add(cityAround([-58, 46, -24, Z1 + 18], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, gap: 8, seed: 41, fine: false,
    paint: ['#e8d8b8', '#d9b48f', '#cfd8d4', '#f1e6cf', '#e7b9b0', '#c9d6a3'], keep: [[-75, 75, Z1 + 2, 400], [-400, 400, -400, -14], [40, 400, -400, 80], [-62, -40, 18, 36]] }));
}
