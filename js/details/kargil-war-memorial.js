import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, surface, photo, inst, unitBox, flag, tricolour, PAINT, hipRoof, mown } from '../helpers.js';
import { detail } from '../detail.js';
import { mergeByMaterial, railing } from '../parts/components.js';
import { trees, shrubs, lampPosts, along } from '../parts/realism.js';
import { figure, statue } from '../parts/sculpture.js';
import { PINK, PINK_DEEP, PAVE, T, PATH } from '../monuments/kargil-war-memorial.js';

// The Kargil War Memorial, finer detail and the rest of the site, after photographs. Dimensions
// follow js/monuments/kargil-war-memorial.js: the terrace 46 × 30 about the origin, its top at T;
// the flame's block with its face at z = -1; the OP VIJAY pylon at z = -4.6; the Wall of Heroes at
// z = -14.2; the Vijaypath from z = PATH[0] to the gate at PATH[1].
const TABLET = surface(mat('#5a4636', 0.5), 'script'), VERSE = surface(mat('#f1ece0', 0.6), 'script');
const BLACK = mat('#1c1c1e', 0.45), WHITE = mat('#ece9e2', 0.8), ROOF = mat('#b23a34', 0.7), MAROON = mat('#6e2430', 0.6, 0.2);
// The regiments' flags: plain cloth in the colours of the paint palette.
const CLOTH = PAINT.map((c) => surface(mat(c, 0.7), 'none'));
const HEADSTONE = mat('#e6dfd2', 0.8), PEBBLE = photo(mat('#cfc4b4', 0.9), 'rubble'), TERRACOTTA = mat('#b4553c', 0.8);

// On the terrace: the pierced railings round it and along the way to the flame, the lettered
// tablets, the small canopy over the flame, and the railing along the top of the wall with the
// flags of the regiments fanned out behind it.
function architecture(f) {
  const d = new THREE.Group(), rail = (len, x, z, ry = 0) => { const r = at(railing(len, 1.0, 0.22, PINK), x, T, z); r.rotation.y = ry; d.add(r); };
  for (const s of [-1, 1]) {
    rail(12.6, s * 16.2, 13.7); rail(29.6, s * 22.7, -1, Math.PI / 2);
    rail(8.6, s * 4.6, 7.6, Math.PI / 2);
    // The pylons' inscriptions.
    d.add(box(2.2, 2.6, 0.05, TABLET, s * 8, T + 1.0, 13.03));
  }
  const top = at(railing(38, 0.9, 0.2, PINK), 0, T + 3.65, -14.2);
  d.add(top);
  // The verse of Pushp ki Abhilasha on the face of the flame's block, and OP VIJAY on the pylon.
  d.add(box(4.6, 0.95, 0.05, VERSE, 0, T + 1.2, -0.97), box(1.5, 0.5, 0.05, TABLET, 0, T + 4.6, -3.52));
  // The canopy over the flame: four thin posts and a low pyramid of dark glass.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) d.add(cyl(0.035, 0.035, 2.0, BLACK, sx * 0.85, T + 2.35, -1.8 + sz * 0.7, 6));
  d.add(mesh(new THREE.ConeGeometry(1.5, 0.7, 4).rotateY(Math.PI / 4).translate(0, 0.35, 0), BLACK, 0, T + 4.35, -1.8));
  mergeByMaterial(d);
  f.add(d);
  // The regiments' flags behind the wall, leaning out to either side like a fan.
  const flags = new THREE.Group();
  for (let k = 0; k < 17; k++) {
    const x = -15 + k * 1.875, fl = at(flag(7.2, CLOTH[k % CLOTH.length], WHITE), x, T + 0.4, -16);
    fl.rotation.z = -(x / 15) * 0.42;
    flags.add(fl);
  }
  f.add(flags);
  // Roses in the terrace's lawns.
  f.add(shrubs(along(5, [-19, 9], [-10, 9]).concat(along(5, [10, 9], [19, 9])).map(([x, z]) => [x, z, 0.9]), { y: T, flowers: '#d0306f', seed: 4 }));
}

