import * as THREE from 'three';
import { mat, mesh, inst, unitBox, surface, rng } from '../helpers.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/living-root-bridge-nongriat.js';

// The double-decker living root bridge at Nongriat, from photographs (Wikimedia Commons: "Umshiang
// Double-Decker Root Bridge 01", "Double decker living root bridge 02", "Double Decker Living Root
// Bridge2", "Back view of Double decker bridges at Nongriat"). Two bridges, one above the other,
// grown by the Khasi from the aerial roots of rubber fig trees (Ficus elastica) on the banks of the
// Umshiang, a little over 20 m across: the roots trained over the stream on guides until they rooted on the
// far side, thickened over two centuries into a deck of matted roots a metre and more wide, packed
// with flat stones, with thick railings of roots on each side tied down to the deck by many
// hanging roots, the whole green with moss and fringed below with rootlets. The decks run nearly
// level: the lower some 3 m over the water, the upper, a little longer, 5.5 m above it. The stream
// runs along z; the bridges span x; the great fig stands at the east (+x) end.
export const ROOT = surface(mat('#6d5a46', 0.92), 'carved'), ROOT_PALE = surface(mat('#8a7863', 0.9), 'carved');
export const ROOT_MOSS = surface(mat('#5c6a3c', 0.95), 'carved');
export const STONE = surface(mat('#77746b', 0.9), 'carved');
// The two decks: their ends at x = ±X on the banks, at y = Y, sagging by S in the middle.
export const DECKS = [{ X: 11.5, Y: 4.1, S: 0.8, w: 1.4 }, { X: 13, Y: 9.7, S: 0.6, w: 1.2 }];
export const deckY = ({ X, Y, S }, x) => Y - S * (1 - (x / X) ** 2);
// The whole gorge is raised so that its water lies above the open land the site draws at y = 0.
export const LIFT = 1.5;

// A bundle of roots along one deck: tubes wandering round the deck's line, braided, thicker near
// the banks where they spring from the trees; about one in three is green with moss.
function deck(dk, n, seed) {
  const R = rng(seed), geos = [], moss = [], rail = [];
  const seg = detail.low ? 20 : 36, radial = detail.low ? 5 : 6;
  for (let k = 0; k < n; k++) {
    const oz = (R() - 0.5) * dk.w, oy = -R() * 0.7, ph = R() * 6.28, fr = 0.3 + R() * 0.6, amp = 0.08 + R() * 0.18, r0 = 0.07 + R() * 0.12;
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = -dk.X - 2 + t * (2 * dk.X + 4), endDrop = Math.max(0, Math.abs(x) - dk.X) * 0.9;
      pts.push(new THREE.Vector3(x, deckY(dk, Math.min(dk.X, Math.abs(x))) + oy - endDrop + amp * Math.sin(ph + t * 9 * fr), oz + amp * Math.cos(ph * 1.3 + t * 7 * fr)));
    }
    (k % 3 === 1 ? moss : geos).push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r0, radial, false));
  }
  // Younger roots winding round the bundle from end to end.
  for (let k = 0; k < (detail.low ? 3 : 7); k++) {
    const pts = [], ph = R() * 6.28, turns = 5 + R() * 5;
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, x = -dk.X + t * 2 * dk.X, a = ph + t * turns * 6.28;
      pts.push(new THREE.Vector3(x, deckY(dk, x) - 0.33 + 0.5 * Math.sin(a), (dk.w / 2 + 0.06) * Math.cos(a)));
    }
    (k % 2 ? moss : rail).push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), detail.low ? 60 : 120, 0.03 + R() * 0.02, 4, false));
  }
  // The railings: a thick root and two lighter ones on each side up to a metre above the deck,
  // and the hanging roots that tie them down to it.
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
    const pts = [], up = 0.6 + k * 0.2;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, x = -dk.X + t * 2 * dk.X;
      pts.push(new THREE.Vector3(x, deckY(dk, x) + up + 0.07 * Math.sin(i * 1.7 + k + side), side * (dk.w / 2 + 0.12 + 0.05 * k + 0.05 * Math.sin(i * 2.3 + k))));
    }
    (k === 2 ? moss : geos).push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, 0.085 - 0.015 * k, radial, false));
  }
  const step = detail.low ? 1.3 : 0.55;
  for (const side of [-1, 1]) for (let x = -dk.X + 0.6; x < dk.X - 0.3; x += step * (0.7 + R() * 0.6)) {
    const y0 = deckY(dk, x), z = side * (dk.w / 2 + 0.12), lean = (R() - 0.5) * 0.5;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, y0 + 1.0, z), new THREE.Vector3(x + lean * 0.5, y0 + 0.45, z * 1.04), new THREE.Vector3(x + lean, y0 - 0.15, z * 0.9)]);
    rail.push(new THREE.TubeGeometry(curve, 5, 0.025 + R() * 0.03, 4, false));
  }
  // The fringe of rootlets hanging under the deck.
  for (let k = 0; k < (detail.low ? 14 : 44); k++) {
    const x = (R() - 0.5) * 2 * (dk.X - 0.5), z = (R() - 0.5) * dk.w, y0 = deckY(dk, x) - 0.35, L = 0.4 + R() * R() * 1.6;
    rail.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, y0, z), new THREE.Vector3(x + (R() - 0.5) * 0.2, y0 - L * 0.5, z + (R() - 0.5) * 0.2), new THREE.Vector3(x + (R() - 0.5) * 0.3, y0 - L, z)]), 3, 0.015 + R() * 0.015, 3, false));
  }
  // The stones laid in the deck, and the matted surface between them.
  const stones = [];
  for (let x = -dk.X + 0.4; x < dk.X - 0.3; x += 0.5) for (const z of [-0.3, 0.05, 0.35].map((v) => v * dk.w)) {
    if (R() < 0.25) continue;
    stones.push([x + (R() - 0.5) * 0.15, deckY(dk, x) - 0.02, z + (R() - 0.5) * 0.12, 0.38 + R() * 0.15, 0.08, 0.3 + R() * 0.12, R() * 0.6]);
  }
  const g = new THREE.Group();
  g.add(mesh(mergeGeometries(geos), ROOT), mesh(mergeGeometries(moss), ROOT_MOSS), mesh(mergeGeometries(rail), ROOT_PALE), inst(unitBox(), stones, STONE));
  return g;
}

export function buildLivingRootBridgeNongriat() {
  const g = new THREE.Group(), w = new THREE.Group(), f = new THREE.Group();
  g.add(w);
  w.add(f);
  w.position.y = LIFT;
  f.add(deck(DECKS[0], detail.low ? 14 : 28, 3), deck(DECKS[1], detail.low ? 10 : 22, 7));
  addDetails(f, w);
  // From downstream, below the lower deck, looking up at both.
  return { group: g, focus: f, view: [0.3, 0.1, 1], zoom: 0.6 };
}
