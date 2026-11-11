import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, surface, inst, unitBox, TIBETAN, rng } from '../helpers.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { detail } from '../detail.js';

// Parts of Tibetan Buddhist monasteries shared by the Himalayan monasteries (Key, Rumtek, Tawang,
// Thiksey): the gilded Dharma wheel between two kneeling deer over the front of the assembly hall,
// the cylindrical victory banners (gyaltsen) at the corners of its roof, the pleated awnings
// (shabkhep) over the windows, and the gilded discs set into the maroon parapet band. Every part
// faces +z and stands on y = 0, as in the rest of the detail kit.

const RED = surface(mat('#9a2b22', 0.7), 'none'), BLUE = surface(mat('#2f5d8a', 0.7), 'none');
const GREEN = surface(mat('#3f7d4f', 0.7), 'none'), WHITE = surface(mat('#f1ede4', 0.8), 'none');

// A kneeling deer, s tall at the shoulder, facing +x (turned by the caller).
function deer(s, m) {
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(1, 12, 8), m, 0, s * 0.45, 0);
  body.scale.set(s * 0.55, s * 0.3, s * 0.25);
  const neck = cyl(s * 0.08, s * 0.11, s * 0.45, m, s * 0.38, s * 0.55, 0, 8);
  neck.rotation.z = -0.4;
  const head = mesh(new THREE.SphereGeometry(s * 0.14, 10, 8), m, s * 0.55, s * 1.0, 0);
  head.scale.x = 1.5;
  g.add(body, neck, head, box(s * 0.9, s * 0.18, s * 0.42, m, 0, 0.0, 0));
  for (const z of [-1, 1]) g.add(at(cyl(s * 0.02, s * 0.04, s * 0.18, m, 0, 0, 0, 5), s * 0.5, s * 1.1, z * s * 0.06));
  return g;
}

// The Dharma wheel on a lotus base between two deer facing it, w across the deer, all gilded.
export function dharmaWheel(w, m = M.gild) {
  const g = new THREE.Group(), R = w * 0.22;
  g.add(cyl(R * 0.7, R * 0.9, R * 0.3, m, 0, 0, 0, 16));
  const wheel = new THREE.Group();
  wheel.add(mesh(new THREE.TorusGeometry(R, R * 0.12, 8, 28), m), mesh(new THREE.TorusGeometry(R * 0.25, R * 0.1, 6, 14), m));
  // Eight spokes from the hub to the rim.
  for (let k = 0; k < 4; k++) { const s = mesh(new THREE.BoxGeometry(R * 0.07, R * 1.9, R * 0.07), m); s.rotation.z = (k / 4) * Math.PI; wheel.add(s); }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; wheel.add(at(mesh(new THREE.SphereGeometry(R * 0.08, 6, 4), m), Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12, 0)); }
  g.add(at(wheel, 0, R * 0.3 + R * 1.15, 0));
  for (const s of [-1, 1]) {
    const d = deer(w * 0.24, m);
    d.position.x = s * w * 0.36;
    d.rotation.y = s > 0 ? Math.PI : 0;
    g.add(d);
  }
  return g;
}

// A victory banner (gyaltsen) h tall: a gilded drum on a post, ringed in bands, with a crown.
export function gyaltsen(h, m = M.gild) {
  const g = new THREE.Group(), r = h * 0.18;
  g.add(cyl(r * 0.25, r * 0.25, h * 0.25, m, 0, 0, 0, 8));
  g.add(cyl(r, r * 1.1, h * 0.55, m, 0, h * 0.25, 0, 14));
  for (const t of [0.3, 0.55, 0.78]) g.add(cyl(r * 1.15, r * 1.15, h * 0.04, m, 0, h * t, 0, 14));
  g.add(at(mesh(new THREE.SphereGeometry(r * 0.75, 12, 8), m), 0, h * 0.86, 0), cyl(0, r * 0.3, h * 0.14, m, 0, h * 0.9, 0, 8));
  return g;
}

