import * as THREE from 'three';
import { mesh } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, roundBox, lathe, snap, sculpt, statueMaterial, bounded, smin, smax, torus, turn, slab } from '../sdf.js';
import { detail } from '../detail.js';

// Human figures in stone and bronze, each body sculpted as one skin from a signed distance field
// (see js/sdf.js), so arms grow out of shoulders and legs out of hips as in a carving or a casting,
// with the chest, waist, knees and the folds of robes and dhotis modelled. The parts finer than the
// grid stay meshes and are set on the skin by the monument's own builder: faces (helpers.face),
// fingers, curls, beards and what the figures hold. Each body is meshed once and kept.

const body = (key, field, h, m, deep, opts = {}) => mesh(sculpt(key, field, { h, reach: h * 6, deep, ...opts }), statueMaterial(m));

/* ---------- door guardian ---------- */

// A door guardian (dvarapala) about 1.7 m tall on his plinth: standing with the weight on one hip,
// one hand resting on a club planted beside him and the other raised in warning, in a short dhoti,
// as temple doors carve them: a fierce face (a heavy brow over bulging eyes, a broad nose, a curling
// moustache, fangs at the corners of the mouth), great round earrings, a tall crown (kirita) of
// stacked bands rising to a knob, a necklace, armlets and a belt with its clasp, and the club
// ribbed along its head.
function guardianField() {
  const bodyF = blend([
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
    [cone([0.31, 0.3, 0.09], [0.3, 0.68, 0.09], 0.035, 0.05), 0.02],
    [cone([-0.17, 1.25, 0], [-0.27, 1.07, 0.08], 0.055, 0.045), 0.04],
    [cone([-0.27, 1.07, 0.08], [-0.25, 1.37, 0.12], 0.045, 0.035), 0.03],
    [E([-0.25, 1.42, 0.12], [0.035, 0.06, 0.03]), 0.02],
    [cone([0, 1.24, 0], [0, 1.34, 0.01], 0.05, 0.05), 0.03],
    // The broad chest and the belly over the belt.
    [mirrorX(E([0.065, 1.165, 0.065], [0.075, 0.055, 0.045])), 0.03],
    [E([0.005, 1.0, 0.055], [0.105, 0.09, 0.075]), 0.04],
  ]);
  // The dhoti flares to its hem in folds, and its sash hangs in a loop at the front.
  const fold = (x, y, z) => (y < 0.84 && y > 0.5 ? 0.009 * Math.sin(Math.atan2(x, z) * 11) * Math.min(1, (0.84 - y) / 0.1) : 0);
  const body0 = bodyF;
  const bodyF2 = (x, y, z) => body0(x, y, z) + fold(x, y, z);
  const sash = chain([[-0.11, 0.86, 0.12, 0.024], [-0.05, 0.73, 0.155, 0.024], [0.07, 0.71, 0.155, 0.024], [0.13, 0.85, 0.12, 0.024]], 0.012);
  // The club's head, ribbed, and its knob.
  const club = blend([[cone([0.3, 0.66, 0.09], [0.3, 0.86, 0.09], 0.065, 0.07), 0], ...[0.7, 0.76, 0.82].map((y) => [torus([0.3, y, 0.09], 0.072, 0.012), 0.005]), [E([0.3, 0.89, 0.09], [0.04, 0.035, 0.04]), 0.01]]);
  // Jewellery: a necklace hanging on the chest, armlets, the belt and its clasp, the dhoti's hem.
  const jewels = blend([
    [chain(Array.from({ length: 13 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return [Math.sin(a) * 0.12, 1.26 - Math.cos(a) * 0.07 - (Math.cos(a) > 0 ? 0.03 : 0), 0.035 + Math.cos(a) * 0.1, 0.02]; }), 0.012), 0],
    [E([0, 1.17, 0.125], [0.025, 0.03, 0.015]), 0.01],
    [torus([0.205, 1.18, 0.015], 0.05, 0.02), 0],
    [torus([-0.215, 1.18, 0.03], 0.05, 0.02), 0],
    [chain(Array.from({ length: 13 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return [0.02 + Math.sin(a) * 0.165, 0.87, Math.cos(a) * 0.12, 0.024]; }), 0.012), 0],
    [E([0.02, 0.86, 0.125], [0.04, 0.035, 0.02]), 0.01],
  ]);
  // The head: the face, the earrings and the crown.
  let head = blend([
    [E([0, 1.42, 0.02], [0.075, 0.095, 0.085]), 0],
    [E([0, 1.445, 0.085], [0.06, 0.018, 0.03]), 0.01],
    [mirrorX(E([0.028, 1.425, 0.087], [0.016, 0.012, 0.012])), 0.004],
    [cone([0, 1.44, 0.095], [0, 1.4, 0.108], 0.009, 0.016), 0.006],
    [mirrorX(cone([0.006, 1.388, 0.1], [0.038, 1.392, 0.088], 0.008, 0.005)), 0.004],
    [mirrorX(cone([0.022, 1.37, 0.088], [0.026, 1.355, 0.09], 0.005, 0.002)), 0.002],
    [mirrorX(E([0.075, 1.41, 0.0], [0.012, 0.03, 0.02])), 0.006],
    [mirrorX(torus([0.08, 1.355, 0.0], 0.03, 0.007)), 0],
    // The kirita: stacked bands narrowing upward, then a knob.
    [cone([0, 1.47, 0], [0, 1.62, 0], 0.082, 0.04), 0.01],
    ...[1.485, 1.53, 1.575].map((y, i) => [torus([0, y, 0], 0.08 - i * 0.014, 0.01), 0.004]),
    [E([0, 1.64, 0], [0.032, 0.03, 0.032]), 0.008],
  ]);
  head = carve(head, E([0, 1.375, 0.088], [0.03, 0.006, 0.02]), 0.003);
  const headB = bounded(head, [0, 1.5, 0.02], 0.2, 0.06);
  const f = (x, y, z) => smin(smin(smin(smin(bodyF2(x, y, z), club(x, y, z), 0.01), jewels(x, y, z), 0.006), sash(x, y, z), 0.006), headB(x, y, z), 0.02);
  return { f, lo: [-0.4, -0.02, -0.3], hi: [0.4, 1.7, 0.3] };
}
// A guardian about h tall, facing +z on y = 0. A large one (1.3 m or more) on a desktop (js/detail.js)
// has its head and crown meshed at 1.1 cm and the rest at 3.5 cm; the small ones in a sanctum's niches,
// often dozens to a temple court, and all of them on phones, are meshed whole at 4.5 cm.
export function guardian(h, m) {
  const g = new THREE.Group();
  g.add(detail.low || h < 1.3 ? body('guardian-low', guardianField, 0.045, m) : body('guardian', guardianField, 0.035, m, undefined, {
    wear: 0.35, split: { region: E([0, 1.49, 0.02], [0.14, 0.2, 0.14]), h: 0.011, lo: [-0.16, 1.27, -0.14], hi: [0.16, 1.7, 0.18] } }));
  g.scale.setScalar(h / 1.7);
  return g;
}

/* ---------- the colossal statues ---------- */

