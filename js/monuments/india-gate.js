import * as THREE from 'three';
import { M, mat, surface, box, cyl, lathe, group, at, archWall, barrelVault, hemi, finial } from '../helpers.js';

const NAMES = surface(mat('#d4bd98', 0.8), 'script');
const BAND = surface(mat('#c9ad85', 0.9), 'frieze');

export function buildIndiaGate() {
  const m = M.buff, r = M.red, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Four thin faces around an open core, so both passages run clear from the path. Corner steps
  // carry the piers; the 9.2 m archway between them is open to the ground.
  const b = 0.45, t = 1.8, top = b + 32;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(box(8.2, b, 4.5, r, sx * 8.3, 0, sz * 4.45));
  for (const sz of [-1, 1]) f.add(at(archWall(24, 32, t, 9.2, 22, false, m), 0, b, sz * (6 - t / 2)));
  // The side faces fit between the front and back ones, so no two faces share a plane at the corners.
  for (const sx of [-1, 1]) f.add(at(archWall(12 - 2 * t, 32, t, 4.6, 12, false, m), sx * (12 - t / 2), b, 0).rotateY(Math.PI / 2));
  // Inside the main arch: the passage walls, with the cross passage cut through, and the vault
  // 20 cm inside the arch's soffit so the two never share a surface.
  for (const sx of [-1, 1]) f.add(at(archWall(8.4, 17.8, 0.6, 4.6, 12, false, m), sx * 4.7, b, 0).rotateY(Math.PI / 2));
  f.add(at(barrelVault(4.4, 8.4, m), 0, b + 17.4, 0));
  // The cross passage through each pier, walled and vaulted so the pier reads as solid stone.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) f.add(box(5.2, 10.1, 0.6, m, sx * 7.6, b, sz * 2.5));
    f.add(at(barrelVault(2.2, 5.2, m), sx * 7.6, b + 9.7, 0).rotateY(Math.PI / 2));
  }
  for (const s of [-1, 1]) for (const z of [-6.15, 6.15]) f.add(box(1.4, 30, 0.4, m, s * 8.4, b, z));
  // The red course at the springing runs round the piers and stops at the jambs.
  const pier = 12 - 4.6;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) f.add(box(pier, 0.7, 0.2, r, sx * (4.6 + pier / 2), b + 16.7, sz * 6.1));
    f.add(box(0.2, 0.7, 12.4, r, sx * 12.1, b + 16.7, 0));
  }
  // Names of the fallen: on the pier faces either side of each arch, and in the passage.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (const x of [6.25, 10.55]) f.add(box(2.4, 9, 0.12, NAMES, sx * x, b + 3, sz * 6.09));
    f.add(box(0.12, 12, 1.6, NAMES, sx * 4.31, b + 1, sz * 3.25));
  }
  // A carved band along each pier under the names, 3 cm proud of the face.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(box(pier - 0.4, 0.55, 0.06, BAND, sx * (4.6 + pier / 2), b + 2.1, sz * 6.06));
  f.add(box(25.2, 1, 13.2, m, 0, top));
  f.add(box(23, 5.5, 11, m, 0, top + 1));
  f.add(box(23.8, 0.8, 11.8, m, 0, top + 6.5));
  f.add(box(20, 1.6, 9.2, m, 0, top + 7.3));
  f.add(box(16, 1.3, 7.6, m, 0, top + 8.9));
  f.add(cyl(3.4, 3.8, 1, m, 0, top + 10.2, 0, 40));
  f.add(at(lathe([[0, 0], [2.6, 0], [3.8, 0.6], [4.4, 1.3], [4.5, 1.5], [3.9, 1.5], [0, 0.9]], m, 40), 0, top + 11.2, 0));
  const c = new THREE.Group();
  c.add(box(12, 1, 12, r));
  for (const x of [-4.2, 4.2]) for (const z of [-4.2, 4.2]) c.add(box(1.6, 10, 1.6, m, x, 1, z));
  c.add(box(11, 1.6, 11, m, 0, 11));
  c.add(at(hemi(4, m), 0, 12.6, 0));
  c.add(at(finial(3.5), 0, 16.4, 0));
  g.add(at(c, 0, 0, 70));
  g.add(box(18, 0.2, 260, M.path, 0, 0, 60));
  for (const x of [-34, 34]) g.add(box(48, 0.15, 260, M.grass, x, 0, 60));
  return { group: g, focus: f };
}
