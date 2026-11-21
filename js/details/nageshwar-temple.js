import * as THREE from 'three';
import { V, mat, mesh, cyl, at, ellipsoid, capsule, tube, surface, face, fingers, doubleSided } from '../helpers.js';
import { shivaBody, shivaSurface } from './figures.js';
import { detail } from '../detail.js';
import { snap } from '../sdf.js';
import { mergeByMaterial } from './components.js';

// The great seated Shiva in the Nageshwar temple garden, about 25 m tall, as photographs show it:
// a figure in painted terracotta-orange concrete, seated cross-legged on a round drum draped in a
// tiger skin whose head glares from the front. He has four arms: the front right raised in
// blessing with the sacred syllable Om painted in red on the palm, the rear right gripping the
// trishul (a serpent wound round its shaft), the rear left raising the damru, and the front left
// resting on his knee with a rudraksha mala. A cobra is coiled round his neck and rises off his
// right shoulder with its hood spread; three long rudraksha malas hang down his chest; coiled
// snakes serve as his armlets; a tiger skin falls from his left shoulder down that side of his
// chest and is wrapped round his hips, ending in a jagged hem. His hair is piled in a tall
// jatamukuta with a crescent moon on its right, falling in locks to the shoulders; across his brow
// runs a pale band of ash with the third eye. The parts are placed in the head and body frames of
// an earlier study (H, B below) on the body sculpted in figures.js, and laid on its skin with
// snap() so they neither float nor sink.

const K = 3.2;
// From the study's head frame (head at its origin) to this figure's.
const H = (x, y, z) => [x * K, 21.2 + y * K, 0.3 + z * K];
// From the study's body frame (shoulders at y = 5.32) to this figure's.
const B = (x, y, z) => [x * K, 16 + (y - 5.32) * K, 0.1 + z * K];
const v3 = (p) => new THREE.Vector3(...p);

/* ---------- materials ---------- */

