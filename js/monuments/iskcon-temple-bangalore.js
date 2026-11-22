import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, surface, kalash, hipRoof } from '../helpers.js';
import { mergeByMaterial, chhajja, mouldings, frieze, windowFrame, cuspedArchGeo, railing } from '../parts/components.js';
import { dravidaVimana, carvedPillar, dwajasthambha } from '../parts/temples.js';
import { steps } from '../parts/doorways.js';
import { detail } from '../detail.js';
import { addDetails, HILL } from '../details/iskcon-temple-bangalore.js';

// The Sri Radha Krishna temple of ISKCON on Hare Krishna Hill, Bengaluru (1997), from photographs:
// a granite temple in the Dravidian manner joined to modern glass. Four stone towers in the form of
// vimanas, cream with gilded crowns, stand at the corners of the temple hall, and a glazed canopy
// spans between them over the hall; out of the middle of the glass rises the tower over the
// sanctum, crowned by the gilded kalash shikhara, 8.5 m high. Before the hall a pillared porch, and
// in front of it the gold flagstaff, 17 m high. The temple stands on the top of the hill (HILL
// high), up a broad flight of steps from the road. Faces +z.
export const CREAM = mat('#efe6d2', 0.7), SHADE = mat('#cdbf9f', 0.8), GRANITE = mat('#9b9289', 0.85);
const GLASS = surface(mat('#7fa9b4', 0.1, 0.55, { transparent: true, opacity: 0.62 }), 'none'), FRAME = mat('#e8e4dc', 0.5, 0.3);
const GILT = M.gild;
// Half the hall's side, the height of its walls, and where the corner towers stand.
const HW = 16, WALL = 10, TX = 16;

// A corner tower: a square shaft with string courses and a pilastered face, then a vimana of five
// storeys with its hara of little shrines, and a gilded octagonal cap and kalash.
function tower(m, sh) {
  const g = new THREE.Group(), base = 10;
  g.add(box(8, base, 8, m), mouldings(8, 8, [[0, 0.8, 0.25, GRANITE], [4, 0.4, 0.12, frieze(m)], [8, 0.4, 0.12, frieze(m)], [base - 0.6, 0.6, 0.3, sh]], m));
  const v = dravidaVimana(7.6, 5, 2.3, m, sh, { cap: 'octagon', capScale: 0.36, kalashM: GILT });
  // Gild the cap: the last children of the vimana are its neck, dome and kalash.
  v.children[v.children.length - 2].material = GILT;
  g.add(at(v, 0, base, 0));
  g.userData.top = base + v.userData.top;
  return g;
}

