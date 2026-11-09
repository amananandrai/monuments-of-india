import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, kalingaProfile } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, pilasters, mergeByMaterial } from './components.js';
import { figureFrieze, figure } from './sculpture.js';
import { lion } from './animals.js';
import { garland } from './realism.js';

// Jagannath, Puri, finer detail. From photographs and descriptions of the Kalinga rekha deula: the
// base of the sanctum is a stack of mouldings (pabhaga) with carved bands; on each outer face a
// niche holds a side deity (parshvadevata); ribbed amalaka stones mark the storeys on the corners of
// the tower; and lions spring from its faces half-way up. Dimensions follow
// js/monuments/jagannath-puri-temple.js: the sanctum 22 square (with offsets to 26) from B (the
// top of the terrace, 4.5) to B + 16 at z = -30, its tower 24 wide and TH high on the Kalinga profile.
function architecture(f, B, TH) {
  const d = new THREE.Group(), m = M.puri, sh = M.puriShade, dz = -30;
  const s = at(new THREE.Group(), 0, B, dz);
  s.add(mouldings(26, 14, [[0, 0.6, 0.3, sh], [0.6, 0.5, 0.15, frieze(m)], [1.1, 0.5, 0.35, sh]], m));
  s.add(mouldings(14, 26, [[0.01, 0.6, 0.3, sh], [0.61, 0.5, 0.15, frieze(m)], [1.11, 0.5, 0.35, sh]], m));
  s.add(mouldings(22, 22, [[0.02, 0.6, 0.3, sh], [0.62, 0.5, 0.15, frieze(m)], [1.12, 0.5, 0.35, sh]], m));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) s.add(onFace(at(templeNiche(2.6, 5, m, { figure: idol(4.2, m) }), 0, 4, 0), a, 13));
  d.add(s);
  const am = new THREE.SphereGeometry(1, 16, 6), y0 = B + 16;
  for (let k = 1; k <= 5; k++) {
    const t = k / 6, wt = 24 * kalingaProfile(t), y = y0 + t * TH, r = wt * 0.08;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, m, sx * wt * 0.42, y, dz + sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  mergeByMaterial(d);
  f.add(d);
  const t = 0.42, wt = 24 * kalingaProfile(t);
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const l = onFace(lion(2.2, m), a, wt * 0.5 + 0.4);
    l.position.y = y0 + t * TH - 1;
    l.position.z += dz;
    f.add(l);
  }
}

// The halls, after photographs: on the outer faces of each hall's projecting arms, pilasters, a
// band of carved figures low on the wall and a niche with an image either side of the middle (left
// clear for the side doors of the Natamandapa); and a band of figures along the rest of each face.
// Dimensions follow js/monuments/jagannath-puri-temple.js: halls [w, h, z] from B, each a cross of
// a w square and two arms w + 4 by 0.6 w.
function halls(f, B) {
  const d = new THREE.Group(), m = M.puri;
  for (const [w, h, z, door] of [[22, 13, -5, false], [18, 9, 15, true], [15, 8, 31, false]]) {
    const t = at(new THREE.Group(), 0, B, z), arm = w * 0.6;
    for (const a of [Math.PI / 2, -Math.PI / 2]) {
      t.add(onFace(at(figureFrieze(arm - 0.6, 1.0, m, { pitch: 0.8, kinds: ['standing', 'dancer', 'musician'] }), 0, 0.9, 0), a, (w + 4) / 2 + 0.03));
      t.add(onFace(at(pilasters(arm - 0.4, 4, 0.5, h - 2.8, 0.14, m), 0, 2.2, 0), a, (w + 4) / 2 + 0.012));
      for (const l of door ? [-0.36, 0.36] : [-0.22, 0.22]) t.add(onFace(at(templeNiche(1.3, 2.8, m, { figure: figure(2.5, m, 'standing') }), 0, 2.6, 0), a, (w + 4) / 2 + 0.024, l * arm));
    }
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}


// The Jagannath temple at Puri: the Aruna Stambha, the sixteen-sided pillar crowned by Aruna,
// charioteer of the Sun, that stands before the Lion Gate (brought from Konark); and garlands over
// the gate. B: the height of the terrace the temple stands on; TH: the height of the spire;
// gateZ: the Lion Gate's centre.
const STONE = mat('#5a544c', 0.75);
export function addDetails(f, g, { B = 4.5, TH = 32.7, gateZ = 104 } = {}) {
  architecture(f, B, TH);
  halls(f, B);
  const az = gateZ + 15;
  g.add(box(4, 1.5, 4, STONE, 0, 0, az), cyl(0.85, 1, 10, STONE, 0, 1.5, az, 16), cyl(1.3, 0.8, 1.2, STONE, 0, 11.5, az, 16));
  g.add(cyl(0.45, 0.5, 1.2, STONE, 0, 12.7, az, 10), at(cyl(0.38, 0.45, 0.4, STONE, 0, 0, 0, 10), 0, 13.9, az + 0.15));
  g.add(garland([-3.4, 6.6, gateZ + 5.3], [3.4, 6.6, gateZ + 5.3], { sag: 0.6, strands: 3 }));
}
