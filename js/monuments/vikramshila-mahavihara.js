import * as THREE from 'three';
import { box, at } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { addDetails, BRICK, BRICK_DARK, PLAQUES, cross } from '../details/vikramshila-mahavihara.js';

// The central stupa of Vikramshila, founded by the Pala king Dharmapala about 800: a cruciform brick
// stupa on two terraces, about 15 m high as it stands, at the middle of a square monastery 330 m
// across. Its terraces are faced with rows of terracotta plaques between brick mouldings; on each
// of the four sides a chamber projects, entered through a pillared antechamber, with a pillared
// hall (mandapa) before it on the lower terrace. Each chamber held a colossal seated Buddha of
// stucco. The stair, and the way from the monastery's gate, are on the north (+z).
export function buildVikramshila() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The two terraces, each T high; their cross plans (overall span and arm width).
  const T = 2.25, L1 = [54, 30], L2 = [40, 22], C = [24, 14];
  f.add(cross(L1[0], L1[1], T, BRICK, 0, 0), cross(L2[0], L2[1], T, BRICK, 0, T));
  // The plaque bands along the terraces' faces, just proud of the brick.
  f.add(cross(L1[0] + 0.06, L1[1] + 0.06, 0.9, PLAQUES, 0.6, 0), cross(L2[0] + 0.06, L2[1] + 0.06, 0.9, PLAQUES, T + 0.6, 0));
  // The core: a cruciform mass in two set-backs, ruined unevenly at its top.
  const y0 = 2 * T;
  f.add(cross(C[0], C[1], 4.2, BRICK, y0, 0), cross(C[0] - 4, C[1] - 2, 3.4, BRICK_DARK, y0 + 4.2, 0));
  f.add(box(12, 2.2, 10, BRICK, 0, y0 + 7.6, 0), box(8, 1.6, 7, BRICK_DARK, -0.6, y0 + 9.8, 0.4), box(4.4, 0.8, 3.6, BRICK, 0.4, y0 + 11.4, -0.4));
  f.add(box(3.4, 1.3, 2.6, BRICK_DARK, 3.6, y0 + 9.8, -1.8), box(2.6, 1.1, 3, BRICK, -3.8, y0 + 9.8, 2.2), box(2, 0.9, 2.2, BRICK_DARK, -1.6, y0 + 11.4, 1.2));
  // The stair up the north face to the lower terrace, and on to the upper.
  f.add(at(steps(6, T, 9, BRICK_DARK), 0, 0, L1[0] / 2), at(steps(5, T, 9, BRICK_DARK), 0, T, L2[0] / 2));
  for (const s of [-1, 1]) f.add(box(0.8, T + 0.4, 4, BRICK_DARK, s * 3.4, 0, L1[0] / 2 + 2));
  addDetails(f, g, { T, L1, L2, C, y0 });
  // From the north-east, up the stair, with the monastery's broken walls behind.
  return { group: g, focus: f, view: [0.7, 0.3, 1], zoom: 0.62 };
}
