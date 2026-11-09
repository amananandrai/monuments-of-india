import * as THREE from 'three';
import { mat, box, cyl, at, rng, ellipseWall, tricolour } from '../helpers.js';
import { mountainRing } from '../details/terrain.js';
import { addDetails } from '../details/kargil-war-memorial.js';

const PINK = mat('#c8917a', 0.85);

// The tall memorial flag: a tricolour 18 m long on a 40 m staff.
const bigFlag = (pole) => tricolour(pole, 18);

export function buildKargilMemorial() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(109);
  g.add(f);
  g.add(box(600, 0.2, 600, mat('#9d8f78', 0.95)));
  // Tololing and the mountains around Dras
  // (js/details/terrain.js): bare brown-grey ridges ringing the Dras valley, highest behind the
  // memorial, snow on their crests.
  g.add(mountainRing({ inner: 420, outer: 720, h: 330, vary: 110, aspect: 1.1, cz: -60, snow: 300, rock: ['#7f766a', '#8f8578', '#766d62'], cover: '#9d8f78', steep: 0.82 }));
  // The plaza, the curved wall of names, the flame and the giant flag
  f.add(box(90, 0.6, 70, mat('#d8cbb3', 0.85)));
  // The curved wall of names behind the flame, as one continuous wall
  f.add(ellipseWall(34, -26, Math.PI * 0.15 - 0.057, Math.PI * 0.85 + 0.057, 1.4, 0.6, 6.6, PINK));
  f.add(box(4, 3, 4, PINK, 0, 0.6, -6), cyl(0.6, 0.8, 2, mat('#ff8c2e', 0.4, 0, { emissive: '#ff6a00', emissiveIntensity: 2.4 }), 0, 3.6, -6, 10));
  f.add(at(bigFlag(40), -30, 0.6, 20));
  for (let k = 0; k < 6; k++) f.add(box(2, 1.6, 1, mat('#4d5a3a', 0.8), -20 + k * 8, 0.6, 26));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.25, 0.3, 1.25] };
}
