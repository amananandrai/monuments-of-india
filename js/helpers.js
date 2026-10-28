import * as THREE from 'three';
import { attachSurface, surface } from './surface.js';
export { surface };

export const mat = (color, roughness = 0.85, metalness = 0, extra = {}) =>
  attachSurface(new THREE.MeshStandardMaterial({ color, roughness, metalness, envMapIntensity: 0.7, ...extra }));

// Water: a dark body colour, since most of what reads as water is the sky reflected at a low angle,
// and ripples of the given [wavelength in metres, speed, steepness].
function water(color, wave) {
  const m = surface(mat(color, 0.06, 0, { envMapIntensity: 1 }), 'water');
  m.userData.wave = wave;
  return m;
}

export const M = {
  marble: mat('#f2eee6', 0.45),
  marbleShade: mat('#c9c0b0', 0.6),
  recess: mat('#4a3f38', 0.9),
  red: mat('#a4553b', 0.85),
  redLight: mat('#b86b4f', 0.85),
  buff: mat('#cfae86', 0.85),
  basalt: mat('#c4a46c', 0.85),
  plaster: mat('#ddd3bf', 0.85),
  granite: mat('#a08d70', 0.9),
  graniteDark: mat('#7d6d57', 0.9),
  pink: mat('#e3ad93', 0.8),
  pinkShade: mat('#c98f77', 0.85),
  puri: mat('#e4ddcf', 0.85),
  puriShade: mat('#b8ab95', 0.9),
  bronze: mat('#8a6644', 0.45, 0.6),
  steel: mat('#8e9ba5', 0.5, 0.55),
  gold: mat('#d6a640', 0.3, 0.85),
  concrete: mat('#aaa59b', 0.9),
  asphalt: surface(mat('#3c3c40', 0.9), 'ground'),
  water: water('#2b5b63', [1.2, 0.5, 0.05]),
  sea: water('#1d4458', [9, 0.6, 0.06]),
  river: water('#4b5847', [4, 0.9, 0.05]),
  lake: water('#24505a', [5, 0.4, 0.035]),
  grass: mat('#6b8a4c', 0.95),
  path: mat('#cdbd9c', 0.95),
  bank: mat('#7d7059', 0.95),
  stoneDark: mat('#2d2a2a', 0.8),
  wood: surface(mat('#5b4330', 0.8), 'ground'),
  gild: mat('#e3b54a', 0.28, 0.85),
  gildDeep: mat('#b8862a', 0.38, 0.75),
  hawa: mat('#df8f78', 0.85),
  hawaLight: mat('#eba792', 0.85),
  lime: mat('#f3ede2', 0.85),
  khond: mat('#7f705f', 0.95),
  khondDark: mat('#5f5347', 0.95),
  stucco: mat('#e9dcc0', 0.85),
  lotus: mat('#f4f3ef', 0.4, 0, { side: THREE.DoubleSide }),
  deccan: mat('#8d877c', 0.9),
  deccanLight: mat('#b3ada1', 0.85),
  mysore: mat('#bcb3a4', 0.85),
  mysoreRose: mat('#d8a29c', 0.7),
  sanchi: mat('#c8a885', 0.9),
  bodh: mat('#c3b294', 0.9),
  leaf: mat('#4e7c3b', 0.95, 0, { flatShading: true }),
  flagSaffron: surface(mat('#ff9933', 0.7), 'none'),
  flagWhite: surface(mat('#f6f6f2', 0.7), 'none'),
  flagGreen: surface(mat('#138808', 0.7), 'none'),
  navy: surface(mat('#06038d', 0.6), 'none'),
  cream: mat('#e5d2aa', 0.85),
  khaj: mat('#d4b48c', 0.9),
  khajShade: mat('#b39570', 0.9),
  ranak: mat('#efe7d6', 0.6),
  soap: mat('#7d7a6b', 0.9),
  soapDark: mat('#5e5c50', 0.9),
  saffron: surface(mat('#ef7d1a', 0.7, 0, { side: THREE.DoubleSide }), 'none'),
  flagRed: surface(mat('#d23a24', 0.7, 0, { side: THREE.DoubleSide }), 'none'),
};

// Objects shown only in the night scene (e.g. festival lighting); applyTheme toggles them.
export const nightState = { on: false, objects: [] };

export const flatCache = new Map();

export const flat = (m) => {
  if (!flatCache.has(m)) { const c = attachSurface(m.clone()); c.flatShading = true; c.userData.keepFacets = true; flatCache.set(m, c); }
  return flatCache.get(m);
};


export const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function mesh(geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

export const box = (w, h, d, m, x = 0, y = 0, z = 0) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z);