// The seated Shiva at Nageshwar, seated in the half lotus on his seat, with four arms: the front right (-x)
// raised in blessing, the front left resting on the knee, the rear right gripping the trishul and
// the rear left raising the damru; in the coordinates of mahayogiShiva() in nageshwar-temple.js.
// The head and hands are carved in the field, as on the Statue of Unity: the face with its brow,
// eyes under their lids, nose, lips and chin, and the ears; the raised palm with its four fingers
// and thumb, the fingers of the left hand curling over the knee, and the rear hands closed round
// the trishul and the damru; and the feet with their toes: the right foot lying sole up on the left
// thigh by the resting hand, the left foot tucked under the right knee, its toes showing at the
// front of the seat. The hair, the serpent and the ornaments are meshes.
function shivaField() {
  const legs = mirrorX(blend([[cone([2.6, 6.6, 0], [6.2, 5.8, 3.2], 2.3, 1.9), 0], [E([5.9, 6.0, 3.1], [1.9, 1.7, 1.8]), 0.8]]));
  // The shins cross in front: the left, from the left knee, passes low under the right to the
  // tucked left foot; the right rises over it to the right foot on the left thigh.
  const shins = blend([
    [cone([6.2, 5.6, 3.4], [-3.4, 4.75, 5.4], 1.7, 1.2), 0],
    [cone([-6.2, 5.6, 3.6], [3.6, 5.9, 5.0], 1.7, 1.25), 0],
  ]);
  // The feet, lying sole up at the end of each crossed shin, one on the left thigh and one under the
  // right knee (the half lotus, ardha padmasana):
  // the heel by the ankle, the arch, the ball of the foot, and five toes in a row, the big toe the
  // largest, their tips turned up a little; the sole creased across. sx: which way the foot points
  // along x (the left foot, on the right thigh, points to -x); dy, dz: where it lies.
  const foot = (sx, dy, dz) => {
    const X = (v) => sx * v, z0 = 4.45 + dz, y0 = 7.15 + dy;
    const toes = [[0.0, 0.32, 1.2], [0.4, 0.23, 1.05], [0.72, 0.21, 0.95], [1.01, 0.19, 0.84], [1.27, 0.17, 0.72]];
    let ft = blend([
      [E([X(3.45), y0 - 0.25, z0], [0.8, 0.62, 0.78]), 0],
      [E([X(4.55), y0, z0 + 0.05], [1.35, 0.5, 0.92]), 0.35],
      [E([X(5.55), y0 + 0.05, z0 + 0.1], [0.55, 0.45, 1.0]), 0.3],
    ]);
    // The toes, kept apart from one another so each shows, joined to the ball of the foot.
    const toeF = blend(toes.map(([o, r, L]) => [chain([[X(5.85), y0 + 0.18, z0 + 0.72 - o * 1.05, r], [X(5.85 + L * 0.55), y0 + 0.26, z0 + 0.72 - o * 1.08, r * 0.92], [X(5.85 + L), y0 + 0.42, z0 + 0.72 - o * 1.12, r * 0.8]], 0.04), 0.015]));
    ft = blend([[ft, 0], [toeF, 0.12]]);
    // Creases across the sole (its upturned face), and the nails on the toes' tips.
    for (const [x, w] of [[4.3, 0.75], [4.95, 0.8]]) ft = carve(ft, E([X(x), y0 + 0.5, z0], [0.05, 0.06, w]), 0.05);
    const nails = blend(toes.map(([o, r, L]) => [E([X(5.85 + L * 0.93), y0 + 0.42 + r * 0.55, z0 + 0.72 - o * 1.12], [r * 0.55, r * 0.22, r * 0.62]), 0.02]));
    return blend([[ft, 0], [nails, 0.03]]);
  };
  const footL = bounded(foot(-1, -2.35, 1.6), [-4.9, 4.85, 6.1], 2.6, 2.0), footR = bounded(foot(1, -0.2, 0.4), [4.9, 7.0, 4.9], 2.6, 2.0);
  const feet = (x, y, z) => (x < 0 ? footL(x, y, z) : footR(x, y, z));
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
    // The front right hand (-x) raised in blessing, the front left (+x) resting on the knee.
    [cone([-4.9, 15.6, 0.2], [-6.6, 12.4, 1.6], 1.2, 0.95), 0.7],
    [cone([-6.6, 12.4, 1.6], [-6.9, 15.8, 3.4], 0.95, 0.72), 0.4],
    [E([-6.9, 16.75, 3.5], [0.85, 1.0, 0.34]), 0.35],
    [cone([4.9, 15.6, 0.2], [6.4, 12.2, 1.4], 1.2, 0.95), 0.7],
    [cone([6.4, 12.2, 1.4], [6.2, 8.4, 3.6], 0.95, 0.75), 0.4],
    [E([6.15, 7.9, 4.55], [0.85, 0.34, 1.0]), 0.4],
    // The two rear arms, from behind the shoulders: the right (-x) gripping the trishul's shaft at
    // shoulder height, the left (+x) raising the damru.
    [cone([-4.3, 15.9, -1.0], [-7.5, 13.4, -1.7], 1.0, 0.82), 0.6],
    [cone([-7.5, 13.4, -1.7], [-8.6, 15.6, -0.7], 0.82, 0.66), 0.35],
    [E([-8.75, 16.1, -0.62], [0.62, 0.8, 0.6]), 0.3],
    [cone([4.3, 15.9, -1.0], [7.6, 13.8, -1.6], 1.0, 0.82), 0.6],
    [cone([7.6, 13.8, -1.6], [8.5, 16.6, -0.5], 0.82, 0.66), 0.35],
    [E([8.6, 17.2, -0.42], [0.6, 0.8, 0.58]), 0.3],
  ]);
  // The hands' fingers. The raised right palm faces forward, its four fingers rising a little
  // apart, the middle the longest, the thumb out to the side towards the body; the left hand rests
  // palm down on the knee, its fingers curling over it; the rear hands are fists, their knuckles
  // in a row in front of what they hold and the thumb over the top.
  const fingersOf = (list) => blend(list.map((pts) => [chain(pts, 0.06), 0.08]));
  const raised = fingersOf([
    ...[[-7.5, 0.95, -0.12], [-7.1, 1.2, -0.04], [-6.7, 1.28, 0], [-6.32, 1.15, -0.04]].map(([x, L, lean]) => [[x, 17.55, 3.52, 0.19], [x + lean, 17.55 + L * 0.55, 3.5, 0.175], [x + lean * 2, 17.55 + L, 3.42, 0.15]]),
    [[-6.35, 16.35, 3.6, 0.22], [-6.0, 16.75, 3.72, 0.2], [-5.78, 17.15, 3.78, 0.16]],
  ]);
  const resting = fingersOf([
    ...[5.62, 6.0, 6.38, 6.74].map((x, i) => [[x, 7.85, 5.4, 0.19 - i * 0.012], [x + 0.04, 7.6, 5.95, 0.175 - i * 0.012], [x + 0.06, 7.15, 6.3 - i * 0.05, 0.15 - i * 0.01]]),
    [[5.4, 7.95, 4.7, 0.21], [5.2, 7.75, 5.25, 0.18], [5.15, 7.5, 5.6, 0.15]],
  ]);
  const fist = (x, y0, z, sx) => blend([
    ...[0, 1, 2, 3].map((i) => [E([x, y0 - i * 0.32, z + 0.5], [0.42, 0.17, 0.24]), 0.06]),
    [E([x - sx * 0.1, y0 + 0.2, z + 0.32], [0.38, 0.18, 0.26]), 0.06],
  ]);
  const hands = blend([[raised, 0], [resting, 0], [fist(-8.75, 16.6, -0.62, -1), 0], [fist(8.6, 17.7, -0.42, 1), 0]]);
  // The head: the skull, a jaw tapering to the chin, high cheekbones, a straight brow over
  // almond eyes set in their sockets under full lids, a long straight nose with its nostrils, full
  // lips with the line between them, and the ears; laid out as on the Statue of Unity's head, here
  // about a quarter its size (P scales its units), younger and calmer, without the lines of age.
  const S = 0.225, P = (x, y, z) => [x * S, 21.2 + y * S * 1.08, 0.3 + z * S], k = (v) => v * S;
  let head = blend([
    [E(P(0, 1.4, -0.5), [9.8 * S, 10.8 * S * 1.08, 10.3 * S]), 0],
    [E(P(0, -5.0, 1.2), [7.4 * S, 5.6 * S * 1.08, 7.4 * S]), k(3)],
    [mirrorX(E(P(4.6, -2.2, 6.4), [3.2 * S, 2.8 * S, 2.8 * S])), k(1.6)],
    [E(P(0, 2.7, 8.3), [6.6 * S, 1.2 * S, 2.1 * S]), k(1.6)],
    [cone(P(0, 2.0, 9.4), P(0, -2.4, 11.6), k(0.95), k(1.35)), k(0.8)],
    [E(P(0, -2.6, 11.2), [1.6 * S, 1.2 * S, 1.3 * S]), k(0.6)],
    [mirrorX(E(P(1.4, -3.0, 10.1), [0.95 * S, 0.85 * S, 0.85 * S])), k(0.5)],
    [E(P(0, -8.4, 6.6), [3.0 * S, 2.0 * S, 2.4 * S]), k(1.5)],
    [mirrorX(E(P(9.9, -0.4, -0.6), [1.3 * S, 3.5 * S, 2.5 * S])), k(0.6)],
  ]);
  head = carve(head, mirrorX(E(P(3.4, 0.5, 9.2), [2.4 * S, 1.5 * S, 2.0 * S])), k(0.9));
  head = blend([[head, 0],
    // The eyeball in the socket, and the upper and lower lids round it, the eyes wide open.
    [mirrorX(E(P(3.4, 0.35, 7.9), [1.95 * S, 1.2 * S, 1.6 * S])), k(0.2)],
    [mirrorX(E(P(3.4, 1.45, 8.0), [2.2 * S, 0.42 * S, 1.3 * S])), k(0.25)],
    [mirrorX(E(P(3.45, -0.85, 8.0), [1.9 * S, 0.3 * S, 0.95 * S])), k(0.3)],
    [E(P(0, -4.4, 9.4), [2.6 * S, 0.65 * S, 1.05 * S]), k(0.5)],
    [E(P(0, -5.6, 9.1), [2.3 * S, 0.8 * S, 1.05 * S]), k(0.5)]]);
  head = carve(head, E(P(0, -5.0, 9.95), [2.6 * S, 0.17 * S, 1.0 * S]), k(0.2));
  head = carve(head, mirrorX(E(P(2.7, -5.2, 9.1), [0.45 * S, 0.28 * S, 0.6 * S])), k(0.2));
  // The philtrum under the nose, and the ear's hollow.
  head = carve(head, E(P(0, -3.65, 10.25), [0.35 * S, 0.6 * S, 0.3 * S]), k(0.15));
  head = carve(head, mirrorX(E(P(10.6, -0.2, -0.2), [0.6 * S, 2.2 * S, 1.4 * S])), k(0.2));
  const headB = bounded(head, [0, 21.4, 0.4], 3.2, 0.5);
  const handsB = (x, y, z) => (Math.abs(x) < 5 ? Infinity : hands(x, y, z));
  // The anatomy of a yogi's body, laid on that skin: the abdominal muscles in three pairs, the
  // collarbones, and the line down the middle of the belly.
  const on = (p, depth) => snap(b, p, -depth);
  const abs = [];
  for (const [y, s] of [[12.9, 1], [11.85, 0.95], [10.85, 0.9]]) for (const x of [-0.72, 0.72]) abs.push([E(on([x, y, 4], 0.26), [0.85 * s, 0.55 * s, 0.4]), 0.35]);
  const clav = [-1, 1].map((s) => [cone(on([s * 0.6, 16.7, 3], 0.14), on([s * 3.6, 16.95, 2], 0.14), 0.3, 0.26), 0.35]);
  const anatomy = blend([[b, 0], ...abs, ...clav]);
  const line = E(on([0, 11.9, 4], 0), [0.12, 1.25, 0.16]);
  const navel = E([0, 10.2, 2.95], [0.25, 0.3, 0.3]);
  const feetB = (x, y, z) => (y > 9.4 || Math.abs(x) < 2.4 ? Infinity : feet(x, y, z));
  const all = (x, y, z) => smin(smin(smin(carve(carve(anatomy, line, 0.15), navel, 0.15)(x, y, z), handsB(x, y, z), 0.12), feetB(x, y, z), 0.2), y > 17.4 ? headB(x, y, z) : Infinity, 0.5);
  // The feet and the resting hand, for the fine regions round them (shivaBody).
  const palmL = E([6.15, 7.9, 4.55], [0.85, 0.34, 1.0]);
  return { f: flatBase(all, 3.6, 0.2), lo: [-10.5, 3.4, -4.5], hi: [10.5, 24.6, 7.6], feet: (x, y, z) => (x < 0 ? footL(x, y, z) : footR(x, y, z)), resting: bounded((x, y, z) => Math.min(resting(x, y, z), palmL(x, y, z)), [6.1, 7.6, 5.2], 2.0, 2.0) };
}
// coarse: meshed on a cell half as large again (under half the triangles, under half the time), for
// phones (js/detail.js); kept under its own key, so both can be cached.
// The head, the four hands and the feet are meshed on finer cells, inside regions that cross the neck and
// the wrists squarely.
export const shivaBody = (m, { coarse = false } = {}) => body(coarse ? 'shiva-coarse' : 'shiva', shivaField, coarse ? 0.36 : 0.24, m, undefined, {
  split: [
    // The head's region crosses the neck under the cobra's coils, so its seam is hidden.
    { region: E([0, 21.2, 0.6], [2.9, 3.5, 2.9]), h: coarse ? 0.11 : 0.065, lo: [-3.2, 17.5, -2.6], hi: [3.2, 24.9, 3.8] },
    { region: E([-6.6, 17.0, 3.5], [1.6, 1.75, 1.1]), h: coarse ? 0.13 : 0.075, lo: [-8.4, 15.1, 2.3], hi: [-4.9, 18.9, 4.7] },
    // The resting hand and the feet lie on the legs: their regions are their own shapes grown a
    // little, so the change of mesh falls in the crease where they meet the leg, not across it.
    { region: (x, y, z) => Math.min(9, shivaParts().resting(x, y, z) - 0.4), h: coarse ? 0.13 : 0.075, lo: [4.4, 6.4, 3.4], hi: [7.8, 8.8, 7.0] },
    { region: E([-8.75, 16.1, -0.4], [1.05, 1.15, 1.05]), h: coarse ? 0.14 : 0.08, lo: [-9.9, 14.8, -1.6], hi: [-7.6, 17.4, 0.8] },
    { region: E([8.6, 17.2, -0.2], [1.05, 1.15, 1.05]), h: coarse ? 0.14 : 0.08, lo: [7.4, 15.9, -1.4], hi: [9.8, 18.5, 1.0] },
    // The feet, from the ankle to the toes.
    ...[-1, 1].map((sx) => ({ region: (x, y, z) => Math.min(9, shivaParts().feet(sx > 0 ? Math.max(x, 0.01) : Math.min(x, -0.01), y, z) - 0.45), h: coarse ? 0.13 : 0.075, lo: sx > 0 ? [2.3, 5.2, 2.4] : [-8.6, 3.6, 3.9], hi: sx > 0 ? [8.6, 9.2, 7.2] : [-2.3, 6.6, 8.3] })),
  ],
});
let shivaP = null;
const shivaParts = () => (shivaP ||= shivaField());
// The Shiva's skin as a field, for laying ornaments on it.
let shivaF = null;
export const shivaSurface = () => (shivaF ||= shivaField().f);

