import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, surface } from '../helpers.js';

// Parts of Tibetan Buddhist monasteries shared by the Himalayan monasteries (Key, Rumtek, Tawang,
// Thiksey): the gilded Dharma wheel between two kneeling deer over the front of the assembly hall,
// the cylindrical victory banners (gyaltsen) at the corners of its roof, the pleated awnings
// (shabkhep) over the windows, and the gilded discs set into the maroon parapet band. Every part
// faces +z and stands on y = 0, as in the rest of the detail kit.

const RED = surface(mat('#9a2b22', 0.7), 'none'), BLUE = surface(mat('#2f5d8a', 0.7), 'none');
const GREEN = surface(mat('#3f7d4f', 0.7), 'none'), WHITE = surface(mat('#f1ede4', 0.8), 'none');

// A kneeling deer, s tall at the shoulder, facing +x (turned by the caller).
function deer(s, m) {
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(1, 12, 8), m, 0, s * 0.45, 0);
  body.scale.set(s * 0.55, s * 0.3, s * 0.25);
  const neck = cyl(s * 0.08, s * 0.11, s * 0.45, m, s * 0.38, s * 0.55, 0, 8);
  neck.rotation.z = -0.4;
  const head = mesh(new THREE.SphereGeometry(s * 0.14, 10, 8), m, s * 0.55, s * 1.0, 0);
  head.scale.x = 1.5;
  g.add(body, neck, head, box(s * 0.9, s * 0.18, s * 0.42, m, 0, 0.0, 0));
  for (const z of [-1, 1]) g.add(at(cyl(s * 0.02, s * 0.04, s * 0.18, m, 0, 0, 0, 5), s * 0.5, s * 1.1, z * s * 0.06));
  return g;
}

// The Dharma wheel on a lotus base between two deer facing it, w across the deer, all gilded.
export function dharmaWheel(w, m = M.gild) {
  const g = new THREE.Group(), R = w * 0.22;
  g.add(cyl(R * 0.7, R * 0.9, R * 0.3, m, 0, 0, 0, 16));
  const wheel = new THREE.Group();
  wheel.add(mesh(new THREE.TorusGeometry(R, R * 0.12, 8, 28), m), mesh(new THREE.TorusGeometry(R * 0.25, R * 0.1, 6, 14), m));
  // Eight spokes from the hub to the rim.
  for (let k = 0; k < 4; k++) { const s = mesh(new THREE.BoxGeometry(R * 0.07, R * 1.9, R * 0.07), m); s.rotation.z = (k / 4) * Math.PI; wheel.add(s); }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; wheel.add(at(mesh(new THREE.SphereGeometry(R * 0.08, 6, 4), m), Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12, 0)); }
  g.add(at(wheel, 0, R * 0.3 + R * 1.15, 0));
  for (const s of [-1, 1]) {
    const d = deer(w * 0.24, m);
    d.position.x = s * w * 0.36;
    d.rotation.y = s > 0 ? Math.PI : 0;
    g.add(d);
  }
  return g;
}

// A victory banner (gyaltsen) h tall: a gilded drum on a post, ringed in bands, with a crown.
export function gyaltsen(h, m = M.gild) {
  const g = new THREE.Group(), r = h * 0.18;
  g.add(cyl(r * 0.25, r * 0.25, h * 0.25, m, 0, 0, 0, 8));
  g.add(cyl(r, r * 1.1, h * 0.55, m, 0, h * 0.25, 0, 14));
  for (const t of [0.3, 0.55, 0.78]) g.add(cyl(r * 1.15, r * 1.15, h * 0.04, m, 0, h * t, 0, 14));
  g.add(at(mesh(new THREE.SphereGeometry(r * 0.75, 12, 8), m), 0, h * 0.86, 0), cyl(0, r * 0.3, h * 0.14, m, 0, h * 0.9, 0, 8));
  return g;
}

// A pleated awning (shabkhep) w wide over a window at z = 0: three short bands in red, blue and
// green, each projecting a little further, with a white valance under them.
export function shabkhep(w) {
  const g = new THREE.Group();
  [[RED, 0.32, 0.36], [BLUE, 0.2, 0.26], [GREEN, 0.08, 0.16]].forEach(([m, y, d]) => g.add(box(w + 0.3, 0.12, d, m, 0, y, d / 2)));
  g.add(box(w + 0.3, 0.1, 0.38, WHITE, 0, 0, 0.19));
  return g;
}

// A row of gilded discs (melong) along a parapet band at z = 0, len long, about `pitch` apart.
export function parapetDiscs(len, pitch, r, m = M.gild) {
  const g = new THREE.Group(), n = Math.max(1, Math.floor(len / pitch)), geo = new THREE.CylinderGeometry(r, r, 0.06, 14).rotateX(Math.PI / 2);
  for (let k = 0; k < n; k++) g.add(mesh(geo, m, -len / 2 + (k + 0.5) * (len / n), 0, 0.03));
  return g;
}
