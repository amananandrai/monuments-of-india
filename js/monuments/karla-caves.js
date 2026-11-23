import * as THREE from 'three';
import { mat, mesh, box, cyl, at, lathe, archWall, barrelVault, surface, photo, hemi, doubleSided } from '../helpers.js';
import { lionCapital } from '../parts/animals.js';
import { heightField, fbm, smooth, ridged } from '../parts/terrain.js';
import { frieze } from '../parts/components.js';
import { addDetails, navePillars, blockLions } from '../details/karla-caves.js';
import { detail } from '../detail.js';

// The Deccan basalt of the Sahyadri, dark grey-brown and streaked with weather; and the teak of the
// vault's ribs and the great window's arch, which has lasted some two thousand years.
export const ROCK = photo(surface(mat('#6e655c', 0.93), 'rock'), 'rubble');
export const ROCK_LIGHT = surface(mat('#8a7f72', 0.9), 'none');
export const TEAK = surface(mat('#5a3d27', 0.8), 'carved');
const DARK = surface(mat('#1e1a17', 0.95), 'none');

// The Great Chaitya at Karla, 1st century BCE to 2nd century CE. From the ASI's plan and
// photographs, in the cave's own frame: the hill's face at z = 0, +z out over the valley, the floor
// at y = 0. A porch (veranda) 15.8 m wide and 4.6 m deep is cut into the face, its side walls
// carved with three elephants each; across its mouth stood an outer screen, of which two stout
// eight-sided pillars remain below and four dwarf columns above; at its back a screen wall with
// three doorways, and over them the great horseshoe
// window, its teak arch still in place; behind the screen the hall, 37.9 m deep, 13.9 m wide and
// 14 m high, a nave between two rows of fifteen pillars under a ribbed barrel vault, seven plain
// piers carrying the colonnade round the stupa in the apse (37 in all).
// Before the porch, on the left, stands the lion pillar; on the right, where its twin stood, the
// shrine of the goddess Ekvira.
export const V = { w: 15.8, h: 18, d: 4.6 };
export const HALL = { w: 13.9, h: 14, l: 37.9, z0: -5.6 };

// The hill: bare basalt at the face, wooded slopes above in scarps and terraces, and below the
// court the hillside falling steeply to the plain 100 m down. Under the cave's rock (|x| < 22,
// -54 < z < 2) it is sunk out of the way; the cut rock is built of blocks.
export function hillY(x, z) {
  if (Math.abs(x) < 22 && z > -54 && z < 2) return -2;
  const ax = Math.abs(x), top = 32 - 16 * smooth(30, 240, ax) + 5 * fbm(x * 0.6, 7, { scale: 0.03, octaves: 3 }) * smooth(24, 60, ax);
  const zE = 0.2 * Math.max(0, ax - 26) + 4 * Math.sin(x * 0.07) * smooth(24, 40, ax);
  if (z < zE) return top + Math.max(0, -z - 50) * 0.32 + 6 * ridged(x, z, { scale: 0.01, octaves: 3 }) * smooth(-40, -120, z) + 2 * fbm(x, z, { scale: 0.05, octaves: 2 });
  return -0.3 - 95 * smooth(24, 160, z) - Math.max(0, ax - 40) * 0.12 * smooth(0, 30, z) + (z > 24 ? 3 * fbm(x, z, { scale: 0.03, octaves: 3 }) : 0);
}

