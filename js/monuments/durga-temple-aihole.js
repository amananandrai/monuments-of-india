import * as THREE from 'three';
import { mesh, box, at, planPrism, doubleSided, curvedBand } from '../helpers.js';
import { apsePlan as apse, brokenSpire, chandrashala } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial, frieze } from '../parts/components.js';
import { addDetails, pillarSpots, STONE as S, SHADE as Sd, DIMS } from '../details/durga-temple-aihole.js';

// A roof of stone slabs sloping up from the plan `outer` at y0 to the plan `inner` at y1 (two rings
// of as many [x, z] points), with a fascia `edge` deep hanging from its outer edge.
function slabRoof(outer, inner, y0, y1, edge, m) {
  const pos = [], n = outer.length;
  for (let k = 0; k < n; k++) {
    const [ax, az] = outer[k], [bx, bz] = outer[(k + 1) % n], [cx, cz] = inner[(k + 1) % n], [dx, dz] = inner[k];
    pos.push(ax, y0, az, bx, y0, bz, cx, y1, cz, ax, y0, az, cx, y1, cz, dx, y1, dz);
    pos.push(ax, y0 - edge, az, bx, y0 - edge, bz, bx, y0, bz, ax, y0 - edge, az, bx, y0, bz, ax, y0, az);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return mesh(geo, doubleSided(m));
}

// The Durga temple at Aihole, of the early Chalukyas, about 700–730. Its name comes not from the
// goddess but from durg, a fort, for the lookout the Marathas later built on its roof. It faces east
// (+z; north is +x). From photographs and the measured plan: on a tall moulded plinth
// (adhishthana) the sanctum and its hall are apsidal, rounded at the back like a Buddhist chaitya
// hall; round them, and across the front, runs an open gallery of plain square pillars with heavy
// brackets, a stone seat-back between them, under a roof of sloping slabs in two tiers; before
// them a narrower pillared porch, reached by two flights that climb from either side to a landing
// on the axis; the whole about 18 m by 11 m with the porch and stairs reaching 7 m further. Over
// the sanctum, at the centre of the apse, stands the stump of a curved Nagara (latina) tower, its
// upper storeys and its amalaka fallen; the amalaka lies beside the temple.
export function buildDurgaTempleAihole() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { P, W, z0, z1, PW, pz, sz, PH, hz, HW } = DIMS, c = z0 + W / 2;
  // The outline of the body and porch together, grown by d on every face.
  const plan = (d, n = 14) => { const p = apse(W + 2 * d, z0 - d, z1 + d, n); return [p[0], [PW / 2 + d, z1 + d], [PW / 2 + d, pz + d], [-PW / 2 - d, pz + d], [-PW / 2 - d, z1 + d], ...p.slice(1)]; };
  // The plinth, course over course: a footing, a plain course, a rounded one, the recessed band
  // that carries the carving, and the floor slab.
  f.add(planPrism(plan(0.32), 0, 0.3, Sd), planPrism(plan(0.14), 0.3, 0.55, S), planPrism(plan(0.24), 0.85, 0.28, Sd));
  f.add(planPrism(plan(0), 1.13, P - 1.43, S), planPrism(plan(0.07), 1.82, 0.3, frieze(Sd)), planPrism(plan(0.2), P - 0.3, 0.3, S));
  // The stairs before the porch: a landing on the axis, a flight up to it from either side, and
  // the low panelled wall in front of them.
  f.add(box(2.6, P, sz - pz, S, 0, 0, (pz + sz) / 2), box(PW + 0.8, 1.25, 0.8, Sd, 0, 0, sz + 0.4), box(PW + 1, 0.15, 1, S, 0, 1.25, sz + 0.4));
  for (const s of [-1, 1]) f.add(at(steps(sz - pz, P, 8, S, 0.27), s * 1.3, 0, (pz + sz) / 2).rotateY(s * Math.PI / 2));
  // The sanctum and hall within: an apsidal wall on a moulded base, its door on the east with a
  // frame of six bands.
  const y1 = P + PH;
  f.add(planPrism(apse(HW, c - HW / 2, hz), P, PH - 0.4, S), planPrism(apse(HW + 0.3, c - HW / 2 - 0.15, hz + 0.15), P, 0.4, Sd));
  f.add(at(templeDoorway(1.3, 2.5, { m: S, bands: 6, bw: 0.17, guardians: false, hood: false }), 0, P, hz + 0.02));
  // The gallery's pillars: plain square shafts, each under a long bracket with rolled ends that
  // carries the roof beam.
  const cols = new THREE.Group();
  for (const p of pillarSpots()) {
    const col = at(new THREE.Group(), p.x, P, p.z);
    col.add(box(0.62, 0.3, 0.62, S), box(0.5, PH - 0.85, 0.5, S, 0, 0.3, 0), box(0.95, 0.2, 0.54, S, 0, PH - 0.85, 0), box(1.45, 0.25, 0.54, S, 0, PH - 0.65, 0));
    col.rotation.y = p.a;
    cols.add(col);
  }
  f.add(mergeByMaterial(cols));
  // The seat-back (kakshasana) between the pillars, round the gallery and the porch as far as the
  // head of the stairs.
  const edge = plan(-0.28, 18), seat = [...edge.slice(3), edge[0], edge[1], edge[2]], path = [[-1.3, pz - 0.28], ...seat, [1.3, pz - 0.28]];
  const pts = path.map(([x, z], k) => {
    const a = path[Math.max(0, k - 1)], b = path[Math.min(path.length - 1, k + 1)];
    const n = [[a, [x, z]], [[x, z], b]].map(([u, v]) => { const l = Math.hypot(v[0] - u[0], v[1] - u[1]) || 1; return [-(v[1] - u[1]) / l, (v[0] - u[0]) / l]; });
    if (k === 0) n[0] = n[1]; if (k === path.length - 1) n[1] = n[0];
    const q = 1 + n[0][0] * n[1][0] + n[0][1] * n[1][1];
    return [x, z, (n[0][0] + n[1][0]) / q, (n[0][1] + n[1][1]) / q];
  });
  f.add(curvedBand(pts, -0.16, 0.16, P, P + 0.9, S), curvedBand(pts, -0.24, 0.24, P + 0.9, P + 1.02, Sd));
  // The roofs. Over the gallery and the porch, beams and a ceiling of slabs, then a roof of slabs
  // sloping down from the hall to a thick rounded eave; over the hall's aisles a second sloping tier
  // above a carved parapet; over its nave a flat roof, a step higher towards the front.
  f.add(planPrism(plan(-0.22), y1 - 0.4, 0.4, Sd), planPrism(plan(0.66), y1, 0.26, Sd));
  f.add(slabRoof(plan(0.7), plan(-2), y1 + 0.3, y1 + 0.95, 0.3, S));
  f.add(planPrism(apse(7, c - 3.5, pz - 1.1), y1 + 0.2, 0.88, frieze(S)));
  f.add(planPrism(apse(7.56, c - 3.78, pz - 0.82), y1 + 1.08, 0.2, Sd), slabRoof(apse(7.6, c - 3.8, pz - 0.8), apse(4.6, c - 2.3, pz - 2.3), y1 + 1.3, y1 + 1.75, 0.22, S));
  f.add(planPrism(apse(4.4, c - 2.2, pz - 2.4), y1 + 1.2, 0.9, S), planPrism(apse(4.9, c - 2.45, pz - 2.15), y1 + 2.1, 0.3, Sd), box(3.6, 0.28, 7, S, 0, y1 + 2.4, 1.5));
  // The tower over the sanctum, at the centre of the apse: a curved Nagara spire of which the lower
  // storeys stand, on a square footing; ribbed amalakas mark the storeys at its corners, and
  // horseshoe arches climb the middle of each face, a large one (the sukanasa) on the east.
  const tw = 4.9, th = 8.4, ty = y1 + 1.7, sh = th / 14, tower = at(new THREE.Group(), 0, ty, c);
  tower.add(box(tw + 0.5, 0.45, tw + 0.5, Sd, 0, -0.45, 0), brokenSpire(tw, th, 0.64, S, { n: 14, rubble: Sd }));
  for (const i of [1, 4, 7]) {
    const w = tw * (1 - 0.6 * Math.pow(i / 14, 1.45));
    for (const sx of [-1, 1]) for (const sz2 of [-1, 1]) {
      const am = mesh(new THREE.SphereGeometry(w * 0.1, 10, 6), Sd, sx * w * 0.4, (i + 0.5) * sh, sz2 * w * 0.4);
      am.scale.y = 0.5;
      tower.add(am);
    }
    for (let k = 0; k < 4; k++) { const ch = at(chandrashala(i === 1 && k === 0 ? 0.85 : 0.36, S, 0.22), 0, (i === 1 && k === 0 ? 2.1 : i + 0.6) * sh, w / 2 + 0.01), face = new THREE.Group(); face.add(ch); face.rotation.y = k * Math.PI / 2; tower.add(face); }
  }
  f.add(tower);
  addDetails(f, g);
  // From the north-east: the stairs and porch, the gallery and the rounded back with its tower.
  return { group: g, focus: f, view: [0.95, 0.36, 0.85], zoom: 0.8 };
}
