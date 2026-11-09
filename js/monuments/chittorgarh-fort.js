import * as THREE from 'three';
import { M, mat, box, at, chhatri, onFace, FACES, archPanel, hemi, inst, unitBox, unitCyl } from '../helpers.js';
import { heightField, rough, smooth, fbm } from '../details/terrain.js';
import { detail } from '../detail.js';
import { fortGate } from '../details/forts.js';
import { addDetails } from '../details/chittorgarh-fort.js';

const STONE = mat('#c8b28c', 0.9);
const RUIN = mat('#a8916d', 0.95);

// The nine-storey Vijay Stambh (Tower of Victory), about 37 m.
function vijayStambh() {
  const g = new THREE.Group();
  g.add(box(14, 3, 14, STONE));
  let y = 3;
  for (let i = 0; i < 9; i++) {
    const w = 10 - i * 0.25, h = 3.6;
    g.add(box(w, h, w, STONE, 0, y), box(w + 1.6, 0.4, w + 1.6, RUIN, 0, y + h - 0.4));
    for (const a of FACES) g.add(onFace(at(archPanel(2, 2.6, true, M.recess, 0.2), 0, y + 0.4, 0), a, w / 2));
    y += h;
  }
  g.add(at(chhatri(3.6, 6, STONE), 0, y, 0));
  return g;
}

// The plateau, compressed but long: the real hill rises 180 m and its top runs about 3 km, so at
// true size its towers would be specks. Here the top is L × W (a rounded rectangle), H high, with
// sheer scarps and a talus below. The places on it: the Vijay Stambh, the Kirti Stambh, Padmini's
// palace in its pool and the Ram Pol (the last of the seven gates, on the south rim). Shared with
// js/details/chittorgarh-fort.js.
export const H = 90, L = 640, W = 130;
export const VS = [-40, 0], KS = [230, -18], PP = [120, 20], RAMPOL = -232;
const reach = (x, z) => Math.pow((Math.abs(x) / (L / 2)) ** 4 + (Math.abs(z) / (W / 2)) ** 4, 0.25);
// The hill's height at (x, z): read by the walls, the road and the trees.
export function chittor(x, z) {
  const e = reach(x, z) + rough(x * 0.3, z * 0.3, 0.03, 1.4);
  const cliff = smooth(1.1, 1.0, e), foot = 52 * Math.pow(smooth(2.1, 1.08, e), 1.3) + 4 * fbm(x, z, { scale: 0.015, octaves: 3 }) * smooth(2.1, 1.3, e);
  return Math.max(0, Math.max((H + rough(x, z, 0.8, 0.7)) * cliff, foot * (1 - cliff))) - 0.3;
}
// The rim of the top at scale e: the point at angle t.
const rim = (t, e) => { const c = Math.cos(t), s = Math.sin(t); return [(L / 2) * e * Math.sign(c) * Math.sqrt(Math.abs(c)), (W / 2) * e * Math.sign(s) * Math.sqrt(Math.abs(s))]; };
// The z of the south rim at x (scale e).
export const rimZ = (x, e = 0.97) => (W / 2) * e * Math.pow(Math.max(0, 1 - (Math.abs(x) / ((L / 2) * e)) ** 4), 0.25);

export function buildChittorgarh() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(1600, 0.2, 900, mat('#9c9a63', 0.95)));
  g.add(heightField(1100, 520, detail.low ? 150 : 230, chittor, { rock: ['#7b7055', '#8a7f62', '#6f6550'], cover: '#8f8c5c', steep: 0.8, band: 8 }));
  // The walls round the rim, 6 m high, with a bastion every 60 m or so; open at the Ram Pol.
  const segs = [], towers = [], N = 240;
  let run = 0;
  for (let k = 0; k < N; k++) {
    const [x0, z0] = rim((k / N) * Math.PI * 2, 0.97), [x1, z1] = rim(((k + 1) / N) * Math.PI * 2, 0.97), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, len = Math.hypot(x1 - x0, z1 - z0);
    run += len;
    if (mz > 0 && Math.abs(mx - RAMPOL) < 9) continue;
    segs.push([mx, H - 2, mz, len + 0.4, 8, 2.4, Math.atan2(z0 - z1, x1 - x0)]);
    if (run > 60) { towers.push([mx, H - 2, mz, 7, 10, 7]); run = 0; }
  }
  f.add(inst(unitBox(), segs, STONE), inst(unitCyl(12), towers, STONE));
  f.add(at(fortGate(16, 11, 7, 4.5, 7.5, { m: STONE, trim: RUIN, towers: { r: 3, h: 12, cap: 'dome', seg: 16 } }), RAMPOL, H, rimZ(RAMPOL)));
  // The way up: a road in switchbacks up the south face from the plain to the Ram Pol, through
  // the seven gates (pols): Padan Pol at its foot, then one at each turn.
  const zAt = (x, y) => { let lo = rimZ(x, 1.0), hi = 260; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (chittor(x, m) > y) lo = m; else hi = m; } return (lo + hi) / 2; };
  const legs = [[-110, -320], [-320, -150], [-150, -310], [-310, -170], [-170, -300], [-300, RAMPOL]], road = [], pols = [];
  legs.forEach(([x0, x1], i) => {
    const y0 = 2 + (i / legs.length) * (H - 2), y1 = 2 + ((i + 1) / legs.length) * (H - 2), n = Math.ceil(Math.abs(x1 - x0) / 5);
    let prev = null;
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, z = i === legs.length - 1 && k === n ? rimZ(RAMPOL) + 5 : zAt(x, y);
      if (prev) {
        const mx = (x + prev[0]) / 2, mz = (z + prev[2]) / 2, top = Math.max(y, prev[1]), lo = Math.min(chittor(mx, mz), top) - 3;
        road.push([mx, lo, mz, Math.hypot(x - prev[0], z - prev[2]) + 0.6, top - lo, 6, Math.atan2(prev[2] - z, x - prev[0])]);
      }
      prev = [x, y, z];
    }
    pols.push([x0, y0, zAt(x0, y0), Math.sign(x1 - x0)]);
  });
  g.add(inst(unitBox(), road, RUIN));
  for (const [x, y, z, dir] of pols) g.add(at(fortGate(10, 8, 6, 3.6, 5.6, { m: STONE, trim: RUIN }), x + dir * 8, y, z).rotateY(dir * Math.PI / 2));
  // Vijay Stambh, Rana Kumbha's palace ruins, and Padmini's palace in its pool
  f.add(at(vijayStambh(), VS[0], H, VS[1]));
  const ruins = [];
  for (const [x, z, w, d, h] of [[-190, -10, 34, 20, 10], [-212, 12, 16, 12, 7], [-172, 18, 12, 9, 5], [-226, -22, 9, 9, 12], [-120, -30, 14, 10, 6], [40, -26, 18, 12, 5], [170, 30, 12, 10, 6]]) ruins.push([x, H, z, w, h, d]);
  f.add(inst(unitBox(), ruins, RUIN));
  f.add(box(40, 0.6, 30, M.water, PP[0], H, PP[1]), box(10, 6, 8, mat('#efe7d6', 0.85), PP[0], H + 0.6, PP[1]), at(hemi(3, mat('#efe7d6', 0.85), 16), PP[0], H + 6.6, PP[1]));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.3, 1.2], zoom: 0.8 };
}
