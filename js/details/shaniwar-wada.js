import * as THREE from 'three';
import { M, box, cyl, at, sheet, starPrism, inst, unitCyl } from '../helpers.js';
import { petalRing, mergeByMaterial, archSlab } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { horse } from '../parts/animals.js';
import { figure } from '../parts/sculpture.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along, fountains, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE } from '../monuments/shaniwar-wada.js';

// Shaniwar Wada, finer detail and setting. Inside the walls only the plinths of the palace remain:
// the stone footings of its courts and halls, the bases of their teak pillars in rows, and in the
// garden the Hazari Karanje, the fountain of a thousand jets, a lotus of sixteen petals. Lawns and
// paths now run between them. Outside, the Delhi Darwaza faces a road and a square with the
// equestrian statue of Bajirao I, and the old city of Pune presses up to the walls. Dimensions
// follow js/monuments/shaniwar-wada.js: the walls WX by WZ (half-sizes), WH high and T thick.
function ruins(f, { WX, WZ }) {
  const S = STONE, d = new THREE.Group(), bases = [];
  // The plinths of the palace's courts: [x, z, w, d, h].
  const plinths = [[-30, 20, 46, 32, 1.4], [26, 22, 38, 30, 1.2], [-34, -30, 40, 30, 1.1], [20, -34, 44, 26, 1.3], [-2, -4, 22, 14, 0.9]];
  for (const [x, z, w, dd, h] of plinths) {
    d.add(box(w, h, dd, S.basalt, x, 0, z), box(w + 0.3, 0.2, dd + 0.3, S.trim, x, h - 0.2, z));
    // A sunken court in the middle of each, and the pillar bases round it.
    d.add(box(w * 0.45, 0.06, dd * 0.45, M.grass, x, h, z));
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
      bases.push([x - w * 0.3 + (i * w * 0.6) / 6, h, z + s * dd * 0.3, 0.6, 0.45, 0.6]);
      if (i % 2 === 0) bases.push([x + s * w * 0.3, h, z - dd * 0.3 + (i * dd * 0.6) / 6, 0.6, 0.45, 0.6]);
    }
    d.add(at(steps(3, h, Math.ceil(h / 0.3), S.trim), x, 0, z + dd / 2));
  }
  // The Hazari Karanje: a star-shaped basin, its rim cut in petals, a lotus within.
  const hx = 32, hz = -4;
  d.add(at(starPrism(16, 6.2, 5.2, 0.7, S.trim), hx, 0, hz), at(petalRing(5.6, 16, 1, 0.9, 0.25, S.trim, 0.2), hx, 0.7, hz));
  d.add(at(petalRing(1.8, 16, 1.2, 0.6, 0.6, S.trim, 0.2), hx, 0.4, hz));
  f.add(mergeByMaterial(d), inst(unitCyl(8), bases, S.trim));
  f.add(at(cyl(5.1, 5.1, 0.05, M.water, 0, 0, 0, 32), hx, 0.6, hz), fountains(along(6, [hx - 3, hz], [hx + 3, hz]), { y: 0.65, h: 1.4 }));
  // Small doors in the other gates: the Mastani, Khidki, Ganesh and Narayan Darwazas.
  for (const [x, z, a] of [[-50, WZ, 0], [-WX, 30, -Math.PI / 2], [WX, -30, Math.PI / 2], [30, -WZ, Math.PI]]) {
    const o = at(new THREE.Group(), x, 0, z);
    o.rotation.y = a;
    o.add(at(archSlab(2.4, 3.8, true, M.recess, 0.05), 0, 0, 1.62), at(archSlab(2.2, 3.6, true, STONE.teak, 0.05), 0, 0, 1.66));
    f.add(o);
  }
}

// Shaniwar Wada in Pune: lawns and paths within the walls, the square before the Delhi Darwaza
// with Bajirao's statue, and the streets of the old city round it.
export function addDetails(f, g, dims) {
  ruins(f, dims);
  const { WX, WZ } = dims, S = STONE;
  g.add(box(2 * WX - 4, 0.1, 2 * WZ - 4, M.grass, 0, 0, 0));
  g.add(box(6, 0.16, 2 * WZ - 6, M.path, 0, 0, 0), box(2 * WX - 6, 0.16, 6, M.path, 0, 0, 10));
  g.add(box(900, 0.06, 900, M.path, 0, -0.04, 0));
  // The square before the gate, and the road along the front.
  g.add(box(70, 0.12, 30, M.path, 0, 0, WZ + 20), box(600, 0.1, 14, M.asphalt, 0, 0, WZ + 44));
  g.add(traffic([[WZ + 41, 1], [WZ + 47, -1]], -280, 280, { y: 0.1, gap: 30, seed: 4 }));
  // Bajirao I on horseback, on a tall pedestal facing the road.
  const sx = 0, sz = WZ + 24;
  g.add(box(4.2, 3.4, 6.2, S.trim, sx, 0, sz), box(4.8, 0.4, 6.8, S.basalt, sx, 3.4, sz));
  const h = at(horse(M.bronze, { prance: true, coarse: detail.low }), sx, 3.8, sz);
  g.add(h, at(figure(1.8, M.bronze), sx, 5.5, sz - 0.2));
  g.add(lampPosts(along(6, [-30, WZ + 32], [30, WZ + 32])), benches([[-20, WZ + 12, Math.PI], [20, WZ + 12, Math.PI]]));
  g.add(asiBoard('Shaniwar Wada', 16, WZ + 8, 0));
  // Trees in the grounds and along the walls.
  g.add(trees(scatter(26, [-WX + 8, WX - 8, -WZ + 8, WZ - 8], { seed: 3, gap: 14 }).filter(([x, z]) => Math.abs(x) > 52 || Math.abs(z) > 52), { kind: 'mango', seed: 6 }));
  g.add(trees([[-WX - 12, 40], [-WX - 12, -20], [WX + 12, 30], [WX + 14, -40], [-60, -WZ - 12], [50, -WZ - 12]], { kind: 'peepal', seed: 2 }));
  g.add(shrubs(along(14, [-3.5, -WZ + 10], [-3.5, WZ - 12]).map(([x, z]) => [x, z, 0.8]), { seed: 9 }));
  // The old city: rows of houses beyond the road and round the other three sides.
  const spots = scatter(420, [-280, 280, -260, 280], { seed: 12, gap: 11 }).filter(([x, z]) => (Math.abs(x) > WX + 22 || z < -WZ - 22 || z > WZ + 56));
  g.add(townHouses(spots.map(([x, z], i) => [x, z, 7 + (i % 3) * 1.6, 9 + (i % 2) * 2, 1 + (i % 3), (i % 4) * Math.PI / 2]), { seed: 5, fine: false }));
}
