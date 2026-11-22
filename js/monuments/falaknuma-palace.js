import * as THREE from 'three';
import { M, mat, photo, box, cyl, lathe, at, finial } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { porch, classicalDoor, balustrade } from '../parts/colonial.js';
import { mergeByMaterial } from '../parts/components.js';
import { grandStair } from '../parts/doorways.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/falaknuma-palace.js';

// Falaknuma's Italian marble and white plaster, and a grey-white for its cornices and columns.
export const WHITE = photo(mat('#f1ece2', 0.55), 'marble');
export const TRIM = mat('#dcd5c8', 0.6);

// The palace's measures, shared with js/details/falaknuma-palace.js. From photographs and the plan
// (laid out as a scorpion): the main building, W long and D deep, two storeys (FL each) under a
// balustrade, faces north over the city, here +z; a portico PW wide stands out from its middle.
// From its front corners two wings sweep forward and inward round the forecourt, the scorpion's
// claws, each an arc of radius R; the zenana and the kitchens trail behind it, the tail.
export const P = { W: 72, D: 34, FL: 7, PW: 26, PD: 10, R: 60, SWEEP: 0.72, WD: 9, WH: 11 };

// Two storeys of round-arched windows on a face len long.
const cells = (len, pitch, h = P.FL * 2, skip = []) => {
  const n = Math.max(1, Math.floor(len / pitch)), out = [];
  for (let fl = 0; fl < h / P.FL - 0.01; fl++) out.push(...cellRow(n, len / n, fl * P.FL + 1, 2, 4.2, skip));
  return out;
};

// A segment of a claw: a two-storey range len long and WD deep, its arcaded face towards +z.
function clawRange(len) {
  const g = new THREE.Group(), { WD, WH } = P;
  g.add(box(len, WH, WD - 1, WHITE, 0, 0, -0.5));
  g.add(at(arcadeSkin(len, WH, cellRow(Math.max(1, Math.round(len / 3.6)), len / Math.max(1, Math.round(len / 3.6)), 0, 2.4, 4.4).concat(cellRow(Math.max(1, Math.round(len / 3.6)), len / Math.max(1, Math.round(len / 3.6)), 5.6, 2, 3.8)), 1, WHITE, { trim: TRIM, pointed: false, fill: 'room' }), 0, 0, WD / 2 - 1));
  g.add(box(len + 0.2, 0.5, WD + 0.4, TRIM, 0, 5.2, 0), box(len + 0.4, 0.6, WD + 0.6, TRIM, 0, WH, 0));
  g.add(at(balustrade(len, 1, TRIM), 0, WH + 0.6, WD / 2 + 0.1));
  return g;
}

export function buildFalaknumaPalace() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { W, D, FL, PW, PD, R, SWEEP, WD, WH } = P, H = 2 * FL, fz = D / 2, S = 1.2;
  // The plinth the palace stands on, and the main building with its arcaded faces.
  d.add(box(W + 6, S, D + 6, TRIM, 0, 0, 0));
  d.add(box(W - 2, H, D - 2, WHITE, 0, S, 0));
  d.add(at(arcadeSkin(W, H, cells(W, 4.4, H, [[-PW / 2 - 1, PW / 2 + 1]]), 1, WHITE, { trim: TRIM, pointed: false, fill: 'room' }), 0, S, fz - 1));
  d.add(at(arcadeSkin(W, H, cells(W, 4.4), 1, WHITE, { trim: TRIM, pointed: false, fill: 'room' }), 0, S, -fz + 1).rotateY(Math.PI));
  for (const s of [-1, 1]) d.add(at(arcadeSkin(D - 2, H, cells(D - 2, 4.4), 1, WHITE, { trim: TRIM, pointed: false, fill: 'room' }), s * (W / 2 - 1), S, 0).rotateY(s * Math.PI / 2));
  d.add(box(W + 0.6, 0.5, D + 0.6, TRIM, 0, S + FL - 0.3, 0), box(W + 1.2, 0.8, D + 1.2, TRIM, 0, S + H, 0));
  for (const [x, z, len, ry] of [[0, fz + 0.1, W, 0], [0, -fz - 0.1, W, Math.PI], [W / 2 + 0.1, 0, D, Math.PI / 2], [-W / 2 - 0.1, 0, D, -Math.PI / 2]]) d.add(at(balustrade(len, 1.2, TRIM), x, S + H + 0.8, z).rotateY(ry));
  // The corner towers: a storey higher, each under a ribbed cupola.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (W / 2 - 4), z = sz * (fz - 4);
    d.add(box(8.6, H + 5, 8.6, WHITE, x, S, z), box(9.2, 0.7, 9.2, TRIM, x, S + H + 5, z));
    d.add(cyl(3, 3, 2, WHITE, x, S + H + 5.7, z, 16), at(lathe([[3.3, 0], [3.1, 1.4], [2.3, 2.7], [1, 3.4], [0, 3.6]], TRIM, 16), x, S + H + 7.7, z), at(finial(1.6, M.gold), x, S + H + 11.2, z));
  }
  // The portico: paired Corinthian columns through both storeys under a pediment, before the
  // entrance; a flight of steps up from the forecourt.
  const door = classicalDoor(3.4, 6, { m: WHITE, trim: TRIM, depth: 0.5, top: 'cornice' });
  d.add(at(porch(PW, PD, H, { m: WHITE, trim: TRIM, cols: 8, paired: true, order: 'corinthian', top: 'pediment', door, r: 0.62 }), 0, S, fz));
  d.add(at(grandStair(S, PW - 6, TRIM, WHITE, { n: 6, cheek: 0.4 }), 0, 0, fz + PD));
  // The claws: arcs sweeping forward from the front corners, inward towards the forecourt, each
  // ending in a round tower with a cupola.
  for (const s of [-1, 1]) {
    const cx = s * (W / 2 - WD / 2 - R), cz = fz - 2, n = detail.low ? 4 : 6;
    for (let k = 0; k < n; k++) {
      const t = ((k + 0.5) / n) * SWEEP, x = cx + s * R * Math.cos(t), z = cz + R * Math.sin(t), len = (2 * R * Math.sin(SWEEP / n / 2)) * 1.06;
      const seg = clawRange(len);
      seg.position.set(x, S, z);
      seg.rotation.y = Math.atan2(-s * Math.cos(t), -Math.sin(t));
      d.add(seg);
    }
    const x = cx + s * R * Math.cos(SWEEP), z = cz + R * Math.sin(SWEEP);
    d.add(cyl(5, 5, WH + 4, WHITE, x, S, z, 24), cyl(5.5, 5.5, 0.7, TRIM, x, S + WH + 4, z, 24));
    d.add(at(lathe([[4.6, 0], [4.3, 2], [3.2, 3.8], [1.4, 4.8], [0, 5]], TRIM, 24), x, S + WH + 4.7, z), at(finial(1.8, M.gold), x, S + WH + 9.6, z));
  }
  // The tail: the zenana's courts and the kitchens trailing behind.
  d.add(box(40, 10, 50, WHITE, 0, S, -fz - 24.5), box(42.2, 0.7, 50.8, TRIM, 0, S + 10, -fz - 24.6), box(22, 8, 30, WHITE, 0, S, -fz - 64));
  for (const s of [-1, 1]) d.add(at(arcadeSkin(50, 10, cells(50, 4.2, 7), 0.8, WHITE, { trim: TRIM, pointed: false, fill: 'room' }), s * 20.2, S, -fz - 24.5).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the north-east, above the forecourt in the claws' embrace.
  return { group: g, focus: f, view: [0.3, 0.3, 1], zoom: 0.95 };
}
