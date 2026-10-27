import * as THREE from 'three';
import { M, V, box, group, strut } from '../helpers.js';

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
  for (const s of [-1, 1]) g.add(box(260, deck - 1.4, 420, M.bank, s * 465, 0, 0));
  g.add(box(3600, 0.4, 3600, M.water, 0, -0.3, 0));
  return { group: g, focus: t, view: [0.45, 0.28, 1.2] };
}
