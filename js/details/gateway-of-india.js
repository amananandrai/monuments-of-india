import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, kalash, hemi, finial, inst, unitBox } from '../helpers.js';
import {
  jali, archCurve, archRing, archSlab, tympanum, bracketGeo, placeAll, alongFace, chhajja, railingRing,
  arcadeScreen, mughalChhatri, mergeByMaterial,
} from './components.js';
import { lampPosts, boats, launches, ships, along } from './realism.js';
import { horse } from './animals.js';
import { shivajiBody } from './figures.js';

// Gateway of India, finer detail (George Wittet, 1913–24). From photographs and descriptions
// (Britannica, Victorian Web, the CyArk scan on Google Arts & Culture): a Roman triumphal arch
// dressed in 16th-century Gujarati detail, in yellow basalt:
// - the great arch in two moulded orders, its spandrels filled with pierced stone lattice (jali);
// - tall windows on the piers either side, each on a small bracketed sill;
// - a sloping eave (chhajja) on carved brackets under the attic, which is lined with a blind
//   arcade of screened niches, and a pierced parapet with pinnacles along the roof;
// - four octagonal turrets at the corners of the central hall, with tiers of niches, a bracketed
//   balcony near the top, and an open domed kiosk;
// - jali screens in the heads of the side arches, moulded rings round the side halls' pointed
//   arches, their own eaves and parapets, and small domed turrets at their outer corners.
// Dimensions follow js/monuments/gateway-of-india.js: pavement p, podium b, central faces at
// z = ±7 and x = ±9, side halls from x = ±9 to ±18.

const CARVE = mat('#cfb37f', 0.82); // the dressed basalt of the carving, a shade lighter

// The panel between an arch of radius R (springing at s) and a rectangle w wide reaching up to
// `top`: the spandrels of a gateway, as one slab, its back at z = 0.
function spandrels(w, R, s, top, m, depth) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, s); sh.lineTo(-R, s);
  archCurve(R, s, false).slice(1, -1).forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(R, s); sh.lineTo(w / 2, s); sh.lineTo(w / 2, top); sh.lineTo(-w / 2, top); sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// An octagonal turret of radius r with its shaft h high: banded, with two tiers of niches, an
// optional bracketed balcony near the top, and a domed kiosk. Stands on y = 0.
export function gatewayTurret(r, h, m, { balcony = true, kiosk = 3.6 } = {}) {
  const t = new THREE.Group(), oct = (o) => { o.rotation.y = Math.PI / 8; return o; };
  t.add(oct(cyl(r * 1.25, r * 1.3, 0.9, m, 0, 0, 0, 8)));
  t.add(oct(cyl(r, r * 1.04, h - 0.9, m, 0, 0.9, 0, 8)));
  for (const k of [0.3, 0.56]) t.add(oct(cyl(r * 1.1, r * 1.1, 0.25, CARVE, 0, h * k, 0, 8)));
  // Niches on each face of the octagon, in two tiers.
  const flat = 2 * r * Math.sin(Math.PI / 8);
  for (const k of [0.36, 0.62]) {
    const y = h * k, rr = r * (1.04 - 0.04 * k) * Math.cos(Math.PI / 8);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      t.add(onFace(at(archSlab(flat * 0.5, Math.min(2.4, h * 0.11), true, M.recess, 0.08), 0, y, 0), a, rr - 0.04));
      t.add(onFace(at(archRing(flat * 0.5, Math.min(2.4, h * 0.11), true, flat * 0.07, 0.07, CARVE), 0, y, 0), a, rr - 0.01));
    }
  }
  if (balcony) {
    const y = h * 0.86, R = r + 0.55;
    t.add(oct(cyl(R * 0.96, r * 1.02, 0.45, CARVE, 0, y - 0.45, 0, 8)));
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      t.add(onFace(mesh(bracketGeo(0.9, R - r, 0.24), CARVE, 0, y - 0.45, 0), a, r * Math.cos(Math.PI / 8)));
    }
    t.add(oct(cyl(R, R, 0.2, CARVE, 0, y, 0, 8)));
    t.add(at(railingRing(R - 0.08, 0.85, CARVE), 0, y + 0.2, 0));
  }
  t.add(oct(cyl(r * 1.18, r * 1.0, 0.35, CARVE, 0, h, 0, 8)));
  t.add(at(mughalChhatri(r * 0.98, r * kiosk, m, { crescent: false, eave: CARVE }), 0, h + 0.35, 0));
  return t;
}

