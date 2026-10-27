import * as THREE from 'three';
import { M, box, cyl, lathe, group, at, kalash, shikhara, nagaraProfile, ribbed, inst, unitBox, unitCyl, unitHemi, aroundRect } from '../helpers.js';

export function buildAkshardham() {
  const P = M.pink, Ps = M.pinkShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(250, 0.2, 270, M.path), box(150, 0.3, 166, M.water, 0, 0, 0));
  // Two-storey parikrama colonnade around the complex
  const pw = 230, pd = 250, cols = [], domes = [];
  aroundRect(pw - 8, pd - 8, 4).forEach(([x, z]) => cols.push([x, 0, z, 1, 11, 1]));
  aroundRect(pw, pd, 10).forEach(([x, z]) => domes.push([x, 12.4, z, 4, 3.4, 4]));
  for (const s of [-1, 1]) g.add(box(pw, 12, 6, M.red, 0, 0, s * (pd / 2)), box(6, 12, pd, M.red, s * (pw / 2), 0, 0));
  g.add(inst(unitCyl(10), cols, M.redLight), inst(unitHemi(16), domes, M.redLight));
  // Gajendra Pith: the plinth with its frieze of elephants
  f.add(box(100, 5, 116, Ps));
  const eles = [];
  aroundRect(100.8, 116.8, 2.6).forEach(([x, z, ry]) => eles.push([x, 0.8, z, 2.2, 2.4, 1.1, ry]));
  f.add(inst(unitBox(), eles, M.stoneDark));
  f.add(box(88, 4, 102, P, 0, 5, 0));
  for (let k = 0; k < 5; k++) f.add(box(24, 9 - k * 1.8, 3, P, 0, 0, 52.5 + k * 3));
  // The mandir: pillared body, a broad eave, nine domes and four corner spires
  f.add(box(68, 16, 82, M.ranak, 0, 9, 0));
  const pil = [];
  aroundRect(72, 86, 3).forEach(([x, z]) => pil.push([x, 9, z, 1.3, 15.5, 1.3]));
  f.add(inst(unitCyl(12), pil, P), box(76, 1.4, 90, Ps, 0, 24.5, 0), box(72, 1.6, 86, P, 0, 25.9, 0));
  const prof = [[1, 0], [1.02, 0.3], [0.9, 0.66], [0.6, 0.95], [0.25, 1.12], [0, 1.15]];
  const dome = (x, z, r) => {
    f.add(cyl(r * 1.08, r * 1.08, r * 0.35, P, x, 27.5, z, 32));
    f.add(at(ribbed(lathe(prof.map(([a, b]) => [a * r, b * r]), P, 48), 24, 0.05), x, 27.5 + r * 0.35, z));
    f.add(at(kalash(r * 0.28), x, 27.5 + r * 0.35 + r * 1.13, z));
  };
  dome(0, 0, 11);
  for (const [x, z] of [[-22, -26], [22, -26], [-22, 26], [22, 26], [0, -32], [0, 32], [-26, 0], [26, 0]]) dome(x, z, 5.2);
  for (const x of [-31, 31]) for (const z of [-38, 38]) f.add(at(shikhara(6, 11, P, nagaraProfile, 10), x, 27.5, z));
  return { group: g, focus: f, view: [0.75, 0.38, 1.2] };
}