// The Vijaypath: its centre line and the white stones along its edges, the tricolours leaning in
// over it from both sides, the black busts of the decorated on their plinths, and at its head two
// red-roofed shelters.
function vijaypath(g) {
  const d = new THREE.Group(), [z0, z1] = PATH, dashes = [], stones = [];
  for (let z = z0 + 3; z < z1 - 3; z += 6) dashes.push([0, 0.32, z, 0.16, 0.012, 2.6, 0]);
  for (let z = z0 + 0.5; z < z1 - 8; z += 1.3) for (const s of [-1, 1]) stones.push([s * 3.9, 0.3, z, 0.45, 0.3, 0.7, 0]);
  d.add(inst(unitBox(), dashes, WHITE), inst(unitBox(), stones, WHITE));
  for (let k = 0; k < 10; k++) for (const s of [-1, 1]) {
    const fl = at(tricolour(5.4, 2.6), s * 5.2, 0.3, z0 + 9 + k * 14);
    // Each staff leans in over the road; the cloth flies along it, towards the gate.
    fl.rotation.set(0, -Math.PI / 2, 0);
    fl.rotateX(s * 0.4);
    d.add(fl);
  }
  const busts = new THREE.Group();
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) {
    const b = at(new THREE.Group(), s * 7.2, 0.3, z0 + 16 + k * 28);
    b.rotation.y = -s * Math.PI / 2;
    b.add(box(0.7, 1.25, 0.6, BLACK), box(0.85, 0.08, 0.75, BLACK, 0, 1.25, 0), box(0.5, 0.7, 0.03, TABLET, 0, 0.3, 0.31));
    b.add(at(mesh(new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.75, 0.6), BLACK), 0, 1.33, 0), cyl(0.07, 0.09, 0.14, BLACK, 0, 1.52, 0, 8), at(mesh(new THREE.SphereGeometry(0.15, 14, 10).scale(0.9, 1.1, 1), BLACK), 0, 1.8, 0.01));
    busts.add(b);
  }
  d.add(mergeByMaterial(busts));
  for (const s of [-1, 1]) {
    const sh = at(new THREE.Group(), s * 24, 0.3, z0 + 4);
    sh.add(box(6.4, 0.3, 6.4, PINK));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) sh.add(box(0.3, 2.6, 0.3, PINK, sx * 2.8, 0.3, sz * 2.8));
    sh.add(at(hipRoof(7.4, 7.4, 1.7, ROOF), 0, 2.9, 0));
    d.add(sh);
  }
  d.add(lampPosts(along(6, [-9.5, z0 + 20], [-9.5, z1 - 20]).concat(along(6, [9.5, z0 + 20], [9.5, z1 - 20])), { y: 0.3 }));
  g.add(d);
}

// The gate: pink walls lettered in red to either side, and between two piers a gateway under a
// red-roofed pediment, with a low red-roofed building behind each wall.
function gate(g) {
  const d = at(new THREE.Group(), 0, 0.2, PATH[1]);
  for (const s of [-1, 1]) {
    d.add(box(46, 3.2, 0.8, PINK, s * 29, 0, 0), box(46.4, 0.2, 1.1, PINK_DEEP, s * 29, 3.2, 0), box(24, 1.4, 0.05, surface(mat('#c9483c', 0.7), 'script'), s * 24, 1.1, 0.43));
    d.add(box(1.6, 5.2, 1.6, PINK, s * 5.6, 0, 0), box(18, 3.4, 9, PINK, s * 30, 0, -10), at(hipRoof(19.4, 10.4, 2.2, ROOF), s * 30, 3.4, -10));
  }
  d.add(box(13, 0.8, 1.8, PINK, 0, 5.2, 0));
  const tri = new THREE.Shape();
  tri.moveTo(-7.2, 0); tri.lineTo(7.2, 0); tri.lineTo(0, 2.6); tri.closePath();
  d.add(mesh(new THREE.ExtrudeGeometry(tri, { depth: 3.4, bevelEnabled: false }).translate(0, 0, -1.7), ROOF, 0, 6, 0), box(5, 0.9, 0.06, TABLET, 0, 6.3, 1.74));
  g.add(mergeByMaterial(d));
}

