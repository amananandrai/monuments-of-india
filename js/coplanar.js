import * as THREE from 'three';
import { attachSurface } from './surface.js';

// Many models stack boxes whose faces land in exactly the same plane (a marble band flush with
// the top of a wall, two water channels crossing, the slices of a temple spire). Those faces
// z-fight and flicker as the camera moves. This pass finds boxes, cylinders and extruded shapes
// (star-shaped platforms, arched panels) with coincident, overlapping faces and gives each one in
// a clash a "layer" different from every piece it clashes with (larger pieces stay at layer 0).
// Layered pieces get a material with a depth (polygon) offset, so one face consistently wins. The
// geometry itself is not changed.
const AXES = ['x', 'y', 'z'];
const tmpQ = new THREE.Quaternion();

// Which world axis each local axis of an object points along, or null if it is not axis-aligned.
function axisMap(o) {
  o.getWorldQuaternion(tmpQ);
  return [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)].map((v) => {
    v.applyQuaternion(tmpQ);
    const a = [Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)], k = a.indexOf(Math.max(...a));
    return a[k] > 0.999 ? k : null;
  });
}

// The local axes on which an extruded shape has a flat cap: some of its vertices lie on the bounding
// box's face there with their normals pointing straight out of it.
function capAxes(geo) {
  if (!geo.boundingBox) geo.computeBoundingBox();
  const p = geo.attributes.position, n = geo.attributes.normal, b = geo.boundingBox, axes = [];
  for (let k = 0; k < 3; k++) {
    const ax = AXES[k];
    let caps = 0;
    for (let i = 0; i < p.count && caps < 3; i++) {
      const v = p.getComponent(i, k), nk = n.getComponent(i, k);
      if ((Math.abs(v - b.min[ax]) < 1e-4 && nk < -0.99) || (Math.abs(v - b.max[ax]) < 1e-4 && nk > 0.99)) caps++;
    }
    if (caps >= 3) axes.push(k);
  }
  return axes;
}

function collect(root) {
  const items = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.visible || !o.material.isMeshStandardMaterial) return;
    const type = o.geometry.type;
    if (type !== 'BoxGeometry' && type !== 'CylinderGeometry' && type !== 'ExtrudeGeometry') return;
    const map = axisMap(o);
    // Boxes can be tested on all three axes, extrusions on the axes where they have flat caps, and
    // cylinders only on their flat top and bottom.
    const faces = [false, false, false];
    if (type === 'BoxGeometry') map.forEach((k) => { if (k !== null) faces[k] = true; });
    else if (type === 'ExtrudeGeometry') capAxes(o.geometry).forEach((k) => { if (map[k] !== null) faces[map[k]] = true; });
    else if (map[1] === 1) faces[1] = true;
    if (!faces.some(Boolean)) return;
    const box = new THREE.Box3().setFromObject(o), size = box.getSize(new THREE.Vector3());
    items.push({ o, box, faces, vol: size.x * size.y * size.z, links: [], layer: -1 });
  });
  return items;
}

function clashes(a, b, tol) {
  for (let k = 0; k < 3; k++) {
    if (!a.faces[k] || !b.faces[k]) continue;
    const [p, q] = AXES.filter((_, n) => n !== k);
    const overP = Math.min(a.box.max[p], b.box.max[p]) - Math.max(a.box.min[p], b.box.min[p]);
    const overQ = Math.min(a.box.max[q], b.box.max[q]) - Math.max(a.box.min[q], b.box.min[q]);
    if (overP <= tol || overQ <= tol) continue;
    const ax = AXES[k];
    if (Math.abs(a.box.max[ax] - b.box.max[ax]) < tol) return true;
    // Bottoms resting on the ground are never seen, since the camera stays above it. Offsetting a
    // lawn for its hidden bottom would pull its top in front of water a few centimetres higher.
    const hidden = k === 1 && Math.max(a.box.min.y, b.box.min.y) < tol;
    if (!hidden && Math.abs(a.box.min[ax] - b.box.min[ax]) < tol) return true;
  }
  return false;
}

const layered = new Map();
function layeredMaterial(m, layer) {
  const key = m.uuid + ':' + layer;
  if (!layered.has(key)) {
    const c = attachSurface(m.clone());
    c.polygonOffset = true;
    c.polygonOffsetFactor = -layer;
    c.polygonOffsetUnits = -4 * layer;
    layered.set(key, c);
  }
  return layered.get(key);
}

export function separateCoplanar(root, tol) {
  root.updateMatrixWorld(true);
  const items = collect(root);
  // Sweep along x to find clashing pairs without testing every pair.
  const byX = [...items].sort((a, b) => a.box.min.x - b.box.min.x);
  for (let i = 0; i < byX.length; i++) {
    const a = byX[i];
    for (let j = i + 1; j < byX.length; j++) {
      const b = byX[j];
      if (b.box.min.x > a.box.max.x + tol) break;
      if (clashes(a, b, tol)) { a.links.push(b); b.links.push(a); }
    }
  }
  // Give each clashing piece the lowest layer not taken by a clashing neighbour, largest first.
  let moved = 0;
  for (const it of items.filter((x) => x.links.length).sort((a, b) => b.vol - a.vol)) {
    const taken = new Set(it.links.map((n) => n.layer));
    let layer = 0;
    while (taken.has(layer)) layer++;
    it.layer = layer;
    if (layer) { it.o.material = layeredMaterial(it.o.material, layer); moved++; }
  }
  return moved;
}

