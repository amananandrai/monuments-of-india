import * as THREE from 'three';
import { M, mat, box, cyl, at, sheet } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { addDetails } from '../details/somnath-temple.js';

const STONE = mat('#d8b07a', 0.85);
const SHADE = mat('#b8905c', 0.9);

export function buildSomnath() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Arabian Sea behind, and the sea wall with its arrow pillar
  g.add(sheet(600, 300, M.sea, 0, 0.3, -190), box(160, 0.2, 140, M.path, 0, 0, 10));
  f.add(box(110, 3, 4, SHADE, 0, 0, -38));
  f.add(cyl(0.8, 1, 9, STONE, 30, 3, -38, 10), cyl(0, 0.9, 2.4, M.gild, 30, 12, -38, 8));
  // The temple in Chalukya (Maru-Gurjara) style, the Kailash Mahameru Prasad: a tall spire with two
  // rings of minor spires, the broad sabha mandap and the nritya mandap before it, each of two
  // storeys, the upper one a gallery of balconies, under stepped roofs set with small spires. It
  // stands on a plinth of three tiers that follows the plan, climbed by a stair at the east.
  f.add(at(nagaraTemple({
    w: 15, h: 32, m: STONE, shade: SHADE, plinth: 3, urus: 8, apron: 14,
    halls: [[26, 10, 8, 'pida', 2], [17, 8, 5, 'pida', 2]], base: { tiers: 3, cut: 1 },
  }), 0, 0, -24));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.32, 1.15] };
}
