import * as THREE from 'three';
import { M, mat, mesh, box, at, rise, archPanel } from '../helpers.js';
import { archCurve, archRing, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, bollards, along, scatter, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';

// The mosque's honey-coloured sandstone, and the same stone in shade.
export const STONE = mat('#c9a874', 0.88);
export const SHADE = mat('#a88b5e', 0.9);

// A stone lattice filling a pointed arch aw wide and ah to its crown, as one flat mesh: the pattern
// is drawn on a canvas and cut out by its alpha. kind: 'tree', the Tree of Life: a trunk rising from
// a mound, its branches curling outward and ending in palm fronds and flowers, a creeper twined round
// it; 'branches', the tangle of intertwined boughs of its pair; 'lattice', a geometric grid of
// stars. A frame runs round each.
const jalis = new Map();
function jaliTexture(kind, aw, ah) {
  const key = kind + aw.toFixed(2) + ah.toFixed(2);
  if (jalis.has(key)) return jalis.get(key);
  const W = detail.low ? 256 : 512, Hc = Math.round(W * ah / aw), c = document.createElement('canvas');
  c.width = W; c.height = Hc;
  const t = c.getContext('2d'), k = W / aw, X = (x) => W / 2 + x * k, Y = (y) => Hc - y * k;
  t.strokeStyle = t.fillStyle = '#ffffff'; t.lineCap = 'round';
  // The frame, following the arch.
  const r = aw / 2, s = ah - rise(r, true), outline = () => {
    t.beginPath(); t.moveTo(X(-r), Y(0));
    for (const p of archCurve(r, s, true, 24)) t.lineTo(X(p.x), Y(p.y));
    t.lineTo(X(r), Y(0)); t.closePath();
  };
  t.lineWidth = 0.22 * k; outline(); t.stroke();
  t.save(); outline(); t.clip();
  const R = (() => { let a = 7; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
  const branch = (x, y, ang, len, w, depth) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, bend = (R() - 0.5) * 0.8;
    t.lineWidth = w * k; t.beginPath(); t.moveTo(X(x), Y(y));
    t.quadraticCurveTo(X(x + Math.cos(ang + bend) * len * 0.6), Y(y + Math.sin(ang + bend) * len * 0.6), X(ex), Y(ey)); t.stroke();
    if (depth <= 0) {
      // A palm frond: a fan of leaves curling from the tip.
      for (let q = -3; q <= 3; q++) {
        const a2 = ang + q * 0.32; t.lineWidth = 0.035 * k; t.beginPath(); t.moveTo(X(ex), Y(ey));
        t.quadraticCurveTo(X(ex + Math.cos(a2) * 0.3), Y(ey + Math.sin(a2) * 0.3), X(ex + Math.cos(a2 - 0.4) * 0.45), Y(ey + Math.sin(a2 - 0.4) * 0.45)); t.stroke();
      }
      return;
    }
    for (const side of [-1, 1]) branch(ex, ey, ang + side * (0.45 + R() * 0.35), len * 0.72, w * 0.72, depth - 1);
  };
  if (kind === 'tree') {
    // The mound, the trunk, a creeper round it, and the branches.
    t.beginPath(); t.ellipse(X(0), Y(0.1), 0.6 * k, 0.28 * k, 0, 0, Math.PI * 2); t.fill();
    t.lineWidth = 0.16 * k; t.beginPath(); t.moveTo(X(0), Y(0.2)); t.lineTo(X(0), Y(ah * 0.45)); t.stroke();
    t.lineWidth = 0.05 * k; t.beginPath();
    for (let y = 0.2; y < ah * 0.45; y += 0.05) t.lineTo(X(Math.sin(y * 9) * 0.14), Y(y));
    t.stroke();
    for (const side of [-1, 1]) {
      branch(0, ah * 0.25, Math.PI / 2 + side * 1.15, aw * 0.3, 0.1, 3);
      branch(0, ah * 0.45, Math.PI / 2 + side * 0.55, aw * 0.26, 0.09, 3);
    }
    branch(0, ah * 0.45, Math.PI / 2, ah * 0.22, 0.09, 2);
  } else if (kind === 'branches') {
    for (let n = 0; n < 7; n++) branch(-r + R() * aw, 0.1, Math.PI / 2 + (R() - 0.5) * 1.4, ah * 0.32, 0.08, 3);
  } else {
    // Six-pointed stars on a grid, linked by bars.
    t.lineWidth = 0.05 * k;
    for (let y = 0.15; y < ah; y += 0.32) for (let x = -r + 0.16; x < r; x += 0.32) {
      t.beginPath();
      for (let q = 0; q < 12; q++) { const a = q * Math.PI / 6, rr = q % 2 ? 0.07 : 0.15; t.lineTo(X(x + Math.cos(a) * rr), Y(y + Math.sin(a) * rr)); }
      t.closePath(); t.stroke();
    }
  }
  t.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  jalis.set(key, tex);
  return tex;
}
export function treeJali(aw, ah, kind) {
  const r = aw / 2, s = ah - rise(r, true), sh = new THREE.Shape();
  sh.moveTo(-r, 0);
  archCurve(r, s, true, 16).forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(r, 0); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh), uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / aw + 0.5, pos.getY(i) / ah);
  const tex = jaliTexture(kind, aw, ah);
  const m = new THREE.MeshStandardMaterial({ color: '#c9a874', alphaMap: tex, alphaTest: 0.5, roughness: 0.85, side: THREE.DoubleSide });
  const o = mesh(geo, m);
  o.userData.dressing = true;
  return o;
}

