import * as THREE from 'three';
import { jharokha, bracketGeo, placeAll, alongFace, chhajja, beltCourse, mergeByMaterial } from './components.js';
import { towerDetail, slitRow } from './forts.js';
import { box, at, flag, mat, rng } from '../helpers.js';
import { shrubs } from './realism.js';

// Mehrangarh, finer detail. The bastions rising from the rock are banded and slit, and the wall
// between them has string courses and loopholes; over the Phool Mahal's screened front runs a deep
// eave on brackets; the palace to the east is hung with two tiers of jharokhas under curved roofs.
// Dimensions follow js/monuments/mehrangarh-fort.js.
const SAND = mat('#b9774f', 0.9), SAND_LIGHT = mat('#cf9a6e', 0.85);
function architecture(f) {
  const d = new THREE.Group(), H = 45;
  for (const x of [-60, -30, 0, 30, 60]) d.add(at(towerDetail(9, 8, 32, SAND, SAND_LIGHT, { n: 12, courses: [0.4, 0.75], slits: [0.3, 0.6, 0.88] }), x, H - 6, 20));
  d.add(box(130, 0.6, 0.3, SAND_LIGHT, 0, H + 10, 22.1), box(130, 0.5, 0.3, SAND_LIGHT, 0, H + 21, 22.1));
  d.add(at(slitRow(124, 40, H + 17, 0.4, 1.3), 0, 0, 22));
  // The Phool Mahal front (70 × 14 at (-10, H + 24, -2), face at z = 12): eave on brackets.
  d.add(at(chhajja(70.6, 1.6, 0.6, 0.18, SAND_LIGHT), -10, H + 33.4, 12));
  d.add(placeAll(bracketGeo(1.2, 1.2, 0.4), alongFace(0, 12, 68, 23, H + 32.6).map(([x, y, z, r]) => [x - 10, y, z, r]), SAND));
  d.add(beltCourse(70, 28, H + 25.6, 0.5, 0.2, SAND).translateX(-10).translateZ(-2));
  // The palace to the east (40 × 10 × 20 at (34, H + 24, 4), face at z = 14).
  for (let r = 0; r < 2; r++) for (let k = 0; k < 7; k++) d.add(at(jharokha(2, 2.6, SAND_LIGHT, { d: 1, trim: SAND }), 34 - 17 + k * (34 / 6), H + 25.4 + r * 4.4, 14.02));
  mergeByMaterial(d);
  f.add(d);
}

// Mehrangarh above Jodhpur: the rhyolite scrub of the Rao Jodha desert park on the hill, and the
// five-coloured flag of Marwar over the palace.
const FLAG = mat('#d9342b', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  architecture(f);
  const H = 45, R = rng(4), slope = [];
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2, t = 0.15 + R() * 0.75, r = 130 - 60 * t, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.5;
    if (Math.abs(x) < 70 && z > 10) continue;
    slope.push([x, z, 2.2, t * H - 0.4]);
  }
  g.add(shrubs(slope, { dry: true, seed: 5 }));
  f.add(at(flag(9, FLAG), 0, H + 38, 0));
}
