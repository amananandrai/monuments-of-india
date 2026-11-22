import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, V, strut, chhatri, inst, unitBox, doubleSided, ellipseWall, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/jantar-mantar-jaipur.js';

// Jaipur's latitude: every gnomon's edge points at the celestial pole, 27° above the north horizon.
export const LAT = 26.92 * Math.PI / 180;
// The yellow-ochre and red lime plaster of the instruments, and the marble of their scales.
export const OCHRE = mat('#dba94a', 0.85), OCHRE_DARK = mat('#c48f3a', 0.85), RED = mat('#a5492f', 0.85), SAND = mat('#c9a077', 0.9);
export const MARBLE = M.marble, BRASS = surface(mat('#b08a3c', 0.4, 0.75), 'none'), INK = surface(mat('#3a332e', 0.8), 'none');

// A solid swept through a list of rings (each a loop of the same number of points), closed at both
// ends: the quadrant arcs, the sloping parapets, the sectors of a round wall.
export function sweep(rings, m) {
  const pos = [], cen = (r) => r.reduce((s, p) => s.add(p), V(0, 0, 0)).multiplyScalar(1 / r.length);
  const quad = (A, B, C, D, out) => {
    const flip = B.clone().sub(A).cross(C.clone().sub(A)).dot(out) < 0;
    for (const v of flip ? [A, C, B, A, D, C] : [A, B, C, A, C, D]) pos.push(v.x, v.y, v.z);
  };
  for (let k = 0; k < rings.length - 1; k++) {
    const a = rings[k], b = rings[k + 1], c = cen(a).add(cen(b)).multiplyScalar(0.5), n = a.length;
    for (let j = 0; j < n; j++) {
      const A = a[j], B = a[(j + 1) % n], C = b[(j + 1) % n], D = b[j];
      quad(A, B, C, D, A.clone().add(B).add(C).add(D).multiplyScalar(0.25).sub(c));
    }
  }
  const cap = (r, other) => { for (let j = 1; j < r.length - 1; j++) quad(r[0], r[j], r[j + 1], r[j + 1], cen(r).sub(cen(other))); };
  cap(rings[0], rings[1]);
  cap(rings[rings.length - 1], rings[rings.length - 2]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return mesh(geo, m);
}

// A block of a round wall: from radius r0 to r1, angle a0 to a1 (0 = +x, turning towards +z), y0 to y1.
export function arcBlock(r0, r1, a0, a1, y0, y1, m, n = Math.max(2, Math.ceil(Math.abs(a1 - a0) * r1 / 0.9))) {
  const rings = [];
  for (let k = 0; k <= n; k++) {
    const a = a0 + (a1 - a0) * k / n, c = Math.cos(a), s = Math.sin(a);
    rings.push([V(c * r0, y0, s * r0), V(c * r1, y0, s * r1), V(c * r1, y1, s * r1), V(c * r0, y1, s * r0)]);
  }
  return sweep(rings, m);
}

// A Samrat Yantra, the equinoctial sundial: a triangular gnomon wall H high whose sloping edge
// rises to the north (-z) at the angle `lat`, a stair up it between two parapets (their marble
// copings are the edges that cast the shadow), and on each side a marble quadrant of radius R
// centred on that edge, lying in the plane of the equator: it climbs from the foot of the wall
// out to the east and the west, on a masonry ramp. The toe of the gnomon is at +z; the whole
// stands on y = 0, centred on its length. arches: passages through the wall, as fractions of its
// length; kiosk: a chhatri on the summit (the Vrihat Samrat's).
export function samrat(H, { T = H * 0.13, R = H * 0.62, lat = LAT, m = OCHRE, trim = RED, arches = [], kiosk = false, ticks = !detail.low } = {}) {
  const g = new THREE.Group(), tan = Math.tan(lat), run = H / tan, land = kiosk ? T + 0.8 : 0, L = run + land;
  // The wall, with its arched passages.
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(run, H); sh.closePath();
  for (const [t, aw] of arches) {
    const s = t * L, ah = s * tan * 0.56, sp = ah * 0.55, hole = new THREE.Path();
    hole.moveTo(s - aw / 2, 0.02); hole.lineTo(s - aw / 2, sp);
    hole.quadraticCurveTo(s - aw / 2, sp + (ah - sp) * 0.75, s, ah);
    hole.quadraticCurveTo(s + aw / 2, sp + (ah - sp) * 0.75, s + aw / 2, sp);
    hole.lineTo(s + aw / 2, 0.02); hole.closePath();
    sh.holes.push(hole);
  }
  const wall = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 8 }).translate(0, 0, -T / 2).rotateY(Math.PI / 2).translate(0, 0, L / 2);
  g.add(mesh(wall, m));
  // The parapets and their marble copings, and the steps between them.
  const pw = T * 0.17, ph = Math.min(0.9, H * 0.07), zt = L / 2, zn = L / 2 - run;
  for (const s of [-1, 1]) {
    const x0 = s * (T / 2 - pw), x1 = s * T / 2, slab = (xa, xb, ya, yb, mm) => sweep([[V(xa, ya, zt), V(xb, ya, zt), V(xb, yb, zt), V(xa, yb, zt)], [V(xa, H + ya, zn), V(xb, H + ya, zn), V(xb, H + yb, zn), V(xa, H + yb, zn)]], mm);
    g.add(slab(x0, x1, -0.05, ph, trim), slab(x0 - s * 0.02, x1 + s * 0.04, ph, ph + Math.max(0.05, ph * 0.12), MARBLE));
  }
  const n = Math.max(6, Math.round(H / (detail.low ? 0.6 : 0.3))), rise = H / n, dep = run / n, steps = [];
  for (let k = 0; k < n; k++) steps.push([0, k * rise, zt - (k + 0.5) * dep, T - 2 * pw, rise, dep]);
  g.add(inst(unitBox(), steps, SAND));
  if (kiosk) {
    // The summit: a landing behind a low wall, and the chhatri from which the hour was called.
    const zc = -L / 2 + land / 2;
    g.add(box(T + 0.5, 0.3, land + 0.3, trim, 0, H, zc - 0.1), at(chhatri(T * 0.4, T * 0.95, m, m), 0, H + 0.3, zc));
  }
  // The quadrants. C is the point of the gnomon's edge they are centred on; p points from it down
  // to the foot of the arcs, at right angles to the edge; h runs along the edge.
  const cos = Math.cos(lat), sin = Math.sin(lat), base = Math.max(0.25, R * 0.03), Cy = R * cos + base, sC = (Cy - ph) / tan;
  const C = V(0, Cy, L / 2 - sC), p = V(0, -cos, -sin), h = V(0, sin, -cos), wM = R * 0.15, wm = R * 0.1, N = detail.low ? 14 : 28;
  for (const side of [-1, 1]) {
    const e = V(side, 0, 0), P = (th, r, w) => C.clone().addScaledVector(p, r * Math.cos(th)).addScaledVector(e, r * Math.sin(th)).addScaledVector(h, w);
    const up = (v) => { v.y = Math.max(v.y, 0.03); return v; }, down = (v) => V(v.x, 0, v.z);
    const ramp = [], scale = [], kerbs = [[], []];
    for (let k = 0; k <= N; k++) {
      const th = (k / N) * Math.PI / 2, A = up(P(th, R + 0.12, -wM)), B = up(P(th, R + 0.12, wM));
      ramp.push([A, B, down(B), down(A)]);
      scale.push([P(th, R, -wm), P(th, R, wm), P(th, R + 0.3, wm), P(th, R + 0.3, -wm)]);
      [-1, 1].forEach((s, i) => kerbs[i].push([P(th, R - R * 0.025, s * (wM - R * 0.03)), P(th, R - R * 0.025, s * wM), P(th, R + 0.3, s * wM), P(th, R + 0.3, s * (wM - R * 0.03))]));
    }
    g.add(sweep(ramp, m === OCHRE ? OCHRE_DARK : m), sweep(scale, MARBLE), sweep(kerbs[0], trim), sweep(kerbs[1], trim));
    // The hours, cut across the scale: six to each quadrant.
    if (ticks) for (let k = 1; k < 6; k++) g.add(strut(P(k * Math.PI / 12, R - 0.01, -wm * 0.98), P(k * Math.PI / 12, R - 0.01, wm * 0.98), Math.max(0.03, R * 0.006), INK));
    // The landing at the head of each quadrant.
    const top = P(Math.PI / 2, R + 0.3, 0);
    g.add(box(wM * 0.9, 0.3, wM * 2.1, trim, top.x + side * wM * 0.3, top.y - 0.25, top.z));
  }
  return mergeParts(g);
}
// Merge a part's plain meshes, keeping its instanced steps.
function mergeParts(g) { mergeByMaterial(g); return g; }

