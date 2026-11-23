import * as THREE from 'three';
import { mat, mesh, at, surface, rng, ellipsoid, inst } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { chaityaDoorway, mauryanDoor } from '../parts/doorways.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { addDetails } from '../details/barabar-caves.js';
import { detail } from '../detail.js';

// The grey-pink granite of the Barabar hills: rough and weathered on the hill, and dressed and
// polished like glass where the Mauryan masons cut it.
export const GRANITE = surface(mat('#8d8073', 0.9), 'rock');
export const POLISHED = surface(mat('#8a7f74', 0.3), 'none');

// Barabar, the oldest rock-cut caves in India (Mauryan, c. 257–250 BCE). From photographs
// (Wikimedia Commons: "Sudama and Lomas Rishi entrances", "Barabar hill with Sudama and Lomas
// Rishi caves", "Karna Chopar cave BL", "Barabar Visvakarma Cave") and Cunningham's map: three of
// the four caves are cut into one natural whaleback of granite, a long smooth boulder lying east
// to west. Its south side (+z here) is left as the rock grew, steep and convex, and the doors
// open straight out of it: Sudama's plain trapezoid on the left and, 20 m to its right, Lomas
// Rishi's carved front in a hollow cut back into the curve. Karan Chaupar's plain door is on the
// north side of the same rock. Visvakarma, an open porch 4.27 m wide and 2.54 m deep, is cut in
// a second rock about 100 m east, reached by footholds hewn in the bare slope. The shrine of
// Siddheshwarnath stands on the summit of the hill, some 600 m off.
//
// The main rock: its half length, half width and height, lying along x with its south foot on
// z = 0. The caves: [x, door width at the foot, door height].
export const ROCK = { L: 58, W: 19, H: 11.5 };
export const SUDAMA = [-11, 1.2, 2.1], LOMAS = [11], KARAN = [-17, 1.15, 2.0];
// Visvakarma's rock, east of the main one on higher ground, and its porch [x, half width, sill, height].
export const ROCK2 = { x: 112, z: -22, L: 30, W: 17, H: 12, e: 1.1 };
export const PORCH = { x: -3, hw: 2.135, y0: 0.9, h: 2.3, d: 2.54 };
// The summit of the hill, with the temple, north-east of the caves.
export const SUMMIT = [330, -520];

// The ground: level before the caves, rising east to the shelf of Visvakarma's rock, the long
// boulder-strewn ridge of the hill behind, and its summit.
export function groundY(x, z) {
  const ridge = Math.exp(-Math.pow((z + 230) / 110, 2)) * smooth(700, 250, Math.abs(x + 40));
  const peak = Math.exp(-(Math.pow(x - SUMMIT[0], 2) + Math.pow(z - SUMMIT[1], 2)) / (170 * 170));
  const shelf = 5 * smooth(60, 92, x) * smooth(170, 135, x) * smooth(46, 18, z);
  const near = smooth(70, 150, Math.hypot(x - 30, z + 10));
  return (38 * ridge + 10 * ridged(x, z, { scale: 0.008, octaves: 3 }) * ridge) * smooth(-60, -110, z) + 74 * peak + shelf - 0.3 + 0.5 * near * fbm(x, z, { scale: 0.02, octaves: 2 });
}

