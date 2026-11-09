import * as THREE from 'three';
import { mat, at, onFace, FACES, starPrism } from '../helpers.js';
import { frieze, idol, windowFrame, jali, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { instances, kutaGeo } from './sculpture.js';
import { trees, garland, asiBoard, along } from './realism.js';
import { lamp } from './doorways.js';

const SOAP = mat('#8f877b', 0.85), SOAP_DARK = mat('#6f685e', 0.85);

// Chennakesava (the Keshava temple), Somanathapura, 1258, finer detail. From photographs and
// descriptions of this temple and its Hoysala kin:
// - the star-shaped walls of the shrines are wrapped in horizontal friezes (elephants, lions,
//   scrolls, scenes) below a band of images, here as carved bands following the star;
// - bracket figures (madanikas), dancers leaning out under the eaves, on the hall's corners and
//   sides;
// - the hall's walls between its pillars filled with pierced stone screens.
// Dimensions follow js/monuments/chennakesava-temple.js: platform B = 1.8, the hall 16 square at
// z = 6, the shrines on star plans (16 points, r 6 / 5) at [0, -10], [-11, 0], [11, 0].
function architecture(f) {
  const d = new THREE.Group(), B = 1.8;
  for (const [x, z] of [[0, -10], [-11, 0], [11, 0]]) {
    for (const y of [1.1, 2.2]) d.add(at(starPrism(16, 6.18, 5.16, 0.42, frieze(SOAP)), x, B + y, z));
    d.add(at(starPrism(16, 6.12, 5.1, 0.9, frieze(SOAP_DARK)), x, B + 5.2, z));
    // A band of images round each shrine, one on every point of the star.
    const ring = at(new THREE.Group(), x, B + 3.4, z);
    for (let k = 0; k < 16; k++) ring.add(onFace(idol(1.3, SOAP), Math.PI / 2 - (k / 16) * Math.PI * 2, 6.02));
    d.add(ring);
  }
  const hall = at(new THREE.Group(), 0, B, 6);
  for (const a of FACES) {
    for (const lat of [-5, 5]) if (a !== 0) hall.add(onFace(at(windowFrame(3, 3.6, SOAP, { shape: 'flat', screen: jali(SOAP) }), 0, 1.2, 0), a, 8.01, lat));
    for (const lat of [-7.6, -3, 3, 7.6]) {
      const fig = onFace(idol(1.6, SOAP), a, 8.35, lat);
      fig.position.y = 4.1;
      fig.rotateX(-0.35);
      hall.add(fig);
    }
    hall.add(placeAll(bracketGeo(0.6, 0.6, 0.3), [-7.6, -3, 3, 7.6].map((l) => { const o = onFace(new THREE.Object3D(), a, 8, l); return [o.position.x, 4.1, o.position.z, a]; }), SOAP_DARK));
  }
  d.add(hall);
  mergeByMaterial(d);
  f.add(d);
}

// The towers, after photographs of Somanathapura's three, which still stand complete (unlike the
// lost tower at Belur): each tier of the star-shaped tower carries a ring of miniature shrines on its
// points. Dimensions follow js/monuments/chennakesava-temple.js and helpers.stellateTower: towers
// r = 5.6 and 9 high in 7 tiers, from B + 7.
function towers(f) {
  const list = [], B = 1.8, r = 5.6, th = 9 / 7;
  for (const [x, z] of [[0, -10], [-11, 0], [11, 0]]) for (let i = 0; i < 6; i++) {
    const rr = r * (1 - (0.55 * i) / 7) * 0.88, s = 0.75 - i * 0.07;
    for (let k = 0; k < 16; k += 2) {
      const a = Math.PI / 2 + ((k + (i % 2)) / 16) * Math.PI * 2;
      list.push([x + Math.sin(a) * rr, B + 7 + (i + 1) * th - 0.05, z + Math.cos(a) * rr, s, s * 1.3, s, a]);
    }
  }
  f.add(instances(kutaGeo(), list, SOAP));
}


// The Keshava temple at Somanathapura: marigolds over the hall's doorway, lamps either side of it,
// coconut palms outside the cloister, and the ASI board at the gate.
export function addDetails(f, g) {
  architecture(f);
  towers(f);
  f.add(garland([-1.4, 5.5, 15.1], [1.4, 5.5, 15.1], { sag: 0.4, strands: 2 }));
  for (const x of [-2.2, 2.2]) f.add(at(lamp(1.3), x, 1.8, 16.2));
  g.add(trees([...along(8, [-48, -55], [-48, 55]), ...along(8, [48, -55], [48, 55]), ...along(6, [-40, -52], [40, -52])], { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Keshava Temple, Somanathapura', 12, 44, 0));
}
