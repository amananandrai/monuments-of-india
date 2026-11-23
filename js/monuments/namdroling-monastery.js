import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hipRoof, TIBETAN } from '../helpers.js';
import { hall, ganjira, roofCorners, dharmaWheel, quarters, parapetDiscs, gyaltsen } from '../parts/tibetan.js';
import { tibetanPortico } from '../parts/doorways.js';
import { mergeByMaterial, jali, carved } from '../parts/components.js';
import { lion } from '../parts/animals.js';
import { addDetails } from '../details/namdroling-monastery.js';

// Namdroling's colours: the cream of its walls; the red of its pillars and the crimson of its
// doors; the gilded roofs; the blue of Zangdog Palri's storeys and of the gate's reveals; the pink
// of the gate's roofs; the painted ground of the murals.
export const CREAM = mat('#efe6cf', 0.8);
export const RED = mat('#a3291f', 0.6);
export const CRIMSON = mat('#8f1626', 0.55);
export const GILT = mat('#e7b84a', 0.3, 0.6, { emissive: '#3d2a06' });
export const BLUE = mat('#3d62c2', 0.7);
export const PINK = mat('#e8727c', 0.7);
const MURAL = carved(mat('#3f7f8f', 0.8), 'reliefs'), GLASS = mat('#26303a', 0.3, 0.3);

