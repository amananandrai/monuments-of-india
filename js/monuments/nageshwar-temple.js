import * as THREE from 'three';
import { M, mat, box, at } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { mahayogiShiva } from '../details/nageshwar-temple.js';

const PINK = mat('#e4b7a0', 0.85);
const SHADE = mat('#c4937c', 0.9);
export function buildNageshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(180, 0.2, 180, M.path), box(80, 0.2, 60, M.grass, 0, 0, 60));
  f.add(at(nagaraTemple({ w: 11, h: 19, m: PINK, shade: SHADE, plinth: 2, urus: 4, halls: [[14, 7, 5]] }), -26, 0, -20));
  // The great seated Shiva in the garden, about 25 m tall (see js/details/nageshwar-temple.js)
  f.add(at(mahayogiShiva(), 26, 0, 10));
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}
