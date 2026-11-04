import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, hipRoof, tibetanBlock, TIBETAN, inst, unitBox } from '../helpers.js';
import { tibetanDoor } from '../details/doorways.js';
import { mountainRing, heightField, rough, smooth } from '../details/terrain.js';
import { addDetails } from '../details/thiksey-monastery.js';

const ROCK = mat('#a08b6d', 0.95, 0, { flatShading: true });
const OCHRE = mat('#b8562f', 0.85);

// Buildings stacked up a rocky hill, twelve storeys from foot to summit, like the Potala in Lhasa.
export function buildThiksey() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(61);
  g.add(f);
  g.add(box(400, 0.2, 400, mat('#b49e7c', 0.95)), box(30, 0.4, 400, M.river, 120, 0, 0));
  // The bare Ladakh ranges round the Indus valley, snow on the crests (js/details/terrain.js).
  g.add(mountainRing({ inner: 560, outer: 900, h: 250, vary: 80, snow: 215, rock: ['#8e8172', '#9d8b78', '#857565'], cover: '#a89377', steep: 0.82 }));

  const H = 48;
  // The rocky hill the monastery climbs: a rough, outcropping cone, the rock breaking through scree.
  f.add(heightField(150, 150, 150, (x, z) => {
    const r = Math.hypot(x, z), a = Math.atan2(z, x), rr = 62 * (1 + 0.06 * Math.sin(a * 4 + 1));
    return r > rr ? -0.3 : H * Math.pow(1 - r / rr, 1.05) + rough(x, z, 2, 1.1) * smooth(rr, rr * 0.8, r) + 2.5 * Math.pow(Math.abs(Math.sin(a * 7 + r * 0.05)), 4) * (r / rr);
  }, { rock: ['#a08b6d', '#8e7a5f', '#ab9677'], cover: '#b19b78', steep: 0.82, band: 5 }));
  const blocks = [];
  for (let tier = 0; tier < 7; tier++) {
    const y = tier * 6, r = 56 * (1 - y / H) - 4, n = Math.max(3, Math.round(r / 4.5));
    for (let k = 0; k < n; k++) {
      const a = Math.PI * 0.15 + (k / n) * Math.PI * 0.7 + R() * 0.08;
      blocks.push([Math.cos(a) * r, y, Math.sin(a) * r, 6 + R() * 3, 6 + R() * 2, 7, -a + Math.PI / 2]);
    }
  }
  f.add(inst(unitBox(), blocks, TIBETAN.white), inst(unitBox(), blocks.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.3, 0.7, d + 0.3, ry]), TIBETAN.maroon));
  // Summit: the main assembly hall and the red Maitreya temple
  f.add(at(tibetanBlock(18, 9, 14, 2, OCHRE), -4, H - 6, 0), at(hipRoof(20, 16, 3, M.gild), -4, H + 3, 0));
  f.add(at(tibetanBlock(12, 7, 10, 2), 10, H - 8, 6), at(tibetanDoor(1.4, 2.6), 12, H - 8, 11));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.25, 0.3, 1.25], fog: 10 };
}
