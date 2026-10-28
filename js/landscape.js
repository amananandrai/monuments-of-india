import * as THREE from 'three';
import { M } from './helpers.js';
import { attachSurface } from './surface.js';

// Each monument stands on its own lawns, pavements and sand, laid as flat boxes, and some face a
// sea or a river laid as a flat sheet. Against the open land these end in straight edges, so the
// building looks set on a square block. This pass lets a seascape or a long river run on to the
// horizon, and fades every other open edge into the land around it. An edge that meets another
// piece of ground, water or the building itself stays as it is.

// A sea or river runs on past the end of the fog: at least 6 km, more for a big monument. It is
// split into tiles, at most 60 a side, since a few huge triangles lose depth precision and flicker.
const TILES = 60;
const EDGES = [['x', 'min'], ['x', 'max'], ['z', 'min'], ['z', 'max']];

// Is most of the strip just outside this edge covered by something else on the ground?
function covered(b, axis, side, others) {
  const out = side === 'min' ? b.min[axis] - 1.5 : b.max[axis] + 1.5;
  const along = axis === 'x' ? 'z' : 'x';
  let hits = 0;
  for (let k = 1; k <= 9; k++) {
    const t = b.min[along] + (b.max[along] - b.min[along]) * k / 10;
    const px = axis === 'x' ? out : t, pz = axis === 'x' ? t : out;
    if (others.some((o) => px >= o.min.x && px <= o.max.x && pz >= o.min.z && pz <= o.max.z)) hits++;
  }
  return hits > 2;
}

// Which edges of a sea or river sheet run on: a sea on every side that faces away from the
// monument, a river at both ends when it is clearly longer than it is wide.
function runsOn(m, b, axis, side) {
  if (m === M.sea) return side === 'min' ? b.min[axis] < 0 : b.max[axis] > 0;
  if (m !== M.river) return false;
  const w = b.max.x - b.min.x, d = b.max.z - b.min.z;
  return axis === 'x' ? w > d * 1.3 : d > w * 1.3;
}

export function blendIntoLand(r) {
  r.group.updateMatrixWorld(true);
  const FAR = Math.max(6000, new THREE.Box3().setFromObject(r.focus).getSize(new THREE.Vector3()).length() * 15);
  const inFocus = new Set();
  if (r.focus !== r.group) r.focus.traverse((o) => inFocus.add(o));
  const onGround = [], candidates = [];
  r.group.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const b = new THREE.Box3().setFromObject(o);
    if (b.min.y > 0.6 || b.max.y < -0.5) return;
    onGround.push(b);
    const q = o.getWorldQuaternion(new THREE.Quaternion());
    if (o.isInstancedMesh || inFocus.has(o) || Math.abs(q.w) < 0.9999) return;
    const sheet = o.geometry.type === 'PlaneGeometry' && o.material.userData.surface === 'water';
    const slab = o.geometry.type === 'BoxGeometry' && b.max.y - b.min.y <= 0.8 && b.min.y < 0.35 && o.material.userData.surface !== 'water';
    if ((sheet || slab) && Math.max(b.max.x - b.min.x, b.max.z - b.min.z) >= 40) candidates.push({ o, b, sheet });
  });
  for (const { o, b, sheet } of candidates) {
    const others = onGround.filter((x) => x !== b), size = b.getSize(new THREE.Vector3());
    if (sheet) {
      const run = EDGES.map(([a, s]) => runsOn(o.material, b, a, s) && !covered(b, a, s, others));
      if (run.some(Boolean)) {
        const nb = b.clone();
        EDGES.forEach(([a, s], i) => { if (run[i]) nb[s][a] = s === 'min' ? -FAR : FAR; });
        o.geometry.dispose();
        const w = nb.max.x - nb.min.x, d = nb.max.z - nb.min.z;
        const tile = Math.max(200, Math.max(w, d) / TILES);
        o.geometry = new THREE.PlaneGeometry(w, d, Math.ceil(w / tile), Math.ceil(d / tile)).rotateX(-Math.PI / 2);
        o.position.copy(o.parent.worldToLocal(new THREE.Vector3((nb.min.x + nb.max.x) / 2, b.max.y, (nb.min.z + nb.max.z) / 2)));
        b.copy(nb);
      }
    }
    // Fade margins for the edges left open, from the piece's own size across that edge: 15% for
    // ground, up to 400 m; 4% for water, so a shore stays close to the quay or the ghat beside it.
    const share = sheet ? 0.04 : 0.15;
    const fade = EDGES.map(([a, s]) => (Math.abs(b[s][a]) >= FAR || size[a] < 8 || covered(b, a, s, others) ? 0 : Math.min(size[a] * share, 400)));
    if (!fade.some(Boolean)) continue;
    const m = attachSurface(o.material.clone());
    m.userData.patch = { bounds: [b.min.x, b.min.z, b.max.x, b.max.z], fade };
    o.material = m;
  }
}
