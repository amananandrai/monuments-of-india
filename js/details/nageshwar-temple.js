import * as THREE from 'three';
import { V, mat, mesh, cyl, at, ellipsoid, capsule, tube, lathe, surface, doubleSided } from '../helpers.js';
import { shivaBody, shivaSurface } from './figures.js';
import { detail } from '../detail.js';
import { snap, normalAt } from '../sdf.js';
import { mergeByMaterial } from './components.js';

// The great seated Shiva in the Nageshwar temple garden, about 25 m tall, as photographs show it:
// a figure in painted terracotta-orange concrete, seated in the half lotus on a mound of rock draped
// in a tiger skin whose head glares from the front. He has four arms: the front right raised in
// blessing with the sacred syllable Om painted in red on the palm, the rear right gripping the
// trishul (a serpent wound round its shaft), the rear left raising the damru, and the front left
// resting on his knee with a rudraksha mala; thick anklets at both ankles. A cobra is coiled round
// his neck, its hood raised upright off his right shoulder beside his ear and its tail hanging down
// his chest; two long rudraksha malas hang in a V to his navel; coiled snakes serve as his armlets;
// a tiger skin falls from his left shoulder over that half of his chest, and another is wrapped
// round his hips, falling over his lap in rounded lobes. His hair is combed up into a tall knot
// with a small crescent moon at its right, falling in locks behind his ears to the shoulders;
// across his brow is painted a broad pale band of ash with the third eye upright at its middle, and
// his eyes are painted under lowered lids. The parts are placed in the head and body frames of
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
  // The band of ash: pale blue-white, its three lines a shade darker.
  const ash = canvas(256, 64, (x) => {
    x.fillStyle = '#dbe7ee'; x.fillRect(0, 0, 256, 64);
    x.fillStyle = '#b8ccd8';
    for (const y of [15, 31, 47]) x.fillRect(0, y - 2, 256, 4);
  });
  ash.wrapS = ash.wrapT = THREE.ClampToEdgeWrapping;
  // Hair combed in strands: long wavy lines running one way, light ridges and dark grooves.
  const combed = canvas(256, 256, (x) => {
    x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const v = 40 + Math.floor(rnd() * 170), x0 = rnd() * 256, ph = rnd() * 6;
      x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 1.5 + rnd() * 2.5; x.beginPath();
      for (let y = 0; y <= 256; y += 8) x.lineTo(x0 + 3 * Math.sin(y / 30 + ph), y);
      x.stroke();
    }
  });
  combed.repeat.set(10, 1);
  tex = { grain, fur, scales, om, ash, combed };
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
    combed: plain('#d2915f', 0.78, 0.02, { bumpMap: t.combed, bumpScale: 0.09 }),
    fur: plain('#d89463', 0.85, 0, { bumpMap: t.fur, bumpScale: 0.06 }),
    trim: plain('#cf8b5a', 0.7, 0.02),
    rudraksha: plain('#7a3826', 0.7, 0.04, { bumpMap: t.grain, bumpScale: 0.05 }),
    snake: plain('#9a4b30', 0.55, 0.06, { bumpMap: t.scales, bumpScale: 0.04 }),
    ventral: plain('#e9b58a', 0.6, 0.02),
    eyeWhite: new THREE.MeshStandardMaterial({ color: '#f1ebe1', roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }),
    iris: new THREE.MeshStandardMaterial({ color: '#6b5242', roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -4 }),
    pupil: new THREE.MeshStandardMaterial({ color: '#1d140f', roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -6 }),
    // Paint laid on the skin: the dark lines of the lids and brows, the band of ash, the third eye.
    paint: new THREE.MeshStandardMaterial({ color: '#4a2a1c', roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -1 }),
    ashBand: new THREE.MeshStandardMaterial({ map: t.ash, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }),
    thirdEye: new THREE.MeshStandardMaterial({ color: '#7a2e1c', roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -4 }),
    snakeEye: plain('#facc15', 0.4, 0, { emissive: '#eab308', emissiveIntensity: 0.6 }),
    tigerEye: plain('#e9d33a', 0.3, 0, { emissive: '#d8b80c', emissiveIntensity: 0.7 }),
    tongue: new THREE.MeshBasicMaterial({ color: '#dc2626' }),
    moon: plain('#cfe0ea', 0.5, 0),
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
// A sheet laid on the skin `off` out from it: grid points p(u, v) (u, v from 0 to 1, nu by nv
// cells), each started from in front of the body and snapped onto it; with uv coordinates.
function skinSheet(f, p, nu, nv, off) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { pos.push(...snap(f, p(i / nu, j / nv, i, j), off)); uv.push(i / nu, 1 - j / nv); }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
// An almond, w across and h from its middle to the top of its upper curve, its lower curve
// shallower: an eye, or the third eye turned upright.
function almond(w, h) {
  const sh = new THREE.Shape();
  sh.moveTo(-w, 0); sh.quadraticCurveTo(0, h * 2, w, 0); sh.quadraticCurveTo(0, -h * 1.3, -w, 0);
  return new THREE.ShapeGeometry(sh, 12);
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

  // The seat: a rounded mound of rock spreading to its foot, a tiger skin spread over its top and
  // hanging down its front, where the tiger's head glares out between its spread forelegs.
  g.add(lathe([[10.4, 0], [10.2, 0.7], [9.6, 1.9], [8.8, 3.1], [8.25, 3.95], [8.0, 4.4], [0, 4.4]], T.base, 64), cyl(8.15, 8.15, 0.5, T.fur, 0, 3.95, 0, 48));
  const skin = new THREE.Group();
  for (const sd of [-1, 1]) {
    const flap = ellipsoid(3.6, 1.7, 0.5, T.fur, sd * 3.8, 2.4, 8.7);
    flap.rotation.set(0, sd * 0.45, sd * -0.12);
    skin.add(flap, ellipsoid(0.9, 1.6, 0.4, T.fur, sd * 7.9, 1.5, 5.95).rotateY(sd * 0.9));
  }
  const head = at(new THREE.Group(), 0, 2.3, 9.45);
  head.add(ellipsoid(1.75, 1.5, 0.9, T.fur, 0, 0, 0), ellipsoid(1.0, 0.75, 0.7, T.fur, 0, -0.55, 0.55), ellipsoid(0.32, 0.22, 0.2, T.trim, 0, -0.32, 1.18));
  for (const sd of [-1, 1]) head.add(ellipsoid(0.45, 0.42, 0.22, T.fur, sd * 1.25, 1.3, -0.1), ellipsoid(0.17, 0.1, 0.06, T.tigerEye, sd * 0.55, 0.35, 0.8), ellipsoid(0.28, 0.16, 0.18, T.trim, sd * 0.55, 0.52, 0.72));
  const ruff = mesh(new THREE.TorusGeometry(1.75, 0.35, 8, 28), T.fur, 0, 0.1, -0.15);
  ruff.scale.set(1.05, 0.95, 0.6);
  head.add(ruff);
  skin.add(head);
  g.add(skin);

  // The body as one carved skin
  g.add(shivaBody(S, { coarse: detail.low }));

  // The tiger skin wrapped round the hips under a thick rolled edge at the waist, falling over the
  // lap in two layers of rounded, uneven lobes, as the carved fur ends.
  g.add(ellipsoid(5.2, 1.85, 3.95, T.fur, 0, 7.6, 0.35), closedTube(girdle(f, 9.0, 4, 48, 0.2), 0.36, T.fur));
  const lobeGeo = new THREE.SphereGeometry(1, 12, 6);
  for (let k = 0; k < 17; k++) {
    const a = -1.45 + (k / 16) * 2.9, w = 0.86 + 0.14 * Math.sin(k * 2.3);
    const p = new THREE.Vector3(Math.sin(a) * 5.35, 7.55 - 0.15 * Math.abs(Math.sin(k * 1.7)), 0.35 + Math.cos(a) * 4.1), nrm = new THREE.Vector3(Math.sin(a) / 5.2, 0, Math.cos(a) / 3.95).normalize();
    const lobe = mesh(lobeGeo, T.fur, ...p.toArray());
    lobe.scale.set(w, 0.8 + 0.12 * Math.cos(k * 1.3), 0.18);
    lobe.lookAt(p.clone().add(nrm));
    lobe.rotateX(-0.45);
    g.add(lobe);
  }
  // The tiger skin from the left shoulder (+x) over that half of the chest to the waist, laid on the
  // skin, its inner edge ragged down the middle of the chest and its lower edge jagged. Each point
  // starts just in front of the chest, so none is drawn up onto the chin.
  g.add(mesh(skinSheet(f, (u, v, i, j) => {
    const x0 = 0.75 + 0.3 * Math.abs(Math.sin(v * 9.0)) + 0.15 * Math.sin(v * 23);
    return [x0 + u * (5.1 - x0), 17.3 + 0.6 * u - v * (8.0 + 0.6 * u + (j === 18 ? (i % 2) * 0.5 : 0)) + Math.max(0, u - 0.6) * 0.8 * (1 - v), 4.2];
  }, 12, 18, 0.24), doubleSided(T.fur)));

  // Two long rudraksha malas from the neck, hanging in a V to the navel, their beads strung close,
  // and a tassel of beads at the point of the longer.
  const strand = (drop, r) => {
    const path = [];
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200 - 0.5) * Math.PI * 1.2, fr = Math.max(0, 1 - Math.abs(a) / (Math.PI * 0.62));
      path.push(v3(snap(f, [Math.sin(a) * 2.5, 17.4 - drop * Math.pow(fr, 1.25), 0.1 + Math.cos(a) * 2.6], 0.3 + r)));
    }
    const pts = [];
    let run = 0;
    for (let i = 1; i < path.length; i++) { run += path[i].distanceTo(path[i - 1]); if (run >= r * 1.6) { pts.push(path[i].toArray()); run = 0; } }
    return { pts, tip: path[100] };
  };
  const long = strand(6.0, 0.4), short = strand(4.8, 0.36);
  g.add(beads(long.pts, 0.4, T.rudraksha), beads(short.pts, 0.36, T.rudraksha));
  g.add(beads([0.78, 1.5].map((d) => snap(f, long.tip.clone().add(v3([0, -d, 0])).toArray(), 0.3 + 0.42)), 0.42, T.rudraksha));
  // Snakes coiled round the front upper arms as armlets, and plain bangles at all four wrists.
  for (const [a, b] of [[[-4.9, 15.6, 0.2], [-6.6, 12.4, 1.6]], [[4.9, 15.6, 0.2], [6.4, 12.2, 1.4]]]) {
    const ax = v3(b).sub(v3(a)), c = v3(a).lerp(v3(b), 0.38);
    g.add(coiledSnake(c.clone().addScaledVector(ax, -0.12).toArray(), c.clone().addScaledVector(ax, 0.12).toArray(), 1.18, 0.2, 2.2, T));
  }
  for (const [c, ax] of [[[-6.86, 15.45, 3.28], [-0.3, 3.4, 1.8]], [[6.23, 8.75, 3.35], [-0.2, -3.8, 2.2]], [[-8.45, 15.0, -0.95], [-1.1, 2.2, 1.0]], [[8.3, 15.8, -0.8], [0.9, 2.8, 1.1]]]) g.add(band(c, ax, 0.86, 0.16, T.trim));

  // The front right hand raised in blessing (abhaya), Om painted on its palm.
  // (The hand and its fingers are carved in the body, figures.js.)
  const omAt = snap(f, [-6.95, 16.7, 5], 0.03);
  const om = mesh(new THREE.PlaneGeometry(0.95, 0.95), T.om, ...omAt);
  om.castShadow = false;
  g.add(om);
  // The front left hand on the knee (carved in the body), a mala hanging from its fingers.
  const kmala = [];
  for (let i = 0; i < 26; i++) { const t = i / 25; kmala.push(snap(f, [6.0 + t * 2.4, 7.4 - Math.sin(t * Math.PI) * 1.5 - t * 0.6, 5.9 - t * 0.9], 0.2)); }
  g.add(beads(kmala, 0.22, T.rudraksha));

  // The cobra: its tail hanging from the left of the neck down the chest over the malas, its tip
  // curling up at the belly; its body coiled twice round the neck; and its neck rising straight off
  // the right shoulder to the hood, spread upright beside the head at the height of the ear, the
  // head bent forward over it.
  const tail = [[1.9, 10.95, 4], [1.55, 10.5, 4], [1.05, 10.8, 4], [0.95, 11.6, 4], [1.35, 13.0, 4], [2.0, 14.3, 4], [2.9, 15.3, 3.5]].map((q) => snap(f, q, 0.5));
  const coil = [[1.15, 5.15, 0.45], [0.85, 5.42, 0.52], [0, 5.55, 0.56], [-0.62, 5.62, 0.25], [-0.55, 5.68, -0.52], [0.55, 5.72, -0.5], [0.62, 5.78, 0.28], [0, 5.82, 0.52], [-0.68, 5.8, 0.38], [-0.98, 5.65, 0.42]]
    .map(([x, y, z]) => snap(f, B(x, y, z), 0.34));
  const neckTop = [-3.8, 20.5, 1.25];
  coil.unshift(...tail);
  coil.push([-3.5, 18.1, 1.4], [-3.75, 19.4, 1.25], neckTop);
  const body = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil.map(v3)), 180, 0.34, 12, false);
  const bp = body.attributes.position, centre = new THREE.Vector3(), pt = new THREE.Vector3(), curve = body.parameters.path;
  for (let i = 0; i < bp.count; i++) {
    // The tail tapers to its tip; the neck narrows a little under the hood.
    const t = Math.floor(i / 13) / 180, k = t < 0.2 ? 0.25 + 0.75 * (t / 0.2) : t > 0.94 ? 1 - 0.3 * ((t - 0.94) / 0.06) : 1;
    if (k === 1) continue;
    curve.getPointAt(t, centre);
    pt.fromBufferAttribute(bp, i).sub(centre).multiplyScalar(k);
    bp.setXYZ(i, centre.x + pt.x, centre.y + pt.y, centre.z + pt.z);
  }
  body.computeVertexNormals();
  g.add(mesh(body, T.snake));
  const hood = new THREE.Group();
  hood.position.set(neckTop[0], neckTop[1] + 0.85, neckTop[2] - 0.05);
  hood.rotation.set(0, 0.12, 0);
  hood.add(ellipsoid(0.72, 1.5, 0.24, T.snake, 0, 0, 0));
  hood.add(ellipsoid(0.48, 1.22, 0.18, T.ventral, 0, -0.08, 0.1));
  const snout = ellipsoid(0.45, 0.33, 0.75, T.snake, 0, 1.3, 0.35);
  snout.rotation.x = 0.35;
  hood.add(snout);
  for (const x of [-0.2, 0.2]) hood.add(ellipsoid(0.08, 0.08, 0.08, T.snakeEye, x, 1.42, 0.68));
  g.add(hood);
  // Thick anklets at both ankles.
  g.add(band([2.9, 5.85, 4.9], [9.8, 0.3, 1.4], 1.4, 0.24, T.trim), band([-2.9, 4.8, 5.3], [-9.6, -0.85, 2.0], 1.32, 0.24, T.trim));

  // The head (its face and ears carved in the body): round earrings, and the third eye on a pale
  // band of ash across the brow, laid on the forehead.
  for (const sd of [-1, 1]) {
    const ring = mesh(new THREE.TorusGeometry(0.16 * K, 0.04 * K, 12, 28), T.trim, sd * 2.3, 19.85, 0.24);
    ring.rotation.y = Math.PI / 6;
    g.add(ring);
  }
  // The band of ash painted across the brow from temple to temple, and the third eye painted
  // upright at its middle.
  const ashBand = mesh(skinSheet(f, (u, v) => [-1.75 + u * 3.5, 22.2 + (1 - v) * 0.58, 2.55 + 0.4 * Math.cos((u - 0.5) * 2.2)], 28, 4, 0.02), T.ashBand);
  ashBand.castShadow = false;
  g.add(ashBand);
  const painted = (geo, m, p, lift) => {
    const c = snap(f, p, lift), n = v3(normalAt(f, c)), o = mesh(geo, m, ...c);
    o.lookAt(v3(c).add(n));
    o.castShadow = false;
    g.add(o);
    return o;
  };
  painted(almond(0.075, 0.2).rotateZ(Math.PI / 2), T.thirdEye, [0, 22.49, 2.95], 0.03);
  // The eyes, painted as on the statue: almond whites under lowered lids, light-brown irises half
  // hidden by the upper lid, a dark line along it; and dark brows arched above.
  // A disc of radius r at (cx, cy) in the eye's plane, cut off above by the upper lid's curve.
  const underLid = (r, cx, cy, w, h) => {
    const sh = new THREE.Shape();
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, x = cx + Math.cos(a) * r, y = Math.min(cy + Math.sin(a) * r, h * (1 - (x / w) ** 2) - 0.008); i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
    return new THREE.ShapeGeometry(sh);
  };
  for (const sd of [-1, 1]) {
    painted(almond(0.4, 0.14), T.paint, [sd * 0.77, 21.32, 2.65], 0.012);
    painted(almond(0.36, 0.115), T.eyeWhite, [sd * 0.77, 21.3, 2.65], 0.017);
    painted(underLid(0.105, 0, 0.055, 0.36, 0.115), T.iris, [sd * 0.77, 21.3, 2.65], 0.022);
    painted(underLid(0.045, 0, 0.055, 0.36, 0.115), T.pupil, [sd * 0.77, 21.3, 2.65], 0.026);
    const brow = [];
    for (let k = 0; k <= 10; k++) { const t = k / 10; brow.push(snap(f, [sd * (0.22 + t * 1.05), 21.84 + 0.12 * Math.sin(Math.PI * (0.25 + 0.75 * t)), 2.95 - 0.35 * t], 0.02)); }
    g.add(tube(brow, 0.04, T.paint, 20, 5));
  }

  // The jatamukuta: the hair over the skull, combed up from the hairline to a tall knot of strands
  // twisted upwards and leaning forward at its tip, like a flame; and locks falling in waves behind
  // the ears to the shoulders and back.
  // The scalp's hair is combed up to the knot (its strands converge on the top, as the sphere's
  // meridians do); the knot's run up it.
  g.add(ellipsoid(2.35, 2.75, 2.45, T.combed, 0, 21.75, -0.15));
  const knot = [[1.38, 0], [1.52, 0.6], [1.36, 1.3], [1.0, 2.0], [0.55, 2.55], [0.1, 2.85], [0, 2.9]];
  g.add(at(lathe(knot, T.combed, 32), 0, 23.55, -0.05));
  // Twisted strands lying on the knot, their ends turned forward at its tip.
  const strands = detail.low ? 7 : 14;
  for (let k = 0; k < strands; k++) {
    const a0 = (k / strands) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6, a = a0 + t * 1.1, y = t * 2.75, r = 0.06 + (t < 0.2 ? 1.38 + 0.7 * t : 1.52 - (1.45 * (t - 0.2)) / 0.8); pts.push([Math.sin(a) * r, 23.55 + y, -0.05 + Math.cos(a) * r + 0.35 * t * t * t]); }
    g.add(tube(pts, 0.11, T.hair, 18, 6));
  }
  [-2.6, -2.2, -1.8, 1.8, 2.2, 2.6, 3.0].forEach((a, i) => {
    const sd = a < 0 ? -1 : 1, s = Math.sin(a), c = Math.cos(a), w = 0.08 * (i % 2 ? 1 : -1);
    const pts = [H(s * 0.55, 0.45, c * 0.55 - 0.1), H(s * 0.85 + w, -0.25, c * 0.72 - 0.15), H(s * 1.25 - w, -0.95, c * 0.78 - 0.12), H(s * 1.36 + sd * 0.06 + w, -1.3, c * 0.72), H(s * 1.42 + sd * 0.1 - w, -1.6 - (i % 3) * 0.2, c * 0.65)];
    for (const j of [2, 3, 4]) if (f(...pts[j]) < 0.3) pts[j] = snap(f, pts[j], 0.3);
    g.add(tube(pts, 0.075 * K, T.hair, 28, 8));
  });
  // The crescent moon, small and pale, at the front of the knot on its right.
  const moon = new THREE.Group();
  moon.position.set(-1.3, 23.85, 1.1);
  moon.scale.setScalar(0.42);
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
  const dm = at(damru(T, 3.2), 8.6, 18.6, -0.3);
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
