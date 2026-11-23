import * as THREE from 'three';
import { mat, box, at, photo } from '../helpers.js';
import { addDetails, standingSha } from '../details/kangla-fort.js';

// Kangla Fort, Imphal, from photographs. Before the Uttra, the coronation hall of the Meitei kings,
// stand the two Kangla Sha: guardian beasts with a lion's body and a dragon's head, white, 19.3 ft
// (5.9 m) high, 15.3 ft long and 6 ft broad, rebuilt by the state in 2006 after the British had
// pulled the old pair down in 1891. Each stands square on four thick legs on a low slab, the neck
// rising like a tower from the chest under two collars of beads, the blunt head lifted with the
// jaws wide open, and on the head two thin antlers, each forked, after the sangai deer's. They face
// west (+z here), down the avenue to the Kangla Gate, with the Uttra's walled terrace and its stair
// behind them; north is -x. The Uttra, the citadel with its inner moat, the temples, the boatyard,
// the polo ground and the gates are in js/details/kangla-fort.js.
export const LIME = mat('#f1eee6', 0.8), BRICK = photo(mat('#9a5a40', 0.92), 'blocks'), BRICK_DARK = photo(mat('#7c4532', 0.92), 'blocks');
// The Kangla's ground stands G above the open land, so that its moats and ponds lie in it.
export const G = 1.2;

export function buildKanglaFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(at(f, 0, G, 0));
  // The pair, either side of the stair's axis, facing west, each on its slab.
  for (const x of [-8.5, 8.5]) f.add(at(standingSha(LIME), x, 0.2, 0), box(3.4, 0.2, 6.4, mat('#b9b2a4', 0.9), x, 0, -0.1));
  addDetails(f, g);
  // From the south-west, the pair in three-quarter view before the Uttra's terrace.
  return { group: g, focus: f, view: [0.75, 0.3, 1], zoom: 1 };
}
