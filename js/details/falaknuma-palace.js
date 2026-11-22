import * as THREE from 'three';
import { M, box, cyl, at, ring } from '../helpers.js';
import { mergeByMaterial, dentils } from '../parts/components.js';
import { statue, urn } from '../parts/sculpture.js';
import { heightField, smooth, fbm } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, fountains, scatter, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, WHITE, TRIM } from '../monuments/falaknuma-palace.js';

// Falaknuma, finer detail. From photographs: dentils under the main cornice; urns on the
// balustrade's piers over the portico; marble statues on pedestals along the forecourt. Measures
// follow js/monuments/falaknuma-palace.js.
function architecture(f) {
  const { W, D, FL, PW } = P, d = new THREE.Group(), fz = D / 2, y = 1.2 + 2 * FL - 0.3;
  for (const s of [-1, 1]) d.add(at(dentils(W - 18, 0.28, 0.28, 0.28, TRIM), 0, y, s * (fz + 0.14)).rotateY(s > 0 ? 0 : Math.PI));
  for (const x of [-PW / 2 - 4, -PW / 2 - 14, PW / 2 + 4, PW / 2 + 14]) d.add(at(urn(1.3, TRIM), x, 1.2 + 2 * FL + 2, fz + 0.1));
  f.add(mergeByMaterial(d));
  if (!detail.low) for (const s of [-1, 1]) for (const z of [36, 46]) {
    const x = s * 11;
    f.add(box(1.3, 1.6, 1.3, TRIM, x, 0, fz + z), at(statue(2.2, WHITE), x, 1.6, fz + z));
  }
}

// The Koh-e-Falaknuma: a rocky hilltop some 600 m above the sea, about 60 m above the old city
// around it, levelled for the palace and its gardens.
function hillY(x, z) {
  const r = Math.hypot(x, (z + 10) / 1.2);
  return -58 * smooth(150, 330, r) + 4 * fbm(x, z, { scale: 0.012, octaves: 3 }) * smooth(140, 200, r);
}

// The palace on its hill: the forecourt between the claws, its fountain and a lawn; the drive
// winding down to the north; terraced gardens and palms; the old city of Hyderabad below.
export function addDetails(f, g) {
  architecture(f);
  const { W, D } = P, fz = D / 2;
  g.add(heightField(1300, 1300, detail.low ? 90 : 140, hillY, { cz: 0, rock: ['#8d8272', '#a09584', '#7c7467'], cover: '#7f8a55', steep: 0.82 }));
  g.add(box(250, 0.1, 240, M.grass, 0, -0.06, -10));
  // The forecourt: a gravel court, a round pool and fountain on the axis, and a lawn beyond it.
  g.add(box(60, 0.05, 70, M.path, 0, 0.02, fz + 40));
  const pz = fz + 34;
  g.add(at(ring(7, 0.7, TRIM, 0, 40), 0, 0, pz), cyl(6.95, 6.95, 0.45, M.water, 0, 0, pz, 40), cyl(1.4, 1.8, 1.6, TRIM, 0, 0, pz, 16), fountains([[0, pz]], { y: 1.6, h: 3 }));
  // The drive down the hill.
  g.add(box(9, 0.05, 80, M.path, 0, 0.03, fz + 112));
  g.add(lampPosts([...along(6, [-6, fz + 76], [-6, fz + 150]), ...along(6, [6, fz + 76], [6, fz + 150])]));
  g.add(trees([...along(7, [-36, fz + 10], [-36, fz + 80]), ...along(7, [36, fz + 10], [36, fz + 80])], { kind: 'palm', seed: 5, h: 13 }));
  g.add(trees(scatter(30, [-120, 120, -120, 110], { seed: 7, gap: 14, avoid: [[-W / 2 - 14, W / 2 + 14, -fz - 85, fz + 6], [-45, 45, fz, fz + 160]] }), { kind: 'neem', seed: 7 }));
  g.add(shrubs([...along(10, [-28, fz + 60], [-12, fz + 60]), ...along(10, [12, fz + 60], [28, fz + 60])].map(([x, z]) => [x, z, 1]), { seed: 3, flowers: '#d94f7a' }));
  // Scrub on the slopes; the city below.
  const slope = scatter(detail.low ? 40 : 90, [-480, 480, -480, 480], { seed: 11, gap: 14 }).filter(([x, z]) => { const r = Math.hypot(x, (z + 10) / 1.2); return r > 170 && r < 330; });
  g.add(trees(slope.map(([x, z]) => [x, z, null, hillY(x, z)]), { kind: 'babul', seed: 11 }));
  g.add(cityAround([-380, 380, -420, 400], { rows: detail.low ? 1 : 4, every: detail.low ? 4 : 1, fine: false, y: -58, gap: 4, storeys: [2, 4], seed: 41,
    paint: ['#efe6d2', '#e3d3b2', '#cfd8d4', '#e8d0b8', '#d9e2c4', '#f1e9d8'] }));
}
