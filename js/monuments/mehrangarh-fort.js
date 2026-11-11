import * as THREE from 'three';
import { mat, box, cyl, at, rng, chhatri, inst, unitBox, unitCyl, surface, photo } from '../helpers.js';
import { fortGate, rampart, bastionCrowns } from '../details/forts.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/mehrangarh-fort.js';
import { detail } from '../detail.js';

const SAND = photo(mat('#b9774f', 0.9), 'rubble');
const SAND_LIGHT = photo(mat('#cf9a6e', 0.85), 'rubble');

// Mehrangarh on Bhakurcheeta, the rocky ridge above Jodhpur, at its real height: the rock rises
// H = 120 m above the city and the fort runs about 420 m along its top (north is +x here), its walls
// up to 36 m high rising straight from the cliffs. The plateau's outline is a rounded rectangle
// (a superellipse) A along x and B across; the walls stand at WALL of it, in from the cliff's edge
// far enough that their bastions stand on the rock.
export const H = 120, A = 210, B = 58, WALL = 0.88;
// The outline bulges out here and there (never in, so the palaces stay inside the walls): the
// plateau's scale at (x, z).
const bulge = (x, z) => { const a = Math.atan2(z / B, x / A); return 1 + 0.05 * (1 + Math.sin(3 * a + 1)) + 0.025 * (1 + Math.sin(7 * a + 2)); };

// The rock's height at (x, z): the level top, sheer broken faces at the edge, scree and boulders
// below falling to the plain, the foot sinking under the city. Read by the shrubs in
// js/details/mehrangarh-fort.js.
export function rock(x, z) {
  const ex = Math.abs(x) / A, ez = Math.abs(z) / B, e = Math.pow(ex ** 4 + ez ** 4, 0.25) / bulge(x, z) + rough(x * 0.4, z * 0.4, 0.05, 1.6);
  const top = H + rough(x, z, 1.5, 0.6), cliff = smooth(1.22, 1.0, e), foot = 42 * smooth(2.7, 1.15, e) + rough(x * 0.5, z * 0.5, 6, 0.8);
  return Math.max(0, Math.max(top * cliff, foot * (1 - cliff)) + rough(x * 1.2, z * 1.2, 2.2 * cliff, 1.3)) - 0.3;
}

// The point on the wall line at angle t round the plateau, and the outward direction there.
export function wallPoint(t) {
  const c = Math.cos(t), s = Math.sin(t), x0 = A * WALL * Math.sign(c) * Math.sqrt(Math.abs(c)), z0 = B * WALL * Math.sign(s) * Math.sqrt(Math.abs(s));
  const k = bulge(x0, z0), x = x0 * k, z = z0 * k;
  // The outline's normal: the gradient of x⁴/A⁴ + z⁴/B⁴ (the bulge is gentle enough to leave out).
  const nx = (x ** 3) / A ** 4, nz = (z ** 3) / B ** 4, l = Math.hypot(nx, nz) || 1;
  return { x, z, nx: nx / l, nz: nz / l };
}

// The bastions round the walls, [x, z]: every 55 m or so along them, more closely at the palace
// end. Shared with the details (their bands and slits).
export function bastions() {
  const out = [], N = 640;
  let last = null, run = 0;
  for (let k = 0; k <= N; k++) {
    const p = wallPoint((k / N) * Math.PI * 2);
    if (last) run += Math.hypot(p.x - last.x, p.z - last.z);
    last = p;
    if (run >= (p.x > 110 ? 38 : 55)) { out.push([p.x + p.nx * 2, p.z + p.nz * 2]); run = 0; }
  }
  return out;
}

