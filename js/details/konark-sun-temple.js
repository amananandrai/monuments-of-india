import * as THREE from 'three';
import { M, at, onFace } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, mergeByMaterial } from './components.js';
import { lion, elephant } from './animals.js';
import { trees, shrubs, asiBoard, scatter, along } from './realism.js';

// Konark, finer detail. From photographs and descriptions: the chariot's plinth is wrapped in
// friezes above and below the wheels (elephants, scenes of daily life); the Jagamohana's walls stand
// on carved mouldings, with images in niches either side of each doorway; and at the steps of the
// Natamandira stand the gajasimhas, lions rearing over elephants. Dimensions follow
// js/monuments/konark-sun-temple.js: plinth 32 × 76 at z = -6, B = 6; the Jagamohana (26 square
// with arms to 30) from B to B + 12 at z = 16; the Natamandira at z = 58.
function architecture(f) {
  const d = new THREE.Group(), K = M.khond, Kd = M.khondDark, L = 76, zc = -6, B = 6, jz = zc + L / 2 - 16;
  d.add(at(mouldings(32, L, [[0.05, 0.5, 0.12, frieze(K)], [4.0, 0.55, 0.12, frieze(K)]], Kd), 0, 0, zc));
  const j = at(new THREE.Group(), 0, B, jz);
  j.add(mouldings(30, 16, [[0, 0.6, 0.3, Kd], [0.6, 0.6, 0.1, frieze(K)], [10.6, 0.6, 0.1, frieze(K)]], K));
  j.add(mouldings(16, 30, [[0.01, 0.6, 0.3, Kd], [0.61, 0.6, 0.1, frieze(K)], [10.61, 0.6, 0.1, frieze(K)]], K));
  for (const a of [0, Math.PI / 2, -Math.PI / 2, Math.PI]) for (const lat of [-5.2, 5.2]) j.add(onFace(at(templeNiche(1.8, 3.6, K, { figure: idol(3.1, K) }), 0, 2.4, 0), a, 15, lat));
  d.add(j);
  mergeByMaterial(d);
  f.add(d);
  const nz = zc + L / 2 + 26;
  for (const s of [-1, 1]) {
    const e = elephant(Kd, 0.8), l = lion(2.6, K);
    e.position.set(s * 6, 4.6, nz + 13.5);
    l.position.set(s * 6, 4.6 + 2.6, nz + 13.8);
    f.add(e, l);
  }
}

// The Sun Temple at Konark: the casuarina and palm groves and kept lawns of the temple park, and
// the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(30, [-75, 75, -85, 100], { seed: 3, gap: 11 }).filter(([x, z]) => Math.abs(x) > 26), { kind: 'palm', seed: 3 }));
  g.add(trees([...along(6, [-34, -70], [-34, 90]), ...along(6, [34, -70], [34, 90])], { kind: 'cypress', seed: 4, h: 12 }));
  g.add(shrubs(scatter(16, [-30, 30, 66, 92], { seed: 5, gap: 4 }).map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 5 }));
  g.add(asiBoard('Sun Temple, Konark', 10, 92, 0, { line2: 'WORLD HERITAGE SITE' }));
}