// Sardar Patel at the Statue of Unity, in the coordinates of patel() in statue-of-unity.js (175 units
// tall before it is scaled), after photographs of the statue: the shawl over both shoulders, square
// across them and hanging stiffly over the upper arms to the elbows like a short cape, gathered in
// creases over the arms, its hem turned up in a thick band, its ends falling down each side of a
// wide opening that narrows to the neck; in the opening the bandi, a sleeveless jacket buttoned
// down the front, to the hips; under that the kurta, its sleeves showing from the shawl's hem to
// the wrists, flaring to its hem below the knee; below that the dhoti, very full, folded round each
// leg to above the ankle and hanging between the legs in a deep drop of U-shaped swags; the bare
// ankles and the feet in chappals, a stride apart; the hands at his sides in loose fists; and the
// head. The head is that of the 1949 portrait the statue follows, bowed a little: the bare, broad
// crown and lined forehead, the heavy brow over deep-set eyes under heavy lids with pouches
// beneath, a strong nose, deep folds from the nose to the corners of the set, downturned mouth,
// the full jowls and broad jaw of his later years, a firm chin, and large ears. The overlays on the
// cloth (buttons, the gallery's windows) are meshes (patel()).
function patelField() {
  // Below the kurta's hem the dhoti is gathered round each leg: full at the knee, folded in long
  // diagonal folds that wind round the leg, narrowing to an uneven hem a little above the ankle,
  // the left leg a stride forward, as he walks. The hem is open: below it the bare shin and ankle,
  // and the foot in its chappal: a thick sole, a broad strap over the instep, a ring round the
  // big toe and a thong between them, the five toes showing.
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const leg = (sx, zb, zt, fz) => {
    const zc = (zb + zt) / 2, cx = sx * 8.8;
    const outer = blend([[cone([sx * 8.3, 13, zb], [sx * 9.3, 61, zt], 7.0, 9.0), 0], [E([sx * 9.3, 38, zc + 0.4], [8.6, 13, 8.8]), 4]]);
    // The folds run down to the hem, so it ends in cloth, not a smooth cuff.
    const folds = (x, y, z) => { const a = Math.atan2(sx * (x - cx), z - zc); return (0.6 * Math.sin(3 * a + 0.22 * y) + 0.32 * Math.sin(0.4 * y - a) + 0.22 * Math.sin(0.75 * y + 2 * a)) * clamp((60 - y) / 5) * clamp((y - 13) / 3); };
    const hem = (x, z) => 13.5 + 2.4 * Math.sin(Math.atan2(sx * (x - cx), z - zb) + 0.6);
    const hollow = (x, y, z) => smax(cone([sx * 8.0, 0, zb], [sx * 8.2, 23, zb], 4.4, 4.9)(x, y, z), y - 21, 0.6);
    const cloth = (x, y, z) => smax(smax(outer(x, y, z) + folds(x, y, z), hem(x, z) - y, 0.4), -hollow(x, y, z), 0.35);
    const shin = blend([[cone([sx * 7.9, 4.6, zb + 0.4], [sx * 8.1, 22, zb], 2.6, 3.3), 0], [E([sx * 7.9, 4.8, zb + 0.4], [3.1, 1.7, 2.9]), 0.6]]);
    const foot = blend([
      [E([sx * 7.9, 2.95, fz + 1], [3.6, 1.6, 7.4]), 0],
      [E([sx * 7.9, 3.1, fz - 4.9], [2.8, 1.8, 2.8]), 1.2],
      [cone([sx * 7.9, 5.4, zb + 1.2], [sx * 7.9, 3.6, fz + 4.2], 2.4, 1.7), 1.2],
      ...[-2.55, -1.15, 0, 1.05, 2.0].map((d, i) => [cone([sx * (7.9 + d), 2.75, fz + 7.2], [sx * (7.9 + d), 2.45, fz + 9.9 - Math.abs(d) * 0.45], i ? 0.95 - i * 0.07 : 1.3, i ? 0.85 - i * 0.07 : 1.15), 0.25]),
    ]);
    const bigToe = cone([sx * 5.35, 2.75, fz + 7.2], [sx * 5.35, 2.45, fz + 9.9 - 1.15], 1.3, 1.15);
    // The sole follows the foot's outline: broad at the toes, narrower at the heel, rounded.
    const sole = (x, y, z) => {
      const v = (z - (fz + 1.4)) / 10.7, w = 4.6 * (0.8 + 0.2 * clamp(v + 0.6));
      return Math.max((Math.hypot((x - sx * 7.9) / w, Math.pow(Math.abs(v), 3)) - 1) * Math.min(w, 4) * 0.9, Math.abs(y - 0.7) - 0.7);
    };
    const strap = (x, y, z) => Math.max(Math.abs(foot(x, y, z) - 0.35) - 0.3, Math.abs(z - (fz + 1.2)) - 1.6, 1.4 - y);
    const ring = (x, y, z) => Math.max(Math.abs(bigToe(x, y, z) - 0.28) - 0.22, Math.abs(z - (fz + 7.9)) - 0.45, 1.4 - y);
    const thong = cone([sx * 6.0, 4.75, fz + 1.4], [sx * 5.9, 3.9, fz + 7.6], 0.42, 0.36);
    return blend([[cloth, 0], [shin, 0.6], [foot, 1.0], [sole, 0.25], [strap, 0.1], [ring, 0.08], [thong, 0.1]]);
  };
  // The kasta: the dhoti's pleats falling in a fan down the front between the legs, from under the
  // kurta to below the knees, folded back and forth.
  const kasta = (x, y, z) => {
    const t = clamp((56 - y) / 40), hw = 1.8 + 2.0 * t;
    return Math.max(Math.abs(x) - hw, Math.abs(z - (5.4 + 0.8 * t)) - 1.25 - 0.55 * Math.abs(Math.sin(x * 2.0)), y - 61, 20 - y);
  };
  // Between the legs the dhoti's cloth hangs in a deep drop from under the kurta to below the
  // knees, falling in U-shaped swags, its edge lowest in the middle.
  const swagBody = blend([[E([0, 46, 2.2], [10.5, 16.5, 6.2]), 0], [E([0, 36, 3.6], [6.8, 9, 4.4]), 2]]);
  const swag = (x, y, z) => smax(swagBody(x, y, z) + 0.4 * Math.sin(0.55 * (y - 0.05 * x * x)) * clamp((60 - y) / 4), 26 + 0.05 * x * x - y, 1.2);
  // The kurta, from the collar to below the knee, flaring from the waist to its wide hem.
  const kurta = lathe([[24.2, 60], [23.6, 62.5], [21.4, 71], [19.2, 81], [17.6, 91], [17.4, 100], [18.6, 118], [19.8, 131], [17.4, 140], [8, 145], [0.1, 145.5]], { sz: 0.62, folds: 13, amp: 0.012, from: 60, to: 95 });
  // The shawl over both shoulders, square across them and hanging stiffly like a short cape over
  // the arms to the elbows, flaring a little to its hem: a shell three units thick below the
  // shoulders, open down the front from the collar, widening as it falls, so the bandi shows between
  // its edges; long folds down its front and creases across it over the arms; the hem turned up in
  // a thick rounded band.
  const cape = lathe([[31.4, 99], [31.0, 104], [29.8, 116], [29.2, 127], [28.8, 133], [27.8, 138.5], [25.4, 142.8], [20.5, 146.4], [11.5, 148.8], [0.1, 149.3]], { sz: 0.62, folds: 22, amp: 0.025, from: 99, to: 130 });
  const creases = (x, y, z) => (0.2 * Math.sin(0.62 * y + 0.5 * Math.sin(0.25 * z)) + 0.12 * Math.sin(1.3 * y + 0.4 * z)) * clamp((Math.abs(x) - 21) / 5) * clamp((136 - y) / 6) * clamp((y - 103) / 3);
  const rim = (x, y, z) => torus([0, 99.6, 0], 31.0, 1.15)(x, y, z / 0.62) * 0.62;
  const inside = lathe([[28.0, 93], [28.0, 104], [26.8, 118], [0.1, 119]], { sz: 0.58 });
  // The opening is a V at the neck, where the shawl's two ends cross over it, widening fast down
  // the chest and then slowly to the hem.
  const open = (x, y, z) => Math.max(Math.abs(x) - Math.min(1.5 + (148 - y) * 0.6, 8.2 + (148 - y) * 0.08), -z, y - 148, 80 - y);
  // Over the kurta and under the shawl, the bandi: a sleeveless jacket from its band collar to the
  // hips, buttoned down the front on a raised placket, with a welt pocket on the chest and a
  // pocket on each side below, its hem standing proud of the kurta.
  const jacket = lathe([[17.7, 90.5], [17.3, 92.5], [17.4, 100], [19.2, 118], [20.6, 131], [18.4, 140], [9.6, 144.3], [0.1, 144.6]], { sz: 0.62 });
  const onJacket = (rx, ry, x0, y0, t) => (x, y, z) => Math.max(Math.abs(x - x0) - rx, Math.abs(y - y0) - ry, jacket(x, y, z) - t, -z);
  const placket = onJacket(0.8, 25.5, 0, 117, 0.35);
  const pockets = (x, y, z) => Math.min(onJacket(1.4, 0.4, 4.6, 117.5, 0.3)(x, y, z), onJacket(2.6, 2.1, 5.9, 99.5, 0.28)(x, y, z), onJacket(2.6, 2.1, -5.9, 99.5, 0.28)(x, y, z));
  const flaps = (x, y, z) => Math.min(onJacket(2.8, 0.45, 5.9, 101.7, 0.5)(x, y, z), onJacket(2.8, 0.45, -5.9, 101.7, 0.5)(x, y, z));
  const shawl = (x, y, z) => smax(smax(smin(cape(x, y, z) + creases(x, y, z), rim(x, y, z), 0.4), -inside(x, y, z), 0.4), -open(x, y, z), 0.5);
  // The hands hang at his sides in loose fists, the backs turned out: the palm, the four fingers
  // curled under it with their knuckles in a row along its lower outer edge, and the thumb laid down
  // the front over the index finger. The kurta's sleeve ends in a cuff at the wrist.
  const fist = mirrorX(bounded(blend([
    [E([22.1, 84.2, 4.0], [2.3, 3.8, 3.5]), 0],
    [blend([6.4, 4.75, 3.15, 1.65].map((z, i) => [chain([[22.9, 80.9 + i * 0.25, z, 0.95 - i * 0.04], [22.3, 77.9 + i * 0.3, z, 0.9 - i * 0.04], [20.7, 77.4 + i * 0.3, z, 0.85 - i * 0.04], [20.2, 79.0 + i * 0.3, z, 0.78 - i * 0.04]], 0.15), 0.06])), 0.5],
    [chain([[20.9, 85.0, 6.9, 1.15], [20.4, 82.0, 7.7, 1.0], [20.7, 79.8, 7.4, 0.85]], 0.2), 0.5],
    [torus([22.4, 89.4, 3.5], 4.35, 0.65), 0.3],
  ]), [21.8, 83.5, 4.5], 8, 1.0));
  const b = blend([
    [kurta, 0],
    [shawl, 1.0],
    [leg(1, 2.6, 1.0, 6.4), 2.5],
    [leg(-1, -0.8, 0.2, 3.0), 2.5],
    [swag, 1.5],
    [kasta, 0.5],
    [mirrorX(E([20.5, 136, 0.5], [6.6, 6.2, 5.6])), 2],
    [mirrorX(cone([20.5, 136, 0.5], [23.6, 111, 2], 6.2, 5.4)), 2],
    [mirrorX(cone([23.6, 111, 2], [22.4, 89, 3.5], 5.4, 4.3)), 1.5],
    [fist, 0.6],
    [cone([0, 142, 0], [0, 153, 0.8], 6.4, 6.8), 2],
    // The kurta's standing collar, and over it the bandi with its band collar.
    [torus([0, 145.6, 0.4], 6.9, 0.9), 0.4],
    [jacket, 0.3],
    [torus([0, 144.2, 0.5], 8.9, 0.75), 0.3],
    [placket, 0.1],
    [pockets, 0.1],
    [flaps, 0.1],
  ]);
  // The head, about the point (0, 163.6, 1) where its ellipsoid of 10.2 × 11.8 × 10.8 is centred.
  const P = (x, y, z) => [x, 163.6 + y, 1.0 + z];
  let head = blend([
    [E(P(0, 1.4, -0.5), [9.8, 10.8, 10.3]), 0],
    [E(P(0, -5.2, 1.4), [8.4, 6.0, 8.0]), 3],
    [mirrorX(E(P(4.7, -2.4, 6.4), [3.4, 3.2, 3.0])), 1.6],
    [E(P(0, 2.7, 8.3), [6.9, 1.4, 2.2]), 1.6],
    [cone(P(0, 2.0, 9.4), P(0, -2.5, 11.9), 1.0, 1.5), 0.8],
    [E(P(0, -2.7, 11.5), [1.7, 1.3, 1.4]), 0.6],
    [mirrorX(E(P(1.45, -3.1, 10.3), [1.0, 0.9, 0.9])), 0.5],
    [E(P(0, -8.3, 6.9), [3.3, 2.1, 2.5]), 1.5],
    [mirrorX(E(P(9.9, -0.4, -0.6), [1.3, 3.5, 2.5])), 0.6],
    // The full jowls at the corners of the jaw.
    [mirrorX(E(P(5.8, -7.6, 3.0), [2.3, 2.3, 2.6])), 1.2],
  ]);
  head = carve(head, mirrorX(E(P(3.4, 0.5, 9.2), [2.4, 1.5, 2.0])), 0.9);
  head = blend([[head, 0],
    // The eyes open under heavy lids, looking ahead.
    [mirrorX(E(P(3.4, 0.25, 7.85), [1.85, 1.1, 1.5])), 0.3],
    [mirrorX(E(P(3.4, 1.25, 8.0), [2.2, 0.5, 1.4])), 0.3],
    [mirrorX(E(P(3.5, -0.95, 8.2), [1.9, 0.55, 1.05])), 0.4],
    [E(P(0, -4.45, 9.45), [2.8, 0.6, 1.0]), 0.5],
    [E(P(0, -5.6, 9.05), [2.4, 0.7, 1.0]), 0.5]]);
  head = carve(head, E(P(0, -5.0, 9.95), [2.7, 0.17, 1.0]), 0.2);
  head = carve(head, mirrorX(E(P(2.85, -5.35, 9.15), [0.5, 0.3, 0.6])), 0.2);
  head = carve(head, mirrorX(cone(P(1.95, -2.3, 9.95), P(3.7, -6.7, 8.5), 0.33, 0.33)), 0.4);
  head = carve(head, mirrorX(E(P(10.6, -0.2, -0.2), [0.6, 2.2, 1.4])), 0.2);
  // The iris cut shallow in each eye, and two lines across the forehead.
  head = carve(head, mirrorX(E(P(3.35, 0.15, 9.45), [0.65, 0.65, 0.3])), 0.12);
  head = carve(carve(head, E(P(0, 4.6, 10.79), [5.5, 0.3, 1.6]), 0.15), E(P(0, 6.0, 10.27), [5.0, 0.3, 1.6]), 0.15);
  // The head bowed a little, about the root of the neck.
  head = turn(head, 'x', 0.09, [0, 152, 1]);
  // The head drawn a little smaller than the portrait's grid, as the photographs show it against the
  // broad shawl: 92% about the root of the neck.
  const hk = 0.92, headS = (x, y, z) => head(x / hk, 152 + (y - 152) / hk, 1 + (z - 1) / hk) * hk;
  const all = (x, y, z) => smin(b(x, y, z), y > 147 ? headS(x, y, z) : Infinity, 2);
  return { f: flatBase(all), lo: [-33, -1, -21], hi: [33, 177, 22] };
}
let patelF = null;
export const patelSurface = () => (patelF ||= patelField().f);
// The body is meshed with 1.1-unit cells, and the head (inside an ellipsoid crossing the neck), the
// front of the torso, the fists, and the feet and hems with cells a third that size (on phones 1.5 and about 0.5); the folds of the
// bronze are rubbed bright.
export const patelBody = (m) => body(detail.low ? 'patel-coarse' : 'patel', patelField, detail.low ? 1.5 : 1.1, m, [0.3, 0.34, 0.28], {
  wear: 0.3, split: [
    { region: E([0, 162.5, 2], [13.5, 13.5, 14]), h: detail.low ? 0.48 : 0.32, lo: [-14, 148, -13], hi: [14, 177, 17] },
    // The front of the torso, where the bandi shows between the shawl's ends with its placket,
    // pockets and collar.
    // A box, not an ellipsoid, so its sides cross the shawl squarely and the seam stays a line.
    { region: (x, y, z) => Math.max(Math.abs(x) - 13.5, Math.abs(y - 115.5) - 30, 3 - z), h: detail.low ? 0.6 : 0.4, lo: [-15.5, 82, 1], hi: [15.5, 148, 25] },
    // The fists and the cuffs at the wrists.
    ...[-1, 1].map((sx) => ({ region: E([sx * 21.8, 83.5, 4.5], [5.2, 7.6, 5.6]), h: detail.low ? 0.55 : 0.4, lo: [sx * 21.8 - 5.8, 75, -1.6], hi: [sx * 21.8 + 5.8, 91.6, 10.6] })),
    // The feet in their chappals, the ankles and the dhoti's open hems, on the same fine grid.
    ...[[1, 2.6, 6.4], [-1, -0.8, 3.0]].map(([sx, zb, fz]) => ({ region: E([sx * 8, 8, (zb + fz) / 2 + 1], [8.5, 12.5, 13.5]), h: detail.low ? 0.5 : 0.34, lo: [sx * 8 - 10, -1, zb - 12], hi: [sx * 8 + 10, 27, fz + 15] })),
  ],
});