// Procedural textures, drawn once: a fine grain, fur, snake scales, and Om for the palm.
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
  // Fur carved in the concrete: short strokes, mostly downwards.
  const fur = canvas(256, 256, (x) => {
    x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
    x.lineCap = 'round';
    for (let i = 0; i < 2600; i++) { const v = 70 + Math.floor(rnd() * 110), px = rnd() * 256, py = rnd() * 256; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 1 + rnd() * 2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - 0.5) * 6, py + 6 + rnd() * 8); x.stroke(); }
  });
  fur.repeat.set(5, 5);
  const scales = canvas(256, 256, (x) => {
    x.fillStyle = '#909090'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = '#303030'; x.lineWidth = 2;
    for (let y = 0; y < 256; y += 16) for (let i = 0; i < 256; i += 16) { x.beginPath(); x.arc(i + ((y / 16) % 2 ? 8 : 0), y, 8.8, 0, Math.PI); x.stroke(); }
  });
  scales.repeat.set(6, 18);
  // Om painted in red: the syllable drawn as strokes (a figure like a 3 with a tail, the crescent
  // and the dot), so it needs no font.
  const om = canvas(256, 256, (x) => {
    x.clearRect(0, 0, 256, 256);
    x.strokeStyle = '#b3261a'; x.fillStyle = '#b3261a'; x.lineWidth = 20; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(70, 92); x.bezierCurveTo(100, 60, 150, 80, 128, 118); x.bezierCurveTo(118, 132, 100, 134, 92, 134);
    x.moveTo(92, 134); x.bezierCurveTo(150, 128, 160, 190, 118, 206); x.bezierCurveTo(90, 216, 64, 200, 60, 182); x.stroke();
    x.beginPath(); x.moveTo(126, 150); x.bezierCurveTo(160, 120, 210, 140, 200, 190); x.bezierCurveTo(196, 214, 178, 220, 168, 214); x.stroke();
    x.beginPath(); x.moveTo(150, 70); x.bezierCurveTo(170, 92, 200, 92, 218, 64); x.stroke();
    x.beginPath(); x.arc(186, 44, 10, 0, Math.PI * 2); x.fill();
  });
  om.wrapS = om.wrapT = THREE.ClampToEdgeWrapping;
  tex = { grain, fur, scales, om };
  return tex;
}
let MAT = null;
function mats() {
  if (MAT) return MAT;
  const t = textures(), plain = (c, r, m, extra = {}) => surface(mat(c, r, m, extra), 'none');
  MAT = {
    // Concrete painted a warm terracotta orange, matt, with a fine grain.
    body: plain('#e3a374', 0.72, 0.02, { bumpMap: t.grain, bumpScale: 0.015 }),
    hair: plain('#d2915f', 0.78, 0.02, { bumpMap: t.grain, bumpScale: 0.03 }),
    fur: plain('#d89463', 0.85, 0, { bumpMap: t.fur, bumpScale: 0.06 }),
    trim: plain('#cf8b5a', 0.7, 0.02),
    rudraksha: plain('#7a3826', 0.7, 0.04, { bumpMap: t.grain, bumpScale: 0.05 }),
    snake: plain('#9a4b30', 0.55, 0.06, { bumpMap: t.scales, bumpScale: 0.04 }),
    ventral: plain('#e9b58a', 0.6, 0.02),
    ash: plain('#dfe9ee', 0.8, 0),
    eye: plain('#c2410c', 0.4, 0),
    snakeEye: plain('#facc15', 0.4, 0, { emissive: '#eab308', emissiveIntensity: 0.6 }),
    tigerEye: plain('#e9d33a', 0.3, 0, { emissive: '#d8b80c', emissiveIntensity: 0.7 }),
    tongue: new THREE.MeshBasicMaterial({ color: '#dc2626' }),
    moon: plain('#f1d6b8', 0.5, 0),
    wood: plain('#c27a4c', 0.6, 0.02),
    parchment: plain('#efcfaa', 0.7, 0),
    cord: plain('#a3241c', 0.6, 0),
    om: new THREE.MeshStandardMaterial({ map: t.om, transparent: true, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    base: surface(mat('#cf8f60', 0.9), 'rock'),
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

// A serpent coiled n times round the axis from a to b (radius R, tube r), its head rising at the
// top end: as the armlets and the snake on the trishul.
function coiledSnake(a, b, R, r, turns, T, { head = true } = {}) {
  const A = v3(a), ax = v3(b).sub(A), L = ax.length(), d = ax.clone().normalize();
  const u = new THREE.Vector3(0, 1, 0).cross(d);
  if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
  u.normalize();
  const w = d.clone().cross(u), pts = [], n = Math.max(16, Math.round(turns * 18));
  for (let k = 0; k <= n; k++) { const t = k / n, ang = t * turns * Math.PI * 2; pts.push(A.clone().addScaledVector(d, t * L).addScaledVector(u, Math.cos(ang) * R).addScaledVector(w, Math.sin(ang) * R)); }
  const g = new THREE.Group().add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 3, r, 8, false), T.snake));
  if (head) {
    const p = pts[n], q = p.clone().addScaledVector(d, r * 3).addScaledVector(p.clone().sub(A).sub(d.clone().multiplyScalar(d.dot(p.clone().sub(A)))).normalize(), r * 1.5);
    const hd = ellipsoid(r * 1.5, r * 1.1, r * 2.2, T.snake, ...q.toArray());
    hd.lookAt(q.clone().add(d));
    g.add(capsule(p, q, r * 0.95, T.snake), hd);
  }
  return g;
}

export function mahayogiShiva() {
  const g = new THREE.Group(), T = mats(), S = T.body, f = shivaSurface();

  // The seat: a round drum of rock, a tiger skin spread over its top and hanging down its front,
  // where the tiger's head glares out between its spread forelegs.
  g.add(cyl(8.0, 8.9, 4.4, T.base, 0, 0, 0, 48), cyl(8.15, 8.15, 0.5, T.fur, 0, 3.95, 0, 48));
  const skin = new THREE.Group();
  for (const sd of [-1, 1]) {
    const flap = ellipsoid(3.6, 1.7, 0.5, T.fur, sd * 3.7, 2.3, 7.65);
    flap.rotation.set(0, sd * 0.45, sd * -0.12);
    skin.add(flap, ellipsoid(0.9, 1.6, 0.4, T.fur, sd * 6.6, 1.5, 4.95).rotateY(sd * 0.9));
  }
  const head = at(new THREE.Group(), 0, 2.3, 8.55);
  head.add(ellipsoid(1.75, 1.5, 0.9, T.fur, 0, 0, 0), ellipsoid(1.0, 0.75, 0.7, T.fur, 0, -0.55, 0.55), ellipsoid(0.32, 0.22, 0.2, T.trim, 0, -0.32, 1.18));
  for (const sd of [-1, 1]) head.add(ellipsoid(0.45, 0.42, 0.22, T.fur, sd * 1.25, 1.3, -0.1), ellipsoid(0.17, 0.1, 0.06, T.tigerEye, sd * 0.55, 0.35, 0.8), ellipsoid(0.28, 0.16, 0.18, T.trim, sd * 0.55, 0.52, 0.72));
  const ruff = mesh(new THREE.TorusGeometry(1.75, 0.35, 8, 28), T.fur, 0, 0.1, -0.15);
  ruff.scale.set(1.05, 0.95, 0.6);
  head.add(ruff);
  skin.add(head);
  g.add(skin);

  // The body as one carved skin
  g.add(shivaBody(S, { coarse: detail.low }));

  // The tiger skin round the hips, with its jagged hem lying on the thighs, under a rolled edge.
  g.add(ellipsoid(5.2, 1.85, 3.95, T.fur, 0, 7.6, 0.35), closedTube(girdle(f, 9.0, 4, 48, 0.2), 0.32, T.fur));
  const hem = [];
  for (let k = 0; k < 22; k++) {
    const a = -1.3 + (k / 21) * 2.6, p = [Math.sin(a) * 5.1, 7.4, 0.35 + Math.cos(a) * 3.9];
    const c = mesh(new THREE.ConeGeometry(0.42, 1.0 + (k % 3) * 0.3, 5), T.fur, p[0], p[1] - 0.4, p[2]);
    c.rotation.set(Math.PI + Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35);
    hem.push(c);
  }
  hem.forEach((c) => g.add(c));
  // The tiger skin from the left shoulder (+x) down that side of the chest to the waist, laid on
  // the skin, its lower edge jagged.
  const nu = 10, nv = 14, pos = [], idx = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv, x = 0.9 + u * 3.9, y = 17.4 - v * (6.6 + (j === nv ? (i % 2) * 0.6 : 0)) + Math.max(0, u - 0.6) * 0.8 * (1 - v);
    pos.push(...snap(f, [x, y, 7], 0.16));
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  sg.setAttribute('uv', new THREE.Float32BufferAttribute(Array.from({ length: (nu + 1) * (nv + 1) }, (_, k) => [(k % (nu + 1)) / nu, Math.floor(k / (nu + 1)) / nv]).flat(), 2));
  sg.setIndex(idx);
  sg.computeVertexNormals();
  g.add(mesh(sg, doubleSided(T.fur)));

  // Three long rudraksha malas from the neck, the longest to the navel.
  for (const [drop, wide, n] of [[3.0, 2.6, 30], [4.4, 2.4, 38], [5.8, 2.2, 46]]) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(snap(f, [Math.sin(a) * wide, 17.5 - Math.max(0, Math.cos(a)) * drop, 0.1 + Math.cos(a) * 2.6], 0.3));
    }
    g.add(beads(pts, 0.3, T.rudraksha));
  }
  // Snakes coiled round the front upper arms as armlets, and plain bangles at all four wrists.
  for (const [a, b] of [[[-4.9, 15.6, 0.2], [-6.6, 12.4, 1.6]], [[4.9, 15.6, 0.2], [6.4, 12.2, 1.4]]]) {
    const ax = v3(b).sub(v3(a)), c = v3(a).lerp(v3(b), 0.38);
    g.add(coiledSnake(c.clone().addScaledVector(ax, -0.12).toArray(), c.clone().addScaledVector(ax, 0.12).toArray(), 1.18, 0.2, 2.2, T));
  }
  for (const [c, ax] of [[[-6.86, 15.45, 3.28], [-0.3, 3.4, 1.8]], [[6.23, 8.75, 3.35], [-0.2, -3.8, 2.2]], [[-8.45, 15.0, -0.95], [-1.1, 2.2, 1.0]], [[8.3, 15.8, -0.8], [0.9, 2.8, 1.1]]]) g.add(band(c, ax, 0.86, 0.16, T.trim));

  // The front right hand raised in blessing (abhaya), Om painted on its palm.
  g.add(fingers(V(-6.9, 18.0, 3.1), V(-6.9, 18.0, 4.3), V(0, 1, 0.1).normalize(), 1.15, 0.2, S), capsule(V(-6.4, 16.2, 4.35), V(-6.05, 17.0, 4.7), 0.2, S, 0.17));
  const om = mesh(new THREE.PlaneGeometry(1.0, 1.0), T.om, -6.95, 16.7, 4.8);
  om.castShadow = false;
  g.add(om);
  // The front left hand on the knee, its fingers over the knee and a mala hanging from them.
  for (let k = 0; k < 4; k++) g.add(capsule(V(5.75 + k * 0.28, 7.8, 5.3), V(5.8 + k * 0.32, 7.25 - k * 0.04, 6.2 - k * 0.08), 0.13, S, 0.1));
  g.add(capsule(V(5.4, 7.9, 4.9), V(5.2, 7.6, 5.7), 0.15, S, 0.12));
  const kmala = [];
  for (let i = 0; i < 26; i++) { const t = i / 25; kmala.push(snap(f, [6.0 + t * 2.4, 7.4 - Math.sin(t * Math.PI) * 1.5 - t * 0.6, 5.9 - t * 0.9], 0.2)); }
  g.add(beads(kmala, 0.22, T.rudraksha));

  // The cobra, coiled twice round the neck and rising off the right shoulder with its hood spread
  const coil = [[1.15, 5.15, 0.45], [0.85, 5.42, 0.52], [0, 5.55, 0.56], [-0.62, 5.62, 0.25], [-0.55, 5.68, -0.52], [0.55, 5.72, -0.5], [0.62, 5.78, 0.28], [0, 5.82, 0.52], [-0.68, 5.8, 0.38], [-0.98, 5.65, 0.42]]
    .map(([x, y, z]) => snap(f, B(x, y, z), 0.34));
  coil.push(B(-1.16, 5.95, 0.58), B(-1.18, 6.28, 0.66));
  const body = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil.map(v3)), 120, 0.34, 12, false);
  const bp = body.attributes.position, centre = new THREE.Vector3(), pt = new THREE.Vector3(), curve = body.parameters.path;
  for (let i = 0; i < bp.count; i++) {
    const t = Math.floor(i / 13) / 120;
    if (t > 0.18) continue;
    curve.getPointAt(t, centre);
    pt.fromBufferAttribute(bp, i).sub(centre).multiplyScalar(0.25 + 0.75 * (t / 0.18));
    bp.setXYZ(i, centre.x + pt.x, centre.y + pt.y, centre.z + pt.z);
  }
  body.computeVertexNormals();
  g.add(mesh(body, T.snake));
  const hood = new THREE.Group();
  hood.position.set(...B(-1.18, 6.28, 0.66));
  hood.rotation.set(0.08, 0.32, 0);
  hood.add(ellipsoid(0.36 * 1.18 * K, 0.36 * 1.35 * K, 0.36 * 0.26 * K, T.snake, 0, 0.12 * K, -0.04 * K));
  hood.add(ellipsoid(0.28 * 0.92 * K, 0.28 * 1.22 * K, 0.28 * 0.22 * K, T.ventral, 0, 0.1 * K, 0.02 * K));
  hood.add(ellipsoid(0.18 * 0.95 * K, 0.18 * 0.72 * K, 0.18 * 1.45 * K, T.snake, 0, 0.36 * K, 0.14 * K));
  for (const x of [-0.12, 0.12]) hood.add(ellipsoid(0.032 * K, 0.032 * K, 0.032 * K, T.snakeEye, x * K, 0.4 * K, 0.24 * K));
  g.add(hood);

  // The head: the face, ears with round earrings, the third eye on a pale band of ash
  g.add(at(face(2.2, 2.8, 2.3, S), 0, 21.2, 0.3));
  for (const sd of [-1, 1]) {
    g.add(ellipsoid(0.4, 1.0, 0.5, S, sd * 2.2, 21.2, 0.2));
    const ring = mesh(new THREE.TorusGeometry(0.16 * K, 0.04 * K, 12, 28), T.trim, sd * 2.3, 19.85, 0.24);
    ring.rotation.y = Math.PI / 6;
    g.add(ring);
  }
  for (const dy of [-0.21, 0, 0.21]) {
    const y = 22.32 + dy, w = (y - 21.2) / 2.8, ash = [];
    for (let k = 0; k <= 16; k++) { const x = -1.25 + (k / 16) * 2.5, u = x / 2.2; ash.push([x, y, 0.3 + 2.3 * Math.sqrt(Math.max(0, 1 - u * u - w * w)) + 0.05]); }
    g.add(tube(ash, 0.08, T.ash, 32, 6));
  }
  g.add(ellipsoid(0.13, 0.3, 0.09, T.eye, 0, 22.32, 2.47));

  // The jatamukuta: the hair over the skull, coiled up in rings to a tall knot, and locks falling
  // to the shoulders and back
  g.add(ellipsoid(2.35, 2.75, 2.45, T.hair, 0, 21.75, -0.15), ellipsoid(1.2, 1.3, 1.2, T.hair, 0, 24.4, 0.04), ellipsoid(0.7, 1.0, 0.7, T.hair, 0, 25.9, 0.04));
  for (const [y, r, t] of [[0.78, 0.44, 0.15], [1.02, 0.35, 0.13], [1.24, 0.24, 0.11]]) {
    const c = mesh(new THREE.TorusGeometry(r * K, t * K, 14, 36), T.hair, ...H(0, y, -0.08));
    c.rotation.x = Math.PI / 2 - 0.08;
    g.add(c);
  }
  [-2.6, -2.2, -1.8, -1.45, -1.1, 1.1, 1.45, 1.8, 2.2, 2.6, 3.0].forEach((a, i) => {
    const sd = a < 0 ? -1 : 1, s = Math.sin(a), c = Math.cos(a);
    const pts = [H(s * 0.55, 0.45, c * 0.55 - 0.1), H(s * 0.85, -0.25, c * 0.72 - 0.15), H(s * 1.25, -0.95, c * 0.78 - 0.12), H(s * 1.42 + sd * 0.1, -1.55 - (i % 3) * 0.2, c * 0.65)];
    for (const j of [2, 3]) if (f(...pts[j]) < 0.3) pts[j] = snap(f, pts[j], 0.3);
    g.add(tube(pts, 0.085 * K, T.hair, 28, 8));
  });
  // The crescent moon on the right of the knot
  const moon = new THREE.Group();
  moon.position.set(...H(-0.52, 0.92, 0.25));
  moon.rotation.set(0, -0.25, -0.45);
  for (let i = 0; i <= 28; i++) {
    const fr = i / 28, a = (fr - 0.5) * Math.PI * 1.35, r = (Math.sin(fr * Math.PI) * 0.075 + 0.008) * K;
    const sp = mesh(new THREE.SphereGeometry(r, 12, 10), T.moon, Math.sin(a) * 0.32 * K, -Math.cos(a) * 0.32 * K, 0);
    sp.scale.z = 0.45;
    moon.add(sp);
  }
  g.add(moon);

  // The trishul in the rear right hand, its foot on the seat, a serpent wound round its shaft;
  // the damru raised in the rear left hand.
  g.add(at(trishul(T, 1.85), -8.75, 4.4, -0.6));
  g.add(coiledSnake([-8.75, 5.4, -0.6], [-8.75, 10.6, -0.6], 0.42, 0.2, 2.6, T));
  const dm = at(damru(T, 2.6), 8.6, 18.6, -0.3);
  dm.rotation.set(Math.PI / 2 - 0.45, 0, 0.25);
  g.add(dm);
  return mergeByMaterial(g);
}

