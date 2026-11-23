import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, inst, unitBox, rng, photo } from '../helpers.js';
import { mergeByMaterial, merlons, templeNiche } from '../parts/components.js';
import { figure, figureGeo } from '../parts/sculpture.js';
import { guardian } from '../parts/figures.js';
import { chandrashala } from '../parts/temples.js';
import { doorFrame, templeDoorway } from '../parts/doorways.js';
import { trees, shrubs, scatter, along, asiBoard, lampPosts, benches } from '../parts/realism.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';

// Teli ka Mandir on the plateau of Gwalior Fort: the temple stands alone in a lawn edged by
// paths, with fragments of carving laid out round it, a low compound wall, neem trees and dry
// grass on the sandstone plateau, and the fort's rampart along the cliff edge to the west, the
// plain of Gwalior below it. Dimensions follow js/monuments/teli-ka-mandir.js.
const ROCK = photo(mat('#a2906f', 0.93), 'sandstone');
const WALL = photo(mat('#9c8a6a', 0.92), 'rubble');
const LAWN = mat('#7a8f4f', 0.95);
const DRY = mat('#b6a46e', 0.95);

// The carving of the walls and the porch. From photographs:
// - every niche of the walls is empty, its image long gone, but over each rises a tall pediment
//   (udgama) of gavaksha mesh, tier on tier of little arch-windows narrowing to a ribbed stone;
// - the central bay of the north, south and west faces holds a false door: two square pillars in a
//   dark recess, a carved frame with the river goddesses at its foot, and a broad pediment of mesh;
// - the portal of the porch: Ganga and Yamuna at the foot of its jambs, each under a parasol with
//   an attendant and a door guardian, a man on one side and a woman on the other; amorous couples
//   (mithunas) in panels up the jambs; a Garuda on the lintel, and over him a great chaitya window;
//   inside, the inner door with its own pair of guardians, a small window and an opening above it.
// A pediment w wide and h high on a wall at z = 0, from y = 0.
function udgama(w, h, { S, MESHED }) {
  const g = new THREE.Group(), n = 5, sh = h / (n + 0.6);
  for (let k = 0; k < n; k++) {
    const ww = w * (1 - (0.7 * k) / n), dp = 0.32 - k * 0.03;
    g.add(box(ww, sh * 0.74, dp, MESHED, 0, k * sh, dp / 2), box(ww + 0.14, sh * 0.26, dp + 0.08, S, 0, k * sh + sh * 0.74, dp / 2 + 0.04));
  }
  g.add(at(chandrashala(w * 0.16, S, 0.18), 0, sh * 0.45, 0.32), at(mesh(new THREE.SphereGeometry(w * 0.13, 10, 5).scale(1, 0.5, 0.6), S), 0, n * sh + w * 0.05, 0.1));
  return g;
}
// A river goddess at the foot of a jamb, h high, facing +z: the goddess on her mount, an attendant
// holding the parasol over her, and the door guardian on the outside (+x), a woman where `female`.
function riverGoddess(h, female, { S }) {
  const g = new THREE.Group();
  g.add(box(0.5 * h, 0.1 * h, 0.3 * h, S, 0, 0, 0), at(figure(h * 0.9, S, 'mirror'), 0, 0.1 * h, 0), at(figure(h * 0.72, S, 'chauri'), -0.34 * h, 0, 0.02));
  g.add(cyl(0.012 * h, 0.012 * h, 0.5 * h, S, -0.22 * h, 0.68 * h, 0, 5), cyl(0.2 * h, 0.24 * h, 0.04 * h, S, -0.05 * h, 1.14 * h, 0, 10));
  g.add(at(female ? figure(h, S, 'thorn') : guardian(h, S), 0.42 * h, 0, 0.02));
  return g;
}
export function carving({ P, W, D, pb, PW, PD, DW, DH }, mats) {
  const { S, Sd, MESHED } = mats, d = new THREE.Group(), H = Math.PI / 2, low = detail.low;
  // The empty niches, each under its pediment.
  const bay = (a, dist, lat, w = 0.95, nh = 2.1, ph = 3.3) => {
    d.add(onFace(at(templeNiche(w, nh, S, { crown: false }), 0, P + 2.5, 0), a, dist, lat), onFace(at(udgama(w * 1.75, ph, mats), 0, P + 2.5 + nh + 0.22, 0), a, dist, lat));
  };
  for (const s of [-1, 1]) {
    for (const l of [-3.75, 3.75]) bay(s * H, W / 2 + 0.01, l);
    for (const l of [-4.5, -6.7]) { bay(Math.PI, D / 2 + 0.01, s * l); bay(0, D / 2 + 0.01, s * (l - 0.5)); }
    // A niche on each flank of the porch.
    bay(s * H, PW / 2 + 0.01, -(D / 2 + PD / 2 + 0.3) * s, 0.85, 2.3, 3.6);
  }
  // The false doors of the three other bays.
  for (const [a, dist, dw] of [[Math.PI, D / 2 + pb, 2.6], [H, W / 2 + pb, 2.2], [-H, W / 2 + pb, 2.2]]) {
    const fd = new THREE.Group(), dh = 5, bw = 0.34;
    fd.add(box(dw, dh, 0.04, M.recess, 0, 0, 0.02), doorFrame(dw, dh, { bands: 3, bw, depth: 0.5, d0: 0.25, m: S }));
    for (const x of [-1, 1]) fd.add(box(0.36, dh, 0.3, S, x * dw * 0.2, 0, 0.17), box(0.5, 0.4, 0.36, Sd, x * dw * 0.2, dh - 0.4, 0.18));
    fd.add(at(figure(0.6, S, 'seated'), 0, dh + 0.1, 0.5));
    for (const x of [-1, 1]) { const rg = at(riverGoddess(1.5, false, mats), x * (dw / 2 + bw * 1.3), 0, 0.55); rg.scale.x = x; fd.add(rg); }
    fd.add(at(udgama(dw + 6 * bw + 0.6, 3.3, mats), 0, dh + 3 * bw + 0.15, 0));
    d.add(onFace(at(fd, 0, P + 1.15, 0), a, dist + 0.01));
  }
  // The portal: its frame, the back of its recess with the inner door, a window and the opening
  // over them.
  const zp = D / 2 + PD, zb = D / 2 + pb + 0.02, por = at(new THREE.Group(), 0, P, 0), bw = 0.55;
  por.add(at(doorFrame(DW, DH, { bands: 3, bw, depth: 0.5, d0: 0.2, m: S }), 0, 0, zp));
  por.add(at(templeDoorway(2, 4.3, { m: S, guardians: false, bands: 2, bw: 0.24, hood: false }), 0, 0, zb));
  por.add(box(0.8, 0.8, 0.05, M.recess, 0, 5.2, zb + 0.02), box(1.2, 0.2, 0.2, Sd, 0, 4.98, zb + 0.1), box(DW, 0.5, 0.45, Sd, 0, 6.25, zb + 0.22), box(2.2, 2, 0.05, M.recess, 0, 6.9, zb + 0.02));
  for (const s of [-1, 1]) {
    por.add(box(0.5, 2.1, 0.3, MESHED, s * 1.5, 6.85, zb + 0.15));
    // Inside, the guardians of the inner door: a man and a woman.
    por.add(at(s < 0 ? guardian(1.9, S) : figure(1.9, S, 'mirror'), s * 1.5, 0, zb + 0.35));
    // At the foot of the jambs, Ganga and Yamuna.
    const rg = at(riverGoddess(2.1, s > 0, mats), s * (DW / 2 + 0.6), 0, zp + 0.6);
    rg.scale.x = s;
    por.add(rg);
  }
  // The couples up the jambs, each pair in its own panel.
  const cells = [], men = [], women = [];
  for (const s of [-1, 1]) for (let k = 0; k < (low ? 3 : 6); k++) {
    const x = s * (DW / 2 + bw * 2.5), y = 2.9 + k * (low ? 2.5 : 1.3);
    cells.push([x, y, zp + 0.5, bw * 0.9, 1.1, 0.03]);
    men.push([x - 0.11, y + 0.04, zp + 0.52, 0.2, 0.95, 0.14]);
    women.push([x + 0.11, y + 0.04, zp + 0.52, 0.19, 0.9, 0.14]);
  }
  por.add(inst(unitBox(), cells, M.recess), inst(figureGeo('standing'), men, S), inst(figureGeo('mirror'), women, S));
  // Garuda on the lintel, his wings spread; and the chaitya window over him, mesh either side.
  const gy = DH + 3 * bw + 0.2;
  por.add(box(3.4, 1.5, 0.06, M.recess, 0, gy, zp + 0.03), at(figure(1.3, S, 'seated'), 0, gy + 0.1, zp + 0.25));
  for (const s of [-1, 1]) por.add(at(mesh(new THREE.SphereGeometry(1, 8, 5).scale(0.75, 0.3, 0.1), S), s * 0.95, gy + 0.95, zp + 0.12).rotateZ(s * 0.35));
  por.add(at(chandrashala(1.15, S, 0.4), 0, gy + 2.85, zp + 0.01));
  for (const s of [-1, 1]) por.add(box(1.5, 2.3, 0.2, MESHED, s * (PW / 2 - 0.85), gy + 1.7, zp + 0.1), box(1.7, 0.25, 0.3, S, s * (PW / 2 - 0.85), gy + 1.45, zp + 0.15));
  d.add(por);
  return mergeByMaterial(d);
}