// A Jai Prakash: a marble bowl of radius r sunk in a stone terrace, the sky's hemisphere turned
// over. Alternate sectors of the bowl are cut away as walkways (the twin bowl has the others), and
// a small plate hangs at the centre on crossed wires; its shadow on the bowl marks the sun's place.
// The bowl is shallower here than the true hemisphere, which goes below the ground.
export function jaiPrakash(r, phase = 0) {
  const g = new THREE.Group(), hp = 1.5, side = 2 * r + 3.4, sh = new THREE.Shape();
  sh.moveTo(-side / 2, -side / 2); sh.lineTo(side / 2, -side / 2); sh.lineTo(side / 2, side / 2); sh.lineTo(-side / 2, side / 2); sh.closePath();
  sh.holes.push(new THREE.Path().absarc(0, 0, r + 0.02, 0, Math.PI * 2, true));
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: hp, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2), OCHRE));
  const bowl = (rr, a0, len, m) => { const o = mesh(new THREE.SphereGeometry(rr, Math.max(3, Math.round(len * 10)), 10, a0, len, Math.PI / 2, Math.PI / 2), doubleSided(m)); o.scale.y = 0.52; o.position.y = hp; o.castShadow = false; return o; };
  g.add(bowl(r * 1.04, 0, Math.PI * 2, M.recess));
  for (let k = 0; k < 6; k++) g.add(bowl(r, phase + k * Math.PI / 3, Math.PI / 6, MARBLE));
  const rim = mesh(new THREE.RingGeometry(r - 0.02, r + 0.4, 48).rotateX(-Math.PI / 2), MARBLE);
  rim.position.y = hp + 0.03;
  g.add(rim, box(side + 0.2, 0.25, side + 0.2, RED, 0, -0.01, 0));
  for (const a of [0, Math.PI / 2]) g.add(strut(V(Math.cos(a) * r, hp + 0.12, Math.sin(a) * r), V(-Math.cos(a) * r, hp + 0.12, -Math.sin(a) * r), 0.03, INK));
  g.add(cyl(0.16, 0.16, 0.02, BRASS, 0, hp + 0.1, 0, 12));
  // Steps up to the terrace on the south.
  for (let k = 0; k < 5; k++) g.add(box(2.4, 0.3, 0.32, SAND, 0, k * 0.3, side / 2 + 0.16 + (4 - k) * 0.32));
  return mergeParts(g);
}

