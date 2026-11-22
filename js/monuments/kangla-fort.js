import * as THREE from 'three';
import { mat, mesh, box, at, photo } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, sphere, sculpt, statueMaterial } from '../sdf.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/kangla-fort.js';

// Kangla Fort, Imphal, from photographs. Before the brick plinth of the Uttra, the coronation hall
// of the Meitei kings, sit the two Kangla Sha: guardian beasts with a lion's body and a dragon's
// head, white, 19.3 ft (5.9 m) high and 15.3 ft long, rebuilt by the state in 2006 after the
// British had pulled the old pair down in 1891. Each sits upright on its haunches on a stepped
// plinth, its forelegs straight, its tail curled up behind, its horned head raised with the jaws
// open. They face east (+z here), up the avenue from the Uttra. The Uttra's ruined plinth, the
// moat, the gates and the temples are in js/details/kangla-fort.js.
export const LIME = mat('#f1eee6', 0.8), BRICK = photo(mat('#9a5a40', 0.92), 'blocks'), BRICK_DARK = photo(mat('#7c4532', 0.92), 'blocks');

// The Kangla Sha, about 2.3 units high, seated, facing +z, on y = 0.
function shaField() {
  const crest = [];
  for (let k = 0; k < 7; k++) { const t = k / 6, y = 2.1 - t * 1.1, z = 0.14 - t * 0.62 - t * t * 0.1; crest.push([cone([0, y, z], [0, y + 0.2 - t * 0.06, z - 0.14], 0.07, 0.01), 0.03]); }
  // The mane: a collar of heavy curls round the neck and over the shoulders.
  const mane = [];
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, r = 0.32 + 0.04 * Math.sin(a * 3); mane.push([sphere([Math.sin(a) * r, 1.62 + 0.12 * Math.cos(a), 0.22 + Math.cos(a) * r * 0.85], 0.12), 0.06]); }
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; mane.push([sphere([Math.sin(a) * 0.38, 1.36, 0.12 + Math.cos(a) * 0.3], 0.13), 0.07]); }
  const body = blend([
    // The seated body: haunches low behind, the chest raised in front.
    [chain([[0, 0.55, -0.55, 0.46], [0, 0.9, -0.2, 0.42], [0, 1.25, 0.12, 0.36]], 0.1), 0],
    [mirrorX(E([0.27, 0.48, -0.48], [0.2, 0.42, 0.5])), 0.12],
    // Hind paws drawn up beside the haunches, the forelegs straight to big clawed paws.
    [mirrorX(E([0.32, 0.09, -0.05], [0.13, 0.09, 0.3])), 0.08],
    [mirrorX(cone([0.21, 1.05, 0.25], [0.22, 0.12, 0.42], 0.17, 0.12)), 0.08],
    [mirrorX(E([0.22, 0.09, 0.53], [0.17, 0.09, 0.19])), 0.05],
    // The neck, and the mane falling over the shoulders.
    [chain([[0, 1.25, 0.12, 0.3], [0, 1.62, 0.24, 0.25], [0, 1.86, 0.34, 0.22]], 0.08), 0.1],
    [E([0, 1.45, 0.1], [0.36, 0.32, 0.3]), 0.12],
    // The head: a broad skull, a long snout, the brows over bulging eyes, the jaw dropped.
    [E([0, 2.0, 0.42], [0.3, 0.27, 0.32]), 0.08],
    [E([0, 1.95, 0.78], [0.21, 0.15, 0.3]), 0.07],
    [mirrorX(E([0.12, 1.92, 0.98], [0.1, 0.09, 0.08])), 0.04],
    [E([0, 1.7, 0.72], [0.15, 0.07, 0.28]), 0.06],
    [cone([0, 1.66, 0.6], [0, 1.42, 0.62], 0.1, 0.03), 0.05],
    [mirrorX(sphere([0.15, 2.12, 0.64], 0.085)), 0.03],
    [mirrorX(E([0.14, 2.22, 0.6], [0.11, 0.035, 0.09])), 0.03],
    [mirrorX(E([0.27, 2.02, 0.32], [0.05, 0.12, 0.08])), 0.03],
    ...mane,
    // Horns sweeping back, whiskers trailing from the snout, and the crest down the back.
    [mirrorX(chain([[0.15, 2.2, 0.36, 0.07], [0.25, 2.42, 0.2, 0.05], [0.28, 2.55, 0.0, 0.03], [0.23, 2.58, -0.14, 0.014]], 0.02)), 0.03],
    [mirrorX(chain([[0.14, 1.9, 0.98, 0.03], [0.3, 1.84, 0.96, 0.024], [0.44, 1.7, 0.84, 0.016]], 0.02)), 0.02],
    ...crest,
    // The tail, rising behind in a curl.
    [chain([[0, 0.3, -0.95, 0.09], [0, 0.42, -1.22, 0.08], [0, 0.78, -1.32, 0.07], [0, 1.12, -1.2, 0.06], [0, 1.3, -0.98, 0.05], [0, 1.26, -0.8, 0.045]], 0.04), 0.06],
    [sphere([0, 1.24, -0.76], 0.09), 0.03],
  ]);
  // The open mouth, with its fangs, and the nostrils.
  let f = carve(body, E([0, 1.81, 0.88], [0.14, 0.06, 0.24]), 0.02);
  f = blend([[f, 0], [mirrorX(cone([0.09, 1.87, 0.98], [0.09, 1.77, 1.0], 0.025, 0.004)), 0.005], [mirrorX(cone([0.09, 1.74, 0.94], [0.09, 1.83, 0.96], 0.022, 0.004)), 0.005]]);
  f = carve(f, mirrorX(E([0.07, 2.01, 1.07], [0.035, 0.03, 0.035])), 0.01);
  return { f: flatBase(f), lo: [-0.66, -0.02, -1.45], hi: [0.66, 2.66, 1.16] };
}

// One Kangla Sha, scaled to 5.9 m high, on its stepped plinth (returns the group and the plinth's
// height).
export const SHA_H = 5.9, PLINTH = 1.8;
export function kanglaSha() {
  const g = new THREE.Group(), geo = sculpt(detail.low ? 'kangla-sha-low' : 'kangla-sha', shaField, { h: detail.low ? 0.045 : 0.026, reach: 0.2, wear: 0.2 });
  const s = SHA_H / 2.6, fig = mesh(geo, statueMaterial(LIME));
  fig.scale.setScalar(s);
  g.add(box(6.4, 0.6, 9.6, BRICK_DARK, 0, 0, -1), box(5.6, 0.6, 8.8, LIME, 0, 0.6, -1), box(4.6, 0.6, 7.8, BRICK, 0, 1.2, -1));
  g.add(at(fig, 0, PLINTH, -0.4));
  return g;
}

export function buildKanglaFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The pair, either side of the avenue, facing east.
  for (const x of [-8.5, 8.5]) f.add(at(kanglaSha(), x, 0.15, 0));
  // The Uttra's plinth behind them: a low brick platform with steps up its front.
  f.add(box(34, 1.4, 22, BRICK, 0, 0, -26), box(35, 0.25, 23, BRICK_DARK, 0, 1.4, -26), box(10, 0.7, 2.4, BRICK, 0, 0, -13.8), box(10, 0.7, 1.2, BRICK, 0, 0.7, -14.4));
  addDetails(f, g);
  // From the east, up the avenue towards the Kangla Sha and the Uttra.
  return { group: g, focus: f, view: [0.55, 0.3, 1], zoom: 1 };
}
