import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, mat, at, mesh, box, cyl, inst, unitBox, FACES } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial, frieze } from '../parts/components.js';
import { figure, figureGeo, figureRow, kuduGeo, instances } from '../parts/sculpture.js';
import { nandi } from '../parts/animals.js';
import { trees, shrubs, asiBoard, along, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';

// Kanchipuram's soft sandstone, a warm buff; the grey granite of the base course that keeps it off
// the damp ground; and the white lime plaster that once coated all of it and still clings in patches.
export const STONE = mat('#b39b7a', 0.93);
export const SHADE = mat('#8c7558', 0.94);
export const GRANITE = mat('#8a8782', 0.9);
export const PLASTER = mat('#e6dfcf', 0.9);

// VW, VH: the sanctum's width and wall height, at z = vz; the hall mw × md, MH high, at mz. The
// court runs x = ±cx, from z = cz0 to its east wall at cz1; the front court from there to the row
// of eight shrines at fz.
export const DIMS = { VW: 9, VH: 6, vz: -6, mz: 7, mw: 9, md: 8, MH: 5.2, cx: 17, cz0: -21, cz1: 20, fz: 28.5 };
const { VW, vz, mz, mw, md, MH, cx, cz0, cz1, fz } = DIMS, H = Math.PI / 2;

// The nine shrines round the sanctum, [x, z (from the sanctum's centre), width, depth, turn]: the
// four corners, the three free faces (south is -x), and the pair flanking the entrance.
const o = VW / 2 + 1.1;
export const SHRINES = [[-o, -o, 2.6, 2.6, 0], [o, -o, 2.6, 2.6, 0], [-o, o, 2.6, 2.6, 0], [o, o, 2.6, 2.6, 0],
  [0, -VW / 2 - 1, 3.6, 2.2, Math.PI], [-VW / 2 - 1, 0, 3.6, 2.2, -H], [VW / 2 + 1, 0, 3.6, 2.2, H], [-3.05, o, 2.4, 2.4, 0], [3.05, o, 2.4, 2.4, 0]];
// Their images, each some 9 ft high in its opening, [shrine, the face it looks out of, which]:
// Shiva dancing the Urdhva and the Sandhya Tandava, as the beggar Bhikshatana, receiving the Ganga
// in his hair, as the teacher Dakshinamurti under the banyan on the south, rising out of the pillar
// of fire (Lingodbhava) on the west, and as Tripurantaka the archer, with Durga on her lion, on
// the north.
const IMAGES = [[0, -H, 'tandava'], [0, Math.PI, 'bhikshatana'], [2, -H, 'gangadhara'], [1, H, 'sandhya'], [1, Math.PI, 'standing'], [3, H, 'durga'],
  [4, Math.PI, 'lingodbhava'], [5, -H, 'dakshinamurti'], [6, H, 'tripurantaka'], [7, 0, 'standing'], [8, 0, 'standing']];

// The 58 cells of the court, [x, z, turn], each facing in: 16 along the west wall, 16 down each
// side, and five either side of Mahendravarman's shrine on the east.
export const CELLS = [];
{
  const ix = cx - 1.45, iz0 = cz0 + 1.45, iz1 = cz1 - 1.45;
  const ring = (x0, z0, x1, z1, n, ry) => { for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; CELLS.push([x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, ry]); } };
  ring(-ix, iz0, ix, iz0, 16, 0);
  ring(-ix, iz0 + 2, -ix, iz1 - 2, 16, H);
  ring(ix, iz0 + 2, ix, iz1 - 2, 16, -H);
  ring(-ix - 0.95, iz1, -5.7, iz1, 5, Math.PI);
  ring(5.7, iz1, ix + 0.95, iz1, 5, Math.PI);
}
// The eight shrines of the east row, [x].
export const ROW = [-1, 1].flatMap((s) => [0, 1, 2, 3].map((k) => [s * (3.5 + k * 3.6)]));

