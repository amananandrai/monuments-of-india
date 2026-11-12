import * as THREE from 'three';
import { mat, at, onFace, FACES, M, box, archWall } from '../helpers.js';
import { fishPair, rosette, merlons, windowFrame, chhajja, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// The Bara Imambara, finer detail. From photographs: stucco rosettes in the spandrels between the
// arches of the long front; a crenellated parapet of merlons between the guldastas; the pair of
// fish of the Nawabs of Awadh carved over the gateway's arch; arched openings and eaves on the
// domed kiosks over the roof (the Bhool Bhulaiya); brackets under the Asfi Mosque's minaret
// balconies. Dimensions follow js/monuments/bara-imambara.js.
const LIME = mat('#e6d8b8', 0.85), LIME_DARK = mat('#cbb994', 0.85);
function architecture(f) {
  const d = new THREE.Group();
  // The great hall's range (82 × 17, front at z = 3, from y = 1.2).
  for (let k = 1; k < 12; k++) d.add(at(rosette(0.55, LIME_DARK, 8), -41 + k * (82 / 12), 1.2 + 6.9, 3.01));
  d.add(at(merlons(81, 0.8, 1, 0.3, LIME, 0.6), 0, 1.2 + 17.8, 2.75));
  // The gateway (front at z = 67, its iwan 9 wide).
  d.add(at(fishPair(3.4, LIME_DARK), -3.6, 11.4, 68.62), at(fishPair(3.4, LIME_DARK), 3.6, 11.4, 68.62));
  d.add(at(merlons(39, 0.7, 0.9, 0.3, LIME, 0.6), 0, 15.8, 66.75));
  // The roof kiosks (12 × 4 × 10 at (x, 19, -12)).
  for (const x of [-22, 0, 22]) {
    const t = at(new THREE.Group(), x, 19, -12);
    for (const a of FACES) {
      const long = Math.abs(Math.sin(a)) < 0.5;
      for (const l of long ? [-3.5, 0, 3.5] : [-2.5, 2.5]) t.add(onFace(at(windowFrame(1.4, 2.6, LIME_DARK, { frame: 0.15 }), 0, 0.4, 0), a, long ? 5 : 6, l));
      t.add(onFace(at(chhajja(long ? 12.6 : 10.6, 0.8, 0.3, 0.1, LIME_DARK), 0, 4, 0), a, long ? 5 : 6));
    }
    d.add(t);
  }
  // The Asfi Mosque's minarets: the mosque is turned a quarter round to stand at (-78, 0, 24), its
  // minarets at (±20, 3, 8) in its own frame.
  const m = at(new THREE.Group(), -78, 0, 24);
  m.rotation.y = Math.PI / 2;
  for (const x of [-20, 20]) for (let i = 1; i <= 3; i++) {
    const y = 3 + 32 * 0.04 + ((32 * 0.8 - 32 * 0.04) * i) / 3, rt = 1.6 * (1 - 0.14 * i / 3);
    m.add(placeAll(bracketGeo(0.7, rt * 0.5, 0.18), aroundCircle(rt, 10, y - 0.45).map(([px, py, pz, ry]) => [px + x, py, pz + 8, ry]), LIME));
  }
  d.add(m);
  mergeByMaterial(d);
  f.add(d);
}

// The Bara Imambara at Lucknow: the forecourt garden between the gateway and the imambara, with
// lawns, hedges and a fountain, the trees of the outer garden, and lamps along the approach.
// The Shahi Baoli, the stepwell east of the hall: a walled rectangle 20 × 42 entered through an
// arched gate at its south end, from which a broad flight of steps runs down between arcaded
// walls to the water at the far end. (The ground cannot be dug, so the well's rim stands 4.4 m
// above the lawn and a flight climbs to the gate; inside, the steps fall from there to the water.)
const BAOLI = mat('#d9cdb4', 0.85), BAOLI_DARK = mat('#bfb096', 0.85);
function baoli() {
  const g = new THREE.Group(), W = 20, L = 42, H = 4.4;
  for (const s of [-1, 1]) g.add(box(1.6, H + 1, L, BAOLI, s * (W / 2 - 0.8), 0, 0), box(2, 0.3, L + 0.4, BAOLI_DARK, s * (W / 2 - 0.8), H + 1, 0));
  g.add(box(W, H + 1, 1.6, BAOLI, 0, 0, -L / 2 + 0.8), box(W + 0.4, 0.3, 2, BAOLI_DARK, 0, H + 1, -L / 2 + 0.8));
  // The gate at the south end, and the flight up to it from the lawn.
  g.add(at(archWall(W, H + 4, 2.4, 4, 3.4, true, BAOLI), 0, H - 0.2, L / 2 - 1.2), box(W + 0.4, 0.3, 2.8, BAOLI_DARK, 0, 2 * H + 3.8, L / 2 - 1.2), box(W, H - 0.2, 2.4, BAOLI, 0, 0, L / 2 - 1.2));
  for (let k = 0; k < 11; k++) g.add(box(8, (H - 0.2) * (1 - k / 11), 0.7, BAOLI_DARK, 0, 0, L / 2 + 0.35 + k * 0.7));
  // Inside: steps down from the gate to the water, which fills the far third.
  for (let k = 0; k < 14; k++) g.add(box(W - 3.2, (H - 0.5) * (1 - k / 14), 1.6, BAOLI_DARK, 0, 0, L / 2 - 3.2 - k * 1.6));
  g.add(box(W - 3.2, 0.4, 14, M.water, 0, 0, -L / 2 + 8.6));
  // Arcades on the side walls' inner faces: a row of blind arches above the steps.
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) {
    const w = windowFrame(2.6, 3.2, BAOLI_DARK);
    w.position.set(s * (W / 2 - 1.62), H - 2.6, -L / 2 + 4 + k * 4.4);
    w.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(w);
  }
  return mergeByMaterial(g);
}

export function addDetails(f, g) {
  architecture(f);
  for (const x of [-1, 1]) g.add(box(24, 0.3, 36, M.grass, x * 22, 0, 34));
  g.add(fountains([[0, 34]], { h: 2.4 }), shrubs([...along(9, [-34, 17], [-34, 51]), ...along(9, [34, 17], [34, 51])].map(([x, z]) => [x, z, 1]), { y: 0.3 }));
  g.add(trees(scatter(20, [-110, 110, -80, 140], { seed: 3, gap: 14, avoid: [[-50, 50, -32, 72], [-100, -56, -2, 50], [-10, 10, 70, 120], [54, 96, -36, 40]] }), { kind: 'neem', seed: 3 }));
  g.add(at(baoli(), 74, 0.15, -4));
  g.add(trees([...along(5, [-12, 75], [-12, 108]), ...along(5, [12, 75], [12, 108])], { kind: 'ashoka', seed: 4 }));
  g.add(lampPosts([...along(5, [-8, 72], [-8, 110]), ...along(5, [8, 72], [8, 110])]));
  g.add(asiBoard('Bara Imambara', 10, 112, 0));
}
