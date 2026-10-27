import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { attachSurface, surface } from './surface.js';

// The models block out rocks, hills, mountains and trees with low-poly, flat-shaded shapes.
// This pass rebuilds each of those at higher resolution, sculpts it with noise suited to what it
// is (lumpy boulders, leafy canopies, tiered conifers, ridged and snow-capped mountains, hills
// that only bulge outward so the buildings on their flat tops stay put) and shades it smoothly.

/* ---------- value noise ---------- */
function hash(x, y, z) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
function noise(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t;
  const h = (dx, dy, dz) => hash(ix + dx, iy + dy, iz + dz);
  return l(l(l(h(0, 0, 0), h(1, 0, 0), fx), l(h(0, 1, 0), h(1, 1, 0), fx), fy),
           l(l(h(0, 0, 1), h(1, 0, 1), fx), l(h(0, 1, 1), h(1, 1, 1), fx), fy), fz);
}
function fbm(x, y, z, oct = 4) {
  let a = 0.5, s = 0;
  for (let i = 0; i < oct; i++) { s += a * noise(x, y, z); x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; }
  return s;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- classification ---------- */
const tmpBox = new THREE.Box3(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3();

function classify(o) {
  const m = o.material;
  if (!m || !m.isMeshStandardMaterial || !m.flatShading || m.userData.keepFacets) return null;
  const t = o.geometry.type, hsl = m.color.getHSL({});
  const green = hsl.h > 0.17 && hsl.h < 0.45 && hsl.s > 0.12;
  tmpBox.setFromObject(o);
  const size = tmpBox.getSize(tmpV).clone(), centre = tmpBox.getCenter(new THREE.Vector3());
  const big = Math.max(size.x, size.z), far = Math.hypot(centre.x, centre.z) > 90;
  if (t === 'IcosahedronGeometry') return green || hsl.s > 0.45 ? 'canopy' : 'rock';
  if (t === 'SphereGeometry') return big > 40 ? 'hill' : green || hsl.s > 0.45 ? 'canopy' : 'rock';
  if (t === 'ConeGeometry') {
    if (hsl.l > 0.85) return 'snow';
    if (o.isInstancedMesh || big < 40) return green ? 'conifer' : 'rock';
    return far ? 'mountain' : 'hill';
  }
  if (t === 'CylinderGeometry') return big > 30 ? 'hill' : 'rock';
  return null;
}

/* ---------- geometry ---------- */
function refined(geo) {
  const p = geo.parameters;
  let g;
  if (geo.type === 'IcosahedronGeometry') g = new THREE.IcosahedronGeometry(p.radius, 3);
  else if (geo.type === 'SphereGeometry') g = new THREE.SphereGeometry(p.radius, 56, 28, p.phiStart, p.phiLength, p.thetaStart, p.thetaLength);
  else if (geo.type === 'ConeGeometry') g = new THREE.ConeGeometry(p.radius, p.height, 56, 22, p.openEnded);
  else g = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 60, 14, p.openEnded);
  // Re-apply any translation baked into the original geometry by matching bounding-box centres.
  geo.computeBoundingBox(); g.computeBoundingBox();
  const d = geo.boundingBox.getCenter(new THREE.Vector3()).sub(g.boundingBox.getCenter(new THREE.Vector3()));
  g.translate(d.x, d.y, d.z);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  return mergeVertices(g, 1e-4);
}

function sculpt(g, kind, S, seed, snowColor, rockColor) {
  g.computeBoundingBox();
  const bb = g.boundingBox, c = bb.getCenter(new THREE.Vector3()), size = bb.getSize(new THREE.Vector3());
  const R = Math.max(size.x * S.x, size.z * S.z) / 2 || 1, Hh = size.y * S.y || 1;
  const pos = g.attributes.position, v = new THREE.Vector3(), dir = new THREE.Vector3();
  const sAvg = (S.x + S.y + S.z) / 3;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const wx = v.x * S.x + seed, wy = v.y * S.y + seed * 0.7, wz = v.z * S.z - seed;
    const t = (v.y - bb.min.y) / (size.y || 1);
    if (kind === 'rock' || kind === 'canopy') {
      const f = (kind === 'rock' ? 1.6 : 2.2) / R;
      const n = fbm(wx * f, wy * f, wz * f);
      const amp = (kind === 'rock' ? 0.24 : 0.34) * R / sAvg;
      dir.copy(v).sub(c).normalize();
      v.addScaledVector(dir, amp * (n - (kind === 'rock' ? 0.5 : 0.42)) * 2);
    } else if (kind === 'conifer') {
      // Tiers of drooping branches, each wider at its base, with some ragged noise.
      const tier = 1 - ((t * 5 + 0.15) % 1);
      const k = (0.78 + 0.42 * tier) * (1 + 0.3 * (fbm(wx * 3, wy * 3, wz * 3) - 0.5));
      v.x = c.x + (v.x - c.x) * k;
      v.z = c.z + (v.z - c.z) * k;
    } else if (kind === 'mountain') {
      const f = 1.4 / R, n = fbm(wx * f, wy * f * 0.8, wz * f);
      const ridge = 1 - Math.abs(2 * fbm(wx * f * 2.2 + 11, wy * f, wz * f * 2.2) - 1);
      const k = 1 + 0.28 * (ridge - 0.5) + 0.18 * (n - 0.5);
      v.x = c.x + (v.x - c.x) * k;
      v.z = c.z + (v.z - c.z) * k;
      if (t > 0.02) v.y += (size.y * 0.07) * (fbm(wx * f * 3, wy * f * 3, wz * f * 3) - 0.5) * Math.min(1, t * 4);
    } else if (kind === 'hill') {
      // Only bulge outward, so the flat top and anything standing on it are not disturbed.
      const n = fbm(wx * 0.8 / R, wy * 2.5 / Hh, wz * 0.8 / R);
      const k = 1 + 0.07 * n;
      v.x = c.x + (v.x - c.x) * k;
      v.z = c.z + (v.z - c.z) * k;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  if (snowColor) {
    // Snow on the upper slopes, thinning on steep faces.
    const nrm = g.attributes.normal, col = new Float32Array(pos.count * 3), cc = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = (v.y - bb.min.y) / (size.y || 1);
      const s = smooth(0.58, 0.72, t + 0.14 * (fbm(v.x * 0.02, v.y * 0.02, v.z * 0.02) - 0.5)) * smooth(0.25, 0.55, nrm.getY(i));
      cc.copy(rockColor).lerp(snowColor, s);
      col.set([cc.r, cc.g, cc.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  return g;
}

/* ---------- materials ---------- */
const mats = new Map();
const SNOW = new THREE.Color('#f2f5f8');
function naturalMaterial(m, kind, snowy) {
  const key = m.uuid + ':' + kind + (snowy ? ':snow' : '');
  if (!mats.has(key)) {
    const c = attachSurface(m.clone());
    c.flatShading = false;
    const hsl = m.color.getHSL({});
    const green = hsl.h > 0.17 && hsl.h < 0.45 && hsl.s > 0.12;
    if (kind === 'canopy' || kind === 'conifer') surface(c, 'foliage');
    else if (green) surface(c, 'ground');
    else { surface(c, 'rock'); c.userData.photoKey = 'rock'; }
    if (snowy) { c.vertexColors = true; c.color.set('#ffffff'); }
    mats.set(key, c);
  }
  return mats.get(key);
}

export function naturalize(root) {
  root.updateMatrixWorld(true);
  const found = [];
  root.traverse((o) => { if (o.isMesh) { const kind = classify(o); if (kind) found.push({ o, kind }); } });
  // Pair each snow cap with the mountain beneath it; the mountain is then coloured with snow itself.
  const centre = (o) => tmpBox.setFromObject(o).getCenter(new THREE.Vector3());
  for (const s of found.filter((f) => f.kind === 'snow')) {
    const sc = centre(s.o);
    const peak = found.find((f) => f.kind === 'mountain' && centre(f.o).setY(0).distanceTo(sc.clone().setY(0)) < 1);
    if (peak) { peak.snowy = true; s.o.visible = false; } else s.kind = 'mountain';
  }
  const shared = new Map();
  let n = 0;
  for (const f of found) {
    if (!f.o.visible) continue;
    const { o, kind } = f;
    if (o.isInstancedMesh) {
      // Instances share one geometry; sculpt it once in its own (unit) space.
      if (!shared.has(o.geometry.uuid)) shared.set(o.geometry.uuid, sculpt(refined(o.geometry), kind, new THREE.Vector3(1, 1, 1), 3.1, null, null));
      o.geometry = shared.get(o.geometry.uuid);
    } else {
      o.getWorldScale(tmpS);
      const seed = (o.position.x * 0.37 + o.position.z * 0.61) % 97;
      o.geometry = sculpt(refined(o.geometry), kind, tmpS.clone(), seed, f.snowy ? SNOW : null, o.material.color);
    }
    o.material = naturalMaterial(o.material, kind, f.snowy);
    n++;
  }
  return n;
}