// A cylinder between two points, as a geometry (for the merged carvings below).
function rod(a, b, r1, r2, seg = 6) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return new THREE.CylinderGeometry(r2, r1, A.distanceTo(B), seg).applyQuaternion(q).translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
}
// The Pallava lion, the mark of Rajasimha's temples: it sits up on its haunches against the foot of
// every pilaster, forepaws raised, the mane a great ruff round a snarling head. One geometry, 1 tall,
// facing +z with its back on z = 0; coarser on phones.
function lionParts() {
  const [sw, sh] = detail.low ? [6, 4] : [9, 6], P = [];
  const E = (rx, ry, rz, x, y, z) => P.push(new THREE.SphereGeometry(1, sw, sh).scale(rx, ry, rz).translate(x, y, z));
  E(0.2, 0.19, 0.2, 0, 0.19, 0.22);                                           // haunches
  E(0.15, 0.3, 0.15, 0, 0.47, 0.2);                                           // the body, upright
  E(0.16, 0.15, 0.13, 0, 0.58, 0.28);                                         // chest
  E(0.2, 0.2, 0.16, 0, 0.78, 0.2);                                            // mane
  E(0.13, 0.13, 0.14, 0, 0.82, 0.31);                                         // head
  E(0.075, 0.065, 0.08, 0, 0.78, 0.43);                                       // muzzle
  for (const s of [-1, 1]) {
    P.push(rod([s * 0.14, 0.6, 0.3], [s * 0.16, 0.46, 0.44], 0.05, 0.045), rod([s * 0.16, 0.46, 0.44], [s * 0.15, 0.56, 0.5], 0.05, 0.05));   // forelegs, paws up
    P.push(rod([s * 0.17, 0.12, 0.2], [s * 0.17, 0.04, 0.42], 0.07, 0.05));  // hind feet
    if (!detail.low) E(0.045, 0.055, 0.03, s * 0.12, 0.97, 0.26);             // ears
  }
  return P;
}
// The lion pilaster, 1 tall: the lion against its foot, then an eight-sided shaft, a cushion
// capital and its bracket. Facing +z, its back on z = 0.
const cache = new Map(), cached = (k, make) => { k += detail.low ? ':low' : ''; if (!cache.has(k)) cache.set(k, make()); return cache.get(k); };
const lionGeo = () => cached('lion', () => mergeGeometries(lionParts()));
const pilasterGeo = () => cached('pilaster', () => {
  const P = lionParts().map((g) => g.scale(0.5, 0.5, 0.5).translate(0, 0.06, 0));
  P.push(new THREE.BoxGeometry(0.3, 0.06, 0.3).translate(0, 0.03, 0.15), new THREE.CylinderGeometry(0.055, 0.065, 0.36, 8).translate(0, 0.7, 0.09));
  P.push(new THREE.SphereGeometry(1, 8, 4).scale(0.1, 0.045, 0.1).translate(0, 0.885, 0.09), new THREE.BoxGeometry(0.22, 0.035, 0.2).translate(0, 0.93, 0.1), new THREE.BoxGeometry(0.34, 0.05, 0.16).translate(0, 0.975, 0.08));
  return mergeGeometries(P);
});

