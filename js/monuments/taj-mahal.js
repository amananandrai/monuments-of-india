import * as THREE from 'three';
import { M, mesh, box, cyl, group, at, onFace, FACES, archPanel, onionDome, finial, chhatri, minaret } from '../helpers.js';

export function buildTaj() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(118, 1.5, 118, M.red));
  f.add(box(95, 6, 95, M.marble, 0, 1.5));
  const P = 7.5;
  const s = 28.5, c = 9.5, H = 30;
  const sh = new THREE.Shape();
  sh.moveTo(-s + c, -s); sh.lineTo(s - c, -s); sh.lineTo(s, -s + c); sh.lineTo(s, s - c);
  sh.lineTo(s - c, s); sh.lineTo(-s + c, s); sh.lineTo(-s, s - c); sh.lineTo(-s, -s + c); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  f.add(mesh(geo, M.marble, 0, P, 0));
  f.add(box(2 * s + 0.6, 1.2, 2 * s + 0.6, M.marbleShade, 0, P + H - 0.6));
  for (const a of FACES) {
    f.add(onFace(box(21, H + 2, 1.2, M.marble, 0, P), a, s + 0.6));
    f.add(onFace(at(archPanel(14, 24, true, M.marbleShade, 0.4), 0, P + 0.5, 0), a, s + 1.2));
    f.add(onFace(at(archPanel(6, 11, true, M.recess, 0.3), 0, P + 0.5, 0), a, s + 1.62));
    for (const lat of [-15.3, 15.3]) for (const y of [1.5, 15.5]) {
      f.add(onFace(at(archPanel(4.6, 11, true, M.marbleShade, 0.3), 0, P + y, 0), a, s, lat));
    }
    const ca = a + Math.PI / 4, cd = (s - c / 2) * Math.SQRT2;
    for (const y of [1.5, 15.5]) f.add(onFace(at(archPanel(5.2, 11, true, M.marbleShade, 0.3), 0, P + y, 0), ca, cd));
  }
  const top = P + H;
  f.add(cyl(14, 14, 7, M.marble, 0, top, 0, 48));
  f.add(cyl(14.6, 14.6, 0.8, M.marbleShade, 0, top + 6.2, 0, 48));
  f.add(at(onionDome(14.5, M.marble), 0, top + 7, 0));
  f.add(at(finial(9), 0, top + 7 + 14.5 * 1.8, 0));
  for (const x of [-16, 16]) for (const z of [-16, 16]) f.add(at(chhatri(4.2, 9, M.marble), x, top, z));
  for (const x of [-42, 42]) for (const z of [-42, 42]) f.add(at(minaret(41, 2.6, M.marble), x, P, z));
  // Charbagh garden and reflecting pool in front of the tomb
  g.add(box(8, 0.35, 150, M.water, 0, 0, 135));
  g.add(box(12, 0.3, 150, M.path, 0, 0, 135).translateY(-0.02));
  for (const x of [-24, 24]) g.add(box(34, 0.2, 150, M.grass, x, 0, 135));
  g.add(box(16, 0.8, 16, M.marble, 0, 0, 135));
  g.add(box(12, 0.9, 12, M.water, 0, 0, 135));
  return { group: g, focus: f };
}
