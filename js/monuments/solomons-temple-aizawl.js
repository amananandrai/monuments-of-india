import * as THREE from 'three';
import { mat, mesh, box, cyl, at, photo, onFace, FACES, unitSpire } from '../helpers.js';
import { mergeByMaterial, gableRoof, arcadeScreen } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/solomons-temple-aizawl.js';

// Solomon's Temple of the Kohhran Thianghlim: white Rajasthani marble over a concrete frame, its
// windows in grey-blue glass, a small crown on the tip of each corner spire.
// Sources: en.wikipedia.org/wiki/Solomon's_Temple,_Aizawl and the photographs on Wikimedia Commons
// (File:Solomon's Temple, Aizawl.jpg and the category's views of the main front).
export const MARBLE = photo(mat('#f3f1ec', 0.5), 'marble');
export const SHADE = mat('#dcd8cf', 0.6);
export const GLASSB = mat('#4d6573', 0.2, 0.6);

// A crown h high and r in radius on y = 0: a jewelled band, a ring of eight points each with a
// ball, arches rising from them to an orb, and a cross.
export function crown(r, h, m) {
  const g = new THREE.Group();
  g.add(cyl(r, r * 0.92, h * 0.32, m, 0, 0, 0, 24), cyl(r * 1.06, r * 1.06, h * 0.06, m, 0, 0, 0, 24), cyl(r * 1.06, r * 1.06, h * 0.06, m, 0, h * 0.28, 0, 24));
  const pt = new THREE.ConeGeometry(r * 0.16, h * 0.3, 4), ball = new THREE.SphereGeometry(r * 0.09, 8, 6);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    g.add(mesh(pt, m, Math.cos(a) * r * 0.98, h * 0.47, Math.sin(a) * r * 0.98), mesh(ball, m, Math.cos(a) * r * 0.98, h * 0.65, Math.sin(a) * r * 0.98));
  }
  for (let k = 0; k < 4; k++) {
    const arc = new THREE.TorusGeometry(r * 0.8, r * 0.05, 5, 16, Math.PI);
    const o = mesh(arc, m, 0, h * 0.32, 0);
    o.rotation.y = (k / 4) * Math.PI;
    o.scale.y = 0.62;
    g.add(o);
  }
  g.add(mesh(new THREE.SphereGeometry(r * 0.2, 12, 8), m, 0, h * 0.32 + r * 0.5, 0));
  g.add(box(r * 0.08, r * 0.5, r * 0.08, m, 0, h * 0.32 + r * 0.66, 0), box(r * 0.32, r * 0.08, r * 0.08, m, 0, h * 0.32 + r * 0.95, 0));
  return g;
}

// A four-sided pyramid w by d at its foot and h high, standing on y = 0.
const SPIRE = unitSpire().toNonIndexed();
SPIRE.computeVertexNormals();
export function pyramid(w, d, h, m, x = 0, y = 0, z = 0) {
  const o = mesh(SPIRE, m, x, y, z);
  o.scale.set(w * Math.SQRT2, h, d * Math.SQRT2);
  return o;
}

// The temple's measures, shared with js/details/solomons-temple-aizawl.js. The hall is H square
// (120 ft), its walls E high to the eaves under two pitched roofs that cross, so that every face
// ends in a broad low gable G high. The Porch of Solomon, a flat-roofed verandah PD (30 ft) deep
// and VH high, runs round all four sides and carries it out to 55 m (180 ft). Through the middle
// of each gable rises a "pillar": a tower PW wide in two stages (to S1 and S2) under a steep
// pyramid SP high. A tower T square stands on each corner of the verandah, TH high to its cornice,
// under a spire TS high. It stands on a low podium P high on its ridge; the main front faces +z.
export const S = { H: 36.6, E: 10.4, G: 5.6, PD: 9.2, VH: 5.6, P: 0.8, PW: 10, S1: 19, S2: 24.5, SP: 9.5, T: 10, TH: 13.6, TS: 13.2 };

