import * as THREE from 'three';
import { mesh } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, roundBox, lathe, sculpt, statueMaterial } from '../sdf.js';

// Human figures in stone and bronze, each body sculpted as one skin from a signed distance field
// (see js/sdf.js), so arms grow out of shoulders and legs out of hips as in a carving or a casting,
// with the chest, waist, knees and the folds of robes and dhotis modelled. The parts finer than the
// grid stay meshes and are set on the skin by the monument's own builder: faces (helpers.face),
// fingers, curls, beards and what the figures hold. Each body is meshed once and kept.

const body = (key, field, h, m, deep) => mesh(sculpt(key, field, { h, reach: h * 6, deep }), statueMaterial(m));

/* ---------- door guardian ---------- */

// A door guardian (dvarapala) about 1.7 m tall on his plinth: standing with the weight on one hip,
// one hand resting on a club planted beside him and the other raised in warning, in a short dhoti,
// with a tall crown.
function guardianField() {
  const f = blend([
    [roundBox([0, 0.14, 0], [0.31, 0.14, 0.25], 0.02), 0],
    [mirrorX(cone([0.09, 0.3, 0.02], [0.1, 0.76, 0], 0.055, 0.085)), 0.04],
    [mirrorX(E([0.1, 0.31, 0.07], [0.05, 0.03, 0.09])), 0.03],
    [E([0.02, 0.82, 0], [0.17, 0.13, 0.11]), 0.08],
    [cone([0.02, 0.86, 0], [0, 0.55, 0.02], 0.14, 0.17), 0.05],
    [chain([[0.02, 0.86, 0, 0.12], [0, 1.08, 0, 0.13], [0, 1.22, 0, 0.16]], 0.08), 0.08],
    [E([0, 1.17, 0.03], [0.16, 0.09, 0.09]), 0.05],
    [mirrorX(E([0.17, 1.25, 0], [0.065, 0.06, 0.06])), 0.05],
    [cone([0.17, 1.25, 0], [0.24, 1.0, 0.03], 0.055, 0.045), 0.04],
    [cone([0.24, 1.0, 0.03], [0.27, 0.8, 0.07], 0.045, 0.035), 0.03],
    [E([0.28, 0.76, 0.08], [0.04, 0.05, 0.045]), 0.02],
    [cone([0.31, 0.3, 0.09], [0.3, 0.8, 0.09], 0.035, 0.065), 0.02],
    [cone([-0.17, 1.25, 0], [-0.27, 1.07, 0.08], 0.055, 0.045), 0.04],
    [cone([-0.27, 1.07, 0.08], [-0.25, 1.37, 0.12], 0.045, 0.035), 0.03],
    [E([-0.25, 1.42, 0.12], [0.035, 0.06, 0.03]), 0.02],
    [cone([0, 1.24, 0], [0, 1.34, 0.01], 0.05, 0.05), 0.03],
    [E([0, 1.42, 0.02], [0.075, 0.095, 0.085]), 0.03],
    [cone([0, 1.47, 0], [0, 1.64, 0], 0.082, 0.03), 0.03],
  ]);
  return { f, lo: [-0.4, -0.02, -0.3], hi: [0.4, 1.7, 0.3] };
}
// A guardian about h tall, facing +z on y = 0.
export function guardian(h, m) {
  const g = new THREE.Group();
  g.add(body('guardian', guardianField, 0.045, m));
  g.scale.setScalar(h / 1.7);
  return g;
}

/* ---------- the colossal statues ---------- */

