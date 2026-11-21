import * as THREE from 'three';
import { mat, mesh, box, cyl, at, surface } from '../helpers.js';
import { detail } from '../detail.js';
import { mergeByMaterial } from '../parts/components.js';

// The Kargil War Memorial, finer detail. From photographs: the curved pink sandstone wall is set
// with bronze-lettered tablets bearing the names of the fallen, in a row along its inner face; and
// the plinth of the flame carries a lettered tablet on its front.
// Dimensions follow js/monuments/kargil-war-memorial.js: the wall on the ellipse 34 × 26 (opening
// to +z), 1.4 thick, from 0.6 to 6.6; the flame's plinth 4 square at (0, 0.6, -6).
const TABLET = surface(mat('#5a4636', 0.5), 'script');
function architecture(f) {
  const d = new THREE.Group(), from = Math.PI * 0.15 - 0.057, to = Math.PI * 0.85 + 0.057, n = 36;
  for (let k = 0; k < n; k++) {
    const a = from + ((k + 0.5) / n) * (to - from), x = 34 * Math.cos(a), z = -26 * Math.sin(a);
    const nx = Math.cos(a) / 34, nz = Math.sin(a) / -26, l = Math.hypot(nx, nz), ry = Math.atan2(-nx / l, -nz / l);
    const t = box(1.6, 2.2, 0.06, TABLET, 0, 2.4, 0);
    t.position.set(x - (nx / l) * 0.73, 2.4, z - (nz / l) * 0.73);
    t.rotation.y = ry;
    d.add(t);
  }
  d.add(box(3, 1.4, 0.05, TABLET, 0, 1.2, -3.97));
  mergeByMaterial(d);
  f.add(d);
}

