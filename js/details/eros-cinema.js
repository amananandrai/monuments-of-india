import * as THREE from 'three';
import { M, mat, box, cyl, at } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { gothicWindow } from '../parts/colonial.js';
import { trees, lampPosts, traffic, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, CREAM, RED } from '../monuments/eros-cinema.js';

const STONE = mat('#b8a888', 0.88);

// Eros, finer detail. From photographs: curved balconies with steel rails at the ends of the
// wings; a frieze of red stone over the shopfronts; flagstaff and lamps. Measures follow
// js/monuments/eros-cinema.js.
function architecture(f) {
  const { WL, WH, R, A } = P, d = new THREE.Group();
  for (const s of [-1, 1]) {
    const OFF = R - 1.2, n = [s * Math.cos(A), Math.sin(A)], u = [s * Math.sin(A), -Math.cos(A)], ry = s * (Math.PI / 2 - A);
    // Rounded balconies on each upper floor, two thirds of the way back along each wing.
    for (let fl = 1; fl < 5; fl++) {
      const t = WL * 0.72, x = n[0] * OFF + u[0] * t, z = n[1] * OFF + u[1] * t, y = fl * 4 + 0.4;
      const b = new THREE.Group();
      b.add(box(6, 0.25, 1.6, CREAM, 0, 0, 0.8), box(6, 0.9, 0.08, M.steel, 0, 0.25, 1.56));
      b.add(cyl(0.8, 0.8, 0.25, CREAM, -3, 0, 0.8, 12), cyl(0.8, 0.8, 0.25, CREAM, 3, 0, 0.8, 12));
      b.rotation.y = ry;
      b.position.set(x, y, z);
      d.add(b);
    }
  }
  d.add(cyl(R + 3.3, R + 3.3, 0.6, RED, 0, 4.8, 0, 48));
  void WH;
  f.add(mergeByMaterial(d));
}

// A road along one of the wings: a carriageway and its pavement, with traffic in both directions.
function road(s, len, off, width) {
  const { A } = P, n = [s * Math.cos(A), Math.sin(A)], u = [s * Math.sin(A), -Math.cos(A)], ry = s * (Math.PI / 2 - A);
  const r = new THREE.Group();
  r.add(box(len, 0.06, width, M.asphalt, 0, 0, 0), box(len, 0.18, 4.5, M.path, 0, 0, -width / 2 - 2.25));
  r.add(traffic([[-width / 4, 1], [width / 4, -1]], -len / 2, len / 2, { gap: 18, seed: 3 + s, taxis: 0.35, buses: 0.12, trucks: 0.02, colours: ['#e8e6e1', '#3c4046', '#b9bcc0', '#8c2f2a'] }));
  r.add(trees(along(8, [-len / 2 + 10, -width / 2 - 2.5], [len / 2 - 40, -width / 2 - 2.5]), { kind: 'peepal', seed: 5 + s, h: 13 }));
  r.add(lampPosts(along(7, [-len / 2 + 6, -width / 2 - 0.6], [len / 2 - 10, -width / 2 - 0.6])));
  r.rotation.y = ry;
  r.position.set(n[0] * (off + width / 2 + 4.5) + u[0] * (len / 2 - 30), 0, n[1] * (off + width / 2 + 4.5) + u[1] * (len / 2 - 30));
  return r;
}

// Churchgate station across the junction: a long stone front under a central gable and tower,
// simplified, facing the cinema.
function churchgate(z) {
  const c = new THREE.Group();
  c.add(box(90, 13, 22, STONE, 0, 0, z), box(91, 0.8, 23, CREAM, 0, 13, z), box(14, 26, 14, STONE, 0, 0, z - 2));
  c.add(at(new THREE.Mesh(new THREE.ConeGeometry(7, 9, 4).rotateY(Math.PI / 4), STONE), 0, 30.5, z - 2));
  for (let k = -5; k <= 5; k++) if (k) c.add(at(gothicWindow(2.2, 5, { m: STONE, trim: CREAM }), k * 7.6, 3, z - 11.01).rotateY(Math.PI));
  return mergeByMaterial(c);
}

// Eros on its corner at Churchgate: the two roads along its wings meeting at the junction in
// front, Churchgate station across it, the Art Deco blocks of the reclaimed land round about, rain
// trees and street lamps along the pavements, and the city's traffic.
export function addDetails(f, g) {
  architecture(f);
  const { R } = P;
  g.add(box(600, 0.05, 600, M.asphalt, 0, -0.06, 0));
  g.add(box(70, 0.06, 40, M.asphalt, 0, 0.002, 40));
  for (const s of [-1, 1]) g.add(road(s, 200, R - 1.2, 16));
  g.add(cyl(R + 6, R + 6, 0.18, M.path, 0, 0, 0, 48));
  g.add(churchgate(104));
  g.add(traffic([[66, -1], [72, 1]], -120, 120, { gap: 16, seed: 9, taxis: 0.35, buses: 0.12, trucks: 0.02 }));
  g.add(cityAround([-110, 110, -150, 64], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, gap: 10, storeys: [4, 7], seed: 21, fine: !detail.low,
    keep: [[-300, 300, 30, 300]],
    paint: ['#efe6d2', '#e9dcc0', '#d9c9a8', '#e4d6c8', '#cfd8d4', '#f1e9d8'] }));
}
