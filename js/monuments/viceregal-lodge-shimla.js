import * as THREE from 'three';
import { M, mat, photo, mesh, box, cyl, at, inst, unitBox, archWall, lathe, tricolour } from '../helpers.js';
import { mergeByMaterial, gableRoof, medallion } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { addDetails } from '../details/viceregal-lodge-shimla.js';
import { detail } from '../detail.js';

// The Lodge's grey sandstone, quarried near Shimla and laid in rough-faced courses; the light
// limestone of its window surrounds, arcades, quoins and bands; the red clay tiles of its roofs;
// and the blue-grey lead of the corner tower's cupola.
export const STONE = photo(mat('#9d998d', 0.9), 'blocks');
export const DRESSED = mat('#c2bfb3', 0.85);
export const TILE = mat('#a04a31', 0.8);
export const SLATE = mat('#4b5969', 0.55, 0.25);

// The building's measures, shared with js/details/viceregal-lodge-shimla.js. From photographs of
// the lawn front (here +z): a long main block, L by D, three storeys (FL each) to its eaves at EH
// under a steep tiled roof; at its west corner a canted bay tower (CX) under an ogee cupola; from
// VX0 to VX1 two tiers of arcaded verandah, VD deep, a balustraded terrace on top; then the
// entrance bay (EX) under its shaped gable, the square main tower rising behind it at (TX, TZ) to
// TH; and the porte-cochère at PX. A kitchen and service wing runs back from the east end.
export const P = { L: 74, D: 22, FL: 4.6, EH: 13.8, RH: 7.5, CX: -35, VX0: -29.3, VX1: 9.2, VD: 3.6, EX: 15, TX: 15, TZ: 1, TW: 10, TH: 31, PX: 27.5 };

// A gable wall, w wide and h high, t thick, facing +z: a triangle of stone.
function gableWall(w, h, t, m) {
  const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  return mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }).translate(0, 0, -t), m);
}

// A Jacobethan shaped gable, w wide and h high, t thick, facing +z: crow steps climbing to a flat
// head that carries an obelisk; a coping on every step.
function shapedGable(w, h, t, m, trim) {
  const st = [[0.5, 0.2], [0.39, 0.46], [0.26, 0.7], [0.12, 0.92]], half = [[-0.5, 0]], g = new THREE.Group();
  st.forEach(([u, v], k) => { half.push([-u, v]); if (k < 3) half.push([-st[k + 1][0], v]); });
  const all = half.concat(half.slice().reverse().map(([u, v]) => [-u, v]));
  g.add(mesh(new THREE.ExtrudeGeometry(new THREE.Shape(all.map(([u, v]) => new THREE.Vector2(u * w, v * h))), { depth: t, bevelEnabled: false }).translate(0, 0, -t), m));
  st.forEach(([u, v], k) => { const u1 = k < 3 ? st[k + 1][0] : 0; for (const sx of k < 3 ? [-1, 1] : [0]) g.add(box((k < 3 ? u - u1 : 2 * u) * w + 0.16, 0.14, t + 0.16, trim, sx * (u + u1) / 2 * w, v * h, -t / 2)); });
  g.add(at(obelisk(Math.max(0.9, h * 0.22), trim), 0, h * 0.92 + 0.14, -t / 2));
  return g;
}

// An obelisk pinnacle h high on a small die, as ring the towers and stand on every gable.
function obelisk(h, m) {
  const g = new THREE.Group(), r = h * 0.16;
  g.add(box(r * 2.2, h * 0.16, r * 2.2, m, 0, 0, 0), at(mesh(new THREE.CylinderGeometry(r * 0.12, r * 1.25, h * 0.84, 4).rotateY(Math.PI / 4).translate(0, h * 0.42, 0), m), 0, h * 0.16, 0));
  return g;
}

