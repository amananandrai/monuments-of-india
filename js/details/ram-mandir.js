import * as THREE from 'three';
import { M, mesh, box, at, onFace, flag, mat, FACES, nagaraProfile, steppedPlan, planBand, shikhara, pidaRoof, bell, kalash } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, placeAll, mergeByMaterial, chhajja, railing } from './components.js';
import { carvedPillar } from './temples.js';
import { templeDoorway } from './doorways.js';
import { miniSpireGeo } from './sculpture.js';
import { trees, lampPosts, garland, along } from './realism.js';

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
export const HALLS = [
  [0, -3, 24, 6, []],
  [-17, -3, 10, 4, [-Math.PI / 2]],
  [17, -3, 10, 4, [Math.PI / 2]],
  [0, 17, 18, 5, SIDE],
  [0, 33, 14, 4, [0, ...SIDE]],
];

// A cusped (five-lobed) arch between two pillars: a panel aw wide hanging h down from y = 0, the
// opening cut in its lower edge, t thick and centred on z = 0. Shared by every bay of a width.
const archCache = new Map();
function cuspedArchGeo(aw, h, t = 0.3) {
  const key = `${aw.toFixed(3)}:${h}`;
  if (!archCache.has(key)) {
    const r = aw / 2, rise = h * 0.72, N = 30, s = new THREE.Shape();
    s.moveTo(-r, -h); s.lineTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, -h);
    // Round from the right springing over the crown to the left: the radius dips to a cusp at each
    // fifth of the way and swells into a lobe between.
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI, q = r * (1 - 0.14 * (1 - Math.abs(Math.sin(5 * a))));
      s.lineTo(q * Math.cos(a), -h + (q / r) * rise * Math.sin(a));
    }
    s.closePath();
    archCache.set(key, new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }).translate(0, 0, -t / 2));
  }
  return archCache.get(key);
}

// Small spires on the corners of each tier of a stepped roof made by pidaRoof(w0, w1, n, u).
function tierSpires(w0, w1, n, u, y0, s = 0.75) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const w = w0 + (w1 - w0) * (i / Math.max(1, n - 1)), c = w / 2 - 0.4;
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) list.push([sx * c, y0 + i * u * 1.55 + u, sz * c, 0, s]);
  }
  return list;
}

// A hall of three storeys, w square, its foot at y = 0. On each floor a gallery of carved pillars
// round a solid core, a cusped arch in each bay, the beam and floor above, and a chhajja round the
// outside; a balustrade between the pillars of the upper floors. Doors open on the ground floor on
// the faces in `doors`. Where the hall meets another (`others`: [x, z, half-width] in the frame
// that x0, z0 place this hall in), it has no pillars, arches or balustrade. Roofed by a spire of
// `roofs` stepped tiers with a bell stone and kalash.
export function hall(w, roofs, m, sh, { doors = [], others = [], x0 = 0, z0 = 0 } = {}) {
  const g = new THREE.Group(), carved = new THREE.Group(), arches = [];
  const n = Math.max(3, Math.round(w / 2.6)), step = (w - 1.2) / n, e = w / 2 - 0.6, ph = F - 1;
  const free = (x, z) => !others.some(([ox, oz, oh]) => Math.abs(x0 + x - ox) < oh + 1 && Math.abs(z0 + z - oz) < oh + 1);
  const isDoor = (a) => doors.some((d) => Math.abs(Math.atan2(Math.sin(d - a), Math.cos(d - a))) < 0.01);
  const dh = Math.min(4.4, Math.max(1.6, F * 0.55));
  const gap = templeDoorway(dh * 0.5, dh, { m, guardians: false }).userData.outerW / 2 + 0.3;
  const on = (a, t) => [Math.sin(a) * e + Math.cos(a) * t, Math.cos(a) * e - Math.sin(a) * t];
  g.add(box(w - 3, 3 * F, w - 3, sh));
  for (let f = 0; f < 3; f++) {
    const y = f * F, seen = new Set();
    for (const a of FACES) {
      const door = f === 0 && isDoor(a);
      for (let i = 0; i <= n; i++) {
        const t = -e + i * step, [x, z] = on(a, t), key = `${x.toFixed(2)},${z.toFixed(2)}`;
        if (!seen.has(key) && free(x, z) && !(door && Math.abs(t) < gap)) carved.add(at(carvedPillar(ph, m), x, y, z));
        seen.add(key);
        if (i === n) continue;
        const tm = t + step / 2, [bx, bz] = on(a, tm);
        if (!free(bx, bz) || (door && Math.abs(tm) < gap)) continue;
        arches.push([bx, y + ph, bz, a]);
        if (f) carved.add(onFace(at(railing(step - 0.95, 1, 0.2, m, 2), 0, y, 0), a, e, tm));
      }
    }
    g.add(box(w - 0.2, 1, w - 0.2, m, 0, y + ph));
    for (const a of FACES) carved.add(onFace(at(chhajja(w + 2.2, 1.1, 0.45, 0.14, m), 0, y + F - 0.2, 0), a, w / 2 - 0.1));
  }
  carved.add(placeAll(cuspedArchGeo(step - 0.9, 1.5), arches, m));
  for (const a of doors) carved.add(onFace(templeDoorway(dh * 0.5, dh, { m, guardians: false }), a, (w - 3) / 2));
  // The roof: a parapet course, the stepped spire with its corner spires, bell stone and kalash.
  const y = 3 * F + 0.7, w0 = w * 0.9, w1 = w * 0.36, u = 0.85;
  g.add(box(w + 0.4, 0.7, w + 0.4, sh, 0, 3 * F));
  const roof = pidaRoof(w0, w1, roofs, u, m, sh);
  g.add(at(roof, 0, y, 0));
  carved.add(placeAll(miniSpireGeo(), tierSpires(w0, w1, roofs, u, y, 0.9 + w * 0.02), m));
  const ry = y + roof.userData.top;
  g.add(at(bell(w * 0.15, m), 0, ry, 0), at(kalash(w * 0.1), 0, ry + w * 0.15, 0));
  g.add(mergeByMaterial(carved));
  return g;
}

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
// a small stepped spire over each front bay. Its foot at y = 0.
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

// The paved parikrama round the plinth with lawns beyond it, saffron flags, lamps, and garlands
// across the entrance porch.
export function addDetails(g) {
  architecture(g);
  g.add(box(160, 0.2, 200, M.path, 0, -0.2, 0));
  for (const s of [-1, 1]) g.add(box(40, 0.3, 160, M.grass, s * 64, -0.15, 0));
  for (const [x, z] of [[-15, -41], [15, -41], [-25, 5], [25, 5]]) g.add(at(flag(8, SAFFRON), x, P, z));
  g.add(lampPosts([...along(8, [-34, -60], [-34, 90]), ...along(8, [34, -60], [34, 90])]));
  g.add(trees([...along(8, [-82, -90], [-82, 90]), ...along(8, [82, -90], [82, 90])], { kind: 'ashoka', seed: 6 }));
  g.add(garland([-5, P + 3.7, 43.7], [5, P + 3.7, 43.7], { sag: 0.6, strands: 3 }));
}
