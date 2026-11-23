import * as THREE from 'three';
import { M, V, mat, box, cyl, at, sheet, hemi, mesh, inst, unitBox, archWall, capsule, hipRoof, photo, surface } from '../helpers.js';
import { mergeByMaterial, meiteiRoof } from '../parts/components.js';
import { balustrade } from '../parts/colonial.js';
import { horse } from '../parts/animals.js';
import { heightField, smooth, mountainRing } from '../parts/terrain.js';
import { trees, shrubs, scatter, along, lampPosts, townHouses, boats, bollards } from '../parts/realism.js';
import { blend, carve, mirrorX, flatBase, turn, ellipsoid as E, cone, chain, roundBox, torus, sculpt, statueMaterial } from '../sdf.js';
import { detail } from '../detail.js';
import { LIME, BRICK, BRICK_DARK, G } from '../monuments/kangla-fort.js';

const TIN = mat('#8d2f2a', 0.6, 0.3), SLATE = mat('#6f7a84', 0.6, 0.3), WOOD = mat('#5d3b26', 0.85), ROAD = mat('#6b665c', 0.95);
// The terracotta-coloured plaster of the Uttra's terrace walls and the old Govindajee temple; the
// blue-grey wash of the Uttra hall; the brick paving of the forecourt.
const PLASTER = surface(mat('#c98a66', 0.9), 'none'), PLASTER_DARK = surface(mat('#a96f52', 0.9), 'none'), WASH = surface(mat('#6d7c8c', 0.85), 'none'), DARK = mat('#2b2622', 0.9);
const PAVE = surface(mat('#a8695a', 0.95), 'paving'), BRONZE = mat('#4a3a2c', 0.45, 0.6), HORN = mat('#e9d9d2', 0.7), GILT = M.gold;
const LAWN = M.grass, TURF = mat('#7c9a52', 0.95);

/* ---------- the Kangla Sha ---------- */

// One Kangla Sha as it stands today, in metres, facing +z on y = 0: a barrel of a body on four
// thick legs with broad paws, the chest rising straight into a neck as thick as the body, two
// collars round it, a blunt square head with flat ears, and the jaws open, the upper one lifted.
function shaField() {
  const body = blend([
    [chain([[0, 2.35, -1.35, 0.9], [0, 2.4, 0.2, 0.92]], 0.1), 0],
    [E([0, 2.3, -1.55], [0.92, 0.98, 0.75]), 0.2],
    [chain([[0, 2.45, 0.55, 0.95], [0, 3.4, 0.8, 0.84], [0, 4.15, 0.95, 0.76]], 0.1), 0.25],
    [mirrorX(cone([0.5, 2.1, 0.75], [0.52, 0.45, 0.8], 0.42, 0.37)), 0.15],
    [mirrorX(E([0.52, 0.3, 0.98], [0.45, 0.33, 0.6])), 0.08],
    [mirrorX(cone([0.52, 2.0, -1.5], [0.54, 0.45, -1.45], 0.44, 0.37)), 0.15],
    [mirrorX(E([0.54, 0.3, -1.27], [0.45, 0.33, 0.6])), 0.08],
    [roundBox([0, 4.5, 1.1], [0.6, 0.5, 0.62], 0.3), 0.15],
    [turn(roundBox([0, 4.74, 1.75], [0.44, 0.2, 0.5], 0.14), 'x', -0.55, [0, 4.7, 1.4]), 0.08],
    [roundBox([0, 4.05, 1.75], [0.4, 0.15, 0.5], 0.1), 0.08],
    [mirrorX(E([0.6, 4.5, 0.85], [0.07, 0.3, 0.24])), 0.04],
    [mirrorX(E([0.5, 4.78, 1.42], [0.1, 0.08, 0.16])), 0.04],
    [torus([0, 3.78, 0.88], 0.8, 0.075), 0.03],
    [torus([0, 3.52, 0.83], 0.83, 0.075), 0.03],
  ]);
  const f = carve(body, E([0, 4.42, 2.0], [0.3, 0.2, 0.6]), 0.04);
  return { f: flatBase(f), lo: [-1.15, -0.05, -2.5], hi: [1.15, 5.6, 2.8] };
}
// The figure with what the plaster carries too fine to sculpt: the two forked antlers, the rows of
// teeth and the fangs, and the drops hanging from each collar.
export function standingSha(m) {
  const g = new THREE.Group(), low = detail.low;
  g.add(mesh(sculpt(low ? 'kangla-sha-standing-low' : 'kangla-sha-standing', shaField, { h: low ? 0.11 : 0.065, reach: 0.3, deep: [0.72, 0.71, 0.7] }), statueMaterial(m)));
  const d = new THREE.Group();
  for (const s of [-1, 1]) {
    d.add(capsule(V(s * 0.22, 4.9, 0.85), V(s * 0.5, 5.9, 0.15), 0.07, HORN, 0.03), capsule(V(s * 0.38, 5.42, 0.48), V(s * 0.42, 5.78, 0.72), 0.04, HORN, 0.02));
    // Fangs at the corners of the mouth.
    d.add(capsule(V(s * 0.3, 4.2, 2.14), V(s * 0.3, 4.42, 2.16), 0.05, m, 0.015));
  }
  g.add(mergeByMaterial(d));
  const bits = [];
  for (let k = 0; k < 7; k++) { const z = 1.45 + k * 0.1; for (const s of [-1, 1]) bits.push([s * 0.36, 4.18, z, 0.05, 0.12, 0.06, 0], [s * 0.38, 4.5 + k * 0.058, z + 0.08, 0.05, 0.12, 0.06, 0]); }
  for (const [y, r, cz] of [[3.52, 0.87, 0.86], [3.26, 0.9, 0.81]]) for (let k = 0; k < 36; k++) { const a = (k / 36) * Math.PI * 2; bits.push([Math.sin(a) * r, y, cz + Math.cos(a) * r, 0.07, 0.17, 0.07, a]); }
  g.add(inst(unitBox(), bits, m));
  return g;
}

