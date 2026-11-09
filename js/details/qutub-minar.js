import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, surface, rng, hemi, finial } from '../helpers.js';
import { iwan } from './mughal.js';
import { bracketGeo, placeAll, aroundCircle, mergeByMaterial, windowFrame } from './components.js';
import { trees, asiBoard, scatter, along } from './realism.js';
import { TIERS } from '../monuments/qutub-minar.js';

// The Qutub Minar, finer detail. From photographs and descriptions: under every balcony is a ring
// of stalactite (muqarnas) corbelling, here a deep ring of carved brackets; the first three storeys are girdled by bands of Quranic inscription carved in the red
// sandstone, between the moulded bands the builder makes; small arched doorways open onto each
// balcony. Dimensions follow js/monuments/qutub-minar.js (its TIERS).
const LETTERS = surface(mat('#b86b4f', 0.85), 'script');
function architecture(g) {
  const d = new THREE.Group();
  const tiers = TIERS;
  let y = 1.2;
  tiers.forEach(([rb, rt, h], i) => {
    const r = (t) => rb - (rb - rt) * t;
    if (i < 3) for (const t of [0.12, 0.45, 0.8]) d.add(cyl(r(t) * 1.085 + 0.03, r(t) * 1.085 + 0.03, 0.9, LETTERS, 0, y + h * t - 0.45, 0, 72));
    y += h;
    if (i < 4) {
      const m = i < 3 ? M.redLight : M.marble;
      d.add(placeAll(bracketGeo(1.3, 1.2, 0.32), aroundCircle(rt * 1.04, 36, y - 1.1), m));
      d.add(placeAll(bracketGeo(0.7, 0.7, 0.28), aroundCircle(rt * 1.04, 36, y - 2.3, Math.PI / 36), m));
      // A small doorway onto the balcony from the next storey.
      d.add(onFace(at(windowFrame(0.9, 2, m, { shape: 'pointed', frame: 0.14 }), 0, y + 0.1, 0), (i * 1.3) % (Math.PI * 2), tiers[i + 1][0] * 1.085 + 0.04));
    }
  });
  mergeByMaterial(d);
  g.add(d);
}

// The Qutub complex at Mehrauli: the lawns and paths round the minar, the Iron Pillar of the 4th
// century (7.2 m, and still unrusted) in the court of the Quwwat-ul-Islam mosque with the stumps of
// its colonnades, the great unfinished core of the Alai Minar, and the ASI board.
const IRON = mat('#3a332e', 0.45, 0.6), RUIN = mat('#9a6a4e', 0.95);
export function addDetails(f, g) {
  architecture(f);
  g.add(box(240, 0.15, 220, M.grass, 0, -0.15, 30), box(10, 0.1, 110, M.path, 0, 0, 70), box(110, 0.1, 8, M.path, -40, 0, 18));
  // The mosque court to the north-east, with the Iron Pillar in it. Its cloisters stand on pillars
  // taken from older temples, two rows deep under a flat stone roof; the great arched screen
  // closes the court's west side.
  const court = new THREE.Group(), cols = [];
  court.add(box(56, 0.4, 44, M.path));
  for (const inset of [0, 4]) {
    for (let x = -26 + inset; x <= 26 - inset + 0.01; x += 4) for (const z of [-20 + inset, 20 - inset]) cols.push([x, z]);
    for (let z = -16 + inset; z <= 16 - inset + 0.01; z += 4) for (const x of [26 - inset]) cols.push([x, z]);
  }
  cols.forEach(([x, z]) => court.add(box(0.7, 0.4, 0.7, RUIN, x, 0.4, z), cyl(0.32, 0.36, 4.4, RUIN, x, 0.8, z, 8), box(0.9, 0.4, 0.9, RUIN, x, 5.2, z)));
  for (const z of [-18, 18]) court.add(box(56, 0.6, 6, RUIN, 0, 5.6, z));
  court.add(box(6, 0.6, 32, RUIN, 24, 5.6, 0));
  court.add(cyl(0.21, 0.22, 7.2, IRON, 0, 0.4, 0, 16), cyl(0.3, 0.24, 0.5, IRON, 0, 7.6, 0, 16), box(1.6, 0.5, 1.6, M.redLight, 0, 0.1, 0));
  for (const s of [-1, 1]) court.add(box(14, 0.6, 0.15, M.steel, 0, 0.4, s * 7), box(0.15, 0.6, 14, M.steel, s * 7, 0.4, 0));
  court.add(at(screen(), -26, 0.4, 0).rotateY(Math.PI / 2));
  g.add(at(court, 46, 0, -36));
  g.add(at(alaiDarwaza(), 40, 0, -8));
  g.add(at(iltutmishTomb(), 6, 0, -62));
  // The Alai Minar: Alauddin Khalji's tower, abandoned at its first storey, a rough core of rubble
  // that was never faced.
  g.add(rubbleCore(13, 14.5, 25, -60, -60), box(30, 2, 30, RUIN, -60, 0, -60));
  g.add(trees([...along(6, [-12, 40], [-12, 120]), ...along(6, [12, 40], [12, 120]), ...scatter(14, [-110, 110, 60, 135], { seed: 3, gap: 16, avoid: [[-16, 16, 30, 140]] })], { kind: 'neem', seed: 3 }));
  g.add(asiBoard('Qutb Minar and its Monuments', 8, 122, 0, { line2: 'WORLD HERITAGE SITE' }));
}

