import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { nightState, V, box } from './helpers.js';
import { attachSurface, surface } from './surface.js';
import { separateCoplanar } from './coplanar.js';
import { naturalize } from './naturalize.js';
import { loadPhotoTextures } from './textures.js';
import { MONUMENTS } from './data.js';
import { createMap } from './map.js';

/* ---------- scene ---------- */
const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
const statusEl = document.getElementById('status');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  statusEl.textContent = 'Your browser could not start WebGL, which this page needs to draw the 3D models.';
  throw e;
}
// Ambient occlusion is skipped on phone-sized screens, where it costs too much.
const fancy = !matchMedia('(max-width: 760px)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, fancy ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
loadPhotoTextures(renderer);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 20000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = !reduceMotion;
controls.autoRotateSpeed = 0.6;
controls.maxPolarAngle = Math.PI / 2 - 0.04;

const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } },
  vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 horizon; varying vec3 vDir; void main(){ float t = pow(clamp(vDir.y,0.0,1.0),0.55); gl_FragColor = vec4(mix(horizon, top, t),1.0); \n#include <colorspace_fragment>\n }',
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), skyMat);
sky.renderOrder = -1;
sky.frustumCulled = false;
scene.add(sky);

const groundMat = surface(attachSurface(new THREE.MeshStandardMaterial({ roughness: 1, envMapIntensity: 0.5 })), 'ground');
const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 96), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
// The ground sits behind everything in depth, so river sheets and lawns a few centimetres above it
// always win, even kilometres away where the depth buffer is coarse.
groundMat.polygonOffset = true;
groundMat.polygonOffsetFactor = 1;
groundMat.polygonOffsetUnits = 1;
scene.add(ground);

scene.fog = new THREE.Fog(0xffffff, 100, 1000);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
scene.add(hemiLight);
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun, sun.target);
const flood = new THREE.DirectionalLight(0xffb36b, 0);
scene.add(flood, flood.target);

// An environment map rendered from the same sky and ground, so gold, bronze and polished
// marble reflect their surroundings; it also supplies soft ambient light.
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
const envGroundMat = new THREE.MeshBasicMaterial();
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), skyMat));
const envGround = new THREE.Mesh(new THREE.CircleGeometry(10, 32), envGroundMat);
envGround.rotation.x = -Math.PI / 2;
envGround.position.y = -0.4;
envScene.add(envGround);
let envRT = null;
function updateEnvironment() {
  if (envRT) envRT.dispose();
  envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
}

// Post-processing: ambient occlusion in corners and under eaves, and a glow for lights at night.
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, 1, 1);
gtao.enabled = fancy;
composer.addPass(gtao);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.5, 0.9);
bloom.enabled = false;
composer.addPass(bloom);
composer.addPass(new OutputPass());

function applyTheme() {
  const cs = getComputedStyle(document.documentElement);
  const col = (n) => new THREE.Color(cs.getPropertyValue(n).trim() || '#888');
  const night = cs.getPropertyValue('--scene-mode').trim() === 'night';
  skyMat.uniforms.top.value.copy(col('--sky-top'));
  skyMat.uniforms.horizon.value.copy(col('--sky-horizon'));
  groundMat.color.copy(col('--ground'));
  scene.fog.color.copy(col('--sky-horizon'));
  nightState.on = night;
  nightState.objects.forEach((o) => { o.visible = night; });
  envGroundMat.color.copy(col('--ground')).multiplyScalar(0.8);
  bloom.enabled = night;
  if (night) {
    hemiLight.color.set('#8796c8'); hemiLight.groundColor.set('#2a2630'); hemiLight.intensity = 0.3;
    sun.color.set('#a9b8ff'); sun.intensity = 0.7;
    flood.intensity = 1.6;
  } else {
    hemiLight.color.set('#d4e4ff'); hemiLight.groundColor.set('#b49a72'); hemiLight.intensity = 0.45;
    sun.color.set('#fff1dc'); sun.intensity = 2.8;
    flood.intensity = 0;
  }
  updateEnvironment();
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });

/* ---------- framing & switching ---------- */
const built = new Map();
let current = -1, home = null, tween = null;

function getBuilt(i) {
  if (!built.has(i)) {
    const r = MONUMENTS[i].build();
    r.focus = r.focus || r.group;
    naturalize(r.group);
    // Faces that share a plane get different depth offsets, so they don't flicker.
    separateCoplanar(r.group, 0.005);
    scene.add(r.group);
    built.set(i, r);
  }
  return built.get(i);
}