// A whaleback of granite: a smooth boulder lying along x, L half long, W half wide and H high,
// its section a rounded square (exponent e: lower is steeper-sided) that tapers to rounded ends,
// its skin swelling and sinking a little in broad sheets. `cuts` are flat faces dressed into its
// sides: { x, hw, y0, y1, z, north }, the rock cut back to the plane z between x ± hw and between
// the heights y0 and y1. The grid of the mesh carries a doubled line along each edge of a cut, so
// that the cut has clean jambs, and the skin is left smooth round it.
// Returns { mesh, P, aAt }: P(x, a) is the point of the skin at x and the angle a round the
// section (0 at the south foot, π at the north); aAt(x, y) the angle at which the south side
// reaches the height y.
export function whaleback({ L, W, H, e = 0.8, cuts = [], seed = 0, step = detail.low ? 2.4 : 1.2, na = detail.low ? 22 : 36, skirt = 1 }) {
  const sx = (x) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / L, 2.6)), 0.42);
  const calm = (x) => cuts.reduce((k, c) => Math.min(k, smooth(c.hw + 0.3, c.hw + 5, Math.abs(x - c.x))), 1);
  const hAt = (x) => H * Math.pow(sx(x), 0.8) * (1 + calm(x) * 0.09 * Math.sin(x * 0.07 + seed));
  const aAt = (x, y) => Math.asin(Math.pow(Math.min(1, y / hAt(x)), 1 / e));
  for (const c of cuts) { c.a0 = c.y0 > 0 ? aAt(c.x, c.y0) : -1; c.a1 = aAt(c.x, c.y1); if (c.north) [c.a0, c.a1] = [Math.PI - c.a1, c.y0 > 0 ? Math.PI - c.a0 : 4]; }
  const P = (x, a) => {
    const s = sx(x), c = Math.cos(a), sn = Math.max(0, Math.sin(a)), k = calm(x);
    const n = 1 + k * (0.05 * Math.sin(x * 0.21 + seed) * Math.sin(a * 2.3 + x * 0.05) + 0.022 * Math.sin(x * 0.9 + a * 5 + seed * 2));
    let z = W * s * Math.sign(c) * Math.pow(Math.abs(c), e) * n;
    for (const q of cuts) if (Math.abs(x - q.x) <= q.hw + 1e-6 && a >= q.a0 - 1e-6 && a <= q.a1 + 1e-6) z = q.north ? Math.max(z, q.z) : Math.min(z, q.z);
    return [x, hAt(x) * Math.pow(sn, e) * n, z];
  };
  // The lines of the grid: evenly spaced along the rock, and round it closer together towards
  // each foot, where the side is steepest; with a doubled line at each edge of each cut.
  const lines = (n, at, extra, gap) => {
    const out = [...extra];
    for (let i = 0; i <= n; i++) { const v = at(i / n); if (!extra.some((q) => Math.abs(q - v) < gap)) out.push(v); }
    return out.sort((p, q) => p - q);
  };
  const xs = lines(Math.round(2 * L / step), (t) => -L + 2 * L * t, cuts.flatMap((c) => [c.x - c.hw - 0.04, c.x - c.hw, c.x + c.hw, c.x + c.hw + 0.04]), step * 0.35);
  const round = (t) => (t < 0.5 ? Math.PI / 2 * Math.pow(2 * t, 1.5) : Math.PI - Math.PI / 2 * Math.pow(2 - 2 * t, 1.5));
  const as = lines(na, round, cuts.flatMap((c) => [c.a0 - 0.006, c.a0, c.a1, c.a1 + 0.006].filter((a) => a > 0 && a < Math.PI)), 0.012);
  const pos = [], uv = [], idx = [], rows = as.length + 2;
  for (const x of xs) for (let j = 0; j < rows; j++) {
    const a = as[Math.min(as.length - 1, Math.max(0, j - 1))], p = P(x, a);
    pos.push(p[0], j === 0 || j === rows - 1 ? -skirt : p[1], p[2]);
    uv.push(x / 6, a * W / 6);
  }
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < rows - 1; j++) {
    const a = i * rows + j, b = a + rows;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return { mesh: mesh(geo, GRANITE), P, aAt };
}

