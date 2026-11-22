import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, ellipsoid, face, sheet, surface } from '../helpers.js';
import { mergeByMaterial, panel } from '../parts/components.js';
import { figure } from '../parts/sculpture.js';
import { guardian } from '../parts/figures.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, along, scatter, stalls, launches, umbrellas } from '../parts/realism.js';
import { detail } from '../detail.js';

// Elephanta's basalt: grey-brown outside, weathered and stained; paler where it was cut and is
// sheltered; and the dark of the hall's depths.
export const ROCK = surface(mat('#5f574d', 0.96), 'rock');
export const ROCK_LIGHT = surface(mat('#857b6d', 0.93), 'rock');
export const DARK = mat('#2a2622', 0.95);

// The hall HW wide and HD deep, HH high, its mouth at z = 0; the rock H high over it; the
// Trimurti's recess RW wide, RD deep and RH high in the middle of the back wall.
export const DIMS = { HW: 39, HD: 39, HH: 5.5, H: 11, RW: 10, RD: 3.6, RH: 6.8 };

// The Trimurti: Sadashiva as a bust of three heads, some 6 m high. In the middle, calm, the
// creator; on the viewer's left, Aghora-Bhairava, the destroyer, with a snake; on the right, Uma,
// gentle; each under a tall crown of piled locks, their shoulders and chest heavy with jewels.
function trimurti(m) {
  const g = new THREE.Group(), fine = !detail.low;
  g.add(box(9, 1, 3, m), box(8.4, 0.25, 2.8, m, 0, 1));
  const chest = ellipsoid(2.7, 1.5, 1.05, m, 0, 2.5, 0.5);
  g.add(chest, ellipsoid(1.1, 1.3, 0.8, m, -2.1, 2.9, 0.2), ellipsoid(1.1, 1.3, 0.8, m, 2.1, 2.9, 0.2));
  // The necklaces over the chest.
  for (const [r, y] of [[1.25, 3.1], [1.6, 2.75], [1.9, 2.35]]) {
    const t = mesh(new THREE.TorusGeometry(r, 0.07, 6, 28, Math.PI), m, 0, y + 0.6, 1.05);
    t.rotation.x = Math.PI;
    t.scale.z = 0.4;
    g.add(t);
  }
  const head = (x, z, a, s) => {
    const h = at(new THREE.Group(), x, 3.55, z);
    h.rotation.y = a;
    h.add(cyl(0.42, 0.5, 0.7, m, 0, 0, 0, 14));
    const fc = fine ? face(0.72, 0.92, 0.68, m) : ellipsoid(0.72, 0.92, 0.68, m);
    fc.position.y = 1.35;
    h.add(fc);
    // The crown of piled, jewelled locks (jatamukuta), wider at its top.
    const crown = lathe([[0.62, 0], [0.7, 0.3], [0.78, 0.8], [0.86, 1.3], [0.8, 1.6], [0.5, 1.78], [0, 1.82]], m, fine ? 24 : 12);
    crown.position.y = 1.95;
    h.add(crown, mesh(new THREE.TorusGeometry(0.66, 0.08, 6, 20), m, 0, 2.05, 0).rotateX(Math.PI / 2));
    for (const sx of [-1, 1]) h.add(ellipsoid(0.12, 0.3, 0.12, m, sx * 0.74, 1.05, 0.05));
    h.scale.setScalar(s);
    return h;
  };
  g.add(head(0, 0.75, 0, 1), head(-1.75, 0.1, -1.2, 0.95), head(1.75, 0.1, 1.2, 0.95));
  // The snake held up on the left, its hood raised.
  const snake = mesh(new THREE.TorusGeometry(0.45, 0.09, 6, 16, Math.PI * 1.4), m, -2.6, 3.1, 0.8);
  snake.rotation.set(0.2, 0.6, 1.2);
  g.add(snake, ellipsoid(0.22, 0.14, 0.18, m, -2.85, 3.7, 0.9));
  return g;
}

// The panels of the hall: great reliefs in framed recesses, each about 5 m high.
function reliefPanel(w, h, kind, m) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.05, DARK, 0, 0, 0.025), at(panel(w + 0.6, h + 0.6, 0.3, m, null, 0.35), 0, -0.3, 0));
  g.add(at(figure(h * 0.82, m, kind), 0, 0.15, 0.3));
  for (const sx of [-1, 1]) g.add(at(figure(h * 0.45, m, 'standing'), sx * w * 0.33, 0.15, 0.25));
  return g;
}