// A Ram Yantra: an open cylinder of twelve stone piers round a central pole of their own height,
// on a floor of twelve raised sectors with gaps to walk in between them. It reads the altitude
// and azimuth of anything in the sky; the twin instrument has piers where this one has gaps.
export function ramYantra(R, phase = 0) {
  const g = new THREE.Group(), fy = 1.0, top = fy + R, n = 12, w = Math.PI / n;
  for (let k = 0; k < n; k++) {
    const a = phase + k * 2 * w;
    g.add(arcBlock(R, R + 0.55, a, a + w, 0, top, OCHRE), arcBlock(R - 0.02, R + 0.57, a - 0.01, a + w + 0.01, top, top + 0.12, MARBLE, 2));
    // The sector of floor running in from the pier to the pole, on its low wall.
    g.add(arcBlock(0.5, R, a, a + w, fy - 0.16, fy, MARBLE), arcBlock(0.55, R - 0.05, a + w * 0.3, a + w * 0.7, 0, fy - 0.16, OCHRE_DARK, 2));
    // The pier is notched at each third of its height, to climb to the upper readings.
    for (const t of [0.36, 0.68]) g.add(arcBlock(R - 0.06, R + 0.61, a - 0.008, a + w + 0.008, fy + R * t, fy + R * t + 0.1, RED, 2));
  }
  g.add(cyl(0.22, 0.26, top, OCHRE, 0, 0, 0, 12), cyl(0.3, 0.3, 0.1, MARBLE, 0, top, 0, 12), cyl(R + 1.3, R + 1.3, 0.2, SAND, 0, -0.02, 0, 40));
  return mergeParts(g);
}

