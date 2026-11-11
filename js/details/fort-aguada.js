import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, hemi, photo } from '../helpers.js';
import { railingRing, windowFrame, mergeByMaterial } from './components.js';
import { trees, boats, asiBoard, scatter } from './realism.js';

// Fort Aguada, finer detail. The Portuguese laterite walls carry a rounded cordon a little below
// the parapet, with embrasures for the guns along it; the lighthouse of 1864 has a gallery railing
// round its lantern, a door and small windows up its shaft, and a moulded band at each floor. A
// domed sentry box (guarita) hangs over the point of each bastion, the walls stand on a spreading
// foot, and the block over the great cistern is arcaded. Dimensions follow js/monuments/fort-aguada.js.
const LAT = photo(mat('#9b5b3f', 0.95), 'laterite'), TILE = mat('#a9523a', 0.8), LAT_DARK = photo(mat('#7d4530', 0.95), 'laterite'), WHITE_ = mat('#eeeae2', 0.8);
function architecture(f) {
  const d = new THREE.Group(), H = 24;
  const pts = [[-50, -34], [40, -40], [60, -4], [44, 34], [-30, 40], [-60, 6]];
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    const parts = i === 3 ? [[0, 0.5 - 6 / len], [0.5 + 6 / len, 1]] : [[0.07, 0.93]];
    for (const [t0, t1] of parts) {
      const tm = (t0 + t1) / 2, l = len * (t1 - t0) - 0.1;
      const c = box(l, 0.45, 5.5, LAT_DARK, x0 + (x1 - x0) * tm, H + 5, z0 + (z1 - z0) * tm);
      c.rotation.y = ry;
      d.add(c);
      // Embrasures: dark notches cut across the top of the parapet.
      const n = Math.floor(l / 9);
      for (let k = 0; k < n; k++) {
        const t = t0 + ((k + 0.5) / n) * (t1 - t0), e = box(1.2, 1.2, 5.06, M.recess, x0 + (x1 - x0) * t, H + 5.85, z0 + (z1 - z0) * t);
        e.rotation.y = ry;
        d.add(e);
      }
    }
  });
  // The lighthouse at (18, H, 10): a gallery railing, a door and windows on four sides.
  d.add(at(railingRing(4.5, 1.1, LAT_DARK, LAT_DARK), 18, H + 14.6, 10));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.6, t = at(new THREE.Group(), 18, H, 10);
    for (const y of [4.5, 9]) t.add(onFace(at(windowFrame(0.7, 1.4, WHITE_, { shape: 'round', frame: 0.12 }), 0, y, 0), a, 4 - (y + 0.7) / 14 * 0.8 + 0.02));
    d.add(t);
  }
  const door = at(new THREE.Group(), 18, H, 10);
  door.add(onFace(at(windowFrame(1.2, 2.4, LAT_DARK, { shape: 'round', frame: 0.18 }), 0, 0.15, 0), Math.PI * 0.75, 3.95));
  d.add(door);
  // Sentry boxes over the points of the bastions: a round turret on a corbel, with a slit and a dome.
  pts.forEach(([x, z]) => {
    const l = Math.hypot(x, z), sx = x * (1 + 6.4 / l), sz = z * (1 + 6.4 / l), ang = Math.atan2(x, z);
    d.add(cyl(1.25, 0.3, 1.6, LAT_DARK, sx, H + 5.4, sz, 12), cyl(1.25, 1.25, 2.6, LAT, sx, H + 7, sz, 12), cyl(1.45, 1.45, 0.25, LAT_DARK, sx, H + 9.6, sz, 12));
    d.add(at(hemi(1.3, LAT, 12), sx, H + 9.85, sz), cyl(0.08, 0.14, 0.6, LAT_DARK, sx, H + 11.1, sz, 6));
    d.add(at(onFace(box(0.3, 0.9, 0.06, M.recess, 0, H + 7.9, 0), ang, 1.26), sx, 0, sz));
  });
  // The walls' spreading foot, and the block over the cistern: an arcade of round arches down
  // each long side under a tiled eave.
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, l = Math.hypot(mx, mz);
    if (i === 3) return;
    const c = box(len - 8, 1.4, 1, LAT_DARK, mx * (1 + 2.6 / l), H - 0.4, mz * (1 + 2.6 / l));
    c.rotation.y = ry;
    d.add(c);
  });
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) d.add(at(windowFrame(2.4, 2.3, LAT_DARK, { shape: 'round', frame: 0.25 }), -4 - 10.5 + k * 4.2, H + 0.65, s * 9.02).rotateY(s > 0 ? 0 : Math.PI));
  d.add(box(27.4, 0.3, 19.4, TILE, -4, H + 3, 0));
  for (const y of [3.5, 7, 10.5]) d.add(cyl(4 - (y / 14) * 0.8 + 0.12, 4 - (y / 14) * 0.8 + 0.12, 0.3, LAT_DARK, 18, H + y, 10, 20));
  mergeByMaterial(d);
  f.add(d);
}

// Fort Aguada: iron cannon on the ramparts looking out to sea, coconut palms and cashew scrub on
// the headland, and fishing boats in the Mandovi's mouth.
const IRON = mat('#2a2826', 0.55, 0.5), WOOD = photo(mat('#4a3424', 0.85), 'timber');
function cannon() {
  const g = new THREE.Group(), barrel = mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.6, 12).rotateX(Math.PI / 2), IRON, 0, 0.75, 0.3);
  g.add(barrel, cyl(0.36, 0.36, 0.2, IRON, 0, 0.55, -1.0, 12));
  for (const x of [-0.35, 0.35]) g.add(at(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 10).rotateZ(Math.PI / 2), WOOD), x, 0.32, 0.4), at(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 10).rotateZ(Math.PI / 2), WOOD), x, 0.32, -0.6));
  return g;
}
export function addDetails(f, g) {
  architecture(f);
  const H = 24;
  for (const [x, z, ry] of [[-44, -30, Math.PI + 0.3], [30, -36, Math.PI], [54, -6, Math.PI / 2], [-54, 4, -Math.PI / 2]]) f.add(at(cannon(), x, H + 7, z).rotateY(ry));
  const head = scatter(60, [-140, 140, -95, 95], { seed: 3, gap: 9 }).filter(([x, z]) => { const r = Math.hypot(x / 125, z / 85); return r < 0.9 && !(x > -66 && x < 66 && z > -46 && z < 46); });
  g.add(trees(head, { kind: 'palm', seed: 3, y: H }));
  g.add(boats([[30, 150, 0.4], [80, 160, -0.3], [-60, 190, 1.2], [140, 210, 0.8], [-200, -40, 2.4], [-120, -150, 1.9]], { y: 0.3, size: 1.8 }));
  g.add(asiBoard('Fort Aguada', 52, 34, 0.2, { y: H }));
}
