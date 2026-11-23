import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, mat, surface, mesh, box, cyl, at, flag, shikhara, nagaraProfile, inst, unitBox, bell } from '../helpers.js';
import { elephant } from '../parts/animals.js';
import { figureGeo, figureFrieze, kuduGeo, elephantGeo, horseGeo, instances } from '../parts/sculpture.js';
import { frieze, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, stalls, asiBoard, scatter, lampPosts } from '../parts/realism.js';
import { ROCK, ROCK_LIGHT, hillY } from '../monuments/karla-caves.js';
import { detail } from '../detail.js';

const DARK = surface(mat('#1e1a17', 0.95), 'none'), SAFFRON = surface(mat('#e08a2c', 0.8), 'none'), WHITE = surface(mat('#efe9dc', 0.85), 'none'), RED = surface(mat('#b8462e', 0.8), 'none');

const SHADOW = surface(mat('#3b342e', 0.95), 'none');

// The pillars of the nave, at [x, z, side]: a stepped base with a water pot on it, an eight-sided
// shaft, a bell capital, a ribbed stone in a frame and a stepped abacus; on it, towards the nave,
// two kneeling elephants, each carrying a man and a woman; towards the aisle, two horses with
// their riders (on a few of the real ones, tigers). h high on y = 0.2. Instanced; phones keep the
// elephants and leave the riders and the horses off.
export function navePillars(spots, h, m) {
  const g = new THREE.Group(), P = [], y = 0.2, top = y + h - 1.15;
  const L = (pts, seg = 12) => new THREE.LatheGeometry(pts.map(([r, yy]) => new THREE.Vector2(r, yy)), seg);
  for (let k = 0; k < 3; k++) P.push(new THREE.BoxGeometry(1.5 - k * 0.2, 0.2, 1.5 - k * 0.2).translate(0, 0.1 + k * 0.2, 0));
  P.push(L([[0.4, 0], [0.62, 0.15], [0.68, 0.4], [0.55, 0.65], [0.42, 0.75], [0.46, 0.85]]).translate(0, 0.6, 0));
  P.push(new THREE.CylinderGeometry(0.4, 0.43, h - 4.35, 8).translate(0, 1.45 + (h - 4.35) / 2, 0));
  P.push(L([[0.4, 0], [0.48, 0.08], [0.66, 0.35], [0.7, 0.6], [0.5, 0.85], [0.4, 0.9]]).translate(0, h - 2.9, 0));
  P.push(new THREE.BoxGeometry(0.95, 0.5, 0.95).translate(0, h - 1.75, 0));
  for (let k = 0; k < 3; k++) P.push(new THREE.BoxGeometry(1.0 + k * 0.22, 0.12, 1.0 + k * 0.22).translate(0, h - 1.44 + k * 0.12, 0));
  g.add(inst(mergeGeometries(P.map((q) => (q.index ? q.toNonIndexed() : q))), spots.map(([x, z]) => [x, y, z, 1, 1, 1]), m));
  const ele = [], hor = [], men = [], women = [], H = Math.PI / 2;
  for (const [x, z, s] of spots) for (const dz of [-0.36, 0.36]) {
    ele.push([x - s * 0.28, top, z + dz, 0.66, 0.8, 0.95, -s * H]);
    if (detail.low) continue;
    hor.push([x + s * 0.42, top, z + dz, 0.95, 0.72, 0.3, s > 0 ? 0 : Math.PI]);
    (dz < 0 ? men : women).push([x - s * 0.22, top + 0.62, z + dz, 0.26, 0.62, 0.22, -s * H], [x + s * 0.4, top + 0.5, z + dz, 0.26, 0.6, 0.22, s * H]);
  }
  g.add(instances(elephantGeo(), ele, m));
  if (!detail.low) g.add(instances(horseGeo(), hor, m), instances(figureGeo('stucco'), men, m), instances(figureGeo('stuccoArm'), women, m));
  return g;
}

