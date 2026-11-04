import * as THREE from 'three';
import { mesh, box } from '../helpers.js';
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
export function horse(m) {
  const g = new THREE.Group();
  g.add(figure(sculpt('horse', horseField, { h: 0.065, reach: 0.4 }), m));
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