// Namdroling's Golden Temple, the Padmasambhava Buddhist Vihara at Bylakuppe (1999). From
// photographs of its front: a broad cream hall of three storeys, about 46 m wide and 36 deep,
// under a dark maroon parapet band set with gold roundels, gilded victory banners along it; on
// the roof two small pavilions under upturned gilded roofs and, over the middle of the front, the
// Dharma wheel between two kneeling deer. Before it a portico of two storeys: red pillars below,
// murals on the wall either side of the crimson doors, a glazed gallery above between red posts,
// and a broad stair between two snow lions. Inside sit gilded statues of the Buddha,
// Padmasambhava and Amitayus, about 18 m high. To its east stands the Zangdog Palri temple;
// monks' quarters close the court. +z is the front, facing the court.
export const HW = 46, HD = 36, HH = 19;
function goldenTemple() {
  const g = new THREE.Group(), Y = 1.6 + HH;
  g.add(box(HW + 6, 1.6, HD + 6, TIBETAN.white, 0, 0, 0));
  g.add(at(hall(HW, HH, HD, { floors: 3, wall: CREAM, cap: 2.4, door: 0, doorW: 27, y0: 2.2 }), 0, 1.6, 0));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const side = Math.abs(Math.sin(a)) > 0.5, len = side ? HD : HW, dist = (side ? HW : HD) / 2 + 0.16; g.add(at(parapetDiscs(len - 3, 3.4, 0.5, GILT), Math.sin(a) * dist, Y - 1.2, Math.cos(a) * dist).rotateY(a)); }
  for (const x of [-1, -0.36, 0.36, 1]) for (const z of [-1, 1]) g.add(at(gyaltsen(2.8, GILT), x * (HW / 2 - 0.6), Y, z * (HD / 2 - 0.6)));
  // The lantern over the hall, and the two roof pavilions under gilded roofs.
  g.add(box(HW * 0.5, 2.6, HD * 0.5, CREAM, 0, Y, -2), box(HW * 0.5 + 0.4, 0.8, HD * 0.5 + 0.4, TIBETAN.maroon, 0, Y + 2.6, -2));
  for (const s of [-1, 1]) {
    const x = s * 13.5, z = HD / 2 - 6.5;
    g.add(box(7, 3.2, 6, CREAM, x, Y, z), box(7.3, 0.7, 6.3, TIBETAN.maroon, x, Y + 3.2, z), box(4, 1.6, 0.1, GLASS, x, Y + 1, z + 3.02));
    g.add(at(hipRoof(11, 9.5, 2.5, GILT), x, Y + 3.9, z), at(roofCorners(11, 9.5, GILT), x, Y + 3.95, z), at(ganjira(1.8, GILT), x, Y + 6.2, z));
  }
  g.add(at(dharmaWheel(7.4, GILT), 0, Y, HD / 2 - 0.8));
  // The portico: six red pillars carrying a painted beam and a name board, the glazed gallery
  // over them, and a flat roof behind a maroon parapet with gold roundels.
  const P = new THREE.Group(), pw = 27, pd = 7, h1 = 6.4, h2 = 4.6;
  for (const x of [-12.6, -9.2, -3.4, 3.4, 9.2, 12.6]) {
    P.add(box(1, 0.5, 1, TIBETAN.white, x, 0, pd - 0.8), cyl(0.36, 0.42, h1 - 1.3, RED, x, 0.5, pd - 0.8, 10), box(0.9, 0.3, 0.9, BLUE, x, h1 - 0.8, pd - 0.8), box(1.3, 0.5, 1.1, GILT, x, h1 - 0.5, pd - 0.8));
    P.add(box(0.5, h2 - 0.6, 0.5, RED, x, h1 + 1.2, pd - 0.6), box(0.9, 0.4, 0.8, GILT, x, h1 + h2 + 0.2, pd - 0.6));
  }
  P.add(box(pw, 0.5, pd, RED, 0, h1, pd / 2), box(pw + 0.6, 0.7, pd + 0.5, BLUE, 0, h1 + 0.5, pd / 2 + 0.1), box(pw + 1.6, 0.2, pd + 1.1, RED, 0, h1 + 1.2, pd / 2 + 0.3));
  P.add(box(15, 0.9, 0.12, mat('#1f2f6a', 0.6), 0, h1 + 1.5, pd + 0.2), box(13, 0.3, 0.04, GILT, 0, h1 + 1.8, pd + 0.28));
  P.add(box(pw - 1, h2, pd - 1.2, GLASS, 0, h1 + 1.2, pd / 2 - 0.4), box(pw, 0.9, 0.2, CRIMSON, 0, h1 + 1.2, pd - 0.3));
  P.add(box(pw + 0.6, 0.6, pd + 0.5, BLUE, 0, h1 + h2 + 0.6, pd / 2 + 0.1), box(pw + 2.2, 0.25, pd + 1.6, RED, 0, h1 + h2 + 1.2, pd / 2 + 0.5), box(pw + 0.4, 1.2, pd + 0.3, TIBETAN.maroon, 0, h1 + h2 + 1.45, pd / 2), at(parapetDiscs(pw - 2, 3, 0.36, GILT), 0, h1 + h2 + 2.05, pd + 0.16));
  // The wall under it: the crimson doors with their great gold knockers and tasselled ropes, a
  // narrative mural on either side, a smaller door beyond each.
  P.add(box(5.2, 5, 0.3, GILT, 0, 0, 0.05), box(4.6, 4.6, 0.3, CRIMSON, 0, 0, 0.16), box(0.08, 4.6, 0.04, M.stoneDark, 0, 0, 0.32));
  for (const s of [-1, 1]) {
    P.add(at(mesh(new THREE.TorusGeometry(0.42, 0.07, 6, 16), GILT), s * 0.7, 2.5, 0.36), at(mesh(new THREE.SphereGeometry(0.2, 10, 6), GILT), s * 0.7, 2.95, 0.34), cyl(0.05, 0.05, 1.5, GILT, s * 0.7, 0.9, 0.36, 6), cyl(0.12, 0.03, 0.5, RED, s * 0.7, 0.5, 0.36, 8));
    P.add(box(6.2, 4.6, 0.12, GILT, s * 6.6, 0.4, 0.04), box(5.8, 4.2, 0.12, MURAL, s * 6.6, 0.6, 0.08), box(2, 3.4, 0.12, CRIMSON, s * 11.6, 0, 0.06));
  }
  for (let k = 0; k < 8; k++) P.add(box(22, 1.6 * (8 - k) / 8, 0.6, TIBETAN.white, 0, -1.6, pd + 0.3 + k * 0.6));
  for (const s of [-1, 1]) { P.add(box(2, 1.2, 3, TIBETAN.white, s * 12.4, -1.6, pd + 2.4)); const l = lion(1.5, TIBETAN.white); l.position.set(s * 12.4, -0.4, pd + 2.4); l.rotation.y = -Math.PI / 2; P.add(l); }
  g.add(at(P, 0, 1.6, HD / 2));
  return g;
}

