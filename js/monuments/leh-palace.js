import * as THREE from 'three';
import { mat, mesh, box, photo, surface } from '../helpers.js';
import { heightField, mountainRing, fbm, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/leh-palace.js';

// Mud plaster over sun-dried brick, on a foot of rubble stone; the dark line of the parapets.
export const MUD = mat('#b9996f', 0.95), STONE = photo(mat('#9f8767', 0.95), 'rubble'), PARAPET = surface(mat('#6a4a36', 0.9), 'none'), ROOF = surface(mat('#c2ab86', 0.95), 'ground');

// The ridge of Namgyal Tsemo, as a spine of points [x, z, height]: it climbs from the edge of the
// town in the west, past the spur the palace stands on, to the peak with the Tsemo fort and
// monastery in the north-east, and falls away behind. North is -z; the palace faces south (+z).
const SPINE = [[-250, 46, 4], [-130, 24, 22], [0, -8, 41], [95, -85, 88], [190, -150, 150], [300, -235, 118], [430, -330, 60]];
export const PEAK = { x: 190, z: -150, y: 146 }, PAD = 38;
// The height of the ground at (x, z): the ridge, falling away on both sides of its spine; a
// levelled shelf of rock under the palace and a smaller one on the peak; the valley floor at 0.
export function ground(x, z) {
  let y = 0;
  for (let k = 0; k < SPINE.length - 1; k++) {
    const [ax, az, ah] = SPINE[k], [bx, bz, bh] = SPINE[k + 1], dx = bx - ax, dz = bz - az;
    const t = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const h = ah + (bh - ah) * t, w = 38 + h * 0.8, dist = Math.hypot(x - ax - dx * t, z - az - dz * t);
    y = Math.max(y, h * Math.pow(Math.max(0, 1 - dist / w), 1.12));
  }
  // Ribs of rock and gullies of scree down the slopes.
  const up = smooth(1, 12, y);
  y += up * (2.2 * fbm(x, z, { scale: 0.035, octaves: 3 }) + 1.6 * Math.pow(Math.abs(Math.sin(x * 0.09 + z * 0.05 + 2 * fbm(x, z, { scale: 0.02, octaves: 2 }))), 3));
  const edge = 3 * fbm(x, z, { scale: 0.06, octaves: 3 }), pad = (1 - smooth(43, 52 + edge, Math.abs(x + 1))) * (1 - smooth(19.5, 29 + edge, Math.abs(z + 1)));
  // The shelf is level under the walls and breaks up into ledges of rock round them.
  y += (PAD - y) * pad - 2.5 * pad * (1 - pad) * (1 + Math.sin(x * 0.5 + z * 0.3));
  const top = 1 - smooth(13, 24, Math.hypot(x - PEAK.x, z - PEAK.z));
  return y + (PEAK.y - y) * top;
}

// A block with battered walls: w × d at its foot, every wall leaning in by `lean` for each metre
// it rises, standing on y = 0.
export const LEAN = 0.075;
export function batterGeo(w, d, h, lean = LEAN) {
  const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) if (p.getY(k) > h / 2) p.setXYZ(k, p.getX(k) - Math.sign(p.getX(k)) * lean * h, h, p.getZ(k) - Math.sign(p.getZ(k)) * lean * h);
  geo.computeVertexNormals();
  return geo;
}

// The palace's masses, [x, z, w, d, y0, y1] each (centre, size at the foot, foot and top): nine
// storeys of about 3 m from the rock shelf (PAD) to the roof of the top block. The great lower
// block of five storeys; the royal apartments stepping back above it, two storeys and two more;
// the central bay that stands forward of the south front and a storey above it, with the great
// balconies; the lower west wing, and the east wing with the entrance.
export const BLOCKS = [
  [0, -1, 56, 36, 30, 53],
  [3, -3, 44, 29, 53, 59],
  [6, -5, 28, 21, 59, 65],
  [4, 15.5, 13, 8, 30, 56],
  [-35, 5, 20, 24, 30, 47],
  [35, -3, 17, 22, 30, 50],
  [7, -7, 9, 7, 65, 68],
];

export function buildLehPalace() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The valley floor, and the bare ranges of Ladakh round it, snow on the crests.
  g.add(box(4400, 0.2, 4400, mat('#ad9a78', 0.95), 0, -0.2, 0));
  g.add(mountainRing({ size: 4400, inner: 1150, outer: 1750, h: 400, vary: 130, snow: 330, rock: ['#8e8172', '#9d8b78', '#857565'], cover: '#a89377', steep: 0.82 }));
  g.add(heightField(1000, 800, detail.low ? 110 : 190, ground, { cx: 60, cz: -90, rock: ['#9c8463', '#8b7355', '#a58d6b', '#806a4e'], cover: '#b29c79', steep: 0.9, band: 6 }));
  for (const [x, z, w, d, y0, y1] of BLOCKS) {
    const h = y1 - y0, wt = w - 2 * LEAN * h, dt = d - 2 * LEAN * h;
    f.add(mesh(batterGeo(w, d, h), MUD, x, y0, z));
    // The foot of the walls in bare rubble, the parapet's dark line, and the roof of beaten earth.
    if (y0 < PAD) f.add(mesh(batterGeo(w + 0.16, d + 0.16, PAD + 3.4 - y0), STONE, x, y0, z));
    f.add(box(wt + 0.3, 0.4, dt + 0.3, PARAPET, x, y1 - 0.02, z), box(wt - 0.5, 0.1, dt - 0.5, ROOF, x, y1 + 0.3, z));
  }
  addDetails(f, g);
  // From the old town below, to the south-west: the south front rising nine storeys from its
  // rock, the Tsemo on the peak behind.
  return { group: g, focus: f, view: [-0.42, 0.09, 1], zoom: 0.9, fog: 16 };
}
