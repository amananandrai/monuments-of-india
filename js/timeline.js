// The timeline page (timeline.html): a map of the subcontinent that changes with a year slider.
// Each era shows a border snapshot where one is drawn, a short history, and a pin for every
// monument standing by that year. A pin opens the monument's 3D model on the main page.
import { MONUMENTS } from './data.js';
import { ERAS, formatYear } from './timeline-data.js';
import { TMAP, project } from './timeline-map.js';

const TYPES = { sacred: 'Temples & shrines', fort: 'Forts & palaces', memorial: 'Tombs & memorials', civic: 'Civic & engineering' };
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text != null) e.textContent = text;
  return e;
};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- the slider's scale ---------- */
// Every era gets an equal stretch of the slider, so three years of Partition are as easy to reach
// as eighteen centuries of the Indus cities. STEP positions to an era.
const STEP = 100, MAX = ERAS.length * STEP;
const eraAt = (pos) => Math.min(ERAS.length - 1, Math.floor(pos / STEP));
const yearAt = (pos) => {
  const i = eraAt(pos), e = ERAS[i];
  return Math.round(e.start + ((pos - i * STEP) / STEP) * (e.end - e.start));
};
const posOf = (year) => {
  const y = Math.max(ERAS[0].start, Math.min(ERAS.at(-1).end, year));
  let i = ERAS.findIndex((e) => y < e.end);
  if (i < 0) i = ERAS.length - 1;
  const e = ERAS[i];
  return Math.round(i * STEP + ((y - e.start) / (e.end - e.start)) * STEP);
};

/* ---------- the map ---------- */
const svg = $('tl-map');
svg.setAttribute('viewBox', `0 0 ${TMAP.width} ${TMAP.height}`);
svg.innerHTML = `
  <defs>
    <pattern id="hatch-a" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatch a" x1="0" y1="0" x2="0" y2="6"/></pattern>
    <pattern id="hatch-b" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line class="hatch b" x1="0" y1="0" x2="0" y2="6"/></pattern>
    <pattern id="hatch-c" width="6" height="6" patternUnits="userSpaceOnUse"><line class="hatch c" x1="0" y1="0" x2="6" y2="0"/></pattern>
  </defs>
  <path class="land" d="${TMAP.land}"/>
  <g id="tl-fills"></g>
  <path class="rivers" d="${TMAP.rivers}"/>
  <path class="today" d="${TMAP.indiaToday}"><title>India’s boundary today</title></path>
  <g id="tl-labels"></g>
  <g id="tl-pins"></g>`;
const fillsG = $('tl-fills'), labelsG = $('tl-labels'), pinsG = $('tl-pins'), todayPath = svg.querySelector('.today');
const tip = $('tl-tip');

