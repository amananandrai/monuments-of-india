import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, shikhara, hipRoof, kalash, flag, inst, unitBox } from '../helpers.js';

const STONE = mat('#8e8a82', 0.9);
const STONE_DARK = mat('#6f6b64', 0.9);
const SLOPE = mat('#6b7356', 0.95, 0, { flatShading: true });
const ROCK = mat('#7d7a74', 0.95, 0, { flatShading: true });
const SNOW = mat('#f4f6f8', 0.8, 0, { flatShading: true });

export function buildKedarnath() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(9);
  g.add(f);
  // The glacial valley: Mandakini river, meadow and the Kedarnath massif behind
  g.add(box(240, 0.2, 240, SLOPE), box(14, 0.4, 260, M.water, 70, 0, 0));
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.32, d = 330 + R() * 80, h = 260 + R() * 160, x = Math.cos(a) * d, z = Math.sin(a) * d;
    g.add(mesh(new THREE.ConeGeometry(h * 0.6, h, 7).translate(0, h / 2, 0), ROCK, x, 0, z), mesh(new THREE.ConeGeometry(h * 0.27, h * 0.45, 7).translate(0, h * 0.775, 0), SNOW, x, 0, z));
  }
  // Pilgrim lodges along the approach
  const lodges = [];
  for (let i = 0; i < 18; i++) lodges.push([(R() < 0.5 ? -1 : 1) * (18 + R() * 25), 0, 20 + R() * 70, 6 + R() * 4, 4 + R() * 4, 5 + R() * 3, R()]);
  g.add(inst(unitBox(), lodges, mat('#c9b9a0', 0.9)));
  // Temple: grey stone sanctum with its curved tower, and the hall in front under a sloping roof
  f.add(box(22, 2, 34, STONE_DARK, 0, 0, 0));
  f.add(box(12, 9, 12, STONE, 0, 2, -9), box(12.8, 0.6, 12.8, STONE_DARK, 0, 11, -9));
  const t = shikhara(11, 13, STONE, (k) => 1 - 0.5 * Math.pow(k, 1.6), 12);
  f.add(at(t, 0, 11.6, -9), at(flag(4, M.saffron), 0, 11.6 + t.userData.top - 0.6, -9));
  f.add(box(14, 8, 14, STONE, 0, 2, 5), at(hipRoof(16, 16, 5, STONE_DARK), 0, 10, 5), at(kalash(1.4), 0, 15, 5));
  f.add(box(4, 1, 6, STONE_DARK, 0, 0, 18), box(2.2, 1.8, 3.6, mat('#3b3936', 0.7), 0, 1, 18), box(1.2, 1.2, 1.2, mat('#3b3936', 0.7), 0, 2.2, 19.6));
  // Bhim Shila: the boulder that shielded the temple in 2013
  const boulder = mesh(new THREE.IcosahedronGeometry(5, 1), ROCK, 0, 3.6, -24);
  boulder.scale.set(1.5, 0.75, 1);
  f.add(boulder);
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}
