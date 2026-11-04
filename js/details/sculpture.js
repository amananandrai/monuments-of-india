import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mesh, box, cyl, at, lathe, nagaraProfile, finial } from '../helpers.js';
import { petalRing, bracketGeo, placeAll, frieze, mergeByMaterial } from './components.js';

// Sculpture and the small architectural parts that carry it: carved figures, elephants and horses
// for friezes, the miniature shrines (kutas and shalas) that line the storeys of a Dravidian tower,
// the yali pillars of Vijayanagara halls, small curved spires, and the classical kit of the colonial
// buildings (Corinthian capitals, entablatures, statues, urns and pinnacles).
//
// The figures, animals and small spires come as geometries of unit size (x and z from -0.5 to 0.5,
// y from 0 to 1, facing +z), like helpers.unitBox(), so a row of blocks drawn with inst(unitBox(), …)
// becomes a row of carvings by passing one of these instead. Everything else is a group facing +z
// standing on y = 0, as in the rest of the detail kit.

/* ---------- baking parts into one unit-sized geometry ---------- */

// Merge the meshes of a group into one geometry (position and normal only), then fit it into the
// unit box: centred on x and z, standing on y = 0, 1 across each way.
function bake(group) {
  group.updateMatrixWorld(true);
  const list = [];
  group.traverse((o) => {
    if (!o.isMesh) return;
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone());
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    g.applyMatrix4(o.matrixWorld);
    list.push(g);
  });
  const geo = mergeGeometries(list, false);
  geo.computeBoundingBox();
  const b = geo.boundingBox, s = new THREE.Vector3();
  b.getSize(s);
  geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  geo.scale(1 / s.x, 1 / s.y, 1 / s.z);
  geo.computeVertexNormals();
  return geo;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// A low-poly tapered limb from a to b.
function seg(a, b, r1, r2, n = 5) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), n));
  o.position.copy(a).add(b).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return o;
}
function ball(r, x, y, z, sx = 1, sy = 1, sz = 1, w = 6, h = 4) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, w, h));
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  return o;
}

/* ---------- figures ---------- */

