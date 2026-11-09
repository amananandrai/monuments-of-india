// Renders each monument from its home view (as js/main.js frames it: frameBox, the builder's view
// and zoom, a 38° lens) to tools/views/<id>.png, to set beside a reference photograph.
//   node shoot-views.mjs [id ...] [--size 960x600] [--view x,y,z] [--zoom z] [--target x,y,z]
// --view, --zoom and --target override the builder's, to try an angle before writing it into the builder.
// Plain lighting (a sun and a sky light); the site's own look (shadows, haze, weathering) is not
// reproduced, only the framing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, PRELUDE } from './lib/browser.mjs';

const argv = process.argv.slice(2), opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const [W, H] = (opt('--size') || '960x600').split('x').map(Number);
const ids = argv.filter((a, i) => !a.startsWith('--') && !['--size', '--view', '--zoom', '--target'].includes(argv[i - 1]));
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'views');
fs.mkdirSync(out, { recursive: true });
const page = await openPage({ gl: true });
const all = ids.length ? ids : await page.run(PRELUDE + 'return MONUMENTS.map((m) => m.id);');
for (const id of all) {
  const png = await page.run(PRELUDE + `
    const { frameBox } = await import('/js/framing.js');
    const r = await build(args.id, 'high');
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#cfdbe6'); scene.add(r.group);
    scene.add(new THREE.HemisphereLight('#dfe9ff', '#9a8466', 1.2));
    const sun = new THREE.DirectionalLight('#fff3e0', 2.2); sun.position.set(-55, 85, 45); scene.add(sun);
    const ren = window.__ren || (window.__ren = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }));
    ren.setSize(args.W, args.H);
    const cam = new THREE.PerspectiveCamera(38, args.W / args.H, 0.5, 30000);
    const box = frameBox(r.focus), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const vf = THREE.MathUtils.degToRad(38), hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    const dist = (size.length() / 2 / Math.sin(Math.min(vf, hf) / 2)) * 1.1 * (args.zoom ?? r.zoom ?? 1);
    const dir = new THREE.Vector3(...(args.view || r.view || [0.9, 0.34, 1.25])).normalize(), tt = args.target || r.target, t = tt ? new THREE.Vector3(...tt) : new THREE.Vector3(c.x, c.y * 0.95, c.z);
    cam.position.copy(t).addScaledVector(dir, dist); cam.lookAt(t);
    ren.render(scene, cam);
    return ren.domElement.toDataURL('image/png');
  `, { id, W, H, view: opt('--view') ? opt('--view').split(',').map(Number) : null, zoom: opt('--zoom') ? Number(opt('--zoom')) : null, target: opt('--target') ? opt('--target').split(',').map(Number) : null });
  fs.writeFileSync(path.join(out, `${id}.png`), Buffer.from(png.split(',')[1], 'base64'));
  process.stdout.write('.');
}
await page.close();
console.log(`\n${all.length} views in ${out}`);