export function buildBarabarCaves() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(5);
  g.add(f);
  // The main rock, cut back for the three doors: a slight frame for Sudama and Karan Chaupar, and
  // for Lomas Rishi a hollow 6 m wide that dies out into the curve of the rock above the arch.
  const { L, W, H } = ROCK, foot = (x) => W * (Math.pow(1 - Math.pow(Math.abs(x) / L, 2.6), 0.42) - 1);
  const cuts = [
    { x: SUDAMA[0], hw: SUDAMA[1] / 2 + 0.25, y0: 0, y1: SUDAMA[2] + 0.5, z: W + foot(SUDAMA[0]) - 0.14 },
    { x: LOMAS[0], hw: 3.05, y0: 0, y1: 7.2, z: W + foot(LOMAS[0]) - 1.45 },
    { x: KARAN[0], hw: KARAN[1] / 2 + 0.25, y0: 0, y1: KARAN[2] + 0.5, z: -W - foot(KARAN[0]) + 0.14, north: true },
  ];
  const rock = whaleback({ L, W, H, cuts, seed: 1 });
  f.add(at(rock.mesh, 0, 0, -W));
  // The doors on their dressed faces, each a step above the ground.
  f.add(at(mauryanDoor(SUDAMA[1], SUDAMA[2], POLISHED), SUDAMA[0], 0.25, cuts[0].z - W + 0.01));
  f.add(at(chaityaDoorway(POLISHED), LOMAS[0], 0.25, cuts[1].z - W + 0.01));
  f.add(at(mauryanDoor(KARAN[1], KARAN[2], POLISHED), KARAN[0], 0.25, cuts[2].z - W - 0.01).rotateY(Math.PI));
  // Visvakarma's rock on its shelf to the east, its porch cut square into the south side.
  const r2 = ROCK2, by = groundY(r2.x, r2.z + r2.W) - 0.2, pc = { x: PORCH.x, hw: PORCH.hw, y0: PORCH.y0, y1: PORCH.y0 + PORCH.h, z: 0 };
  const probe = whaleback({ ...r2, step: 60, na: 4, seed: 4 });
  pc.z = probe.P(pc.x, probe.aAt(pc.x, pc.y0))[2] - PORCH.d;
  const rock2 = whaleback({ ...r2, cuts: [pc], seed: 4, skirt: 4 });
  g.add(at(rock2.mesh, r2.x, by, r2.z));
  // The hills: the ridge behind, strewn with boulders, and the summit.
  g.add(heightField(2000, 1400, detail.low ? 100 : 150, groundY, { cz: -300, rock: ['#8d8073', '#9a8c7d', '#7f7468'], band: 10, cover: '#8c8552', steep: 0.82 }));
  const bould = new THREE.Group();
  for (let k = 0; k < (detail.low ? 18 : 30); k++) {
    // A few great boulders at the ends of the rock and one perched on its back; the rest tumbled
    // along the foot of the ridge.
    const end = k < 4, side = k % 2 ? 1 : -1, s = end ? 4 + R() * 2 : 1.5 + R() * 4;
    const x = end ? side * (L + 1 + R() * 5) : -160 + R() * 330, z = end ? -W - 6 + R() * 12 : -62 - R() * 50;
    bould.add(ellipsoid(s * (1 + R() * 0.5), s * (0.6 + R() * 0.3), s * (0.8 + R() * 0.4), GRANITE, x, groundY(x, z) + s * 0.3, z));
  }
  const [, py, pz] = rock.P(-38, 1.5);
  bould.add(ellipsoid(3.4, 1.5, 2.4, GRANITE, -38, py + 1.2, pz - W));
  g.add(mergeByMaterial(bould));
  // The ridge behind is a tumble of rounded boulders from foot to crest.
  const strewn = [];
  for (let k = 0; k < (detail.low ? 70 : 180); k++) {
    const x = -330 + R() * 620, z = -75 - R() * 250, s = 1.2 + R() * R() * 5;
    strewn.push([x, groundY(x, z) - s * 0.25, z, s * (1.6 + R()), s * (1 + R() * 0.5), s * (1.4 + R()), R() * 3]);
  }
  g.add(inst(new THREE.SphereGeometry(0.5, 10, 6).translate(0, 0.5, 0), strewn, GRANITE));
  addDetails(f, g, { R, rock, by, cuts, pc });
  // From the south-west, along the rock: Sudama's door nearest, Lomas Rishi beyond it.
  return { group: g, focus: f, view: [-0.55, 0.13, 1], zoom: 0.44 };
}
