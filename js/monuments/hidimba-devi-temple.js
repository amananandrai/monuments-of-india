import * as THREE from 'three';
import { mat, box, cyl, at, rng, hipRoof, finial } from '../helpers.js';
import { templeDoorway, steps } from '../details/doorways.js';
import { trees as plantTrees } from '../details/realism.js';
import { addDetails } from '../details/hidimba-devi-temple.js';

const STONE = mat('#8d8a85', 0.95);
const WOOD = mat('#6d5034', 0.85);
const SHINGLE = mat('#5e5246', 0.9);
const BRASS = mat('#b98b3c', 0.35, 0.7);

export function buildHidimba() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(31);
  g.add(f);
  g.add(box(260, 0.2, 260, mat('#4f6a3a', 0.95)));
  // Dhungiri forest of deodar cedars, kept clear of the opening camera view
  const trunks = [], crowns = [], view = [0.85, 0.3, 1.15], va = Math.atan2(view[2], view[0]);
  for (let i = 0; i < 110; i++) {
    const a = R() * Math.PI * 2, d = 82 + R() * 80, h = 22 + R() * 18, x = Math.cos(a) * d, z = Math.sin(a) * d;
    const off = Math.abs(((a - va + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    if (off < 0.6 && d < 110) continue;
    trunks.push([x, z, h]);
  }
  g.add(plantTrees(trunks, { kind: 'deodar', seed: 31 }));
  // Stone base, carved timber walls and three square shingle roofs under a brass cone
  f.add(box(16, 1.2, 18, STONE, 0, 0, 0), box(11, 6, 11, STONE, 0, 1.2, 0), box(11.4, 0.6, 11.4, WOOD, 0, 7.2, 0));
  // The carved timber doorway, and steps up from the ground
  f.add(at(templeDoorway(1.5, 3, { m: WOOD, bands: 4, guardians: false, moon: false }), 0, 1.2, 5.5), at(steps(4, 1.2, 3, STONE), 0, 0, 9));
  let y = 7.8;
  [[17, 3.2, 8.5, 3.4], [13, 2.8, 6.5, 3], [9.6, 2.4, 0, 0]].forEach(([w, rh, ww, wh]) => {
    const roof = hipRoof(w, w, rh, SHINGLE);
    f.add(at(roof, 0, y, 0), box(w + 0.4, 0.4, w + 0.4, WOOD, 0, y - 0.4, 0));
    y += rh * 0.55;
    if (ww) { f.add(box(ww, wh, ww, WOOD, 0, y, 0)); y += wh; }
  });
  f.add(cyl(0.2, 3.2, 4.6, BRASS, 0, y + 0.6, 0, 20), at(finial(2.6, BRASS), 0, y + 5.2, 0));
  addDetails(f, g);
  return { group: g, focus: f, view };
}