// The Sidi Saiyyed Mosque, finer detail and setting. From photographs: the walled-up middle bay of
// the west wall shows a blind arch; moulded rings frame its windows. The mosque stands in a small
// walled garden on a traffic island at Lal Darwaja, the old city's busy roads all round it.
// Dimensions follow js/monuments/sidi-saiyyed-mosque.js: L long, D deep, H high on a plinth P.
function architecture(f, { L, D, P }) {
  const d = new THREE.Group();
  d.add(at(archPanel(2.6, 5.4, true, SHADE, 0.08), 0, P + 2.4, D / 2), at(archRing(2.6, 5.4, true, 0.18, 0.1, SHADE), 0, P + 2.4, D / 2 + 0.02));
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(400, 0.2, 400, M.asphalt, 0, -0.2, 0));
  // The garden: a lawn inside a low wall with railings, paths to the mosque, palms and neem.
  const GW = 46, GD = 40;
  g.add(box(GW, 0.35, GD, M.grass, 0, 0, 0), box(GW + 1, 0.8, 0.5, SHADE, 0, 0, GD / 2), box(GW + 1, 0.8, 0.5, SHADE, 0, 0, -GD / 2));
  for (const s of [-1, 1]) g.add(box(0.5, 0.8, GD, SHADE, s * (GW / 2 + 0.25), 0, 0));
  g.add(box(3, 0.4, GD / 2 - 8, M.path, 0, 0, GD / 4 + 4));
  g.add(trees([[-18, 14], [18, 14], [-18, -14], [18, -14]], { kind: 'palm', seed: 2 }), trees([[-20, 0], [20, 0]], { kind: 'neem', seed: 4 }));
  g.add(shrubs(along(10, [-20, 17], [20, 17]).filter(([x]) => Math.abs(x) > 3), { seed: 3, flowers: '#d63c6a', y: 0.35 }));
  g.add(lampPosts([[-23, 20], [23, 20], [-23, -20], [23, -20]]));
  g.add(bollards(along(14, [-24, 22.5], [24, 22.5])));
  // The roads round the island, and the old city beyond.
  g.add(traffic([[27, 1], [31, -1]], -120, 120, { y: 0.02, gap: 14, seed: 6, taxis: 0.25, buses: 0.12 }));
  g.add(traffic([[-27, -1], [-31, 1]], -120, 120, { y: 0.02, gap: 16, seed: 9, taxis: 0.25, buses: 0.1 }));
  g.add(cityAround([-40, 40, -40, 40], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, gap: 4, seed: 23, fine: !detail.low }));
}