// A sea or river as one flat sheet at height y: no sides to cut through banks and ghats, and no
// bottom face lying near the ground.
export function sheet(w, d, m, x = 0, y = 0, z = 0) {
  const o = mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), m, x, y, z);
  o.castShadow = false;
  return o;
}

export const cyl = (rt, rb, h, m, x = 0, y = 0, z = 0, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y + h / 2, z);

export const ring = (r, h, m, y = 0, seg = 40) => {
  const o = mesh(new THREE.CylinderGeometry(r, r, h, seg, 1, true), m, 0, y + h / 2, 0);
  o.material = m.side === THREE.DoubleSide ? m : doubleSided(m);
  return o;
};

export const dsCache = new Map();

export function doubleSided(m) {
  if (!dsCache.has(m)) { const c = attachSurface(m.clone()); c.side = THREE.DoubleSide; dsCache.set(m, c); }
  return dsCache.get(m);
}

export const lathe = (pts, m, seg = 40) => mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), m);

export function group(...kids) { const g = new THREE.Group(); kids.forEach((k) => g.add(k)); return g; }

export function at(o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); return o; }

// Place an object on the face of a building whose outward normal points at `angle` (0 = +z).
export function onFace(o, angle, dist, lat = 0) {
  o.position.x = Math.sin(angle) * dist + Math.cos(angle) * lat;
  o.position.z = Math.cos(angle) * dist - Math.sin(angle) * lat;
  o.rotation.y = angle;
  return o;
}

export const FACES = [0, Math.PI / 2, Math.PI, -Math.PI / 2];


export function strut(a, b, t, m) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(t, t, a.distanceTo(b)), m);
  o.position.copy(a).add(b).multiplyScalar(0.5);
  o.lookAt(b);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

export function limb(a, b, r1, r2, m) {
  const o = mesh(new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), 20), m);
  o.position.copy(a).add(b).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return o;
}


export function archTop(p, r, s, pointed) {
  if (pointed) {
    p.bezierCurveTo(-r, s + r * 0.75, -r * 0.3, s + r * 1.1, 0, s + r * 1.4);
    p.bezierCurveTo(r * 0.3, s + r * 1.1, r, s + r * 0.75, r, s);
  } else {
    p.absarc(0, s, r, Math.PI, 0, true);
  }
}

export const rise = (r, pointed) => (pointed ? r * 1.4 : r);

// A wall of w×h×d with an arch of width aw and apex height ah cut through it (front/back faces on ±z).
export function archWall(w, h, d, aw, ah, pointed, m) {
  const r = aw / 2, s = ah - rise(r, pointed);
  const p = new THREE.Shape();
  p.moveTo(-w / 2, 0); p.lineTo(-r, 0); p.lineTo(-r, s);
  archTop(p, r, s, pointed);
  p.lineTo(r, 0); p.lineTo(w / 2, 0); p.lineTo(w / 2, h); p.lineTo(-w / 2, h); p.closePath();
  const geo = new THREE.ExtrudeGeometry(p, { depth: d, bevelEnabled: false, curveSegments: 18 });
  geo.translate(0, 0, -d / 2);
  return mesh(geo, m);
}

// The soffit of a barrel vault running along z, open underneath and seen from inside.
export function barrelVault(radius, length, m) {
  const geo = new THREE.CylinderGeometry(radius, radius, length, 28, 1, true, -Math.PI / 2, Math.PI);
  geo.rotateX(-Math.PI / 2);
  const o = mesh(geo, doubleSided(m));
  o.castShadow = false;
  return o;
}

// A thin arch-shaped slab, used for niches and recessed arches on facades (faces +z).
export function archPanel(aw, ah, pointed, m, depth = 0.3) {
  const r = aw / 2, s = ah - rise(r, pointed);
  const p = new THREE.Shape();
  p.moveTo(-r, 0); p.lineTo(-r, s);
  archTop(p, r, s, pointed);
  p.lineTo(r, 0); p.closePath();
  return mesh(new THREE.ExtrudeGeometry(p, { depth, bevelEnabled: false, curveSegments: 14 }), m);
}


export const ONION = [[0.86, 0], [0.98, 0.18], [1.06, 0.45], [1.0, 0.75], [0.8, 1.05], [0.5, 1.32], [0.22, 1.58], [0.06, 1.78], [0, 1.85]];

export function onionDome(r, m) {
  return lathe(ONION.map(([a, b]) => [a * r, b * r]), m, 48);
}

export function hemi(r, m, seg = 32) {
  return mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg / 2), 0, Math.PI * 2, 0, Math.PI / 2), m);
}

