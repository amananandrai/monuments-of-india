import * as THREE from 'three';
import { M, at, flag, mat, box, cyl, lathe, inst, unitBox, unitCyl, kalash } from '../helpers.js';
import { lampPosts, garland, along } from './realism.js';
import { mergeByMaterial } from './components.js';

// The Mahakal Lok corridor (first phase opened 2022) along the north shore of the Rudra Sagar:
// a broad sandstone walk lined both sides with carved red sandstone pillars, each topped by a
// small figure; a high wall of mural panels on its far side telling the stories of Shiva; the
// lotus pond (Kamal Kund) halfway along; and at its east end the Nandi Dwar, the gate by which
// pilgrims come in. The model's lake lies at x -55 to 15, z -72 to -52, and the town's house
// columns at x = ±80, so the corridor runs x -72 to 62 at z = -84.
const SAND = mat('#c9a17a', 0.9), RED = mat('#b46a4c', 0.85), CARVED = mat('#c98a64', 0.8);
const MURALS = ['#c46b3a', '#3f6f8f', '#d2a24a', '#6a8f5a', '#a54a4a'].map((c) => mat(c, 0.85));
function mahakalLok() {
  const g = new THREE.Group(), Z = -84, X0 = -72, X1 = 62, POND = -36;
  g.add(box(X1 - X0, 0.35, 15, SAND, (X0 + X1) / 2, 0, Z));
  // The pillars, in pairs across the walk, kept clear of the pond.
  const shafts = [], caps = [], figs = [];
  for (let x = X0 + 2; x <= X1 - 6; x += 4) {
    if (Math.abs(x - POND) < 10) continue;
    for (const s of [-1, 1]) {
      const z = Z + s * 6;
      shafts.push([x, 0.35, z, 0.9, 5.2, 0.9]);
      caps.push([x, 0.35, z, 1.4, 0.6, 1.4], [x, 5.55, z, 1.4, 0.55, 1.4]);
      figs.push([x, 6.1, z, 0.8, 1.6, 0.8]);
    }
  }
  g.add(inst(unitBox(), shafts, RED), inst(unitBox(), caps, CARVED), inst(unitCyl(8), figs, M.bronze));
  // The mural wall behind the north row of pillars: panels of painted relief in a sandstone frame.
  g.add(box(X1 - X0, 7.5, 1.2, SAND, (X0 + X1) / 2, 0, Z - 9.5), box(X1 - X0 + 1, 0.6, 1.8, CARVED, (X0 + X1) / 2, 7.5, Z - 9.5));
  for (let x = X0 + 3, k = 0; x < X1 - 2; x += 5, k++) g.add(box(3.8, 4.4, 0.12, MURALS[k % MURALS.length], x, 1.8, Z - 8.85));
  // The Kamal Kund: a round pond with a stone lotus at its middle.
  g.add(cyl(9.5, 9.5, 0.5, SAND, POND, 0, Z, 40), cyl(8.6, 8.6, 0.56, M.water, POND, 0, Z, 40));
  g.add(at(lathe([[0, 0], [1.6, 0.2], [2.6, 1.2], [2.2, 1.6], [1.2, 1.1], [0, 1.3]], M.marble, 16), POND, 0.5, Z));
  // The Nandi Dwar: two tall pylons and a carved lintel, with kalash finials on top.
  const gx = X1 + 2;
  for (const s of [-1, 1]) g.add(box(5, 14, 4.6, RED, gx, 0, Z + s * 6.4), box(5.8, 0.8, 5.4, CARVED, gx, 14, Z + s * 6.4), at(kalash(1.4), gx, 14.8, Z + s * 6.4));
  g.add(box(5, 3, 8.2, CARVED, gx, 10.4, Z), box(5.4, 0.7, 17.6, RED, gx, 13.4, Z), at(kalash(1.8), gx, 14.1, Z));
  return mergeByMaterial(g);
}

// Mahakaleshwar at Ujjain: saffron flags along the colonnade, garlands on the gate, lamps on the
// approach, and the Mahakal Lok corridor beyond the lake.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  for (const x of [-30, -10, 10, 30]) f.add(at(flag(5, SAFFRON), x, 5.8, 50));
  g.add(lampPosts([...along(6, [-70, 56], [70, 56]), ...along(6, [-70, -56], [70, -56])]));
  f.add(garland([-6, 4.6, 50.6], [6, 4.6, 50.6], { sag: 0.8, strands: 2 }));
  g.add(mahakalLok());
  for (const x of [-60, -12, 20, 52]) g.add(at(flag(6, SAFFRON), x, 0.35, -84));
}
