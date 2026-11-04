import * as THREE from 'three';
import { M, mat, box, at, onFace, archPanel, guldasta, sheet, chhatri } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { nagaraTemple } from '../details/temples.js';
import { addDetails } from '../details/kashi-vishwanath-temple.js';

const CHUNAR = mat('#d9b48f', 0.85);
const SHADE = mat('#b8906a', 0.9);
const GOLD = mat('#e8b64a', 0.3, 0.7, { emissive: '#3a2805' });

export function buildKashiVishwanath() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Ganga and the ghats at the foot of the Kashi Vishwanath Corridor
  g.add(sheet(600, 200, M.river, 0, 0.3, 214), box(300, 0.2, 200, M.path, 0, 0, -10));
  for (let k = 0; k < 9; k++) g.add(box(120, 9 - k, 3, SHADE, 0, 0, 90 + k * 3));
  // The Kashi Vishwanath Dham. At the top, the Mandir Chowk: the shrine standing alone in an open
  // court paved in stone, ringed on three sides by two-storey arcaded ranges of pink Chunar sandstone
  // with kiosks at the corners. From its open front a broad flight of steps falls to the long plaza
  // of the corridor, lined by lower ranges, which runs down to the gate on the ghats.
  const ch = 8, cz = -30, CW = 76, CD = 60;
  f.add(box(CW, ch, CD, SHADE, 0, 0, cz), box(CW - 0.4, 0.2, CD - 0.4, M.path, 0, ch, cz));
  const range = (len, h, d) => {
    const r = new THREE.Group(), n = Math.floor(len / 5.2), cells = [];
    for (let k = 0; k < n; k++) { const x = -len / 2 + (k + 0.5) * (len / n); cells.push([x, 0.3, 3.2, h * 0.42, 'room'], [x, h * 0.55, 2.6, h * 0.32, 'jali']); }
    r.add(box(len, h, d - 1.2, CHUNAR, 0, 0, -0.6), at(arcadeSkin(len, h, cells, 1.2, CHUNAR, { trim: SHADE }), 0, 0, d / 2 - 1.2), box(len + 0.6, 0.6, d + 0.6, SHADE, 0, h));
    return r;
  };
  f.add(at(range(CW, 9, 7), 0, ch, cz - CD / 2 + 3.5));
  for (const s of [-1, 1]) {
    f.add(at(range(CD - 7.4, 9, 7).rotateY(-s * Math.PI / 2), s * (CW / 2 - 3.5), ch, cz + 3.7));
    for (const z of [cz - CD / 2 + 3.5, cz + CD / 2 - 3.5]) f.add(at(chhatri(2.2, 6, CHUNAR), s * (CW / 2 - 3.5), ch + 9.6, z));
  }
  // The shrine: its tall spire and the dome of its hall sheathed in gold (the gift of Maharaja
  // Ranjit Singh), on a white marble body.
  f.add(at(nagaraTemple({ w: 13, h: 25, m: M.marble, shade: M.marbleShade, spireM: GOLD, plinth: 1.6, urus: 4, halls: [[13, 8, 0, 'dome']] }), 0, ch, cz - 6));
  // Steps down from the chowk to the plaza, and the plaza between lower arcaded ranges.
  for (let k = 0; k < 10; k++) f.add(box(40, ch - k * 0.8, 1.6, SHADE, 0, 0, cz + CD / 2 + 0.8 + k * 1.6));
  for (const s of [-1, 1]) f.add(at(range(70, 7, 10).rotateY(-s * Math.PI / 2), s * 26, 0, 46));
  f.add(box(52, 0.2, 76, M.path, 0, 0, 44));
  // The gate onto the ghats: a broad arched gateway between two towers.
  f.add(box(34, 12, 8, CHUNAR, 0, 0, 84), onFace(at(archPanel(10, 10, true, M.recess, 0.3), 0, 0.4, 0), 0, 88));
  for (const x of [-15, 15]) f.add(at(guldasta(16, 2, CHUNAR), x, 0, 84));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.4, 1.2], zoom: 0.62 };
}