// The Quwwat-ul-Islam mosque's screen of 1199: a tall central arch and two smaller each side,
// corbelled pointed arches in red stone with bands of carved inscription. Faces +z, base at y = 0.
function screen() {
  const g = new THREE.Group(), SCR = mat('#a5694c', 0.9);
  g.add(box(40, 14, 2.4, SCR, 0, 0, 0));
  g.add(at(iwan(7.5, 13.5, { m: SCR, trim: LETTERS, shade: M.recess, depth: 2.2, frame: 1, top: 1.2, fill: 'none' }), 0, 0, -1));
  g.add(box(10.5, 3.4, 2.4, SCR, 0, 14, 0));
  for (const x of [-8.6, 8.6, -15.4, 15.4]) g.add(at(iwan(4.4, 8.5, { m: SCR, trim: LETTERS, shade: M.recess, depth: 2.2, frame: 0.6, top: 0.8, fill: 'none' }), x, 0, -1));
  return g;
}

// The Alai Darwaza (1311): a square domed gatehouse in red sandstone inlaid with white marble,
// a horseshoe arch on each face. Base at y = 0.
function alaiDarwaza() {
  const g = new THREE.Group(), W = 17;
  g.add(box(W, 12, W, M.red), box(W + 0.4, 0.6, W + 0.4, M.marble, 0, 12, 0));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) g.add(onFace(at(iwan(5, 9.5, { m: M.red, trim: M.marble, shade: M.recess, depth: 1.2, frame: 1.1, top: 1.2, fill: 'none' }), 0, 0, 0), a, W / 2 - 1.2));
  g.add(cyl(7, 7, 1.4, M.red, 0, 12.6, 0, 32), at(hemi(7.2, M.redLight, 32), 0, 14, 0), at(finial(2.4, M.redLight), 0, 21, 0));
  return g;
}

// Iltutmish's tomb (1235): a square chamber of red sandstone, carved all over inside; its dome
// fell long ago and it stands open to the sky. Base at y = 0.
function iltutmishTomb() {
  const g = new THREE.Group(), W = 13, t = 2;
  g.add(box(W + 4, 0.8, W + 4, M.redLight));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const side = new THREE.Group();
    side.add(box(W, 10, t, M.red, 0, 0.8, 0), at(iwan(3.6, 7, { m: M.red, trim: LETTERS, shade: M.recess, depth: t, frame: 0.6, top: 0.6, fill: 'none' }), 0, 0.8, -t / 2));
    g.add(onFace(side, a, W / 2 - t / 2));
  }
  return g;
}

// An unfaced rubble core: a tapering drum whose surface and broken top are roughened.
function rubbleCore(rb, rt, h, x, z) {
  const geo = new THREE.CylinderGeometry(rt * 0.94, rb, h, 56, 12), p = geo.attributes.position, R = rng(17);
  const bump = new Map();
  for (let k = 0; k < p.count; k++) {
    const px = p.getX(k), py = p.getY(k), pz = p.getZ(k), key = `${px.toFixed(2)},${py.toFixed(2)},${pz.toFixed(2)}`;
    if (!bump.has(key)) bump.set(key, [0.94 + R() * 0.1, R()]);
    const [f, n] = bump.get(key), rr = Math.hypot(px, pz);
    if (rr > 1e-3) { p.setX(k, px * f); p.setZ(k, pz * f); }
    if (py > h / 2 - 1e-3) p.setY(k, py - n * 3.2 * (rr / rt));
  }
  geo.computeVertexNormals();
  return mesh(geo, RUIN, x, h / 2, z);
}
