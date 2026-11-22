import * as THREE from 'three';
import { M, box, at, onFace, hipRoof, kalash, strut, V } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { keralaGable, dwajasthambha } from '../parts/temples.js';
import { classicalDoor } from '../parts/colonial.js';
import { trees, shrubs, lampPosts, stalls, asiBoard, scatter, along, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, LATERITE, TEAK, TILE, COPPER } from '../monuments/mattancherry-palace.js';

// Mattancherry Palace, finer detail. From photographs: carved timber gables (mukhappu) break the
// roof over the middle of the front and back wings; timber struts carry the deep eaves all round;
// and the ridge is capped by a line of tiles, with small finials at the ends of the gables.
// Measures follow js/monuments/mattancherry-palace.js.
function architecture(f) {
  const { W, D, WD, H, OV, RH } = P, d = new THREE.Group(), y0 = 0.6 + H, run = OV + WD / 2;
  // The gables, front and back, and over the middle of the two side wings.
  for (const [a, half] of [[0, D / 2], [Math.PI, D / 2], [Math.PI / 2, W / 2], [-Math.PI / 2, W / 2]]) {
    const back = 2.2, gh = 3.4, gw = a === 0 || a === Math.PI ? 9 : 7, depth = (gh + 0.3) * run / RH + 0.6;
    const gb = keralaGable(gw, gh, depth, TILE, TEAK), dist = half + OV - back;
    gb.position.set(Math.sin(a) * dist, y0 + RH * (back / run), Math.cos(a) * dist);
    gb.rotation.y = a;
    f.add(gb);
  }
  // Struts under the eaves, from the wall up to the roof's edge.
  const list = [];
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const len = Math.abs(Math.sin(a)) > 0.5 ? D : W, dist = (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2, n = Math.round(len / 2.6);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n), s = Math.sin(a), c = Math.cos(a);
      const p = (out, y) => V(s * (dist + out) + c * lat, y, c * (dist + out) - s * lat);
      list.push(strut(p(0.05, y0 - 1.8), p(OV - 0.2, y0 + 0.1), 0.14, TEAK));
    }
  }
  d.add(...list);
  // The ridge capping, round the square.
  for (const s of [-1, 1]) {
    d.add(box(W - WD + 0.3, 0.25, 0.35, TILE, 0, y0 + RH - 0.08, s * (D / 2 - WD / 2)));
    d.add(box(0.35, 0.25, D - WD + 0.3, TILE, s * (W / 2 - WD / 2), y0 + RH - 0.08, 0));
  }
  f.add(mergeByMaterial(d));
}

// A small Kerala shrine: a square sanctum on a laterite base under a tiled pyramid, the copper pot
// on top, and its door to the east.
function shrine(w, h, ry) {
  const g = new THREE.Group();
  g.add(box(w + 1.6, 1, w + 1.6, LATERITE), box(w, h, w, LIME, 0, 1, 0), box(w + 0.3, 0.3, w + 0.3, TEAK, 0, 1 + h, 0));
  g.add(at(hipRoof(w + 3, w + 3, w * 0.75, TILE), 0, 1.3 + h, 0), at(kalash(0.4, COPPER), 0, 1.3 + h + w * 0.75 - 0.1, 0));
  g.add(onFace(at(classicalDoor(1, 2, { m: LIME, trim: TEAK, shape: 'flat', top: null, depth: 0.2, frame: 0.18 }), 0, 1, 0), 0, w / 2));
  g.rotation.y = ry;
  return g;
}

// The palace's grounds in Mattancherry: a laterite compound wall with a tiled gatehouse
// (padippura) before the front; the temples of Krishna and Shiva either side of the palace, with
// a gilded flagstaff; coconut palms and mango trees in the compound; and outside it the tiled
// houses and shops of the street leading to Jew Town.
export function addDetails(f, g) {
  architecture(f);
  const { W, D } = P;
  g.add(box(400, 0.06, 360, M.grass, 0, -0.06, 0));
  g.add(box(12, 0.05, 30, M.path, 0, 0, D / 2 + 20), box(260, 0.05, 9, M.asphalt, 0, 0, D / 2 + 44));
  // The compound wall, open at the gatehouse.
  const wl = new THREE.Group(), X = W / 2 + 26, Zf = D / 2 + 36, Zb = -D / 2 - 22;
  wl.add(box(X - 4, 2.2, 0.6, LATERITE, -(X + 4) / 2, 0, Zf), box(X - 4, 2.2, 0.6, LATERITE, (X + 4) / 2, 0, Zf), box(2 * X, 2.2, 0.6, LATERITE, 0, 0, Zb));
  for (const s of [-1, 1]) wl.add(box(0.6, 2.2, Zf - Zb, LATERITE, s * X, 0, (Zf + Zb) / 2));
  wl.add(box(2 * X + 0.4, 0.3, 0.9, TILE, 0, 2.2, Zb));
  for (const s of [-1, 1]) wl.add(box(X - 4, 0.3, 0.9, TILE, s * (X + 4) / 2, 2.2, Zf), box(0.9, 0.3, Zf - Zb, TILE, s * X, 2.2, (Zf + Zb) / 2));
  // The gatehouse: a passage between two laterite piers under a tiled hip roof.
  wl.add(box(2, 3.6, 5, LATERITE, -3.4, 0, Zf), box(2, 3.6, 5, LATERITE, 3.4, 0, Zf), box(8.8, 0.5, 5.4, TEAK, 0, 3.6, Zf));
  wl.add(at(hipRoof(11, 8, 3.2, TILE), 0, 4.1, Zf), at(kalash(0.3, COPPER), 0, 7.2, Zf));
  g.add(mergeByMaterial(wl));
  // The temples of Krishna (south, +x) and Shiva (north, -x), facing east like the palace.
  f.add(at(shrine(5.4, 3.8, 0), W / 2 + 14, 0, 6), at(shrine(4.6, 3.4, 0), -W / 2 - 14, 0, 6));
  f.add(at(dwajasthambha(0, 0, 9), W / 2 + 14, 0, 16));
  // Coconut palms and mango trees in the compound and round it.
  g.add(trees(scatter(30, [-150, 150, -130, 120], { seed: 3, gap: 10, avoid: [[-W / 2 - 22, W / 2 + 22, -D / 2 - 6, D / 2 + 40], [-140, 140, D / 2 + 38, D / 2 + 64]] }), { kind: 'palm', seed: 3 }));
  g.add(trees([[-40, -36], [42, -38], [-46, 30]], { kind: 'mango', seed: 5 }));
  g.add(shrubs(scatter(14, [-X + 3, X - 3, -D / 2 - 18, D / 2 + 32], { seed: 6, gap: 5, avoid: [[-W / 2 - 4, W / 2 + 4, -D / 2 - 4, D / 2 + 8], [-8, 8, D / 2, Zf]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#d0306f', seed: 6 }));
  // The street outside the gate: tiled houses and shops along its far side, stalls before them.
  g.add(townHouses([...Array(12)].map((_, k) => [-110 + k * 20, D / 2 + 57, 17, 10, 2, Math.PI]), { seed: 9, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0 }));
  if (!detail.low) g.add(stalls([...along(5, [-60, D / 2 + 50.5], [-20, D / 2 + 50.5]), ...along(4, [20, D / 2 + 50.5], [60, D / 2 + 50.5])]));
  g.add(lampPosts([...along(6, [-100, D / 2 + 39], [100, D / 2 + 39])]));
  g.add(asiBoard('Mattancherry Palace', 9, Zf + 2, 0, { line2: 'MUSEUM' }));
}
