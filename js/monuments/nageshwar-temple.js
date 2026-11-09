import * as THREE from 'three';
import { M, mat, box, at } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { mahayogiShiva } from '../details/nageshwar-temple.js';
import { trees, along } from '../details/realism.js';
import { detail } from '../detail.js';

const PINK = mat('#e4b7a0', 0.85);
const SHADE = mat('#c4937c', 0.9);
export function buildNageshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(180, 0.2, 180, M.path), box(80, 0.2, 60, M.grass, 0, 0, 60));
  // The temple: the sanctum's spire clustered with two rings of smaller spires, the domed hall
  // before it and the pillared entrance hall in front.
  f.add(at(nagaraTemple({ w: 11, h: 21, m: PINK, shade: SHADE, plinth: 2, urus: detail.low ? 4 : 8, friezeSpacing: detail.low ? 2 : 1, halls: [[14, 7, 5, 'dome'], [12, 6, 4]] }), -26, 0, -30));
  // The great seated Shiva in the garden, about 25 m tall (see js/details/nageshwar-temple.js)
  f.add(at(mahayogiShiva(), 26, 0, 10));
  // Neem trees behind the temple and along the lawn's far side, and coconut palms along the outer path.
  g.add(trees([...along(9, [-60, -70], [40, -70]), ...along(7, [-56, 30], [-56, 86])], { kind: 'neem', seed: 11 }));
  g.add(trees([...along(12, [-80, -80], [-80, 80]), ...along(12, [80, -80], [80, 30])], { kind: 'palm', seed: 12 }));
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}
