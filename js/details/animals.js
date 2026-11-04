import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mesh, box, cyl, at, surface } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, bounded, carve, mirrorX, flatBase, roundBox, sculpt, statueMaterial } from '../sdf.js';

// The temple animals, each sculpted as one skin from a signed distance field (see js/sdf.js): the
// Nandi before a Shiva shrine, the elephants of Kailasa, Hampi and Gwalior, the war horses that draw
// Konark's chariot, and the lions at temple gates. Each is meshed once and shared by every copy, and
// takes the stone or bronze it is made of with its crevices darkened. All face +z and stand at y = 0.

const figure = (geo, m) => mesh(geo, statueMaterial(m));

// A ring of points round an ellipse in a plane: for straps, girths and garlands.
function loop(cx, cy, cz, rx, ry, r, plane = 'xy', n = 16, from = 0, to = Math.PI * 2) {
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const a = from + ((to - from) * k) / n, u = Math.cos(a) * rx, v = Math.sin(a) * ry;
    pts.push(plane === 'xy' ? [cx + u, cy + v, cz, r] : plane === 'xz' ? [cx + u, cy, cz + v, r] : [cx, cy + v, cz + u, r]);
  }
  return pts;
}

/* ---------- Nandi ---------- */

// A recumbent Nandi, about 5.4 m long and 3.4 m to the tips of its horns: forelegs folded under
// the chest, hind legs tucked beside the flank, the hump, the dewlap hanging from the throat, the
// head raised and the horns curving up, and a garland of bells round the neck.
function nandiField() {
  const garland = [], bells = [];
  for (let k = 0; k <= 24; k++) {
    const a = (k / 24) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    garland.push([s * 0.72, 1.85 - c * 0.45, 1.55 + c * 0.3, 0.075]);
  }
  for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) bells.push(E([Math.sin(a) * 0.72, 1.85 - Math.cos(a) * 0.45 - 0.12, 1.55 + Math.cos(a) * 0.3 + 0.03], [0.1, 0.13, 0.1]));
  const body = blend([
    [E([0, 1.15, -0.3], [1.12, 0.98, 1.9]), 0],
    [E([0, 1.25, 0.95], [1.02, 1.05, 1.0]), 0.5],
    [E([0, 2.05, 0.85], [0.55, 0.5, 0.62]), 0.45],
    [E([0, 0.4, 0], [1.3, 0.42, 2.05]), 0.35],
    [mirrorX(chain([[0.7, 0.7, 1.4, 0.32], [0.78, 0.32, 1.9, 0.24], [0.6, 0.2, 2.3, 0.2]], 0.2)), 0.2],
    [mirrorX(E([0.58, 0.15, 2.38], [0.22, 0.15, 0.2])), 0.08],
    [mirrorX(E([0.92, 0.85, -1.3], [0.45, 0.72, 0.85])), 0.35],
    [mirrorX(chain([[1.05, 0.3, -0.75, 0.22], [1.02, 0.2, -0.1, 0.17]], 0.15)), 0.15],
    [chain([[0, 1.9, 1.2, 0.6], [0, 2.2, 1.8, 0.45]], 0.3), 0.4],
    [chain([[0, 2.5, 1.95, 0.42], [0, 1.78, 2.5, 0.3]], 0.2), 0.25],
    [E([0, 1.62, 2.55], [0.3, 0.24, 0.26]), 0.15],
    [E([0, 1.45, 1.8], [0.17, 0.55, 0.5]), 0.25],
    [mirrorX(chain([[0.2, 2.75, 1.88, 0.12], [0.45, 3.0, 1.78, 0.09], [0.5, 3.32, 1.88, 0.05]], 0.05)), 0.05],
    [mirrorX(E([0.5, 2.45, 1.82], [0.3, 0.09, 0.14])), 0.08],
    [chain([[0, 1.4, -2.1, 0.09], [0.5, 0.35, -1.9, 0.07], [0.95, 0.2, -1.0, 0.06]], 0.08), 0.08],
    [chain(garland, 0.03), 0.03],
    [bounded(blend(bells.map((b) => [b, 0])), [0, 1.3, 1.85], 0.9), 0.02],
  ]);
  const eye = mirrorX(E([0.38, 2.28, 2.3], [0.08, 0.06, 0.08]));
  return { f: flatBase(carve(body, eye, 0.03)), lo: [-1.6, -0.05, -2.5], hi: [1.6, 3.5, 3.0] };
}
// The Nandi's mesh; fine: false meshes it coarsely, for the small Nandis lining a wall.
export function nandiGeometry(fine = true) {
  return sculpt(fine ? 'nandi' : 'nandi-small', nandiField, { h: fine ? 0.08 : 0.3, reach: fine ? 0.5 : 0.8 });
}
export function nandi(m, s = 1) {
  const g = new THREE.Group();
  g.add(figure(nandiGeometry(), m));
  g.scale.setScalar(s);
  return g;
}

