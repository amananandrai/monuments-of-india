import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { nightState, V, box } from './helpers.js';
import { attachSurface, surface, waterTime, landColor, reflection } from './surface.js';
import { blendIntoLand, siteLand } from './landscape.js';
import { separateCoplanar } from './coplanar.js';
import { frameBox } from './framing.js';
import { batchStatic } from './batch.js';
import { upgradeTrees } from './details/realism.js';
import { naturalize } from './naturalize.js';
import { loadPhotoTextures } from './textures.js';
import { MONUMENTS } from './data.js';
import { createMap } from './map.js';
import { warmSculpts } from './warmup.js';
import { detail, chooseDetail } from './detail.js';

// Full models on desktops and laptops, lighter ones on phones (js/detail.js).
detail.level = chooseDetail();

/* ---------- scene ---------- */
const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
const statusEl = document.getElementById('status');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  // No multisampling on the canvas: the scene is drawn into the composer's own render target, so the
  // canvas only ever receives the finished image, a single full-screen quad.
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
} catch (e) {
  statusEl.textContent = 'Your browser could not start WebGL, which this page needs to draw the 3D models.';
  throw e;
}
// Ambient occlusion is skipped on phone-sized screens, where it costs too much.
const fancy = !matchMedia('(max-width: 760px)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, fancy ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// The shadows are drawn once per monument, not every frame: the sun and the shadow box are fixed to
// the monument and nothing in the scene moves, so orbiting the camera never changes them.
// setEnvironment() asks for a new shadow map when a monument is shown.
renderer.shadowMap.autoUpdate = false;
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
controls.maxPolarAngle = Math.PI / 2 - 0.01;

// Where the sun stands, seen from the monument: the sun light and the sun in the sky share it.
const SUN_DIR = V(-0.55, 0.85, 0.45).normalize();

// The sky: --sky-top fading to --sky-horizon, a haze band and a low line of distant hills on the
// skyline, the sun, and clouds by day; stars by night. Clouds drift unless the visitor has asked
// for reduced motion, when they stay where they are.
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  uniforms: {
    top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, land: { value: new THREE.Color() },
    sunDir: { value: SUN_DIR }, night: { value: 0 }, time: { value: 0 },
  },
  vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */ `
    uniform vec3 top, horizon, land, sunDir;
    uniform float night, time;
    varying vec3 vDir;
    float kHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float kNoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(kHash(i), kHash(i + vec2(1, 0)), f.x), mix(kHash(i + vec2(0, 1)), kHash(i + vec2(1, 1)), f.x), f.y);
    }
    void main() {
      vec3 dir = normalize(vDir);
      float h = dir.y, day = 1.0 - night;
      vec3 col = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55));
      col = mix(col, horizon * mix(vec3(1.06, 1.02, 0.95), vec3(1.0), night), (1.0 - smoothstep(0.0, 0.2, h)) * 0.6);
      float sd = max(dot(dir, sunDir), 0.0);
      col += day * (vec3(1.0, 0.93, 0.78) * pow(sd, 1500.0) * 2.0 + vec3(1.0, 0.9, 0.7) * pow(sd, 12.0) * 0.12);
      // Clouds on a plane overhead, thinning out towards the horizon.
      vec2 cuv = dir.xz / (h + 0.12);
      float n = kNoise(cuv * 1.6 + vec2(time * 0.01, 0.0)) * 0.6 + kNoise(cuv * 4.1 - vec2(0.0, time * 0.006)) * 0.4;
      col = mix(col, mix(vec3(1.0), horizon, 0.25), smoothstep(0.5, 0.75, n) * smoothstep(0.03, 0.25, h) * 0.7 * day);
      // Stars: one in a few hundred cells of a fine grid on the sky, round and fading near the horizon.
      vec3 sc = dir * 400.0, sf = fract(sc) - 0.5;
      float star = step(0.996, fract(sin(dot(floor(sc), vec3(12.9898, 78.233, 37.719))) * 43758.5453));
      col += vec3(0.9, 0.92, 1.0) * star * smoothstep(0.35, 0.1, length(sf)) * smoothstep(0.08, 0.3, h) * night * 0.9;
      // Distant hills: a soft ridge a degree or so above the horizon, all the way round.
      vec2 az = normalize(dir.xz + vec2(1e-5));
      float ridge = 0.006 + 0.024 * (kNoise(az * 3.0 + 7.0) * 0.65 + kNoise(az * 9.0 + 2.0) * 0.35);
      vec3 hills = mix(horizon, land, 0.38);
      col = mix(col, hills, 1.0 - smoothstep(ridge - 0.002, ridge, h));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
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
// always win, even kilometres away where the depth buffer is coarse: the offset is in steps of the
// depth buffer, so it holds at any distance (4 steps were too few for a sea seen 5 km off).
groundMat.polygonOffset = true;
groundMat.polygonOffsetFactor = 2;
groundMat.polygonOffsetUnits = 32;
scene.add(ground);

scene.fog = new THREE.Fog(0xffffff, 100, 1000);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
scene.add(hemiLight);
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
// Desktops at full detail get a shadow map four times the size: crisp shadows under cornices,
// brackets and carved edges. It is drawn once per monument, so the size costs memory, not frames.
const hd = fancy && !detail.low;
const shadowSize = hd ? Math.min(4096, renderer.capabilities.maxTextureSize) : 2048;
sun.shadow.mapSize.set(shadowSize, shadowSize);
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
// Antialiasing on desktops at full detail: SMAA smooths the stair-stepped edges of railings,
// spires and cornices. The scene is drawn into the composer's own target, which is not
// multisampled, so without this pass there is no antialiasing at all.
const smaa = new SMAAPass(1, 1);
smaa.enabled = hd;
composer.addPass(smaa);
composer.addPass(new OutputPass());

// The open land: the theme's colour, or, where a monument's site is green or shaped terrain, that
// colour (siteLand in js/landscape.js), so a meadow or a forested hill does not end on a sandy
// plain. At night the site's colour darkens as the theme's own land does. The ground disc, the
// fade at the edges of lawns and pavements, the land band under the sky and the environment's
// ground all take it.
const DAY_GROUND = new THREE.Color('#b7a684'), themeGround = new THREE.Color(), land = new THREE.Color();
let siteGround = null;
function paintLand() {
  land.copy(themeGround);
  if (siteGround) land.setRGB(siteGround.r * themeGround.r / DAY_GROUND.r, siteGround.g * themeGround.g / DAY_GROUND.g, siteGround.b * themeGround.b / DAY_GROUND.b);
  skyMat.uniforms.land.value.copy(land);
  groundMat.color.copy(land);
  landColor.value.copy(land);
  envGroundMat.color.copy(land).multiplyScalar(0.8);
}

function applyTheme() {
  const cs = getComputedStyle(document.documentElement);
  const col = (n) => new THREE.Color(cs.getPropertyValue(n).trim() || '#888');
  const night = cs.getPropertyValue('--scene-mode').trim() === 'night';
  skyMat.uniforms.top.value.copy(col('--sky-top'));
  skyMat.uniforms.horizon.value.copy(col('--sky-horizon'));
  skyMat.uniforms.night.value = night ? 1 : 0;
  themeGround.copy(col('--ground'));
  paintLand();
  scene.fog.color.copy(col('--sky-horizon'));
  nightState.on = night;
  nightState.objects.forEach((o) => { o.visible = night; });
  // Lamps and lanterns shown or hidden: their shadows change with them.
  renderer.shadowMap.needsUpdate = true;
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

// A monument is built the first time it is opened: its module is fetched, the model built and
// finished (fuller trees, natural colour, depth offsets, the land round it), then kept. The promise
// is kept too, so asking twice while it loads builds it once.
const loading = new Map();
function getBuilt(i) {
  if (built.has(i)) return Promise.resolve(built.get(i));
  if (!loading.has(i)) loading.set(i, MONUMENTS[i].build().then((r) => {
    r.focus = r.focus || r.group;
    // The colour of the land round the site, read before the seas are extended over it.
    r.land = siteLand(r);
    // Fuller trees wherever the monument has triangles to spare; plain ones on phones.
    if (!detail.low) upgradeTrees(r.group, r.budget || 300000);
    naturalize(r.group);
    // Faces that share a plane get different depth offsets, so they don't flicker.
    separateCoplanar(r.group, 0.005);
    blendIntoLand(r);
    // The box the home view frames, measured on the separate parts, before any are merged.
    r.frame = frameBox(r.focus);
    // Monuments of many separate parts are merged into a few draw calls (js/batch.js).
    if (r.batch) { batchStatic(r.focus); if (r.focus !== r.group) batchStatic(r.group, r.focus); }
    r.mirror = findMirror(r.group);
    r.group.visible = false;
    scene.add(r.group);
    built.set(i, r);
    loading.delete(i);
    return r;
  }));
  return loading.get(i);
}
// Fetch a monument's code ahead of a likely click (hover, or the next and previous in the list),
// without building it.
const prefetch = (i) => { if (i !== undefined && !built.has(i)) MONUMENTS[i].load().catch(() => {}); };

function computeHome(r) {
  const box = r.frame || frameBox(r.focus);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = size.length() / 2;
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  // A builder can ask for a closer home view (zoom < 1) where the whole site need not fit.
  const dist = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.1 * (r.zoom || 1);
  const dir = V(...(r.view || [0.9, 0.34, 1.25])).normalize();
  const target = V(center.x, center.y * 0.95, center.z);
  // minElevation: for a monument in a pit or trench, how high the camera must stay to see in.
  return { target, pos: target.clone().addScaledVector(dir, dist), dist, radius, reach: sceneryReach(r, target, dir), minEl: r.minElevation || 0.01, fog: r.fog || 7 };
}

// How far the camera may pull back before it would enter the scenery round a monument (hills,
// peaks, cliffs, forests): rays from the target outward, at the home view's elevation and lower.
// Inside a hill the near plane slices it into floating layers, so the zoom stops short of it.
function sceneryReach(r, target, dir) {
  const inFocus = new Set(), others = [], b = new THREE.Box3();
  r.focus.traverse((o) => inFocus.add(o));
  r.group.traverse((o) => {
    if (!o.isMesh || !o.visible || inFocus.has(o)) return;
    b.setFromObject(o);
    if (b.max.y - Math.max(0, b.min.y) > 4) others.push(o);
  });
  if (!others.length) return Infinity;
  const rc = new THREE.Raycaster(), el = Math.asin(dir.y);
  let near = Infinity;
  for (const e of [el, el * 0.5, 0.08]) for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    rc.set(target, V(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)));
    const hit = rc.intersectObjects(others, false)[0];
    if (hit) near = Math.min(near, hit.distance);
  }
  return near;
}

function setEnvironment(h) {
  const { dist, radius, target } = h;
  camera.near = Math.max(0.1, dist / 300);
  camera.far = dist * Math.max(14, h.fog * 2);
  camera.updateProjectionMatrix();
  sky.scale.setScalar(camera.far * 0.9);
  // The land runs well past the end of the fog, so its edge is never seen.
  ground.scale.setScalar(dist * Math.max(12, h.fog * 1.8));
  // fog: how many home distances off the haze closes in; mountain sites ask for clearer air.
  scene.fog.near = dist * 1.6;
  scene.fog.far = dist * h.fog;
  controls.minDistance = radius * 0.35;
  controls.maxDistance = Math.max(dist * 1.15, Math.min(dist * 3, h.reach * 0.85));
  controls.maxPolarAngle = Math.PI / 2 - h.minEl;
  sun.position.copy(target).addScaledVector(SUN_DIR, radius * 3);
  sun.target.position.copy(target);
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -radius * 1.4;
  sc.right = sc.top = radius * 1.4;
  sc.near = radius * 0.5;
  sc.far = radius * 6;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = radius * 0.0012;
  renderer.shadowMap.needsUpdate = true;
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


let wanted = -1;
async function select(i, instant = false) {
  wanted = i;
  items.forEach((el, k) => el.setAttribute('aria-current', String(k === i)));
  items[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  if (i === current) return;
  // While a monument loads for the first time, say so; the one before stays in view.
  const slow = !built.has(i) && setTimeout(() => { if (wanted !== i) return; statusEl.textContent = `Loading ${MONUMENTS[i].name}…`; statusEl.hidden = false; }, 120);
  let r;
  try {
    r = await getBuilt(i);
  } catch (e) {
    clearTimeout(slow);
    if (wanted === i) { statusEl.textContent = `${MONUMENTS[i].name} could not be loaded. Check the connection and try again.`; statusEl.hidden = false; }
    loading.delete(i);
    console.error(e);
    return;
  }
  clearTimeout(slow);
  // The visitor moved on while this one loaded: leave it built, show nothing.
  if (wanted !== i) return;
  statusEl.hidden = true;
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
  if (!(r.land ? siteGround && siteGround.equals(r.land) : !siteGround)) {
    siteGround = r.land;
    paintLand();
    updateEnvironment();
  }
  flyTo(home, first || instant);
  renderInfo(MONUMENTS[i]);
  mirror = fancy ? r.mirror : null;
  reflection.on.value = mirror ? 1 : 0;
  // The neighbours in the list are the likeliest next clicks.
  const pos = order.indexOf(i);
  prefetch(order[(pos + 1) % order.length]);
  prefetch(order[(pos - 1 + order.length) % order.length]);
}

/* ---------- sidebar: grouped by state, with search ---------- */
const $ = (id) => document.getElementById(id);

// Day or night: follows the device until the visitor picks one, which is then remembered.
const themeBtn = $('theme');
const isNight = () => getComputedStyle(document.documentElement).getPropertyValue('--scene-mode').trim() === 'night';
const syncThemeBtn = () => themeBtn.setAttribute('aria-pressed', String(isNight()));
themeBtn.addEventListener('click', () => {
  const t = isNight() ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch (e) { /* private window: the choice lasts this visit */ }
  syncThemeBtn();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeBtn);
syncThemeBtn();
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
    b.addEventListener('pointerenter', () => { map.highlight(mo.id); prefetch(i); });
    b.addEventListener('pointerleave', () => map.highlight(null));
    b.addEventListener('focus', () => { map.highlight(mo.id); prefetch(i); });
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
  // A monument still loading is not shown when it arrives.
  wanted = -1;
  statusEl.hidden = true;
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

/* ---------- reflections in seas, rivers and lakes ---------- */
// Each frame the scene is drawn once more, at half size, from a camera mirrored below the water and
// clipped to what stands above it. Pools are too small to bother; phones skip it, as they skip AO.
const reflectRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
reflection.map.value = reflectRT.texture;
const mirrorCam = new THREE.PerspectiveCamera();
const waterLine = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const toTexture = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
let mirror = null;

// The reflecting water of a monument: its sheets, and the height of the largest one.
function findMirror(root) {
  const meshes = [];
  let best = null, area = 0;
  root.traverse((o) => {
    if (!o.isMesh || !o.material.userData || !o.material.userData.reflect) return;
    meshes.push(o);
    const b = new THREE.Box3().setFromObject(o), a = (b.max.x - b.min.x) * (b.max.z - b.min.z);
    if (a > area) { area = a; best = b.max.y; }
  });
  return meshes.length ? { y: best, meshes } : null;
}

function renderReflection() {
  const h = mirror.y;
  mirrorCam.copy(camera);
  mirrorCam.position.y = 2 * h - camera.position.y;
  mirrorCam.up.set(0, -1, 0);
  mirrorCam.lookAt(controls.target.x, 2 * h - controls.target.y, controls.target.z);
  mirrorCam.updateMatrixWorld();
  reflection.matrix.value.copy(toTexture).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
  waterLine.constant = -h;
  mirror.meshes.forEach((o) => { o.visible = false; });
  renderer.clippingPlanes = [waterLine];
  // Keep a pending shadow update for the main render, so the shadow map is drawn without the clip.
  const shadowDue = renderer.shadowMap.needsUpdate;
  renderer.shadowMap.needsUpdate = false;
  sky.position.copy(mirrorCam.position);
  renderer.setRenderTarget(reflectRT);
  renderer.clear();
  renderer.render(scene, mirrorCam);
  renderer.setRenderTarget(null);
  renderer.clippingPlanes = [];
  renderer.shadowMap.needsUpdate = shadowDue;
  sky.position.copy(camera.position);
  mirror.meshes.forEach((o) => { o.visible = true; });
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const pr = renderer.getPixelRatio() * 0.5;
  reflectRT.setSize(Math.max(1, Math.round(w * pr)), Math.max(1, Math.round(h * pr)));
}
new ResizeObserver(resize).observe(canvas);
resize();

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function loop(now) {
  requestAnimationFrame(loop);
  if (mode !== 'monument' || current === -1) return;
  if (!reduceMotion) waterTime.value = skyMat.uniforms.time.value = now / 1000;
  if (tween) {
    const k = Math.min(1, (now - tween.t0) / tween.dur), e = ease(k);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (k >= 1) tween = null;
  }
  controls.update();
  sky.position.copy(camera.position);
  if (mirror) renderReflection();
  composer.render();
}

route();
statusEl.hidden = true;
requestAnimationFrame(loop);
// On larger screens, mesh the slowest sculpted figures while the map sits idle (js/warmup.js).
if (fancy && !detail.low) warmSculpts(() => mode === 'map' && loading.size === 0);