// An image of the god h high, facing +z on y = 0, in the manner of the kit's carved figures: the
// figure in its pose, the extra arms of a god fanned out behind the shoulders, and whatever tells
// which god it is.
function deity(kind, h, m) {
  const g = new THREE.Group(), u = h / 10;
  const arms = (n, x0 = 0, y0 = 7, up = 0) => { for (let k = 0; k < n; k++) for (const s of [-1, 1]) { const a = -0.5 + (k + up) * (1.5 / n); g.add(mesh(rod([x0 + s * u, y0 * u, -0.3 * u], [x0 + s * (1 + 2.3 * Math.cos(a)) * u, (y0 + 2.3 * Math.sin(a)) * u, 0], 0.26 * u, 0.2 * u), m)); } };
  const small = (hh, pose, x, y = 0) => g.add(at(figure(hh, m, pose), x, y, 0));
  if (kind === 'tandava' || kind === 'sandhya') {
    // The dancer, a knee bent and a foot lifted, eight arms flung out; in the Urdhva Tandava one
    // arm goes straight up.
    g.add(figure(h, m, 'dancer'));
    arms(3, 0.03 * h, 7, 0.5);
    if (kind === 'tandava') g.add(mesh(rod([0.1 * h, 0.7 * h, 0], [0.12 * h, 1.02 * h, 0], 0.25 * u, 0.2 * u), m));
    else g.scale.x = -1;
  } else if (kind === 'dakshinamurti') {
    // Seated on a rock under the banyan, one leg hanging, teaching the sages at his feet.
    g.add(box(0.5 * h, 0.3 * h, 0.3 * h, m), at(figure(0.62 * h, m, 'seated'), 0, 0.3 * h, 0), mesh(rod([0.1 * h, 0.32 * h, 0.12 * h], [0.12 * h, 0.04 * h, 0.16 * h], 0.3 * u, 0.25 * u), m));
    g.add(cyl(0.3 * u, 0.4 * u, 0.95 * h, m, -0.2 * h, 0, -0.06 * h, 6), at(mesh(new THREE.SphereGeometry(0.3 * h, 8, 5).scale(1, 0.32, 0.5), m), 0, 0.98 * h, 0));
    arms(1, 0, 8.2);
    small(0.22 * h, 'seated', -0.3 * h);
    small(0.22 * h, 'seated', 0.3 * h);
  } else if (kind === 'lingodbhava') {
    // Shiva standing in the opened pillar of fire, Brahma and Vishnu, who could find neither its
    // top nor its foot, adoring him either side.
    g.add(cyl(0.2 * h, 0.2 * h, 0.82 * h, m, 0, 0, -0.08 * h, 12), at(mesh(new THREE.SphereGeometry(0.2 * h, 12, 6, 0, Math.PI * 2, 0, H), m), 0, 0.82 * h, -0.08 * h));
    g.add(at(figure(0.6 * h, m, 'standing'), 0, 0.2 * h, 0.1 * h));
    small(0.4 * h, 'chauri', -0.36 * h);
    small(0.4 * h, 'standing', 0.36 * h);
  } else if (kind === 'durga') {
    // Durga, eight-armed, a foot up on her seated lion.
    g.add(at(figure(h, m, 'dancer'), -0.08 * h, 0, 0), at(mesh(lionGeo(), m), 0.2 * h, 0, -0.05 * h));
    g.children[1].scale.setScalar(0.5 * h);
    arms(3, -0.08 * h, 7, 0.5);
  } else if (kind === 'tripurantaka') {
    // The archer who burnt the three cities, striding, the bow at arm's length.
    g.add(figure(h, m, 'dancer'), at(mesh(new THREE.TorusGeometry(0.3 * h, 0.012 * h, 4, 12, Math.PI), m), -0.26 * h, 0.62 * h, 0.04 * h).rotateZ(H));
    arms(2, 0.03 * h, 7, 0.3);
  } else if (kind === 'gangadhara') {
    // A hand raised to hold out the lock of hair that catches the falling Ganga; Parvati beside him.
    g.add(at(figure(h, m, 'chauri'), -0.08 * h, 0, 0));
    arms(1, -0.08 * h, 7, 0.3);
    small(0.62 * h, 'mirror', 0.3 * h);
  } else if (kind === 'bhikshatana') {
    // The naked beggar with his bowl, a dwarf and a deer at his side.
    g.add(figure(h, m, 'standing'));
    arms(1, 0, 7, 0);
    small(0.36 * h, 'chauri', 0.32 * h);
  } else {
    g.add(figure(h, m, 'standing'));
    arms(1, 0, 7, 0.3);
  }
  return g;
}