/* ---------- elephant ---------- */

// An Indian elephant about 3.6 m to the top of its head: the domed twin bumps of the skull, the
// back highest over the shoulders, the belly sagging, column legs on round feet, small ears lying
// flat, tusks, and the trunk hanging to the ground.
function elephantField() {
  const body = blend([
    [E([0, 2.3, 0], [1.12, 1.12, 1.75]), 0],
    [E([0, 1.95, 0.1], [1.02, 0.9, 1.4]), 0.4],
    [E([0, 2.3, -1.15], [1.0, 1.05, 0.9]), 0.45],
    [E([0, 2.5, 0.95], [1.02, 1.1, 0.9]), 0.45],
    [E([0, 2.75, 1.55], [0.82, 0.85, 0.6]), 0.4],
    [E([0, 2.85, 1.95], [0.78, 0.92, 0.72]), 0.35],
    [mirrorX(E([0.3, 3.5, 1.85], [0.38, 0.36, 0.42])), 0.25],
    [chain([[0, 2.7, 2.5, 0.38], [0, 2.15, 2.85, 0.3], [0, 1.5, 2.95, 0.22], [0, 0.9, 2.9, 0.17], [0, 0.45, 2.75, 0.13], [0, 0.32, 2.52, 0.11]], 0.15), 0.3],
    [mirrorX(E([0.95, 2.72, 1.45], [0.15, 0.8, 0.66])), 0.1],
    [mirrorX(cone([0.62, 2.0, 1.0], [0.6, 0.15, 1.12], 0.44, 0.38)), 0.35],
    [mirrorX(cone([0.62, 2.0, -1.1], [0.6, 0.15, -1.15], 0.48, 0.38)), 0.35],
    [mirrorX(E([0.6, 0.16, 1.15], [0.43, 0.2, 0.43])), 0.12],
    [mirrorX(E([0.6, 0.16, -1.15], [0.43, 0.2, 0.43])), 0.12],
    [chain([[0, 2.6, -1.95, 0.08], [0, 2.0, -2.12, 0.06], [0, 1.3, -2.08, 0.05]], 0.1), 0.12],
    [mirrorX(chain([[0.3, 2.35, 2.35, 0.14], [0.37, 2.0, 2.75, 0.1], [0.32, 1.98, 3.15, 0.05]], 0.03)), 0.06],
    [mirrorX(E([0.7, 2.95, 2.2], [0.1, 0.08, 0.1])), 0.05],
  ]);
  return { f: flatBase(body), lo: [-1.6, -0.05, -2.4], hi: [1.6, 4.05, 3.4] };
}
export function elephant(m, s = 1) {
  const g = new THREE.Group();
  g.add(figure(sculpt('elephant', elephantField, { h: 0.08, reach: 0.6 }), m));
  g.scale.setScalar(s);
  return g;
}

/* ---------- horse ---------- */

