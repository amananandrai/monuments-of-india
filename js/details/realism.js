import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mesh, box, cyl, surface, rng, nightState } from '../helpers.js';
import { detail } from '../detail.js';

// The setting round a monument, shared by every file in js/details: trees and shrubs, heritage
// lamp posts, benches, the blue board of the Archaeological Survey of India, marigold garlands,
// prayer flags, boats, bollards with chains, stalls, and fountain jets. There are no people or
// motor vehicles. Everything here is instanced, so a garden of fifty trees costs a few draw calls
// and a few thousand triangles. Places are lists of [x, z] (or [x, y, z] where it says so); `seed` makes the
// variation repeatable.

const plain = (c, r = 0.85, m = 0, extra = {}) => surface(mat(c, r, m, extra), 'none');
const FOLIAGE = surface(mat('#4f7a3a', 0.95), 'foliage');
const FOLIAGE_DARK = surface(mat('#3d6331', 0.95), 'foliage');
const FOLIAGE_DRY = surface(mat('#6f7f3e', 0.95), 'foliage');
const BARK = plain('#5b4636', 0.9);
const PALM_BARK = plain('#7a6a55', 0.9);
const FROND = plain('#5d8a37', 0.85, 0, { side: THREE.DoubleSide });
const IRON = plain('#2b2d2f', 0.5, 0.6);
const LAMP_GLASS = plain('#fff1c8', 0.3, 0, { emissive: '#ffd27a', emissiveIntensity: 0.35 });
const GLOW = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.8) });
const TIMBER = plain('#6e4f33', 0.8);
const STONE = mat('#b9b2a6', 0.9);
// White, for parts tinted per copy (boats, awnings).
const TINTED = plain('#ffffff', 0.85);

/* ---------- instancing ---------- */

// Copies of a part at each place, as one InstancedMesh: places are [x, y, z, scale, ry] (scale a
// number or [sx, sy, sz]); colours, if given, tint each copy.
export function copies(geo, m, places, colours = null) {
  const im = new THREE.InstancedMesh(geo, m, places.length), o = new THREE.Object3D();
  places.forEach(([x, y, z, s = 1, ry = 0], i) => {
    o.position.set(x, y, z);
    o.rotation.set(0, ry, 0);
    Array.isArray(s) ? o.scale.set(...s) : o.scale.setScalar(s);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    if (colours) im.setColorAt(i, new THREE.Color(colours[i % colours.length]));
  });
  im.castShadow = true;
  im.receiveShadow = true;
  im.userData.dressing = true;
  return im;
}
// A part made of several pieces of the same material, as one geometry: pieces are meshes.
function fuse(...pieces) {
  return mergeGeometries(pieces.map((p) => { p.updateMatrix(); const g = p.geometry.index ? p.geometry.toNonIndexed() : p.geometry.clone(); g.applyMatrix4(p.matrix); for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; }));
}

/* ---------- places ---------- */

