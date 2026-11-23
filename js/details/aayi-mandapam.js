import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, sheet, lathe, inst, planPrism } from '../helpers.js';
import { dentils, archRing, rosette, medallion, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, fountains, scatter, along, around, traffic, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { WHITE, SHADE } from '../monuments/aayi-mandapam.js';

const YELLOW = mat('#e9c46a', 0.85), TRIM = mat('#f7f3ea', 0.8);
const ROAD = mat('#57575a', 0.92), KERB = mat('#bdb7ab', 0.9), HEDGE_BED = mat('#5f4a36', 0.95);

// Aayi Mandapam, finer detail, from the same photographs: a moulded ring and imposts on each arch;
// five rosettes between plain panels in the frieze of each portico, dentils under the cornice; on
// the attic of each arm a running scroll with fleur-de-lis in its loops; a wreathed medallion
// between sprays of leaves in each pediment; fish-scale tiles on the dome and curled leaves round
// the urn's rim; black inscription plaques on the podium beside the south passage; wrought-iron
// railings across the arches, and under the crossing the black bust of Aayi on a white pedestal
// that stands in a wide basin. Dimensions follow js/monuments/aayi-mandapam.js.
const IRON = mat('#22201e', 0.6, 0.3), BLACK = mat('#1b1a19', 0.35, 0.1), RED = mat('#b5503f', 0.9), COPING = mat('#d8c48a', 0.9), AGAVE = mat('#9aa85a', 0.85);
// A fleur-de-lis h high facing +z: the middle petal, two curling out, and the band that ties them.
function fleur(h, m) {
  const g = new THREE.Group(), pg = new THREE.SphereGeometry(1, 6, 4);
  const leaf = (x, y, rz, sy) => { const l = mesh(pg, m, x * h, y * h, 0); l.scale.set(h * 0.13, h * sy, h * 0.08); l.rotation.z = rz; return l; };
  g.add(leaf(0, 0.12, 0, 0.42), leaf(-0.24, 0.05, 0.7, 0.3), leaf(0.24, 0.05, -0.7, 0.3), leaf(0, -0.38, 0, 0.14), box(h * 0.5, h * 0.09, h * 0.1, m, 0, -h * 0.27, 0));
  return g;
}
function architecture(f, { P, C, PW, PJ, G, E, K, A, T, D, U }) {
  const d = new THREE.Group(), c = C / 2;
  for (const [k, ang] of FACES.entries()) {
    const face = new THREE.Group();
    // On the core's face: the arch's ring and imposts, and the railing across the passage.
    face.add(at(archRing(G * 2, 5.25, false, 0.22, 0.08, SHADE, false), 0, 0, 0));
    for (const s of [-1, 1]) face.add(box(0.5, 0.16, 0.12, SHADE, s * (G + 0.25), 5.25 - G - 0.16, 0.06));
    face.add(box(G * 2, 0.06, 0.06, IRON, 0, 1.2, -0.3), box(G * 2, 0.06, 0.06, IRON, 0, 0.18, -0.3));
    for (let i = 0; i < 11; i++) face.add(box(0.035, 1.45, 0.035, IRON, -G + (i + 0.5) * (G * 2 / 11), 0.05, -0.3));
    // On the portico's front: the frieze, the dentils, the attic's scroll and the tympanum.
    const z = PJ + 0.02;
    face.add(box(PW + 0.06, 0.08, PJ + 0.03, SHADE, 0, E + 0.48, PJ / 2));
    for (let i = -2; i <= 2; i++) face.add(at(detail.low ? medallion(0.17, SHADE) : rosette(0.19, SHADE), i * 1.22, E + 0.74, z));
    for (let i = -2; i < 2; i++) face.add(box(0.5, 0.32, 0.04, SHADE, (i + 0.5) * 1.22, E + 0.58, z));
    for (const s of [-1, 1]) face.add(at(medallion(0.17, SHADE), s * (PW / 2 + 0.02), E + 0.74, PJ / 2).rotateY(s * Math.PI / 2));
    face.add(at(dentils(PW + 0.3, 0.14, 0.12, 0.12, SHADE), 0, K - 0.12, PJ + 0.06));
    const sz = PJ - 0.08, sy = (A + T - 0.16) / 2;
    face.add(box(PW - 0.5, 0.05, 0.05, SHADE, 0, A + 0.1, sz), box(PW - 0.5, 0.05, 0.05, SHADE, 0, T - 0.33, sz));
    for (let i = -2; i <= 2; i++) {
      face.add(at(mesh(new THREE.TorusGeometry(0.3, 0.04, 4, detail.low ? 10 : 16), SHADE), i * 1.1, sy, sz), at(fleur(0.36, SHADE), i * 1.1, sy + 0.02, sz));
      if (i < 2) for (const s of [-1, 1]) face.add(at(mesh(new THREE.TorusGeometry(0.2, 0.035, 4, 8, Math.PI), SHADE), (i + 0.5) * 1.1 + s * 0.14, sy + s * 0.12, sz).rotateZ(s > 0 ? 0 : Math.PI));
    }
    const ty = T + 0.55, tz = PJ - 0.01;
    face.add(at(mesh(new THREE.TorusGeometry(0.36, 0.06, 5, 16), SHADE), 0, ty, tz), at(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16).rotateX(Math.PI / 2), SHADE), 0, ty, tz));
    const lg = new THREE.SphereGeometry(1, 6, 4);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const l = mesh(lg, SHADE, s * (0.62 + i * 0.36), ty - 0.2 + 0.1 * Math.sin(i * 2), tz); l.scale.set(0.24, 0.1 - i * 0.012, 0.05); l.rotation.z = s * (0.5 - i * 0.2); face.add(l); }
    d.add(onFace(face, ang, c));
    if (k === 0) for (const s of [-1, 1]) d.add(box(1.5, 0.6, 0.05, BLACK, s * (G + 1.1), 0.25, c + PJ + 0.3 + 0.025));
  }
  // The dome's tiles, in rings, each tile a rounded scale lapping the one below.
  if (!detail.low) {
    const sc = [], sg = new THREE.SphereGeometry(0.5, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2);
    for (let r = 0; r < 7; r++) {
      const ph = 0.2 + r * 0.14, rad = 2.7 * Math.sin(ph), y = D + 2.7 * 0.6 * Math.cos(ph), n = Math.max(8, Math.round(rad * 6.283 / 0.5));
      for (let i = 0; i < n; i++) { const t = ((i + (r % 2) / 2) / n) * Math.PI * 2; sc.push([Math.cos(t) * rad, y - 0.1, Math.sin(t) * rad, 0.56, 0.3, 0.56, 0]); }
    }
    f.add(inst(sg, sc, SHADE));
  }
  // The leaves curling out round the urn's rim.
  for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2, l = mesh(new THREE.SphereGeometry(1, 6, 4), WHITE, Math.cos(t) * 0.98, U + 1.9, Math.sin(t) * 0.98); l.scale.set(0.2, 0.16, 0.2); d.add(l); }
  // The bust: a square base, a basin on a stem, a white pedestal and the black bust of Aayi.
  d.add(box(1.5, 0.75, 1.5, WHITE, 0, 0, 0), at(lathe([[0.45, 0], [0.3, 0.12], [0.26, 0.3], [0.5, 0.45], [1.25, 0.62], [1.3, 0.7], [1.2, 0.7], [0.5, 0.55], [0, 0.55]], WHITE, 24), 0, 0.75, 0), box(0.8, 0.85, 0.8, WHITE, 0, 1.3, 0), box(0.52, 0.3, 0.4, BLACK, 0, 2.15, 0));
  const sh = mesh(new THREE.SphereGeometry(1, 12, 8), BLACK, 0, 2.6, 0), hd = mesh(new THREE.SphereGeometry(1, 12, 8), BLACK, 0, 3.06, 0.03);
  sh.scale.set(0.5, 0.26, 0.26); hd.scale.set(0.17, 0.22, 0.19);
  d.add(sh, hd, cyl(0.09, 0.11, 0.2, BLACK, 0, 2.75, 0, 8));
  f.add(mergeByMaterial(d));
}