// Bahubali at Shravanabelagola, standing in kayotsarga in the coordinates of bahubali() in
// gommateshwara.js (feet at y = 0, the crown of the head at about 19.3, scaled there to the
// statue's 17.4 m), carved from one block of granite: the statue, the two anthills beside his
// legs and the lotus he stands on are one stone. After photographs of the image: very broad,
// slightly sloping shoulders over a narrow waist, the arms hanging close by the chest, and legs
// carved as massive columns, the thighs pressed together from the groin to the knees and only a
// narrow slit between the shins, on large feet with their toes; long arms hanging down, the
// forearms turning in so the hands, palms to the thighs and the long fingers straight and apart,
// come down beside the outer thighs, the wrists level with the groin and the fingertips resting
// on the tops of the anthills. The flat broad chest with its nipples and collarbones; the navel;
// nude (digambara), as Jain images in kayotsarga are. The head is part of the field: an oval face
// of calm planes, long almond eyes under lowered lids and arched brows, a long straight nose, a
// wide mouth smiling at its corners, the long pierced earlobes lying flat by the jaw, three lines
// on the neck. The curls of the hair and the creepers are laid on this skin by bahubali()
// (bahubaliSurface()).
function bahubaliField() {
  const base = blend([
    [E([0, 9.0, 0], [2.15, 1.45, 1.5]), 0],
    // The legs: columns as thick at the calf as at the knee, close enough that the thighs meet.
    [mirrorX(chain([[0.98, 0.9, 0.05, 0.56], [1.0, 2.9, -0.05, 0.8], [1.02, 4.7, 0.05, 0.86], [1.1, 8.6, 0, 1.12]], 0.5)), 0.55],
    [mirrorX(E([1.0, 3.0, -0.3], [0.8, 1.35, 0.72])), 0.45],
    [mirrorX(E([1.02, 4.75, 0.62], [0.42, 0.48, 0.32])), 0.3],
    [mirrorX(E([1.12, 6.8, 0.1], [1.06, 1.95, 1.05])), 0.55],
    [mirrorX(E([1.0, 0.36, 0.4], [0.8, 0.38, 1.45])), 0.25],
    // The instep, falling from the ankle to the toes.
    [mirrorX(cone([1.0, 0.95, 0.0], [1.02, 0.42, 1.35], 0.5, 0.36)), 0.3],
    [E([0, 10.3, 0], [1.75, 1.5, 1.35]), 0.9],
    [E([0, 11.0, 0.7], [1.6, 1.4, 0.95]), 0.8],
    [E([0, 13.1, 0], [2.75, 2.2, 1.85]), 1.0],
    [mirrorX(E([1.3, 13.7, 0.95], [1.4, 1.0, 0.8])), 0.9],
    // The shoulders fall a little from the neck to their rounded ends.
    [E([0, 14.95, -0.2], [2.0, 0.66, 1.15]), 0.7],
    [mirrorX(cone([0.6, 15.0, -0.15], [2.95, 14.6, -0.05], 0.6, 0.68)), 0.6],
    [mirrorX(E([3.2, 14.45, 0], [0.88, 0.88, 0.88])), 0.8],
    [cone([0, 15.0, 0], [0, 16.6, 0.1], 0.85, 0.75), 0.5],
    // The arms: the upper arm straight down, the forearm turning in to the hand by the thigh.
    [mirrorX(chain([[3.35, 14.3, 0, 0.7], [3.42, 11.0, 0.05, 0.56], [2.92, 7.95, 0.14, 0.44]], 0.3)), 0.55],
    [mirrorX(E([3.42, 13.0, 0], [0.64, 1.3, 0.64])), 0.4],
  ]);
  // The feet's toes: five in a row at the front of each foot, long and low, the big toe on the
  // inside and the largest, with a groove between each.
  const toes = mirrorX(blend([[0.45, 0.22, 0.19, 0.45], [0.8, 0.17, 0.15, 0.4], [1.1, 0.155, 0.14, 0.36], [1.37, 0.14, 0.13, 0.32], [1.6, 0.12, 0.11, 0.27]].map(([x, r, ry, L], i) => [E([x, ry, 1.95 - i * 0.12], [r, ry, L]), 0.02])));
  // The hands hang beside the outer thighs, the backs turned forwards and out, the palms to the
  // thighs: a flat palm, four long fingers below it side by side, index on the inside and little
  // finger on the outside, straight and a little apart, the middle finger the longest; the thumb
  // on the inside, pointing down beside the index.
  const row = [0.8, -0.6], at = (o, y, out = 0) => [2.86 + row[0] * o - 0.6 * out, y, 0.2 + row[1] * o - 0.8 * out];
  const fingers = blend([[-0.4, 1.1, 0.115], [-0.13, 1.3, 0.12], [0.14, 1.2, 0.115], [0.39, 0.95, 0.1]].map(([o, L, r]) => [chain([[...at(o, 6.95), r], [...at(o, 6.95 - L * 0.55, 0.02), r * 0.95], [...at(o, 6.95 - L, 0.07), r * 0.82]], 0.03), 0.008]));
  // The palm: a slab in the hand's own frame (u across it, w through it from palm to back).
  const slab = roundBox([0, 7.3, 0], [0.48, 0.5, 0.15], 0.12);
  const palm = (x, y, z) => { const dx = x - 2.86, dz = z - 0.2; return slab(dx * row[0] + dz * row[1], y, dx * 0.6 + dz * 0.8); };
  const hand = mirrorX(bounded(blend([
    [palm, 0],
    [fingers, 0.09],
    [chain([[...at(-0.62, 7.35, 0.12), 0.15], [...at(-0.7, 6.8, 0.16), 0.13], [...at(-0.72, 6.35, 0.18), 0.11]], 0.04), 0.1],
  ]), [2.84, 6.7, 0.25], 1.6, 0.5));
  // The anthills rising beside the legs to the fingertips: great rounded mounds of the same stone,
  // highest under the hands and falling away outwards beyond the shoulders' line, swelling forward
  // round the outer calves and back behind the legs, blended into them.
  const lumps = blend([
    [E([3.6, 0.6, -0.8], [2.3, 4.9, 1.9]), 0],
    [E([2.95, 4.85, -0.35], [0.8, 0.9, 0.95]), 0.5],
    [E([3.6, 1.6, 0.15], [1.6, 1.6, 1.25]), 0.6],
    [E([5.3, 1.1, -0.6], [1.15, 1.3, 1.35]), 0.6],
    [E([4.2, 3.4, -1.5], [1.3, 1.6, 1.2]), 0.5],
  ]);
  const hill = (x, y, z) => lumps(x, y, z) + 0.07 * Math.sin(2.3 * x + 1) * Math.sin(1.9 * y + 0.4) * Math.sin(2.6 * z + 0.5) + 0.1 * Math.sin(0.9 * x + 2.1 * z) * Math.sin(1.1 * y + 0.7);
  // The chest's nipples and collarbones, laid on the skin of the torso.
  const nip = snap(base, [1.2, 13.5, 3], -0.05), cl = [[0.45, 15.05, 1.2], [1.5, 15.15, 1.2], [2.45, 15.0, 1.0]].map((q) => snap(base, q, -0.1));
  const pel = snap(base, [0, 8.75, 3], -0.12), sc = snap(base, [0, 8.5, 3], -0.2);
  const torso = blend([
    [mirrorX(E(nip, [0.12, 0.12, 0.1])), 0.05],
    [mirrorX(chain(cl.map((q) => [...q, 0.14]), 0.1)), 0.12],
    [E(sc, [0.42, 0.36, 0.3]), 0.12],
    [cone(pel, [pel[0], pel[1] - 1.05, pel[2] + 0.12], 0.26, 0.22), 0.1],
    [E([0, pel[1] - 1.05, pel[2] + 0.13], [0.24, 0.22, 0.24]), 0.06],
  ]);
  // The head.
  let head = blend([
    [E([0, 17.75, -0.05], [1.28, 1.55, 1.32]), 0],
    [E([0, 16.75, 0.3], [0.98, 0.72, 0.95]), 0.35],
    [mirrorX(E([0.62, 17.1, 0.85], [0.42, 0.38, 0.38])), 0.2],
    [E([0, 17.78, 0.95], [0.9, 0.12, 0.26]), 0.25],
    // The brows, arched ridges over the eyes.
    [mirrorX(chain([[0.1, 17.72, 1.14, 0.065], [0.42, 17.8, 1.11, 0.07], [0.8, 17.7, 0.96, 0.055]], 0.05)), 0.08],
    [cone([0, 17.72, 1.22], [0, 17.05, 1.47], 0.1, 0.15), 0.12],
    [E([0, 17.0, 1.43], [0.2, 0.14, 0.16]), 0.08],
    [E([0, 16.25, 0.95], [0.38, 0.25, 0.3]), 0.2],
    // The ears, and the long earlobes hanging flat beside the jaw nearly to the neck's foot.
    [mirrorX(E([1.25, 17.45, 0], [0.2, 0.5, 0.34])), 0.12],
    [mirrorX(E([1.17, 16.6, 0.0], [0.13, 0.64, 0.27])), 0.12],
  ]);
  // The eye sockets, then the long almond eyes in them under lowered lids, the iris cut shallow.
  head = carve(head, mirrorX(E([0.47, 17.48, 1.32], [0.36, 0.2, 0.3])), 0.12);
  head = blend([[head, 0], [mirrorX(E([0.47, 17.43, 1.04], [0.3, 0.17, 0.21])), 0.04], [mirrorX(E([0.47, 17.575, 1.08], [0.33, 0.05, 0.17])), 0.03],
    [mirrorX(E([0.47, 17.3, 1.06], [0.29, 0.03, 0.17])), 0.03],
    // The lips: a wide full upper lip and a fuller lower one.
    [E([0, 16.62, 1.24], [0.3, 0.06, 0.08]), 0.06], [E([0, 16.48, 1.2], [0.24, 0.07, 0.08]), 0.06]]);
  head = carve(head, mirrorX(E([0.47, 17.42, 1.28], [0.075, 0.075, 0.05])), 0.01);
  head = carve(head, E([0, 16.555, 1.31], [0.29, 0.016, 0.1]), 0.02);
  // The corners of the mouth turned up in the calm smile.
  head = carve(head, mirrorX(E([0.3, 16.58, 1.18], [0.05, 0.035, 0.08])), 0.015);
  // The slit of each pierced earlobe, and the three lines round the neck.
  head = carve(head, mirrorX(E([1.29, 16.35, 0.0], [0.08, 0.3, 0.07])), 0.02);
  for (const [y, R] of [[15.95, 0.79], [16.2, 0.78]]) head = carve(head, torus([0, y, 0.06], R, 0.04), 0.02);
  const headB = bounded(head, [0, 17.2, 0.3], 2.4, 0.6);
  // The anthills join the legs in a broad fillet; the hands join the forearms in a small one, too
  // small to bridge the gap between the fingertips and the anthills' tops.
  const all = (x, y, z) => smin(smin(smin(smin(smin(base(x, y, z), toes(x, y, z), 0.06), hill(Math.abs(x), y, z), 0.22), hand(x, y, z), 0.12), torso(x, y, z), 0.05), headB(x, y, z), 0.25);
  const navel = E([0, 10.6, 1.62], [0.15, 0.2, 0.2]);
  return { f: flatBase(carve(all, navel, 0.1)), lo: [-6, -0.1, -3.2], hi: [6, 19.6, 2.9] };
}
let bahubaliF = null;
export const bahubaliSurface = () => (bahubaliF ||= bahubaliField().f);
// The body is meshed with 17 cm cells; the head, inside an ellipsoid that crosses the neck, with
// 4.5 cm cells, and the hands and the feet with 6 cm cells (on phones 26, 7 and 9 cm), so the
// fingers and toes stand apart; the ridges are rubbed pale, as weathered granite is.
export const bahubaliBody = (m) => body(detail.low ? 'bahubali-coarse' : 'bahubali', bahubaliField, detail.low ? 0.26 : 0.17, m, undefined, {
  wear: 0.35, split: [
    { region: E([0, 16.9, 0.15], [1.85, 1.65, 1.85]), h: detail.low ? 0.07 : 0.045, lo: [-2.2, 14.6, -2.1], hi: [2.2, 19.6, 2.3] },
    ...[-1, 1].flatMap((s) => [
      { region: E([s * 2.82, 6.6, 0.32], [0.5, 1.25, 0.85]), h: detail.low ? 0.09 : 0.06, lo: [s * 2.82 - 0.6, 5.25, -0.65], hi: [s * 2.82 + 0.6, 7.95, 1.3] },
      { region: E([s * 1.0, 0.45, 1.65], [1.05, 0.62, 1.0]), h: detail.low ? 0.1 : 0.07, lo: [s - 1.15, -0.1, 0.55], hi: [s + 1.15, 1.15, 2.75] },
    ]),
  ],
});

