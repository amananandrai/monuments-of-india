import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, ring, inst, unitBox } from '../helpers.js';

const GRANITE = mat('#6f6a66', 0.6);
const LIGHT = mat('#d9d2c4', 0.8);
const TREE = mat('#3f6a36', 0.95, 0, { flatShading: true });

// Four concentric circles: Amar (immortality), Veerta (bravery), Tyag (sacrifice) and Rakshak (protection).
export function buildNationalWarMemorial() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(300, 0.15, 300, M.grass));
  // Rakshak Chakra: the outer ring of trees
  const trees = [];
  for (let k = 0; k < 90; k++) {
    const a = (k / 90) * Math.PI * 2;
    trees.push([Math.cos(a) * 110, 0, Math.sin(a) * 110, 6, 12, 6]);
  }
  g.add(inst(new THREE.IcosahedronGeometry(0.5, 0).translate(0, 0.5, 0), trees, TREE));
  // Tyag Chakra: concentric granite walls of name tablets
  f.add(cyl(82, 82, 0.3, LIGHT, 0, 0, 0, 96));
  for (const r of [76, 68, 60]) {
    const tabs = [];
    for (let k = 0; k < Math.round(r * 1.6); k++) {
      const a = (k / Math.round(r * 1.6)) * Math.PI * 2;
      if (Math.abs(Math.sin(a)) < 0.05 && Math.cos(a) > 0) continue;
      tabs.push([Math.cos(a) * r, 0.3, Math.sin(a) * r, 2.6, 2.4, 0.6, -a + Math.PI / 2]);
    }
    f.add(inst(unitBox(), tabs, GRANITE));
  }
  // Veerta Chakra: the covered gallery ring, and Amar Chakra with the obelisk and eternal flame
  f.add(ring(42, 4, LIGHT, 0.3, 64), ring(44, 0.8, GRANITE, 4.3, 64));
  f.add(cyl(20, 20, 0.6, LIGHT, 0, 0.3, 0, 48), cyl(4.6, 4.6, 1.2, GRANITE, 0, 0.9, 0, 24));
  f.add(mesh(new THREE.CylinderGeometry(0.4, 1.8, 15.5, 4).rotateY(Math.PI / 4).translate(0, 2.1 + 7.75, 0), GRANITE));
  f.add(cyl(1.4, 1.8, 1.4, mat('#ff8c2e', 0.4, 0, { emissive: '#ff6a00', emissiveIntensity: 2.4 }), 0, 2.1, 0, 16));
  return { group: g, focus: f, view: [0.5, 0.55, 1.15] };
}
