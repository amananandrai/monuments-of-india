import * as THREE from 'three';
import { mat, mesh, box, cyl, at, inst, unitBox, surface } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { detail } from '../detail.js';

// Railways and aircraft: track, trains, overhead wires, platform canopies, airliners and jet
// bridges. Everything lies along x, centred on the origin, and stands on y = 0 (a train stands on
// the rail top, which track() puts at y = RAIL_TOP). Turn a part with rotateY to lay it another way.

const plain = (c, r = 0.6, metal = 0, extra = {}) => surface(mat(c, r, metal, extra), 'none');
const RAIL = plain('#6b6258', 0.45, 0.7), SLEEPER = plain('#8d8a84', 0.9), BALLAST = mat('#6a635b', 0.97);
const UNDER = plain('#26282b', 0.7, 0.3), GLAZE = plain('#1c2630', 0.15, 0.6), ROOF = plain('#9aa0a4', 0.6, 0.3);
const WIRE = plain('#3a3d40', 0.5, 0.6), MAST = plain('#8f979c', 0.6, 0.5);
const WHITE = plain('#eef0f1', 0.4, 0.1), ENGINE = plain('#c9ced2', 0.35, 0.5), TYRE = plain('#1c1c1e', 0.8);

// Indian broad gauge, and the height of the rail top above the ground track() lies on.
export const GAUGE = 1.676, RAIL_TOP = 0.52;

// A length of straight track: a ballast bed, concrete sleepers every 0.65 m (1.3 m on phones) and
// two rails. `ballast: false` leaves the bed out, for track on a bridge deck or a station slab.
export function track(len, { ballast = true, gauge = GAUGE } = {}) {
  const g = new THREE.Group(), y0 = ballast ? 0.3 : 0, step = detail.low ? 1.3 : 0.65, list = [];
  if (ballast) {
    const s = new THREE.Shape();
    s.moveTo(-2.4, 0); s.lineTo(2.4, 0); s.lineTo(1.7, 0.3); s.lineTo(-1.7, 0.3); s.closePath();
    const bed = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-len / 2, 0, 0);
    g.add(mesh(bed, BALLAST));
  }
  for (let x = -len / 2 + step / 2; x < len / 2; x += step) list.push([x, y0, 0, 0.26, 0.1, 2.7]);
  g.add(inst(unitBox(), list, SLEEPER));
  for (const s of [-1, 1]) g.add(box(len, RAIL_TOP - y0 - 0.1, 0.07, RAIL, 0, y0 + 0.1, s * gauge / 2));
  g.children.forEach((c) => { c.castShadow = false; });
  return g;
}

// The liveries of Indian trains: body colour, the band along the windows, a stripe under them.
const LIVERY = {
  blue: { body: '#2f5d9b', band: '#8fb3d9', stripe: '#e8e2cf', roof: '#8f9498' }, // ICF mail and express
  red: { body: '#b3262e', band: '#b3262e', stripe: '#c9ccd0', roof: '#a8adb1', skirt: '#c9ccd0' }, // LHB Rajdhani
  vande: { body: '#f4f5f6', band: '#22324a', stripe: '#1f5fa8', roof: '#d9dcde' }, // Vande Bharat
  orange: { body: '#f08a24', band: '#4a4f55', stripe: '#f4f5f6', roof: '#c9ccd0' }, // Vande Bharat, saffron
  emu: { body: '#f2efe6', band: '#6b3f8f', stripe: '#6b3f8f', roof: '#9aa0a4' }, // suburban EMU
  green: { body: '#3f7d4c', band: '#e9d36a', stripe: '#e9d36a', roof: '#8f9498' }, // Garib Rath
};