// Thiruvalluvar at Kanyakumari, in the coordinates of thiruvalluvar() in
// vivekananda-rock-memorial.js (the robe's hem at y = 13.6 on the pedestal at 12.4, the knot's top
// at 45.5, scaled there to the statue's 29 m), after photographs: the long robe in folds from the
// ankles up, gathered in a fan of pleats down the middle of the front, the hips swaying a little
// to his left; the upper cloth laid as a broad band across the chest from the right shoulder to
// the left hip; the feet showing under the hem; the right hand raised before the chest and the
// left holding the palm-leaf book at the waist. The head, beard and hands are carved in the field,
// as on the Statue of Unity: an old sage's face (its brow, eyes under heavy lids, a long nose, the
// lines from nose to mouth), the moustache over the lips, the full beard combed in strands to the
// middle of the chest, the hair combed back over the skull into a knot bound on the crown, the
// raised right hand, palm forward, with three fingers lifted (the little finger and the thumb
// folded), and the left hand's fingers curled over the book. The book is a mesh. The field is
// laid out with the raised hand at +x and turned over at the end, so it stands as photographed:
// the raised hand on his right (-x).
function thiruvalluvarField() {
  const robe = lathe([[4.25, 13.6], [4.55, 16.4], [4.0, 22.4], [3.7, 27.4], [4.0, 32.4], [4.5, 36.4], [2.6, 38.4], [0.1, 38.7]], { sz: 0.72, folds: 18, amp: 0.07, from: 13.6, to: 30.4 });
  // The upper cloth: a band two units wide laid on the robe, from the shoulder down across the chest
  // to the hip, a third of a unit thick.
  const sash = [[3.5, 37.6], [1.3, 33.4], [-1.3, 29.9], [-3.5, 25.6]];
  const along = (x, y) => { let d = Infinity; for (let i = 0; i + 1 < sash.length; i++) { const [ax, ay] = sash[i], [bx, by] = sash[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - ax - dx * t, y - ay - dy * t)); } return d; };
  const cloth = (x, y, z) => { const r = robe(x, y, z); return Math.max(along(x, y) - 0.95, r - 0.32, -r - 0.25, -z); };
  // The pleats falling down the middle of the front from the waist to the hem, widening as they fall.
  const pleats = (x, y, z) => { const t = Math.min(1, Math.max(0, (28.5 - y) / 15)), r = robe(x, y, z), top = Math.min(1, (28.5 - y) / 2); return Math.max(Math.abs(x) - 0.8 - 0.7 * t, r - (0.28 + 0.14 * Math.abs(Math.sin(x * 5.5))) * Math.max(0.2, top), -r - 0.3, -z, y - 28.5, 13.7 - y); };
  const b = blend([
    [robe, 0],
    [cloth, 0.15],
    [pleats, 0.1],
    // The ankles and feet under the hem.
    [mirrorX(cone([1.15, 13.0, 1.4], [1.2, 14.6, 0.9], 0.5, 0.55)), 0.3],
    [mirrorX(E([1.2, 12.85, 2.4], [0.72, 0.45, 1.35])), 0.3],
    [mirrorX(E([4, 36.4, 0], [1.6, 1.5, 1.4])), 0.8],
    // The raised arm: the upper arm down to the elbow at the side, the forearm up before the chest.
    [cone([4.2, 36.2, 0], [4.6, 31.4, 1.4], 1.05, 0.9), 0.5],
    [cone([4.6, 31.4, 1.4], [3.3, 35.3, 3.75], 0.9, 0.7), 0.3],
    [E([3.1, 36.15, 4.05], [0.78, 0.95, 0.32]), 0.2],
    [cone([-4.2, 36.2, 0], [-4.8, 31.2, 1.4], 1.05, 0.9), 0.5],
    [cone([-4.8, 31.2, 1.4], [-3.2, 29.6, 3.6], 0.9, 0.7), 0.3],
    [cone([0, 37.4, 0], [0, 38.8, 0.3], 1.25, 1.2), 0.6],
  ]);
  // The hands. The right, raised, palm forward: the index, middle and ring fingers straight up, the
  // little finger, on the outer side, folded down onto the palm, and the thumb across it from the
  // inner side. The left holds the book (a bundle 3.4 long lying across the body at y 29.05 to
  // 29.55, its front at z 4.3): the palm behind and below it, the four fingers curled over its top
  // and down its front.
  const raised = blend([
    ...[[2.7, 1.15], [3.1, 1.3], [3.5, 1.15]].map(([x, L]) => [chain([[x, 36.95, 4.08, 0.19], [x, 36.95 + L * 0.55, 4.06, 0.175], [x, 36.95 + L, 4.0, 0.15]], 0.05), 0.07]),
    [chain([[3.85, 35.85, 4.15, 0.18], [3.55, 36.3, 4.42, 0.16], [3.15, 36.45, 4.48, 0.15]], 0.05), 0.08],
    [chain([[2.4, 35.75, 4.05, 0.2], [2.6, 36.05, 4.42, 0.18], [2.95, 36.2, 4.52, 0.16]], 0.05), 0.08],
  ]);
  const holding = blend([
    [E([-3.25, 29.5, 3.45], [0.75, 0.6, 0.45]), 0],
    ...[-3.75, -3.38, -3.02, -2.68].map((x, i) => [chain([[x, 29.75, 3.55, 0.17 - i * 0.01], [x, 29.82, 4.05, 0.16 - i * 0.01], [x, 29.62, 4.42, 0.15 - i * 0.01], [x, 29.3, 4.47, 0.14 - i * 0.01]], 0.04), 0.06]),
    [chain([[-3.85, 29.55, 3.6, 0.18], [-3.95, 29.7, 4.0, 0.16]], 0.04), 0.06],
  ]);
  // The head, laid out as the Statue of Unity's (P scales its units): an old man's face.
  const S = 0.235, P = (x, y, z) => [x * S, 40.8 + y * S * 1.08, 0.4 + z * S], k = (v) => v * S;
  let head = blend([
    [E(P(0, 1.4, -0.5), [9.8 * S, 10.8 * S * 1.08, 10.3 * S]), 0],
    [E(P(0, -5.2, 1.4), [8.0 * S, 6.0 * S * 1.08, 7.8 * S]), k(3)],
    [mirrorX(E(P(4.7, -2.4, 6.4), [3.4 * S, 3.2 * S, 3.0 * S])), k(1.6)],
    [E(P(0, 2.7, 8.3), [6.9 * S, 1.5 * S, 2.2 * S]), k(1.6)],
    [cone(P(0, 2.0, 9.4), P(0, -2.6, 12.1), k(1.0), k(1.5)), k(0.8)],
    [E(P(0, -2.8, 11.6), [1.7 * S, 1.3 * S, 1.4 * S]), k(0.6)],
    [mirrorX(E(P(1.45, -3.2, 10.3), [1.0 * S, 0.9 * S, 0.9 * S])), k(0.5)],
    [mirrorX(E(P(9.9, -0.4, -0.6), [1.3 * S, 3.5 * S, 2.5 * S])), k(0.6)],
  ]);
  head = carve(head, mirrorX(E(P(3.4, 0.5, 9.2), [2.4 * S, 1.5 * S, 2.0 * S])), k(0.9));
  head = blend([[head, 0],
    // The eyes open under heavy lids: the eyeball between them, the lids thin at its middle.
    [mirrorX(E(P(3.4, 0.25, 8.0), [1.9 * S, 1.15 * S, 1.6 * S])), k(0.2)],
    [mirrorX(E(P(3.4, 1.3, 8.1), [2.2 * S, 0.5 * S, 1.4 * S])), k(0.25)],
    [mirrorX(E(P(3.45, -0.85, 8.15), [1.9 * S, 0.32 * S, 0.95 * S])), k(0.3)],
    [E(P(0, -5.6, 9.05), [2.4 * S, 0.7 * S, 1.0 * S]), k(0.5)]]);
  head = carve(head, mirrorX(cone(P(1.95, -2.3, 9.95), P(3.9, -6.2, 8.6), k(0.33), k(0.33))), k(0.4));
  // The iris, cut shallow in each eyeball, as carved stone shows the gaze.
  head = carve(head, mirrorX(E(P(3.35, 0.25, 9.55), [0.6 * S, 0.6 * S, 0.3 * S])), k(0.1));
  head = carve(head, mirrorX(E(P(10.6, -0.2, -0.2), [0.6 * S, 2.2 * S, 1.4 * S])), k(0.2));
  // The moustache: two thick locks from under the nose sweeping down past the corners of the
  // mouth into the beard.
  const tache = mirrorX(chain([[0.1, 39.82, 2.86, 0.14], [0.5, 39.74, 2.7, 0.15], [0.85, 39.5, 2.42, 0.13], [1.0, 39.15, 2.2, 0.1]], 0.05));
  // The beard, from the cheeks and jaw down to the chest in a full rounded mass, combed in
  // strands that run down it.
  const beardMass = blend([
    [E([0, 38.45, 1.95], [1.7, 0.95, 1.05]), 0],
    [mirrorX(E([1.4, 39.1, 1.3], [0.65, 1.2, 0.85])), 0.35],
    // It hangs forward, broad and full, clear of the robe on the chest, to a rounded end.
    [cone([0, 38.2, 2.35], [0, 35.7, 3.3], 1.55, 1.05), 0.55],
    [E([0, 35.45, 3.3], [1.05, 0.65, 0.7]), 0.4],
  ]);
  // Strands down the beard, a little wavy, cut deeper towards its end.
  const beard = (x, y, z) => beardMass(x, y, z) + (0.06 + 0.03 * Math.max(0, 38.5 - y)) * Math.sin(20 * Math.atan2(x, z - 0.4) + 1.4 * y + 0.4 * Math.sin(3 * y));
  // The hair, combed back over the skull in strands from the hairline, and the knot bound on the
  // crown.
  const hairMass = blend([[E([0, 41.95, -0.45], [2.42, 2.45, 2.45]), 0], [E([0, 44.55, -0.65], [1.05, 0.95, 1.05]), 0.35], [torus([0, 44.0, -0.6], 0.92, 0.16), 0.1]]);
  const hair = (x, y, z) => hairMass(x, y, z) + 0.035 * Math.sin(30 * Math.atan2(x, z + 0.5) + (y > 43.8 ? 3 * y : 0));
  const headAll = blend([[head, 0], [tache, k(0.3)], [beard, 0.15], [hair, 0.12]]);
  const headB = bounded(headAll, [0, 40.2, 0.8], 5.6, 2.0);
  const handsF = (x, y, z) => (x > 1.9 && y > 34.8 && z > 3.2 ? raised(x, y, z) : x < -1.8 && y < 31 ? holding(x, y, z) : Infinity);
  const all = (x, y, z) => smin(smin(b(x, y, z), handsF(x, y, z), 0.1), y > 33.8 ? headB(x, y, z) : Infinity, 0.2);
  // The hips sway out to his left (here -x) and the robe below them follows: a sideways shift
  // largest at the hips and gone by the chest and the feet.
  const sway = (x, y, z) => all(x + 0.6 * Math.exp(-(((y - 22) / 5) ** 2)), y, z);
  const pre = flatBase(sway, 12.4);
  // Turned over, so the raised hand is his right.
  return { f: (x, y, z) => pre(-x, y, z), lo: [-7, 12.2, -4.2], hi: [6.6, 46, 5.8], head: headB, raised: bounded(raised, [3.1, 37.05, 4.2], 1.6, 1.5), holding: bounded(holding, [-3.2, 29.6, 4.0], 1.5, 1.5) };
}
let thiruP = null;
const thiruParts = () => (thiruP ||= thiruvalluvarField());
// The head (with the beard's upper part and the hair) and both hands are meshed on fine cells;
// the hands' regions are their own shapes grown a little, so each change of mesh falls in a crease
// (the hand on the book), not across the robe.
export const thiruvalluvarBody = (m) => body(detail.low ? 'thiruvalluvar-coarse' : 'thiruvalluvar', thiruvalluvarField, detail.low ? 0.3 : 0.22, m, undefined, {
  split: [
    // The head's region is an ellipsoid crossing the neck and the beard squarely below the chin and
    // passing above the shoulders, as on the Statue of Unity; the beard's end lies on the robe in
    // the body's own cells.
    { region: E([0, 40.9, 0.9], [2.55, 3.75, 2.75]), h: detail.low ? 0.11 : 0.065, lo: [-2.9, 36.9, -2.2], hi: [2.9, 45.6, 4.0] },
    // (The parts are laid out before the field is turned over, so they are looked up at -x.)
    { region: (x, y, z) => Math.min(9, thiruParts().raised(-x, y, z) - 0.35), h: detail.low ? 0.12 : 0.07, lo: [-4.4, 35.0, 3.3], hi: [-1.9, 38.9, 5.0] },
    { region: (x, y, z) => Math.min(9, thiruParts().holding(-x, y, z) - 0.35), h: detail.low ? 0.12 : 0.07, lo: [2.1, 28.6, 2.6], hi: [4.6, 30.5, 5.1] },
  ],
});