// The trishul, its foot at the origin, k metres to the unit: a shaft with three turned knops below
// the prongs, the central blade and two outer prongs curving out and in again; in the statue's
// own painted concrete.
function trishul(T, k) {
  const g = new THREE.Group(), m = T.body;
  g.add(cyl(0.085 * k, 0.1 * k, 8.6 * k, m, 0, 0, 0, 16));
  [7.8, 8.15, 8.45].forEach((y, i) => g.add(ellipsoid((0.14 - i * 0.015) * 1.2 * k, (0.14 - i * 0.015) * 0.75 * k, (0.14 - i * 0.015) * 1.2 * k, m, 0, y * k, 0)));
  g.add(mesh(new THREE.ConeGeometry(0.16 * k, 1.65 * k, 16).scale(1, 1, 0.3), m, 0, 9.35 * k, 0));
  for (const sd of [-1, 1]) {
    const pts = [[0, 8.48, 0], [sd * 0.48, 8.58, 0], [sd * 0.68, 9.05, 0], [sd * 0.52, 9.62, 0], [sd * 0.34, 10.05, 0]].map(([x, y, z]) => [x * k, y * k, z]);
    const prong = tube(pts, 0.075 * k, m, 36, 10);
    prong.geometry.scale(1, 1, 0.45);
    const tip = mesh(new THREE.ConeGeometry(0.1 * k, 0.38 * k, 12).scale(1, 1, 0.4), m, sd * 0.3 * k, 10.18 * k, 0);
    tip.rotation.z = sd * 0.32;
    g.add(prong, tip);
  }
  return g;
}