/* ---------- the buildings ---------- */

// The Uttra: a terrace walled in plastered brick with a rounded coping, a broad stair up its west
// face between cheek walls that splay and end in round drums; on it the Uttra Shanglen as rebuilt,
// a blue-grey hall under red Meitei roofs with the crossed horns (chirong) at the gables, an
// arched porch in front and a lower wing to the south.
function uttra() {
  const g = new THREE.Group(), cz = -32, w = 44, dp = 28, h = 1.9, front = cz + dp / 2;
  g.add(box(w, h - 0.1, dp, BRICK, 0, 0, cz), box(w - 0.2, 0.12, dp - 0.2, PAVE, 0, h - 0.1, cz));
  // The parapet wall round the terrace, battered, with its coping; open at the stair.
  for (const [x, z, ww, dd] of [[0, cz - dp / 2, w + 0.6, 0.9], [-w / 2, cz, 0.9, dp], [w / 2, cz, 0.9, dp], [-(w + 12) / 4, front, (w - 12) / 2 + 0.6, 0.9], [(w + 12) / 4, front, (w - 12) / 2 + 0.6, 0.9]]) {
    g.add(box(ww + 0.3, h, dd + 0.3, PLASTER, x, 0, z), box(ww, 0.9, dd, PLASTER, x, h, z), box(ww + 0.25, 0.22, dd + 0.25, PLASTER_DARK, x, h + 0.9, z));
  }
  // The stair, nine steps 11 m wide, and its cheeks sweeping down and out to drums.
  for (let k = 0; k < 9; k++) g.add(box(11, h - k * (h / 9), 0.42, PLASTER_DARK, 0, 0, front + 0.66 + k * 0.42));
  for (const s of [-1, 1]) {
    for (let k = 0; k < 6; k++) g.add(at(box(0.8, h + 0.9 - k * 0.42, 1.0, PLASTER, 0, 0, 0), s * (6 + k * 0.5), 0, front + 0.9 + k * 0.9));
    g.add(cyl(0.9, 0.95, 0.5, PLASTER, s * 9.2, 0, front + 6.4, 20));
  }
  // The hall.
  const hw = 15, hd = 11, hh = 4.4, hz = cz - 2;
  g.add(box(hw, hh, hd, WASH, 0, h, hz), at(meiteiRoof(hw + 1.6, hd + 1.8, 4.2, TIN, LIME), 0, h + hh, hz));
  g.add(at(archWall(6, 4.2, 3.4, 3.6, 3.5, false, WASH), 0, h, hz + hd / 2 + 1.7), at(meiteiRoof(7, 4.2, 2.4, TIN, LIME), 0, h + 4.2, hz + hd / 2 + 1.7));
  g.add(box(3.4, 3.3, 0.1, DARK, 0, h, hz + hd / 2 + 0.06));
  g.add(box(9, 3.6, 8, WASH, 12, h, hz - 0.5), at(meiteiRoof(9.8, 9, 3, TIN, LIME), 12, h + 3.6, hz - 0.5));
  for (const x of [-5, 5]) g.add(box(1.6, 2, 0.08, LIME, x, h + 1.2, hz + hd / 2 + 0.05));
  return mergeByMaterial(g);
}

