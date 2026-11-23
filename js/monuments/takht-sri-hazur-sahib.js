import * as THREE from 'three';
import { M, box, cyl, lathe, at, onFace, FACES, chhatri, onionDome, ribbed } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial, chhajja, railing, jharokha, banglaRoof, petalRing } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { GILT, arcadeStorey, parapetDomes } from '../parts/sikh.js';
import { addDetails } from '../details/takht-sri-hazur-sahib.js';

// The low, broad dome of the Takht: a gilt melon of many ribs in a cup of lotus petals, a ring of
// small gilt domes round its foot, and a tall kalash of several stages. r is the dome's radius;
// stands on y = 0.
function takhtDome(r, G) {
  const g = new THREE.Group(), n = 12;
  g.add(lathe([[r * 0.8, 0], [r * 1.1, r * 0.12], [r * 1.14, r * 0.2], [r * 0.9, r * 0.24], [0, r * 0.24]], G, 32));
  g.add(at(petalRing(r, 16, r * 0.4, r * 0.26, 0.9, G, Math.max(0.05, r * 0.05)), 0, r * 0.2, 0));
  const d = at(ribbed(onionDome(r, G, { crown: false, neck: false }), 20, 0.06), 0, r * 0.22, 0);
  d.scale.y = 0.66;
  g.add(d);
  for (let k = 0; k < n; k++) {
    const a = (k + 0.5) / n * Math.PI * 2, x = Math.cos(a) * r * 1.2, z = Math.sin(a) * r * 1.2;
    g.add(cyl(r * 0.07, r * 0.07, r * 0.12, G, x, 0, z, 8), at(onionDome(r * 0.085, G, { crown: false, neck: false }), x, r * 0.12, z));
  }
  // The kalash: an inverted lotus on the crown, then bulbs and discs diminishing to a point.
  const top = r * 0.22 + r * 1.85 * 0.66 - r * 0.12, s = r * 0.3;
  g.add(at(lathe([[1.5, 0], [1.1, 0.5], [0.45, 0.8], [0.3, 1.3], [0.85, 1.9], [1, 2.5], [0.6, 3.1], [0.25, 3.4], [0.2, 3.9], [0.6, 4.3], [0.66, 4.8], [0.35, 5.3], [0.14, 5.6], [0.12, 6.1], [0.38, 6.5], [0.4, 6.9], [0.1, 7.5], [0.06, 8.3], [0, 8.6]]
    .map(([a, b]) => [a * s * 0.62, b * s * 0.62]), G, 20), 0, top, 0));
  g.userData.top = top + 8.6 * s * 0.62;
  return g;
}