export function buildMehrangarh() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(83);
  g.add(f);
  g.add(box(1400, 0.2, 900, mat('#c9b48c', 0.95)));
  g.add(heightField(1000, 560, detail.low ? 150 : 230, rock, { rock: ['#8b6a4e', '#7a5c43', '#9a7556'], cover: '#a98a65', steep: 0.75, band: 9 }));
  // The old city at its foot to the south, its houses washed blue.
  const houses = [];
  for (let i = 0; i < 260; i++) {
    const x = (R() - 0.5) * 760, z = 150 + R() * 150, w = 5 + R() * 4;
    if (rock(x, z) > 2) continue;
    houses.push([x, z, w, 5 + R() * 3, 1 + Math.floor(R() * 3), (Math.floor(R() * 4) * Math.PI) / 2]);
  }
  g.add(townHouses(houses, { seed: 83, paint: ['#6f9fd0', '#7fb0dc', '#5d8fc4', '#8dbbe2', '#6f9fd0', '#e8dcc0'], fine: !detail.low }));

  // The walls: a run of segments round the wall line, rooted 6 m into the rock and rising 28 m
  // above it, with a string course near the top; a gap on the south side where the gate stands.
  // (Rooted deep, so the wall never shows a foot where the cliff falls away under it.)
  const N = 160, WH = 28, WT = 6, segs = [], bands = [];
  for (let k = 0; k < N; k++) {
    const p = wallPoint((k / N) * Math.PI * 2), q = wallPoint(((k + 1) / N) * Math.PI * 2);
    const mx = (p.x + q.x) / 2, mz = (p.z + q.z) / 2, len = Math.hypot(q.x - p.x, q.z - p.z) + 0.6, ry = Math.atan2(q.z - p.z, p.x - q.x);
    if (mz > 0 && Math.abs(mx) < 7) continue;
    // The walls rise and fall with the rock: from 24 to 32 m.
    const wh = WH + 4 * Math.sin(k * 0.21) + 2 * Math.sin(k * 0.67 + 1);
    segs.push([mx, H - 8, mz, len, wh + 8, WT, ry]);
    const nx = (p.nx + q.nx) / 2, nz = (p.nz + q.nz) / 2;
    bands.push([mx + nx * (WT / 2 + 0.15), H + wh - 3, mz + nz * (WT / 2 + 0.15), len, 0.7, 0.3, ry]);
  }
  f.add(inst(unitBox(), segs, SAND), inst(unitBox(), bands, SAND_LIGHT));
  // Battlements along the wall's top: a parapet, merlons, arrow slits and the wall walk's kerb.
  f.add(rampart(segs, SAND, { size: 1.5, course: false }));
  // The bastions, round, rising a little above the walls from the rock at the cliff's edge.
  f.add(inst(unitCyl(16), bastions().map(([x, z]) => [x, H - 14, z, 17, 48, 17]), SAND));
  f.add(bastionCrowns(bastions().map(([x, z]) => [x, H + 34, z, 8.5]), SAND, { trim: SAND_LIGHT, size: 1.5 }));
  // Jayapol, the gatehouse on the south side, its passage ending at the inner door.
  const gp = wallPoint(Math.PI / 2);
  f.add(at(fortGate(12, 16, 8, 4.6, 8, { m: SAND, trim: SAND_LIGHT, through: false }), 0, H, gp.z));

  // The palaces at the north end (+x), rising above the walls in ranges of carved sandstone: the
  // Phool Mahal and Moti Mahal range along the south front, the Sheesh Mahal and Takhat Vilas
  // behind it, and the Zenana's screened range across the north end. Kiosks on their roofs.
  for (const [x, z, w, h, d] of [[130, 16, 72, 40, 22], [146, -12, 52, 34, 24], [166, 0, 14, 36, 50]]) {
    f.add(box(w, h, d, SAND_LIGHT, x, H, z), box(w + 0.8, 0.8, d + 0.8, SAND, x, H + h, z));
  }
  for (const [x, z] of [[98, 24], [120, 24], [142, 24], [160, 24], [128, -21], [158, -21], [168, 18], [168, -18]]) f.add(at(chhatri(2.6, 7, SAND_LIGHT), x, H + 40.8, z));
  // Along the rest of the top: the courts and lesser buildings, and the Chamunda temple at the
  // south end (-x).
  const blocks = [];
  for (let i = 0; i < 26; i++) {
    const x = -150 + R() * 230, w = 10 + R() * 18, d = 10 + R() * 16, z = (R() - 0.5) * 50;
    if (Math.abs(z) + d / 2 > B * 0.74 * Math.pow(Math.max(0, 1 - (Math.abs(x) / (A * 0.82)) ** 4), 0.25)) continue;
    blocks.push([x, H, z, w, 6 + R() * 10, d, (R() - 0.5) * 0.1]);
  }
  f.add(inst(unitBox(), blocks, SAND));
  f.add(box(14, 8, 14, SAND_LIGHT, -164, H, 0), at(chhatri(4, 12, SAND_LIGHT), -164, H + 8, 0));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.35, 0.22, 1.25] };
}
