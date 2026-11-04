import * as THREE from 'three';
import { at, flag, mat } from '../helpers.js';
import { trees, people, scatter } from './realism.js';

// Kamakhya on the Nilachal hill above Guwahati: the forest that covers the hill, devotees in the
// red of the goddess and the saffron of pilgrims on the temple terrace, and red flags.
const RED = mat('#c62a2a', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  const T = 40, slope = scatter(90, [-145, 145, -145, 145], { seed: 3, gap: 11 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 66 && r < 146; });
  for (const s of slope) s.push(T * (150 - Math.hypot(s[0], s[1])) / 90 - 0.6);
  g.add(trees(slope.map(([x, z]) => [x, z]), { kind: 'mango', seed: 4, h: 9 }));
  // The trees stand on the slope: each lifted to the hill's height at its place.
  const forest = g.children[g.children.length - 1];
  forest.children.forEach((im) => { const m = new THREE.Matrix4(); for (let i = 0; i < im.count; i++) { im.getMatrixAt(i, m); m.elements[13] += slope[i][2]; im.setMatrixAt(i, m); } im.instanceMatrix.needsUpdate = true; });
  f.add(people(scatter(40, [-33, 33, -38, 38], { seed: 5, avoid: [[-12, 12, -26, 40]] }).map(([x, z]) => [x, z, T]), { seed: 5, palette: ['#c62a2a', '#d9342b', '#f08a1c', '#f4f1ea', '#b3262e', '#f2d23a'] }));
  for (const [x, z] of [[-30, -36], [30, -36], [-30, 36], [30, 36], [0, 46]]) f.add(at(flag(6, RED), x, T, z));
}