// The temple of Pakhangba, the Meitei serpent god: a white square shrine with a door in each
// face on a broad stepped platform inside a white balustrade; over each face the wall corbels out
// in a stack of widening slabs under a spiked parapet, and from the middle rises a ribbed spire
// of shrinking rings, with gilded plumes at its top.
function pakhangba() {
  const g = new THREE.Group(), w = 6.4, h = 5.2;
  g.add(box(26, 0.5, 26, LIME, 0, 0, 0), box(20, 0.5, 20, LIME, 0, 0.5, 0), box(14, 0.5, 14, LIME, 0, 1, 0));
  for (let k = 0; k < 4; k++) {
    const side = new THREE.Group();
    for (const x of [-7.5, 7.5]) side.add(at(balustrade(9, 1, LIME), x, 0.5, 12.6));
    side.add(box(1.5, 2.6, 0.08, WOOD, 0, 1.5, w / 2 + 0.02));
    // The corbelled stack over the face, and the spikes of the parapet above it.
    for (let j = 0; j < 7; j++) side.add(box(w * 0.62 + j * 0.5, 0.42, 1.2 + j * 0.42, LIME, 0, 1.5 + h - 1.2 + j * 0.42, w / 2 - 0.5 + j * 0.21));
    for (let j = -3; j <= 3; j++) side.add(at(mesh(new THREE.ConeGeometry(0.16, 0.7, 5), LIME), j * 0.9, 1.5 + h + 2.1, w / 2 + 1.75));
    for (let j = 0; j < 5; j++) side.add(box(4.2, 0.2, 0.5, LIME, 0, 1.5 - (j + 1) * 0.3 + 0.1, 7 + j * 0.5 + (j > 1 ? 3 : 0) + (j > 3 ? 3 : 0)));
    side.rotation.y = k * Math.PI / 2;
    g.add(side);
  }
  g.add(box(w, h + 1.8, w, LIME, 0, 1.5, 0));
  for (let j = 0; j < 12; j++) g.add(cyl(2.3 - j * 0.17 - 0.12, 2.3 - j * 0.17, 0.42, LIME, 0, 1.5 + h + 1.8 + j * 0.42, 0, 16));
  const top = 1.5 + h + 1.8 + 12 * 0.42;
  g.add(cyl(0.05, 0.25, 1.6, LIME, 0, top, 0, 8));
  for (let j = 0; j < 5; j++) g.add(at(box(0.12, 2.2 - j * 0.15, 0.3, GILT, 0, 0, 0), 0.25 + j * 0.2, top - 1.4 + j * 0.25, 0).rotateZ(-0.12 - j * 0.05));
  return mergeByMaterial(g);
}

