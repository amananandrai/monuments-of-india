import * as THREE from 'three';

// The sculpted figures that take longest to mesh, several seconds each on a slow machine: Patel
// (Statue of Unity), Shiva (Nageshwar), Thiruvalluvar (Vivekananda Rock), Bahubali (Gommateshwara),
// Netaji (India Gate), Shivaji and his prancing horse (the Gateway of India) and the standing
// horse (Konark and others). Each is meshed once and then cached (sculpt() in js/sdf.js), so
// meshing one ahead of time makes its monument's first click fast.
//
// Meshing a figure blocks the page while it runs, so it is done only when that cannot be felt: on
// larger screens (phones skip it), while the map is showing (nothing animates there), after the
// visitor has been still for two seconds, one figure at a time, and not while a monument loads.
const SLOW = [
  ['patel', () => import('./parts/figures.js').then((m) => m.patelBody)],
  ['shiva', () => import('./parts/figures.js').then((m) => m.shivaBody)],
  ['thiruvalluvar', () => import('./parts/figures.js').then((m) => m.thiruvalluvarBody)],
  ['bahubali', () => import('./parts/figures.js').then((m) => m.bahubaliBody)],
  ['netaji', () => import('./parts/figures.js').then((m) => m.netajiBody)],
  ['shivaji', () => import('./parts/figures.js').then((m) => m.shivajiBody)],
  ['horse-prance', () => import('./parts/animals.js').then((m) => (mat) => m.horse(mat, { prance: true }))],
  ['horse', () => import('./parts/animals.js').then((m) => m.horse)],
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
