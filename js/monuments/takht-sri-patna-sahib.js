import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, chhatri } from '../helpers.js';
import { grandStair } from '../parts/doorways.js';
import { mergeByMaterial, chhajja } from '../parts/components.js';
import { sikhDome, arcadeStorey, parapetDomes, GILT } from '../parts/sikh.js';
import { addDetails } from '../details/takht-sri-patna-sahib.js';

// Takht Sri Harimandir Ji, Patna Sahib, over the birthplace of Guru Gobind Singh, rebuilt in marble
// in the 1950s after the earthquake of 1934. From photographs: a white building of five storeys,
// each set back from the one below, every storey opening in arches between pilasters under a deep
// eave; small white domes with gilt pinnacles on kiosks at the corners of each terrace; and over the
// sanctum a ribbed white lotus dome with a gilt kalash and umbrella. A broad stair climbs to the
// main door from the marble court in front (+z).
export function buildTakhtSriPatnaSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade;
  g.add(f);
  const P = 2.4;
  f.add(box(34, P, 34, W, 0, 0, 0), box(34.6, 0.3, 34.6, Ws, 0, P - 0.3, 0));
  f.add(at(grandStair(P, 12, W, Ws, { n: 9, landing: 0 }), 0, 0, 17));
  // The storeys: [width, height, arches a face, fill].
  const S = [[28, 5.2, 7, 'room'], [28, 4.6, 7, 'jali'], [22, 4.4, 5, 'room'], [16, 4.2, 4, 'jali'], [11, 3.6, 3, 'jali']];
  let y = P;
  S.forEach(([w, h, n, fill], k) => {
    f.add(at(arcadeStorey(w, h, n, W, { trim: Ws, fill, centre: k === 0 ? 'door' : null, sill: k === 0 ? 0.2 : 0.6, ah: h * 0.74, dp: 0.7 }), 0, y, 0));
    y += h;
    // An eave and a parapet; on a terrace (where the next storey steps in) kiosks at the corners and
    // a row of little domes along its edge.
    for (const a of FACES) f.add(onFace(at(chhajja(w + 0.6, 0.9, 0.4, 0.16, W), 0, y - 0.1, 0), a, w / 2));
    f.add(box(w + 0.6, 0.9, w + 0.6, W, 0, y, 0));
    const next = S[k + 1];
    if (next && next[0] < w) {
      f.add(parapetDomes(w + 0.6, y + 0.9, Math.max(4, Math.round(w / 4)), W, 0.32));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(1.1, 3.4, W), sx * (w / 2 - 0.9), y + 0.9, sz * (w / 2 - 0.9)));
    }
    if (k === 1) for (const a of FACES) f.add(onFace(at(chhatri(0.9, 2.9, W), 0, y + 0.9, 0), a, w / 2 - 0.8, -w / 4), onFace(at(chhatri(0.9, 2.9, W), 0, y + 0.9, 0), a, w / 2 - 0.8, w / 4));
    if (next && next[0] === w) y += 0.9;
  });
  // The drum and the great lotus dome, white, with its gilt finial.
  const R = 5;
  f.add(cyl(R * 0.94, R * 0.94, 2.4, W, 0, y + 0.9, 0, 32));
  f.add(at(sikhDome(R, W, { finialM: GILT }), 0, y + 3.3, 0));
  mergeByMaterial(f);
  addDetails(f, g, { P });
  // From the south-east, up the stair to the main door.
  return { group: g, focus: f, view: [0.6, 0.22, 1], zoom: 0.85, batch: true };
}
