import * as THREE from 'three';
import { M, mat, box, cyl, at, rng, chhatri, onFace, archPanel, hemi, finial, inst, unitBox, sheet } from '../helpers.js';
import { heightField, fbm, smooth } from '../details/terrain.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/city-palace-udaipur.js';

const CREAM = mat('#efe6d2', 0.8);
const SHADE = mat('#d3c6a8', 0.85);

// The ridge's height at (x, z): RIDGE along the palace (z -40 to 10), falling steeply to the lake
// in front (z 10 to 30) and gently behind, rough on its slopes.
const RIDGE = 16;
export function ridge(x, z) {
  const along = smooth(260, 150, Math.abs(x)), front = smooth(32, 10, z), back = smooth(-200, -40, z);
  const y = RIDGE * Math.min(front, back) * (0.35 + 0.65 * along) + 2 * fbm(x, z, { scale: 0.03, octaves: 3 }) * smooth(1, 6, RIDGE * Math.min(front, back));
  return y - 0.8 * (1 - smooth(-0.5, 2, y));
}

export function buildCityPalaceUdaipur() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(101);
  g.add(f);
  // Lake Pichola in front, the Lake Palace on its island, and the ridge behind
  g.add(sheet(800, 400, M.lake, 0, 0.3, 172));
  // The ridge the palace stands on, RIDGE m above the water: a rocky bank falls from the palace's
  // front to the lake, the ridge running on behind it and down to the town; ghats step down to the
  // water below the palace.
  g.add(heightField(820, 420, detail.low ? 120 : 170, ridge, { cz: -40, rock: ['#8c8270', '#7d7463', '#958a75'], cover: '#8c8a5e', steep: 0.8, band: 5 }));
  for (let k = 0; k < 8; k++) g.add(box(60, 2.2 * (k + 1), 2.2, SHADE, -60, 0, 31 - k * 2.2));
  g.add(box(70, 3, 50, SHADE, 30, 0, 160), box(60, 9, 40, CREAM, 30, 3, 160));
  for (const [x, z] of [[8, 145], [52, 145], [8, 175], [52, 175]]) g.add(at(chhatri(3, 8, CREAM), x, 12, z));
  // The palace: a 244 m front built up over four centuries, blocks of differing heights crowned with kiosks
  f.add(box(250, 14, 30, SHADE, 0, 0, -6));
  const blocks = [[-110, 22, 16, 26], [-84, 34, 22, 28], [-54, 28, 20, 26], [-26, 40, 26, 30], [6, 32, 22, 28], [34, 44, 24, 30], [64, 30, 22, 28], [94, 26, 20, 26], [116, 20, 14, 24]];
  for (const [x, h, w, d] of blocks) {
    f.add(box(w, h, d, CREAM, x, 14, -6), box(w + 0.8, 0.8, d + 0.8, SHADE, x, 14 + h, -6));
    const n = Math.max(2, Math.floor(w / 4));
    for (let fl = 0; fl < Math.floor(h / 7); fl++) for (let k = 0; k < n; k++) {
      f.add(onFace(at(archPanel(2, 3.4, true, M.recess, 0.2), 0, 16 + fl * 7, 0), 0, d / 2 - 6, x - w / 2 + (k + 0.5) * (w / n)));
      // The back of each block, onto the courts behind: windows on every floor.
      f.add(onFace(at(archPanel(1.6, 2.8, true, M.recess, 0.2), 0, 16.4 + fl * 7, 0), Math.PI, d / 2 + 6, -(x - w / 2 + (k + 0.5) * (w / n))));
    }
    f.add(at(chhatri(2.2, 6, CREAM), x - w / 4, 14.8 + h, 4), at(chhatri(2.2, 6, CREAM), x + w / 4, 14.8 + h, 4));
  }
  for (const x of [-72, -40, 20, 50, 80]) f.add(cyl(4, 4.4, 50, CREAM, x, 0, 8, 8), at(hemi(4.2, CREAM, 16), x, 50, 8), at(finial(2.4), x, 54, 8));
  // Behind the front, the courts of the palace: lower ranges round them, with windows and kiosks,
  // and the base's back wall with a row of windows.
  for (const [x, z, w, h, d] of [[-80, -42, 60, 12, 18], [-10, -46, 50, 16, 20], [60, -40, 46, 10, 16]]) {
    f.add(box(w, h, d, CREAM, x, 0, z), box(w + 0.6, 0.6, d + 0.6, SHADE, x, h, z));
    for (let k = 0; k < Math.floor(w / 5); k++) f.add(onFace(at(archPanel(1.6, 2.6, true, M.recess, 0.2), 0, h - 4.4, 0), Math.PI, d / 2 - z, -(x - w / 2 + (k + 0.5) * (w / Math.floor(w / 5)))));
    f.add(at(chhatri(2, 5, CREAM), x - w / 2 + 3, h + 0.6, z - d / 2 + 3), at(chhatri(2, 5, CREAM), x + w / 2 - 3, h + 0.6, z - d / 2 + 3));
  }
  for (let k = 0; k < 40; k++) f.add(onFace(at(archPanel(1.4, 2.2, true, M.recess, 0.2), 0, 8, 0), Math.PI, 21, -(-117 + k * 6)));
  // The whole palace stands on the ridge.
  f.position.y = RIDGE;
  addDetails(f, g);
  return { group: g, focus: f, view: [0.25, 0.2, 1.25] };
}
