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
