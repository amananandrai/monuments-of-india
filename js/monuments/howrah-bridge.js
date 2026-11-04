import * as THREE from 'three';
import { M, V, mat, box, at, group, rng, strut, sheet } from '../helpers.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/howrah-bridge.js';

export function buildHowrah() {
  const g = new THREE.Group(), t = new THREE.Group();
  g.add(t);
  const xs = [];
  const seg = (a, b, n) => { for (let i = 0; i < n; i++) xs.push(a + ((b - a) * i) / n); };
  seg(-330, -228.5, 5); seg(-228.5, -80, 7); seg(-80, 80, 8); seg(80, 228.5, 7); seg(228.5, 330, 5); xs.push(330);
  const deck = 10, W = 11, S = M.steel;
  const topY = (x) => {
    const a = Math.abs(x);
    if (a <= 80) return 38;
    if (a <= 228.5) return 38 + ((a - 80) / 148.5) * 44;
    return 82 - ((a - 228.5) / 101.5) * 58;
  };
  for (const z of [-W, W]) {
    xs.forEach((x, i) => {
      const T = V(x, topY(x), z), Bt = V(x, deck, z);
      const tower = Math.abs(Math.abs(x) - 228.5) < 0.5;
      t.add(tower ? strut(V(x, 0, z), V(x, 86, z), 3.4, S) : strut(Bt, T, 1.1, S));
      if (i < xs.length - 1) {
        const x2 = xs[i + 1], T2 = V(x2, topY(x2), z), B2 = V(x2, deck, z);
        t.add(strut(T, T2, 1.9, S), strut(Bt, B2, 1.9, S));
        t.add(i % 2 ? strut(T, B2, 0.9, S) : strut(Bt, T2, 0.9, S));
      }
    });
  }
  xs.forEach((x, i) => {
    const y = topY(x);
    if (y - deck < 14) return;
    t.add(strut(V(x, y, -W), V(x, y, W), 0.9, S));
    if (i < xs.length - 1) {
      const x2 = xs[i + 1], y2 = topY(x2);
      if (y2 - deck >= 14) t.add(strut(V(x, y, -W), V(x2, y2, W), 0.55, S), strut(V(x, y, W), V(x2, y2, -W), 0.55, S));
    }
  });
  for (const x of [-228.5, 228.5]) {
    for (const y of [deck + 22, 60, 75, 86]) t.add(strut(V(x, y, -W), V(x, y, W), 1.8, S));
    t.add(strut(V(x, deck + 22, -W), V(x, 60, W), 1, S), strut(V(x, deck + 22, W), V(x, 60, -W), 1, S));
    g.add(box(18, deck - 1.4, 36, M.concrete, x, -0.3, 0));
  }
  g.add(box(1100, 1.4, 2 * W + 4, M.asphalt, 0, deck - 1.4, 0));
  for (const s of [-1, 1]) g.add(box(900, deck - 1.4, 3000, M.bank, s * 785, 0, 0));
  // The two cities on their banks: Howrah on the west, with its great red-brick railway station of
  // 1905 and its towers, and Kolkata on the east; the old houses close along both banks, and ghat
  // steps down to the water.
  const R = rng(17), bankY = deck - 1.4, houses = [];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 120; i++) {
      const x = s * (350 + R() * 260), z = (R() - 0.5) * 700, w = 8 + R() * 7;
      if (Math.abs(z) < 22 || (s < 0 && Math.abs(x + 470) < 50 && Math.abs(z + 95) < 40)) continue;
      houses.push([x, z, w, 8 + R() * 6, 2 + Math.floor(R() * 4), s < 0 ? Math.PI / 2 : -Math.PI / 2, bankY]);
    }
    for (let k = 0; k < 6; k++) g.add(box(4, bankY - k * 1.4, 80, M.bank, s * (335 - k * 4), 0, s < 0 ? 100 : -100));
  }
  g.add(townHouses(houses, { seed: 17, paint: ['#d9c7a8', '#c98f6a', '#e4d8c2', '#b9a27e', '#d6b48a', '#c7c0b0'] }));
  const st = new THREE.Group(), RB = mat('#a14d35', 0.85), TR = mat('#e8dcc4', 0.8);
  st.add(box(110, 14, 34, RB), box(111, 1, 35, TR, 0, 14));
  for (const x of [-48, -28, -8, 12, 32, 52]) st.add(box(9, 24, 9, RB, x, 0, 13), box(10, 1, 10, TR, x, 24, 13), box(7, 3, 7, TR, x, 25, 13));
  for (let x = -52; x <= 52; x += 4) st.add(box(1.8, 5, 0.2, M.recess, x, 4, 17.05));
  g.add(at(st, -470, bankY, -95).rotateY(Math.PI / 2));
  g.add(sheet(3600, 3600, M.river, 0, 0.1, 0));
  addDetails(t, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: t, view: [0.45, 0.28, 1.2], zoom: 0.8 };
}