export function finial(h, m = M.gold) {
  const g = new THREE.Group();
  g.add(cyl(h * 0.03, h * 0.05, h * 0.75, m, 0, 0, 0, 8));
  g.add(at(mesh(new THREE.SphereGeometry(h * 0.09, 12, 8), m), 0, h * 0.32, 0));
  g.add(at(mesh(new THREE.SphereGeometry(h * 0.07, 12, 8), m), 0, h * 0.52, 0));
  g.add(cyl(0, h * 0.04, h * 0.25, m, 0, h * 0.75, 0, 8));
  return g;
}

export function kalash(s, m = M.gold) {
  return lathe([[0, 0], [0.32, 0], [0.45, 0.22], [0.38, 0.42], [0.14, 0.52], [0.24, 0.6], [0.1, 0.72], [0.05, 1.0], [0, 1.12]]
    .map(([a, b]) => [a * s, b * s]), m, 24);
}

export function bell(r, m) {
  return lathe([[r, 0], [r * 0.96, r * 0.28], [r * 0.72, r * 0.68], [r * 0.38, r * 0.95], [0, r * 1.05]], m, 32);
}

export function chhatri(r, h, m, domeM = m) {
  const g = new THREE.Group();
  g.add(cyl(r * 1.05, r * 1.05, h * 0.06, m));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(cyl(r * 0.07, r * 0.07, h * 0.38, m, Math.cos(a) * r * 0.82, h * 0.06, Math.sin(a) * r * 0.82, 6));
  }
  g.add(cyl(r * 1.0, r * 1.25, h * 0.07, m, 0, h * 0.44));
  g.add(at(onionDome(r * 0.95, domeM), 0, h * 0.51, 0));
  g.add(at(finial(r * 0.9), 0, h * 0.51 + r * 1.72, 0));
  return g;
}

export function minaret(h, r, m, { balconies = 3, cap = 'chhatri', seg = 16, capM = m } = {}) {
  const g = new THREE.Group();
  const shaftTop = h * 0.8;
  g.add(cyl(r * 1.3, r * 1.35, h * 0.04, m, 0, 0, 0, seg));
  let y = h * 0.04, rt = r;
  const sec = (shaftTop - y) / balconies;
  for (let i = 0; i < balconies; i++) {
    const rb = r * (1 - 0.14 * i / balconies);
    rt = r * (1 - 0.14 * (i + 1) / balconies);
    g.add(cyl(rt, rb, sec, m, 0, y, 0, seg));
    y += sec;
    const bh = Math.max(0.3, r * 0.28);
    g.add(cyl(rt * 1.55, rt * 1.05, bh, m, 0, y - bh, 0, seg));
    g.add(ring(rt * 1.55, bh * 1.1, m, y, seg));
  }
  if (cap === 'chhatri') g.add(at(chhatri(rt * 1.25, h - y, m, capM), 0, y, 0));
  else {
    g.add(cyl(rt * 0.95, rt * 0.95, r * 1.2, m, 0, y, 0, seg));
    g.add(at(onionDome(rt * 1.1, capM), 0, y + r * 1.2, 0));
    g.add(at(finial(r * 1.4), 0, y + r * 1.2 + rt * 2.0, 0));
  }
  return g;
}

// Curvilinear temple tower built from stacked cross-shaped slices; prof(t) gives width at height t∈[0,1].
export function shikhara(baseW, h, m, prof, n = 16) {
  const g = new THREE.Group();
  const sh = h / n;
  for (let i = 0; i < n; i++) {
    const w = baseW * prof(i / n), y = i * sh;
    g.add(box(w * 0.84, sh, w * 0.84, m, 0, y, 0));
    g.add(box(w, sh * 0.8, w * 0.6, m, 0, y, 0));
    g.add(box(w * 0.6, sh * 0.8, w, m, 0, y, 0));
  }
  const top = baseW * prof(1);
  g.add(box(top * 0.62, sh * 0.7, top * 0.62, m, 0, h, 0));
  const ar = top * 0.64, ay = h + sh * 0.7;
  const am = mesh(new THREE.SphereGeometry(ar, 28, 10), flat(m), 0, ay + ar * 0.42, 0);
  am.scale.y = 0.42;
  g.add(am);
  const ky = ay + ar * 0.84;
  g.add(at(kalash(top * 0.65), 0, ky, 0));
  g.userData.top = ky + top * 0.65 * 1.12;
  g.userData.topW = top;
  return g;
}

