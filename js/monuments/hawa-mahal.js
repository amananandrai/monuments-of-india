import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, finial, surface, inst, unitBox, unitHemi, guldasta } from '../helpers.js';
import { addDetails } from '../details/hawa-mahal.js';
import { arcadeSkin } from '../details/mughal.js';

// The jali in each window. Its holes are cut in the shader, so it stays opaque (a transparent
// material would lose its surface) and casts no shadow; the stone screen around it does.
const JALI = surface(mat('#d98a73', 0.85, 0, { side: THREE.DoubleSide }), 'lattice');

// A stone screen w × h, `depth` thick and centred on z = 0, with an arched window cut for each hole.
function screenWall(w, h, holes, depth, m) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  for (const hole of holes) {
    const p = new THREE.Path();
    p.moveTo(hole.x - hole.hw, hole.y);
    p.lineTo(hole.x - hole.hw, hole.y + hole.hh);
    p.absarc(hole.x, hole.y + hole.hh, hole.hw, Math.PI, 0, true);
    p.lineTo(hole.x + hole.hw, hole.y);
    p.closePath();
    s.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2);
  return mesh(geo, m);
}

const windows = (w, h, spacing) => {
  const n = Math.max(3, Math.round(w / spacing));
  return Array.from({ length: n }, (_, i) => ({ x: -w / 2 + (i + 0.5) * (w / n), y: h * 0.18, hw: 0.34, hh: h * 0.34 }));
};

