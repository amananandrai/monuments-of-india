import * as THREE from 'three';
import { M, V, mat, mesh, cyl, strut, mown, surface } from '../helpers.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/matrimandir.js';

// The Matrimandir at Auroville (Roger Anger, 1971 to 2008), after photographs: a flattened golden
// sphere 36 m across and 29 m high, carried on four pairs of piers over a lotus pond, sunk among
// twelve great sloping petals faced in red Agra sandstone; its skin set with about 1,400 gilded
// discs. Up is north-south: the viewer stands to the south (+z), the amphitheatre lies to the west.
export const A = 18, B = 14.5, CY = 15.5;   // the spheroid's half-axes, and its centre's height
export const PETALS = 12, P0 = 19.5, P1 = 43, PH = 9.5;   // the petals: from P0 to P1 out, PH high
export const RED = surface(mat('#a8523a', 0.82), 'cladding');
export const RED_DARK = mat('#8a4230', 0.9);

// One petal, lying along +z from r0 out to r1, `half` radians to each side of its axis and h high:
// a nose rising steeply at the sphere's end, a long convex back falling to the ground at the outer
// end, which is rounded like the tip of a leaf. Closed on the ground all round.
export function petal(r0, r1, half, h, ns = detail.low ? 14 : 28, nt = detail.low ? 8 : 14) {
  const pos = [], idx = [];
  for (let i = 0; i <= ns; i++) {
    const s = i / ns, r = r0 + s * (r1 - r0);
    // Its plan: full width along the body, rounded at both ends (the outer end over a longer run).
    const wide = s < 0.08 ? Math.sqrt(1 - ((0.08 - s) / 0.08) ** 2) * 0.25 + 0.75 : s > 0.7 ? Math.sqrt(Math.max(0, 1 - ((s - 0.7) / 0.3) ** 2)) : 1;
    const up = s < 0.12 ? Math.sqrt(1 - ((0.12 - s) / 0.12) ** 2) : 1 - ((s - 0.12) / 0.88) ** 2.1;
    for (let j = 0; j <= nt; j++) {
      const t = -1 + (2 * j) / nt, a = t * wide * half;
      pos.push(Math.sin(a) * r, h * up * (1 - t * t) ** 0.24, Math.cos(a) * r);
    }
  }
  for (let i = 0; i < ns; i++) for (let j = 0; j < nt; j++) { const a = i * (nt + 1) + j, b = a + nt + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// A point on the spheroid at latitude p and longitude l, and the outward normal there.
const skin = (p, l) => [A * Math.cos(p) * Math.sin(l), CY + B * Math.sin(p), A * Math.cos(p) * Math.cos(l)];
const normal = (p, l) => new THREE.Vector3(Math.cos(p) * Math.sin(l) / A, Math.sin(p) / B, Math.cos(p) * Math.cos(l) / A).normalize();
// The gilded discs: convex dishes of stainless steel under gold leaf between glass, standing a
// hand off the skin on their stalks, the large ones (2.2 m) in rows round the sphere and a small
// one (1 m) in each gap between four of them. About 1,400 in all.
function discs() {
  const seg = detail.low ? 8 : 16, R = 2.38, th = Math.asin(1 / R);
  const dish = new THREE.SphereGeometry(R, seg, detail.low ? 2 : 3, 0, Math.PI * 2, 0, th).translate(0, -R * Math.cos(th), 0);
  const places = [], pitch = 2.36, up = new THREE.Vector3(0, 1, 0), o = new THREE.Object3D();
  const rows = [];
  for (let p = -1.2; p < 1.42;) { rows.push(p); p += pitch / Math.hypot(A * Math.sin(p), B * Math.cos(p)); }
  rows.forEach((p, i) => {
    const n = Math.round((2 * Math.PI * A * Math.cos(p)) / pitch), next = rows[i + 1];
    for (let k = 0; k < n; k++) {
      places.push([p, ((k + (i % 2) / 2) / n) * Math.PI * 2, 1.1]);
      if (next !== undefined) places.push([(p + next) / 2, ((k + 0.5 + (i % 2) / 2) / n) * Math.PI * 2, 0.5]);
    }
  });
  const im = new THREE.InstancedMesh(dish, M.gild, places.length);
  places.forEach(([p, l, s], i) => {
    const n = normal(p, l);
    o.position.set(...skin(p, l)).addScaledVector(n, 0.22);
    o.quaternion.setFromUnitVectors(up, n);
    o.scale.set(s, s * 1.15, s);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

export function buildMatrimandir() {
  const g = new THREE.Group(), f = new THREE.Group(), deg = Math.PI / 180;
  g.add(f);
  // The Peace Area: an oval of mown lawn in the forest Auroville planted on its red plateau.
  const lawn = mown(cyl(150, 150, 0.2, M.grass, 0, 0, 0, 72));
  lawn.scale.set(1.15, 1, 1);
  g.add(lawn);
  // The sphere: its skin of concrete under gold-coloured cladding, the discs standing off it; at
  // the crown the opening through which the heliostat sends its ray, under a low glazed cap.
  const ball = mesh(new THREE.SphereGeometry(1, detail.low ? 40 : 64, detail.low ? 24 : 40), M.gildDeep, 0, CY, 0);
  ball.scale.set(A, B, A);
  f.add(ball, discs());
  f.add(cyl(1.5, 1.9, 0.5, M.gild, 0, CY + B - 0.12, 0, 24));
  // The four pairs of piers that carry it, rising from the pond's edge at the four entrances, and
  // under it the lotus pond of white marble, its petals sloping to a crystal at the centre.
  for (let k = 0; k < 4; k++) {
    const a = k * 90 * deg + 45 * deg;
    for (const da of [-9, 9]) {
      const b = a + da * deg, foot = V(Math.sin(b) * 14.5, 0.2, Math.cos(b) * 14.5), head = V(Math.sin(b) * 9.5, 4.4, Math.cos(b) * 9.5);
      f.add(strut(foot, head, 1.5, M.gildDeep));
    }
  }
  f.add(cyl(11.5, 12.5, 0.5, M.marble, 0, 0.2, 0, 48), cyl(9.5, 9.5, 0.06, M.water, 0, 0.7, 0, 48), cyl(0.5, 0.5, 0.5, M.marble, 0, 0.7, 0, 16));
  // The twelve petals round it, and the paved ring they stand on.
  const pg = petal(P0, P1, 13.6 * deg, PH);
  for (let k = 0; k < PETALS; k++) f.add(mesh(pg, RED, 0, 0.2, 0).rotateY((k + 0.5) * 30 * deg));
  f.add(cyl(P1 + 2.5, P1 + 2.5, 0.08, RED_DARK, 0, 0.2, 0, 72));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.3, 0.2, 1], zoom: 0.7 };
}
