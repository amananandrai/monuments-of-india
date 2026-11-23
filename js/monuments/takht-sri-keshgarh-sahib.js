import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, chhatri, surface } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial, chhajja, chhajjaRing, railing, railingRing, banglaRoof, cuspedArchGeo, windowFrame } from '../parts/components.js';
import { sikhDome, arcadeStorey, parapetDomes, GILT } from '../parts/sikh.js';
import { addDetails, TOP } from '../details/takht-sri-keshgarh-sahib.js';

// The dark red-brown painted inside the cusped arches, and the glass of the gilt kiosk.
const RED = surface(mat('#6f3526', 0.85), 'none'), GLASS = mat('#33464d', 0.25, 0.4);

// A run of n cusped arches on slim pillars, len long and h high along x, the front of an open
// veranda or pavilion; ah is the depth of the arched panel hanging from its head.
function cuspedRow(len, h, n, m, ah = h * 0.36) {
  const g = new THREE.Group(), p = len / n, geo = cuspedArchGeo(p - 0.24, ah, 0.24);
  for (let k = 0; k < n; k++) g.add(mesh(geo, m, (k + 0.5) * p - len / 2, h, 0));
  for (let k = 0; k <= n; k++) g.add(cyl(0.12, 0.14, h - 0.24, m, k * p - len / 2, 0.24, 0, 10), box(0.36, 0.24, 0.36, m, k * p - len / 2, 0, 0));
  return g;
}

