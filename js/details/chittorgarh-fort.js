import * as THREE from 'three';
import { M, mat, box, at, chhatri, onFace, FACES, photo, rng } from '../helpers.js';
import { frieze, beltCourse, pilasters, jharokha, windowFrame, chhajja, archSlab, archRing, mergeByMaterial } from '../parts/components.js';
import { nagaraTemple } from '../parts/temples.js';
import { detail } from '../detail.js';
import { towerDetail } from '../parts/forts.js';
import { trees, shrubs, asiBoard, scatter } from '../parts/realism.js';
import { H, VS, KS, PP, RAMPOL, rimZ, RUINS, TEMPLES } from '../monuments/chittorgarh-fort.js';

// Chittorgarh, finer detail. From photographs of the Vijay Stambh: every storey is carved all
// over, with a frieze under its cornice and pilasters at its corners framing the arched niches, and
// balconies (jharokhas) on the upper storeys; the Kirti Stambh is carved the same way. The towers of
// the Ram Pol are banded and slit, and Padmini's palace has arched windows under an eave. The ruined
// palaces are opened in rows of arches under broken parapets, and three temples stand on the
// plateau.
// Dimensions follow js/monuments/chittorgarh-fort.js: the plateau top at H, the places at VS, KS, PP
// and RAMPOL.
const STONE_ = photo(mat('#c8b28c', 0.9), 'rubble'), RUIN_ = photo(mat('#a8916d', 0.95), 'rubble');
function architecture(f) {
  const d = new THREE.Group();
  // Vijay Stambh at VS: nine storeys 3.6 high from y = 3, w = 10 - 0.25 i.
  const vs = at(new THREE.Group(), VS[0], H, VS[1]);
  for (let i = 0; i < 9; i++) {
    const w = 10 - i * 0.25, y = 3 + i * 3.6;
    vs.add(beltCourse(w, w, y + 2.75, 0.45, 0.06, frieze(STONE_)));
    vs.add(beltCourse(w, w, y, 0.3, 0.1, RUIN_));
    for (const a of FACES) {
      vs.add(onFace(at(pilasters(w - 0.7, 2, 0.5, 2.7, 0.12, STONE_), 0, y + 0.02, 0), a, w / 2));
      if (i >= 5 && i % 2) for (const s of [-1, 1]) vs.add(onFace(at(jharokha(1.1, 1.5, STONE_, { d: 0.6, trim: RUIN_ }), 0, y + 0.9, 0), a, w / 2 + 0.02, s * (w * 0.3)));
    }
  }
  d.add(vs);
  // Kirti Stambh at KS: six storeys of 3.1 from y = 2, w = 6.2 - 0.3 i.
  const ks = at(new THREE.Group(), KS[0], H, KS[1]);
  for (let i = 0; i < 6; i++) {
    const w = 6.2 - i * 0.3, y = 2 + i * 3.1;
    ks.add(beltCourse(w, w, y + 2.3, 0.4, 0.05, frieze(STONE_)));
    for (const a of FACES) ks.add(onFace(at(windowFrame(0.9, 1.6, STONE_), 0, y + 0.4, 0), a, w / 2));
  }
  d.add(ks);
  // The Ram Pol's towers (fortGate towers r = 3 at x = ±9.35, z = 1.7 in the gate's frame).
  for (const s of [-1, 1]) d.add(at(towerDetail(3.24, 3, 12, STONE_, RUIN_, { n: 8, courses: [], slits: [0.3, 0.75] }), RAMPOL + s * 9.35, H, rimZ(RAMPOL) + 1.7));
  // Padmini's palace (10 × 6 × 8 at PP, from H + 0.6): windows on each face and an eave.
  const pp = at(new THREE.Group(), PP[0], H + 0.6, PP[1]);
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? 10 : 8, n = long ? 3 : 2;
    for (let k = 0; k < n; k++) pp.add(onFace(at(windowFrame(1.1, 2.4, STONE_, { shape: 'pointed' }), 0, 1.6, 0), a, (long ? 4 : 5) + 0.01, -len / 2 + (k + 0.5) * (len / n)));
    pp.add(onFace(at(chhajja(len + 0.6, 0.9, 0.35, 0.12, STONE_), 0, 5.7, 0), a, long ? 4 : 5));
  }
  d.add(pp);
  ruins(d);
  mergeByMaterial(d);
  f.add(d);
  // The temples on the plateau: Kumbha Shyam, Meera's beside it, and Kalika Mata (TEMPLES).
  // On desktops only: phones keep the budget for the plateau, the walls and the towers.
  if (!detail.low) for (const [x, z, w, h] of TEMPLES) f.add(at(nagaraTemple({ w, h, m: STONE_, shade: RUIN_, plinth: 1.6, urus: w > 7 ? 4 : 0, halls: [[w * 1.1, w * 0.7, 3]], apron: 3 }), x, H, z));
}

