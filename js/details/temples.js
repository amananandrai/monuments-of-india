import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, rng, steppedPlan, planPrism, planBand, shikhara, pidaRoof, bell, kalash, flag, onionDome, nagaraProfile, PAINT, unitBox } from '../helpers.js';
import { frieze, mergeByMaterial, mouldings, templeNiche, pilasters, idol, placeAll, chhajja, railing, cuspedArchGeo } from './components.js';
import { templeDoorway, templePorch, steps, grandStair, doorFrame, doorLeaves, guardian } from './doorways.js';
import { lion } from './animals.js';
import { figureGeo, kutaGeo, kuduGeo, instances, figureFrieze, miniSpireGeo } from './sculpture.js';

// The shared temple builders, with real entrances: a Nagara temple's front porch, doorway and
// side doors, a mandapa's doors, and a passage through the base of a gopuram. Moved here from
// helpers.js, since they use the doorway parts in js/details/doorways.js.

// A door opening for a wall `wallH` high: about half the wall, at most 4.4 m, half as wide as tall.
function doorSize(wallH) {
  const h = Math.min(4.4, Math.max(1.6, wallH * 0.55));
  return { w: h * 0.5, h };
}

// The Maratha-era Bhumija spire (Mahakaleshwar, Trimbakeshwar): on each face a central band climbs to the top, and the quarters
// between the bands are filled with rows of miniature spires, one row to each storey, diminishing
// upward. The spire is base w, height h, its foot at y = 0; prof is its taper.
export function bhumijaRows(w, h, prof, rows = 9) {
  const list = [];
  for (let i = 0; i < rows; i++) {
    const t = (i + 0.3) / rows, ww = w * prof(t), y = t * h, s = ww * 0.13;
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const lat of [-0.37, 0.37]) {
      const c = Math.cos(a), sn = Math.sin(a), d = ww * 0.42 + s * 0.3, l = lat * ww;
      list.push([sn * d + c * l, y, c * d - sn * l, s, s * 1.5, s, a]);
    }
  }
  return list;
}
// Returned as [x, y, z, sx, sy, sz, ry] for instances(miniSpireGeo(), …), about the spire's axis.

