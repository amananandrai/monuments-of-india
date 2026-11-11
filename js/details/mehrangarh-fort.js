import * as THREE from 'three';
import { box, at, flag, mat, rng, onFace, FACES, photo } from '../helpers.js';
import { jharokha, chhajja, beltCourse, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { shrubs } from './realism.js';
import { H, rock, bastions } from '../monuments/mehrangarh-fort.js';
import { detail } from '../detail.js';

// Mehrangarh, finer detail. The bastions rising from the rock are banded and slit; the palace
// ranges at the north end are hung with tiers of jharokhas under curved roofs on every outer face,
// over a deep eave on the Phool Mahal front. Dimensions follow js/monuments/mehrangarh-fort.js: the
// rock's top at H, the walls 24 to 32 m high from it, the bastions 8.5 in radius from H - 14 rising 48 m;
// the palace ranges [x, z, w, h, d] below.
const SAND = photo(mat('#b9774f', 0.9), 'rubble'), SAND_LIGHT = photo(mat('#cf9a6e', 0.85), 'rubble');
const PALACES = [[130, 16, 72, 40, 22], [146, -12, 52, 34, 24], [166, 0, 14, 36, 50]];
function architecture(f) {
  const d = new THREE.Group();
  for (const [x, z] of bastions()) d.add(at(towerDetail(8.5, 8.5, 48, SAND, SAND_LIGHT, { n: 12, courses: [0.5, 0.82], slits: [0.55, 0.7, 0.9] }), x, H - 14, z));
  // On each palace range, the outer faces above the walls (from H + 22) carry rows of jharokhas,
  // two tiers on desktops and one on phones, with an eave over them and a band below.
  for (const [x, z, w, h, dd] of PALACES) {
    for (const a of FACES) {
      const along = Math.abs(Math.sin(a)) > 0.5 ? dd : w, out = (Math.abs(Math.sin(a)) > 0.5 ? w : dd) / 2;
      const n = Math.max(2, Math.floor(along / 5)), rows = detail.low ? 1 : 2;
      for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
        const o = onFace(at(jharokha(2.2, 2.8, SAND_LIGHT, { d: 1, trim: SAND }), 0, H + h - 13 + r * 5, 0), a, out + 0.02, -along / 2 + (k + 0.5) * (along / n));
        o.position.x += x; o.position.z += z;
        d.add(o);
      }
      const e = onFace(at(chhajja(along + 0.8, 1.4, 0.5, 0.16, SAND), 0, H + h - 3.4, 0), a, out);
      e.position.x += x; e.position.z += z;
      d.add(e);
    }
    d.add(beltCourse(w, dd, H + h - 15, 0.5, 0.2, SAND).translateX(x).translateZ(z));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Mehrangarh above Jodhpur: the rhyolite scrub of the Rao Jodha desert park on the slopes, and the
// five-coloured flag of Marwar over the palace.
const FLAG = mat('#d9342b', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  architecture(f);
  const R = rng(4), slope = [];
  for (let i = 0; i < 200 && slope.length < 90; i++) {
    const x = (R() - 0.5) * 820, z = (R() - 0.5) * 300, y = rock(x, z);
    if (y < 3 || y > H - 20) continue;
    slope.push([x, z, 2.6, y - 0.5]);
  }
  g.add(shrubs(slope, { dry: true, seed: 5 }));
  f.add(at(flag(10, FLAG), 146, H + 34.8, -12));
}
