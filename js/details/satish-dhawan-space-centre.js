import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, inst, unitBox, unitCyl } from '../helpers.js';
import { mergeByMaterial, lettering } from '../parts/components.js';
import { trees, shrubs, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { DECK, Y0, UT, VAB, WHITE, STEEL, CONCRETE, bars } from '../monuments/satish-dhawan-space-centre.js';

const BLUE = mat('#2f5f9e', 0.6), DOOR = mat('#9aa3aa', 0.5, 0.3), DARK = mat('#2b2d30', 0.6), ASPHALT = M.asphalt;

// A patch on a cylinder of radius r about the y axis, facing +z: w wide and h high, its foot at y.
const patch = (r, w, h, y, m, turn = 0) => mesh(new THREE.CylinderGeometry(r, r, h, 10, 1, true, turn - w / r / 2, w / r).translate(0, y + h / 2, 0), m);
// The tricolour painted on a round stage: three bands and the chakra.
function flagOn(r, w, y) {
  const g = new THREE.Group(), h = (w * 2) / 9;
  [M.flagGreen, M.flagWhite, M.flagSaffron].forEach((m, i) => g.add(patch(r + 0.02, w, h, y + i * h, m)));
  g.add(at(mesh(new THREE.TorusGeometry(h * 0.36, h * 0.07, 4, 16), M.navy), 0, y + h * 1.5, r + 0.03));
  return g;
}
// The rocket's markings, on the side the photographs are taken from: the flag on the fairing and
// on the core, INDIA reading up the core and each booster, and the black roll-pattern panels.
function markings(f) {
  const d = new THREE.Group(), up = (text, size, r, x, y) => { const t = lettering(text, size, 0.1, DARK); t.rotation.z = Math.PI / 2; return at(t, x + size / 2, y, r - 0.03); };
  d.add(at(flagOn(2.5, 2.1, 36.6), 0, 0, 0), at(flagOn(2, 1.8, 27.6), 0, 0, 0));
  d.add(up('INDIA', 0.95, 2, 0, 14), up('INDIA', 0.8, 1.6, -3.75, 15.5), up('INDIA', 0.8, 1.6, 3.75, 15.5));
  for (const s of [-1, 1]) for (const t of [0.9, -0.9, 2.4]) d.add(at(patch(1.62, 0.9, 1.5, 19.6, DARK, t), s * 3.75, 0, 0));
  for (const t of [0.8, -0.8, 2.36, -2.36]) d.add(patch(2.02, 1.0, 1.6, 1.2, DARK, t), patch(2.02, 1.0, 1.4, 22.4, DARK, t));
  f.add(at(mergeByMaterial(d), 0, Y0 + 0.25, 0));
}

// What stands on the pad: a rail round the deck's edge and along the trench, four floodlight
// masts at its corners, and the umbilical tower's cable trays down to a low equipment block.
function padFurniture(f) {
  const posts = [], rails = [], E = 41.4;
  const run = (ax, az, bx, bz) => {
    const n = Math.round(Math.hypot(bx - ax, bz - az) / (detail.low ? 5 : 2.5));
    for (let k = 0; k <= n; k++) posts.push([ax + ((bx - ax) * k) / n, DECK + 0.2, az + ((bz - az) * k) / n, 0.08, 1.1, 0.08]);
    for (const y of [0.6, 1.1]) rails.push([ax, DECK + 0.2 + y, az, bx, DECK + 0.2 + y, bz, 0.06]);
  };
  run(-E, -E, E, -E); run(E, -E, E, E); run(E, E, 7.6, E); run(-7.6, E, -E, E); run(-E, E, -E, 16); run(-E, -16, -E, -E);
  run(-7.6, E, -7.6, 10); run(7.6, E, 7.6, 10);
  f.add(inst(unitBox(), posts, STEEL), bars(rails, STEEL));
  const lights = [], heads = [];
  for (const [x, z] of [[-36, -36], [36, -36], [-36, 36], [36, 36]]) { lights.push([x, DECK + 0.2, z, 0.5, 30, 0.5]); heads.push([x, DECK + 30.2, z, 4, 1.4, 1.2, Math.atan2(-x, -z)]); }
  f.add(inst(unitCyl(8), lights, STEEL), inst(unitBox(), heads, WHITE));
  f.add(box(14, 4, 8, WHITE, 24, DECK + 0.2, UT.z - 14), box(14.4, 0.4, 8.4, CONCRETE, 24, DECK + 4.2, UT.z - 14), box(1.2, 0.5, 14, STEEL, 21, DECK + 0.2, UT.z - 3));
}

// The Vehicle Assembly Building: sheeted in white with blue bands, the tall sliding door in its
// east face towards the pad, a lower annexe at each side, and vents on the roof.
function assemblyBuilding(g) {
  const d = new THREE.Group(), x = VAB.x, y = DECK + 0.2, { w, d: dp, h } = VAB;
  d.add(box(0.3, h - 8, 20, DOOR, x + 0.2, y, 0));
  for (let k = 1; k < 8; k++) d.add(box(0.4, 0.3, 20.4, STEEL, x + 0.3, y + (k * (h - 8)) / 8, 0));
  for (const z of [-10.4, 10.4]) d.add(box(0.6, h - 6, 0.8, STEEL, x + 0.3, y, z));
  for (const yy of [h - 5, h * 0.5]) d.add(box(w + 0.3, 2.4, dp + 0.3, BLUE, x - w / 2, y + yy, 0));
  d.add(box(w + 1, 0.8, dp + 1, STEEL, x - w / 2, y + h, 0));
  for (const z of [-1, 1]) d.add(box(w * 0.8, 22, 16, WHITE, x - w / 2, y, z * (dp / 2 + 8)), box(w * 0.8 + 0.3, 1.2, 16.3, BLUE, x - w / 2, y + 19, z * (dp / 2 + 8)));
  for (const z of [-12, 0, 12]) d.add(box(4, 2.2, 4, STEEL, x - w / 2, y + h + 0.8, z));
  g.add(mergeByMaterial(d));
}

// Sriharikota, the setting: the pad's furniture and the rocket's paint, the assembly building's
// dress, the water tower that feeds the deluge on the pad, the perimeter road, and the island
// itself: sand under scrub, belts of casuarina planted against the wind, palmyra-like palms, and
// the shore of the Bay of Bengal to the east.
export function addDetails(f, g) {
  markings(f);
  padFurniture(f);
  assemblyBuilding(g);
  // The water tower north-west of the pad: a tank on a concrete shaft.
  const tank = new THREE.Group();
  tank.add(cyl(3, 3.6, 34, CONCRETE, 0, 0.2, 0, 20), lathe([[3, 0], [9, 5], [9, 12], [8.4, 13.2], [0, 14.2]], WHITE, 28).translateY(32), cyl(9.05, 9.05, 1.2, mat('#2f5f9e', 0.6), 0, 41, 0, 28));
  g.add(at(tank, -120, 0, -105));
  // The road round the pad and out along the causeway.
  const road = mesh(new THREE.RingGeometry(96, 103, 72).rotateX(-Math.PI / 2), ASPHALT, 0, 0.26, 0);
  road.receiveShadow = true;
  g.add(road, box(300, 0.08, 7, ASPHALT, -250, 0.2, 26), box(7, 0.08, 300, ASPHALT, 30, 0.2, -250));
  // Low blocks of the pad's services, well back from it.
  for (const [x, z, w, dd, h] of [[120, -150, 30, 16, 6], [-60, -170, 40, 14, 5], [150, 90, 18, 12, 4.5]]) g.add(box(w, h, dd, WHITE, x, 0.2, z), box(w + 0.6, 0.4, dd + 0.6, CONCRETE, x, h + 0.2, z));
  const keep = [[-110, 110, -110, 110], [VAB.x - 80, 0, -45, 45], [-135, -105, -120, -90], [105, 135, -160, -140]];
  const land = [-640, 400, -640, 640];
  g.add(shrubs(scatter(detail.low ? 160 : 420, land, { seed: 3, gap: 7, avoid: keep }).map(([x, z], i) => [x, z, 1.4 + (i % 4) * 0.5]), { dry: true, seed: 4 }));
  g.add(shrubs(scatter(detail.low ? 80 : 220, land, { seed: 5, gap: 9, avoid: keep }).map(([x, z], i) => [x, z, 1.8 + (i % 3) * 0.6]), { seed: 6 }));
  const belts = [...along(40, [380, -620], [380, 620]), ...along(36, [366, -600], [366, 600]), ...along(22, [-150, 160], [150, 185]), ...along(26, [-420, -150], [-170, -210])];
  g.add(trees(belts.filter(([x, z]) => !(Math.abs(z) < 30 && x > 300)), { kind: 'casuarina', seed: 7 }));
  g.add(trees(scatter(detail.low ? 30 : 60, land, { seed: 8, gap: 26, avoid: keep }), { kind: 'casuarina', seed: 9 }), trees(scatter(26, land, { seed: 10, gap: 40, avoid: keep }), { kind: 'palm', seed: 11 }), trees(scatter(24, land, { seed: 12, gap: 40, avoid: keep }), { kind: 'babul', seed: 13 }));
}