// Stacked horizontal slabs (pida roof) from width w0 to w1.
export function pidaRoof(w0, w1, count, u, m, mRecess) {
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < count; i++) {
    const w = w0 + (w1 - w0) * (i / Math.max(1, count - 1));
    g.add(box(w, u, w, m, 0, y, 0));
    g.add(box(w - u * 1.6, u * 0.55, w - u * 1.6, mRecess, 0, y + u, 0));
    y += u * 1.55;
  }
  g.userData.top = y;
  return g;
}

export function flag(h, m, poleM = M.wood) {
  const g = new THREE.Group();
  g.add(cyl(h * 0.012, h * 0.016, h, poleM, 0, 0, 0, 6));
  const s = new THREE.Shape();
  s.moveTo(0, h); s.lineTo(h * 0.55, h * 0.88); s.lineTo(0, h * 0.74); s.closePath();
  g.add(mesh(new THREE.ShapeGeometry(s), m));
  return g;
}


export function nagaraProfile(t) { return 1 - 0.6 * Math.pow(t, 1.45); }

export function mandap(w, h, roofCount, m, shade) {
  const g = new THREE.Group();
  g.add(box(w - 3, h, w - 3, shade));
  const n = Math.max(3, Math.round(w / 2.6));
  for (let i = 0; i <= n; i++) {
    const t = -w / 2 + 0.6 + (i / n) * (w - 1.2);
    for (const [x, z] of [[t, w / 2 - 0.6], [t, -w / 2 + 0.6], [w / 2 - 0.6, t], [-w / 2 + 0.6, t]]) g.add(cyl(0.38, 0.42, h, m, x, 0, z, 8));
  }
  g.add(box(w + 1, 1, w + 1, m, 0, h));
  const roof = pidaRoof(w * 0.92, w * 0.42, roofCount, 0.9, m, shade);
  g.add(at(roof, 0, h + 1, 0));
  const ry = h + 1 + roof.userData.top;
  g.add(at(bell(w * 0.2, m), 0, ry, 0));
  g.add(at(kalash(w * 0.12), 0, ry + w * 0.2, 0));
  return g;
}

export function kalingaProfile(t) { return 1 - 0.44 * Math.pow(t, 2.3); }

// Radial ribs on a lathe or cylinder, e.g. a lotus-ribbed dome.
export function ribbed(o, n, amt) {
  const p = o.geometry.attributes.position;
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k), z = p.getZ(k);
    if (Math.hypot(x, z) < 1e-3) continue;
    const f = 1 + amt * Math.abs(Math.cos(Math.atan2(z, x) * n / 2));
    p.setX(k, x * f); p.setZ(k, z * f);
  }
  o.geometry.computeVertexNormals();
  return o;
}

export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}


export function wheel(r, m) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.TorusGeometry(r, r * 0.11, 6, 28), m));
  g.add(mesh(new THREE.TorusGeometry(r * 0.78, r * 0.04, 4, 28), m));
  const hub = mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, r * 0.35, 12), m);
  hub.rotation.x = Math.PI / 2;
  g.add(hub);
  for (let i = 0; i < 8; i++) {
    const s = mesh(new THREE.BoxGeometry(i % 2 ? r * 0.05 : r * 0.12, r * 2, r * 0.08), m);
    s.rotation.z = (i * Math.PI) / 8;
    g.add(s);
  }
  return g;
}

export function horse(m) {
  const g = new THREE.Group();
  g.add(ellipsoid(0.72, 0.72, 1.6, m, 0, 2.1, 0), ellipsoid(0.66, 0.7, 0.6, m, 0, 2.2, 1.1), ellipsoid(0.66, 0.66, 0.6, m, 0, 2.15, -1.1));
  g.add(capsule(V(0, 2.5, 1.3), V(0, 3.75, 2.05), 0.42, m, 0.3), capsule(V(0, 3.85, 2.1), V(0, 3.4, 3.0), 0.3, m, 0.2));
  for (const x of [-0.12, 0.12]) g.add(cyl(0, 0.08, 0.32, m, x, 4.05, 2.15, 6));
  for (const [x, z] of [[-0.38, 1.05], [0.38, 1.05], [-0.38, -1.15], [0.38, -1.15]]) {
    g.add(capsule(V(x, 2.0, z), V(x, 1.0, z + 0.05), 0.24, m, 0.15), capsule(V(x, 1.0, z + 0.05), V(x, 0.12, z), 0.13, m, 0.12));
  }
  g.add(tube([[0, 4.0, 1.95], [0, 3.6, 1.6], [0, 3.0, 1.25]], 0.12, m, 16, 6));
  g.add(tube([[0, 2.4, -1.7], [0, 2.0, -2.0], [0, 1.2, -2.05]], 0.14, m, 16, 6));
  return g;
}

export const PAINT = ['#3d7cc0', '#d4493a', '#e6b13a', '#4c9a5a', '#f0e8d6', '#b65aa0', '#e07a2e'];

