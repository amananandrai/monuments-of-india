import * as THREE from 'three';
import { mat, box, cyl, at, onFace, tricolour } from '../helpers.js';
import { windowFrame, keystone, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, around } from './realism.js';

// The Cellular Jail, finer detail. From photographs: white string courses mark the floors along the
// outer walls of the wings; the central watchtower has arched windows on every face of its
// three stages, banded in white. Dimensions follow js/monuments/cellular-jail.js: wings 9 deep with their
// outer wall at x = 4.5 in their own frame, storeys 4.2 high; the tower an octagon r = 9, 22 high,
// then an open lantern.
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
    for (const y of [3, 9.5, 16]) d.add(onFace(at(windowFrame(1.4, 3, LIME, { shape: 'round', frame: 0.2 }), 0, y, 0), a, 9 * Math.cos(Math.PI / 8) + 0.02));
  }
  d.add(cyl(9.15, 9.15, 0.35, LIME, 0, 8, 0, 8), cyl(9.15, 9.15, 0.35, LIME, 0, 14.5, 0, 8));
  mergeByMaterial(d);
  f.add(d);
}

// The finer parts of the wings' arcades, after photographs: a keystone in every arch along the
// corridors and an impost band between the floors on the corridor side. In each wing's frame the
// arcade's face is at x = -4.5, its arches 2.1 × 3.2 (round) every 3 m from 1.5, floors 4.2 apart.
function sculpture(f) {
  const lens = [100, 100, 100, 14, 14, 14, 14], ks = [], d = new THREE.Group();
  for (let k = 0; k < 7; k++) {
    const ry = (k / 7) * Math.PI * 2 + 0.4, len = lens[k], w = new THREE.Group();
    w.rotation.y = ry;
    w.position.set(Math.sin(ry) * 9, 0, Math.cos(ry) * 9);
    for (let fl = 0; fl < 3; fl++) {
      for (let c = 0; c < Math.floor(len / 3); c++) w.add(at(keystone(0.32, 0.55, 0.14, LIME, 0.14), 0, 0.5 + fl * 4.2 + 3.2 - 0.32, 1.5 + c * 3).rotateY(-Math.PI / 2).translateZ(4.5));
      if (fl) w.add(box(0.14, 0.26, len - 0.3, LIME, -4.56, fl * 4.2 - 0.1, len / 2));
    }
    d.add(w);
  }
  mergeByMaterial(d);
  f.add(d);
}


// The Cellular Jail at Port Blair, now a National Memorial: the tricolour flying over the central
// watchtower, coconut palms and flowering shrubs in the memorial gardens between the wings, and
// lamps round the tower.
export function addDetails(f, g) {
  architecture(f);
  sculpture(f);
  f.add(at(tricolour(9), 0, 33.2, 0));
  const lawn = scatter(36, [-150, 150, -140, 140], { seed: 3, gap: 9 }).filter(([x, z]) => {
    // Keep clear of the three long wings, which run out from the tower at these angles
    return [0, 1, 2].every((k) => { const a = (k / 7) * Math.PI * 2 + 0.4, u = x * Math.sin(a) + z * Math.cos(a), v = x * Math.cos(a) - z * Math.sin(a); return u < 0 || u > 112 || Math.abs(v) > 9; }) && Math.hypot(x, z) > 30;
  });
  g.add(trees(lawn, { kind: 'palm', seed: 3, y: 0.7 }), shrubs(lawn.map(([x, z]) => [x + 3, z + 2, 1.4]), { y: 0.7, flowers: '#d63c6a', seed: 4 }));
  g.add(lampPosts(around(8, 18), { y: 0.7 }));
}
