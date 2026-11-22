import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, archWall } from '../helpers.js';
import { beltCourse, pilasters, frieze, carved, archRing, banglaRoof, mergeByMaterial } from '../parts/components.js';
import { steps, interior } from '../parts/doorways.js';
import { wallWithGaps } from '../parts/temples.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { R, BRICK, BRICK_DARK, TRIM, ROOF, roofY, roofX, roofU, roofV, curtain } from '../monuments/rang-ghar.js';

// Rang Ghar, finer detail. From photographs: pilasters between the arches of both storeys, a
// moulded cornice between the storeys and a carved band under the eaves; panels of floral relief
// between the upper arches; a porch at each end, its arch under a small curved roof, reached by
// steps; ribs across the vault of the roof; and a stone crocodile (makara) at each end of the
// ridge, its snout raised. Dimensions follow R in js/monuments/rang-ghar.js.
const STONE = mat('#8d867a', 0.9), RELIEF = carved(mat('#c4705d', 0.9), 'reliefs');

// A crocodile lying along +x, about 1.9 long: body, raised head with long jaws, legs and a tail.
function crocodile(m) {
  const g = new THREE.Group(), blob = (rx, ry, rz, x, y, z, tilt = 0) => { const o = mesh(new THREE.SphereGeometry(1, 12, 8), m, x, y, z); o.scale.set(rx, ry, rz); o.rotation.z = tilt; return o; };
  g.add(blob(0.62, 0.2, 0.26, 0, 0.2, 0), blob(0.34, 0.15, 0.2, 0.6, 0.32, 0, 0.45), blob(0.42, 0.07, 0.13, 1.0, 0.56, 0, 0.3), blob(0.4, 0.05, 0.12, 0.98, 0.44, 0, 0.12));
  g.add(blob(0.5, 0.1, 0.13, -0.85, 0.16, 0, -0.1), blob(0.3, 0.06, 0.08, -1.45, 0.12, 0, 0.25));
  for (const [x, z] of [[0.35, 0.26], [0.35, -0.26], [-0.35, 0.26], [-0.35, -0.26]]) g.add(blob(0.16, 0.09, 0.1, x, 0.1, z));
  return g;
}

