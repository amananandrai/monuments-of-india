import * as THREE from 'three';

// The box the home view frames: the monument as built. Lawns, plazas, paths, water and other
// ground-level things under 2.5 m, and the trees, lamps and other dressing from js/details/realism.js
// (marked userData.dressing), are left out, so a garden or a square round a monument no longer sets
// the camera's distance. Falls back to the whole focus group if nothing is left.
export function frameBox(focus) {
  focus.updateMatrixWorld(true);
  const built = new THREE.Box3(), b = new THREE.Box3();
  focus.traverse((o) => {
    if (!o.isMesh || !o.visible || o.userData.dressing) return;
    b.setFromObject(o);
    if (b.isEmpty() || b.max.y - Math.max(0, b.min.y) < 2.5) return;
    built.union(b);
  });
  return built.isEmpty() ? new THREE.Box3().setFromObject(focus) : built;
}
