import * as THREE from 'three';
import { mat, box, mesh, at, onFace, FACES, photo, inst, unitBox, unitSpire } from '../helpers.js';
import { mergeByMaterial, clockFace, gableRoof } from '../parts/components.js';
import { gothicDoor, gothicWindow, headRing, headSlab } from '../parts/colonial.js';
import { addDetails } from '../details/christ-church-shimla.js';

// Christ Church on the Ridge: plastered stone washed a pale cream-yellow all over, buttresses and
// pinnacles included, with only the copings, strings and window mouldings a shade lighter; the
// belfry's louvres brown; the roof of corrugated iron painted a dull red.
export const YELLOW = photo(mat('#efe4b0', 0.86), 'plaster');
export const WHITE = mat('#f7f2df', 0.82);
export const ROOF = mat('#8c3d36', 0.75, 0.15);
const LOUVRE = mat('#5b3626', 0.8), SHADE = mat('#2a2622', 0.9);

// The church's measures, shared with js/details/christ-church-shimla.js. It stands on the Ridge
// with its tower to the open square (+z) at z = FZ and the porch of 1873 before it, PD deep. The
// nave runs back LEN, NW wide, its walls WH high under a low-pitched roof; a chancel, narrower,
// closes the east end. The tower, T square, rises to TH at the foot of its battlements, with
// pinnacles at the corners to about 27.4 m.
export const S = { FZ: 14, LEN: 38, NW: 14, WH: 7.8, T: 6.2, TH: 22.4, PD: 5, PW: 8.4 };

// A buttress w wide against a wall at z = 0, facing +z: stages [[top, projection]…] stepping back
// as they rise, a gabled coping on each set-off, and (with spire) a pyramidal pinnacle on the last.
function buttress(w, stages, spire = 0) {
  const g = new THREE.Group(), k = 0.96 / 0.7071;
  let y0 = 0;
  for (const [top, p] of stages) {
    g.add(box(w, top - y0, p, YELLOW, 0, y0, p / 2), at(gableRoof(w + 0.12, p + 0.08, w * 0.55, WHITE), 0, top, p / 2));
    y0 = top;
  }
  if (spire) {
    const p = stages[stages.length - 1][1], c = at(mesh(unitSpire(), YELLOW), 0, y0 + 0.05, p / 2);
    c.scale.set(w * k, spire, p * k);
    g.add(c, box(w * 0.2, 0.2, w * 0.2, WHITE, 0, y0 + spire - 0.12, p / 2));
  }
  return g;
}

// A square pinnacle: a shaft s square and h high with a moulded collar, under a pyramid `spire` high.
function pinnacle(s, h, spire) {
  const g = new THREE.Group(), k = s / 0.7071;
  g.add(box(s, h, s, YELLOW), box(s + 0.14, 0.14, s + 0.14, WHITE, 0, h - 0.14, 0));
  for (const a of FACES) g.add(onFace(at(gableRoof(s, 0.1, s * 0.6, WHITE), 0, h, 0), a, s / 2 - 0.04));
  const c = at(mesh(unitSpire(), YELLOW), 0, h, 0);
  c.scale.set(k, spire, k);
  g.add(c, box(s * 0.22, 0.22, s * 0.22, WHITE, 0, h + spire - 0.14, 0));
  return g;
}

// A wall panel len × h and t thick (z = 0 to t) pierced by a four-centred (Tudor) arch aw wide and
// ah to its point: tight curves at the springing and flat slopes up to the apex.
function tudorArch(len, h, aw, ah, t, m) {
  const r = aw / 2, c = r * 0.42, sp = ah - r * 0.6, sh = new THREE.Shape();
  sh.moveTo(-len / 2, 0); sh.lineTo(-r, 0);
  for (let k = 0; k <= 6; k++) { const a = Math.PI - (k / 6) * 1.35; sh.lineTo(-r + c + Math.cos(a) * c, sp + Math.sin(a) * c); }
  sh.lineTo(0, ah);
  for (let k = 6; k >= 0; k--) { const a = Math.PI - (k / 6) * 1.35; sh.lineTo(r - c - Math.cos(a) * c, sp + Math.sin(a) * c); }
  sh.lineTo(r, 0); sh.lineTo(len / 2, 0); sh.lineTo(len / 2, h); sh.lineTo(-len / 2, h); sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), m);
}

// Battlements round a rectangle w × d at height y: a low wall and square merlons mw wide.
function battlements(w, d, y, mw, mh, skipBack = false) {
  const g = new THREE.Group(), list = [];
  for (const [a, len, dist] of [[0, w, d / 2], [Math.PI, w, d / 2], [Math.PI / 2, d, w / 2], [-Math.PI / 2, d, w / 2]]) {
    if (skipBack && a === Math.PI) continue;
    const n = Math.max(2, Math.round(len / (mw * 2))) | 1;
    g.add(onFace(box(len, 0.45, 0.3, YELLOW, 0, y, 0), a, dist - 0.15), onFace(box(len + 0.1, 0.1, 0.4, WHITE, 0, y + 0.45, 0), a, dist - 0.15));
    for (let k = 0; k < n; k += 2) {
      const lat = (k + 0.5 - n / 2) * (len / n), r = dist - 0.15;
      list.push([Math.sin(a) * r + Math.cos(a) * lat, y + 0.5, Math.cos(a) * r - Math.sin(a) * lat, len / n, mh, 0.3, a]);
    }
  }
  g.add(inst(unitBox(), list, YELLOW));
  return g;
}