// Takht Sri Keshgarh Sahib, Anandpur Sahib, where Guru Gobind Singh founded the Khalsa in 1699; the
// present building is of 1936–1944. From photographs (Commons, "1 Sri Kesgarh Takhat Anandpur
// Sahib…" from the court in front, and "Takht Sri Kesgarh Sahib.JPG" from the town below): a plain
// white block of two storeys with a bastion-like tower at each front corner, the towers plain but
// for small windows and each topped by an open pavilion of cusped arches under a large ribbed white
// dome with a gilt finial. A bracketed balcony with a marble balustrade runs round at first-floor
// level and round the towers; between the towers the ground floor is a veranda of seven cusped
// arches, their recesses painted dark red-brown, with a glazed gilt kiosk like a palki on the
// balcony over it. On the roof between the towers stands a five-arched baradari under a curved
// roof with small domes, and behind it the tower over the sanctum with the main dome. Broad stairs
// climb on either side of the shrine to the higher court behind. The hilltop is TOP high (+z front).
export function buildTakhtSriKeshgarhSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade;
  g.add(f);
  f.position.y = TOP;
  // The block: BW wide and BD deep, the ground floor G high and the first floor F; the towers TR
  // in radius at the front corners.
  const BW = 20, BD = 22, G = 4.2, F = 6, R0 = G + F, ZF = BD / 2, TR = 3.2, TX = BW / 2;
  f.add(box(BW, R0, BD, W, 0, 0, 0), box(BW + 0.3, 0.3, BD + 0.3, Ws, 0, R0 - 0.5, 0));
  // The first-floor balcony on its brackets, with a balustrade along the sides.
  f.add(box(BW + 2.6, 0.22, BD + 2.6, W, 0, G - 0.22, 0), box(BW + 1.4, 0.3, BD + 1.4, Ws, 0, G - 0.52, 0));
  for (const s of [-1, 1]) f.add(at(railing(BD - 4, 0.95, 0.14, W, 1.8), s * (BW / 2 + 1.2), G, -2).rotateY(Math.PI / 2));
  // Small windows in the plain side walls, and the door onto the front balcony.
  for (const s of [-1, 1]) for (const z of [-6, 0, 5]) f.add(onFace(at(windowFrame(1, 1.5, W, { shape: 'flat' }), 0, G + 2, 0), s * Math.PI / 2, BW / 2 + 0.01, s * z), onFace(at(windowFrame(1, 1.4, W, { shape: 'flat' }), 0, 1.6, 0), s * Math.PI / 2, BW / 2 + 0.01, s * z));
  f.add(at(windowFrame(1.7, 2.6, Ws, { shape: 'flat' }), -2.4, G + 0.05, ZF + 0.01));
  for (const x of [-5, 4.6]) f.add(at(windowFrame(0.9, 1.4, W, { shape: 'flat' }), x, G + 1.6, ZF + 0.01));
  // The veranda between the towers: seven cusped arches, the wall behind them dark red-brown.
  const VW = BW - 2 * TR, VD = 3.3;
  f.add(at(cuspedRow(VW, G - 0.5, 7, W), 0, 0, ZF + VD - 0.2), box(VW, G - 0.5, 0.1, RED, 0, 0, ZF + 0.05));
  f.add(box(VW + 0.4, 0.5, VD + 0.2, W, 0, G - 0.5, ZF + VD / 2), at(railing(VW, 0.95, 0.14, W, 1.9), 0, G, ZF + VD - 0.1));
  // The gilt kiosk on the balcony over the veranda: glazed all round, under a small gilt dome.
  const k = new THREE.Group();
  k.add(box(2.5, 0.3, 2.5, GILT), box(2, 2, 2, GLASS, 0, 0.3, 0), box(2.7, 0.14, 2.7, GILT, 0, 2.3, 0), at(sikhDome(0.75, GILT, { petals: false }), 0, 2.44, 0));
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 0, 1]) if (sx || sz) k.add(box(0.12, 2, 0.12, GILT, sx * 1, 0.3, sz * 1));
  f.add(at(k, 2.6, G, ZF + 1.5));
  // The two towers: plain eight-sided shafts with small windows and a round light, the balcony
  // carried round them at each floor, and on top the open pavilion under its ribbed dome.
  for (const s of [-1, 1]) {
    const t = new THREE.Group(), pw = 4.6, ph = 3.4;
    t.add(cyl(TR, TR, R0, W, 0, 0, 0, 8).rotateY(Math.PI / 8), cyl(TR + 0.15, TR + 0.25, 0.5, Ws, 0, 0, 0, 8).rotateY(Math.PI / 8));
    for (const y of [G, R0]) t.add(cyl(TR + 1.1, TR + 0.2, 0.5, W, 0, y - 0.5, 0, 24), at(railingRing(TR + 1, 0.95, W), 0, y, 0));
    for (const a of [0, s * Math.PI / 4, s * Math.PI / 2]) t.add(onFace(at(windowFrame(0.9, 1.3, W, { shape: 'flat' }), 0, G + 1.7, 0), a, TR * Math.cos(Math.PI / 8) + 0.01), onFace(at(windowFrame(0.8, 1.1, W, { shape: 'flat' }), 0, 1.6, 0), a, TR * Math.cos(Math.PI / 8) + 0.01));
    t.add(at(mesh(new THREE.CircleGeometry(0.4, 16), M.recess), 0, G + 4.3, TR * Math.cos(Math.PI / 8) + 0.02));
    // The pavilion: two cusped arches a side, red-brown within, a ring eave, and the dome.
    t.add(box(pw - 1, ph, pw - 1, RED, 0, R0, 0), box(pw + 0.3, 0.4, pw + 0.3, W, 0, R0 + ph, 0));
    for (const a of FACES) t.add(onFace(at(cuspedRow(pw, ph, 2, W, 1.3), 0, R0, 0), a, pw / 2 - 0.12));
    t.add(chhajjaRing(pw * 0.62, pw * 0.62 + 1, R0 + ph + 0.4, 0.4, 0.1, W, 32), cyl(2.3, 2.5, 0.8, W, 0, R0 + ph + 0.4, 0, 24));
    t.add(at(sikhDome(2.5, W, { finialM: GILT }), 0, R0 + ph + 1.2, 0));
    f.add(at(t, s * TX, 0, ZF));
  }
  // The roof's parapet, kiosks at the back corners, and the baradari over the front: five cusped
  // arches under a curved roof, a small dome at either end and on its crown.
  f.add(at(railing(BW, 0.9, 0.14, W, 1.8), 0, R0, -BD / 2 + 0.1));
  for (const s of [-1, 1]) f.add(at(railing(BD - TR - 1.2, 0.9, 0.14, W, 1.8), s * (BW / 2 - 0.1), R0, -(TR + 1.2) / 2).rotateY(Math.PI / 2));
  for (const s of [-1, 1]) f.add(at(chhatri(1.2, 3.8, W), s * (BW / 2 - 1.3), R0, -BD / 2 + 1.3));
  const b = new THREE.Group(), bw = 10.5, bh = 3;
  b.add(at(cuspedRow(bw, bh, 5, W, 1.15), 0, 0, 1.2), at(cuspedRow(bw, bh, 5, W, 1.15), 0, 0, -1.2), box(bw - 0.6, bh, 0.1, RED, 0, 0, -1.25), box(bw + 0.3, 0.3, 2.9, W, 0, bh, 0));
  b.add(at(banglaRoof(bw + 0.8, 3.6, 1.1, W), 0, bh + 0.4, -1.8), at(sikhDome(0.55, W, { petals: false, finialM: GILT }), 0, bh + 1.3, 0));
  for (const s of [-1, 1]) b.add(cyl(0.6, 0.6, 0.9, W, s * (bw / 2 + 1), 0, 0, 12), at(sikhDome(0.6, W, { petals: false, finialM: GILT }), s * (bw / 2 + 1), 0.9, 0));
  f.add(at(b, 0, R0, ZF - 2));
  // The tower over the sanctum: a screened storey with an eave, small domes along its parapet and
  // kiosks at its corners, and the main dome on its drum, white, with a tall gilt kalash.
  const tw = 10, th = 4.6, tz = -2.5, y = R0 + th;
  f.add(at(arcadeStorey(tw, th, 3, W, { trim: Ws, fill: 'jali', sill: 0.6, ah: 3.2, dp: 0.5 }), 0, R0, tz));
  const top = new THREE.Group();
  for (const a of FACES) top.add(onFace(at(chhajja(tw + 1.6, 0.9, 0.4, 0.14, W), 0, y, 0), a, tw / 2));
  top.add(box(tw + 0.4, 0.7, tw + 0.4, W, 0, y, 0), parapetDomes(tw + 0.4, y + 0.7, 5, W, 0.3), cyl(3.5, 3.5, 1.6, W, 0, y + 0.7, 0, 32), at(sikhDome(3.7, W, { finialM: GILT }), 0, y + 2.3, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) top.add(at(chhatri(1, 3.4, W), sx * (tw / 2 - 0.5), y + 0.7, sz * (tw / 2 - 0.5)));
  f.add(at(top, 0, 0, tz));
  // The court behind stands a storey higher: its floor meets the balcony, and a broad stair climbs
  // to it on either side of the shrine.
  f.add(box(52, G - 0.25, 24, W, 0, 0, -12), box(52.4, 0.25, 24.4, Ws, 0, G - 0.75, -12));
  for (const s of [-1, 1]) {
    f.add(at(steps(10, G - 0.25, 16, W, 0.5), s * 17.5, 0, 0));
    for (const e of [-1, 1]) f.add(at(railing(8.5, 0.9, 0.14, W, 2.1), s * 17.5 + e * 5, G / 2 - 0.2, 4).rotateY(Math.PI / 2).rotateZ(Math.atan2(G - 0.25, 8)));
    f.add(at(railing(11, 0.9, 0.14, W, 1.8), s * 17.5 + s * 5, G - 0.25, -5.6).rotateY(Math.PI / 2));
  }
  mergeByMaterial(f);
  addDetails(f, g, {});
  // From the south-east, across the court: the veranda between the two domed towers.
  return { group: g, focus: f, view: [0.4, 0.16, 1], zoom: 0.8, batch: true };
}
