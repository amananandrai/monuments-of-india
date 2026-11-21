import * as THREE from 'three';
import { mesh } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, roundBox, lathe, snap, sculpt, statueMaterial, bounded, smin, smax, torus } from '../sdf.js';
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

// The seated Shiva at Nageshwar, cross-legged on his seat, with four arms: the front right (-x)
// raised in blessing, the front left resting on the knee, the rear right gripping the trishul and
// the rear left raising the damru; in the coordinates of mahayogiShiva() in nageshwar-temple.js.
// The head and hands are carved in the field, as on the Statue of Unity: the face with its brow,
// eyes under their lids, nose, lips and chin, and the ears; the raised palm with its four fingers
// and thumb, the fingers of the left hand curling over the knee, and the rear hands closed round
// the trishul and the damru. The hair, the serpent and the ornaments are meshes.
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
  const all = (x, y, z) => smin(smin(carve(carve(anatomy, line, 0.15), navel, 0.15)(x, y, z), handsB(x, y, z), 0.12), y > 17.4 ? headB(x, y, z) : Infinity, 0.5);
  return { f: flatBase(all, 3.6, 0.2), lo: [-10.5, 3.4, -4.5], hi: [10.5, 24.6, 7.6] };
}
// coarse: meshed on a cell half as large again (under half the triangles, under half the time), for
// phones (js/detail.js); kept under its own key, so both can be cached.
// The head and the four hands are meshed on finer cells, inside regions that cross the neck and
// the wrists squarely.
export const shivaBody = (m, { coarse = false } = {}) => body(coarse ? 'shiva-coarse' : 'shiva', shivaField, coarse ? 0.36 : 0.24, m, undefined, {
  split: [
    // The head's region crosses the neck under the cobra's coils, so its seam is hidden.
    { region: E([0, 21.2, 0.6], [2.9, 3.5, 2.9]), h: coarse ? 0.11 : 0.065, lo: [-3.2, 17.5, -2.6], hi: [3.2, 24.9, 3.8] },
    { region: E([-6.6, 17.0, 3.5], [1.6, 1.75, 1.1]), h: coarse ? 0.13 : 0.075, lo: [-8.4, 15.1, 2.3], hi: [-4.9, 18.9, 4.7] },
    { region: E([6.1, 7.6, 5.2], [1.55, 1.0, 1.65]), h: coarse ? 0.13 : 0.075, lo: [4.4, 6.4, 3.4], hi: [7.8, 8.8, 7.0] },
    { region: E([-8.75, 16.1, -0.4], [1.05, 1.15, 1.05]), h: coarse ? 0.14 : 0.08, lo: [-9.9, 14.8, -1.6], hi: [-7.6, 17.4, 0.8] },
    { region: E([8.6, 17.2, -0.2], [1.05, 1.15, 1.05]), h: coarse ? 0.14 : 0.08, lo: [7.4, 15.9, -1.4], hi: [9.8, 18.5, 1.0] },
  ],
});
// The Shiva's skin as a field, for laying ornaments on it.
let shivaF = null;
export const shivaSurface = () => (shivaF ||= shivaField().f);