// A mullion-and-transom window w × h on a wall at (x, z) facing angle a (0 is +z): dark glass, a
// sill, a lintel, `mull` stone mullions and a transom. Pushed to `out` for inst.
function win(out, x, y, z, a, w, h, mull = 1) {
  const c = Math.cos(a), s = Math.sin(a), at2 = (lat, o) => [x + c * lat + s * o, z - s * lat + c * o];
  const put = (list, lat, o, yy, sx, sy, sz) => { const [px, pz] = at2(lat, o); list.push([px, yy, pz, sx, sy, sz, a]); };
  put(out.glass, 0, 0.03, y, w, h, 0.08);
  put(out.frame, 0, 0.12, y - 0.25, w + 0.5, 0.25, 0.3); put(out.frame, 0, 0.12, y + h, w + 0.5, 0.3, 0.3); put(out.frame, 0, 0.1, y + h * 0.64, w, 0.12, 0.2);
  for (const sx of [-1, 1]) put(out.frame, sx * (w / 2 + 0.1), 0.08, y, 0.2, h, 0.2);
  for (let j = 1; j <= mull; j++) put(out.frame, -w / 2 + j * w / (mull + 1), 0.1, y, 0.14, h, 0.2);
}

// Windows on a face along x at z (facing s = ±1), `n` across `len` round cx, on each storey.
function windows(cx, len, n, z, s, floors, out, { w = 1.8, h = 2.4, from = 0, mull = 1 } = {}) {
  for (let fl = from; fl < floors; fl++) for (let k = 0; k < n; k++) win(out, cx - len / 2 + (k + 0.5) * (len / n), 1.4 + fl * P.FL, z, s > 0 ? 0 : Math.PI, w, h, mull);
}

// A pierced stone balustrade from x0 to x1 along x at (y, z): rails and close-set uprights, pushed
// to `out` for inst.
function pierced(out, x0, x1, y, z, h = 0.95) {
  const len = x1 - x0, n = Math.max(2, Math.round(len / (detail.low ? 0.9 : 0.45)));
  out.push([(x0 + x1) / 2, y, z, len, 0.14, 0.3], [(x0 + x1) / 2, y + h - 0.16, z, len, 0.16, 0.36]);
  for (let k = 0; k < n; k++) out.push([x0 + (k + 0.5) * (len / n), y + 0.14, z, 0.13, h - 0.3, 0.14]);
}

// A tall chimney stack of coursed stone with dressed bands and a corbelled cap.
function stack(x, y, z, h) {
  const g = new THREE.Group();
  g.add(box(1.6, h, 1.1, STONE, x, y, z), box(2, 0.3, 1.5, DRESSED, x, y + h, z), box(1.7, 0.3, 1.2, STONE, x, y + h + 0.3, z));
  for (const k of [0.45, 0.7, 0.88]) g.add(box(1.75, 0.16, 1.25, DRESSED, x, y + h * k, z));
  return g;
}

