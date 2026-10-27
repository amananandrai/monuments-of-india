import * as THREE from 'three';
import { M, mat, box, cyl, at, rng, onFace, archPanel, guldasta, nagaraTemple, inst, unitBox, unitSpire } from '../helpers.js';

const RED = mat('#a94a3c', 0.85);
const RED_LIGHT = mat('#c26a5a', 0.85);

export function buildSonijiKiNasiyan() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(79);
  g.add(f);
  g.add(box(140, 0.2, 120, M.path));
  // The red sandstone temple with its spire
  f.add(at(nagaraTemple({ w: 9, h: 14, m: RED, shade: RED_LIGHT, plinth: 1.6, urus: 4, halls: [[12, 7, 4]] }), -24, 0, -12));
  // The Swarna Nagari hall: a two-storey red building, its upper gallery open on a gilded model city
  f.add(box(40, 7, 24, RED, 20, 0, 0), box(40.6, 0.6, 24.6, RED_LIGHT, 20, 7, 0));
  for (let k = 0; k < 6; k++) f.add(onFace(at(archPanel(3.6, 5, true, M.recess, 0.25), 0, 0.6, 0), 0, 12, 20 - 17.5 + k * 7));
  const cols = [];
  for (let k = 0; k <= 10; k++) cols.push([1 + k * 3.8, 7.6, 11.4, 0.6, 7, 0.6]);
  f.add(inst(unitBox(), cols, RED), box(40.6, 1, 24.6, RED_LIGHT, 20, 14.6, 0), box(40, 0.6, 24, RED, 20, 7.6, 0));
  const town = [], tops = [];
  for (let i = 0; i < 60; i++) {
    const x = 3 + R() * 34, z = -9 + R() * 18, w = 0.8 + R() * 1.4, h = 0.8 + R() * 2.4;
    town.push([x, 8.2, z, w, h, w]);
    tops.push([x, 8.2 + h, z, w, w * 1.4, w]);
  }
  f.add(inst(unitBox(), town, M.gild), inst(unitSpire(), tops, M.gild), cyl(1.4, 2.6, 4.6, M.gild, 20, 8.2, 0, 16));
  for (const x of [0, 40]) for (const z of [-12, 12]) f.add(at(guldasta(5, 0.5, RED), x, 15.6, z));
  return { group: g, focus: f, view: [0.45, 0.16, 1.25] };
}