// One coach, 23.5 m over its body, on two bogies; its floor 1.3 m above the rail.
function coach(L, lv, { nose = 0 } = {}) {
  const g = new THREE.Group(), W = 3.2, B = plain(lv.body, 0.45, 0.2), BAND = plain(lv.band, 0.45, 0.2), STR = plain(lv.stripe, 0.5, 0.1), RF = plain(lv.roof, 0.6, 0.3);
  const body = L - (nose ? 3.2 : 0), bx = nose ? -nose * 1.6 : 0;
  g.add(box(body, 1.25, W, B, bx, 1.25, 0), box(body, 1.0, W, BAND, bx, 2.5, 0), box(body, 0.5, W, B, bx, 3.5, 0));
  if (lv.skirt) g.add(box(body + 0.02, 0.5, W + 0.02, plain(lv.skirt, 0.5, 0.2), bx, 1.25, 0));
  g.add(box(body + 0.02, 0.14, W + 0.04, STR, bx, 2.3, 0));
  // The roof: an arc over the body.
  const roof = new THREE.CylinderGeometry(W / 2, W / 2, body, 10, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.34, 1);
  g.add(mesh(roof, RF, bx, 4.0, 0));
  // Windows along both sides, and a door at each end.
  const wins = [], n = Math.floor((body - 4) / 1.9);
  for (let k = 0; k < n; k++) for (const s of [-1, 1]) wins.push([bx - ((n - 1) * 1.9) / 2 + k * 1.9, 2.62, s * (W / 2 + 0.012), 1.2, 0.72, 0.02]);
  for (const e of [-1, 1]) for (const s of [-1, 1]) wins.push([bx + e * (body / 2 - 1.1), 1.4, s * (W / 2 + 0.012), 0.8, 1.9, 0.02]);
  g.add(inst(unitBox(), wins, GLAZE));
  // The driving end of a trainset: a raked nose with a windscreen.
  if (nose) {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(2.4, 0); s.quadraticCurveTo(3.4, 0.5, 3.0, 1.3); s.quadraticCurveTo(2.2, 2.6, 0, 2.95); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: false }).translate(0, 0, -W / 2);
    const cab = mesh(geo, B, nose * (L / 2 - 3.2), 1.25, 0);
    if (nose < 0) cab.rotation.y = Math.PI;
    g.add(cab);
    const screen = box(0.05, 1.0, W - 0.7, GLAZE, 0, 0, 0);
    screen.position.set(nose * (L / 2 - 1.55), 3.25, 0);
    screen.rotation.z = nose * 0.95;
    g.add(screen);
  }
  // Underframe, bogies and wheels.
  g.add(box(L - 5, 0.55, 2.4, UNDER, 0, 0.7, 0));
  for (const e of [-1, 1]) {
    const x = e * (L / 2 - 3.6);
    g.add(box(3.6, 0.5, 2.5, UNDER, x, 0.35, 0));
    for (const dx of [-1.25, 1.25]) for (const s of [-1, 1]) {
      const w = mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.14, 12).rotateX(Math.PI / 2), UNDER, x + dx, 0.46, s * GAUGE / 2);
      g.add(w);
    }
  }
  return g;
}

// An electric locomotive (a WAP-7 in outline): a cab at each end, louvres, two pantographs.
function loco(colour = '#c23b2e') {
  const g = new THREE.Group(), L = 20.5, W = 3.15, B = plain(colour, 0.45, 0.25), C = plain('#f0ead8', 0.5, 0.1);
  g.add(box(L, 2.9, W, B, 0, 1.2, 0), box(L + 0.02, 0.3, W + 0.03, C, 0, 2.2, 0), box(L - 2.2, 0.3, W - 0.5, ROOF, 0, 4.1, 0));
  const list = [];
  for (const e of [-1, 1]) {
    list.push([e * (L / 2 + 0.012), 2.9, 0, 0.02, 0.85, W - 0.6]);
    for (const s of [-1, 1]) list.push([e * (L / 2 - 1.2), 2.9, s * (W / 2 + 0.012), 1.0, 0.8, 0.02]);
  }
  for (let k = -3; k <= 3; k++) for (const s of [-1, 1]) list.push([k * 1.9, 2.75, s * (W / 2 + 0.012), 1.3, 0.9, 0.02]);
  g.add(inst(unitBox(), list, GLAZE));
  g.add(box(L - 3, 0.6, 2.4, UNDER, 0, 0.6, 0));
  for (const e of [-1, 1]) {
    const x = e * 5.6;
    g.add(box(5.6, 0.55, 2.6, UNDER, x, 0.3, 0));
    for (const dx of [-1.9, 0, 1.9]) for (const s of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 12).rotateX(Math.PI / 2), UNDER, x + dx, 0.55, s * GAUGE / 2));
    // A pantograph: raised at the leading end, folded at the other.
    const up = e > 0 ? 1.15 : 0.25;
    g.add(box(1.6, 0.06, 1.7, WIRE, e * 5, 4.4 + up, 0), box(0.08, up, 0.08, WIRE, e * 5 - 0.5, 4.4, 0), box(0.08, up, 0.08, WIRE, e * 5 + 0.5, 4.4, 0));
  }
  g.add(box(0.3, 0.5, W - 0.2, plain('#e7c23a', 0.5), L / 2 + 0.16, 0.7, 0), box(0.3, 0.5, W - 0.2, plain('#e7c23a', 0.5), -L / 2 - 0.16, 0.7, 0));
  return g;
}

