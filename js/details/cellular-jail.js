import * as THREE from 'three';
import { windowFrame, mergeByMaterial } from './components.js';
import { mat, box, cyl, at, onFace, tricolour } from '../helpers.js';
import { trees, shrubs, lampPosts, scatter, around } from './realism.js';

// The Cellular Jail, finer detail. From photographs: white string courses mark the floors along the
// outer walls of the wings; the central watchtower has arched windows on every face of its two
// stages, banded in white. Dimensions follow js/monuments/cellular-jail.js: wings 9 deep with their
// outer wall at x = 4.5 in their own frame, storeys 4.2 high; the tower an octagon r = 9, 16 high.
const LIME = mat('#e9e3d6', 0.85);
function architecture(f) {
  const d = new THREE.Group(), lens = [100, 100, 100, 14, 14, 14, 14];
  for (let k = 0; k < 7; k++) {
    const w = new THREE.Group(), ry = (k / 7) * Math.PI * 2 + 0.4, len = lens[k];
    w.rotation.y = ry;
    w.position.set(Math.sin(ry) * 9, 0, Math.cos(ry) * 9);
    for (const y of [4.05, 8.25]) w.add(box(0.14, 0.3, len - 0.2, LIME, 4.56, y, len / 2));
    d.add(w);
  }
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2;
    for (const y of [3, 9.5]) d.add(onFace(at(windowFrame(1.4, 3, LIME, { shape: 'round', frame: 0.2 }), 0, y, 0), a, 9 * Math.cos(Math.PI / 8) + 0.02));
    d.add(onFace(at(windowFrame(1.2, 2.4, LIME, { shape: 'round', frame: 0.16 }), 0, 18.2, 0), a, 6 * Math.cos(Math.PI / 8) + 0.02));
  }
  d.add(cyl(9.15, 9.15, 0.35, LIME, 0, 8, 0, 8));
  mergeByMaterial(d);
  f.add(d);
}

// The Cellular Jail at Port Blair, now a National Memorial: the tricolour flying over the central
// watchtower, coconut palms and flowering shrubs in the memorial gardens between the wings, and
// lamps round the tower.
export function addDetails(f, g) {
  architecture(f);
  f.add(at(tricolour(9), 0, 27.6, 0));
  const lawn = scatter(36, [-150, 150, -140, 140], { seed: 3, gap: 9 }).filter(([x, z]) => {
    // Keep clear of the three long wings, which run out from the tower at these angles
    return [0, 1, 2].every((k) => { const a = (k / 7) * Math.PI * 2 + 0.4, u = x * Math.sin(a) + z * Math.cos(a), v = x * Math.cos(a) - z * Math.sin(a); return u < 0 || u > 112 || Math.abs(v) > 9; }) && Math.hypot(x, z) > 30;
  });
  g.add(trees(lawn, { kind: 'palm', seed: 3, y: 0.7 }), shrubs(lawn.map(([x, z]) => [x + 3, z + 2, 1.4]), { y: 0.7, flowers: '#d63c6a', seed: 4 }));
  g.add(lampPosts(around(8, 18), { y: 0.7 }));
}
