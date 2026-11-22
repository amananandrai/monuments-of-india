import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, archPanel, inst, unitBox, unitCyl, rng, sheet, photo } from '../helpers.js';
import { mergeByMaterial, frieze, idol, archRing } from '../parts/components.js';
import { carvedPillar } from '../parts/temples.js';
import { nandi } from '../parts/animals.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, SHADE, R } from '../monuments/warangal-fort.js';

const GRANITE = photo(mat('#8f887b', 0.92), 'rubble');

// Warangal, finer detail. From photographs of the site, now an open-air museum: the carved stones
// of the destroyed temple lie gathered on its plinth and in rows across the lawn, pillars standing
// singly and in pairs, beams, ceiling slabs and panels of images among them; a great Nandi faces
// where the sanctum stood. Dimensions follow js/monuments/warangal-fort.js: the gateways R from
// the centre, the plinth 36 across.
function ruins(f) {
  const d = new THREE.Group(), Rn = rng(31);
  // Pillars still standing on the plinth, in the grid of the lost hall.
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 1; j++) {
    if (Rn() < 0.45) continue;
    const h = 2.6 + Rn() * 1.2;
    d.add(at(carvedPillar(h, STONE), i * 3.4, 1.1, 2 + j * 3.4));
    if (Rn() < 0.4) d.add(box(3.6, 0.45, 0.6, SHADE, i * 3.4 + 1.7, 1.1 + h, 2 + j * 3.4));
  }
  // Fallen beams and slabs, and panels of images propped in rows on the lawn: the museum's display.
  const slabs = [];
  for (let k = 0; k < 40; k++) { const a = Rn() * 6.28, r = 6 + Rn() * 10; slabs.push([Math.sin(a) * r, 1.1, Math.cos(a) * r, 1 + Rn() * 2.4, 0.35 + Rn() * 0.3, 0.6 + Rn() * 0.5, Rn() * 3]); }
  d.add(inst(unitBox(), slabs, SHADE));
  for (const side of [-1, 1]) for (let k = 0; k < 12; k++) {
    const z = -24 + k * 4.2, x = side * 25;
    d.add(box(1.4, 0.3, 0.9, SHADE, x, 0, z), at(box(1.2, 1.6, 0.25, frieze(STONE), 0, 0, 0), x, 0.3, z).rotateY(side * Math.PI / 2));
    if (k % 3 === 1) d.add(at(idol(1.5, STONE), x - side * 0.25, 0.3, z).rotateY(-side * Math.PI / 2));
  }
  f.add(mergeByMaterial(d));
  // The great Nandi, facing west to where the linga stood.
  f.add(at(nandi(SHADE, 0.75), 0, 1.7, 13).rotateY(Math.PI));
}

// The Kush Mahal (Shitab Khan's audience hall), 150 m west of the gateways: a long hall of grey
// granite with sloping walls, each face opened in tall pointed arches.
function kushMahal() {
  const g = new THREE.Group(), L = 38, W = 16, H = 12;
  g.add(box(L + 2, 0.6, W + 2, SHADE), box(L, H, W, GRANITE, 0, 0.6, 0), box(L + 0.6, 0.6, W + 0.6, SHADE, 0, H + 0.6, 0));
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? L : W, n = long ? 7 : 3;
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n);
      g.add(onFace(at(archPanel(2.6, 7.6, true, M.recess, 0.06), 0, 1.4, 0), a, (long ? W : L) / 2, lat));
      g.add(onFace(at(archRing(2.6, 7.6, true, 0.25, 0.08, SHADE), 0, 1.4, 0), a, (long ? W : L) / 2 + 0.02, lat));
    }
  }
  return g;
}

// The inner wall of the fort, of huge dressed granite blocks with square bastions, a ring 1.2 km
// across: a stretch of it seen to the north beyond the trees.
function stoneWall(g) {
  const segs = [], bast = [];
  for (let k = 0; k < 40; k++) {
    const a = -0.9 + (k / 40) * 1.8, a1 = -0.9 + ((k + 1) / 40) * 1.8, rr = 420;
    const x0 = Math.sin(a) * rr, z0 = -Math.cos(a) * rr, x1 = Math.sin(a1) * rr, z1 = -Math.cos(a1) * rr;
    segs.push([(x0 + x1) / 2, 0, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0) + 0.3, 6.5, 5, Math.atan2(z0 - z1, x1 - x0)]);
    if (k % 5 === 0) bast.push([x0, 0, z0, 11, 8, 11, -a]);
  }
  g.add(inst(unitBox(), segs, GRANITE), inst(unitBox(), bast, GRANITE));
}

// Warangal: the lawns of the archaeological park round the gateways, paths between them, the Kush
// Mahal, tamarind and neem trees, the fort's moat-like tank to the east, and the ASI board.
export function addDetails(f, g) {
  ruins(f);
  g.add(box(900, 0.2, 900, mat('#9a9466', 0.95), 0, -0.2, 0), box(130, 0.04, 130, M.grass, 0, 0, 0));
  // Paths from gate to gate across the lawn, and out to the road from the east gate.
  g.add(box(4, 0.06, 2 * R + 8, M.path, 0, 0.02, 0), box(2 * R + 8, 0.06, 4, M.path, 0, 0.02, 0), box(70, 0.06, 5, M.path, R + 38, 0.02, 0));
  g.add(at(kushMahal(), -160, 0, 30));
  stoneWall(g);
  g.add(sheet(220, 120, M.lake, 230, 0.05, -60), box(226, 0.6, 2, SHADE, 230, -0.2, 0));
  const spots = scatter(90, [-300, 300, -300, 300], { seed: 7, gap: 14, avoid: [[-70, 70, -70, 70], [-185, -135, 10, 50], [118, 342, -122, 2]] });
  g.add(trees(spots.filter((_, i) => i % 3 === 0), { kind: 'tamarind', seed: 2 }), trees(spots.filter((_, i) => i % 3 === 1), { kind: 'neem', seed: 3 }), trees(spots.filter((_, i) => i % 3 === 2), { kind: 'babul', seed: 4 }));
  if (!detail.low) g.add(shrubs(scatter(30, [-64, 64, -64, 64], { seed: 9, gap: 5, avoid: [[-20, 20, -20, 20], [-4, 4, -64, 64], [-64, 64, -4, 4], [-28, -22, -28, 28], [22, 28, -28, 28]] }).map(([x, z]) => [x, z, 1.3]), { seed: 6 }));
  g.add(lampPosts([...along(5, [3, 52], [3, 90]), ...along(5, [-3, 52], [-3, 90])]), benches([[6, 30, -Math.PI / 2], [-6, -30, Math.PI / 2], [30, 6, Math.PI], [-30, -6, 0]]));
  g.add(asiBoard('Warangal Fort', 8, 58, 0));
}
