import * as THREE from 'three';
import { M, mesh, box, at, onFace, flag, mat, FACES, nagaraProfile, steppedPlan, planBand, shikhara, pidaRoof, kalash } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, mergeByMaterial, chhajja, cuspedArchGeo } from './components.js';
import { carvedPillar, storeyedHall, nagaraTemple, trabeateGate, wallWithGaps } from './temples.js';
import { trees, lampPosts, garland, along } from './realism.js';
import { detail } from '../detail.js';

// The Ram Mandir, from the published design and photographs and renderings of the finished
// temple (Nagara style, in pink Bansi Paharpur sandstone). It stands on a plinth P high (21 ft) and
// rises three storeys of about 20 ft. Its five halls (mandaps) are galleries of carved pillars, 392
// in all on the real temple, with a cusped arch between each pair, a sloping eave (chhajja) over
// each floor and, on the upper floors, the pierced balustrades of the balconies that run round the
// building. Each hall is roofed by its own stepped spire (samvarana) set with small spires at the
// corners of its tiers. The sanctum's walls carry images of deities in niches on every floor, and
// its spire is wrapped in smaller spires (urushringas). An arched porch stands at the head of the
// 32-step stair on the east.
export const P = 6.5, F = 5.5, SANCTUM = [0, -26, 22];
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });

// The plinth's plan: narrow round the sanctum at the back, widest across the two side halls (the
// Kirtan and Prarthana mandaps), then stepping in round the middle hall and again round the
// entrance hall, where the stair comes down. Every outer corner is cut back in two offsets.
// grow: how far a tier stands out from the top one.
const PLAN = [[-44, 18], [-14, 28], [8, 15], [28, 12], [44]];
export const plinthPlan = (grow = 0) => steppedPlan(PLAN, { grow, cut: 1.2 });

// The halls: [x, z, width, tiers of roof, faces with doors (0 = +z, the front)]. From the back: the
// Gudh (Sabha) mandap before the sanctum, the Kirtan and Prarthana mandaps at its sides, the Rang
// mandap and the Nritya mandap at the entrance.
const SIDE = [Math.PI / 2, -Math.PI / 2];
// Each hall is three storeys of F (js/details/temples.js, storeyedHall).
export const hall = (w, roofs, m, sh, opts) => storeyedHall(w, roofs, m, sh, { floors: 3, F, ...opts });
export const HALLS = [
  [0, -3, 24, 6, []],
  [-17, -3, 10, 4, [-Math.PI / 2]],
  [17, -3, 10, 4, [Math.PI / 2]],
  [0, 17, 18, 5, SIDE],
  [0, 33, 14, 4, [0, ...SIDE]],
];