// Sardar Patel at the Statue of Unity, in the coordinates of patel() in statue-of-unity.js (177 units
// tall before it is scaled), after photographs of the statue: the shawl over both shoulders hanging
// like a cape over the arms to the hips, its ends falling down each side of a wide opening that
// narrows to the neck; in the opening the bandi, a sleeveless jacket buttoned down the front, to
// the hips; under that the kurta to the knee with its standing collar; below that the dhoti, full and folded round each leg to above the ankle,
// its pleats falling between the legs; the bare ankles and the feet in chappals, a stride apart; the hands at his sides just below the shawl's hem; and the head. The head is
// that of the 1949 portrait the statue follows: the bare, broad crown, the heavy brow over deep-set
// eyes under heavy lids with pouches beneath, a strong nose, deep folds from the nose to the
// corners of the set, downturned mouth, the full jowls and broad jaw of his later years, a firm
// chin, and large ears. The fingers and the overlays on the cloth are meshes (patel()).
function patelField() {
  // Below the kurta's hem the dhoti is gathered round each leg: full at the knee, folded in long
  // diagonal folds that wind round the leg, narrowing to an uneven hem a little above the ankle,
  // the left leg a stride forward, as he walks. The hem is open: below it the bare shin and ankle,
  // and the foot in its chappal: a thick sole, a broad strap over the instep, a ring round the
  // big toe and a thong between them, the five toes showing.
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const leg = (sx, zb, zt, fz) => {
    const zc = (zb + zt) / 2, cx = sx * 8.3;
    const outer = blend([[cone([sx * 8.0, 13, zb], [sx * 8.6, 58, zt], 6.4, 8.0), 0], [E([sx * 8.6, 37, zc + 0.4], [7.4, 12, 8.0]), 4]]);
    const folds = (x, y, z) => { const a = Math.atan2(sx * (x - cx), z - zc); return (0.85 * Math.sin(3 * a + 0.3 * y) + 0.45 * Math.sin(0.5 * y - a) + 0.35 * Math.sin(0.9 * y + 2 * a)) * clamp((56 - y) / 5) * clamp((y - 19) / 7); };
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
    return Math.max(Math.abs(x) - hw, Math.abs(z - (5.4 + 0.8 * t)) - 1.25 - 0.55 * Math.abs(Math.sin(x * 2.0)), y - 57, 20 - y);
  };
  // The kurta, from the collar to about the knee, its hem standing a little proud.
  const kurta = lathe([[17.9, 56], [17.3, 59], [16.6, 75], [16.0, 92], [16.6, 100], [18.4, 118], [19.8, 131], [17.4, 140], [8, 145], [0.1, 145.5]], { sz: 0.62, folds: 18, amp: 0.025, from: 56, to: 92 });
  // The shawl over both shoulders, hanging like a cape over the arms to about the hips: a shell
  // two units thick below the shoulders, open down the front from the collar, widening as it falls,
  // so the kurta and the bandi's placket show between its edges; long folds down its sides.
  const cape = lathe([[29, 86], [29.4, 98], [28.6, 118], [26.2, 131], [21.6, 140], [18.6, 145], [9.8, 148.6], [0.1, 149]], { sz: 0.62, folds: 22, amp: 0.03, from: 86, to: 132 });
  const inside = lathe([[25.6, 80], [25.8, 98], [24.8, 114], [0.1, 115]], { sz: 0.58 });
  // The opening is a V at the neck, where the shawl's two ends cross over it, widening fast down
  // the chest and then slowly to the hem.
  const open = (x, y, z) => Math.max(Math.abs(x) - Math.min(0.6 + (148 - y) * 0.24, 5.9 + (148 - y) * 0.065), -z, y - 148, 80 - y);
  // Over the kurta and under the shawl, the bandi: a sleeveless jacket from its band collar to the
  // hips, buttoned down the front on a raised placket, with a welt pocket on the chest and a
  // pocket on each side below, its hem standing proud of the kurta.
  const jacket = lathe([[17.7, 90.5], [17.3, 92.5], [17.4, 100], [19.2, 118], [20.6, 131], [18.4, 140], [9.6, 144.3], [0.1, 144.6]], { sz: 0.62 });
  const onJacket = (rx, ry, x0, y0, t) => (x, y, z) => Math.max(Math.abs(x - x0) - rx, Math.abs(y - y0) - ry, jacket(x, y, z) - t, -z);
  const placket = onJacket(0.8, 25.5, 0, 117, 0.35);
  const pockets = (x, y, z) => Math.min(onJacket(1.4, 0.4, 3.2, 129, 0.3)(x, y, z), onJacket(2.6, 2.1, 5.9, 99.5, 0.28)(x, y, z), onJacket(2.6, 2.1, -5.9, 99.5, 0.28)(x, y, z));
  const flaps = (x, y, z) => Math.min(onJacket(2.8, 0.45, 5.9, 101.7, 0.5)(x, y, z), onJacket(2.8, 0.45, -5.9, 101.7, 0.5)(x, y, z));
  const shawl = (x, y, z) => smax(smax(cape(x, y, z), -inside(x, y, z), 0.4), -open(x, y, z), 0.5);
  const b = blend([
    [kurta, 0],
    [shawl, 1.0],
    [leg(1, 2.6, 1.0, 6.4), 2.5],
    [leg(-1, -0.8, 0.2, 3.0), 2.5],
    [kasta, 0.5],
    [mirrorX(E([20.5, 136, 0.5], [6.6, 6.2, 5.6])), 2],
    [mirrorX(cone([20.5, 136, 0.5], [23.6, 111, 2], 6.2, 5.4)), 2],
    [mirrorX(cone([23.6, 111, 2], [22.4, 89, 3.5], 5.4, 4.3)), 1.5],
    [mirrorX(E([22.2, 83.4, 4], [3.3, 5.2, 3.9])), 1.2],
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
  ]);
  head = carve(head, mirrorX(E(P(3.4, 0.5, 9.2), [2.4, 1.5, 2.0])), 0.9);
  head = blend([[head, 0],
    [mirrorX(E(P(3.4, 0.3, 7.7), [1.85, 1.05, 1.5])), 0.3],
    [mirrorX(E(P(3.4, 1.05, 8.1), [2.2, 0.7, 1.45])), 0.3],
    [mirrorX(E(P(3.5, -0.95, 8.2), [1.9, 0.55, 1.05])), 0.4],
    [E(P(0, -4.45, 9.45), [2.8, 0.6, 1.0]), 0.5],
    [E(P(0, -5.6, 9.05), [2.4, 0.7, 1.0]), 0.5]]);
  head = carve(head, E(P(0, -5.0, 9.95), [2.7, 0.17, 1.0]), 0.2);
  head = carve(head, mirrorX(E(P(2.85, -5.35, 9.15), [0.5, 0.3, 0.6])), 0.2);
  head = carve(head, mirrorX(cone(P(1.95, -2.3, 9.95), P(3.7, -6.7, 8.5), 0.33, 0.33)), 0.4);
  head = carve(head, mirrorX(E(P(10.6, -0.2, -0.2), [0.6, 2.2, 1.4])), 0.2);
  const all = (x, y, z) => smin(b(x, y, z), y > 147 ? head(x, y, z) : Infinity, 2);
  return { f: flatBase(all), lo: [-33, -1, -21], hi: [33, 177, 22] };
}
let patelF = null;
export const patelSurface = () => (patelF ||= patelField().f);
// The body is meshed with 1.1-unit cells, and the head (inside an ellipsoid crossing the neck), the
// front of the torso, and the feet and hems with cells a third that size (on phones 1.5 and about 0.5); the folds of the
// bronze are rubbed bright.
export const patelBody = (m) => body(detail.low ? 'patel-coarse' : 'patel', patelField, detail.low ? 1.5 : 1.1, m, [0.3, 0.34, 0.28], {
  wear: 0.3, split: [
    { region: E([0, 162.5, 2], [13.5, 13.5, 14]), h: detail.low ? 0.48 : 0.32, lo: [-14, 148, -13], hi: [14, 177, 17] },
    // The front of the torso, where the bandi shows between the shawl's ends with its placket,
    // pockets and collar.
    // A box, not an ellipsoid, so its sides cross the shawl squarely and the seam stays a line.
    { region: (x, y, z) => Math.max(Math.abs(x) - 10.8, Math.abs(y - 115.5) - 30, 3 - z), h: detail.low ? 0.6 : 0.4, lo: [-13, 82, 1], hi: [13, 148, 25] },
    // The feet in their chappals, the ankles and the dhoti's open hems, on the same fine grid.
    ...[[1, 2.6, 6.4], [-1, -0.8, 3.0]].map(([sx, zb, fz]) => ({ region: E([sx * 8, 8, (zb + fz) / 2 + 1], [8.5, 12.5, 13.5]), h: detail.low ? 0.5 : 0.34, lo: [sx * 8 - 10, -1, zb - 12], hi: [sx * 8 + 10, 27, fz + 15] })),
  ],
});