// A train of `cars` coaches along x, standing on the rail top at y = 0 and centred on the origin.
// livery: 'blue' (ICF), 'red' (LHB Rajdhani), 'green', 'emu' (suburban, a cab at each end),
// 'vande' or 'orange' (Vande Bharat trainsets, a raked nose at each end). A hauled train gets a
// locomotive at its +x end unless `loco: false`. Its length is in userData.length.
export function train(cars = 12, { livery = 'blue', loco: withLoco = !['emu', 'vande', 'orange'].includes(livery), locoColour } = {}) {
  const g = new THREE.Group(), lv = LIVERY[livery] || LIVERY.blue, L = livery === 'emu' ? 21.3 : 23.5, gap = 0.7;
  const set = ['vande', 'orange'].includes(livery), total = cars * (L + gap) + (withLoco ? 21.2 : 0);
  let x = -total / 2;
  for (let k = 0; k < cars; k++) {
    const nose = set ? (k === 0 ? -1 : k === cars - 1 ? 1 : 0) : 0;
    g.add(at(coach(L, lv, { nose }), x + L / 2, 0, 0));
    if (k < cars - 1 || withLoco) g.add(box(gap + 0.1, 2.2, 2.2, UNDER, x + L + gap / 2, 1.3, 0));
    x += L + gap;
  }
  if (withLoco) g.add(at(loco(locoColour), x + 10.25, 0, 0));
  const out = mergeByMaterial(g);
  out.userData.length = total;
  out.userData.dressing = true;
  return out;
}

// Overhead electrification along a track: a mast every `span` metres on the -z side, a cantilever
// over the track, and the catenary and contact wires at 5.5 m.
export function overhead(len, { span = 55, side = -1 } = {}) {
  const g = new THREE.Group(), masts = [], arms = [];
  for (let x = -len / 2; x <= len / 2 + 0.01; x += span) {
    masts.push([x, 0, side * 2.9, 0.22, 7.6, 0.22]);
    arms.push([x, 6.9, side * 1.4, 0.08, 0.08, 3.1], [x, 5.9, side * 1.4, 0.06, 0.06, 3.1]);
  }
  g.add(inst(unitBox(), masts, MAST), inst(unitBox(), arms, MAST));
  g.add(box(len, 0.03, 0.03, WIRE, 0, 5.5, 0), box(len, 0.03, 0.03, WIRE, 0, 6.85, 0));
  g.children.forEach((c) => { c.castShadow = false; });
  return g;
}

