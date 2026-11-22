import * as THREE from 'three';
import { mat, mesh, box, cyl, at, inst, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/mumbai-airport-t2.js';

// Terminal 2 at Mumbai (SOM, 2014). The departures front faces +z. The four-storey headhouse, 400 m
// wide, stands under one flat white roof 46 m up, carried on thirty columns (six across, five deep,
// 64 m by 34 m apart) that spread at the top into the coffered ceiling; the front row stands outside
// the glass, over the elevated departures road, under the roof's deep overhang. From the headhouse
// four concourse piers reach out as an X, the two long ones behind. The air traffic control tower
// stands off to one side. The coffers, the cable-net wall, the road and the apron are in
// js/details/mumbai-airport-t2.js.
export const ROOF_Y = 42.5, DECK_Y = 11, COLS_X = [-160, -96, -32, 32, 96, 160], COLS_Z = [84, 50, 16, -18, -52];
const WHITE = surface(mat('#f1f1ee', 0.55), 'none'), RIB = surface(mat('#d9dad6', 0.6), 'none');
const GLASS = surface(mat('#587a8f', 0.12, 0.65), 'none'), GLASS_DARK = surface(mat('#2c3d49', 0.15, 0.6), 'none');
const PANEL = surface(mat('#dcdcd8', 0.6, 0.1), 'none');

// The roof's plan: straight sides and back, the front bowed out over the forecourt.
export function roofPlan(inset = 0) {
  const pts = [], X = 214 - inset, back = -108 + inset;
  for (let k = 0; k <= 24; k++) { const x = -X + (2 * X * k) / 24; pts.push([x, 104 - inset + 16 * (1 - (x / X) ** 2)]); }
  pts.push([X, back], [-X, back]);
  return pts;
}

// One of the thirty columns: a slender shaft that opens like a mushroom into the ceiling, its
// head ribbed in rings and spokes, the coffers running down off the roof. Two geometries (the
// shell, the ribs) from the foot at y = 0 to the ceiling at `h`.
function columnGeos(h) {
  const prof = [[1.7, 0], [1.6, h * 0.42], [1.9, h * 0.58], [2.9, h * 0.7], [4.9, h * 0.8], [8.2, h * 0.89], [12.4, h * 0.955], [17, h]];
  const curve = new THREE.SplineCurve(prof.map(([r, y]) => new THREE.Vector2(r, y)));
  const pts = curve.getPoints(detail.low ? 12 : 22), seg = detail.low ? 16 : 32;
  const shell = new THREE.LatheGeometry(pts, seg);
  // Spokes follow the profile, 2 cm proud; rings at five heights up the flare.
  const g = new THREE.Group(), n = detail.low ? 12 : 24, start = Math.floor(pts.length * 0.45);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, s = new THREE.Group();
    for (let i = start; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1], len = p.distanceTo(q);
      const b = mesh(new THREE.BoxGeometry(len, 0.28, 0.22), RIB, (p.x + q.x) / 2 + 0.03, (p.y + q.y) / 2 - 0.05, 0);
      b.rotation.z = Math.atan2(q.y - p.y, q.x - p.x);
      s.add(b);
    }
    s.rotation.y = a;
    g.add(s);
  }
  for (const t of [0.72, 0.8, 0.87, 0.93, 0.975]) {
    const p = curve.getPoint(t);
    g.add(mesh(new THREE.TorusGeometry(p.x + 0.04, 0.14, 4, seg).rotateX(Math.PI / 2), RIB, 0, p.y - 0.06, 0));
  }
  mergeByMaterial(g);
  return { shell, ribs: g.children[0].geometry };
}

