import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, flag, inst, unitBox, tube, shikhara, nagaraProfile, surface } from '../helpers.js';
import { mauryanDoor } from '../parts/doorways.js';
import { idol, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, asiBoard, scatter, along } from '../parts/realism.js';
import { groundY, whaleback, ROCK, ROCK2, PORCH, SUDAMA, LOMAS, KARAN, SUMMIT, POLISHED, GRANITE } from '../monuments/barabar-caves.js';
import { detail } from '../detail.js';

const WHITE = mat('#ece7dc', 0.85), INK = mat('#5f574f', 0.7), CRACK = mat('#3c3632', 0.95), SLAB = surface(mat('#a39a8c', 0.9), 'paving');
// The inside of Visvakarma's porch, polished and in shadow.
const SHADE = surface(mat('#4d4741', 0.4), 'none');
const CARVED = surface(mat('#93877a', 0.85), 'none');

// Rows of tiny incised letters, w wide, as [x, y] places on a face (rows from the top down).
function letters(w, rows, R) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let x = -w / 2; x < w / 2 - 0.05;) { const l = 0.05 + R() * 0.06; if (R() > 0.12) out.push([x + l / 2, -r * 0.16, l]); x += l + 0.035; }
  return out;
}

// A boulder with a face dressed into one side and a row of n small arched niches cut in it, each
// with an image: the later Hindu carvings on the rocks of the hill (lingas in a row of niches on
// a low boulder; Ganesh and other deities in niches on the rock outside Karan Chaupar).
function carvedBoulder({ L, W, H, n, nh, y0, kind, e = 1 }) {
  const g = new THREE.Group(), fw = L * 1.25, y1 = y0 + nh + 0.2;
  const cut = { x: 0, hw: fw / 2, y0, y1, z: W * 0.82 * Math.pow(Math.cos(Math.asin(Math.pow(y1 / H, 1 / e))), e) };
  g.add(whaleback({ L, W, H, e, cuts: [cut], seed: n, step: L / 5, na: 14, skirt: 0.5 }).mesh);
  for (let k = 0; k < n; k++) {
    const x = (k - (n - 1) / 2) * fw / n, nw = fw / n - 0.14;
    g.add(box(nw, nh * 0.72, 0.03, M.recess, x, y0 + 0.1, cut.z + 0.01), at(mesh(new THREE.CircleGeometry(nw / 2, 14, 0, Math.PI), M.recess), x, y0 + 0.1 + nh * 0.72, cut.z + 0.025));
    if (kind === 'linga') g.add(cyl(nw * 0.2, nw * 0.24, nh * 0.5, CARVED, x, y0 + 0.1, cut.z + 0.12, 10), at(mesh(new THREE.SphereGeometry(nw * 0.2, 10, 6), CARVED), x, y0 + 0.1 + nh * 0.5, cut.z + 0.12));
    else g.add(at(idol(nh * 0.86, CARVED), x, y0 + 0.1, cut.z + 0.1));
  }
  return mergeByMaterial(g);
}

