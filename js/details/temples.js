import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, rng, shikhara, pidaRoof, bell, kalash, flag, onionDome, nagaraProfile, PAINT } from '../helpers.js';
import { frieze, mergeByMaterial } from './components.js';
import { templeDoorway, templePorch, steps, doorFrame, doorLeaves } from './doorways.js';

// The shared temple builders, with real entrances: a Nagara temple's front porch, doorway and
// side doors, a mandapa's doors, and a passage through the base of a gopuram. Moved here from
// helpers.js, since they use the doorway parts in js/details/doorways.js.

// A door opening for a wall `wallH` high: about half the wall, at most 4.4 m, half as wide as tall.
function doorSize(wallH) {
  const h = Math.min(4.4, Math.max(1.6, wallH * 0.55));
  return { w: h * 0.5, h };
}

// A North Indian (Nagara) temple along the z axis: the sanctum and its curved spire at z = 0,
// with halls (mandapas) stepping out towards +z. halls: [[width, wallHeight, roofTiers, 'pida' | 'dome']].
// The front hall opens through a porch and a stepped doorway at the head of the stairs; the first
// hall has doors on both sides; a temple with no hall has its doorway in the sanctum.
export function nagaraTemple({
  w = 12, h = 22, m, shade = m, spireM = m, plinth = 2, urus = 4, uruScale = 0.5,
  halls = [[14, 8, 4]], prof = nagaraProfile, flagM = M.saffron, hallM = m, crown = null,
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
  for (const [hw, hh, tiers, kind = 'pida'] of halls) {
    z += hw / 2;
    placed.push({ hw, hh, zc: z });
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
  g.add(box(sw + 8, plinth, z + sw / 2 + 6, shade, 0, 0, (z - sw / 2) / 2 + 3));

  const e = new THREE.Group(), half = (sw + 8) / 2;
  let stairW = 6;
  if (placed.length) {
    // The main entrance: a porch in front of the front hall, with the doorway at its back.
    const { hw, hh } = placed[placed.length - 1], ds = doorSize(hh);
    const door = templeDoorway(ds.w, ds.h, { m: hallM });
    e.add(at(door, 0, plinth, z));
    if (hw >= 9) {
      const pw = Math.min(hw - 1, Math.max(7.6, door.userData.outerW + 2.4));
      e.add(at(templePorch(pw, 4.2, Math.min(hh - 0.3, door.userData.outerH + 0.9), hallM, shade), 0, plinth, z));
      stairW = Math.max(6, pw * 0.75);
    }
    // Side doors into the first hall, with steps down from the plinth, where there is room.
    const first = placed[0], room = half - first.hw / 2;
    if (room >= 1.4) {
      const sd = doorSize(first.hh * 0.85);
      for (const s of [-1, 1]) {
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
  e.add(at(steps(stairW, plinth, Math.max(3, Math.ceil(plinth / 0.42)), shade, 0.45), 0, 0, z + 6));
  g.add(mergeByMaterial(e));
  g.userData.length = z;
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
  const n = Math.max(3, Math.round(w / 2.6));
  for (let i = 0; i <= n; i++) {
    const t = -w / 2 + 0.6 + (i / n) * (w - 1.2);
    for (const [x, z, a] of [[t, w / 2 - 0.6, 0], [t, -w / 2 + 0.6, Math.PI], [w / 2 - 0.6, t, Math.PI / 2], [-w / 2 + 0.6, t, -Math.PI / 2]]) {
      if (doors.some((d) => Math.abs(Math.atan2(Math.sin(d - a), Math.cos(d - a))) < 0.01) && Math.abs(t) < gap) continue;
      g.add(cyl(0.38, 0.42, h, m, x, 0, z, 8));
    }
  }
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
export function gopuram(w, d, h, tiers, seed, palette = PAINT) {
  if (!paletteMats.has(palette)) paletteMats.set(palette, palette.map((c) => mat(c, 0.75)));
  const pm = paletteMats.get(palette);
  const g = new THREE.Group(), R = rng(seed), figs = [];
  const bh = h * 0.2, pw = Math.max(2.6, w * 0.2), ph = bh * 0.85;
  // The base in two courses, split either side of the passage, and the block over it.
  const lw = (w - pw) / 2, uw = (w * 0.96 - pw) / 2;
  for (const s of [-1, 1]) {
    g.add(box(lw, bh * 0.3, d, M.graniteDark, s * (pw / 2 + lw / 2)));
    g.add(box(uw, bh * 0.7, d * 0.96, M.granite, s * (pw / 2 + uw / 2), bh * 0.3));
  }
  g.add(box(pw + 0.4, bh - ph, d * 0.96, M.granite, 0, ph));
  g.add(box(w * 1.02, bh * 0.08, d * 1.02, M.graniteDark, 0, bh));
  // The passage: stepped frames at both ends, beams across its ceiling, the doors at its middle.
  const p = new THREE.Group(), bw = Math.min(0.45, Math.max(0.18, (bh * 1.08 - ph) / 3.4));
  for (const a of [0, Math.PI]) p.add(onFace(doorFrame(pw, ph, { bands: 3, bw, depth: 0.95, d0: 0.5, m: M.granite, carve: frieze(M.granite) }), a, d * 0.48));
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
    const nx = Math.max(2, Math.floor(tw / 1.3)), nz = Math.max(1, Math.floor(td / 1.3));
    for (let k = 0; k < nx; k++) for (const s of [-1, 1]) figs.push([-tw / 2 + (k + 0.5) * (tw / nx), y + th * 0.08, s * (td / 2 + 0.22), 0.75, th * (0.45 + R() * 0.2), 0.45]);
    for (let k = 0; k < nz; k++) for (const s of [-1, 1]) figs.push([s * (tw / 2 + 0.22), y + th * 0.08, -td / 2 + (k + 0.5) * (td / nz), 0.45, th * (0.45 + R() * 0.2), 0.75]);
    y += th;
  }
  const sr = td * 0.32, sl = tw * 0.92;
  const shala = mesh(new THREE.CylinderGeometry(sr, sr, sl, 18), M.stucco, 0, y + sr * 0.5, 0);
  shala.rotation.z = Math.PI / 2;
  g.add(shala);
  const nk = Math.max(3, Math.round(sl / 2.6) | 1);
  for (let k = 0; k < nk; k++) g.add(at(kalash(Math.min(2.2, sr * 0.9), M.gild), -sl / 2 + (k + 0.5) * (sl / nk), y + sr * 1.45, 0));
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff', 0.75), figs.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  figs.forEach(([x, fy, z, sx, sy, sz], i) => {
    o.position.set(x, fy + sy / 2, z);
    o.scale.set(sx, sy, sz);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    im.setColorAt(i, c.set(palette[Math.floor(R() * palette.length)]));
  });
  im.castShadow = true;
  im.receiveShadow = true;
  g.add(im);
  return g;
}
