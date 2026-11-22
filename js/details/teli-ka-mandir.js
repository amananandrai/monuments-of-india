import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, rng, photo } from '../helpers.js';
import { mergeByMaterial, merlons } from '../parts/components.js';
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
