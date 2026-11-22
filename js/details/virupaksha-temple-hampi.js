import * as THREE from 'three';
import { mat, box, cyl, at, onFace, FACES } from '../helpers.js';
import { mouldings, chhajja, mergeByMaterial } from '../parts/components.js';
import { haraRow } from '../parts/sculpture.js';
import { dravidaDress, dwajasthambha, nandiMandapa } from '../parts/temples.js';
import { trees, stalls, asiBoard, lampPosts, along, scatter } from '../parts/realism.js';
import { rideElephant } from '../parts/animals.js';
import { detail } from '../detail.js';

// Virupaksha, finer architecture and the setting. Dimensions follow
// js/monuments/virupaksha-temple-hampi.js: the east gopuram at z = 0, the walls at x = ±32 back to
// z = -170 and the cross wall at z = -75; the ranga mandapa 20 × 22 at z = -108 (plinth 1.4,
// pillars 5, its roof's top at 8); the closed hall 15 × 16 × 6.6 at z = -127 and the sanctum 10.5
// square, 7.2 high, at z = -140.2; two shrines 7 × 5 × 8 at x = 21; the hundred-pillared hall
// 20 × 30 at (-19, -44) and the kitchen 12 × 5.2 × 36 at (23, -42).
// From photographs: the ranga mandapa stands on a moulded plinth under a deep curved eave, with a
// parapet of brick and stucco shrines round its roof; the closed hall and the shrines have
// pilastered walls, eaves and parapets; the walls are coped; a lamp pillar and the gilt flagstaff
// stand on the axis before the hall, with the Nandi in a small pavilion; and at the far end of the
// bazaar the great monolithic Nandi looks back down the street to the gate.
const GRANITE = mat('#a58d6e', 0.9), GRANITE_DARK = mat('#7d6a53', 0.9), STUCCO = mat('#eadfc6', 0.85);
const W = 32, L = 170, MID = -75;

function architecture(f) {
  const d = new THREE.Group();
  const rm = at(new THREE.Group(), 0, 0, -108);
  rm.add(mouldings(20, 22, [[0, 0.4, 0.3, GRANITE], [0.4, 0.3, 0.15], [1.0, 0.4, 0.25, GRANITE]], GRANITE_DARK));
  for (const a of FACES) {
    const side = Math.abs(Math.sin(a)) > 0.5, len = side ? 22 : 20, dist = side ? 10 : 11;
    rm.add(onFace(at(chhajja(len + 3, 1.7, 0.9, 0.15, GRANITE_DARK), 0, 6.9, 0), a, dist + 0.7));
    rm.add(onFace(at(haraRow(len - 0.8, detail.low ? 1.5 : 1.1, STUCCO), 0, 8, 0), a, dist - 0.8));
  }
  d.add(rm);
  d.add(at(dravidaDress(15, 15.96, 6.6, GRANITE, { eaveM: GRANITE_DARK, haraM: STUCCO }), 0, 0, -127));
  d.add(at(dravidaDress(10.5, 10.5, 7.2, GRANITE, { eaveM: GRANITE_DARK, hara: false }), 0, 0, -140.2));
  for (const z of [-134, -148]) d.add(at(dravidaDress(7, 8, 5, GRANITE, { eaveM: GRANITE_DARK, hara: false }), 21, 0, z));
  d.add(at(dravidaDress(12, 36, 5.2, GRANITE, { eaveM: GRANITE_DARK, hara: false }), 23, 0, -42));
  // The hundred-pillared hall: an eave round its roof.
  const hp = at(new THREE.Group(), -19, 0, -44);
  for (const a of FACES) {
    const side = Math.abs(Math.sin(a)) > 0.5;
    hp.add(onFace(at(chhajja((side ? 30 : 20) + 1.6, 1.2, 0.5, 0.14, GRANITE_DARK), 0, 6, 0), a, (side ? 10 : 15) + 0.4));
  }
  d.add(hp);
  // Copings along the walls (2 m thick, 6 high; the cross wall 1.6 and 5.5).
  for (const s of [-1, 1]) d.add(box(2.5, 0.35, L + 2, GRANITE_DARK, s * W, 6, -L / 2));
  d.add(box(2 * W, 0.35, 2.5, GRANITE_DARK, 0, 6, -L));
  for (const s of [-1, 1]) d.add(box(20, 0.35, 2.5, GRANITE_DARK, s * 22.5, 6, 0), box(24, 0.3, 2.1, GRANITE_DARK, s * 19.8, 5.5, MID));
  // On the axis of the inner court: the lamp pillar, the flagstaff and the Nandi's pavilion.
  d.add(cyl(0.9, 1.1, 0.8, GRANITE_DARK, 0, 0, -82, 8), cyl(0.32, 0.45, 8.5, GRANITE, 0, 0.8, -82, 8), cyl(0.7, 0.4, 0.4, GRANITE_DARK, 0, 9.3, -82, 8));
  for (let k = 1; k < 7; k++) d.add(cyl(0.62, 0.62, 0.12, GRANITE_DARK, 0, 0.8 + k * 1.2, -82, 8));
  mergeByMaterial(d);
  f.add(d, dwajasthambha(0, -87, 11), at(nandiMandapa(4.4, 2.8, GRANITE, GRANITE_DARK, { nandiM: mat('#3b3936', 0.7) }), 0, 0, -92.5));
}

export function addDetails(f, g) {
  architecture(f);
  // Lakshmi, the temple elephant, in the outer court.
  f.add(at(rideElephant(mat('#5e5650', 0.9), 0.8, { cloth: '#b3262e', howdah: false }), 8, 0, -30).rotateY(0.6));
  // The monolithic Nandi in its two-storeyed pavilion at the east end of the bazaar.
  g.add(at(nandiMandapa(9, 4.2, GRANITE, GRANITE_DARK), 0, 0, 300));
  // Trees: neem and tamarind in the outer court and along the bazaar; coconut palms and bananas'
  // green along the river and round the tank.
  g.add(trees([[-8, -18], [10, -58], [-6, -62]], { kind: 'neem', seed: 5, h: 9 }));
  g.add(trees([...along(5, [-12, 60], [-12, 250]), ...along(4, [12, 90], [12, 270])], { kind: 'tamarind', seed: 8, h: 10 }));
  g.add(trees(scatter(detail.low ? 24 : 46, [150, 192, -400, 400], { seed: 9, gap: 9 }), { kind: 'palm', seed: 9 }));
  g.add(trees([...scatter(12, [38, 92, -92, -40], { seed: 12, gap: 9 }), ...scatter(8, [90, 140, -160, -60], { seed: 13, gap: 12 })], { kind: 'palm', seed: 12 }));
  g.add(trees(scatter(16, [44, 140, -30, 240], { seed: 14, gap: 16 }), { kind: 'neem', seed: 14 }));
  // Stalls under the colonnades near the gate, lamps along the street, and the ASI board.
  g.add(stalls([[-15, 28, Math.PI / 2], [-15, 36, Math.PI / 2], [15, 30, -Math.PI / 2], [15, 40, -Math.PI / 2], [-15, 48, Math.PI / 2], [15, 52, -Math.PI / 2]]));
  g.add(lampPosts([...along(6, [-14, 70], [-14, 270]), ...along(6, [14, 80], [14, 280])]));
  g.add(asiBoard('Virupaksha Temple, Hampi', 16, 18, 0, { line2: 'WORLD HERITAGE SITE' }));
}