// Zangdog Palri, the Copper-coloured Mountain of Padmasambhava (2004): a broad white storey
// under the maroon band, then three diminishing storeys in blue, each under an upturned gilded
// roof with dragon finials at its corners; a great portrait on the front of the first; and
// standing behind the top one a circular rainbow halo, rimmed in blue, green and gold, with
// radiating spokes.
function zangdogPalri() {
  const g = new THREE.Group(), bw = 30, bh = 8;
  g.add(at(hall(bw, bh, bw, { floors: 1, wall: TIBETAN.white, cap: 1.6, door: 0, doorW: 9, y0: 2.2 }), 0, 0, 0), at(tibetanPortico(9, 3, 5.4, [3.2, 3.8]), 0, 0, bw / 2));
  g.add(at(parapetDiscs(bw - 3, 3.6, 0.42, GILT), 0, bh - 0.8, bw / 2 + 0.16));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(gyaltsen(2.2, GILT), sx * (bw / 2 - 0.5), bh, sz * (bw / 2 - 0.5)));
  let y = bh;
  for (const [w, h] of [[17, 6.5], [12.5, 5.5], [8.5, 4.6]]) {
    g.add(box(w + 2.6, 0.5, w + 2.6, GILT, 0, y, 0), box(w, h, w, BLUE, 0, y, 0), box(w + 0.3, 0.8, w + 0.3, RED, 0, y + h - 0.8, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.9, h - 0.8, 0.9, TIBETAN.white, sx * (w / 2 - 0.3), y, sz * (w / 2 - 0.3)));
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const lat of [-w * 0.27, w * 0.27]) {
      const x = Math.sin(a) * (w / 2 + 0.04) + Math.cos(a) * lat, z = Math.cos(a) * (w / 2 + 0.04) - Math.sin(a) * lat;
      g.add(at(box(w * 0.2, h * 0.42, 0.1, GILT, 0, 0, 0), x, y + h * 0.28, z).rotateY(a), at(box(w * 0.15, h * 0.34, 0.14, GLASS, 0, 0, 0), x, y + h * 0.3, z).rotateY(a));
    }
    g.add(at(hipRoof(w + 5.5, w + 5.5, 2.3, GILT), 0, y + h, 0), at(roofCorners(w + 5.5, w + 5.5, GILT), 0, y + h + 0.05, 0));
    y += h + 1.1;
  }
  g.add(at(ganjira(3.2, GILT), 0, y + 0.9, 0));
  // The portrait on the front of the first blue storey, in a gilt frame.
  g.add(box(5, 5.6, 0.16, GILT, 0, bh + 0.6, 8.6), box(4.4, 5, 0.16, mat('#2a3f8a', 0.7), 0, bh + 0.9, 8.66), box(2.6, 2.4, 0.1, mat('#8a2a2a', 0.7), 0, bh + 0.9, 8.78), at(mesh(new THREE.SphereGeometry(0.75, 12, 8), mat('#c99a6b', 0.7)), 0, bh + 4.1, 8.74));
  // The rainbow halo.
  const halo = new THREE.Group(), R = 9.2;
  [[R, '#2f6fb3'], [R - 0.4, '#3f9a5a'], [R - 0.8, '#e2b23a'], [R - 1.2, '#c9482f']].forEach(([r, c]) => halo.add(mesh(new THREE.TorusGeometry(r, 0.22, 6, 56), mat(c, 0.6))));
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, sp = cyl(0.07, 0.07, R - 4.4, GILT, 0, 0, 0, 6); sp.geometry = sp.geometry.clone().translate(0, 3, 0).rotateZ(a); halo.add(sp, at(mesh(new THREE.SphereGeometry(0.28, 8, 6), GILT), -Math.sin(a) * (R - 2.2), Math.cos(a) * (R - 2.2), 0)); }
  g.add(at(halo, 0, y - 2.6, -1.2));
  return g;
}

// A roof of the gate: pink, sloping in on all four sides from w × d at the eaves to w2 × d2 at
// the ridge, h high, with gilt ribs down its long slopes, a gilt eave and ridge.
function ribbedRoof(w, d, w2, d2, h) {
  const g = new THREE.Group(), geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.5) p.setXYZ(i, p.getX(i) * w2 / w, 1, p.getZ(i) * d2 / d);
  geo.scale(w, h, d); geo.computeVertexNormals();
  g.add(mesh(geo, PINK), box(w + 0.3, 0.25, d + 0.3, GILT, 0, -0.2, 0), box(w2 + 0.3, 0.3, d2 + 0.3, GILT, 0, h, 0));
  const run = (d - d2) / 2, len = Math.hypot(run, h), n = Math.max(3, Math.round(w2 / 0.9));
  for (const s of [-1, 1]) for (let k = 0; k <= n; k++) { const r = mesh(new THREE.BoxGeometry(0.16, 0.14, len).rotateX(s * Math.atan2(h, run)), GILT, -w2 / 2 + k * w2 / n, h / 2 + 0.08, s * (d2 / 2 + run / 2)); g.add(r); }
  g.add(at(roofCorners(w, d, GILT), 0, 0, 0));
  return g;
}

