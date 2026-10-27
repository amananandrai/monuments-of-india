import * as THREE from 'three';
import { M, mat, box, at, onFace, archPanel, nagaraTemple, guldasta, sheet } from '../helpers.js';

const CHUNAR = mat('#d9b48f', 0.85);
const SHADE = mat('#b8906a', 0.9);

export function buildKashiVishwanath() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Ganga and the ghats at the foot of the Kashi Vishwanath Corridor
  g.add(sheet(600, 200, M.river, 0, 0.3, 190), box(300, 0.2, 200, M.path, 0, 0, -10));
  for (let k = 0; k < 9; k++) g.add(box(120, 9 - k, 3, SHADE, 0, 0, 78 + k * 3));
  // The corridor: a broad stepped plaza framed by arcaded buildings, running down to the river
  f.add(box(60, 9, 120, CHUNAR, 0, 0, 20));
  for (const s of [-1, 1]) {
    f.add(box(14, 10, 110, CHUNAR, s * 37, 9, 20), box(14.6, 0.6, 110.6, SHADE, s * 37, 19, 20));
    for (let k = 0; k < 12; k++) f.add(at(archPanel(3.6, 6.4, true, M.recess, 0.3).rotateY(-s * Math.PI / 2), s * 30, 9.6, -32 + k * 9.4));
    for (let k = 0; k < 6; k++) f.add(at(guldasta(4, 0.5, CHUNAR), s * 31, 19.6, -30 + k * 20));
  }
  f.add(box(40, 12, 8, CHUNAR, 0, 9, 78), onFace(at(archPanel(10, 10, true, M.recess, 0.3), 0, 9.4, 0), 0, 82));
  // The shrine: its gold-covered spire and gold dome
  f.add(at(nagaraTemple({ w: 9, h: 15, m: M.marble, shade: M.marbleShade, spireM: M.gild, plinth: 1.2, urus: 4, halls: [[11, 6, 0, 'dome']] }), 0, 9, -26));
  return { group: g, focus: f, view: [0.55, 0.45, 1.2] };
}
