import * as THREE from 'three';
import { box, at, inst, unitBox, rng } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE, SHADE, portal, cellNiches, colonnade } from '../details/martand-sun-temple.js';

// The ruins of the Martand Sun Temple, built under Lalitaditya Muktapida in the 8th century on the
// Karewa plateau above Mattan. The court is enclosed by a peristyle 220 by 142 ft (67 x 43 m):
// a high wall lined inside with 84 fluted columns, each before a cell under a trefoil arch in a
// pointed pediment. It is entered through a great gateway in the west (+z here). In the middle
// stands the shrine, about 18 m by 11 m on a high plinth, its roof long gone: a porch and a nave
// before the sanctum, its walls and the tall trefoiled portal of its front standing to about
// 12 m. All of it is of great blocks of grey limestone.
export function buildMartand() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(5);
  g.add(f);
  // The peristyle: outer wall 43 m (x) by 67 m (z), WH high, its cells CD deep.
  const X = 21.5, Z = 33.5, WT = 1.4, WH = 6.2, CD = 3.4;
  const walls = [];
  // The wall in 2.7 m lengths, standing to ragged heights: highest round the gate, lower and broken
  // along the sides.
  const run = (x0, z0, x1, z1, gap = null) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 2.7), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u;
      if (gap && Math.abs(x) < gap) continue;
      const h = WH * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(x * 0.31 + z * 0.17 + 1.3))) + R() * 0.6;
      walls.push([x, 0, z, WT, Math.min(WH, h), len / n + 0.02, ry]);
    }
  };
  for (const s of [-1, 1]) { run(s * X, -Z, s * X, Z); run(-X, s * Z, X, s * Z, s > 0 ? 6.5 : null); }
  g.add(inst(unitBox(), walls, STONE));
  // The cells' columns and trefoil niches, round the inside of the wall: 84 bays in all.
  const cols = [], niches = [];
  const bays = (x0, z0, x1, z1, inward, n, gap = 0) => {
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u;
      if (gap && Math.abs(x) < gap) continue;
      const ix = x + Math.sin(inward) * CD, iz = z + Math.cos(inward) * CD;
      cols.push([ix, 0.6, iz, R() < 0.35 ? 0.25 + R() * 0.5 : 1]);
      niches.push([x + Math.sin(inward) * (WT / 2 + 0.02), 0.6, z + Math.cos(inward) * (WT / 2 + 0.02), 1, 1, 1, inward]);
    }
  };
  bays(X, -Z + 2, X, Z - 2, -Math.PI / 2, 25);
  bays(-X, -Z + 2, -X, Z - 2, Math.PI / 2, 25);
  bays(-X + 2, -Z, X - 2, -Z, 0, 15);
  bays(-X + 2, Z, X - 2, Z, Math.PI, 15, 6.5);
  g.add(colonnade(cols), cellNiches(niches));
  // The colonnade's stylobate, a step round the court.
  const sty = new THREE.Group();
  for (const s of [-1, 1]) sty.add(box(CD + 1.2, 0.6, Z * 2 - 2, SHADE, s * (X - CD / 2), 0, 0), box(X * 2 - 2 * CD - 1.2, 0.6, CD + 1.2, SHADE, 0, 0, s * (Z - CD / 2)));
  g.add(mergeByMaterial(sty));
  // The west gateway: as broad as a temple itself, its portal standing in a deep porch.
  const gate = new THREE.Group();
  gate.add(box(14, 1.2, 9, SHADE, 0, 0, Z), at(steps(6, 1.2, 5, SHADE), 0, 0, Z + 4.5));
  for (const s of [-1, 1]) gate.add(box(3.2, 8.2, 8, STONE, s * 5.2, 1.2, Z));
  gate.add(at(portal(7.2, 10.5, STONE, SHADE), 0, 1.2, Z + 4.05), at(portal(7.2, 10.5, STONE, SHADE), 0, 1.2, Z - 4.05).rotateY(Math.PI));
  g.add(gate);
  // The shrine: plinth (P), then the porch, the nave (antarala) and the sanctum in a line, the
  // sanctum's walls broken down highest at the back, the porch's front portal still standing.
  const P = 1.8, sz = -3;
  f.add(box(14, P, 22, SHADE, 0, 0, sz), box(14.6, 0.3, 22.6, STONE, 0, P - 0.3, sz));
  f.add(at(steps(5.5, P, 8, SHADE), 0, 0, sz + 11));
  // Sanctum (west to east is +z to -z): walls 2.2 m thick, standing 7 to 9 m.
  const sw = new THREE.Group(), y = P;
  sw.add(box(11, 8.6, 2.4, STONE, 0, y, sz - 8.6), box(2.3, 8.2, 6.4, STONE, -4.35, y, sz - 4.8), box(2.3, 7.4, 6.4, STONE, 4.35, y, sz - 4.8));
  sw.add(box(4.8, 1.2, 2.4, STONE, 0, y + 8.6, sz - 8.6), box(2.4, 0.8, 2.4, SHADE, -1.2, y + 9.8, sz - 8.6));
  // The nave and the porch: side walls, the cross wall with its inner portal, and the front portal.
  for (const s of [-1, 1]) sw.add(box(2.1, 6.4 - s * 0.8, 7.6, STONE, s * 4.45, y, sz + 2.2));
  for (const s of [-1, 1]) sw.add(box(1.8, 9.5 - (s + 1) * 0.6, 2.2, STONE, s * 4.6, y, sz + 7.2));
  f.add(mergeByMaterial(sw));
  f.add(at(portal(6.8, 12.2 - P, STONE, SHADE), 0, P, sz + 8.35), at(portal(5.2, 8.6, STONE, SHADE), 0, P, sz - 1.4));
  // The side chapels to north and south of the nave, on their own plinths: low ruins.
  for (const s of [-1, 1]) f.add(box(5.6, 1.2, 6, SHADE, s * 10, 0, sz + 1), box(4.4, 3.6 - s * 0.6, 4.6, STONE, s * 10, 1.2, sz + 1));
  addDetails(f, g, { X, Z, WH, P, sz });
  // From the north-west, over the court, the shrine's front portal before the mountains.
  return { group: g, focus: f, view: [0.75, 0.34, 1], zoom: 1.2 };
}
