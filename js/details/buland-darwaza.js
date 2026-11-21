import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, surface } from '../helpers.js';
import { D, arcadeScreen, star, mergeByMaterial, inlayBorder, archSlab, archRing, windowFrame, jali, pilasters, beltCourse } from '../parts/components.js';
import { detail } from '../detail.js';
import { trees, asiBoard, scatter } from '../parts/realism.js';

// Buland Darwaza, finer detail. From photographs and descriptions: the great arch is framed in a
// band of Quranic inscription, cut in black marble on white; white marble stars are inlaid along
// the spandrels; a blind arcade runs along the parapet under the row of kiosks; and the octagonal
// turrets at the ends are banded in white marble. Dimensions follow js/monuments/buland-darwaza.js:
// platform P = 13, the iwan 26 × 32 with its face at z = 8.
const SCRIPT = surface(mat('#ece6da', 0.6), 'script');
function architecture(f) {
  const d = new THREE.Group(), P = 13, Mb = M.marble;
  for (const x of [-13.65, 13.65]) d.add(box(0.85, 32.4, 0.05, SCRIPT, x, P + 0.3, 8.02));
  d.add(box(28.15, 0.85, 0.05, SCRIPT, 0, P + 32.3, 8.02));
  for (const x of [-10.2, -6.6, 6.6, 10.2]) d.add(at(star(6, 0.75, Mb), x, P + 30.4 - Math.abs(x) * 0.12, 8.02));
  d.add(at(arcadeScreen(30.6, 2.6, 17, 1.1, 1.9, 0.2, M.redLight), 0, P + 35.2, 8.1));
  for (const s of [-1, 1]) for (let k = 1; k <= 4; k++) d.add(cyl(1.86, 1.86, 0.35, Mb, s * 21, P + k * 8.2, 8.2, 8));
  // The piers either side of the great arch (x 15.5 to 19, between the arch's frame and the
  // turret): a stack of four sunk panels, each a blind arch in a white marble border.
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) d.add(at(bay(3, 8, 0.3), s * 17.25, P + 1.6 + k * 8.4, 8.01));
  // Inside the iwan, the back wall either side of the doorway: two tiers of small arched windows
  // with stone screens, as the galleries that look out through it.
  for (const x of [-9.4, -6.6, 6.6, 9.4]) for (const y of [2.2, 7.6]) d.add(at(windowFrame(1.5, 3.2, Mb, { screen: jali(Mb) }), x, P + y, 2.07));
  // The gate's platform, either side of the stair and down its flanks: arched cells in borders.
  for (const s of [-1, 1]) {
    for (const x of [27.4, 32]) d.add(at(bay(3.4, 8.6, 0.32), s * x, 2, 11.01));
    for (const z of [-3, 4.5]) d.add(onFace(at(bay(3.4, 8.6, 0.32), 0, 2, 0), s * Math.PI / 2, 35.01, -s * z));
  }
  mergeByMaterial(d);
  f.add(d);
}

// A blind arch in a sunk panel, w wide and h high from y = 0, on a wall at z = 0: a dark recess
// under a pointed arch with a moulded ring, framed by a white marble border (with black inlay on
// desktops).
function bay(w, h, band) {
  const g = new THREE.Group(), aw = w - 2 * band - 0.5, ah = h - 2 * band - 0.6;
  g.add(at(archSlab(aw, ah, true, M.recess, 0.02), 0, band + 0.3, 0));
  g.add(at(archRing(aw, ah, true, 0.14, 0.05, M.redLight), 0, band + 0.3, 0.02));
  g.add(inlayBorder(w, h, band, M.marble, D.ink, { every: detail.low ? 0 : band * 2.4 }));
  return g;
}

// The ridge the mosque stands on is held by retaining walls of red stone (js/monuments/
// buland-darwaza.js, jamaMasjid: a block 164 × 13 × 140 centred on x = -6, z = -78): a plinth
// course and a coping, and buttresses every 8 m, so its long faces are not bare.
function ridge(f) {
  const d = new THREE.Group(), P = 13, X0 = -88, X1 = 76, Z0 = -8, Z1 = -148, Rl = M.redLight;
  d.add(at(beltCourse(164, 140, 0, 0.9, 0.3, Rl), -6, 0, -78), at(beltCourse(164, 140, P - 0.8, 0.8, 0.35, Rl), -6, 0, -78));
  // The front face either side of the gate's platform, the flanks and the back.
  // [face, distance out, from, to, lateral sign]: onFace runs the lateral coordinate along +x on
  // the front, -x on the back, +z on the west flank and -z on the east.
  const runs = [[0, Z0, X0, -35, 1], [0, Z0, 35, X1, 1], [Math.PI, -Z1, X0, X1, -1], [-Math.PI / 2, -X0, Z1, Z0, 1], [Math.PI / 2, X1, Z1, Z0, -1]];
  for (const [a, dist, from, to, sg] of runs) {
    const len = to - from, n = Math.max(2, Math.round(len / 8)), lat = sg * (from + to) / 2;
    d.add(onFace(at(pilasters(len - 6, n, 1.4, P - 1.7, 0.6, Rl), 0, 0.9, 0.3), a, dist, lat));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Buland Darwaza at Fatehpur Sikri: neem trees on the ridge either side of the great flight of
// steps and round the mosque behind, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  ridge(f);
  // (A few dhok only: Fatehpur's ridge is bare.)
  g.add(trees(scatter(22, [-125, 125, -210, 115], { seed: 6, gap: 15, avoid: [[-70, 70, -25, 45], [-92, 78, -152, -8]] }).slice(0, 8), { kind: 'dhok', seed: 6 }));
  g.add(asiBoard('Buland Darwaza, Fatehpur Sikri', 30, 60, 0, { line2: 'WORLD HERITAGE SITE' }));
}
