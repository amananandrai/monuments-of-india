import * as THREE from 'three';

// The five sculpted figures that take longest to mesh (half a second to a second each on a laptop):
// Patel (Statue of Unity), Shiva (Nageshwar), Thiruvalluvar (Vivekananda Rock), the horse (the
// Gateway of India and others) and Bahubali (Gommateshwara). Each is meshed once and then cached
// (sculpt() in js/sdf.js), so meshing one ahead of time makes its monument's first click fast.
//
// Meshing a figure blocks the page while it runs, so it is done only when that cannot be felt: on
// larger screens (phones skip it), while the map is showing (nothing animates there), after the
// visitor has been still for two seconds, one figure at a time, and not while a monument loads.
const SLOW = [
  ['patel', () => import('./details/figures.js').then((m) => m.patelBody)],
  ['shiva', () => import('./details/figures.js').then((m) => m.shivaBody)],
  ['thiruvalluvar', () => import('./details/figures.js').then((m) => m.thiruvalluvarBody)],
  ['horse', () => import('./details/animals.js').then((m) => m.horse)],
  ['bahubali', () => import('./details/figures.js').then((m) => m.bahubaliBody)],
];

// canWarm(): whether the page is free for a while (the map showing, nothing loading).
export function warmSculpts(canWarm) {
  if (typeof requestIdleCallback !== 'function') return;
  const scratch = new THREE.MeshStandardMaterial();
  let lastInput = performance.now(), next = 0;
  for (const e of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(e, () => { lastInput = performance.now(); }, { passive: true });
  const step = async (deadline) => {
    if (next >= SLOW.length) return;
    if (!canWarm() || performance.now() - lastInput < 2000 || deadline.timeRemaining() < 40) {
      setTimeout(() => requestIdleCallback(step), 1000);
      return;
    }
    const [, load] = SLOW[next++];
    try { (await load())(scratch); } catch (e) { /* not needed now; built on first use instead */ }
    setTimeout(() => requestIdleCallback(step), 500);
  };
  setTimeout(() => requestIdleCallback(step), 3000);
}