// A pleated awning (shabkhep) w wide over a window at z = 0: three short bands in red, blue and
// green, each projecting a little further, with a white valance under them.
export function shabkhep(w) {
  const g = new THREE.Group();
  [[RED, 0.32, 0.36], [BLUE, 0.2, 0.26], [GREEN, 0.08, 0.16]].forEach(([m, y, d]) => g.add(box(w + 0.3, 0.12, d, m, 0, y, d / 2)));
  g.add(box(w + 0.3, 0.1, 0.38, WHITE, 0, 0, 0.19));
  return g;
}

// A row of gilded discs (melong) along a parapet band at z = 0, len long, about `pitch` apart.
export function parapetDiscs(len, pitch, r, m = M.gild) {
  const g = new THREE.Group(), n = Math.max(1, Math.floor(len / pitch)), geo = new THREE.CylinderGeometry(r, r, 0.06, 14).rotateX(Math.PI / 2);
  for (let k = 0; k < n; k++) g.add(mesh(geo, m, -len / 2 + (k + 0.5) * (len / n), 0, 0.03));
  return g;
}

/* ---------- the monks' houses ---------- */
// The whitewashed houses that climb the hill at Key, Thiksey and Tawang were plain boxes under a
// maroon band. quarters() dresses a list of them, [x, y, z, w, h, d, ry] as given to inst() (the
// front is the block's local +z), with what photographs of such houses show:
//   - windows in rows hung from the roof line, a floor (2.8 m) apart, each in the black painted
//     surround that widens towards the sill, with a timber frame and mullions, a projecting timber
//     lintel and the white cloth valance under it; the tall blank foot of a house built out from a
//     slope stays blank, as it is a retaining wall;
//   - a door in the front of a house that stands on the ground, a step before it;
//   - under the maroon band, a white fillet and the ends of the roof beams;
//   - the flat roof inside the parapet in beaten earth, not maroon, and on some roofs a prayer-flag
//     pole (tarchok) at a corner.
// Everything is instanced. On phones: windows on the front only, without mullions or beam ends.
// cap: the height of the maroon band the caller has put on each block.
const SURROUND = surface(mat('#231c1a', 0.8), 'none'), TIMBER = surface(mat('#7a4a2c', 0.8), 'none'), PANE = surface(mat('#3b4650', 0.35, 0.1), 'none');
const CLOTH = surface(mat('#f3efe6', 0.9), 'none'), EARTH = surface(mat('#b7a68a', 0.95), 'ground');
const TARCHOK = ['#9a2b22', '#2f5d8a', '#e2b22f', '#3f7d4f', '#f1ede4'].map((c) => surface(mat(c, 0.8, 0, { side: THREE.DoubleSide }), 'none'));

// The black surround, 1 wide at the head and 1.25 at the sill, 1 high, standing 6 cm off the wall
// (its back on the wall at z = 0), round an opening 0.62 × 0.76; scaled to each window.
function surroundGeo() {
  const s = new THREE.Shape();
  s.moveTo(-0.625, 0); s.lineTo(0.625, 0); s.lineTo(0.5, 1); s.lineTo(-0.5, 1); s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.31, 0.14); hole.lineTo(-0.31, 0.9); hole.lineTo(0.31, 0.9); hole.lineTo(0.31, 0.14); hole.closePath();
  s.holes.push(hole);
  return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false });
}
// The timber bars in the opening: a mullion and a transom, in the same unit window.
function frameGeo() {
  const parts = [[0.05, 0.76, 0, 0.14], [0.62, 0.05, 0, 0.6]];
  return mergeGeometries(parts.map(([w, h, x, y]) => new THREE.BoxGeometry(w, h, 0.05).translate(x, y + h / 2, 0.035)));
}