function computeHome(r) {
  const box = new THREE.Box3().setFromObject(r.focus);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = size.length() / 2;
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const dist = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.02;
  const dir = V(...(r.view || [0.9, 0.34, 1.25])).normalize();
  const target = V(center.x, center.y * 0.95, center.z);
  return { target, pos: target.clone().addScaledVector(dir, dist), dist, radius };
}

function setEnvironment(h) {
  const { dist, radius, target } = h;
  camera.near = Math.max(0.1, dist / 300);
  camera.far = dist * 14;
  camera.updateProjectionMatrix();
  sky.scale.setScalar(camera.far * 0.9);
  ground.scale.setScalar(dist * 8);
  scene.fog.near = dist * 1.6;
  scene.fog.far = dist * 7;
  controls.minDistance = radius * 0.35;
  controls.maxDistance = dist * 3;
  const sdir = V(-0.55, 0.85, 0.45).normalize();
  sun.position.copy(target).addScaledVector(sdir, radius * 3);
  sun.target.position.copy(target);
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -radius * 1.4;
  sc.right = sc.top = radius * 1.4;
  sc.near = radius * 0.5;
  sc.far = radius * 6;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = radius * 0.0012;
  // Scale the occlusion radius to the monument: a kiosk and a 700 m bridge need very different reaches.
  gtao.updateGtaoMaterial({ radius: THREE.MathUtils.clamp(radius * 0.04, 0.8, 24), thickness: 1, distanceExponent: 1, scale: 1.1 });
  flood.position.copy(target).addScaledVector(V(0.35, 0.3, 1).normalize(), radius * 3);
  flood.target.position.copy(target);
}

function flyTo(h, instant) {
  if (instant || reduceMotion) {
    camera.position.copy(h.pos);
    controls.target.copy(h.target);
    tween = null;
    controls.update();
    return;
  }
  tween = { t0: performance.now(), dur: 1100, fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: h.pos, toTarget: h.target };
}
controls.addEventListener('start', () => { tween = null; });