// The entrance gate: three bays between red posts painted with white lotus medallions, their
// inner reveals blue; over the middle a board of Tibetan script between two gold wheels, over
// the sides the name boards; painted bracket bands; pink-and-gold ribbed roofs on two levels,
// makara heads at their eave corners, and three gilded stupa finials; gilt filigree gates.
function gate() {
  const g = new THREE.Group(), white = TIBETAN.white, disc = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8).rotateX(Math.PI / 2);
  for (const [x, h] of [[-4.3, 8], [4.3, 8], [-8.2, 5.2], [8.2, 5.2]]) {
    g.add(box(1, h, 1.3, RED, x, 0, 0), box(1.2, 0.4, 1.5, mat('#55585c', 0.9), x, 0, 0));
    for (let y = 1; y < h - 0.3; y += 0.8) for (const s of [-1, 1]) g.add(mesh(disc, white, x, y, s * 0.67));
  }
  for (const s of [-1, 1]) g.add(box(0.5, 7.2, 1.1, BLUE, s * 3.6, 0, 0), box(0.4, 4.4, 1, BLUE, s * 5, 0, 0), box(0.4, 4.4, 1, BLUE, s * 7.5, 0, 0));
  // The middle bay.
  g.add(box(9.6, 1.2, 0.7, CRIMSON, 0, 7.2, 0), box(10.6, 1.5, 2.2, BLUE, 0, 8.4, 0), box(10.9, 0.2, 2.5, GILT, 0, 8.9, 0), box(11, 0.2, 2.6, RED, 0, 9.4, 0), at(ribbedRoof(14.5, 5.4, 8.6, 1.2, 2), 0, 10.1, 0));
  for (const s of [-1, 1]) g.add(box(6.2, 0.36, 0.04, GILT, 0, 7.62, s * 0.37), at(mesh(new THREE.TorusGeometry(0.36, 0.07, 6, 14), GILT), -3.9, 7.8, s * 0.38), at(mesh(new THREE.TorusGeometry(0.36, 0.07, 6, 14), GILT), 3.9, 7.8, s * 0.38));
  g.add(at(ganjira(3, GILT), 0, 12.4, 0), at(ganjira(2.4, GILT), -3.2, 12.4, 0), at(ganjira(2.4, GILT), 3.2, 12.4, 0));
  // The side bays, lower, each with its name board.
  for (const s of [-1, 1]) {
    g.add(box(3.4, 0.8, 0.6, RED, s * 6.25, 4.4, 0), box(4.8, 1.1, 1.9, BLUE, s * 6.5, 5.2, 0), box(5, 0.2, 2.1, GILT, s * 6.5, 5.6, 0), at(ribbedRoof(7, 4.2, 3.4, 1, 1.4), s * 7, 6.5, 0));
    for (const z of [-1, 1]) g.add(box(2.6, 0.34, 0.04, GILT, s * 6.25, 4.63, z * 0.32));
    g.add(at(box(3.5, 3.4, 0.08, jali(GILT), 1.75, 0, 0), s * 3.4, 0.2, 0.3).rotateY(s > 0 ? 1.2 : Math.PI - 1.2));
  }
  return g;
}

export function buildNamdrolingMonastery() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(goldenTemple());
  f.add(at(zangdogPalri(), 52, 0, 6));
  // Monks' quarters: long white blocks on the west and south of the court.
  f.add(quarters([[-50, 0, 10, 14, 10, 60, Math.PI / 2], [-30, 0, 70, 50, 9, 12, 0], [36, 0, 74, 40, 9, 12, 0]], { seed: 5 }));
  // The court: paved, between the temple and its gate.
  f.add(box(110, 0.2, 54, mat('#cfc9bc', 0.9), 0, 0, 46));
  // The gate into the court.
  f.add(mergeByMaterial(at(gate(), 0, 0, 74)));
  addDetails(f, g, { HW, HD, HH });
  // From the court, a little to the east: the portico, the gilded roofs and Zangdog Palri.
  return { group: g, focus: f, view: [0.42, 0.2, 1], zoom: 0.6 };
}
