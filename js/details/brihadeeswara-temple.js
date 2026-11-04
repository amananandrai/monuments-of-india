import * as THREE from 'three';
import { mouldings, frieze, pilasters, templeNiche, idol, mergeByMaterial } from './components.js';
import { M, mat, mesh, at, onFace, FACES } from '../helpers.js';
import { trees, garland, asiBoard, along } from './realism.js';
import { rideElephant } from './animals.js';
import { lamp } from './doorways.js';

// Brihadeeswara, finer detail. From photographs and descriptions of the vimana:
// - the base (adhishthana) is a stack of mouldings, the lowest carrying a frieze of yalis;
// - each storey of the pyramidal tower has a cornice studded with kudus, small horseshoe-arched
//   dormers, over the miniature shrines (shalas and kutas) the builder places on its edge;
// - the walls of the halls in front are divided by pilasters, with a niche and its deity in each
//   bay. Dimensions follow js/monuments/brihadeeswara-temple.js.
function architecture(g) {
  const d = new THREE.Group(), m = M.granite, dk = M.graniteDark;
  d.add(mouldings(31, 31, [[0.3, 0.5, 0.35], [1.2, 0.9, 0.12, frieze(dk)], [2.4, 0.5, 0.3], [3.4, 0.6, 0.45]], dk));
  // Kudus along the cornices of the lower nine storeys.
  let y = 17.2, w = 27.5;
  const tg = new THREE.TorusGeometry(0.42, 0.11, 4, 10, Math.PI * 1.3).rotateZ(-Math.PI * 0.15);
  for (let i = 0; i < 9; i++) {
    const n = Math.floor((w * 0.6) / 1.4), ky = y + 2.9 * 0.72 + 2.9 * 0.14;
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -w * 0.3 + (k + 0.5) * ((w * 0.6) / n);
      d.add(onFace(mesh(tg, m, 0, ky, 0), a, (w + 0.9) / 2 + 0.06, lat));
    }
    y += 2.9;
    w -= (27.5 - 9.5) / 13;
  }
  // The halls: [w, h, d, z]; pilasters along both sides and a niche in each bay.
  for (const [hw, hh, hd, z] of [[22, 11, 34, 41], [18, 9, 12, 64]]) {
    for (const s of [-1, 1]) {
      const a = s * Math.PI / 2, n = Math.max(2, Math.round(hd / 5));
      const p = onFace(pilasters(hd - 1, n + 1, 0.8, hh - 0.6, 0.18, m), a, hw / 2);
      p.position.z += z;
      d.add(p);
      for (let k = 0; k < n; k++) {
        const o = onFace(templeNiche(1.2, 2.6, m, { figure: idol(2.3, m), crown: false }), a, hw / 2, 0);
        o.position.y = 2.6;
        o.position.z = z - (hd - 1) / 2 + (k + 0.5) * ((hd - 1) / n);
        d.add(o);
      }
    }
  }
  mergeByMaterial(d);
  g.add(d);
}

// The Brihadeeswara at Thanjavur: the temple elephant by the Nandi pavilion, marigold garlands over
// the main doorway, lamps lit before it, coconut palms round the court, and the ASI board at the
// gate.
export function addDetails(f, g) {
  architecture(f);
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#b3262e', howdah: false });
  tusker.position.set(12, 0, 84);
  tusker.rotation.y = -Math.PI / 2;
  g.add(tusker);
  g.add(garland([-2.2, 7.6, 70.9], [2.2, 7.6, 70.9], { sag: 0.5, strands: 3 }));
  for (const x of [-2.8, 2.8]) g.add(at(lamp(1.6), x, 1, 72));
  g.add(trees([...along(9, [-32, -40], [-32, 100]), ...along(9, [32, -40], [32, 100])], { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Brihadisvara Temple', 10, 104, 0, { line2: 'GREAT LIVING CHOLA TEMPLES' }));
}
