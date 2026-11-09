import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, inst, unitBox, sheet } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { addDetails } from '../details/omkareshwar-temple.js';
import { townHouses } from '../details/realism.js';
import { detail } from '../detail.js';

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
export function islandHeight(x, z) {
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
  // The town on the slope behind the ghat: terraces of houses facing the river, each set down at
  // the lowest corner of its plot with its back dug into the hill; none where the hill is a cliff.
  // On phones (js/detail.js) every other house, so the island stays within its budget.
  const houses = [], tiledH = [];
  for (let zr = -43, j = 0; zr > -96; zr -= 8.5, j++) {
    for (let x = -78 + (j % 2) * 4; x < 78;) {
      const w = 5.5 + R() * 3.5, d = 6 + R() * 2.5, cx = x + w / 2, hs = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([a, b]) => islandHeight(cx + a, zr + b));
      const lo = Math.min(...hs), hi = Math.max(...hs), keep = !detail.low || (houses.length + tiledH.length) % 2 === 0;
      // On a slope the house gets storeys enough to stand clear of the ground on its uphill side.
      const n = Math.max(1 + Math.floor(R() * 3), Math.ceil((hi - lo) / 3.2) + 1);
      if (lo > 6 && hi - lo < 9 && keep) (R() < 0.35 ? tiledH : houses).push([cx, zr, w, d, n, (R() - 0.5) * 0.3, lo - 0.3]);
      x += w + 0.5 + (R() < 0.2 ? 3 : 0);
    }
  }
  const OPAINT = ['#f1ece0', '#e8c9a8', '#cfe0e3', '#f0d9b5', '#e7b9b0', '#d9e3c4', '#efe6d6'];
  g.add(townHouses(houses, { seed: 41, paint: OPAINT }), townHouses(tiledH, { seed: 42, paint: OPAINT, roof: 'pitched', roofs: ['#9a4a32', '#a85a3a', '#8a4030'] }));
  // On the ghat, a cluster of white spires of different heights: the jyotirlinga's temple, full
  // size with its hall, and smaller shrines round it, each a cell under its own shikhara.
  f.add(at(nagaraTemple({ w: 11, h: 20, m: WHITE, shade: SHADE, plinth: 2, urus: 4, halls: [[13, 7, 4]] }), 0, 8, -18));
  for (const [x, z, w, h] of [[-17, -24, 6, 13], [16, -27, 5, 10], [-29, -15, 4.5, 8.5], [28, -13, 5.5, 12], [-39, -27, 4, 7], [39, -29, 4, 8], [-9, -33, 4, 7.5]]) {
    f.add(at(nagaraTemple({ w, h, m: WHITE, shade: SHADE, plinth: 0.8, urus: w >= 5 ? 4 : 0, halls: [], apron: 2, base: null, stair: null }), x, 8, z));
  }
  // Across the river on the south bank, the smaller Mamleshwar temple, facing the island.
  g.add(at(nagaraTemple({ w: 7, h: 12, m: WHITE, shade: SHADE, plinth: 1.2, urus: 0, halls: [[8, 5, 3]], apron: 4, base: { tiers: 1 } }), -36, 1.2, 182).rotateY(Math.PI));
  // The town on the south bank round it: rows of houses facing the river and the lanes behind,
  // clear of Mamleshwar's court and the footbridge's landing. On phones, every other house.
  const bank = [], bankTiled = [];
  for (const [zr, ry] of [[166, Math.PI], [181, 0], [196, Math.PI], [210, 0]]) {
    for (let x = -150; x < 150;) {
      const w = 6 + R() * 4, cx = x + w / 2, clear = !(cx > -54 && cx < -18 && zr < 200) && !(cx > -80 && cx < -60), keep = !detail.low || (bank.length + bankTiled.length) % 2 === 0;
      if (clear && keep) (R() < 0.3 ? bankTiled : bank).push([cx, zr, w, 10, 2 + Math.floor(R() * 3), ry + (R() - 0.5) * 0.1, 1.2]);
      x += w + 0.4 + (R() < 0.12 ? 4 : 0);
    }
  }
  g.add(townHouses(bank, { seed: 43, paint: OPAINT }), townHouses(bankTiled, { seed: 44, paint: OPAINT, roof: 'pitched', roofs: ['#9a4a32', '#a85a3a', '#8a4030'] }));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}