// An island platform `w` wide under a butterfly canopy on a row of iron columns: the open-air
// platforms that run out beyond a station's trainshed.
export function platform(len, w = 9, { h = 4.4, canopy = true, m = mat('#bdb6a8', 0.9), roofM = plain('#7f8a8f', 0.6, 0.3) } = {}) {
  const g = new THREE.Group(), cols = [];
  g.add(box(len, 1.05, w, m, 0, 0, 0), box(len, 0.06, 0.5, plain('#e7c23a', 0.7), 0, 1.02, w / 2 - 0.5), box(len, 0.06, 0.5, plain('#e7c23a', 0.7), 0, 1.02, -w / 2 + 0.5));
  if (canopy) {
    for (const s of [-1, 1]) {
      const slab = box(len - 12, 0.12, w / 2 + 0.6, roofM, 0, 0, 0);
      slab.position.set(0, 1.05 + h + 0.45, s * (w / 4 + 0.2));
      slab.rotation.x = -s * 0.2;
      g.add(slab);
    }
    for (let x = -len / 2 + 10; x <= len / 2 - 10; x += 10) cols.push([x, 1.05, 0, 0.3, h, 0.3]);
    g.add(inst(unitBox(), cols, plain('#4a4f52', 0.6, 0.5)));
  }
  return g;
}