// Figures in units of a tenth of their height, facing +z. pose: 'standing' (a deity with a tall
// crown, arms at the sides holding attributes), 'dancer' (the tribhanga, a sway at the hips, one
// arm raised and the other across the body), 'seated' (cross-legged, hands in the lap: a Buddha or
// a Jina), 'musician' (standing with a drum held before the body, as on the roof of Konark) or
// 'leader' (a modern statue: standing, arms at the sides, in a long coat and a cap).
function figureParts(pose) {
  const g = new THREE.Group(), add = (...o) => o.forEach((x) => g.add(x));
  if (pose === 'seated') {
    add(ball(2.6, 0, 1.0, 0.4, 1, 0.42, 0.7, 10, 6));                    // crossed legs
    add(seg(V(0, 1.2, 0), V(0, 4.6, -0.1), 1.25, 1.0, 8));               // torso
    add(ball(1.0, 0, 4.0, 0.25, 1.1, 0.9, 0.8));                          // chest
    for (const s of [-1, 1]) add(seg(V(s * 1.15, 4.4, 0), V(s * 1.3, 2.6, 0.5), 0.32, 0.28), seg(V(s * 1.3, 2.6, 0.5), V(s * 0.3, 1.8, 0.9), 0.28, 0.24));
    add(ball(0.75, 0, 5.4, 0.1), ball(0.45, 0, 6.2, 0));                 // head, ushnisha
    add(ball(0.9, 0, 0.35, 0.6, 1.4, 0.35, 0.9));                         // lap
    return g;
  }
  const sway = pose === 'dancer' ? 0.45 : 0;
  // Legs: the weight on the left in the dancer, the right knee bent.
  add(seg(V(-0.5, 0, 0.2), V(-0.45 + sway * 0.3, 2.4, 0), 0.35, 0.5), seg(V(-0.45 + sway * 0.3, 2.4, 0), V(-0.4 + sway, 4.6, 0), 0.5, 0.75));
  if (pose === 'dancer') add(seg(V(0.9, 0.3, 0.3), V(0.85, 2.5, 0.5), 0.35, 0.5), seg(V(0.85, 2.5, 0.5), V(0.5 + sway, 4.6, 0), 0.5, 0.75));
  else add(seg(V(0.5, 0, 0.2), V(0.45, 2.4, 0), 0.35, 0.5), seg(V(0.45, 2.4, 0), V(0.4, 4.6, 0), 0.5, 0.75));
  add(seg(V(sway, 3.0, 0), V(sway, 4.9, 0), 1.25, 0.95, 8));             // the dhoti or skirt
  add(ball(1.05, sway, 4.8, 0, 1.15, 0.6, 0.85));                        // hips
  add(seg(V(sway, 4.9, 0), V(sway * 0.4, 6.4, 0), 0.75, 0.95, 8));       // waist to chest
  add(ball(0.95, sway * 0.4, 6.5, 0.12, 1.25, 0.85, 0.8));               // chest
  const sh = V(sway * 0.4, 7.0, 0);
  for (const s of [-1, 1]) add(ball(0.42, sh.x + s * 1.15, sh.y, 0));   // shoulders
  if (pose === 'dancer') {
    add(seg(V(sh.x - 1.15, 7.0, 0), V(sh.x - 1.8, 8.6, 0.2), 0.3, 0.26), seg(V(sh.x - 1.8, 8.6, 0.2), V(sh.x - 0.9, 9.6, 0.3), 0.26, 0.22));
    add(seg(V(sh.x + 1.15, 7.0, 0), V(sh.x + 1.2, 5.6, 0.6), 0.3, 0.26), seg(V(sh.x + 1.2, 5.6, 0.6), V(sh.x - 0.5, 5.2, 0.9), 0.26, 0.22));
  } else if (pose === 'musician') {
    for (const s of [-1, 1]) add(seg(V(sh.x + s * 1.15, 7.0, 0), V(s * 1.3, 5.6, 0.7), 0.3, 0.26), seg(V(s * 1.3, 5.6, 0.7), V(s * 0.9, 5.0, 1.4), 0.26, 0.22));
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.4, 10));
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0, 5.0, 1.5);
    add(drum);
  } else {
    for (const s of [-1, 1]) add(seg(V(sh.x + s * 1.15, 7.0, 0), V(s * 1.45, 5.3, 0.2), 0.32, 0.27), seg(V(s * 1.45, 5.3, 0.2), V(s * 1.55, 3.8, 0.6), 0.27, 0.22));
    if (pose !== 'leader') add(seg(V(1.55, 3.4, 0.6), V(1.6, 6.2, 0.7), 0.1, 0.1, 5), ball(0.35, 1.6, 6.4, 0.7));   // a mace or lotus
  }
  add(seg(V(sh.x, 7.3, 0), V(sh.x, 7.9, 0), 0.32, 0.32));                // neck
  add(ball(0.75, sh.x, 8.5, 0.1, 1, 1.12, 1));                           // head
  if (pose === 'leader') { add(seg(V(sh.x, 8.95, 0), V(sh.x, 9.5, 0), 0.74, 0.7, 10)); return g; } // a cap
  add(seg(V(sh.x, 9.0, 0), V(sh.x, 10.0, 0), 0.72, 0.28, 8));            // crown or hair knot
  for (const s of [-1, 1]) add(ball(0.18, sh.x + s * 0.72, 8.2, 0.1, 1, 2, 1, 6, 4)); // ear ornaments
  return g;
}
// A cheap figure of a few blocks, for the hundreds of painted stucco figures on a gopuram: legs,
// a tapering body, arms (one raised in 'stuccoArm'), a head and a crown.
function stuccoParts(raised) {
  const g = new THREE.Group(), B = (w, h, d, x, y, z, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); o.position.set(x, y, z); o.rotation.z = rz; g.add(o); };
  B(1.9, 4.6, 0.8, 0, 2.3, 0);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.95, 3, 4).rotateY(Math.PI / 4)).translateY(6));
  B(0.55, 3.2, 0.55, -1.45, 5.9, 0.1, -0.12);
  if (raised) B(0.55, 3.0, 0.55, 1.6, 8.4, 0.1, -0.35); else B(0.55, 3.2, 0.55, 1.45, 5.9, 0.1, 0.12);
  g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.8)).translateY(8.3));
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 4)).translateY(9.4));
  return g;
}
const figCache = new Map();
export function figureGeo(pose = 'standing') {
  if (!figCache.has(pose)) figCache.set(pose, bake(pose.startsWith('stucco') ? stuccoParts(pose === 'stuccoArm') : figureParts(pose)));
  return figCache.get(pose);
}
// A single figure about h tall as a mesh facing +z on y = 0 (its width and depth follow h).
export function figure(h, m, pose = 'standing') {
  const o = mesh(figureGeo(pose), m);
  o.scale.set(h * (pose === 'seated' ? 0.52 : 0.36), h, h * 0.24);
  return o;
}

