import { M, mat, at, inst, unitBox, unitCyl } from '../helpers.js';
import { merlonGeo } from './components.js';
import { manastambha } from './temples.js';
import { detail } from '../detail.js';
import { trees, scatter } from './realism.js';
import { shatrunjaya } from '../monuments/palitana-temples.js';

// Palitana, finer detail. From photographs of the tuks on Shatrunjaya: each shrine, however small,
// stands on a moulded plinth under a cornice, its doorway dark in its front; the enclosure walls are
// battlemented, with round bastions along them; and in the courts stand manastambhas. Dimensions
// follow js/monuments/palitana-temples.js: the summits level at H = 44, the shrines' bodies listed
// there (f.userData.shrines, [x, y, z, w, h, w, turn]) on a platform whose top is H + 0.4, and each
// tuk walled by an ellipse r0 × 0.7 r0 (r0 = 40 and 34) from H to H + 3.2, 1.4 thick, the higher
// one's open on the south (+z) where the stair arrives.
const MARBLE = mat('#f1ede4', 0.6);
const SHADE = mat('#d6cebd', 0.8);
const H = 44;

// A plinth and a cornice on every shrine, and its doorway in the face it turns to (+z, turned).
function shrines(f) {
  const list = f.userData.shrines || [], plinths = [], cornices = [], doors = [];
  for (const [x, , z, w, h, , ry] of list) {
    plinths.push([x, H + 0.38, z, w * 1.14, 0.4, w * 1.14, ry]);
    cornices.push([x, H + h - 0.32, z, w * 1.1, 0.26, w * 1.1, ry]);
    const o = w / 2 + 0.015;
    if (H + 0.78 + w * 0.42 < H + h - 0.4) doors.push([x + Math.sin(ry) * o, H + 0.78, z + Math.cos(ry) * o, w * 0.26, w * 0.42, 0.03, ry]);
  }
  f.add(inst(unitBox(), plinths, SHADE), inst(unitBox(), cornices, SHADE), inst(unitBox(), doors, M.recess));
}

// Merlons along the top of each tuk's wall and round bastions at intervals, leaving the gate.
function walls(f) {
  const merls = [], towers = [], caps = [], geo = merlonGeo(0.8, 1.0, 0.5);
  for (const [cx, r0, gate] of [[-40, 40, true], [45, 34, false]]) {
    const A = r0, B = r0 * 0.7, n = Math.round((Math.PI * 2 * Math.sqrt((A * A + B * B) / 2)) / 1.8);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      // The gate's opening, and the stretch either side of it that the gatehouse covers.
      if (gate && Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.22) continue;
      const nx = Math.cos(a) / A, nz = Math.sin(a) / B, ry = Math.atan2(nx, nz), x = cx + A * Math.cos(a), z = B * Math.sin(a);
      merls.push([x, H + 3.2, z, 1, 1, 1, ry]);
      if (k % 12 === 6) {
        const l = Math.hypot(nx, nz), tx = x + (nx / l) * 1.2, tz = z + (nz / l) * 1.2;
        towers.push([tx, H - 2, tz, 3.4, 5.8, 3.4]);
        caps.push([tx, H + 3.8, tz, 3.8, 0.4, 3.8]);
      }
    }
  }
  f.add(inst(geo, merls, SHADE), inst(unitCyl(detail.low ? 10 : 16), towers, SHADE), inst(unitCyl(detail.low ? 10 : 16), caps, MARBLE));
}

// The Jain temple city on Shatrunjaya hill at Palitana: scrub and trees on the lower slopes below
// the 3,800 steps to the summit, and none on the pilgrim stair (x -54 to -26, z 30 to 96, from
// js/monuments/palitana-temples.js).
export function addDetails(f, g) {
  shrines(f);
  walls(f);
  // Manastambhas: one in the court before Adinath's temple, one in the middle of the lower tuk.
  f.add(at(manastambha(12, MARBLE, { images: true }), -40, H + 0.4, 15), at(manastambha(10, MARBLE, { images: true }), 45, H + 0.4, 2));
  const ground = (x, z) => Math.max(0, shatrunjaya(x, z));
  const slope = scatter(80, [-160, 160, -100, 100], { seed: 5, gap: 9 }).map(([x, z]) => [x, z, ground(x, z)]).filter(([x, z, y]) => y > 1 && y < H - 6 && !(x > -56 && x < -24 && z > 26 && z < 100));
  g.add(trees(slope.map(([x, z, y]) => [x, z, null, y - 0.5]), { kind: 'dhok', seed: 6, h: 4 }));
}
