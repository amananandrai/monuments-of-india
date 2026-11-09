import * as THREE from 'three';
import { M, flat, mesh, box, cyl, group, at, onFace, FACES, kalash, bell, pidaRoof, rng } from '../helpers.js';
import { templeDoorway, grandStair } from '../details/doorways.js';
import { mergeByMaterial, frieze } from '../details/components.js';
import { figure, instances, carvedWheelGeo } from '../details/sculpture.js';
import { addDetails } from '../details/konark-sun-temple.js';
import { detail } from '../detail.js';

export function buildKonark() {
  const K = M.khond, Kd = M.khondDark, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(80, 0.25, 170, M.path, 0, 0, 10));
  // The chariot: a 6 m plinth carried on 24 carved wheels
  const L = 76, zc = -6, B = 6, zf = zc + L / 2;
  f.add(box(32, 4.6, L, Kd, 0, 0, zc), box(29, 1.4, L - 4, K, 0, 4.6, zc));
  // Twelve carved sundial wheels a side, standing just proud of the plinth.
  // They part either side of the stairs up to the Jagamohana's side doors: ten behind, two in front.
  const wl = [], jz = zf - 16, z0 = zc - L / 2 + 4, gap0 = jz - 6.6, gap1 = jz + 6.6;
  for (let i = 0; i < 12; i++) {
    const z = i < 10 ? z0 + i * ((gap0 - z0) / 9) : gap1 + 1 + (i - 10) * ((zf - 3 - gap1 - 1));
    for (const s of [-1, 1]) wl.push([s * 16.14, 2.4, z, 1, 1, 1, s * Math.PI / 2]);
  }
  f.add(instances(carvedWheelGeo(1.95, { low: detail.low }), wl, Kd));
  for (let k = 0; k < 4; k++) f.add(box(10, B - k * 1.5, 2, K, 0, 0, zf + 1 + k * 2));
  // Jagamohana (the surviving porch) with three tiers of pida roof
  f.add(box(26, 12, 26, K, 0, B, jz), box(30, 12, 16, K, 0, B, jz), box(16, 12, 30, K, 0, B, jz));
  // Its three doorways, east (in front) and on the north and south arms
  const doors = new THREE.Group();
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) doors.add(onFace(at(templeDoorway(2.2, 4.4, { m: K, bands: 4 }), 0, B, 0), a, 15.02));
  f.add(at(mergeByMaterial(doors), 0, 0, jz));
  // Stairs up to the side doors from the ground, each from a block under its doorway: on the north
  // (+x) between elephants, on the south between war horses, as the guardians stand at Konark.
  for (const [s, foot] of [[1, 'elephant'], [-1, 'horse']]) {
    f.add(box(2.4, B, 9, Kd, s * 15.7, 0, jz));
    f.add(at(grandStair(B, 6, K, Kd, { foot, guardScale: 0.6, coarse: detail.low, cheek: 0.9 }), s * 16.9, 0, jz).rotateY(s * Math.PI / 2));
  }
  let y = B + 12;
  [[29, 22], [20, 14], [13, 8]].forEach(([w0, w1], i) => {
    const r = pidaRoof(w0, w1, 4, 0.75, K, Kd);
    f.add(at(r, 0, y, jz));
    y += r.userData.top;
    if (i < 2) {
      const tw = w1 - 2.5;
      f.add(box(tw, 2.6, tw, Kd, 0, y, jz));
      // The musicians and dancers who stand on the terraces of the roof, drum or cymbals in hand:
      // five to a side on desktops, three on phones (js/detail.js).
      const ks = detail.low ? [-1, 0, 1] : [-2, -1, 0, 1, 2], gap = detail.low ? tw / 3.2 : tw / 5.6;
      for (const a of FACES) for (const k of ks) {
        const s = onFace(at(figure(2.2, K, k % 2 ? 'musician' : 'dancer'), 0, y, 0), a, tw / 2 + 0.4, k * gap);
        s.position.z += jz;
        f.add(s);
      }
      y += 2.6;
    }
  });
  f.add(at(bell(4.2, K), 0, y, jz));
  const am = mesh(new THREE.SphereGeometry(3, 24, 8), flat(K), 0, y + 4.4 + 1.2, jz);
  am.scale.y = 0.4;
  f.add(am, at(kalash(1.8, K), 0, y + 6.8, jz));
  // Ruined base of the collapsed main tower, and the roofless Natamandira in front
  const dz = zc - L / 2 + 16;
  f.add(box(26, 7, 26, Kd, 0, B, dz), box(18, 3, 13, K, -2, B + 7, dz + 3), box(9, 2, 8, Kd, 5, B + 10, dz - 4));
  const nz = zf + 26, R = rng(7);
  f.add(box(24, 4, 24, Kd, 0, 0, nz), box(22, 1, 22, K, 0, 4, nz));
  // Its pillars, broken off at different heights: on desktops square and carved (a moulded base,
  // bands of carving, a dancer on the front and the back), on phones plain stumps (js/detail.js).
  const pil = new THREE.Group();
  for (const x of [-7.5, -2.5, 2.5, 7.5]) for (const z of [-7.5, -2.5, 2.5, 7.5]) {
    const ph = 2 + R() * 3;
    if (detail.low) { f.add(cyl(0.6, 0.7, ph, K, x, 5, nz + z, 8)); continue; }
    pil.add(box(1.5, 0.45, 1.5, Kd, x, 5, nz + z), box(1.05, ph - 0.45, 1.05, frieze(K), x, 5.45, nz + z));
    for (const t of [0.35, 0.75]) if (t * ph < ph - 0.3) pil.add(box(1.2, 0.28, 1.2, K, x, 5.45 + t * (ph - 0.45), nz + z));
    if (ph > 2.6) for (const s of [-1, 1]) { const o = figure(1.4, K, s > 0 ? 'dancer' : 'musician'); o.position.set(x, 5.75, nz + z + s * 0.56); o.rotation.y = s > 0 ? 0 : Math.PI; pil.add(o); }
  }
  f.add(mergeByMaterial(pil));
  addDetails(f, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: f, view: [1.1, 0.38, 0.9], zoom: 0.68 };
}