/* ---------- animals for friezes ---------- */

// An elephant facing +z, front on, as the elephants that carry the plinths of Kailasa and
// Akshardham: body, head with fanned ears, a curled trunk, tusks and four legs.
function elephantParts() {
  const g = new THREE.Group();
  g.add(ball(1.5, 0, 2.6, -0.6, 1.1, 0.95, 1.4, 10, 8));
  for (const x of [-0.75, 0.75]) for (const z of [-1.6, 0.4]) g.add(seg(V(x, 0, z), V(x, 2.2, z), 0.42, 0.45));
  g.add(ball(1.0, 0, 3.3, 0.9, 1, 1.05, 0.9));
  for (const s of [-1, 1]) g.add(ball(1.0, s * 1.15, 3.3, 0.6, 0.85, 1.05, 0.18));
  g.add(seg(V(0, 2.7, 1.6), V(0, 1.4, 1.9), 0.32, 0.26), seg(V(0, 1.4, 1.9), V(0, 0.5, 1.6), 0.26, 0.2));
  for (const s of [-1, 1]) g.add(seg(V(s * 0.4, 2.6, 1.5), V(s * 0.55, 2.0, 2.2), 0.12, 0.04, 5));
  return g;
}
// A horse in profile, facing +x along its length, as in the friezes of Hampi and Konark.
function horseParts() {
  const g = new THREE.Group();
  g.add(ball(1.0, 0, 2.3, 0, 1.6, 0.75, 0.6, 10, 6));
  for (const x of [-1.1, 1.1]) for (const z of [-0.3, 0.3]) g.add(seg(V(x, 0, z), V(x * 0.9, 1.9, z), 0.14, 0.2));
  g.add(seg(V(1.3, 2.6, 0), V(1.9, 3.7, 0), 0.38, 0.28), ball(0.4, 2.15, 3.75, 0, 1.4, 0.6, 0.7));
  g.add(seg(V(-1.5, 2.5, 0), V(-2.0, 1.6, 0), 0.15, 0.08));
  return g;
}
let eleGeo = null, horseGeo_ = null;
export function elephantGeo() { return eleGeo || (eleGeo = bake(elephantParts())); }
export function horseGeo() { return horseGeo_ || (horseGeo_ = bake(horseParts())); }

// A small curved spire (latina shikhara with its amalaka and kalash), for the rows of shrine cells
// at Dilwara, Ranakpur and Palitana, in place of four-sided pyramids.
let spireGeo = null;
export function miniSpireGeo() {
  if (!spireGeo) {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const w = nagaraProfile(i / 5), y = i * 0.3;
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.84, 0.3, w * 0.84)).translateY(y + 0.15));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, w * 0.56)).translateY(y + 0.12), new THREE.Mesh(new THREE.BoxGeometry(w * 0.56, 0.24, w)).translateY(y + 0.12));
    }
    g.add(ball(0.3, 0, 1.58, 0, 1, 0.4, 1, 12, 4), seg(V(0, 1.68, 0), V(0, 1.9, 0), 0.12, 0.04, 6), ball(0.07, 0, 1.92, 0, 1, 1, 1, 6, 4));
    spireGeo = bake(g);
  }
  return spireGeo;
}

