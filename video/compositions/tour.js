// The tour: each monument in turn, five seconds each, drawn with the website's own models, sky,
// land and water (copied into site/js by sync-site.mjs). Every frame is a function of timeline time
// alone, so HyperFrames can render any frame on its own: monument i fills [5i, 5i + 5), and the
// camera sweeps 28° round it while it eases in a little.
import * as THREE from '../lib/three/three.module.js';
import { EffectComposer } from '../lib/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../lib/three/addons/postprocessing/RenderPass.js';
import { OutputPass } from '../lib/three/addons/postprocessing/OutputPass.js';
import { V } from '../site/js/helpers.js';
import { attachSurface, surface, waterTime, landColor, reflection } from '../site/js/surface.js';
import { separateCoplanar } from '../site/js/coplanar.js';
import { naturalize } from '../site/js/naturalize.js';
import { blendIntoLand } from '../site/js/landscape.js';
import { loadPhotoTextures } from '../site/js/textures.js';
import { MONUMENTS } from '../site/js/data.js';

const W = 1920, H = 1080, SEG = 5, SWEEP = THREE.MathUtils.degToRad(28);
// The site's day palette (css/style.css).
const SKY_TOP = '#86afd4', SKY_HORIZON = '#ebe2d3', GROUND = '#b7a684';

const canvas = document.getElementById('tour-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// The sun and the monument hold still for a monument's five seconds, so its shadows are drawn once
// when it comes on, not every frame: on a software GPU that halves the cost of a frame.
renderer.shadowMap.autoUpdate = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const texturesReady = new Promise((resolve) => { THREE.DefaultLoadingManager.onLoad = resolve; });
loadPhotoTextures(renderer);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 20000);
const SUN_DIR = V(-0.55, 0.85, 0.45).normalize();

// The site's sky shader, by day: the haze band, the line of distant hills, the sun and the clouds.
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  uniforms: {
    top: { value: new THREE.Color(SKY_TOP) }, horizon: { value: new THREE.Color(SKY_HORIZON) }, land: { value: new THREE.Color(GROUND) },
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
      vec2 cuv = dir.xz / (h + 0.12);
      float n = kNoise(cuv * 1.6 + vec2(time * 0.01, 0.0)) * 0.6 + kNoise(cuv * 4.1 - vec2(0.0, time * 0.006)) * 0.4;
      col = mix(col, mix(vec3(1.0), horizon, 0.25), smoothstep(0.5, 0.75, n) * smoothstep(0.03, 0.25, h) * 0.7 * day);
      vec2 az = normalize(dir.xz + vec2(1e-5));
      float ridge = 0.006 + 0.024 * (kNoise(az * 3.0 + 7.0) * 0.65 + kNoise(az * 9.0 + 2.0) * 0.35);
      col = mix(col, mix(horizon, land, 0.38), 1.0 - smoothstep(ridge - 0.002, ridge, h));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), skyMat);
sky.renderOrder = -1;
sky.frustumCulled = false;
scene.add(sky);

const groundMat = surface(attachSurface(new THREE.MeshStandardMaterial({ roughness: 1, envMapIntensity: 0.5, color: GROUND })), 'ground');
groundMat.polygonOffset = true;
groundMat.polygonOffsetFactor = 1;
groundMat.polygonOffsetUnits = 4;
const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 96), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
landColor.value.copy(groundMat.color);

scene.fog = new THREE.Fog(SKY_HORIZON, 100, 1000);
scene.add(new THREE.HemisphereLight('#d4e4ff', '#b49a72', 0.45));
const sun = new THREE.DirectionalLight('#fff1dc', 2.8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun, sun.target);

// Reflections in gold and marble, from the same sky and land.
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), skyMat));
const envGround = new THREE.Mesh(new THREE.CircleGeometry(10, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(GROUND).multiplyScalar(0.8) }));
envGround.rotation.x = -Math.PI / 2;
envGround.position.y = -0.4;
envScene.add(envGround);
scene.environment = pmrem.fromScene(envScene, 0.04).texture;

const composer = new EffectComposer(renderer);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());

