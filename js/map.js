import { INDIA, project } from './india-map.js';

export const TYPES = {
  sacred: 'Temples & shrines',
  fort: 'Forts & palaces',
  memorial: 'Tombs & memorials',
  civic: 'Civic & engineering',
};

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

// The map home view: state outlines, one pin per monument, and numbered cluster pins
// that zoom in to separate monuments too close together to tell apart.
export function createMap(root, items, { onSelect }) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.innerHTML = `
    <svg class="map-svg" role="group" aria-label="Map of India with monument locations" preserveAspectRatio="xMidYMid meet">
      <g class="states"></g><path class="outline"></path><g class="pins"></g>
    </svg>
    <div class="maphead">
      <h2>Explore by map</h2>
      <p>Select a pin to open its 3D model. Numbered pins group monuments that sit close together; select one to zoom in.</p>
      <button type="button" class="btn" id="map-reset" hidden>Show all of India</button>
    </div>
    <ul class="legend">${Object.entries(TYPES).map(([k, v]) => `<li><span class="dot t-${k}"></span>${v}</li>`).join('')}</ul>
    <div class="maptip" role="tooltip" hidden></div>`;
  const svg = root.querySelector('svg');
  const pinsG = svg.querySelector('.pins');
  const tip = root.querySelector('.maptip');
  const resetBtn = root.querySelector('#map-reset');

  const statesG = svg.querySelector('.states');
  for (const s of INDIA.states) {
    const p = el('path', { d: s.d, class: 'state' });
    p.appendChild(el('title')).textContent = s.name;
    statesG.appendChild(p);
  }
  svg.querySelector('.outline').setAttribute('d', INDIA.outline);

  const full = { x: 0, y: 0, w: INDIA.width, h: INDIA.height };
  let vb = { ...full }, hl = null, anim = 0;
  const pts = items.map((m) => { const [x, y] = project(m.lat, m.lng); return { m, x, y }; });

  const setVB = (v) => { vb = v; svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); };
  const pxPerUnit = () => {
    const r = svg.getBoundingClientRect();
    return Math.min(r.width / vb.w, r.height / vb.h) || 1;
  };

  function clusters(gap) {
    const cs = [];
    for (const p of pts) {
      const c = cs.find((c) => Math.hypot(c.x - p.x, c.y - p.y) < gap);
      if (c) {
        c.members.push(p);
        c.x = c.members.reduce((s, q) => s + q.x, 0) / c.members.length;
        c.y = c.members.reduce((s, q) => s + q.y, 0) / c.members.length;
      } else cs.push({ x: p.x, y: p.y, members: [p] });
    }
    return cs;
  }

  function render() {
    const s = pxPerUnit(), R = 7 / s, labelled = full.w / vb.w > 3;
    pinsG.replaceChildren();
    const cs = clusters(17 / s), fs = 12.5 / s;
    const labelText = (c) => (c.members.length === 1 ? c.members[0].m.name : c.members.map((q) => q.m.name).join(' · '));
    // A label goes on the left of its pin when another pin sits where it would run on the right.
    const leftSide = (c) => {
      const w = labelText(c).length * fs * 0.55 + R * 2.5;
      return cs.some((o) => o !== c && o.x > c.x && o.x < c.x + w && Math.abs(o.y - c.y) < fs);
    };
    for (const c of cs) {
      const single = c.members.length === 1, m = c.members[0].m;
      const g = el('g', {
        class: single ? `pin t-${m.type}` : 'pin cluster',
        tabindex: '0',
        role: 'button',
        'aria-label': single ? `${m.name}, ${m.place}` : `${c.members.length} monuments: ${c.members.map((q) => q.m.name).join(', ')}. Zoom in`,
      });
      g.dataset.ids = c.members.map((q) => q.m.id).join(' ');
      g.appendChild(el('circle', { cx: c.x, cy: c.y, r: single ? R : R * 1.55 }));
      if (!single) {
        const t = el('text', { x: c.x, y: c.y, 'font-size': 11 / s, dy: '0.36em', 'text-anchor': 'middle' });
        t.textContent = c.members.length;
        g.appendChild(t);
      }
      // Zoomed in, there is room to name each pin.
      if (labelled) {
        const off = R * (single ? 1.7 : 2.3), left = leftSide(c);
        const t = el('text', { x: c.x + (left ? -off : off), y: c.y, 'font-size': fs, dy: '0.35em', class: 'pin-label', 'text-anchor': left ? 'end' : 'start' });
        t.textContent = labelText(c);
        g.appendChild(t);
      }
      const activate = () => (single ? onSelect(m.id) : zoomTo(c.members));
      g.addEventListener('click', activate);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
      g.addEventListener('pointerenter', (e) => showTip(c, e.clientX, e.clientY));
      g.addEventListener('pointermove', (e) => moveTip(e.clientX, e.clientY));
      g.addEventListener('pointerleave', hideTip);
      g.addEventListener('focus', () => { const b = g.getBoundingClientRect(); showTip(c, b.right, b.top + b.height / 2); });
      g.addEventListener('blur', hideTip);
      pinsG.appendChild(g);
    }
    applyHighlight();
    resetBtn.hidden = vb.w >= full.w - 0.5;
  }

  function showTip(c, x, y) {
    const names = c.members.map((q) => q.m.name);
    tip.innerHTML = '';
    const strong = document.createElement('strong');
    const small = document.createElement('span');
    if (c.members.length === 1) {
      strong.textContent = names[0];
      small.textContent = c.members[0].m.place;
    } else {
      strong.textContent = `${names.length} monuments`;
      small.textContent = names.slice(0, 5).join(', ') + (names.length > 5 ? ` and ${names.length - 5} more` : '');
    }
    tip.append(strong, small);
    tip.hidden = false;
    moveTip(x, y);
  }
  function moveTip(x, y) {
    if (tip.hidden) return;
    const r = root.getBoundingClientRect();
    const left = Math.min(x - r.left + 14, r.width - tip.offsetWidth - 8);
    const top = Math.max(8, Math.min(y - r.top - tip.offsetHeight / 2, r.height - tip.offsetHeight - 8));
    tip.style.left = `${Math.max(8, left)}px`;
    tip.style.top = `${top}px`;
  }
  function hideTip() { tip.hidden = true; }

  function animateTo(target) {
    cancelAnimationFrame(anim);
    hideTip();
    if (reduceMotion) { setVB(target); render(); return; }
    const from = { ...vb }, t0 = performance.now(), dur = 650;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setVB({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
      render();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  function zoomTo(members) {
    const xs = members.map((p) => p.x), ys = members.map((p) => p.y);
    const r = svg.getBoundingClientRect(), ar = r.width / r.height || 1;
    const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
    const pad = Math.max(bw, bh) * 0.5 + 0.6;
    let w = Math.max(bw + pad * 2, (bh + pad * 2) * ar), h = w / ar;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    animateTo({ x: cx - w / 2, y: cy - h / 2, w, h });
  }
  resetBtn.addEventListener('click', () => animateTo({ ...full }));

  function applyHighlight() {
    pinsG.querySelectorAll('.pin').forEach((g) => g.classList.toggle('hl', !!hl && g.dataset.ids.split(' ').includes(hl)));
  }

  setVB(full);
  new ResizeObserver(() => render()).observe(root);
  return {
    render,
    highlight(id) { hl = id; applyHighlight(); },
  };
}