/* ---------- friezes ---------- */

// A frieze len long and h high on a wall at z = 0: a sunk band between two mouldings, filled with a
// row of figures (or elephants, or horses) in relief, every `pitch` metres. kinds: a list of poses
// or 'elephant' / 'horse', used in turn. Returns a group of plain meshes and one InstancedMesh per
// kind (instanced parts are not merged by mergeByMaterial, and need no merging).
export function figureFrieze(len, h, m, { pitch = h * 0.7, kinds = ['standing', 'dancer'], back = frieze(m), proud = 0.12 } = {}) {
  const g = new THREE.Group(), n = Math.max(1, Math.floor(len / pitch)), lists = new Map();
  g.add(box(len, h, 0.03, back, 0, 0, 0.015));
  g.add(box(len + 0.1, h * 0.1, proud * 1.5, m, 0, -h * 0.1, proud * 0.75), box(len + 0.1, h * 0.1, proud * 1.5, m, 0, h, proud * 0.75));
  for (let k = 0; k < n; k++) {
    const kind = kinds[k % kinds.length], x = -len / 2 + (k + 0.5) * (len / n);
    if (!lists.has(kind)) lists.set(kind, []);
    const fh = h * 0.86, w = kind === 'elephant' ? fh * 0.9 : kind === 'horse' ? fh * 1.25 : kind === 'seated' ? fh * 0.75 : fh * 0.42;
    lists.get(kind).push([x, h * 0.06, proud * 0.5, w, fh, proud * 1.2]);
  }
  for (const [kind, list] of lists) {
    const geo = kind === 'elephant' ? elephantGeo() : kind === 'horse' ? horseGeo() : figureGeo(kind);
    const im = new THREE.InstancedMesh(geo, m, list.length), o = new THREE.Object3D();
    list.forEach(([x, y, z, sx, sy, sz], i) => { o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.castShadow = true;
    im.receiveShadow = true;
    g.add(im);
  }
  return g;
}

// Place instanced copies of a unit geometry by [x, y, z, sx, sy, sz, ry].
export function instances(geo, list, m) {
  const im = new THREE.InstancedMesh(geo, m, list.length), o = new THREE.Object3D();
  list.forEach(([x, y, z, sx, sy, sz, ry = 0], i) => { o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.set(sx, sy, sz); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

/* ---------- Dravidian miniature shrines ---------- */

// A kuta: a square miniature shrine s across, with pilasters at its corners, a cornice, a neck and a
// domed roof with a finial. Stands on y = 0, about 1.5 s tall.
export function kuta(s, m) {
  const g = new THREE.Group();
  g.add(box(s * 0.8, s * 0.55, s * 0.8, m));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(box(s * 0.14, s * 0.55, s * 0.14, m, x * s * 0.36, 0, z * s * 0.36));
  g.add(box(s, s * 0.12, s, m, 0, s * 0.55), box(s * 0.5, s * 0.12, s * 0.5, m, 0, s * 0.67));
  const dome = mesh(new THREE.SphereGeometry(s * 0.5, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, s * 0.79, 0);
  dome.rotation.y = Math.PI / 8;
  dome.scale.y = 0.9;
  g.add(dome, cyl(s * 0.03, s * 0.08, s * 0.25, m, 0, s * 1.22, 0, 6));
  return g;
}

// A shala: an oblong miniature shrine w long (along x) and d deep, under a barrel roof whose two
// gable ends are horseshoe arches (kudus) round a mask, with three small pots along its ridge.
export function shala(w, d, m) {
  const g = new THREE.Group(), h = d * 0.55, r = d * 0.42;
  g.add(box(w * 0.92, h, d * 0.8, m));
  for (const x of [-1, 1]) g.add(box(d * 0.14, h, d * 0.14, m, x * w * 0.43, 0, d * 0.36));
  g.add(box(w, d * 0.12, d, m, 0, h));
  const v = mesh(new THREE.CylinderGeometry(r, r, w * 0.9, 6, 1, false, 0, Math.PI), m, 0, h + d * 0.12, 0);
  v.rotation.z = Math.PI / 2;
  g.add(v);
  const kg = new THREE.TorusGeometry(r * 0.95, r * 0.13, 3, 8, Math.PI * 1.3).rotateZ(-Math.PI * 0.15);
  for (const s of [-1, 1]) { const k = mesh(kg, m, s * w * 0.46, h + d * 0.12, 0); k.rotation.y = Math.PI / 2; g.add(k); }
  g.add(at(mesh(new THREE.SphereGeometry(d * 0.09, 6, 4), m), 0, h + d * 0.12 + r * 1.02, 0), cyl(0, d * 0.05, d * 0.14, m, 0, h + d * 0.12 + r * 1.08, 0, 5));
  return g;
}

// A hara: the parapet of miniature shrines along the edge of a storey, len long along x on y = 0 —
// a kuta at each end and shalas between, with short links (panjaras) where they meet.
export function haraRow(len, s, m) {
  const g = new THREE.Group(), n = Math.max(1, Math.round((len - 2 * s) / (s * 2.2)));
  for (const x of [-1, 1]) g.add(at(kuta(s, m), x * (len / 2 - s / 2), 0, 0));
  const span = len - 2 * s, w = span / n;
  for (let k = 0; k < n; k++) g.add(at(shala(w * 0.8, s * 0.9, m), -span / 2 + (k + 0.5) * w, 0, 0));
  return g;
}

/* ---------- chariot wheels ---------- */

// A carved stone chariot wheel, as at Konark (where the 24 wheels are sundials) and Hampi: a rim with a beaded tyre band, eight broad spokes each
// carrying a round medallion of carving at its middle, eight thin spokes between them with a bead
// each, and a hub of petals round a projecting axle cap. One geometry of radius r facing +z, its
// back at z = 0.
export function carvedWheelGeo(r) {
  const p = [], add = (geo, x = 0, y = 0, z = 0, rz = 0) => { geo = geo.index ? geo.toNonIndexed() : geo; geo.deleteAttribute('uv'); p.push(geo.rotateZ(rz).translate(x, y, z)); };
  const d = r * 0.3;
  add(new THREE.CylinderGeometry(r, r, d, 48, 1, true).rotateX(Math.PI / 2), 0, 0, d / 2);
  add(new THREE.TorusGeometry(r * 0.95, r * 0.07, 6, 48), 0, 0, d);
  add(new THREE.TorusGeometry(r * 0.8, r * 0.05, 6, 48), 0, 0, d * 0.9);
  for (let k = 0; k < 32; k++) { const a = (k / 32) * Math.PI * 2; add(new THREE.SphereGeometry(r * 0.035, 6, 4), Math.cos(a) * r * 0.875, Math.sin(a) * r * 0.875, d * 0.95); }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), mid = r * 0.52;
    if (k % 2 === 0) {
      add(new THREE.BoxGeometry(r * 0.15, r * 0.6, d * 0.7), c * mid, sn * mid, d * 0.5, a - Math.PI / 2);
      add(new THREE.CylinderGeometry(r * 0.14, r * 0.14, d * 0.3, 16).rotateX(Math.PI / 2), c * mid, sn * mid, d * 0.95);
      add(new THREE.TorusGeometry(r * 0.14, r * 0.025, 4, 16), c * mid, sn * mid, d * 1.1);
      add(new THREE.SphereGeometry(r * 0.06, 8, 5), c * mid, sn * mid, d * 1.1);
    } else {
      add(new THREE.BoxGeometry(r * 0.05, r * 0.6, d * 0.45), c * mid, sn * mid, d * 0.5, a - Math.PI / 2);
      add(new THREE.SphereGeometry(r * 0.05, 8, 5), c * mid, sn * mid, d * 0.75);
    }
  }
  add(new THREE.CylinderGeometry(r * 0.22, r * 0.24, d * 1.2, 20).rotateX(Math.PI / 2), 0, 0, d * 0.6);
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2, q = new THREE.SphereGeometry(r * 0.07, 6, 4).scale(1, 0.55, 0.5); add(q, Math.cos(a) * r * 0.16, Math.sin(a) * r * 0.16, d * 1.2, a - Math.PI / 2); }
  add(new THREE.CylinderGeometry(r * 0.08, r * 0.1, d * 0.8, 12).rotateX(Math.PI / 2), 0, 0, d * 1.5);
  const g = mergeGeometries(p);
  g.computeVertexNormals();
  return g;
}

/* ---------- Vijayanagara pillars ---------- */

// A yali pillar h tall, facing +z: a square granite shaft carved with a rearing yali (a beast with a
// lion's body and an elephant's trunk) standing on a carved block, and a rider on its back; banded with carved blocks and capped by a flower-bud bracket (pushpa-potika) each way.
// With `rich`, the beast stands on a small elephant rather than a block and its rider is a full
// carved figure.
export function yaliPillar(h, m, { rich = false } = {}) {
  const g = new THREE.Group(), w = h * 0.12;
  g.add(box(w * 1.5, h * 0.08, w * 1.5, m), box(w, h * 0.86, w, m, 0, h * 0.08));
  for (const t of [0.3, 0.62]) g.add(box(w * 1.25, h * 0.06, w * 1.25, frieze(m), 0, h * t));
  g.add(box(w * 1.4, h * 0.06, w * 1.4, m, 0, h * 0.94));
  g.add(placeAll(bracketGeo(h * 0.08, w * 1.1, w * 0.7), [0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => [Math.sin(a) * w * 0.5, h, Math.cos(a) * w * 0.5, a]), m));
  // The beast, against the front face of the shaft.
  const b = new THREE.Group(), z0 = w * 0.5, u = h / 10;
  if (rich) {
    const e = mesh(elephantGeo(), m, 0, h * 0.08, z0 + u * 0.75);
    e.scale.set(u * 1.0, u * 1.3, u * 1.5);
    b.add(e);
  } else b.add(box(w * 1.1, u * 1.3, u * 1.1, frieze(m), 0, h * 0.08, z0 + u * 0.5));
  const body = mesh(new THREE.SphereGeometry(1, 10, 8), m, 0, h * 0.45, z0 + u * 0.55);
  body.scale.set(u * 0.75, u * 1.7, u * 0.55);
  body.rotation.x = 0.25;
  b.add(body);
  for (const s of [-1, 1]) {
    b.add(mesh(new THREE.CylinderGeometry(u * 0.22, u * 0.3, u * 2.2, 6), m, s * u * 0.45, h * 0.3, z0 + u * 0.5));
    const leg = mesh(new THREE.CylinderGeometry(u * 0.2, u * 0.22, u * 1.6, 6), m, s * u * 0.5, h * 0.6, z0 + u * 1.2);
    leg.rotation.x = 1.1;
    b.add(leg);
  }
  const head = mesh(new THREE.SphereGeometry(u * 0.6, 10, 8), m, 0, h * 0.68, z0 + u * 0.9);
  head.scale.set(1, 1.1, 1.2);
  const snout = mesh(new THREE.CylinderGeometry(u * 0.18, u * 0.3, u * 1.1, 6), m, 0, h * 0.64, z0 + u * 1.6);
  snout.rotation.x = 1.2;
  b.add(head, snout);
  for (const s of [-1, 1]) b.add(mesh(new THREE.ConeGeometry(u * 0.18, u * 0.6, 5), m, s * u * 0.35, h * 0.74, z0 + u * 0.8));
  const rider = mesh(figureGeo(rich ? 'standing' : 'stucco'), m, 0, h * 0.72, z0 + u * 0.1);
  rider.scale.set(u * 0.8, u * 2.2, u * 0.5);
  b.add(rider);
  g.add(b);
  return mergeByMaterial(g);
}

// A Vijayanagara composite pillar h tall: a square shaft ringed by slender colonnettes, with carved
// blocks at two levels and a bracket capital; with `figures`, a small dancer carved on every face of
// each block (heavier: keep it for the pillars seen up close).
export function clusterPillar(h, m, { figures = false } = {}) {
  const g = new THREE.Group(), w = h * 0.12;
  g.add(box(w * 1.5, h * 0.07, w * 1.5, m), box(w, h * 0.88, w, m, 0, h * 0.06));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.add(cyl(w * 0.12, w * 0.12, h * 0.86, m, Math.sin(a) * w * 0.66, h * 0.06, Math.cos(a) * w * 0.66, 5)); }
  for (const t of [0.22, 0.58]) {
    g.add(box(w * 1.35, h * 0.11, w * 1.35, figures ? m : frieze(m), 0, h * t));
    if (figures) for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const f = figure(h * 0.09, m, 'dancer');
      f.position.set(Math.sin(a) * w * 0.7, h * t + h * 0.01, Math.cos(a) * w * 0.7);
      f.rotation.y = a;
      g.add(f);
    }
  }
  g.add(box(w * 1.4, h * 0.05, w * 1.4, m, 0, h * 0.95));
  g.add(placeAll(bracketGeo(h * 0.07, w * 0.9, w * 0.6), [0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => [Math.sin(a) * w * 0.5, h, Math.cos(a) * w * 0.5, a]), m));
  return mergeByMaterial(g);
}

/* ---------- the classical kit ---------- */

// A Corinthian capital for a column of radius r, standing on y = 0 (about 2.6 r tall): a bell
// wrapped in two rings of acanthus leaves, volutes curling out under the corners, and an abacus.
export function corinthianCapital(r, m) {
  const g = new THREE.Group(), h = r * 2.2;
  g.add(cyl(r * 1.25, r * 0.98, h, m, 0, 0, 0, 16));
  g.add(at(petalRing(r * 0.98, 8, h * 0.45, r * 0.62, 0.32, m, 0.4), 0, 0, 0));
  g.add(at(petalRing(r * 1.06, 8, h * 0.45, r * 0.62, 0.38, m, 0.4).rotateY(Math.PI / 8), 0, h * 0.3, 0));
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2, v = mesh(new THREE.TorusGeometry(r * 0.22, r * 0.07, 5, 10), m, Math.sin(a) * r * 1.3, h * 0.82, Math.cos(a) * r * 1.3);
    v.rotation.y = a + Math.PI / 2;
    g.add(v);
  }
  g.add(box(r * 2.9, r * 0.32, r * 2.9, m, 0, h));
  return g;
}

