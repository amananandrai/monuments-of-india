// Brings the website's monuments into this video project, so the film draws the same 101 models the
// site does. Run before preview, check or render (the npm scripts do it for you):
//
// - copies ../js into site/js, pointing its three.js imports at the local copy in lib/three, since a
//   render never fetches from a CDN;
// - copies the three.js build and the addons the scene uses, and GSAP, into lib/;
// - copies the photo textures into assets/textures and the title fonts into assets/fonts;
// - writes, from the narration's timeline (narration/timing.json, made by
//   ../tools/generate-narration.mjs), the slot table the tour reads (compositions/timing.js), the
//   title cards (compositions/titles-01..11.html: journey caption over the map, title and facts over
//   the orbit, a name tag over the close-ups), the dips to black (dips.html), tour.html and index.html.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const nm = join(here, 'node_modules');
const timingFile = join(here, 'narration/timing.json');
if (!existsSync(timingFile)) throw new Error('narration/timing.json is missing: run `node tools/generate-narration.mjs` from the repository root first.');
const TIMING = JSON.parse(readFileSync(timingFile, 'utf8'));
const SLOTS = TIMING.slots;

/* ---------- three.js, rewritten to relative paths ---------- */
const threeRoot = join(here, 'lib/three');
const rewrite = (file, text) => {
  const rel = (p) => {
    const r = relative(dirname(file), p).split('\\').join('/');
    return r.startsWith('.') ? r : `./${r}`;
  };
  return text
    .replace(/(from\s*|import\s*\(\s*|import\s+)(['"])three\2/g, (_, a, q) => `${a}${q}${rel(join(threeRoot, 'three.module.js'))}${q}`)
    .replace(/(from\s*|import\s*\(\s*|import\s+)(['"])three\/addons\/([^'"]+)\2/g, (_, a, q, p) => `${a}${q}${rel(join(threeRoot, 'addons', p))}${q}`);
};
const importsOf = (text) => [...text.matchAll(/(?:from\s*|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)].map((m) => m[1]);

rmSync(join(here, 'lib'), { recursive: true, force: true });
mkdirSync(threeRoot, { recursive: true });
writeFileSync(join(threeRoot, 'three.module.js'), readFileSync(join(nm, 'three/build/three.module.js')));
cpSync(join(nm, 'gsap/dist/gsap.min.js'), join(here, 'lib/gsap.min.js'));

// The addons the scene and the site's modules import, followed through their own imports.
const jsm = join(nm, 'three/examples/jsm');
const wanted = new Set([
  'postprocessing/EffectComposer.js',
  'postprocessing/RenderPass.js',
  'postprocessing/OutputPass.js',
  'utils/BufferGeometryUtils.js',
  'loaders/SVGLoader.js'
]);

/* ---------- the site's modules ---------- */
const siteJs = join(here, 'site/js');
rmSync(join(here, 'site'), { recursive: true, force: true });
// The app shell (controls, map, sidebar) is not part of the film; india-map.js (the state shapes)
// is, for the 3D map of the journey.
const skip = new Set(['main.js', 'map.js']);
const copyDir = (from, to) => {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const src = join(from, e.name), dst = join(to, e.name);
    if (e.isDirectory()) copyDir(src, dst);
    else if (e.name.endsWith('.js') && !(from === join(repo, 'js') && skip.has(e.name))) {
      const text = readFileSync(src, 'utf8');
      importsOf(text).filter((p) => p.startsWith('three/addons/')).forEach((p) => wanted.add(p.slice('three/addons/'.length)));
      writeFileSync(dst, rewrite(dst, text));
    }
  }
};
copyDir(join(repo, 'js'), siteJs);

const queue = [...wanted];
while (queue.length) {
  const p = queue.pop();
  const src = join(jsm, p), dst = join(threeRoot, 'addons', p);
  const text = readFileSync(src, 'utf8');
  mkdirSync(dirname(dst), { recursive: true });
  writeFileSync(dst, rewrite(dst, text));
  for (const imp of importsOf(text).filter((x) => x.startsWith('.'))) {
    const next = relative(jsm, resolve(dirname(src), imp)).split('\\').join('/');
    if (!wanted.has(next)) { wanted.add(next); queue.push(next); }
  }
}

/* ---------- textures and fonts ---------- */
rmSync(join(here, 'assets/textures'), { recursive: true, force: true });
cpSync(join(repo, 'assets/textures'), join(here, 'assets/textures'), { recursive: true });

// The face for each language's name, and the files it needs (Fontsource, OFL).
const SCRIPTS = {
  devanagari: { family: 'Noto Sans Devanagari', pkg: 'noto-sans-devanagari', subset: 'devanagari', langs: ['hi', 'mr', 'kok'] },
  bengali: { family: 'Noto Sans Bengali', pkg: 'noto-sans-bengali', subset: 'bengali', langs: ['bn', 'as'] },
  gujarati: { family: 'Noto Sans Gujarati', pkg: 'noto-sans-gujarati', subset: 'gujarati', langs: ['gu'] },
  gurmukhi: { family: 'Noto Sans Gurmukhi', pkg: 'noto-sans-gurmukhi', subset: 'gurmukhi', langs: ['pa'] },
  kannada: { family: 'Noto Sans Kannada', pkg: 'noto-sans-kannada', subset: 'kannada', langs: ['kn'] },
  malayalam: { family: 'Noto Sans Malayalam', pkg: 'noto-sans-malayalam', subset: 'malayalam', langs: ['ml'] },
  oriya: { family: 'Noto Sans Oriya', pkg: 'noto-sans-oriya', subset: 'oriya', langs: ['or'] },
  tamil: { family: 'Noto Sans Tamil', pkg: 'noto-sans-tamil', subset: 'tamil', langs: ['ta'] },
  telugu: { family: 'Noto Sans Telugu', pkg: 'noto-sans-telugu', subset: 'telugu', langs: ['te'] },
  tibetan: { family: 'Noto Serif Tibetan', pkg: 'noto-serif-tibetan', subset: 'tibetan', langs: ['bo'] },
  arabic: { family: 'Noto Nastaliq Urdu', pkg: 'noto-nastaliq-urdu', subset: 'arabic', langs: ['ur', 'ks'] },
};
const LATIN = [
  { family: 'Rozha One', pkg: 'rozha-one', file: 'rozha-one-latin-400-normal.woff2', weight: 400 },
  { family: 'Hind', pkg: 'hind', file: 'hind-latin-400-normal.woff2', weight: 400 },
  { family: 'Hind', pkg: 'hind', file: 'hind-latin-500-normal.woff2', weight: 500 },
  { family: 'Hind', pkg: 'hind', file: 'hind-latin-600-normal.woff2', weight: 600 },
];
const fontDir = join(here, 'assets/fonts');
rmSync(fontDir, { recursive: true, force: true });
mkdirSync(fontDir, { recursive: true });
const faces = [];
for (const f of LATIN) {
  cpSync(join(nm, '@fontsource', f.pkg, 'files', f.file), join(fontDir, f.file));
  faces.push(`@font-face { font-family: '${f.family}'; font-weight: ${f.weight}; font-style: normal; font-display: block; src: url('assets/fonts/${f.file}') format('woff2'); }`);
}
for (const s of Object.values(SCRIPTS)) {
  const file = `${s.pkg}-${s.subset}-500-normal.woff2`;
  const src = join(nm, '@fontsource', s.pkg, 'files', existsSync(join(nm, '@fontsource', s.pkg, 'files', file)) ? file : file.replace('-500-', '-400-'));
  const name = basename(src);
  cpSync(src, join(fontDir, name));
  faces.push(`@font-face { font-family: '${s.family}'; font-weight: 500; font-style: normal; font-display: block; src: url('assets/fonts/${name}') format('woff2'); }`);
}
const familyFor = (lang) => Object.values(SCRIPTS).find((s) => s.langs.includes(lang))?.family || 'Noto Sans Devanagari';

/* ---------- the title cards, the dips to black, tour and root ---------- */
const { MONUMENTS } = await import(pathToFileURL(join(siteJs, 'data.js')).href);
const { INDIA, project } = await import(pathToFileURL(join(repo, 'js/india-map.js')).href);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n, w = 3) => String(n).padStart(w, '0');
const N = MONUMENTS.length, PART = 10, parts = Math.ceil(N / PART);
if (SLOTS.length !== N || SLOTS.some((s, i) => s.id !== MONUMENTS[i].id)) {
  throw new Error('narration/timing.json does not match js/data.js: run `node tools/generate-narration.mjs` again.');
}
const total = +TIMING.total.toFixed(2);
const f2 = (x) => +x.toFixed(2);
writeFileSync(join(here, 'compositions/timing.js'), `// Generated by sync-site.mjs from narration/timing.json: each monument's slot and shots, in seconds.
export const TOTAL = ${total};
export const SLOTS = ${JSON.stringify(SLOTS.map((s) => ({ start: s.start, duration: s.duration, shots: s.shots })))};
`);
const GENERATED = '<!-- Generated by sync-site.mjs from js/data.js: edit the data or the generator, not this file. -->';

const CATEGORIES = {
  sacred: 'Temple & Sacred Shrine',
  memorial: 'Tomb & Memorial',
  fort: 'Fort & Palace',
  civic: 'Civic Architecture'
};

const STYLE = `    ${faces.join('\n    ')}
    #root { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .scrim {
      position: absolute; left: 0; right: 0; bottom: 0; height: 740px;
      background: linear-gradient(to top, rgba(8, 6, 4, 0.94) 0%, rgba(8, 6, 4, 0.82) 36%, rgba(8, 6, 4, 0.35) 72%, transparent 100%);
    }
    .top-scrim {
      position: absolute; top: 0; left: 0; right: 0; height: 280px;
      background: linear-gradient(to bottom, rgba(8, 6, 4, 0.72) 0%, transparent 100%);
    }
    .card { position: absolute; inset: 0; }
    .card-in { position: absolute; inset: 0; color: #fbf6ec; }

    /* Map card (top-right) */
    .map-card {
      position: absolute; top: 52px; right: 72px; width: 220px;
      background: rgba(14, 11, 8, 0.84);
      border: 1px solid rgba(246, 217, 168, 0.24);
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      text-align: center;
    }
    .map-frame { width: 100%; height: 168px; display: flex; align-items: center; justify-content: center; }
    .mini-india-map { width: 100%; height: 100%; overflow: visible; display: block; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
    .map-outline { fill: rgba(251, 246, 236, 0.08); stroke: rgba(251, 246, 236, 0.45); stroke-width: 2px; vector-effect: non-scaling-stroke; }
    .map-state { fill: rgba(242, 180, 95, 0.5); stroke: #f2b45f; stroke-width: 2.5px; vector-effect: non-scaling-stroke; filter: drop-shadow(0 0 4px rgba(242, 180, 95, 0.6)); }
    .map-pin-pulse { fill: rgba(242, 180, 95, 0.25); stroke: #f2b45f; stroke-width: 2px; vector-effect: non-scaling-stroke; }
    .map-pin-core { fill: #ffffff; stroke: #f2b45f; stroke-width: 2px; vector-effect: non-scaling-stroke; filter: drop-shadow(0 0 6px #f2b45f); }
    .map-meta {
      margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(246, 217, 168, 0.16);
    }
    .map-state-name {
      display: block; font: 600 13px/1.2 'Hind', sans-serif; letter-spacing: 0.16em;
      color: #f2b45f; text-transform: uppercase;
    }
    .map-coords {
      display: block; font: 400 12px/1.3 'Hind', sans-serif;
      color: rgba(251, 246, 236, 0.65); letter-spacing: 0.06em; margin-top: 3px;
    }

    /* Bottom card deck */
    .card-deck {
      position: absolute; left: 72px; bottom: 52px; right: 72px;
      display: flex; justify-content: space-between; align-items: flex-end; gap: 48px;
    }
    .info-col { flex: 1; max-width: 1060px; }
    .badge-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
    .badge {
      display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 4px;
      font: 600 14px/1 'Hind', sans-serif; letter-spacing: 0.18em; text-transform: uppercase;
    }
    .badge-count { background: rgba(242, 180, 95, 0.18); border: 1px solid rgba(242, 180, 95, 0.45); color: #f2b45f; }
    .badge-type { background: rgba(251, 246, 236, 0.12); border: 1px solid rgba(251, 246, 236, 0.22); color: #fbf6ec; }
    .badge-unesco { background: rgba(86, 156, 255, 0.18); border: 1px solid rgba(86, 156, 255, 0.45); color: #9bc8ff; }

    .name { font: 400 68px/1.04 'Rozha One', serif; margin: 0; text-shadow: 0 3px 20px rgba(0, 0, 0, 0.5); }
    .local { font-size: 34px; font-weight: 500; line-height: 1.4; margin: 4px 0 0; color: #f6d9a8; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4); }
    .local[dir='rtl'] { text-align: left; }
    .place { font: 500 23px/1.3 'Hind', sans-serif; margin: 10px 0 0; color: #fbf6ec; display: flex; align-items: center; gap: 6px; }
    .pin-icon { color: #f2b45f; font-size: 19px; }

    .specs-row {
      display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px;
      font: 400 21px/1.3 'Hind', sans-serif; margin: 10px 0 0; color: rgba(251, 246, 236, 0.88);
    }
    .spec-pill { display: inline-flex; gap: 6px; }
    .spec-label { color: rgba(251, 246, 236, 0.65); }
    .spec-pill strong { color: #fbf6ec; font-weight: 600; }
    .spec-sep { color: rgba(242, 180, 95, 0.6); }

    .material {
      font: 400 20px/1.3 'Hind', sans-serif; margin: 8px 0 0; color: rgba(251, 246, 236, 0.85);
    }
    .mat-label { color: #f2b45f; font-weight: 600; margin-right: 6px; }

    /* Facts column (right) */
    .facts-col { width: 580px; flex-shrink: 0; }
    .facts-card {
      background: rgba(14, 11, 8, 0.84);
      border: 1px solid rgba(246, 217, 168, 0.24);
      border-radius: 14px;
      padding: 20px 24px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(10px);
    }
    .facts-header {
      font: 600 14px/1 'Hind', sans-serif; letter-spacing: 0.2em; color: #f2b45f;
      text-transform: uppercase; margin: 0 0 14px; padding-bottom: 10px;
      border-bottom: 1px solid rgba(246, 217, 168, 0.16);
      display: flex; align-items: center; gap: 8px;
    }
    .facts-header .gem { font-size: 14px; color: #f2b45f; }
    .facts-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
    .facts-list li {
      font: 400 17px/1.42 'Hind', sans-serif; color: rgba(251, 246, 236, 0.94);
      display: flex; align-items: flex-start; gap: 10px;
    }
    .fact-bullet { color: #f2b45f; font-size: 11px; margin-top: 5px; flex-shrink: 0; }
    .fact-text { flex: 1; }

    /* Journey caption, over the 3D map */
    .journey { position: absolute; left: 72px; bottom: 64px; color: #fbf6ec; }
    .journey-step { font: 600 15px/1 'Hind', sans-serif; letter-spacing: 0.24em; color: #f2b45f; text-transform: uppercase; }
    .journey-state { font: 400 76px/1.05 'Rozha One', serif; margin-top: 10px; text-shadow: 0 3px 22px rgba(0, 0, 0, 0.55); }
    .journey-route { font: 500 24px/1.3 'Hind', sans-serif; margin-top: 8px; color: rgba(251, 246, 236, 0.9); text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6); }
    .journey-route .arrow { color: #f2b45f; margin: 0 10px; }
    .journey-scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 360px; background: linear-gradient(to top, rgba(8, 6, 4, 0.7), transparent); }

    /* Name tag, over the close-ups */
    .tag { position: absolute; left: 72px; bottom: 60px; display: flex; align-items: center; gap: 16px; color: #fbf6ec; }
    .tag-bar { width: 4px; height: 58px; background: #f2b45f; border-radius: 2px; }
    .tag-name { font: 400 40px/1.05 'Rozha One', serif; text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6); }
    .tag-sub { font: 600 14px/1 'Hind', sans-serif; letter-spacing: 0.22em; color: #f2b45f; text-transform: uppercase; margin-top: 8px; }
    .tag-scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 240px; background: linear-gradient(to top, rgba(8, 6, 4, 0.6), transparent); }`;

rmSync(join(here, 'compositions/titles.html'), { force: true });
const hosts = [];
for (let p = 0; p < parts; p++) {
  const id = `titles-${pad(p + 1, 2)}`, first = p * PART, list = MONUMENTS.slice(first, first + PART);
  const partStart = SLOTS[first].start;
  const dur = f2(SLOTS[first + list.length - 1].start + SLOTS[first + list.length - 1].duration - partStart);
  const cards = list.map((m, k) => {
    const n = first + k + 1, cid = `t${pad(n)}`, slot = SLOTS[n - 1];
    const prev = n > 1 ? MONUMENTS[n - 2] : null;
    const rtl = ['ur', 'ks'].includes(m.lang) ? ' dir="rtl"' : '';
    const stateObj = INDIA.states.find((s) => s.name === m.state);
    const statePath = stateObj ? stateObj.d : '';
    const [pinX, pinY] = project(m.lat, m.lng);
    const isUnesco = m.facts.some((f) => /unesco/i.test(f));

    const city = (pl) => pl.split(',')[0].trim();
    return `    <div id="${cid}" class="clip card" data-start="${f2(slot.start - partStart)}" data-duration="${slot.duration}" data-track-index="2">
      <div id="${cid}-journey" class="card-in">
        <div class="journey-scrim"></div>
        <div class="journey">
          <div class="journey-step">${n === 1 ? 'The journey begins' : `Stop ${n} of ${N}`}</div>
          <div class="journey-state">${esc(m.state)}</div>
          <div class="journey-route">${prev ? `${esc(city(prev.place))}<span class="arrow">→</span>` : ''}${esc(m.place)}</div>
        </div>
      </div>
      <div id="${cid}-tag" class="card-in">
        <div class="tag-scrim"></div>
        <div class="tag">
          <div class="tag-bar"></div>
          <div>
            <div class="tag-name">${esc(m.name)}</div>
            <div class="tag-sub">Architectural details · ${esc(m.style)}</div>
          </div>
        </div>
      </div>
      <div id="${cid}-in" class="card-in">
        <div class="top-scrim"></div>
        <div class="scrim"></div>
        <!-- Top-Right Mini-Map Locator -->
        <div id="${cid}-map" class="map-card">
          <div class="map-frame">
            <svg viewBox="0 0 564.5 630.2" class="mini-india-map" aria-hidden="true">
              <path d="${INDIA.outline}" class="map-outline"></path>
              ${statePath ? `<path d="${statePath}" class="map-state"></path>` : ''}
              <circle cx="${pinX.toFixed(1)}" cy="${pinY.toFixed(1)}" r="14" class="map-pin-pulse"></circle>
              <circle cx="${pinX.toFixed(1)}" cy="${pinY.toFixed(1)}" r="5.5" class="map-pin-core"></circle>
            </svg>
          </div>
          <div class="map-meta">
            <span class="map-state-name">${esc(m.state)}</span>
            <span class="map-coords">${Math.abs(m.lat).toFixed(2)}° N, ${Math.abs(m.lng).toFixed(2)}° E</span>
          </div>
        </div>

        <!-- Bottom Title & Facts Deck -->
        <div class="card-deck">
          <div class="info-col">
            <div id="${cid}-badges" class="badge-row">
              <span class="badge badge-count">${pad(n)} / ${N}</span>
              <span class="badge badge-type">${CATEGORIES[m.type] || 'HERITAGE'}</span>
              ${isUnesco ? '<span class="badge badge-unesco">★ UNESCO WORLD HERITAGE</span>' : ''}
            </div>
            <h2 id="${cid}-name" class="name">${esc(m.name)}</h2>
            <p id="${cid}-local" class="local" lang="${m.lang}"${rtl} style="font-family: '${familyFor(m.lang)}', 'Hind', sans-serif">${esc(m.local)}</p>
            <p id="${cid}-place" class="place"><span class="pin-icon">📍</span> ${esc(m.place)}</p>
            <div id="${cid}-specs" class="specs-row">
              <span class="spec-pill"><span class="spec-label">${esc(m.stat[0])}:</span> <strong>${esc(m.stat[1])}</strong></span>
              <span class="spec-sep">·</span>
              <span class="spec-pill"><span class="spec-label">Built:</span> <strong>${esc(m.built)}</strong></span>
              <span class="spec-sep">·</span>
              <span class="spec-pill"><span class="spec-label">Style:</span> <strong>${esc(m.style)}</strong></span>
            </div>
            <p id="${cid}-material" class="material"><span class="mat-label">Material:</span> ${esc(m.material)}</p>
          </div>

          <div id="${cid}-facts-card" class="facts-col">
            <div class="facts-card">
              <div class="facts-header">
                <span class="gem">✦</span>
                <span>KEY HIGHLIGHTS</span>
              </div>
              <ul class="facts-list">
                ${m.facts.map((f, fi) => `<li id="${cid}-f${fi}"><span class="fact-bullet">◆</span><span class="fact-text">${esc(f)}</span></li>`).join('\n                ')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('\n');

  writeFileSync(join(here, `compositions/${id}.html`), `${GENERATED}
<template>
  <style>
${STYLE}
  </style>
  <div id="root" data-composition-id="${id}" data-start="0" data-duration="${dur}" data-width="1920" data-height="1080">
${cards}
  </div>
  <script>
    // Monuments ${first + 1}–${first + list.length}. Each slot: the journey caption over the map, the
    // title and facts over the orbit, a name tag over the close-ups; all gone before the dip.
    // [slot start, map end, orbit end, slot end], relative to this part.
    const SLOTS = ${JSON.stringify(list.map((_, k) => { const s = SLOTS[first + k], a = f2(s.start - partStart); return [a, f2(a + s.shots.map[1]), f2(a + s.shots.orbit[1]), f2(a + s.duration)]; }))};
    const tl = gsap.timeline({ paused: true });
    SLOTS.forEach(([t0, mapEnd, orbitEnd, end], k) => {
      const id = '#t' + String(${first + 1} + k).padStart(3, '0');
      tl.set([id + '-in', id + '-tag'], { opacity: 0 }, t0);
      tl.fromTo(id + '-journey', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, t0 + 0.5);
      tl.to(id + '-journey', { opacity: 0, duration: 0.35, ease: 'power2.in' }, mapEnd - 0.45);
      const o = mapEnd + 0.6;
      tl.set(id + '-in', { opacity: 1 }, o);
      tl.fromTo(id + '-map', { opacity: 0, scale: 0.88, y: -12 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power2.out' }, o + 0.35);
      tl.fromTo(id + '-badges', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, o + 0.45);
      tl.fromTo(id + '-name', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, o + 0.52);
      tl.fromTo(id + '-local', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, o + 0.6);
      tl.fromTo(id + '-place', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, o + 0.68);
      tl.fromTo(id + '-specs', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, o + 0.76);
      tl.fromTo(id + '-material', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, o + 0.84);
      tl.fromTo(id + '-facts-card', { opacity: 0, x: 25 }, { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out' }, o + 0.65);
      tl.fromTo(id + ' .facts-list li', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.12, ease: 'power2.out' }, o + 0.85);
      tl.to(id + '-in', { opacity: 0, duration: 0.4, ease: 'power2.in' }, orbitEnd - 0.5);
      tl.fromTo(id + '-tag', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, orbitEnd + 0.4);
      tl.to(id + '-tag', { opacity: 0, duration: 0.35, ease: 'power2.in' }, end - 0.6);
    });
    window.__timelines['${id}'] = tl;
  </script>
</template>
`);
  hosts.push(`      <div
        id="${id}"
        data-composition-id="${id}"
        data-composition-src="compositions/${id}.html"
        data-start="${partStart}"
        data-duration="${dur}"
        data-track-index="2"
        data-track-kind="graphics"
        data-width="1920"
        data-height="1080"
        style="z-index: 2"
      ></div>`);
}

// Written out tween by tween, so the file says exactly what plays when: a dip at every cut between
// monuments, and a quick one where the map's dive cuts to the drone shot and between the close-ups.
const dip = (cut, down, hold, upDur) => `    tl.fromTo('#dips-black', { opacity: 0 }, { opacity: 1, duration: ${down}, ease: 'power1.in', immediateRender: false }, ${f2(cut - down - hold / 2)});
    tl.fromTo('#dips-black', { opacity: 1 }, { opacity: 0, duration: ${upDur}, ease: 'power1.out', immediateRender: false }, ${f2(cut + hold / 2)});`;
const dips = SLOTS.flatMap((s, k) => {
  const out = [];
  if (k > 0) out.push(dip(s.start, 0.3, 0, 0.45));
  out.push(dip(s.start + s.shots.map[1], 0.18, 0.04, 0.3));
  const [d0, d1] = s.shots.details;
  out.push(dip(s.start + (d0 + d1) / 2, 0.15, 0.02, 0.25));
  return out;
}).join('\n');
writeFileSync(join(here, 'compositions/dips.html'), `${GENERATED}
<template>
  <style>
    #root { position: absolute; inset: 0; pointer-events: none; }
    #dips-black { position: absolute; inset: 0; background: #000; }
  </style>
  <div id="root" data-composition-id="dips" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
    <div id="dips-black"></div>
  </div>
  <script>
    // The film opens from black, dips to black at the cuts and closes on black.
    const tl = gsap.timeline({ paused: true });
    tl.fromTo('#dips-black', { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
${dips}
    tl.fromTo('#dips-black', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.in', immediateRender: false }, ${(total - 0.65).toFixed(2)});
    window.__timelines['dips'] = tl;
  </script>
</template>
`);

// Synchronize tour.html composition root
writeFileSync(join(here, 'compositions/tour.html'), `<template>
  <style>
    #root { position: absolute; inset: 0; background: #ebe2d3; }
    #tour-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  </style>
  <div id="root" data-composition-id="tour" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
    <canvas id="tour-canvas" width="1920" height="1080"></canvas>
  </div>
  <script type="module" src="compositions/tour.js"></script>
</template>
`);

// The sound is made locally, not committed (see README.md): the narration by
// ../tools/generate-narration.mjs; the score is your own file. Each is mounted only if it is there,
// so the film still previews and renders, silent, without them.
const THEME = 'assets/audio/monuments-theme.mp3', VOICE_TRACK = 'assets/audio/narration-master.mp3';
const audio = [];
if (existsSync(join(here, THEME))) audio.push(`      <audio
        id="theme-audio"
        src="${THEME}"
        data-start="0"
        data-duration="${total}"
        data-track-index="0"
        data-track-kind="audio"
        data-volume="0.28"
        data-fade-in="1.5"
        data-fade-out="4"
        loop
      ></audio>`);
else console.warn(`note: no ${THEME}, so the film has no background score (see README.md)`);
if (existsSync(join(here, VOICE_TRACK))) audio.push(`      <audio
        id="narration-audio"
        src="${VOICE_TRACK}"
        data-start="0"
        data-duration="${total}"
        data-track-index="4"
        data-track-kind="audio"
        preload="auto"
      ></audio>`);
else console.warn(`note: no ${VOICE_TRACK}: run node tools/generate-narration.mjs from the repository root to voice the narration`);
const audioTags = audio.length ? audio.join('\n') + '\n' : '';

writeFileSync(join(here, 'index.html'), `<!doctype html>
${GENERATED}
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Monuments of India</title>
    <script src="lib/gsap.min.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #000;
      }
    </style>
  </head>
  <body>
    <!-- A journey across India: ${N} monuments in ${Math.floor(total / 60)} min ${Math.round(total % 60)} s, each a 3D map flight, a drone orbit and close-ups, voiced by Sarvam (${TIMING.voice}). -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${audioTags}      <div
        id="tour"
        data-composition-id="tour"
        data-composition-src="compositions/tour.html"
        data-start="0"
        data-duration="${total}"
        data-track-index="1"
        data-track-kind="graphics"
        data-width="1920"
        data-height="1080"
        style="z-index: 1"
      ></div>
${hosts.join('\n')}
      <div
        id="dips"
        data-composition-id="dips"
        data-composition-src="compositions/dips.html"
        data-start="0"
        data-duration="${total}"
        data-track-index="3"
        data-track-kind="graphics"
        data-width="1920"
        data-height="1080"
        style="z-index: 3"
      ></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);

console.log(`synced ${N} monuments: site/js, lib/three (${wanted.size} addons), lib/gsap.min.js, assets/textures, assets/fonts (${faces.length} faces), timing.js, ${parts} title parts, dips, index.html (${total} s)`);