// The seated Shiva at Nageshwar, cross-legged on his lotus, the right hand raised in blessing and
// the left resting on the knee; in the coordinates of seatedShiva() in nageshwar-temple.js. The
// head, fingers and serpent are meshes.
function shivaField() {
  const legs = mirrorX(blend([[cone([2.6, 6.6, 0], [6.2, 5.8, 3.2], 2.3, 1.9), 0], [E([5.9, 6.0, 3.1], [1.9, 1.7, 1.8]), 0.8]]));
  const shins = blend([
    [cone([6.2, 5.6, 3.4], [-3.6, 5.4, 4.6], 1.7, 1.25), 0],
    [cone([-6.2, 5.6, 3.6], [3.6, 5.2, 5.0], 1.7, 1.25), 0],
    [E([-4.2, 6.4, 4.5], [1.1, 0.7, 2.0]), 0.5],
    [E([4.2, 6.2, 4.9], [1.1, 0.7, 2.0]), 0.5],
  ]);
  const b = blend([
    [E([0, 6.6, 0.4], [5.0, 2.3, 3.8]), 0],
    [legs, 1.2],
    [shins, 0.6],
    [E([0, 9.4, 0], [3.6, 2.6, 2.7]), 1.6],
    [E([0, 10.6, 1.4], [3.0, 2.6, 1.6]), 1.2],
    [E([0, 13.6, 0.1], [4.9, 3.0, 3.2]), 1.6],
    [mirrorX(E([2.0, 14.6, 1.9], [2.4, 1.15, 0.95])), 1.3],
    [E([0, 15.9, -0.2], [5.0, 1.5, 2.7]), 1.2],
    [mirrorX(E([4.6, 16.0, 0], [1.75, 1.6, 1.6])), 0.9],
    [cone([0, 16.8, 0], [0, 19.6, 0.2], 1.35, 1.2), 0.8],
    [cone([4.9, 15.6, 0.2], [6.6, 12.4, 1.6], 1.2, 0.95), 0.7],
    [cone([6.6, 12.4, 1.6], [6.9, 15.8, 3.4], 0.95, 0.72), 0.4],
    [E([6.9, 16.8, 3.7], [0.55, 1.45, 1.05]), 0.35],
    [cone([-4.9, 15.6, 0.2], [-6.4, 12.2, 1.4], 1.2, 0.95), 0.7],
    [cone([-6.4, 12.2, 1.4], [-6.2, 8.4, 3.6], 0.95, 0.75), 0.4],
    [E([-6.1, 7.7, 4.2], [1.05, 0.65, 1.6]), 0.4],
  ]);
  const navel = E([0, 10.2, 2.95], [0.25, 0.3, 0.3]);
  return { f: flatBase(carve(b, navel, 0.15), 3.6, 0.2), lo: [-9.5, 3.4, -4.5], hi: [9.5, 21.4, 7.6] };
}
export const shivaBody = (m) => body('shiva', shivaField, 0.24, m);

// Sardar Patel at the Statue of Unity, in the coordinates of patel() in statue-of-unity.js (177 units
// tall before it is scaled): the dhoti hanging in deep folds to the sandalled feet, with the legs
// showing through it, the kurta, the shawl over the shoulders with its end thrown across the chest,
// arms hanging in loose sleeves, and the neck. The head and fingers are meshes.
function patelField() {
  const dhoti = lathe([[17.8, 3], [19.6, 8], [18.6, 26], [17.2, 50], [16.2, 74], [15.4, 90], [0.1, 90]], { sz: 0.62, folds: 22, amp: 0.06, from: 3, to: 75 });
  const torso = lathe([[15.4, 86], [16.6, 100], [18.4, 118], [19.8, 131], [17.4, 140], [8, 145], [0.1, 145.5]], { sz: 0.62 });
  const shawl = lathe([[19.6, 104], [21.6, 114], [22.4, 128], [21.4, 137], [17.6, 143], [8.6, 146.4], [0.1, 146.8]], { sz: 0.7, folds: 16, amp: 0.05, from: 104, to: 136 });
  const b = blend([
    [dhoti, 0],
    [torso, 2],
    [shawl, 1.5],
    [chain([[16, 140, 6, 3], [6, 130, 13, 3], [-6, 118, 12.5, 3], [-14, 108, 9, 3]], 1), 1],
    [mirrorX(E([7.5, 2.2, 4.5], [5, 2.4, 8.5])), 1.5],
    [mirrorX(E([20.5, 136, 0.5], [6.6, 6.2, 5.6])), 2],
    [mirrorX(cone([20.5, 136, 0.5], [23.6, 111, 2], 6.2, 5.4)), 2],
    [mirrorX(cone([23.6, 111, 2], [22.4, 89, 3.5], 5.4, 4.3)), 1.5],
    [mirrorX(E([22.2, 83.4, 4], [3.3, 5.2, 3.9])), 1.2],
    [cone([0, 142, 0], [0, 153, 0.8], 6.4, 6.8), 2],
  ]);
  // The cloth falls between the legs, front and back.
  const creases = blend([[E([0, 42, 11.6], [1.7, 37, 2.4]), 0], [E([0, 42, -11.6], [1.7, 37, 2.4]), 0]]);
  return { f: flatBase(carve(b, creases, 1.2)), lo: [-31, -1, -17], hi: [31, 160, 21] };
}
export const patelBody = (m) => body('patel', patelField, 1.1, m, [0.3, 0.34, 0.28]);