// An airliner along x, nose to +x, standing on its wheels on y = 0. size: 'narrow' (an A320: 37.6 m
// long, 35.8 m across the wings) or 'wide' (a 787: 57 m long, 60 m across). `tail` is the fin's
// colour, `belly` the lower fuselage's and the engines'.
export function airliner({ size = 'narrow', tail = '#e2231a', body = '#f2f3f4', belly = body, engine = '#c9ced2' } = {}) {
  const wide = size === 'wide', L = wide ? 57 : 37.6, R = wide ? 2.9 : 1.98, span = wide ? 60 : 35.8, hy = wide ? 5.3 : 3.9;
  const g = new THREE.Group(), B = body === '#f2f3f4' ? WHITE : plain(body, 0.4, 0.1), T = plain(tail, 0.45, 0.1), E = engine === '#c9ced2' ? ENGINE : plain(engine, 0.4, 0.3);
  // The fuselage: turned about its length, the nose blunt and the tail drawn out and swept up.
  const pts = [[0, 0], [0.34, 0.012], [0.62, 0.04], [0.86, 0.08], [1, 0.14], [1, 0.62], [0.82, 0.78], [0.5, 0.9], [0.2, 0.98], [0.06, 1]];
  const fus = new THREE.LatheGeometry(pts.map(([r, t]) => new THREE.Vector2(r * R, (0.5 - t) * L)), detail.low ? 14 : 24).rotateZ(-Math.PI / 2);
  const p = fus.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), t = Math.max(0, (-x - L * 0.12) / (L * 0.38)); p.setY(i, p.getY(i) + t * t * R * 0.55); }
  fus.computeVertexNormals();
  g.add(mesh(fus, B, 0, hy, 0));
  if (belly !== body) {
    const low = new THREE.CylinderGeometry(R * 1.004, R * 1.004, L * 0.46, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76).rotateZ(Math.PI / 2);
    g.add(mesh(low, plain(belly, 0.45, 0.1), L * 0.12, hy, 0));
  }
  // Cabin windows and the flight deck's.
  const wins = [], n = Math.floor((L * 0.6) / (detail.low ? 1.6 : 0.8)), zw = R * 0.954;
  for (let k = 0; k < n; k++) for (const s of [-1, 1]) wins.push([L * 0.36 - (k * L * 0.6) / n, hy + R * 0.22, s * zw, 0.32, 0.4, 0.06]);
  g.add(inst(unitBox(), wins, GLAZE));
  const deck = mesh(new THREE.CylinderGeometry(R * 0.79, R * 0.93, R * 0.42, 14, 1, true, Math.PI * 0.2, Math.PI * 0.6).rotateZ(-Math.PI / 2 + 0.38), GLAZE, L / 2 - R * 1.95, hy + R * 0.3, 0);
  g.add(deck);
  // Wings, swept back and rising to the tips, with a winglet; tailplanes; the fin.
  const wing = (root, tip, half, sweep, thick) => {
    const s = new THREE.Shape();
    s.moveTo(root / 2, 0); s.lineTo(root / 2 - sweep, half); s.lineTo(root / 2 - sweep - tip, half); s.lineTo(-root / 2, 0); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, thick, 0);
  };
  for (const s of [-1, 1]) {
    const w = mesh(wing(L * 0.2, L * 0.045, span / 2, L * 0.24, R * 0.2), B, L * 0.05, hy - R * 0.62, 0);
    w.scale.z = s; w.rotation.x = -s * 0.09;
    const tp = mesh(wing(L * 0.1, L * 0.035, span * 0.19, L * 0.1, R * 0.1), B, -L * 0.42, hy + R * 0.5, 0);
    tp.scale.z = s; tp.rotation.x = -s * 0.1;
    g.add(w, tp);
    const tipX = L * 0.05 + L * 0.1 - L * 0.24 - L * 0.045, tipY = hy - R * 0.62 + Math.sin(0.09) * span / 2;
    g.add(box(L * 0.045, R * 0.95, 0.12, T, tipX + L * 0.02, tipY, s * (span / 2 - 0.1)));
    // An engine under each wing on its pylon.
    const er = wide ? 1.75 : 1.1, el = wide ? 5.6 : 3.6, ex = L * 0.085, ez = s * span * (wide ? 0.165 : 0.16), ey = hy - R * 0.62 - er * 0.75;
    g.add(mesh(new THREE.CylinderGeometry(er, er * 0.82, el, 16).rotateZ(Math.PI / 2), E, ex, ey, ez));
    g.add(mesh(new THREE.CylinderGeometry(er * 0.84, er * 0.84, 0.1, 16).rotateZ(Math.PI / 2), UNDER, ex + el / 2 + 0.01, ey, ez));
    g.add(box(el * 0.7, er * 0.9, 0.3, B, ex - el * 0.25, ey + er * 0.5, ez));
    // Main gear under the wing roots.
    g.add(cyl(0.16, 0.16, hy - R - 0.2, ENGINE, -L * 0.03, 0.5, s * R * 1.3, 8));
    for (const dx of wide ? [-0.8, 0.8] : [0]) g.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.9, 12).rotateX(Math.PI / 2), TYRE, -L * 0.03 + dx, 0.6, s * R * 1.3));
  }
  const fin = new THREE.Shape(), fh = wide ? 10.5 : 7.6, fr = L * 0.15;
  fin.moveTo(fr / 2, 0); fin.lineTo(-fr * 0.45, fh); fin.lineTo(-fr * 0.9, fh); fin.lineTo(-fr / 2, 0); fin.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.34, bevelEnabled: false }).translate(0, 0, -0.17), T, -L * 0.385, hy + R * 0.95, 0));
  // Nose gear.
  g.add(cyl(0.13, 0.13, hy - R - 0.1, ENGINE, L * 0.38, 0.4, 0, 8), mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 12).rotateX(Math.PI / 2), TYRE, L * 0.38, 0.42, 0));
  const out = mergeByMaterial(g);
  out.userData.dressing = true;
  return out;
}

// A passenger boarding bridge `len` long along x from a rotunda at the origin (the terminal end)
// to the cab at +x, its glazed tunnel `h` above the apron on a wheeled leg near the cab.
export function jetBridge(len = 30, { h = 4.2, m = WHITE } = {}) {
  const g = new THREE.Group();
  g.add(cyl(2.3, 2.3, 3, m, 0, h - 0.2, 0, 14), cyl(0.5, 0.6, h - 0.2, MAST, 0, 0, 0, 10));
  g.add(box(len, 2.6, 2.4, m, len / 2, h, 0), box(len - 4, 1.2, 2.44, GLAZE, len / 2, h + 0.8, 0));
  g.add(box(3.4, 2.9, 3.6, m, len + 0.6, h - 0.1, 0), box(0.05, 1.3, 3.0, GLAZE, len + 2.33, h + 0.9, 0));
  for (const s of [-1, 1]) g.add(box(0.3, h, 0.3, MAST, len - 5, 0, s * 1.6), mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 10).rotateX(Math.PI / 2), TYRE, len - 5, 0.5, s * 1.6));
  g.add(box(0.4, 0.4, 3.6, MAST, len - 5, h - 0.4, 0));
  return mergeByMaterial(g);
}