// An entablature len long along x on a wall at z = 0, h tall, from y = 0: an architrave of two
// fascias, a frieze (carved if `carvedFrieze`), and a cornice with dentils and modillions under its
// projecting corona.
export function entablature(len, h, m, { carvedFrieze = false, depth = h * 0.5 } = {}) {
  const g = new THREE.Group(), a = h * 0.32, f = h * 0.3, c = h * 0.38;
  g.add(box(len, a * 0.5, depth * 0.45, m, 0, 0, depth * 0.225), box(len + 0.04, a * 0.5, depth * 0.5, m, 0, a * 0.5, depth * 0.25));
  g.add(box(len, f, depth * 0.42, carvedFrieze ? frieze(m) : m, 0, a, depth * 0.21));
  const y = a + f, n = Math.floor(len / (c * 0.4));
  for (let k = 0; k < n; k++) g.add(box(c * 0.18, c * 0.22, c * 0.25, m, -len / 2 + (k + 0.5) * (len / n), y, depth * 0.42 + c * 0.12));
  const nm = Math.floor(len / (c * 1.2));
  for (let k = 0; k < nm; k++) g.add(box(c * 0.3, c * 0.2, c * 0.7, m, -len / 2 + (k + 0.5) * (len / nm), y + c * 0.24, depth * 0.42 + c * 0.35));
  g.add(box(len + c * 1.6, c * 0.18, depth * 0.42 + c * 0.9, m, 0, y + c * 0.44, (depth * 0.42 + c * 0.9) / 2));
  g.add(box(len + c * 1.8, c * 0.22, depth * 0.42 + c, m, 0, y + c * 0.62, (depth * 0.42 + c) / 2));
  return g;
}