/* ---------- statues of the twentieth and twenty-first centuries ---------- */

// The distance in the x-y plane from (x, y) to a broken line through pts [[x, y], ...].
function toLine(pts) {
  return (x, y) => {
    let d = Infinity;
    for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      d = Math.min(d, Math.hypot(x - ax - dx * t, y - ay - dy * t));
    }
    return d;
  };
}
// A face laid out as the Statue of Unity's (in the units of its 10.2-wide skull, which P maps into
// the figure's own): the skull, the jaw and chin, the cheeks, the brow, the nose and its wings, the
// eyes in their sockets under their lids, the lips and the line between them, and the ears. full:
// how round the cheeks and jaw are; age: deeper lids and the folds from nose to mouth; lids: how
// low the upper lids come; tall: the skull's height (a child's is rounder).
function face(P, S, { full = 0, age = 0, lids = 0.5, tall = 1 } = {}) {
  const k = (v) => v * S;
  let h = blend([
    [E(P(0, 1.4, -0.5), [9.8 * S, 10.8 * S * 1.05 * tall, 10.3 * S]), 0],
    [E(P(0, -5.2, 1.4), [(7.6 + full) * S, (5.8 + 0.3 * full) * S, (7.6 + 0.4 * full) * S]), k(3)],
    [mirrorX(E(P(4.7 + 0.3 * full, -2.6 - 0.4 * full, 6.2), [(3.2 + 0.3 * full) * S, (3.0 + 0.3 * full) * S, 3.0 * S])), k(1.6)],
    [E(P(0, 2.7, 8.3), [6.8 * S, 1.3 * S, 2.1 * S]), k(1.6)],
    [cone(P(0, 2.0, 9.4), P(0, -2.4, 11.7), k(1.0), k(1.4)), k(0.8)],
    [E(P(0, -2.6, 11.3), [1.7 * S, 1.3 * S, 1.35 * S]), k(0.6)],
    [mirrorX(E(P(1.45, -3.0, 10.1), [1.0 * S, 0.9 * S, 0.9 * S])), k(0.5)],
    [E(P(0, -8.4, 6.6), [3.1 * S, 2.1 * S, 2.5 * S]), k(1.5)],
    [mirrorX(E(P(9.9, -0.4, -0.6), [1.3 * S, 3.5 * S, 2.5 * S])), k(0.6)],
  ]);
  h = carve(h, mirrorX(E(P(3.4, 0.5, 9.2), [2.4 * S, 1.5 * S, 2.0 * S])), k(0.9));
  h = blend([[h, 0],
    [mirrorX(E(P(3.4, 0.3, 7.8), [1.85 * S, 1.1 * S, 1.5 * S])), k(0.3)],
    [mirrorX(E(P(3.4, 0.9 + lids * 0.6, 8.0), [2.2 * S, 0.5 * S, 1.4 * S])), k(0.3)],
    [mirrorX(E(P(3.45, -0.9, 8.1), [1.9 * S, (0.35 + 0.2 * age) * S, 1.0 * S])), k(0.3)],
    [E(P(0, -4.5, 9.4), [2.5 * S, 0.6 * S, 1.0 * S]), k(0.5)],
    [E(P(0, -5.6, 9.0), [2.2 * S, 0.72 * S, 1.0 * S]), k(0.5)]]);
  h = carve(h, E(P(0, -5.05, 9.95), [2.5 * S, 0.17 * S, 1.0 * S]), k(0.2));
  h = carve(h, mirrorX(E(P(3.35, 0.2, 9.4), [0.6 * S, 0.6 * S, 0.3 * S])), k(0.1));
  if (age) h = carve(h, mirrorX(cone(P(1.95, -2.3, 9.95), P(3.7, -6.4, 8.5), k(0.3), k(0.3))), k(0.4));
  return carve(h, mirrorX(E(P(10.6, -0.2, -0.2), [0.6 * S, 2.2 * S, 1.4 * S])), k(0.2));
}