export function addDetails(f, g, { P, W, D }) {
  // The plateau: level near the temple, falling away in a cliff beyond the rampart on the west
  // (-x) to the plain, with dry grass and rock.
  const plateau = (x, z) => {
    const cliff = smooth(-150, -175, x);
    return -0.25 - cliff * 85 + 3 * fbm(x, z, { scale: 0.01, octaves: 3 }) * (1 - cliff) * smooth(40, 90, Math.hypot(x, z - 6));
  };
  g.add(heightField(1400, 1400, detail.low ? 90 : 140, plateau, { rock: ['#8f7d60', '#a08c6c'], cover: '#a99a64', steep: 0.75, band: 14 }));
  g.add(box(90, 0.2, 80, LAWN, 0, -0.15, 6));
  // Paths round the platform and out to the east.
  g.add(box(W + 12, 0.06, 3, M.path, 0, 0.05, D / 2 + 10), box(3, 0.06, 60, M.path, 0, 0.05, 40), box(3, 0.06, D + 20, M.path, W / 2 + 7.5, 0.05, 1), box(3, 0.06, D + 20, M.path, -W / 2 - 7.5, 0.05, 1));
  // Fragments of carving set out on low plinths along the paths, as at the site.
  const R = rng(5), bits = [];
  for (let k = 0; k < 18; k++) for (const s of [-1, 1]) bits.push([s * (W / 2 + 10.5), 0.05, -9 + k * 1.3, 0.7, 0.5 + R() * 0.7, 0.5 + R() * 0.3]);
  g.add(inst(unitBox(), bits, ROCK));
  // A low compound wall round the lawn, with a gate on the east.
  const wall = new THREE.Group(), cw = 90, cd = 80, cz = 6;
  wall.add(box(cw, 1.2, 0.6, WALL, 0, 0, cz - cd / 2));
  for (const s of [-1, 1]) wall.add(box(0.6, 1.2, cd, WALL, s * cw / 2, 0, cz), box(cw / 2 - 3, 1.2, 0.6, WALL, s * (cw / 4 + 1.5), 0, cz + cd / 2), box(1, 2.2, 1, WALL, s * 2.6, 0, cz + cd / 2));
  g.add(mergeByMaterial(wall));
  g.add(asiBoard('Teli ka Mandir', 5, D / 2 + 14, -0.3));
  g.add(lampPosts([...along(4, [-3, 22], [-3, 42]), ...along(4, [3, 22], [3, 42])]), benches([[-W / 2 - 9.5, -4], [W / 2 + 9.5, -4]]));
  // The fort's rampart along the cliff edge to the west, with round bastions and merlons.
  const ram = new THREE.Group(), rx = -140;
  ram.add(box(5, 9, 360, WALL, rx, -2, 0));
  for (let z = -160; z <= 160; z += 40) ram.add(cyl(5, 6, 10, WALL, rx - 1, -2, z, 16));
  ram.add(at(merlons(360, 0.9, 1.1, 0.5, WALL).rotateY(Math.PI / 2), rx + 1.8, 7, 0));
  g.add(mergeByMaterial(ram));
  // Neem, khejri and dry scrub on the plateau.
  const keep = [[-50, 50, -40, 50], [-4, 4, 40, 80]];
  g.add(trees(scatter(detail.low ? 14 : 26, [-130, 160, -150, 150], { seed: 3, gap: 14, avoid: keep }), { kind: 'neem', seed: 3 }));
  g.add(trees([[-38, -30], [38, -30], [-40, 36], [40, 36], [-20, -32], [22, -33]], { kind: 'neem', seed: 7 }));
  g.add(trees(scatter(12, [-130, 160, -150, 150], { seed: 9, gap: 20, avoid: keep }), { kind: 'khejri', seed: 9 }));
  g.add(shrubs(scatter(40, [-130, 160, -150, 150], { seed: 4, gap: 7, avoid: keep }).map(([x, z]) => [x, z, 1]), { seed: 4, dry: true }));
  g.add(box(16, 0.08, 16, DRY, 60, 0.02, -60));
}