// n places scattered over the rectangle [x0, x1] × [z0, z1], none within `gap` of another, and none
// inside any of the `avoid` rectangles [[x0, x1, z0, z1], ...].
export function scatter(n, [x0, x1, z0, z1], { seed = 1, gap = 0, avoid = [] } = {}) {
  const R = rng(seed), out = [];
  for (let tries = 0; out.length < n && tries < n * 40; tries++) {
    const x = x0 + R() * (x1 - x0), z = z0 + R() * (z1 - z0);
    if (avoid.some(([a, b, c, d]) => x > a && x < b && z > c && z < d)) continue;
    if (gap && out.some(([px, pz]) => Math.hypot(px - x, pz - z) < gap)) continue;
    out.push([x, z]);
  }
  return out;
}
// n places evenly along the line from a to b ([x, z] each).
export function along(n, a, b) {
  const out = [];
  for (let k = 0; k < n; k++) { const t = n === 1 ? 0.5 : k / (n - 1); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  return out;
}
// n places round a circle of radius r about (cx, cz).
export function around(n, r, cx = 0, cz = 0, phase = 0) {
  const out = [];
  for (let k = 0; k < n; k++) { const a = phase + (k / n) * Math.PI * 2; out.push([cx + Math.sin(a) * r, cz + Math.cos(a) * r]); }
  return out;
}

/* ---------- trees ---------- */

// A leafy crown: an icosahedron pushed in and out by lobes, so it reads as clumps of leaves.
const crowns = new Map();
function crownGeo(lobes = 7, seed = 3) {
  const key = lobes + ':' + seed;
  if (!crowns.has(key)) {
    const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position, v = new THREE.Vector3(), R = rng(seed);
    const dirs = [];
    for (let k = 0; k < lobes; k++) dirs.push(new THREE.Vector3(R() - 0.5, R() * 0.8 - 0.2, R() - 0.5).normalize());
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      let d = 0;
      for (const u of dirs) d += Math.max(0, v.dot(u)) ** 6 * 0.28;
      const n = Math.sin(v.x * 9.1 + v.y * 4.3) * Math.sin(v.z * 7.7 - v.y * 5.9) * 0.06;
      v.multiplyScalar(0.82 + d + n);
      if (v.y < -0.35) v.y = -0.35 + (v.y + 0.35) * 0.45;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    crowns.set(key, g);
  }
  return crowns.get(key);
}
const trunkGeo = new THREE.CylinderGeometry(0.11, 0.2, 1, 7).translate(0, 0.5, 0);

// Trees at the places ([x, z] or [x, z, height]). kind: 'neem' (a broad, rounded shade tree),
// 'banyan' (wider and lower), 'ashoka' (the tall, narrow mast tree lining Indian avenues),
// 'mango' (dense and dark), 'palm' (a coconut palm), 'deodar' (a Himalayan cedar) or 'cypress'.
export function trees(spots, { kind = 'neem', seed = 1, y = 0, h = null } = {}) {
  const g = new THREE.Group(), R = rng(seed + 11);
  // Spots are [x, z, height?, ground?]: the tree's own height, and the ground it stands on (on a hill).
  const items = spots.map(([x, z, hh, gy]) => ({ x, z, gy: (gy ?? 0) + y, s: (hh || h || { neem: 9, banyan: 11, ashoka: 12, mango: 8, palm: 13, deodar: 18, cypress: 10 }[kind]) * (0.85 + R() * 0.3), ry: R() * 6.28 }));
  if (kind === 'palm') return tag(palms(items), items, kind, seed);
  if (kind === 'deodar' || kind === 'cypress') {
    const tiers = kind === 'deodar' ? [[0.42, 0.36, 0.2], [0.33, 0.32, 0.42], [0.22, 0.28, 0.62], [0.12, 0.22, 0.8]] : [[0.18, 0.92, 0.1]];
    const c = mergeGeometries(tiers.map(([r, hh, at0]) => new THREE.ConeGeometry(r, hh, 9, 1).translate(0, at0 + hh / 2, 0)));
    g.add(copies(trunkGeo, BARK, items.map((t) => [t.x, t.gy, t.z, [t.s * 0.12, t.s * 0.3, t.s * 0.12], t.ry])));
    g.add(copies(c, FOLIAGE_DARK, items.map((t) => [t.x, t.gy, t.z, t.s, t.ry])));
    return tag(g, items, kind, seed);
  }
  // Crown size and height as fractions of the tree's height: [radius, height, trunk]
  const [cr, ch, tr] = { neem: [0.42, 0.36, 0.55], banyan: [0.62, 0.3, 0.45], ashoka: [0.17, 0.62, 0.3], mango: [0.4, 0.38, 0.45] }[kind];
  const leaf = kind === 'mango' || kind === 'ashoka' ? FOLIAGE_DARK : FOLIAGE;
  // The trunk runs up into the crown, whose underside is flattened.
  g.add(copies(trunkGeo, BARK, items.map((t) => [t.x, t.gy, t.z, [t.s * 0.17, t.s * (tr + ch * 0.3), t.s * 0.17], t.ry])));
  g.add(copies(crownGeo(7, seed), leaf, items.map((t) => [t.x, t.gy + t.s * (tr + ch * 0.4), t.z, [t.s * cr, t.s * ch * 0.6, t.s * cr], t.ry])));
  return tag(g, items, kind, seed);
}
// Remember what was planted, so upgradeTrees can replant it in more detail.
function tag(g, items, kind, seed) { g.userData.trees = { items, kind, seed }; return g; }

/* ---------- fuller trees, where a monument has triangles to spare ---------- */

// Each kind as two geometries of unit height (bark and leaves), instanced at every tree with its
// own height and turn. Broadleaf trees: a trunk that leans and bends, three to five limbs, and a
// crown of separate leaf clumps at the limbs' ends (the banyan also drops aerial roots); the palm:
// a ringed trunk and arching fronds with leaflets; the deodar and cypress: drooping tiers.
const fullGeos = new Map();
function limbGeo(a, b, r1, r2, n = 6) {
  const g = new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), n, 1, true);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  g.applyQuaternion(q);
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g.toNonIndexed();
}
const plainGeo = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); return n; };
function fullGeo(kind, seed) {
  const key = kind + ':' + seed;
  if (fullGeos.has(key)) return fullGeos.get(key);
  const R = rng(seed * 7 + 3), V3 = (x, y, z) => new THREE.Vector3(x, y, z), bark = [], leaf = [];
  if (kind === 'palm') {
    const pts = [V3(0, 0, 0), V3(0.05, 0.35, 0), V3(0.13, 0.7, 0), V3(0.2, 1, 0)], curve = new THREE.CatmullRomCurve3(pts);
    for (let k = 0; k < 14; k++) {
      const t0 = k / 14, t1 = (k + 1) / 14, p0 = curve.getPoint(t0), p1 = curve.getPoint(t1);
      bark.push(limbGeo(p0, p1, 0.026 - t0 * 0.006, 0.024 - t1 * 0.006, 7), limbGeo(p0, p0.clone().lerp(p1, 0.12), 0.03 - t0 * 0.006, 0.03 - t0 * 0.006, 7));
    }
    for (let f = 0; f < 15; f++) {
      const a = (f / 15) * Math.PI * 2 + R() * 0.3, lift = f % 2 ? 0.12 : 0.02, pos = [];
      const P = (t) => V3(0.2 + Math.cos(a) * t * 0.4, 1 + Math.sin(t * 2.4) * lift - t * t * 0.25, Math.sin(a) * t * 0.4);
      const side = V3(-Math.sin(a), 0, Math.cos(a));
      for (let i = 0; i < 12; i++) {
        const t = (i + 0.5) / 12, c = P(t), w = 0.012 + Math.sin(t * Math.PI) * 0.09;
        for (const s of [-1, 1]) {
          const tip = c.clone().addScaledVector(side, s * w).add(V3(0, -w * 0.5, 0)), along = P(t + 0.05);
          pos.push(...c.toArray(), ...along.toArray(), ...tip.toArray());
        }
        if (i < 11) { const n1 = P((i + 1.5) / 12); pos.push(...c.toArray(), ...n1.toArray(), ...c.clone().add(V3(0, 0.006, 0)).toArray()); }
      }
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      fg.computeVertexNormals();
      leaf.push(fg);
    }
    for (const a of [0, 2.1, 4.2]) leaf.push(plainGeo(new THREE.SphereGeometry(0.02, 6, 4).translate(0.2 + Math.cos(a) * 0.03, 0.975, Math.sin(a) * 0.03)));
  } else if (kind === 'deodar' || kind === 'cypress') {
    bark.push(limbGeo(V3(0, 0, 0), V3(0, 0.95, 0), 0.025, 0.006, 7));
    const tiers = kind === 'deodar' ? 7 : 4;
    for (let t = 0; t < tiers; t++) {
      const y = 0.18 + (t / tiers) * 0.72, r = (kind === 'deodar' ? 0.42 : 0.16) * (1 - t / (tiers + 1)), n = kind === 'deodar' ? 9 : 6;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + t * 0.4, g = new THREE.ConeGeometry(r * 0.32, r * 1.05, 5, 1);
        g.rotateZ(-Math.PI / 2 - 0.35).scale(1, 0.55, 1).translate(r * 0.5, y + 0.02, 0).rotateY(a);
        leaf.push(plainGeo(g));
      }
      leaf.push(plainGeo(new THREE.ConeGeometry(r * 0.45, 0.14, 7).translate(0, y + 0.06, 0)));
    }
  } else {
    const [cr, tr, limbs, droop] = { neem: [0.42, 0.5, 4, 0], banyan: [0.6, 0.42, 5, 1], ashoka: [0.16, 0.25, 3, 0], mango: [0.4, 0.45, 4, 0] }[kind] || [0.4, 0.5, 4, 0];
    const lean = V3((R() - 0.5) * 0.06, tr, (R() - 0.5) * 0.06), mid = V3(lean.x * 0.4, tr * 0.5, lean.z * 0.4);
    bark.push(limbGeo(V3(0, 0, 0), mid, 0.055, 0.045, 7), limbGeo(mid, lean, 0.045, 0.035, 7));
    const ends = [];
    for (let k = 0; k < limbs; k++) {
      const a = (k / limbs) * Math.PI * 2 + R() * 0.6, out = cr * (0.55 + R() * 0.3), up = kind === 'ashoka' ? 0.5 : 0.18 + R() * 0.12;
      const e = V3(lean.x + Math.cos(a) * out, tr + up, lean.z + Math.sin(a) * out);
      bark.push(limbGeo(lean, e, 0.03, 0.012, 5));
      ends.push(e);
    }
    ends.push(V3(lean.x, tr + (kind === 'ashoka' ? 0.62 : 0.34), lean.z));
    const base = crownGeo(6, seed);
    ends.forEach((e, k) => {
      const s = (k === ends.length - 1 ? 1.15 : 0.85 + R() * 0.3) * (kind === 'ashoka' ? 0.12 : cr * 0.62);
      leaf.push(plainGeo(base.clone().scale(s, s * (kind === 'ashoka' ? 2.6 : 0.72), s).translate(e.x, e.y + s * 0.15, e.z)));
    });
    if (droop) for (let k = 0; k < 7; k++) {
      const a = R() * Math.PI * 2, d = cr * (0.4 + R() * 0.5), x = Math.cos(a) * d, z = Math.sin(a) * d;
      bark.push(limbGeo(V3(x, tr + 0.12, z), V3(x, 0, z), 0.008, 0.012, 4));
    }
  }
  const out = { bark: mergeGeometries(bark.map(plainGeo)), leaf: mergeGeometries(leaf.map(plainGeo)) };
  out.bark.computeVertexNormals();
  fullGeos.set(key, out);
  return out;
}
function fullTrees({ items, kind, seed }) {
  const g = new THREE.Group(), geo = fullGeo(kind, seed % 4), place = items.map((t) => [t.x, t.gy, t.z, t.s, t.ry]);
  const leafM = kind === 'palm' ? FROND : kind === 'mango' || kind === 'ashoka' || kind === 'deodar' || kind === 'cypress' ? FOLIAGE_DARK : FOLIAGE;
  g.add(copies(geo.bark, kind === 'palm' ? PALM_BARK : BARK, place), copies(geo.leaf, leafM, place));
  return g;
}
const trisOf = (o) => { let t = 0; o.traverse((m) => { if (m.isMesh) { const g = m.geometry; t += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (m.isInstancedMesh ? m.count : 1); } }); return t; };