// A North Indian (Nagara) temple along the z axis: the sanctum and its curved spire at z = 0,
// with halls (mandapas) stepping out towards +z. halls: [[width, wallHeight, roofTiers, 'pida' | 'dome']].
// The plinth is `apron` wider than the sanctum, so a broad hall can stand on it with room for side doors.
// friezeSpacing widens the spacing of the carved figures in the friezes (2 for phones: half as many).
// The front hall opens through a porch and a stepped doorway at the head of the stairs; the first
// hall has doors on both sides; a temple with no hall has its doorway in the sanctum.
// halls: [width, height, roof tiers, 'pida' or 'dome', storeys]. A hall of more than one storey is
// built by storeyedHall: floors of pillared galleries with cusped arches and balconies.
// base: the plinth follows the plan, apron / 2 out from the sanctum and each hall, in `tiers` tiers
// each standing further out, its outer corners cut back in two steps of `cut`, with carved bands;
// null for a single rectangular block. stair: options for the grandStair up the front (about 0.2 m
// to a step, side walls; foot, mid, top for its guardians); null for plain steps.
export function nagaraTemple({
  w = 12, h = 22, m, shade = m, spireM = m, plinth = 2, urus = 4, uruScale = 0.5,
  halls = [[14, 8, 4]], prof = nagaraProfile, flagM = M.saffron, hallM = m, crown = null, apron = 8, friezeSpacing = 1,
  base = { tiers: 2, cut: 0.8 }, stair = {},
} = {}) {
  const g = new THREE.Group();
  const sw = w * 1.15;
  g.add(box(sw, w * 0.7, sw, m, 0, plinth, 0));
  const sy = plinth + w * 0.7;
  const spire = shikhara(w, h, spireM, prof, 16);
  g.add(at(spire, 0, sy, 0), at(crown || flag(Math.max(3, w * 0.45), flagM), 0, sy + spire.userData.top - 0.5, 0));
  const ring = (n, dist, scale, hs) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (n === 4 ? 0 : Math.PI / n);
      g.add(onFace(at(shikhara(w * scale, h * hs, spireM, prof, 10), 0, sy, 0), a, dist));
    }
  };
  if (urus >= 4) ring(4, w * 0.5, uruScale, 0.62);
  if (urus >= 8) ring(4, w * 0.72, uruScale * 0.62, 0.38);
  let z = sw / 2;
  const placed = [];
  for (const [hw, hh, tiers, kind = 'pida', storeys = 1] of halls) {
    z += hw / 2;
    placed.push({ hw, hh, zc: z, tiers, storeys, F: Math.max(4, hh * 0.65) });
    if (storeys > 1) { z += hw / 2; continue; }
    g.add(box(hw, hh, hw, hallM, 0, plinth, z), box(hw + 0.8, 0.6, hw + 0.8, shade, 0, plinth + hh, z));
    const ry = plinth + hh + 0.6;
    if (kind === 'dome') {
      g.add(cyl(hw * 0.36, hw * 0.36, hw * 0.12, hallM, 0, ry, z, 24), at(onionDome(hw * 0.36, spireM), 0, ry + hw * 0.12, z), at(kalash(hw * 0.12), 0, ry + hw * 0.12 + hw * 0.65, z));
    } else {
      const r = pidaRoof(hw * 0.95, hw * 0.4, tiers, Math.max(0.6, hw * 0.06), hallM, shade);
      g.add(at(r, 0, ry, z), at(bell(hw * 0.18, hallM), 0, ry + r.userData.top, z), at(kalash(hw * 0.12), 0, ry + r.userData.top + hw * 0.18, z));
    }
    z += hw / 2;
  }
  const a = apron / 2;
  if (base) {
    // The plan: the sanctum's block (barely clear of its back wall), then each hall's; the front
    // hall's runs on 6 to the head of the stair.
    const T = base.tiers ?? 2, step = Math.min(1.2, Math.max(0.3, plinth * 0.35)), th = plinth / T;
    const profile = [[-sw / 2 - Math.min(a, 1.5), sw / 2 + a], ...placed.map(({ hw, zc }) => [zc - hw / 2, hw / 2 + a]), [z + 6]];
    const plan = (grow) => steppedPlan(profile, { grow, cut: base.cut ?? 0.8 });
    for (let k = 0; k < T; k++) {
      const grow = (T - 1 - k) * step;
      g.add(planPrism(plan(grow), k * th, th, shade));
      if (th >= 0.6) g.add(planBand(plan(grow), k * th + th * 0.3, th * 0.35, 0.05, frieze(shade)));
    }
  } else g.add(box(sw + apron, plinth, z + sw / 2 + 6, shade, 0, 0, (z - sw / 2) / 2 + 3));

  const e = new THREE.Group(), half = base && placed.length ? placed[0].hw / 2 + a : (sw + apron) / 2;
  let stairW = 6;
  if (placed.length) {
    // The main entrance: a porch in front of the front hall, with the doorway at its back.
    const last = placed[placed.length - 1], { hw } = last, hh = last.storeys > 1 ? last.F : last.hh, ds = doorSize(hh);
    const door = templeDoorway(ds.w, ds.h, { m: hallM });
    if (last.storeys === 1) e.add(at(door, 0, plinth, z));
    if (hw >= 9) {
      const pw = Math.min(hw - 1, Math.max(7.6, door.userData.outerW + 2.4));
      e.add(at(templePorch(pw, 4.2, Math.min(hh - 0.3, door.userData.outerH + 0.9), hallM, shade), 0, plinth, z));
      stairW = Math.max(6, pw * 0.75);
    }
    // Side doors into the first hall, with steps down from the plinth, where there is room.
    const first = placed[0], room = half - first.hw / 2;
    if (room >= 1.4) {
      const sd = doorSize(first.hh * 0.85);
      for (const s of [-1, 1]) if (first.storeys > 1) {
        const st = steps(4, plinth, Math.max(2, Math.ceil(plinth / 0.42)), shade);
        st.position.set(s * half, 0, first.zc);
        st.rotation.y = (s * Math.PI) / 2;
        e.add(st);
      } else {
        const side = templeDoorway(sd.w, sd.h, { m: hallM, guardians: false, depth: Math.min(1.1, room - 0.3) });
        side.position.set(s * first.hw / 2, plinth, first.zc);
        side.rotation.y = (s * Math.PI) / 2;
        e.add(side);
        const st = steps(side.userData.outerW + 0.6, plinth, Math.max(2, Math.ceil(plinth / 0.42)), shade);
        st.position.set(s * half, 0, first.zc);
        st.rotation.y = (s * Math.PI) / 2;
        e.add(st);
      }
    }
  } else {
    // A small shrine with no hall: the doorway is in the sanctum itself.
    const ds = doorSize(w * 0.7);
    e.add(at(templeDoorway(ds.w, ds.h, { m, guardians: w >= 7, hood: true }), 0, plinth, sw / 2));
  }
  if (stair) e.add(at(grandStair(plinth, stairW, shade, m, { cheek: Math.min(0.9, 0.25 + plinth * 0.25), ...stair }), 0, 0, z + 6));
  else e.add(at(steps(stairW, plinth, Math.max(3, Math.ceil(plinth / 0.42)), shade, 0.45), 0, 0, z + 6));
  g.add(mergeByMaterial(e));
  if (placed.length) g.add(sanctumDetail(w, h, sw, plinth, prof, m, shade, spireM, friezeSpacing));
  // A band of carved figures along each side of every hall, parted round the side doors.
  // Halls of more than one storey, with doors on the faces that open: the front of the front hall and
  // the sides of the first, where it has side steps.
  placed.forEach(({ hw, zc, tiers, storeys, F }, i) => {
    if (storeys === 1) return;
    const doors = [...(i === placed.length - 1 ? [0] : []), ...(i === 0 && half - hw / 2 >= 1.4 ? [Math.PI / 2, -Math.PI / 2] : [])];
    const others = [[0, 0, sw / 2], ...placed.filter((_, k) => k !== i).map((p) => [0, p.zc, p.hw / 2])];
    g.add(at(storeyedHall(hw, Math.max(3, tiers), hallM, shade, { floors: storeys, F, doors, others, z0: zc }), 0, plinth, zc));
  });
  placed.forEach(({ hw, hh, zc, storeys }, i) => {
    if (storeys > 1) return;
    const fh = Math.min(1.2, hh * 0.16), gapW = i === 0 && half - hw / 2 >= 1.4 ? Math.max(3, doorSize(hh * 0.85).w * 2.4) : 0;
    for (const s of [-1, 1]) for (const [z0, z1] of gapW ? [[zc - hw / 2 + 0.3, zc - gapW / 2], [zc + gapW / 2, zc + hw / 2 - 0.3]] : [[zc - hw / 2 + 0.3, zc + hw / 2 - 0.3]]) {
      if (z1 - z0 < 1.5) continue;
      const fr = figureFrieze(z1 - z0, fh, hallM, { pitch: fh * 0.75 * friezeSpacing, kinds: ['standing', 'dancer'] });
      fr.position.set(s * hw / 2, plinth + hh * 0.62, (z0 + z1) / 2);
      fr.rotation.y = (s * Math.PI) / 2;
      g.add(fr);
    }
  });
  g.userData.length = z;
  return g;
}