function select(i, instant = false) {
  if (i !== current) {
    const r = getBuilt(i);
    built.forEach((b, k) => { b.group.visible = k === i; });
    const first = current === -1;
    current = i;
    // Switching between very different scales: start the flight from the same angle, scaled to the new size.
    if (!first && !instant) {
      const prevDist = camera.position.distanceTo(controls.target);
      home = computeHome(r);
      const off = camera.position.clone().sub(controls.target).normalize().multiplyScalar(Math.max(prevDist, home.dist * 1.6));
      controls.target.copy(home.target);
      camera.position.copy(home.target).add(off);
    } else {
      home = computeHome(r);
    }
    setEnvironment(home);
    flyTo(home, first || instant);
    renderInfo(MONUMENTS[i]);
  }
  items.forEach((el, k) => el.setAttribute('aria-current', String(k === i)));
  items[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
}

/* ---------- sidebar: grouped by state, with search ---------- */
const $ = (id) => document.getElementById(id);
const byId = new Map(MONUMENTS.map((m, i) => [m.id, i]));
const items = new Array(MONUMENTS.length);
const order = [];
const list = $('list');
const groups = new Map();
MONUMENTS.forEach((m, i) => { if (!groups.has(m.state)) groups.set(m.state, []); groups.get(m.state).push(i); });
[...groups.keys()].sort().forEach((state) => {
  const g = document.createElement('li');
  g.className = 'grp';
  const h = document.createElement('button');
  h.type = 'button';
  h.className = 'grp-h';
  h.setAttribute('aria-expanded', 'true');
  h.innerHTML = '<span class="grp-name"></span><span class="grp-n"></span>';
  h.querySelector('.grp-name').textContent = state;
  h.querySelector('.grp-n').textContent = groups.get(state).length;
  const ul = document.createElement('ul');
  h.addEventListener('click', () => {
    const open = h.getAttribute('aria-expanded') !== 'true';
    h.setAttribute('aria-expanded', String(open));
    ul.hidden = !open;
  });
  for (const i of groups.get(state)) {
    const mo = MONUMENTS[i];
    order.push(i);
    const li = document.createElement('li');
    li.dataset.i = i;
    const b = document.createElement('button');
    b.className = 'item';
    b.type = 'button';
    b.innerHTML = `<span class="name"></span><span class="h"></span><span class="place"></span>`;
    b.querySelector('.name').textContent = mo.name;
    b.querySelector('.h').textContent = mo.stat[1];
    b.querySelector('.place').textContent = mo.place;
    b.addEventListener('click', () => showMonument(i, { push: mode === 'map' }));
    b.addEventListener('pointerenter', () => map.highlight(mo.id));
    b.addEventListener('pointerleave', () => map.highlight(null));
    b.addEventListener('focus', () => map.highlight(mo.id));
    b.addEventListener('blur', () => map.highlight(null));
    items[i] = b;
    li.appendChild(b);
    ul.appendChild(li);
  }
  g.append(h, ul);
  list.appendChild(g);
});
const q = $('q');
q.placeholder = `Search ${MONUMENTS.length} monuments`;
q.addEventListener('input', () => {
  const t = q.value.trim().toLowerCase();
  list.querySelectorAll('.grp').forEach((g) => {
    let any = false;
    g.querySelectorAll('li').forEach((li) => {
      const m = MONUMENTS[+li.dataset.i];
      const hit = !t || `${m.name} ${m.place} ${m.state} ${m.style}`.toLowerCase().includes(t);
      li.hidden = !hit;
      any = any || hit;
    });
    g.hidden = !any;
    if (t) { g.querySelector('ul').hidden = false; g.querySelector('.grp-h').setAttribute('aria-expanded', 'true'); }
  });
  $('q-empty').hidden = !!list.querySelector('.grp:not([hidden])');
});
$('sub').textContent = `${MONUMENTS.length} landmarks modelled in 3D at their real proportions. Pick one on the map or from the list, then drag to walk around it.`;

function renderInfo(mo) {
  $('p-place').textContent = mo.place;
  $('p-name').textContent = mo.name;
  $('p-local').textContent = mo.local;
  $('p-local').lang = mo.lang;
  $('p-stat-label').textContent = mo.stat[0];
  $('p-stat').textContent = mo.stat[1];
  $('p-built').textContent = mo.built;
  $('p-style').textContent = mo.style;
  $('p-material').textContent = mo.material;
  const ul = $('p-facts');
  ul.replaceChildren(...mo.facts.map((t) => { const li = document.createElement('li'); li.textContent = t; return li; }));
}
// On phones the plaque sits below the model as a collapsed bar; tapping it reveals the details.
const plaque = $('plaque'), pToggle = $('p-toggle');
function setPlaqueOpen(open) {
  plaque.classList.toggle('is-open', open);
  pToggle.setAttribute('aria-expanded', String(open));
  pToggle.querySelector('.visually-hidden').textContent = open ? 'Hide details' : 'Show details';
}
pToggle.addEventListener('click', () => setPlaqueOpen(!plaque.classList.contains('is-open')));
plaque.querySelector('.p-head').addEventListener('click', (e) => { if (!e.target.closest('.p-toggle') && pToggle.offsetParent) pToggle.click(); });

/* ---------- views: the map home and a monument's 3D scene ---------- */
let mode = 'map';
const map = createMap($('mapview'), MONUMENTS, { onSelect: (id) => showMonument(byId.get(id), { push: true }) });

function setUrl(hash, push) {
  const url = hash ? `#${hash}` : location.pathname + location.search;
  try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) { /* ignore */ }
}
function showMonument(i, { push = false, instant = false } = {}) {
  mode = 'monument';
  stage.classList.remove('is-map');
  resize();
  select(i, instant);
  setUrl(MONUMENTS[i].id, push);
  document.title = `${MONUMENTS[i].name} · Monuments of India`;
}
function showMap(push = false) {
  mode = 'map';
  stage.classList.add('is-map');
  items.forEach((el) => el.setAttribute('aria-current', 'false'));
  setUrl('', push);
  document.title = 'Monuments of India';
  map.render();
}
function route() {
  const i = byId.get(location.hash.slice(1));
  if (i === undefined) showMap();
  else showMonument(i, { instant: current === -1 });
}
addEventListener('popstate', route);
addEventListener('hashchange', route);

const step = (d) => {
  const pos = order.indexOf(current);
  showMonument(order[(pos + d + order.length) % order.length]);
};
$('to-map').addEventListener('click', () => showMap(true));
$('prev').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
$('reset').addEventListener('click', () => { home = computeHome(built.get(current)); flyTo(home); });
const rotBtn = $('rotate');
rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
rotBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
});
addEventListener('keydown', (e) => {
  if (mode !== 'monument' || (e.target.closest && e.target.closest('input, textarea'))) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
  if (e.key === 'Escape') showMap(true);
});

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function loop(now) {
  requestAnimationFrame(loop);
  if (mode !== 'monument') return;
  if (tween) {
    const k = Math.min(1, (now - tween.t0) / tween.dur), e = ease(k);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (k >= 1) tween = null;
  }
  controls.update();
  sky.position.copy(camera.position);
  composer.render();
}

route();
statusEl.hidden = true;
requestAnimationFrame(loop);