// A statue on a pedestal, h tall overall, facing +z: a robed standing figure (or another pose).
export function statue(h, m, pose = 'standing', pedestalM = m) {
  const g = new THREE.Group(), ph = h * 0.22;
  g.add(box(h * 0.32, ph * 0.15, h * 0.32, pedestalM), box(h * 0.26, ph * 0.7, h * 0.26, pedestalM, 0, ph * 0.15), box(h * 0.32, ph * 0.15, h * 0.32, pedestalM, 0, ph * 0.85));
  g.add(at(figure(h - ph, m, pose), 0, ph, 0));
  return g;
}

// A covered urn h tall on y = 0, as on the balustrades of classical buildings.
export function urn(h, m) {
  return lathe([[0, 0], [0.22, 0], [0.22, 0.06], [0.1, 0.12], [0.12, 0.2], [0.3, 0.38], [0.32, 0.5], [0.26, 0.66], [0.12, 0.74], [0.16, 0.8], [0.08, 0.92], [0, 1]].map(([r, y]) => [r * h, y * h]), m, 14);
}

// An obelisk pinnacle h tall on y = 0: a cube, a tapering four-sided shaft and a ball.
export function pinnacle(h, m) {
  const g = new THREE.Group(), w = h * 0.22;
  g.add(box(w * 1.2, w * 0.9, w * 1.2, m));
  g.add(mesh(new THREE.CylinderGeometry(w * 0.15, w * 0.45, h * 0.65, 4).rotateY(Math.PI / 4).translate(0, w * 0.9 + h * 0.325, 0), m));
  g.add(at(mesh(new THREE.SphereGeometry(w * 0.32, 10, 8), m), 0, w * 0.9 + h * 0.68, 0));
  return g;
}

