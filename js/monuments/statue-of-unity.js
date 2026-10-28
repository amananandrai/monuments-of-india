import * as THREE from 'three';
import { M, V, mesh, box, at, ellipsoid, capsule, tube, smoothLathe, drape, sheet, face, fingers } from '../helpers.js';

// Sardar Patel, standing in dhoti, kurta and a shawl over the shoulders, arms at his sides.
function patel(B) {
  const s = new THREE.Group();
  // Feet in sandals, just showing under the dhoti
  for (const x of [-7.5, 7.5]) s.add(ellipsoid(5, 2.4, 8.5, B, x, 2.2, 4.5));
  // Dhoti, flaring at the hem, with deep vertical folds
  const dhoti = drape(smoothLathe([[17.8, 3], [19.6, 8], [18.6, 26], [17.2, 50], [16.2, 74], [15.4, 90], [0.1, 90]], B), 22, 0.06, 3, 75);
  dhoti.scale.z = 0.62;
  // Kurta over the torso, and the shawl draped round the shoulders
  const torso = smoothLathe([[15.4, 86], [16.6, 100], [18.4, 118], [19.8, 131], [17.4, 140], [8, 145], [0.1, 145.5]], B);
  torso.scale.z = 0.62;
  const shawl = drape(smoothLathe([[19.6, 104], [21.6, 114], [22.4, 128], [21.4, 137], [17.6, 143], [8.6, 146.4], [0.1, 146.8]], B), 16, 0.05, 104, 136);
  shawl.scale.z = 0.7;
  s.add(dhoti, torso, shawl);
  // The shawl's end, thrown across the chest from the left shoulder
  s.add(tube([[16, 140, 6], [6, 130, 13], [-6, 118, 12.5], [-14, 108, 9]], 3, B, 48, 14));
  // Arms in loose sleeves, hanging at the sides, with hands half closed
  for (const side of [-1, 1]) {
    const sh = V(side * 20.5, 136, 0.5), el = V(side * 23.6, 111, 2), wr = V(side * 22.4, 89, 3.5);
    s.add(ellipsoid(6.6, 6.2, 5.6, B, sh.x, sh.y, sh.z));
    s.add(capsule(sh, el, 6.2, B, 5.4), capsule(el, wr, 5.4, B, 4.3));
    const hand = ellipsoid(3.3, 5.2, 3.9, B, side * 22.2, 83.4, 4);
    hand.rotation.z = side * 0.08;
    s.add(hand, ellipsoid(1.1, 2.6, 1.2, B, side * 20.4, 84.6, 6.4));
    // Fingers along the bottom of the hand, curling in towards the thigh
    s.add(fingers(V(side * 22.4, 79.4, 1.6), V(side * 22.4, 79.4, 5.6), V(-side * 0.6, -0.8, 0).normalize(), 2.5, 0.95, B));
  }
  // Neck and head: the bare crown, heavy brow and broad jaw of the 1949 portrait, clean-shaven, ears
  s.add(capsule(V(0, 142, 0), V(0, 153, 0.8), 6.4, B, 6.8));
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
  return { group: g, focus: f };
}
