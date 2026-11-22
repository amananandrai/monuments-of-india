import * as THREE from 'three';
import { mat, mesh, box, at, onFace, hipRoof, kalash, photo, doubleSided } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { addDetails } from '../details/mattancherry-palace.js';

// Mattancherry's walls of laterite under lime plaster, washed white; the teak of its windows,
// doors and eaves; the clay tiles of its roofs, and the copper of the shrine's finial.
export const LIME = photo(mat('#efebe1', 0.88), 'plaster');
export const LATERITE = photo(mat('#9b5b3f', 0.95), 'laterite');
export const TEAK = photo(mat('#5a3a24', 0.7), 'timber');
export const TILE = mat('#8e4630', 0.82);
export const COPPER = mat('#b0773f', 0.45, 0.45);

// The palace's measures, shared with js/details/mattancherry-palace.js. A nalukettu: four
// two-storey wings (WD deep, H high to the eaves) round a courtyard, W × D in all, under one roof
// that runs round the square with hips at its corners, its eaves OV out and its ridge RH up. The
// entrance front faces +z.
export const P = { W: 52, D: 42, WD: 11, H: 8.4, OV: 1.6, RH: 5.6 };

// A roof that runs round a courtyard: from the outer eaves (W × D, ov beyond the walls) up to a
// ridge over the middle of each wing (wd deep), and down again to the eaves over the courtyard,
// with hips at the corners. One shell, shown from both sides.
export function ringRoof(W, D, wd, ov, h, m) {
  const rect = (hw, hd, y) => [[-hw, y, -hd], [hw, y, -hd], [hw, y, hd], [-hw, y, hd]];
  const o = rect(W / 2 + ov, D / 2 + ov, 0), r = rect(W / 2 - wd / 2, D / 2 - wd / 2, h), i = rect(W / 2 - wd - ov, D / 2 - wd - ov, 0);
  const pos = [...o, ...r, ...i].flat(), idx = [];
  for (let k = 0; k < 4; k++) {
    const n = (k + 1) % 4;
    idx.push(k, n, 4 + n, k, 4 + n, 4 + k, 4 + k, 4 + n, 8 + n, 4 + k, 8 + n, 8 + k);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const flatGeo = geo.toNonIndexed();
  flatGeo.computeVertexNormals();
  return mesh(flatGeo, doubleSided(m));
}

export function buildMattancherry() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, D, WD, H, OV, RH } = P;
  // The plinth, and the four wings round the courtyard.
  f.add(box(W + 1.2, 0.6, D + 1.2, LATERITE));
  for (const s of [-1, 1]) {
    f.add(box(W, H, WD, LIME, 0, 0.6, s * (D / 2 - WD / 2)));
    f.add(box(WD, H, D - 2 * WD, LIME, s * (W / 2 - WD / 2), 0.6, 0));
  }
  // The band between the storeys, and the timber wall plate under the eaves.
  f.add(box(W + 0.3, 0.35, D + 0.3, LIME, 0, 0.6 + H / 2, 0));
  f.add(box(W + 0.5, 0.4, D + 0.5, TEAK, 0, 0.6 + H - 0.4, 0));
  f.add(at(ringRoof(W, D, WD, OV, RH, TILE), 0, 0.6 + H, 0));
  // The courtyard's floor, paved with laterite.
  f.add(box(W - 2 * WD - 0.04, 0.05, D - 2 * WD - 0.04, LATERITE, 0, 0.6, 0));
  // The shrine of Pazhayannur Bhagavathi in the courtyard: a square sanctum on a moulded laterite
  // base under a pyramid of tiles and a copper finial.
  const sh = new THREE.Group();
  sh.add(box(6.4, 0.9, 6.4, LATERITE, 0, 0.6, 0), box(5, 3.4, 5, LIME, 0, 1.5, 0), box(5.3, 0.3, 5.3, TEAK, 0, 4.6, 0));
  sh.add(at(hipRoof(8, 8, 3.8, TILE), 0, 4.9, 0), at(kalash(0.5, COPPER), 0, 8.5, 0));
  sh.add(onFace(at(classicalDoor(1.2, 2.2, { m: LIME, trim: TEAK, shape: 'flat', top: null, depth: 0.25, frame: 0.2 }), 0, 1.5, 0), 0, 2.5));
  f.add(sh);
  // Windows on both storeys of every outer face: timber frames with a lattice of teak, and doors
  // under the verandah in the middle of the front.
  const win = windowFrame(1.3, 1.5, TEAK, { shape: 'flat', screen: jali(TEAK), frame: 0.2 }), wins = new THREE.Group();
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const len = Math.abs(Math.sin(a)) > 0.5 ? D : W, dist = (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2, n = Math.floor(len / 4.4);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n);
      for (const y of [1.8, 0.6 + H / 2 + 1.2]) if (!(a === 0 && Math.abs(lat) < 6 && y < 3)) wins.add(onFace(at(win.clone(), 0, y, 0), a, dist + 0.01, lat));
    }
  }
  f.add(mergeByMaterial(wins));
  // The entrance: a porch of European round arches on the ground floor of the front, a storey
  // high, under a tiled lean-to.
  const pz = D / 2, porch = new THREE.Group();
  porch.add(box(12, 0.6, 4, LATERITE, 0, 0, pz + 2));
  for (const x of [-6, -2, 2, 6]) porch.add(box(0.9, 4, 0.9, LIME, x, 0.6, pz + 3.5));
  porch.add(box(12.9, 0.8, 1, LIME, 0, 4.6, pz + 3.5));
  for (const x of [-4, 0, 4]) porch.add(at(new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.25, 6, 16, Math.PI), LIME), x, 3.6, pz + 3.5));
  porch.add(at(classicalDoor(2.2, 3.2, { m: LIME, trim: TEAK, top: null, depth: 0.3, frame: 0.3 }), 0, 0.6, pz + 0.01));
  const lean = new THREE.Shape();
  lean.moveTo(0, 0); lean.lineTo(5.2, 0); lean.lineTo(0, 1.8); lean.closePath();
  const lg = new THREE.ExtrudeGeometry(lean, { depth: 14, bevelEnabled: false }).translate(0, 0, -7).rotateY(-Math.PI / 2);
  porch.add(mesh(lg, doubleSided(TILE), 0, 5.4, pz - 0.6));
  f.add(mergeByMaterial(porch));
  addDetails(f, g);
  // From the north-east, over the gatehouse, as the palace is seen from the street.
  return { group: g, focus: f, view: [0.8, 0.3, 1], zoom: 0.9 };
}
