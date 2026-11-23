import * as THREE from 'three';
import { M, mat, box, cyl, at, sheet } from '../helpers.js';
import { mergeByMaterial, beltCourse } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, scatter, along, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { S, WHITE, TRIM } from '../monuments/san-thome-basilica.js';

const GILT = mat('#e2b33c', 0.5, 0.1);

// San Thome, finer detail. From photographs: a grey plinth and a string course under the windows
// run round the church; a white Calvary stands on a pedestal in the forecourt, and a tall gilt
// flagmast with a cross by the road beside the tower.
// Round it, the compound in Mylapore: a paved forecourt behind a white wall and gate on San Thome
// High Road, the low museum over the tomb's crypt behind the church, coconut palms and neem, the
// town's houses, and Santhome beach and the Bay of Bengal a few hundred metres behind the apse.
function architecture(f) {
  const { FZ, LEN, NW, AW, CZ, TW, TXO, CH } = S, d = new THREE.Group(), BZ = FZ - LEN, ez = CZ - TW / 2, al = ez - (BZ + CH);
  d.add(at(beltCourse(NW + 2 * AW + 0.2, al, 0, 0.8, 0.2, TRIM), 0, 0, ez - al / 2), at(beltCourse(NW + 2 * AW, al, 1.6, 0.25, 0.15, TRIM), 0, 0, ez - al / 2));
  d.add(at(beltCourse(2 * TXO, TW, 0, 0.8, 0.2, TRIM), 0, 0, CZ), at(beltCourse(NW + 6, CH, 0, 0.8, 0.2, TRIM), 0, 0, BZ + CH / 2));
  // The Calvary in the forecourt.
  d.add(box(2.4, 1.6, 2.4, TRIM, 0, 0, FZ + 22), box(1.6, 1, 1.6, WHITE, 0, 1.6, FZ + 22), box(0.35, 5, 0.35, WHITE, 0, 2.6, FZ + 22), box(2.4, 0.35, 0.35, WHITE, 0, 6.1, FZ + 22));
  // The flagmast by the road, beside the tower: a tall gilt mast ringed with mouldings on a
  // moulded foot, a cross on its tip.
  const mx = S.TX + 15, mz = FZ - 6;
  d.add(cyl(0.9, 1.1, 1.2, WHITE, mx, 0, mz, 8), cyl(0.32, 0.4, 21, GILT, mx, 1.2, mz, 12), cyl(0.5, 0.5, 0.5, GILT, mx, 22.2, mz, 12));
  for (let y = 2; y < 22; y += 0.9) d.add(cyl(0.44, 0.44, 0.22, GILT, mx, y, mz, 12));
  d.add(box(0.12, 1.5, 0.12, GILT, mx, 22.7, mz), box(0.8, 0.12, 0.12, GILT, mx, 23.6, mz));
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g) {
  architecture(f);
  const { FZ, LEN, NW, AW } = S, BZ = FZ - LEN, W = NW + 2 * AW + 4;
  g.add(box(1400, 0.06, 760, M.grass, 0, -0.06, 160));
  // The forecourt, paved, and the compound's paths.
  g.add(box(W + 30, 0.05, 40, M.path, 0, 0, FZ + 20), box(8, 0.05, LEN + 20, M.path, W / 2 + 10, 0, FZ - LEN / 2), box(8, 0.05, LEN + 20, M.path, -W / 2 - 10, 0, FZ - LEN / 2));
  // The compound wall with its gate piers on the road, and the road itself.
  const wall = new THREE.Group();
  for (const s of [-1, 1]) {
    wall.add(box(55, 2.4, 0.5, WHITE, s * 32, 0, FZ + 41), box(55.4, 0.25, 0.7, TRIM, s * 32, 2.4, FZ + 41));
    wall.add(box(1.6, 4.4, 1.6, WHITE, s * 4.5, 0, FZ + 41), box(1.9, 0.3, 1.9, TRIM, s * 4.5, 4.4, FZ + 41), cyl(0.3, 0.5, 0.9, TRIM, s * 4.5, 4.7, FZ + 41, 8));
    wall.add(box(0.5, 2.4, LEN + 50, WHITE, s * 59.5, 0, FZ + 41 - (LEN + 50) / 2));
  }
  g.add(mergeByMaterial(wall));
  g.add(box(600, 0.06, 16, M.asphalt, 0, 0, FZ + 52));
  g.add(traffic([[FZ + 48, 1], [FZ + 52, -1], [FZ + 56, -1]], -280, 280, { gap: 16, seed: 9, taxis: 0.35, buses: 0.1, trucks: 0.02 }));
  // The museum and crypt behind the apse: a long white block with a flat roof.
  g.add(box(36, 6.5, 14, WHITE, 0, 0, BZ - 18), box(36.6, 0.4, 14.6, TRIM, 0, 6.5, BZ - 18));
  // Palms round the compound, neem along the walls, flowering shrubs by the forecourt.
  const keep = [[-W / 2 - 6, W / 2 + 6, BZ - 28, FZ + 42]];
  g.add(trees(scatter(26, [-56, 56, BZ - 40, FZ + 38], { seed: 4, gap: 8, avoid: keep }), { kind: 'palm', seed: 4 }));
  g.add(trees([...along(4, [-50, FZ + 32], [-50, BZ]), ...along(4, [50, FZ + 32], [50, BZ])], { kind: 'neem', seed: 6 }));
  g.add(shrubs([...along(6, [-W / 2 - 4, FZ + 4], [-W / 2 - 4, FZ + 36]), ...along(6, [W / 2 + 4, FZ + 4], [W / 2 + 4, FZ + 36])].map(([x, z]) => [x, z, 1.3]), { flowers: '#e8a21c', seed: 7 }));
  g.add(lampPosts([...along(3, [-10, FZ + 8], [-10, FZ + 36]), ...along(3, [10, FZ + 8], [10, FZ + 36])]));
  g.add(benches([[-16, FZ + 14], [16, FZ + 14], [-16, FZ + 30], [16, FZ + 30]]));
  // Mylapore round the compound: houses on three sides; the beach and sea beyond the apse.
  g.add(cityAround([-62, 62, BZ - 60, FZ + 60], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: false, gap: 4, storeys: [2, 4], seed: 23, keep: [[-400, 400, -800, BZ - 62]] }));
  g.add(box(1400, 0.04, 110, mat('#dcc8a0', 0.95), 0, 0, BZ - 165));
  g.add(sheet(2400, 1400, M.sea, 0, -0.3, BZ - 920));
}
