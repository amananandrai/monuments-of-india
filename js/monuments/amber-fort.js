import * as THREE from 'three';
import { M, mat, box, cyl, at, chhatri, onFace, archPanel, inst, unitBox, aroundRect, paintMats } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { addDetails } from '../details/amber-fort.js';
import { heightField, rough, smooth } from '../details/terrain.js';

const SAND = mat('#d9b77e', 0.9);
const SAND_DARK = mat('#b8925a', 0.9);
const HILL = mat('#8a7a52', 0.95, 0, { flatShading: true });

function block(w, h, d, x, y, z) {
  const g = new THREE.Group();
  g.add(box(w, h, d, SAND), box(w + 0.6, 0.6, d + 0.6, SAND_DARK, 0, h));
  const n = Math.max(2, Math.floor(w / 4));
  // Arched recesses along the front, standing 2 cm off the wall so their backs never meet its face
  for (let k = 0; k < n; k++) g.add(onFace(at(archPanel(1.8, Math.min(4, h * 0.4), true, M.recess, 0.2), 0, h * 0.45, 0), 0, d / 2 + 0.02, -w / 2 + (k + 0.5) * (w / n)));
  g.position.set(x, y, z);
  return g;
}

// The ridge's crest line and height, and the ground: the valley floor in front of the lake, the
// slope up from z = 40 to the crest, and the fall behind it. Inside the palace terraces the ground
// sinks out of sight under them.
const crestZ = (x) => -250 + 40 * Math.sin(x * 0.006 + 1), crestH = (x) => 125 + 28 * Math.sin(x * 0.009 + 0.4);
const TERRACES = [[100, -35, 35], [85, -70, -10], [75, -105, -55]];
export function ridgeY(x, z) {
  if (TERRACES.some(([hw, z0, z1]) => Math.abs(x) < hw - 0.5 && z > z0 + 0.5 && z < z1 - 0.5)) return -1;
  if (z >= 40) return rough(x, z, 0.4, 1.5) - 0.3;
  const cz = crestZ(x), ch = crestH(x), ax = Math.abs(x);
  const t = Math.min(1, (40 - z) / (40 - cz)), behind = Math.max(0, cz - z);
  let up = ch * Math.pow(smooth(0, 1, t), 1.15) * (1 - 0.6 * smooth(0, 320, behind));
  // Valleys either side of the spur on the lower slopes; the crest itself runs on unbroken.
  up *= 1 - 0.5 * smooth(95, 240, ax) * (1 - smooth(0.55, 0.92, t));
  // The spur the palace stands on is the high ground nearby: under and beside the terraces the
  // hill stays below them, then climbs from behind the palace to the crest.
  const spur = z > -35 ? 9 : z > -70 ? 21 : z > -105 ? 33 : 33 + 0.6 * (-105 - z);
  up = up + (Math.min(up, spur) - up) * (1 - smooth(90, 170, ax));
  return up + rough(x, z, 5, 0.25) * smooth(0, 0.15, t);
}

// A crenellated wall following the crest, with a round bastion every 120 m.
function crestWall() {
  const g = new THREE.Group(), pts = [];
  for (let x = -640; x <= 640; x += 16) { const z = crestZ(x); pts.push([x, ridgeY(x, z), z]); }
  for (let k = 1; k < pts.length; k++) {
    const [x0, y0, z0] = pts[k - 1], [x1, y1, z1] = pts[k], len = Math.hypot(x1 - x0, z1 - z0);
    const w = box(len + 0.6, 7, 2.6, SAND_DARK, 0, -1.5, 0);
    w.position.set((x0 + x1) / 2, Math.min(y0, y1) - 1.5 + 3.5, (z0 + z1) / 2);
    w.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    g.add(w);
    if (k % 8 === 0) g.add(cyl(4, 4.6, 9, SAND_DARK, x1, y1 - 1.5, z1, 12));
  }
  return g;
}

export function buildAmberFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Maota Lake with the Kesar Kyari garden, below the hill
  g.add(box(160, 0.4, 60, M.water, 0, 0, 70), box(26, 1.2, 26, SAND_DARK, 0, 0, 66));
  for (const x of [-6, 6]) for (const z of [-6, 6]) g.add(box(9, 1.4, 9, M.grass, x, 0, 66 + z));
  // The palace's terraces, built up on a spur of the ridge
  const terraces = [[200, 10, 70, 0], [170, 22, 60, -40], [150, 34, 50, -80]];
  for (const [w, h, d, z] of terraces) g.add(box(w, h, d, HILL, 0, 0, z));
  // The Aravalli ridge the spur runs down from, rising behind the palace to the crest that Jaigarh
  // crowns, and the walls of Jaigarh and Amber running along that crest.
  g.add(heightField(1600, 1100, 220, ridgeY, { cz: -180, rock: ['#8a7a52', '#7d6e4a', '#958459'], cover: '#9a8c5e', steep: 0.8, band: 9 }));
  g.add(crestWall());
  // Ramparts climbing the slope, with round bastions
  const merlons = [];
  for (const [x0, x1, z, y] of [[-80, 80, 36, 10], [-70, 70, -8, 22]]) {
    f.add(box(x1 - x0, 7, 3, SAND, (x0 + x1) / 2, y, z));
    for (let x = x0 + 1; x < x1; x += 2.4) merlons.push([x, y + 7, z + 1, 1.2, 1.2, 0.8]);
    for (const x of [x0, x1, (x0 + x1) / 2]) f.add(cyl(4, 4.5, 10, SAND, x, y, z, 16), at(chhatri(2.6, 6.5, SAND), x, y + 10, z));
  }
  f.add(inst(unitBox(), merlons, SAND));
  // Jaleb Chowk courtyard, the painted Ganesh Pol gate and the palace blocks
  f.add(box(70, 1, 34, SAND_DARK, 0, 22, -24));
  for (const [w, d, x, z] of [[70, 3, 0, -40], [3, 34, -35, -24], [3, 34, 35, -24]]) f.add(box(w, 6, d, SAND, x, 23, z));
  f.add(at(fortGate(16, 16, 6, 5, 9, { m: SAND, trim: SAND_DARK, crest: false }), 0, 34, -55), box(16.6, 0.8, 6.6, SAND_DARK, 0, 50, -55));
  for (let k = 0; k < 4; k++) f.add(box(14 - k * 2.6, 1.2, 0.3, paintMats[k], 0, 45 + k * 1.3, -51.8));
  f.add(block(40, 12, 22, -36, 34, -66), block(36, 10, 20, 32, 34, -64), block(30, 14, 22, 0, 34, -78));
  for (const [x, z] of [[-48, -60], [-24, -60], [18, -58], [46, -58], [-10, -72], [10, -72]]) f.add(at(chhatri(2.2, 6, SAND, M.marble), x, z === -72 ? 48 : 45, z));
  // Diwan-i-Aam: the open pillared hall of public audience
  const cols = [];
  aroundRect(24, 14, 3).forEach(([x, z]) => cols.push([x + 22, 23, z - 26, 1, 6, 1]));
  f.add(inst(unitBox(), cols, mat('#c98a7a', 0.85)), box(26, 1, 16, M.marble, 22, 29, -26));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.35, 1.25] };
}
