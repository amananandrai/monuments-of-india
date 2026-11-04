import * as THREE from 'three';
import { M, V, mat, mesh, cyl, at, ellipsoid, capsule, tube, surface, face, fingers } from '../helpers.js';
import { shivaBody, shivaSurface } from './figures.js';
import { snap } from '../sdf.js';
import { lamp } from './doorways.js';
import { mergeByMaterial } from './components.js';

// The great seated Shiva in the Nageshwar temple garden, about 30 m to the tips of his trishul,
// as Mahayogi: cross-legged on a double lotus over a tiger skin, the right hand raised in blessing
// and the left resting on the knee in gyan mudra. The iconography follows the sculpture study in
// "Mahayogi Shiva, 3D sacred sculpture explorer": the jatamukuta of coiled matted locks tied with
// rudraksha and falling in strands to the shoulders, the crescent moon and the Ganga springing from
// the crown, the third eye over three lines of sacred ash, kundala earrings, the cobra Vasuki coiled
// twice round the neck with its hood raised, rudraksha malas at the chest, arms and wrists, the
// sacred thread, a gold waistband and anklets, and the trishul with its damru and saffron pennant.
// That study is about a 6 m figure; its parts are placed here at 3.2 times its size, on the body
// sculpted in figures.js, and laid on its skin with snap() so they neither float nor sink.

const K = 3.2;
// From the study's head frame (head at its origin) to this figure's.
const H = (x, y, z) => [x * K, 21.2 + y * K, 0.3 + z * K];
// From the study's body frame (shoulders at y = 5.32) to this figure's.
const B = (x, y, z) => [x * K, 16 + (y - 5.32) * K, 0.1 + z * K];
const v3 = (p) => new THREE.Vector3(...p);

/* ---------- materials ---------- */

// Procedural textures, drawn once: a fine stone grain, tiger stripes, and cobra scales.
let tex = null;
function textures() {
  if (tex) return tex;
  const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grain = canvas(512, 512, (x) => {
    x.fillStyle = '#808080'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14000; i++) { const v = 110 + Math.floor(rnd() * 36); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
  });
  grain.repeat.set(4, 4);
  const tiger = canvas(512, 512, (x) => {
    const g = x.createRadialGradient(256, 256, 30, 256, 256, 260);
    g.addColorStop(0, '#d97724'); g.addColorStop(0.75, '#b45309'); g.addColorStop(1, '#eee2d0');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = '#1c120c'; x.lineWidth = 8; x.lineCap = 'round';
    for (let y = 30; y < 480; y += 26) { x.beginPath(); x.moveTo(60 + rnd() * 40, y); x.quadraticCurveTo(256, y + (rnd() - 0.5) * 35, 450 - rnd() * 40, y); x.stroke(); }
  });
  const scales = canvas(256, 256, (x) => {
    x.fillStyle = '#2d3329'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = '#141712'; x.lineWidth = 2;
    for (let y = 0; y < 256; y += 16) for (let i = 0; i < 256; i += 16) { x.beginPath(); x.arc(i + ((y / 16) % 2 ? 8 : 0), y, 8.8, 0, Math.PI); x.stroke(); }
  });
  scales.repeat.set(6, 18);
  tex = { grain, tiger, scales };
  return tex;
}
let MAT = null;
function mats() {
  if (MAT) return MAT;
  const t = textures(), plain = (c, r, m, extra = {}) => surface(mat(c, r, m, extra), 'none');
  MAT = {
    // Neelkanth stone: blue-grey, a little glossy, with a fine grain
    body: plain('#5c768d', 0.42, 0.28, { bumpMap: t.grain, bumpScale: 0.018 }),
    hair: plain('#1e242b', 0.68, 0.22, { bumpMap: t.grain, bumpScale: 0.03 }),
    gold: M.gild,
    rudraksha: plain('#5c2c16', 0.78, 0.08, { bumpMap: t.grain, bumpScale: 0.05 }),
    cobra: plain('#363f32', 0.35, 0.45, { bumpMap: t.scales, bumpScale: 0.04 }),
    ventral: plain('#d6c7a1', 0.55, 0.2),
    ash: plain('#f1f5f9', 0.85, 0, { emissive: '#cbd5e1', emissiveIntensity: 0.25 }),
    eye: plain('#ef4444', 0.2, 0, { emissive: '#ff4500', emissiveIntensity: 1.4 }),
    snakeEye: plain('#facc15', 0.4, 0, { emissive: '#eab308', emissiveIntensity: 0.8 }),
    tongue: new THREE.MeshBasicMaterial({ color: '#dc2626' }),
    moon: plain('#fef9c3', 0.15, 0.3, { emissive: '#fde047', emissiveIntensity: 0.6 }),
    ganga: plain('#e0f2fe', 0.1, 0, { emissive: '#7dd3fc', emissiveIntensity: 0.3, transparent: true, opacity: 0.6 }),
    tiger: plain('#ffffff', 0.8, 0.05, { map: t.tiger }),
    wood: plain('#7c2d12', 0.48, 0.25),
    parchment: plain('#fef3c7', 0.75, 0.05),
    cord: plain('#dc2626', 0.6, 0),
    cloth: plain('#ea580c', 0.65, 0, { emissive: '#7c2d12', emissiveIntensity: 0.25, side: THREE.DoubleSide }),
    lotus: mat('#e3a6b4', 0.75),
    lotusDeep: mat('#d3909f', 0.8),
    base: mat('#c4937c', 0.9),
  };
  return MAT;
}

