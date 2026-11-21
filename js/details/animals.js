import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mesh, box, cyl, at, surface } from '../helpers.js';
import { detail } from '../detail.js';
import { mergeByMaterial } from './components.js';
import { ellipsoid as E, cone, chain, blend, bounded, carve, mirrorX, flatBase, roundBox, sculpt, statueMaterial, smin, snap, onSkin, skinMatrix } from '../sdf.js';

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
// head raised and the horns curving up. As temple Nandis are carved: a garland of bells round the
// neck with a larger bell at the chest and a strand of beads above it, a saddle blanket over the
// back with a raised border, anklets on the forelegs, the tail with its tuft laid along the flank,
// and the face with its nostrils, mouth and heavy-lidded eyes. fine: false leaves out the blanket,
// for the small Nandis lining a wall, meshed too coarsely to hold it.
function nandiField(fine = true) {
  const garland = [], beads = [], bells = [];
  for (let k = 0; k <= 24; k++) {
    const a = (k / 24) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    garland.push([s * 0.72, 1.85 - c * 0.45, 1.55 + c * 0.3, 0.075]);
    beads.push([s * 0.66, 2.05 - c * 0.36, 1.62 + c * 0.24, 0.05]);
  }
  for (const a of [-0.9, -0.45, 0.45, 0.9]) bells.push(E([Math.sin(a) * 0.72, 1.85 - Math.cos(a) * 0.45 - 0.12, 1.55 + Math.cos(a) * 0.3 + 0.03], [0.1, 0.13, 0.1]));
  bells.push(E([0, 1.22, 1.9], [0.16, 0.2, 0.15]), E([0, 1.07, 1.9], [0.2, 0.05, 0.18]));
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
    [E([1.0, 0.2, -0.85], [0.1, 0.1, 0.2]), 0.05],
    [mirrorX(E([0.38, 2.36, 2.28], [0.1, 0.035, 0.08])), 0.02],
  ]);
  const deco = blend([
    [chain(garland, 0.03), 0],
    [chain(beads, 0.02), 0],
    [bounded(blend(bells.map((b) => [b, 0])), [0, 1.3, 1.85], 0.9), 0.02],
    // Anklets round the forelegs.
    [mirrorX(chain(loop(0.78, 0.36, 1.88, 0.24, 0.24, 0.045, 'xz', 14), 0.02)), 0],
  ]);
  let f = (x, y, z) => smin(body(x, y, z), deco(x, y, z), 0.03);
  if (fine) {
    // The blanket over the back, 12 cm thick, its border raised along its edges.
    const region = (x, y, z) => Math.max(1.0 - y, z - 0.35, -1.7 - z);
    const blanket = (x, y, z) => Math.max(Math.abs(body(x, y, z) - 0.06) - 0.06, region(x, y, z));
    const border = (x, y, z) => Math.max(Math.abs(body(x, y, z) - 0.09) - 0.09, Math.abs(region(x, y, z) + 0.1) - 0.1);
    const f0 = f;
    f = (x, y, z) => smin(smin(f0(x, y, z), blanket(x, y, z), 0.03), border(x, y, z), 0.02);
  }
  // The eyes, the nostrils and the line of the mouth.
  let g = carve(f, mirrorX(E([0.38, 2.28, 2.3], [0.08, 0.06, 0.08])), 0.03);
  g = carve(g, mirrorX(E([0.13, 1.66, 2.8], [0.06, 0.05, 0.06])), 0.02);
  g = carve(g, E([0, 1.47, 2.68], [0.22, 0.02, 0.1]), 0.02);
  return { f: flatBase(g), lo: [-1.6, -0.05, -2.5], hi: [1.6, 3.5, 3.0] };
}
// The Nandi's mesh; fine: false meshes it coarsely, for the small Nandis lining a wall. The fine one
// is meshed at 8 cm and its head, inside an ellipsoid crossing the neck, at 3.5 cm (5 and 12 cm on
// phones), its ridges rubbed pale as polished stone is.
export function nandiGeometry(fine = true) {
  if (!fine) return sculpt('nandi-small', () => nandiField(false), { h: 0.3, reach: 0.8 });
  return sculpt(detail.low ? 'nandi-low' : 'nandi', nandiField, { h: detail.low ? 0.12 : 0.08, reach: 0.5, wear: 0.4,
    split: { region: E([0, 2.38, 2.25], [0.9, 1.15, 0.78]), h: detail.low ? 0.05 : 0.035, lo: [-1.0, 1.1, 1.4], hi: [1.0, 3.5, 3.05] } });
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
    // The thickened rim of each ear, and the toenails, five on a forefoot and four behind.
    [mirrorX(chain(loop(1.03, 2.72, 1.45, 0.62, 0.78, 0.05, 'zy', 18, -1.2, 2.6), 0.04)), 0.05],
    ...[1.15, -1.15].flatMap((z) => [-0.28, -0.14, 0, 0.14, 0.28].slice(z > 0 ? 0 : 1).map((dx) => [mirrorX(E([0.6 + dx, 0.12, z + 0.4 * Math.cos(dx * 3)], [0.07, 0.07, 0.05])), 0.03])),
  ]);
  // The trunk's rings of wrinkles, deepest on its underside half, and the lids over the eyes.
  const onTrunk = (x, y, z) => Math.max(0, 1 - Math.hypot(x, Math.max(0, z - 2.95) * 1.5) / 0.4) * (y < 2.6 && z > 2.35 ? 1 : 0);
  let f = (x, y, z) => body(x, y, z) + 0.022 * Math.sin(y * 52) * onTrunk(x, y, z);
  f = carve(f, mirrorX(E([0.64, 2.98, 2.24], [0.09, 0.025, 0.09])), 0.02);
  f = carve(f, E([0, 2.02, 2.62], [0.24, 0.05, 0.2]), 0.04);
  return { f: flatBase(f), lo: [-1.6, -0.05, -2.4], hi: [1.6, 4.05, 3.4] };
}
let elephantF = null;
export const elephantSurface = () => (elephantF ||= elephantField().f);
// coarse: meshed on a cell twice the size (a quarter of the triangles), as the horse's.
export function elephant(m, s = 1, { coarse = false } = {}) {
  const g = new THREE.Group();
  // On desktops the head and trunk are meshed finer (6.5 cm) than the body (8 cm); a coarse elephant
// and all elephants on phones are meshed whole.
  const fine = !coarse && !detail.low;
  const opts = coarse ? { h: 0.16, reach: 0.6 } : fine ? { h: 0.08, reach: 0.6, wear: 0.3, split: { region: E([0, 2.3, 2.6], [1.1, 1.85, 0.9]), h: 0.065, lo: [-1.3, 0.1, 1.5], hi: [1.3, 4.1, 3.5] } } : { h: 0.08, reach: 0.6 };
  g.add(figure(sculpt(coarse ? 'elephant-coarse' : fine ? 'elephant' : 'elephant-low', elephantField, opts), m));
  g.scale.setScalar(s);
  return g;
}

