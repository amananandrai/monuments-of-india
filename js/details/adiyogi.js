import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, flag } from '../helpers.js';
import { mergeByMaterial, trishul } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { mountainRing } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

const DARK = mat('#3d3b38', 0.8), PAVE = mat('#6b665f', 0.88), LINGA = mat('#1d1c1b', 0.4), CLOTH = mat('#c8322b', 0.8);
const ROOF = mat('#4a2f28', 0.8), GILT = mat('#d8b46a', 0.35, 0.7);

// The setting of Adiyogi, from photographs: the bust stands on a broad dark terrace reached by
// steps across its whole front; before it, on the terrace, a low open pavilion with a flat roof on
// square posts shelters the Yogeshwar linga under its gilt cover. A paved forecourt lies below, a
// trident planted beside it; coconut palms and neem along the edges, and behind, the forested
// Velliangiri hills rising steeply, their summits in cloud. Dimensions follow
// js/monuments/adiyogi.js: the bust is 45 m across and 25 m deep, on a terrace BASE high.
export function addDetails(f, g, { BASE }) {
  g.add(box(260, 0.2, 240, M.grass, 0, -0.2, 20));
  g.add(box(64, 0.06, 44, PAVE, 0, 0, 44), box(8, 0.06, 80, PAVE, 0, 0, 104));
  // The terrace under the bust, and the steps down from its front edge.
  f.add(box(56, BASE, 36, DARK, 0, 0, 3), at(steps(56, BASE, 6, PAVE), 0, 0, 21));
  // The pavilion: twelve square posts, a flat roof with a deep fascia.
  const pav = new THREE.Group(), PW = 22, PD = 7, PH = 2.9;
  for (const x of [-PW / 2, -PW / 6, PW / 6, PW / 2]) for (const z of [-PD / 2, 0, PD / 2]) pav.add(box(0.45, PH, 0.45, DARK, x, 0, z));
  pav.add(box(PW + 2.4, 0.5, PD + 2.4, ROOF, 0, PH, 0), box(PW + 2.8, 0.14, PD + 2.8, DARK, 0, PH + 0.5, 0), box(PW + 0.6, 0.12, PD + 0.6, PAVE, 0, 0, 0));
  // The Yogeshwar linga in its yoni on a round pedestal, under a gilt dome with a finial.
  pav.add(cyl(2.4, 2.6, 0.5, DARK, 0, 0.12, 0, 32), cyl(1.7, 1.7, 0.35, LINGA, 0, 0.62, 0, 32), box(0.7, 0.25, 1.4, LINGA, 0, 0.72, 2));
  pav.add(at(lathe([[0, 0], [1.25, 0], [1.3, 0.5], [1.05, 1.0], [0.55, 1.3], [0.12, 1.42], [0.1, 1.7], [0, 1.74]], GILT, 32), 0, 0.97, 0));
  pav.add(mesh(new THREE.TorusGeometry(1.32, 0.1, 8, 28).rotateX(Math.PI / 2), CLOTH, 0, 1.05, 0));
  f.add(at(mergeByMaterial(pav), 0, BASE, 15.5));
  // The trident planted beside the forecourt, to his right.
  f.add(at(trishul(17), -22, 0, 30));
  // Low walls of dark stone framing the forecourt, lamps along its sides, a saffron flag.
  const wall = new THREE.Group();
  for (const s of [-1, 1]) wall.add(box(0.8, 0.9, 40, DARK, s * 32, 0, 44));
  g.add(mergeByMaterial(wall), lampPosts([...along(6, [-33.5, 26], [-33.5, 62]), ...along(6, [33.5, 26], [33.5, 62]), ...along(6, [-5, 60], [-5, 130]), ...along(6, [5, 60], [5, 130])]));
  g.add(at(flag(9, M.saffron), 34, 0, 24));
  // Palms and neem round the lawn, shrubs along its edges.
  g.add(trees([...along(9, [-70, -50], [-70, 110]), ...along(9, [70, -50], [70, 110])], { kind: 'palm', seed: 41 }));
  g.add(trees([...scatter(16, [-110, -40, -80, 120], { seed: 42, gap: 10 }), ...scatter(16, [40, 110, -80, 120], { seed: 43, gap: 10 })], { kind: 'neem', seed: 44 }));
  g.add(shrubs([...along(14, [-30, 60], [-30, 120]), ...along(14, [30, 60], [30, 120])], { flowers: '#e8a23a' }));
  // The Velliangiri hills behind, rising steeply from the plain.
  g.add(mountainRing({ inner: 520, outer: 1300, h: 560, vary: 160, size: 4000, cz: 300, aspect: 1.1, cover: '#3f6a34', rock: ['#5d6b4a', '#6a7653'], steep: 0.62 }));
  if (!detail.low) g.add(trees(scatter(60, [-300, 300, -260, -90], { seed: 45, gap: 14 }), { kind: 'teak', seed: 46 }));
}