const pins = MONUMENTS.map((m) => {
  const [x, y] = project(m.lat, m.lng);
  const a = el('a', { href: `index.html#${m.id}`, class: `pin t-${m.type}`, 'aria-label': `${m.name}, ${m.place}, ${m.built}. Open the 3D model` });
  a.appendChild(el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 3 }));
  const show = () => {
    tip.innerHTML = `<strong>${esc(m.name)}</strong><span>${esc(m.place)} · ${esc(m.built)}</span><span>${esc(TYPES[m.type] || '')} · open in 3D</span>`;
    tip.hidden = false;
    const r = a.getBoundingClientRect(), host = tip.parentElement.getBoundingClientRect();
    const left = Math.min(host.width - tip.offsetWidth - 8, Math.max(8, r.left - host.left + 12));
    const top = r.top - host.top - tip.offsetHeight - 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${top < 8 ? r.bottom - host.top + 8 : top}px`;
  };
  const hide = () => { tip.hidden = true; };
  a.addEventListener('pointerenter', show);
  a.addEventListener('pointerleave', hide);
  a.addEventListener('focus', show);
  a.addEventListener('blur', hide);
  return { m, a, circle: a.firstChild };
}).sort((p, q) => p.m.year - q.m.year);

let shownEra = -1;
function drawEra(i) {
  if (i === shownEra) return;
  shownEra = i;
  const map = ERAS[i].map;
  fillsG.replaceChildren();
  labelsG.replaceChildren();
  // India's boundary today stays as a dashed reference, unless the snapshot is drawn from it.
  todayPath.style.display = map && map.fills.some(([s]) => s === 'india') ? 'none' : '';
  if (!map) return;
  for (const [shape, cls, name] of map.fills) {
    const g = el('g', { class: `polity ${cls}` });
    g.appendChild(el('path', { class: 'tint', d: TMAP.shapes[shape] }));
    g.appendChild(el('path', { class: 'hatched', d: TMAP.shapes[shape], fill: `url(#hatch-${cls})` }));
    g.appendChild(el('title', {}, name));
    fillsG.appendChild(g);
  }
  for (const [name, lat, lng, kind] of map.labels) {
    const [x, y] = project(lat, lng);
    if (kind.startsWith('city')) {
      const left = kind === 'city-left';
      labelsG.appendChild(el('rect', { class: 'city-dot', x: x - 2.2, y: y - 2.2, width: 4.4, height: 4.4 }));
      labelsG.appendChild(el('text', { class: 'lab city', x: x + (left ? -5.5 : 5.5), y: y + 3.4, 'text-anchor': left ? 'end' : 'start' }, name));
      continue;
    }
    // A long name on the main power breaks into two lines.
    const words = name.split(' '), two = kind === 'main' && name.length > 16;
    const t = el('text', { class: `lab ${kind}`, x, y, 'text-anchor': 'middle' });
    if (two) {
      const half = Math.ceil(words.length / 2);
      t.appendChild(el('tspan', { x, dy: '-0.55em' }, words.slice(0, half).join(' ')));
      t.appendChild(el('tspan', { x, dy: '1.15em' }, words.slice(half).join(' ')));
    } else t.textContent = name;
    labelsG.appendChild(t);
  }
}

function drawPins(year, era) {
  const frag = document.createDocumentFragment();
  let standing = 0;
  for (const p of pins) {
    if (p.m.year > year) break;
    standing++;
    const fresh = p.m.year >= era.start;
    p.a.classList.toggle('fresh', fresh);
    p.circle.setAttribute('r', fresh ? 4.6 : 2.6);
    frag.appendChild(p.a);          // sorted by year, so the era's own pins are drawn on top
  }
  pinsG.replaceChildren(frag);
  return standing;
}

/* ---------- the card ---------- */
const byId = new Map(MONUMENTS.map((m) => [m.id, m]));
let cardEra = -1;
function drawCard(i) {
  if (i === cardEra) return;
  cardEra = i;
  const e = ERAS[i];
  $('c-count').textContent = `Era ${i + 1} of ${ERAS.length}`;
  $('c-name').textContent = e.name;
  $('c-span').textContent = e.span;
  $('c-powers').textContent = e.powers;
  $('c-change').textContent = e.change;
  $('c-dates').innerHTML = e.dates.map((d) => `<li>${esc(d)}</li>`).join('');
  $('c-map').innerHTML = e.map
    ? `<strong>${esc(e.map.title)}.</strong> ${esc(e.map.certainty)}`
    : '<strong>Borders for this era are not drawn yet.</strong> The dashed line is India’s boundary today, for reference.';
  const lead = e.lead && byId.get(e.lead);
  $('c-lead').innerHTML = lead
    ? `<a class="lead" href="index.html#${lead.id}">
         <img src="assets/views/${lead.id}.png" alt="" width="800" height="450" loading="lazy">
         <span class="lead-text"><strong>${esc(lead.name)}</strong><span>${esc(lead.place)} · ${esc(lead.built)}</span><span class="go">Open the 3D model →</span></span>
       </a>`
    : `<p class="lead-none">${esc(e.leadNote || '')}</p>`;
  const built = MONUMENTS.filter((m) => m.year >= e.start && m.year < e.end && m.id !== e.lead).sort((a, b) => a.year - b.year);
  $('c-built-wrap').hidden = !built.length;
  $('c-built-title').textContent = `Also built in this era (${built.length})`;
  $('c-built').innerHTML = built.map((m) => `<li><a href="index.html#${m.id}">${esc(m.name)}</a> <span>${esc(m.built)}</span></li>`).join('');
  $('tl-card').scrollTop = 0;
}

