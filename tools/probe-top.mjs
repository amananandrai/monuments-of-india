// Lists the topmost meshes of each monument's focus (max y, width), to find what stands too tall.
import { openPage, PRELUDE } from './lib/browser.mjs';
const ids = process.argv.slice(2);
const page = await openPage();
const rows = await page.run(PRELUDE + `
  const out = {};
  for (const id of args.ids) {
    const r = await build(id, 'high'); r.focus.updateMatrixWorld(true);
    const list = [];
    r.focus.traverse((o) => { if (!o.isMesh) return;
      if (o.isInstancedMesh) { const m = new THREE.Matrix4(), b0 = new THREE.Box3(); o.geometry.computeBoundingBox();
        for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); const b = o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld); list.push([b.max.y, b.min.y, b.max.x - b.min.x, o.material.color?.getHexString?.() || '', 'inst']); } return; }
      const b = new THREE.Box3().setFromObject(o); list.push([b.max.y, b.min.y, b.max.x - b.min.x, o.material.color?.getHexString?.() || '', o.geometry.type]); });
    list.sort((a, b) => b[0] - a[0]);
    out[id] = list.slice(0, 14).map((l) => l.map((v) => typeof v === 'number' ? +v.toFixed(1) : v).join(' '));
  }
  return out;
`, { ids });
await page.close();
for (const [id, l] of Object.entries(rows)) console.log(id + '\n  ' + l.join('\n  '));
