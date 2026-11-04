import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, sheet } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { addDetails } from '../details/fort-aguada.js';

const LATERITE = mat('#9b5b3f', 0.95);
const LATERITE_DARK = mat('#7d4530', 0.95);
const WHITE = mat('#eeeae2', 0.8);

export function buildFortAguada() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The headland at the mouth of the Mandovi, with the Arabian Sea beyond
  g.add(sheet(1200, 1200, M.sea, 0, 0.3, 0));
  // The headland: a laterite plateau 24 m high at the tip of the Bardez shore, falling in red cliffs
  // to the sea on the west and south and to the Mandovi on the north; to the east it joins the
  // mainland by a wooded neck.
  const H = 24;
  g.add(heightField(900, 640, 220, (x, z) => {
    const lobe = Math.hypot(x / 128, z / 90);
    const w = 78 + Math.max(0, x - 60) * 0.55, neck = x > 20 ? Math.hypot(Math.max(0, 20 - x) / 40, (z + 8) / w) : 9;
    const e = Math.min(lobe, neck) + rough(x, z, 0.04, 1.2);
    const land = smooth(1.12, 0.92, e), hills = x > 160 ? 10 * smooth(160, 300, x) * (0.6 + 0.4 * Math.sin(z * 0.02 + x * 0.01)) : 0;
    return land * (H + rough(x, z, 1, 0.8) + hills) - 6 * (1 - land);
  }, { rock: ['#9b5b3f', '#8a4f37'], cover: '#6c7d48', steep: 0.72, band: 6, cx: 160 }));
  // Low, thick laterite walls with angled bastions
  const pts = [[-50, -34], [40, -40], [60, -4], [44, 34], [-30, 40], [-60, 6]], wall = [];
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    // The front wall (i = 3) is split round the gate at its middle.
    const parts = i === 3 ? [[0, 0.5 - 6 / len], [0.5 + 6 / len, 1]] : [[0, 1]];
    for (const [t0, t1] of parts) {
      const tm = (t0 + t1) / 2;
      wall.push([x0 + (x1 - x0) * tm, H, z0 + (z1 - z0) * tm, len * (t1 - t0), 7, 5, ry]);
    }
    if (i === 3) f.add(at(fortGate(12, 9, 7, 4, 6.5, { m: LATERITE, trim: LATERITE_DARK, pointed: false, crest: false }), (x0 + x1) / 2, H, (z0 + z1) / 2).rotateY(ry + Math.PI));
    f.add(box(10, 8, 10, LATERITE_DARK, x0, H, z0).rotateY(Math.PI / 4));
  });
  f.add(inst(unitBox(), wall, LATERITE));
  f.add(box(40, 0.6, 30, LATERITE_DARK, -4, H, 0), box(26, 3, 18, LATERITE, -4, H, 0));
  // The four-storey lighthouse of 1864
  f.add(cyl(3.2, 4, 14, WHITE, 18, H, 10, 20), cyl(4.6, 4.6, 0.6, LATERITE_DARK, 18, H + 14, 10, 20), cyl(2.4, 2.4, 3, mat('#9fc6d8', 0.2, 0.2), 18, H + 14.6, 10, 16), cyl(0, 2.8, 2, mat('#c3463a', 0.7), 18, H + 17.6, 10, 16));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.35, 1.2] };
}
