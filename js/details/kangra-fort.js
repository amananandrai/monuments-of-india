import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES, archPanel, flag, rng, inst, unitBox } from '../helpers.js';
import { archRing, chhajja, mergeByMaterial } from '../parts/components.js';
import { nagaraTemple } from '../parts/temples.js';
import { towerDetail } from '../parts/forts.js';
import { heightField, smooth, ridged, fbm } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, TRIM, TOP, crest, halfW, ridge, GATES } from '../monuments/kangra-fort.js';

const WHITE = mat('#ece7dc', 0.85);

// Kangra, finer detail. From photographs: at the top of the ridge, past the Darshani Darwaza, a
// court opens before the shells of the Katoch palace, walls of arched openings standing roofless
// since the earthquake of 1905; beside it the ruined Lakshmi Narayan temple, its spire fallen to a
// stump, and the small whitewashed shrine of Ambika Devi, still in worship under its flag; and a
// Jain temple below them. The towers of the Ranjit Singh Darwaza are banded and slit. Dimensions
// follow js/monuments/kangra-fort.js: the crest at crest(x), the gates at GATES.
function top(f) {
  const d = new THREE.Group(), R = rng(9), x0 = 160, y = crest(x0) - 0.4;
  // The palace ruins: three ranges round a court, their walls broken to uneven heights.
  for (const [cx, cz, w, dd] of [[x0 + 40, -6, 50, 14], [x0 + 10, -24, 14, 22], [x0 + 70, 10, 14, 30]]) {
    const h = 9 + R() * 3;
    d.add(box(w, h, dd, STONE, cx, y, cz), box(w + 0.6, 0.5, dd + 0.6, TRIM, cx, y + h, cz));
    for (const a of FACES) {
      const side = Math.abs(Math.sin(a)) > 0.5, len = side ? dd : w, out = (side ? w : dd) / 2, n = Math.max(1, Math.floor(len / 4));
      for (let k = 0; k < n; k++) {
        const lat = -len / 2 + (k + 0.5) * (len / n);
        for (const sy of [0.4, 5]) if (sy + 3.6 < h && R() > 0.15) d.add(onFace(at(archPanel(1.8, 3.2, true, M.recess, 0.05), 0, y + sy, 0), a, out, lat).translateX(cx).translateZ(cz), onFace(at(archRing(1.8, 3.2, true, 0.18, 0.06, TRIM), 0, y + sy, 0), a, out + 0.02, lat).translateX(cx).translateZ(cz));
      }
      // The broken top: stretches of wall standing above the roof line.
      for (let t = -len / 2 + 1; t < len / 2 - 1; t += 2.2) if (R() < 0.45) d.add(onFace(box(2, 0.6 + R() * 2.4, 0.8, STONE, 0, y + h + 0.5, -0.4), a, out, t).translateX(cx).translateZ(cz));
    }
  }
  // The ruined Lakshmi Narayan temple: its sanctum and the stump of its spire.
  d.add(box(10, 2, 10, TRIM, x0 - 20, y, 16), box(7, 6, 7, STONE, x0 - 20, y + 2, 16), box(5.6, 3, 5.6, STONE, x0 - 20, y + 8, 16), box(4, 1.6, 4, TRIM, x0 - 20, y + 11, 16));
  f.add(mergeByMaterial(d));
  // Ambika Devi: a small white shrine with a curved spire and a flag, and the Jain temple below.
  f.add(at(nagaraTemple({ w: 4.5, h: 7.5, m: WHITE, shade: TRIM, plinth: 1, urus: 0, halls: [[6, 4, 3]], apron: 2 }), x0 - 2, y, 18).rotateY(Math.PI / 2));
  f.add(at(flag(7, M.flagRed), x0 + 6, y + 1, 26));
  if (!detail.low) f.add(at(nagaraTemple({ w: 5, h: 8, m: STONE, shade: TRIM, plinth: 1.2, urus: 0, halls: [[6, 4, 3]], apron: 2 }), 60, crest(60) - 0.4, -12).rotateY(-Math.PI / 2));
  // The Ranjit Singh Darwaza's towers (fortGate towers r = 3.6 at 8.1 either side, turned west).
  const gx = GATES[0][0], gy = crest(gx) - 0.6;
  for (const s of [-1, 1]) f.add(at(towerDetail(3.9, 3.6, 12, STONE, TRIM, { n: 7, courses: [0.5], slits: [0.3, 0.75], seg: 12 }), gx - 1.36, gy, 4 + s * 8.12));
  // The path up the ridge's top from gate to gate, its paving stepping with the crest.
  const path = [];
  for (let x = -240; x < 150; x += 3) path.push([x + 1.5, crest(x) - 1, 4, 3.2, 1.05, 4, 0]);
  f.add(inst(unitBox(), path, TRIM));
}