// A concourse pier `len` long along +x from the origin: a solid lower floor, a glazed upper floor
// and a shallow arched white roof with a rounded end.
export function concourse(len, w = 34) {
  const g = new THREE.Group();
  g.add(box(len, 7, w, PANEL, len / 2, 0, 0), box(len, 9.5, w - 1.2, GLASS, len / 2, 7, 0), cyl(w / 2, w / 2, 7, PANEL, len, 0, 0, 24), cyl(w / 2 - 0.6, w / 2 - 0.6, 9.5, GLASS, len, 7, 0, 24));
  g.add(box(len, 1.3, w + 0.5, GLASS_DARK, len / 2, 2.6, 0));
  const roof = new THREE.CylinderGeometry(w / 2 + 3, w / 2 + 3, len, 24, 1, true).rotateZ(Math.PI / 2).scale(1, 0.2, 1);
  g.add(mesh(roof, WHITE, len / 2, 16.5, 0), box(len, 0.5, w + 6, WHITE, len / 2, 16, 0));
  g.add(at(mesh(new THREE.SphereGeometry(w / 2 + 3, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.2, 1), WHITE), len, 16.5, 0), cyl(w / 2 + 3, w / 2 + 3, 0.5, WHITE, len, 16, 0, 24));
  return g;
}
// Where the four piers leave the headhouse: [x, z, bearing (0 is +x, turning towards -z), length].
export const PIERS = [[150, -86, 0.72, 340], [-150, -86, Math.PI - 0.72, 340], [196, -30, -0.25, 190], [-196, -30, Math.PI + 0.25, 190]];

// The air traffic control tower (2013, 84 m): a white three-sided shaft that swells towards the
// glazed cab.
function controlTower() {
  const g = new THREE.Group();
  const shaft = new THREE.LatheGeometry([[7.5, 0], [5.2, 14], [4.2, 34], [4.4, 52], [6.2, 62], [9.6, 68]].map(([r, y]) => new THREE.Vector2(r, y)), 3);
  g.add(mesh(shaft, WHITE), cyl(10.5, 9.6, 2.2, WHITE, 0, 68, 0, 24), cyl(11.2, 9.8, 5, GLASS_DARK, 0, 70.2, 0, 24), cyl(11.8, 11.8, 1.1, WHITE, 0, 75.2, 0, 24), cyl(5, 6, 3, PANEL, 0, 76.3, 0, 16), cyl(0.25, 0.25, 5, PANEL, 0, 79.3, 0, 8));
  g.add(box(46, 9, 30, PANEL, 0, 0, -4), box(46.6, 1.6, 30.6, GLASS_DARK, 0, 4.6, -4));
  return mergeByMaterial(g);
}

export function buildMumbaiT2() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The headhouse: the arrivals floor as a podium, and above the departures level the hall behind
  // its glass, back from the roof's edge on every side.
  f.add(box(404, DECK_Y, 164, PANEL, 0, 0, -16), box(404.6, 3.6, 164.6, GLASS_DARK, 0, 3.4, -16), box(400, ROOF_Y - DECK_Y - 0.4, 160, GLASS, 0, DECK_Y, -16));
  // The roof: a thin-edged white slab, and a low plant deck set back on top of it.
  const sh = new THREE.Shape(roofPlan(7).map(([x, z]) => new THREE.Vector2(x, -z)));
  const slab = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelThickness: 1.45, bevelSize: 7, bevelSegments: 3, curveSegments: 1 }).rotateX(-Math.PI / 2);
  f.add(mesh(slab, WHITE, 0, ROOF_Y + 1.45, 0));
  // The thirty columns, on the departures level.
  const { shell, ribs } = columnGeos(ROOF_Y - DECK_Y), list = [];
  for (const x of COLS_X) for (const z of COLS_Z) list.push([x, DECK_Y, z, 1, 1, 1]);
  f.add(inst(shell, list, WHITE), inst(ribs, list, RIB));
  // The four piers of the X, and the links from the hall into them.
  for (const [x, z, a, len] of PIERS) {
    const p = concourse(len);
    p.position.set(x, 0, z);
    p.rotation.y = a;
    f.add(p);
  }
  f.add(at(controlTower(), -520, 0, 300));
  addDetails(f, g);
  // The home view: the departures front from the forecourt, the columns opening into the roof.
  return { group: g, focus: f, view: [0.5, 0.03, 1], zoom: 0.145, target: [0, 25, 70], batch: true };
}
