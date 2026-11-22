import * as THREE from 'three';
import { M, mat, mesh, box, at, surface, rng, ellipsoid } from '../helpers.js';
import { jali, mergeByMaterial } from '../parts/components.js';
import { elephantGeo } from '../parts/sculpture.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { addDetails } from '../details/barabar-caves.js';
import { detail } from '../detail.js';

// The grey-pink granite of the Barabar hills: rough and weathered on the hill, and dressed and
// polished like glass where the Mauryan masons cut it.
export const GRANITE = surface(mat('#8d8073', 0.9), 'rock');
export const POLISHED = surface(mat('#8a7f74', 0.3), 'none');
const DARK = mat('#1c1916', 0.95);

// The cut face: the caves open in a sheer wall of granite FW wide and FH high at z = 0, cut into
// the south side of the dome of rock.
export const FW = 40, FH = 8;
// The caves along the face: [x, door width at the foot, door height, name]. Lomas Rishi has the
// carved front; Sudama a plain doorway with sloping jambs.
export const CAVES = [[-8, 1.25, 2.3, 'Lomas Rishi'], [8, 1.15, 2.1, 'Sudama']];

// The outline of the Lomas Rishi arch: a horseshoe, its sides rising straight to the spring at
// y0, an ogee point at its crown. Points from the left foot round to the right foot, at a distance
// `off` inside the outline.
function archLine(w, y0, h, off, n = 28) {
  const pts = [], r = w / 2 - off;
  pts.push([-r, 0]);
  for (let k = 0; k <= n; k++) {
    const a = Math.PI - (k / n) * Math.PI, x = Math.cos(a) * r, y = y0 + Math.sin(a) * (h - y0 - off * 0.8);
    // The crown drawn up into an ogee point.
    pts.push([x, y + Math.pow(Math.max(0, 1 - Math.abs(x) / (r * 0.35)), 2) * 0.45]);
  }
  pts.push([r, 0]);
  return pts;
}
// A band between two arch lines, extruded `depth` out of the face.
function archBand(w, y0, h, o0, o1, depth, m) {
  const a = archLine(w, y0, h, o0), b = archLine(w, y0, h, o1).reverse();
  const sh = new THREE.Shape([...a, ...b].map(([x, y]) => new THREE.Vector2(x, y)));
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// The front of the Lomas Rishi cave, after photographs: the doorway with its sloping jambs inside
// a carved imitation of a thatched hut's gable end; the gable's two arched bands, the upper one a
// lattice, the lower one a row of elephants walking towards stupas at the middle; and the crown
// drawn up into a point, as on the timber roofs it copies.
export function lomasRishi(m) {
  const g = new THREE.Group(), w = 4.4, y0 = 2.5, h = 5.2;
  g.add(archBand(w, y0, h, 0, 0.18, 0.32, m), archBand(w, y0, h, 0.18, 0.62, 0.22, jali(m)), archBand(w, y0, h, 0.62, 0.74, 0.3, m));
  g.add(archBand(w, y0, h, 0.74, 1.24, 0.16, m), archBand(w, y0, h, 1.24, 1.36, 0.26, m));
  // The elephants, walking in the lower band towards the stupa at its crown.
  const geo = elephantGeo(), r = w / 2 - 0.99, list = [], o = new THREE.Object3D();
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) {
    const t = (k + 0.5) / 5.6, a = s < 0 ? Math.PI - t * Math.PI / 2 : t * Math.PI / 2;
    const x = Math.cos(a) * r, y = y0 + Math.sin(a) * (h - y0 - 0.99 * 0.8);
    o.position.set(x, y - 0.17, 0.14);
    o.rotation.set(0, s < 0 ? Math.PI / 2 : -Math.PI / 2, 0);
    o.rotateX(s < 0 ? a - Math.PI : a);
    o.scale.set(0.11, 0.11, 0.1);
    o.updateMatrix();
    list.push(o.matrix.clone());
  }
  const im = new THREE.InstancedMesh(geo, m, list.length);
  list.forEach((mx, i) => im.setMatrixAt(i, mx));
  g.add(im);
  // A small stupa at the crown of the band, and the doorway: a trapezoid, its jambs leaning in.
  g.add(box(0.28, 0.32, 0.18, m, 0, h - 1.2, 0.05));
  const door = new THREE.Shape([[-0.66, 0], [0.66, 0], [0.5, 2.4], [-0.5, 2.4]].map(([x, y]) => new THREE.Vector2(x, y)));
  g.add(mesh(new THREE.ExtrudeGeometry(door, { depth: 0.04, bevelEnabled: false }), DARK, 0, 0, 0.02));
  return g;
}