// Replant the trees under root in more detail wherever the monument stays within `budget`
// triangles: the smallest plantings first, so a few specimen trees are upgraded before a forest.
// Called once a monument is built (main.js); the plain trees stay where triangles are short.
export function upgradeTrees(root, budget = 300000) {
  const groups = [];
  root.traverse((o) => { if (o.userData.trees) groups.push(o); });
  let total = trisOf(root);
  for (const g of groups.sort((a, b) => a.userData.trees.items.length - b.userData.trees.items.length)) {
    const full = fullTrees(g.userData.trees), extra = trisOf(full) - trisOf(g);
    if (total + extra > budget) continue;
    g.clear();
    g.add(...full.children);
    total += extra;
  }
  return total;
}
// Coconut palms: a leaning, slightly curved ringed trunk, a crown of arching fronds and coconuts.
let palmGeos = null;
function palms(items) {
  if (!palmGeos) {
    const trunk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.04, 0.35, 0), new THREE.Vector3(0.12, 0.7, 0), new THREE.Vector3(0.2, 1, 0)]), 10, 0.022, 6, false);
    const fronds = [];
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2, pts = [], n = 10, pos = [], idx = [];
      for (let i = 0; i <= n; i++) { const t = i / n; pts.push([Math.cos(a) * t * 0.36, Math.sin(t * 2.2) * 0.12 - t * t * 0.22, Math.sin(a) * t * 0.36]); }
      for (let i = 0; i <= n; i++) {
        const [x, yy, z] = pts[i], w = Math.sin((i / n) * Math.PI) * 0.06 + 0.005, sx = -Math.sin(a) * w, sz = Math.cos(a) * w;
        pos.push(x + sx, yy - w * 0.4, z + sz, x - sx, yy - w * 0.4, z - sz);
        if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      }
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      fg.setIndex(idx);
      fronds.push(fg.toNonIndexed().translate(0.2, 1, 0));
    }
    const f = mergeGeometries(fronds);
    f.computeVertexNormals();
    const nuts = mergeGeometries([0, 2.1, 4.2].map((a) => new THREE.SphereGeometry(0.018, 6, 4).translate(0.2 + Math.cos(a) * 0.025, 0.975, Math.sin(a) * 0.025)));
    palmGeos = { trunk, f, nuts };
  }
  const g = new THREE.Group(), place = (t) => [t.x, t.gy, t.z, t.s, t.ry];
  g.add(copies(palmGeos.trunk, PALM_BARK, items.map(place)), copies(palmGeos.f, FROND, items.map(place)), copies(palmGeos.nuts, plain('#5a4a2a', 0.8), items.map(place)));
  return g;
}
// Low clipped shrubs or hedges: [x, z] or [x, z, size].
// Spots are [x, z, size?, y?]. flowers: a colour for flowering bushes (bougainvillea, marigold
// beds, saffron).
const flowerMats = new Map();
// A flowering shrub is a dark green bush with its blooms as a smaller, muted cap on top: a bush
// wholly in a saturated flower colour reads as a plastic blob from the garden paths.
export function shrubs(spots, { seed = 2, y = 0, size = 1.2, dry = false, flowers = null } = {}) {
  const R = rng(seed);
  const places = spots.map(([x, z, s, yy]) => { const k = (s || size) * (0.8 + R() * 0.4); return [x, (yy ?? y) + k * 0.35, z, [k, k * 0.6, k], R() * 6.28]; });
  if (!flowers) return copies(crownGeo(5, seed + 4), dry ? FOLIAGE_DRY : FOLIAGE, places);
  if (!flowerMats.has(flowers)) {
    const c = new THREE.Color(flowers).lerp(new THREE.Color('#3d6331'), 0.35);
    flowerMats.set(flowers, surface(mat('#' + c.getHexString(), 0.95), 'foliage'));
  }
  const g = new THREE.Group();
  g.add(copies(crownGeo(5, seed + 4), FOLIAGE_DARK, places.map(([x, yy, z, [k], ry]) => [x, yy - k * 0.08, z, [k * 0.85, k * 0.5, k * 0.85], ry])));
  g.add(copies(crownGeo(5, seed + 5), flowerMats.get(flowers), places.map(([x, yy, z, [k], ry]) => [x, yy + k * 0.16, z, [k * 0.62, k * 0.3, k * 0.62], ry + 1.3])));
  return g;
}

/* ---------- street furniture ---------- */