// A belfry light: a lancet w × h filled with brown louvres, under a moulded hood.
function louvreLancet(w, h) {
  const g = new THREE.Group(), sp = h - 0.7 * w;
  g.add(at(headSlab(w, h, 'pointed', SHADE, 0.03), 0, 0, 0.01), at(headSlab(w * 0.9, h - 0.08, 'pointed', LOUVRE, 0.04), 0, 0, 0.03));
  for (let y = 0.2; y < sp + w * 0.3; y += 0.3) g.add(box(w * (y < sp ? 0.9 : 0.6), 0.05, 0.05, SHADE, 0, y, 0.06));
  g.add(headRing(w, h, 'pointed', 0.14, 0.12, YELLOW), headRing(w + 0.28, h + 0.14, 'pointed', 0.08, 0.18, WHITE));
  g.add(box(w + 0.5, 0.12, 0.2, WHITE, 0, -0.12, 0.1));
  return g;
}

// Christ Church, Shimla (1844–1857, the porch 1873, the clock 1860). From photographs (Commons:
// Christ Church - Ridge - Shimla 2014-05-07 0978 and 2014-05-08 1496; Christ Church, Shimla.jpg):
// a long low nave under a red iron roof, its side walls divided by plain buttresses; at the west
// end a tower of four stages with paired angle buttresses that end in tall pyramidal pinnacles
// below the belfry; a two-light window over the porch, a clock in a round moulded panel on each
// face, paired louvred lancets in the belfry, battlements with a raised middle merlon carrying a
// cross, and four square pinnacles. Either side of the tower the nave's west wall has a lancet,
// and its corners carry buttress-pinnacles that rise well above the eaves. Before the tower stands
// the porch: a low block open in wide four-centred arches to the front and sides, battlemented,
// with small pinnacled buttresses at its corners.
export function buildChristChurchShimla() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, WH, T, TH, PD, PW } = S, d = new THREE.Group(), wz = FZ - T, nz = wz - LEN / 2, RH = 4.3;
  // The nave under its low roof, the gables front and back, and the chancel.
  d.add(box(NW, WH, LEN, YELLOW, 0, 0, nz), at(gableRoof(NW + 1, LEN + 0.3, RH + 0.3, ROOF), 0, WH, nz));
  d.add(box(9, WH - 1.4, 7, YELLOW, 0, 0, nz - LEN / 2 - 3.5), at(gableRoof(9.8, 7.4, 3, ROOF), 0, WH - 1.4, nz - LEN / 2 - 3.6));
  for (const z of [nz + LEN / 2 - 0.1, nz - LEN / 2 + 0.1]) d.add(at(gableRoof(NW + 0.3, 0.5, RH + 0.5, YELLOW), 0, WH, z));
  // The side walls: plain buttresses with a sloped coping between two-light lancets; the first
  // bay behind the west wall has a small door under a pointed head instead of a window.
  const bay = (LEN - 1) / 7, win = gothicWindow(1.3, 4.2, { m: YELLOW, trim: WHITE, depth: 0.22 });
  for (const s of [-1, 1]) for (let k = 0; k <= 7; k++) {
    const z = wz - 0.5 - k * bay, tall = k < 2;
    d.add(onFace(buttress(0.9, tall ? [[4.6, 1.15], [WH + 1.6, 0.9]] : [[WH - 0.8, 0.75]], tall ? 3.6 : 0), s * Math.PI / 2, NW / 2, -s * (z + (k ? 0 : -0.05))));
    if (k === 0) d.add(onFace(at(gothicDoor(1.3, 2.9, { m: YELLOW, trim: WHITE, orders: 2, gable: false, pinnacles: false, depth: 0.4 }), 0, 0, 0), s * Math.PI / 2, NW / 2, -s * (z - bay / 2)));
    else if (k < 7) d.add(onFace(at(win.clone(), 0, 2, 0), s * Math.PI / 2, NW / 2, -s * (z - bay / 2)));
  }
  // The west wall either side of the tower: a lancet in each bay, and at each corner a buttress
  // ending in a pinnacle, pairing with the first one of the side wall.
  for (const s of [-1, 1]) {
    d.add(at(buttress(0.9, [[4.6, 1.15], [WH + 1.6, 0.9]], 3.6), s * (NW / 2 - 0.5), 0, wz));
    d.add(at(gothicWindow(1.35, 4, { m: YELLOW, trim: WHITE, depth: 0.22 }), s * (T / 2 + (NW - T) / 4 - 0.3), 2.2, wz));
  }
  // The east window, three lights, at the back of the chancel, and a cross on the east gable.
  d.add(at(gothicWindow(3, 4.4, { m: YELLOW, trim: WHITE, depth: 0.3 }), 0, 1.6, nz - LEN / 2 - 7).rotateY(Math.PI));
  d.add(box(0.2, 1.4, 0.2, WHITE, 0, WH + RH + 0.4, nz - LEN / 2), box(0.8, 0.2, 0.2, WHITE, 0, WH + RH + 1.2, nz - LEN / 2));
  // The tower: the shaft, strings between its stages, and two buttresses at each corner that step
  // back at a gabled set-off and end in tall pyramids at the foot of the belfry.
  const tz = FZ - T / 2;
  d.add(box(T, TH, T, YELLOW, 0, 0, tz));
  for (const y of [12, 17, TH - 0.35]) d.add(box(T + 0.3, 0.28, T + 0.3, WHITE, 0, y, tz));
  for (const a of FACES) for (const s of [-1, 1]) {
    if (a === Math.PI) continue;
    const b = onFace(buttress(1, [[7.4, 1.25], [13.4, 0.85]], 3.2), a, T / 2, s * (T / 2 - 0.5));
    b.position.z += tz;
    d.add(b);
  }
  // The belfry's corners, clasped by slim piers that carry on above the battlements as pinnacles.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (T / 2 - 0.2), z = tz + sz * (T / 2 - 0.2);
    d.add(box(0.85, TH - 17, 0.85, YELLOW, x, 17, z), at(pinnacle(0.85, 2.1, 2.9), x, TH, z));
  }
  // The battlements, the middle merlon of each side raised, and the cross on the front one.
  d.add(at(battlements(T + 0.3, T + 0.3, TH, 0.55, 0.75), 0, 0, tz));
  for (const a of FACES) { const m = onFace(box(1, 1.45, 0.34, YELLOW, 0, TH + 0.5, 0), a, T / 2); m.position.z += tz; d.add(m); }
  d.add(box(0.16, 1.3, 0.12, SHADE, 0, TH + 0.75, FZ + 0.2), box(0.7, 0.16, 0.12, SHADE, 0, TH + 1.45, FZ + 0.2));
  // The door inside the porch, the two-light window over it, and on each face a clock in a round
  // moulded panel and the belfry's pair of louvred lancets.
  d.add(at(gothicDoor(1.9, 3.8, { m: YELLOW, trim: WHITE, orders: 2, gable: false, pinnacles: false }), 0, 0, FZ));
  d.add(at(gothicWindow(1.6, 4.6, { m: YELLOW, trim: WHITE, depth: 0.22 }), 0, 6.3, FZ));
  const bel = louvreLancet(1.05, 3.3), ring = new THREE.TorusGeometry(1.32, 0.13, 8, 40), dish = new THREE.CylinderGeometry(1.3, 1.3, 0.06, 40).rotateX(Math.PI / 2);
  for (const a of FACES) {
    const c = new THREE.Group();
    c.add(mesh(dish, WHITE, 0, 0, 0.03), mesh(ring, WHITE, 0, 0, 0.06), at(clockFace(0.92), 0, 0, 0.07));
    for (const s of [-1, 1]) c.add(at(bel.clone(), s * 0.98, 3.5, 0));
    const p = onFace(at(c, 0, 14.5, 0), a, T / 2 + 0.01);
    p.position.z += tz;
    d.add(p);
  }
  // The porch: four corner piers with pinnacled buttresses, a four-centred arch to the front and
  // to each side, a flat roof behind battlements.
  const pz = FZ + PD / 2, PH = 4.7;
  d.add(at(tudorArch(PW, PH, 4.6, 3.9, 0.6, YELLOW), 0, 0, FZ + PD - 0.6), box(PW - 0.4, 0.3, PD - 0.2, YELLOW, 0, PH - 0.3, pz - 0.1));
  for (const s of [-1, 1]) {
    d.add(at(tudorArch(PD, PH, 3.2, 3.6, 0.6, YELLOW), s * (PW / 2 - 0.6), 0, pz).rotateY(s * Math.PI / 2));
    d.add(at(buttress(0.8, [[2.2, 0.9], [PH + 0.5, 0.6]], 1.5), s * (PW / 2 - 0.4), 0, FZ + PD));
    d.add(onFace(buttress(0.8, [[2.2, 0.9], [PH + 0.5, 0.6]], 1.5), s * Math.PI / 2, PW / 2, -s * (FZ + PD - 0.4)));
  }
  d.add(box(PW + 0.2, 0.2, PD + 0.1, WHITE, 0, PH - 0.05, pz + 0.05), at(battlements(PW, PD, PH + 0.1, 0.45, 0.5, true), 0, 0, pz));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the Ridge, south-west of the tower.
  return { group: g, focus: f, view: [-0.7, 0.2, 1], zoom: 0.85 };
}
