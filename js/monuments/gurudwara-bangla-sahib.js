import * as THREE from 'three';
import { M, box, cyl, at, onFace, chhatri } from '../helpers.js';
import { grandStair } from '../parts/doorways.js';
import { mergeByMaterial, chhajja } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { sikhDome, parapetDomes, GILT } from '../details/takht-sri-hazur-sahib.js';
import { addDetails } from '../details/gurudwara-bangla-sahib.js';

// A storey on a rectangle w × d: a core block with an arcade skin dp deep on each face.
function rectStorey(w, d, h, pitch, m, { trim = m, fill = 'room', dp = 0.8, sill = 0.4, ah = h * 0.72, front = null } = {}) {
  const g = new THREE.Group();
  g.add(box(w - 2 * dp, h, d - 2 * dp, m));
  for (const [ang, len, dist] of [[0, w, d / 2 - dp], [Math.PI, w, d / 2 - dp], [Math.PI / 2, d - 2 * dp, w / 2 - dp], [-Math.PI / 2, d - 2 * dp, w / 2 - dp]]) {
    const n = Math.max(1, Math.floor(len / pitch)), p = len / n, aw = p * 0.6;
    const cells = cellRow(n, p, sill, aw, ah).map((c) => (ang === 0 && front && Math.abs(c[0]) < p / 2 ? [...c, front] : c));
    g.add(onFace(arcadeSkin(len, h, cells, dp, m, { trim, fill }), ang, dist));
  }
  return g;
}

// Gurdwara Bangla Sahib, New Delhi, on the site of Raja Jai Singh's bungalow where Guru Har Krishan
// stayed in 1664; the present building is mostly of after 1947. From photographs: a white marble
// hall of two storeys, its ground floor an open veranda of cusped arches, raised on a plinth with a
// broad stair to the door (+z); a gilt onion dome on a tall drum over the middle; gilt domed kiosks
// at the corners of the roof and over the porch; and the sarovar beside it to the west.
export function buildGurudwaraBanglaSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade, G = GILT;
  g.add(f);
  const P = 1.8, w = 40, d = 32, H1 = 7.5, H2 = 6;
  f.add(box(w + 6, P, d + 6, W, 0, 0, 0), box(w + 6.5, 0.25, d + 6.5, Ws, 0, P - 0.25, 0));
  f.add(at(grandStair(P, 14, W, Ws, { n: 9, landing: 0 }), 0, 0, d / 2 + 3));
  f.add(at(rectStorey(w, d, H1, 4.6, W, { trim: G, fill: 'room', front: 'door', sill: 0.2, ah: 5.8 }), 0, P, 0));
  let y = P + H1;
  for (const [a, len, dist] of [[0, w + 0.6, d / 2], [Math.PI, w + 0.6, d / 2], [Math.PI / 2, d + 0.6, w / 2], [-Math.PI / 2, d + 0.6, w / 2]]) f.add(onFace(at(chhajja(len, 1.1, 0.45, 0.18, W), 0, y, 0), a, dist));
  f.add(box(w + 0.6, 0.9, d + 0.6, W, 0, y, 0));
  f.add(at(rectStorey(w - 6, d - 6, H2, 4.2, W, { trim: Ws, fill: 'jali', sill: 0.6, ah: 4.2, dp: 0.6 }), 0, y + 0.9, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(1.6, 5, W, G), sx * (w / 2 - 1.4), y + 0.9, sz * (d / 2 - 1.4)));
  y += 0.9 + H2;
  f.add(box(w - 5.4, 0.8, d - 5.4, W, 0, y, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(1.3, 4.2, W, G), sx * (w / 2 - 4.4), y + 0.8, sz * (d / 2 - 4.4)));
  // The tall drum, arcaded, and the great gilt dome.
  const R = 6;
  f.add(cyl(R * 0.98, R * 0.98, 0.6, W, 0, y + 0.8, 0, 32), cyl(R * 0.9, R * 0.9, 4.4, G, 0, y + 1.4, 0, 32), cyl(R, R, 0.5, W, 0, y + 5.8, 0, 32));
  f.add(at(sikhDome(R, G), 0, y + 6.3, 0));
  // The porch before the door: a gilt kiosk over two pillars at the head of the stair.
  const porch = new THREE.Group();
  porch.add(box(10, H1 + 1.4, 2.6, W, 0, 0, 0), at(arcadeSkin(10, H1 + 1.4, [[0, 0, 5, 7.2, 'door']], 0.8, W, { trim: G }), 0, 0, 1.3));
  porch.add(box(10.6, 0.6, 3.8, W, 0, H1 + 1.4, 0.7), at(parapetDomes(3.4, H1 + 2, 3, G, 0.28), 0, 0, 0.6), cyl(1.6, 1.6, 1.6, W, 0, H1 + 2, 0.6, 20), at(sikhDome(1.6, G, { petals: false }), 0, H1 + 3.6, 0.6));
  f.add(at(porch, 0, P, d / 2 + 0.2));
  mergeByMaterial(f);
  addDetails(f, g, { P, w, d });
  // From the south-east, the sarovar beyond the hall.
  return { group: g, focus: f, view: [0.75, 0.3, 1], zoom: 1, batch: true };
}