/* ---------- small parts ---------- */

// Rudraksha beads at the given points.
function beads(pts, r, m) {
  const g = new THREE.Group(), geo = new THREE.IcosahedronGeometry(r, 1);
  pts.forEach((p, i) => { const b = mesh(geo, m, ...p); b.rotation.set(i * 1.3, i * 0.7, i * 2.1); g.add(b); });
  return g;
}
// A ring of n beads of radius r round a circle (centre c, radius R) whose axis is `axis`.
function beadRing(c, axis, R, n, r, m) {
  const a = v3(axis).normalize(), u = new THREE.Vector3(0, 1, 0).cross(a);
  if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
  u.normalize();
  const w = a.clone().cross(u), pts = [];
  for (let k = 0; k < n; k++) { const t = (k / n) * Math.PI * 2; pts.push(v3(c).addScaledVector(u, Math.cos(t) * R).addScaledVector(w, Math.sin(t) * R).toArray()); }
  return beads(pts, r, m);
}
// A torus of radius R round the axis through c.
function band(c, axis, R, t, m, arc = Math.PI * 2) {
  const o = mesh(new THREE.TorusGeometry(R, t, 10, 40, arc), m, ...c);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), v3(axis).normalize());
  return o;
}
// Points round the body at height y, laid on the skin `off` out from it.
function girdle(f, y, R, n, off, tilt = 0) {
  const pts = [];
  for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; pts.push(snap(f, [Math.sin(a) * R, y + Math.cos(a) * tilt, Math.cos(a) * R], off)); }
  return pts;
}
const closedTube = (pts, r, m, seg = 120) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v3), true), seg, r, 8, true), m);

/* ---------- the statue ---------- */