export function buildIskconBangalore() {
  const g = new THREE.Group(), f = new THREE.Group(), y0 = HILL;
  g.add(f);
  // The temple's terrace on the hilltop, and the plinth of the hall.
  f.add(box(52, 1.2, 68, GRANITE, 0, y0 - 1.2, 4), box(2 * HW + 4, 1.6, 2 * HW + 4, SHADE, 0, y0, 0));
  f.add(at(steps(10, 1.6, 5, GRANITE), 0, y0, HW + 2 + 4.6));
  // The hall: walls of cream stone with tall arched windows, a cornice and chhajja.
  const hy = y0 + 1.6, hall = new THREE.Group();
  hall.add(box(2 * HW, WALL, 2 * HW, CREAM, 0, hy));
  for (const a of FACES) {
    hall.add(onFace(at(chhajja(2 * HW + 2, 1.4, 0.5, 0.16, SHADE), 0, hy + WALL, 0), a, HW));
    for (const lat of [-9, -4.5, 4.5, 9]) hall.add(onFace(at(windowFrame(2.2, 5.2, CREAM, { shape: 'pointed' }), 0, hy + 2.2, 0), a, HW + 0.02, lat));
  }
  hall.add(mouldings(2 * HW, 2 * HW, [[hy, 0.8, 0.2, GRANITE], [hy + WALL - 1.1, 0.5, 0.1, frieze(CREAM)]], CREAM));
  f.add(mergeByMaterial(hall));
  // The glazed canopy: a hipped roof of glass over the hall in steel frames, from the cornice to
  // the foot of the sanctum's tower.
  const gy = hy + WALL + 0.3, glass = new THREE.Group();
  glass.add(at(hipRoof(2 * HW + 2, 2 * HW + 2, 9, GLASS), 0, gy, 0));
  const ribs = new THREE.Group();
  for (let k = -3; k <= 3; k++) for (const a of FACES) {
    const s = Math.sin(a), c = Math.cos(a), o = k * 4.4, top = [s * 1 + c * o * 0.12, gy + 8.6, c * 1 - s * o * 0.12], foot = [s * (HW + 1) + c * o, gy, c * (HW + 1) - s * o];
    const len = Math.hypot(top[0] - foot[0], top[1] - foot[1], top[2] - foot[2]), r = cyl(0.12, 0.12, len, FRAME, 0, -len / 2, 0, 6);
    const p = new THREE.Group(); p.add(r); p.position.set((top[0] + foot[0]) / 2, (top[1] + foot[1]) / 2, (top[2] + foot[2]) / 2);
    p.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(top[0] - foot[0], top[1] - foot[1], top[2] - foot[2]).normalize());
    ribs.add(p);
  }
  glass.add(mergeByMaterial(ribs));
  f.add(glass);
  // The four corner towers.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(tower(CREAM, SHADE), sx * TX, y0, sz * TX));
  // The sanctum's tower, rising through the glass: a vimana of three storeys and, over it, the
  // gilded kalash shikhara (a ribbed golden dome and its pot, 8.5 m).
  const v = dravidaVimana(10, 4, 3.4, CREAM, SHADE, { cap: 'round', capScale: 0.01, kalashM: GILT });
  const vy = hy + WALL + 3;
  f.add(box(9.6, 5, 9.6, CREAM, 0, hy + WALL - 2), at(v, 0, vy, 0));
  const sy = vy + 4 * 3.4 + 0.2, gild = new THREE.Group();
  gild.add(cyl(3.2, 3.6, 1.2, GILT, 0, sy, 0, 16));
  const dome = mesh(new THREE.SphereGeometry(3.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), GILT, 0, sy + 1.2, 0);
  dome.scale.y = 1.3;
  gild.add(dome, cyl(0.7, 1.1, 0.8, GILT, 0, sy + 5.5, 0, 12), at(kalash(1.7, GILT), 0, sy + 6.2, 0));
  f.add(gild);
  // The porch before the hall: carved granite pillars, cusped arches and a flat roof under a
  // parapet, its corners marked by little gilt kalashes.
  const porch = new THREE.Group(), pz = HW + 0.2, xs = [-6, -2, 2, 6];
  for (const x of xs) for (const z of [pz + 1, pz + 5]) porch.add(at(carvedPillar(6, GRANITE), x, hy, z));
  for (let k = 0; k < 3; k++) porch.add(at(mesh(cuspedArchGeo(3.1, 1.8, 0.3), CREAM), (xs[k] + xs[k + 1]) / 2, hy + 6, pz + 5));
  porch.add(box(14, 1, 6.4, CREAM, 0, hy + 6, pz + 3), at(chhajja(15, 1.2, 0.45, 0.15, SHADE), 0, hy + 7, pz + 6.2));
  porch.add(at(railing(14, 1, 0.3, CREAM), 0, hy + 7, pz + 6.1));
  f.add(mergeByMaterial(porch));
  for (const x of [-6.8, 6.8]) f.add(at(kalash(0.6, GILT), x, hy + 8, pz + 6));
  // The gold flagstaff before the porch, 17 m.
  f.add(dwajasthambha(0, pz + 13, 17).translateY(y0));
  addDetails(f, g, { y0, HW });
  // From the south-east, up the hill.
  return { group: g, focus: f, view: [0.75, 0.32, 1], zoom: detail.low ? 0.85 : 0.9 };
}