/* ---------- horse ---------- */

// One of Konark's war horses, about 4.2 m to its ears, straining forward in harness, as carved: the
// right foreleg lifted, the neck arched under a mane carved in strands, the forelock, muscled
// shoulders and quarters, the legs jointed at knee, hock and fetlock down to the hooves, a full
// tail; the bridle with its cheek straps, browband and noseband and a plume between the ears; a
// breast collar hung with bells, a girth, a saddle on a saddle cloth with a raised border; eyes,
// nostrils and the line of the mouth. coarse: the plain horse, without the saddle cloth.
function horseField(coarse = false) {
  const half = [[0.56, 2.6, 0.45, 0.065], [0.5, 2.3, 1.15, 0.065], [0.25, 2.12, 1.5, 0.065], [0, 2.08, 1.58, 0.065]];
  // A leg from the top of the cannon down: fetlock, pastern and hoof.
  const foot = (x, y, z, dz = 0.04) => [
    [E([x, y, z], [0.1, 0.1, 0.11]), 0.04],
    [cone([x, y - 0.02, z + 0.01], [x, y - 0.17, z + dz + 0.03], 0.075, 0.08), 0.04],
    [cone([x, y - 0.17, z + dz + 0.03], [x, y - 0.3, z + dz + 0.05], 0.09, 0.115), 0.02],
  ];
  const crest = chain([[0, 2.95, 0.85, 0.13], [0, 3.5, 1.35, 0.13], [0, 3.95, 1.75, 0.1]], 0.1);
  // The mane: the crest cut into strands falling to the right.
  const mane = (x, y, z) => crest(x, y, z) - 0.03 * Math.abs(Math.sin((y * 0.8 + z) * 26 + x * 8));
  const body = blend([
    [E([0, 2.05, -0.1], [0.6, 0.7, 1.3]), 0],
    [E([0, 2.1, 0.95], [0.58, 0.72, 0.6]), 0.4],
    [E([0, 2.15, -1.1], [0.62, 0.74, 0.7]), 0.45],
    [E([0, 2.6, 0.75], [0.32, 0.32, 0.5]), 0.35],
    // The muscles of the shoulders and of the quarters.
    [mirrorX(E([0.4, 2.2, 0.8], [0.24, 0.55, 0.42])), 0.3],
    [mirrorX(E([0.42, 2.25, -1.15], [0.26, 0.6, 0.5])), 0.3],
    [mirrorX(E([0.36, 1.75, -1.4], [0.18, 0.35, 0.24])), 0.2],
    [chain([[0, 2.45, 1.05, 0.5], [0, 3.15, 1.5, 0.36], [0, 3.6, 1.82, 0.27]], 0.25), 0.35],
    [mane, 0.12],
    [E([0, 3.95, 1.98], [0.08, 0.13, 0.07]), 0.04],
    [chain([[0, 3.78, 1.92, 0.24], [0, 3.32, 2.48, 0.15]], 0.1), 0.15],
    [E([0, 3.62, 2.02], [0.19, 0.26, 0.26]), 0.1],
    [E([0, 3.24, 2.5], [0.15, 0.15, 0.16]), 0.08],
    [mirrorX(E([0.16, 3.68, 2.06], [0.055, 0.045, 0.06])), 0.02],
    [mirrorX(cone([0.1, 3.95, 1.86], [0.13, 4.25, 1.78], 0.075, 0.025)), 0.03],
    // Forelegs: the right one lifted, the left planted.
    [cone([0.3, 1.85, 1.0], [0.32, 1.3, 1.3], 0.19, 0.12), 0.25],
    [E([0.32, 1.3, 1.3], [0.11, 0.11, 0.11]), 0.05],
    [cone([0.32, 1.3, 1.3], [0.32, 0.95, 1.05], 0.1, 0.08), 0.05],
    [E([0.32, 0.88, 1.0], [0.1, 0.09, 0.11]), 0.04],
    [cone([0.32, 0.86, 0.98], [0.32, 0.72, 0.85], 0.08, 0.1), 0.03],
    [cone([-0.3, 1.85, 0.98], [-0.31, 1.05, 1.05], 0.19, 0.12), 0.25],
    [E([-0.31, 1.05, 1.05], [0.11, 0.12, 0.11]), 0.05],
    [cone([-0.31, 1.05, 1.05], [-0.31, 0.38, 1.04], 0.1, 0.085), 0.05],
    ...foot(-0.31, 0.32, 1.04),
    // Hind legs, with their hocks.
    [cone([0.33, 2.0, -1.2], [0.34, 1.3, -1.55], 0.3, 0.13), 0.3],
    [E([0.34, 1.3, -1.58], [0.1, 0.13, 0.13]), 0.05],
    [cone([0.34, 1.3, -1.58], [0.34, 0.38, -1.42], 0.09, 0.085), 0.05],
    ...foot(0.34, 0.32, -1.41),
    [cone([-0.33, 2.0, -1.05], [-0.34, 1.3, -1.4], 0.3, 0.13), 0.3],
    [E([-0.34, 1.3, -1.43], [0.1, 0.13, 0.13]), 0.05],
    [cone([-0.34, 1.3, -1.43], [-0.34, 0.38, -1.27], 0.09, 0.085), 0.05],
    ...foot(-0.34, 0.32, -1.26),
    // The tail, full and falling.
    [chain([[0, 2.6, -1.72, 0.1], [0, 2.25, -2.0, 0.15], [0, 1.6, -2.1, 0.14], [0, 1.0, -2.02, 0.11]], 0.08), 0.1],
    // Harness: the breast collar and its bells, the girth, the saddle, the bridle and the plume.
    [mirrorX(chain(half, 0.03)), 0.03],
    ...[[0, 1.92, 1.62], [0.26, 2.0, 1.52], [-0.26, 2.0, 1.52], [0.47, 2.2, 1.18], [-0.47, 2.2, 1.18]].map((c) => [E(c, [0.07, 0.09, 0.07]), 0.015]),
    [chain(loop(0, 2.05, 0.38, 0.64, 0.74, 0.065), 0.02), 0.03],
    [roundBox([0, 2.74, -0.15], [0.48, 0.07, 0.62], 0.06), 0.06],
    [chain(loop(0, 3.3, 2.38, 0.17, 0.19, 0.05), 0.02), 0.02],
    [mirrorX(chain([[0.19, 3.88, 1.96, 0.035], [0.2, 3.6, 2.12, 0.035], [0.16, 3.34, 2.36, 0.035]], 0.02)), 0.02],
    [chain([[-0.18, 3.9, 1.98, 0.03], [0, 3.95, 2.05, 0.03], [0.18, 3.9, 1.98, 0.03]], 0.02), 0.02],
    [cone([0, 4.0, 1.9], [0, 4.5, 1.72], 0.07, 0.03), 0.03],
    [E([0, 4.55, 1.68], [0.05, 0.14, 0.1]), 0.03],
  ]);
  let f = body;
  if (!coarse) {
    // The saddle cloth: a shell over the back and down the flanks under the saddle, its border raised.
    const region = (x, y, z) => Math.max(1.85 - y, z - 0.55, -0.85 - z);
    const cloth = (x, y, z) => Math.max(Math.abs(body(x, y, z) - 0.06) - 0.055, region(x, y, z));
    const border = (x, y, z) => Math.max(Math.abs(body(x, y, z) - 0.08) - 0.075, Math.abs(region(x, y, z) + 0.08) - 0.08);
    f = (x, y, z) => smin(smin(body(x, y, z), cloth(x, y, z), 0.02), border(x, y, z), 0.02);
  }
  // The nostrils and the line of the mouth.
  f = carve(f, mirrorX(E([0.075, 3.25, 2.63], [0.035, 0.05, 0.035])), 0.015);
  f = carve(f, E([0, 3.13, 2.52], [0.13, 0.015, 0.13]), 0.02);
  return { f: flatBase(f), lo: [-0.9, -0.05, -2.4], hi: [0.9, 4.75, 2.8] };
}
// coarse: a lighter mesh for small or distant horses, such as the ponies on a pilgrim path. A full
// horse on a desktop (js/detail.js) has its head, neck and mane meshed at 4.5 cm and the rest at
// 6.5 cm, its ridges rubbed pale; on a phone it is meshed whole at 6.5 cm.
export function horse(m, { coarse = false } = {}) {
  const g = new THREE.Group();
  const geo = coarse ? sculpt('horse-coarse', () => horseField(true), { h: 0.13, reach: 0.4 })
    : detail.low ? sculpt('horse-low', horseField, { h: 0.065, reach: 0.4 })
    : sculpt('horse', horseField, { h: 0.065, reach: 0.4, wear: 0.3, split: { region: E([0, 3.6, 1.75], [0.5, 1.15, 0.9]), h: 0.045, lo: [-0.55, 2.4, 0.8], hi: [0.55, 4.75, 2.75] } });
  g.add(figure(geo, m));
  return g;
}

