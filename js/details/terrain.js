import * as THREE from 'three';
import { mat, mesh, surface } from '../helpers.js';

// Terrain as one heightfield mesh, coloured by height and slope: the shared part for hills,
// ridges, cliffs and mountain ranges, in place of cones and domes.
//
// heightField(w, d, n, fn, opts): a grid w × d (centred on cx, cz) with n cells along its longer
// side, each vertex raised to fn(x, z). Faces are coloured per vertex: where the ground is steep
// (its normal's y below `steep`) the rock colours, in bands by height; where it is gentle, the
// `cover` colour (grass, forest, sand); above `snow` (a height), snow. Flat shaded, so rock reads
// as facets.

// Plain material: the colour comes from the vertices, not from a photo texture.
const TERRAIN = surface(mat('#ffffff', 0.95, 0, { flatShading: true, vertexColors: true }), 'none');

export function heightField(w, d, n, fn, {
  cx = 0, cz = 0, rock = ['#8c7a66', '#9a8670', '#7f7366'], band = 18, cover = '#5b7a43', steep = 0.8,
  snow = Infinity, snowColor = '#f2f4f6', material = TERRAIN,
} = {}) {
  const nx = w >= d ? n : Math.max(2, Math.round((n * w) / d)), nz = w >= d ? Math.max(2, Math.round((n * d) / w)) : n;
  const geo = new THREE.PlaneGeometry(w, d, nx, nz).rotateX(-Math.PI / 2).translate(cx, 0, cz), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, fn(p.getX(k), p.getZ(k)));
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal, col = [], c = new THREE.Color();
  const rocks = rock.map((h) => new THREE.Color(h)), cov = new THREE.Color(cover), sn = new THREE.Color(snowColor);
  for (let k = 0; k < p.count; k++) {
    const y = p.getY(k), x = p.getX(k);
    if (y > snow + 12 * Math.sin(x * 0.05)) c.copy(sn);
    else if (nrm.getY(k) < steep) c.copy(rocks[((Math.floor(y / band) % rocks.length) + rocks.length) % rocks.length]);
    else c.copy(cov);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const o = mesh(geo, material);
  o.receiveShadow = true;
  return o;
}

// A little roughness to break up a smooth surface: a sum of sines, about ±1 at amp 1.
export function rough(x, z, amp = 1, s = 1) {
  return amp * (0.5 * Math.sin(x * 0.11 * s + z * 0.07 * s) + 0.3 * Math.sin(x * 0.23 * s - z * 0.19 * s + 1.7) + 0.2 * Math.sin(z * 0.41 * s + x * 0.05 * s + 0.4));
}

// A smooth step from 0 at a to 1 at b.
export function smooth(a, b, t) { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); }

// A ring of mountains round a valley: the ground is flat (and below 0) within `inner` of the
// centre, rises steeply to ridges between `inner` and `outer`, and stays high beyond. The ridges
// rise to `h` give or take `vary`, with peaks and gullies. aspect stretches the ring along z.
export function mountainRing({ inner = 400, outer = 700, h = 260, vary = 90, size = 2600, n = 120, aspect = 1, cx = 0, cz = 0, ...opts } = {}) {
  return heightField(size, size, n, (x, z) => {
    const dx = x - cx, dz = (z - cz) / aspect, r = Math.hypot(dx, dz), a = Math.atan2(dz, dx);
    const t = smooth(inner, outer, r);
    const ridge = h + vary * (0.6 * Math.sin(a * 5 + 1.3) + 0.4 * Math.sin(a * 11 + 0.2)) + rough(x, z, 22, 0.4);
    const gully = 1 - 0.18 * Math.pow(Math.abs(Math.sin(a * 23 + r * 0.01)), 5);
    return t * ridge * gully - 3;
  }, { cx, cz, ...opts });
}