export function mahayogiShiva() {
  const g = new THREE.Group(), T = mats(), S = T.body, f = shivaSurface();

  // The double lotus throne (padmapeetha): a drum ringed below by petals turned down, the open
  // lotus above with a gold beaded rim, and the tiger skin (vyaghraambara) spread on the seat and
  // hanging over the front.
  g.add(cyl(7.5, 8.5, 3, T.base, 0, 0, 0, 48), cyl(8.2, 8.2, 1.4, T.lotus, 0, 3, 0, 48));
  const petal = new THREE.SphereGeometry(1, 18, 12);
  const ell = (rx, ry, rz, m, x, y, z) => { const o = mesh(petal, m, x, y, z); o.scale.set(rx, ry, rz); return o; };
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2, p = ell(1.25, 1.55, 0.45, T.lotusDeep, Math.sin(a) * 8.45, 1.5, Math.cos(a) * 8.45);
    p.rotation.set(-0.2, a, 0, 'YXZ');
    g.add(p);
  }
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2, p = ell(1.9, 0.7, 3.2, T.lotus, Math.sin(a) * 7.4, 4.3, Math.cos(a) * 7.4);
    p.rotation.set(-0.5, a, 0, 'YXZ');
    g.add(p);
  }
  g.add(band([0, 4.4, 0], [0, 1, 0], 8.25, 0.2, T.gold));
  g.add(cyl(7.9, 8.0, 0.3, T.tiger, 0, 4.4, 0, 48));
  const apron = ellipsoid(3.1, 1.95, 0.6, T.tiger, 0.5, 3.7, 8.25);
  apron.rotation.x = 0.22;
  g.add(apron);

  // The body as one carved skin, in Neelkanth stone
  g.add(shivaBody(S));

  // Tiger-skin loincloth (krittivasa) round the hips, under a gold waistband (kamarbandh)
  const cloth = ellipsoid(5.2, 1.85, 3.95, T.tiger, 0, 7.6, 0.35);
  g.add(cloth, closedTube(girdle(f, 9.0, 4, 48, 0.14), 0.2, T.gold));
  // Gold anklets (nupura) above the upturned feet
  g.add(band([-3.05, 5.45, 4.7], [-1, 0, 0.12], 1.25, 0.13, T.gold), band([3.05, 5.3, 4.95], [1, 0, 0.12], 1.25, 0.13, T.gold));

  // The sacred thread (yajnopavita) from the left shoulder to the right of the waist
  const janeu = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    janeu.push(snap(f, B(-0.65 * Math.cos(a) + 0.15, 4.45 + 1.12 * Math.cos(a), 0.78 * Math.sin(a) - 0.04), 0.09));
  }
  g.add(closedTube(janeu, 0.08, T.gold, 160));
  // A rudraksha mala hanging on the chest
  const mala = [];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2;
    mala.push(snap(f, [Math.sin(a) * 3.1, 17.3 - Math.max(0, Math.cos(a)) * 3.2, 0.1 + Math.cos(a) * 2.6], 0.27));
  }
  g.add(beads(mala, 0.27, T.rudraksha));
  // Gold and rudraksha armbands (bajubandh) on both upper arms, and malas at the wrists
  for (const [a, b, r] of [[[4.9, 15.6, 0.2], [6.6, 12.4, 1.6], 1.09], [[-4.9, 15.6, 0.2], [-6.4, 12.2, 1.4], 1.09]]) {
    const ax = v3(b).sub(v3(a)), mid = v3(a).lerp(v3(b), 0.45);
    g.add(band(mid.toArray(), ax.toArray(), r + 0.08, 0.13, T.gold), beadRing(mid.clone().addScaledVector(ax.clone().normalize(), -0.42).toArray(), ax.toArray(), r + 0.12, 16, 0.2, T.rudraksha));
  }
  g.add(beadRing([6.86, 15.45, 3.28], [0.3, 3.4, 1.8], 0.86, 14, 0.17, T.rudraksha), beadRing([-6.23, 8.75, 3.35], [0.2, -3.8, 2.2], 0.88, 14, 0.17, T.rudraksha));

  // The right hand raised in blessing (abhaya): its fingers and thumb
  g.add(fingers(V(6.9, 18.0, 3.1), V(6.9, 18.0, 4.3), V(0, 1, 0.1).normalize(), 1.15, 0.2, S), capsule(V(6.95, 16.4, 4.5), V(7.0, 17.3, 5.1), 0.2, S, 0.17));
  // The left hand on the knee in gyan mudra: thumb and forefinger joined in a circle, the other
  // three fingers stretched out
  const loop = band([-5.55, 8.05, 5.55], [1, 0, 0.25], 0.42, 0.115, S, Math.PI * 1.75);
  g.add(loop);
  for (let k = 0; k < 3; k++) g.add(capsule(V(-6.05 - k * 0.27, 7.85, 5.2), V(-6.1 - k * 0.3, 7.45 - k * 0.05, 6.25 - k * 0.11), 0.115, S, 0.085));

  // Vasuki, coiled twice round the neck and rising off the right shoulder with his hood spread
  const coil = [[1.15, 5.15, 0.45], [0.85, 5.42, 0.52], [0, 5.55, 0.56], [-0.62, 5.62, 0.25], [-0.55, 5.68, -0.52], [0.55, 5.72, -0.5], [0.62, 5.78, 0.28], [0, 5.82, 0.52], [-0.68, 5.8, 0.38], [-0.98, 5.65, 0.42]]
    .map(([x, y, z]) => snap(f, B(x, y, z), 0.34));
  coil.push(B(-1.16, 5.95, 0.58), B(-1.18, 6.28, 0.66));
  const body = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil.map(v3)), 120, 0.34, 12, false);
  // The tail tapers to a point.
  const bp = body.attributes.position, centre = new THREE.Vector3(), pt = new THREE.Vector3(), curve = body.parameters.path;
  for (let i = 0; i < bp.count; i++) {
    const t = Math.floor(i / 13) / 120;
    if (t > 0.18) continue;
    curve.getPointAt(t, centre);
    pt.fromBufferAttribute(bp, i).sub(centre).multiplyScalar(0.25 + 0.75 * (t / 0.18));
    bp.setXYZ(i, centre.x + pt.x, centre.y + pt.y, centre.z + pt.z);
  }
  body.computeVertexNormals();
  g.add(mesh(body, T.cobra));
  const hood = new THREE.Group();
  hood.position.set(...B(-1.18, 6.28, 0.66));
  hood.rotation.set(0.08, 0.32, 0);
  hood.add(ellipsoid(0.36 * 1.18 * K, 0.36 * 1.35 * K, 0.36 * 0.26 * K, T.cobra, 0, 0.12 * K, -0.04 * K));
  hood.add(ellipsoid(0.28 * 0.92 * K, 0.28 * 1.22 * K, 0.28 * 0.22 * K, T.ventral, 0, 0.1 * K, 0.02 * K));
  hood.add(ellipsoid(0.18 * 0.95 * K, 0.18 * 0.72 * K, 0.18 * 1.45 * K, T.cobra, 0, 0.36 * K, 0.14 * K));
  for (const x of [-0.12, 0.12]) hood.add(ellipsoid(0.032 * K, 0.032 * K, 0.032 * K, T.snakeEye, x * K, 0.4 * K, 0.24 * K));
  const tongue = cyl(0.008 * K, 0.012 * K, 0.18 * K, T.tongue, 0, 0, 0, 6);
  tongue.rotation.x = Math.PI / 2;
  tongue.position.set(0, 0.32 * K, 0.44 * K);
  hood.add(tongue);
  for (const s of [-1, 1]) {
    const fork = mesh(new THREE.ConeGeometry(0.009 * K, 0.09 * K, 6), T.tongue, s * 0.03 * K, 0.32 * K, 0.55 * K);
    fork.rotation.set(Math.PI / 2, 0, -s * 0.18);
    hood.add(fork);
  }
  g.add(hood);

  // The head: the face, ears with kundala earrings, the third eye over the three lines of ash
  g.add(at(face(2.2, 2.8, 2.3, S), 0, 21.2, 0.3));
  for (const sd of [-1, 1]) {
    g.add(ellipsoid(0.4, 1.0, 0.5, S, sd * 2.2, 21.2, 0.2));
    const ring = mesh(new THREE.TorusGeometry(0.16 * K, 0.032 * K, 12, 28), T.gold, sd * 2.3, 19.85, 0.24);
    ring.rotation.y = Math.PI / 6;
    g.add(ring);
  }
  // The ash lines lie on the forehead, which is the face mesh's own surface (an ellipsoid
  // 2.2 × 2.8 × 2.3 about its centre), just proud of it.
  for (const dy of [-0.21, 0, 0.21]) {
    const y = 22.32 + dy, w = (y - 21.2) / 2.8, ash = [];
    for (let k = 0; k <= 16; k++) { const x = -1.25 + (k / 16) * 2.5, u = x / 2.2; ash.push([x, y, 0.3 + 2.3 * Math.sqrt(Math.max(0, 1 - u * u - w * w)) + 0.05]); }
    g.add(tube(ash, 0.05, T.ash, 32, 6));
  }
  g.add(ellipsoid(0.13, 0.37, 0.09, T.gold, 0, 22.32, 2.44), ellipsoid(0.08, 0.2, 0.06, T.eye, 0, 22.32, 2.5));

  // The jatamukuta: the matted hair over the skull, coiled up in three rings tied with rudraksha,
  // and locks falling to the shoulders and back
  g.add(ellipsoid(2.35, 2.75, 2.45, T.hair, 0, 21.75, -0.15), ellipsoid(1.2, 1.3, 1.2, T.hair, 0, 24.4, 0.04));
  for (const [y, r, t] of [[0.78, 0.44, 0.15], [1.02, 0.35, 0.13], [1.24, 0.24, 0.11]]) {
    const c = mesh(new THREE.TorusGeometry(r * K, t * K, 14, 36), T.hair, ...H(0, y, -0.08));
    c.rotation.x = Math.PI / 2 - 0.08;
    g.add(c);
  }
  g.add(beadRing(H(0, 0.88, -0.08), [0, 1, 0.08], 1.95, 16, 0.18, T.rudraksha));
  [-2.6, -2.2, -1.8, -1.45, -1.1, 1.1, 1.45, 1.8, 2.2, 2.6, 3.0].forEach((a, i) => {
    const sd = a < 0 ? -1 : 1, s = Math.sin(a), c = Math.cos(a);
    const pts = [H(s * 0.55, 0.45, c * 0.55 - 0.1), H(s * 0.85, -0.25, c * 0.72 - 0.15), H(s * 1.25, -0.95, c * 0.78 - 0.12), H(s * 1.42 + sd * 0.1, -1.55 - (i % 3) * 0.2, c * 0.65)];
    // The lower ends rest on the shoulders and back rather than passing into them.
    for (const j of [2, 3]) if (f(...pts[j]) < 0.3) pts[j] = snap(f, pts[j], 0.3);
    g.add(tube(pts, 0.085 * K, T.hair, 28, 8));
  });
  // The crescent moon (Chandrashekhara) in the hair: beads swelling to the middle of the arc
  const moon = new THREE.Group();
  moon.position.set(...H(-0.52, 0.92, 0.25));
  moon.rotation.set(0, -0.25, -0.45);
  for (let i = 0; i <= 28; i++) {
    const fr = i / 28, a = (fr - 0.5) * Math.PI * 1.35, r = (Math.sin(fr * Math.PI) * 0.075 + 0.008) * K;
    const s = mesh(new THREE.SphereGeometry(r, 12, 10), T.moon, Math.sin(a) * 0.32 * K, -Math.cos(a) * 0.32 * K, 0);
    s.scale.z = 0.45;
    moon.add(s);
  }
  g.add(moon);
  // The Ganga springing from the crown and falling in an arc of drops past the right shoulder
  g.add(cyl(0.06 * K, 0.14 * K, 0.22 * K, T.hair, ...H(0.05, 1.31, -0.05), 16));
  const drops = [], dg = new THREE.IcosahedronGeometry(1, 1);
  for (let i = 0; i < 150; i++) {
    const t = ((i + 0.5) / 150) * 0.9, j = Math.sin(i * 12.9898) * 0.5, l = Math.cos(i * 7.31) * 0.5;
    const w = [0.06 + t * 1.45 + j * 0.18 * t, 7.85 + Math.sin(t * Math.PI * 0.85) * 0.75 - Math.pow(t, 1.8) * 3.1 + l * 0.05, -0.05 + t * 0.35 + l * 0.18 * t];
    const d = mesh(dg, T.ganga, ...H(w[0], w[1] - 6.42, w[2] - 0.02));
    d.scale.setScalar(0.05 + 0.06 * (1 - t) * (0.6 + Math.abs(j)));
    d.castShadow = false;
    drops.push(d);
  }
  drops.forEach((d) => g.add(d));

  // The trishul planted beside him, with the lyre-curved outer prongs, the damru bound to its
  // shaft and a saffron pennant below it
  g.add(at(trishul(T), 8.0, 3, 2.2));

  // Offerings at the foot of the throne: a brass water pot (kamandalu) and oil lamps
  const pot = new THREE.Group(), s = 1.6;
  pot.add(at(ellipsoid(0.38 * s, 0.44 * s, 0.38 * s, T.gold), 0, 0.42 * s, 0), cyl(0.14 * s, 0.22 * s, 0.28 * s, T.gold, 0, 0.74 * s, 0, 20));
  pot.add(band([0, 1.02 * s, 0], [0, 1, 0], 0.16 * s, 0.035 * s, T.gold), band([0, 0.98 * s, 0], [0, 0, 1], 0.28 * s, 0.028 * s, T.gold, Math.PI * 1.1));
  g.add(at(pot, 4.5, 0, 9.4));
  for (const x of [-4.5, -2.6]) g.add(at(lamp(2.2), x, 0, 9.6));
  return mergeByMaterial(g);
}