/* ---------- lion ---------- */

// A seated lion facing +z, 2.3 m tall with its plinth, as temple gates carve them: upright on its
// haunches, forelegs straight with the toes and claws of the paws marked, a mane of tight spiral
// curls in rows framing the face, a heavy brow over bulging eyes, the mouth open on its fangs and
// tongue, small ears, a collar with a bell at the throat, and the tail curling up over the haunch to
// a flame-like tuft.
function lionField() {
  // The mane: rows of curls round the face, each a knob, the rows set by distance from the face's
  // centre and the knobs by the angle round it.
  const mane0 = E([0, 2.0, 0.38], [0.6, 0.62, 0.5]);
  const curls = (x, y, z) => {
    const a = Math.atan2(x, y - 2.0), r = Math.hypot(x, y - 2.0), k = 0.5 + 0.5 * Math.cos(16 * a + r * 9), row = 0.5 + 0.5 * Math.cos(r * 34);
    return mane0(x, y, z) - 0.05 * k * row - 0.025 * Math.sin(11 * z + 4 * y);
  };
  const body = blend([
    [E([0, 0.95, -0.35], [0.55, 0.5, 0.65]), 0],
    [mirrorX(E([0.42, 0.78, -0.3], [0.22, 0.38, 0.5])), 0.2],
    [mirrorX(E([0.38, 0.53, 0.2], [0.15, 0.08, 0.22])), 0.1],
    [chain([[0, 1.0, -0.15, 0.5], [0, 1.55, 0.25, 0.45]], 0.2), 0.3],
    [E([0, 1.45, 0.42], [0.42, 0.55, 0.35]), 0.3],
    [mirrorX(cone([0.25, 1.35, 0.5], [0.25, 0.55, 0.62], 0.15, 0.11)), 0.15],
    [mirrorX(E([0.25, 0.52, 0.7], [0.13, 0.08, 0.17])), 0.06],
    // The toes of each forepaw, with their claws.
    ...[-0.08, -0.027, 0.027, 0.08].map((dx) => [mirrorX(E([0.25 + dx, 0.5, 0.84], [0.035, 0.045, 0.05])), 0.015]),
    ...[-0.08, -0.027, 0.027, 0.08].map((dx) => [mirrorX(cone([0.25 + dx, 0.5, 0.88], [0.25 + dx, 0.46, 0.92], 0.014, 0.004)), 0.004]),
    [curls, 0.25],
    // The face: the brow, the bulging eyes, the cheeks and muzzle pads, the nose, the ears.
    [E([0, 1.95, 0.85], [0.28, 0.25, 0.3]), 0.12],
    [E([0, 2.18, 0.95], [0.25, 0.07, 0.12]), 0.05],
    [mirrorX(E([0.12, 2.09, 1.03], [0.055, 0.045, 0.045])), 0.02],
    [mirrorX(E([0.1, 1.92, 1.07], [0.1, 0.08, 0.08])), 0.04],
    [E([0, 2.02, 1.1], [0.13, 0.1, 0.1]), 0.06],
    [mirrorX(E([0.14, 2.17, 0.85], [0.12, 0.08, 0.12])), 0.05],
    [mirrorX(E([0.3, 2.45, 0.5], [0.1, 0.12, 0.06])), 0.05],
    // The collar and its bell.
    [chain(loop(0, 1.62, 0.42, 0.4, 0.33, 0.035, 'xz', 18), 0.02), 0.02],
    [E([0, 1.52, 0.78], [0.065, 0.08, 0.065]), 0.015],
    // The tail curling up over the right haunch, and its tuft.
    [chain([[0, 0.55, -0.95, 0.07], [0.45, 0.5, -0.7, 0.06], [0.62, 0.62, -0.3, 0.05], [0.6, 0.9, -0.05, 0.045]], 0.04), 0.04],
    [E([0.58, 1.0, 0.0], [0.06, 0.12, 0.09]), 0.03],
  ]);
  // The open mouth, then the fangs and tongue in it, and the nostrils.
  let f = carve(body, E([0, 1.82, 1.02], [0.16, 0.06, 0.18]), 0.03);
  f = blend([[f, 0], [mirrorX(cone([0.08, 1.87, 1.1], [0.08, 1.8, 1.12], 0.022, 0.004)), 0.006], [mirrorX(cone([0.08, 1.77, 1.1], [0.08, 1.83, 1.11], 0.02, 0.004)), 0.006], [E([0, 1.79, 1.0], [0.09, 0.025, 0.12]), 0.02]]);
  f = carve(f, mirrorX(E([0.05, 1.99, 1.19], [0.03, 0.025, 0.03])), 0.01);
  return { f: flatBase(f, 0.45), lo: [-0.85, 0.4, -1.15], hi: [0.85, 2.75, 1.35] };
}
// A seated lion about 2.3·s high on its own plinth: the guardians of temple gates. A large one (s of
// 1.2 or more) on a desktop (js/detail.js) has its head and mane meshed at 3 cm and the rest at
// 4.2 cm, the ridges of the curls rubbed pale; smaller lions, and all lions on phones, are meshed
// whole at 4.2 cm.
export function lion(s, m) {
  const geo = detail.low || s < 1.2 ? sculpt('lion-low', lionField, { h: 0.042, reach: 0.25 }) : sculpt('lion', lionField, { h: 0.042, reach: 0.25, wear: 0.35,
    split: { region: E([0, 1.98, 0.62], [0.68, 0.72, 0.72]), h: 0.03, lo: [-0.72, 1.2, -0.15], hi: [0.72, 2.75, 1.36] } });
  const g = new THREE.Group(), fig = figure(geo, m);
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
// embroidered cloth over its back and a canopied howdah.
export function rideElephant(m, s = 1, { cloth = '#b3262e', trim = '#e3b54a', howdah = true } = {}) {
  const g = elephant(m, 1), C = shared(cloth, 0.8, 0), T = shared(trim, 0.35, 0.8);
  // The cloth over the back and down both flanks, cast on the body, and its gold border; on phones
  // (js/detail.js) a cloth of three flat panels and a gold strip.
  if (detail.low) {
    g.add(box(2.3, 0.12, 2.6, C, 0, 3.3, 0), box(0.1, 1.5, 2.4, C, 1.18, 2.0, 0), box(0.1, 1.5, 2.4, C, -1.18, 2.0, 0), box(2.4, 0.08, 2.7, T, 0, 3.22, 0));
  } else {
    const [cl, bd] = clothGeometry();
    g.add(mesh(cl, C), mesh(bd, T));
  }
  // The howdah: a railed seat with a canopy on four posts (a temple elephant goes without)
  if (howdah) {
    g.add(box(1.6, 0.5, 1.7, T, 0, 3.42, -0.1), box(1.4, 0.06, 1.5, C, 0, 3.92, -0.1));
    for (const x of [-0.7, 0.7]) for (const z of [-0.8, 0.6]) g.add(cyl(0.035, 0.035, 1.2, T, x, 3.92, z, 6));
    g.add(at(mesh(new THREE.ConeGeometry(1.15, 0.6, 4).rotateY(Math.PI / 4), C), 0, 5.4, -0.1));
  }
  // The painted forehead, laid on the skin (under the nettipattam on a temple elephant).
  if (howdah && detail.low) g.add(at(mesh(new THREE.CircleGeometry(0.42, 16), shared('#f2c21c', 0.8, 0)), 0, 3.0, 2.68).rotateX(-0.45));
  else if (howdah) g.add(mesh(paintGeometry(), shared('#f2c21c', 0.8, 0)));
  if (!detail.low) dress(g, C, T, !howdah);
  g.scale.setScalar(s);
  return g;
}

// The finery of a dressed elephant, on desktops (js/detail.js): a gold fringe of tassels and a row
// of embroidered roundels along the hem of the side cloths, a rope of brass bells round the neck,
// anklets of bells, brass caps on the tusks and, on a temple elephant, the nettipattam: the gold
// caparison hung over the forehead and down the trunk, studded with bosses, with a crescent at its
// head. Built on an elephant of scale 1 (js/details/animals.js).
function dress(g, C, T, temple) {
  const F = elephantSurface(), d = new THREE.Group(), tassel = new THREE.ConeGeometry(0.05, 0.22, 6).translate(0, -0.11, 0), boss = new THREE.SphereGeometry(0.055, 8, 6);
  // The gold fringe along the cloth's hem, and three embroidered roundels on each flank.
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 11; k++) { const [x, y, z] = snap(F, [sx * 1.6, CLOTH_HEM, -1.1 + k * 0.22], 0.12); d.add(at(mesh(tassel, T), x, y - 0.02, z)); }
    for (const z of [-0.75, 0, 0.75]) { const o = mesh(new THREE.CircleGeometry(0.2, 16), T); o.matrixAutoUpdate = false; o.matrix.copy(skinMatrix(F, [sx * 1.6, 2.7, z], [0, 1, 0], 0.115)).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)); d.add(o); }
  }
  // The rope round the neck, laid on the skin, with its bells hanging at the front.
  const ring = onSkin(F, Array.from({ length: 29 }, (_, k) => { const a = (k / 28) * Math.PI * 2; return [Math.sin(a) * 1.4, 2.72 - Math.cos(a) * 1.3, 1.5 + Math.cos(a) * 0.15]; }), 0.05);
  d.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring.map((p) => new THREE.Vector3(...p)), true), 56, 0.045, 6, true), T));
  const bell = new THREE.LatheGeometry([[0, 0], [0.12, 0], [0.11, 0.06], [0.07, 0.18], [0.02, 0.24], [0, 0.25]].map(([a, b]) => new THREE.Vector2(a, b)), 10).translate(0, -0.25, 0);
  for (const k of [12, 14, 16]) { const [x, y, z] = ring[k]; d.add(at(mesh(bell, T), x, y - 0.03, z + 0.06)); }
  for (const sx of [-0.6, 0.6]) for (const z of [1.13, -1.15]) {
    const a = mesh(new THREE.TorusGeometry(0.43, 0.045, 5, 18).rotateX(Math.PI / 2), T, sx, 0.42, z);
    d.add(a);
    for (let k = 0; k < 6; k++) { const t = (k / 6) * Math.PI * 2; d.add(at(mesh(boss, T), sx + Math.cos(t) * 0.44, 0.37, z + Math.sin(t) * 0.44)); }
  }
  for (const sx of [-1, 1]) d.add(cyl(0.065, 0.075, 0.18, T, sx * 0.32, 1.92, 3.08, 8).rotateX(Math.PI / 2 - 0.4));
  if (temple) {
    // The nettipattam, cast on the forehead and down the trunk, studded with bosses, a crescent at
    // its head.
    d.add(mesh(plateGeometry(), T));
    for (const [x, y] of [[-0.36, 3.3], [0.36, 3.3], [-0.24, 3.0], [0.24, 3.0], [0, 2.85], [-0.14, 2.6], [0.14, 2.6], [0, 2.35]]) {
      const o = mesh(boss, T);
      o.matrixAutoUpdate = false;
      o.matrix.copy(skinMatrix(F, [x, y, 3.5], [0, 1, 0], 0.08));
      d.add(o);
    }
    const [cx, cy, cz] = snap(F, [0, 3.55, 3.5], 0.08);
    d.add(at(mesh(new THREE.TorusGeometry(0.2, 0.045, 5, 14, Math.PI).rotateZ(Math.PI), T), cx, cy + 0.02, cz).rotateX(-0.6));
  }
  g.add(mergeByMaterial(d));
}

