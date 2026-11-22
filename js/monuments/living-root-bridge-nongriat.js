import * as THREE from 'three';
import { mat, mesh, inst, unitBox, surface, rng } from '../helpers.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/living-root-bridge-nongriat.js';

// The double-decker living root bridge at Nongriat, from photographs. Two bridges, one above the
// other, grown by the Khasi from the aerial roots of rubber fig trees (Ficus elastica) on both banks
// of the Umshiang, about 25 m across: the roots trained over the stream on guides until they
// rooted on the far side, thickened over two centuries into a woven deck, packed with flat stones,
// with railings of roots on each side tied down to the deck by hanging roots. The lower deck hangs
// some 3 m over the water, the upper about 6 m above it. The stream runs along z; the bridges span
// x; their figs stand on the banks either side.
export const ROOT = surface(mat('#6d5a46', 0.92), 'carved'), ROOT_PALE = surface(mat('#8a7863', 0.9), 'carved');
export const STONE = surface(mat('#77746b', 0.9), 'carved');
// The two decks: their ends at x = ±X on the banks, at y = Y, sagging by S in the middle.
export const DECKS = [{ X: 13, Y: 4.2, S: 1.4, w: 1.3 }, { X: 12, Y: 10.4, S: 1.1, w: 1.1 }];
export const deckY = ({ X, Y, S }, x) => Y - S * (1 - (x / X) ** 2);

// A bundle of roots along one deck: tubes wandering round the deck's line, braided, thicker near
// the banks where they spring from the trees.
function deck(dk, n, seed) {
  const R = rng(seed), geos = [], rail = [];
  const seg = detail.low ? 20 : 36, radial = detail.low ? 5 : 6;
  for (let k = 0; k < n; k++) {
    const oz = (R() - 0.5) * dk.w, oy = -R() * 0.35, ph = R() * 6.28, fr = 0.3 + R() * 0.6, amp = 0.08 + R() * 0.18, r0 = 0.05 + R() * 0.08;
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = -dk.X - 2 + t * (2 * dk.X + 4), endDrop = Math.max(0, Math.abs(x) - dk.X) * 0.9;
      pts.push(new THREE.Vector3(x, deckY(dk, Math.min(dk.X, Math.abs(x))) + oy - endDrop + amp * Math.sin(ph + t * 9 * fr), oz + amp * Math.cos(ph * 1.3 + t * 7 * fr)));
    }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r0, radial, false));
  }
  // The railings: two or three roots on each side about 0.9 m above the deck, and the hanging roots
  // that tie them down to it.
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
    const pts = [], up = 0.75 + k * 0.18;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, x = -dk.X + t * 2 * dk.X;
      pts.push(new THREE.Vector3(x, deckY(dk, x) + up + 0.06 * Math.sin(i * 1.7 + k + side), side * (dk.w / 2 + 0.1 + 0.05 * k)));
    }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, 0.045 + 0.015 * k, radial, false));
  }
  const step = detail.low ? 1.6 : 0.9;
  for (const side of [-1, 1]) for (let x = -dk.X + 0.6; x < dk.X - 0.3; x += step * (0.7 + R() * 0.6)) {
    const y0 = deckY(dk, x), z = side * (dk.w / 2 + 0.08), lean = (R() - 0.5) * 0.4;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, y0 + 0.95, z), new THREE.Vector3(x + lean * 0.5, y0 + 0.45, z * 1.04), new THREE.Vector3(x + lean, y0 - 0.1, z * 0.92)]);
    rail.push(new THREE.TubeGeometry(curve, 5, 0.025 + R() * 0.02, 4, false));
  }
  // The stones laid in the deck, and the matted surface between them.
  const stones = [];
  for (let x = -dk.X + 0.4; x < dk.X - 0.3; x += 0.5) for (const z of [-0.3, 0.05, 0.35].map((v) => v * dk.w)) {
    if (R() < 0.25) continue;
    stones.push([x + (R() - 0.5) * 0.15, deckY(dk, x) - 0.02, z + (R() - 0.5) * 0.12, 0.38 + R() * 0.15, 0.08, 0.3 + R() * 0.12, R() * 0.6]);
  }
  const g = new THREE.Group();
  g.add(mesh(mergeGeometries(geos), ROOT), mesh(mergeGeometries(rail), ROOT_PALE), inst(unitBox(), stones, STONE));
  return g;
}

export function buildLivingRootBridgeNongriat() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(deck(DECKS[0], detail.low ? 14 : 26, 3), deck(DECKS[1], detail.low ? 10 : 20, 7));
  addDetails(f, g);
  // From downstream, below the lower deck, looking up at both.
  return { group: g, focus: f, view: [0.35, 0.12, 1], zoom: 0.95 };
}
