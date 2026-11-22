import * as THREE from 'three';
import { mat, box, cyl, at, inst, unitBox, unitCyl, photo, hemi } from '../helpers.js';
import { fortGate, rampart, bastionCrowns } from '../parts/forts.js';
import { mughalChhatri } from '../parts/components.js';
import { addDetails } from '../details/purana-qila.js';

// The walls' grey quartzite rubble, the red sandstone of the gates and buildings, and the white
// marble and the buff stone of their trim.
export const RUBBLE = photo(mat('#8f8676', 0.94), 'rubble');
export const RED = photo(mat('#a85a3e', 0.86), 'blocks');
export const BUFF = mat('#d4b98f', 0.85);
export const MARBLE = mat('#efebe2', 0.5);

// Purana Qila, Sher Shah's citadel of Delhi, at about its real size: an oblong of walls about
// 1.8 km round, 18 m high, with round bastions, built on the mound of older cities. Here west is +z:
// the Bara Darwaza, the main gate, is in the middle of the west wall; the Humayun Darwaza on the
// south (+x) and the Talaqi Darwaza on the north (-x). The plan is a rounded oblong A by B
// (half-sizes), its outline a superellipse.
export const A = 300, B = 150, WH = 16, WT = 6;
export const outline = (t) => { const c = Math.cos(t), s = Math.sin(t); return [A * Math.sign(c) * Math.abs(c) ** 0.4, B * Math.sign(s) * Math.abs(s) ** 0.4]; };
// The three gates: [x, z, facing] on the wall line.
export const GATES = [[0, B, 0], [A, 0, Math.PI / 2], [-A, 0, -Math.PI / 2]];

// A gate of Purana Qila: a two-storey gatehouse of red sandstone, w wide, its arch set in a tall
// recess, between two great round bastions of rubble, with kiosks on its roof.
export function qilaGate(w, h, d, { iw = 9, ih = 15, br = 8.5, bh = h + 2, kiosks = 2 } = {}) {
  const g = new THREE.Group();
  g.add(fortGate(w, h, d, 4.4, 7.6, { m: RED, trim: MARBLE, iwan: { w: iw, h: ih, depth: 3.2 }, crest: false, spikes: true }));
  for (const s of [-1, 1]) {
    const x = s * (w / 2 + br * 0.55);
    g.add(cyl(br, br * 1.12, bh, RUBBLE, x, 0, d / 2 - br * 0.75, 24), cyl(br * 1.06, br * 1.06, 0.6, RED, x, bh - 1.2, d / 2 - br * 0.75, 24));
    if (kiosks) g.add(at(mughalChhatri(2.4, 6.5, RED, { domeM: MARBLE, crescent: false }), s * (w / 2 - 3.2), h, d / 2 - 3.2));
  }
  if (kiosks > 2) g.add(at(mughalChhatri(2.8, 7.5, RED, { domeM: MARBLE, crescent: false }), 0, h, -d / 2 + 3.5));
  return g;
}

// The Qila-i-Kuhna mosque (1541): a prayer hall about 51 m long and 15 deep, its front of five
// arched bays (the middle one taller, in a projecting frame), red sandstone banded in marble and
// buff, two-storeyed turrets at its back corners and a single dome over its middle bay. Facing +z
// in its own frame (it faces east, into the fort).
export const MOSQUE = [70, 40], MW = 51, MD = 15, MH = 13;
export function mosque() {
  const g = new THREE.Group();
  g.add(box(MW + 4, 1.2, MD + 10, BUFF, 0, 0, 4), box(MW, MH, MD, RED, 0, 1.2, 0), box(12, MH + 4, MD + 1.6, RED, 0, 1.2, 0.8));
  g.add(box(MW + 0.6, 0.5, MD + 0.6, BUFF, 0, 1.2 + MH, 0), box(12.6, 0.5, MD + 2.2, BUFF, 0, 5.2 + MH, 0.8));
  // The dome over the middle bay, on its drum.
  g.add(cyl(5.6, 5.8, 2.6, RED, 0, MH + 5.7, -1), at(hemi(5.8, RED, 32), 0, MH + 8.3, -1), cyl(0.4, 0.8, 1.6, MARBLE, 0, MH + 13.9, -1, 10));
  // The rear turrets: octagonal, in two stages with a kiosk.
  for (const s of [-1, 1]) {
    const x = s * (MW / 2 - 1.2), z = -MD / 2 + 1.2;
    g.add(cyl(2.2, 2.4, MH + 2, RED, x, 1.2, z, 8), cyl(2.6, 2.6, 0.4, BUFF, x, MH + 0.6, z, 8), at(mughalChhatri(1.6, 4.6, RED, { domeM: RED, crescent: false }), x, MH + 3.2, z));
  }
  return g;
}

