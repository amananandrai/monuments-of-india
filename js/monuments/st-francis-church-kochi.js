import * as THREE from 'three';
import { mat, mesh, box, at, photo, doubleSided, archWall, bell } from '../helpers.js';
import { mergeByMaterial, gableRoof } from '../parts/components.js';
import { classicalDoor, towerClock } from '../parts/colonial.js';
import { addDetails } from '../details/st-francis-church-kochi.js';

// St Francis's walls of laterite under lime plaster, washed a cream yellow, mouldings and all; the
// clay tiles of its roof, and the teak of its doors and shutters.
export const LIME = photo(mat('#f0e6b2', 0.86), 'plaster');
export const TRIM = mat('#e9dea6', 0.85);
export const TILE = mat('#8c4530', 0.82);
export const TEAK = photo(mat('#8a5632', 0.7), 'timber');

// The church's measures, shared with js/details/st-francis-church-kochi.js: the nave W wide and
// L long, its walls H high, under a roof RH high; the front's face at z = FZ.
const BRONZE = mat('#4a4a44', 0.5, 0.4), STONE = mat('#8d8a80', 0.8);

export const P = { W: 15, L: 40, H: 8.6, RH: 5.4, FZ: 20 };

// The outline of the curvilinear gable above the main cornice, from its right foot round to its
// left: a flat shoulder at each corner (where a pinnacle stands), a concave sweep and a convex one
// up to the upper cornice, then a second concave sweep to a narrower round head.
function gableOutline(k = 1, y0 = 0) {
  const sh = new THREE.Shape(), q = (cx, cy, x, y) => sh.quadraticCurveTo(cx * k, y0 + cy * k, x * k, y0 + y * k), l = (x, y) => sh.lineTo(x * k, y0 + y * k);
  sh.moveTo(-8.1 * k, y0); l(8.1, 0); l(8.1, 1.15); l(6.9, 1.15);
  q(5.5, 1.2, 5.3, 2.5); q(5.2, 4.15, 4.0, 4.25); l(3.5, 4.25); q(2.4, 4.4, 2.2, 5.3); sh.bezierCurveTo(2.1 * k, y0 + 6.2 * k, 1.2 * k, y0 + 6.5 * k, 0, y0 + 6.5 * k);
  sh.bezierCurveTo(-1.2 * k, y0 + 6.5 * k, -2.1 * k, y0 + 6.2 * k, -2.2 * k, y0 + 5.3 * k); q(-2.4, 4.4, -3.5, 4.25); l(-4.0, 4.25); q(-5.2, 4.15, -5.3, 2.5); q(-5.5, 1.2, -6.9, 1.15); l(-8.1, 1.15);
  sh.closePath();
  return sh;
}

// A stepped pyramidal pinnacle on a square pier, h high and w square, standing on y = 0.
function steppedPinnacle(w, h) {
  const g = new THREE.Group(), ph = h * 0.42, n = 5;
  g.add(box(w, ph, w, LIME), box(w + 0.25, 0.18, w + 0.25, TRIM, 0, ph, 0));
  for (let k = 0; k < n; k++) g.add(box(w * (1 - k / n) * 0.95, (h - ph - 0.18) / n, w * (1 - k / n) * 0.95, LIME, 0, ph + 0.18 + k * (h - ph - 0.18) / n, 0));
  return g;
}

