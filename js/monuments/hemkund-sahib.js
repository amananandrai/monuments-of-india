import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, starPrism } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { sikhDome, GILT } from '../parts/sikh.js';
import { addDetails } from '../details/hemkund-sahib.js';

// Grey concrete washed pale, and the darker stone of the base.
export const HEM = mat('#b9b6ad', 0.9), HEMDARK = mat('#7d7a72', 0.92);

// A pyramid on a star: n points rO out, the notches rI, rising h to an apex (or to a smaller star
// k times the size). Faceted.
function starPyramid(n, rO, rI, h, m, k = 0) {
  const pts = [], top = [], pos = [];
  for (let i = 0; i < 2 * n; i++) {
    const a = (i / (2 * n)) * Math.PI * 2, r = i % 2 ? rI : rO;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    top.push([Math.cos(a) * r * k, Math.sin(a) * r * k]);
  }
  for (let i = 0; i < 2 * n; i++) {
    const j = (i + 1) % (2 * n), [ax, az] = pts[i], [bx, bz] = pts[j], [cx, cz] = top[i], [dx, dz] = top[j];
    pos.push(ax, 0, az, cx, h, cz, bx, 0, bz);
    if (k > 0) pos.push(bx, 0, bz, cx, h, cz, dx, h, dz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return mesh(geo, m);
}

// Gurdwara Hemkund Sahib, at about 4,600 m on the shore of Hemkund lake in the Garhwal Himalaya;
// the present building was designed in the 1960s by the Military Engineering Services to bear the
// snow. From photographs: a low building on a star-shaped plan, its walls of grey concrete pierced
// by small arched windows, under a steep roof that rises in faceted tiers like a folded star, crowned
// by a small square lantern and a gilt dome with its kalash. The lake lies behind it (-z).
export function buildHemkundSahib() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const n = 5, rO = 15, rI = 8.8, H = 5.2, P = 1.2;
  f.add(at(starPrism(n, rO + 1.2, rI + 1, P, HEMDARK), 0, 0, 0).rotateY(Math.PI / 2));
  f.add(at(starPrism(n, rO, rI, H, HEM), 0, P, 0).rotateY(Math.PI / 2));
  // A small arched window in each face of the star, and a door in the face towards the lake.
  for (let i = 0; i < 2 * n; i++) {
    const a0 = (i / (2 * n)) * Math.PI * 2, a1 = ((i + 1) / (2 * n)) * Math.PI * 2;
    const r0 = i % 2 ? rI : rO, r1 = i % 2 ? rO : rI;
    const p0 = [Math.cos(a0) * r0, Math.sin(a0) * r0], p1 = [Math.cos(a1) * r1, Math.sin(a1) * r1];
    const mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2, len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const nx = (p1[1] - p0[1]) / len, nz = -(p1[0] - p0[0]) / len;
    const door = i === 7;
    const s = arcadeSkin(3.2, door ? 4.4 : 3.4, [[0, door ? 0 : 1.1, door ? 1.8 : 1.1, door ? 3.4 : 1.8, door ? 'door' : 'room']], 0.25, HEM, { trim: HEMDARK });
    // The star was turned a quarter: (x, z) of the plan -> (z, -x)... rotate the frame to match.
    const o = new THREE.Group();
    o.add(s);
    const wx = mz, wz = -mx, wnx = nz, wnz = -nx;
    o.position.set(wx + wnx * -0.02, P, wz + wnz * -0.02);
    o.rotation.y = Math.atan2(wnx, wnz);
    f.add(o);
  }
  // The roof: a low eave, then three steep faceted tiers, each a smaller star.
  let y = P + H;
  const roofM = HEM, tiers = [[rO + 1, rI + 0.8, 0.4, 1], [rO + 0.6, rI + 0.4, 5, 0.6], [(rO + 0.6) * 0.6, (rI + 0.4) * 0.6, 4, 0.55], [(rO + 0.6) * 0.33, (rI + 0.4) * 0.33, 3, 0.4]];
  for (const [a, b, h, k] of tiers) { f.add(at(starPyramid(n, a, b, h, k === 1 ? HEMDARK : roofM, k), 0, y, 0).rotateY(Math.PI / 2)); y += h; }
  // The lantern and the gilt dome.
  f.add(box(2.4, 1.8, 2.4, M.marble, 0, y - 0.3, 0), box(2.8, 0.3, 2.8, HEMDARK, 0, y + 1.5, 0));
  f.add(cyl(1.1, 1.1, 0.6, M.marble, 0, y + 1.8, 0, 16), at(sikhDome(1.2, GILT, { petals: false }), 0, y + 2.4, 0));
  mergeByMaterial(f);
  addDetails(f, g, { P, H, rO });
  // From across the lake's shore, the peaks behind.
  return { group: g, focus: f, view: [0.75, 0.32, 1], zoom: 1.7 };
}
