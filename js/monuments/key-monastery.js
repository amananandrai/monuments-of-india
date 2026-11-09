import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, hipRoof, TIBETAN, inst, unitBox } from '../helpers.js';
import { tibetanDoor } from '../details/doorways.js';
import { addDetails } from '../details/key-monastery.js';

const SCREE = mat('#9d8b78', 0.95, 0, { flatShading: true });

const VALLEY = mat('#ffffff', 0.95, 0, { flatShading: true, vertexColors: true });
// The valley's walls as one heightfield 2400 m square: flat (and hidden under the ground) within
// about 330 m of the valley's axis, which runs north–south along x = -80, then rising steeply to
// ridges 300-450 m high, with gullies down the slopes; rock in bands of brown and grey, snow above
// 285 m.
function valleyGeo() {
  const geo = new THREE.PlaneGeometry(2400, 2400, 220, 220).rotateX(-Math.PI / 2), p = geo.attributes.position, col = [];
  const c = new THREE.Color(), bands = ['#8c7a66', '#9a8670', '#7f7366', '#a28f78', '#857262'].map((h) => new THREE.Color(h)), snow = new THREE.Color('#f2f4f6');
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k), z = p.getZ(k), d = Math.max(Math.abs(x + 80), Math.abs(z) * 0.7 - 260);
    const t = Math.min(1, Math.max(0, (d - 330) / 320)), ramp = t * t * (3 - 2 * t);
    const ridge = 300 + 110 * Math.sin(z * 0.006 + x * 0.002) + 45 * Math.sin(z * 0.019 + 1.3) + 25 * Math.sin(x * 0.03 + z * 0.011);
    const gully = 1 - 0.22 * Math.pow(Math.abs(Math.sin((z + x * 0.3) * 0.045)), 6);
    const y = ramp * ridge * gully - 3;
    p.setY(k, y);
    if (y > 285 + 20 * Math.sin(x * 0.05)) c.copy(snow);
    else c.copy(bands[Math.floor((y + 40) / 26) % bands.length]);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

// The hill's height and radius at its foot.
export const HILL_H = 60, HILL_R = 56;

// A cluster of whitewashed buildings stacked round a conical hill in the Spiti valley.
export function buildKeyMonastery() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(67);
  g.add(f);
  // The Spiti valley: a broad floor of gravel with the river braided across it, between bare
  // mountain walls that rise steeply in bands of rock, scored by gullies and scree fans, to snow.
  g.add(box(760, 0.2, 1800, mat('#a89377', 0.95), -80, 0, 0), box(130, 0.3, 1800, mat('#9c958a', 0.95), -150, 0, 0));
  for (const [x, w] of [[-182, 9], [-150, 14], [-118, 7]]) g.add(box(w, 0.4, 1800, M.river, x, 0, 0));
  g.add(mesh(valleyGeo(), VALLEY));
  // A steep conical hill of scree, and the monastery heaped up over its upper half: blocks of every
  // size crowded at irregular levels, thickest on the south face (+z) above the road, thinning
  // round the back, each standing on the slope at its outer, lowest edge and tall enough to reach
  // the slope at its inner edge.
  const H = HILL_H, RH = HILL_R;
  f.add(mesh(new THREE.ConeGeometry(RH, H, 12).translate(0, H / 2, 0), SCREE));
  const slopeY = (r) => H * (1 - r / RH), blocks = [];
  for (let k = 0; k < 150; k++) {
    const a = R() * Math.PI * 2, south = 0.5 + 0.5 * Math.sin(a);
    if (R() > 0.35 + 0.65 * south) continue;
    const y0 = H * (0.42 + R() * 0.5), d = 4 + R() * 4, w = 4 + R() * 6 + (R() < 0.15 ? 8 : 0);
    const r = RH * (1 - y0 / H) + d / 2;
    if (r < 6 || (Math.abs(a - Math.PI / 2) < 0.18 && y0 > H * 0.7)) continue; // the summit hall, and the way up to its door
    const base = slopeY(r + d / 2) - 0.4, h = 3.5 + R() * 4 + (slopeY(r - d / 2) - base);
    blocks.push([Math.cos(a) * r, base, Math.sin(a) * r, w, h, d, -a + Math.PI / 2 + (R() - 0.5) * 0.4]);
  }
  f.add(inst(unitBox(), blocks, TIBETAN.white), inst(unitBox(), blocks.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.3, 0.6, d + 0.3, ry]), TIBETAN.maroon));
  f.add(at(tibetanDoor(1.4, 2.4), 0, H - 4, 5));
  f.add(box(10, 6, 10, TIBETAN.white, 0, H - 4, 0), box(10.3, 0.7, 10.3, TIBETAN.maroon, 0, H + 2, 0), at(hipRoof(11, 11, 3, M.gild), 0, H + 2.7, 0), cyl(0.3, 0.7, 2, M.gild, 0, H + 5.6, 0, 8));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.32, 1.25] };
}