// The Sher Mandal: a two-storey octagonal pavilion of red sandstone, an open kiosk on its roof.
export const SHER = [-40, 30];
export function sherMandal() {
  const g = new THREE.Group();
  g.add(cyl(9.2, 9.6, 1.4, BUFF, 0, 0, 0, 8).rotateY(Math.PI / 8), cyl(7.6, 7.8, 7.6, RED, 0, 1.4, 0, 8).rotateY(Math.PI / 8), cyl(8.2, 8.2, 0.5, BUFF, 0, 9, 0, 8).rotateY(Math.PI / 8));
  g.add(cyl(6.2, 6.4, 5.4, RED, 0, 9.5, 0, 8).rotateY(Math.PI / 8), cyl(6.7, 6.7, 0.4, BUFF, 0, 14.9, 0, 8).rotateY(Math.PI / 8));
  g.add(at(mughalChhatri(3.6, 8.5, RED, { domeM: MARBLE, crescent: false }), 0, 15.3, 0));
  return g;
}

export function buildPuranaQila() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The walls: lengths round the outline, a round bastion every 70 m or so, gaps at the gates.
  const segs = [], towers = [], N = 260;
  let run = 0;
  for (let k = 0; k < N; k++) {
    const [x0, z0] = outline((k / N) * Math.PI * 2), [x1, z1] = outline(((k + 1) / N) * Math.PI * 2), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, len = Math.hypot(x1 - x0, z1 - z0);
    run += len;
    if (GATES.some(([gx, gz], i) => Math.hypot(mx - gx, mz - gz) < (i ? 21 : 28))) { run = 30; continue; }
    segs.push([mx, -0.5, mz, len + 0.5, WH + 0.5, WT, Math.atan2(z0 - z1, x1 - x0)]);
    if (run > 70) { const l = Math.hypot(mx, mz); towers.push([mx + (mx / l) * 3, -0.5, mz + (mz / l) * 3, 7]); run = 0; }
  }
  f.add(inst(unitBox(), segs, RUBBLE), inst(unitCyl(20), towers.map(([x, y, z, r]) => [x, y, z, 2 * r, WH + 2.5, 2 * r * 1.06]), RUBBLE));
  f.add(rampart(segs, RUBBLE, { trim: RED, size: 0.9, kerb: true }), bastionCrowns(towers.map(([x, y, z, r]) => [x, WH + 2, z, r]), RUBBLE, { trim: RED, size: 0.9, seg: 20 }));
  // The gates: the Bara Darwaza (west) the largest, with three kiosks.
  GATES.forEach(([x, z, a], i) => {
    const gt = i === 0 ? qilaGate(30, 21, 18, { kiosks: 3 }) : qilaGate(22, 18, 14, { iw: 7.5, ih: 13, br: 7 });
    gt.position.set(x, 0, z);
    gt.rotation.y = a;
    f.add(gt);
  });
  f.add(at(mosque(), MOSQUE[0], 0, MOSQUE[1]).rotateY(Math.PI), at(sherMandal(), SHER[0], 0, SHER[1]));
  addDetails(f, g);
  // From the south-west, outside: the Bara Darwaza between its bastions, the walls running away
  // to either side, the mosque's dome over them.
  return { group: g, focus: f, view: [0.55, 0.2, 1], zoom: 0.2, target: [10, 13, 145] };
}