export const paintMats = PAINT.map((c) => mat(c, 0.75));

// Dravidian gateway tower: granite base, then tapering storeys of painted stucco figures and a barrel-vault crown.
const paletteMats = new Map();
export function gopuram(w, d, h, tiers, seed, palette = PAINT) {
  if (!paletteMats.has(palette)) paletteMats.set(palette, palette.map((c) => mat(c, 0.75)));
  const pm = paletteMats.get(palette);
  const g = new THREE.Group(), R = rng(seed), figs = [];
  const bh = h * 0.2;
  g.add(box(w, bh * 0.3, d, M.graniteDark), box(w * 0.96, bh * 0.7, d * 0.96, M.granite, 0, bh * 0.3));
  g.add(box(w * 0.2, bh * 0.85, d + 0.2, M.recess));
  g.add(box(w * 1.02, bh * 0.08, d * 1.02, M.graniteDark, 0, bh));
  const th = (h * 0.68) / tiers;
  let y = bh * 1.08, tw = w, td = d;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    tw = w * (1 - 0.55 * t); td = d * (1 - 0.5 * t);
    g.add(box(tw, th * 0.74, td, M.stucco, 0, y));
    g.add(box(tw + 0.6, th * 0.26, td + 0.6, pm[(i + seed) % pm.length], 0, y + th * 0.74));
    const nx = Math.max(2, Math.floor(tw / 1.3)), nz = Math.max(1, Math.floor(td / 1.3));
    for (let k = 0; k < nx; k++) for (const s of [-1, 1]) figs.push([-tw / 2 + (k + 0.5) * (tw / nx), y + th * 0.08, s * (td / 2 + 0.22), 0.75, th * (0.45 + R() * 0.2), 0.45]);
    for (let k = 0; k < nz; k++) for (const s of [-1, 1]) figs.push([s * (tw / 2 + 0.22), y + th * 0.08, -td / 2 + (k + 0.5) * (td / nz), 0.45, th * (0.45 + R() * 0.2), 0.75]);
    y += th;
  }
  const sr = td * 0.32, sl = tw * 0.92;
  const shala = mesh(new THREE.CylinderGeometry(sr, sr, sl, 18), M.stucco, 0, y + sr * 0.5, 0);
  shala.rotation.z = Math.PI / 2;
  g.add(shala);
  const nk = Math.max(3, Math.round(sl / 2.6) | 1);
  for (let k = 0; k < nk; k++) g.add(at(kalash(Math.min(2.2, sr * 0.9), M.gild), -sl / 2 + (k + 0.5) * (sl / nk), y + sr * 1.45, 0));
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff', 0.75), figs.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  figs.forEach(([x, fy, z, sx, sy, sz], i) => {
    o.position.set(x, fy + sy / 2, z);
    o.scale.set(sx, sy, sz);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    im.setColorAt(i, c.set(palette[Math.floor(R() * palette.length)]));
  });
  im.castShadow = true;
  im.receiveShadow = true;
  g.add(im);
  return g;
}

// One marble petal as a curved shell; its spine is a quadratic curve in (radius, height), and it faces +z.
export function petal(P0, P1, P2, halfW, bulge, segU = 12, segV = 28) {
  const pos = [], idx = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV, a = (1 - v) * (1 - v), b = 2 * (1 - v) * v, c = v * v;
    const r = a * P0[0] + b * P1[0] + c * P2[0], y = a * P0[1] + b * P1[1] + c * P2[1];
    const dr = 2 * (1 - v) * (P1[0] - P0[0]) + 2 * v * (P2[0] - P1[0]);
    const dy = 2 * (1 - v) * (P1[1] - P0[1]) + 2 * v * (P2[1] - P1[1]);
    const len = Math.hypot(dr, dy) || 1, nr = dy / len, ny = -dr / len;
    const w = halfW * Math.sin(Math.PI * (0.15 + 0.85 * v));
    for (let i = 0; i <= segU; i++) {
      const u = -1 + (2 * i) / segU, off = bulge * w * (1 - u * u);
      pos.push(u * w, y + ny * off, r + nr * off);
    }
  }
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
    const p = j * (segU + 1) + i;
    idx.push(p, p + segU + 1, p + 1, p + 1, p + segU + 1, p + segU + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return mesh(geo, M.lotus);
}

