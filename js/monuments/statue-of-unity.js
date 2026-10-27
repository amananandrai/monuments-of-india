import * as THREE from 'three';
import { M, V, mesh, box, cyl, lathe, group, at, limb } from '../helpers.js';

export function buildStatue() {
  const g = new THREE.Group(), f = new THREE.Group(), s = new THREE.Group();
  g.add(f);
  f.add(box(82, 22, 82, M.concrete));
  f.add(box(62, 20, 62, M.concrete, 0, 22));
  f.add(box(46, 16, 46, M.marbleShade, 0, 42));
  const B = M.bronze;
  for (const x of [-7.5, 7.5]) s.add(box(10, 4.5, 17, B, x, 0, 3));
  const dhoti = lathe([[17.5, 3], [19.5, 9], [18.4, 30], [16.8, 55], [16, 80], [15.2, 90], [0, 90]], B, 48);
  dhoti.scale.z = 0.62;
  s.add(dhoti);
  const torso = lathe([[15.2, 88], [16.5, 102], [18.5, 120], [20, 133], [17, 141], [7, 145], [0, 145]], B, 48);
  torso.scale.z = 0.62;
  s.add(torso);
  const shawl = lathe([[21.2, 108], [21.8, 122], [22.2, 134], [18.6, 142], [8, 146], [0, 146.2]], B, 48);
  shawl.scale.z = 0.7;
  s.add(shawl);
  for (const side of [-1, 1]) {
    const sh = V(side * 21, 136, 0), el = V(side * 24, 110, 1.5), wr = V(side * 22.5, 88, 3);
    s.add(at(mesh(new THREE.SphereGeometry(6.2, 20, 14), B), sh.x, sh.y, sh.z));
    s.add(limb(sh, el, 6.2, 5.2, B), limb(el, wr, 5.2, 4.2, B));
    const hand = mesh(new THREE.SphereGeometry(4.6, 18, 12), B, side * 22.4, 83.5, 3.2);
    hand.scale.set(0.8, 1.25, 0.9);
    s.add(hand);
  }
  s.add(cyl(6.5, 7.2, 12, B, 0, 143, 0, 24));
  const head = mesh(new THREE.SphereGeometry(11, 32, 24), B, 0, 165, 0.8);
  head.scale.set(0.86, 1.1, 0.95);
  s.add(head);
  s.add(box(2.2, 4, 3.2, B, 0, 160, 10.2));
  for (const x of [-9.4, 9.4]) s.add(box(1.6, 5, 3, B, x, 162, 0.2));
  s.scale.setScalar(182 / 177.4);
  f.add(at(s, 0, 58, 0));
  g.add(box(160, 0.3, 160, M.grass));
  g.add(box(2400, 0.4, 2400, M.water, 0, -0.32, 0));
  return { group: g, focus: f };
}