// The four lions of the lion pillar cut in blocks, for phones: the bell, the abacus and four seated
// lions back to back. Sized as lionCapital(m, s) of js/parts/animals.js.
export function blockLions(m, s = 1) {
  const g = new THREE.Group(), E = (rx, ry, rz, x, y, z) => at(mesh(new THREE.SphereGeometry(1, 6, 4).scale(rx, ry, rz), m), x, y, z);
  g.add(mesh(new THREE.LatheGeometry([[0.62, 0], [0.61, 0.08], [0.52, 0.3], [0.4, 0.47], [0.33, 0.55], [0.36, 0.58]].map(([r, y]) => new THREE.Vector2(r, y)), 12), m), cyl(0.6, 0.6, 0.27, m, 0, 0.58, 0, 16));
  for (let k = 0; k < 4; k++) {
    const l = new THREE.Group();
    l.add(E(0.22, 0.3, 0.26, 0, 1.15, 0.2), E(0.2, 0.22, 0.18, 0, 1.55, 0.36), E(0.13, 0.12, 0.13, 0, 1.52, 0.52));
    for (const x of [-0.12, 0.12]) l.add(cyl(0.06, 0.07, 0.6, m, x, 0.85, 0.46, 5));
    l.rotation.y = (k / 4) * Math.PI * 2;
    g.add(l);
  }
  g.scale.setScalar(s);
  return mergeByMaterial(g);
}

// A monastery cave (vihara) cut in the cliff at z = 0, facing +z, its floor on y = 0: a veranda w
// wide and h high behind n stout pillars, the doors of the monks' cells in its back wall, a ledge of
// rock above and a sill below.
function vihara(w, h, n, { doors = 3 } = {}) {
  const g = new THREE.Group(), R = ROCK_LIGHT;
  g.add(box(w, h, 0.06, SHADOW, 0, 0, 0.03), box(w + 0.6, 0.45, 1, ROCK, 0, h, 0.5), box(w + 0.4, 0.35, 1.1, ROCK, 0, -0.35, 0.55));
  for (let k = 0; k < doors; k++) { const x = -w / 2 + (k + 0.5) * (w / doors); g.add(box(0.85, h * 0.62, 0.04, DARK, x, 0.1, 0.07), box(1.15, 0.14, 0.1, R, x, h * 0.62 + 0.1, 0.09)); }
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 1) * (w / (n + 1));
    g.add(cyl(0.3, 0.33, h - 0.75, R, x, 0, 0.7, 8), at(mesh(new THREE.SphereGeometry(0.42, 8, 5).scale(1, 0.6, 1), R), x, h - 0.6, 0.7), box(0.9, 0.3, 0.9, R, x, h - 0.3, 0.7));
  }
  return g;
}