// The old temple of Govindajee (1846): a long plastered hall with a flat roof behind a balustrade
// and a taller block over its middle; in front a half-round portico of columns carrying a drum and
// a low dome; and before it the bare brick columns and wall stumps of its roofless mandapa.
function govindajee() {
  const g = new THREE.Group(), w = 30, h = 6;
  g.add(box(w + 2, 0.8, 12, PLASTER_DARK, 0, 0, 0), box(w, h, 9, PLASTER, 0, 0.8, 0), box(w + 0.5, 0.35, 9.5, PLASTER_DARK, 0, 0.8 + h, 0));
  g.add(at(balustrade(w, 0.9, PLASTER), 0, 1.15 + h, 4.5), box(13, 3.2, 7, PLASTER, 0, 1.15 + h, -0.5), box(13.5, 0.3, 7.5, PLASTER_DARK, 0, 4.35 + h, -0.5));
  for (let k = -3; k <= 3; k++) if (k) g.add(box(1.8, 3.4, 0.08, DARK, k * 4, 1.8, 4.52));
  // The portico: six columns on a half round, an entablature, a balustraded drum and the dome.
  const pz = 4.5, r = 4.2;
  g.add(cyl(r + 0.9, r + 1.1, 0.8, PLASTER_DARK, 0, 0, pz, 28));
  for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k / 5) * Math.PI; g.add(cyl(0.34, 0.4, h - 0.6, PLASTER, Math.sin(a) * r, 0.8, pz + Math.cos(a) * r, 14)); }
  g.add(cyl(r + 0.5, r + 0.5, 0.8, PLASTER, 0, 0.2 + h, pz, 32), cyl(r + 0.8, r + 0.8, 0.25, PLASTER_DARK, 0, 1 + h, pz, 32), cyl(r - 0.6, r - 0.6, 1.1, PLASTER, 0, 1.25 + h, pz, 28));
  const dome = at(hemi(r - 0.9, PLASTER, 24), 0, 2.35 + h, pz);
  dome.scale.y = 0.55;
  g.add(dome, box(2.2, 3.6, 0.1, DARK, 0, 0.8, 4.56));
  // The mandapa's ruins: two rows of stout round brick columns with moulded caps, and stumps.
  const cols = [];
  for (const x of [-9, -5.4, -1.8, 1.8, 5.4, 9]) for (const z of [15, 21, 27]) if (!(Math.abs(x) < 3 && z < 20)) cols.push([x, z, 4.2 + ((x * 7 + z * 3) % 5) * 0.25]);
  for (const [x, z, ch] of cols) g.add(cyl(0.62, 0.7, ch, BRICK, x, 0.3, z, 14), cyl(0.85, 0.66, 0.5, BRICK, x, 0.3 + ch, z, 14), cyl(0.9, 0.9, 0.25, BRICK_DARK, x, 0, z, 14));
  g.add(box(24, 0.3, 18, BRICK_DARK, 0, 0, 21), box(0.9, 2.4, 9, BRICK, -12, 0.3, 24), box(0.9, 1.4, 6, BRICK, 12, 0.3, 26), box(8, 1.1, 0.9, BRICK, -7.5, 0.3, 30));
  return mergeByMaterial(g);
}

// The citadel's southern gateway: a half-round porch of four columns on round steps before a door
// in the brick wall, carrying a drum with a balustrade.
function citadelGate() {
  const g = new THREE.Group();
  g.add(box(14, 5.2, 1.4, BRICK, 0, 0, 0), box(2.6, 3.4, 1.5, DARK, 0, 0.6, 0));
  for (let k = 0; k < 3; k++) g.add(cyl(4.6 - k * 0.5, 4.6 - k * 0.5, 0.2, PLASTER_DARK, 0, k * 0.2, 0.7, 28));
  for (let k = 0; k < 4; k++) { const a = -1.15 + (k / 3) * 2.3; g.add(cyl(0.3, 0.36, 4, PLASTER, Math.sin(a) * 3.3, 0.6, 0.7 + Math.cos(a) * 3.3, 12)); }
  g.add(cyl(3.8, 3.8, 0.7, PLASTER, 0, 4.6, 0.7, 28), cyl(4.1, 4.1, 0.2, PLASTER_DARK, 0, 5.3, 0.7, 28), cyl(3.5, 3.5, 0.9, PLASTER, 0, 5.5, 0.7, 28));
  return mergeByMaterial(g);
}

// The Kangla Gate on the west: a tall white arch under a timber gable with the crossed horns,
// between two-storey pavilions with verandas and pyramid roofs; white gate piers before it.
function kanglaGate() {
  const g = new THREE.Group();
  g.add(archWall(9, 9, 6, 5.4, 7.6, false, LIME), box(9.6, 0.4, 6.6, SLATE, 0, 9, 0), at(meiteiRoof(10.5, 7.5, 3.4, SLATE, LIME), 0, 9.4, 0).rotateY(Math.PI / 2));
  for (const s of [-1, 1]) {
    g.add(box(5, 7.4, 5, LIME, s * 7, 0, 0), box(6.4, 0.25, 6.4, SLATE, s * 7, 3.6, 0), at(hipRoof(6.6, 6.6, 2.6, SLATE), s * 7, 7.4, 0));
    for (const [x, z] of [[-3, 3], [3, 3], [-3, -3], [3, -3]]) g.add(cyl(0.12, 0.12, 3.6, LIME, s * 7 + x, 3.85, z, 8));
    for (const x of [3.6, 6.2]) g.add(box(1.1, 2.6, 1.1, LIME, s * x, 0, 9), box(1.3, 0.25, 1.3, SLATE, s * x, 2.6, 9));
  }
  return mergeByMaterial(g);
}