// Veer Bhoomi, to the left of the flame: rows of pale round-topped stones, one to a soldier, set in
// curves along red paths on a lawn; and above them, on a mound of rock under a line of flags, the
// soldiers raising the tricolour on a captured height.
function veerBhoomi(g) {
  const d = new THREE.Group(), cx = -62, cz = 46, list = [];
  d.add(mown(box(62, 0.1, 46, M.grass, cx, 0.2, cz - 22)));
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0); s.lineTo(-0.5, 0.5); s.absarc(0, 0.5, 0.5, Math.PI, 0, true); s.lineTo(0.5, 0); s.closePath();
  const stone = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 8 }).translate(0, 0, -0.5);
  for (let R = 14; R <= 34; R += 4) {
    const n = Math.round((R * 2.0) / 1.7);
    for (let k = 0; k <= n; k++) {
      const a = Math.PI * (1.14 + (0.64 * k) / n), x = cx + R * Math.cos(a), z = cz + R * Math.sin(a);
      list.push([x, 0.3, z, 0.62, 0.78, 0.1, Math.atan2(x - cx, z - cz) + Math.PI]);
    }
    // The red path behind each row.
    const pts = [];
    for (let k = 0; k <= 24; k++) { const a = Math.PI * (1.12 + (0.68 * k) / 24); pts.push(new THREE.Vector3(cx + (R + 1.9) * Math.cos(a), 0, cz + (R + 1.9) * Math.sin(a))); }
    const band = new THREE.Shape();
    band.moveTo(-0.7, 0); band.lineTo(0.7, 0); band.lineTo(0.7, 0.14); band.lineTo(-0.7, 0.14); band.closePath();
    d.add(mesh(new THREE.ExtrudeGeometry(band, { steps: 24, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(pts) }), PAVE, 0, 0.3, 0));
  }
  d.add(inst(stone, list, HEADSTONE));
  // The victory group on its mound.
  const m = at(new THREE.Group(), cx, 0.2, cz + 2), ROCK = mat('#8c8478', 0.95, 0, { flatShading: true });
  m.add(at(mesh(new THREE.IcosahedronGeometry(5, 0), ROCK), 0, 0.6, 0), at(mesh(new THREE.IcosahedronGeometry(3.2, 0), ROCK), 3.4, 0.2, 1.2), at(mesh(new THREE.IcosahedronGeometry(2.8, 0), ROCK), -3.6, 0, -0.6));
  for (const [x, z, ry] of [[-0.8, 0.2, 0.4], [0.6, -0.3, -0.5], [0, 0.9, 0]]) m.add(at(figure(1.9, M.bronze, 'standing'), x, 5.1, z).rotateY(Math.PI + ry));
  m.add(at(tricolour(5, 2), 0, 5.1, 0.2));
  for (let k = 0; k < 7; k++) m.add(at(flag(6.5, CLOTH[(k * 2) % CLOTH.length], WHITE), -9 + k * 3, 0.2, 7));
  d.add(m);
  g.add(d);
}

// The Hut of Remembrance (the Capt. Manoj Pandey gallery), to the right before the flame: walls
// faced in river pebbles, a horseshoe arch in terracotta at the door, and a maroon gabled roof
// carried forward over the porch on two posts. It faces the Vijaypath.
function hut(g) {
  const d = new THREE.Group(), gable = (w, h, len) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }).translate(0, 0, -len / 2); };
  d.add(box(13, 0.4, 14, PAVE), box(12, 3.6, 9, PEBBLE, 0, 0.4, -2), mesh(gable(13.4, 2.6, 13.6), MAROON, 0, 4.0, 0.2));
  for (const s of [-1, 1]) d.add(cyl(0.1, 0.1, 3.6, MAROON, s * 5.8, 0.4, 6.4, 8));
  // The horseshoe arch and the dark doorway in it; the board over it.
  d.add(mesh(new THREE.TorusGeometry(1.75, 0.38, 8, 28, Math.PI * 1.5).rotateZ(-Math.PI * 0.25), TERRACOTTA, 0, 2.2, 2.55), at(mesh(new THREE.CircleGeometry(1.6, 24), M.recess), 0, 2.2, 2.53), box(2.3, 1.5, 0.05, M.recess, 0, 0.4, 2.53));
  d.add(box(5.6, 0.7, 0.08, TABLET, 0, 6.3, 6.9), box(3.4, 0.12, 2.2, mat('#c9413a', 0.8), 0, 0.4, 4.4));
  d.position.set(40, 0.2, 14);
  d.rotation.y = -Math.PI / 2;
  g.add(mergeByMaterial(d));
}