// Kailasanathar, finer detail. From photographs:
// - the nine shrines open outwards, each round an image some 9 ft high between two lion pilasters;
// - rearing lions sit against the foot of every pilaster: on the shrines, the hall, the fronts of
//   the 58 cells, the two rows of eastern shrines and all round the outside of the court's wall,
//   with a carved panel between each pair;
// - each cell has its own image, Shiva and Parvati seated with Skanda (Somaskanda) on its back
//   wall, here a seated figure in each opening;
// - kudus along the cornices of the vimana's storeys, and small images between its pilasters;
// - guardians in panels on the piers of the hall's front, images in niches down its sides;
// - the Nandi east of the entrance, on a platform among the four lion pillars of his lost mandapa.
function architecture(f) {
  const d = new THREE.Group(), kudus = [], lions = [], S = STONE, low = detail.low;
  // on(x, z, a, lat, out): a point `out` in front of the wall facing a through (x, z), `lat` along it.
  const on = (x, z, a, lat, out) => [x + Math.sin(a) * out + Math.cos(a) * lat, z + Math.cos(a) * out - Math.sin(a) * lat];
  const lionAt = (x, z, a, lat, out, h, y = 0) => { const [px, pz] = on(x, z, a, lat, out); lions.push([px, y, pz, h, h, h, a]); };
  // The images of the nine shrines, each in its dark opening.
  const dark = [];
  for (const [k, a, kind] of IMAGES) {
    const [sx, sz0, w, dp] = SHRINES[k], sz = sz0 + vz, out = (k < 4 || k > 6 ? w : dp) / 2;
    const [px, pz] = on(sx, sz, a, 0, out + 0.02);
    dark.push([px, 0.85, pz, 1.5, 3.05, 0.04, a]);
    const im = at(deity(kind, 2.7, S), ...on(sx, sz, a, 0, out + 0.12).flatMap((v, i) => (i ? [v] : [v, 0.9])));
    im.rotation.y = a;
    d.add(im);
    for (const s of [-1, 1]) lionAt(sx, sz, a, s * 1.02, out, 3.6, 0.35);
  }
  // The hall: three images down each side between lion pilasters, guardians on the piers of its front.
  for (const s of [-1, 1]) {
    for (const lat of [-2.4, 0, 2.4]) {
      const n = at(templeNiche(0.9, 2.2, S, { figure: idol(1.9, S), crown: false }), ...on(0, mz, s * H, lat, mw / 2 + 0.14).flatMap((v, i) => (i ? [v] : [v, 1.3])));
      n.rotation.y = s * H;
      d.add(n);
    }
    for (const lat of [-3.7, -1.2, 1.2, 3.7]) lionAt(0, mz, s * H, lat, mw / 2 + 0.1, 3.4, 1.1);
    d.add(box(1.5, MH - 1.6, 0.5, S, s * 3.75, 1.1, mz + md / 2 + 0.25), at(figure(2.5, S, s < 0 ? 'standing' : 'chauri'), s * 3.75, 1.2, mz + md / 2 + 0.6));
    for (const t of [-1, 1]) lionAt(s * 3.75 + t * 0.62, mz + md / 2, 0, 0, 0.5, 2.6, 1.1);
  }
  // The cells: a dark opening, the seated image in it, and a lion pilaster either side.
  const seat = [];
  for (const [x, z, a] of CELLS) {
    dark.push([...on(x, z, a, 0, 0.96).flatMap((v, i) => (i ? [v] : [v, 0.5])), 1, 2.1, 0.04, a]);
    seat.push([...on(x, z, a, 0, 1.0).flatMap((v, i) => (i ? [v] : [v, 0.6])), 0.75, 1.4, 0.4, a]);
    for (const s of [-1, 1]) lionAt(x, z, a, s * 0.72, 0.95, 2.7);
  }
  d.add(instances(unitBox(), dark, M.recess), instances(figureGeo('seated'), seat, S));
  // The outside of the court's wall and of the front court: a lion pilaster every two metres or so,
  // a carved panel between each pair.
  const panels = [], step = low ? 4.2 : 2.1;
  const wall = (x, z, a, len, skip = 0) => {
    const n = Math.round(len / step);
    for (let k = 0; k <= n; k++) {
      const lat = -len / 2 + k * (len / n);
      if (Math.abs(lat) < skip) continue;
      lionAt(x, z, a, lat, 0.5, 3.1, 0.4);
      if (k < n && Math.abs(lat + len / n / 2) > skip) panels.push([...on(x, z, a, lat + len / n / 2, 0.5).flatMap((v, i) => (i ? [v] : [v, 0.9])), len / n - 0.7, 2.2, 0.06, a]);
    }
  };
  wall(0, cz0, Math.PI, cx * 2);
  for (const s of [-1, 1]) wall(s * cx, (cz0 + fz) / 2, s * H, fz - cz0);
  d.add(instances(unitBox(), panels, frieze(SHADE)));
  // The eastern shrines: Mahendravarman's, lions at its door and its corners; the row of eight,
  // each open to the east between two lions.
  for (const x of [-3.5, -1.1, 1.1, 3.5]) lionAt(x, cz1 + 2.2, 0, 0, 0, 3.6, 0.4);
  for (const x of [-2.6, 2.6]) lionAt(x, cz1 - 2.2, Math.PI, 0, 0, 3.6, 0.4);
  for (const s of [-1, 1]) for (const lat of [-1.3, 1.3]) lionAt(s * 3.8, cz1, s * H, lat, 0, 3.6, 0.4);
  const open = [];
  for (const [x] of ROW) {
    open.push([x, 1, fz + 1.32, 1.1, 2.3, 0.04, 0]);
    d.add(cyl(0.22, 0.26, 0.9, GRANITE, x, 0.95, fz + 0.9, 10));
    for (const s of [-1, 1]) { lionAt(x + s * 0.95, fz + 1.3, 0, 0, 0, 2.9, 0.6); lionAt(x + s * 0.95, fz - 1.3, Math.PI, 0, 0, 2.9, 0.6); }
  }
  d.add(instances(unitBox(), open, M.recess));
  // Kudus on the vimana's storeys, and small images standing between the pilasters of each.
  let y = 6.35, tw = VW - 1;
  const gods = [];
  for (let i = 0; i < 3; i++) {
    const n = Math.floor((tw * 0.6) / 0.9), ky = y + 2.4 * 0.86;
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -tw * 0.3 + (k + 0.5) * ((tw * 0.6) / n), ca = Math.cos(a), sa = Math.sin(a), dist = (tw + 0.8) / 2 + 0.05;
      kudus.push([sa * dist + ca * lat, ky, vz + ca * dist - sa * lat, 0.55, 0.55, 0.55, a]);
      if (!low && k % 2 === 0) gods.push([sa * (tw / 2 + 0.06) + ca * lat, y + 0.25, vz + ca * (tw / 2 + 0.06) - sa * lat, 0.45, 1.25, 0.3, a + Math.PI]);
    }
    y += 2.4;
    tw = (VW - 1) * (1 - (0.55 * (i + 1)) / 4);
  }
  // A row of kudus along the hall's parapet too.
  for (const a of FACES) { const len = Math.abs(Math.sin(a)) > 0.5 ? md + 2.6 : mw; for (let k = 0; k < len / 1.3 - 1; k++) { const [px, pz] = on(0, mz + (Math.abs(Math.sin(a)) > 0.5 ? 1.3 : a ? 0 : 2.6), a, -len / 2 + 1 + k * 1.3, (Math.abs(Math.sin(a)) > 0.5 ? mw : md) / 2 + 0.3); kudus.push([px, MH + 0.3, pz, 0.6, 0.6, 0.6, a]); } }
  d.add(instances(kuduGeo(), kudus, S), figureRow(gods, S, { poses: ['standing', 'seated'] }));
  // Patches of the old white plaster on the cells and the shrines.
  const patch = [];
  CELLS.forEach(([x, z, a], k) => { if (k % 4 === 1) patch.push([...on(x, z, a, k % 8 === 1 ? -0.55 : 0.5, 0.965).flatMap((v, i) => (i ? [v] : [v, 2.45])), 0.7, 0.6, 0.02, a]); });
  d.add(instances(unitBox(), patch, PLASTER));
  // The Nandi on his platform east of the entrance, facing the temple, the four lion pillars that
  // carried his mandapa still standing round him.
  const nz = fz + 9;
  d.add(box(5.4, 0.3, 7, GRANITE, 0, 0, nz), box(5, 1.1, 6.6, S, 0, 0.3, nz), box(2.6, 0.5, 4.4, SHADE, 0, 1.4, nz), at(nandi(S, 0.72), 0, 1.9, nz).rotateY(Math.PI));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { d.add(box(0.5, 3.2, 0.5, S, sx * 2.1, 1.4, nz + sz * 2.9)); lionAt(sx * 2.1, nz + sz * 2.9, sz > 0 ? 0 : Math.PI, 0, 0.25, 3.4, 1.4); }
  d.add(inst(pilasterGeo(), lions, S));
  f.add(mergeByMaterial(d));
}

