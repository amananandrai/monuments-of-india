import * as THREE from 'three';
import { mat, mesh, box, cyl, at, rng, ellipseWall, tricolour } from '../helpers.js';
import { addDetails } from '../details/kargil-war-memorial.js';

const PINK = mat('#c8917a', 0.85);
const PEAK = mat('#8f8578', 0.95, 0, { flatShading: true });
const SNOW = mat('#f4f6f8', 0.8, 0, { flatShading: true });

// The tall memorial flag: a tricolour 18 m long on a 40 m staff.
const bigFlag = (pole) => tricolour(pole, 18);

export function buildKargilMemorial() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(109);
  g.add(f);
  g.add(box(600, 0.2, 600, mat('#9d8f78', 0.95)));
  // Tololing and the mountains around Dras
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i - 3.5) * 0.35, d = 500 + R() * 100, h = 200 + R() * 140, x = Math.cos(a) * d, z = Math.sin(a) * d;
    g.add(mesh(new THREE.ConeGeometry(h * 0.7, h, 7).translate(0, h / 2, 0), PEAK, x, 0, z), mesh(new THREE.ConeGeometry(h * 0.26, h * 0.3, 7).translate(0, h * 0.85, 0), SNOW, x, 0, z));
  }
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
