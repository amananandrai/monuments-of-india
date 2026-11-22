import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, chhatri } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial, chhajja } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { sikhDome, arcadeStorey, parapetDomes, GILT } from '../parts/sikh.js';
import { addDetails, TOP } from '../details/takht-sri-keshgarh-sahib.js';

// Takht Sri Keshgarh Sahib, Anandpur Sahib, where Guru Gobind Singh founded the Khalsa in 1699; the
// present building is of 1936–1944. From photographs: a white marble shrine on the levelled top of
// a low hill, reached by long flights of steps; two storeys on a square plan, the lower opening in
// arches with a tall arched porch in front (+z), the upper set back with kiosks at its corners,
// and over the middle a raised square tower carrying a white ribbed dome with a gilt finial. The
// hilltop terrace (TOP high) is ringed by white ranges and a parapet.
export function buildTakhtSriKeshgarhSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade;
  g.add(f);
  f.position.y = TOP;
  const P = 1.4;
  f.add(box(30, P, 30, W, 0, 0, 0), box(30.5, 0.25, 30.5, Ws, 0, P - 0.25, 0));
  for (const a of FACES) f.add(onFace(at(steps(7, P, 4, W), 0, 0, 0), a, 15));
  // The lower storey and its porch.
  const H1 = 8;
  f.add(at(arcadeStorey(24, H1, 5, W, { trim: Ws, fill: 'room', centre: 'door', sill: 0.3, ah: 6 }), 0, P, 0));
  const porch = new THREE.Group();
  porch.add(box(10, 11, 3.2, W, 0, 0, -1.6), at(arcadeSkin(10, 11, [[0, 0, 5.2, 9, 'door']], 1, W, { trim: GILT }), 0, 0, 0));
  porch.add(box(10.8, 0.7, 4.6, W, 0, 11, -1.4), at(parapetDomes(4, 11.7, 3, W, 0.3), 0, 0, -1));
  for (const x of [-4.4, 4.4]) porch.add(cyl(0.6, 0.6, 1.6, W, x, 11.7, 0.2, 12), at(sikhDome(0.6, W, { petals: false, finialM: GILT }), x, 13.3, 0.2));
  f.add(at(porch, 0, P, 13));
  let y = P + H1;
  for (const a of FACES) f.add(onFace(at(chhajja(24.8, 1, 0.45, 0.18, W), 0, y, 0), a, 12));
  f.add(box(24.6, 0.9, 24.6, W, 0, y, 0), parapetDomes(24.6, y + 0.9, 7, W, 0.32));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(1.4, 4.2, W), sx * 11.2, y + 0.9, sz * 11.2));
  // The upper storey, and the tower over the sanctum.
  const H2 = 5.6;
  f.add(at(arcadeStorey(17, H2, 5, W, { trim: Ws, fill: 'jali', sill: 0.5, ah: 4, dp: 0.6 }), 0, y + 0.9, 0));
  y += 0.9 + H2;
  for (const a of FACES) f.add(onFace(at(chhajja(17.6, 0.9, 0.4, 0.16, W), 0, y, 0), a, 8.5));
  f.add(box(17.6, 0.8, 17.6, W, 0, y, 0), parapetDomes(17.6, y + 0.8, 5, W, 0.3));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(1.1, 3.6, W), sx * 7.6, y + 0.8, sz * 7.6));
  f.add(at(arcadeStorey(10, 4.2, 3, W, { trim: Ws, fill: 'jali', sill: 0.6, ah: 3, dp: 0.5 }), 0, y + 0.8, 0));
  y += 0.8 + 4.2;
  f.add(box(10.8, 0.7, 10.8, W, 0, y, 0), cyl(4.4, 4.4, 1.8, W, 0, y + 0.7, 0, 32));
  f.add(at(sikhDome(4.6, W, { finialM: GILT }), 0, y + 2.5, 0));
  mergeByMaterial(f);
  addDetails(f, g, {});
  // From the south-east, the flights of steps climbing to the shrine.
  return { group: g, focus: f, view: [0.55, 0.3, 1], zoom: 1.25, batch: true };
}
