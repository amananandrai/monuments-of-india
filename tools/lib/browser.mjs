// A headless page that can import the site's modules: the repository is served from a local
// static server, three.js comes from tools/node_modules instead of the CDN (the page's import map
// names cdn.jsdelivr.net), and run(code, args) evaluates an async function body in the page with
// `args` in scope. newPage() opens further pages the same way, for the site's own index.html (at
// `origin`). Nothing is written to the repository.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const THREE_DIR = path.resolve(HERE, '../node_modules/three');
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const PAGE = `<!doctype html><meta charset="utf-8"><script type="importmap">{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/" } }</script><body></body>`;

export async function openPage({ gl = false } = {}) {
  if (!fs.existsSync(THREE_DIR)) throw new Error('three.js not found: run `npm install` in tools/ first.');
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/__tools.html') { res.writeHead(200, { 'content-type': 'text/html' }); res.end(PAGE); return; }
    const file = path.join(ROOT, url);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  }).listen(0);
  const browser = await chromium.launch(gl ? { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : {});
  const origin = `http://127.0.0.1:${server.address().port}`;
  // A page with three.js served from node_modules (and, for the site itself, no web fonts).
  const newPage = async (options = {}) => {
    const p = await browser.newPage(options);
    p.on('pageerror', (e) => console.error('page error:', e.message));
    await p.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.*)/, (route) => {
      const rel = route.request().url().replace(/.*three@0\.160\.0\//, '');
      route.fulfill({ path: path.join(THREE_DIR, rel), contentType: 'text/javascript' });
    });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    return p;
  };
  const page = await newPage();
  await page.goto(`${origin}/__tools.html`);
  return {
    // The site itself (index.html) at `${origin}/#id`, in pages of its own: see shoot-views.mjs --site.
    origin, newPage,
    run: (body, args = {}) => page.evaluate(({ body, args }) => new Function('args', `return (async () => { ${body} })();`)(args), { body, args }),
    close: async () => { await browser.close(); server.close(); },
  };
}

// Code shared by the checks, evaluated in the page: tris(object) counts triangles (instances
// included); build(id, level) builds a monument at a detail level and returns the builder's result.
export const PRELUDE = `
  const THREE = await import('three');
  const { MONUMENTS } = await import('/js/data.js');
  const { detail } = await import('/js/detail.js');
  const tris = (o) => { let t = 0; o.traverse((m) => { if (!m.isMesh) return; const g = m.geometry; t += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (m.isInstancedMesh ? m.count : 1); }); return Math.round(t); };
  const build = async (id, level) => { const m = MONUMENTS.find((x) => x.id === id); if (!m) throw new Error('no monument ' + id); detail.level = level; const mod = await m.load(); const r = mod[m.fn](); r.focus = r.focus || r.group; return r; };
`;
