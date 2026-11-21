import * as THREE from 'three';
import { M, mat, box, at, group, onFace, FACES, inst, unitBox, pidaRoof, kalash } from '../helpers.js';
import { mouldings, pilasters, templeNiche, idol, mergeByMaterial } from './components.js';
import { carvedPillar, dwajasthambha } from './temples.js';
import { nandi } from './animals.js';
import { detail } from '../detail.js';
import { trees, stalls, scatter, along } from './realism.js';

// Ramanathaswamy, finer detail. From photographs: the high outer walls of the temple are plain
// lime-washed granite but moulded at the foot, ribbed with pilasters and capped by a coping; the
// flat roofs of the corridors carry a low parapet along each edge; the two shrines stand on
// moulded bases (adhishthana) with pilasters and niches; and on the axis before Ramanathaswamy's
// shrine the great Nandi lies under its own pillared mandapa, the gold flagstaff before it.
// Dimensions follow js/monuments/ramanathaswamy-temple.js: outer walls 8 high and 3 thick round a
// 140 × 190 court, gopurams in gaps on every side; the corridor roofs 9 wide at y = 7 to 8 round
// rectangles of 124 × 172, 96 × 132 and 70 × 96; the shrines 15.4 and 11 square, 8 high, at
// x = -10 and 18, z = -14. The sea is east, +z.
const LIME = mat('#e7dfcd', 0.85);
const GRANITE = mat('#a89c83', 0.9);
const CORNICE = mat('#8d826b', 0.9);

// The runs of an x or z wall either side of its gaps, as [from, to] along its axis.
function runs(len, gaps, c0 = 0) {
  const out = [];
  let start = c0 - len / 2;
  for (const [a, b] of gaps.map(([c, w]) => [c - w / 2, c + w / 2]).sort((p, q) => p[0] - q[0])) { if (a > start) out.push([start, a]); start = Math.max(start, b); }
  if (c0 + len / 2 > start) out.push([start, c0 + len / 2]);
  return out;
}

function outerWalls(d) {
  const W = 140, D = 190, T = 3, H = 8;
  // [face angle, distance of the wall's centre line, wall length, gaps]
  const walls = [[0, D / 2, W, [[0, 29]]], [Math.PI, D / 2, W, [[0, 25]]], [Math.PI / 2, W / 2, D, [[-20, 15]]], [-Math.PI / 2, W / 2, D, [[20, 15]]]];
  for (const [a, dist, len, gaps] of walls) for (const [p, q] of runs(len, gaps)) {
    const l = q - p, mid = (p + q) / 2, n = Math.max(2, Math.round(l / 6));
    const put = (out, ...parts) => d.add(onFace(group(...parts), a, dist + out, mid));
    // The base mouldings along the wall's outer face, the coping along its top, and pilasters.
    put(T / 2, box(l, 0.5, 0.25, GRANITE, 0, 0, 0.12), box(l, 0.25, 0.15, GRANITE, 0, 0.75, 0.07));
    put(0, box(l + 0.01, 0.45, T + 0.5, CORNICE, 0, H, 0));
    if (!detail.low || l > 30) put(T / 2, at(pilasters(l - 3, n, 0.7, H - 1.4, 0.16, LIME), 0, 1, 0));
  }
}

// A low parapet along both edges of every corridor roof.
function parapets(d) {
  const list = [];
  for (const [w, dd] of [[124, 172], [96, 132], [70, 96]]) for (const s of [-1, 1]) for (const e of [-4.3, 4.3]) {
    const z = s * (dd - 7) / 2 + e, x = s * (w - 7) / 2 + e;
    list.push([0, 8, z, w + 2 - 0.4, 0.7, 0.4], [x, 8, 0, 0.4, 0.7, dd + 2 - 0.4]);
  }
  d.add(inst(unitBox(), list, LIME));
}

// The shrines' bases: mouldings round the foot, pilasters on each face, and a niche with an image
// in the middle of every face but the front (east, +z), where the doorway would be.
function shrines(d) {
  for (const [x, w] of [[-10, 15.4], [18, 11]]) {
    const s = new THREE.Group();
    s.add(mouldings(w, w, [[0, 0.5, 0.35, GRANITE], [0.5, 0.35, 0.2, CORNICE], [0.85, 0.3, 0.3, GRANITE], [6.9, 0.35, 0.25, CORNICE]], LIME));
    for (const a of FACES) {
      s.add(onFace(at(pilasters(w - 1.4, 4, 0.6, 5.6, 0.12, LIME), 0, 1.2, 0), a, w / 2));
      if (a !== 0) s.add(onFace(at(templeNiche(w * 0.16, 2.8, GRANITE, { figure: idol(2.4, GRANITE) }), 0, 1.8, 0), a, w / 2 + 0.01));
    }
    d.add(at(s, x, 0, -14));
  }
}

// The Nandi mandapa on the axis of Ramanathaswamy's shrine, open on every side: eight carved
// pillars round the bull under a flat roof and a small stepped one.
function nandiMandapa(f) {
  const g = new THREE.Group(), w = 9, h = 5.6;
  g.add(box(w + 1.6, 1, w + 1.6, GRANITE), box(w + 0.6, 0.3, w + 0.6, CORNICE, 0, 1));
  const cols = new THREE.Group();
  for (const px of [-1, 0, 1]) for (const pz of [-1, 0, 1]) if (px || pz) cols.add(at(carvedPillar(h, GRANITE), px * (w / 2 - 0.5), 1.3, pz * (w / 2 - 0.5)));
  g.add(mergeByMaterial(cols));
  g.add(box(w + 1.4, 0.8, w + 1.4, GRANITE, 0, 1.3 + h), box(w + 2, 0.3, w + 2, CORNICE, 0, 2.1 + h));
  const roof = pidaRoof(w * 0.8, w * 0.36, 3, 0.8, LIME, CORNICE);
  g.add(at(roof, 0, 2.4 + h, 0), at(kalash(1, M.gold), 0, 2.4 + h + roof.userData.top, 0));
  // The bull lies facing west, towards the shrine.
  g.add(at(nandi(mat('#d9d0bd', 0.6), 1.05), 0, 1.3, 0).rotateY(Math.PI));
  f.add(at(g, -10, 0, 12));
}

// Ramanathaswamy at Rameswaram: flower stalls at the east gate, and coconut palms on the island.
export function addDetails(f, g) {
  const d = new THREE.Group();
  outerWalls(d);
  shrines(d);
  f.add(mergeByMaterial(d));
  parapets(f);
  nandiMandapa(f);
  f.add(dwajasthambha(-10, 26, 13));
  g.add(stalls([...along(5, [-22, 102], [-22, 124]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(5, [22, 102], [22, 124]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(trees(scatter(40, [-155, 155, -145, 140], { seed: 5, gap: 12 }).filter(([x, z]) => Math.abs(x) > 76 || Math.abs(z) > 100), { kind: 'palm', seed: 5 }));
}
