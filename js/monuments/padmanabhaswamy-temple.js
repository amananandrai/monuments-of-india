import * as THREE from 'three';
import { M, mat, box, cyl, at, gopuram, hipRoof, inst, unitCyl, aroundRect, kalash } from '../helpers.js';

const STONE = ['#d9d2c2', '#bdb4a2', '#e6dece', '#a99f8c'];
const COPPER = mat('#b0773f', 0.45, 0.4);
const LIME = mat('#efe9dd', 0.85);

export function buildPadmanabhaswamy() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Padma Theertham tank before the east gate
  g.add(box(56, 1, 46, M.granite, 0, 0, 92), box(48, 1.1, 38, M.water, 0, 0, 92));
  for (const s of [-1, 1]) g.add(box(56, 0.6, 3, M.graniteDark, 0, 1, 92 + s * 21.5));
  f.add(box(100, 0.3, 130, M.path));
  for (const s of [-1, 1]) f.add(box(100, 7, 2.5, LIME, 0, 0, s * 64), box(2.5, 7, 130, LIME, s * 50, 0, 0));
  // Seven-tier eastern gopuram, in unpainted stone
  f.add(at(gopuram(28, 15, 31, 7, 3, STONE), 0, 0, 64));
  // The pillared corridor (sheeveli pura) round the inner shrine
  const cols = [];
  aroundRect(74, 96, 2.6).forEach(([x, z]) => cols.push([x, 1.2, z, 0.9, 5, 0.9]));
  f.add(box(80, 1.2, 102, M.granite), inst(unitCyl(8), cols, M.granite));
  for (const s of [-1, 1]) f.add(box(80, 0.8, 6, M.graniteDark, 0, 6.2, s * 48), box(6, 0.8, 102, M.graniteDark, s * 37, 6.2, 0));
  // Sanctum under tiered Kerala copper roofs, and the gold flagstaff in front
  f.add(box(34, 7, 46, LIME, 0, 1.2, -10), at(hipRoof(38, 50, 8, COPPER), 0, 8.2, -10));
  f.add(box(16, 4, 26, LIME, 0, 12, -12), at(hipRoof(19, 29, 6, M.gild), 0, 16, -12));
  for (const z of [-20, -12, -4]) f.add(at(kalash(1.6), 0, 21.6, z));
  f.add(box(3, 2, 3, M.granite, 0, 1.2, 26), cyl(0.5, 0.75, 22, M.gild, 0, 3.2, 26, 12), cyl(1.2, 0.4, 1.2, M.gild, 0, 25.2, 26, 12));
  return { group: g, focus: f, view: [0.6, 0.4, 1.25] };
}
