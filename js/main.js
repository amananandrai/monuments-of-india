import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { nightState, V, box } from './helpers.js';
import { MONUMENTS } from './data.js';

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
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

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

const groundMat = new THREE.MeshStandardMaterial({ roughness: 1 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 96), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
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
  if (night) {
    hemiLight.color.set('#8796c8'); hemiLight.groundColor.set('#2a2630'); hemiLight.intensity = 0.55;
    sun.color.set('#a9b8ff'); sun.intensity = 0.7;
    flood.intensity = 1.6;
  } else {
    hemiLight.color.set('#d4e4ff'); hemiLight.groundColor.set('#b49a72'); hemiLight.intensity = 0.9;
    sun.color.set('#fff1dc'); sun.intensity = 2.8;
    flood.intensity = 0;
  }
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
  i = (i + MONUMENTS.length) % MONUMENTS.length;
  if (i === current) return;
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
  document.querySelectorAll('.item').forEach((el, k) => el.setAttribute('aria-current', String(k === i)));
  const active = document.querySelectorAll('.item')[i];
  active?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  try { history.replaceState(null, '', '#' + MONUMENTS[i].id); } catch (e) { /* ignore */ }
}

/* ---------- UI ---------- */
const $ = (id) => document.getElementById(id);
const list = $('list');
MONUMENTS.forEach((mo, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.className = 'item';
  b.type = 'button';
  b.innerHTML = `<span class="name"></span><span class="h"></span><span class="place"></span>`;
  b.querySelector('.name').textContent = mo.name;
  b.querySelector('.h').textContent = mo.stat[1];
  b.querySelector('.place').textContent = mo.place;
  b.addEventListener('click', () => select(i));
  li.appendChild(b);
  list.appendChild(li);
});
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
if (matchMedia('(max-width: 760px)').matches) $('p-facts-wrap').open = false;

$('prev').addEventListener('click', () => select(current - 1));
$('next').addEventListener('click', () => select(current + 1));
$('reset').addEventListener('click', () => { home = computeHome(built.get(current)); flyTo(home); });
const rotBtn = $('rotate');
rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
rotBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
});
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input, textarea')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(current + 1); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(current - 1); }
});

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function loop(now) {
  requestAnimationFrame(loop);
  if (tween) {
    const k = Math.min(1, (now - tween.t0) / tween.dur), e = ease(k);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (k >= 1) tween = null;
  }
  controls.update();
  sky.position.copy(camera.position);
  renderer.render(scene, camera);
}

const fromHash = MONUMENTS.findIndex((m) => m.id === location.hash.slice(1));
select(fromHash >= 0 ? fromHash : 2, true);
statusEl.hidden = true;
requestAnimationFrame(loop);