// One of Konark's war horses, about 4.2 m to its ears, straining forward in harness: the right
// foreleg lifted, the neck arched, the tail thick, a breast collar, a girth and a saddle cloth, and
// a noseband.
function horseField() {
  const half = [[0.56, 2.6, 0.45, 0.065], [0.5, 2.3, 1.15, 0.065], [0.25, 2.12, 1.5, 0.065], [0, 2.08, 1.58, 0.065]];
  const body = blend([
    [E([0, 2.05, -0.1], [0.6, 0.7, 1.3]), 0],
    [E([0, 2.1, 0.95], [0.58, 0.72, 0.6]), 0.4],
    [E([0, 2.15, -1.1], [0.62, 0.74, 0.7]), 0.45],
    [E([0, 2.6, 0.75], [0.32, 0.32, 0.5]), 0.35],
    [chain([[0, 2.45, 1.05, 0.5], [0, 3.15, 1.5, 0.36], [0, 3.6, 1.82, 0.27]], 0.25), 0.35],
    [chain([[0, 2.95, 0.85, 0.13], [0, 3.5, 1.35, 0.13], [0, 3.95, 1.75, 0.1]], 0.1), 0.12],
    [chain([[0, 3.78, 1.92, 0.24], [0, 3.32, 2.48, 0.15]], 0.1), 0.15],
    [E([0, 3.62, 2.02], [0.19, 0.26, 0.26]), 0.1],
    [E([0, 3.24, 2.5], [0.15, 0.15, 0.16]), 0.08],
    [mirrorX(cone([0.1, 3.95, 1.86], [0.13, 4.25, 1.78], 0.075, 0.025)), 0.03],
    // Forelegs: the right one lifted, the left planted
    [cone([0.3, 1.85, 1.0], [0.32, 1.3, 1.3], 0.19, 0.12), 0.25],
    [E([0.32, 1.3, 1.3], [0.11, 0.11, 0.11]), 0.05],
    [cone([0.32, 1.3, 1.3], [0.32, 0.95, 1.05], 0.1, 0.08), 0.05],
    [E([0.32, 0.88, 1.0], [0.1, 0.09, 0.11]), 0.04],
    [cone([-0.3, 1.85, 0.98], [-0.31, 1.05, 1.05], 0.19, 0.12), 0.25],
    [cone([-0.31, 1.05, 1.05], [-0.31, 0.2, 1.02], 0.1, 0.085), 0.05],
    [E([-0.31, 0.1, 1.06], [0.12, 0.1, 0.14]), 0.04],
    // Hind legs
    [cone([0.33, 2.0, -1.2], [0.34, 1.3, -1.55], 0.3, 0.13), 0.3],
    [E([0.34, 1.3, -1.58], [0.1, 0.12, 0.12]), 0.05],
    [cone([0.34, 1.3, -1.58], [0.34, 0.2, -1.4], 0.09, 0.085), 0.05],
    [E([0.34, 0.1, -1.36], [0.12, 0.1, 0.14]), 0.04],
    [cone([-0.33, 2.0, -1.05], [-0.34, 1.3, -1.4], 0.3, 0.13), 0.3],
    [E([-0.34, 1.3, -1.43], [0.1, 0.12, 0.12]), 0.05],
    [cone([-0.34, 1.3, -1.43], [-0.34, 0.2, -1.25], 0.09, 0.085), 0.05],
    [E([-0.34, 0.1, -1.21], [0.12, 0.1, 0.14]), 0.04],
    [chain([[0, 2.6, -1.72, 0.1], [0, 2.25, -2.0, 0.14], [0, 1.6, -2.08, 0.12], [0, 1.1, -2.0, 0.09]], 0.08), 0.1],
    // Harness
    [mirrorX(chain(half, 0.03)), 0.03],
    [chain(loop(0, 2.05, 0.38, 0.64, 0.74, 0.065), 0.02), 0.03],
    [roundBox([0, 2.74, -0.15], [0.48, 0.07, 0.62], 0.06), 0.06],
    [chain(loop(0, 3.3, 2.38, 0.17, 0.19, 0.05), 0.02), 0.02],
  ]);
  return { f: flatBase(body), lo: [-0.9, -0.05, -2.4], hi: [0.9, 4.35, 2.8] };
}
// coarse: a lighter mesh for small or distant horses (carriage teams, mounted guards, ponies).
export function horse(m, { coarse = false } = {}) {
  const g = new THREE.Group();
  g.add(figure(sculpt(coarse ? 'horse-coarse' : 'horse', horseField, { h: coarse ? 0.13 : 0.065, reach: 0.4 }), m));
  return g;
}

/* ---------- lion ---------- */