// Heritage lamp posts, h tall: a fluted iron post on a base, a scrolled arm and a glass lantern,
// lit at night.
let lampGeos = null;
export function lampPosts(spots, { h = 4.2, y = 0 } = {}) {
  if (!lampGeos) {
    const iron = fuse(cyl(0.12, 0.16, 0.5, IRON, 0, 0, 0, 8), cyl(0.05, 0.07, 3.3, IRON, 0, 0.5, 0, 8), cyl(0.1, 0.08, 0.15, IRON, 0, 3.75, 0, 8), cyl(0.02, 0.14, 0.18, IRON, 0, 4.2, 0, 8));
    const glass = new THREE.CylinderGeometry(0.11, 0.08, 0.3, 6).translate(0, 4.05, 0);
    lampGeos = { iron, glass, glow: new THREE.SphereGeometry(0.07, 8, 6).translate(0, 4.05, 0) };
  }
  const k = h / 4.4, places = spots.map(([x, z]) => [x, y, z, k, 0]), g = new THREE.Group();
  g.add(copies(lampGeos.iron, IRON, places), copies(lampGeos.glass, LAMP_GLASS, places));
  const glow = copies(lampGeos.glow, GLOW, places);
  glow.castShadow = false;
  glow.visible = nightState.on;
  nightState.objects.push(glow);
  g.add(glow);
  return g;
}
// Park benches facing ry: stone end supports and a timber seat and back.
let benchGeos = null;
export function benches(spots, { y = 0 } = {}) {
  if (!benchGeos) benchGeos = { stone: fuse(box(0.12, 0.45, 0.45, STONE, -0.8), box(0.12, 0.45, 0.45, STONE, 0.8)), wood: fuse(box(1.8, 0.06, 0.45, TIMBER, 0, 0.45), box(1.8, 0.4, 0.05, TIMBER, 0, 0.55, -0.2)) };
  const places = spots.map(([x, z, ry = 0]) => [x, y, z, 1, ry]);
  return new THREE.Group().add(copies(benchGeos.stone, STONE, places), copies(benchGeos.wood, TIMBER, places));
}
// Bollards round a line or ring of places, with a chain hanging between neighbours.
export function bollards(spots, { y = 0, h = 0.8, chain: withChain = true, closed = false, m = IRON } = {}) {
  const g = new THREE.Group(), post = fuse(cyl(0.07, 0.09, h, m, 0, 0, 0, 8), mesh(new THREE.SphereGeometry(0.09, 8, 6), m, 0, h, 0));
  g.add(copies(post, m, spots.map(([x, z]) => [x, y, z, 1, 0])));
  if (withChain) {
    const n = spots.length, links = [];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const [ax, az] = spots[i], [bx, bz] = spots[(i + 1) % n], pts = [];
      for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector3(ax + (bx - ax) * t, y + h * 0.85 - Math.sin(t * Math.PI) * 0.18, az + (bz - az) * t)); }
      links.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.015, 4, false));
    }
    if (links.length) g.add(mesh(mergeGeometries(links), m));
  }
  return g;
}
// The blue board of the Archaeological Survey of India that stands at every protected monument,
// with its name, on two posts, facing ry.
export function asiBoard(name, x, z, ry = 0, { y = 0, line2 = 'PROTECTED MONUMENT' } = {}) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const t = c.getContext('2d');
  t.fillStyle = '#1d4f91'; t.fillRect(0, 0, 512, 256);
  t.strokeStyle = '#f2f2f2'; t.lineWidth = 8; t.strokeRect(12, 12, 488, 232);
  t.fillStyle = '#ffffff'; t.textAlign = 'center';
  t.font = 'bold 30px sans-serif'; t.fillText('ARCHAEOLOGICAL SURVEY OF INDIA', 256, 62);
  let fs = 46;
  t.font = `bold ${fs}px serif`;
  while (t.measureText(name.toUpperCase()).width > 460 && fs > 22) { fs -= 2; t.font = `bold ${fs}px serif`; }
  t.fillText(name.toUpperCase(), 256, 140);
  t.font = '26px sans-serif'; t.fillText(line2, 256, 205);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  g.add(cyl(0.05, 0.05, 1.9, IRON, -0.85, y, 0, 6), cyl(0.05, 0.05, 1.9, IRON, 0.85, y, 0, 6));
  g.add(box(1.9, 0.95, 0.05, plain('#1d4f91', 0.6), 0, y + 0.95, -0.03));
  const face = mesh(new THREE.PlaneGeometry(1.86, 0.93), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), 0, y + 1.425, 0.001);
  g.add(face);
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  return g;
}
// Marigold garlands (toran) hanging between a and b ([x, y, z]), sagging `sag`, in strands of
// orange and yellow flowers with green leaves between.
export function garland(a, b, { sag = 0.5, strands = 1, gapY = 0.12 } = {}) {
  const spots = [[], [], []], geo = new THREE.IcosahedronGeometry(0.06, 0);
  for (let s = 0; s < strands; s++) {
    const n = Math.max(6, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.1));
    for (let k = 0; k <= n; k++) {
      const t = k / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * (sag + s * 0.1) - s * gapY, a[2] + (b[2] - a[2]) * t];
      spots[k % 5 === 4 ? 2 : (k + s) % 2].push([...p, 1, k]);
    }
  }
  const g = new THREE.Group();
  [plain('#f28a1a', 0.8), plain('#f6c21c', 0.8), plain('#3f7a32', 0.8)].forEach((m, i) => { if (spots[i].length) g.add(copies(geo, m, spots[i])); });
  return g;
}
// Wooden boats at [x, z, ry], floating at y: a round-bottomed hull with ribs, thwarts and a canopy
// if `canopy`.
let boatGeos = null;
export function boats(spots, { y = 0, size = 1, canopy = false, colours = ['#7a4e2d', '#3d6e8f', '#a3402f', '#3f7a4f'] } = {}) {
  if (!boatGeos) {
    const hull = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(0.9, 0.55, 3.2);
    const seats = mergeGeometries([-1.2, 0, 1.2].map((z) => new THREE.BoxGeometry(1.5, 0.06, 0.25).translate(0, -0.08, z)));
    const roof = new THREE.CylinderGeometry(0.75, 0.75, 1.6, 10, 1, true, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(0, 0.45, 0.2);
    // On desktops, a country boat's timbers: the gunwale round the rim, the stem and stern posts
    // sweeping up out of the water, ribs inside the hull, two oars stowed along the thwarts, and
    // the bamboo hoops that carry the mat canopy.
    const tube = (pts, r, n = 24, closed = false) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed), n, r, 5, closed);
    const rim = tube(Array.from({ length: 32 }, (_, k) => { const t = (k / 32) * Math.PI * 2; return [0.9 * Math.cos(t), 0.02, 3.2 * Math.sin(t)]; }), 0.05, 64, true);
    const posts = [-1, 1].map((s) => tube([[0, -0.25, s * 3.05], [0, 0.1, s * 3.25], [0, 0.45, s * 3.42], [0, 0.72, s * 3.4]], 0.07, 10));
    const ribs = [-2.2, -1.1, 0, 1.1, 2.2].map((z) => { const f = Math.sqrt(1 - (z / 3.2) ** 2) * 0.96; return tube(Array.from({ length: 9 }, (_, k) => { const t = (k / 8) * Math.PI; return [0.9 * f * Math.cos(t), -0.55 * f * Math.sin(t) + 0.01, z]; }), 0.028, 12); });
    const oars = [-0.32, 0.32].flatMap((x) => [new THREE.CylinderGeometry(0.03, 0.03, 4.2, 6).rotateX(Math.PI / 2).translate(x, 0.0, 0.3), new THREE.BoxGeometry(0.22, 0.03, 0.7).translate(x, 0.0, 2.55)]);
    const hoops = [-0.5, 0.2, 0.9].map((z) => new THREE.TorusGeometry(0.77, 0.03, 4, 12, Math.PI).translate(0, 0.45, z));
    const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); return n; };
    boatGeos = { hull, seats, roof, timbers: mergeGeometries([rim, ...posts, ...ribs, ...oars].map(clean)), hoops: mergeGeometries(hoops.map(clean)) };
  }
  // Afloat: the hull stands about a quarter of its depth out of the water at y.
  const places = spots.map(([x, z, ry = 0]) => [x, y + 0.22 * size, z, size, ry]), g = new THREE.Group();
  g.add(copies(boatGeos.hull, plain('#ffffff', 0.75, 0, { side: THREE.DoubleSide }), places, colours), copies(boatGeos.seats, TIMBER, places));
  if (!detail.low) g.add(copies(boatGeos.timbers, TIMBER, places));
  if (canopy) {
    g.add(copies(boatGeos.roof, plain('#d9c08a', 0.9, 0, { side: THREE.DoubleSide }), places));
    if (!detail.low) g.add(copies(boatGeos.hoops, TIMBER, places));
  }
  return g;
}
// Harbour ferry launches at [x, z, ry], afloat at y, bow towards +z before ry: the wooden two-deck
// launches that carry visitors from the Gateway of India to Elephanta. A painted hull about 18 m
// long with a band of a second colour along its sheer, a closed lower cabin with a row of windows,
// an open upper deck under a canopy on posts, a wheelhouse forward and a flag astern. On desktops
// (js/detail.js) also the upper deck's railing, life rings on the cabin sides, and a mast forward.
let launchGeos = null;
export function launches(spots, { y = 0, hulls = ['#f4f1ea', '#f4f1ea', '#2f5d9a', '#f4f1ea'], bands = ['#2f5d9a', '#c2512a', '#f4f1ea', '#3c8a5a'], canopies = ['#2f5d9a', '#c2512a', '#3c8a5a', '#e3b23c'] } = {}) {
  if (!launchGeos) {
    const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); return n; };
    // The hull in plan: a square stern, straight sides, and the bow drawn to a point.
    const plan = (w, l0, l1, tip) => new THREE.Shape([[-w, l0], [w, l0], [w, l1], [w * 0.75, l1 + (tip - l1) * 0.55], [0, tip], [-w * 0.75, l1 + (tip - l1) * 0.55], [-w, l1]].map(([a, b]) => new THREE.Vector2(a, b)));
    const prism = (sh, h, y0) => new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, y0 + h, 0);
    const posts = [];
    for (const x of [-2.15, 2.15]) for (const z of [-7.2, -3.6, 0, 3.6]) posts.push(new THREE.CylinderGeometry(0.06, 0.06, 1.9, 6).translate(x, 4.25, z));
    const rails = [], stanchions = [];
    for (const x of [-2.25, 2.25]) { rails.push(new THREE.BoxGeometry(0.06, 0.06, 11).translate(x, 4.1, -2)); for (let z = -7.4; z <= 3.4; z += 0.9) stanchions.push(new THREE.BoxGeometry(0.04, 0.9, 0.04).translate(x, 3.7, z)); }
    rails.push(new THREE.BoxGeometry(4.5, 0.06, 0.06).translate(0, 4.1, -7.5));
    launchGeos = {
      hull: clean(prism(plan(2.5, -8, 4, 9.5), 1.9, -0.7)),
      // The band stops 5 cm under the deck, so its top never shares the deck's plane (flicker).
      band: clean(prism(plan(2.53, -8.02, 4, 9.56), 0.3, 0.85)),
      deck: mergeGeometries([new THREE.BoxGeometry(4.3, 2.0, 11).translate(0, 2.2, -2), new THREE.BoxGeometry(4.7, 0.14, 12).translate(0, 3.27, -2), new THREE.BoxGeometry(2.3, 1.6, 2).translate(0, 4.14, 3.2)].map(clean)),
      windows: mergeGeometries([new THREE.BoxGeometry(4.36, 0.62, 9.6).translate(0, 2.55, -2), new THREE.BoxGeometry(2.36, 0.6, 1.4).translate(0, 4.55, 3.4), new THREE.BoxGeometry(1.9, 0.6, 2.06).translate(0, 4.55, 3.2)].map(clean)),
      canopy: clean(new THREE.BoxGeometry(4.6, 0.1, 9.4).translate(0, 5.25, -2.6)),
      posts: mergeGeometries(posts.map(clean)),
      flag: clean(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6).translate(0, 2.4, -7.8)),
      rails: mergeGeometries([...rails, ...stanchions, new THREE.CylinderGeometry(0.06, 0.08, 3.4, 6).translate(0, 6.4, 3.2)].map(clean)),
      rings: mergeGeometries([-1, 1].flatMap((s) => [-4.5, 0.5].map((z) => new THREE.TorusGeometry(0.32, 0.08, 6, 14).rotateY(Math.PI / 2).translate(s * 2.2, 2.2, z))).map(clean)),
    };
  }
  const p = spots.map(([x, z, ry = 0]) => [x, y, z, 1, ry]), G = launchGeos, g = new THREE.Group();
  g.add(copies(G.hull, TINTED, p, hulls), copies(G.band, TINTED, p, bands), copies(G.deck, plain('#ece6d8', 0.8), p), copies(G.windows, plain('#1d2a33', 0.3, 0.2), p));
  g.add(copies(G.canopy, TINTED, p, canopies), copies(G.posts, TIMBER, p), copies(G.flag, TIMBER, p));
  if (!detail.low) g.add(copies(G.rails, plain('#f4f1ea', 0.6), p), copies(G.rings, plain('#e8642c', 0.7), p));
  return g;
}