// The finer detail of a Nagara sanctum (its front face hidden by the first hall): the mouldings of
// its base (khura, kumbha and kalasha, stepping in as they rise), a band across the wall and a
// cornice under the spire; a niche on each outer face with an image in it, and smaller empty niches
// either side on a large temple; and the ribbed amalaka stones (bhumi-amalakas) on the corners of
// the spire, one at each of its storeys.
function sanctumDetail(w, h, sw, plinth, prof, m, shade, spireM, friezeSpacing = 1) {
  const d = new THREE.Group(), wh = w * 0.7, u = Math.max(0.12, w * 0.018);
  d.add(at(mouldings(sw, sw, [[0, 2 * u, 2 * u, shade], [2 * u, 1.5 * u, 1.4 * u], [3.5 * u, u, 0.9 * u, shade], [wh * 0.8, u, 0.7 * u], [wh - 1.6 * u, 1.6 * u, 2 * u, shade]], m), 0, plinth, 0));
  const nw = sw * 0.17, nh = wh * 0.42, ny = plinth + wh * 0.24;
  // A band of carved figures round the foot of the wall, under the niches.
  const fh = Math.min(1.1, wh * 0.2 - 4.6 * u);
  if (fh > 0.45) for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) d.add(onFace(at(figureFrieze(sw - 0.6, fh, m, { pitch: fh * 0.75 * friezeSpacing, kinds: ['standing', 'dancer', 'standing', 'musician'] }), 0, plinth + 4.6 * u, 0), a, sw / 2));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    d.add(onFace(at(templeNiche(nw, nh, m, { figure: guardian(nh * 0.88, m) }), 0, ny, 0), a, sw / 2));
    if (sw > 10) for (const s of [-1, 1]) d.add(onFace(at(templeNiche(nw * 0.6, nh * 0.62, m), 0, ny + nh * 0.12, 0), a, sw / 2, s * sw * 0.32));
  }
  const sy = plinth + wh, am = new THREE.SphereGeometry(1, 16, 6);
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = w * prof(t), y = sy + t * h, r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const o = mesh(am, spireM, sx * wt * 0.42, y, sz * wt * 0.42);
      o.scale.set(r, r * 0.42, r);
      d.add(o);
    }
  }
  return mergeByMaterial(d);
}

