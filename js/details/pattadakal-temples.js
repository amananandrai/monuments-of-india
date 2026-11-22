import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES, sheet } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial } from '../parts/components.js';
import { figureFrieze, kuduGeo, instances } from '../parts/sculpture.js';
import { heightField, ridged, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, lampPosts, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// Pattadakal's sandstone, golden-brown and weathered to grey in streaks.
export const STONE = mat('#b49a74', 0.92);
export const SHADE = mat('#8a7457', 0.94);

// Where each temple stands, [x, y, z]: all face east (+z), north is -x.
export const TEMPLES = {
  virupaksha: [0, 0, 0], mallikarjuna: [-30, 0, -2], sangameshvara: [-58, 0, -24], galaganatha: [-56, 0, 16],
  kashi: [-78, 0, -4], jambulinga: [-84, 0, 22], kadasiddheshvara: [-98, 0, 16], papanatha: [44, 0, -6],
};

// Pattadakal, finer detail. From photographs: the walls of the Virupaksha and Mallikarjuna are
// divided by pilasters (dravidaDress), and between them stand images in niches: Shiva in his
// forms, Vishnu, Durga; the storeys of their vimanas are lined with kudus; and the base of the
// Virupaksha's hall carries a frieze of elephants, dancers and scenes from the epics.
function architecture(f) {
  const d = new THREE.Group(), kudus = [];
  for (const [key, w, h, tiers] of [['virupaksha', 10, 7.4, 3], ['mallikarjuna', 8.6, 6.6, 3]]) {
    const [cx, , cz] = TEMPLES[key];
    for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) for (const lat of [-w * 0.27, w * 0.27]) {
      const o = onFace(at(templeNiche(1, 2.4, STONE, { figure: idol(2.1, STONE) }), 0, 1.6, 0), a, w / 2 + 0.14, lat);
      o.position.x += cx;
      o.position.z += cz;
      d.add(o);
    }
    let y = h + 0.3, tw = w - 1;
    for (let i = 0; i < tiers - 1; i++) {
      const th = w * 0.24, n = Math.floor((tw * 0.6) / 1.1);
      for (const a of FACES) for (let k = 0; k < n; k++) {
        const lat = -tw * 0.3 + (k + 0.5) * ((tw * 0.6) / n), dist = (tw + 0.8) / 2 + 0.05;
        kudus.push([cx + Math.sin(a) * dist + Math.cos(a) * lat, y + th * 0.86, cz + Math.cos(a) * dist - Math.sin(a) * lat, 0.65, 0.65, 0.65, a]);
      }
      y += th;
      tw = (w - 1) * (1 - (0.45 * (i + 1)) / tiers);
    }
  }
  d.add(instances(kuduGeo(), kudus, STONE));
  f.add(mergeByMaterial(d));
  for (const s of [-1, 1]) {
    const fr = onFace(at(figureFrieze(14, 0.55, STONE, { pitch: detail.low ? 1.4 : 0.7, kinds: ['elephant', 'dancer', 'standing'], proud: 0.06 }), 0, 1.3, 0), s * Math.PI / 2, 9.01, 15);
    f.add(fr);
  }
}

// The low sandstone hills west of the village, behind the temples.
function hillY(x, z) {
  const t = smooth(-220, -480, z);
  return t * (22 + 30 * ridged(x, z, { scale: 0.004, octaves: 4 })) + 0.4 * fbm(x, z, { scale: 0.05, octaves: 2 }) - 0.35;
}

// The site: lawns and paths between the temples, the Malaprabha beyond them to the east with its
// sandy bank, the hills to the west, tamarind and neem round the enclosure, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(heightField(1200, 900, detail.low ? 100 : 150, hillY, { cz: -200, rock: ['#a58d6a', '#9a8463', '#8c785c'], cover: '#a39a6c', steep: 0.75 }));
  g.add(box(190, 0.08, 120, mat('#78944f', 0.95), -25, 0, 0));
  // Paths from the gate on the east between the temples.
  g.add(box(150, 0.06, 5, M.path, -30, 0.08, 48), box(5, 0.06, 40, M.path, 0, 0.08, 62), box(4, 0.06, 40, M.path, -30, 0.08, 26), box(4, 0.06, 40, M.path, -56, 0.08, 34), box(4, 0.06, 30, M.path, 44, 0.08, 30));
  // The river and its sandy bank.
  g.add(box(500, 0.1, 30, mat('#cdb88f', 0.95), 0, -0.1, 95), sheet(600, 220, M.river, 0, -0.05, 220));
  g.add(trees([...along(9, [-120, 70], [80, 70]), ...scatter(10, [60, 120, -60, 60], { seed: 3, gap: 12 })], { kind: 'tamarind', seed: 4 }));
  g.add(trees([...scatter(detail.low ? 8 : 16, [-130, 90, -110, -70], { seed: 5, gap: 12 })], { kind: 'neem', seed: 6 }));
  g.add(trees(along(5, [-120, 84], [60, 84]), { kind: 'palm', seed: 2 }));
  g.add(shrubs([...along(8, [-110, 44], [30, 44]), ...along(6, [-110, 52], [-40, 52])], { size: 1 }));
  g.add(lampPosts(along(6, [-80, 51], [20, 51])));
  g.add(asiBoard('Group of Monuments, Pattadakal', 8, 58, -0.3, { line2: 'WORLD HERITAGE SITE' }));
}