// Ships at anchor out in a harbour, at [x, z, ry], afloat at y: a cargo ship about 90 m long with a
// dark hull and red boot-topping, its deck crane posts forward, and its white superstructure and
// funnel aft. On desktops (js/detail.js) also the bridge windows, a mast on the superstructure and
// derricks on the crane posts.
let shipGeos = null;
export function ships(spots, { y = 0, hulls = ['#2b3a4a', '#3a2f2a'], funnels = ['#c2512a', '#e3b23c'] } = {}) {
  if (!shipGeos) {
    const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); return n; };
    const plan = (w, l0, l1, tip) => new THREE.Shape([[-w, l0], [w, l0], [w, l1], [w * 0.7, l1 + (tip - l1) * 0.6], [0, tip], [-w * 0.7, l1 + (tip - l1) * 0.6], [-w, l1]].map(([a, b]) => new THREE.Vector2(a, b)));
    const prism = (sh, h, y0) => new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, y0 + h, 0);
    shipGeos = {
      hull: clean(prism(plan(7, -45, 30, 46), 7, 1.5)),
      boot: clean(prism(plan(7.05, -45.05, 30, 46.1), 2.6, -1)),
      upper: mergeGeometries([new THREE.BoxGeometry(12, 4, 12).translate(0, 10.5, -34), new THREE.BoxGeometry(10, 3, 9).translate(0, 14, -34), new THREE.BoxGeometry(13, 0.4, 4).translate(0, 16.2, -30.5), new THREE.BoxGeometry(1.5, 9, 1.5).translate(0, 12.5, 20), new THREE.BoxGeometry(1.5, 9, 1.5).translate(0, 12.5, 0)].map(clean)),
      funnel: clean(new THREE.CylinderGeometry(1.6, 1.9, 6, 12).translate(0, 18.5, -39)),
      fine: mergeGeometries([new THREE.CylinderGeometry(0.2, 0.25, 9, 6).translate(0, 20.5, -32), ...[20, 0].flatMap((z) => [new THREE.CylinderGeometry(0.18, 0.18, 12, 6).rotateX(0.9).translate(0, 13, z + 4.5), new THREE.CylinderGeometry(0.18, 0.18, 12, 6).rotateX(-0.9).translate(0, 13, z - 4.5)])].map(clean)),
      windows: clean(new THREE.BoxGeometry(10.08, 0.7, 9.08).translate(0, 15, -34)),
    };
  }
  const p = spots.map(([x, z, ry = 0]) => [x, y, z, 1, ry]), G = shipGeos, g = new THREE.Group();
  g.add(copies(G.hull, TINTED, p, hulls), copies(G.boot, plain('#8a2a22', 0.7), p), copies(G.upper, plain('#ece9e2', 0.7), p), copies(G.funnel, TINTED, p, funnels));
  if (!detail.low) g.add(copies(G.fine, plain('#5a5f63', 0.5, 0.4), p), copies(G.windows, plain('#1d2a33', 0.3, 0.2), p));
  return g;
}

