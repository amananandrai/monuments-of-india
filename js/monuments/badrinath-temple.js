import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet, lathe, hipRoof, archWall, kalash, surface, photo, rng } from '../helpers.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { heightField, smooth, fbm, ridged } from '../parts/terrain.js';
import { townHouses, houseRow } from '../parts/realism.js';
import { addDetails } from '../details/badrinath-temple.js';
import { detail } from '../detail.js';

// The painted front: plaster in strong yellow, with red, blue, green and white for the bands, frames
// and turrets (the colours are repainted every season). Behind it the temple is plain grey stone.
const paint = (c) => surface(mat(c, 0.75), 'none');
const YELLOW = paint('#e9b62e'), RED = paint('#b5302a');
const STONE = photo(mat('#8f8b84', 0.9), 'blocks'), STONE_DARK = photo(mat('#6f6b64', 0.9), 'blocks');
const TIN = surface(mat('#8c3a2e', 0.6, 0.2), 'none'), SHINGLE = mat('#5e5a55', 0.85, 0, { flatShading: true });
const SLOPE = mat('#6f7557', 0.95, 0, { flatShading: true }), PAVE = mat('#8a8780', 0.9);

// The levels (js/details/badrinath-temple.js repeats them). The temple faces east, here +z, over
// the Alaknanda. The ghat by the river is at 0.6, the court before the temple at 2.4, the
// temple's own floor at PL = 3.8, up the broad steps of the Singh Dwar. The real bank is higher:
// the court stands some 15 m over the river (see the report on refs.base).
const GHAT = 0.6, COURT = 2.4, PL = 3.8;

// The valley of the Alaknanda at Badrinath, running along x: flat by the river, the slopes of
// Narayan Parvat rising behind the temple (-z) and of Nar Parvat across the river (+z), closing in
// far up and down the valley. Behind the temple the western wall opens in a side valley (the
// Rishi Ganga), and at its head stands the snow pyramid of Neelkanth.
function valley() {
  return heightField(2600, 2600, detail.low ? 120 : 170, (x, z) => {
    const wob = 50 * fbm(x, z, { scale: 0.004, octaves: 3 }), crest = 0.62 + 0.55 * ridged(x, z, { scale: 0.0045, octaves: 5 });
    const high = 240 + 80 * fbm(x, z, { scale: 0.0022, octaves: 3 });
    const notch = 0.22 + 0.78 * smooth(50, 330, Math.abs(x + 30) + 0.4 * wob);
    const west = smooth(170, 540, -z + wob) * high * crest * notch;
    const east = smooth(250, 660, z + wob) * (high + 30) * crest;
    const ends = smooth(720, 1180, Math.abs(x) + wob) * high * 0.9 * crest;
    const d = Math.hypot(x + 30, (z + 1010) * 1.15), peak = 450 * Math.pow(Math.max(0, 1 - d / 640), 1.2) * (0.86 + 0.22 * ridged(x, z, { scale: 0.006, octaves: 4 }));
    return Math.max(west, east, ends, peak) - 3;
  }, { rock: ['#7d7a74', '#6e6b66', '#8a867f'], cover: '#6f7550', steep: 0.82, snow: 215 });
}