export function instBoxes(list, m) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, list.length);
  const o = new THREE.Object3D();
  list.forEach(([x, y, z, sx, sy, sz], i) => {
    o.position.set(x, y + sy / 2, z);
    o.scale.set(sx, sy, sz);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}


// Instanced copies of a base-anchored geometry: list items are [x, y, z, sx, sy, sz, rotY?].
export function inst(geo, list, m) {
  const im = new THREE.InstancedMesh(geo, m, list.length);
  const o = new THREE.Object3D();
  list.forEach(([x, y, z, sx, sy, sz, ry = 0], i) => {
    o.position.set(x, y, z);
    o.rotation.set(0, ry, 0);
    o.scale.set(sx, sy, sz);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

export const unitBox = () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);

export const unitCyl = (seg = 12) => new THREE.CylinderGeometry(0.5, 0.5, 1, seg).translate(0, 0.5, 0);

export const unitHemi = (seg = 20) => new THREE.SphereGeometry(0.5, seg, Math.max(4, seg / 2), 0, Math.PI * 2, 0, Math.PI / 2);

export const unitSpire = () => new THREE.ConeGeometry(0.5, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0);

// Points spaced along the edges of a rectangle, for colonnades and rows of shrine cells.
export function aroundRect(w, d, step, inset = 0) {
  const pts = [], hw = w / 2 - inset, hd = d / 2 - inset;
  for (let x = -hw; x <= hw + 1e-6; x += step) pts.push([x, -hd, 0], [x, hd, Math.PI]);
  for (let z = -hd + step; z < hd - 1e-6; z += step) pts.push([-hw, z, Math.PI / 2], [hw, z, -Math.PI / 2]);
  return pts;
}

// A square prism with chamfered corners (Mughal tomb plan), base at y = 0.
export function chamferPrism(s, c, h, m) {
  const sh = new THREE.Shape();
  sh.moveTo(-s + c, -s); sh.lineTo(s - c, -s); sh.lineTo(s, -s + c); sh.lineTo(s, s - c);
  sh.lineTo(s - c, s); sh.lineTo(-s + c, s); sh.lineTo(-s, s - c); sh.lineTo(-s, -s + c); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return mesh(geo, m);
}

// A star-shaped prism (Hoysala stellate plan), base at y = 0.
export function starPrism(n, rO, rI, h, m) {
  const sh = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? rI : rO;
    if (i === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return mesh(geo, m);
}

// A half-ring arch spanning between two points at the same height.
export function hoopArch(a, b, m, tube = 0.18) {
  const r = a.distanceTo(b) / 2;
  const o = mesh(new THREE.TorusGeometry(r, tube, 6, 18, Math.PI), m);
  o.position.copy(a).add(b).multiplyScalar(0.5);
  o.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
  return o;
}


export function persianDome(r, m) {
  return lathe([[1, 0], [1.04, 0.35], [0.96, 0.72], [0.72, 1.02], [0.4, 1.2], [0, 1.27]].map(([a, b]) => [a * r, b * r]), m, 48);
}

export function domeBands(cx, cy, cz, r, m) {
  const g = new THREE.Group();
  for (const t of [0.22, 0.5, 0.8]) {
    const i = Math.floor(t * (ONION.length - 1)), u = t * (ONION.length - 1) - i;
    const rr = (ONION[i][0] + (ONION[i + 1][0] - ONION[i][0]) * u) * r, yy = (ONION[i][1] + (ONION[i + 1][1] - ONION[i][1]) * u) * r;
    g.add(cyl(rr * 1.015, rr * 1.015, r * 0.06, m, cx, cy + yy - r * 0.03, cz, 48));
  }
  return g;
}

export function stellateTower(r, h, m, md, tiers = 7) {
  const g = new THREE.Group(), th = h / tiers;
  for (let i = 0; i < tiers; i++) {
    const rr = r * (1 - (0.55 * i) / tiers);
    g.add(at(starPrism(16, rr, rr * 0.82, th * 0.7, m), 0, i * th, 0), at(starPrism(16, rr * 1.04, rr * 0.86, th * 0.3, md), 0, i * th + th * 0.7, 0));
  }
  const tr = r * 0.45;
  g.add(at(ribbed(hemi(tr, m, 32), 16, 0.08), 0, h, 0), at(kalash(tr * 0.9), 0, h + tr * 0.95, 0));
  return g;
}

export function bulbPoints(pts) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color(2.4, 1.8, 0.8), size: 0.55, sizeAttenuation: true }));
  p.visible = nightState.on;
  nightState.objects.push(p);
  return p;
}