// A seated lion facing +z, 2.3 m tall with its plinth: upright on its haunches, forelegs straight,
// a curling mane, the mouth open, and the tail curled round its side.
function lionField() {
  const mane = E([0, 2.0, 0.38], [0.6, 0.62, 0.5]);
  const curls = (x, y, z) => mane(x, y, z) - 0.045 * Math.sin(9 * Math.atan2(x, y - 2.0)) * Math.sin(11 * z + 4 * y);
  const body = blend([
    [E([0, 0.95, -0.35], [0.55, 0.5, 0.65]), 0],
    [mirrorX(E([0.42, 0.78, -0.3], [0.22, 0.38, 0.5])), 0.2],
    [mirrorX(E([0.38, 0.53, 0.2], [0.15, 0.08, 0.22])), 0.1],
    [chain([[0, 1.0, -0.15, 0.5], [0, 1.55, 0.25, 0.45]], 0.2), 0.3],
    [E([0, 1.45, 0.42], [0.42, 0.55, 0.35]), 0.3],
    [mirrorX(cone([0.25, 1.35, 0.5], [0.25, 0.55, 0.62], 0.15, 0.11)), 0.15],
    [mirrorX(E([0.25, 0.52, 0.7], [0.13, 0.08, 0.17])), 0.06],
    [curls, 0.25],
    [E([0, 1.95, 0.85], [0.28, 0.25, 0.3]), 0.12],
    [E([0, 2.02, 1.1], [0.13, 0.1, 0.1]), 0.06],
    [mirrorX(E([0.14, 2.17, 0.85], [0.12, 0.08, 0.12])), 0.05],
    [mirrorX(E([0.3, 2.45, 0.5], [0.1, 0.12, 0.06])), 0.05],
    [chain([[0, 0.55, -0.95, 0.07], [0.45, 0.5, -0.7, 0.06], [0.6, 0.52, -0.2, 0.05]], 0.04), 0.04],
  ]);
  const mouth = E([0, 1.82, 1.02], [0.16, 0.06, 0.18]);
  return { f: flatBase(carve(body, mouth, 0.03), 0.45), lo: [-0.85, 0.4, -1.15], hi: [0.85, 2.75, 1.35] };
}
// A seated lion about 2.3·s high on its own plinth: the guardians of temple gates.
export function lion(s, m) {
  const g = new THREE.Group(), fig = figure(sculpt('lion', lionField, { h: 0.042, reach: 0.25 }), m);
  fig.scale.setScalar(s);
  g.add(box(1.3 * s, 0.45 * s, 2 * s, m), fig);
  return g;
}


/* ---------- deer ---------- */

