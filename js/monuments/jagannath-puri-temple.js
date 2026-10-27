import * as THREE from 'three';
import { M, flat, mesh, box, group, at, kalash, bell, shikhara, pidaRoof, flag, kalingaProfile } from '../helpers.js';

export function buildJagannath() {
  const m = M.puri, d = M.puriShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(84, 1.2, 116, M.path));
  for (const [w, dd, x, z] of [[90, 2, 0, -59], [2, 120, -45, 0], [2, 120, 45, 0], [36, 2, -27, 59], [36, 2, 27, 59]]) g.add(box(w, 7, dd, d, x, 0, z));
  const gate = new THREE.Group();
  gate.add(box(18, 9, 10, m));
  gate.add(box(6, 6, 10.4, M.recess, 0, 0, 0));
  gate.add(at(pidaRoof(18, 7, 5, 0.9, m, d), 0, 9, 0));
  g.add(at(gate, 0, 0, 59));
  const B = 1.2;
  // Rekha deula (main sanctum tower)
  const dz = -30;
  f.add(box(22, 16, 22, m, 0, B, dz), box(26, 16, 14, m, 0, B, dz), box(14, 16, 26, m, 0, B, dz));
  f.add(box(27, 1, 27, d, 0, B + 15, dz));
  const tower = shikhara(24, 36, m, kalingaProfile, 20);
  f.add(at(tower, 0, B + 16, dz));
  const ty = B + 16 + tower.userData.top;
  const chakra = new THREE.Group();
  chakra.add(mesh(new THREE.TorusGeometry(2.4, 0.3, 8, 32), M.steel));
  for (let i = 0; i < 4; i++) chakra.add(box(0.2, 4.6, 0.2, M.steel, 0, -2.3, 0).rotateZ((i / 4) * Math.PI));
  f.add(at(chakra, 0, ty + 2.4, dz));
  f.add(at(flag(9, M.flagRed), 0, ty + 2, dz + 0.6));
  f.add(at(flag(7, M.saffron), 0.6, ty + 2, dz - 0.4).rotateY(Math.PI * 0.7));
  // Jagamohana, Natamandapa and Bhogamandapa with stepped pida roofs
  const halls = [[22, 13, 11, 24, 9, -5], [18, 9, 7, 19, 8.5, 15], [15, 8, 6, 16, 7, 31]];
  for (const [w, h, n, w0, w1, z] of halls) {
    f.add(box(w, h, w, m, 0, B, z), box(w + 4, h, w * 0.6, m, 0, B, z), box(w * 0.6, h, w + 4, m, 0, B, z));
    const roof = pidaRoof(w0, w1, n, 1.2, m, d);
    f.add(at(roof, 0, B + h, z));
    const ry = B + h + roof.userData.top;
    f.add(at(bell(w1 * 0.55, m), 0, ry, z));
    const am = mesh(new THREE.SphereGeometry(w1 * 0.3, 24, 8), flat(m), 0, ry + w1 * 0.62, z);
    am.scale.y = 0.4;
    f.add(am);
    f.add(at(kalash(w1 * 0.35), 0, ry + w1 * 0.72, z));
  }
  return { group: g, focus: f, view: [1.05, 0.4, 1.05] };
}
