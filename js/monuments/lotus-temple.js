import * as THREE from 'three';
import { M, mesh, box, cyl, group, petal } from '../helpers.js';
import { addDetails } from '../details/lotus-temple.js';

// A leaf, pointed at both ends, L long (along x) and W wide, as a shape.
function leaf(L, W, n = 24) {
  const sh = new THREE.Shape();
  for (let i = 0; i <= n; i++) { const u = -1 + (2 * i) / n, y = (W / 2) * Math.pow(1 - u * u, 0.75); i ? sh.lineTo(u * L / 2, y) : sh.moveTo(u * L / 2, y); }
  for (let i = n - 1; i > 0; i--) { const u = -1 + (2 * i) / n; sh.lineTo(u * L / 2, -(W / 2) * Math.pow(1 - u * u, 0.75)); }
  sh.closePath();
  return sh;
}
// One of the nine pools that ring the podium like leaves floating round the flower: a marble rim
// round a leaf of water, curving with the podium, between two of the paths.
function leafPool() {
  const g = new THREE.Group(), R = 47;
  const rim = leaf(28, 11);
  rim.holes.push(leaf(25.6, 8.6));
  const bend = (geo) => {
    // Wrap the straight leaf round the podium: x becomes an arc at radius R + y.
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), z = p.getZ(k), r = R + z, a = x / R; p.setXYZ(k, Math.sin(a) * r, p.getY(k), Math.cos(a) * r); }
    geo.computeVertexNormals();
    return geo;
  };
  const ex = (sh, h) => new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 4 }).rotateX(-Math.PI / 2);
  g.add(mesh(bend(ex(rim, 0.7)), M.marble, 0, 0.21, 0), mesh(bend(ex(leaf(25.7, 8.7), 0.65)), M.water, 0, 0.22, 0));
  return g;
}

export function buildLotusTemple() {
  const g = new THREE.Group(), f = new THREE.Group(), deg = Math.PI / 180;
  g.add(f);
  g.add(cyl(85, 85, 0.2, M.grass, 0, 0, 0, 64));
  f.add(cyl(40, 42, 2, M.plaster, 0, 0.2, 0, 9), cyl(34, 36, 2, M.marble, 0, 2.2, 0, 9));
  const B = 4.2;
  for (let k = 0; k < 9; k++) {
    const t = k * 40 * deg, t2 = t + 20 * deg;
    f.add(petal([11, B], [14.5, B + 20], [1.2, B + 30], 5.6, 0.35).rotateY(t));
    f.add(petal([16, B], [22, B + 15], [13, B + 23.5], 7.6, 0.35).rotateY(t2));
    f.add(petal([22, B], [31, B + 12.5], [36, B + 3.5], 8, -0.3).rotateY(t));
    f.add(leafPool().rotateY(t2));
  }
  for (let k = 0; k < 9; k++) g.add(group(box(5, 0.3, 40, M.path, 0, 0.2, 60)).rotateY(k * 40 * deg));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.9, 0.3, 1.25] };
}