// Meidingu Nara Singh in bronze before the Kangla Gate: the king in a turban on a Manipuri pony,
// a long curved sword raised in his right hand, on a pedestal of dressed stone under a green
// coping, inside a railing.
function naraSingh() {
  const g = new THREE.Group(), y = 3.3, STONE = photo(mat('#b9ab8c', 0.9), 'blocks'), GREEN = mat('#4f7f6a', 0.8);
  g.add(box(7.4, 0.4, 4.4, GREEN, 0, 0, 0), box(6.4, 2.5, 3.4, STONE, 0, 0.4, 0), box(7, 0.4, 4, GREEN, 0, 2.9, 0), box(1, 0.5, 0.05, GILT, 0, 1.4, 1.73));
  const h = horse(BRONZE, { coarse: detail.low });
  h.scale.setScalar(0.52);
  h.rotation.y = Math.PI / 2;
  g.add(at(h, 0, y, 0));
  // The rider (facing +x with the pony): legs astride, the body upright, the sword held up and back.
  const r = new THREE.Group(), P = (x, yy, z) => V(x, y + yy, z);
  r.add(capsule(P(0, 1.55, 0), P(0.05, 2.25, 0), 0.24, BRONZE, 0.2), mesh(new THREE.SphereGeometry(0.15, 12, 10), BRONZE, 0.08, y + 2.6, 0), cyl(0.2, 0.17, 0.16, BRONZE, 0.08, y + 2.68, 0, 12));
  for (const s of [-1, 1]) r.add(capsule(P(0, 1.6, s * 0.2), P(0.3, 1.2, s * 0.36), 0.12, BRONZE, 0.1), capsule(P(0.3, 1.2, s * 0.36), P(0.2, 0.75, s * 0.38), 0.09, BRONZE, 0.07));
  r.add(capsule(P(0.05, 2.2, 0.24), P(0.5, 2.3, 0.3), 0.08, BRONZE, 0.07), capsule(P(0.05, 2.2, -0.24), P(0.35, 1.85, -0.2), 0.08, BRONZE, 0.07));
  r.add(capsule(P(0.5, 2.3, 0.3), P(-0.1, 3.3, 0.3), 0.025, BRONZE, 0.02), capsule(P(-0.1, 3.3, 0.3), P(-0.55, 3.75, 0.3), 0.02, BRONZE, 0.012));
  g.add(mergeByMaterial(r));
  const rail = [];
  for (const [x, z, w, d] of [[0, 3.6, 10.6, 0.05], [0, -3.6, 10.6, 0.05], [5.3, 0, 0.05, 7.2], [-5.3, 0, 0.05, 7.2]]) for (const yy of [0.4, 0.95]) rail.push([x, yy, z, w, 0.05, d, 0]);
  g.add(inst(unitBox(), rail, mat('#2c2f2c', 0.6, 0.4)));
  return g;
}

