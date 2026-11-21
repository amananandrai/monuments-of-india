import * as THREE from 'three';
import { M, V, mat, mesh, box, at, inst, unitBox, unitCyl, onFace, FACES, strut, bulbPoints } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { keralaGable } from './temples.js';
import { detail } from '../detail.js';
import { trees, along, cityAround } from './realism.js';
import { rideElephant } from './animals.js';

// Sree Padmanabhaswamy, finer detail. From photographs: the temple is Kerala work inside a Pandyan
// gopuram. Its roofs carry carved timber gables (mukhappu) on their fronts and backs; their deep
// eaves rest on rows of timber struts; the shrine's outer wall is lined with the vilakkumadam,
// tiers of brass lamps on timber battens, lit at festivals; and the outer walls are capped with a
// tiled coping. Dimensions follow js/monuments/padmanabhaswamy-temple.js: the shrine a block 34 ×
// 46 from y = 1.2 to 8.2 centred on z = -10 under a copper hip roof 38 × 50 × 8; the upper storey
// 16 × 26 from y = 12 to 16 at z = -12 under a gilt roof 19 × 29 × 6; outer walls 7 high and 2.5
// thick round 100 × 130, open on the east (+z) at the gopuram.
const COPPER = mat('#b0773f', 0.45, 0.4);
const TEAK = mat('#5a3a24', 0.7);
const TILE = mat('#9a4a32', 0.8);
const BRASS = mat('#b8913f', 0.35, 0.8);

// A gable set into a hip roof (w × d × h, base at y0, centred on z0) on its front (s = 1) or back
// (s = -1) face, its face `back` metres in from the roof's edge, buried deep enough that its ridge
// stays under the slope behind it.
function gableOn(f, roofW, roofD, roofH, y0, z0, s, gw, gh, back, roofM) {
  const half = roofD / 2, zf = half - back, y = y0 + roofH * (1 - zf / half), d = ((gh + 0.3) * half) / roofH + 0.5;
  const gb = keralaGable(gw, gh, d, roofM, TEAK);
  gb.position.set(0, y, z0 + s * zf);
  gb.rotation.y = s > 0 ? 0 : Math.PI;
  f.add(gb);
}

// Timber struts under the eaves of the lower roof, all round the shrine: each from the wall 2.4 m
// below the eave out to the roof's edge.
function struts(d) {
  const W = 34, D = 46, y0 = 8.2, list = [];
  for (const a of FACES) {
    const len = Math.abs(Math.sin(a)) > 0.5 ? D : W, dist = (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2, n = Math.round(len / 2.6);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n), s = Math.sin(a), c = Math.cos(a);
      const at0 = (out, y) => V(s * (dist + out) + c * lat, y, -10 + c * (dist + out) - s * lat);
      list.push(strut(at0(0.1, y0 - 2.4), at0(1.6, y0 - 0.25), 0.16, TEAK));
    }
  }
  d.add(...list);
}

// The vilakkumadam: three tiers of brass lamps on timber battens round the shrine's wall, the flames
// lit at night.
function lamps(f) {
  const W = 34, D = 46, battens = new THREE.Group(), cups = [], flames = [];
  for (const y of [2.4, 3.9, 5.4]) for (const a of FACES) {
    const len = Math.abs(Math.sin(a)) > 0.5 ? D : W, dist = (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2;
    const b = box(len - 0.6, 0.1, 0.22, TEAK, 0, y, 0.11);
    battens.add(onFace(at(new THREE.Group().add(b), 0, 0, 0), a, dist + 0.01, 0));
    const n = Math.floor((len - 1) / (detail.low ? 1.2 : 0.6)), s = Math.sin(a), c = Math.cos(a);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + 0.5 + (k + 0.5) * ((len - 1) / n), out = dist + 0.14, x = s * out + c * lat, z = -10 + c * out - s * lat;
      cups.push([x, y + 0.1, z, 0.12, 0.05, 0.12]);
      flames.push(V(x, y + 0.2, z));
    }
  }
  battens.position.set(0, 1.2, -10);
  f.add(mergeByMaterial(battens), at(inst(unitCyl(6), cups, BRASS), 0, 1.2, 0));
  f.add(at(bulbPoints(flames), 0, 1.2, 0));
}

// A tiled coping along the top of the outer walls: a low gabled roof the length of each run.
function coping(d) {
  const tri = new THREE.Shape();
  tri.moveTo(-1.65, 0); tri.lineTo(1.65, 0); tri.lineTo(0, 0.8); tri.closePath();
  const piece = (len) => new THREE.ExtrudeGeometry(tri, { depth: len, bevelEnabled: false }).translate(0, 0, -len / 2);
  // [x, z, length, along x?] for each run, the east wall either side of the gopuram's gap.
  for (const [x, z, len, alongX] of [[0, -64, 100, true], [-31.75, 64, 36.5, true], [31.75, 64, 36.5, true], [-50, 0, 130, false], [50, 0, 130, false]]) {
    const o = mesh(piece(len), TILE, x, 7, z);
    if (alongX) o.rotation.y = Math.PI / 2;
    d.add(o);
  }
}

// The Sree Padmanabhaswamy temple at Thiruvananthapuram: the temple elephant, and coconut palms
// round the Padma Theertham tank and the walls.
export function addDetails(f, g) {
  // Gables on the copper roof, front and back, and on the gilt roof over the upper storey.
  for (const s of [1, -1]) {
    gableOn(f, 38, 50, 8, 8.2, -10, s, 11, 4.4, 4, COPPER);
    gableOn(f, 19, 29, 6, 16, -12, s, 6.5, 2.6, 2, M.gild);
  }
  const d = new THREE.Group();
  struts(d);
  coping(d);
  f.add(mergeByMaterial(d));
  lamps(f);
  const tusker = rideElephant(mat('#4f4844', 0.9), 0.95, { cloth: '#e3b54a', trim: '#e3b54a', howdah: false });
  tusker.position.set(-14, 0.3, 40);
  tusker.rotation.y = 0.3;
  f.add(tusker);
  g.add(trees([...along(8, [-34, 66], [-34, 120]), ...along(8, [34, 66], [34, 120]), ...along(10, [-60, -70], [-60, 60]), ...along(10, [60, -70], [60, 60])], { kind: 'palm', seed: 6 }));
  // The East Fort quarter of Thiruvananthapuram round the temple and its tank: tiled-roof houses
  // along the streets, the road east from the tank kept open.
  g.add(cityAround([-64, 64, -70, 120], { rows: 3, gap: 8, seed: 97, roof: 'pitched', roofs: ['#9a4a32', '#a85a3a', '#8a4030'],
    paint: ['#f1ece0', '#e8dcc0', '#f3e3c8', '#dfe8e2', '#efd9c9'], keep: [[-16, 16, 120, 400]] }));
}
