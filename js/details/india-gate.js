import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, surface, hemi, ribbed, kalash, finial } from '../helpers.js';
import { D, archRing, keystone, sunburst, rosette, lettering, dentils, chhajja, petalRing, mergeByMaterial } from './components.js';
import { trees, lampPosts, along } from './realism.js';
import { statue } from './sculpture.js';

// India Gate, finer detail (Lutyens, 1921–31). From photographs and descriptions of the arch:
// - two large sunburst roundels, one each side of the main arch on both long faces, and a smaller
//   one above each side arch;
// - a moulded archivolt and keystone round each arch;
// - the dedication cut above the main arch, and a frieze of stylised Imperial suns under the cornice;
// - a dentil course under the cornice and a lip on its edge;
// - INDIA in large letters on the attic of both long faces, between MCMXIV and MCMXIX (1914, 1919);
// - a coffered soffit in the main vault, ribbed both ways with a rosette in each coffer;
// - a base moulding round the piers, and a rim on the bowl at the top;
// - on the canopy: stepped base, column caps and bases, a sloping eave, corner pinnacles, a drum and
//   a ribbed dome.
// Dimensions follow js/monuments/india-gate.js: plinth b, cornice at `top`, long faces at z = ±6,
// short faces at x = ±12, main arch 9.2 m wide with its crown at b + 22.

const STONE = mat('#d8c19c', 0.8); // the carved buff, a shade lighter than the walls
const DEDICATION = surface(mat('#d6bf98', 0.8), 'script');

export function addIndiaGateDetails(f, { b, top }) {
  const m = M.buff, d = new THREE.Group();
  const zF = 6, xS = 12;
  for (const a of [0, Math.PI]) {
    // Long faces: the archivolt from the springing, and a keystone at the crown.
    d.add(onFace(at(archRing(9.2, 22, false, 0.55, 0.14, STONE, false), 0, b, 0), a, zF));
    d.add(onFace(at(keystone(0.85, 1.9, 0.3, STONE), 0, b + 21.25, 0), a, zF));
    // The two roundels either side of the arch.
    for (const x of [-6.25, 6.25]) d.add(onFace(at(sunburst(1.3, STONE, { rays: 28 }), 0, b + 23.6, 0), a, zF, x));
    // The dedication above the arch, in a moulded frame.
    d.add(onFace(box(7.6, 2.3, 0.05, DEDICATION, 0, b + 25.3, 0), a, zF));
    for (const [w, h, x, y] of [[8.1, 0.22, 0, b + 25.05], [8.1, 0.22, 0, b + 27.6], [0.22, 2.77, -3.94, b + 25.05], [0.22, 2.77, 3.94, b + 25.05]]) {
      d.add(onFace(box(w, h, 0.1, STONE, 0, y, 0), a, zF + 0.05, x));
    }
    // The attic: INDIA between the two years, read the right way round from either side.
    const zA = 5.5;
    d.add(onFace(at(lettering('INDIA', 1.75, 0.07, D.inkSoft), 0, top + 2.65, 0), a, zA));
    d.add(onFace(at(lettering('MCMXIV', 0.82, 0.06, D.inkSoft), 0, top + 3.1, 0), a, zA, -7.4));
    d.add(onFace(at(lettering('MCMXIX', 0.82, 0.06, D.inkSoft), 0, top + 3.1, 0), a, zA, 7.4));
    // A sunk-panel frame round the inscription.
    for (const [w, h, x, y] of [[21, 0.2, 0, top + 1.6], [21, 0.2, 0, top + 5.05], [0.2, 3.65, -10.4, top + 1.6], [0.2, 3.65, 10.4, top + 1.6]]) {
      d.add(onFace(box(w, h, 0.08, STONE, 0, y, 0), a, zA, x));
    }
  }
  for (const a of [Math.PI / 2, -Math.PI / 2]) {
    // Short faces: archivolt and roundel over the side arch.
    d.add(onFace(at(archRing(4.6, 12, false, 0.35, 0.1, STONE, false), 0, b, 0), a, xS));
    d.add(onFace(at(keystone(0.55, 1.15, 0.2, STONE, 0.25), 0, b + 11.5, 0), a, xS));
    d.add(onFace(at(sunburst(1.05, STONE, { rays: 24 }), 0, b + 14.7, 0), a, xS));
  }
  // The frieze of Imperial suns under the cornice, with a fillet below it, on all four faces.
  for (const a of FACES) {
    const long = a === 0 || a === Math.PI, half = long ? xS : zF, dist = long ? zF : xS, n = long ? 9 : 4;
    d.add(onFace(box(2 * half + 0.2, 0.22, 0.12, STONE, 0, b + 30.55, 0), a, dist));
    for (let k = 0; k < n; k++) {
      const lat = -half + 1.3 + (k / (n - 1)) * (2 * half - 2.6);
      d.add(onFace(at(sunburst(0.42, STONE, { rays: 16, rim: 0.05, proud: 0.05 }), 0, b + 31.45, 0), a, dist, lat));
    }
    // Dentils under the cornice and a lip half-way up its face.
    d.add(onFace(at(dentils(2 * half - 0.3, 0.22, 0.32, 0.4, STONE), 0, top - 0.32, 0), a, dist));
    d.add(onFace(box(2 * half + 1.6, 0.26, 0.12, STONE, 0, top + 0.5, 0), a, (long ? 6.6 : 12.6)));
  }
  // Base moulding round the piers, stopping at the arches.
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
    d.add(box(7.3, 0.7, 0.14, STONE, sx * 8.3, b, sz * (zF + 0.07)));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) d.add(box(0.14, 0.7, 3.6, STONE, sx * (xS + 0.07), b, sz * 4.1));
  mergeByMaterial(d);
  f.add(d);

  // The coffered soffit of the main vault: transverse ribs, ribs along it, a rosette per coffer.
  const v = new THREE.Group(), vr = 4.25, vy = b + 17.4;
  for (const z of [-3.9, -1.95, 0, 1.95, 3.9]) {
    const rib = mesh(new THREE.TorusGeometry(vr, 0.14, 8, 40, Math.PI), STONE, 0, vy, z);
    v.add(rib);
  }
  const angles = [0.16, 0.5, 0.83, 1.16, 1.5].map((t) => t * Math.PI / 1.66);
  for (const t of angles) {
    const o = box(0.24, 0.24, 7.8, STONE, Math.cos(t) * vr, vy + Math.sin(t) * vr - 0.12, 0);
    o.rotation.z = t;
    v.add(o);
  }
  for (let i = 0; i < angles.length - 1; i++) for (const z of [-2.92, -0.97, 0.97, 2.92]) {
    const t = (angles[i] + angles[i + 1]) / 2, r = rosette(0.32, STONE, 8);
    r.position.set(Math.cos(t) * (vr + 0.12), vy + Math.sin(t) * (vr + 0.12), z);
    r.lookAt(0, vy, z);
    v.add(r);
  }
  mergeByMaterial(v);
  f.add(v);

  // The bowl at the top: a rolled rim and a moulded foot.
  const bowlY = top + 11.2;
  const rim = mesh(new THREE.TorusGeometry(4.42, 0.13, 8, 64), STONE, 0, bowlY + 1.45, 0);
  rim.rotation.x = Math.PI / 2;
  f.add(rim);
  f.add(cyl(3.0, 3.25, 0.25, STONE, 0, bowlY - 0.05, 0, 48));
}