// Bahubali at Shravanabelagola, standing in kayotsarga in the coordinates of bahubali() in
// gommateshwara.js (feet at y = 0, the crown of the head at about 19.3), carved from one block of
// granite: the statue, the two anthills beside his legs and the lotus he stands on are one stone.
// After the published measurements and photographs of the image: very broad square shoulders
// (about 7.9 m across, with the arms) over a narrow waist (about 3 m), the arms hanging close by
// the chest, long legs with slim thighs, and long arms
// hanging down, the forearms turning in so the hands, palms in and fingers together and straight,
// come down beside the outer thighs, the wrists level with the groin and the fingertips at the
// tops of the anthills. The flat broad chest with its nipples and collarbones; the navel; nude (digambara), as
// Jain images in kayotsarga are. The head is part of the field: an oval face of calm planes, the
// eyes long and half closed under a ridged brow, a long straight nose, a small smiling mouth, the
// long pierced earlobes reaching nearly to the shoulders, three lines on the neck. The curls of
// the hair and the creepers are laid on this skin by bahubali() (bahubaliSurface()).
function bahubaliField() {
  const base = blend([
    [E([0, 9.0, 0], [2.1, 1.4, 1.45]), 0],
    [mirrorX(chain([[1.2, 0.75, 0, 0.55], [1.3, 4.6, 0, 0.72], [1.4, 8.6, 0, 1.0]], 0.5)), 0.55],
    [mirrorX(E([1.28, 3.1, -0.28], [0.52, 1.2, 0.5])), 0.45],
    [mirrorX(E([1.32, 4.65, 0.38], [0.44, 0.5, 0.38])), 0.3],
    [mirrorX(E([1.38, 6.8, 0.12], [0.86, 1.9, 0.86])), 0.55],
    [mirrorX(E([1.22, 0.4, 0.5], [0.85, 0.45, 1.55])), 0.25],
    [E([0, 10.3, 0], [1.75, 1.5, 1.35]), 0.9],
    [E([0, 11.0, 0.7], [1.6, 1.4, 0.95]), 0.8],
    [E([0, 13.1, 0], [2.75, 2.2, 1.85]), 1.0],
    [mirrorX(E([1.3, 13.7, 0.95], [1.4, 1.0, 0.8])), 0.9],
    [E([0, 14.85, -0.2], [2.7, 0.62, 1.15]), 0.7],
    [mirrorX(E([3.2, 14.55, 0], [0.88, 0.88, 0.88])), 0.8],
    [cone([0, 15.0, 0], [0, 16.6, 0.1], 0.85, 0.75), 0.5],
    // The arms: the upper arm straight down, the forearm turning in to the hand by the thigh.
    [mirrorX(chain([[3.35, 14.4, 0, 0.7], [3.42, 11.0, 0.05, 0.56], [2.9, 7.95, 0.12, 0.44]], 0.3)), 0.55],
    [mirrorX(E([3.42, 13.0, 0], [0.64, 1.3, 0.64])), 0.4],
  ]);
  // The hands, palm to the thigh: four fingers together pointing down, the thumb in front.
  const hand = mirrorX(bounded(blend([
    [E([2.86, 7.2, 0.22], [0.5, 0.78, 0.5]), 0.08],
    // The palm turns a little forward, so the fingers stand in a row slanting across the thigh.
    ...[-0.27, -0.09, 0.09, 0.27].map((t, i) => [cone([2.86 + t * 0.62, 6.6, 0.22 + t * 0.78], [2.82 + t * 0.62, 5.95 + Math.abs(i - 1.5) * 0.12, 0.26 + t * 0.78], 0.145, 0.115), 0.04]),
    [cone([2.62, 7.1, 0.66], [2.6, 6.35, 0.8], 0.15, 0.12), 0.06],
  ]), [2.84, 6.7, 0.3], 1.3, 0.5));
  // The anthills rising beside the legs to the fingertips: rough rounded blocks of the same stone,
  // pressed against the outer calves and blended into them.
  const lumps = blend([
    [roundBox([3.6, 1.5, -0.3], [1.45, 1.5, 1.6], 0.6), 0],
    [roundBox([3.4, 3.4, -0.25], [1.2, 1.9, 1.4], 0.6), 0.6],
    [E([3.3, 5.05, -0.15], [0.95, 0.55, 1.15]), 0.45],
    [E([3.9, 4.8, -0.7], [0.75, 0.5, 0.75]), 0.4],
  ]);
  const hill = (x, y, z) => lumps(x, y, z) + 0.07 * Math.sin(2.3 * x + 1) * Math.sin(1.9 * y + 0.4) * Math.sin(2.6 * z + 0.5);
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
    [E([0, 17.8, 0.98], [1.0, 0.17, 0.26]), 0.25],
    [cone([0, 17.72, 1.22], [0, 17.05, 1.47], 0.1, 0.15), 0.12],
    [E([0, 17.0, 1.43], [0.2, 0.14, 0.16]), 0.08],
    [E([0, 16.25, 0.95], [0.38, 0.25, 0.3]), 0.2],
    // The ears, and the long earlobes hanging nearly to the shoulders.
    [mirrorX(E([1.25, 17.45, 0], [0.2, 0.5, 0.34])), 0.12],
    [mirrorX(chain([[1.3, 17.1, 0.05, 0.19], [1.36, 16.4, 0.08, 0.2], [1.34, 16.0, 0.1, 0.21]], 0.1)), 0.12],
  ]);
  // The eye sockets, then the long half-closed eyes in them under their heavy lids.
  head = carve(head, mirrorX(E([0.47, 17.48, 1.32], [0.36, 0.2, 0.3])), 0.12);
  head = blend([[head, 0], [mirrorX(E([0.47, 17.45, 1.0], [0.29, 0.13, 0.19])), 0.04], [mirrorX(E([0.47, 17.53, 1.04], [0.32, 0.07, 0.18])), 0.03],
    // The lips: a short full upper lip and a fuller lower one.
    [E([0, 16.62, 1.24], [0.26, 0.06, 0.08]), 0.06], [E([0, 16.48, 1.2], [0.22, 0.07, 0.08]), 0.06]]);
  head = carve(head, E([0, 16.555, 1.31], [0.25, 0.016, 0.1]), 0.02);
  // The slit of each pierced earlobe, and the three lines round the neck.
  head = carve(head, mirrorX(E([1.42, 16.3, 0.08], [0.22, 0.3, 0.06])), 0.02);
  for (const [y, R] of [[15.95, 0.79], [16.2, 0.78]]) head = carve(head, torus([0, y, 0.06], R, 0.04), 0.02);
  const headB = bounded(head, [0, 17.2, 0.3], 2.4, 0.6);
  // The anthills join the legs in a broad fillet; the hands join the forearms in a small one, too
  // small to bridge the gap between the fingertips and the anthills' tops.
  const all = (x, y, z) => smin(smin(smin(smin(base(x, y, z), hill(Math.abs(x), y, z), 0.22), hand(x, y, z), 0.12), torso(x, y, z), 0.05), headB(x, y, z), 0.25);
  const navel = E([0, 10.6, 1.62], [0.15, 0.2, 0.2]);
  return { f: flatBase(carve(all, navel, 0.1)), lo: [-5, -0.1, -2.6], hi: [5, 19.6, 2.6] };
}
let bahubaliF = null;
export const bahubaliSurface = () => (bahubaliF ||= bahubaliField().f);
// The body is meshed with 17 cm cells and the head, inside an ellipsoid that crosses the neck,
// with 4.5 cm cells (on phones 26 and 7 cm); the ridges are rubbed pale, as weathered granite is.
export const bahubaliBody = (m) => body(detail.low ? 'bahubali-coarse' : 'bahubali', bahubaliField, detail.low ? 0.26 : 0.17, m, undefined, {
  wear: 0.35, split: { region: E([0, 16.9, 0.15], [1.85, 1.65, 1.85]), h: detail.low ? 0.07 : 0.045, lo: [-2.2, 14.6, -2.1], hi: [2.2, 19.6, 2.3] },
});

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