// Barabar, finer detail and setting. From photographs: Lomas Rishi's front, a copy in stone of a
// thatched hut's gable, with the ends of its rafters under the eave, two posts leaning in, a pot
// finial on the point of the arch and, on the smooth wall over the door, the Sanskrit inscription
// of the Maukhari king Anantavarman (5th–6th century); Ashoka's dedications, a few lines of
// Brahmi, beside Sudama's door and outside Karan Chaupar to the right of the entrance; a long
// crack running across the rock above the doors; the later reliefs on a pointed boulder beside
// Karan Chaupar, and boulders carved with Ganesh and with a row of lingas; the porch of
// Visvakarma and the footholds cut up the bare slope to it; and the white shrine of
// Siddheshwarnath far off on the summit. Dimensions follow js/monuments/barabar-caves.js: the
// rock's south foot on z = 0, the doors at SUDAMA, LOMAS and KARAN.
export function addDetails(f, g, { R, rock, by, cuts, pc }) {
  const { W } = ROCK, d = new THREE.Group();
  // Lomas Rishi: what the shared doorway lacks. The posts stand either side of the door and lean
  // in to carry the eave; the rafter ends show as blocks under it; the finial is a pot on a stem.
  const lx = LOMAS[0], lz = cuts[1].z - W, lom = new THREE.Group();
  // The eave: the edge of the thatch as a band round the gable, wider than the carved arches
  // within it and drawn up to a point; under it the ends of the rafters; and the two posts that
  // carry it, leaning in.
  const arc = (r, top, n = 20) => Array.from({ length: n + 1 }, (_, k) => { const a = Math.PI * k / n, x = r * Math.cos(a); return new THREE.Vector2(x, 2.5 + (top - 2.5) * Math.pow(Math.sin(a), 0.85) + 0.35 * Math.pow(Math.max(0, 1 - Math.abs(x) / (r * 0.3)), 2)); });
  const eave = new THREE.Shape([...arc(2.62, 5.42), ...arc(2.46, 5.24).reverse()]);
  lom.add(mesh(new THREE.ExtrudeGeometry(eave, { depth: 0.46, bevelEnabled: false }), POLISHED));
  for (const s of [-1, 1]) {
    const post = box(0.34, 2.7, 0.36, POLISHED, 0, 0, 0.18);
    post.rotation.z = s * 0.045;
    lom.add(at(post, s * 2.42, 0, 0));
  }
  const raft = arc(2.34, 5.1, 12);
  for (let k = 1; k < 12; k++) if (k !== 6) lom.add(box(0.16, 0.16, 0.34, POLISHED, raft[k].x, raft[k].y - 0.08, 0.17));
  // The finial: a pot on a stem, on the point of the eave.
  lom.add(cyl(0.06, 0.1, 0.2, POLISHED, 0, 5.74, 0.23, 8), at(mesh(new THREE.SphereGeometry(0.17, 10, 8), POLISHED), 0, 6.06, 0.23), cyl(0.03, 0.07, 0.24, POLISHED, 0, 6.2, 0.23, 6));
  // The inscription over the door, and the dressed wall of the hollow behind the carving.
  lom.add(box(1.1, 0.42, 0.012, POLISHED, 0, 2.5, 0.07));
  if (!detail.low) lom.add(inst(unitBox(), letters(1, 3, R).map(([x, y, l]) => [x, 2.82 + y, 0.08, l, 0.08, 0.012, 0]), INK));
  d.add(at(lom, lx, 0.25, lz + 0.01));
  // Stone slabs before the doors, as steps.
  d.add(box(3.4, 0.25, 2.6, SLAB, lx, 0, lz + 1.5), box(2.2, 0.25, 1.6, SLAB, SUDAMA[0], 0, cuts[0].z - W + 0.85), box(2.2, 0.25, 1.6, SLAB, KARAN[0], 0, cuts[2].z - W - 0.85));
  // Ashoka's inscriptions, on the rock itself: beside Sudama's door, and outside Karan Chaupar to
  // the right of the entrance as one faces it.
  if (!detail.low) {
    const ins = [];
    for (const [x, y] of letters(1, 4, R)) { const X = SUDAMA[0] + 1.7 + x, Y = 1.9 + y, p = rock.P(X, rock.aAt(X, Y)); ins.push([X, Y, p[2] - W + 0.012, 0.07, 0.08, 0.012, 0]); }
    for (const [x, y] of letters(1.2, 5, R)) { const X = KARAN[0] - 1.9 - x, Y = 1.9 + y, p = rock.P(X, Math.PI - rock.aAt(X, Y)); ins.push([X, Y, p[2] - W - 0.012, 0.07, 0.08, 0.012, 0]); }
    d.add(inst(unitBox(), ins, INK));
  }
  // The crack: a joint in the granite running the length of the south side above the doors.
  const cr = [];
  for (let x = -40; x <= 46; x += 2) { const y = 7.3 - (x + 40) * 0.024 + 0.22 * Math.sin(x * 0.45), p = rock.P(x, rock.aAt(x, y)); cr.push([x, p[1], p[2] - W + 0.02]); }
  d.add(tube(cr, 0.04, CRACK, detail.low ? 50 : 130, 4));
  f.add(d);
  // The pointed boulder beside Karan Chaupar with its reliefs, facing north like the door; and
  // by the way to Visvakarma a rock carved with Ganesh and a low boulder with a row of lingas.
  const sideG = new THREE.Group();
  sideG.add(at(carvedBoulder({ L: 2.4, W: 2.1, H: 4.4, n: 3, nh: 1.1, y0: 0.5, e: 1.5 }), KARAN[0] - 9, 0, -2 * W - 3).rotateY(Math.PI + 0.25));
  sideG.add(at(carvedBoulder({ L: 2.2, W: 1.8, H: 2.6, n: 3, nh: 0.8, y0: 0.5, e: 1.2 }), 46, 0, 9).rotateY(-0.5));
  sideG.add(at(carvedBoulder({ L: 2.1, W: 1.3, H: 1.15, n: 6, nh: 0.5, y0: 0.3, kind: 'linga' }), 38, 0, 15).rotateY(-0.2));
  g.add(sideG);
  // Visvakarma: the porch's polished floor and back wall, the narrow door at the back into the
  // unfinished round chamber, and the sill left as a ledge before it.
  const vx = ROCK2.x + pc.x, vy = by + pc.y0, vz = ROCK2.z + pc.z, v = new THREE.Group();
  v.add(box(2 * pc.hw - 0.02, 0.03, PORCH.d, POLISHED, 0, 0, PORCH.d / 2), box(2 * pc.hw - 0.02, PORCH.h - 0.02, 0.03, SHADE, 0, 0, 0.015));
  for (const s of [-1, 1]) v.add(box(0.03, PORCH.h - 0.02, PORCH.d * 0.8, SHADE, s * (pc.hw - 0.02), 0, PORCH.d * 0.4));
  v.add(box(2 * pc.hw - 0.02, 0.03, PORCH.d * 0.9, SHADE, 0, PORCH.h - 0.06, PORCH.d * 0.45));
  v.add(at(mauryanDoor(0.7, 1.7, SHADE), 0.4, 0.03, 0.03));
  v.add(box(2 * pc.hw + 1.2, 0.5, 0.9, GRANITE, 0.2, -0.75, PORCH.d + 0.25));
  g.add(at(v, vx, vy, vz));
  // The bare slope below it, a sheet of granite, and the 'Ashoka steps': footholds hewn in a line
  // up the rock.
  const ax0 = 58, ax1 = 108, az0 = -6, az1 = 12, n = detail.low ? 10 : 20;
  const ay = (x, z) => { const u = (x - ax0) / (ax1 - ax0), w = (z - az0) / (az1 - az0), b = (1 - Math.pow(2 * u - 1, 4)) * (1 - Math.pow(2 * w - 1, 4)); return groundY(x, z) - 0.9 + 1.7 * b; };
  const geo = new THREE.PlaneGeometry(ax1 - ax0, az1 - az0, n, Math.round(n / 2)).rotateX(-Math.PI / 2).translate((ax0 + ax1) / 2, 0, (az0 + az1) / 2), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, ay(p.getX(k), p.getZ(k)));
  geo.computeVertexNormals();
  g.add(mesh(geo, GRANITE));
  const holds = [];
  for (let k = 0; k < 44; k++) { const u = k / 43, x = 64 + u * 40, z = 9 - u * 9; holds.push([x, ay(x, z) - 0.02, z, 0.3, 0.07, 0.55, 0.2]); }
  g.add(inst(unitBox(), holds, CRACK));
  // The temple of Siddheshwarnath on the summit, some 600 m away: a white shrine and its spire,
  // a hall before it, a saffron flag.
  const t = new THREE.Group(), sy = groundY(SUMMIT[0], SUMMIT[1]);
  t.add(box(16, 4, 14, mat('#9d9384', 0.9), 0, -3.4, 2), box(6, 4.5, 6, WHITE, 0, 0, -1), at(shikhara(5.4, 9, WHITE, nagaraProfile, 8), 0, 4.5, -1), box(7, 3.6, 6, WHITE, 0, 0, 5), box(7.6, 0.3, 6.6, WHITE, 0, 3.6, 5), at(flag(4, M.flagSaffron), 3, 3.9, 7));
  g.add(at(t, SUMMIT[0], sy, SUMMIT[1]));
  // The path to the caves, the board, and palms, mango and scrub on the plain.
  g.add(box(3, 0.05, 70, M.path, 0, 0, 47), box(3, 0.05, 24, M.path, 30, 0, 12).rotateY(1.25));
  g.add(asiBoard('Barabar Caves', 5, 13, -0.3));
  g.add(trees(along(5, [34, 34], [48, 84]), { kind: 'palm', seed: 2 }));
  const plain = scatter(60, [-300, 300, 16, 300], { seed: 3, gap: 16 }).filter(([x, z]) => Math.abs(x) > 8 && !(x < 60 && x > -120 && z < 110));
  g.add(trees(plain.slice(0, 24), { kind: 'palm', seed: 3 }), trees(plain.slice(24, 44), { kind: 'mango', seed: 4 }), trees(plain.slice(44), { kind: 'babul', seed: 5 }));
  g.add(shrubs(scatter(70, [-170, 170, -60, 30], { seed: 6, gap: 6 }).filter(([x, z]) => (Math.abs(x) > ROCK.L + 4 || z < -2 * W - 6) && !(x > 40 && z > -10)).map(([x, z]) => [x, z, 1.2, groundY(x, z)]), { dry: true }));
}