export function addGatewayDetails(f, { p, b }) {
  const m = M.basalt, d = new THREE.Group();
  const screen = jali(CARVE);
  for (const a of [0, Math.PI]) {
    // The great arch in two orders.
    d.add(onFace(at(archRing(8.5, 16, false, 0.45, 0.2, CARVE), 0, p, 0), a, 7));
    d.add(onFace(at(archRing(10.1, 16.8, false, 0.22, 0.12, CARVE), 0, p, 0), a, 7));
    // Lattice spandrels over a dark backing, framed by a moulding along their top.
    d.add(onFace(at(spandrels(14, 5.3, 11.75, 18.6, M.recess, 0.04), 0, p, 0), a, 7.0));
    d.add(onFace(at(spandrels(14, 5.3, 11.75, 18.6, screen, 0.08), 0, p, 0), a, 7.06));
    d.add(onFace(box(14.2, 0.4, 0.2, CARVE, 0, p + 18.6, 0), a, 7.05));
    // Windows on the piers: a screened arch on a bracketed sill, in two tiers.
    for (const x of [-6.2, 6.2]) for (const y of [1.6, 6.6]) {
      d.add(onFace(at(archSlab(1.2, 3.2, true, M.recess, 0.05), 0, p + y, 0), a, 7.0, x));
      d.add(onFace(at(archSlab(1.2, 3.2, true, screen, 0.06), 0, p + y, 0), a, 7.05, x));
      d.add(onFace(at(archRing(1.2, 3.2, true, 0.16, 0.1, CARVE), 0, p + y, 0), a, 7.0, x));
      d.add(onFace(box(1.8, 0.18, 0.45, CARVE, 0, p + y - 0.18, 0), a, 7.2, x));
      for (const dx of [-0.6, 0.6]) d.add(onFace(mesh(bracketGeo(0.55, 0.42, 0.16), CARVE, 0, p + y - 0.18, 0), a, 7.0, x + dx));
    }
  }
  // The eave under the attic on all four sides of the central hall, on brackets.
  const eaves = [[0, 7, 14], [Math.PI, 7, 14], [Math.PI / 2, 9, 10.4], [-Math.PI / 2, 9, 10.4]];
  for (const [a, dist, len] of eaves) {
    d.add(onFace(chhajja(len, 1.3, 0.55, 0.14, CARVE), a, dist).translateY(b + 18));
    d.add(placeAll(bracketGeo(0.85, 1.05, 0.26), alongFace(a, dist, len - 0.8, Math.round(len / 1.6), b + 17.86), CARVE));
  }
  // The attic: a blind arcade of screened niches; then the parapet along the roof.
  const attic = [[0, 7.5, 7, 2.0], [Math.PI, 7.5, 7, 2.0], [Math.PI / 2, 9.5, 5, 2.0], [-Math.PI / 2, 9.5, 5, 2.0]];
  for (const [a, dist, n, step] of attic) {
    for (let k = 0; k < n; k++) {
      const lat = (k - (n - 1) / 2) * step;
      d.add(onFace(at(archSlab(1.3, 1.8, true, M.recess, 0.04), 0, b + 18.4, 0), a, dist, lat));
      d.add(onFace(at(archSlab(1.3, 1.8, true, screen, 0.05), 0, b + 18.4, 0), a, dist + 0.04, lat));
      d.add(onFace(at(archRing(1.3, 1.8, true, 0.14, 0.08, CARVE), 0, b + 18.4, 0), a, dist, lat));
    }
  }
  const roof = [[0, 7.65, 13.6, 10], [Math.PI, 7.65, 13.6, 10], [Math.PI / 2, 9.65, 9.6, 7], [-Math.PI / 2, 9.65, 9.6, 7]];
  for (const [a, dist, len, n] of roof) {
    d.add(onFace(at(arcadeScreen(len, 1.1, n, 0.75, 0.72, 0.22, CARVE), 0, b + 21.4, 0), a, dist));
    for (const lat of a === 0 || a === Math.PI ? [-3.4, 3.4] : [0]) {
      d.add(onFace(box(0.55, 1.5, 0.55, CARVE, 0, b + 21.4, 0), a, dist, lat), onFace(at(kalash(0.7, CARVE), 0, b + 22.9, 0), a, dist, lat));
    }
  }
  // Screens in the heads of the central hall's side arches.
  for (const sx of [-1, 1]) d.add(at(tympanum(5.2, 11, false, screen, 0.1), sx * 8.15, p, 0).rotateY(Math.PI / 2));
  // The side halls: rings and screens in their pointed arches, an eave and a parapet.
  for (const s of [-1, 1]) {
    for (const sz of [-1, 1]) {
      d.add(at(archRing(4.2, 8.5, true, 0.28, 0.1, CARVE), s * 13.5, b, sz * 4.5).rotateY(sz > 0 ? 0 : Math.PI));
      d.add(at(tympanum(4.2, 8.5, true, screen, 0.08), s * 13.5, b, sz * 4 - 0.04));
      d.add(onFace(chhajja(8.0, 1.0, 0.45, 0.12, CARVE), sz > 0 ? 0 : Math.PI, 4.5, s * 13.5 * (sz > 0 ? 1 : -1)).translateY(b + 11));
      d.add(onFace(at(arcadeScreen(7.6, 0.95, 6, 0.75, 0.6, 0.2, CARVE), 0, b + 12, 0), sz > 0 ? 0 : Math.PI, 4.75, s * 13.15 * (sz > 0 ? 1 : -1)));
    }
    const ea = s > 0 ? Math.PI / 2 : -Math.PI / 2;
    d.add(onFace(at(archRing(4.2, 8.5, true, 0.28, 0.1, CARVE), 0, b, 0), ea, 18));
    d.add(onFace(at(tympanum(4.2, 8.5, true, screen, 0.08), 0, b, 0), ea, 17.46));
    d.add(onFace(chhajja(6.4, 1.0, 0.45, 0.12, CARVE), ea, 18).translateY(b + 11));
    d.add(onFace(at(arcadeScreen(6.2, 0.95, 5, 0.75, 0.6, 0.2, CARVE), 0, b + 12, 0), ea, 18.2));
    // Small domed turrets at the outer corners.
    for (const z of [-4.2, 4.2]) d.add(at(gatewayTurret(0.9, 12.6, m, { balcony: false, kiosk: 3.4 }), s * 17.8, b, z));
  }
  // The four turrets of the central hall.
  for (const x of [-8.6, 8.6]) for (const z of [-6.6, 6.6]) d.add(at(gatewayTurret(1.45, b + 21.4 - p, m, { kiosk: 2.2 }), x, p, z));
  f.add(mergeByMaterial(d));
}