// The sanctum (garbhagriha), 22 square and three storeys, its foot at y = 0: moulded courses and a
// chhajja at every floor, niches with images on the three faces that stand free, and the main
// spire, 13 wide at its foot, ringed by four spires against its faces, four on its corners and four
// smaller ones beyond, so that it rises out of a cluster of peaks. Its kalash is at 49 m.
export function sanctum(m, sh) {
  const g = new THREE.Group(), d = new THREE.Group(), W = SANCTUM[2];
  g.add(box(W, 3 * F, W, m));
  for (let f = 0; f < 3; f++) {
    const y = f * F;
    d.add(mouldings(W, W, [[y, 0.5, 0.3, sh], [y + 0.5, 0.4, 0.12, frieze(m)], [y + F - 1.1, 0.6, 0.1, frieze(m)]], m));
    for (const a of FACES) d.add(onFace(at(chhajja(W + 2.2, 1.1, 0.45, 0.14, m), 0, y + F - 0.2, 0), a, W / 2));
    for (const a of [Math.PI, ...SIDE]) for (const lat of [-6, 0, 6]) {
      d.add(onFace(at(templeNiche(lat ? 1.4 : 2, lat ? 2.6 : 3.3, m, { figure: idol(lat ? 2.2 : 2.8, m) }), 0, y + 1.1, 0), a, W / 2, lat));
    }
  }
  const y0 = 3 * F + 1;
  g.add(box(W + 2, 1, W + 2, sh, 0, 3 * F));
  const main = shikhara(13, 17.7, m, nagaraProfile, 18);
  g.add(at(main, 0, y0, 0), at(flag(7, M.saffron), 0, y0 + main.userData.top - 1, 0));
  for (const a of FACES) {
    g.add(onFace(at(shikhara(7.5, 10.5, m, nagaraProfile, 12), 0, y0, 0), a, 5.4));
    g.add(onFace(at(shikhara(4.5, 5.5, m, nagaraProfile, 7), 0, y0, 0), a, 9.4));
    const corner = onFace(at(shikhara(5, 6.5, m, nagaraProfile, 8), 0, y0, 0), a + Math.PI / 4, 10.2);
    corner.rotation.y = 0;
    g.add(corner);
  }
  // Ribbed amalaka stones on the corners of the main spire, marking its storeys.
  const am = new THREE.SphereGeometry(1, 16, 6);
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = 13 * nagaraProfile(t), yk = y0 + t * 17.7, r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, m, sx * wt * 0.42, yk, sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  g.add(mergeByMaterial(d));
  return g;
}

// The porch at the head of the stair, before the Nritya mandap's door (its pillars at z = 39.4):
// three cusped arches on four pillars across the front at z = 43, one at each side, a chhajja, and
// a small stepped spire over each front bay; with the two piers either side (x = ±6.7, z 40.4 to
// 43.8) it is the Singh Dwar, the gatehouse at the head of the stair. Its foot at y = 0.
export function porch(m, sh) {
  const g = new THREE.Group(), c = new THREE.Group(), ph = F - 1, z = 43, xs = [-5, -1.7, 1.7, 5];
  for (const x of xs) c.add(at(carvedPillar(ph, m), x, 0, z));
  const arches = [];
  for (let k = 0; k < 3; k++) arches.push([(xs[k] + xs[k + 1]) / 2, ph, z, 0, xs[k + 1] - xs[k] - 0.9]);
  c.add(...arches.map(([x, y, zz, a, aw]) => at(mesh(cuspedArchGeo(aw, 1.5), m), x, y, zz)));
  for (const s of [-1, 1]) {
    const o = mesh(cuspedArchGeo(3.6 - 0.9, 1.5), m, s * 5, ph, 41.2);
    o.rotation.y = s * Math.PI / 2;
    c.add(o);
    const ch = chhajja(4.8, 1, 0.4, 0.14, m);
    ch.rotation.y = s * Math.PI / 2;
    c.add(at(ch, s * 5.7, F - 0.2, 41.3));
  }
  g.add(box(11.4, 1, 4.6, m, 0, ph, 41.3));
  c.add(at(chhajja(13.4, 1, 0.4, 0.14, m), 0, F - 0.2, 43.6));
  for (const x of [-3.35, 0, 3.35]) {
    const r = pidaRoof(3.4, 1.4, 3, 0.55, m, sh);
    g.add(at(r, x, F, 41.4), at(kalash(0.7), x, F + r.userData.top, 41.4));
  }
  // The Singh Dwar: the porch is the passage of a gatehouse, between two solid piers that rise above
  // its roof, each with a niche and image on its front, a cornice and a small spire.
  for (const s of [-1, 1]) {
    const x = s * 6.7, ph2 = F + 2.2;
    g.add(box(1.6, ph2, 3.4, sh, x, 0, 42.1), box(2, 0.4, 3.8, m, x, ph2, 42.1));
    c.add(at(templeNiche(0.8, 1.8, m, { figure: idol(1.5, m) }), x, 1.6, 43.8));
    const sp = shikhara(1.6, 2.6, m, nagaraProfile, 6);
    g.add(at(sp, x, ph2 + 0.4, 42.1));
  }
  g.add(mergeByMaterial(c));
  return g;
}

