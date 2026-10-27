import * as THREE from 'three';
import { M, box, group, at, onFace, FACES, shikhara, pidaRoof, flag, nagaraProfile, inst, unitCyl, unitHemi, unitSpire, aroundRect } from '../helpers.js';

export function buildRanakpur() {
  const Mb = M.ranak, Sh = M.marbleShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(150, 0.2, 150, M.grass));
  f.add(box(64, 5, 66, Sh), box(60, 7, 62, Mb, 0, 5, 0), box(61, 0.6, 63, Sh, 0, 12, 0));
  // Entrances on all four sides of the chaturmukha temple
  for (const a of FACES) {
    for (let k = 0; k < 5; k++) f.add(onFace(box(9, 5 - k, 2, Sh, 0, 0, 0), a, 34 + k * 2));
    const p = onFace(group(box(11, 8, 5, Mb, 0, 5), at(pidaRoof(11, 5, 3, 0.8, Mb, Sh), 0, 13, 0)), a, 33);
    f.add(p);
  }
  // Pillars round the edge, a forest of domes on the roof, and spires over the cells
  const pil = [], drums = [], domes = [], spires = [];
  aroundRect(61, 63, 2.4).forEach(([x, z]) => pil.push([x, 5, z, 0.8, 7, 0.8]));
  aroundRect(58, 60, 3.4, 1).forEach(([x, z, ry]) => spires.push([x, 12.6, z, 2.2, 2.8, 2.2, ry]));
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
    if (Math.abs(i) === 3 && Math.abs(j) === 3) continue;
    const r = (i + j) % 2 === 0 ? 3.2 : 2.3, x = i * 7.6, z = j * 7.6;
    drums.push([x, 12.6, z, r * 2.1, 1.3, r * 2.1]);
    domes.push([x, 13.9, z, r * 2, r * 1.7, r * 2]);
  }
  f.add(inst(unitCyl(10), pil, Mb), inst(unitCyl(16), drums, Mb), inst(unitHemi(20), domes, Mb), inst(unitSpire(), spires, Mb));
  f.add(box(22, 5, 22, Mb, 0, 12.6, 0));
  const main = shikhara(15, 19, Mb, nagaraProfile, 16);
  f.add(at(main, 0, 17.6, 0), at(flag(6, M.flagRed), 0, 17.6 + main.userData.top - 1, 0));
  for (const a of FACES) f.add(onFace(at(shikhara(7.5, 11, Mb, nagaraProfile, 10), 0, 17.6, 0), a, 8.5));
  for (const x of [-24, 24]) for (const z of [-24, 24]) f.add(at(shikhara(7, 10, Mb, nagaraProfile, 10), x, 12.6, z));
  return { group: g, focus: f, view: [0.95, 0.5, 1.1] };
}