// Netaji Subhas Chandra Bose under the canopy at India Gate, carved from one block of black granite
// (2022), after photographs: standing to attention in the uniform of the Indian National Army, the
// right hand raised flat to the temple in salute, its elbow out at the shoulder's height, the left
// hand closed at his side; the side cap worn tilted to the right; round spectacles (meshes,
// netajiSpectacles()); the tunic to the top of the thighs, buttoned down the front, with a closed
// collar, shoulder straps, two breast and two skirt pockets with flaps, and a belt with a square
// buckle; breeches flaring wide over the thighs, and knee boots. Behind his calves stands the uncut
// stone that holds him up, on a slab of the same block. In human units, 1.84 to the top of the cap,
// facing +z on y = 0; netaji() scales him to the statue's 8.5 m.
const NETAJI_HEAD = { S: 0.0088, y: 1.645, z: 0.014 };
const netajiP = (x, y, z) => [x * NETAJI_HEAD.S, NETAJI_HEAD.y + y * NETAJI_HEAD.S * 1.05, NETAJI_HEAD.z + z * NETAJI_HEAD.S];
function netajiField() {
  const legs = mirrorX(blend([
    [E([0.105, 0.045, 0.05], [0.05, 0.045, 0.13]), 0],
    [cone([0.105, 0.06, -0.01], [0.11, 0.47, 0.0], 0.06, 0.07), 0.03],
    [torus([0.11, 0.47, 0.0], 0.068, 0.009), 0.004],
    // The breeches: from the knee up the thigh, and the wide flare standing out over it.
    [cone([0.11, 0.49, 0.0], [0.105, 0.88, 0.0], 0.066, 0.095), 0.03],
    [E([0.185, 0.71, -0.005], [0.1, 0.15, 0.095]), 0.07],
  ]));
  const jacket = lathe([[0.215, 0.765], [0.21, 0.8], [0.193, 0.9], [0.178, 0.98], [0.188, 1.06], [0.208, 1.2], [0.218, 1.32], [0.222, 1.4], [0.19, 1.46], [0.075, 1.5], [0.01, 1.505]], { sz: 0.64, folds: 10, amp: 0.02, from: 0.765, to: 0.95 });
  const onJacket = (rx, ry, x0, y0, t) => (x, y, z) => Math.max(Math.abs(x - x0) - rx, Math.abs(y - y0) - ry, jacket(x, y, z) - t, -z);
  // The four pockets, each with a flap across its top, and the placket down the front.
  const pocketList = [[0.085, 1.27, 0.048, 0.052], [-0.085, 1.27, 0.048, 0.052], [0.11, 0.86, 0.06, 0.065], [-0.11, 0.86, 0.06, 0.065]].flatMap(([x0, y0, rx, ry]) => [onJacket(rx, ry, x0, y0, 0.006), onJacket(rx + 0.004, 0.013, x0, y0 + ry - 0.006, 0.011)]);
  const pockets = (x, y, z) => { let d = Infinity; for (const q of pocketList) d = Math.min(d, q(x, y, z)); return d; };
  const placket = onJacket(0.009, 0.25, 0, 1.22, 0.005);
  const belt = (x, y, z) => torus([0, 0.98, 0], 0.18, 0.017)(x, y, z / 0.64) * 0.64;
  const stone = (x, y, z) => roundBox([0, 0.27, -0.12], [0.2, 0.27, 0.09], 0.04)(x, y, z) + 0.008 * Math.sin(x * 60 + 1) * Math.sin(y * 50) * Math.sin(z * 70 + 2);
  const b = blend([
    [legs, 0],
    [E([0, 0.86, 0], [0.15, 0.08, 0.1]), 0.04],
    [jacket, 0.02],
    [pockets, 0.004], [placket, 0.003], [belt, 0.004],
    [roundBox([0, 0.98, 0.117], [0.026, 0.021, 0.008], 0.004), 0.003],
    [torus([0, 1.49, 0.008], 0.07, 0.018), 0.006],
    [mirrorX(E([0.19, 1.42, 0], [0.065, 0.058, 0.07])), 0.03],
    [mirrorX(roundBox([0.145, 1.468, 0], [0.055, 0.007, 0.026], 0.005)), 0.005],
    // The left arm at his side, the fist closed, the thumb over the fingers.
    [cone([0.22, 1.41, 0], [0.248, 1.13, -0.01], 0.056, 0.05), 0.03],
    [cone([0.248, 1.13, -0.01], [0.238, 0.88, 0.03], 0.048, 0.04), 0.015],
    [torus([0.238, 0.885, 0.03], 0.043, 0.008), 0.004],
    [E([0.235, 0.818, 0.035], [0.032, 0.052, 0.046]), 0.012],
    [chain([[0.222, 0.845, 0.072, 0.012], [0.227, 0.81, 0.08, 0.011]], 0.005), 0.006],
    // The right arm raised in salute: the elbow out at the shoulder's height, the forearm up to the
    // temple, the hand held flat, its fingertips at the edge of the cap.
    [cone([-0.22, 1.41, 0], [-0.45, 1.44, 0.07], 0.056, 0.05), 0.03],
    [cone([-0.45, 1.44, 0.07], [-0.18, 1.63, 0.1], 0.048, 0.038), 0.015],
    [slab([-0.185, 1.625, 0.1], [-0.088, 1.735, 0.092], 0.036, 0.011, [0.25, 0, 1]), 0.012],
    [cone([0, 1.47, 0], [0, 1.56, 0.014], 0.06, 0.057), 0.02],
    // The uncut stone behind the calves, and the slab under the boots.
    [stone, 0.02],
    [roundBox([0, 0.015, 0.0], [0.26, 0.015, 0.22], 0.005), 0.01],
  ]);
  // The head: a full round face, clean-shaven; the side cap, boat-shaped, creased along its top.
  const head = face(netajiP, NETAJI_HEAD.S, { full: 2.2, lids: 0.4, tall: 0.96 });
  // The side cap: two flat sides rising from a band round the head to a creased top, longer than
  // the head front to back and pointed at each end, set low over the forehead and tilted down to
  // the right.
  const capShape = (x, y, z) => { const u = Math.max(0, Math.min(1, (y - 1.715) / 0.082)); return Math.max(Math.abs(x) - (0.086 - 0.06 * u * u), Math.abs(z) - (0.124 - 0.04 * u * u * u), 1.715 - y, y - 1.797 - 0.01 * (1 - (z / 0.12) ** 2)); };
  const cap = turn((x, y, z) => capShape(x, y + 0.012, z) - 0.003, 'z', 0.2, [0, 1.73, 0]);
  const all = (x, y, z) => smin(b(x, y, z), y > 1.55 ? smin(head(x, y, z), cap(x, y, z), 0.004) : Infinity, 0.012);
  return { f: flatBase(all), lo: [-0.53, -0.01, -0.26], hi: [0.34, 1.86, 0.2] };
}
// The body on 1.2 cm cells (5.5 cm on the statue), the front of the tunic (its pockets and belt) on
// 7 mm, and the head with the saluting hand, and the fist, on 5 mm (on phones 2, 1.2 and 0.9 cm).
export const netajiBody = (m) => body(detail.low ? 'netaji-coarse' : 'netaji', netajiField, detail.low ? 0.02 : 0.012, m, undefined, {
  wear: 0.2, split: [
    { region: (x, y, z) => Math.min(E([0, 1.71, 0.02], [0.11, 0.14, 0.14])(x, y, z), E([-0.15, 1.69, 0.1], [0.065, 0.09, 0.045])(x, y, z)), h: detail.low ? 0.009 : 0.005, lo: [-0.22, 1.56, -0.13], hi: [0.12, 1.86, 0.17] },
    { region: (x, y, z) => Math.max(Math.abs(x) - 0.185, Math.abs(y - 1.12) - 0.36, 0.03 - z), h: detail.low ? 0.012 : 0.007, lo: [-0.2, 0.75, 0.02], hi: [0.2, 1.49, 0.16] },
    { region: E([0.236, 0.82, 0.035], [0.044, 0.075, 0.06]), h: detail.low ? 0.009 : 0.005, lo: [0.19, 0.74, -0.03], hi: [0.285, 0.9, 0.1] },
  ],
});
// His round spectacles: two rims, the bridge and the arms back to the ears, in the figure's units.
export function netajiSpectacles(m) {
  const g = new THREE.Group(), P = netajiP, S = NETAJI_HEAD.S;
  for (const sx of [-1, 1]) {
    const c = P(sx * 3.4, 0.3, 10.7), rim = mesh(new THREE.TorusGeometry(2.9 * S, 0.004, 6, 28), m, ...c);
    rim.rotation.y = sx * 0.12;
    g.add(rim);
    const arm = new THREE.CatmullRomCurve3([P(sx * 6.3, 0.6, 10.0), P(sx * 9.4, 0.7, 6.0), P(sx * 10.2, 0.5, 1.0)].map((q) => new THREE.Vector3(...q)));
    g.add(mesh(new THREE.TubeGeometry(arm, 10, 0.0035, 5, false), m));
  }
  const bridge = new THREE.CatmullRomCurve3([P(-0.6, 0.8, 11.2), P(0, 1.2, 11.6), P(0.6, 0.8, 11.2)].map((q) => new THREE.Vector3(...q)));
  g.add(mesh(new THREE.TubeGeometry(bridge, 6, 0.0035, 5, false), m));
  return g;
}