export function torana(m) {
  const g = new THREE.Group();
  for (const x of [-2.4, 2.4]) g.add(box(0.9, 6.5, 0.9, m, x), box(1.6, 1.4, 1.6, m, x, 6.5));
  for (let k = 0; k < 3; k++) {
    const y = 7.9 + k * 1.7;
    g.add(box(8.6, 0.55, 0.6, m, 0, y));
    for (const x of [-4.4, 4.4]) {
      const v = cyl(0.42, 0.42, 0.62, m, 0, 0, 0, 12);
      v.rotation.x = Math.PI / 2;
      v.position.set(x, y + 0.27, 0);
      g.add(v);
    }
    if (k < 2) for (const x of [-1.5, 0, 1.5]) g.add(box(0.45, 1.15, 0.45, m, x, y + 0.55));
  }
  g.add(at(mesh(new THREE.TorusGeometry(0.7, 0.12, 6, 20), m), 0, 12.6, 0));
  for (const x of [-2.4, 2.4]) g.add(box(0.3, 1.2, 0.3, m, x, 11.95));
  return g;
}

export function tricolour(h) {
  const g = new THREE.Group();
  g.add(cyl(0.12, 0.16, h, M.flagWhite, 0, 0, 0, 8));
  const w = 6, s = 4 / 3;
  [M.flagSaffron, M.flagWhite, M.flagGreen].forEach((m, i) => g.add(box(w, s, 0.1, m, w / 2 + 0.15, h - s * (i + 1), 0)));
  g.add(at(mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 24), M.navy), w / 2 + 0.15, h - s * 1.5, 0));
  return g;
}

// A hipped roof over a w×d rectangle, base at y = 0.
export function hipRoof(w, d, h, m) {
  const o = mesh(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), m);
  o.scale.set(w, h, d);
  return o;
}
// A stylised elephant facing +z, standing at y = 0.
export function elephant(m, s = 1) {
  const g = new THREE.Group();
  g.add(ellipsoid(1.25, 1.15, 1.85, m, 0, 2.25, 0), ellipsoid(0.92, 0.98, 0.9, m, 0, 2.75, 1.85));
  for (const x of [-1, 1]) {
    const ear = ellipsoid(0.12, 0.85, 0.72, m, x * 0.92, 2.7, 1.55);
    ear.rotation.y = x * 0.35;
    g.add(ear);
  }
  g.add(tube([[0, 2.55, 2.65], [0, 1.9, 3.15], [0, 1.0, 3.2], [0, 0.45, 3.0]], 0.24, m, 24, 10));
  for (const x of [-0.42, 0.42]) g.add(tube([[x, 2.15, 2.45], [x * 1.1, 1.7, 2.95], [x * 0.9, 1.75, 3.35]], 0.08, m, 12, 6));
  for (const [x, z] of [[-0.72, 1.1], [0.72, 1.1], [-0.72, -1.1], [0.72, -1.1]]) g.add(capsule(V(x, 1.7, z), V(x, 0.25, z), 0.42, m, 0.4));
  g.add(tube([[0, 2.6, -1.8], [0, 2.0, -2.0], [0, 1.4, -1.95]], 0.07, m, 12, 6));
  g.scale.setScalar(s);
  return g;
}
// A Lucknow-style roof turret (guldasta): slender fluted shaft, tiny onion dome and spike.
export function guldasta(h, r, m) {
  const g = new THREE.Group();
  g.add(cyl(r, r * 1.2, h, m, 0, 0, 0, 8), cyl(r * 1.5, r * 1.5, h * 0.06, m, 0, h * 0.55, 0, 8));
  g.add(at(onionDome(r * 1.3, m), 0, h, 0), at(finial(r * 2.2), 0, h + r * 2.3, 0));
  return g;
}
// A North Indian (Nagara) temple along the z axis: the sanctum and its curved spire at z = 0,
// with halls (mandapas) stepping out towards +z. halls: [[width, wallHeight, roofTiers, 'pida' | 'dome']].
export function nagaraTemple({
  w = 12, h = 22, m, shade = m, spireM = m, plinth = 2, urus = 4, uruScale = 0.5,
  halls = [[14, 8, 4]], prof = nagaraProfile, flagM = M.saffron, hallM = m, crown = null,
} = {}) {
  const g = new THREE.Group();
  const sw = w * 1.15;
  g.add(box(sw, w * 0.7, sw, m, 0, plinth, 0));
  const sy = plinth + w * 0.7;
  const spire = shikhara(w, h, spireM, prof, 16);
  g.add(at(spire, 0, sy, 0), at(crown || flag(Math.max(3, w * 0.45), flagM), 0, sy + spire.userData.top - 0.5, 0));
  const ring = (n, dist, scale, hs) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (n === 4 ? 0 : Math.PI / n);
      g.add(onFace(at(shikhara(w * scale, h * hs, spireM, prof, 10), 0, sy, 0), a, dist));
    }
  };
  if (urus >= 4) ring(4, w * 0.5, uruScale, 0.62);
  if (urus >= 8) ring(4, w * 0.72, uruScale * 0.62, 0.38);
  let z = sw / 2;
  for (const [hw, hh, tiers, kind = 'pida'] of halls) {
    z += hw / 2;
    g.add(box(hw, hh, hw, hallM, 0, plinth, z), box(hw + 0.8, 0.6, hw + 0.8, shade, 0, plinth + hh, z));
    const ry = plinth + hh + 0.6;
    if (kind === 'dome') {
      g.add(cyl(hw * 0.36, hw * 0.36, hw * 0.12, hallM, 0, ry, z, 24), at(onionDome(hw * 0.36, spireM), 0, ry + hw * 0.12, z), at(kalash(hw * 0.12), 0, ry + hw * 0.12 + hw * 0.65, z));
    } else {
      const r = pidaRoof(hw * 0.95, hw * 0.4, tiers, Math.max(0.6, hw * 0.06), hallM, shade);
      g.add(at(r, 0, ry, z), at(bell(hw * 0.18, hallM), 0, ry + r.userData.top, z), at(kalash(hw * 0.12), 0, ry + r.userData.top + hw * 0.18, z));
    }
    z += hw / 2;
  }
  g.add(box(sw + 8, plinth, z + sw / 2 + 6, shade, 0, 0, (z - sw / 2) / 2 + 3));
  for (let k = 0; k < 4; k++) g.add(box(6, plinth - k * (plinth / 4), 1.5, shade, 0, 0, z + 6.75 + k * 1.5));
  g.userData.length = z;
  return g;
}
// A Tibetan-style block: whitewashed walls, dark tapering windows and a maroon parapet band.
const TIB_WHITE = mat('#efece4', 0.85), TIB_MAROON = mat('#6b2a22', 0.85), TIB_WINDOW = mat('#2a2220', 0.8);
export function tibetanBlock(w, h, d, floors = 2, wallM = TIB_WHITE) {
  const g = new THREE.Group();
  g.add(box(w, h, d, wallM), box(w + 0.3, Math.min(1.6, h * 0.14), d + 0.3, TIB_MAROON, 0, h - Math.min(1.6, h * 0.14)));
  const n = Math.max(1, Math.floor(w / 3.4));
  for (let fl = 0; fl < floors; fl++) for (let k = 0; k < n; k++) {
    g.add(onFace(box(1.1, 1.5, 0.2, TIB_WINDOW, 0, 0.8 + fl * ((h * 0.8) / floors)), 0, d / 2, -w / 2 + (k + 0.5) * (w / n)));
  }
  return g;
}
export const TIBETAN = { white: TIB_WHITE, maroon: TIB_MAROON, window: TIB_WINDOW };