// A carved temple pillar h tall: a square base block, an octagonal shaft girdled by two carved
// bands, a cushion and a square capital.
export function carvedPillar(h, m) {
  const g = new THREE.Group();
  g.add(box(0.95, h * 0.12, 0.95, m), cyl(0.38, 0.42, h * 0.76, m, 0, h * 0.12, 0, 8));
  for (const t of [0.34, 0.6]) g.add(cyl(0.47, 0.47, h * 0.07, frieze(m), 0, h * t, 0, 8));
  g.add(cyl(0.5, 0.36, h * 0.06, m, 0, h * 0.88, 0, 8), box(0.95, h * 0.06, 0.95, m, 0, h * 0.94));
  return g;
}

// A pillared hall: a solid core inside a ring of columns, a slab and a stepped roof with a bell and
// kalash. doors: the faces (0 = +z, as onFace) that open, each with a doorway in the core and a gap
// in the columns in front of it.
export function mandap(w, h, roofCount, m, shade, doors = []) {
  const g = new THREE.Group();
  g.add(box(w - 3, h, w - 3, shade));
  const ds = doorSize(h), probe = templeDoorway(ds.w, ds.h, { m, guardians: false });
  const gap = probe.userData.outerW / 2 + 0.3;
  const n = Math.max(3, Math.round(w / 2.6)), cols = new THREE.Group();
  for (let i = 0; i <= n; i++) {
    const t = -w / 2 + 0.6 + (i / n) * (w - 1.2);
    for (const [x, z, a] of [[t, w / 2 - 0.6, 0], [t, -w / 2 + 0.6, Math.PI], [w / 2 - 0.6, t, Math.PI / 2], [-w / 2 + 0.6, t, -Math.PI / 2]]) {
      if (doors.some((d) => Math.abs(Math.atan2(Math.sin(d - a), Math.cos(d - a))) < 0.01) && Math.abs(t) < gap) continue;
      cols.add(at(carvedPillar(h, m), x, 0, z));
    }
  }
  g.add(mergeByMaterial(cols));
  if (doors.length) {
    const e = new THREE.Group();
    for (const a of doors) e.add(onFace(templeDoorway(ds.w, ds.h, { m, guardians: false }), a, (w - 3) / 2));
    g.add(mergeByMaterial(e));
  }
  g.add(box(w + 1, 1, w + 1, m, 0, h));
  const roof = pidaRoof(w * 0.92, w * 0.42, roofCount, 0.9, m, shade);
  g.add(at(roof, 0, h + 1, 0));
  const ry = h + 1 + roof.userData.top;
  g.add(at(bell(w * 0.2, m), 0, ry, 0));
  g.add(at(kalash(w * 0.12), 0, ry + w * 0.2, 0));
  return g;
}