// The Kargil War Memorial at Drass: the guns of the war shown on the plaza. Three towed 155 mm
// howitzers, as the Bofors guns that fired on the heights, each with its long barrel and muzzle
// brake on a cradle with the recoil cylinders over it, a low shield, two big wheels and a split
// trail spread back to its spades; and along the front of the plaza a row of six low plinths with
// the captured weapons on them, each with a lettered plate: mortars, twin anti-aircraft guns and
// heavy machine guns on tripods.
const OLIVE = mat('#4d5a3a', 0.8), GUN = mat('#3c4433', 0.6, 0.4), TYRE = mat('#1d1d1d', 0.9), DARK = mat('#151515', 0.8);
const STONE = mat('#9a8f80', 0.85), PLATE = surface(mat('#5a4636', 0.5), 'script');
const rod = (r0, r1, len, m, n = 10) => mesh(new THREE.CylinderGeometry(r1, r0, len, n).rotateX(Math.PI / 2).translate(0, 0, len / 2), m);
// A tube from a to b ([x, y, z]), radius r.
function strut(a, b, r, m) {
  const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), o = mesh(new THREE.CylinderGeometry(r, r, v.length(), 8), m);
  o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
  return o;
}
function wheel(r, t, x, y, z) {
  const w = new THREE.Group();
  w.add(mesh(new THREE.CylinderGeometry(r, r, t, 18).rotateZ(Math.PI / 2), TYRE), mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, t + 0.04, 12).rotateZ(Math.PI / 2), OLIVE), mesh(new THREE.CylinderGeometry(r * 0.18, r * 0.18, t + 0.12, 8).rotateZ(Math.PI / 2), GUN));
  return at(w, x, y, z);
}
// The howitzer, its muzzle towards +z, elevated `el`.
function howitzer(el = 0.22) {
  const g = new THREE.Group(), fine = !detail.low;
  // The carriage: the saddle on the axle between the wheels.
  g.add(box(1.7, 0.55, 1.6, OLIVE, 0, 0.75, 0.2), box(2.3, 0.2, 0.3, GUN, 0, 0.75, 0.2), wheel(0.68, 0.42, -1.3, 0.68, 0.2), wheel(0.68, 0.42, 1.3, 0.68, 0.2));
  // The elevating mass: cradle, barrel, muzzle brake, breech and the recoil cylinders, on trunnions.
  const e = at(new THREE.Group(), 0, 1.65, 0.3);
  e.rotation.x = -el;
  e.add(box(0.75, 0.6, 3.4, OLIVE, 0, 0, -0.2), box(0.9, 0.75, 0.9, GUN, 0, 0, -2.2));
  e.add(at(rod(0.2, 0.14, 6.2, GUN, 14), 0, 0, 1.4), at(rod(0.17, 0.17, 0.9, GUN), 0, 0, 7.6));
  if (fine) {
    e.add(box(0.62, 0.36, 0.8, GUN, 0, 0, 8.0), at(mesh(new THREE.CircleGeometry(0.1, 10), DARK), 0, 0, 8.41));
    for (const s of [-1, 1]) e.add(at(rod(0.12, 0.12, 3.1, OLIVE, 8), s * 0.2, 0.42, -1.8), box(0.04, 0.24, 0.5, DARK, s * 0.32, 0, 8.0));
    e.add(box(0.3, 0.3, 0.5, GUN, -0.55, 0.25, -0.8), box(0.08, 0.2, 0.3, DARK, -0.55, 0.48, -0.8));
  }
  e.add(box(0.12, 0.16, 0.8, GUN, 0, 0.1, -2.75));
  g.add(e);
  // The shield: two plates either side of the cradle, raked back.
  for (const s of [-1, 1]) { const sh = box(1.1, 1.1, 0.08, OLIVE, s * 0.85, 1.55, 0.95); sh.rotation.set(-0.15, s * -0.25, 0); g.add(sh); }
  // The split trail spread back from the carriage to its spades.
  for (const s of [-1, 1]) {
    const t = at(new THREE.Group(), s * 0.35, 0.65, -0.4);
    t.rotation.set(-0.08, s * 0.28, 0);
    t.add(box(0.32, 0.38, 5.2, OLIVE, 0, 0, -2.6), box(0.9, 0.5, 0.08, GUN, 0, -0.35, -5.2));
    if (fine) t.add(box(0.06, 0.06, 0.6, GUN, 0, 0.3, -4.4), box(0.06, 0.25, 0.06, GUN, 0, 0.18, -4.1), box(0.06, 0.25, 0.06, GUN, 0, 0.18, -4.7));
    g.add(t);
    if (fine) g.add(strut([s * 0.5, 0.95, 0.4], [s * 0.42, 2.05, 1.6], 0.07, OLIVE));
  }
  return g;
}
// A mortar on its baseplate, the barrel on a bipod.
function mortar() {
  const g = new THREE.Group();
  g.add(cyl(0.45, 0.5, 0.1, GUN, 0, 0, 0, 14));
  const b = at(rod(0.075, 0.07, 1.6, GUN), 0, 0.12, -0.1);
  b.rotation.x = -0.95;
  g.add(b);
  for (const s of [-1, 1]) g.add(strut([0, 0.75, 0.52], [s * 0.45, 0, 0.85], 0.03, GUN));
  g.add(box(0.12, 0.14, 0.2, OLIVE, 0.12, 0.72, 0.52), box(0.9, 0.04, 0.04, GUN, 0, 0.45, 0.68));
  return g;
}
// A twin-barrelled anti-aircraft gun on its low carriage, with its two seats.
function aaGun() {
  const g = new THREE.Group();
  g.add(box(1.4, 0.25, 1.8, OLIVE, 0, 0.35, 0), wheel(0.35, 0.2, -0.85, 0.35, -0.1), wheel(0.35, 0.2, 0.85, 0.35, -0.1));
  g.add(cyl(0.45, 0.5, 0.3, GUN, 0, 0.6, 0, 12), box(0.9, 0.55, 0.7, OLIVE, 0, 1.05, 0));
  for (const s of [-1, 1]) {
    const b = at(rod(0.05, 0.04, 2.4, GUN, 8), s * 0.22, 1.2, 0.2);
    b.rotation.x = -0.6;
    g.add(b, box(0.32, 0.06, 0.32, GUN, s * 0.62, 0.9, -0.45), box(0.06, 0.4, 0.06, GUN, s * 0.62, 0.68, -0.45));
  }
  return g;
}
// A heavy machine gun on a tripod.
function machineGun() {
  const g = new THREE.Group();
  for (const [x, z] of [[-0.45, -0.4], [0.45, -0.4], [0, 0.55]]) g.add(strut([0, 0.7, 0], [x, 0, z], 0.03, GUN));
  g.add(box(0.2, 0.22, 1.0, GUN, 0, 0.84, -0.1), at(rod(0.05, 0.04, 1.1, GUN, 8), 0, 0.86, 0.4), box(0.04, 0.3, 0.04, GUN, 0, 1.0, -0.4));
  g.add(box(0.26, 0.2, 0.28, OLIVE, 0.2, 0.75, 0.05));
  return g;
}
function weapons(f) {
  const d = new THREE.Group(), kinds = [mortar, aaGun, machineGun, machineGun, aaGun, mortar];
  kinds.forEach((make, k) => {
    const x = -20 + k * 8, p = at(new THREE.Group(), x, 0.6, 26);
    p.add(box(3.2, 0.6, 2.6, STONE), box(3.4, 0.08, 2.8, mat('#8a7f70', 0.85), 0, 0.6, 0), box(1.4, 0.4, 0.04, PLATE, 0, 0.12, 1.32));
    const w = at(make(), 0, 0.68, 0);
    w.rotation.y = Math.PI + (k - 2.5) * 0.08;
    if (make !== aaGun) w.scale.setScalar(1.3);
    p.add(w);
    d.add(p);
  });
  f.add(mergeByMaterial(d));
}
export function addDetails(f, g) {
  architecture(f);
  for (const [x, z, ry] of [[24, 14, -0.6], [32, 6, -1.0], [-38, 0, 0.5]]) f.add(at(howitzer(0.2 + (x > 0 ? 0.1 : 0)), x, 0.6, z).rotateY(ry));
  weapons(f);
}
