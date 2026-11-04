import * as THREE from 'three';
import { M, mesh, box, cyl, at, onFace, FACES, kalash, bell, shikhara, pidaRoof, aroundRect } from '../helpers.js';
import { templeDoorway, steps } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { figureRow } from '../details/sculpture.js';
import { addDetails } from '../details/kandariya-mahadeva.js';

export function buildKandariya() {
  const S = M.khaj, Sd = M.khajShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(90, 0.2, 110, M.grass));
  f.add(box(32, 3, 64, Sd));
  for (let k = 0; k < 4; k++) f.add(box(8, 3 - k * 0.75, 2, Sd, 0, 0, 33 + k * 2));
  // Moulded base and sculpted wall, with projecting balconies on the halls
  f.add(box(24, 2, 42, S, 0, 3, -4), box(22, 6, 40, S, 0, 5, -4));
  for (const [z, d] of [[0, 9], [12.25, 7.5]]) f.add(box(29, 3.6, d, S, 0, 6, z), box(30.5, 0.6, d + 1.5, Sd, 0, 9.6, z));
  const figs = [];
  // The sculpted figures run round the walls, leaving the doorway clear.
  for (const y of [5.4, 7.4]) aroundRect(22.4, 40.4, 1.2).forEach(([x, z, ry]) => { if (!(z > 20 && Math.abs(x) < 2.6)) figs.push([x, y, z - 4, 0.7, 1.5, 0.35, ry]); });
  f.add(figureRow(figs, Sd, { poses: ['standing', 'dancer', 'standing', 'musician'] }), box(23, 0.5, 41, Sd, 0, 11, -4));
  // Roofs rising in steps from the entrance porch to the main tower
  [[22, 9, 4, 3], [12, 13, 5, 4], [1, 17, 6, 5]].forEach(([z, w0, n, br]) => {
    const r = pidaRoof(w0, w0 * 0.42, n, 0.85, S, Sd);
    f.add(at(r, 0, 11.5, z), at(bell(br * 0.7, S), 0, 11.5 + r.userData.top, z), at(kalash(br * 0.45), 0, 11.5 + r.userData.top + br * 0.72, z));
  });
  // The entrance porch: open between four pillars, with a garland arch (torana) across its front,
  // the doorway into the hall at its back, and steps down to the platform.
  const porch = new THREE.Group();
  porch.add(box(11, 2, 9, Sd, 0, 3, 20.5), box(10, 0.4, 9, S, 0, 11.1, 20.5));
  for (const x of [-4.3, 4.3]) for (const z of [16.6, 24.4]) {
    porch.add(box(0.9, 0.5, 0.9, Sd, x, 5, z), cyl(0.3, 0.34, 4.7, S, x, 5.5, z, 8), box(0.9, 0.4, 0.9, Sd, x, 10.2, z));
  }
  for (const z of [16.6, 24.4]) porch.add(box(9.5, 0.5, 0.6, Sd, 0, 10.6, z));
  for (const x of [-4.3, 4.3]) porch.add(box(0.6, 0.5, 8.4, Sd, x, 10.6, 20.5));
  const arch = mesh(new THREE.TorusGeometry(3.9, 0.15, 6, 28, Math.PI), S, 0, 7.4, 24.4);
  arch.scale.y = 0.72;
  porch.add(arch);
  for (let k = 1; k < 8; k++) {
    const a = (k / 8) * Math.PI;
    porch.add(at(mesh(new THREE.SphereGeometry(0.2, 8, 5), S), Math.cos(a) * 3.6, 7.4 + Math.sin(a) * 3.6 * 0.72, 24.4));
  }
  porch.add(at(templeDoorway(1.6, 3.2, { m: S }), 0, 5, 16), at(steps(8, 2, 5, Sd), 0, 3, 25));
  f.add(mergeByMaterial(porch));
  // Main shikhara wrapped in tiers of smaller spires, like a range of peaks
  const tz = -15, ty = 11.5, prof = (t) => 1 - 0.7 * Math.pow(t, 1.3);
  f.add(at(shikhara(15, 19, S, prof, 20), 0, ty, tz));
  for (const a of FACES) {
    const u = onFace(at(shikhara(9, 13.5, S, prof, 12), 0, ty, 0), a, 6.5);
    u.position.z += tz;
    f.add(u);
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, u = onFace(at(shikhara(6, 8.5, S, prof, 8), 0, ty, 0), a, 9.5);
    u.position.z += tz;
    f.add(u);
  }
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, u = onFace(at(shikhara(3.6, 5, S, prof, 6), 0, ty, 0), a, 11.8);
    u.position.z += tz;
    f.add(u);
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [1.1, 0.32, 0.85] };
}