// A plain Mauryan doorway: a trapezoid with sloping jambs, a slight lintel, opening into darkness.
export function plainDoor(wb, h, m) {
  const g = new THREE.Group(), wt = wb * 0.78;
  const door = new THREE.Shape([[-wb / 2, 0], [wb / 2, 0], [wt / 2, h], [-wt / 2, h]].map(([x, y]) => new THREE.Vector2(x, y)));
  g.add(mesh(new THREE.ExtrudeGeometry(door, { depth: 0.04, bevelEnabled: false }), DARK, 0, 0, 0.02));
  const fr = new THREE.Shape([[-wb / 2 - 0.25, 0], [wb / 2 + 0.25, 0], [wt / 2 + 0.25, h + 0.25], [-wt / 2 - 0.25, h + 0.25]].map(([x, y]) => new THREE.Vector2(x, y)));
  g.add(mesh(new THREE.ExtrudeGeometry(fr, { depth: 0.015, bevelEnabled: false }), m));
  return g;
}

// The rock: a great dome of granite, smooth and bare, 30 m high, out of whose south side the face
// was cut; another dome east of it; and the long ridge of the Barabar hills behind.
export const DOMES = [[0, 30, -36, 62, 30, 34], [92, 22, -30, 40, 22, 30]];
export function rockY(x, z) {
  let y = 0;
  for (const [cx, , cz, rx, ry, rz] of DOMES) { const q = 1 - ((x - cx) / rx) ** 2 - ((z - cz) / rz) ** 2; if (q > 0) y = Math.max(y, ry * Math.sqrt(q)); }
  return y;
}
export function hillY(x, z) {
  const ridge = Math.exp(-Math.pow((z + 190) / 80, 2)) * smooth(600, 250, Math.abs(x + 40));
  return (60 * ridge + 12 * ridged(x, z, { scale: 0.008, octaves: 3 }) * ridge) * smooth(-60, -110, z) - 0.3 + 0.5 * fbm(x, z, { scale: 0.02, octaves: 2 });
}

export function buildBarabarCaves() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(5);
  g.add(f);
  // The cut face, the domes of rock it is cut into, and the hills behind.
  f.add(box(FW, FH, 12, POLISHED, 0, 0, -6));
  const seg = detail.low ? 40 : 72;
  for (const [cx, , cz, rx, ry, rz] of DOMES) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2), GRANITE);
    d.scale.set(rx, ry, rz);
    d.position.set(cx, -0.2, cz);
    f.add(d);
  }
  g.add(heightField(2000, 1400, detail.low ? 100 : 150, hillY, { cz: -300, rock: ['#8d8073', '#9a8c7d', '#7f7468'], band: 10, cover: '#7d7f4c', steep: 0.82 }));
  // Boulders tumbled at the ends of the face and along the foot of the hill.
  const bould = new THREE.Group();
  for (let k = 0; k < 26; k++) {
    const side = k % 2 ? 1 : -1, x = k < 4 ? side * (FW / 2 + 1 + R() * 3) : side * (FW / 2 + 8 + R() * 60), z = k < 4 ? -2 - R() * 3 : -2 - R() * 20, s = k < 4 ? 5 + R() * 2 : 1.5 + R() * 4;
    bould.add(ellipsoid(s * (1 + R() * 0.5), s * (0.6 + R() * 0.3), s * (0.8 + R() * 0.4), GRANITE, x, s * 0.35, z));
  }
  g.add(mergeByMaterial(bould));
  // The caves' fronts on the face.
  for (const [x, wb, h, name] of CAVES) f.add(at(name === 'Lomas Rishi' ? lomasRishi(POLISHED) : plainDoor(wb, h, POLISHED), x, 0.6, 0.01));
  // The ledge before the caves, levelled out of the rock, and the steps up to it.
  f.add(box(FW, 0.6, 7, POLISHED, 0, 0, 3.5));
  for (let k = 0; k < 4; k++) f.add(box(8, 0.6 * (4 - k) / 5 + 0.0, 0.5, GRANITE, -4, 0, 7.25 + k * 0.5));
  addDetails(f, g, { R });
  // From the south-west, along the face, Lomas Rishi nearest.
  return { group: g, focus: f, view: [-0.6, 0.22, 1], zoom: 0.75 };
}