// The temple on the western edge of Kanchipuram: a lawn round the court, a paved approach from the
// east, coconut palms and neem, the town's tiled houses beyond, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
    g.add(box(260, 0.2, 260, M.grass, 0, -0.25, 0), box(cx * 2 + 16, 0.06, fz - cz0 + 18, mat('#7d9757', 0.95), 0, -0.1, (cz0 + fz) / 2 + 2));
  g.add(box(cx * 2 - 2, 0.05, cz1 - cz0 - 2, M.path, 0, 0, (cz0 + cz1) / 2), box(cx * 2 + 4, 0.05, fz - cz1 + 3, M.path, 0, 0, (fz + cz1) / 2 + 1.5), box(9, 0.06, 20, M.path, 0, 0, fz + 10), box(6, 0.06, 40, M.path, 0, 0, fz + 44));
  g.add(trees([...along(6, [-cx - 30, cz0 - 4], [-cx - 30, cz1 + 6]), ...along(6, [cx + 30, cz0 - 4], [cx + 30, cz1 + 6]), ...scatter(16, [-110, 110, -110, -40], { seed: 3, gap: 10 })], { kind: 'palm', seed: 5 }));
  g.add(trees([...scatter(detail.low ? 6 : 12, [-110, -40, -30, 110], { seed: 6, gap: 12 }), ...scatter(detail.low ? 6 : 12, [40, 110, -30, 110], { seed: 8, gap: 12 })], { kind: 'neem', seed: 7 }));
  g.add(shrubs([...along(6, [-6, fz + 30], [-6, fz + 60]), ...along(6, [6, fz + 30], [6, fz + 60])], { size: 0.9 }));
  if (!detail.low) g.add(townHouses(scatter(30, [-120, 120, 75, 160], { seed: 9, gap: 15 }).map(([x, z], k) => [x, z, 7 + (k % 3), 9, 1 + (k % 2)]), { seed: 4, roof: 'pitched', roofs: ['#9a4a32', '#8a3f2c', '#a65a3c'], tanks: 0.2 }));
  g.add(asiBoard('Kailasanatha Temple, Kanchipuram', 9, fz + 5, -0.3));
}