// Fountain jets at [x, z]: a fine spray rising h and falling back into a ring of foam.
export function fountains(spots, { y = 0, h = 2.2 } = {}) {
  const water = plain('#e8f4ff', 0.1, 0, { transparent: true, opacity: 0.55, emissive: '#bcd9f2', emissiveIntensity: 0.15 });
  const jet = mergeGeometries([new THREE.CylinderGeometry(0.02, 0.07, 1, 8, 1, true).translate(0, 0.5, 0), new THREE.ConeGeometry(0.18, 0.25, 8, 1, true).rotateX(Math.PI).translate(0, 0.92, 0)]);
  const foam = new THREE.TorusGeometry(0.25, 0.05, 6, 16).rotateX(Math.PI / 2).translate(0, 0.02, 0);
  const g = new THREE.Group(), j = copies(jet, water, spots.map(([x, z]) => [x, y, z, [1, h, 1], 0]));
  j.castShadow = false;
  g.add(j, copies(foam, water, spots.map(([x, z]) => [x, y, z, 1, 0])));
  return g;
}
// Prayer flags on a line from a to b ([x, y, z]): small squares in the five colours.
const FLAG_MATS = ['#2f5fb3', '#f2f2f2', '#c8322b', '#2f8a4a', '#f2c21c'].map((c) => plain(c, 0.9, 0, { side: THREE.DoubleSide }));
export function prayerFlags(a, b, { sag = 0.6, size = 0.3 } = {}) {
  const spots = [[], [], [], [], []];
  const n = Math.max(5, Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / (size * 1.3)));
  for (let k = 0; k <= n; k++) {
    const t = k / n, ry = Math.atan2(b[0] - a[0], b[2] - a[2]) + Math.PI / 2;
    spots[k % 5].push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, a[2] + (b[2] - a[2]) * t, size, ry]);
  }
  const geo = new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0), g = new THREE.Group();
  FLAG_MATS.forEach((m, i) => { if (spots[i].length) { const f = copies(geo, m, spots[i]); f.castShadow = false; g.add(f); } });
  const line = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, k) => { const t = k / 8; return new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, a[2] + (b[2] - a[2]) * t); })), 16, 0.01, 4, false);
  g.add(mesh(line, IRON));
  return g;
}

// Kashmiri houseboats moored at [x, z, ry]: a long cedar hull, a carved cabin with windows, and a
// pitched roof.
let hbGeos = null;
export function houseboats(spots, { y = 0 } = {}) {
  if (!hbGeos) hbGeos = {
    hull: new THREE.BoxGeometry(5, 1.2, 26).translate(0, 0.2, 0),
    cabin: new THREE.BoxGeometry(4.6, 2.8, 20).translate(0, 2.2, -1),
    roof: new THREE.CylinderGeometry(0.01, 3.4, 1.4, 4, 1).rotateY(Math.PI / 4).scale(1, 1, 4.4).translate(0, 4.3, -1),
    windows: new THREE.BoxGeometry(4.65, 0.9, 17).translate(0, 2.4, -1),
  };
  const p = spots.map(([x, z, ry = 0]) => [x, y, z, 1, ry]);
  return new THREE.Group().add(copies(hbGeos.hull, TIMBER, p), copies(hbGeos.cabin, plain('#8a5a36', 0.75), p), copies(hbGeos.roof, plain('#6d6a62', 0.8), p), copies(hbGeos.windows, plain('#2b2d33', 0.3, 0.3), p));
}

// Cane and cloth umbrellas on bamboo poles at [x, z], as the priests of the ghats sit under.
let umbGeos = null;
export function umbrellas(spots, { y = 0 } = {}) {
  if (!umbGeos) umbGeos = { pole: new THREE.CylinderGeometry(0.04, 0.05, 2.6, 6).translate(0, 1.3, 0), top: new THREE.ConeGeometry(1.5, 0.55, 12, 1, true).translate(0, 2.75, 0) };
  const p = spots.map(([x, z]) => [x, y, z, 1, 0]);
  return new THREE.Group().add(copies(umbGeos.pole, TIMBER, p), copies(umbGeos.top, plain('#c9a66a', 0.95, 0, { side: THREE.DoubleSide }), p));
}