// A crocketed pinnacle h tall (Gothic): a slim octagonal shaft, a spirelet with knobs up its edges
// and a finial.
export function gothicPinnacle(h, m) {
  const g = new THREE.Group(), r = h * 0.09;
  g.add(cyl(r, r, h * 0.45, m, 0, 0, 0, 8), cyl(r * 1.25, r * 1.25, h * 0.05, m, 0, h * 0.45, 0, 8));
  g.add(cyl(0, r * 1.1, h * 0.45, m, 0, h * 0.5, 0, 8));
  for (let k = 0; k < 8; k++) for (const t of [0.25, 0.55]) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, rr = r * 1.1 * (1 - t) + 0.02;
    g.add(at(mesh(new THREE.SphereGeometry(r * 0.22, 5, 4), m), Math.sin(a) * rr, h * (0.5 + t * 0.45), Math.cos(a) * rr));
  }
  g.add(at(finial(h * 0.12, m), 0, h * 0.94, 0));
  return g;
}

// Rows of carved figures in place of a row of blocks: list entries are [x, y, z, sx, sy, sz, ry] as
// for helpers.inst. The poses alternate along the list. With `outward`, each figure is turned half
// round (aroundRect gives the angle facing into the rectangle; the figures should face out).
export function figureRow(list, m, { poses = ['standing', 'dancer'], outward = true } = {}) {
  const g = new THREE.Group();
  poses.forEach((p, i) => {
    const mine = list.filter((_, k) => k % poses.length === i).map(([x, y, z, sx, sy, sz, ry = 0]) => [x, y, z, sx, sy, sz, ry + (outward ? Math.PI : 0)]);
    if (mine.length) g.add(instances(figureGeo(p), mine, m));
  });
  return g;
}

// A plain kuta of a few faces, unit sized (base box, cornice, dome), for instancing by the hundred
// along the storeys of the gopurams.
let kutaGeo_ = null;
export function kutaGeo() {
  if (!kutaGeo_) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.8)).translateY(0.275), new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 1)).translateY(0.61));
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.45, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2));
    d.position.y = 0.67;
    g.add(d, new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4)).translateY(1.25));
    kutaGeo_ = bake(g);
  }
  return kutaGeo_;
}

// A small horseshoe arch (kudu), facing +z, about 1 across: for rows along cornices.
let kuduGeo_ = null;
export function kuduGeo() {
  return kuduGeo_ || (kuduGeo_ = new THREE.TorusGeometry(0.42, 0.09, 3, 6, Math.PI * 1.3).rotateZ(-Math.PI * 0.15));
}