// Bahubali at Shravanabelagola, standing in kayotsarga in the coordinates of bahubali() in
// gommateshwara.js: broad shoulders, a narrow waist, the chest and knees modelled, arms hanging
// straight. The head, curls and creepers are meshes.
function bahubaliField() {
  const b = blend([
    [E([0, 8.9, 0], [2.45, 1.5, 1.6]), 0],
    [mirrorX(chain([[1.25, 0.75, 0, 0.62], [1.35, 4.6, 0, 0.85], [1.45, 8.6, 0, 1.25]], 0.5)), 0.6],
    [mirrorX(E([1.32, 3.1, -0.3], [0.62, 1.2, 0.6])), 0.5],
    [mirrorX(E([1.35, 4.65, 0.42], [0.5, 0.55, 0.42])), 0.3],
    [mirrorX(E([1.4, 6.8, 0.15], [1.05, 1.9, 1.05])), 0.6],
    [mirrorX(E([1.25, 0.4, 0.5], [0.9, 0.45, 1.6])), 0.25],
    [E([0, 10.3, 0], [2.45, 1.6, 1.6]), 0.9],
    [E([0, 11.0, 0.75], [2.0, 1.5, 1.0]), 0.8],
    [E([0, 13.1, 0], [3.3, 2.1, 2.1]), 1.0],
    [mirrorX(E([1.45, 13.7, 1.0], [1.65, 1.0, 0.85])), 0.9],
    [E([0, 15.1, -0.2], [2.6, 0.7, 1.2]), 0.7],
    [mirrorX(E([3.1, 14.85, 0], [0.95, 0.9, 0.9])), 0.8],
    [cone([0, 15.0, 0], [0, 16.6, 0.1], 0.85, 0.75), 0.5],
    [mirrorX(chain([[3.3, 14.6, 0, 0.82], [3.6, 11.5, 0.1, 0.72], [3.5, 7.8, 0.2, 0.58]], 0.3)), 0.6],
    [mirrorX(E([3.55, 13.2, 0], [0.8, 1.3, 0.8])), 0.4],
    [mirrorX(E([3.5, 7.15, 0.25], [0.55, 1.1, 0.42])), 0.25],
  ]);
  const navel = E([0, 10.6, 1.72], [0.16, 0.2, 0.2]);
  return { f: flatBase(carve(b, navel, 0.1)), lo: [-5, -0.1, -2.6], hi: [5, 17.5, 2.6] };
}
export const bahubaliBody = (m) => body('bahubali', bahubaliField, 0.17, m);

// Thiruvalluvar at Kanyakumari, in the coordinates of thiruvalluvar() in
// vivekananda-rock-memorial.js: the robe in folds from the pedestal up, its end thrown across the
// chest, the right hand raised and the left holding the palm-leaf book. The head, beard, fingers
// and book are meshes.
function thiruvalluvarField() {
  const robe = lathe([[4.4, 12.4], [4.6, 16.4], [4.0, 22.4], [3.7, 27.4], [4.0, 32.4], [4.5, 36.4], [2.6, 38.4], [0.1, 38.7]], { sz: 0.72, folds: 18, amp: 0.07, from: 12.4, to: 30.4 });
  const b = blend([
    [robe, 0],
    [chain([[3.6, 36.5, 1.6, 0.9], [1.2, 33, 3.2, 0.9], [-2.4, 29, 3.0, 0.9], [-3.8, 25, 2.0, 0.9]], 0.4), 0.4],
    [mirrorX(E([4, 36.4, 0], [1.6, 1.5, 1.4])), 0.8],
    [cone([4.2, 36.2, 0], [5.2, 31.2, 1.6], 1.05, 0.9), 0.5],
    [cone([5.2, 31.2, 1.6], [5.0, 35.6, 3.6], 0.9, 0.7), 0.3],
    [E([5.0, 36.4, 3.9], [0.5, 1.0, 0.75]), 0.2],
    [cone([-4.2, 36.2, 0], [-4.8, 31.2, 1.4], 1.05, 0.9), 0.5],
    [cone([-4.8, 31.2, 1.4], [-3.2, 29.6, 3.6], 0.9, 0.7), 0.3],
    [cone([0, 37.4, 0], [0, 38.8, 0.3], 1.25, 1.2), 0.6],
  ]);
  return { f: flatBase(b, 12.4), lo: [-6.6, 12.2, -4.2], hi: [7, 40.4, 5.8] };
}
export const thiruvalluvarBody = (m) => body('thiruvalluvar', thiruvalluvarField, 0.22, m);