// Market stalls at [x, z, ry]: a counter heaped with flowers or goods under a striped awning on
// four poles, as the flower and pooja stalls outside a temple gate. On desktops each is furnished:
// the counter has a top board and a panelled front, three baskets of flowers or offerings sit on
// it, garlands hang from the front of the sloping awning under a scalloped valance, and a shelf of
// brass pots runs along the back.
let stallGeos = null;
const BRASS = plain('#c99a3a', 0.35, 0.8);
export function stalls(spots, { y = 0, awnings = ['#c2512a', '#2f5d9a', '#e3b23c', '#3c8a5a', '#b3262e'], goods = ['#f28a1a', '#f6c21c', '#d63c6a', '#f4f1ea'] } = {}) {
  if (!stallGeos) {
    const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); return n; };
    const scallops = Array.from({ length: 7 }, (_, k) => new THREE.CircleGeometry(0.2, 8, Math.PI, Math.PI).translate(-1.2 + k * 0.4, 1.93, 1.13));
    stallGeos = {
      counter: new THREE.BoxGeometry(2.4, 0.9, 1.2).translate(0, 0.45, 0),
      heap: new THREE.SphereGeometry(0.5, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(2, 0.5, 0.9).translate(0, 0.9, 0),
      poles: mergeGeometries([[-1.15, -0.55], [1.15, -0.55], [-1.15, 0.55], [1.15, 0.55]].map(([x, z]) => new THREE.CylinderGeometry(0.03, 0.03, 2.2, 5).translate(x, 1.1, z))),
      awning: new THREE.BoxGeometry(2.8, 0.08, 1.8).translate(0, 2.2, 0.2),
      // Desktop parts.
      fittings: mergeGeometries([
        new THREE.BoxGeometry(2.6, 0.06, 1.36).translate(0, 0.93, 0), new THREE.BoxGeometry(2.5, 0.08, 1.3).translate(0, 0.04, 0),
        new THREE.BoxGeometry(2.36, 0.05, 0.3).translate(0, 1.35, -0.5), new THREE.BoxGeometry(2.3, 0.04, 0.04).translate(0, 1.8, -0.55),
        ...[-1.15, 1.15].map((x) => new THREE.CylinderGeometry(0.04, 0.04, 2.25, 6).translate(x, 1.12, -0.55)),
      ].map(clean)),
      panels: mergeGeometries([-0.8, 0, 0.8].map((x) => new THREE.BoxGeometry(0.66, 0.5, 0.03).translate(x, 0.3, 0.615)).map(clean)),
      baskets: mergeGeometries([-0.8, 0, 0.8].map((x) => new THREE.CylinderGeometry(0.34, 0.26, 0.2, 10).translate(x, 1.06, 0.05)).map(clean)),
      heaps: [-0.8, 0, 0.8].map((x) => new THREE.SphereGeometry(0.31, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.75, 1).translate(x, 1.15, 0.05)),
      garlands: mergeGeometries(Array.from({ length: 6 }, (_, k) => new THREE.CylinderGeometry(0.05, 0.04, 0.85, 6).translate(-1.05 + k * 0.42, 1.55, 1.08)).map(clean)),
      pots: mergeGeometries(Array.from({ length: 6 }, (_, k) => new THREE.SphereGeometry(0.11, 8, 6).scale(1, 0.9, 1).translate(-0.95 + k * 0.38, 1.48, -0.5)).map(clean)),
      // The awning sloping down to the front, with its scalloped valance.
      awningFull: mergeGeometries([new THREE.BoxGeometry(2.8, 0.06, 1.85).rotateX(0.12).translate(0, 2.2, 0.2), new THREE.BoxGeometry(2.8, 0.22, 0.03).translate(0, 2.04, 1.13), ...scallops].map(clean)),
    };
  }
  const p = spots.map(([x, z, ry = 0]) => [x, y, z, 1, ry]), G = stallGeos, g = new THREE.Group();
  g.add(copies(G.counter, TIMBER, p), copies(G.poles, TIMBER, p));
  if (detail.low) return g.add(copies(G.heap, TINTED, p, goods), copies(G.awning, TINTED, p, awnings));
  const shift = (list, k) => list.map((_, i) => list[(i + k) % list.length]);
  g.add(copies(G.fittings, TIMBER, p), copies(G.panels, TINTED, p, shift(awnings, 2)), copies(G.baskets, plain('#a07a45', 0.9), p));
  G.heaps.forEach((h, k) => g.add(copies(h, TINTED, p, shift(goods, k))));
  g.add(copies(G.garlands, TINTED, p, shift(goods, 1)), copies(G.pots, BRASS, p), copies(G.awningFull, plain('#ffffff', 0.85, 0, { side: THREE.DoubleSide }), p, awnings));
  return g;
}

// A row of house plots for townHouses, from R (an rng): along x at z = at (axis 'x') or along z at
// x = at, from a to b, every house facing ry. w, d and n are [min, max] for the frontage, the depth
// and the storeys; skip(c) leaves out a plot centred at c along the row (a road, a gate); now and
// then a lane opens between two houses. Returns [x, z, w, d, n, ry] spots.
export function houseRow(R, axis, at, a, b, ry, { w = [6.5, 10.5], d = [9, 12], n = [2, 4], skip = null, lane = 0.12 } = {}) {
  const out = [];
  for (let t = a; t < b;) {
    const ww = w[0] + R() * (w[1] - w[0]), dd = d[0] + R() * (d[1] - d[0]), nn = n[0] + Math.floor(R() * (n[1] - n[0] + 1)), c = t + ww / 2, off = (R() - 0.5) * 0.6;
    if (c + ww / 2 > b) break;
    if (!skip || !skip(c)) out.push(axis === 'x' ? [c, at + off, ww - 0.3, dd, nn, ry] : [at + off, c, ww - 0.3, dd, nn, ry]);
    t += ww + (R() < lane ? 3.5 : 0);
  }
  return out;
}

// A city round a site: rows of town houses (townHouses, below) lining streets on every side of the
// clear rectangle [x0, x1, z0, z1]. The first row stands `gap` back from it, fronts towards the
// site; each further row stands back to back with the one before or across a lane `lane` wide,
// alternately. Houses whose footprint touches a rectangle in `keep` (roads, squares, neighbouring
// buildings, [x0, x1, z0, z1]) are left out. Widths, depths and storeys vary within their ranges.
// every: build only one plot in that many (a thinner town, for phones); fine: passed to townHouses.
export function cityAround([x0, x1, z0, z1], {
  rows = 2, gap = 6, lane = 7, width = [8, 14], depth = [10, 14], storeys = [2, 5], keep = [], seed = 1, every = 1, ...opts
} = {}) {
  const R = rng(seed + 101), spots = [], pick = ([a, b]) => a + R() * (b - a);
  const clear = (x, z, w, d) => !keep.some(([a, b, c, e]) => x + w / 2 > a && x - w / 2 < b && z + d / 2 > c && z - d / 2 < e);
  let o = gap, n = 0;
  for (let r = 0; r < rows; r++) {
    const D = depth[1], inward = r % 2 === 0;
    const sides = [
      // [along axis, fixed coordinate, from, to, facing ry towards the site]
      ['x', z0 - o - D / 2, x0 - o - D, x1 + o + D, 0],
      ['x', z1 + o + D / 2, x0 - o - D, x1 + o + D, Math.PI],
      ['z', x0 - o - D / 2, z0 - o, z1 + o, Math.PI / 2],
      ['z', x1 + o + D / 2, z0 - o, z1 + o, -Math.PI / 2],
    ];
    for (const [ax, fixed, from, to, ry] of sides) {
      for (let t = from; t < to - 4;) {
        const w = Math.min(pick(width), to - t), d = pick(depth), c = t + w / 2;
        const x = ax === 'x' ? c : fixed, z = ax === 'x' ? fixed : c, fx = ax === 'x' ? w : d, fz = ax === 'x' ? d : w;
        if (clear(x, z, fx, fz) && !(n++ % every)) spots.push([x, z, w - 0.3, d, Math.round(pick(storeys)), inward ? ry : ry + Math.PI]);
        t += w;
      }
    }
    o += D + (inward ? 0 : lane);
  }
  return townHouses(spots, { seed, ...opts });
}

