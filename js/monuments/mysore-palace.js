import * as THREE from 'three';
import { M, V, box, cyl, group, at, onFace, archTop, rise, archPanel, ONION, onionDome, finial, chhatri, bulbPoints } from '../helpers.js';

export function buildMysorePalace() {
  const S = M.mysore, Rz = M.mysoreRose, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const bulbs = [];
  const line = (a, b, step = 0.9) => {
    const n = Math.max(1, Math.round(a.distanceTo(b) / step));
    for (let i = 0; i <= n; i++) bulbs.push(a.clone().lerp(b, i / n));
  };
  const rect = (x0, x1, y, z0, z1) => {
    line(V(x0, y, z0), V(x1, y, z0)); line(V(x1, y, z0), V(x1, y, z1));
    line(V(x1, y, z1), V(x0, y, z1)); line(V(x0, y, z1), V(x0, y, z0));
  };
  const verticals = (x0, x1, z0, z1, y0, y1) => { for (const x of [x0, x1]) for (const z of [z0, z1]) line(V(x, y0, z), V(x, y1, z)); };
  const arch = (aw, ah, x, y, z) => {
    const r = aw / 2, s = ah - rise(r, true), p = new THREE.Shape();
    p.moveTo(-r, 0); p.lineTo(-r, s); archTop(p, r, s, true); p.lineTo(r, 0);
    p.getSpacedPoints(Math.round(ah * 2.4)).forEach((q) => { if (q.y > 0.05) bulbs.push(V(x + q.x, y + q.y, z)); });
  };
  const dome = (cx, cy, cz, r) => {
    for (let m = 0; m < 12; m++) {
      const a = (m / 12) * Math.PI * 2;
      for (let i = 0; i < ONION.length - 1; i++) for (let t = 0; t < 1; t += 0.34) {
        const pr = ONION[i][0] + (ONION[i + 1][0] - ONION[i][0]) * t, py = ONION[i][1] + (ONION[i + 1][1] - ONION[i][1]) * t;
        bulbs.push(V(cx + Math.cos(a) * pr * r * 1.02, cy + py * r, cz + Math.sin(a) * pr * r * 1.02));
      }
    }
  };
  g.add(box(170, 0.15, 90, M.grass, 0, 0, 72), box(12, 0.2, 90, M.path, 0, 0, 72));
  const b = 1;
  f.add(box(84, b, 54, S));
  f.add(box(76, 16, 46, S, 0, b, 0), box(77, 0.8, 47, M.lime, 0, b + 16, 0));
  rect(-38.5, 38.5, b + 16.9, -23.5, 23.5);
  verticals(-38, 38, -23, 23, b, b + 16);
  for (let k = -3; k <= 3; k++) {
    if (k === 0) continue;
    f.add(onFace(at(archPanel(7, 11, true, M.recess, 0.3), 0, b + 0.5, 0), 0, 23, k * 10));
    f.add(onFace(at(archPanel(4.5, 4, true, M.recess, 0.3), 0, b + 11.5, 0), 0, 23, k * 10));
    arch(7, 11, k * 10, b + 0.5, 23.4);
    arch(4.5, 4, k * 10, b + 11.5, 23.4);
  }
  // Five-storey central tower with the gilded dome
  const tz = 18, th = 31;
  f.add(box(17, th, 16, S, 0, b, tz));
  for (let i = 0; i < 5; i++) {
    const y = b + i * 6.2, big = i === 0;
    f.add(box(17.6, 0.5, 16.6, M.lime, 0, y + 6.2 - 0.5, tz));
    for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
      const o = onFace(at(archPanel(big ? 8 : 4.2, big ? 5.6 : 4.4, true, M.recess, 0.3), 0, y + 0.3, 0), a, a ? 8.5 : 8);
      o.position.z += tz;
      f.add(o);
    }
    arch(big ? 8 : 4.2, big ? 5.6 : 4.4, 0, y + 0.3, tz + 8.4);
  }
  verticals(-8.5, 8.5, tz - 8, tz + 8, b, b + th);
  rect(-8.6, 8.6, b + th, tz - 8.1, tz + 8.1);
  for (const x of [-7, 7]) for (const z of [-6.5, 6.5]) f.add(at(chhatri(1.6, 5, S, Rz), x, b + th, tz + z));
  f.add(cyl(6, 6, 2, S, 0, b + th, tz, 32), at(onionDome(6.5, M.gild), 0, b + th + 2, tz), at(finial(4), 0, b + th + 2 + 6.5 * 1.78, tz));
  dome(0, b + th + 2, tz, 6.5);
  for (const sgn of [-1, 1]) {
    const x = sgn * 34, z = 19;
    f.add(box(10, 22, 10, S, x, b, z), box(10.6, 0.5, 10.6, M.lime, x, b + 16, z));
    f.add(cyl(3.8, 3.8, 1.5, S, x, b + 22, z, 24), at(onionDome(4.2, Rz), x, b + 23.5, z), at(finial(3), x, b + 23.5 + 7.4, z));
    verticals(x - 5, x + 5, z - 5, z + 5, b, b + 22);
    rect(x - 5.1, x + 5.1, b + 22, z - 5.1, z + 5.1);
    dome(x, b + 23.5, z, 4.2);
    f.add(at(chhatri(3, 8, S, Rz), x, b + 16.8, -19));
  }
  for (const x of [-22, -12, 12, 22]) f.add(at(chhatri(2.2, 6.5, S, Rz), x, b + 16.8, 20.5));
  f.add(bulbPoints(bulbs));
  return { group: g, focus: f, view: [0.55, 0.3, 1.2] };
}