export function buildSolomonsTempleAizawl() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { H, E, G, PD, VH, P, PW, S1, S2, SP, T, TH, TS } = S, d = new THREE.Group(), W = H + 2 * PD;
  // The podium, the hall, and its two roofs crossing: marble gables under grey slopes.
  d.add(box(W + 8, P, W + 8, SHADE, 0, 0, 0), box(W + 8.4, 0.2, W + 8.4, MARBLE, 0, P - 0.2, 0));
  d.add(box(H, E, H, MARBLE, 0, P, 0));
  for (const axis of ['z', 'x']) {
    d.add(at(gableRoof(H, H, G, MARBLE, { axis }), 0, P + E, 0), at(gableRoof(H + 0.9, H - 0.5, G + 0.14, SHADE, { axis }), 0, P + E, 0));
  }
  // The verandah: a flat roof on square marble piers, twelve bays to a side.
  d.add(box(W, 0.6, W, MARBLE, 0, P + VH, 0), box(W + 0.5, 0.22, W + 0.5, SHADE, 0, P + VH + 0.6, 0));
  const ord = { m: MARBLE, trim: SHADE, fill: 'glass', top: null, depth: 0.25 };
  const rake = Math.hypot(H / 2, G), slope = Math.atan(G / (H / 2));
  for (const a of FACES) {
    const p = new THREE.Group();
    for (let k = 3; k <= 9; k++) if (Math.abs(k - 6) > 1) p.add(box(0.9, VH, 0.9, MARBLE, -W / 2 + 0.6 + k * (W - 1.2) / 12, P, W / 2 - 0.6));
    // The raking cornices of the gable, and the belt at the eaves.
    for (const s of [-1, 1]) {
      const o = at(box(rake + 0.5, 0.45, 0.8, MARBLE), s * H / 4, P + E + G / 2 - 0.1, H / 2 + 0.05);
      o.rotation.z = -s * slope;
      p.add(o);
    }
    p.add(box(H, 0.4, 0.5, SHADE, 0, P + E - 0.4, H / 2 + 0.1));
    // The pillar through the gable: two stages, each with a cornice and corner strips, under a
    // steep pyramid.
    const pz = H / 2 - 1.2;
    p.add(box(PW, S1, 5, MARBLE, 0, P, pz), box(PW + 0.5, 0.4, 5.5, SHADE, 0, P + S1 - 0.4, pz));
    p.add(box(PW - 2.8, S2 - S1, 4, MARBLE, 0, P + S1, pz), box(PW - 2.4, 0.35, 4.4, SHADE, 0, P + S2 - 0.35, pz));
    for (const s of [-1, 1]) p.add(box(0.8, S1 - 0.4, 0.3, MARBLE, s * (PW / 2 - 0.4), P, pz + 2.6), box(0.6, S2 - S1 - 0.35, 0.25, MARBLE, s * (PW / 2 - 1.7), P + S1, pz + 2.1));
    p.add(pyramid(PW - 2.8, 4, SP, MARBLE, 0, P + S2, pz));
    // The porch before the doors: a higher flat roof on piers, stepping out beyond the verandah.
    p.add(box(14, 0.7, 6.4, MARBLE, 0, P + VH + 0.5, W / 2 + 2.2), box(14.5, 0.22, 6.9, SHADE, 0, P + VH + 1.2, W / 2 + 2.2));
    for (const x of [-6.3, -2.1, 2.1, 6.3]) p.add(box(1, VH + 0.5, 1, MARBLE, x, P, W / 2 + 4.7), box(1.3, 0.5, 1.3, SHADE, x, P, W / 2 + 4.7));
    for (const s of [-1, 1]) p.add(box(1, VH + 0.5, 1, MARBLE, s * 6.3, P, W / 2 - 0.4));
    p.add(at(steps(13, P, 4, MARBLE, 0.45), 0, 0, W / 2 + 5.4));
    // Three arched doors, and four windows either side of them, in the wall behind the verandah.
    for (const x of [-4.4, 0, 4.4]) p.add(at(classicalDoor(2.6, 4.3, { m: MARBLE, trim: SHADE, top: null, depth: 0.3 }), x, P, pz + 2.5));
    for (const s of [-1, 1]) for (const x of [7.6, 10.4, 13.2, 16]) p.add(at(classicalDoor(1.7, 2.5, { ...ord, shape: 'flat' }), s * x, P + 1.1, H / 2));
    onFace(p, a, 0);
    d.add(p);
  }
  // The corner towers: piers at the verandah, two tiers of three open round arches to a face, and
  // a tall four-sided marble spire between four small pyramids.
  const tier = (TH - VH - 0.6) / 2, screen = arcadeScreen(T - 2.4, tier, 3, 1.75, 2.75, 0.6, MARBLE, { pointed: false, sill: 0.35 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const t = new THREE.Group();
    for (const cx of [-1, 1]) for (const cz of [-1, 1]) t.add(box(1.3, TH, 1.3, MARBLE, cx * (T / 2 - 0.6), P, cz * (T / 2 - 0.6)));
    for (const a of FACES) {
      for (const s of [-1, 1]) t.add(onFace(box(0.9, VH, 0.9, MARBLE, 0, P, 0), a, T / 2 - 0.55, s * 1.6));
      for (const k of [0, 1]) t.add(onFace(at(screen.clone(), 0, P + VH + 0.6 + k * tier, 0), a, T / 2 - 0.4));
    }
    for (const y of [VH + 0.6 + tier - 0.2, TH - 0.3]) t.add(box(T - 0.4, 0.3, T - 0.4, MARBLE, 0, P + y, 0));
    t.add(box(T + 0.2, 0.25, T + 0.2, SHADE, 0, P + VH + 0.5 + tier, 0), box(T + 0.5, 0.4, T + 0.5, SHADE, 0, P + TH, 0));
    t.add(box(5.6, 0.9, 5.6, MARBLE, 0, P + TH + 0.4, 0), pyramid(5.2, 5.2, TS, MARBLE, 0, P + TH + 1.3, 0));
    for (const cx of [-1, 1]) for (const cz of [-1, 1]) t.add(box(1.7, 1.5, 1.7, MARBLE, cx * (T / 2 - 0.9), P + TH + 0.4, cz * (T / 2 - 0.9)), pyramid(1.7, 1.7, 2.8, MARBLE, cx * (T / 2 - 0.9), P + TH + 1.9, cz * (T / 2 - 0.9)));
    // Small gablets round the foot of the spire, and the crown on its tip.
    for (const a of FACES) for (const s of [-1, 1]) t.add(onFace(pyramid(1.3, 1, 1.9, MARBLE, 0, P + TH + 1.3, 0), a, 2.2, s * 1.1));
    t.add(cyl(0.12, 0.2, 0.5, SHADE, 0, P + TH + 1.3 + TS - 0.3, 0, 8), at(crown(0.42, 0.8, SHADE), 0, P + TH + 1.5 + TS, 0));
    d.add(at(t, sx * (W - T) / 2, 0, sz * (W - T) / 2));
  }
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the north-east, below the ridge: the main porch under its pillar, between two spires.
  return { group: g, focus: f, view: [0.45, 0.16, 1], zoom: 0.62 };
}