/* ---------- the slider ---------- */
const range = $('tl-range'), bands = $('tl-bands');
range.max = MAX;
bands.innerHTML = ERAS.map((e, i) => `<button type="button" class="band" data-i="${i}" title="${esc(e.name)}, ${esc(e.span)}"><span>${esc(e.short)}</span></button>`).join('');
const bandEls = [...bands.children];

function show(pos, { url = true, exact } = {}) {
  pos = Math.max(0, Math.min(MAX, Math.round(pos)));
  if (+range.value !== pos) range.value = pos;
  // `exact` is a year asked for by address: shown as given, where the slider's step would round it.
  const i = eraAt(pos), era = ERAS[i], year = exact ?? yearAt(pos);
  $('tl-year').textContent = formatYear(year);
  $('tl-era').textContent = era.name;
  range.setAttribute('aria-valuetext', `${formatYear(year)}, ${era.name}`);
  bandEls.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i); });
  drawEra(i);
  const standing = drawPins(year, era);
  $('tl-standing').textContent = standing === 1 ? '1 monument standing' : `${standing} monuments standing`;
  drawCard(i);
  $('tl-prev').disabled = i === 0;
  $('tl-next').disabled = i === ERAS.length - 1;
  if (url) history.replaceState(null, '', `#${year}`);
}

// A band or the arrows open an era at its last year, so all of the era's monuments are on the map.
const openEra = (i) => show(i * STEP + STEP - 1);

range.addEventListener('input', () => { stop(); show(+range.value); });
bands.addEventListener('click', (ev) => {
  const b = ev.target.closest('.band');
  if (b) { stop(); openEra(+b.dataset.i); }
});
$('tl-prev').addEventListener('click', () => { stop(); openEra(Math.max(0, eraAt(+range.value) - 1)); });
$('tl-next').addEventListener('click', () => { stop(); openEra(Math.min(ERAS.length - 1, eraAt(+range.value) + 1)); });

/* ---------- play ---------- */
const playBtn = $('tl-play');
let timer = 0;
function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = 0;
  playBtn.setAttribute('aria-pressed', 'false');
  playBtn.querySelector('.tl-label').textContent = 'Play';
}
playBtn.addEventListener('click', () => {
  if (timer) return stop();
  if (+range.value >= MAX) show(0);
  playBtn.setAttribute('aria-pressed', 'true');
  playBtn.querySelector('.tl-label').textContent = 'Pause';
  // With reduced motion, step an era at a time instead of sweeping through the years.
  const tick = reduceMotion
    ? () => { const i = eraAt(+range.value); if (i >= ERAS.length - 1) return stop(); openEra(i + 1); }
    : () => { const p = +range.value + 2; show(p); if (p >= MAX) stop(); };
  timer = setInterval(tick, reduceMotion ? 2500 : 60);
});

/* ---------- start ---------- */
// timeline.html#1605 opens at that year; with no year the page opens on the Mauryas.
function fromHash() {
  const y = parseInt(location.hash.slice(1), 10);
  const year = Number.isFinite(y) ? Math.max(ERAS[0].start, Math.min(ERAS.at(-1).end, y)) : -250;
  show(posOf(year), { url: Number.isFinite(y), exact: year });
}
addEventListener('hashchange', fromHash);
fromHash();
