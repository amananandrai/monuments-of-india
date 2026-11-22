import * as THREE from 'three';
import { M, mat, box, cyl, at, onionDome, finial } from '../helpers.js';
import { mergeByMaterial, dentils, clockFace } from '../parts/components.js';
import { classicalDoor, balustrade } from '../parts/colonial.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { trees, shrubs, lampPosts, benches, boats, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, WASH, WHITE } from '../monuments/hazarduari-palace.js';

const IRON = mat('#3a3836', 0.6, 0.5);

// Hazarduari, finer detail. From photographs: a dentilled cornice runs under the parapet; the
// parapet over the portico's pediment and over the end pavilions is a white balustrade; and the
// stair is guarded by a pair of seated lions on its pedestals. Measures follow
// js/monuments/hazarduari-palace.js.
function architecture(f) {
  const { W, D, H, PW, PD, FL } = P, d = new THREE.Group(), fz = D / 2;
  for (const s of [-1, 1]) {
    d.add(at(dentils(W, 0.3, 0.3, 0.3, WHITE), 0, H - 0.3, s * (fz + 0.15)).rotateY(s > 0 ? 0 : Math.PI));
    d.add(at(dentils(D, 0.3, 0.3, 0.3, WHITE), s * (W / 2 + 0.15), H - 0.3, 0).rotateY(s * Math.PI / 2));
  }
  for (const s of [-1, 1]) d.add(at(balustrade(13, 1.1, WHITE), s * (PW / 2 + 9), H + 2.25, fz + 0.1));
  // The lions on the pedestals at the foot of the stair.
  for (const s of [-1, 1]) {
    const x = s * 18.2, z = fz + PD + 12.6;
    d.add(box(2.4, 1.6, 3.4, WHITE, x, 0, z), box(1.4, 1.4, 2.4, WASH, x, 1.6, z), box(1.1, 1.3, 1, WASH, x, 2.7, z + 0.9));
  }
  f.add(mergeByMaterial(d));
  void FL;
}

// The Nizamat Imambara across the lawn to the north: a long white two-storey front of arches with
// a raised middle, the largest imambara in Bengal. Simplified, at the edge of the view.
function imambara(z) {
  const g = new THREE.Group(), L = 160, H = 13;
  g.add(box(L, H, 18, WHITE, 0, 0, z));
  g.add(at(arcadeSkin(L, H, cellRow(36, L / 36, 1, 2.6, 4.4).concat(cellRow(36, L / 36, 7.2, 2.4, 4)), 1.2, WHITE, { trim: WASH, pointed: true, fill: 'room' }), 0, 0, z - 9).rotateY(Math.PI));
  g.add(box(L + 0.8, 0.6, 18.8, WASH, 0, H, z), box(40, 5, 14, WHITE, 0, H, z));
  for (const x of [-20, 20]) g.add(cyl(1.2, 1.2, 8, WHITE, x, H, z - 7, 10), at(onionDome(1.4, WHITE), x, H + 8, z - 7));
  return mergeByMaterial(g);
}

// The palace's grounds at Murshidabad: the lawn running north to the Imambara, with the clock tower
// (Ghari Ghar) and the little Madina mosque between them; the Bachhawali cannon on its platform;
// the Bhagirathi river along the west, with country boats; mango trees, palms and lamps.
export function addDetails(f, g) {
  architecture(f);
  const { W, D, PD } = P, fz = D / 2;
  g.add(box(520, 0.06, 460, M.grass, 0, -0.06, 30));
  g.add(box(34, 0.05, 80, M.path, 0, 0, fz + PD + 52), box(220, 0.05, 6, M.path, 0, 0, fz + 90), box(160, 0.05, 6, M.path, 0, 0.001, -fz - 12));
  // The river to the west.
  g.add(box(140, 0.4, 460, M.bank, -200, -0.3, 30), box(200, 0.05, 460, M.river, -225, 0.12, 30));
  if (!detail.low) g.add(boats([[-190, -40], [-205, 30], [-185, 90], [-215, 140]], { canopy: true }));
  g.add(imambara(fz + 150));
  // The clock tower: a square tower of three stages with a clock face on each side, under a dome.
  const ct = new THREE.Group(), cx = 0, cz = fz + 124;
  ct.add(box(6, 20, 6, WASH, cx, 0, cz), box(6.8, 0.6, 6.8, WHITE, cx, 10, cz), box(6.8, 0.6, 6.8, WHITE, cx, 20, cz), box(4.6, 4, 4.6, WASH, cx, 20.6, cz));
  ct.add(at(onionDome(2.6, WHITE), cx, 24.6, cz), at(finial(2, M.gold), cx, 29.4, cz));
  for (const [a, x, z] of [[0, 0, 3.05], [Math.PI / 2, 3.05, 0], [Math.PI, 0, -3.05], [-Math.PI / 2, -3.05, 0]]) ct.add(at(clockFace(1.6), cx + x, 16, cz + z).rotateY(a));
  g.add(ct);
  // The Madina mosque: a small domed hall with four corner turrets.
  const md = new THREE.Group(), mx = -60, mz = fz + 95;
  md.add(box(14, 7, 10, WHITE, mx, 0, mz), at(onionDome(3.2, WHITE), mx, 7, mz));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) md.add(cyl(0.5, 0.6, 10, WHITE, mx + sx * 6.6, 0, mz + sz * 4.6, 8), at(onionDome(0.7, WHITE), mx + sx * 6.6, 10, mz + sz * 4.6));
  md.add(at(classicalDoor(2, 3.6, { m: WHITE, trim: WASH, shape: 'pointed', top: null, depth: 0.3 }), mx, 0, mz + 5));
  g.add(mergeByMaterial(md));
  // The Bachhawali Tope, a great bronze cannon, on its platform beside the lawn.
  const gun = cyl(0.55, 0.75, 5.6, M.bronze, 0, 0, 0, 16);
  gun.rotation.z = Math.PI / 2 - 0.06;
  gun.position.set(38, 1.6, fz + 34);
  g.add(box(8, 0.8, 3, WASH, 38, 0, fz + 34), gun, box(1.2, 0.9, 1.6, IRON, 36, 0.8, fz + 34), box(1.2, 0.9, 1.6, IRON, 40, 0.8, fz + 34));
  g.add(trees(scatter(26, [-140, 170, -120, 140], { seed: 4, gap: 14, avoid: [[-W / 2 - 14, W / 2 + 14, -fz - 20, fz + 32], [-22, 22, fz, fz + 120], [-90, 100, fz + 78, fz + 175]] }), { kind: 'mango', seed: 4 }));
  g.add(trees([...along(8, [-24, fz + 50], [-24, fz + 86]), ...along(8, [24, fz + 50], [24, fz + 86])], { kind: 'palm', seed: 8, h: 11 }));
  g.add(shrubs([...along(14, [-19, fz + 34], [-19, fz + 88]), ...along(14, [19, fz + 34], [19, fz + 88])].map(([x, z]) => [x, z, 0.9]), { seed: 5, flowers: '#e06a3a' }));
  g.add(lampPosts([...along(5, [-17.5, fz + 36], [-17.5, fz + 88]), ...along(5, [17.5, fz + 36], [17.5, fz + 88])]));
  g.add(benches([[-28, fz + 46], [28, fz + 46], [-28, fz + 70], [28, fz + 70]]));
  g.add(asiBoard('Hazarduari Palace', 22, fz + 92, 0, { line2: 'MUSEUM' }));
}