// The trishul, its foot at the origin: a gold shaft with three turned knops below the prongs, the
// central blade and two outer prongs curving out and in again, and the damru and pennant.
function trishul(T) {
  const g = new THREE.Group(), k = 2.6;
  g.add(cyl(0.068 * k, 0.082 * k, 8.6 * k, T.gold, 0, 0, 0, 16));
  [7.8, 8.15, 8.45].forEach((y, i) => g.add(ellipsoid((0.14 - i * 0.015) * 1.2 * k, (0.14 - i * 0.015) * 0.75 * k, (0.14 - i * 0.015) * 1.2 * k, T.gold, 0, y * k, 0)));
  const blade = mesh(new THREE.ConeGeometry(0.14 * k, 1.65 * k, 16).scale(1, 1, 0.28), T.gold, 0, 9.35 * k, 0);
  g.add(blade);
  for (const sd of [-1, 1]) {
    const pts = [[0, 8.48, 0], [sd * 0.48, 8.58, 0], [sd * 0.68, 9.05, 0], [sd * 0.52, 9.62, 0], [sd * 0.34, 10.05, 0]].map(([x, y, z]) => [x * k, y * k, z]);
    const prong = tube(pts, 0.068 * k, T.gold, 36, 10);
    prong.geometry.scale(1, 1, 0.42);
    const tip = mesh(new THREE.ConeGeometry(0.09 * k, 0.38 * k, 12).scale(1, 1, 0.38), T.gold, sd * 0.3 * k, 10.18 * k, 0);
    tip.rotation.z = sd * 0.32;
    g.add(prong, tip);
  }
  // The damru: two cones point to point, drumheads with gold rims, laced, with a crimson knot and
  // two striker cords ending in beads
  const d = new THREE.Group();
  d.position.set(0.22 * k, 6.25 * k, 0.14 * k);
  d.rotation.set(0.22, 0, 0.55);
  d.add(cyl(0.32 * k, 0.09 * k, 0.42 * k, T.wood, 0, 0, 0, 24), cyl(0.09 * k, 0.32 * k, 0.42 * k, T.wood, 0, -0.42 * k, 0, 24));
  for (const y of [-0.43, 0.43]) {
    d.add(cyl(0.33 * k, 0.33 * k, 0.04 * k, T.parchment, 0, y * k - 0.02 * k, 0, 24));
    d.add(band([0, y * k, 0], [0, 1, 0], 0.33 * k, 0.025 * k, T.gold));
  }
  for (let i = 0; i < 12; i++) {
    const a1 = (i / 12) * Math.PI * 2, a2 = ((i + 1) / 12) * Math.PI * 2;
    d.add(capsule(V(Math.cos(a1) * 0.31 * k, 0.42 * k, Math.sin(a1) * 0.31 * k), V(Math.cos(a2) * 0.31 * k, -0.42 * k, Math.sin(a2) * 0.31 * k), 0.03, T.gold));
  }
  d.add(band([0, 0, 0], [0, 1, 0], 0.11 * k, 0.035 * k, T.cord));
  for (const cs of [-1, 1]) {
    d.add(tube([[cs * 0.1 * k, 0, 0], [cs * 0.32 * k, -0.18 * k, 0.12 * k], [cs * 0.38 * k, -0.42 * k, 0.18 * k]], 0.03, T.cord, 12, 6));
    d.add(mesh(new THREE.SphereGeometry(0.048 * k, 12, 10), T.gold, cs * 0.38 * k, -0.42 * k, 0.18 * k));
  }
  g.add(d);
  // The pennant, caught in the wind
  const cloth = new THREE.PlaneGeometry(0.55 * k, 1.85 * k, 10, 20), cp = cloth.attributes.position;
  for (let i = 0; i < cp.count; i++) { const py = cp.getY(i) / k, fct = Math.max(0, (0.925 - py) / 1.85); cp.setZ(i, Math.sin(py * 4.5 + 2.1) * 0.12 * fct * k); }
  cloth.computeVertexNormals();
  const pennant = mesh(cloth, T.cloth, -0.28 * k, 5.45 * k, -0.05 * k);
  pennant.rotation.z = -0.18;
  g.add(pennant);
  g.rotation.set(0, 0.25, -0.03);
  return g;
}
