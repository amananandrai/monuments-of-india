import * as THREE from 'three';
import { M, V, box, at, ellipsoid, sheet, face, fingers } from '../helpers.js';
import { patelBody } from '../details/figures.js';
import { addDetails } from '../details/statue-of-unity.js';

// Sardar Patel, standing in dhoti, kurta and a shawl over the shoulders, arms at his sides.
function patel(B) {
  const s = new THREE.Group();
  // The figure as one cast skin: dhoti, kurta, shawl, arms in their sleeves and the neck
  s.add(patelBody(B));
  // Hands half closed at the sides: the thumbs, and fingers curling in towards the thigh
  for (const side of [-1, 1]) {
    s.add(ellipsoid(1.1, 2.6, 1.2, B, side * 20.4, 84.6, 6.4));
    s.add(fingers(V(side * 22.4, 79.4, 1.6), V(side * 22.4, 79.4, 5.6), V(-side * 0.6, -0.8, 0).normalize(), 2.5, 0.95, B));
  }
  // Head: the bare crown, heavy brow and broad jaw of the 1949 portrait, clean-shaven, ears
  s.add(at(face(9.6, 12.4, 10.6, B, { jaw: 0.1 }), 0, 165, 0.8));
  for (const x of [-9.2, 9.2]) s.add(ellipsoid(1.4, 3.4, 2.4, B, x, 164.5, 0.4));
  s.scale.setScalar(182 / 177.4);
  return s;
}

export function buildStatue() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(82, 22, 82, M.concrete));
  f.add(box(62, 20, 62, M.concrete, 0, 22));
  f.add(box(46, 16, 46, M.marbleShade, 0, 42));
  f.add(at(patel(M.bronze), 0, 58, 0));
  g.add(box(160, 0.3, 160, M.grass));
  g.add(sheet(2400, 2400, M.river, 0, 0.08, 0));
  addDetails(f, g);
  return { group: g, focus: f };
}
