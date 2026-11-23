import * as THREE from 'three';
import { M, mat, box, cyl, at, group, onFace, FACES, rng } from '../helpers.js';
import { mergeByMaterial, star } from '../parts/components.js';
import { classicalDoor, headSlab } from '../parts/colonial.js';
import { figure } from '../parts/sculpture.js';
import { trees, shrubs, lampPosts, benches, scatter, along, townHouses } from '../parts/realism.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { S, MARBLE, SHADE, crown } from '../monuments/solomons-temple-aizawl.js';

// Solomon's Temple, its setting. From photographs: the temple stands alone on a levelled hilltop in
// the Kidron Valley at the edge of Aizawl, in lawns edged with flowering shrubs, a broad drive
// climbing to its front between white walls and lamps. Round it the green ridges of Mizoram fold
// away, forested in bamboo, teak and pine, and the houses of Aizawl, many storeys of concrete in
// pastel colours, crowd the slopes across the valley.
const HILLS = (x, z) => {
  const r = Math.hypot(x, z * 1.2), top = -70 * smooth(70, 260, r);
  const ridges = 150 * ridged(x + 400, z, { scale: 0.0022, octaves: 4 }) * smooth(240, 700, r);
  return top + ridges + 10 * fbm(x, z, { scale: 0.006, octaves: 3 }) * smooth(60, 120, r) - 0.08;
};

// The stars, the cross and the emblem are of dark metal against the marble.
const STEEL = mat('#6f7a86', 0.35, 0.7), BLACK = mat('#1b1b1d', 0.5, 0.3);

// An angel h tall on y = 0, facing +z: a robed figure with folded wings, a long trumpet raised to
// its lips.
function angel(h) {
  const a = group(figure(h, MARBLE)), horn = cyl(h * 0.05, h * 0.012, h * 0.5, MARBLE, 0, 0, 0, 8);
  horn.rotation.x = 1.1;
  a.add(at(horn, h * 0.05, h * 0.92, h * 0.3));
  for (const s of [-1, 1]) {
    const w = box(h * 0.16, h * 0.62, h * 0.05, MARBLE, 0, 0, 0);
    w.rotation.set(-0.12, 0, -s * 0.2);
    a.add(at(w, s * h * 0.16, h * 0.62, -h * 0.13));
  }
  return a;
}

