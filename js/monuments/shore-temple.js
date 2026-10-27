import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, flat, kalash, inst, unitBox, aroundRect } from '../helpers.js';

const GRANITE = mat('#8f8577', 0.95);
const GRANITE_DARK = mat('#6d655a', 0.95);
const SAND = mat('#dcc9a3', 0.95);
const ROCK = mat('#6e6a64', 0.95, 0, { flatShading: true });

// A slender Pallava vimana: square tiers with corner pavilions and an octagonal cap.
function vimana(w, tiers, th, m, md) {
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1 - (0.55 * i) / tiers), k = tw * 0.16;
    g.add(box(tw, th * 0.7, tw, m, 0, y), box(tw + 0.5, th * 0.3, tw + 0.5, md, 0, y + th * 0.7));
    for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(box(k, k, k, m, x * (tw / 2 - k / 2), y + th, z * (tw / 2 - k / 2)));
    y += th;
  }
  const r = w * 0.26;
  const cap = mesh(new THREE.SphereGeometry(r, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), flat(m), 0, y, 0);
  cap.rotation.y = Math.PI / 8;
  cap.scale.y = 1.2;
  g.add(cap, at(kalash(r * 0.7, m), 0, y + r * 1.2, 0));
  g.userData.top = y + r * 2;
  return g;
}

export function buildShoreTemple() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(17);
  g.add(f);
  // Beach, the Bay of Bengal, and the boulder breakwater between temple and sea
  g.add(box(220, 0.3, 160, SAND, 0, 0, 20), box(400, 0.4, 260, M.water, 0, -0.1, -200));
  for (let i = 0; i < 22; i++) {
    const r = 1.5 + R() * 2.5;
    g.add(mesh(new THREE.IcosahedronGeometry(r, 0), ROCK, -50 + i * 4.8 + R() * 2, r * 0.4, -38 + R() * 4));
  }
  // Compound wall lined with Nandi figures
  const W = 46, D = 54, nandis = [];
  for (const s of [-1, 1]) f.add(box(W, 2.4, 1.4, GRANITE, 0, 0, s * D / 2), box(1.4, 2.4, D, GRANITE, s * W / 2, 0, 0));
  aroundRect(W, D, 2.8).forEach(([x, z, ry]) => nandis.push([x, 2.4, z, 1, 1.2, 1.8, ry + Math.PI / 2]));
  f.add(inst(unitBox(), nandis, GRANITE_DARK));
  // Two Shiva shrines (the larger facing the sea) and the small Vishnu shrine between them
  f.add(box(26, 1.4, 40, GRANITE_DARK, 0, 0, 0));
  f.add(box(9, 6, 9, GRANITE, 0, 1.4, -10), at(vimana(9, 5, 2.8, GRANITE, GRANITE_DARK), 0, 7.4, -10));
  f.add(box(6, 4.5, 6, GRANITE, 0, 1.4, 9), at(vimana(6, 4, 2.2, GRANITE, GRANITE_DARK), 0, 5.9, 9));
  f.add(box(7, 3.6, 6, GRANITE, 0, 1.4, 0), box(7.6, 0.6, 6.6, GRANITE_DARK, 0, 5, 0));
  return { group: g, focus: f, view: [0.95, 0.35, 1.0] };
}
