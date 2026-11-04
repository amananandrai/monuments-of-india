import * as THREE from 'three';
import { M, box, at, onFace, FACES } from '../helpers.js';
import { star, panel, frieze, jali, archRing, archSlab, mergeByMaterial } from './components.js';
import { trees, asiBoard, fountains, scatter, along } from './realism.js';
import { deer } from './animals.js';

// Akbar's Tomb at Sikandra, finer detail. From photographs and descriptions:
// - white marble stars are inlaid in the spandrels of the great iwans of the ground storey;
// - the three storeys above are open arcades (pillared verandahs), here a row of arches in moulded
//   rings on every face of each storey;
// - the marble screens round the top terrace are pierced (jali) all over;
// - the southern gateway is covered in bold geometric inlay: framed panels either side of its
//   iwan, each with a great star, and a band of inlay round the iwan.
// Dimensions follow js/monuments/akbars-tomb.js.
function architecture(f, g) {
  const d = new THREE.Group(), Rd = M.red, Rl = M.redLight, Mb = M.marble;
  for (const a of FACES) for (const x of [-4.4, 4.4]) d.add(onFace(at(star(6, 0.75, Mb), 0, 13.6, 0), a, 52.62, x));
  let y = 9;
  for (const [w, h] of [[72, 6], [58, 5], [46, 4.5]]) {
    const n = Math.floor(w / 4.2), p = w / n;
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -w / 2 + (k + 0.5) * p;
      d.add(onFace(at(archSlab(p * 0.62, h * 0.72, true, M.recess, 0.03), 0, y + 0.4, 0), a, w / 2, lat));
      d.add(onFace(at(archRing(p * 0.62, h * 0.72, true, 0.18, 0.1, Rl), 0, y + 0.4, 0), a, w / 2, lat));
    }
    y += h + 0.6;
  }
  for (const s of [-1, 1]) {
    d.add(at(new THREE.Mesh(new THREE.BoxGeometry(39, 3, 0.04), jali(Mb)), 0, y + 2.6, s * 20.07));
    d.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 3, 39), jali(Mb)), s * 20.07, y + 2.6, 0));
  }
  // The gateway (40 × 22 × 16 at z = 140, its iwan 14 wide in a 20 wide frame).
  const gw = at(new THREE.Group(), 0, 0, 140);
  for (const x of [-15, 15]) for (const py of [1.5, 11.5]) {
    gw.add(at(panel(8, 9, 0.45, Mb, frieze(Rd)), x, py, 8.01));
    gw.add(at(star(8, 2.6, Mb, 0.08), x, py + 4.5, 8.04));
  }
  for (const x of [-10.6, 10.6]) gw.add(box(0.7, 21, 0.08, Mb, x, 0.5, 8.03));
  gw.add(box(21.9, 0.7, 0.08, Mb, 0, 21, 8.03));
  g.add(mergeByMaterial(gw));
  mergeByMaterial(d);
  f.add(d);
}

// Akbar's Tomb at Sikandra: the deer park in its great garden (herds of chital graze the lawns),
// the water channel and fountains down the causeway from the gate, and the trees lining it.
export function addDetails(f, g) {
  architecture(f, g);
  g.add(box(1.6, 0.27, 84, M.water, 0, 0, 94), fountains(along(6, [0, 60], [0, 128]), { y: 0.27, h: 1.8 }));
  for (const x of [-8.5, 8.5]) f.add(trees(along(8, [x, 60], [x, 130]), { kind: 'ashoka', seed: x > 0 ? 3 : 4 }));
  f.add(trees(scatter(18, [-105, 105, -100, 185], { seed: 5, gap: 14, avoid: [[-60, 60, -60, 60], [-12, 12, 50, 160], [-30, 30, 125, 160]] }), { kind: 'neem', seed: 5 }));
  const herd = scatter(16, [-95, 95, -90, 180], { seed: 6, gap: 4, avoid: [[-58, 58, -58, 58], [-12, 12, 40, 160], [-30, 30, 125, 160]] });
  f.add(deer(herd.map(([x, z], i) => [x, z, i * 1.9])));
  f.add(asiBoard("Akbar's Tomb, Sikandra", 9, 158, 0));
}