// The damru, its axis along y, k metres to the unit: two cones point to point, drumheads with
// rims, laced, a red knot at the waist and two striker cords ending in beads.
function damru(T, k) {
  const d = new THREE.Group();
  d.add(cyl(0.32 * k, 0.09 * k, 0.42 * k, T.wood, 0, 0, 0, 24), cyl(0.09 * k, 0.32 * k, 0.42 * k, T.wood, 0, -0.42 * k, 0, 24));
  for (const y of [-0.43, 0.43]) {
    d.add(cyl(0.33 * k, 0.33 * k, 0.04 * k, T.parchment, 0, y * k - 0.02 * k, 0, 24));
    d.add(band([0, y * k, 0], [0, 1, 0], 0.33 * k, 0.03 * k, T.trim));
  }
  for (let i = 0; i < 12; i++) {
    const a1 = (i / 12) * Math.PI * 2, a2 = ((i + 1) / 12) * Math.PI * 2;
    d.add(capsule(V(Math.cos(a1) * 0.31 * k, 0.42 * k, Math.sin(a1) * 0.31 * k), V(Math.cos(a2) * 0.31 * k, -0.42 * k, Math.sin(a2) * 0.31 * k), 0.03, T.trim));
  }
  d.add(band([0, 0, 0], [0, 1, 0], 0.11 * k, 0.035 * k, T.cord));
  for (const cs of [-1, 1]) {
    d.add(tube([[cs * 0.1 * k, 0, 0], [cs * 0.32 * k, -0.18 * k, 0.12 * k], [cs * 0.38 * k, -0.42 * k, 0.18 * k]], 0.03, T.cord, 12, 6));
    d.add(mesh(new THREE.SphereGeometry(0.048 * k, 12, 10), T.trim, cs * 0.38 * k, -0.42 * k, 0.18 * k));
  }
  return d;
}
