import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, inst, unitBox, sheet } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { addDetails } from '../details/omkareshwar-temple.js';
import { townHouses } from '../details/realism.js';

const WHITE = mat('#efe9de', 0.85);
const SHADE = mat('#cdbfa6', 0.9);
const HILL = mat('#6b7f4c', 0.95, 0, { flatShading: true });

// Mandhata island, which seen from above has the shape of the sacred syllable Om (ॐ): its hills
// follow the strokes of the letter, the two lobes of its body and the tail sweeping round to the
// right, with the crescent and dot beyond, and a low shelf along the south shore carries the ghats
// and the town. Strokes are polylines in plan [x, z] (north is -z), each with a height and width.
const STROKES = [
  [[[-62, -168], [-30, -178], [-6, -160], [-18, -138], [-42, -126]], 30, 22],
  [[[-42, -126], [-8, -116], [12, -94], [0, -66], [-30, -54], [-62, -60]], 34, 24],
  [[[-38, -124], [8, -136], [46, -126], [70, -98], [74, -64], [58, -40]], 26, 20],
  [[[-6, -206], [24, -214], [56, -206]], 16, 12],
  [[[26, -236], [27, -235]], 14, 11],
  [[[-95, -20], [-40, -24], [40, -24], [70, -20]], 7, 22],
  [[[-80, 6], [-66, 18]], 6, 16],
];
const segDist = (x, z, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - t * dx, z - az - t * dz); };
function islandHeight(x, z) {
  let h = -3;
  for (const [pts, H, w] of STROKES) {
    let d = Infinity;
    for (let k = 1; k < pts.length; k++) d = Math.min(d, segDist(x, z, pts[k - 1], pts[k]));
    if (d < w) h = Math.max(h, H * Math.pow(1 - (d / w) ** 2, 0.6) - 1.5);
  }
  return h + (h > 0 ? 1.4 * Math.sin(x * 0.21) * Math.cos(z * 0.17) : 0);
}
function islandGeo() {
  const geo = new THREE.PlaneGeometry(260, 300, 130, 150).rotateX(-Math.PI / 2).translate(-5, 0, -105), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, islandHeight(p.getX(k), p.getZ(k)));
  geo.computeVertexNormals();
  return geo;
}

export function buildOmkareshwar() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(41);
  g.add(f);
  // The Narmada, with Mandhata island rising from it
  g.add(sheet(700, 500, M.river, 0, 0.3, 0));
  g.add(mesh(islandGeo(), HILL));
  // Ghats stepping down to the water, with the town on the slope above
  for (let k = 0; k < 8; k++) f.add(box(80, 1 + k * 0.9, 2.4, SHADE, 0, 0, 22 - k * 2.4));
  f.add(box(90, 8, 50, SHADE, 0, 0, -12));
  const houses = [];
  for (let i = 0; i < 40; i++) {
    const x = (R() - 0.5) * 120, z = -40 - R() * 40, y = islandHeight(x, z);
    if (y > 6) houses.push([x, z, 5 + R() * 4, 5 + R() * 3, 1 + Math.floor(R() * 3), R() * 6.28, y - 1.2]);
  }
  g.add(townHouses(houses, { seed: 41 }));
  f.add(at(nagaraTemple({ w: 11, h: 20, m: WHITE, shade: SHADE, plinth: 2, urus: 4, halls: [[13, 7, 4]] }), 0, 8, -18));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}
