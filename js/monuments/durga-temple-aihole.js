import * as THREE from 'three';
import { mesh, box, at, inst, unitBox, planPrism, planBand, flat } from '../helpers.js';
import { carvedPillar, apsePlan as apse } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE as S, SHADE as Sd, DIMS } from '../details/durga-temple-aihole.js';

// The Durga temple at Aihole, of the early Chalukyas, about 700–730. Its name comes not from the
// goddess but from durg, a fort, for the lookout the Marathas later built on its roof. It faces east
// (+z). On a tall moulded plinth (adhishthana), the sanctum and its hall are apsidal, rounded at the
// back like a Buddhist chaitya hall; round them runs an open gallery of pillars under a sloping roof,
// and before them a pillared porch, the whole about 18 m by 11 m with the porch reaching 7 m further.
// Stairs climb to the porch from either side. Over the rounded sanctum rises a short curved Nagara
// tower, its amalaka fallen and lying beside the temple.
export function buildDurgaTempleAihole() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { P, W, z0, z1, pz, PH, CH } = DIMS;
  // The plinth: the apsidal body and the porch in front, its moulded courses.
  const outer = apse(W, z0, z1), porch = [[W / 2 - 1.5, pz], [-W / 2 + 1.5, pz], [-W / 2 + 1.5, z1 - 0.01], [W / 2 - 1.5, z1 - 0.01]];
  f.add(planPrism(outer, 0, P, Sd), planPrism(porch, 0, P, Sd));
  f.add(planPrism(apse(W + 0.3, z0 - 0.15, z1), P - 0.3, 0.3, S));
  for (const [y, h, p] of [[0.15, 0.35, 0.18], [0.85, 0.3, 0.08]]) f.add(planBand(outer, y, h, p, S));
  f.add(planPrism([[W / 2 - 1.35, pz + 0.15], [-W / 2 + 1.35, pz + 0.15], [-W / 2 + 1.35, z1], [W / 2 - 1.35, z1]], P - 0.3, 0.3, S));
  // The sanctum and hall within: an apsidal wall CH high, its door on the east.
  const inner = apse(W - 4.4, z0 + 2.2, z1 - 0.4);
  f.add(planPrism(inner, P, CH, S));
  f.add(at(templeDoorway(1.5, 3, { m: S, guardianH: 1.6, bands: 4 }), 0, P, z1 - 0.38));
  // The gallery: pillars round the edge of the plinth, and two rows across the porch.
  const cols = new THREE.Group(), ring = apse(W - 1.1, z0 + 0.55, z1 - 0.55, 8);
  for (let i = 2; i < ring.length; i++) cols.add(at(carvedPillar(PH, S), ring[i][0], P, ring[i][1]));
  for (let k = 0; k < 4; k++) { const z = z0 + W / 2 + 0.6 + k * ((z1 - 0.6 - z0 - W / 2 - 0.6) / 3); for (const s of [-1, 1]) cols.add(at(carvedPillar(PH, S), s * (W / 2 - 0.55), P, z)); }
  for (const z of [z1 + 0.6, (z1 + pz) / 2, pz - 0.6]) for (const x of [-2.6, -0.9, 0.9, 2.6]) cols.add(at(carvedPillar(PH, S), x, P, z));
  f.add(mergeByMaterial(cols));
  // The gallery's roof: a thick slab sloping down from the cella wall to an eave over the pillars; the
  // porch's flat roof; and the higher roof of the hall, with a low parapet.
  const y1 = P + PH;
  f.add(planPrism(apse(W + 0.5, z0 - 0.25, z1), y1, 0.45, Sd), planPrism(apse(W - 0.6, z0 + 0.3, z1), y1 + 0.45, 0.4, S));
  f.add(planPrism([[W / 2 - 1.2, pz + 0.3], [-W / 2 + 1.2, pz + 0.3], [-W / 2 + 1.2, z1 + 0.01], [W / 2 - 1.2, z1 + 0.01]], y1, 0.7, Sd));
  f.add(planPrism(apse(W - 4, z0 + 2, z1 - 0.2), y1 + 0.85, CH - PH - 0.85 + 0.6, S), planPrism(apse(W - 3.6, z0 + 1.8, z1), P + CH + 0.6, 0.35, Sd));
  // Over the gallery's roof, a ring of heavy slabs against the hall's wall.
  const slabs = [];
  const slope = apse(W - 2.2, z0 + 1.1, z1, 10);
  for (let i = 2; i < slope.length; i++) {
    const [x, z] = slope[i], [x2, z2] = slope[i - 1], a = Math.atan2(x - x2, z - z2);
    slabs.push([(x + x2) / 2, y1 + 0.85, (z + z2) / 2, 1.9, 0.25, Math.hypot(x - x2, z - z2) + 0.1, a]);
  }
  f.add(inst(unitBox(), slabs, Sd));
  // The tower over the sanctum, at the centre of the apse: a short curved Nagara shikhara of
  // diminishing courses, its top bare where the amalaka has fallen.
  const tz = z0 + W / 2, ty = P + CH + 0.95, tw = 5;
  for (let i = 0; i < 6; i++) {
    const w = tw * (1 - 0.06 * i - 0.008 * i * i);
    f.add(box(w * 0.86, 0.55, w * 0.86, S, 0, ty + i * 0.55, tz), box(w, 0.45, w * 0.55, S, 0, ty + i * 0.55, tz), box(w * 0.55, 0.45, w, S, 0, ty + i * 0.55, tz));
  }
  f.add(box(tw * 0.52, 0.4, tw * 0.52, Sd, 0, ty + 3.3, tz));
  // Its gable (sukanasa) against the tower's east face, a horseshoe arch.
  const kudu = mesh(new THREE.TorusGeometry(1.2, 0.3, 4, 10, Math.PI), flat(S), 0, ty + 0.4, tz + tw / 2 + 0.1);
  f.add(kudu, box(2.7, 1.2, 0.5, S, 0, ty, tz + tw / 2));
  // Stairs up to the porch from north and south.
  for (const s of [-1, 1]) f.add(at(steps(1.8, P, 8, S), s * (W / 2 - 1.5), 0, pz - 1.4).rotateY(s * Math.PI / 2));
  addDetails(f, g);
  // From the south-east: the porch, the gallery and the rounded back with its tower.
  return { group: g, focus: f, view: [0.95, 0.36, 0.85], zoom: 0.8 };
}