// Hijagang, the boatyard: a long glazed shed under a tin roof housing the Hiyang Hiren, the royal
// racing boats: long dugout hulls, each with a gilded serpent's head and a sangai's antlers
// rearing at the prow.
function hijagang() {
  const g = new THREE.Group(), L = 46, w = 13, GLASS = mat('#9fb7b8', 0.3, 0.2, { transparent: true, opacity: 0.45 }), HULL = mat('#6a4a2a', 0.8);
  g.add(box(w + 1, 0.4, L + 1, mat('#b7b1a4', 0.9), 0, 0, 0), at(meiteiRoof(w + 1.5, L + 2, 2.8, TIN, TIN), 0, 4.6, 0), box(w, 0.25, L, LIME, 0, 4.4, 0));
  const posts = [];
  for (let k = 0; k <= 10; k++) for (const s of [-1, 1]) posts.push([s * w / 2, 0.4, -L / 2 + k * (L / 10), 0.3, 4, 0.3, 0]);
  g.add(inst(unitBox(), posts, LIME));
  for (const s of [-1, 1]) g.add(box(0.06, 2.6, L, GLASS, s * w / 2, 1.6, 0), box(0.2, 1.2, L, LIME, s * w / 2, 0.4, 0));
  for (const [x, len] of [[-4.2, 30], [-1.4, 38], [1.4, 38], [4.2, 30]]) {
    const hull = mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(0.75, 0.9, len / 2), HULL, x, 1.5, 0);
    g.add(hull, box(1.3, 0.06, len * 0.9, mat('#8a6a43', 0.85), x, 1.44, 0));
    if (Math.abs(x) < 2) {
      g.add(capsule(V(x, 1.3, len / 2 - 1), V(x, 3.3, len / 2 + 0.2), 0.3, GILT, 0.22), capsule(V(x, 3.3, len / 2 + 0.2), V(x, 3.2, len / 2 + 0.9), 0.24, GILT, 0.14));
      for (const s of [-1, 1]) g.add(capsule(V(x + s * 0.12, 3.5, len / 2 + 0.2), V(x + s * 0.5, 4.2, len / 2 - 0.1), 0.04, WOOD, 0.02), capsule(V(x + s * 0.34, 3.9, len / 2 + 0.03), V(x + s * 0.3, 4.2, len / 2 + 0.4), 0.03, WOOD, 0.015));
    }
  }
  return g;
}

/* ---------- the Kangla ---------- */

// A rectangle of ground (x0..x1, z0..z1) with a rectangular hole in it, as four slabs.
function frame(m, x0, x1, z0, z1, hx0, hx1, hz0, hz1, t = 0.9) {
  const g = new THREE.Group(), y = -t;
  g.add(box(x1 - x0, t, hz0 - z0, m, (x0 + x1) / 2, y, (z0 + hz0) / 2), box(x1 - x0, t, z1 - hz1, m, (x0 + x1) / 2, y, (hz1 + z1) / 2));
  g.add(box(hx0 - x0, t, hz1 - hz0, m, (x0 + hx0) / 2, y, (hz0 + hz1) / 2), box(x1 - hx1, t, hz1 - hz0, m, (hx1 + x1) / 2, y, (hz0 + hz1) / 2));
  return g;
}

