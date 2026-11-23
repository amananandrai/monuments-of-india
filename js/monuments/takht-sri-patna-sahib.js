import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, chhatri, inst, unitBox, surface } from '../helpers.js';
import { grandStair } from '../parts/doorways.js';
import { mergeByMaterial, chhajja, railing, jharokha, banglaRoof } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { sikhDome, arcadeStorey, parapetDomes, GILT } from '../parts/sikh.js';
import { addDetails } from '../details/takht-sri-patna-sahib.js';

// The black board over the front, lettered in gold Gurmukhi.
const BOARD = mat('#1c1a18', 0.6), LETTERS = surface(mat('#e3b54a', 0.35, 0.6), 'script');

// A deep eave on stone brackets round a square of side w, its top at y.
function eave(w, y, d, m, every = 1.4) {
  const g = new THREE.Group(), list = [], n = Math.round(w / every);
  for (const a of FACES) {
    g.add(onFace(at(chhajja(w + 2 * d, d, d * 0.3, 0.14, m), 0, y, 0), a, w / 2));
    for (let k = 0; k <= n; k++) {
      const lat = (k / n - 0.5) * (w - 0.3), r = w / 2 + d * 0.3;
      list.push([Math.sin(a) * r + Math.cos(a) * lat, y - d * 0.55, Math.cos(a) * r - Math.sin(a) * lat, 0.16, d * 0.38, d * 0.6, a]);
    }
  }
  g.add(inst(unitBox(), list, m));
  return g;
}

// The domes here are broad and low: the gurdwara dome of the kit, pressed down to three-quarters
// of its height.
function lotusDome(r, m) {
  const d = sikhDome(r, m, { finialM: GILT, ribs: 24 });
  d.scale.set(1, 0.76, 1);
  return d;
}