// Apollo Bunder round the Gateway: the bronze equestrian statue of Chhatrapati Shivaji on its
// pedestal facing the Gateway (shivajiStatue(), below), the ferries to Elephanta tied up at the
// jetties and boats out in the harbour, and lamps along the sea wall.
// The Taj Mahal Palace hotel (1903) beside the Gateway, facing the harbour: a long range of grey
// basalt and cream stone, six storeys of arched windows banded in white, wings ending in turrets,
// and at its middle the great red-tiled dome on its drum, with smaller domes at the corners.
function tajHotel() {
  const g = new THREE.Group(), STONE = mat('#9a948a', 0.85), TRIM = mat('#ece6d8', 0.8), RED = mat('#b4452f', 0.6), L = 120, D = 26, H = 30;
  g.add(box(L, H, D, STONE));
  const win = [], bands = [];
  for (let fl = 0; fl < 6; fl++) {
    bands.push([0, fl * 5 + 0.2, D / 2 + 0.15, L + 0.4, 0.5, 0.3]);
    for (let x = -L / 2 + 2.5; x < L / 2 - 2; x += 3.6) win.push([x, fl * 5 + 1.4, D / 2 + 0.05, 1.6, 2.8, 0.15]);
  }
  g.add(inst(unitBox(), win, M.recess), inst(unitBox(), bands, TRIM), box(L + 1, 1, D + 1, TRIM, 0, H));
  for (const sx of [-1, 1]) {
    g.add(box(16, H + 6, D + 4, STONE, sx * (L / 2 - 6), 0, 0), box(17, 1, D + 5, TRIM, sx * (L / 2 - 6), H + 6));
    for (const sz of [-1, 1]) g.add(cyl(2.4, 2.4, 6, TRIM, sx * (L / 2 - 6) + sz * 6, H + 7, D / 2, 12), at(hemi(2.6, RED, 14), sx * (L / 2 - 6) + sz * 6, H + 13, D / 2));
  }
  g.add(box(26, 8, 26, STONE, 0, H, -2), cyl(9, 9, 6, TRIM, 0, H + 8, -2, 24));
  g.add(at(mesh(new THREE.LatheGeometry([[9.2, 0], [9.6, 3], [8.6, 7], [6, 10.6], [2.6, 12.6], [0, 13.2]].map(([r, y]) => new THREE.Vector2(r, y)), 24), RED), 0, H + 14, -2), at(finial(3), 0, H + 27, -2));
  return mergeByMaterial(g);
}

