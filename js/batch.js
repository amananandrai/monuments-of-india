import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { nightState } from './helpers.js';

// Fewer draw calls: the meshes under root that share a material (and cast and take shadows alike)
// become one mesh, kept in root's own frame. A model of many separate parts (a truss of struts, a
// town of houses, a temple of a thousand mouldings) is then drawn in a handful of calls, in each of
// the passes that draw the scene (the view, its shadows, its reflection, its occlusion).
//
// Run after the passes that need the separate parts (separateCoplanar, blendIntoLand, framing), so
// it changes nothing they see. Left as they are: instanced meshes; parts under `keepOut`; water that
// reflects (the reflection hides it while drawing); transparent parts (drawn back to front, one by
// one); and the lamps and glows that night shows and hides (nightState.objects).
export function batchStatic(root, keepOut = null) {
  root.updateMatrixWorld(true);
  const night = new Set(nightState.objects), inv = root.matrixWorld.clone().invert(), m4 = new THREE.Matrix4();
  const skip = (o) => { for (let p = o; p && p !== root; p = p.parent) if (p === keepOut || night.has(p)) return true; return false; };
  const groups = new Map(), done = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.visible || Array.isArray(o.material)) return;
    const m = o.material;
    if (m.transparent || m.userData.reflect || o.geometry.morphAttributes.position || skip(o)) return;
    const key = `${m.uuid}:${o.castShadow ? 1 : 0}${o.receiveShadow ? 1 : 0}`;
    if (!groups.has(key)) groups.set(key, { m, cast: o.castShadow, receive: o.receiveShadow, list: [] });
    groups.get(key).list.push(o);
  });
  for (const { m, cast, receive, list } of groups.values()) {
    if (list.length < 2) continue;
    const textured = !!(m.map || m.bumpMap);
    const keep = ['position', 'normal', ...(m.vertexColors ? ['color'] : []), ...(textured ? ['uv'] : [])];
    const geos = list.map((o) => {
      const g = o.geometry.clone();
      for (const k of Object.keys(g.attributes)) if (!keep.includes(k)) g.deleteAttribute(k);
      if (textured && !g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      // Every part indexed (a plain index for those without one), so shared vertices stay shared.
      if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
      m4.multiplyMatrices(inv, o.matrixWorld);
      g.applyMatrix4(m4);
      // A mirrored placement turns the triangles inside out; turn them back.
      if (m4.determinant() < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } }
      g.clearGroups();
      return g;
    });
    if (!geos.every((g) => keep.every((k) => g.attributes[k] && g.attributes[k].itemSize === geos[0].attributes[k].itemSize))) continue;
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    const o = new THREE.Mesh(merged, m);
    o.castShadow = cast;
    o.receiveShadow = receive;
    root.add(o);
    done.push(...list);
  }
  done.forEach((o) => o.parent && o.parent.remove(o));
  return root;
}
