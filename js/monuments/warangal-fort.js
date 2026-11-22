import * as THREE from 'three';
import { mat, box } from '../helpers.js';
import { kakatiyaThorana } from '../parts/temples.js';
import { addDetails } from '../details/warangal-fort.js';

// The Kakatiyas' grey granite, and its darker weathered shade.
export const STONE = mat('#a39b8d', 0.9);
export const SHADE = mat('#7f786c', 0.93);

// The four gateways stand R from the centre of the lost Swayambhu temple, facing the cardinal
// directions; between them the temple's plinth, and the carvings gathered from its ruins.
export const R = 42;

// Warangal Fort: the four Kala Thoranam around the site of the Swayambhu Shiva temple, at the
// heart of the Kakatiya capital.
export function buildWarangalFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const t = kakatiyaThorana(STONE, SHADE);
    t.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    t.rotation.y = a;
    f.add(t);
  }
  // The temple's plinth: stepped courses on a cruciform plan, the rest of it gone.
  f.add(box(34, 0.5, 34, SHADE, 0, 0, 0), box(30, 0.6, 30, STONE, 0, 0.5, 0), box(20, 0.6, 36, STONE, 0, 0.5, 0), box(36, 0.6, 20, STONE, 0, 0.5, 0));
  f.add(box(16, 0.8, 16, STONE, 0, 1.1, -4), box(10, 0.6, 10, SHADE, 0, 1.9, -6));
  addDetails(f, g);
  // From the south-east, the south gateway in front and the other three beyond the plinth.
  return { group: g, focus: f, view: [0.5, 0.2, 1], zoom: 0.42, target: [0, 5, 10] };
}
