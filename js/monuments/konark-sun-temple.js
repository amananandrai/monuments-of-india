import * as THREE from 'three';
import { M, flat, mesh, box, cyl, group, at, onFace, FACES, kalash, bell, pidaRoof, rng, wheel, horse } from '../helpers.js';

export function buildKonark() {
  const K = M.khond, Kd = M.khondDark, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(80, 0.25, 170, M.path, 0, 0, 10));
  // The chariot: a 6 m plinth carried on 24 carved wheels
  const L = 76, zc = -6, B = 6, zf = zc + L / 2;
  f.add(box(32, 4.6, L, Kd, 0, 0, zc), box(29, 1.4, L - 4, K, 0, 4.6, zc));
  for (let i = 0; i < 12; i++) {
    const z = zc - L / 2 + 4 + i * ((L - 8) / 11);
    for (const s of [-1, 1]) {
      const w = wheel(1.55, Kd);
      w.position.set(s * 16.2, 2.2, z);
      w.rotation.y = Math.PI / 2;
      f.add(w);
    }
  }
  for (let k = 0; k < 4; k++) f.add(box(10, B - k * 1.5, 2, K, 0, 0, zf + 1 + k * 2));
  for (const x of [-15.5, -12.5, -9.5, 8, 11, 14, 17]) {
    const h = horse(Kd);
    h.position.set(x, 0.8, zf + 4);
    f.add(box(2, 0.8, 4.5, K, x, 0, zf + 4), h);
  }
  // Jagamohana (the surviving porch) with three tiers of pida roof
  const jz = zf - 16;
  f.add(box(26, 12, 26, K, 0, B, jz), box(30, 12, 16, K, 0, B, jz), box(16, 12, 30, K, 0, B, jz));
  let y = B + 12;
  [[29, 22], [20, 14], [13, 8]].forEach(([w0, w1], i) => {
    const r = pidaRoof(w0, w1, 4, 0.75, K, Kd);
    f.add(at(r, 0, y, jz));
    y += r.userData.top;
    if (i < 2) {
      const tw = w1 - 2.5;
      f.add(box(tw, 2.6, tw, Kd, 0, y, jz));
      for (const a of FACES) for (const k of [-1, 0, 1]) {
        const s = onFace(box(1, 2.2, 0.8, K, 0, y, 0), a, tw / 2 + 0.4, k * tw / 3.2);
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
  for (const x of [-7.5, -2.5, 2.5, 7.5]) for (const z of [-7.5, -2.5, 2.5, 7.5]) f.add(cyl(0.6, 0.7, 2 + R() * 3, K, x, 5, nz + z, 8));
  return { group: g, focus: f, view: [1.1, 0.38, 0.9] };
}
