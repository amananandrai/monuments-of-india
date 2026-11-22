import * as THREE from 'three';
import { M, mat, box, at, sheet } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, scatter, along, asiBoard, benches } from '../parts/realism.js';
import { detail } from '../detail.js';

const BLOCK = mat('#c4a880', 0.9), ROCK = mat('#a48d6c', 0.95);

// The ground at (x, z): the low sandstone ridge the temple stands on, falling away to the Betwa on
// the south-west (+x, +z) and rising in rocky hills to the north-east, where the quarries are.
function ground(x, z) {
  const flat = smooth(46, 70, Math.hypot(x, z * 0.8)), hills = smooth(140, 420, -x * 0.6 - z * 0.8);
  const river = smooth(150, 230, x * 0.7 + z * 0.7);
  return flat * (2 * fbm(x, z, { scale: 0.02, octaves: 3 }) + hills * (30 + 25 * fbm(x, z, { scale: 0.008, octaves: 4 }))) - river * 4 - 0.25;
}

// Bhojpur, from photographs: the platform stands on a level of bare rock with a scatter of carved
// blocks left where the builders set them down; behind the temple (here -z) the earthen ramp, some
// 100 m long, still slopes up to the height of its walls, overgrown with grass and scrub. Babul,
// neem and ber trees grow round, the Betwa river runs to the south-west, and the ASI's board and a
// path stand before the steps. Dimensions follow js/monuments/bhojeshwar-temple.js.
export function addDetails(f, g, { cz, half, y0 }) {
  g.add(heightField(1400, 1400, detail.low ? 100 : 160, ground, { rock: ['#a48d6c', '#9a8466', '#b09a78'], cover: '#7b8a4c', steep: 0.8, band: 12 }));
  g.add(box(64, 0.3, 74, ROCK, 0, -0.3, 0));
  // The ramp: a long wedge of earth from the ground to the top of the walls behind the temple.
  const top = y0 + 12.4, len = 105, w = 14, z0 = cz - half - 1;
  const rampY = (x, z) => {
    const t = Math.min(1, Math.max(0, 1 - (z0 - z) / len)), crest = top * t;
    return Math.max(0, crest - Math.max(0, Math.abs(x) - w / 2) * 0.75) - 0.2 + 0.4 * fbm(x, z, { scale: 0.08, octaves: 2 }) * t;
  };
  g.add(heightField(w + 2 * top * 1.4, len + 4, detail.low ? 40 : 70, rampY, { cz: z0 - len / 2 + 2, rock: ['#9a7d5c', '#8f7354'], cover: '#7d8a4e', steep: 0.55, band: 6 }));
  g.add(shrubs(scatter(detail.low ? 20 : 40, [-6, 6, z0 - 95, z0 - 10], { seed: 9 }).map(([x, z]) => [x, z, 0, top * (1 - (z0 - z) / len)]), { dry: true }));
  // Blocks of sandstone left lying round the platform, some of them half dressed.
  const blocks = new THREE.Group(), R = scatter(detail.low ? 18 : 34, [-40, 40, -30, 40], { seed: 4, avoid: [[-15, 15, -22, 30]] });
  R.forEach(([x, z], i) => { const b = box(1.4 + (i % 3) * 0.5, 0.7 + (i % 2) * 0.4, 1 + (i % 4) * 0.3, i % 2 ? ROCK : BLOCK, x, -0.05, z); b.rotation.y = i * 0.7; blocks.add(b); });
  g.add(mergeByMaterial(blocks));
  // The Betwa, south-west of the temple.
  g.add(at(sheet(900, 120, M.river, 0, 0, 0), 260, -3.2, 230).rotateY(-Math.PI / 4));
  // Trees, the path to the steps, benches and the board.
  g.add(trees([...scatter(30, [-160, 160, -200, -70], { seed: 11 }), ...scatter(14, [-180, -60, -40, 120], { seed: 12 })], { kind: 'babul', seed: 13 }));
  g.add(trees([[-38, 40], [36, 46], [-46, -10], [44, -20], [-30, 60], [28, 64]], { kind: 'neem', seed: 14 }));
  g.add(box(6, 0.06, 44, M.path, 0, 0, 58));
  g.add(benches(along(3, [-6, 48], [-6, 72])), asiBoard('BHOJESHWAR TEMPLE', 7, 48, -0.4));
}
