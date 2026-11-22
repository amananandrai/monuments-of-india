import * as THREE from 'three';
import { M, V, box, at, onFace, FACES, strut } from '../helpers.js';
import { beltCourse, archSlab, archRing, mergeByMaterial } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { trees, shrubs, lampPosts, boats, launches, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { D, CREAM, RED } from '../monuments/dakshineswar-kali-temple.js';

// Dakshineswar, finer detail. From photographs: every storey of the temple is lined in red, a
// band under each curved cornice and another at the springing of the arches; the second storey
// has three blind arches in each face; the Shiva temples are lined the same way. The courtyard is
// closed on the north, east and south by low ranges of rooms behind an arcade, the gate in the
// south range. Dimensions follow D in js/monuments/dakshineswar-kali-temple.js.
function architecture(S) {
  const d = new THREE.Group(), { PH, W1, H1, W2, H2, SX } = D, y1 = PH + H1, y2 = y1 + 0.9, y3 = y2 + H2;
  d.add(beltCourse(W1, W1, y1 - 0.5, 0.2, 0.07, RED), beltCourse(W1, W1, PH + 5.5, 0.14, 0.05, RED), beltCourse(W1, W1, PH, 0.35, 0.1, RED));
  d.add(beltCourse(W2, W2, y3 - 0.45, 0.18, 0.06, RED), beltCourse(W2, W2, y2 + 0.95, 0.14, 0.05, RED), beltCourse(4.3, 4.3, y3 + 3.45, 0.16, 0.06, RED));
  for (const a of FACES) for (const k of [-1, 0, 1]) {
    d.add(onFace(at(archSlab(1.5, 2.9, true, M.recess, 0.03), 0, y2 + 1.2, 0), a, W2 / 2, k * 2.6));
    d.add(onFace(at(archRing(1.5, 2.9, true, 0.13, 0.05, RED), 0, y2 + 1.2, 0), a, W2 / 2 + 0.03, k * 2.6));
  }
  // The Shiva temples (5.4 square, their walls 4.4 high on the terrace at 1.2).
  for (const z of D.SHIVA) d.add(at(beltCourse(5.4, 5.4, 1.2 + 3.85, 0.14, 0.05, RED), SX, 0, z), at(beltCourse(2.5, 2.5, 1.2 + 4.4 + 3.75, 0.1, 0.04, RED), SX, 0, z));
  mergeByMaterial(d);
  S.add(d);
}

// The ranges of rooms round the courtyard: one storey behind an arcade, a red cornice and a
// parapet. `gap` leaves the gateway open in the south range.
function ranges() {
  const g = new THREE.Group(), h = 4.6, fill = detail.low ? 'none' : 'room';
  const range = (len, n) => {
    const r = new THREE.Group();
    r.add(box(len, h, 5.2, CREAM, 0, 0, -3.4), arcadeSkin(len, h, cellRow(n, len / n, 0, len / n - 1.5, 3.5), 0.8, CREAM, { trim: RED, fill, ring: !detail.low }));
    r.add(box(len + 0.3, 0.25, 6.6, RED, 0, h, -2.7), box(len, 0.7, 6.2, CREAM, 0, h + 0.25, -2.7));
    return r;
  };
  g.add(onFace(range(150, 30), -Math.PI / 2, -47).translateX(4));
  g.add(at(range(106, 22), -6, 0, -73));
  for (const s of [-1, 1]) g.add(at(range(46, 10), -6 + s * 30, 0, 65).rotateY(Math.PI));
  // The gateway between the two halves of the south range.
  g.add(box(14, 7.5, 7, CREAM, -6, 0, 68.5), box(14.6, 0.3, 7.6, RED, -6, 7.5, 68.5), box(5, 5.4, 7.2, M.recess, -6, 0, 68.5));
  return mergeByMaterial(g);
}

// The Vivekananda Setu (1931), upstream: steel trusses with bowed top chords on stone piers,
// road and railway on one deck.
function setu(x0, z, spans, len, deck) {
  const g = new THREE.Group(), S = M.steel, n = detail.low ? 4 : 8, w = 7;
  const top = (t) => deck + 11 + 6 * Math.sin(Math.PI * t);
  for (let k = 0; k < spans; k++) {
    const xa = x0 - k * len;
    g.add(box(5, deck, 20, M.granite, xa, 0, z));
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
      const a = xa - (i / n) * len, b = xa - ((i + 1) / n) * len, ya = top(i / n), yb = top((i + 1) / n), zz = z + s * w;
      g.add(strut(V(a, ya, zz), V(b, yb, zz), 1, S), strut(V(a, deck, zz), V(a, ya, zz), 0.7, S), i % 2 ? strut(V(a, ya, zz), V(b, deck, zz), 0.6, S) : strut(V(a, deck, zz), V(b, yb, zz), 0.6, S));
    }
    for (let i = 0; i <= n; i += 2) g.add(strut(V(xa - (i / n) * len, top(i / n), z - w), V(xa - (i / n) * len, top(i / n), z + w), 0.6, S));
  }
  g.add(box(5, deck, 20, M.granite, x0 - spans * len, 0, z));
  g.add(box(spans * len + 300, 1.2, 2 * w + 3, M.concrete, x0 - (spans * len) / 2, deck - 1.2, z));
  return mergeByMaterial(g);
}

