import * as THREE from 'three';
import { M, mat, box, at, inst, unitBox, unitCyl, photo, sheet } from '../helpers.js';
import { fortGate, rampart, bastionCrowns } from '../parts/forts.js';
import { heightField, rough, smooth, fbm, ridged } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/kangra-fort.js';

// Kangra's grey-brown stone, and its darker weathered courses.
export const STONE = photo(mat('#9d9282', 0.92), 'rubble');
export const TRIM = photo(mat('#7f7668', 0.94), 'rubble');

// Kangra Fort on its ridge, at about its real size: a long narrow spur running east (+x) between
// two rivers, the Banganga to the south (+z) and the Majhi to the north, which meet below
// its east end. The ridge's top climbs from the town at its west end to the palace at its east
// end, TOP above the rivers; its sides fall in cliffs. The top's half-width at x is halfW(x).
export const TOP = 72;
export const halfW = (x) => 34 + 10 * Math.sin(x * 0.012 + 0.6) + 6 * Math.sin(x * 0.031);
// The height of the ridge's crest along x: low at the town end, rising past the gates to the top.
export const crest = (x) => (22 + (TOP - 22) * smooth(-280, 120, x)) * smooth(360, 250, x);
// The rivers' lines: z of the Banganga (south) and the Majhi (north) at x, converging to the east.
const southRiver = (x) => 135 - 0.35 * Math.max(0, x - 120);
const northRiver = (x) => -125 + 0.3 * Math.max(0, x - 120);

// The ground's height at (x, z): the ridge's level top, cliffs at its edges, slopes down to the
// two rivers, and the hills of the Kangra valley beyond them.
export function ridge(x, z) {
  const e = Math.abs(z - 4) / halfW(x) + rough(x * 0.5, z * 0.5, 0.05, 1.3);
  const top = crest(x) + rough(x, z, 0.8, 0.6);
  const cliff = smooth(1.25, 1.0, e), slope = smooth(4.2, 1.2, e);
  const sr = southRiver(x), nr = northRiver(x), toRiver = Math.min(Math.abs(z - sr), Math.abs(z - nr));
  const banks = 6 + 14 * smooth(30, 160, toRiver) + 30 * fbm(x, z, { scale: 0.004, octaves: 3 }) * smooth(60, 260, toRiver);
  const hills = (40 + 60 * ridged(x, z, { scale: 0.003, octaves: 4 })) * smooth(240, 520, Math.abs(z));
  const ground = Math.max(banks, hills) * smooth(16, 55, toRiver);
  // The rivers' beds stay level and below the water, so the water is never buried.
  return Math.max(top * cliff + (crest(x) * 0.45 * slope + ground * (1 - slope)) * (1 - cliff), ground) * smooth(18, 50, toRiver) - 0.4;
}

// The gates on the way up along the ridge from the west, at x, each in a wall across the top:
// the Ranjit Singh Darwaza, the Jahangiri, Ahani and Amiri Darwazas, the Andheri Darwaza and the
// Darshani Darwaza before the palace court.
export const GATES = [[-215, 'Ranjit Singh'], [-160, 'Jahangiri'], [-105, 'Ahani'], [-55, 'Amiri'], [5, 'Andheri'], [95, 'Darshani']];

export function buildKangraFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(8000, 0.2, 8000, mat('#7d8a55', 0.95), 0, -1.2, 0));
  g.add(heightField(1300, 1100, detail.low ? 130 : 220, ridge, { rock: ['#857a68', '#91856f', '#7a705f'], cover: '#5f7a3f', steep: 0.74, band: 10 }));
  // The two rivers in their beds.
  for (const [fn, w] of [[southRiver, 34], [northRiver, 28]]) for (let x = -650; x < 520; x += 40) {
    const z0 = fn(x), z1 = fn(x + 40), r = sheet(Math.hypot(40, z1 - z0) + 2, w, M.river, x + 20, 0.5, (z0 + z1) / 2);
    r.rotation.y = -Math.atan2(z1 - z0, 40);
    g.add(r);
  }
  // The curtain walls along both rims of the ridge, from the outer gate to the east end, stepping
  // up with the crest, and a bastion every 45 m or so.
  const segs = [], towers = [];
  for (const side of [-1, 1]) {
    let run = 0;
    for (let x = -230; x < 300; x += 6) {
      const x1 = x + 6, z0 = 4 + side * halfW(x) * 0.93, z1 = 4 + side * halfW(x1) * 0.93, mx = x + 3, mz = (z0 + z1) / 2;
      const y = Math.min(ridge(x, z0), ridge(x1, z1)) - 3;
      segs.push([mx, y, mz, Math.hypot(6, z1 - z0) + 0.4, 9, 3.2, Math.atan2(z0 - z1, 6)]);
      run += 6;
      if (run >= 45) { towers.push([mx, y, mz + side * 2.6, 4.2, 11]); run = 0; }
    }
  }
  // The east end, where the cliff falls to the meeting of the rivers.
  for (let z = -halfW(300) * 0.93; z < halfW(300) * 0.93; z += 6) segs.push([300, ridge(300, z + 7) - 3, z + 7, 6.4, 9, 3.2, Math.PI / 2]);
  f.add(inst(unitBox(), segs, STONE), inst(unitCyl(12), towers.map(([x, y, z, r, h]) => [x, y, z, 2 * r, h, 2 * r]), STONE));
  f.add(rampart(segs, STONE, { trim: TRIM, size: 0.75, kerb: false, centre: [40, 4] }), bastionCrowns(towers.map(([x, y, z, r, h]) => [x, y + h, z, r]), STONE, { trim: TRIM, size: 0.75, seg: 12 }));
  // The gates, each facing west down the ridge in a wall across its top.
  for (const [x] of GATES) {
    const w = halfW(x) * 1.86, y = crest(x) - 0.6, gate = at(fortGate(13, 10, 7, 4, 6.4, { m: STONE, trim: TRIM, towers: x === GATES[0][0] ? { r: 3.6, h: 12, cap: 'merlons', seg: 12 } : null }), x, y, 4);
    gate.rotation.y = -Math.PI / 2;
    f.add(gate);
    const half = (w - 13) / 2;
    for (const s of [-1, 1]) f.add(box(3, 9, half + 1, STONE, x + 1, y - 1, 4 + s * (6.5 + half / 2)));
  }
  addDetails(f, g);
  // From the south-east, above the Banganga: the walls along the cliff, the gates climbing the
  // ridge, and the palace and temples at its top.
  return { group: g, focus: f, view: [0.35, 0.28, 1], zoom: 0.45, target: [30, 50, 10] };
}