// Small spires on the corners of each tier of a stepped roof made by pidaRoof(w0, w1, n, u).
export function tierSpires(w0, w1, n, u, y0, s = 0.75) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const w = w0 + (w1 - w0) * (i / Math.max(1, n - 1)), c = w / 2 - 0.4;
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) list.push([sx * c, y0 + i * u * 1.55 + u, sz * c, 0, s]);
  }
  return list;
}

// A hall of `floors` storeys, each F high, w square, its foot at y = 0. On each floor a gallery of carved pillars
// round a solid core, a cusped arch in each bay, the beam and floor above, and a chhajja round the
// outside; a balustrade between the pillars of the upper floors. Doors open on the ground floor on
// the faces in `doors`. Where the hall meets another (`others`: [x, z, half-width] in the frame
// that x0, z0 place this hall in), it has no pillars, arches or balustrade. Roofed by a spire of
// `roofs` stepped tiers with a bell stone and kalash.
export function storeyedHall(w, roofs, m, sh, { floors = 3, F = 5.5, doors = [], others = [], x0 = 0, z0 = 0 } = {}) {
  const g = new THREE.Group(), carved = new THREE.Group(), arches = [];
  const n = Math.max(3, Math.round(w / 2.6)), step = (w - 1.2) / n, e = w / 2 - 0.6, ph = F - 1;
  const free = (x, z) => !others.some(([ox, oz, oh]) => Math.abs(x0 + x - ox) < oh + 1 && Math.abs(z0 + z - oz) < oh + 1);
  const isDoor = (a) => doors.some((d) => Math.abs(Math.atan2(Math.sin(d - a), Math.cos(d - a))) < 0.01);
  const dh = Math.min(4.4, Math.max(1.6, F * 0.55));
  const gap = templeDoorway(dh * 0.5, dh, { m, guardians: false }).userData.outerW / 2 + 0.3;
  const on = (a, t) => [Math.sin(a) * e + Math.cos(a) * t, Math.cos(a) * e - Math.sin(a) * t];
  g.add(box(w - 3, floors * F, w - 3, sh));
  for (let f = 0; f < floors; f++) {
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
  const y = floors * F + 0.7, w0 = w * 0.9, w1 = w * 0.36, u = 0.85;
  g.add(box(w + 0.4, 0.7, w + 0.4, sh, 0, floors * F));
  const roof = pidaRoof(w0, w1, roofs, u, m, sh);
  g.add(at(roof, 0, y, 0));
  carved.add(placeAll(miniSpireGeo(), tierSpires(w0, w1, roofs, u, y, 0.9 + w * 0.02), m));
  const ry = y + roof.userData.top;
  g.add(at(bell(w * 0.15, m), 0, ry, 0), at(kalash(w * 0.1), 0, ry + w * 0.15, 0));
  g.add(mergeByMaterial(carved));
  return g;
}

// A straight wall `len` long along the x or z axis, centred at (x, z), h high and t thick, with
// openings where gates stand: gaps are [centre, width] along the wall's axis, in the same
// coordinates as x (for an x wall) or z (for a z wall). Lets a gopuram's passage open onto the
// courtyard instead of onto the wall running through it.
export function wallWithGaps(axis, len, h, t, m, gaps = [], x = 0, z = 0) {
  const g = new THREE.Group(), c0 = axis === 'x' ? x : z, end = c0 + len / 2;
  let start = c0 - len / 2;
  for (const [a, b] of gaps.map(([c, w]) => [c - w / 2, c + w / 2]).sort((p, q) => p[0] - q[0])) {
    if (a > start) g.add(axis === 'x' ? box(a - start, h, t, m, (a + start) / 2, 0, z) : box(t, h, a - start, m, x, 0, (a + start) / 2));
    start = Math.max(start, b);
  }
  if (end > start) g.add(axis === 'x' ? box(end - start, h, t, m, (end + start) / 2, 0, z) : box(t, h, end - start, m, x, 0, (end + start) / 2));
  return g;
}

// Dravidian gateway tower: a granite base with a passage running through it between stepped
// doorframes, its great doors standing open, then tapering storeys of painted stucco figures and
// a barrel-vault crown.
const paletteMats = new Map();
// cheap: the simplest stucco figure ('stuccoLow'), for phones (js/detail.js).
export function gopuram(w, d, h, tiers, seed, palette = PAINT, { pitch = 2.1, kuduEvery = 3, cheap = false } = {}) {
  if (!paletteMats.has(palette)) paletteMats.set(palette, palette.map((c) => mat(c, 0.75)));
  const pm = paletteMats.get(palette);
  const g = new THREE.Group(), R = rng(seed), figs = [], pilas = [], kudus = [], kutas = [];
  const bh = h * 0.2, pw = Math.max(2.6, w * 0.2), ph = bh * 0.85;
  // The base in two courses, split either side of the passage, and the block over it.
  const lw = (w - pw) / 2, uw = (w * 0.96 - pw) / 2;
  for (const s of [-1, 1]) {
    g.add(box(lw, bh * 0.3, d, M.graniteDark, s * (pw / 2 + lw / 2)));
    g.add(box(uw, bh * 0.7, d * 0.96, M.granite, s * (pw / 2 + uw / 2), bh * 0.3));
  }
  // The block over the passage stands 2 cm inside the courses either side, so their faces never meet.
  g.add(box(pw + 0.4, bh - ph, d * 0.96 - 0.04, M.granite, 0, ph));
  g.add(box(w * 1.02, bh * 0.08, d * 1.02, M.graniteDark, 0, bh));
  // The base's finer detail, on both faces (the upper course's set 1.5 cm proud of the passage's
  // door frames, whose backs lie in the same plane): mouldings along the plinth course, and on the upper
  // course a niche with an image either side of the passage, between pilasters.
  const bd = new THREE.Group(), nw = Math.min(uw * 0.3, 2.2), nh = bh * 0.7 * 0.52;
  for (const a of [0, Math.PI]) for (const sx of [-1, 1]) {
    const lo = sx * (pw / 2 + lw / 2), up = sx * (pw / 2 + uw / 2);
    for (const [y, t] of [[bh * 0.04, 0.1], [bh * 0.16, 0.06]]) bd.add(onFace(box(lw - 0.1, bh * 0.05, t, M.granite, 0, y, t / 2), a, d / 2 - 0.01, lo));
    bd.add(onFace(at(templeNiche(nw, nh, M.granite, { figure: idol(nh * 0.86, M.granite), crown: false }), 0, bh * 0.3 + bh * 0.7 * 0.2, 0), a, d * 0.48 + 0.015, up));
    bd.add(onFace(at(pilasters(uw * 0.84, 2, Math.min(0.5, uw * 0.06), bh * 0.66, 0.1, M.granite), 0, bh * 0.31, 0), a, d * 0.48 + 0.015, up));
    bd.add(onFace(box(uw - 0.1, bh * 0.04, 0.16, M.granite, 0, bh * 0.94, 0.08), a, d * 0.48 + 0.015, up));
  }
  g.add(mergeByMaterial(bd));
  // The passage: stepped frames at both ends, beams across its ceiling, the doors at its middle.
  const p = new THREE.Group(), bw = Math.min(0.45, Math.max(0.18, (bh * 1.08 - ph) / 3.4));
  for (const a of [0, Math.PI]) p.add(onFace(doorFrame(pw - 0.04, ph - 0.02, { bands: 3, bw, depth: 0.95, d0: 0.5, m: M.granite, carve: frieze(M.granite) }), a, d * 0.48));
  const nb = Math.max(2, Math.floor(d / 2.2));
  for (let k = 1; k < nb; k++) p.add(box(pw, 0.32, 0.4, M.graniteDark, 0, ph - 0.32, -d * 0.48 + (k / nb) * d * 0.96));
  p.add(doorLeaves(pw, ph * 0.93, { open: 1.42 }));
  p.add(box(pw, 0.16, 0.6, M.graniteDark, 0, 0, 0));
  g.add(mergeByMaterial(p));
  const th = (h * 0.68) / tiers;
  let y = bh * 1.08, tw = w, td = d;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    tw = w * (1 - 0.55 * t); td = d * (1 - 0.5 * t);
    g.add(box(tw, th * 0.74, td, M.stucco, 0, y));
    g.add(box(tw + 0.6, th * 0.26, td + 0.6, pm[(i + seed) % pm.length], 0, y + th * 0.74));
    // Each face of the storey: a figure in each bay between pilasters, a kudu over every third bay
    // along the cornice, and a kuta on each corner of the ledge above.
    const nx = Math.max(2, Math.floor(tw / pitch)), nz = Math.max(1, Math.floor(td / pitch));
    for (const [n, len, dist, axis] of [[nx, tw, td / 2, 'x'], [nz, td, tw / 2, 'z']]) for (const s of [-1, 1]) {
      const ry = axis === 'x' ? (s > 0 ? 0 : Math.PI) : (s > 0 ? Math.PI / 2 : -Math.PI / 2);
      const put = (lat, off) => (axis === 'x' ? [lat, s * (dist + off)] : [s * (dist + off), lat]);
      for (let k = 0; k < n; k++) {
        const lat = -len / 2 + (k + 0.5) * (len / n), [fx, fz] = put(lat, 0.24);
        figs.push([fx, y + th * 0.06, fz, 0.8, th * (0.5 + R() * 0.16), 0.45, ry]);
        const [px, pz] = put(-len / 2 + k * (len / n), 0.06);
        if (k) pilas.push([px, y, pz, axis === 'x' ? 0.22 : 0.12, th * 0.74, axis === 'x' ? 0.12 : 0.22]);
        if (k % kuduEvery === kuduEvery >> 1) { const [kx, kz] = put(lat, 0.33); kudus.push([kx, y + th * 0.8, kz, 1, 1, 1, ry]); }
      }
    }
    if (i < tiers - 1) for (const sx of [-1, 1]) for (const sz of [-1, 1]) kutas.push([sx * (tw / 2 - 0.3), y + th, sz * (td / 2 - 0.3), Math.min(1.4, th * 0.42), Math.min(1.4, th * 0.42) * 1.3, Math.min(1.4, th * 0.42), 0]);
    y += th;
  }
  const sr = td * 0.32, sl = tw * 0.92;
  const shala = mesh(new THREE.CylinderGeometry(sr, sr, sl, 18), M.stucco, 0, y + sr * 0.5, 0);
  shala.rotation.z = Math.PI / 2;
  g.add(shala);
  // The crowning vault's gable ends, each a horseshoe arch (kudu) round a mask, and a great kudu
  // window on its front and back.
  const cy = y + sr * 0.5, kd = new THREE.Group();
  for (const sx of [-1, 1]) {
    const k = mesh(new THREE.TorusGeometry(sr * 1.06, sr * 0.13, 6, 20, Math.PI * 1.3).rotateZ(-Math.PI * 0.15), M.stucco, sx * (sl / 2 + 0.05), cy, 0);
    k.rotation.y = Math.PI / 2;
    const mask = mesh(new THREE.SphereGeometry(sr * 0.35, 12, 8), pm[(seed + 2) % pm.length], sx * (sl / 2 + 0.02), cy + sr * 0.1, 0);
    mask.scale.x = 0.4;
    kd.add(k, mask);
  }
  for (const sz of [-1, 1]) {
    const k = mesh(new THREE.TorusGeometry(sr * 0.5, sr * 0.1, 6, 16, Math.PI * 1.3).rotateZ(-Math.PI * 0.15), M.stucco, 0, cy + sr * 0.05, sz * sr * 0.93);
    kd.add(k, mesh(new THREE.CircleGeometry(sr * 0.42, 16), M.recess, 0, cy + sr * 0.05, sz * (sr * 0.96 + 0.02)).rotateY(sz < 0 ? Math.PI : 0));
  }
  g.add(mergeByMaterial(kd));
  const nk = Math.max(3, Math.round(sl / 2.6) | 1);
  for (let k = 0; k < nk; k++) g.add(at(kalash(Math.min(2.2, sr * 0.9), M.gild), -sl / 2 + (k + 0.5) * (sl / nk), y + sr * 1.45, 0));
  // The painted stucco figures, in two poses, each in a colour of the palette.
  const c = new THREE.Color();
  for (const [pose, part] of cheap ? [['stuccoLow', 0], ['stuccoLow', 1]] : [['stucco', 0], ['stuccoArm', 1]]) {
    const mine = figs.filter((_, k) => k % 2 === part), im = instances(figureGeo(pose), mine, mat('#ffffff', 0.75));
    mine.forEach((_, k) => im.setColorAt(k, c.set(palette[Math.floor(R() * palette.length)])));
    g.add(im);
  }
  g.add(instances(unitBox(), pilas, M.stucco), instances(kuduGeo(), kudus, M.stucco), instances(kutaGeo(), kutas, M.stucco));
  return g;
}

