// Finds faces that flicker (z-fight): two triangles of different materials lying in one plane,
// facing the same way and overlapping, with no depth offset between them. Each monument is built
// as js/main.js builds it (naturalize, separateCoplanar, blendIntoLand), so what the site already
// separates is not reported. A clash is kept only if it can be seen: from a few points on it, a
// short ray off the face must be neither covered within 3 cm nor start inside a solid.
//   node check-flicker.mjs [id ...] [--min 1] [--same]
// --min: the smallest total overlap (m²) to report (default 1). --same: also report clashes
// between faces of the same material (harmless unless their instances are tinted differently).
// The overlap is measured on bounding boxes, so a diagonal face can be over-counted; check a
// report in the browser before fixing it. Exits 1 if anything is reported.
import { openPage, PRELUDE } from './lib/browser.mjs';

// The scan, evaluated in the page for a batch of monuments (args.ids).
const SCAN = `
  const { separateCoplanar } = await import('/js/coplanar.js');
  const { naturalize } = await import('/js/naturalize.js');
  const { blendIntoLand, siteLand } = await import('/js/landscape.js');
  const out = {};
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), E = new THREE.Vector3(), W = new THREE.Matrix4(), I = new THREE.Matrix4();
  for (const id of args.ids) {
    const r = await build(id, 'high');
    r.land = siteLand(r); naturalize(r.group); separateCoplanar(r.group, 0.005); blendIntoLand(r);
    r.group.updateMatrixWorld(true);
    const buckets = new Map(), names = [];
    r.group.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      const mat = [].concat(o.material)[0];
      if (mat.transparent && mat.opacity < 0.9) return;
      const g = o.geometry, p = g.attributes.position, idx = g.index, nt = (idx ? idx.count : p.count) / 3, count = o.isInstancedMesh ? o.count : 1;
      if (nt * count > 400000) return;
      const off = mat.polygonOffset ? mat.polygonOffsetFactor + '/' + mat.polygonOffsetUnits : '0', key = '#' + mat.color.getHexString();
      for (let k = 0; k < count; k++) {
        W.copy(o.matrixWorld); if (o.isInstancedMesh) { o.getMatrixAt(k, I); W.multiply(I); }
        const L = names.push({ mat: key, part: o.geometry.type + (o.isInstancedMesh ? ' (instanced)' : ''), tinted: !!o.instanceColor }) - 1;
        for (let t = 0; t < nt; t++) {
          const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
          A.fromBufferAttribute(p, i0).applyMatrix4(W); B.fromBufferAttribute(p, i1).applyMatrix4(W); C.fromBufferAttribute(p, i2).applyMatrix4(W);
          N.subVectors(C, B).cross(E.subVectors(A, B));
          if (N.length() / 2 < 0.02) continue;
          N.normalize();
          if (N.y < -0.5) continue; // undersides: the camera stays above the ground
          const d = N.dot(A), kb = Math.round(N.x * 200) + ',' + Math.round(N.y * 200) + ',' + Math.round(N.z * 200) + '|';
          const tri = { L, off, d, n: [N.x, N.y, N.z], lo: [Math.min(A.x, B.x, C.x), Math.min(A.y, B.y, C.y), Math.min(A.z, B.z, C.z)], hi: [Math.max(A.x, B.x, C.x), Math.max(A.y, B.y, C.y), Math.max(A.z, B.z, C.z)] };
          const key2 = kb + Math.round(d / 0.004);
          if (!buckets.has(key2)) buckets.set(key2, []);
          buckets.get(key2).push(tri);
        }
      }
    });
    const hits = new Map();
    for (const [kb, list] of buckets) {
      const [nk, dq] = kb.split('|'), next = buckets.get(nk + '|' + (+dq + 1)) || [];
      const all = list.map((t) => [t, 0]).concat(next.map((t) => [t, 1])).sort((x, y) => x[0].lo[0] - y[0].lo[0]);
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const [a, sa] = all[i], [b, sb] = all[j];
        if (b.lo[0] > a.hi[0] + 1e-4) break;
        if ((sa && sb) || a.L === b.L || a.off !== b.off || Math.abs(a.d - b.d) > 0.004) continue;
        const na = names[a.L], nb = names[b.L];
        if (!args.same && na.mat === nb.mat && !(na.tinted || nb.tinted)) continue;
        const dims = [];
        let ok = true;
        for (let c = 0; c < 3; c++) { const o2 = Math.min(a.hi[c], b.hi[c]) - Math.max(a.lo[c], b.lo[c]); if (o2 < -1e-4) { ok = false; break; } dims.push(Math.max(0, o2)); }
        if (!ok) continue;
        dims.sort((x, y) => y - x);
        const area = dims[0] * dims[1];
        if (area < 0.05) continue;
        const key = [na.mat + ' ' + na.part, nb.mat + ' ' + nb.part].sort().join('  <>  ') + '|' + a.n.map((v) => v.toFixed(1)).join(',');
        if (!hits.has(key)) hits.set(key, { area: 0, samples: [] });
        const h = hits.get(key);
        h.area += area;
        if (h.samples.length < 6) h.samples.push({ c: [0, 1, 2].map((c) => (Math.max(a.lo[c], b.lo[c]) + Math.min(a.hi[c], b.hi[c])) / 2), n: a.n });
      }
    }
    // Visible? Rays test both sides of every face, so a point inside a solid is seen as such.
    const meshes = [], sides = new Map(), rc = new THREE.Raycaster(), nw = new THREE.Vector3();
    r.group.traverse((o) => { if (o.isMesh && o.visible) meshes.push(o); });
    for (const o of meshes) for (const m of [].concat(o.material)) if (!sides.has(m)) { sides.set(m, m.side); m.side = THREE.DoubleSide; }
    const seen = [];
    for (const [key, h] of hits) {
      if (h.area < args.min) continue;
      const vis = h.samples.filter(({ c, n }) => {
        const dir = new THREE.Vector3(...n);
        rc.set(new THREE.Vector3(...c).addScaledVector(dir, 0.01), dir); rc.far = 4;
        const hit = rc.intersectObjects(meshes, false)[0];
        if (!hit || !hit.face) return true;
        nw.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        return !(nw.dot(dir) > 0.05 || hit.distance <= 0.03);
      });
      if (!vis.length) continue;
      const [pair, n] = key.split('|'), [a, b] = pair.split('  <>  ');
      seen.push({ area: h.area, a, b, n, at: vis[0].c.map((v) => v.toFixed(1)).join(', ') });
    }
    for (const [m, s] of sides) m.side = s;
    out[id] = seen.sort((x, y) => y.area - x.area).slice(0, 8);
  }
  detail.level = 'high';
  return out;
`;

const argv = process.argv.slice(2), opt = (name, dflt) => (argv.includes(name) ? Number(argv[argv.indexOf(name) + 1]) : dflt);
const ids = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--min');
const page = await openPage();
const all = ids.length ? ids : await page.run(PRELUDE + 'return MONUMENTS.map((m) => m.id);');
const report = {};
for (let i = 0; i < all.length; i += 8) {
  Object.assign(report, await page.run(PRELUDE + SCAN, { ids: all.slice(i, i + 8), min: opt('--min', 1), same: argv.includes('--same') }));
}
await page.close();

let n = 0;
for (const [id, hits] of Object.entries(report)) {
  if (!hits.length) continue;
  n++;
  console.log(`\n${id}`);
  for (const h of hits) console.log(`  ${h.area.toFixed(1).padStart(7)} m²  ${h.a}  <>  ${h.b}  facing ${h.n}  near ${h.at}`);
}
console.log(`\n${Object.keys(report).length} monuments scanned; ${n} with visible clashes.`);
process.exit(n ? 1 : 0);