// The carving of the four fronts.
function carving(f) {
  const { H, E, G, PD, VH, P, PW, S1, S2, SP } = S, W = H + 2 * PD, d = new THREE.Group(), pz = H / 2 - 1.2, hw = (PW - 2.8) / 2;
  const hooded = classicalDoor(0.9, 1.5, { m: MARBLE, trim: SHADE, fill: 'glass', top: null, depth: 0.18 });
  FACES.forEach((a, n) => {
    const p = new THREE.Group();
    // Small hooded windows along the upper wall, and blind arched panels in the gable and up the pillar.
    for (const s of [-1, 1]) for (const x of [7.2, 10.6, 14, 17.2]) p.add(at(hooded.clone(), s * x, P + VH + 1.5, H / 2));
    for (const s of [-1, 1]) for (const [x, y] of [[7.5, E + 0.9], [10.8, E + 0.7], [14.2, E + 0.5]]) p.add(at(headSlab(1, 1.3, 'round', SHADE, 0.06), s * x, P + y, H / 2));
    for (const y of [E - 2.2, E + 1, E + 4.2]) for (const x of [-2.6, 0, 2.6]) p.add(at(headSlab(0.9, 1.4, 'round', SHADE, 0.06), x, P + y, pz + 2.5));
    for (const y of [VH + 1.4, E - 0.4, E + 3, S1 - 2.6]) p.add(box(PW - 1.6, 0.14, 0.08, SHADE, 0, P + y, pz + 2.5));
    // The crown emblem on the upper stage, and the black cross on the pyramid.
    p.add(box(2.6, 2, 0.1, SHADE, 0, P + S1 + 1.8, pz + 2), at(crown(0.6, 0.9, M.gild), 0, P + S1 + 2.2, pz + 2.05));
    const slope = Math.atan(2 / SP), cross = group(box(0.22, 2.6, 0.12, BLACK, 0, 0, 0), box(1.5, 0.22, 0.12, BLACK, 0, 1.6, 0));
    cross.rotation.x = -slope;
    p.add(at(cross, 0, P + S2 + 0.9, pz + 2 * (1 - 0.9 / SP) + 0.08));
    // Seven Stars of David to each pillar: three up each side on stepped arms, and one on the tip.
    for (const s of [-1, 1]) for (const t of [0.22, 0.44, 0.66]) {
      const x = s * (hw * (1 - t) + 0.5), y = P + S2 + t * SP;
      p.add(box(1.9, 0.3, 0.45, MARBLE, x, y - 0.3, pz), box(0.4, 1, 0.45, MARBLE, x + s * 0.75, y - 1, pz));
      p.add(box(0.1, 1.1, 0.1, STEEL, x + s * 0.75, y, pz), at(star(6, 0.5, STEEL, 0.08), x + s * 0.75, y + 1.5, pz - 0.04));
    }
    p.add(box(0.1, 1.2, 0.1, STEEL, 0, P + S2 + SP - 0.2, pz), at(star(6, 0.55, STEEL, 0.08), 0, P + S2 + SP + 1.45, pz - 0.04));
    // The two white angels blowing trumpets, on pedestals above the main entrance.
    if (n === 0) for (const s of [-1, 1]) {
      p.add(cyl(0.8, 1, 1.1, MARBLE, s * 6.2, P + VH + 0.8, W / 2 - 1.6, 16), cyl(1.05, 1.05, 0.15, SHADE, s * 6.2, P + VH + 1.9, W / 2 - 1.6, 16));
      const o = at(angel(2.7), s * 6.2, P + VH + 2.05, W / 2 - 1.6);
      o.rotation.y = s * 0.35;
      p.add(o);
    }
    d.add(onFace(p, a, 0));
  });
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g) {
  const { H, PD } = S, W = H + 2 * PD;
  carving(f);
  g.add(heightField(2200, 2200, detail.low ? 110 : 170, HILLS, { rock: ['#7d7462', '#6f6a5c'], cover: '#4c7339', steep: 0.55 }));
  // The levelled hilltop: lawns, the drive to the main porch, and a white wall round the edge.
  g.add(box(150, 0.1, 130, M.grass, 0, 0, 10), box(12, 0.12, 50, M.path, 0, 0, W / 2 + 29), box(W + 14, 0.12, W + 14, M.path, 0, 0, 0));
  const wall = new THREE.Group();
  for (const s of [-1, 1]) {
    wall.add(box(150, 1.2, 0.5, MARBLE, 0, 0, 10 + s * 65), box(0.5, 1.2, 130, MARBLE, s * 75, 0, 10));
    wall.add(box(1.4, 3.2, 1.4, MARBLE, s * 6.5, 0, 75), box(1.7, 0.3, 1.7, SHADE, s * 6.5, 3.2, 75));
  }
  g.add(mergeByMaterial(wall));
  g.add(shrubs([...along(9, [-9, W / 2 + 8], [-9, 70]), ...along(9, [9, W / 2 + 8], [9, 70]), ...along(10, [-W / 2 - 10, -W / 2 - 10], [W / 2 + 10, -W / 2 - 10])].map(([x, z]) => [x, z, 1.2]), { flowers: '#c8325f', seed: 3 }));
  g.add(lampPosts([...along(5, [-7, W / 2 + 10], [-7, 72]), ...along(5, [7, W / 2 + 10], [7, 72])]));
  g.add(benches([[-24, 44], [24, 44], [-50, 0], [50, 0]]));
  g.add(trees(scatter(14, [-70, 70, -50, 70], { seed: 6, gap: 12, avoid: [[-W / 2 - 10, W / 2 + 10, -W / 2 - 10, W / 2 + 10], [-12, 12, 0, 80]] }), { kind: 'fir', seed: 6 }));
  // Forest over the slopes and ridges.
  const R = rng(21), T = [];
  for (let k = 0; k < (detail.low ? 260 : 520); k++) {
    const x = (R() - 0.5) * 1600, z = (R() - 0.5) * 1600, y = HILLS(x, z);
    if (Math.hypot(x, z * 1.2) < 110) continue;
    T.push([x, z, 12 + R() * 8, y]);
  }
  g.add(trees(T.filter((_, k) => k % 3 === 0), { kind: 'fir', seed: 7 }), trees(T.filter((_, k) => k % 3 === 1), { kind: 'teak', seed: 8 }), trees(T.filter((_, k) => k % 3 === 2), { kind: 'jamun', seed: 9 }));
  // Aizawl across the valley: tall houses crowded along the ridges to the north and west.
  const houses = [];
  for (let k = 0; k < (detail.low ? 90 : 420); k++) {
    const a = -Math.PI * 0.15 + R() * Math.PI * 1.1, r = 260 + R() * 420, x = -Math.cos(a) * r, z = -Math.sin(a) * r, y = HILLS(x, z);
    houses.push([x, z, 9 + R() * 6, 9 + R() * 5, 3 + Math.floor(R() * 4), Math.atan2(-x, -z), y - 3]);
  }
  g.add(townHouses(houses, { seed: 5, fine: false, tanks: 0.6, paint: ['#f1e6cf', '#9fc3c9', '#e7b9b0', '#c9d6a3', '#f4f1ea', '#b9a7cf', '#e9d9b8'] }));
}