// Carved bands round the three tiers of the plinth, following its offsets.
function architecture(g) {
  const d = new THREE.Group(), m = M.pink, sh = M.pinkShade;
  d.add(planBand(plinthPlan(4), 0.7, 0.6, 0.05, frieze(sh)), planBand(plinthPlan(2), 2.6, 0.7, 0.05, frieze(m)), planBand(plinthPlan(0), 4.8, 0.9, 0.05, frieze(sh)));
  mergeByMaterial(d);
  g.add(d);
}

// The parkota, the rectangular enclosure round the temple: a walled cloister KX either side of the
// axis, from z = KZ0 behind to KZ1 in front, its wall W thick under a cornice, open on the east
// through a gate on post-and-lintel lines. At its corners, on raised platforms, the four shrines of
// Surya, Bhagwati, Ganesh and Shiva, each a single cell under its own spire (not the main temple's
// three storeys), facing across the court.
export const KX = 52, KZ0 = -72, KZ1 = 80;
export function parkota(m, sh) {
  const g = new THREE.Group(), W = 4, H = 5.5, len = KZ1 - KZ0, cz = (KZ0 + KZ1) / 2;
  g.add(box(KX * 2 + W, H, W, m, 0, 0, KZ0), wallWithGaps('x', KX * 2 + W, H, W, m, [[0, 22]], 0, KZ1));
  for (const s of [-1, 1]) g.add(box(W, H, len, m, s * KX, 0, cz));
  for (const s of [-1, 1]) g.add(box(KX * 2 + W + 0.8, 0.5, W + 0.8, sh, 0, H, s > 0 ? KZ1 : KZ0), box(W + 0.8, 0.5, len, sh, s * KX, H, cz));
  const gate = new THREE.Group();
  gate.add(trabeateGate(22, 9, 6, 7, 6.5, { m, trim: sh, guardians: !detail.low }));
  const r = pidaRoof(20, 8, 4, 0.8, m, sh);
  gate.add(at(r, 0, 9, 0), at(kalash(1.2), 0, 9 + r.userData.top, 0));
  g.add(at(gate, 0, 0, KZ1));
  for (const sx of [-1, 1]) for (const sz of [KZ0, KZ1]) {
    const x = sx * KX, sp = new THREE.Group();
    sp.add(box(13, 2, 13, sh), nagaraTemple({ w: 6, h: 10, m, shade: sh, plinth: 0.8, urus: detail.low ? 0 : 4, uruScale: 0.45, halls: [], apron: 2, base: null }).translateY(2));
    // Facing across the court towards the temple's axis, square to the walls (js/coplanar.js only
    // separates faces of axis-aligned parts).
    sp.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(at(sp, x, 0, sz));
  }
  return g;
}

// The paved parikrama round the plinth with lawns beyond it, lamps and trees (in g), and on the
// temple (f) the carved plinth bands, saffron flags and garlands across the entrance porch.
export function addDetails(f, g) {
  architecture(f);
  g.add(box(160, 0.2, 200, M.path, 0, -0.2, 0));
  for (const s of [-1, 1]) g.add(box(40, 0.3, 160, M.grass, s * 64, -0.15, 0));
  for (const [x, z] of [[-15, -41], [15, -41], [-25, 5], [25, 5]]) f.add(at(flag(8, SAFFRON), x, P, z));
  g.add(lampPosts([...along(8, [-34, -60], [-34, 70]), ...along(8, [34, -60], [34, 70])]));
  g.add(trees([...along(8, [-82, -90], [-82, 90]), ...along(8, [82, -90], [82, 90])], { kind: 'ashoka', seed: 6 }));
  f.add(garland([-5, P + 3.7, 43.7], [5, P + 3.7, 43.7], { sag: 0.6, strands: 3 }));
}