// Town houses, as in the old streets round a temple: spots are [x, z, w, d, storeys, ry, y?], each a
// painted block w × d of 3.2 m storeys with its front (+z before ry) on the street. Dark windows run
// in bays on every storey, front and back, with a door in the middle of the front; a balcony slab
// sits under each upper storey, and the flat roof has a parapet and, often, a black water tank.
// roof: 'pitched' for a gabled roof of painted sheet iron instead (hill towns), coloured from `roofs`;
// trim: the colour of the roof slabs, floor bands, balconies and steps. fine: the desktop finish
// below (false for distant rows, where the triangles show least).
// On desktops (js/detail.js) each house is finished: a moulded band at every floor, a light frame
// round each window with a sunshade over it, a framed door up two steps, a railing along each
// balcony, often a shop on the ground floor (a shutter, a coloured awning and a signboard), and on a
// flat roof the stair cabin.
const HOUSE_PAINT = ['#e9d9b8', '#d98c5f', '#9fc3c9', '#e7b9b0', '#c9d6a3', '#f1e6cf', '#d6b06a', '#b9a7cf'];
const SIGNS = ['#c2512a', '#2f5d9a', '#e3b23c', '#3c8a5a', '#b3262e', '#f4f1ea'];
let houseGeos = null;
export function townHouses(spots, { seed = 1, y: y0 = 0, paint = HOUSE_PAINT, trim = '#efe9dc', roof = 'flat', roofs = ['#8a3b2a', '#2f5d9a', '#3c7a4f', '#7a7f84'], fine = !detail.low } = {}) {
  if (!houseGeos) houseGeos = {
    body: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
    win: new THREE.BoxGeometry(1.1, 1.5, 0.1).translate(0, 0.75, 0),
    tank: new THREE.CylinderGeometry(0.7, 0.7, 1.4, 10).translate(0, 0.7, 0),
    // A gable roof over a unit block, its ridge along x, eaves overhanging.
    gable: (() => { const sh = new THREE.Shape([[-0.56, 0], [0.56, 0], [0, 0.42]].map(([u, v]) => new THREE.Vector2(u, v))); return new THREE.ExtrudeGeometry(sh, { depth: 1.08, bevelEnabled: false }).translate(0, 0, -0.54).rotateY(Math.PI / 2); })(),
    frame: new THREE.BoxGeometry(1.4, 1.8, 0.06).translate(0, 0.75, -0.01),
    shade: new THREE.BoxGeometry(1.6, 0.07, 0.5).rotateX(0.25).translate(0, 1.72, 0.22),
    door: new THREE.BoxGeometry(1.2, 2.2, 0.1).translate(0, 1.1, 0),
    doorFrame: new THREE.BoxGeometry(1.6, 2.5, 0.08).translate(0, 1.1, -0.02),
    step: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  };
  const R = rng(seed), bodies = [], tints = [], trims = [], wins = [], tanks = [], gables = [], gableTints = [];
  const frames = [], shades = [], doors = [], doorFrames = [], rails = [], shutters = [], awnings = [], awningTints = [], signs = [], signTints = [];
  for (const [x, z, w, d, n, ry = 0, y1 = y0] of spots) {
    // Each house sunk by its own few centimetres, so the floors, balconies and roofs of neighbours
    // that overlap never lie in one plane (they would flicker).
    const y = y1 - R() * 0.12, h = n * 3.2, c = Math.cos(ry), s = Math.sin(ry);
    const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    bodies.push([x, y, z, [w, h, d], ry]);
    tints.push(paint[Math.floor(R() * paint.length)]);
    if (roof === 'pitched') { gables.push([x, y + h, z, [w * 1.1, Math.min(w, d) * 0.9, d * 1.1], ry]); gableTints.push(roofs[Math.floor(R() * roofs.length)]); }
    else trims.push([x, y + h, z, [w + 0.2, 0.9, d + 0.2], ry]);
    const bays = Math.max(1, Math.floor(w / 2.6)), shop = fine && roof === 'flat' && R() < 0.55;
    for (let k = 0; k < n; k++) {
      for (const side of [1, -1]) for (let b = 0; b < bays; b++) {
        if (!k && side > 0 && (b === bays >> 1 || shop)) continue;
        const [wx, wz] = P(-w / 2 + (b + 0.5) * (w / bays), side * (d / 2 + 0.02)), wr = ry + (side > 0 ? 0 : Math.PI);
        wins.push([wx, y + k * 3.2 + 0.9, wz, 1, wr]);
        if (fine) { frames.push([wx, y + k * 3.2 + 0.9, wz, 1, wr]); shades.push([wx, y + k * 3.2 + 0.9, wz, 1, wr]); }
      }
      if (k) {
        const [bx, bz] = P(0, d / 2 + 0.55);
        trims.push([bx, y + k * 3.2 - 0.15, bz, [w * 0.8, 0.15, 1.1], ry]);
        if (fine) { const [rx, rz] = P(0, d / 2 + 1.06); trims.push([rx, y + k * 3.2, rz, [w * 0.8, 0.5, 0.08], ry]); rails.push([rx, y + k * 3.2 + 0.86, rz, [w * 0.8, 0.06, 0.1], ry]); for (const e of [-1, 1]) { const [px, pz] = P(e * w * 0.39, d / 2 + 1.06); rails.push([px, y + k * 3.2 + 0.5, pz, [0.06, 0.38, 0.06], ry]); } trims.push([x, y + k * 3.2 - 0.17, z, [w + 0.12, 0.12, d + 0.12], ry]); }
      }
    }
    if (fine) {
      if (shop) {
        const [sx, sz] = P(0, d / 2 + 0.03), [ax, az] = P(0, d / 2 + 0.6), [gx, gz] = P(0, d / 2 + 0.06);
        shutters.push([sx, y, sz, [w * 0.86, 2.6, 0.06], ry]);
        awnings.push([ax, y + 2.75, az, [w * 0.9, 0.08, 1.2], ry]); awningTints.push(SIGNS[Math.floor(R() * SIGNS.length)]);
        signs.push([gx, y + 2.95, gz, [w * 0.7, 0.55, 0.06], ry]); signTints.push(SIGNS[Math.floor(R() * SIGNS.length)]);
      } else {
        const [dx, dz] = P(0, d / 2 + 0.03), [tx, tz] = P(0, d / 2 + 0.45);
        doors.push([dx, y + 0.3, dz, 1, ry]); doorFrames.push([dx, y + 0.3, dz, 1, ry]);
        const [ux, uz] = P(0, d / 2 + 0.28);
        trims.push([tx, y, tz, [1.8, 0.15, 0.9], ry], [ux, y + 0.15, uz, [1.5, 0.15, 0.5], ry]);
      }
      if (roof === 'flat' && n > 1 && R() < 0.6) { const [mx, mz] = P(w * 0.25, -d * 0.2); trims.push([mx, y + h, mz, [Math.min(2.6, w * 0.3), 2.6, Math.min(2.6, d * 0.3)], ry]); }
    }
    if (roof === 'flat' && R() < 0.7) { const [tx, tz] = P((R() - 0.5) * w * 0.5, -d * 0.2); tanks.push([tx, y + h, tz, 1, 0]); }
  }
  const g = new THREE.Group().add(
    copies(houseGeos.body, TINTED, bodies, tints),
    copies(houseGeos.body, plain(trim, 0.9), trims),
    copies(houseGeos.win, plain('#2b2a2c', 0.6), wins),
  );
  if (tanks.length) g.add(copies(houseGeos.tank, plain('#222222', 0.7), tanks));
  if (gables.length) g.add(copies(houseGeos.gable, TINTED, gables, gableTints));
  if (fine) {
    const add = (geo, m, list, tints) => { if (list.length) g.add(copies(geo, m, list, tints)); };
    add(houseGeos.frame, plain(trim, 0.85), frames);
    add(houseGeos.shade, plain('#d8d1c2', 0.85), shades);
    add(houseGeos.door, TIMBER, doors);
    add(houseGeos.doorFrame, plain(trim, 0.85), doorFrames);
    add(houseGeos.body, IRON, rails);
    add(houseGeos.body, plain('#6f7378', 0.6, 0.3), shutters);
    add(houseGeos.body, TINTED, awnings, awningTints);
    add(houseGeos.body, TINTED, signs, signTints);
  }
  return g;
}