// The ruined palaces (RUINS): each face opened in rows of arched windows a storey apart, the
// lower ones doors; the top edge broken, its parapet surviving in stretches of uneven height;
// on Rana Kumbha's palace, the largest, balconies on its upper storey and two kiosks on the roof,
// one of them standing.
function ruins(d) {
  const R = rng(17);
  RUINS.forEach(([x, z, w, dd, h], i) => {
    const r = at(new THREE.Group(), x, H, z);
    for (const a of FACES) {
      const side = Math.abs(Math.sin(a)) > 0.5, len = side ? dd : w, dist = (side ? w : dd) / 2, n = Math.max(1, Math.floor(len / 3.2));
      for (let y = 0.4; y + 3 < h; y += 4.2) for (let k = 0; k < n; k++) {
        if (R() < 0.15) continue;
        const lat = -len / 2 + (k + 0.5) * (len / n), aw = y < 1 ? 1.6 : 1.2, ah = y < 1 ? 2.8 : 2.2;
        r.add(onFace(at(archSlab(aw, ah, true, M.recess, 0.04), 0, y, 0), a, dist, lat), onFace(at(archRing(aw, ah, true, 0.14, 0.08, RUIN_), 0, y, 0), a, dist, lat));
      }
      // The broken parapet: stretches of wall of uneven height along the top.
      for (let t = -len / 2 + 0.6; t < len / 2 - 0.6; t += 1.2) if (R() < 0.6) r.add(onFace(box(1.1, 0.3 + R() * 1.1, 0.5, RUIN_, 0, h, -0.25), a, dist, t));
      if (i === 0 && !side) for (const s of [-1, 1]) r.add(onFace(at(jharokha(1.8, 2.2, STONE_, { d: 0.9, trim: RUIN_ }), 0, h - 3.6, 0), a, dist + 0.02, s * w * 0.28));
    }
    if (i === 0) r.add(at(chhatri(2, 4.2, STONE_), -w * 0.3, h, 0), box(3.6, 0.5, 3.6, RUIN_, w * 0.3, h, 2), box(0.5, 2.6, 0.5, RUIN_, w * 0.3 - 1.4, h + 0.5, 0.6), box(0.5, 1.6, 0.5, RUIN_, w * 0.3 + 1.4, h + 0.5, 3.4));
    d.add(r);
  });
}

// Chittorgarh: the Kirti Stambh, the older Jain tower of fame, near the east end of the plateau;
// dry scrub and khejri trees over the plateau; and the ASI board.
const STONE = photo(mat('#c8b28c', 0.9), 'rubble'), RUIN = photo(mat('#a8916d', 0.95), 'rubble');
export function addDetails(f, g) {
  architecture(f);
  const ks = KS;
  let y = H;
  f.add(box(9, 2, 9, STONE, ks[0], y, ks[1]));
  y += 2;
  for (let i = 0; i < 6; i++) { const w = 6.2 - i * 0.3; f.add(box(w, 3.1, w, STONE, ks[0], y, ks[1]), box(w + 1, 0.3, w + 1, RUIN, ks[0], y + 2.8, ks[1])); y += 3.1; }
  f.add(at(chhatri(2.4, 4.5, STONE), ks[0], y, ks[1]));
  const plateau = scatter(110, [-300, 300, -55, 55], { seed: 3, gap: 9 }).filter(([x, z]) => (x / 300) ** 4 + (z / 55) ** 4 < 0.8 && Math.hypot(x - VS[0], z - VS[1]) > 12 && Math.hypot(x - PP[0], z - PP[1]) > 26 && Math.hypot(x - KS[0], z - KS[1]) > 10 && !(x > -240 && x < -160 && z > -32 && z < 26) && Math.abs(x - RAMPOL) > 14 && !TEMPLES.some(([tx, tz, tw]) => Math.abs(x - tx) < tw * 2 && Math.abs(z - tz) < tw * 2.6) && !RUINS.some(([rx, rz, rw, rd]) => Math.abs(x - rx) < rw / 2 + 4 && Math.abs(z - rz) < rd / 2 + 4));
  g.add(trees(plateau.slice(0, 20), { kind: 'khejri', seed: 4, y: H, h: 6 }), shrubs(plateau.slice(20).map(([x, z]) => [x, z, 2]), { y: H, dry: true, seed: 5 }));
  g.add(asiBoard('Chittorgarh Fort', -96, 250, 0, { line2: 'HILL FORTS OF RAJASTHAN' }));
}