// A temple gate on post-and-lintel lines: a gatehouse w × h × d (front face at z = d/2) with a
// passage pw × ph through it under a flat lintel, stepped frames on both faces, the leaves standing
// open inward at its middle, a paved floor, and optionally guardians or lions before it.
export function trabeateGate(w, h, d, pw, ph, { m, trim = m, bands = 3, bw = Math.min(0.45, pw * 0.1), guardians = false, lions = false, open = 1.35 } = {}) {
  const g = new THREE.Group(), sw = (w - pw) / 2;
  for (const s of [-1, 1]) g.add(box(sw, h, d, m, s * (pw / 2 + sw / 2), 0, 0));
  g.add(box(pw + 0.2, h - ph, d, m, 0, ph, 0));
  for (const a of [0, Math.PI]) g.add(onFace(doorFrame(pw, ph, { bands, bw, depth: 0.7, d0: 0.3, m: trim }), a, d / 2));
  g.add(box(pw, 0.3, d, trim, 0, -0.28, 0));
  g.add(at(doorLeaves(pw * 0.996, ph * 0.97, { open, inward: true }), 0, 0.02, d * 0.1));
  const ow = pw / 2 + bands * bw;
  if (guardians) for (const s of [-1, 1]) g.add(at(guardian(Math.min(2.6, ph * 0.5), trim), s * (ow + 0.6), 0, d / 2 + 0.45));
  if (lions) for (const s of [-1, 1]) g.add(at(lion(Math.min(1.3, ph * 0.22), trim), s * (ow + 1.6), 0, d / 2 + 1.6));
  return mergeByMaterial(g);
}
