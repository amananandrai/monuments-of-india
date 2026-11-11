// Renders each monument from its home view (as js/main.js frames it: frameBox, the builder's view
// and zoom, a 38° lens) to tools/views/<id>.png, to set beside a reference photograph.
//   node shoot-views.mjs [id ...] [--size 960x600] [--view x,y,z] [--zoom z] [--target x,y,z] [--out dir]
// --view, --zoom and --target override the builder's, to try an angle before writing it into the builder.
// Plain lighting (a sun and a sky light); the site's own look (shadows, haze, weathering) is not
// reproduced, only the framing.
//
//   node shoot-views.mjs --site [id ...] [--size 960x600] [--night] [--back] [--level high|low] [--out dir]
// With --site, the pictures come from the site itself (index.html, with its shadows, occlusion,
// surfaces, haze and trees), to judge the detail and to keep before and after a change:
//   <id>-site.png        the home view
//   <id>-site-close.png  zoomed in as far as the site allows, where plain walls show
//   <id>-site-back.png   the opposite side (with --back)
// The plaque and the buttons are hidden; --night shoots the night scene. Software rendering is slow:
// allow 20 to 60 seconds a monument. --out names another folder (for example views/before).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, PRELUDE } from './lib/browser.mjs';

const argv = process.argv.slice(2), opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const [W, H] = (opt('--size') || '960x600').split('x').map(Number);
const ids = argv.filter((a, i) => !a.startsWith('--') && !['--size', '--view', '--zoom', '--target', '--out', '--level'].includes(argv[i - 1]));
const out = opt('--out') ? path.resolve(opt('--out')) : path.join(path.dirname(fileURLToPath(import.meta.url)), 'views');
fs.mkdirSync(out, { recursive: true });
const page = await openPage({ gl: true });
const all = ids.length ? ids : await page.run(PRELUDE + 'return MONUMENTS.map((m) => m.id);');
if (argv.includes('--site')) {
  // The site's sidebar is 300 px wide; the canvas beside it comes out at the size asked for.
  const level = opt('--level') || 'high', pause = (p, ms) => p.waitForTimeout(ms);
  let failed = 0;
  for (const id of all) {
    const p = await page.newPage({ viewport: { width: W + 300, height: H } });
    p.setDefaultTimeout(300000);
    try {
      await p.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
      await p.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch (e) { /* no storage */ } }, argv.includes('--night') ? 'dark' : 'light');
      await p.goto(`${page.origin}/index.html?detail=${level}#${id}`);
      await p.waitForFunction(() => document.getElementById('status').hidden && !document.getElementById('stage').classList.contains('is-map'));
      await p.addStyleTag({ content: '.plaque, .toolbar, .hint { visibility: hidden !important; }' });
      const canvas = p.locator('#scene'), bb = await canvas.boundingBox(), cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const shot = async (name) => { await pause(p, 2500); await canvas.screenshot({ path: path.join(out, `${id}-site${name}.png`) }); };
      await shot('');
      if (argv.includes('--back')) {
        // Dragging across half the canvas's height turns the view half way round.
        await p.mouse.move(cx - bb.height / 4, cy); await p.mouse.down(); await p.mouse.move(cx + bb.height / 4, cy, { steps: 12 }); await p.mouse.up();
        await shot('-back');
        await p.mouse.move(cx + bb.height / 4, cy); await p.mouse.down(); await p.mouse.move(cx - bb.height / 4, cy, { steps: 12 }); await p.mouse.up();
      }
      await p.mouse.move(cx, cy);
      for (let k = 0; k < 24; k++) { await p.mouse.wheel(0, -300); await pause(p, 60); }
      await shot('-close');
      process.stdout.write('.');
    } catch (e) { failed++; console.error(`\n${id}: ${e.message.split('\n')[0]}`); }
    await p.close();
  }
  await page.close();
  console.log(`\n${all.length - failed} of ${all.length} monuments shot from the site, in ${out}`);
  process.exit(failed ? 1 : 0);
}
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