function hall(f) {
  const { HW, HD, HH, RW, RD } = DIMS, L = ROCK_LIGHT, d = new THREE.Group();
  // The recess and its sculpture, with the two guardians at its sides.
  d.add(at(trimurti(L), 0, 0, -HD - RD + 0.4));
  // The six great panels: either side of the recess on the back wall, two on the east wall and two
  // round the west entrance.
  d.add(at(reliefPanel(5.4, 4.6, 'standing', L), -11, 0.5, -HD + 0.01), at(reliefPanel(5.4, 4.6, 'standing', L), 11, 0.5, -HD + 0.01));
  for (const [x, z, a, kind] of [[HW / 2 - 0.01, -10, -Math.PI / 2, 'dancer'], [HW / 2 - 0.01, -28, -Math.PI / 2, 'standing'], [-HW / 2 + 0.01, -6, Math.PI / 2, 'dancer'], [-HW / 2 + 0.01, -34, Math.PI / 2, 'standing']]) {
    const p = at(reliefPanel(5.4, 4.6, kind, L), x, 0.5, z);
    p.rotation.y = a;
    d.add(p);
  }
  // The shrine of the linga on the west: a square cella on a plinth, a door on each face, the
  // linga on its pedestal (yoni) inside, seen through the open east door.
  const sx = -12.7, sz = -21, sw = 7.6, sh = new THREE.Group();
  sh.add(box(sw + 1.6, 0.8, sw + 1.6, L, 0, 0, 0));
  for (const [x0, z0, w, dd] of [[-sw / 2 + 0.6, 0, 1.2, sw], [sw / 2 - 0.6, 0, 1.2, sw], [0, -sw / 2 + 0.6, sw - 2.4, 1.2], [0, sw / 2 - 0.6, sw - 2.4, 1.2]]) {
    const len = w > 2 ? w : dd, along = w > 2;
    for (const s of [-1, 1]) sh.add(box(along ? (len - 2) / 2 : w, HH - 1.4, along ? dd : (len - 2) / 2, L, along ? s * ((len - 2) / 4 + 1) : x0, 0.8, along ? z0 : s * ((len - 2) / 4 + 1)));
    sh.add(box(along ? len : w, 0.6, along ? dd : len, L, x0, HH - 1.2, z0));
  }
  sh.add(box(sw, 0.6, sw, L, 0, HH - 0.6, 0), box(sw - 2.4, 0.05, sw - 2.4, DARK, 0, HH - 1.21, 0));
  sh.add(box(2.4, 0.5, 2.4, L, 0, 0.8, 0), cyl(0.5, 0.55, 1.3, M.stoneDark, 0, 1.3, 0, 20), at(mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.stoneDark), 0, 2.6, 0));
  d.add(at(sh, sx, 0, sz));
  f.add(mergeByMaterial(d));
  // The guardians: two at the Trimurti's recess, two at the shrine's east door, larger than life.
  f.add(at(guardian(4.2, L), -RW / 2 - 1.2, 0, -HD + 0.6), at(guardian(4.2, L), RW / 2 + 1.2, 0, -HD + 0.6));
  if (!detail.low) for (const s of [-1, 1]) f.add(at(guardian(3.8, L), sx + sw / 2 + 0.9, 0.8, sz + s * 2.1).rotateY(Math.PI / 2));
}

// The island's hill. The rock round the hall is solid blocks (the builder's), 70 m deep, its face
// cut sheer for 14 m either side of the mouth; beyond them the hillside slopes up from the terrace.
// Behind the face the ground climbs inside the rock to its top, then on up to the wooded crest. Over
// the hall and the recess it stays down under the floor, so it never shows inside; there a cap of
// turf (TOP) lies on the rock instead.
export const hillY = (x, z) => {
  const { H } = DIMS, ax = Math.abs(x);
  if (ax < 22 && z > -58 && z < 1) return -0.4;
  const w = smooth(33.5, 42, ax), rise = smooth(0.5, -7, z) * (1 - w) + smooth(9, -9, z) * w;
  const crest = smooth(-60, -300, z) * (40 + 12 * fbm(x, z, { scale: 0.01, octaves: 4 })) * (1 - 0.5 * smooth(150, 380, ax));
  return rise * (H + 0.6 + 1.5 * fbm(x, z, { scale: 0.04, octaves: 2 }) * smooth(-8, -20, z)) + crest - 0.4 * (1 - rise) - 4 * smooth(60, 160, z);
};

// Elephanta: the forested hill over the cave, the terrace before it, the path down past the stalls
// to the jetty, the launches from the Gateway of India, and the harbour, with the ASI board.
export function addDetails(f, g) {
  hall(f);
  g.add(box(48, 0.55, 64, mat('#4e6a37', 0.95), 0, DIMS.H, -6 - 32));
  g.add(heightField(900, 700, detail.low ? 110 : 170, hillY, { cz: -60, rock: ['#5d564c', '#675f53', '#544d44'], cover: '#4e6a37', steep: 0.68 }));
  // The terrace before the cave, paved, and the path down to the sea.
  g.add(box(52, 0.3, 16, M.path, 0, -0.25, 8), box(6, 0.2, 110, M.path, 8, -3.4, 82).rotateX(0.06));
  g.add(sheet(1600, 900, M.sea, 0, -6.2, 420));
  g.add(box(10, 1.4, 40, mat('#7a7166', 0.9), 8, -6.6, 178));
  g.add(launches([[0, 175, 0], [18, 182, 0.3], [-14, 190, -0.2]], { y: -6.2 }));
  const hillTrees = scatter(detail.low ? 60 : 140, [-420, 420, -340, -12], { seed: 3, gap: 12, avoid: [[-36, 36, -64, 0]] }).map(([x, z]) => [x, z, 0, hillY(x, z)]);
  g.add(trees(hillTrees.filter((_, k) => k % 3), { kind: 'mango', seed: 4 }), trees(hillTrees.filter((_, k) => !(k % 3)), { kind: 'banyan', seed: 5 }));
  const front = scatter(detail.low ? 14 : 30, [-160, 160, 25, 160], { seed: 6, gap: 12, avoid: [[-2, 20, 20, 170], [-70, 70, 0, 110]] }).map(([x, z]) => [x, z, 0, hillY(x, z)]);
  g.add(trees(front, { kind: 'palm', seed: 7 }));
  g.add(stalls([[14, 40, -Math.PI / 2], [14, 52, -Math.PI / 2], [14, 64, -Math.PI / 2], [2, 46, Math.PI / 2], [2, 58, Math.PI / 2]], { y: -1.6 }));
  g.add(shrubs(along(10, [-30, 4], [30, 4]), { size: 1.1 }));
  if (!detail.low) g.add(umbrellas([[-16, 12], [18, 13]]));
  g.add(asiBoard('Elephanta Caves', -9, 13, 0.3, { line2: 'WORLD HERITAGE SITE' }));
}
