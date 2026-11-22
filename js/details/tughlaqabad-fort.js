import * as THREE from 'three';
import { M, mat, box, cyl, at, rng, inst, unitBox } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, asiBoard, scatter, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { RUBBLE, RUBBLE_D, outline } from '../monuments/tughlaqabad-fort.js';

// Tughlaqabad, its setting. The lake that once surrounded the tomb is dry, a flat of grass and
// scrub; the Mehrauli–Badarpur road now cuts across the causeway between the tomb and the fort.
// Inside the walls: the ruins of the citadel and the palace on a rise in the south-west corner,
// rows of broken house walls and the great tanks, all overgrown with babul and ber. Dimensions
// follow js/monuments/tughlaqabad-fort.js: the circuit A by B round (0, CZ), the south gate at
// z = GATE_Z.
function ruins(g, { A, B, CZ }) {
  const R = rng(13), walls = [];
  // Broken house walls in blocks across the city, low and rough.
  for (let k = 0; k < (detail.low ? 120 : 260); k++) {
    const x = (R() * 2 - 1) * A * 0.8, z = CZ + (R() * 2 - 1) * B * 0.75;
    if (Math.abs(x) < 30 && z > CZ + B * 0.5) continue;
    const l = 5 + R() * 12, h = 0.6 + R() * 2.2;
    walls.push([x, 0, z, R() < 0.5 ? l : 0.9, h, R() < 0.5 ? 0.9 : l, 0]);
  }
  g.add(inst(unitBox(), walls, RUBBLE_D));
  // The citadel: a raised square with its own walls and a tower, west of the gate.
  const c = new THREE.Group(), cx = -A * 0.42, cz = CZ + B * 0.35;
  c.add(box(150, 9, 120, RUBBLE_D, cx, 0, cz), box(150.6, 1.2, 120.6, RUBBLE, cx, 9, cz));
  for (const [x, z] of [[-75, -60], [75, -60], [-75, 60], [75, 60]]) c.add(cyl(7, 8.5, 16, RUBBLE, cx + x, 0, cz + z, 18));
  c.add(box(40, 7, 26, RUBBLE, cx - 20, 9, cz - 10), cyl(5, 6, 14, RUBBLE, cx + 30, 9, cz + 20, 16));
  g.add(mergeByMaterial(c));
}

export function addDetails(f, g, dims) {
  const { A, B, CZ, GATE_Z } = dims;
  // Dry grass inside and out, and the flat of the old lake bed round the tomb.
  g.add(box(2 * A + 700, 0.2, 2 * B + 900, mat('#9a9568', 0.97), 0, -0.2, CZ + 120));
  g.add(box(420, 0.06, 220, mat('#979a62', 0.97), 0, 0, -60));
  // The road across the causeway, between the tomb and the fort, with its traffic.
  const rz = -120;
  g.add(box(1600, 0.1, 15, M.asphalt, 0, 0.05, rz), box(1600, 0.02, 0.2, mat('#e8e4d8', 0.6), 0, 0.16, rz));
  g.add(traffic([[rz - 3.6, 1], [rz + 3.6, -1]], -760, 760, { y: 0.15, gap: 30, seed: 4, buses: 0.08, trucks: 0.1 }));
  ruins(g, dims);
  // Babul and ber scrub over the city and the ground round it, clear of the walls, the causeway and
  // the road.
  const inFort = ([x, z]) => { const t = Math.atan2((z - CZ) / B, x / A); const [ox, oz] = outline(t); return Math.hypot(x, z - CZ) < Math.hypot(ox, oz - CZ) - 20; };
  const out = scatter(detail.low ? 60 : 140, [-A - 300, A + 300, -260, 260], { seed: 3, gap: 18, avoid: [[-60, 60, -60, 50], [-10, 10, GATE_Z, -40], [-900, 900, rz - 12, rz + 12]] }).filter((p) => !inFort(p) && Math.hypot(p[0], p[1] - CZ) > 200);
  const inside = scatter(detail.low ? 50 : 120, [-A * 0.85, A * 0.85, CZ - B * 0.8, CZ + B * 0.8], { seed: 5, gap: 22 }).filter(inFort);
  g.add(trees(out, { kind: 'babul', seed: 3 }), trees(inside, { kind: 'ber', seed: 5 }));
  g.add(shrubs(scatter(80, [-200, 200, -110, 160], { seed: 9, gap: 6, avoid: [[-50, 50, -45, 38], [-6, 6, GATE_Z, -40], [-300, 300, rz - 10, rz + 10]] }).map(([x, z]) => [x, z, 1.4]), { dry: true, seed: 9 }));
  g.add(asiBoard('Tughlaqabad Fort', 14, 48, 0));
}