// The cloth and the forehead plate, cast as thin shells on the elephant's skin: each the band of
// space a few centimetres out from the surface, inside a region of it. Meshed once and kept.
const CLOTH_HEM = 1.9;
function clothGeometry() {
  const F = elephantSurface();
  const region = (x, y, z) => Math.max(CLOTH_HEM - y, Math.abs(z + 0.05) - 1.25);
  const cloth = (x, y, z) => Math.max(Math.abs(F(x, y, z) - 0.08) - 0.065, region(x, y, z));
  const border = (x, y, z) => Math.max(Math.abs(F(x, y, z) - 0.1) - 0.065, Math.abs(region(x, y, z) + 0.08) - 0.08);
  const box = { lo: [-1.5, 1.7, -1.6], hi: [1.5, 3.7, 1.5] };
  return [sculpt('elephant-cloth', () => ({ f: cloth, ...box }), { h: 0.09, reach: 0 }), sculpt('elephant-cloth-border', () => ({ f: border, ...box }), { h: 0.06, reach: 0 })];
}
function paintGeometry() {
  const F = elephantSurface();
  const paint = (x, y, z) => Math.max(Math.abs(F(x, y, z) - 0.02) - 0.012, Math.hypot(x, y - 3.05) - 0.42, 2.3 - z);
  return sculpt('elephant-paint', () => ({ f: paint, lo: [-0.5, 2.55, 2.2], hi: [0.5, 3.55, 3.2] }), { h: 0.018, reach: 0 });
}
function plateGeometry() {
  const F = elephantSurface();
  // Broad at the crown of the head, narrowing to a point down the trunk.
  const region = (x, y, z) => Math.max(Math.abs(x) - 0.56 * Math.min(1, Math.max(0, (y - 1.9) / 1.6)), 1.9 - y, y - 3.6, 2.3 - z);
  const plate = (x, y, z) => Math.max(Math.abs(F(x, y, z) - 0.045) - 0.04, region(x, y, z));
  return sculpt('elephant-plate', () => ({ f: plate, lo: [-0.7, 1.8, 2.2], hi: [0.7, 3.8, 3.4] }), { h: 0.04, reach: 0 });
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
// Camels at [x, z, ry], each with a saddle cloth.
export function camels(spots, { y = 0, cloths = ['#b3262e', '#2f5d9a', '#e3b23c', '#2f7a3f'] } = {}) {
  const g = new THREE.Group();
  spots.forEach(([x, z, ry = 0], i) => {
    const c = new THREE.Group(), C = shared(cloths[i % cloths.length], 0.8, 0);
    c.add(mesh(sculpt('camel', camelField, { h: 0.045, reach: 0.2 }), statueMaterial(CAMEL)), box(0.75, 0.08, 1.1, C, 0, 2.48, -0.05), box(0.05, 0.6, 1.0, C, 0.37, 1.95, -0.05), box(0.05, 0.6, 1.0, C, -0.37, 1.95, -0.05));
    c.position.set(x, y, z);
    c.rotation.y = ry;
    g.add(c);
  });
  return g;
}