// A French colonial house of the White Town: a two-storey block in yellow or white, its windows
// tall and shuttered, a cornice and a parapet with a balustered terrace, on a street front.
function villa(w, d, h, wall) {
  const g = new THREE.Group();
  g.add(box(w, h, d, wall), box(w + 0.4, 0.35, d + 0.4, TRIM, 0, h, 0), box(w, 0.9, d, TRIM, 0, h + 0.35, 0), box(w + 0.3, 0.25, d + 0.3, TRIM, 0, 3.6, 0));
  const n = Math.max(2, Math.floor(w / 3));
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    for (const y of [0.9, 4.4]) g.add(box(1.1, 2.2, 0.08, mat('#3d6e5a', 0.8), x, y, d / 2 + 0.02), box(1.4, 0.18, 0.2, TRIM, x, y + 2.25, d / 2 + 0.08));
  }
  return g;
}

// Bharathi Park: the lawns and their paths meeting at the monument, palms and rain trees, flower
// beds, lamps and benches; the yellow Raj Nivas, the governor's house, on the north side, and the
// streets of the French quarter round the park.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const PW = 150, PD = 120;
  g.add(sheet(900, 900, M.grass, 0, 0, 0));
  // The roads round the park and the town beyond.
  const s = new THREE.Group();
  s.add(box(PW + 28, 0.1, 14, ROAD, 0, 0, PD / 2 + 7), box(PW + 28, 0.1, 14, ROAD, 0, 0, -PD / 2 - 7), box(14, 0.1, PD, ROAD, PW / 2 + 7, 0, 0), box(14, 0.1, PD, ROAD, -PW / 2 - 7, 0, 0));
  s.add(box(PW, 0.18, 1, KERB, 0, 0, PD / 2), box(PW, 0.18, 1, KERB, 0, 0, -PD / 2), box(1, 0.18, PD, KERB, PW / 2, 0, 0), box(1, 0.18, PD, KERB, -PW / 2, 0, 0));
  g.add(mergeByMaterial(s));
  g.add(sheet(PW - 1, PD - 1, M.grass, 0, 0.12, 0));
  // The paths: a ring round the plinth and eight walks radiating to the park's edges.
  const p = new THREE.Group();
  p.add(cyl(14, 14, 0.06, M.path, 0, 0.12, 0, 48));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, L = k % 2 ? 64 : (k % 4 === 0 ? PD / 2 : PW / 2), w = k % 4 === 0 ? 5 : 3;
    const walk = box(w, 0.06, L - 13, M.path, 0, 0.13, 0);
    walk.position.set(Math.sin(a) * (13 + L) / 2, 0.13, Math.cos(a) * (13 + L) / 2);
    walk.rotation.y = a;
    p.add(walk);
  }
  p.add(box(PW - 8, 0.06, 3, M.path, 0, 0.125, -PD / 2 + 6), box(PW - 8, 0.06, 3, M.path, 0, 0.125, PD / 2 - 6));
  g.add(mergeByMaterial(p));
  // The round bed the monument stands in: lawn held half a metre above the paving by a low red
  // wall with a pale coping, cut by the four paved approaches to the arches, and planted with
  // variegated agaves.
  const bed = new THREE.Group(), quad = (r, h) => { const q = [[h, h]]; for (let k = 0; k <= 12; k++) { const t0 = Math.asin(h / r), t = t0 + (k / 12) * (Math.PI / 2 - 2 * t0); q.push([r * Math.cos(t), r * Math.sin(t)]); } return q; };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const flip = (q) => { const o = q.map(([x, z]) => [sx * x, sz * z]); return sx * sz < 0 ? o.reverse() : o; };
    bed.add(planPrism(flip(quad(10.8, 1.5)), 0.1, 0.5, RED), planPrism(flip(quad(10.86, 1.44)), 0.6, 0.06, COPING), planPrism(flip(quad(10.55, 1.75)), 0.1, 0.6, M.grass));
  }
  bed.add(box(3, 0.06, 21.8, M.path, 0, 0.14, 0), box(9.4, 0.06, 3, M.path, 6.2, 0.14, 0), box(9.4, 0.06, 3, M.path, -6.2, 0.14, 0));
  const ag = new THREE.ConeGeometry(0.16, 1.5, 4).translate(0, 0.75, 0);
  for (const [k, [x, z]] of around(12, 8.3, 0, 0, 0.26).entries()) for (let i = 0; i < 9; i++) {
    const l = mesh(ag, AGAVE, x, 0.65, z), t = i * 0.7 + k;
    l.rotation.set(i ? 0.75 * Math.cos(t) : 0, 0, i ? 0.75 * Math.sin(t) : 0);
    l.scale.setScalar(i ? 0.8 + 0.3 * ((i * 7 + k) % 3) / 2 : 1.1);
    bed.add(l);
  }
  g.add(mergeByMaterial(bed));
  // Flower beds and clipped hedges in the quarters, palms along the walks, rain trees and banyans
  // shading the lawns, and fountains in two round pools.
  const beds = [];
  for (const [x, z] of [[-28, 22], [28, 22], [-28, -22], [28, -22]]) { beds.push(cyl(6, 6, 0.2, HEDGE_BED, x, 0.12, z, 24)); }
  g.add(mergeByMaterial(new THREE.Group().add(...beds)));
  for (const [x, z] of [[-28, 22], [28, 22], [-28, -22], [28, -22]]) g.add(shrubs(around(10, 5, x, z), { seed: 3 + x, y: 0.3, size: 1.1, flowers: ['#d43a5c', '#f2a11c', '#e8e2d8', '#c2352b'][(x > 0 ? 1 : 0) + (z > 0 ? 2 : 0)] }));
  g.add(shrubs(around(36, 16.5, 0, 0, 0.09), { seed: 5, y: 0.12, size: 1.0 }));
  for (const [x, z] of [[-48, 32], [48, -32]]) { g.add(cyl(5, 5, 0.5, SHADE, x, 0.12, z, 28), sheet(9.4, 9.4, M.water, x, 0.55, z)); g.add(fountains([[x, z]], { y: 0.55, h: 2.4 })); }
  const walks = [];
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.22; for (const r of [22, 34, 46]) walks.push([Math.sin(a) * r, Math.cos(a) * r]); }
  g.add(trees(walks.filter(([x, z]) => Math.abs(x) < PW / 2 - 4 && Math.abs(z) < PD / 2 - 4), { kind: 'palm', seed: 4, y: 0.12 }));
  const lawn = scatter(detail.low ? 14 : 26, [-PW / 2 + 6, PW / 2 - 6, -PD / 2 + 8, PD / 2 - 8], { seed: 7, gap: 13, avoid: [[-20, 20, -20, 20], [-55, -40, 25, 40], [40, 55, -40, -25]] });
  g.add(trees(lawn.filter((_, i) => i % 3 === 0), { kind: 'banyan', seed: 2, y: 0.12 }));
  g.add(trees(lawn.filter((_, i) => i % 3 === 1), { kind: 'tamarind', seed: 3, y: 0.12 }));
  g.add(trees(lawn.filter((_, i) => i % 3 === 2), { kind: 'neem', seed: 9, y: 0.12 }));
  g.add(lampPosts([...around(8, 15, 0, 0, Math.PI / 8), ...along(6, [-PW / 2 + 4, PD / 2 - 3], [PW / 2 - 4, PD / 2 - 3])], { y: 0.12 }));
  g.add(benches([[-10, 16.5, Math.PI], [10, 16.5, Math.PI], [-10, -16.5, 0], [10, -16.5, 0], [16.5, -8, -Math.PI / 2], [-16.5, 8, Math.PI / 2]], { y: 0.12 }));
  // Raj Nivas on the north side of the park, and white and yellow houses of the French quarter.
  const town = new THREE.Group();
  const raj = villa(70, 26, 7.2, YELLOW);
  town.add(at(raj, 0, 0, -PD / 2 - 14 - 14 - 13).rotateY(0));
  town.add(at(villa(20, 14, 7, WHITE), -PW / 2 - 14 - 10, 0, 20).rotateY(Math.PI / 2), at(villa(26, 14, 7, YELLOW), -PW / 2 - 14 - 10, 0, -24).rotateY(Math.PI / 2));
  town.add(at(villa(30, 14, 7, WHITE), PW / 2 + 14 + 10, 0, 18).rotateY(-Math.PI / 2), at(villa(22, 14, 7, mat('#e3a66b', 0.85)), PW / 2 + 14 + 10, 0, -26).rotateY(-Math.PI / 2));
  town.add(at(villa(34, 14, 7, WHITE), -36, 0, PD / 2 + 14 + 10).rotateY(Math.PI), at(villa(30, 14, 7, YELLOW), 34, 0, PD / 2 + 14 + 10).rotateY(Math.PI));
  g.add(mergeByMaterial(town));
  g.add(cityAround([-PW / 2 - 50, PW / 2 + 50, -PD / 2 - 70, PD / 2 + 44], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: !detail.low, gap: 8, storeys: [2, 3], seed: 44,
    paint: ['#f1e6cf', '#e9c46a', '#f4f2ec', '#e3a66b', '#d9e0d3', '#f0d9a8'] }));
  g.add(traffic([[PD / 2 + 4.5, 1], [PD / 2 + 9.5, -1]], -PW / 2 - 14, PW / 2 + 14, { y: 0.1, gap: 22, seed: 5, buses: 0.05, trucks: 0 }));
}