// St Francis Church, Fort Kochi, built by the Portuguese in 1503 and rebuilt in stone about 1516.
// From photographs (Wikimedia Commons: St Francis Church Fort Kochi DSC 1048.JPG; St. Francis
// Church, Kochi.JPG; St. Francis Church, Cochin.jpg): a long nave under a tiled gable roof, with
// round-arched windows between buttresses down its sides; a lower chancel at the east end; and the
// front, facing the street, divided by four pilasters into three bays and by a cornice into two
// registers, the round-arched doorway in the middle below and three shuttered windows with
// fanlights above. Over the main cornice the gable rises in two concave sweeps to a narrower round
// head, a clock in its field, with a stepped pyramidal pinnacle on each outer shoulder; on top a
// bell-cote of a single arch with one bell, a stepped cap and a cross. The front faces +z.
export function buildStFrancisChurchKochi() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, L, H, RH, FZ } = P, z0 = FZ - L / 2;
  // The plinth, the nave and its roof; the chancel behind.
  f.add(box(W + 1.4, 0.5, L + 1.4, TRIM, 0, 0, z0));
  f.add(box(W, H, L, LIME, 0, 0.5, z0), box(W + 0.5, 0.45, L + 0.3, TRIM, 0, 0.5 + H - 0.45, z0 - 0.15));
  f.add(at(gableRoof(W + 2.2, L + 0.6, RH, doubleSided(TILE)), 0, 0.5 + H, z0 - 0.3));
  const cz = z0 - L / 2 - 4.5;
  f.add(box(10, H - 2, 9, LIME, 0, 0.5, cz), box(10.4, 0.4, 9.4, TRIM, 0, 0.5 + H - 2.4, cz));
  f.add(at(gableRoof(12, 9.8, 3.8, doubleSided(TILE)), 0, 0.5 + H - 2, cz));
  // Buttresses down the sides, and a round-arched window between each pair.
  const side = new THREE.Group(), win = classicalDoor(1.5, 3.2, { m: LIME, trim: TRIM, fill: 'glass', top: null, depth: 0.25, frame: 0.3, keystone: false });
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 8; k++) side.add(box(0.8, H - 1.2, 1, LIME, s * (W / 2 + 0.4), 0.5, z0 - L / 2 + 0.6 + k * (L - 1.2) / 8));
    for (let k = 0; k < 8; k++) {
      const z = z0 - L / 2 + 0.6 + (k + 0.5) * (L - 1.2) / 8;
      side.add(at(win.clone(), s * (W / 2 + 0.01), 3.2, z).rotateY(s * Math.PI / 2));
    }
  }
  f.add(mergeByMaterial(side));
  // The front wall up to the main cornice, its mid cornice, and the four pilasters with their
  // moulded bases and caps in each register.
  const fr = new THREE.Group(), T = 1, FW = W + 1.2, Y1 = 0.5 + 4.5, Y2 = 0.5 + H, zf = FZ + T / 2;
  fr.add(box(FW, Y2, T, LIME, 0, 0, FZ), box(FW + 0.3, 0.6, T + 0.3, TRIM, 0, 0, FZ));
  fr.add(box(FW + 0.5, 0.3, T + 0.5, TRIM, 0, Y1, FZ), box(FW + 0.4, 0.14, T + 0.3, TRIM, 0, Y1 - 0.2, FZ));
  fr.add(box(FW + 0.7, 0.35, T + 0.7, TRIM, 0, Y2, FZ), box(FW + 0.4, 0.16, T + 0.4, TRIM, 0, Y2 - 0.22, FZ));
  for (const x of [-7.55, -2.6, 2.6, 7.55]) for (const [y0, y1] of [[0.6, Y1 - 0.2], [Y1 + 0.3, Y2 - 0.22]]) {
    fr.add(box(0.85, y1 - y0, 0.24, LIME, x, y0, zf + 0.1), box(1.05, 0.3, 0.34, TRIM, x, y0, zf + 0.14), box(1.05, 0.2, 0.34, TRIM, x, y1 - 0.3, zf + 0.14));
  }
  // The curvilinear gable with its coping, the upper cornice across it and the two pilasters that
  // run up to it; the clock in its round frame.
  const GY = Y2 + 0.35, rim = gableOutline(1.035, -0.12);
  rim.holes.push(gableOutline(0.999));
  fr.add(at(mesh(new THREE.ExtrudeGeometry(gableOutline(), { depth: T, bevelEnabled: false, curveSegments: 10 }), LIME), 0, GY, FZ - T / 2));
  fr.add(at(mesh(new THREE.ExtrudeGeometry(rim, { depth: T + 0.3, bevelEnabled: false, curveSegments: 10 }), TRIM), 0, GY, FZ - T / 2 - 0.15));
  fr.add(box(8.5, 0.28, T + 0.5, TRIM, 0, GY + 4.25, FZ), box(8.2, 0.12, T + 0.3, TRIM, 0, GY + 4.08, FZ));
  for (const x of [-2.6, 2.6]) fr.add(box(0.8, 4.0, 0.22, LIME, x, GY, zf + 0.1), box(1.0, 0.2, 0.32, TRIM, x, GY + 3.78, zf + 0.14));
  fr.add(at(mesh(new THREE.TorusGeometry(0.78, 0.12, 6, 28), TRIM), 0, GY + 2.3, zf + 0.06), at(towerClock(1.3), 0, GY + 2.3, zf));
  for (const s of [-1, 1]) fr.add(at(steppedPinnacle(1.1, 3), s * 7.5, GY + 1.15, FZ));
  // The bell-cote: a single arch with its bell, a cornice, a stepped pyramidal cap and a cross.
  const by = GY + 6.4;
  fr.add(at(archWall(1.6, 2.1, 0.9, 0.7, 1.5, false, LIME), 0, by, FZ), box(1.9, 0.2, 1.1, TRIM, 0, by + 2.1, FZ), at(bell(0.26, BRONZE), 0, by + 0.75, FZ), box(0.08, 0.5, 0.08, BRONZE, 0, by + 1.0, FZ));
  for (let k = 0; k < 4; k++) fr.add(box(1.5 - k * 0.36, 0.3, 0.9 - k * 0.2, LIME, 0, by + 2.3 + k * 0.3, FZ));
  fr.add(box(0.1, 1.0, 0.1, BRONZE, 0, by + 3.5, FZ), box(0.5, 0.1, 0.1, BRONZE, 0, by + 4.1, FZ));
  f.add(mergeByMaterial(fr));
  // The openings of the front: the doorway under its moulded arch and fanlight, a tablet over it,
  // and in each bay of the upper register a window with a fanlight over closed teak shutters.
  const fw = new THREE.Group();
  fw.add(at(classicalDoor(3, 4.1, { m: LIME, trim: TRIM, leafM: TEAK, top: null, depth: 0.3, frame: 0.5, band: 0.3, keystone: false }), 0, 0.5, zf + 0.01), box(1, 0.5, 0.06, STONE, 0, Y1 - 0.9, zf + 0.34));
  const fwin = classicalDoor(1.7, 3, { m: LIME, trim: TRIM, fill: 'glass', top: null, depth: 0.2, frame: 0.2, keystone: false, sill: false });
  for (const x of [-5.1, 0, 5.1]) {
    fw.add(at(fwin.clone(), x, Y1 + 0.95, zf + 0.01));
    for (const s of [-1, 1]) fw.add(box(0.82, 2.1, 0.07, TEAK, x + s * 0.425, Y1 + 0.97, zf + 0.1), box(0.6, 0.75, 0.03, TEAK, x + s * 0.425, Y1 + 1.15, zf + 0.14), box(0.6, 0.75, 0.03, TEAK, x + s * 0.425, Y1 + 2.1, zf + 0.14));
  }
  f.add(mergeByMaterial(fw));
  addDetails(f, g);
  // From the street, a little to one side: the gabled front over the cenotaph and the railings.
  return { group: g, focus: f, view: [0.32, 0.18, 1], zoom: 0.95 };
}