// Chhatrapati Shivaji on horseback at Apollo Bunder (1961, in bronze), after photographs: the rider,
// in human units with the point he sits on at the origin, facing +z, for shivaji() in
// gateway-of-india details to set on the saddle of the prancing horse (animals.js) at 1.75 times
// life. Upright in the saddle in a long-sleeved angarkha whose skirt spreads over his thighs and
// hangs beside them, a sash at the waist and a baldric from the left shoulder to the right hip,
// strings of pearls on the chest, boots in the stirrups; the left hand forward holding the reins,
// the right held low behind his hip, gripping the sword (a mesh) whose blade points forward along
// the horse's flank; a round shield slung on his back; his face with its hooked nose, upturned
// moustache and pointed beard, under the Maratha turban with the plume rising from its top and a
// tassel hanging behind.
const SHIVAJI_HEAD = { S: 0.0082, y: 0.84, z: 0.02 };
const shivajiP = (x, y, z) => [x * SHIVAJI_HEAD.S, SHIVAJI_HEAD.y + y * SHIVAJI_HEAD.S * 1.05, SHIVAJI_HEAD.z + z * SHIVAJI_HEAD.S];
function shivajiField() {
  const thigh = mirrorX(chain([[0.1, 0.06, 0.02, 0.085], [0.3, -0.2, 0.28, 0.066], [0.33, -0.62, 0.18, 0.05]], 0.03));
  const boot = mirrorX(blend([[E([0.34, -0.665, 0.25], [0.042, 0.035, 0.11]), 0], [cone([0.33, -0.62, 0.18], [0.325, -0.44, 0.22], 0.052, 0.06), 0.02]]));
  const torso = blend([
    [E([0, 0.08, 0], [0.19, 0.11, 0.14]), 0],
    [E([0, 0.3, 0], [0.18, 0.14, 0.13]), 0.08],
    [E([0, 0.52, 0.01], [0.215, 0.16, 0.14]), 0.08],
    [mirrorX(E([0.2, 0.62, 0], [0.075, 0.068, 0.075])), 0.05],
    [mirrorX(cone([0.04, 0.68, 0], [0.18, 0.64, 0], 0.055, 0.05)), 0.04],
    [cone([0, 0.66, 0], [0, 0.75, 0.015], 0.058, 0.055), 0.03],
  ]);
  // The angarkha's skirt over each thigh and hanging beside it below the knee, in folds.
  const curtain = mirrorX(roundBox([0.35, -0.22, 0.04], [0.025, 0.24, 0.22], 0.02));
  const skirt = (x, y, z) => smin(thigh(x, y, z) - 0.035, curtain(x, y, z) + 0.003 * Math.sin(z * 30 + y * 6), 0.06);
  const sash = (x, y, z) => torus([0, 0.27, 0], 0.168, 0.024)(x, y, z / 0.75) * 0.75;
  const across = toLine([[0.17, 0.66], [-0.18, 0.2]]);
  const baldric = (x, y, z) => { const t = torso(x, y, z); return Math.max(across(x, y) - 0.022, t - 0.014, -t - 0.008); };
  // Two strings of pearls hanging on the chest.
  const pearls = blend([0.05, 0.1].map((dy) => [chain(Array.from({ length: 11 }, (_, i) => { const a = (i / 10 - 0.5) * 2.3; return [...snap(torso, [Math.sin(a) * 0.12, 0.665 - (0.03 + dy) * Math.cos(a), 0.2], 0.006), 0.009]; }), 0.004), 0]));
  // The round shield on his back, domed, with its four bosses.
  const shieldF = (x, y, z) => { let d = smax(E([0, 0.42, -0.14], [0.2, 0.2, 0.075])(x, y, z), z + 0.15, 0.004); for (const [bx, by] of [[0.07, 0.49], [-0.07, 0.49], [0.07, 0.35], [-0.07, 0.35]]) d = smin(d, E([bx, by, -0.205], [0.018, 0.018, 0.014])(x, y, z), 0.004); return d; };
  const b = blend([
    [torso, 0],
    [skirt, 0.03],
    [boot, 0.02],
    [sash, 0.01],
    [E([0.08, 0.19, 0.1], [0.03, 0.06, 0.02]), 0.01],
    [baldric, 0.004],
    [pearls, 0.004],
    [shieldF, 0.01],
    // The left arm forward, holding the reins over the horse's withers.
    [cone([0.2, 0.63, 0], [0.26, 0.42, 0.12], 0.056, 0.048), 0.03],
    [cone([0.26, 0.42, 0.12], [0.11, 0.42, 0.33], 0.048, 0.038), 0.015],
    [E([0.09, 0.42, 0.37], [0.032, 0.035, 0.045]), 0.01],
    // The right arm down and back, the fist at the hip gripping the sword's hilt.
    [cone([-0.2, 0.63, 0], [-0.3, 0.4, -0.1], 0.056, 0.048), 0.03],
    [cone([-0.3, 0.4, -0.1], [-0.335, 0.2, -0.13], 0.048, 0.038), 0.015],
    [E([-0.335, 0.17, -0.13], [0.035, 0.045, 0.038]), 0.01],
  ]);
  const P = shivajiP, S = SHIVAJI_HEAD.S, k = (v) => v * S;
  let head = face(P, S, { age: 0.6, lids: 0.6 });
  // The hooked nose, the moustache turned up at its ends, and the pointed beard from the cheeks.
  head = blend([[head, 0],
    [cone(P(0, 2.6, 9.8), P(0, -1.2, 12.6), k(0.9), k(1.2)), k(0.6)],
    [mirrorX(chain([[...P(0.4, -4.1, 11.0), k(0.75)], [...P(2.6, -4.3, 10.4), k(0.8)], [...P(5.2, -3.6, 8.9), k(0.55)], [...P(6.6, -2.0, 7.6), k(0.32)]], k(0.3))), k(0.3)],
    [cone(P(0, -7.2, 7.6), P(0, -15.5, 9.4), k(5.4), k(1.0)), k(2.0)],
    [mirrorX(E(P(6.4, -4.8, 4.6), [2.6 * S, 4.4 * S, 3.2 * S])), k(1.2)]]);
  // The turban: wound in bands, wider at its top, a knot over the forehead, the plume rising from
  // its crown and curling back, and the tassel hanging behind on the left.
  const wound = blend([[E([0, 0.945, -0.01], [0.09, 0.062, 0.1]), 0], [E([0, 0.905, 0.0], [0.085, 0.034, 0.095]), 0.015], [E([0, 0.955, 0.075], [0.03, 0.035, 0.03]), 0.012]]);
  const turban = (x, y, z) => wound(x, y, z) + 0.0025 * Math.sin(y * 260 + Math.atan2(x, z) * 2);
  const plume = chain([[0, 0.99, 0.02, 0.012], [0, 1.045, 0.0, 0.01], [0, 1.07, -0.05, 0.008], [0, 1.06, -0.1, 0.006]], 0.006);
  const tassel = blend([[chain([[0.06, 0.92, -0.08, 0.009], [0.07, 0.85, -0.095, 0.011]], 0.005), 0], [E([0.072, 0.83, -0.097], [0.018, 0.03, 0.018]), 0.008]]);
  const headAll = blend([[head, 0], [turban, 0.006], [plume, 0.006], [tassel, 0.006]]);
  const all = (x, y, z) => smin(b(x, y, z), y > 0.7 ? headAll(x, y, z) : Infinity, 0.012);
  return { f: all, lo: [-0.46, -0.72, -0.3], hi: [0.46, 1.1, 0.45] };
}
// The rider on 1.2 cm cells (3.6 cm on the statue) and his head, beard and turban on 5 mm.
export const shivajiBody = (m) => body(detail.low ? 'shivaji-coarse' : 'shivaji', shivajiField, detail.low ? 0.02 : 0.012, m, undefined, {
  wear: 0.25, split: { region: E([0, 0.87, 0.02], [0.11, 0.15, 0.12]), h: detail.low ? 0.009 : 0.005, lo: [-0.12, 0.71, -0.11], hi: [0.12, 1.1, 0.15] },
});

// The Statue of Oneness at Omkareshwar (2023, in bronze): Adi Shankaracharya as a boy of twelve,
// walking, after photographs. In boy's units (1.5 to the top of his head), facing +z on y = 0;
// statueOfOneness() in omkareshwar-temple details scales him up. The lower robe falls in folds to the
// ankles, pressed out by the left knee as it comes forward, the feet showing under the hem; the
// upper cloth is wrapped over the left shoulder and across the body below the right arm, leaving
// the right shoulder and arm bare, its end hanging at his left side; the right hand, before the
// hip, grips the staff (a mesh) that crosses his body, and the left, at his side, holds the water
// pot (a mesh); the head is shaven but for a small knot at the crown, the face calm and young, the
// eyes lowered. The mala and the bands of rudraksha on the arms are meshes, laid on this skin.
const SHANKARA_HEAD = { S: 0.0092, y: 1.352, z: 0.018 };
const shankaraP = (x, y, z) => [x * SHANKARA_HEAD.S, SHANKARA_HEAD.y + y * SHANKARA_HEAD.S * 1.05, SHANKARA_HEAD.z + z * SHANKARA_HEAD.S];
function shankaraField() {
  const robe = lathe([[0.19, 0.065], [0.192, 0.2], [0.182, 0.45], [0.168, 0.7], [0.152, 0.86], [0.145, 0.92], [0.0, 0.95]], { sz: 0.7, folds: 16, amp: 0.05, from: 0.065, to: 0.8 });
  const torso = blend([
    [E([0, 0.92, 0], [0.135, 0.065, 0.09]), 0],
    [E([0, 1.06, 0.005], [0.15, 0.12, 0.095]), 0.06],
    [mirrorX(E([0.15, 1.17, 0], [0.056, 0.05, 0.056])), 0.05],
    [mirrorX(cone([0.03, 1.215, 0], [0.14, 1.19, 0], 0.045, 0.045)), 0.04],
  ]);
  // The upper cloth: a shell on the torso below a line from under the right arm up over the left
  // shoulder, in diagonal folds; and its end hanging at his left side.
  const edge = (x, y) => y - (1.06 + (x + 0.15) * 0.8);
  const cloth = (x, y, z) => { const t = torso(x, y, z); return Math.max(Math.abs(t - 0.009) - 0.009 + 0.001 * Math.sin((y - 0.8 * x) * 70), edge(x, y), 0.86 - y); };
  const hang = (x, y, z) => roundBox([0.232, 0.76, 0.025], [0.016, 0.2, 0.05], 0.012)(x, y, z) + 0.004 * Math.sin(z * 90 + y * 8);
  const b = blend([
    [robe, 0],
    [E([0.07, 0.43, 0.09], [0.075, 0.1, 0.06]), 0.06],
    [E([-0.065, 0.02, 0.08], [0.03, 0.02, 0.075]), 0.015],
    [E([0.07, 0.02, 0.16], [0.03, 0.02, 0.075]), 0.015],
    [torso, 0.05],
    [cloth, 0.006],
    [hang, 0.02],
    [cone([0, 1.18, 0], [0, 1.28, 0.012], 0.045, 0.042), 0.02],
    // The right arm, bare, down to the elbow and forward to the hand before the hip.
    [cone([-0.16, 1.17, 0], [-0.19, 0.95, -0.015], 0.04, 0.034), 0.025],
    [cone([-0.19, 0.95, -0.015], [-0.105, 0.86, 0.15], 0.033, 0.026), 0.012],
    [E([-0.095, 0.85, 0.165], [0.024, 0.034, 0.029]), 0.008],
    // The left arm down at his side, the hand holding the pot's handle.
    [cone([0.16, 1.17, 0], [0.195, 0.95, -0.01], 0.04, 0.034), 0.025],
    [cone([0.195, 0.95, -0.01], [0.21, 0.76, 0.05], 0.033, 0.026), 0.012],
    [E([0.21, 0.73, 0.06], [0.024, 0.034, 0.028]), 0.008],
  ]);
  const P = shankaraP, S = SHANKARA_HEAD.S;
  const head = face(P, S, { full: 1.4, lids: 0.75, tall: 0.9 });
  const knot = E([0, 1.445, -0.075], [0.016, 0.014, 0.016]);
  const all = (x, y, z) => smin(b(x, y, z), y > 1.2 ? smin(head(x, y, z), knot(x, y, z), 0.008) : Infinity, 0.01);
  return { f: flatBase(all), lo: [-0.28, -0.01, -0.14], hi: [0.28, 1.52, 0.27] };
}
let shankaraF = null;
export const shankaraSurface = () => (shankaraF ||= shankaraField().f);
// The figure on 1 cm cells (16 cm on the statue), the head on 4.5 mm and the hands on 5 mm (on
// phones 1.9, 0.9 and 0.9 cm): it stands high on its hill, seen from afar.
export const shankaraBody = (m) => body(detail.low ? 'shankara-coarse' : 'shankara', shankaraField, detail.low ? 0.019 : 0.01, m, undefined, {
  split: [
    { region: E([0, 1.37, 0.015], [0.11, 0.13, 0.11]), h: detail.low ? 0.009 : 0.0045, lo: [-0.12, 1.23, -0.1], hi: [0.12, 1.52, 0.13] },
    { region: E([-0.098, 0.85, 0.162], [0.036, 0.046, 0.042]), h: detail.low ? 0.009 : 0.005, lo: [-0.14, 0.8, 0.115], hi: [-0.055, 0.9, 0.21] },
    { region: E([0.21, 0.73, 0.06], [0.036, 0.046, 0.042]), h: detail.low ? 0.009 : 0.005, lo: [0.17, 0.68, 0.015], hi: [0.25, 0.78, 0.105] },
  ],
});