export function addDetails(f, g) {
  // Far enough off that the camera, orbiting the Gateway, never enters it.
  g.add(at(tajHotel(), -165, 0, -105).rotateY(0.35));
  g.add(at(shivajiStatue(), 0, 0, -48));
  // The Elephanta ferry launches moored bow-out along the harbour wall, either side of the steps;
  // small boats out in the harbour; and ships at anchor in the roads beyond.
  g.add(launches([[-36, 22, 0.05], [-29, 22, -0.04], [-22, 22, 0.03], [24, 22, -0.03], [31, 22, 0.04], [38, 22, -0.02]], { y: 0.1 }));
  g.add(boats([[-80, 90, 1.1], [60, 120, 2.3], [140, 70, 0.4], [-150, 140, 2.9], [10, 180, 1.7]], { y: 0.1, size: 2 }));
  g.add(ships([[-210, 255, 0.35], [190, 270, 2.0]], { y: 0.1 }));
  g.add(lampPosts(along(10, [-34, 2.5], [34, 2.5])));
}

// The equestrian statue of Chhatrapati Shivaji (unveiled 1961) in its railed garden, facing the
// Gateway, after photographs. The bronze horse prances, its left foreleg raised high (animals.js);
// the rider (js/details/figures.js) sits upright, the reins in his left hand and the curved sword
// held low in his right, its blade pointing forward along the horse's flank; a tasselled cord
// hangs at the horse's throat. The pedestal is of yellow stone: a shaft tapering a little on a
// broad plinth, capped in dark stone, with the bronze round shield and crossed swords on each long
// side and a plaque on the front of the plinth.
function taperBox(wb, db, wt, dt, h, m) {
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const top = p.getY(i) > 0.5; p.setX(i, p.getX(i) * (top ? wt : wb)); p.setZ(i, p.getZ(i) * (top ? dt : db)); p.setY(i, p.getY(i) * h); }
  geo.computeVertexNormals();
  return mesh(geo, m);
}
// A curved sword (talwar) lying along +z from its hilt at the origin: grip, guard, pommel and a
// blade curving up a little to its point, flat across x.
function talwar(L, m) {
  const g = new THREE.Group(), sh = new THREE.Shape();
  sh.moveTo(0, -0.035); sh.quadraticCurveTo(L * 0.6, -0.03, L, 0.09); sh.quadraticCurveTo(L * 0.6, 0.02, 0, 0.035); sh.closePath();
  const blade = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }).translate(0, 0, -0.01).rotateY(-Math.PI / 2);
  g.add(mesh(blade, m).translateZ(0.12), box(0.05, 0.03, 0.16, m, 0, -0.015, 0.06), cyl(0.025, 0.025, 0.2, m, 0, 0, -0.08, 8).rotateX(Math.PI / 2));
  g.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), m, 0, 0, -0.2));
  return g;
}
export function shivajiStatue() {
  const g = new THREE.Group(), STONE = mat('#b39a74', 0.85), CAP = mat('#4c4844', 0.55), B = M.bronze, Hp = 5.8;
  g.add(box(5.4, 0.3, 7.8, STONE), box(4.8, 1.4, 7.2, STONE, 0, 0.3), taperBox(3.4, 5.8, 3.0, 5.4, 3.8, STONE).translateY(1.7), box(3.4, 0.3, 5.8, CAP, 0, 5.5));
  g.add(box(1.6, 0.8, 0.06, mat('#1d1d1f', 0.4), 0, 0.6, 3.61));
  // The emblem on each long side of the shaft: a round shield with its bosses, two curved swords
  // crossed behind it with their blades rising like horns.
  for (const sx of [-1, 1]) {
    const e = at(new THREE.Group(), sx * 1.66, 3.6, 0);
    e.rotation.y = sx * Math.PI / 2;
    const shield = mesh(new THREE.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), B);
    shield.rotation.x = Math.PI / 2;
    shield.scale.set(1, 0.35, 1);
    e.add(shield);
    for (const [x, y] of [[0.16, 0.16], [-0.16, 0.16], [0.16, -0.16], [-0.16, -0.16]]) e.add(mesh(new THREE.SphereGeometry(0.06, 8, 6), B, x, y, 0.17));
    for (const s of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([[s * 0.75, -0.75, 0.05], [s * 0.2, -0.15, 0.08], [-s * 0.45, 0.45, 0.08], [-s * 0.55, 0.95, 0.05]].map((q) => new THREE.Vector3(...q)));
      e.add(mesh(new THREE.TubeGeometry(curve, 16, 0.045, 5, false), B));
    }
    g.add(e);
  }
  // The horse and its rider, at 0.85 of the horse's own units (js/details/animals.js), so the horse
  // stands about 2.4 m at the withers.
  const eq = new THREE.Group();
  eq.add(horse(B, { prance: true }));
  const rider = shivajiBody(B);
  rider.position.set(0, 2.84, -0.15);
  rider.scale.setScalar(2.1);
  eq.add(rider);
  const sword = talwar(1.3, B);
  sword.position.set(-0.72, 3.21, -0.43);
  sword.rotation.y = -0.06;
  eq.add(sword);
  // The reins from each side of the bit to his left hand; the cord and tassel at the horse's
  // throat; the stirrups and their straps.
  for (const sx of [-1, 1]) {
    const reins = new THREE.CatmullRomCurve3([[sx * 0.16, 3.25, 2.45], [sx * 0.24, 3.1, 1.9], [sx * 0.2, 3.25, 1.2], [0.19, 3.72, 0.62]].map((q) => new THREE.Vector3(...q)));
    eq.add(mesh(new THREE.TubeGeometry(reins, 24, 0.025, 5, false), B));
    const strap = new THREE.CatmullRomCurve3([[sx * 0.5, 2.72, -0.1], [sx * 0.68, 2.05, 0.18], [sx * 0.72, 1.42, 0.38]].map((q) => new THREE.Vector3(...q)));
    eq.add(mesh(new THREE.TubeGeometry(strap, 10, 0.022, 4, false), B));
    const stirrup = mesh(new THREE.TorusGeometry(0.1, 0.02, 5, 12), B, sx * 0.72, 1.32, 0.38);
    stirrup.rotation.y = Math.PI / 2;
    eq.add(stirrup);
  }
  eq.add(cyl(0.025, 0.025, 0.5, B, 0, 2.6, 2.02, 5), mesh(new THREE.ConeGeometry(0.12, 0.5, 10).translate(0, -0.25, 0), B, 0, 2.62, 2.02));
  eq.scale.setScalar(0.85);
  eq.position.y = Hp;
  g.add(eq);
  // The garden: a lawn behind railings with spear-headed bars, open on the side towards the Gateway.
  const lawn = box(18, 0.12, 22, M.grass, 0, 0, 0), bars = [], tips = [];
  for (const [x0, z0, x1, z1] of [[-9, -11, 9, -11], [-9, -11, -9, 11], [9, -11, 9, 11], [-9, 11, -2.5, 11], [2.5, 11, 9, 11]]) {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 0.3);
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, z = z0 + ((z1 - z0) * i) / n; bars.push([x, 0, z, 0.035, 1.6, 0.035]); tips.push([x, 1.6, z, 0.09, 0.22, 0.09]); }
  }
  const rails = [[0, 0.3, -11, 18, 0.05, 0.05], [0, 1.4, -11, 18, 0.05, 0.05], [-9, 0.3, 0, 0.05, 0.05, 22], [-9, 1.4, 0, 0.05, 0.05, 22], [9, 0.3, 0, 0.05, 0.05, 22], [9, 1.4, 0, 0.05, 0.05, 22], [-5.75, 0.3, 11, 6.5, 0.05, 0.05], [-5.75, 1.4, 11, 6.5, 0.05, 0.05], [5.75, 0.3, 11, 6.5, 0.05, 0.05], [5.75, 1.4, 11, 6.5, 0.05, 0.05]];
  const IRON = mat('#2a2826', 0.6, 0.4);
  g.add(lawn, inst(unitBox(), [...bars, ...rails], IRON), inst(new THREE.ConeGeometry(0.5, 1, 4), tips.map(([x, y, z, sx, sy, sz]) => [x, y + sy / 2, z, sx, sy, sz]), IRON));
  return g;
}
