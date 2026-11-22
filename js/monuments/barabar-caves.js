import * as THREE from 'three';
import { M, mat, box, at, surface, rng, ellipsoid } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { chaityaDoorway, mauryanDoor } from '../parts/doorways.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { addDetails } from '../details/barabar-caves.js';
import { detail } from '../detail.js';

// The grey-pink granite of the Barabar hills: rough and weathered on the hill, and dressed and
// polished like glass where the Mauryan masons cut it.
export const GRANITE = surface(mat('#8d8073', 0.9), 'rock');
export const POLISHED = surface(mat('#8a7f74', 0.3), 'none');

// The cut face: the caves open in a sheer wall of granite FW wide and FH high at z = 0, cut into
// the south side of the dome of rock.
export const FW = 40, FH = 6.5;
// The caves along the face: [x, door width at the foot, door height, name]. Lomas Rishi has the
// carved front; Sudama a plain doorway with sloping jambs.
export const CAVES = [[-8, 1.25, 2.3, 'Lomas Rishi'], [8, 1.15, 2.1, 'Sudama']];

// The rock: a great dome of granite, smooth and bare, 30 m high, out of whose south side the face
// was cut; another dome east of it; and the long ridge of the Barabar hills behind.
export const DOMES = [[0, 30, -36, 62, 30, 34], [92, 22, -30, 40, 22, 30]];
export function rockY(x, z) {
  let y = 0;
  for (const [cx, , cz, rx, ry, rz] of DOMES) { const q = 1 - ((x - cx) / rx) ** 2 - ((z - cz) / rz) ** 2; if (q > 0) y = Math.max(y, ry * Math.sqrt(q)); }
  return y;
}
export function hillY(x, z) {
  const ridge = Math.exp(-Math.pow((z + 230) / 110, 2)) * smooth(700, 250, Math.abs(x + 40));
  return (38 * ridge + 10 * ridged(x, z, { scale: 0.008, octaves: 3 }) * ridge) * smooth(-60, -110, z) - 0.3 + 0.5 * fbm(x, z, { scale: 0.02, octaves: 2 });
}

export function buildBarabarCaves() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(5);
  g.add(f);
  // The cut face, the domes of rock it is cut into, and the hills behind.
  f.add(box(FW, FH, 12, POLISHED, 0, 0, -6));
  const seg = detail.low ? 40 : 72;
  for (const [cx, , cz, rx, ry, rz] of DOMES) {
    // A dome of exfoliating granite: its surface swelling and sinking a little in broad sheets.
    const geo = new THREE.SphereGeometry(1, seg, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k), y = p.getY(k), z = p.getZ(k), n = 1 + 0.035 * Math.sin(x * 7 + z * 3) * Math.cos(z * 5 - y * 4) + 0.02 * Math.sin(y * 13 + x * 9);
      p.setXYZ(k, x * n, y * (y > 0.02 ? n : 1), z * n);
    }
    geo.computeVertexNormals();
    const d = new THREE.Mesh(geo, GRANITE);
    d.scale.set(rx, ry, rz);
    d.position.set(cx, -0.2, cz);
    d.castShadow = d.receiveShadow = true;
    g.add(d);
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
  for (const [x, wb, h, name] of CAVES) f.add(at(name === 'Lomas Rishi' ? chaityaDoorway(POLISHED) : mauryanDoor(wb, h, POLISHED), x, 0.6, 0.01));
  // The ledge before the caves, levelled out of the rock, and the steps up to it.
  f.add(box(FW, 0.6, 7, POLISHED, 0, 0, 3.5));
  for (let k = 0; k < 4; k++) f.add(box(8, 0.6 * (4 - k) / 5 + 0.0, 0.5, GRANITE, -4, 0, 7.25 + k * 0.5));
  addDetails(f, g, { R });
  // From the south-west, along the face, Lomas Rishi nearest.
  return { group: g, focus: f, view: [-0.55, 0.2, 1], zoom: 1.7 };
}
