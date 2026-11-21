import * as THREE from 'three';
import { M, at, flag, mat, box, cyl, mesh, pidaRoof, kalash } from '../helpers.js';
import { pilasters, railing, mouldings, frieze, placeAll, mergeByMaterial } from '../parts/components.js';
import { trabeateGate } from '../parts/temples.js';
import { miniSpireGeo } from '../parts/sculpture.js';
import { lampPosts, trees, along } from '../parts/realism.js';

// Somnath, finer architecture. Dimensions follow js/monuments/somnath-temple.js: the sea wall a
// block 110 × 3 × 4 at z = -38, the Baan Stambh on it at x = 30 (a shaft 9 high from y = 3 under a
// gilt cone); the temple at z = -24, its stair reaching to about z = 34, the paving to z = 80.
// The sea wall becomes a promenade: a moulded base and pilasters on its land face, a coping and a
// balustrade along its sea edge. The Baan Stambh stands on a moulded pedestal, banded, its arrow
// pointing out over the sea to the south, where no land lies between it and the pole. And at the
// head of the plaza stands the Digvijay Dwar, the gateway to the temple: a gatehouse of the same
// stone under a stepped roof set with small spires.
const STONE = mat('#d8b07a', 0.85);
const SHADE = mat('#b8905c', 0.9);
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });

function seaWall(d) {
  d.add(box(110, 0.5, 0.25, SHADE, 0, 0, -35.88), box(110.6, 0.4, 4.6, SHADE, 0, 3, -38));
  d.add(at(pilasters(106, 22, 0.6, 2.2, 0.12, STONE), 0, 0.55, -36));
  d.add(at(railing(109, 1, 0.24, STONE, 2.2), 0, 3.4, -39.7));
  // The Baan Stambh: pedestal, bands and the arrow over the sea.
  const b = at(new THREE.Group(), 30, 3.4, -38);
  b.add(mouldings(2.6, 2.6, [[0, 0.5, 0.15, SHADE], [0.5, 0.6, 0.05, frieze(STONE)], [1.1, 0.3, 0.2, SHADE]], STONE), box(2.6, 1.4, 2.6, STONE));
  for (const y of [3.2, 5.6, 7.6]) b.add(cyl(1.02, 1.02, 0.3, SHADE, 0, y, 0, 10));
  const arrow = new THREE.Group();
  arrow.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8).rotateX(Math.PI / 2), M.gild));
  arrow.add(mesh(new THREE.ConeGeometry(0.22, 0.6, 8).rotateX(-Math.PI / 2), M.gild, 0, 0, -1.9));
  for (const a of [0, Math.PI / 2]) { const fl = box(0.04, 0.4, 0.5, M.gild, 0, -0.2, 1.4); fl.rotation.z = a; arrow.add(fl); }
  b.add(at(arrow, 0, 11.2, 0));
  d.add(b);
}

// The Digvijay Dwar at the head of the plaza, z = 66.
function dwar(d) {
  const G = at(new THREE.Group(), 0, 0, 66);
  G.add(trabeateGate(18, 8.5, 6, 4.6, 6.2, { m: STONE, trim: SHADE, beasts: 'elephant' }));
  G.add(mouldings(18, 6, [[6.6, 0.3, 0.15, SHADE], [7.0, 0.8, 0.05, frieze(STONE)]], STONE));
  for (const a of [0, Math.PI]) for (const x of [-7.8, -4.4, 4.4, 7.8]) {
    const p = at(pilasters(0, 1, 0.6, 6.2, 0.14, STONE), x, 0.2, 0);
    p.rotation.y = a;
    p.position.z = a ? -3 : 3;
    G.add(p);
  }
  G.add(box(19, 0.6, 7, SHADE, 0, 8.5));
  const roof = pidaRoof(16, 6, 4, 0.9, STONE, SHADE);
  G.add(at(roof, 0, 9.1, 0));
  const spires = [];
  for (const x of [-6.6, -3.3, 3.3, 6.6]) for (const z of [-2.2, 2.2]) spires.push([x, 9.1, z, 0, 0.9]);
  G.add(placeAll(miniSpireGeo(), spires, STONE));
  const top = 9.1 + roof.userData.top;
  G.add(at(kalash(0.9, M.gold), 0, top, 0), at(flag(4, SAFFRON), 0, top + 1.6, 0));
  d.add(G);
}

// Somnath on the Arabian Sea: saffron flags, and the lamps of the promenade along the sea wall by
// the Baan Stambh (the arrow pillar that marks no land between here and the South Pole).
export function addDetails(f, g) {
  const d = new THREE.Group();
  seaWall(d);
  dwar(d);
  f.add(mergeByMaterial(d));
  g.add(lampPosts(along(10, [-54, -36.4], [54, -36.4]), { y: 3.4 }));
  for (const x of [-40, -20, 20, 40]) f.add(at(flag(6, SAFFRON), x, 0, 40));
  // Coconut palms on the landward side of the platform, clear of the steps.
  g.add(trees([...along(4, [-68, 6], [-68, 66]), ...along(4, [68, 6], [68, 66])], { kind: 'palm', seed: 4, y: 0.2 }));
}