/* ---------- monuments ---------- */
// Built on demand and kept for a moment, since neighbouring frames usually share a monument.
const built = new Map();
function getBuilt(i) {
  if (!built.has(i)) {
    const r = MONUMENTS[i].build();
    r.focus = r.focus || r.group;
    naturalize(r.group);
    separateCoplanar(r.group, 0.005);
    blendIntoLand(r);
    r.mirror = findMirror(r.group);
    r.home = computeHome(r);
    scene.add(r.group);
    built.set(i, r);
    // Keep the three most recent; free the geometry of older ones (materials are shared).
    for (const k of [...built.keys()].slice(0, -3)) {
      const old = built.get(k);
      scene.remove(old.group);
      old.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      built.delete(k);
    }
  }
  return built.get(i);
}

function computeHome(r) {
  const box = new THREE.Box3().setFromObject(r.focus);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const radius = size.length() / 2;
  const vfov = THREE.MathUtils.degToRad(camera.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const dist = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.02;
  return { target: V(center.x, center.y * 0.95, center.z), dir: V(...(r.view || [0.9, 0.34, 1.25])).normalize(), dist, radius };
}

function setEnvironment({ dist, radius, target }) {
  camera.near = Math.max(0.1, dist / 300);
  camera.far = dist * 14;
  camera.updateProjectionMatrix();
  sky.scale.setScalar(camera.far * 0.9);
  ground.scale.setScalar(dist * 12);
  scene.fog.near = dist * 1.6;
  scene.fog.far = dist * 7;
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
}

/* ---------- reflections in seas, rivers and lakes (as on the site) ---------- */
const reflectRT = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType });
reflection.map.value = reflectRT.texture;
const mirrorCam = new THREE.PerspectiveCamera();
const waterLine = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const toTexture = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);

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

function renderReflection(mirror, target) {
  const h = mirror.y;
  mirrorCam.copy(camera);
  mirrorCam.position.y = 2 * h - camera.position.y;
  mirrorCam.up.set(0, -1, 0);
  mirrorCam.lookAt(target.x, 2 * h - target.y, target.z);
  mirrorCam.updateMatrixWorld();
  reflection.matrix.value.copy(toTexture).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
  waterLine.constant = -h;
  mirror.meshes.forEach((o) => { o.visible = false; });
  renderer.clippingPlanes = [waterLine];
  sky.position.copy(mirrorCam.position);
  renderer.setRenderTarget(reflectRT);
  renderer.clear();
  renderer.render(scene, mirrorCam);
  renderer.setRenderTarget(null);
  renderer.clippingPlanes = [];
  sky.position.copy(camera.position);
  mirror.meshes.forEach((o) => { o.visible = true; });
}

/* ---------- one frame, from time alone ---------- */
const ease = (u) => u * u * (3 - 2 * u);
const up = V(0, 1, 0);
let shown = -1;
function renderAt(t) {
  const i = Math.min(MONUMENTS.length - 1, Math.max(0, Math.floor(t / SEG)));
  const u = Math.min(1, Math.max(0, (t - i * SEG) / SEG));
  const r = getBuilt(i);
  const { target, dir, dist } = r.home;
  if (i !== shown) {
    built.forEach((b, k) => { b.group.visible = k === i; });
    setEnvironment(r.home);
    renderer.shadowMap.needsUpdate = true;
    shown = i;
  }
  // A steady sweep round the monument, easing a little closer as it goes.
  const d = dir.clone().applyAxisAngle(up, (u - 0.5) * SWEEP);
  camera.position.copy(target).addScaledVector(d, dist * (1.06 - 0.1 * ease(u)));
  camera.lookAt(target);
  camera.updateMatrixWorld();
  waterTime.value = skyMat.uniforms.time.value = t;
  sky.position.copy(camera.position);
  reflection.on.value = r.mirror ? 1 : 0;
  if (r.mirror) renderReflection(r.mirror, target);
  composer.render();
}

window.addEventListener('hf-seek', (e) => renderAt(e.detail.time));
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady.tour = texturesReady.then(() => renderAt(0));

const tl = gsap.timeline({ paused: true });
tl.to({}, { duration: MONUMENTS.length * SEG }, 0);
window.__timelines['tour'] = tl;