export function buildKarlaCaves() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { w: vw, h: vh, d: vd } = V, { w: hw, h: hh, l: hl, z0 } = HALL, T = 32, X = 22, Z = 54, hz1 = z0 - hl;
  // The rock round the porch and the hall: blocks leaving the hollows open.
  const rock = new THREE.Group();
  rock.add(box(X - vw / 2, T, Z, ROCK, -(X + vw / 2) / 2, 0, -Z / 2), box(X - vw / 2, T, Z, ROCK, (X + vw / 2) / 2, 0, -Z / 2));
  rock.add(box(vw, T - vh, vd, ROCK, 0, vh, -vd / 2));
  rock.add(box((vw - hw) / 2, T, Z - vd, ROCK, -(vw + hw) / 4, 0, -(Z + vd) / 2), box((vw - hw) / 2, T, Z - vd, ROCK, (vw + hw) / 4, 0, -(Z + vd) / 2));
  rock.add(box(hw, T - hh - 1, Z - vd, ROCK, 0, hh + 1, -(Z + vd) / 2), box(hw, hh + 1, Z + hz1, ROCK, 0, 0, (hz1 - Z) / 2));
  f.add(rock);
  // The screen wall at the back of the porch: three doorways below, the great window above.
  const sz = -vd - 0.5, sc = new THREE.Group();
  sc.add(box(vw, 0.4, vd, ROCK_LIGHT, 0, 0, -vd / 2));
  for (const [x0, x1] of [[-vw / 2, -5.8], [-4.2, -1.3], [1.3, 4.2], [5.8, vw / 2]]) sc.add(box(x1 - x0, 6.4, 1, ROCK_LIGHT, (x0 + x1) / 2, 0, sz));
  for (const [x, w] of [[0, 2.6], [-5, 1.6], [5, 1.6]]) sc.add(box(w, 6.4 - (x ? 3.6 : 4.4), 1, ROCK_LIGHT, x, x ? 3.6 : 4.4, sz));
  // A gallery ledge over the doors, then the window: a horseshoe 10 m wide whose crown meets the vault.
  sc.add(box(vw, 0.6, 1.8, ROCK_LIGHT, 0, 6.4, sz + 0.4));
  sc.add(at(archWall(vw, vh - 7, 1, 10.4, 8.6, false, ROCK_LIGHT), 0, 7, sz));
  f.add(sc);
  // The window's teak arch, and its ribs and lattice.
  const arch = new THREE.Group(), ar = 5.2, ay = 7 + 8.6 - ar;
  arch.add(mesh(new THREE.TorusGeometry(ar - 0.2, 0.22, 8, 36, Math.PI), TEAK, 0, ay, sz + 0.55));
  for (const s of [-1, 1]) arch.add(box(0.4, ay - 7, 0.4, TEAK, s * (ar - 0.2), 7, sz + 0.55));
  for (let k = 1; k < 8; k++) { const a = (k / 8) * Math.PI; arch.add(at(box(0.12, ar - 1.2, 0.12, TEAK, 0, 0, 0), Math.cos(a) * 0.8, ay, sz + 0.45).rotateZ(a - Math.PI / 2)); }
  arch.add(mesh(new THREE.TorusGeometry(1.1, 0.12, 6, 20, Math.PI), TEAK, 0, ay, sz + 0.45), box(2 * ar - 0.4, 0.2, 0.2, TEAK, 0, ay - 0.1, sz + 0.45));
  f.add(arch);
  // The outer screen across the porch's mouth: two stout eight-sided pillars with neither base
  // nor capital, the rock over them cut with mortises for a timber gallery, and above it the dwarf
  // colonnade of four columns that let the light through to the great window.
  const os = new THREE.Group(), oz = -0.75;
  for (const x of [-2.7, 2.7]) os.add(cyl(0.8, 0.8, 6.6, ROCK_LIGHT, x, 0.4, oz, 8));
  os.add(box(vw, 2.9, 1.5, ROCK_LIGHT, 0, 7, oz), box(vw, 0.35, 1.7, ROCK_LIGHT, 0, 9.9, oz), box(vw, vh - 13.6, 1.5, ROCK_LIGHT, 0, 13.6, oz));
  for (const x of [-4.8, -1.6, 1.6, 4.8]) os.add(cyl(0.4, 0.44, 3, ROCK_LIGHT, x, 10.25, oz, 8), box(1.1, 0.35, 1.1, ROCK_LIGHT, x, 13.25, oz));
  f.add(os);
  // The hall: floor, the nave's two rows of pillars and the seven piers of the apse, the ribbed
  // vault and the half-dome over the stupa, the aisles' flat roofs.
  const hall = new THREE.Group(), n = 15, ph = 8.4, zc = z0 - 2.2 - (n - 1) * 2 - 0.75, nave = [], plain = [];
  hall.add(box(hw, 0.2, hl, ROCK_LIGHT, 0, 0, z0 - hl / 2));
  for (const s of [-1, 1]) for (let k = 0; k < n; k++) (k < 2 ? plain : nave).push([s * 4.4, z0 - 2.2 - k * 2, s]);
  // The four under the entrance gallery are plainer, without the animals.
  for (const [x, z] of plain) hall.add(box(1.1, 0.5, 1.1, ROCK_LIGHT, x, 0.2, z), cyl(0.42, 0.45, ph - 1.3, ROCK_LIGHT, x, 0.7, z, 8), box(1.2, 0.8, 1.2, ROCK_LIGHT, x, ph - 0.6, z));
  for (let k = 1; k < 8; k++) hall.add(cyl(0.42, 0.45, ph, ROCK_LIGHT, 4.4 * Math.cos((k * Math.PI) / 8), 0.2, zc - 4.4 * Math.sin((k * Math.PI) / 8), 8));
  hall.add(navePillars(nave, ph, ROCK_LIGHT));
  hall.add(at(barrelVault(5, z0 - 1 - zc, ROCK_LIGHT), 0, ph + 0.2, (z0 - 1 + zc) / 2));
  const apse = mesh(new THREE.SphereGeometry(5, 16, 8, Math.PI, Math.PI, 0, Math.PI / 2), doubleSided(ROCK_LIGHT), 0, ph + 0.2, zc);
  apse.castShadow = false;
  hall.add(apse, box(10, 0.5, 0.6, ROCK_LIGHT, 0, ph - 0.3, z0 - 4.4), at(mesh(new THREE.TorusGeometry(4.7, 0.3, 4, 16, Math.PI), ROCK_LIGHT), 0, ph + 0.2, zc).rotateX(-Math.PI / 2));
  for (let k = 0; k < 15; k++) hall.add(mesh(new THREE.TorusGeometry(4.85, 0.13, 4, 18, Math.PI), TEAK, 0, ph + 0.2, z0 - 1.6 - k * 2));
  // The stupa: a drum of two storeys, each ringed with a railing, the dome, the harmika spreading
  // in steps, and the wooden umbrella on its shaft.
  const st = zc - 0.4;
  hall.add(cyl(2.55, 2.6, 1.5, ROCK_LIGHT, 0, 0.2, st, 24), cyl(2.64, 2.64, 0.45, frieze(ROCK_LIGHT), 0, 1.25, st, 24), cyl(2.3, 2.3, 1.4, ROCK_LIGHT, 0, 1.7, st, 24), cyl(2.38, 2.38, 0.45, frieze(ROCK_LIGHT), 0, 2.65, st, 24), at(hemi(2.2, ROCK_LIGHT, 24), 0, 3.1, st));
  hall.add(box(1, 0.7, 1, ROCK_LIGHT, 0, 5.2, st), box(1.3, 0.2, 1.3, ROCK_LIGHT, 0, 5.9, st), box(1.6, 0.2, 1.6, ROCK_LIGHT, 0, 6.1, st), box(1.9, 0.2, 1.9, ROCK_LIGHT, 0, 6.3, st));
  hall.add(cyl(0.06, 0.06, 2, TEAK, 0, 6.5, st, 6), cyl(1.6, 1.4, 0.15, TEAK, 0, 8.5, st, 20));
  hall.add(box(hw - 0.2, 0.05, hl, DARK, 0, hh + 0.9, z0 - hl / 2));
  f.add(hall);
  // The lion pillar: a sixteen-sided shaft on a stepped base, its bell capital crowned by four
  // lions back to back.
  const lp = new THREE.Group(), lh = 11.5;
  lp.add(box(2.6, 0.6, 2.6, ROCK_LIGHT, 0, 0, 0), box(2, 0.6, 2, ROCK_LIGHT, 0, 0.6, 0), cyl(0.62, 0.72, lh, ROCK_LIGHT, 0, 1.2, 0, 16));
  lp.add(at(lathe([[0.6, 0], [0.95, 0.35], [1.05, 0.8], [0.75, 1.2], [0.8, 1.3]], ROCK_LIGHT, 24), 0, lh + 1.2, 0), box(2.2, 0.45, 2.2, ROCK_LIGHT, 0, lh + 2.5, 0));
  // (on phones the four lions are cut in blocks: js/detail.js)
  lp.add(at(detail.low ? blockLions(ROCK_LIGHT, 1.25) : lionCapital(ROCK_LIGHT, 1.25), 0, lh + 2.95 - 0.9, 0));
  f.add(at(lp, -vw / 2 - 1.2, 0, 4.2));
  // The ground: the hill, the court before the cave levelled out of it.
  g.add(heightField(1600, 1600, detail.low ? 160 : 320, hillY, { cz: 100, rock: ['#6e655c', '#7a6f63', '#5f574f'], band: 8, cover: '#5c7a3c', steep: 0.72 }));
  g.add(box(80, 0.4, 26, ROCK_LIGHT, 0, -0.4, 12));
  addDetails(f, g, { vw, vh, vd, sz, T });
  // From below and to the right of the court, the lion pillar against the porch.
  return { group: g, focus: f, view: [0.38, 0.12, 1], zoom: 0.72 };
}
