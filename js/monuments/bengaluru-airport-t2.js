import * as THREE from 'three';
import { M, box } from '../helpers.js';
import { addDetails } from '../details/bengaluru-airport-t2.js';

// Placeholder: Bengaluru Airport Terminal 2.
export function buildBengaluruT2() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(20, 10, 20, M.buff));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.3, 1], zoom: 0.6 };
}