// A curved bangla roof of unit size (x and z from -0.5 to 0.5, y from 0 to 1), for instancing.
let banglaGeo_ = null;
function banglaGeo() {
  if (banglaGeo_) return banglaGeo_;
  const sh = new THREE.Shape(), n = 10;
  sh.moveTo(0, 0);
  for (let k = 0; k <= n; k++) { const u = k / n; sh.lineTo(-u, Math.sin(u * Math.PI) * 0.9 + 0.1 * Math.sin(u * Math.PI * 2) ** 2); }
  sh.lineTo(-1, 0); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false });
  g.translate(0.5, 0, -0.5).rotateY(Math.PI / 2);
  g.computeBoundingBox();
  const b = g.boundingBox;
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2).scale(1 / (b.max.x - b.min.x), 1 / (b.max.y - b.min.y), 1 / (b.max.z - b.min.z));
  return (banglaGeo_ = g);
}
// A lotus-bud finial of unit size: a stem, a bud and a point.
let finialGeo_ = null;
function finialGeo() {
  if (finialGeo_) return finialGeo_;
  return (finialGeo_ = new THREE.LatheGeometry([[0, 0], [0.18, 0], [0.12, 0.2], [0.3, 0.4], [0.32, 0.55], [0.12, 0.75], [0.04, 0.85], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 8));
}

// The palace is a screen one room deep: a pierced front with a jharokha canopy on every window,
// a back screen with fewer windows, and the floor, roof and ends that close the room.
const T = 0.55, D = 1.6;

export function buildHawaMahal() {
  const P = M.hawa, L = M.hawaLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(100, 0.2, 14, M.asphalt, 0, 0, 12), box(100, 0.3, 4, M.path, 0, 0, 3.5));
  const floors = [[46, 3.6], [46, 3.0], [30, 3.0], [20, 3.0], [11, 3.0]];
  const domes = [], posts = [], banglas = [], finials = [], corbels = [], cusps = [], bays = [], panes = [];
  let y = 0;
  floors.forEach(([w, h], fi) => {
    const front = windows(w, h, 1.5);
    f.add(at(screenWall(w, h, front, T, P), 0, y, 0));
    f.add(at(screenWall(w, h, windows(w, h, 3), T, P), 0, y, -D));
    // The jali sits inside the window openings, clear of both faces of the stone.
    const jali = box(w, h * 0.7, 0.04, JALI, 0, y + h * 0.12, -0.08);
    jali.castShadow = false;
    f.add(jali);
    // The room's ends and roof sit between the screens and stop 2 cm short of their ends, so no faces meet.
    for (const s of [-1, 1]) f.add(box(T, h, D - T, P, s * (w / 2 - T / 2 - 0.02), y, -D / 2));
    f.add(box(w - 0.04, 0.2, D - T, P, 0, y + h - 0.36, -D / 2));
    front.forEach((hole, k) => {
      if (fi >= 1) {
        // Above the ground floor every window is an oriel: a half-octagon bay standing out from the
        // screen, a pierced window in each of its four facets, a corbel under it and a small dome
        // with a lotus finial over it; together they make the honeycomb of the facade.
        const r = 0.66, zc = T / 2 - 0.02, y0 = y + h * 0.13, bh = h * 0.62;
        bays.push([hole.x, y0, zc, r, bh, r]);
        for (const a of [-3, -1, 1, 3].map((q) => (q * Math.PI) / 8)) {
          const dd = r * Math.cos(Math.PI / 8) + 0.012;
          panes.push([hole.x + Math.sin(a) * dd, y0 + bh * 0.2, zc + Math.cos(a) * dd, 0.3, bh * 0.6, 0.02, a]);
        }
        corbels.push([hole.x, y0 - 0.16, zc + 0.2, 1.1, 0.16, 0.7], [hole.x, y0 - 0.3, zc + 0.12, 0.7, 0.14, 0.45]);
        if (k % 4 === 2 && fi % 2 === 1) banglas.push([hole.x, y0 + bh, zc, 1.4, 0.45, 1.0]);
        else { domes.push([hole.x, y0 + bh, zc, 1.3, 1.0, 1.3]); finials.push([hole.x, y0 + bh + 0.5, zc, 0.14, 0.42, 0.14]); }
        return;
      }
      // Every third window has a curved bangla roof; the rest small domes with a lotus finial.
      const top = y + h * 0.72;
      if (k % 3 === 1 && fi % 2 === 0) banglas.push([hole.x, top - 0.02, -0.05, 0.98, 0.42, 0.85]);
      else { domes.push([hole.x, top, 0.35, 0.84, 0.84, 0.84]); finials.push([hole.x, top + 0.4, 0.35, 0.14, 0.42, 0.14]); }
      for (const s of [-1, 1]) posts.push([hole.x + s * 0.4, y + 0.15, 0.35, 0.08, h * 0.55, 0.7]);
      // A corbelled base under the sill, stepping in.
      corbels.push([hole.x, y + h * 0.18 - 0.16, 0.42, 0.9, 0.16, 0.5], [hole.x, y + h * 0.18 - 0.3, 0.36, 0.6, 0.14, 0.36]);
      // Cusps round the head of the arch, which make it multi-foiled.
      for (let c = 1; c < 6; c++) {
        const a = (c / 6) * Math.PI, cy = y + hole.y + hole.hh;
        cusps.push([hole.x + Math.cos(a) * 0.27, cy + Math.sin(a) * 0.27, 0.29, a]);
      }
    });
    f.add(box(w + 0.3, 0.16, 1.6, M.lime, 0, y + h - 0.14, 0.2));
    const next = floors[fi + 1];
    if (next && next[0] < w) for (const s of [-1, 1]) f.add(box((w - next[0]) / 2, 0.8, D + T, L, s * (w + next[0]) / 4, y + h, -D / 2));
    y += h;
  });
  const bayGeo = new THREE.CylinderGeometry(1, 1, 1, 4, 1, false, -Math.PI / 2, Math.PI).translate(0, 0.5, 0);
  const paneIm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), JALI, panes.length), po = new THREE.Object3D();
  panes.forEach(([x, py, z, sx, sy, sz, a], i) => { po.position.set(x, py, z); po.rotation.set(0, a, 0); po.scale.set(sx, sy, sz); po.updateMatrix(); paneIm.setMatrixAt(i, po.matrix); });
  f.add(inst(bayGeo, bays, P), paneIm);
  f.add(inst(unitHemi(10), domes, L), inst(unitBox(), posts, P), inst(banglaGeo(), banglas, L), inst(finialGeo(), finials, L), inst(unitBox(), corbels, L));
  // The cusps: small lobes turned to face out of the arch.
  const cuspM = new THREE.InstancedMesh(new THREE.TorusGeometry(0.07, 0.022, 4, 8, Math.PI), L, cusps.length), o = new THREE.Object3D();
  cusps.forEach(([x, cy, z, a], i) => { o.position.set(x, cy, z); o.rotation.set(0, 0, a - Math.PI / 2); o.updateMatrix(); cuspM.setMatrixAt(i, o.matrix); });
  f.add(cuspM);
  // Slender pinnacles on the corners of every setback of the crown.
  floors.forEach(([w, h], fi) => {
    const next = floors[fi + 1], y0 = floors.slice(0, fi + 1).reduce((t, [, hh]) => t + hh, 0);
    if (next && next[0] < w) for (const s of [-1, 1]) f.add(at(guldasta(1.6, 0.14, L), s * (w / 2 - 0.3), y0 + 0.8, 0.1));
  });
  f.add(box(3.4, 1.4, 2.1, P, 0, y, -D / 2), at(hemi(1.1, L, 16), 0, y + 1.4, -D / 2), at(finial(2), 0, y + 2.5, -D / 2));
  for (const x of [-3.8, 3.8]) f.add(box(2, 0.9, 2, P, x, y, -D / 2), at(hemi(0.9, L, 12), x, y + 0.9, -D / 2), at(finial(1.3), x, y + 1.75, -D / 2));
  // Behind the screen, the palace it fronts (the real Hawa Mahal is a screen on the side of the
  // City Palace's zenana): a paved court, ranges of two storeys round it with arcades on the court
  // side, an open pavilion at its middle, and the ramps (not stairs) that climb to the upper
  // floors, built for palanquins.
  const court = new THREE.Group(), C0 = -D - 2, CD = 34, CW = 46;
  court.add(box(CW, 0.25, CD, M.path, 0, 0, C0 - CD / 2));
  for (const [cx, cz, len, ry] of [[0, C0 - CD - 4, CW + 16, 0], [-(CW / 2 + 4), C0 - CD / 2, CD, -Math.PI / 2], [CW / 2 + 4, C0 - CD / 2, CD, Math.PI / 2]]) {
    const cells = [], n = Math.floor(len / 4);
    for (let k = 0; k < n; k++) { const x = -len / 2 + (k + 0.5) * (len / n); cells.push([x, 0.3, 2.4, 3.2, 'room'], [x, 4.3, 2, 2.6, 'jali']); }
    const r = new THREE.Group();
    // The court side opens in an arcade; the outer side has two rows of windows.
    const outer = cells.map(([x, sl, w, h]) => [x, sl + 0.6, w * 0.6, h * 0.7, 'room']);
    r.add(box(len, 7.4, 5.6, P, 0, 0, -4), at(arcadeSkin(len, 7.4, cells, 1.2, P, { trim: L }), 0, 0, -1.2), at(arcadeSkin(len, 7.4, outer, 1.2, P, { trim: L, fill: 'room' }), 0, 0, -6.8).rotateY(Math.PI), box(len + 0.4, 0.5, 8, L, 0, 7.4, -4));
    court.add(at(r, cx, 0, cz).rotateY(ry));
  }
  // The pavilion: twelve columns under a flat roof with a parapet.
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if (i % 3 === 0 || j % 2 === 0) court.add(cyl(0.3, 0.3, 4, L, -4.5 + i * 3, 0.25, C0 - CD / 2 - 3 + j * 3, 8));
  court.add(box(11, 0.5, 8, L, 0, 4.25, C0 - CD / 2), box(11.4, 0.6, 8.4, P, 0, 4.75, C0 - CD / 2));
  // The ramps: a broad sloping way up each side of the court, against the side ranges.
  for (const s of [-1, 1]) {
    const ramp = box(4, 0.4, 24, P);
    ramp.position.set(s * (CW / 2 - 4.6), 3.5, C0 - CD / 2);
    ramp.rotation.x = s * Math.atan2(7.4, 24);
    const rail = box(0.4, 1, 24, L, s * (CW / 2 - 6.8), 3.5, C0 - CD / 2);
    rail.rotation.x = s * Math.atan2(7.4, 24);
    court.add(ramp, rail);
  }
  f.add(court);
  addDetails(f, g);
  // A flat facade: framed closer than its bounding sphere would allow.
  // The home view matches the best-known photograph: its street front, straight on from across the road.
  return { group: g, focus: f, view: [0.12, 0.06, 1], zoom: 0.36, target: [0, 9, 0] };
}