export function buildViceregalLodgeShimla() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { L, D, FL, EH, RH, CX, VX0, VX1, VD, EX, TX, TZ, TW, TH, PX } = P, fz = D / 2, out = { glass: [], frame: [] }, ey = 1 + EH;
  // A plinth on the levelled hilltop, and the main block under its tiled ridge roof.
  d.add(box(L + 4, 1, D + 4, DRESSED, 0, 0, 0));
  d.add(box(L, EH, D, STONE, 0, 1, 0));
  for (const y of [1 + FL, 1 + 2 * FL]) d.add(box(L + 0.3, 0.3, D + 0.3, DRESSED, 0, y, 0));
  d.add(box(L + 0.8, 0.5, D + 0.8, DRESSED, 0, ey, 0), at(gableRoof(D + 1.6, L + 1, RH, TILE, { axis: 'x' }), 0, ey + 0.5, 0));
  for (const s of [-1, 1]) d.add(at(gableWall(D, RH - 0.3, 0.6, STONE), s * (L / 2 + 0.25), ey + 0.5, 0).rotateY(s * Math.PI / 2));
  windows((VX0 + VX1) / 2, VX1 - VX0 - 2, 9, fz, 1, 3, out);
  windows(0, L - 6, 15, -fz, -1, 3, out);
  // The verandahs of the lawn front: two tiers of nine round arches, alternately wide and narrow,
  // on stone piers with slender shafts, a pierced balustrade in every arch, and a balustraded
  // terrace on top before the second-floor windows.
  const vz = fz + VD - 0.3, wide = 5.3, narrow = 3.2, piers = [VX0];
  for (let k = 0, x = VX0; k < 9; k++) {
    const w = k % 2 ? narrow : wide, cx = x + w / 2;
    for (let t = 0; t < 2; t++) {
      d.add(at(archWall(w, FL, 0.6, w - 0.9, k % 2 ? 3.7 : 3.5, false, DRESSED), cx, 1 + t * FL, vz));
      pierced(out.frame, cx - w / 2 + 0.45, cx + w / 2 - 0.45, 1 + t * FL + (t ? 0.3 : 0), vz);
    }
    x += w; piers.push(x);
  }
  for (const x of piers) for (let t = 0; t < 2; t++) d.add(cyl(0.15, 0.17, FL - 1.3, DRESSED, x, 1 + t * FL + 0.9, vz + 0.36, 8), box(0.5, 0.9, 0.24, DRESSED, x, 1 + t * FL, vz + 0.36), box(0.5, 0.3, 0.3, DRESSED, x, 1 + (t + 1) * FL - 0.4, vz + 0.36));
  for (let t = 1; t <= 2; t++) d.add(box(VX1 - VX0, 0.3, VD, DRESSED, (VX0 + VX1) / 2, 1 + t * FL, fz + VD / 2), box(VX1 - VX0 + 0.3, 0.3, 0.9, DRESSED, (VX0 + VX1) / 2, 1 + t * FL, vz + 0.1));
  pierced(out.frame, VX0, VX1, 1.3 + 2 * FL, vz + 0.1);
  for (const x of piers) d.add(box(0.5, 1.1, 0.5, DRESSED, x, 1.3 + 2 * FL, vz + 0.1), at(obelisk(0.7, DRESSED), x, 2.4 + 2 * FL, vz + 0.1));
  // Stone dormers along the eaves, each a shaped gable before its own little roof.
  for (const [x, s] of [[-23, 1], [-10.5, 1], [2, 1], [-26, -1], [-9, -1], [8, -1], [26, -1], [32.5, 1]]) {
    const dm = new THREE.Group();
    dm.add(at(shapedGable(5, 4.6, 0.5, STONE, DRESSED), 0, 0, 0.5), at(gableRoof(4.4, 7, 3.3, TILE), 0, 0, -3.3));
    win(out, x, ey + 1.5, s * (fz + 0.5), s > 0 ? 0 : Math.PI, 1.5, 1.5);
    d.add(at(dm, x, ey + 0.5, s * fz).rotateY(s > 0 ? 0 : Math.PI));
  }
  // The canted bay tower at the west corner: three storeys of mullioned windows on every face, a
  // cornice with obelisks at the angles, a lantern storey, and the ogee cupola of blue-grey lead
  // with its cresting, finial and weather vane.
  const ct = new THREE.Group(), r8 = 5.4, ap = r8 * Math.cos(Math.PI / 8), cz = fz + 0.6;
  ct.add(cyl(r8 + 0.3, r8 + 0.3, 1, DRESSED, 0, 0, 0, 8), cyl(r8, r8, EH, STONE, 0, 1, 0, 8), cyl(r8 + 0.5, r8 + 0.15, 0.7, DRESSED, 0, ey, 0, 8));
  for (const y of [1 + FL, 1 + 2 * FL]) ct.add(cyl(r8 + 0.15, r8 + 0.15, 0.3, DRESSED, 0, y, 0, 8));
  ct.add(cyl(r8 - 0.6, r8 - 0.6, 4.6, STONE, 0, ey + 0.7, 0, 8), cyl(r8 - 0.1, r8 - 0.45, 0.6, DRESSED, 0, ey + 5.3, 0, 8));
  const R = r8 - 0.7, ogee = [[1, 0], [1.02, 0.25], [0.97, 0.9], [0.84, 1.7], [0.62, 2.5], [0.4, 3.2], [0.24, 3.9], [0.13, 4.7], [0.07, 5.4], [0.001, 5.6]];
  ct.add(at(lathe(ogee.map(([r, y]) => [r * R, y]), SLATE, 8), 0, ey + 5.9, 0), cyl(0.2, 0.32, 0.9, SLATE, 0, ey + 11.3, 0, 8), at(mesh(new THREE.SphereGeometry(0.3, 10, 8), SLATE), 0, ey + 12.4, 0));
  ct.add(cyl(0.035, 0.05, 3, M.steel, 0, ey + 12.4, 0, 6), box(1.3, 0.05, 0.05, M.steel, 0, ey + 14.2, 0), box(0.05, 0.05, 1.3, M.steel, 0, ey + 14.2, 0), box(0.7, 0.4, 0.04, M.steel, 0.1, ey + 15, 0));
  for (let k = 0; k < 8; k++) {
    // In the tower's own frame its angles lie along a and its faces along c; set in place, the
    // whole is turned π/8, so that in the world its faces look along a.
    const a = k * Math.PI / 4, ax = Math.sin(a), az = Math.cos(a), c = a + Math.PI / 8;
    for (let fl = 0; fl < 3; fl++) win(out, CX + ax * ap, 1.4 + fl * FL, cz + az * ap, a, 2.4, 2.9, 2);
    win(out, CX + ax * (ap - 0.56), ey + 1.9, cz + az * (ap - 0.56), a, 1.9, 2.2, 1);
    ct.add(at(obelisk(1.3, DRESSED), ax * (r8 + 0.1), ey + 0.7, az * (r8 + 0.1)), at(obelisk(1, DRESSED), ax * (r8 - 0.4), ey + 5.9, az * (r8 - 0.4)));
    // The cresting round the foot of the cupola: a scrolled piece on every face.
    ct.add(at(mesh(new THREE.TorusGeometry(0.5, 0.09, 4, 10, Math.PI), DRESSED), Math.sin(c) * (ap - 0.75), ey + 5.9, Math.cos(c) * (ap - 0.75)).rotateY(c));
  }
  ct.rotation.y = Math.PI / 8;
  d.add(at(ct, CX, 0, cz));
  // The entrance bay, standing forward: great mullioned windows on three floors between angle
  // shafts crowned with obelisks, and a shaped gable carrying a carved medallion.
  const bz = fz + VD + 0.8, bw = 11;
  d.add(box(bw, EH + 1.2, bz - fz, STONE, EX, 1, (fz + bz) / 2), box(bw + 0.5, 0.5, bz - fz + 0.3, DRESSED, EX, ey + 1.2, (fz + bz) / 2 + 0.1));
  for (const y of [1 + FL, 1 + 2 * FL]) d.add(box(bw + 0.3, 0.3, bz - fz + 0.2, DRESSED, EX, y, (fz + bz) / 2 + 0.1));
  d.add(at(shapedGable(8.4, 5.6, 0.6, STONE, DRESSED), EX, ey + 1.7, bz), at(gableRoof(bw - 0.6, 11, 5, TILE), EX, ey + 1.7, bz - 6.1), at(medallion(1.15, DRESSED), EX, ey + 3.9, bz + 0.02));
  pierced(out.frame, EX - bw / 2 + 0.6, EX - 4.4, ey + 1.7, bz - 0.2); pierced(out.frame, EX + 4.4, EX + bw / 2 - 0.6, ey + 1.7, bz - 0.2);
  for (const s of [-1, 1]) d.add(cyl(0.55, 0.55, EH + 2.6, DRESSED, EX + s * bw / 2, 1, bz, 8), at(obelisk(2, DRESSED), EX + s * bw / 2, ey + 2.6, bz));
  for (let fl = 0; fl < 3; fl++) { win(out, EX, 1.3 + fl * FL, bz, 0, 3.4, 2.9, 3); for (const s of [-1, 1]) win(out, EX + s * 3.6, 1.3 + fl * FL, bz, 0, 1.5, 2.9, 1); }
  // The main tower behind it, raised under Curzon: square, a stage of windows above the roofs, a
  // shaped gable on every face, octagonal shafts at the corners and a ring of obelisk pinnacles;
  // the flag on its staff.
  d.add(box(TW, TH - 1, TW, STONE, TX, 1, TZ), box(TW + 0.5, 0.4, TW + 0.5, DRESSED, TX, TH - 8.2, TZ), box(TW + 0.9, 0.6, TW + 0.9, DRESSED, TX, TH - 0.6, TZ), box(TW + 0.5, 1.2, TW + 0.5, STONE, TX, TH, TZ), box(TW + 0.7, 0.2, TW + 0.7, DRESSED, TX, TH + 1.2, TZ));
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((a) => {
    const ax = Math.sin(a), az = Math.cos(a), h = TW / 2;
    d.add(at(shapedGable(5.6, 4.8, 0.6, STONE, DRESSED), TX + ax * (h + 0.25), TH, TZ + az * (h + 0.25)).rotateY(a));
    for (const lat of [-2.4, 2.4]) { win(out, TX + ax * h + az * lat, TH - 6.6, TZ + az * h - ax * lat, a, 1.6, 2.8, 1); d.add(at(obelisk(1.5, DRESSED), TX + ax * (h + 0.05) + az * lat * 1.55, TH + 1.4, TZ + az * (h + 0.05) - ax * lat * 1.55)); }
    win(out, TX + ax * h, TH - 1.9 + 2.2, TZ + az * h, a, 1.2, 1.4, 1);
    const kx = ax + az, kz = az - ax;
    d.add(cyl(0.85, 0.85, 10.6, STONE, TX + kx * h, TH - 8.2, TZ + kz * h, 8), cyl(1.05, 0.9, 0.4, DRESSED, TX + kx * h, TH + 2.4, TZ + kz * h, 8), at(obelisk(2.6, DRESSED), TX + kx * h, TH + 2.8, TZ + kz * h));
  });
  for (const y of [ey + 3.2, TH - 12.6]) win(out, TX, y, TZ + TW / 2, 0, 1.6, 2.6, 1);
  d.add(at(tricolour(8, 2.4), TX, TH + 1.2, TZ));
  // The porte-cochère east of the entrance bay: three arches to the lawn and two to each side on
  // stone piers, a cresting of strapwork and obelisks, and the royal arms over the middle arch.
  const pd = 9, ph = 5.6, pw = 12;
  for (let k = -1; k <= 1; k++) d.add(at(archWall(pw / 3, ph, 0.8, pw / 3 - 1.1, 4.4, false, DRESSED), PX + k * pw / 3, 1, fz + pd - 0.4));
  for (const s of [-1, 1]) for (const k of [0, 1]) d.add(at(archWall((pd - 0.8) / 2, ph, 0.8, (pd - 0.8) / 2 - 1.1, 4.4, false, DRESSED), PX + s * (pw / 2 - 0.4), 1, fz + (pd - 0.8) * (k + 0.5) / 2).rotateY(Math.PI / 2));
  d.add(box(pw + 0.6, 0.5, pd + 0.3, DRESSED, PX, 1 + ph, fz + pd / 2 + 0.15), box(pw, 0.2, pd, STONE, PX, 1.5 + ph, fz + pd / 2));
  pierced(out.frame, PX - pw / 2, PX + pw / 2, 1.5 + ph, fz + pd - 0.2, 0.8);
  for (const x of [-pw / 2, -pw / 6, pw / 6, pw / 2]) d.add(box(0.6, 0.9, 0.6, DRESSED, PX + x, 1.5 + ph, fz + pd - 0.2), at(obelisk(1.1, DRESSED), PX + x, 2.4 + ph, fz + pd - 0.2));
  for (const s of [-1, 1]) { out.frame.push([PX + s * (pw / 2 - 0.2), 1.5 + ph, fz + pd / 2, pd, 0.14, 0.3, Math.PI / 2], [PX + s * (pw / 2 - 0.2), 2.14 + ph, fz + pd / 2, pd, 0.16, 0.36, Math.PI / 2]); for (let k = 0; k < 18; k++) out.frame.push([PX + s * (pw / 2 - 0.2), 1.64 + ph, fz + (k + 0.5) * pd / 18, 0.14, 0.5, 0.13]); }
  // The arms: a shield between scrolls under a crown, on a cartouche.
  const arms = new THREE.Group(), sh = new THREE.Shape([[-0.6, 1.5], [0.6, 1.5], [0.6, 0.7], [0, 0], [-0.6, 0.7]].map(([u, v]) => new THREE.Vector2(u, v)));
  arms.add(box(2.6, 0.5, 0.5, DRESSED, 0, 0, 0), mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }), DRESSED, 0, 0.55, -0.15), box(0.9, 0.3, 0.4, DRESSED, 0, 2.1, 0), at(mesh(new THREE.SphereGeometry(0.2, 8, 6), DRESSED), 0, 2.55, 0));
  for (const s of [-1, 1]) arms.add(at(mesh(new THREE.TorusGeometry(0.5, 0.13, 4, 10, Math.PI * 1.3), DRESSED), s * 1.05, 1.05, 0).rotateZ(s > 0 ? -0.4 : Math.PI - 0.9));
  d.add(at(arms, PX, 1.5 + ph, fz + pd - 0.2));
  d.add(at(classicalDoor(2.6, 4, { m: STONE, trim: DRESSED, top: null, depth: 0.3 }), PX, 1, fz + 0.01));
  windows(PX, 9, 2, fz, 1, 3, out, { from: 2 }); windows(35.2, 2, 1, fz, 1, 3, out, { w: 1.4 });
  for (const x of [PX - 3.4, PX + 3.4]) win(out, x, 1.4 + FL, fz, 0, 1.8, 2.4, 1);
  // Tall banded chimney stacks along the ridge and on the slopes.
  for (const x of [-31, -17, -3, 30]) d.add(stack(x, EH + 6.5, 0, 5.2));
  for (const [x, z] of [[-28.2, 6], [24, -6], [6, 7], [-12, -6.5]]) d.add(stack(x, EH + 3.5, z, 6.5));
  // The service wing running back from the east end, a storey lower, on its own ridge.
  const sx = L / 2 - 8, sz = -fz - 17;
  d.add(box(14, EH - FL, 34, STONE, sx, 1, sz), box(14.6, 0.4, 34.6, DRESSED, sx, 1 + EH - FL, sz));
  d.add(at(gableRoof(15, 34.6, 5.5, TILE, { axis: 'x' }), sx, 1.4 + EH - FL, sz).rotateY(Math.PI / 2), at(gableWall(14, 5.2, 0.5, STONE), sx, 1.4 + EH - FL, sz - 17.2).rotateY(Math.PI));
  for (const s of [-1, 1]) for (let fl = 0; fl < 2; fl++) for (let k = 0; k < 6; k++) {
    const z = sz - 14 + k * 5.6, y = 1.4 + fl * FL, x = sx + s * 7.03;
    out.glass.push([x, y, z, 0.08, 2.2, 1.6]);
  }
  f.add(mergeByMaterial(d), inst(unitBox(), out.glass, M.recess), inst(unitBox(), out.frame, DRESSED));
  addDetails(f, g);
  // From the lawn, a little west of the axis: the cupola, the verandahs and the tower.
  return { group: g, focus: f, view: [-0.4, 0.13, 1], zoom: 0.55 };
}
