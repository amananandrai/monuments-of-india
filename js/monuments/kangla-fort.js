import * as THREE from 'three';
import { mat, box, at, photo } from '../helpers.js';
import { kanglaSha } from '../parts/animals.js';
import { addDetails } from '../details/kangla-fort.js';

// Kangla Fort, Imphal, from photographs. Before the brick plinth of the Uttra, the coronation hall
// of the Meitei kings, sit the two Kangla Sha: guardian beasts with a lion's body and a dragon's
// head, white, 19.3 ft (5.9 m) high and 15.3 ft long, rebuilt by the state in 2006 after the
// British had pulled the old pair down in 1891. Each sits upright on its haunches on a stepped
// plinth, its forelegs straight, its tail curled up behind, its horned head raised with the jaws
// open. They face east (+z here), up the avenue from the Uttra. The Uttra's ruined plinth, the
// moat, the gates and the temples are in js/details/kangla-fort.js.
export const LIME = mat('#f1eee6', 0.8), BRICK = photo(mat('#9a5a40', 0.92), 'blocks'), BRICK_DARK = photo(mat('#7c4532', 0.92), 'blocks');

export function buildKanglaFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The pair, either side of the avenue, facing east.
  for (const x of [-8.5, 8.5]) f.add(at(kanglaSha({ m: LIME, plinth: [BRICK_DARK, LIME, BRICK] }), x, 0.15, 0));
  // The Uttra's plinth behind them: a low brick platform with steps up its front.
  f.add(box(34, 1.4, 22, BRICK, 0, 0, -26), box(35, 0.25, 23, BRICK_DARK, 0, 1.4, -26), box(10, 0.7, 2.4, BRICK, 0, 0, -13.8), box(10, 0.7, 1.2, BRICK, 0, 0.7, -14.4));
  addDetails(f, g);
  // From the east, up the avenue towards the Kangla Sha and the Uttra.
  return { group: g, focus: f, view: [0.55, 0.3, 1], zoom: 1 };
}