// The Digamsa Yantra, for azimuth: a pillar at the centre of two round walls, the outer twice as
// high as the inner, their tops graduated in marble; a doorway in each quarter of the outer wall.
export function digamsa(R) {
  const g = new THREE.Group(), q = Math.PI / 2;
  for (let k = 0; k < 4; k++) g.add(arcBlock(R - 0.6, R, k * q + 0.1, (k + 1) * q - 0.1, 0, 2.4, OCHRE), arcBlock(R - 0.63, R + 0.03, k * q + 0.09, (k + 1) * q - 0.09, 2.4, 2.5, MARBLE));
  g.add(ellipseWall(R * 0.52, R * 0.52, 0, Math.PI * 2, 0.5, 0, 1.2, OCHRE), ellipseWall(R * 0.52, R * 0.52, 0, Math.PI * 2, 0.56, 1.2, 1.28, MARBLE));
  g.add(cyl(0.45, 0.5, 1.2, OCHRE, 0, 0, 0, 16), cyl(0.5, 0.5, 0.08, MARBLE, 0, 1.2, 0, 16), cyl(R + 1, R + 1, 0.15, SAND, 0, -0.02, 0, 40));
  return mergeParts(g);
}

// The Narivalaya: a thick wall leaning back at the angle of the equator, a round marble dial on
// each of its faces: the north face for the summer half of the year, the south for the winter.
export function narivalaya(r) {
  const g = new THREE.Group(), tilt = new THREE.Group(), w = r * 2 + 1.6, hgt = r * 2 + 1.4, t = 1.7;
  tilt.add(box(w, hgt, t, OCHRE), box(w + 0.2, 0.25, t + 0.2, RED, 0, hgt, 0));
  for (const s of [-1, 1]) {
    const dial = mesh(new THREE.CylinderGeometry(r, r, 0.06, 40).rotateX(Math.PI / 2), MARBLE), rimd = mesh(new THREE.TorusGeometry(r, 0.07, 6, 40), RED);
    dial.position.set(0, hgt / 2 + 0.1, s * (t / 2 + 0.03));
    rimd.position.copy(dial.position);
    tilt.add(dial, rimd, at(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6).rotateX(Math.PI / 2), INK), 0, hgt / 2 + 0.1, s * (t / 2 + 0.28)));
    if (!detail.low) for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI; tilt.add(at(box(0.03, r * 0.92, 0.02, INK, 0, -r * 0.46, 0), 0, hgt / 2 + 0.1, s * (t / 2 + 0.065)).rotateZ(a)); }
  }
  tilt.rotation.x = LAT;
  tilt.position.set(0, 0.5, 0.6);
  // The plinth it leans on, and the stairs at each end.
  g.add(tilt, box(w + 1.2, 0.6, t + 3.2, SAND, 0, 0, -0.3));
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) g.add(box(1.1, 0.6 + (k + 1) * 0.45, 0.5, OCHRE_DARK, s * (w / 2 + 0.56), 0, 1.2 - k * 0.5));
  return mergeParts(g);
}

// The observatory of Sawai Jai Singh II: the great instruments of masonry in their walled yard.
// North is -z, east +x. The Vrihat Samrat stands in the east of the yard; the two bowls of the Jai
// Prakash west of it; the Ram Yantra's two cylinders at the west end; the twelve Rashivalaya in
// the south; the Laghu Samrat and the Narivalaya in the north-west, by the entrance.
export const SAMRAT = { x: 24, z: -4, H: 23.4 };
export function buildJantarMantar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Vrihat Samrat Yantra, 27 m to the top of its kiosk: the largest sundial in the world.
  f.add(at(samrat(SAMRAT.H, { T: 3.2, R: 15.2, kiosk: true, arches: [[0.4, 2.6], [0.56, 3], [0.9, 3.2]] }), SAMRAT.x, 0, SAMRAT.z));
  // The Laghu Samrat, the small sundial, in red stone.
  f.add(at(samrat(6.4, { T: 1.3, R: 3.0, m: RED, trim: OCHRE_DARK }), -44, 0, -34));
  // The Jai Prakash and, north of it, the two smaller bowls of the Kapali Yantra.
  f.add(at(jaiPrakash(2.7), -12, 0, 12), at(jaiPrakash(2.7, Math.PI / 6), -12, 0, -1));
  f.add(at(jaiPrakash(1.7), -16, 0, -20), at(jaiPrakash(1.7, Math.PI / 6), -7, 0, -20));
  // The Ram Yantra.
  f.add(at(ramYantra(3.5), -58, 0, 12), at(ramYantra(3.5, Math.PI / 12), -58, 0, 26));
  f.add(at(digamsa(5), -38, 0, 44));
  f.add(at(narivalaya(1.9), -28, 0, -40));
  addDetails(f, g);
  // From the south-west, across the yard: the stair of the great gnomon climbing to its kiosk
  // between the two quadrants.
  return { group: g, focus: f, view: [-0.7, 0.2, 0.72], zoom: 0.4, target: [14, 9, 0] };
}