// The Dhauladhar range to the north, its peaks under snow, beyond the hills of the valley.
function dhauladhar() {
  return heightField(4200, 1600, detail.low ? 90 : 150, (x, z) => {
    const t = smooth(-700, -1300, z);
    return t * (420 + 380 * ridged(x, z, { scale: 0.0016, octaves: 5 }) + 120 * fbm(x, z, { scale: 0.003, octaves: 3 })) - 5;
  }, { cz: -1500, rock: ['#6f6a64', '#7c766e', '#666059'], cover: '#4f6a3a', steep: 0.72, snow: 520, band: 40 });
}

// Kangra: the palace at the top, the snows behind, chir pine and mango over the slopes, the town
// of Kangra at the ridge's west end, and the ASI board at the outer gate.
export function addDetails(f, g) {
  top(f);
  g.add(dhauladhar());
  const R = rng(4), houses = [];
  for (let k = 0; k < (detail.low ? 30 : 60); k++) {
    const x = -330 - R() * 200, z = -60 + R() * 120, w = 6 + R() * 5, d = 7 + R() * 5;
    houses.push([x, z, w, d, 1 + Math.floor(R() * 3), R() * 0.3, ridge(x, z) - 0.4]);
  }
  g.add(townHouses(houses, { seed: 3, roof: 'gable' }));
  const spots = scatter(detail.low ? 300 : 600, [-640, 640, -540, 540], { seed: 12, gap: 10 }).filter(([x, z]) => {
    const onTop = Math.abs(z - 4) < halfW(x) * 1.15 && x > -250 && x < 320;
    const y = ridge(x, z);
    return !onTop && y > 2 && !(x < -320 && Math.abs(z) < 70);
  });
  g.add(trees(spots.filter((_, i) => i % 3 === 0).map(([x, z]) => [x, z, null, ridge(x, z) - 0.2]), { kind: 'fir', seed: 5, h: 14 }));
  g.add(trees(spots.filter((_, i) => i % 3 === 1).map(([x, z]) => [x, z, null, ridge(x, z) - 0.2]), { kind: 'mango', seed: 6 }));
  g.add(shrubs(spots.filter((_, i) => i % 3 === 2).map(([x, z]) => [x, z, 1.8, ridge(x, z) - 0.3]), { seed: 7 }));
  // Scrub on the ridge's top between the gates.
  const topSpots = scatter(80, [-240, 150, -40, 48], { seed: 13, gap: 6 }).filter(([x, z]) => Math.abs(z - 4) > 5 && Math.abs(z - 4) < halfW(x) * 0.75 && !GATES.some(([gx]) => Math.abs(x - gx) < 8));
  g.add(shrubs(topSpots.map(([x, z]) => [x, z, 1.5, crest(x) - 0.6]), { seed: 8, dry: true }));
  g.add(asiBoard('Kangra Fort', GATES[0][0] - 20, 18, -Math.PI / 2, { y: crest(GATES[0][0] - 20) - 0.5 }));
}
