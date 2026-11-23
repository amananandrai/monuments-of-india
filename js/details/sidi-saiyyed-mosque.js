import * as THREE from 'three';
import { M, mat, mesh, box, at, archPanel, rise } from '../helpers.js';
import { archRing, archCurve, mergeByMaterial, frieze, rosette } from '../parts/components.js';
import { trees, shrubs, lampPosts, bollards, along, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';

// The mosque's honey-coloured sandstone, and the same stone in shade.
export const STONE = mat('#c9a874', 0.88);
export const SHADE = mat('#a88b5e', 0.9);
const MARBLE = mat('#e8e4da', 0.6);

// One of the mosque's ten jalis, filling a blunt-pointed lunette aw wide and ah to its crown: a
// slab of sandstone pierced right through, drawn on a canvas and cut out by its alpha. From
// photographs of the windows. kind:
// 'palm': a sinuous trunk rising to a crown of palm fronds under the point of the arch, its
//   boughs springing off alternately and curling into great coils that fill the lunette, the stone
//   between them pierced all over with small leaf-shaped holes;
// 'tree': the Tree of Life, a slender trunk forking into boughs that coil in spirals, mirrored
//   left and right, tier over tier;
// 'grid': small square panels in a frame of bars, each pierced with its own geometric pattern
//   (stars, lattices, circles, crosses, chequers), no two neighbours alike; `seed` shuffles them.
const jalis = new Map();
function jaliTexture(kind, aw, ah, seed) {
  const key = [detail.level, kind, aw.toFixed(2), ah.toFixed(2), seed].join();
  if (jalis.has(key)) return jalis.get(key);
  const W = detail.low ? 512 : 1024, Hc = Math.round(W * ah / aw), c = document.createElement('canvas');
  c.width = W; c.height = Hc;
  const t = c.getContext('2d'), k = W / aw, X = (x) => W / 2 + x * k, Y = (y) => Hc - y * k;
  const r = aw / 2, s = ah - rise(r, true), outline = () => {
    t.beginPath(); t.moveTo(X(-r), Y(0));
    for (const p of archCurve(r, s, true, 24)) t.lineTo(X(p.x), Y(p.y));
    t.lineTo(X(r), Y(0)); t.closePath();
  };
  let a = 11 + seed * 7919;
  const R = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  t.strokeStyle = t.fillStyle = '#ffffff'; t.lineCap = t.lineJoin = 'round';
  const line = (pts, w) => { t.lineWidth = w * k; t.beginPath(); pts.forEach(([x, y], i) => (i ? t.lineTo(X(x), Y(y)) : t.moveTo(X(x), Y(y)))); t.stroke(); };
  const punch = (fn) => { t.globalCompositeOperation = 'destination-out'; fn(); t.globalCompositeOperation = 'source-over'; };
  t.save(); outline(); t.clip();
  if (kind === 'grid') {
    // Square panels about 0.4 m across between bars, each with its own piercing.
    const n = Math.round(aw / 0.42), cw = aw / n, bar = 0.05, rowsN = Math.ceil(ah / cw);
    t.fillRect(0, 0, W, Hc);
    for (let j = 0; j < rowsN; j++) for (let i = 0; i < n; i++) {
      const x0 = -r + i * cw + bar / 2, y0 = j * cw + bar / 2, q = cw - bar, cx = x0 + q / 2, cy = y0 + q / 2;
      const pat = (i * 3 + j * 5 + seed + Math.floor(R() * 2)) % 6;
      punch(() => t.fillRect(X(x0), Y(y0 + q), q * k, q * k));
      t.save(); t.beginPath(); t.rect(X(x0), Y(y0 + q), q * k, q * k); t.clip();
      const w = 0.022;
      if (pat === 0) for (let u = -4; u <= 4; u++) { line([[cx + u * q / 4 - q, cy - q], [cx + u * q / 4 + q, cy + q]], w); line([[cx + u * q / 4 - q, cy + q], [cx + u * q / 4 + q, cy - q]], w); }
      else if (pat === 1) for (let u = 1; u < 5; u++) { line([[x0 + u * q / 5, y0], [x0 + u * q / 5, y0 + q]], w); line([[x0, y0 + u * q / 5], [x0 + q, y0 + u * q / 5]], w); }
      else if (pat === 2) {
        // An eight-pointed star in a ring, tied to the corners.
        const st = []; for (let u = 0; u <= 16; u++) { const an = u * Math.PI / 8, rr = u % 2 ? q * 0.2 : q * 0.42; st.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); }
        line(st, w); line([[x0, y0], [x0 + q, y0 + q]], w); line([[x0, y0 + q], [x0 + q, y0]], w);
      } else if (pat === 3) for (const [ox, oy] of [[0, 0], [-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0, -0.5], [0, 0.5], [-0.5, 0], [0.5, 0]]) {
        t.lineWidth = w * k; t.beginPath(); t.arc(X(cx + ox * q), Y(cy + oy * q), q * 0.25 * k, 0, Math.PI * 2); t.stroke();
      } else if (pat === 4) {
        // Hexagons in a honeycomb.
        const hr = q / 5;
        for (let v = -3; v <= 3; v++) for (let u = -3; u <= 3; u++) {
          const hx = cx + u * hr * 1.732 + (v % 2 ? hr * 0.866 : 0), hy = cy + v * hr * 1.5, hp = [];
          for (let e = 0; e <= 6; e++) hp.push([hx + Math.sin(e * Math.PI / 3) * hr, hy + Math.cos(e * Math.PI / 3) * hr]);
          line(hp, w * 0.9);
        }
      } else {
        // A square set diamond-wise in squares, with a cross.
        for (const rr of [0.48, 0.3, 0.12]) line([[cx - q * rr, cy], [cx, cy + q * rr], [cx + q * rr, cy], [cx, cy - q * rr], [cx - q * rr, cy]], w);
        line([[x0, cy], [x0 + q, cy]], w); line([[cx, y0], [cx, y0 + q]], w);
      }
      t.restore();
    }
  } else {
    // The slab, pierced all over with small leaf-shaped holes; the trunk and boughs are drawn
    // back over it solid, and each coil is ringed with its own piercing.
    t.fillRect(0, 0, W, Hc);
    const step = 0.085;
    punch(() => {
      for (let y = 0.06, j = 0; y < ah; y += step * 0.86, j++) for (let x = -r + (j % 2 ? step / 2 : 0); x < r; x += step) {
        t.beginPath(); t.ellipse(X(x + (R() - 0.5) * 0.03), Y(y + (R() - 0.5) * 0.03), 0.033 * k, 0.019 * k, R() * Math.PI, 0, Math.PI * 2); t.fill();
      }
    });
    // A bough from (x, y) on the trunk, sweeping out and winding into a coil of radius cr about
    // (cx, cy); dir is the way it winds.
    const coil = (x, y, cx, cy, cr, dir, w) => {
      const a0 = Math.atan2(y - cy, x - cx) + dir * 1.2, pts = [[x, y]], N = 70, turns = 1.9;
      for (let i = 0; i <= N; i++) { const u = i / N, an = a0 + dir * u * turns * Math.PI * 2, rr = cr * (1 - 0.88 * u); pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); }
      punch(() => { t.lineWidth = 0.05 * k; t.beginPath(); t.arc(X(cx), Y(cy), (cr + 0.06) * k, 0, Math.PI * 2); t.stroke(); });
      line(pts.slice(0, 30), w); line(pts.slice(29, 55), w * 0.75); line(pts.slice(54), w * 0.55);
      // Leaves off the coil.
      for (let i = 6; i < N; i += 5) { const [px, py] = pts[i], an = Math.atan2(py - cy, px - cx); line([[px, py], [px + Math.cos(an) * 0.07, py + Math.sin(an) * 0.07]], w * 0.6); }
    };
    if (kind === 'palm') {
      // The trunk leans one way and the other; its boughs spring off alternately.
      const trunk = (y) => 0.16 * Math.sin(y / ah * 5.2) - 0.04, top = ah * 0.76, tp = [];
      for (let y = 0; y <= top; y += 0.04) tp.push([trunk(y), y]);
      coil(trunk(0.5), 0.5, -0.62, 0.42, 0.34, 1, 0.07); coil(trunk(0.3), 0.3, 0.6, 0.38, 0.33, -1, 0.07);
      coil(trunk(0.9), 0.9, 0.78, 1.02, 0.42, 1, 0.07); coil(trunk(1.15), 1.15, -0.72, 1.18, 0.44, -1, 0.07);
      coil(trunk(0.45), 0.45, -1.28, 0.36, 0.27, -1, 0.055); coil(trunk(0.6), 0.6, 1.3, 0.34, 0.26, 1, 0.055);
      coil(trunk(1.5), 1.5, 0.5, 1.62, 0.26, -1, 0.05); coil(trunk(1.5), 1.5, -0.45, 1.72, 0.22, 1, 0.05);
      line(tp, 0.1);
      // The palm's crown: a fan of fronds, each drooping at its tip.
      const [hx, hy] = [trunk(top), top];
      punch(() => { t.beginPath(); t.arc(X(hx), Y(hy), 0.42 * k, 0, Math.PI * 2); t.fill(); });
      for (let q = 0; q < 15; q++) {
        const an = -0.35 + q * (Math.PI + 0.7) / 14, fl = 0.4, fr = [];
        for (let u = 0; u <= 1.001; u += 0.125) fr.push([hx + Math.cos(an) * fl * u, hy + Math.sin(an) * fl * u - 0.1 * u * u]);
        line(fr, 0.03);
      }
      t.beginPath(); t.arc(X(hx), Y(hy), 0.07 * k, 0, Math.PI * 2); t.fill();
    } else {
      // The trunk forks at a third of the height; the boughs coil in mirrored tiers.
      for (const m of [-1, 1]) {
        coil(m * 0.03, 0.35, m * 0.48, 0.4, 0.36, -m, 0.065); coil(m * 0.03, 0.55, m * 1.2, 0.36, 0.3, m, 0.055);
        coil(m * 0.03, 0.9, m * 0.44, 1.12, 0.33, m, 0.06); coil(m * 0.03, 0.8, m * 1.08, 0.98, 0.29, -m, 0.05);
        coil(0, 1.45, m * 0.3, 1.75, 0.24, -m, 0.045); coil(m * 0.03, 1.3, m * 0.78, 1.55, 0.22, m, 0.045);
      }
      line([[0, 0], [0, ah * 0.62]], 0.085);
      for (let q = -2; q <= 2; q++) line([[0, ah * 0.62], [q * 0.07, ah * 0.62 + 0.2 - Math.abs(q) * 0.03]], 0.03);
    }
  }
  t.restore();
  // The frame, following the arch.
  t.lineWidth = 0.14 * k; outline(); t.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  jalis.set(key, tex);
  return tex;
}
export function sidiJali(aw, ah, kind = 'tree', seed = 0) {
  const r = aw / 2, s = ah - rise(r, true), sh = new THREE.Shape();
  sh.moveTo(-r, 0);
  archCurve(r, s, true, 16).forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(r, 0); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh), uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / aw + 0.5, pos.getY(i) / ah);
  const o = mesh(geo, new THREE.MeshStandardMaterial({ color: '#c9a874', alphaMap: jaliTexture(kind, aw, ah, seed), alphaTest: 0.5, roughness: 0.85, side: THREE.DoubleSide }));
  o.userData.dressing = true;
  return o;
}

