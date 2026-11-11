import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, surface, inst, unitBox, unitCyl, tricolour } from '../helpers.js';
import { frieze, panel, mergeByMaterial } from './components.js';
import { lampPosts, around } from './realism.js';

// The National War Memorial, finer detail. From photographs: the covered gallery of the Veerta
// Chakra is lined on its inner wall with six bronze murals of battle scenes, each in a granite
// frame; each granite tablet of the Tyag Chakra is lettered with names; and the base of the
// obelisk is ringed by a carved bronze band and the obelisk carries the bronze Lion Capital. The
// gallery's outer wall is divided into bays by piers under a coping; and to one side stands the
// Param Yoddha Sthal, the busts of the 21 holders of the Param Vir Chakra, and the flag. Dimensions follow js/monuments/national-war-memorial.js:
// the gallery ring r = 42, 4 high; the tablets 2.6 × 2.4 on rings r = 76, 68 and 60.
const LIGHT = mat('#d9d2c4', 0.8);
const BRONZE = frieze(M.bronze), GRANITE = mat('#6f6a66', 0.6), NAMES = surface(mat('#8a8278', 0.55), 'script');
function architecture(f) {
  const d = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const a = ((k + 0.5) / 6) * Math.PI * 2, x = Math.sin(a) * 41.9, z = Math.cos(a) * 41.9;
    const p = panel(9, 3, 0.25, GRANITE, BRONZE, 0.08);
    p.position.set(x, 0.8, z);
    p.rotation.y = a + Math.PI;
    d.add(p);
  }
  for (const r of [76, 68, 60]) {
    const n = Math.round(r * 1.6);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      if (Math.abs(Math.sin(a)) < 0.05 && Math.cos(a) > 0) continue;
      for (const s of [-1, 1]) {
        const t = box(2.2, 1.8, 0.03, NAMES, 0, 0, 0);
        t.position.set(Math.cos(a) * (r + s * 0.315), 0.6, Math.sin(a) * (r + s * 0.315));
        t.rotation.y = -a + Math.PI / 2 + (s < 0 ? Math.PI : 0);
        d.add(t);
      }
    }
  }
  d.add(cyl(1.92, 1.92, 0.6, BRONZE, 0, 2.6, 0, 4).rotateY(Math.PI / 4));
  // The gallery ring (r = 42, 4 high from 0.3): piers round its outer wall, a recessed panel in
  // each bay between them, under the granite band that caps it.
  const piers = [], bays = [];
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * Math.PI * 2, b = a + Math.PI / 72;
    piers.push([Math.sin(a) * 42.1, 0.3, Math.cos(a) * 42.1, 0.7, 4, 0.5, a]);
    bays.push([Math.sin(b) * 42.0, 1, Math.cos(b) * 42.0, 2.6, 2.6, 0.12, b]);
  }
  f.add(inst(unitBox(), piers, LIGHT), inst(unitBox(), bays, GRANITE));
  // The Lion Capital on the obelisk's tip (at 17.6): a bell, a drum and the four lions back to back.
  d.add(cyl(0.55, 0.42, 0.5, M.bronze, 0, 17.5, 0, 12), cyl(0.6, 0.6, 0.3, M.bronze, 0, 18, 0, 12));
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2; d.add(onFace(box(0.34, 0.75, 0.4, M.bronze, 0, 18.3, 0), a, 0.22), onFace(at(mesh(new THREE.SphereGeometry(0.22, 8, 6), M.bronze), 0, 19.1, 0), a, 0.36)); }
  // Param Yoddha Sthal, west of the circles: 21 bronze busts on granite pedestals in three rows
  // on a paved court, and the national flag on a tall mast beside it.
  const peds = [], busts = [], heads = [];
  for (let i = 0; i < 21; i++) {
    const x = -141 + Math.floor(i / 7) * 9, z = -27 + (i % 7) * 9;
    peds.push([x, 0.2, z, 1, 1.6, 1]);
    busts.push([x, 1.8, z, 0.7, 0.55, 0.4]);
    heads.push([x, 2.3, z, 0.36, 0.44, 0.38]);
  }
  const court = new THREE.Group();
  court.add(box(34, 0.2, 70, LIGHT, -132, 0, 0), inst(unitBox(), peds, GRANITE), inst(unitBox(), busts, M.bronze), inst(unitCyl(10), heads, M.bronze), at(tricolour(30, 9), -123, 0.2, 44));
  f.parent.add(court);
  mergeByMaterial(d);
  f.add(d);
}

// The National War Memorial in Delhi: lamps round the outer path of the Tyag Chakra and the Veerta
// Chakra.
export function addDetails(f, g) {
  architecture(f);
  g.add(lampPosts(around(24, 86)));
}