// Takht Sri Harimandir Ji, Patna Sahib, over the birthplace of Guru Gobind Singh, rebuilt in marble
// in the 1950s after the earthquake of 1934. From photographs (Commons, Harmandir_Patna.jpg, and
// the panorama of the court): a broad white block of two storeys, about 28 m square; at its corners
// towers that rise one storey higher, each under a large ribbed white dome with a ring of tiny
// domes round its foot and a gilt pinnacle; and in the middle a tower of two stages carrying the
// main dome. The ground floor opens in arches with doors under fanlights behind a low marble
// balustrade; across the first floor domed jharokhas on brackets alternate with arched windows;
// above it runs a deep bracketed chhajja, with a black board lettered in gold at the middle of the
// front (+z). On the terrace over the front stands a triple-arched pavilion under a bangla roof,
// and an outside stair climbs the central tower to the level of the dome.
export function buildTakhtSriPatnaSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade;
  g.add(f);
  const P = 1.1, S = 28, H1 = 6, H2 = 5.6, bay = S / 5;
  f.add(box(S + 4, P, S + 4, W, 0, 0, 0), box(S + 4.4, 0.2, S + 4.4, Ws, 0, P - 0.35, 0));
  f.add(at(grandStair(P, 9, W, Ws, { n: 6, landing: 0, cheek: 0.3 }), 0, 0, S / 2 + 2));
  // The low balustrade along the edge of the plinth, open at the steps.
  for (const a of FACES) for (const s of [-1, 1]) f.add(onFace(at(railing(a ? S / 2 + 1.8 : S / 2 - 3, 0.9, 0.16, W, 2.2), 0, P, 0), a, S / 2 + 1.8, s * (a ? S / 4 + 0.9 : S / 4 + 3.15)));
  // The ground floor: five arches a side, each a door under its fanlight.
  f.add(at(arcadeStorey(S, H1, 5, W, { trim: Ws, fill: 'door', sill: 0.05, aw: 2.5, ah: 4.5, dp: 0.5 }), 0, P, 0));
  f.add(box(S + 0.3, 0.3, S + 0.3, Ws, 0, P + H1 - 0.15, 0));
  // The first floor: arched windows, and a domed jharokha before every other one (the middle one
  // of the front the widest).
  let y = P + H1;
  f.add(at(arcadeStorey(S, H2, 5, W, { trim: Ws, fill: 'room', sill: 0.9, aw: 1.9, ah: 3.4, dp: 0.5 }), 0, y, 0));
  for (const a of FACES) for (const k of [-2, 0, 2]) {
    const wide = a === 0 && k === 0;
    f.add(onFace(at(jharokha(wide ? 3.8 : 2.6, 2.4, W, { d: 1, roof: 'dome', trim: Ws }), 0, y + 0.95, 0), a, S / 2 + 0.02, k * bay));
    // Under the plain windows between them, a small balcony front.
    if (k < 2) f.add(onFace(at(railing(2.6, 0.8, 0.12, W, 1.3), 0, y + 0.85, 0), a, S / 2 + 0.25, (k + 1) * bay), onFace(box(2.9, 0.16, 0.5, Ws, 0, y + 0.7, 0), a, S / 2 + 0.2, (k + 1) * bay));
  }
  // Pilasters marking off the corner towers through both floors.
  for (const a of FACES) for (const x of [-S / 2 + 0.3, -1.5 * bay, 1.5 * bay, S / 2 - 0.3]) f.add(onFace(box(0.5, H1 + H2, 0.16, W, 0, P, 0), a, S / 2 + 0.06, x));
  y += H2;
  // The chhajja on its brackets, the board at the middle of the front, and the terrace's parapet.
  f.add(eave(S, y, 1.5, W));
  f.add(box(7.4, 0.95, 0.14, BOARD, 0, y - 0.9, S / 2 + 1.5), box(7, 0.6, 0.04, LETTERS, 0, y - 0.72, S / 2 + 1.58));
  f.add(box(S + 0.2, 0.4, S + 0.2, W, 0, y, 0));
  const T = y + 0.4, tw = 6.8, tc = S / 2 - tw / 2;
  for (const a of FACES) f.add(onFace(at(railing(S - 2 * tw, 0.9, 0.14, W, 1.8), 0, T, 0), a, S / 2 - 0.1));
  // The corner towers: a third storey with a louvred arched window in each face, its own eave, a
  // ring of tiny domes, and the large ribbed dome with a gilt pinnacle.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const t = new THREE.Group(), th = 4.8;
    t.add(arcadeStorey(tw, th, 1, W, { trim: Ws, fill: 'shutters', sill: 1.2, aw: 1.7, ah: 2.8, dp: 0.3 }), eave(tw, th, 1, W, 1.1));
    t.add(box(tw + 0.2, 0.5, tw + 0.2, W, 0, th, 0), parapetDomes(tw + 0.2, th + 0.5, 5, W, 0.27), cyl(3.1, 3.1, 0.9, W, 0, th + 0.5, 0, 24));
    t.add(at(lotusDome(3.5, W), 0, th + 1.4, 0));
    f.add(at(t, sx * tc, T, sz * tc));
  }
  // The pavilion at the middle of the front: three arches under a bangla roof, a small dome at
  // either end of it.
  const pv = new THREE.Group();
  pv.add(box(7, 3.2, 2.2, W, 0, 0, -1.6), arcadeSkin(7, 3.2, cellRow(3, 2.1, 0.1, 1.4, 2.5), 0.5, W, { trim: Ws, fill: 'room' }), box(7.5, 0.25, 3.3, W, 0, 3.2, -1.1));
  pv.add(at(banglaRoof(7.2, 3, 1.3, W), 0, 3.5, -2.6));
  for (const x of [-4.4, 4.4]) pv.add(at(chhatri(0.75, 2.6, W), x, 0, -1));
  f.add(at(pv, 0, T, S / 2 - 1.2));
  // The central tower's lower stage, with its eave, a railed terrace and a kiosk at each corner.
  const s1 = 13.4, h1 = 6, s2 = 10.6, h2 = 4.6;
  f.add(at(arcadeStorey(s1, h1, 3, W, { trim: Ws, fill: 'room', sill: 1.4, aw: 1.8, ah: 3, dp: 0.4 }), 0, T, 0), eave(s1, T + h1, 1.2, W));
  y = T + h1;
  f.add(box(s1 + 0.2, 0.4, s1 + 0.2, W, 0, y, 0));
  for (const a of FACES) f.add(onFace(at(railing(s1 - 2, 0.85, 0.12, W, 1.6), 0, y + 0.4, 0), a, s1 / 2 - 0.05));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(0.8, 3, W), sx * (s1 / 2 - 0.7), y + 0.4, sz * (s1 / 2 - 0.7)));
  // The outside stair up the front of the tower to that terrace, with its railing.
  const run = 9, st = new THREE.Group();
  st.add(box(Math.hypot(run, h1), 0.3, 1.3, W, 0, -0.15, 0), box(Math.hypot(run, h1), 0.9, 0.1, Ws, 0, 0.15, 0.52));
  st.rotation.z = Math.atan2(h1, run);
  f.add(at(st, 0.6, T + h1 / 2 + 0.3, s1 / 2 + 0.75), box(1.6, h1 * 0.5, 1.3, W, run / 2 + 0.2, T, s1 / 2 + 0.75));
  // The upper stage, screened; its eave, a ring of small domes, kiosks at the corners; the drum
  // and the great ribbed dome, white, with its gilt kalash and umbrella.
  f.add(at(arcadeStorey(s2, h2, 3, W, { trim: Ws, fill: 'jali', sill: 0.8, aw: 1.6, ah: 2.8, dp: 0.4 }), 0, y + 0.4, 0));
  y += 0.4 + h2;
  f.add(eave(s2, y, 1.1, W), box(s2 + 0.2, 0.5, s2 + 0.2, W, 0, y, 0), parapetDomes(s2 + 0.2, y + 0.5, 7, W, 0.3));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(0.7, 2.6, W), sx * (s2 / 2 - 0.2), y + 0.5, sz * (s2 / 2 - 0.2)));
  const R = 5.5;
  f.add(cyl(R * 0.93, R * 0.93, 1.5, W, 0, y + 0.5, 0, 32));
  f.add(at(lotusDome(R, W), 0, y + 2, 0));
  mergeByMaterial(f);
  addDetails(f, g, { P, S });
  // From the south-east: the front with its board and jharokhas, the corner domes round the main one.
  return { group: g, focus: f, view: [0.6, 0.2, 1], zoom: 0.85, batch: true };
}