// The MiG-21 shown on the lawn, as flown in the war: a silver dart with a delta wing, a nose cone
// in its intake and a swept fin, raised on stands. Its nose points to +z.
function mig21() {
  const g = new THREE.Group(), SILVER = mat('#b9bec3', 0.38, 0.75), CONE = mat('#5c6b4c', 0.6), GLASS = mat('#1f2a33', 0.2, 0.3);
  const tri = (pts, t) => { const s = new THREE.Shape(); pts.forEach(([x, z], i) => (i ? s.lineTo(x, z) : s.moveTo(x, z))); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }).translate(0, 0, -t / 2); };
  const body = new THREE.LatheGeometry([[0.36, 0], [0.5, 1.4], [0.62, 4], [0.62, 10.5], [0.52, 13.4], [0.45, 14.4]].map(([r, y]) => new THREE.Vector2(r, y)), 20).rotateX(-Math.PI / 2);
  g.add(mesh(body, SILVER), mesh(new THREE.ConeGeometry(0.26, 1.1, 14).rotateX(Math.PI / 2).translate(0, 0, 0.35), CONE));
  g.add(at(mesh(new THREE.SphereGeometry(0.42, 14, 10).scale(1, 0.8, 2.6), GLASS), 0, 0.48, -3.4));
  // The delta wing and the tailplanes lie flat; the fin stands up.
  for (const s of [-1, 1]) {
    g.add(mesh(tri([[0.5, -5.2], [3.6, -10.4], [0.5, -10.6]].map(([x, z]) => [s * x, z]), 0.1).rotateX(Math.PI / 2), SILVER, 0, -0.1, 0));
    g.add(mesh(tri([[0.4, -12], [1.9, -14.1], [0.4, -14.3]].map(([x, z]) => [s * x, z]), 0.08).rotateX(Math.PI / 2), SILVER, 0, 0, 0));
  }
  g.add(mesh(tri([[10.6, 0.5], [13.9, 2.9], [14.6, 2.9], [14.3, 0.5]], 0.1).rotateY(Math.PI / 2), SILVER));
  // The fuselage runs back from its nose at z = 0. Two stands carry it clear of the lawn.
  const stand = new THREE.Group();
  stand.add(cyl(0.12, 0.16, 1.5, BLACK, 0, 0, -3.5, 8), cyl(0.12, 0.16, 1.5, BLACK, -1.6, 0, -9.5, 8), cyl(0.12, 0.16, 1.5, BLACK, 1.6, 0, -9.5, 8));
  const plane = at(g, 0, 2.1, 0);
  return new THREE.Group().add(stand, plane);
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
function weapons(g) {
  const d = new THREE.Group(), kinds = [mortar, aaGun, machineGun, machineGun, aaGun, mortar];
  kinds.forEach((make, k) => {
    // A row of low plinths along the right-hand lawn, each weapon facing the road.
    const p = at(new THREE.Group(), 14, 0.3, PATH[0] + 52 + k * 9);
    p.rotation.y = -Math.PI / 2;
    p.add(box(3.2, 0.6, 2.6, STONE), box(3.4, 0.08, 2.8, mat('#8a7f70', 0.85), 0, 0.6, 0), box(1.4, 0.4, 0.04, PLATE, 0, 0.12, 1.32));
    const w = at(make(), 0, 0.68, 0);
    w.rotation.y = Math.PI + (k - 2.5) * 0.08;
    if (make !== aaGun) w.scale.setScalar(1.3);
    p.add(w);
    d.add(p);
  });
  g.add(mergeByMaterial(d));
}
export function addDetails(f, g) {
  architecture(f);
  vijaypath(g);
  gate(g);
  veerBhoomi(g);
  hut(g);
  // The Bofors guns on the left-hand lawn, their barrels raised towards the heights, and the
  // MiG-21 on the right.
  for (const [x, z, ry, el] of [[-16, PATH[0] + 30, 2.6, 0.5], [-20, PATH[0] + 66, 2.9, 0.42], [-15, PATH[0] + 104, 2.5, 0.3]]) g.add(at(howitzer(el), x, 0.3, z).rotateY(ry));
  g.add(at(mig21(), 19, 0.3, PATH[0] + 22).rotateY(0.5));
  weapons(g);
  // The soldier with his rifle raised, on a mound of ammunition boxes painted green.
  const mound = at(new THREE.Group(), 22, 0.3, PATH[0] + 124), GREEN = mat('#2f6b4a', 0.7);
  for (const [w, y] of [[5, 0], [3.8, 0.6], [2.6, 1.2]]) mound.add(box(w, 0.6, w * 0.8, GREEN, 0, y, 0));
  mound.add(at(statue(3.2, M.bronze, 'standing', GREEN), 0, 1.8, 0).rotateY(-Math.PI / 2));
  g.add(mound);
  // Poplars and willows, as the valley grows them, round the edges of the grounds.
  const edge = along(9, [-34, PATH[0] + 6], [-34, PATH[1] - 30]).concat(along(9, [34, PATH[0] + 30], [34, PATH[1] - 30]), along(7, [-30, -24], [30, -24]));
  g.add(trees(edge.filter((_, k) => k % 3 !== 1), { kind: 'poplar', seed: 5 }), trees(edge.filter((_, k) => k % 3 === 1), { kind: 'willow', seed: 6 }));
}
