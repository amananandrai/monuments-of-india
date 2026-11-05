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

// The colour of the land round a site, where the site's own ground is natural: a lawn, a field, a
// forested or rocky hill. Seen from outside, along 32 lines towards the centre, the first ground
// each line meets near ground level (below 8 m: not a mountain ridge, which hides where it meets the
// land anyway) is the site's outer edge. Where most of that edge is grass or shaped terrain, the
// open land beyond takes its colour, so a green hill or a meadow does not end on a sandy plain.
// Where most of it is paving, sand, road or water, there is no colour to match: null, and the
// land keeps the theme's own colour. Run before the seas are extended.
const LINES = 32;
export function siteLand(r) {
  r.group.updateMatrixWorld(true);
  const inFocus = new Set();
  if (r.focus !== r.group) r.focus.traverse((o) => inFocus.add(o));
  const meshes = [], all = new THREE.Box3();
  r.group.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.visible || inFocus.has(o) || !o.material || Array.isArray(o.material)) return;
    if (o.material.userData.surface === 'water') return;
    const b = new THREE.Box3().setFromObject(o);
    if (b.min.y > 2 || Math.max(b.max.x - b.min.x, b.max.z - b.min.z) < 30) return;
    meshes.push({ o, b, grid: o.geometry.attributes.color ? colourGrid(o) : null });
    all.union(b);
  });
  if (!meshes.length) return null;
  const c = all.getCenter(new THREE.Vector3()), R = Math.hypot(all.max.x - c.x, all.max.z - c.z);
  const rc = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), p = new THREE.Vector3();
  const sum = new THREE.Color(0, 0, 0), col = new THREE.Color();
  let natural = 0, seen = 0;
  for (let k = 0; k < LINES; k++) {
    const a = (k / LINES) * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
    for (let t = 1; t > 0.05; t -= 0.01) {
      p.set(c.x + dx * R * t, 0, c.z + dz * R * t);
      let top = null;
      for (const m of meshes) {
        if (p.x < m.b.min.x || p.x > m.b.max.x || p.z < m.b.min.z || p.z > m.b.max.z) continue;
        if (m.grid) {
          const g = m.grid.at(p.x, p.z);
          if (g && (!top || g.y > top.y)) top = { y: g.y, colour: g.colour, natural: true };
        } else {
          rc.set(p.clone().setY(m.b.max.y + 1), down);
          const hit = rc.intersectObject(m.o, false)[0];
          if (hit && (!top || hit.point.y > top.y)) {
            const hsl = m.o.material.color.getHSL({});
            top = { y: hit.point.y, colour: m.o.material.color, natural: hsl.h > 0.17 && hsl.h < 0.45 && hsl.s > 0.12 };
          }
        }
      }
      if (!top) continue;
      if (top.y > 8) continue;
      seen++;
      if (top.natural) { natural++; sum.add(col.copy(top.colour)); }
      break;
    }
  }
  if (!seen || natural / seen < 0.5) return null;
  return sum.multiplyScalar(1 / natural);
}

// Height and colour of a vertex-coloured surface (terrain, snowy peaks) on a coarse grid in world
// x and z, the highest vertex in each cell: a lookup, where a ray against 100k triangles is slow.
function colourGrid(o) {
  const pos = o.geometry.attributes.position, colr = o.geometry.attributes.color, N = 64;
  const b = new THREE.Box3().setFromObject(o), v = new THREE.Vector3();
  const w = (b.max.x - b.min.x) / N || 1, d = (b.max.z - b.min.z) / N || 1;
  const ys = new Float32Array(N * N).fill(-Infinity), cs = new Float32Array(N * N * 3);
  const base = o.material.color;
  for (let k = 0; k < pos.count; k++) {
    v.fromBufferAttribute(pos, k).applyMatrix4(o.matrixWorld);
    const i = Math.min(N - 1, Math.floor((v.x - b.min.x) / w)), j = Math.min(N - 1, Math.floor((v.z - b.min.z) / d)), n = j * N + i;
    if (v.y <= ys[n]) continue;
    ys[n] = v.y;
    cs[n * 3] = colr.getX(k) * base.r; cs[n * 3 + 1] = colr.getY(k) * base.g; cs[n * 3 + 2] = colr.getZ(k) * base.b;
  }
  const out = { y: 0, colour: new THREE.Color() };
  return {
    at(x, z) {
      const i = Math.floor((x - b.min.x) / w), j = Math.floor((z - b.min.z) / d);
      if (i < 0 || j < 0 || i >= N || j >= N) return null;
      const n = j * N + i;
      if (ys[n] === -Infinity) return null;
      out.y = ys[n];
      out.colour.setRGB(cs[n * 3], cs[n * 3 + 1], cs[n * 3 + 2]);
      return out;
    },
  };
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
