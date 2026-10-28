// Brings the website's monuments into this video project, so the film draws the same 101 models the
// site does. Run before preview, check or render (the npm scripts do it for you):
//
// - copies ../js into site/js, pointing its three.js imports at the local copy in lib/three, since a
//   render never fetches from a CDN;
// - copies the three.js build and the addons the scene uses, and GSAP, into lib/;
// - copies the photo textures into assets/textures and the title fonts into assets/fonts;
// - writes the title cards (compositions/titles-01..11.html), the dips to black (dips.html) and the
//   root index.html that mounts them, from js/data.js.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const nm = join(here, 'node_modules');
const SEG = 5;

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
const wanted = new Set(['postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js', 'postprocessing/OutputPass.js']);

/* ---------- the site's modules ---------- */
const siteJs = join(here, 'site/js');
rmSync(join(here, 'site'), { recursive: true, force: true });
// The app shell (controls, map, sidebar) is not part of the film.
const skip = new Set(['main.js', 'map.js', 'india-map.js']);
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
  const name = src.split('/').pop();
  cpSync(src, join(fontDir, name));
  faces.push(`@font-face { font-family: '${s.family}'; font-weight: 500; font-style: normal; font-display: block; src: url('assets/fonts/${name}') format('woff2'); }`);
}
const familyFor = (lang) => Object.values(SCRIPTS).find((s) => s.langs.includes(lang))?.family || 'Noto Sans Devanagari';

/* ---------- the title cards, the dips to black and the root ---------- */
// Titles come in parts of ten monuments (one sub-composition each, 50 s), so every file stays small
// enough to read and edit; the dips to black between monuments are their own scene; the root mounts
// the tour, the eleven title parts and the dips. All three are generated: edit js/data.js or this
// script, not the files.
const { MONUMENTS } = await import(pathToFileURL(join(siteJs, 'data.js')).href);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n, w = 3) => String(n).padStart(w, '0');
const N = MONUMENTS.length, PART = 10, total = N * SEG, parts = Math.ceil(N / PART);
const GENERATED = '<!-- Generated by sync-site.mjs from js/data.js: edit the data or the generator, not this file. -->';
const STYLE = `    ${faces.join('\n    ')}
    #root { position: absolute; inset: 0; pointer-events: none; }
    .scrim {
      position: absolute; left: 0; right: 0; bottom: 0; height: 720px;
      background: linear-gradient(to top, rgba(10, 8, 6, 0.84), rgba(10, 8, 6, 0.7) 42%, rgba(10, 8, 6, 0.4) 68%, rgba(10, 8, 6, 0));
    }
    .card { position: absolute; left: 192px; bottom: 132px; width: 1200px; }
    .card-in { color: #fbf6ec; }
    .count { font: 600 28px/1 'Hind', sans-serif; letter-spacing: 0.22em; color: #f2b45f; margin: 0 0 18px; }
    .name { font: 400 84px/1.02 'Rozha One', serif; margin: 0; text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35); }
    .local { font-size: 40px; font-weight: 500; line-height: 1.6; margin: 6px 0 0; color: #f6d9a8; }
    .local[dir='rtl'] { text-align: left; }
    .place { font: 500 30px/1.3 'Hind', sans-serif; margin: 14px 0 0; }
    .facts { font: 400 28px/1.3 'Hind', sans-serif; margin: 8px 0 0; color: rgba(251, 246, 236, 0.82); }`;

rmSync(join(here, 'compositions/titles.html'), { force: true });
const hosts = [];
for (let p = 0; p < parts; p++) {
  const id = `titles-${pad(p + 1, 2)}`, first = p * PART, list = MONUMENTS.slice(first, first + PART), dur = list.length * SEG;
  const cards = list.map((m, k) => {
    const n = first + k + 1, cid = `t${pad(n)}`;
    const rtl = ['ur', 'ks'].includes(m.lang) ? ' dir="rtl"' : '';
    return `    <div id="${cid}" class="clip card" data-start="${k * SEG}" data-duration="${SEG}" data-track-index="2">
      <div id="${cid}-in" class="card-in">
        <p id="${cid}-count" class="count">${pad(n)} / ${N}</p>
        <h2 id="${cid}-name" class="name">${esc(m.name)}</h2>
        <p id="${cid}-local" class="local" lang="${m.lang}"${rtl} style="font-family: '${familyFor(m.lang)}', 'Hind', sans-serif">${esc(m.local)}</p>
        <p id="${cid}-place" class="place">${esc(m.place)}</p>
        <p id="${cid}-facts" class="facts">${esc(m.stat[0])} ${esc(m.stat[1])} · ${esc(m.built)} · ${esc(m.style)}</p>
      </div>
    </div>`;
  }).join('\n');
  writeFileSync(join(here, `compositions/${id}.html`), `${GENERATED}
<template>
  <style>
${STYLE}
  </style>
  <div id="root" data-composition-id="${id}" data-start="0" data-duration="${dur}" data-width="1920" data-height="1080">
    <div id="${id}-scrim" class="scrim"></div>
${cards}
  </div>
  <script>
    // Monuments ${first + 1}–${first + list.length}: each card's lines rise in one after another, and the card
    // leaves just before the cut.
    const tl = gsap.timeline({ paused: true });
    for (let k = 0; k < ${list.length}; k++) {
      const id = '#t' + String(${first + 1} + k).padStart(3, '0'), t0 = k * ${SEG};
      ['count', 'name', 'local', 'place', 'facts'].forEach((part, j) => {
        tl.fromTo(id + '-' + part, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, t0 + 0.45 + j * 0.08);
      });
      tl.fromTo(id + '-in', { opacity: 1 }, { opacity: 0, duration: 0.35, ease: 'power2.in', immediateRender: false }, t0 + ${SEG} - 0.55);
    }
    window.__timelines['${id}'] = tl;
  </script>
</template>
`);
  hosts.push(`      <div
        id="${id}"
        data-composition-id="${id}"
        data-composition-src="compositions/${id}.html"
        data-start="${first * SEG}"
        data-duration="${dur}"
        data-track-index="2"
        data-track-kind="graphics"
        data-width="1920"
        data-height="1080"
        style="z-index: 2"
      ></div>`);
}

// Written out tween by tween, so the file says exactly what plays when.
const dips = MONUMENTS.slice(1).map((_, k) => {
  const cut = (k + 1) * SEG;
  return `    tl.fromTo('#dips-black', { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power1.in', immediateRender: false }, ${(cut - 0.3).toFixed(2)});
    tl.fromTo('#dips-black', { opacity: 1 }, { opacity: 0, duration: 0.4, ease: 'power1.out', immediateRender: false }, ${cut});`;
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
    // The film opens from black, dips to black at each of the ${N - 1} cuts and closes on black.
    const tl = gsap.timeline({ paused: true });
    tl.fromTo('#dips-black', { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
${dips}
    tl.fromTo('#dips-black', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.in', immediateRender: false }, ${(total - 0.65).toFixed(2)});
    window.__timelines['dips'] = tl;
  </script>
</template>
`);

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
    <!-- ${N} monuments, ${SEG} seconds each: the 3D tour, the title cards over it and the dips to black. -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
      <div
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

console.log(`synced ${N} monuments: site/js, lib/three (${wanted.size} addons), lib/gsap.min.js, assets/textures, assets/fonts (${faces.length} faces), ${parts} title parts, dips, index.html (${total} s)`);