export function quarters(blocks, { cap = 0.7, seed = 3, doors = true } = {}) {
  const g = new THREE.Group(), R = rng(seed), low = detail.low;
  const surrounds = [], frames = [], panes = [], lintels = [], valances = [], beams = [], fillets = [], roofs = [], doorLeaves = [], stepsL = [], poles = [], flags = TARCHOK.map(() => []);
  for (const [bx, by, bz, w, h, d, ry = 0] of blocks) {
    const c = Math.cos(ry), sn = Math.sin(ry);
    // A point on a face: `a` the face (0 front, ±π/2 the sides), lat along it, out from the wall.
    const on = (a, lat, y, out, sx, sy, sz) => {
      const side = Math.abs(Math.sin(a)) > 0.5, dist = (side ? w : d) / 2 + out;
      const lx = Math.sin(a) * dist + Math.cos(a) * lat, lz = Math.cos(a) * dist - Math.sin(a) * lat;
      return [bx + lx * c + lz * sn, by + y, bz - lx * sn + lz * c, sx, sy, sz, ry + a];
    };
    // A door in the front, to one side, where the house is low enough to stand on the ground there.
    const door = doors && h < 9 && R() < 0.7 ? (R() < 0.5 ? -1 : 1) * w * 0.22 : null;
    if (door !== null) {
      surrounds.push(on(0, door, 0, 0, 1.5, 2.3, 1));
      doorLeaves.push(on(0, door, 0.3, 0.02, 0.9, 1.75, 0.06));
      lintels.push(on(0, door, 2.3, 0, 1.9, 0.16, 0.32));
      stepsL.push(on(0, door, 0, 0.35, 1.8, 0.2, 0.7));
    }
    for (const a of low ? [0] : [0, Math.PI / 2, -Math.PI / 2]) {
      const len = Math.abs(Math.sin(a)) > 0.5 ? d : w, n = Math.max(1, Math.floor(len / 2.9));
      for (let y = h - 2.7; y > 0.9; y -= 2.8) for (let k = 0; k < n; k++) {
        const lat = -len / 2 + (k + 0.5) * (len / n);
        if (a === 0 && door !== null && y < 2.9 && Math.abs(lat - door) < 1.5) continue;
        surrounds.push(on(a, lat, y, 0, 1.1, 1.6, 1));
        panes.push(on(a, lat, y + 0.22, 0.01, 0.68, 1.22, 0.03));
        if (!low) frames.push(on(a, lat, y, 0, 1.1, 1.6, 1));
        lintels.push(on(a, lat, y + 1.6, 0, 1.4, 0.14, 0.3));
        valances.push(on(a, lat, y + 1.44, 0.04, 1.3, 0.16, 0.24));
      }
      // The ends of the roof beams in a row under the maroon band.
      if (!low) { const m = Math.floor(len / 0.6); for (let k = 0; k < m; k++) beams.push(on(a, -len / 2 + (k + 0.5) * (len / m), h - 0.32, 0, 0.16, 0.16, 0.22)); }
    }
    fillets.push([bx, by + h - 0.14, bz, w + 0.16, 0.14, d + 0.16, ry]);
    roofs.push([bx, by + h + cap - 0.06, bz, w - 0.5, 0.1, d - 0.5, ry]);
    // A prayer-flag pole at a back corner of some roofs, its banner down the pole.
    if (R() < 0.45) {
      const px = (R() < 0.5 ? -1 : 1) * (w / 2 - 0.5), pz = -d / 2 + 0.5, ph = 2.4 + R() * 1.4;
      const wx = bx + px * c + pz * sn, wz = bz - px * sn + pz * c, top = by + h + cap;
      poles.push([wx, top, wz, 0.07, ph, 0.07, ry]);
      flags[Math.floor(R() * TARCHOK.length)].push([wx + 0.2 * c, top + ph * 0.3, wz - 0.2 * sn, 0.36, ph * 0.68, 0.02, ry]);
    }
  }
  const add = (geo, list, m, shadow = true) => { if (!list.length) return; const im = inst(geo, list, m); im.castShadow = shadow; g.add(im); };
  // Geometries whose back sits on the wall and that stand out along +z (a unit box moved forward).
  const out = () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0.5);
  add(surroundGeo(), surrounds, SURROUND, false);
  add(frameGeo(), frames, TIMBER, false);
  add(out(), panes, PANE, false);
  add(out(), lintels, TIMBER);
  add(out(), valances, CLOTH, false);
  add(out(), beams, TIMBER, false);
  add(out(), doorLeaves, TIMBER, false);
  add(out(), stepsL, TIBETAN.white);
  add(unitBox(), fillets, CLOTH, false);
  add(unitBox(), roofs, EARTH, false);
  add(unitBox(), poles, SURROUND, false);
  TARCHOK.forEach((m, i) => add(unitBox(), flags[i], m, false));
  return g;
}
