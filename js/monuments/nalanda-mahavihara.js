import * as THREE from 'three';
import { M, mat, box, at, rng, inst, unitBox, aroundRect, surface } from '../helpers.js';
import { addDetails } from '../details/nalanda-mahavihara.js';

// The brick is old and weathered: a dull red-brown, darker in the lower courses, not new orange.
const BRICK = surface(mat('#8c5d49', 0.95), 'brick');
const BRICK_DARK = surface(mat('#6f4a3b', 0.95), 'brick');
const BRICKS = [BRICK, surface(mat('#7e5444', 0.95), 'brick'), surface(mat('#966753', 0.95), 'brick')];

// A ruined monastery: a square of monks' cells round a courtyard. Its thick outer wall and the
// cross walls between the cells stand to ragged heights, the top crumbling unevenly along the length
// and broken through in places; the cells' inner wall, onto the veranda, is lower still. Walls are
// built in 1.2 m lengths whose heights follow a slow wave plus a little roughness.
function vihara(size, R) {
  const g = new THREE.Group(), walls = [[], [], []], ph = R() * 10;
  let shade = 0;
  const run = (x0, z0, x1, z1, t, hMax, hMin, breach) => {
    const list = walls[shade++ % 3];
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.2)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u;
      const wave = 0.5 + 0.5 * Math.sin(ph + (x + z) * 0.21) * Math.cos(ph * 0.7 + (x - z) * 0.13);
      if (breach && wave < 0.12 && R() < 0.8) continue;
      list.push([x, 1.2, z, t, hMin + (hMax - hMin) * wave + R() * 0.6, len / n + 0.02, ry]);
    }
  };
  const h = size / 2, i = h - 4.2;
  for (const s of [-1, 1]) {
    run(-h, s * h, h, s * h, 1.8, 6.2, 1.8, true);
    run(s * h, -h + 0.9, s * h, h - 0.9, 1.8, 6.2, 1.8, true);
    run(-i, s * i, i, s * i, 0.9, 2.6, 0.5, true);
    run(s * i, -i + 0.45, s * i, i - 0.45, 0.9, 2.6, 0.5, true);
  }
  // Cross walls between the cells.
  for (let c = -h + 3.4; c < h - 1; c += 3.4) for (const s of [-1, 1]) { run(c, s * (h - 0.9), c, s * (i + 0.45), 0.7, 4.2, 1, false); run(s * (h - 0.9), c, s * (i + 0.45), c, 0.7, 4.2, 1, false); }
  // Each run of wall weathered a little differently: three shades of the brick, in turn.
  g.add(box(size + 4, 1.2, size + 4, BRICK_DARK), ...walls.map((w, i) => inst(unitBox(), w, BRICKS[i])), box(size - 10, 1.3, size - 10, M.grass, 0, 0, 0));
  g.add(box(4, 3, 4, BRICK, 0, 1.2, -size / 2 + 8));
  return g;
}

export function buildNalanda() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(23);
  g.add(f);
  g.add(box(260, 0.15, 200, M.grass), box(8, 0.2, 200, M.path, -40, 0, 0));
  // The row of monasteries along the east side
  for (let i = 0; i < 4; i++) f.add(at(vihara(34, R), -78, 0, -66 + i * 44));
  // Temple 3, the Sariputta Stupa: stepped brick terraces, a great stair and corner towers
  const t = new THREE.Group();
  let y = 0, w = 40;
  for (let i = 0; i < 5; i++) {
    t.add(box(w, 5, w, i % 2 ? BRICK_DARK : BRICK, 0, y));
    y += 5;
    w -= 6;
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) t.add(box(7, 9 + R() * 4, 7, BRICK, x * 17, 0, z * 17));
  for (let k = 0; k < 12; k++) t.add(box(10, (k + 1) * 2, 2.2, BRICK, 0, 0, 20 + 26 - k * 2.2));
  t.add(box(8, 3.4, 8, BRICK, -1, y, 0), box(4, 2, 5, BRICK_DARK, 1.5, y + 3.4, 1));
  f.add(at(t, 20, 0, 10));
  // Votive stupas round the temple
  for (let i = 0; i < 10; i++) f.add(box(3.4, 1.5 + R() * 3, 3.4, BRICK, 20 + (R() - 0.5) * 70, 0, -30 + R() * 16));
  addDetails(f, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: f, view: [0.85, 0.5, 1.15], zoom: 0.65 };
}