export function buildBadrinath() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(17);
  g.add(f);
  g.add(box(520, 0.2, 330, SLOPE, 0, 0, 10), sheet(1400, 24, M.river, 0, 0.3, 68), valley());
  // The terraces down to the river: the court, the stair from it to the ghat, and the ghat itself.
  f.add(box(46, COURT, 50, PAVE, 0, 0, 5), box(76, GHAT, 26.5, PAVE, 0, 0, 43.2));
  f.add(at(steps(16, COURT - GHAT, 12, STONE, 0.42), 0, GHAT, 30));
  // The temple's plinth and the steps of the Singh Dwar.
  f.add(box(21, PL - COURT, 28.5, STONE_DARK, 0, COURT, -3.25), at(steps(10.5, PL - COURT, 8, STONE, 0.4), 0, COURT, 11));

  // The Singh Dwar: a tall front in three bays, the middle one higher, with the arched gateway
  // through it and the door to the hall at the back of the passage.
  const front = at(new THREE.Group(), 0, PL, 6);
  front.add(archWall(7, 11, 4, 3.3, 5.6, false, YELLOW));
  for (const s of [-1, 1]) front.add(box(4.6, 9.3, 3.6, YELLOW, s * 5.8, 0, -0.2));
  front.add(box(3.4, 5.7, 0.1, M.recess, 0, 0, -1.9), at(templeDoorway(1.5, 2.7, { m: RED, guardians: false, shakha: false }), 0, 0, -1.85));
  f.add(mergeByMaterial(front));
  // The Sabha Mandap behind it, of stone under a low roof of red sheet iron; then the Garbha
  // Griha, a square stone tower under a conical roof with a gilt cupola (about 15 m in all).
  f.add(box(13, 6.4, 11, STONE, 0, PL, -1.5), box(13.8, 0.3, 11.8, STONE_DARK, 0, PL + 6.4, -1.5), at(hipRoof(14.4, 12.4, 2.3, TIN), 0, PL + 6.7, -1.5));
  f.add(box(8.4, 7.3, 8.4, STONE, 0, PL, -11.2), box(9, 0.35, 9, STONE_DARK, 0, PL + 7.3, -11.2));
  const cone = lathe([[5.3, 0], [5.0, 0.12], [3.7, 1.0], [2.5, 2.1], [1.6, 3.0], [1.0, 3.6], [1.0, 3.9]], SHINGLE, 8);
  cone.rotation.y = Math.PI / 8;
  f.add(at(cone, 0, PL + 7.65, -11.2));
  const cy = PL + 7.65 + 3.9;
  f.add(cyl(1.15, 1.15, 0.14, M.gild, 0, cy, -11.2, 16), at(mesh(new THREE.SphereGeometry(0.95, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.gild), 0, cy + 0.14, -11.2), at(kalash(0.5, M.gild), 0, cy + 1.05, -11.2));

  // The pilgrim town (js/parts/realism.js): lodges and dharamshalas of two and three storeys under
  // pitched roofs of painted sheet iron, beside and behind the temple on the west bank and, most
  // of it, across the river.
  const lodges = [], flats = [], E = Math.PI / 2, o = { w: [6, 10], d: [8, 11], n: [2, 3] };
  const put = (rows) => rows.forEach((p) => (R() < 0.25 ? flats : lodges).push(p));
  for (const s of [-1, 1]) {
    put(houseRow(R, 'z', s * 31, -22, 30, -s * E, { ...o, n: [2, 2] }));
    put(houseRow(R, 'z', s * 47, -40, 50, s * E, o));
    put(houseRow(R, 'x', 44, s > 0 ? 40 : -150, s > 0 ? 150 : -40, 0, o));
    put(houseRow(R, 'x', -36, s > 0 ? 6 : -110, s > 0 ? 110 : -6, 0, o));
  }
  put(houseRow(R, 'x', -54, -100, 100, Math.PI, o));
  for (const [z, ry, a, b] of [[92, Math.PI, -170, 170], [108, 0, -160, 160], [124, Math.PI, -150, 150], [140, 0, -120, 130]]) put(houseRow(R, 'x', z, a, b, ry, { ...o, skip: (c) => Math.abs(c - 26) < 5 }));
  const colours = ['#d8cdb8', '#e6dccb', '#c9b9a0', '#a9b6bf', '#d9c3a3', '#e3c36a', '#b9c7a8', '#d99a86'];
  g.add(townHouses(lodges, { seed: 17, roof: 'pitched', paint: colours, roofs: ['#8a3b2a', '#3c7a4f', '#2f5d9a', '#7a7f84', '#8a3b2a'] }), townHouses(flats, { seed: 18, paint: colours, tanks: 0.3 }));

  addDetails(f, g);
  // From the bridge over the Alaknanda: the painted front up its steps, Neelkanth behind.
  return { group: g, focus: f, view: [0.22, 0.03, 1], zoom: 0.48, target: [0, 13, 4], fog: 14 };
}