// A chital (spotted deer) stag about 1 m at the shoulder, grazing or with its head up: slender
// legs, a short tail and branching antlers (as tubes).
function deerField(grazing) {
  const head = grazing ? [[0, 0.95, 0.55, 0.12], [0, 0.45, 0.85, 0.09], [0, 0.18, 0.95, 0.06]] : [[0, 0.95, 0.55, 0.12], [0, 1.35, 0.72, 0.09], [0, 1.42, 0.92, 0.06]];
  const f = blend([
    [E([0, 0.9, 0], [0.24, 0.27, 0.55]), 0],
    [E([0, 0.95, 0.4], [0.21, 0.27, 0.22]), 0.12],
    [chain(head, 0.06), 0.1],
    [mirrorX(cone([0.12, 0.8, 0.38], [0.12, 0.03, 0.42], 0.06, 0.025)), 0.06],
    [mirrorX(cone([0.13, 0.85, -0.38], [0.12, 0.45, -0.48], 0.09, 0.04)), 0.08],
    [mirrorX(cone([0.12, 0.45, -0.48], [0.12, 0.03, -0.42], 0.035, 0.025)), 0.03],
    [cone([0, 1.0, -0.52], [0, 0.85, -0.6], 0.05, 0.03), 0.04],
  ]);
  return { f: flatBase(f), lo: [-0.4, -0.03, -0.75], hi: [0.4, 1.6, 1.1] };
}
const ANTLER = surface(mat('#d9cbb0', 0.7), 'none');
const DEER = surface(mat('#b8763e', 0.8), 'none');
// Deer at [x, z, ry]; every third grazes. Instanced: one draw for each kind of part.
let antlerGeo = null;
export function deer(spots, { y = 0 } = {}) {
  const g = new THREE.Group(), up = [], down = [];
  spots.forEach(([x, z, ry = 0], i) => (i % 3 === 1 ? down : up).push([x, y, z, ry]));
  if (!antlerGeo) {
    const parts = [];
    for (const s of [-1, 1]) {
      const pts = [[s * 0.04, 1.5, 0.68], [s * 0.14, 1.75, 0.6], [s * 0.18, 1.95, 0.66]].map((p) => new THREE.Vector3(...p));
      parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.018, 5, false), new THREE.TubeGeometry(new THREE.CatmullRomCurve3([pts[1], new THREE.Vector3(s * 0.12, 1.82, 0.76)]), 4, 0.014, 5, false));
    }
    antlerGeo = mergeGeometries(parts.map((p) => { p.deleteAttribute('uv'); return p; }));
  }
  const inst = (geo, m, list) => {
    const im = new THREE.InstancedMesh(geo, m, list.length), o = new THREE.Object3D();
    list.forEach(([x, yy, z, ry], i) => { o.position.set(x, yy, z); o.rotation.set(0, ry, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.castShadow = im.receiveShadow = true;
    return im;
  };
  if (up.length) g.add(inst(sculpt('deer', () => deerField(false), { h: 0.045, reach: 0.15 }), statueMaterial(DEER), up), inst(antlerGeo, ANTLER, up));
  if (down.length) g.add(inst(sculpt('deer-grazing', () => deerField(true), { h: 0.045, reach: 0.15 }), statueMaterial(DEER), down));
  return g;
}

/* ---------- caparisoned elephant ---------- */

// Materials by colour, shared by every elephant, camel and saddle that uses the same one.
const sharedMats = new Map();
const shared = (c, r, m) => { const k = c + r + m; if (!sharedMats.has(k)) sharedMats.set(k, surface(mat(c, r, m), 'none')); return sharedMats.get(k); };

// An elephant dressed for a procession or the ride up to a fort: a painted forehead, a long
// embroidered cloth over its back and a canopied howdah, with a mahout on its neck.
export function rideElephant(m, s = 1, { cloth = '#b3262e', trim = '#e3b54a', howdah = true } = {}) {
  const g = elephant(m, 1), C = shared(cloth, 0.8, 0), T = shared(trim, 0.35, 0.8);
  g.add(box(2.3, 0.12, 2.6, C, 0, 3.3, 0), box(0.1, 1.5, 2.4, C, 1.18, 2.0, 0), box(0.1, 1.5, 2.4, C, -1.18, 2.0, 0));
  g.add(box(2.4, 0.08, 2.7, T, 0, 3.22, 0));
  // The howdah: a railed seat with a canopy on four posts (a temple elephant goes without)
  if (howdah) {
    g.add(box(1.6, 0.5, 1.7, T, 0, 3.42, -0.1), box(1.4, 0.06, 1.5, C, 0, 3.92, -0.1));
    for (const x of [-0.7, 0.7]) for (const z of [-0.8, 0.6]) g.add(cyl(0.035, 0.035, 1.2, T, x, 3.92, z, 6));
    g.add(at(mesh(new THREE.ConeGeometry(1.15, 0.6, 4).rotateY(Math.PI / 4), C), 0, 5.4, -0.1));
  }
  // The painted forehead and a mahout astride the neck
  g.add(at(mesh(new THREE.CircleGeometry(0.42, 16), shared('#f2c21c', 0.8, 0)), 0, 3.0, 2.68).rotateX(-0.45));
  g.add(cyl(0.16, 0.2, 0.6, shared('#f4f1ea', 0.9, 0), 0, 3.55, 1.25, 8), mesh(new THREE.SphereGeometry(0.13, 8, 6), shared('#8d5a3b', 0.7, 0), 0, 4.3, 1.25));
  g.add(mesh(new THREE.SphereGeometry(0.15, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), shared('#d9342b', 0.8, 0), 0, 4.36, 1.25));
  g.scale.setScalar(s);
  return g;
}

/* ---------- yak ---------- */

// A Himalayan yak, about 1.6 m at the hump: a heavy body, a long shaggy skirt of hair hanging
// almost to the ground, short legs, a bushy tail and wide curving horns.
function yakField() {
  const f = blend([
    [E([0, 1.15, 0], [0.55, 0.55, 1.0]), 0],
    [E([0, 1.5, 0.45], [0.45, 0.35, 0.5]), 0.25],
    [E([0, 0.75, 0], [0.62, 0.45, 1.05]), 0.3],
    [mirrorX(cone([0.3, 0.6, 0.6], [0.3, 0.03, 0.62], 0.13, 0.09)), 0.08],
    [mirrorX(cone([0.3, 0.6, -0.6], [0.3, 0.03, -0.62], 0.13, 0.09)), 0.08],
    [chain([[0, 1.25, 0.95, 0.28], [0, 1.0, 1.35, 0.2]], 0.1), 0.15],
    [chain([[0, 1.1, -0.95, 0.12], [0, 0.6, -1.15, 0.16]], 0.08), 0.08],
  ]);
  return { f: flatBase(f), lo: [-0.8, -0.03, -1.45], hi: [0.8, 1.95, 1.65] };
}
const YAK = surface(mat('#2a2421', 0.95), 'none'), HORN = surface(mat('#d9cbb0', 0.6), 'none'), SADDLE = surface(mat('#b3262e', 0.8), 'none');
export function yaks(spots, { y = 0 } = {}) {
  const g = new THREE.Group();
  spots.forEach(([x, z, ry = 0]) => {
    const k = new THREE.Group();
    k.add(mesh(sculpt('yak', yakField, { h: 0.05, reach: 0.25 }), statueMaterial(YAK)), box(0.9, 0.08, 0.9, SADDLE, 0, 1.68, 0.1));
    for (const s of [-1, 1]) k.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.15, 1.38, 1.2), new THREE.Vector3(s * 0.45, 1.5, 1.15), new THREE.Vector3(s * 0.5, 1.8, 1.25)]), 8, 0.045, 6, false), HORN));
    k.position.set(x, y, z);
    k.rotation.y = ry;
    g.add(k);
  });
  return g;
}