// The setting: the Hooghly with its country boats and a ferry, the bridge upstream, the garden
// round the courtyard with palms along the river wall, mango and ashoka, and the old banyan of
// the Panchavati to the north.
export function addDetails(f, g) {
  const { B, EDGE } = D;
  architecture(f.children[0]);
  g.add(at(ranges(), 0, B, 0));
  g.add(setu(EDGE + 40, -330, 7, 100, B + 9));
  const court = [[-62, 60, -84, 76]];
  g.add(trees([...along(9, [EDGE + 4, -150], [EDGE + 4, -84]), ...along(7, [EDGE + 4, 78], [EDGE + 4, 130])], { kind: 'palm', seed: 4, y: B, h: 12 }));
  g.add(trees([[-28, -112], [14, -128]], { kind: 'banyan', seed: 6, y: B }));
  g.add(trees(scatter(26, [EDGE + 12, 150, -190, 150], { seed: 8, gap: 15, avoid: court.concat([[-40, 40, -140, -96]]) }), { kind: 'mango', seed: 8, y: B }));
  g.add(trees([...along(10, [-18, 82], [-18, 150]), ...along(10, [6, 82], [6, 150])], { kind: 'ashoka', seed: 2, y: B }));
  g.add(trees(scatter(40, [70, 260, -260, 260], { seed: 11, gap: 16 }), { kind: 'neem', seed: 11, y: B }));
  g.add(trees(along(34, [EDGE - 775, -700], [EDGE - 775, 700]), { kind: 'mango', seed: 13, h: 14 }));
  g.add(shrubs([...along(8, [-14, 84], [-14, 140]), ...along(8, [2, 84], [2, 140])].map(([x, z]) => [x, z, 1, B]), { seed: 5, flowers: '#d0306f' }));
  g.add(lampPosts([[-30, 50], [22, 50], [-30, 14], [22, 14], [-30, -22], [-30, -58], [10, -58], [36, -14], [36, 30]], { y: B }));
  g.add(boats([[EDGE - 30, 34, 0.4], [EDGE - 52, -40, 2.6], [EDGE - 110, 90, 1.2], [EDGE - 170, -120, 0.2], [EDGE - 16, -22, 1.6], [EDGE - 260, 20, 2.9]], { y: 0.3, canopy: true }));
  g.add(boats([[EDGE - 12, 22, 1.5], [EDGE - 14, 27, 1.7], [EDGE - 80, 160, 0.6], [EDGE - 320, -220, 1]], { y: 0.3 }));
  g.add(launches([[EDGE - 140, -10, 1.45], [EDGE - 420, 180, 1.7]], { y: 0.3 }));
}