// The Kangla, with north at -x and west at +z. Round the Kangla Sha and the Uttra lies the citadel,
// walled in brick (1632) inside the inner moat (Manung Thangapat), with the sacred pond (Chingkhei
// Eekon) at its north-east corner, the Pakhangba temple and the old Govindajee temple; the avenue
// runs west over the inner moat to the Kangla Gate and the outer moat, with Nara Singh's statue
// outside it. South-west of the citadel is the polo ground (Manung Kangjeibung), north of it the
// boatyard; the Imphal river and the city lie east, and the hills ring the valley.
export function addDetails(f, g) {
  const S = new THREE.Group(), A = 330, mw = 18, I = { x0: -110, x1: 110, z0: -135, z1: 92, w: 16 }, P = { x0: -100, x1: -70, z0: -124, z1: -102 };
  g.add(at(S, 0, G, 0));
  S.add(uttra());
  // The ground, as slabs between the waters; the land beyond falls gently to the plain.
  const land = new THREE.Group(), o = A + mw / 2, i = A - mw / 2;
  land.add(frame(LAWN, -o - 40, o + 40, -o - 40, o + 40, -o, o, -o, o), frame(LAWN, -i, i, -i, i, I.x0 - I.w, I.x1 + I.w, I.z0 - I.w, I.z1 + I.w), frame(LAWN, I.x0, I.x1, I.z0, I.z1, P.x0, P.x1, P.z0, P.z1));
  S.add(mergeByMaterial(land));
  g.add(heightField(2600, 2600, detail.low ? 90 : 140, (x, z) => { const d = Math.max(Math.abs(x), Math.abs(z)); return d < o + 30 ? G - 1.1 : G - 0.05 - (G + 0.35) * smooth(o + 34, o + 300, d); }, { cover: '#6b8a4c', steep: 0.2 }));
  // The waters: the outer moat, the inner moat and the pond, each below its banks.
  const wy = -0.6;
  for (const [x, z, w, d] of [[0, -A, 2 * o, mw], [0, A, 2 * o, mw], [-A, 0, mw, 2 * i], [A, 0, mw, 2 * i]]) S.add(sheet(w, d, M.water, x, wy, z));
  const cx = (I.x0 + I.x1) / 2, cz = (I.z0 + I.z1) / 2, iw = I.x1 - I.x0 + 2 * I.w, id = I.z1 - I.z0;
  for (const [x, z, w, d] of [[cx, I.z0 - I.w / 2, iw, I.w], [cx, I.z1 + I.w / 2, iw, I.w], [I.x0 - I.w / 2, cz, I.w, id], [I.x1 + I.w / 2, cz, I.w, id]]) S.add(sheet(w, d, M.water, x, wy, z));
  // The pond: its brick sides stepping down to the water, a flight of steps on its west side.
  const pond = [], pw = P.x1 - P.x0, pd = P.z1 - P.z0, px = (P.x0 + P.x1) / 2, pz = (P.z0 + P.z1) / 2;
  for (let k = 0; k < 4; k++) {
    const a = pw - k * 1.6, b = pd - k * 1.6, y = -(k + 1) * 0.3, t = 0.8;
    pond.push([px, y, pz - b / 2 + t / 2, a, 0.3, t, 0], [px, y, pz + b / 2 - t / 2, a, 0.3, t, 0], [px - a / 2 + t / 2, y, pz, t, 0.3, b - 2 * t, 0], [px + a / 2 - t / 2, y, pz, t, 0.3, b - 2 * t, 0]);
  }
  S.add(inst(unitBox(), pond, PLASTER_DARK), sheet(pw - 6, pd - 6, M.lake, px, -1.0, pz));
  // The citadel wall inside the inner moat: low brick, broken by the avenue and the south gateway.
  const wall = [], m = 5;
  for (const [x, z, w, d] of [[cx, I.z0 + m, I.x1 - I.x0 - 2 * m, 1.1], [I.x0 + m, cz, 1.1, id - 2 * m], [I.x1 - m, cz - 60, 1.1, id - 2 * m - 127], [I.x1 - m, cz + 67, 1.1, 86], [-58, I.z1 - m, 94, 1.1], [58, I.z1 - m, 94, 1.1]]) wall.push([x, 0, z, w, 2.6, d, 0], [x, 2.6, z, w + 0.3, 0.25, d + 0.3, 0]);
  S.add(inst(unitBox(), wall, BRICK));
  S.add(at(citadelGate(), I.x1 - m, 0, cz + 17).rotateY(Math.PI / 2));
  // The forecourt's brick paving, the avenue west to the gate over a causeway, with lamps, and
  // the stanchions and chains round each Kangla Sha.
  const p = new THREE.Group();
  p.add(box(48, 0.06, 34, PAVE, 0, 0, -1), box(9, 0.06, A - 16, ROAD, 0, 0, 16 + (A - 16) / 2), box(11, 0.5, I.w + 2, BRICK_DARK, 0, -0.5, I.z1 + I.w / 2), box(11, 0.5, mw + 2, BRICK_DARK, 0, -0.5, A));
  p.add(box(9, 0.06, 50, ROAD, 0, 0, A + 60), box(240, 0.06, 10, ROAD, 0, 0, A + 62));
  S.add(mergeByMaterial(p));
  for (const x of [-8.5, 8.5]) S.add(bollards([[x - 2.6, -3.8], [x + 2.6, -3.8], [x + 2.6, 0], [x + 2.6, 3.8], [x - 2.6, 3.8], [x - 2.6, 0]], { h: 0.9, closed: true, m: LIME }));
  S.add(lampPosts([...along(12, [-6.5, 24], [-6.5, A - 30]), ...along(12, [6.5, 24], [6.5, A - 30])]));
  S.add(shrubs(along(34, [-9, 22], [-9, 84]).concat(along(34, [9, 22], [9, 84])).map(([x, z]) => [x, z, 1.1]), { seed: 3, flowers: '#e8a22b' }));
  // The temples inside the citadel, the gate, the statue outside it and the boatyard.
  S.add(at(pakhangba(), -62, 0, 34), at(govindajee(), 70, 0, -48), at(kanglaGate(), 0, 0, A - 22), at(naraSingh(), 0, 0, A + 40), at(hijagang(), -215, 0, 60));
  // The polo ground: a long mown field inside a low white rail.
  const polo = { x: 215, z: 190, w: 110, d: 210 }, rails = [];
  S.add(box(polo.w, 0.05, polo.d, TURF, polo.x, 0, polo.z));
  for (const s of [-1, 1]) rails.push([polo.x + s * (polo.w / 2 + 2), 0.55, polo.z, 0.08, 0.08, polo.d + 4, 0], [polo.x, 0.55, polo.z + s * (polo.d / 2 + 2), polo.w + 4, 0.08, 0.08, 0]);
  for (let k = 0; k <= 30; k++) for (const s of [-1, 1]) rails.push([polo.x + s * (polo.w / 2 + 2), 0, polo.z - polo.d / 2 - 2 + k * (polo.d + 4) / 30, 0.1, 0.6, 0.1, 0]);
  for (let k = 0; k <= 16; k++) for (const s of [-1, 1]) rails.push([polo.x - polo.w / 2 - 2 + k * (polo.w + 4) / 16, 0, polo.z + s * (polo.d / 2 + 2), 0.1, 0.6, 0.1, 0]);
  for (const s of [-1, 1]) for (const x of [-3.7, 3.7]) rails.push([polo.x + x, 0, polo.z + s * (polo.d / 2 - 4), 0.12, 3, 0.12, 0]);
  S.add(inst(unitBox(), rails, LIME));
  // Trees: the old trees of the Kangla's lawns and groves.
  const avoid = [[-34, 34, -52, A], [-82, -42, 14, 54], [48, 92, -60, -12], [P.x0 - 5, P.x1 + 5, P.z0 - 5, P.z1 + 5], [I.x0 - I.w - 4, I.x0 + 8, I.z0 - I.w - 4, I.z1 + I.w + 4], [I.x1 - 8, I.x1 + I.w + 4, I.z0 - I.w - 4, I.z1 + I.w + 4],
    [I.x0 - I.w, I.x1 + I.w, I.z0 - I.w - 4, I.z0 + 8], [I.x0 - I.w, I.x1 + I.w, I.z1 - 8, I.z1 + I.w + 4], [polo.x - polo.w / 2 - 6, polo.x + polo.w / 2 + 6, polo.z - polo.d / 2 - 6, polo.z + polo.d / 2 + 6], [-228, -202, 30, 90]];
  const spots = scatter(detail.low ? 90 : 220, [-i + 8, i - 8, -i + 8, i - 8], { seed: 5, gap: 12, avoid });
  const kinds = ['peepal', 'banyan', 'mango', 'jamun', 'teak'];
  kinds.forEach((k, j) => S.add(trees(spots.filter((_, n) => n % kinds.length === j), { kind: k, seed: 3 + j })));
  S.add(trees(along(12, [-26, -52], [26, -52]), { kind: 'ashoka', seed: 9 }));
  // The Imphal river east of the Kangla, with boats, and the city round it; the hills of the valley.
  g.add(sheet(2600, 80, M.river, 0, 0.06, -(A + 330)));
  g.add(boats([[60, -(A + 320), 0.1], [-140, -(A + 340), 0.2]], { y: 0.06, size: 1.4 }));
  const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(5), town = [];
  for (let z = -(A + 400); z > -1000; z -= 22) for (let x = -700; x < 700; x += 20) if (R() < (detail.low ? 0.2 : 0.45)) town.push([x, z, 9 + R() * 4, 10 + R() * 3, 1 + Math.floor(R() * 3), Math.PI / 2 * Math.floor(R() * 4)]);
  for (let z = A + 76; z < 800; z += 22) for (let x = -700; x < 700; x += 22) if (R() < (detail.low ? 0.12 : 0.3) && !(Math.abs(x) < 16)) town.push([x, z, 9 + R() * 4, 10 + R() * 3, 1 + Math.floor(R() * 2), Math.PI / 2 * Math.floor(R() * 4)]);
  g.add(townHouses(town, { seed: 4, roof: 'pitched', roofs: ['#8d2f2a', '#2f5d9a', '#3c7a4f', '#7a7f84'], tanks: 0.4, fine: false }));
  g.add(mountainRing({ inner: 1500, outer: 2600, h: 420, size: 6400, cover: '#4a6838' }));
}