// The Sidi Saiyyed Mosque, finer detail and setting. From photographs. The west wall: a carved
// string course under the lunettes and another lower down, the walled-up middle lunette as a
// blind arch of coursed stone, the back of the mihrab standing out below it as a buttress with a
// stepped head, a pair of roundels over every pier and a carved frieze under the cornice. The
// front: moulded capitals on the piers at the springing. A small arched door in the north wall's
// dado, and beside it the marble tablet with the mosque's history. The mosque stands on a traffic
// island at Lal Darwaja: a paved court with the ablution tank before its open front, a strip of
// garden behind, the old city's busy roads all round it.
// Dimensions follow js/monuments/sidi-saiyyed-mosque.js: L long, D deep, H high on a plinth P.
function architecture(f, { L, D, H, P, WT, WIN, SIDE }) {
  const d = new THREE.Group(), [sill, aw, ah] = WIN, zw = D / 2, BAY = L / 5, F = frieze(SHADE);
  // The west wall.
  d.add(at(archPanel(aw, ah, true, SHADE, 0.05), 0, P + sill, zw - 0.02), at(archRing(aw, ah, true, 0.2, 0.09, SHADE), 0, P + sill, zw));
  d.add(box(L + 0.1, 0.22, 0.12, F, 0, P + sill - 0.36, zw), box(L + 0.1, 0.18, 0.1, F, 0, P + 1.5, zw), box(L + 0.16, 0.3, 0.14, SHADE, 0, P, zw));
  d.add(box(L + 0.08, 0.3, 0.07, F, 0, P + H - 0.5, zw));
  d.add(box(2.3, sill - 0.5, 0.55, STONE, 0, P, zw + 0.27), box(2.5, 0.16, 0.65, SHADE, 0, P + 1.5, zw + 0.3));
  for (let k = 0; k < 4; k++) d.add(box(1.9 - k * 0.42, 0.2, 0.5 - k * 0.09, k % 2 ? STONE : SHADE, 0, P + sill - 0.5 + k * 0.2, zw + 0.25 - k * 0.045));
  for (let k = 1; k < 5; k++) for (const s of [-1, 1]) {
    const x = -L / 2 + k * BAY + s * 0.36;
    d.add(at(rosette(0.17, SHADE, 8), x, P + sill + ah - 0.25, zw + 0.03), box(0.3, 0.14, 0.06, F, x, P + sill + 0.95, zw));
  }
  // The side walls: the same courses and frieze, and the small door in the north wall's dado
  // under its own arch, the marble tablet beside it.
  for (const s of [-1, 1]) d.add(box(0.12, 0.22, D - 3, F, s * L / 2, P + SIDE[0] - 0.36, 1.4), box(0.07, 0.3, D - 3, F, s * L / 2, P + H - 0.5, 1.4), box(0.14, 0.3, D - 3, SHADE, s * L / 2, P, 1.4));
  const door = new THREE.Group();
  door.add(at(archPanel(0.95, 2.0, true, M.recess, 0.04), 0, 0, 0), at(archRing(0.95, 2.0, true, 0.14, 0.07, SHADE), 0, 0, 0), box(1.0, 1.1, 0.04, MARBLE, 1.7, 0.9, 0), box(1.12, 1.22, 0.025, SHADE, 1.7, 0.84, 0));
  door.rotation.y = -Math.PI / 2;
  d.add(at(door, -L / 2 - 0.005, P, 3.2));
  // The front: capitals on the piers where the arches spring, and a band at their feet.
  for (let k = 0; k <= 5; k++) {
    const x = -L / 2 + k * BAY, w = k % 5 ? 1.24 : 0.75, xx = k === 0 ? x + 0.3 : k === 5 ? x - 0.3 : x;
    d.add(box(w, 0.28, 0.94, F, xx, P + 2.45, -D / 2 + 0.4), box(w + 0.08, 0.1, 1.0, SHADE, xx, P + 2.73, -D / 2 + 0.4), box(w + 0.12, 0.4, 1.0, SHADE, xx, P, -D / 2 + 0.4));
  }
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  const { D } = dims;
  g.add(box(400, 0.2, 400, M.asphalt, 0, -0.2, 0));
  // The compound inside a low wall: a strip of garden behind the west wall, and before the open
  // front the paved court with its ablution tank.
  const GW = 46, GD = 40;
  g.add(box(GW, 0.35, GD, M.grass, 0, 0, 0), box(GW + 1, 0.8, 0.5, SHADE, 0, 0, GD / 2), box(GW + 1, 0.8, 0.5, SHADE, 0, 0, -GD / 2));
  for (const s of [-1, 1]) g.add(box(0.5, 0.8, GD, SHADE, s * (GW / 2 + 0.25), 0, 0));
  g.add(box(3, 0.4, GD / 2 - 8, M.path, 0, 0, GD / 4 + 4));
  g.add(box(GW - 6, 0.39, GD / 2 - D / 2 - 1, M.path, 0, 0, -(GD / 2 + D / 2 - 1) / 2 - 0.5));
  g.add(box(9, 0.75, 6, SHADE, 0, 0, -14), box(8.2, 0.05, 5.2, M.water, 0, 0.72, -14));
  g.add(trees([[-18, 14], [18, 14], [-19, -17], [19, -17]], { kind: 'palm', seed: 2 }), trees([[-20, 0], [20, 0], [9, -11]], { kind: 'neem', seed: 4 }));
  g.add(shrubs(along(10, [-20, 17], [20, 17]).filter(([x]) => Math.abs(x) > 3), { seed: 3, flowers: '#d63c6a', y: 0.35 }));
  g.add(lampPosts([[-23, 20], [23, 20], [-23, -20], [23, -20]]));
  g.add(bollards(along(14, [-24, 22.5], [24, 22.5])));
  // The roads round the island, and the old city beyond.
  g.add(traffic([[27, 1], [31, -1]], -120, 120, { y: 0.02, gap: 14, seed: 6, taxis: 0.25, buses: 0.12 }));
  g.add(traffic([[-27, -1], [-31, 1]], -120, 120, { y: 0.02, gap: 16, seed: 9, taxis: 0.25, buses: 0.1 }));
  g.add(cityAround([-40, 40, -40, 40], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, gap: 4, seed: 23, fine: !detail.low }));
}
