import * as THREE from 'three';
import { mat, mesh, box, cyl, at, onFace, flat, kalash, aroundRect } from '../helpers.js';
import { elephant } from '../details/animals.js';
import { trabeateGate } from '../details/temples.js';
import { templeDoorway } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { instances, elephantGeo, kuta, shala } from '../details/sculpture.js';
import { addDetails } from '../details/kailasa-temple.js';

const ROCK = mat('#6f675e', 0.95);
const ROCK_DARK = mat('#57514a', 0.95);

// A Dravidian vimana in stepped tiers, crowned by an octagonal dome.
function vimana(w, tiers, th, m, md) {
  const g = new THREE.Group(), hara = new THREE.Group();
  let y = 0;
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1 - (0.45 * i) / tiers);
    g.add(box(tw, th * 0.72, tw, m, 0, y), box(tw + 0.8, th * 0.28, tw + 0.8, md, 0, y + th * 0.72));
    const k = tw * 0.12;
    // Miniature shrines along the storey's edge: kutas on the corners, a shala in each side.
    if (i < tiers - 1) {
      for (const x of [-1, 1]) for (const z of [-1, 1]) hara.add(at(kuta(k, m), x * (tw / 2 - k / 2), y + th, z * (tw / 2 - k / 2)));
      for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) hara.add(onFace(at(shala(tw * 0.32, k, m), 0, y + th, 0), a, tw / 2 - k / 2));
    }
    y += th;
  }
  g.add(mergeByMaterial(hara));
  const r = w * 0.32;
  g.add(box(r * 1.2, th * 0.5, r * 1.2, md, 0, y));
  const dome = mesh(new THREE.SphereGeometry(r, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), flat(m), 0, y + th * 0.5, 0);
  dome.rotation.y = Math.PI / 8;
  g.add(dome, at(kalash(r * 0.6, m), 0, y + th * 0.5 + r, 0));
  return g;
}

export function buildKailasa() {
  const g = new THREE.Group(), f = new THREE.Group(), H = 32;
  g.add(f);
  // The basalt cliff, cut away to leave a pit around the temple
  g.add(box(150, H, 34, ROCK, 0, 0, -67), box(47, H, 100, ROCK, -51.5, 0, 0), box(47, H, 100, ROCK, 51.5, 0, 0));
  g.add(box(150, H - 6, 40, ROCK, 0, 0, -104), box(60, 0.4, 150, ROCK_DARK, 0, 0, 0));
  // The entrance gateway cut through the rock screen, its doorway framed and guarded
  f.add(at(trabeateGate(56, 11, 8, 5, 6.5, { m: ROCK, trim: ROCK_DARK, guardians: true }), 0, 0, 46));
  // High plinth with a frieze of elephants carrying the temple
  f.add(box(40, 8, 62, ROCK_DARK, 0, 0, -12));
  const eles = [];
  aroundRect(40.6, 62.6, 3.2).forEach(([x, z, ry]) => eles.push([x, 0.6, z - 12, 2.2, 3.2, 1.2, ry]));
  f.add(instances(elephantGeo(), eles.map(([x, y, z, sx, sy, sz, ry]) => [x, y, z, sx, sy, sz, ry + Math.PI]), ROCK));
  f.add(box(22, 8, 24, ROCK, 0, 8, 5), box(23.5, 1, 25.5, ROCK_DARK, 0, 16, 5));
  f.add(at(templeDoorway(2.2, 4.4, { m: ROCK, bands: 4, guardianH: 2.2 }), 0, 8, 17));
  f.add(box(20, 8, 20, ROCK, 0, 8, -26), at(vimana(19, 4, 3.4, ROCK, ROCK_DARK), 0, 16, -26));
  // Nandi pavilion on its bridge, two victory pillars and life-size elephants in the court
  f.add(box(4, 1.2, 12, ROCK, 0, 6.8, 24), box(10, 12, 10, ROCK, 0, 0, 33), box(11, 1, 11, ROCK_DARK, 0, 12, 33), at(vimana(8, 2, 2.4, ROCK, ROCK_DARK), 0, 13, 33));
  for (const x of [-15, 15]) {
    f.add(box(3, 2, 3, ROCK_DARK, x, 0, 30), cyl(0.9, 1.1, 15, ROCK, x, 2, 30, 8), box(2.6, 1.6, 2.6, ROCK_DARK, x, 17, 30));
    f.add(at(elephant(ROCK, 1.4), x, 0, 16));
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [0.45, 0.85, 1.05], minElevation: 0.32 };
}
