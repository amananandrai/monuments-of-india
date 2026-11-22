import * as THREE from 'three';
import { mat, mesh, box, cyl, at, onFace, hipRoof, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { classicalDoor, balustrade, pediment } from '../parts/colonial.js';
import { addDetails } from '../details/knesseth-eliyahoo-synagogue.js';

// The synagogue's brick under lime plaster, painted the sky blue that gave it its name; white for
// its pilasters, cornices and window surrounds; a stone base; slate grey for its tower's roof.
export const BLUE = photo(mat('#7fb3d6', 0.82), 'plaster');
export const WHITE = mat('#f2f0ea', 0.75);
export const BASE = photo(mat('#a29a8b', 0.9), 'blocks');
const SLATE = mat('#4c5560', 0.7), DIAL = mat('#f7f4ea', 0.6), HAND = mat('#1d1d1f', 0.6);

// The measures, shared with js/details/knesseth-eliyahoo-synagogue.js: the hall W wide and D deep,
// its front H high to the top of its cornice; the street front faces +z at z = 0.
export const P = { W: 22, D: 32, H: 15.4 };

// Keneseth Eliyahoo Synagogue, Kala Ghoda, Mumbai, built in 1884 by Jacob Elias Sassoon to the
// designs of Gostling and Morris. From photographs: a Neoclassical front of three storeys on a
// stone base, painted blue with its trim picked out in white; tall round-arched windows between
// white pilasters on the upper floors; a central bay, a little proud, carrying a pediment and over
// it a short tower with a clock under a slated cap; a balustrade along the roof's edge, and before
// it a forecourt behind iron railings on the street.
export function buildKnessethEliyahooSynagogue() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, D, H } = P, z0 = -D / 2;
  // The stone base, the hall and its roof behind the parapet.
  f.add(box(W + 0.6, 1.2, D + 0.6, BASE, 0, 0, z0));
  f.add(box(W, H - 1.2, D, BLUE, 0, 1.2, z0), at(hipRoof(W - 1, D - 1, 3.6, mat('#8c4630', 0.82)), 0, H, z0));
  // Floor bands and the main cornice, all round.
  for (const y of [5.4, 10.2]) f.add(box(W + 0.3, 0.35, D + 0.3, WHITE, 0, y, z0));
  f.add(box(W + 0.7, 0.6, D + 0.7, WHITE, 0, H - 0.6, z0));
  // The balustrade along the front's top.
  for (const s of [-1, 1]) f.add(at(balustrade(W / 2 - 4.4, 1.1, WHITE), s * (W / 4 + 2.2), H, 0.1));
  // The central bay: a little proud of the front, rising to a pediment, then the clock tower.
  const cb = new THREE.Group(), bw = 7.2;
  cb.add(box(bw, H - 1.2, 0.8, BLUE, 0, 1.2, 0.4), box(bw + 0.5, 0.6, 1.3, WHITE, 0, H - 0.6, 0.45));
  cb.add(at(pediment(bw + 0.6, 2.4, 1.1, BLUE, WHITE), 0, H, 0.35));
  const ty = H + 0.6, th = 5.2, tw = 3.6;
  cb.add(box(tw, th, tw, BLUE, 0, ty, -1.4), box(tw + 0.4, 0.35, tw + 0.4, WHITE, 0, ty + th, -1.4));
  for (const sx of [-1, 1]) cb.add(box(0.35, th, 0.35, WHITE, sx * (tw / 2), ty, -1.4 + tw / 2));
  cb.add(at(hipRoof(tw + 0.6, tw + 0.6, 2.6, SLATE), 0, ty + th + 0.35, -1.4), at(cyl(0.03, 0.08, 1.2, SLATE, 0, 0, 0, 8), 0, ty + th + 2.8, -1.4));
  // The clock on the tower's front.
  const r = 1.05, dial = cyl(r, r, 0.08, DIAL, 0, 0, 0, 28), rim = cyl(r + 0.14, r + 0.14, 0.06, WHITE, 0, 0, 0, 28);
  dial.rotation.x = rim.rotation.x = Math.PI / 2;
  dial.position.set(0, ty + th - 1.8, -1.4 + tw / 2 + 0.08); rim.position.set(0, ty + th - 1.8, -1.4 + tw / 2 + 0.03);
  cb.add(dial, rim);
  for (const [len, rot] of [[0.55, -0.9], [0.8, 2.3]]) { const hnd = box(0.06, len, 0.03, HAND, 0, ty + th - 1.8, -1.4 + tw / 2 + 0.13); hnd.geometry.translate(0, len / 2 - 0.05, 0); hnd.rotation.z = rot; hnd.position.y = ty + th - 1.8; cb.add(hnd); }
  f.add(mergeByMaterial(cb));
  // White pilasters on the front, from the base to the cornice.
  const pl = new THREE.Group();
  for (const x of [-W / 2 + 0.4, -bw / 2 - 1.4, bw / 2 + 1.4, W / 2 - 0.4]) pl.add(box(0.8, H - 1.8, 0.3, WHITE, x, 1.2, 0.15));
  for (const x of [-bw / 2 + 0.3, bw / 2 - 0.3]) pl.add(box(0.6, H - 1.8, 0.3, WHITE, x, 1.2, 0.95));
  f.add(mergeByMaterial(pl));
  // The windows: round-arched on the two upper floors, the tallest in the central bay; arched doors
  // on the ground floor, the main door in the middle under a cornice on brackets.
  const ws = new THREE.Group(), o = { m: BLUE, trim: WHITE, fill: 'glass', top: null, depth: 0.25, frame: 0.3 };
  const w1 = classicalDoor(1.5, 3.2, o), w2 = classicalDoor(1.5, 2.8, o), wc = classicalDoor(2.6, 6.4, { ...o, frame: 0.4 });
  for (const x of [-8.3, -5.3, 5.3, 8.3]) {
    ws.add(onFace(at(w1.clone(), 0, 6.2, 0), 0, 0.01, x), onFace(at(w2.clone(), 0, 10.9, 0), 0, 0.01, x));
    ws.add(onFace(at(classicalDoor(1.5, 3, { ...o, fill: 'door' }), 0, 1.2, 0), 0, 0.01, x));
  }
  ws.add(onFace(at(wc, 0, 6.6, 0), 0, 0.81, 0));
  ws.add(onFace(at(classicalDoor(2.4, 3.6, { m: BLUE, trim: WHITE, top: 'cornice', depth: 0.35, frame: 0.4 }), 0, 1.2, 0), 0, 0.81, 0));
  // Round-arched windows down the sides, on both upper floors.
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) for (const [w, y] of [[w1, 6.2], [w2, 10.9]]) ws.add(onFace(at(w.clone(), 0, y, 0), s * Math.PI / 2, W / 2 + 0.01, -(z0 + D / 2 - 3 - k * 5.2) * s));
  f.add(mergeByMaterial(ws));
  // A Star of David in the pediment.
  const star = new THREE.Shape();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, rr = k % 2 ? 0.34 : 0.62; (k ? star.lineTo.bind(star) : star.moveTo.bind(star))(Math.sin(a) * rr, Math.cos(a) * rr); }
  f.add(mesh(new THREE.ExtrudeGeometry(star, { depth: 0.08, bevelEnabled: false }), WHITE, 0, H + 0.95, 1.33));
  addDetails(f, g);
  // From across the street, the blue front and its clock.
  return { group: g, focus: f, view: [0.45, 0.22, 1], zoom: 0.95 };
}