function architecture(f) {
  const d = new THREE.Group(), { L, W, P, H1, C, L2, W2, Y2, TOP } = R;
  // The plinth's moulding, the cornice between the storeys, and a string course at the upper sills.
  d.add(beltCourse(L + 1.6, W + 1.6, P - 0.14, 0.14, 0.1, TRIM));
  d.add(beltCourse(L, W, P + H1, C * 0.45, 0.38, TRIM), beltCourse(L, W, P + H1 + C * 0.45, C * 0.55 - 0.01, 0.22, BRICK_DARK));
  d.add(beltCourse(L2, W2, Y2 + 0.2, 0.12, 0.08, TRIM), beltCourse(L2, W2, TOP - 0.3, 0.14, 0.1, TRIM));
  // Pilasters between the seven arches of each long side, on both storeys, and at the ends.
  for (const a of [0, Math.PI]) {
    d.add(onFace(at(pilasters(L - 0.6, 8, 0.5, H1 - 0.02, 0.12, BRICK_DARK), 0, P, 0), a, W / 2));
    d.add(onFace(at(pilasters(L2 - 0.6, 8, 0.44, TOP - Y2 - 0.32, 0.1, BRICK_DARK), 0, Y2, 0), a, W2 / 2));
    // Floral reliefs in the spandrels over the upper arches, and a carved band under the eaves.
    if (!detail.low) for (let k = 1; k < 6; k++) d.add(onFace(box(1.5, 0.3, 0.04, RELIEF, 0, TOP + 0.04, 0.02), a, W2 / 2, (k - 3) * ((L2 - 1.6) / 7)));
  }
  for (const a of [Math.PI / 2, -Math.PI / 2]) {
    d.add(onFace(at(pilasters(W - 0.6, 2, 0.5, H1 - 0.02, 0.12, BRICK_DARK), 0, P, 0), a, L / 2));
    d.add(onFace(at(pilasters(W2 - 0.6, 2, 0.44, TOP - Y2 - 0.32, 0.1, BRICK_DARK), 0, Y2, 0), a, L2 / 2));
  }
  // A moulded band following the eaves, just under the roof, on the long sides and the gables.
  const n = 28, side = [], gable = [];
  for (let k = 0; k <= n; k++) {
    side.push([(k / n - 0.5) * (L2 + 0.3), roofY(roofU((k / n - 0.5) * (L2 + 0.3)), roofV(W2 / 2 + 0.06)) - 0.07, W2 / 2 + 0.06]);
    gable.push([L2 / 2 + 0.06, roofY(roofU(L2 / 2 + 0.06), roofV((k / n - 0.5) * (W2 + 0.1))) - 0.07, (k / n - 0.5) * (W2 + 0.1)]);
  }
  for (const s of [-1, 1]) {
    const band = (pts) => { const top = pts, o = curtain(top, 0, TRIM), p = o.geometry.attributes.position; for (let i = 0; i < top.length; i++) p.setY(2 * i + 1, top[i][1] - 0.22); o.geometry.computeVertexNormals(); return o; };
    d.add(band(side.map(([x, y, z]) => [x, y, s * z])), band(gable.map(([x, y, z]) => [s * x, y, z])));
  }
  // Ribs over the vault, as the roof's bamboo frame was copied in brick: one each side of the
  // kiosk and on towards the ends, and a roll along the ridge.
  const ribs = new THREE.Group();
  for (const x of detail.low ? [-9, -4.5, 4.5, 9] : [-11.2, -8.4, -5.6, -2.8, 2.8, 5.6, 8.4, 11.2]) {
    const pts = [];
    for (let k = 0; k <= 16; k++) pts.push(new THREE.Vector3(x, roofY(roofU(x), k / 16) + 0.03, (k / 16 - 0.5) * (W2 + 2 * R.OVER)));
    ribs.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.09, 5), ROOF));
  }
  const ridge = [];
  for (let k = 0; k <= 24; k++) ridge.push(new THREE.Vector3(roofX(k / 24), roofY(k / 24, 0.5) + 0.04, 0));
  ribs.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ridge), 24, 0.13, 6), ROOF));
  d.add(ribs);
  // The crocodiles at the ends of the ridge, looking outward.
  for (const s of [-1, 1]) {
    const c = at(crocodile(STONE), s * (roofX(1) - 1.1), roofY(1, 0.5) + 0.02, 0);
    c.scale.setScalar(1.5);
    c.rotation.y = s > 0 ? 0 : Math.PI;
    c.rotation.z = -0.12;
    d.add(c);
  }
  // The porch at each end: an arch in a block standing out from the wall, under a curved roof,
  // with steps down to the lawn.
  for (const s of [-1, 1]) {
    const p = new THREE.Group(), pw = 4.4, pd = 1.9, ph = 3.5;
    p.add(at(archWall(pw, ph, pd, 2.5, 2.95, true, BRICK), 0, P, pd / 2));
    p.add(at(interior(2.5, 2.95, 0.2, 0), 0, P, 0.03));
    p.add(at(archRing(2.5, 2.95, true, 0.2, 0.06, TRIM), 0, P, pd));
    p.add(box(pw + 0.3, 0.16, pd + 0.15, TRIM, 0, P + ph, pd / 2 + 0.075));
    p.add(at(banglaRoof(pw + 0.7, pd + 0.6, 1.0, ROOF, { droop: 0.4 }), 0, P + ph + 0.56, -0.02));
    p.add(box(pw + 1.2, P, 1.2, BRICK_DARK, 0, 0, pd + 0.6), at(steps(3.2, P, 3, STONE, 0.36), 0, 0, pd + 1.2));
    d.add(onFace(p, s * Math.PI / 2, L / 2 - 0.01));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Rupohi Pathar, the field the pavilion looks over: a wide lawn inside a low wall, a gravel
// walk from the gate on the road, areca palms and the big shade trees of upper Assam along the
// edges, and the Survey's board.
export function addDetails(f, g) {
  architecture(f);
  const WALL = mat('#c9b8a2', 0.9), PIER = mat('#b8604f', 0.9);
  g.add(box(420, 0.06, 360, M.grass, 0, -0.06, 0));
  // The walk from the gate (south) to the pavilion, and round it.
  g.add(box(4, 0.05, 62, M.path, 0, 0, 39), box(40, 0.05, 3, M.path, 0, 0.001, 9.5), box(3, 0.05, 22, M.path, -19.5, 0.002, 0), box(3, 0.05, 22, M.path, 19.5, 0.002, 0), box(40, 0.05, 3, M.path, 0, 0.001, -9.5));
  // The low wall round the field, with the gate's piers.
  const w = new THREE.Group();
  w.add(wallWithGaps('x', 170, 1.1, 0.4, WALL, [[0, 6]], 0, 70), wallWithGaps('x', 170, 1.1, 0.4, WALL, [], 0, -62), wallWithGaps('z', 132, 1.1, 0.4, WALL, [], -85, 4), wallWithGaps('z', 132, 1.1, 0.4, WALL, [], 85, 4));
  for (const x of [-3.4, 3.4]) w.add(box(0.9, 2.4, 0.9, PIER, x, 0, 70), box(1.1, 0.18, 1.1, WALL, x, 2.4, 70), cyl(0, 0.4, 0.5, WALL, x, 2.58, 70, 4));
  g.add(mergeByMaterial(w));
  // The road outside the wall.
  g.add(box(420, 0.05, 9, M.asphalt, 0, 0, 79));
  const keep = [[-26, 26, -16, 16], [-4, 4, 10, 72]];
  g.add(trees(scatter(16, [-80, 80, -58, 66], { seed: 7, gap: 20, avoid: [[-50, 50, -34, 60]] }), { kind: 'mango', seed: 7, h: 12 }));
  g.add(trees([[-62, 40], [58, -44], [-70, -30]], { kind: 'banyan', seed: 3 }));
  g.add(trees([...along(9, [-80, 64], [-14, 64]), ...along(9, [14, 64], [80, 64])], { kind: 'palm', seed: 9, h: 11 }));
  g.add(trees(scatter(30, [-200, 200, -170, -70], { seed: 12, gap: 14 }), { kind: 'sal', seed: 12 }));
  g.add(shrubs([...along(10, [-3.2, 14], [-3.2, 60]), ...along(10, [3.2, 14], [3.2, 60])].map(([x, z]) => [x, z, 0.8]), { seed: 5, flowers: '#d85a3a' }));
  g.add(shrubs(scatter(14, [-60, 60, -50, 60], { seed: 8, gap: 12, avoid: keep.concat([[-30, 30, -24, 24]]) }), { seed: 8 }));
  g.add(lampPosts([...along(4, [-3, 20], [-3, 62]), ...along(4, [3, 20], [3, 62])]));
  g.add(benches([[-8, 24], [8, 24], [-24, 12], [24, 12]]));
  g.add(asiBoard('Rang Ghar', 9, 62, 0));
}
