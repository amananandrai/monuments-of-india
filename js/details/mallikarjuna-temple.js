import * as THREE from 'three';
import { at, flag, mat, box, onFace } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { dravidaDress, carvedPillar, dwajasthambha, nandiMandapa } from '../parts/temples.js';
import { detail } from '../detail.js';
import { trees, stalls, scatter, along } from '../parts/realism.js';

// Mallikarjuna, finer architecture (desktops; phones are at their budget with the plain masses).
// Dimensions follow js/monuments/mallikarjuna-temple.js: the enclosure 100 × 120 inside walls 9
// high and 3 thick, gopurams in gaps on all four sides; Mallikarjuna's shrine 15.4 square and 8
// high at z = 0, Bhramaramba's 11 square and 6 high at z = -30, each under a gilt cornice and its
// vimana; the mukhamandapa 22 × 18, 6 high, before Mallikarjuna's shrine at z = 20. The shrines and
// the hall stand on moulded bases, ribbed with pilasters under a kapota eave; the hall carries a
// parapet of miniature shrines and opens on a porch of carved pillars; on the axis, the gold
// flagstaff and the Nandi in its mandapa face the shrine; and the walls are coped.
const CREAM = mat('#e9e0cc', 0.85), TRIM = mat('#cbbd9f', 0.88), COPE = mat('#a8946f', 0.9);

function coping(d) {
  const W = 100, D = 120;
  // [angle, distance, runs along the face]
  for (const [a, dist, runs] of [[0, D / 2, [[-50, -10.5], [10.5, 50]]], [Math.PI, D / 2, [[-50, -8.5], [8.5, 50]]], [Math.PI / 2, W / 2, [[-60, -8.5], [8.5, 60]]], [-Math.PI / 2, W / 2, [[-60, -8.5], [8.5, 60]]]]) {
    for (const [p, q] of runs) {
      const l = q - p, mid = (p + q) / 2;
      d.add(onFace(new THREE.Group().add(box(l + 0.01, 0.5, 3.6, COPE, 0, 9, 0)), a, dist, a === Math.PI || a === Math.PI / 2 ? -mid : mid));
    }
  }
}

function architecture(f) {
  const d = new THREE.Group();
  d.add(at(dravidaDress(15.4, 15.4, 8, CREAM, { eaveM: TRIM, hara: false }), 0, 0, 0));
  d.add(at(dravidaDress(11, 11, 6, CREAM, { eaveM: TRIM, hara: false }), 0, 0, -30));
  d.add(at(dravidaDress(22, 18, 6, CREAM, { eaveM: TRIM, haraM: CREAM }), 0, 0, 20));
  // The porch before the hall: seven carved pillars under a slab level with the hall's roof.
  for (let k = 0; k < 7; k++) d.add(at(carvedPillar(5.4, CREAM), -9 + k * 3, 0, 31.6));
  d.add(box(22, 0.6, 4.4, CREAM, 0, 5.4, 31.2), box(22.8, 0.25, 5, TRIM, 0, 6, 31.4));
  coping(d);
  f.add(mergeByMaterial(d));
  f.add(dwajasthambha(0, 37.5, 14));
  f.add(at(nandiMandapa(6, 4, CREAM, TRIM), 0, 0, 45));
}

// Mallikarjuna at Srisailam, in the Nallamala forest: flower stalls outside the east gate, saffron
// flags on the walls, and the forest of the hills coming down to the temple town.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  if (!detail.low) architecture(f);
  g.add(stalls([...along(6, [-24, 74], [-24, 96]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(6, [24, 74], [24, 96]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  for (const [x, z] of [[-50, -60], [50, -60], [-50, 60], [50, 60]]) f.add(at(flag(6, SAFFRON), x, 9.5, z));
  g.add(trees(scatter(60, [-108, 108, -108, 108], { seed: 5, gap: 12 }).filter(([x, z]) => Math.abs(x) > 62 || Math.abs(z) > 72), { kind: 'mango', seed: 5 }));
}