/* ---------- camel ---------- */

// A dromedary about 2.1 m at the hump: a single hump, a long curved neck, long thin legs with
// broad pads, and a bright saddle cloth.
function camelField() {
  const f = blend([
    [E([0, 1.75, 0], [0.42, 0.42, 0.95]), 0],
    [E([0, 2.15, -0.05], [0.32, 0.35, 0.45]), 0.25],
    [chain([[0, 1.85, 0.75, 0.22], [0, 1.6, 1.25, 0.15], [0, 2.1, 1.6, 0.12], [0, 2.45, 1.7, 0.11]], 0.08), 0.15],
    [chain([[0, 2.5, 1.68, 0.13], [0, 2.4, 2.05, 0.08]], 0.05), 0.06],
    [mirrorX(cone([0.2, 1.55, 0.6], [0.2, 0.9, 0.65], 0.11, 0.07)), 0.08],
    [mirrorX(cone([0.2, 0.9, 0.65], [0.2, 0.05, 0.62], 0.06, 0.05)), 0.03],
    [mirrorX(cone([0.2, 1.55, -0.6], [0.2, 0.9, -0.72], 0.14, 0.07)), 0.08],
    [mirrorX(cone([0.2, 0.9, -0.72], [0.2, 0.05, -0.62], 0.06, 0.05)), 0.03],
    [mirrorX(E([0.2, 0.05, 0.66], [0.11, 0.05, 0.14])), 0.03],
    [mirrorX(E([0.2, 0.05, -0.6], [0.11, 0.05, 0.14])), 0.03],
    [cone([0, 1.8, -0.92], [0, 1.2, -1.02], 0.05, 0.03), 0.04],
  ]);
  return { f: flatBase(f), lo: [-0.6, -0.03, -1.2], hi: [0.6, 2.75, 2.25] };
}
const CAMEL = surface(mat('#b88a5a', 0.85), 'none');
// Camels at [x, z, ry], each with a saddle cloth and, on some, a rider.
export function camels(spots, { y = 0, cloths = ['#b3262e', '#2f5d9a', '#e3b23c', '#2f7a3f'] } = {}) {
  const g = new THREE.Group();
  spots.forEach(([x, z, ry = 0, rider = false], i) => {
    const c = new THREE.Group(), C = shared(cloths[i % cloths.length], 0.8, 0);
    c.add(mesh(sculpt('camel', camelField, { h: 0.045, reach: 0.2 }), statueMaterial(CAMEL)), box(0.75, 0.08, 1.1, C, 0, 2.48, -0.05), box(0.05, 0.6, 1.0, C, 0.37, 1.95, -0.05), box(0.05, 0.6, 1.0, C, -0.37, 1.95, -0.05));
    if (rider) c.add(cyl(0.17, 0.2, 0.62, surface(mat('#f4f1ea', 0.9), 'none'), 0, 2.56, -0.05, 8), mesh(new THREE.SphereGeometry(0.13, 8, 6), surface(mat('#8d5a3b', 0.7), 'none'), 0, 3.32, -0.05), mesh(new THREE.SphereGeometry(0.17, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), surface(mat('#e86a12', 0.8), 'none'), 0, 3.36, -0.05));
    c.position.set(x, y, z);
    c.rotation.y = ry;
    g.add(c);
  });
  return g;
}