// Karla, finer detail and setting. From photographs: on each side wall of the porch three
// elephants stand in high relief, their heads turned to the court, carrying on their backs a
// gallery carved with rows of little chaitya windows and railings; the three doorways of the
// screen open under horseshoe hoods, and between them, in panel after panel, stand couples
// (mithunas), men and women larger than life, the donors' own likenesses; over them the Buddhas
// cut into the wall some centuries later, seated between attendants; the rock of the outer screen
// is pocked with the mortises of its lost timber; the court is closed on the right by the shrine
// of Ekvira, painted saffron and white, with bells and flags; the monastery caves open in the
// cliff either side, pillared verandas and rows of cell doors on two and three levels; and the
// long stair from the village climbs the hillside, lined with stalls selling flowers and
// offerings, through scrub forest. Dimensions follow js/monuments/karla-caves.js: the porch vw
// wide, vh high, vd deep, the screen at z = sz.
export function addDetails(f, g, { vw, vh, vd, sz }) {
  // The elephants on the porch's side walls, facing across it.
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const e = elephant(ROCK_LIGHT, 0.5, { coarse: true });
    e.position.set(s * (vw / 2 - 0.4), 0.4, -1.75 - k * 1.25);
    e.rotation.y = -s * Math.PI / 2;
    f.add(e);
  }
  // Over the elephants: a ledge, then rows of little chaitya windows and railing friezes up the
  // side walls and across the face over the porch.
  const d = new THREE.Group(), kudus = [];
  for (const s of [-1, 1]) {
    d.add(box(0.5, 0.4, vd - 1.4, ROCK_LIGHT, s * (vw / 2 - 0.25), 2.6, -vd / 2 - 0.7));
    for (let r = 0; r < 4; r++) {
      const y = 4.2 + r * 3.2;
      d.add(at(box(0.08, 0.7, vd - 1.6, frieze(ROCK_LIGHT), 0, 0, 0), s * (vw / 2 - 0.04), y - 0.9, -vd / 2 - 0.7));
      for (let k = 0; k < 3; k++) kudus.push([s * (vw / 2 - 0.05), y, -2 - k * 1.1, 0.8, 1.1, 0.8, -s * Math.PI / 2]);
    }
  }
  for (let r = 0; r < 3; r++) {
    const y = vh + 1.5 + r * 3.2;
    d.add(box(vw + 6, 0.6, 0.3, frieze(ROCK_LIGHT), 0, y - 0.9, 0.15));
    for (let k = 0; k < 9; k++) kudus.push([-((vw + 4) / 2) + (k + 0.5) * ((vw + 4) / 9), y, 0.1, 1.1, 1.4, 1, 0]);
  }
  d.add(instances(kuduGeo(), kudus, ROCK_LIGHT));
  // The mortises in the rock of the outer screen, and a railing band under its dwarf columns.
  const holes = [];
  for (const [y, n] of [[7.6, 9], [8.9, 12], [14.6, 14]]) for (let k = 0; k < n; k++) holes.push([-vw / 2 + (k + 0.5) * (vw / n), y, 0.005, 0.32, 0.3, 0.02]);
  d.add(inst(unitBox(), holes, DARK), box(vw, 0.3, 0.06, frieze(ROCK_LIGHT), 0, 9.92, 0.11));
  // The screen wall. The hoods over the three doorways: a horseshoe arch on the wall, an ogee
  // point at its crown.
  const zs = sz + 0.5;
  for (const [x, w, h] of [[0, 2.6, 4.4], [-5, 1.6, 3.6], [5, 1.6, 3.6]]) {
    d.add(at(mesh(new THREE.TorusGeometry(w * 0.62, 0.16, 5, 14, Math.PI), ROCK_LIGHT), x, h - w * 0.2, zs + 0.05), box(0.22, 0.5, 0.2, ROCK_LIGHT, x, h + w * 0.42, zs + 0.1));
    for (const t of [-1, 1]) d.add(box(0.2, h - w * 0.2, 0.22, ROCK_LIGHT, x + t * w * 0.62, 0.4, zs + 0.1));
  }
  // The couples between the doorways, each pair in its own sunk panel, a railing course at their
  // feet; and over them the later panels of the Buddha seated between two attendants.
  const cell = [], men = [], women = [], sit = [], att = [];
  for (const s of [-1, 1]) for (const x of [2.3, 3.55, 6.85]) {
    cell.push([s * x, 0.95, zs + 0.005, 1.1, 2.5, 0.03]);
    men.push([s * x - 0.26, 1, zs + 0.03, 0.52, 2.3, 0.36]);
    women.push([s * x + 0.26, 1, zs + 0.03, 0.5, 2.2, 0.36]);
    if (x > 3 && !(s < 0 && x > 6)) {
      cell.push([s * x, 3.75, zs + 0.005, 1.5, 1.2, 0.03]);
      sit.push([s * x, 3.8, zs + 0.03, 0.62, 1.05, 0.34]);
      for (const t of [-1, 1]) att.push([s * x + t * 0.55, 3.8, zs + 0.03, 0.28, 1, 0.2]);
    }
  }
  d.add(inst(unitBox(), cell, SHADOW), instances(figureGeo('standing'), men, ROCK_LIGHT), instances(figureGeo('mirror'), women, ROCK_LIGHT), instances(figureGeo('seated'), sit, ROCK_LIGHT), instances(figureGeo('chauri'), att, ROCK_LIGHT));
  d.add(box(vw - 0.8, 0.5, 0.12, frieze(ROCK_LIGHT), 0, 0.42, zs + 0.06));
  // A frieze of seated Buddhas over the doorways, under the gallery.
  d.add(at(figureFrieze(vw - 2, 1, ROCK_LIGHT, { kinds: ['seated'], pitch: 1.2 }), 0, 5.2, zs));
  // The other caves, mostly viharas, in the cliff either side: on the left a veranda at the level of
  // the court and a larger one, on four stout pillars, two storeys up; on the right two more over
  // the roof of Ekvira's shrine; and single cells between, each a door and a small window.
  for (const [x, y, w, h, n, doors] of [[-16.2, 0.5, 6.5, 2.7, 2, 3], [-15.2, 9.2, 8.5, 2.7, 4, 4], [-17, 16, 5, 2.3, 1, 2], [15.6, 6, 6, 2.5, 2, 3], [15, 12.4, 8, 2.6, 1, 3]]) d.add(at(vihara(w, h, n, { doors }), x, y, 0.01));
  const cv = [], sills = [];
  for (const [x, y] of [[-10.6, 5.2], [-20.6, 5], [-9.8, 14.5], [10.2, 9.5], [20.4, 17.5], [10.4, 17]]) { cv.push([x, y, 0.02, 0.9, 1.8, 0.05, 0], [x + 1.2, y + 0.9, 0.02, 0.5, 0.5, 0.05, 0]); sills.push([x + 0.3, y - 0.3, 0.3, 2.6, 0.3, 0.6, 0]); }
  d.add(inst(unitBox(), cv, DARK), inst(unitBox(), sills, ROCK_LIGHT));
  f.add(mergeByMaterial(d));
  // The Ekvira shrine, on the right of the court: a whitewashed shrine under a saffron spire, a
  // pillared porch, flags and a row of bells.
  const ek = new THREE.Group();
  ek.add(box(7, 4.2, 7, WHITE, 0, 0, 0), box(7.6, 0.4, 7.6, RED, 0, 4.2, 0));
  const sp = shikhara(6, 8, SAFFRON, nagaraProfile, 12, M.gold);
  ek.add(at(sp, 0, 4.6, 0), at(flag(3, M.flagSaffron), 0, 4.6 + sp.userData.top - 0.3, 0));
  ek.add(box(6, 0.3, 5, RED, 0, 3.4, 5.6));
  for (const x of [-2.6, 2.6]) for (const z of [3.8, 7.6]) ek.add(cyl(0.18, 0.18, 3.4, WHITE, x, 0, z, 8));
  for (let k = 0; k < 6; k++) ek.add(at(bell(0.18, M.gold), -1.8 + k * 0.72, 2.6, 7.7));
  f.add(at(ek, vw / 2 + 7, 0, 7).rotateY(-0.25));
  // The stair from the village, down the hillside, and the stalls along it.
  const st = [], stallSpots = [];
  for (let k = 0; k < 90; k++) {
    const z = 25 + k * 1.5, x = 8 + Math.sin(k * 0.06) * 10, y = hillY(x, z);
    st.push([x, y - 0.5, z, 3.6, 0.8, 1.7, 0]);
    if (k % 6 === 3 && k > 8) stallSpots.push([x + 3.5, z, -Math.PI / 2, y]);
  }
  g.add(inst(unitBox(), st, ROCK_LIGHT));
  for (const [x, z, ry, y] of stallSpots) g.add(stalls([[x, z, ry]], { y: y - 0.2 }));
  g.add(lampPosts([[-12, 22], [12, 22]]));
  g.add(asiBoard('Karla Caves', 4, 20, -0.4));
  // Scrub forest on the hill: teak, mango and jamun, thick in the monsoon.
  const slope = scatter(140, [-400, 400, -260, 300], { seed: 3, gap: 12 }).filter(([x, z]) => !(Math.abs(x) < 46 && z > -60 && z < 26) && Math.abs(x - 8 - Math.sin((z - 25) / 1.5 * 0.06) * 10) > 7);
  const kinds = ['teak', 'mango', 'jamun'];
  for (let i = 0; i < 3; i++) g.add(trees(slope.filter((_, k) => k % 3 === i).map(([x, z]) => [x, z, null, hillY(x, z)]), { kind: kinds[i], seed: 3 + i }));
  g.add(shrubs(scatter(80, [-200, 200, -150, 200], { seed: 8, gap: 6 }).filter(([x, z]) => !(Math.abs(x) < 46 && z > -60 && z < 26)).map(([x, z]) => [x, z, null, hillY(x, z)])));
}