/* ---------- smooth organic forms, for statues and animals ---------- */
export function ellipsoid(rx, ry, rz, m, x = 0, y = 0, z = 0) {
  const o = mesh(new THREE.SphereGeometry(1, 40, 28), m, x, y, z);
  o.scale.set(rx, ry, rz);
  return o;
}
// A tapered capsule from a (radius r1) to b (radius r2): limbs, necks, trunks.
export function capsule(a, b, r1, m, r2 = r1) {
  const len = a.distanceTo(b), pts = [];
  for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(1e-4, Math.cos(t) * r1), Math.sin(t) * r1)); }
  for (let i = 0; i <= 8; i++) { const t = (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(1e-4, Math.cos(t) * r2), len + Math.sin(t) * r2)); }
  const o = mesh(new THREE.LatheGeometry(pts, 28), m);
  o.position.copy(a);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return o;
}
// A smooth tube through points [[x, y, z], ...]: vines, snakes, tails, draped cloth ends.
export function tube(points, r, m, seg = 64, radial = 12) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  return mesh(new THREE.TubeGeometry(curve, seg, r, radial, false), m);
}
// A lathe whose profile is a smooth spline through [[radius, y], ...].
export function smoothLathe(pts, m, seg = 72, samples = 72) {
  const curve = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
  return mesh(new THREE.LatheGeometry(curve.getPoints(samples).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y)), seg), m);
}
// Vertical folds in cloth: ripple a lathe's radius, strongest at yFrom and fading to nothing at yTo.
export function drape(o, folds, amp, yFrom, yTo) {
  const pos = o.geometry.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const w = Math.min(1, Math.max(0, (v.y - yTo) / (yFrom - yTo)));
    if (w <= 0) continue;
    const a = Math.atan2(v.x, v.z), k = 1 + amp * w * Math.cos(folds * a + Math.sin(a * 3) * 0.6);
    pos.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  o.geometry.computeVertexNormals();
  return o;
}