// The canopy east of the arch (group c, in its own coordinates): stepped base, column caps and
// bases, a sloping eave on each side, pinnacles at the corners, a drum and a ribbed dome; and the
// statue under it.
export function addCanopyDetails(c) {
  const m = M.buff, d = new THREE.Group();
  for (let k = 0; k < 3; k++) d.add(box(15 - k * 1.1, 0.33, 15 - k * 1.1, M.red, 0, k * 0.33, 0));
  for (const x of [-4.2, 4.2]) for (const z of [-4.2, 4.2]) {
    d.add(box(2.1, 0.6, 2.1, STONE, x, 1, z), box(2.2, 0.7, 2.2, STONE, x, 10.3, z));
    d.add(box(1.85, 0.3, 1.85, STONE, x, 10, z));
  }
  for (const a of FACES) d.add(onFace(chhajja(13.4, 1.5, 0.75, 0.18, STONE), a, 5.5).translateY(12.4));
  for (const x of [-5, 5]) for (const z of [-5, 5]) {
    d.add(box(1.1, 1.3, 1.1, m, x, 12.6, z), at(kalash(1.2, STONE), x, 13.9, z));
  }
  d.add(cyl(3.9, 4.1, 0.9, m, 0, 12.6, 0, 32), cyl(4.25, 4.25, 0.25, STONE, 0, 13.4, 0, 32));
  const dome = ribbed(hemi(3.92, m, 48), 16, 0.035);
  d.add(at(dome, 0, 13.55, 0));
  d.add(at(petalRing(0.5, 12, 0.9, 0.42, Math.PI - 0.75, STONE), 0, 17.45, 0));
  mergeByMaterial(d);
  c.add(d, at(finial(3.5), 0, 17.35, 0));
  // The black granite statue of Netaji Subhas Chandra Bose, standing under the canopy and facing
  // the arch.
  c.add(at(statue(8, mat('#2e2e33', 0.3), 'leader', STONE), 0, 1, 0).rotateY(Math.PI));
}

// Kartavya Path round the gate: lawn up to the piers, lamps, and the jamun trees along the avenue.
// (The avenue's canals lie west of the arch, outside this model.)
export function addDetails(f, g) {
  g.add(lampPosts([...along(10, [-9.5, 14], [-9.5, 185]), ...along(10, [9.5, 14], [9.5, 185])]));
  g.add(trees([...along(12, [-58, 14], [-58, 185]), ...along(12, [58, 14], [58, 185])], { kind: 'jamun', seed: 6 }));
}