// The same trouble in parts the pass above cannot see: merged meshes (one per material, from
// mergeByMaterial), instanced parts, and parts turned off the axes. Their triangles are grouped by
// the plane they lie in; where two meshes of different materials have triangles in one plane,
// facing the same way and overlapping, the smaller mesh (by area) is drawn a layer in front of the
// larger, as above (whether or not either was already offset): a band, an inlay or a panel wins over the wall it is laid on. Undersides are
// skipped (the camera stays above the ground), as are trees and meshes over `maxTris` triangles.
// Returns the number of meshes moved.
export function separateMerged(root, { maxTris = 120000 } = {}) {
  root.updateMatrixWorld(true);
  const meshes = [], skip = new Set();
  root.traverse((o) => { if (o.userData.trees) o.traverse((c) => skip.add(c)); });
  root.traverse((o) => {
    if (!o.isMesh || !o.visible || skip.has(o) || Array.isArray(o.material) || !o.material.isMeshStandardMaterial) return;
    if (o.material.transparent && o.material.opacity < 0.9) return;
    const g = o.geometry, per = (g.index ? g.index.count : g.attributes.position.count) / 3, n = per * (o.isInstancedMesh ? o.count : 1);
    // Instanced sculpture (figures, kudus, animals) is never flat enough to fight; instanced boxes are.
    if (o.isInstancedMesh && per > 64) return;
    if (n <= maxTris) meshes.push({ o, area: 0, layer: o.material.polygonOffset ? -o.material.polygonOffsetFactor : 0 });
  });
  const buckets = new Map(), A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), E = new THREE.Vector3(), W = new THREE.Matrix4(), I = new THREE.Matrix4();
  meshes.forEach((m, mi) => {
    const { o } = m, g = o.geometry, p = g.attributes.position, idx = g.index, nt = (idx ? idx.count : p.count) / 3;
    for (let k = 0; k < (o.isInstancedMesh ? o.count : 1); k++) {
      W.copy(o.matrixWorld);
      if (o.isInstancedMesh) { o.getMatrixAt(k, I); W.multiply(I); }
      for (let t = 0; t < nt; t++) {
        A.fromBufferAttribute(p, idx ? idx.getX(t * 3) : t * 3).applyMatrix4(W);
        B.fromBufferAttribute(p, idx ? idx.getX(t * 3 + 1) : t * 3 + 1).applyMatrix4(W);
        C.fromBufferAttribute(p, idx ? idx.getX(t * 3 + 2) : t * 3 + 2).applyMatrix4(W);
        N.subVectors(C, B).cross(E.subVectors(A, B));
        const area = N.length() / 2;
        if (area < 0.01) continue;
        m.area += area;
        N.normalize();
        if (N.y < -0.5) continue;
        // The plane's key: its normal to 1/200 and its distance to 4 mm, packed in one number.
        const d = N.dot(A), nk = ((Math.round(N.x * 200) + 200) * 401 + Math.round(N.y * 200) + 200) * 401 + Math.round(N.z * 200) + 200;
        let byD = buckets.get(nk);
        if (!byD) buckets.set(nk, (byD = new Map()));
        const dq = Math.round(d / 0.004);
        if (!byD.has(dq)) byD.set(dq, []);
        byD.get(dq).push([mi, d, Math.min(A.x, B.x, C.x), Math.max(A.x, B.x, C.x), Math.min(A.y, B.y, C.y), Math.max(A.y, B.y, C.y), Math.min(A.z, B.z, C.z), Math.max(A.z, B.z, C.z)]);
      }
    }
  });
  // Pairs of meshes with overlapping faces in one plane (a bucket and the next one up, so a plane on
  // a bucket's edge is not missed).
  const pairs = new Map();
  for (const byD of buckets.values()) for (const [dq, list] of byD) {
    const next = byD.get(dq + 1) || [];
    if (list.length + next.length < 2) continue;
    const all = list.map((t) => [t, 0]).concat(next.map((t) => [t, 1])).sort((x, y) => x[0][2] - y[0][2]);
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const [a, sa] = all[i], [b, sb] = all[j];
      if (b[2] > a[3] + 1e-4) break;
      if ((sa && sb) || a[0] === b[0] || Math.abs(a[1] - b[1]) > 0.004) continue;
      const ma = meshes[a[0]], mb = meshes[b[0]];
      if (ma.o.material === mb.o.material) continue;
      const ox = Math.min(a[3], b[3]) - Math.max(a[2], b[2]), oy = Math.min(a[5], b[5]) - Math.max(a[4], b[4]), oz = Math.min(a[7], b[7]) - Math.max(a[6], b[6]);
      if (ox < -1e-4 || oy < -1e-4 || oz < -1e-4) continue;
      const [p, q] = [Math.max(ox, 0), Math.max(oy, 0), Math.max(oz, 0)].sort((u, v) => v - u);
      if (p * q < 0.01) continue;
      const k2 = a[0] < b[0] ? `${a[0]},${b[0]}` : `${b[0]},${a[0]}`;
      pairs.set(k2, (pairs.get(k2) || 0) + p * q);
    }
  }
  // The smaller of each pair goes a layer in front of the larger, whatever layers they started on
  // (a piece already offset can be caught up by one moved here). Sizes order the pieces, so the
  // constraints have no cycles; repeated until they settle.
  let moved = 0;
  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    for (const k2 of pairs.keys()) {
      const [i, j] = k2.split(',').map(Number), [big, small] = meshes[i].area >= meshes[j].area ? [meshes[i], meshes[j]] : [meshes[j], meshes[i]];
      if (small.layer <= big.layer) { small.layer = big.layer + 1; changed = true; }
    }
    if (!changed) break;
  }
  for (const m of meshes) {
    const cur = m.o.material.polygonOffset ? -m.o.material.polygonOffsetFactor : 0;
    if (m.layer > cur) { m.o.material = layeredMaterial(m.o.userData.baseMaterial || m.o.material, m.layer); moved++; }
  }
  return moved;
}