// Takht Sachkhand Sri Hazur Sahib, Nanded, built 1832–1837 for Maharaja Ranjit Singh over the place
// where Guru Gobind Singh died. From photographs (Commons: Hazur Sahib, Nanded, Maharashtra,
// September 2012; Takht Sri Hazur Sahib.jpg; Takhat Sachkhand Shri Hazur Sahib ji.JPG): a square
// block of white marble in two registers, standing on the marble court. The front (+z) has three
// arched doorways in the middle below, with gilt plaques over them, and three panelled jali
// windows above; at each end of the upper floor a bay window of three arches under a curved roof
// juts out on a lotus corbel, over a blind arch below; a gilt inscription runs across above the
// windows. A marble balustrade with inscribed panels at the corners and the middle rails the roof
// terrace; a small arched pavilion under a bangla roof stands at the middle of the front, and at
// each corner a tall open kiosk on an octagonal pedestal, white-domed with a gilt finial. In the
// middle of the terrace the dome room, also of white marble, carries the only gilding of the
// outside: the low ribbed dome, the ring of small domes round its foot, and the tall kalash.
export function buildTakhtSriHazurSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade, G = GILT;
  g.add(f);
  // P: the plinth; W1: the block, square; Ha, Hb: its lower and upper registers; S2, H2: the dome room.
  const P = 0.6, W1 = 22, Ha = 6.4, Hb = 6, H = Ha + Hb, dp = 0.4, S2 = 9.6, H2 = 4.4, bx = 3.3, ex = 8.2;
  f.add(box(W1 + 3, P, W1 + 3, W, 0, 0, 0), box(W1 + 3.4, 0.2, W1 + 3.4, Ws, 0, P - 0.2, 0));
  for (const a of FACES) f.add(onFace(at(steps(a ? 5 : 12, P, 3, W), 0, 0, 0), a, W1 / 2 + 1.5));
  // The block. Front: three doorways and a blind arch at either end; above, three jali windows.
  // The other faces: a doorway in the middle between blind arches, and windows above.
  f.add(box(W1 - 2 * dp, H, W1 - 2 * dp, W, 0, P, 0));
  FACES.forEach((a, k) => {
    const len = k % 2 ? W1 - 2 * dp : W1, cells = [];
    for (const x of [-bx, 0, bx]) cells.push([x, 0.05, 2.1, 3.9, a === 0 || x === 0 ? 'door' : 'none'], [x, Ha + 1.3, 2.1, 3.3, 'jali']);
    for (const x of [-ex, ex]) { cells.push([x, 0.05, 2.9, 4.3, 'none']); if (a) cells.push([x, Ha + 1.3, 2.1, 3.3, 'jali']); }
    f.add(onFace(at(arcadeSkin(len, H, cells, dp, W, { trim: Ws, fill: 'none' }), 0, P, 0), a, W1 / 2 - dp));
    // The string between the registers, the cornice and its eave.
    f.add(onFace(box(W1 + 0.24, 0.3, 0.2, Ws, 0, P + Ha, 0), a, W1 / 2), onFace(at(chhajja(W1 + 1.6, 0.8, 0.25, 0.14, W), 0, P + H, 0), a, W1 / 2));
  });
  // The bay windows at the ends of the front's upper floor.
  for (const s of [-1, 1]) f.add(at(jharokha(4, 2.9, W, { d: 1.4, trim: Ws }), s * ex, P + Ha + 1.4, W1 / 2 + 0.02));
  // The roof terrace: its kerb, the balustrade with solid panels at the corners and the middle of
  // each side, little domed posts along it, and the corner kiosks on their pedestals.
  const T = P + H + 0.35, cw = 3.4, run = (W1 - 2 * cw - 3.2) / 2;
  f.add(box(W1 + 0.5, 0.35, W1 + 0.5, W, 0, P + H, 0));
  for (const a of FACES) {
    for (const s of [-1, 1]) f.add(onFace(at(railing(run, 1.15, 0.16, W, 1.4), 0, T, 0), a, W1 / 2 - 0.05, s * (1.6 + run / 2)), onFace(box(cw, 1.3, 0.3, W, 0, T, 0), a, W1 / 2 - 0.05, s * (W1 - cw) / 2));
    f.add(onFace(box(3.2, 1.3, 0.3, W, 0, T, 0), a, W1 / 2 - 0.05));
  }
  f.add(parapetDomes(W1 + 0.3, T + 1.15, 9, W, 0.22));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (W1 / 2 - 1.7), z = sz * (W1 / 2 - 1.7);
    f.add(cyl(1.35, 1.45, 1.5, W, x, T, z, 8), cyl(1.5, 1.5, 0.14, Ws, x, T + 1.5, z, 8), at(chhatri(1.2, 5, W), x, T + 1.64, z));
  }
  // The pavilion at the middle of the front: three small arches under a bangla roof.
  const pv = new THREE.Group();
  pv.add(box(4.6, 2.5, 1.8, W, 0, 0, -1.2), arcadeSkin(4.6, 2.5, cellRow(3, 1.4, 0.1, 0.95, 1.9), 0.3, W, { trim: Ws, fill: 'room' }), box(5, 0.2, 2.6, W, 0, 2.5, -0.9));
  pv.add(at(banglaRoof(5, 2.6, 1.1, W), 0, 2.75, -2.2));
  f.add(at(pv, 0, T, W1 / 2 - 1.2));
  // The dome room: three arched windows a side, its eave and parapet, a kiosk at each corner.
  f.add(at(arcadeStorey(S2, H2, 3, W, { trim: Ws, fill: 'jali', sill: 1, aw: 1.5, ah: 2.6, dp: 0.3 }), 0, T, 0));
  let y = T + H2;
  for (const a of FACES) f.add(onFace(at(chhajja(S2 + 1.4, 0.7, 0.22, 0.12, W), 0, y, 0), a, S2 / 2));
  f.add(box(S2 + 0.3, 0.6, S2 + 0.3, W, 0, y, 0));
  y += 0.6;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(0.62, 2.5, W), sx * (S2 / 2 - 0.55), y, sz * (S2 / 2 - 0.55)));
  const R = 3.7;
  f.add(cyl(R * 1.22, R * 1.26, 0.5, W, 0, y, 0, 32));
  f.add(at(takhtDome(R, G), 0, y + 0.5, 0));
  mergeByMaterial(f);
  addDetails(f, g, { P, W1, Ha, Hb, bx, ex });
  // From the south-east across the court, the gateway to the right.
  return { group: g, focus: f, view: [0.55, 0.25, 1], zoom: 0.85, batch: true };
}
