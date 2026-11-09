import * as THREE from 'three';
import { M, mat, box, at, rng, onFace, archPanel, guldasta, sheet, chhatri } from '../helpers.js';
import { townHouses } from '../details/realism.js';
import { detail } from '../detail.js';
import { arcadeSkin } from '../details/mughal.js';
import { nagaraTemple } from '../details/temples.js';
import { addDetails } from '../details/kashi-vishwanath-temple.js';

const CHUNAR = mat('#d9b48f', 0.85);
const SHADE = mat('#b8906a', 0.9);
const GOLD = mat('#e8b64a', 0.3, 0.7, { emissive: '#3a2805' });

// The old city of Varanasi round the corridor (js/details/realism.js, townHouses): along the river,
// tall houses and palaces rising straight from the top of the ghats, many crowned with kiosks on
// desktops (js/detail.js); behind them, rows of houses two to five storeys high along narrow lanes,
// facing each other across them, clear of the corridor's ranges (|x| < 44) and the chowk, and two
// rows behind the chowk.
const OLD_PAINT = ['#e3c48f', '#d99a6c', '#e8d6b0', '#c98a5a', '#f0dfb8', '#d7b56d', '#e6b3a3', '#cfa0a0'];
function oldCity() {
  const g = new THREE.Group(), R = rng(23), front = [], lanes = [], kiosks = [];
  for (const s of [-1, 1]) {
    let x = 36;
    while (x < 146) {
      const w = 9 + R() * 7, d = 13 + R() * 3, n = 5 + Math.floor(R() * 3), cx = s * (x + w / 2);
      front.push([cx, 88.4 - d / 2, w, d, n, 0]);
      if (R() < 0.35) kiosks.push([cx + (R() - 0.5) * w * 0.4, n * 3.2 + 0.9, 88.4 - d * 0.3]);
      x += w + 0.4;
    }
    for (let j = 0; j < 11; j++) {
      const zr = -100 + j * 15.5, facing = j % 2 ? Math.PI : 0;
      if (zr > 66) break;
      let xx = 44;
      while (xx < 146) {
        const w = 7 + R() * 5;
        lanes.push([s * (xx + w / 2), zr + (R() - 0.5) * 0.6, w, 10 + R() * 2, 2 + Math.floor(R() * 4), facing]);
        xx += w + (R() < 0.15 ? 3.5 : 0.3);
      }
    }
  }
  for (const zr of [-104, -88]) for (let xx = -36; xx < 36;) { const w = 7 + R() * 4; lanes.push([xx + w / 2, zr, w, 10, 2 + Math.floor(R() * 3), zr < -95 ? 0 : Math.PI]); xx += w + 0.3; }
  g.add(townHouses(front, { seed: 29, paint: OLD_PAINT }), townHouses(lanes, { seed: 31, paint: OLD_PAINT }));
  if (!detail.low) for (const [x, y, z] of kiosks) g.add(at(chhatri(1.6, 4.2, CHUNAR), x, y, z));
  return g;
}

export function buildKashiVishwanath() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Ganga and the ghats at the foot of the Kashi Vishwanath Corridor
  g.add(sheet(600, 200, M.river, 0, 0.3, 214), box(300, 0.2, 200, M.path, 0, 0, -10));
  for (let k = 0; k < 9; k++) g.add(box(120, 9 - k, 3, SHADE, 0, 0, 90 + k * 3));
  // The ghats run on along the river either side, and the old city crowds down to them.
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) g.add(box(90, 9 - k, 3, k % 3 ? SHADE : CHUNAR, s * 105, 0, 90 + k * 3));
  g.add(oldCity());
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
  // The shrine: its spire and the dome of its hall sheathed in gold (the gift of Maharaja Ranjit
  // Singh), on a white marble body. The spire is modest, standing among the arcades rather than over
  // them, and banded by its storeys; the shrine stands on a plain block in the paved court. Beside
  // it, the smaller white spire of the Annapurna shrine.
  f.add(at(nagaraTemple({ w: 11, h: 15, m: M.marble, shade: M.marbleShade, spireM: GOLD, plinth: 1.6, urus: 4, halls: [[12, 7, 0, 'dome']], base: null, spireBands: 5 }), 0, ch, cz - 6));
  f.add(at(nagaraTemple({ w: 6, h: 9, m: M.marble, shade: M.marbleShade, plinth: 1.2, urus: 0, halls: [], apron: 3, base: null }), -18, ch, cz - 8));
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
