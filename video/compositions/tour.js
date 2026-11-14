// The tour: a journey across India, one monument at a time, drawn with the website's own models,
// sky, land and water (copied into site/js by sync-site.mjs). Each monument's slot (timing.js,
// written from the narration's timing) holds three shots:
//   map     - a 3D map of India: the route draws from the last monument to this one, then the
//             camera dives onto the spot like a drone;
//   orbit   - the drone comes down out of the sky and sweeps slowly round the monument;
//   details - two telephoto close-ups: its crown (domes, spires, chhatris), then its base
//             (pillars, arches, carving).
// Every frame is a function of timeline time alone, so HyperFrames can render any frame on its own.
import * as THREE from '../lib/three/three.module.js';
import { SVGLoader } from '../lib/three/addons/loaders/SVGLoader.js';
import { INDIA, CLAIMS as CLAIM_BOXES, project } from '../site/js/india-map.js';
import { SLOTS, TOTAL } from './timing.js';
import { EffectComposer } from '../lib/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../lib/three/addons/postprocessing/RenderPass.js';
import { OutputPass } from '../lib/three/addons/postprocessing/OutputPass.js';
import { V } from '../site/js/helpers.js';
import { attachSurface, surface, waterTime, landColor, reflection } from '../site/js/surface.js';
import { separateCoplanar, separateMerged } from '../site/js/coplanar.js';
import { frameBox } from '../site/js/framing.js';
import { naturalize } from '../site/js/naturalize.js';
import { blendIntoLand } from '../site/js/landscape.js';
import { upgradeTrees, scatterGround } from '../site/js/details/realism.js';
import { loadPhotoTextures } from '../site/js/textures.js';
import { MONUMENTS } from '../site/js/data.js';
import { BUILDERS } from '../site/js/builders.js';

const W = 1920, H = 1080, FOV = 38, SWEEP = THREE.MathUtils.degToRad(40);
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
const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.5, 20000);
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
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
composer.addPass(new OutputPass());

/* ---------- the 3D map of India ---------- */
// The states, extruded from the site's map (js/india-map.js: 564.5 × 630.2 units, x east, y south),
// laid in the x–z plane and centred on the origin. One unit is about 5 km.
const mapScene = new THREE.Scene();
const mapCam = new THREE.PerspectiveCamera(36, W / H, 1, 6000);
const MAP_SEA = '#1f4a63', MAP_LAND = '#c9b48a', MAP_EDGE = '#fff6e4', MAP_HOME = '#f2a33a', MAP_FROM = '#d9c39b';
mapScene.background = new THREE.Color(MAP_SEA);
mapScene.fog = new THREE.Fog(MAP_SEA, 1500, 4000);
mapScene.add(new THREE.HemisphereLight('#fff4e0', '#24465c', 1.1));
const mapSun = new THREE.DirectionalLight('#fff1dc', 2.2);
mapSun.position.set(-300, 600, 250);
mapScene.add(mapSun);
const toMap = (x, y) => new THREE.Vector3(x - INDIA.width / 2, 0, y - INDIA.height / 2);
const pinAt = (m) => { const [x, y] = project(m.lat, m.lng); return toMap(x, y); };
const STATE_H = 3;

const sea = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), new THREE.MeshStandardMaterial({ color: MAP_SEA, roughness: 0.55, metalness: 0.1 }));
sea.rotation.x = -Math.PI / 2;
sea.position.y = -0.2;
mapScene.add(sea);

const svgPaths = (d) => new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths;
const stateMeshes = new Map();
for (const st of INDIA.states) {
  const shapes = svgPaths(st.d).flatMap((p) => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: STATE_H, bevelEnabled: false, curveSegments: 2 });
  geo.rotateX(Math.PI / 2); // svg y (south) -> +z, extrusion -> down; flip up below
  geo.translate(-INDIA.width / 2, STATE_H, -INDIA.height / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: MAP_LAND, roughness: 0.9, side: THREE.DoubleSide }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: MAP_EDGE, transparent: true, opacity: 0.55 }));
  mapScene.add(mesh, edges);
  stateMeshes.set(st.name, mesh);
}
// India's official boundary (INDIA.outline) takes in the whole of Jammu and Kashmir and Ladakh, but
// the state shapes stop at the lines of control. So the outline is laid as land just beneath the
// states, and the parts of it no state covers in the north are given to their union territories
// as on India's official map: Pakistan-occupied Kashmir to Jammu and Kashmir; Gilgit-Baltistan,
// the Shaksgam valley and Aksai Chin to Ladakh. Each is the outline clipped to a box (the states
// above hide all but the uncovered part) and lights up with its union territory.
const CLAIM_H = STATE_H - 0.25;
const outlineShapes = svgPaths(INDIA.outline).flatMap((p) => SVGLoader.createShapes(p));
const extrude = (shapes, h) => {
  const g = new THREE.ExtrudeGeometry(shapes, { depth: h, bevelEnabled: false, curveSegments: 2 });
  g.rotateX(Math.PI / 2);
  g.translate(-INDIA.width / 2, h, -INDIA.height / 2);
  return g;
};
const indiaGeo = extrude(outlineShapes, CLAIM_H - 0.3);
mapScene.add(
  new THREE.Mesh(indiaGeo, new THREE.MeshStandardMaterial({ color: MAP_LAND, roughness: 0.9, side: THREE.DoubleSide })),
  new THREE.LineSegments(new THREE.EdgesGeometry(indiaGeo, 30), new THREE.LineBasicMaterial({ color: MAP_EDGE, transparent: true, opacity: 0.85 }))
);
// Sutherland–Hodgman: a polygon clipped to an axis-aligned box (map units, y south).
function clipToBox(pts, [x0, y0, x1, y1]) {
  const edges = [
    [(p) => p.x >= x0, (a, b) => new THREE.Vector2(x0, a.y + ((b.y - a.y) * (x0 - a.x)) / (b.x - a.x))],
    [(p) => p.x <= x1, (a, b) => new THREE.Vector2(x1, a.y + ((b.y - a.y) * (x1 - a.x)) / (b.x - a.x))],
    [(p) => p.y >= y0, (a, b) => new THREE.Vector2(a.x + ((b.x - a.x) * (y0 - a.y)) / (b.y - a.y), y0)],
    [(p) => p.y <= y1, (a, b) => new THREE.Vector2(a.x + ((b.x - a.x) * (y1 - a.y)) / (b.y - a.y), y1)]
  ];
  let out = pts;
  for (const [inside, cut] of edges) {
    const src = out;
    out = [];
    src.forEach((cur, k) => {
      const prev = src[(k + src.length - 1) % src.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(cut(prev, cur));
    });
    if (!out.length) break;
  }
  return out;
}
const claimMesh = (boxes) => {
  const shapes = boxes.flatMap((box) => outlineShapes
    .map((s) => clipToBox(s.getPoints(), box))
    .filter((p) => p.length >= 3)
    .map((p) => new THREE.Shape(p)));
  return new THREE.Mesh(extrude(shapes, CLAIM_H), new THREE.MeshStandardMaterial({ color: MAP_LAND, roughness: 0.9, side: THREE.DoubleSide }));
};
// The boxes are shared with the website's map (js/india-map.js).
const CLAIMS = Object.fromEntries(Object.entries(CLAIM_BOXES).map(([name, boxes]) => [name, claimMesh(boxes)]));
Object.values(CLAIMS).forEach((m) => mapScene.add(m));

// A state's name in js/data.js and in the map can differ slightly ("Andaman and Nicobar Islands").
const stateMesh = (name) => stateMeshes.get(name) || [...stateMeshes].find(([k]) => name.startsWith(k) || k.startsWith(name))?.[1];
const paintState = (name, color) => {
  stateMesh(name)?.material.color.set(color);
  CLAIMS[name]?.material.color.set(color);
};

// Every monument as a small dot; the destination gets a tall glowing pin.
const dotGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.6, 12);
const dotMat = new THREE.MeshBasicMaterial({ color: '#fff6e4' });
MONUMENTS.forEach((m) => { const d = new THREE.Mesh(dotGeo, dotMat); d.position.copy(pinAt(m)).setY(STATE_H + 0.3); mapScene.add(d); });
const pin = new THREE.Group();
const pinMat = new THREE.MeshBasicMaterial({ color: MAP_HOME, toneMapped: false });
const pinStem = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 18, 10), pinMat);
pinStem.position.y = 9;
const pinHead = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 12), pinMat);
pinHead.position.y = 19;
const pinRing = new THREE.Mesh(new THREE.RingGeometry(3, 4.2, 40), new THREE.MeshBasicMaterial({ color: MAP_HOME, transparent: true, side: THREE.DoubleSide, toneMapped: false }));
pinRing.rotation.x = -Math.PI / 2;
pinRing.position.y = 0.4;
pin.add(pinStem, pinHead, pinRing);
mapScene.add(pin);

// The route from the last monument: an arc that draws itself.
const ARC_N = 96;
const arcGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_N * 3), 3));
const arc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: MAP_HOME, toneMapped: false }));
mapScene.add(arc);
const arcTube = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: MAP_HOME, toneMapped: false }));
mapScene.add(arcTube);
function setRoute(a, b, k) {
  const len = a.distanceTo(b), mid = a.clone().lerp(b, 0.5).setY(STATE_H + Math.max(6, len * 0.28));
  const curve = new THREE.QuadraticBezierCurve3(a.clone().setY(STATE_H + 0.5), mid, b.clone().setY(STATE_H + 0.5));
  const pos = arcGeo.attributes.position;
  for (let j = 0; j < ARC_N; j++) { const p = curve.getPoint(j / (ARC_N - 1)); pos.setXYZ(j, p.x, p.y, p.z); }
  pos.needsUpdate = true;
  arcGeo.setDrawRange(0, Math.max(2, Math.round(k * ARC_N)));
  arcTube.geometry.dispose();
  arcTube.geometry = k > 0.01 && len > 1 ? new THREE.TubeGeometry(new SubCurve(curve, k), 48, 0.7, 6) : new THREE.BufferGeometry();
}
class SubCurve extends THREE.Curve {
  constructor(c, k) { super(); this.c = c; this.k = k; }
  getPoint(u, out = new THREE.Vector3()) { return out.copy(this.c.getPoint(u * this.k)); }
}

function renderMap(i, tau, len) {
  const m = MONUMENTS[i], dest = pinAt(m);
  const from = i > 0 ? pinAt(MONUMENTS[i - 1]) : new THREE.Vector3(0, 0, 0);
  stateMeshes.forEach((mesh) => mesh.material.color.set(MAP_LAND));
  Object.values(CLAIMS).forEach((mesh) => mesh.material.color.set(MAP_LAND));
  if (i > 0) paintState(MONUMENTS[i - 1].state, MAP_FROM);
  paintState(m.state, MAP_HOME);
  // Route draws over the first ~55%, the camera follows it; the last 1.8 s is the dive.
  const dive = Math.min(1.8, len * 0.38), travel = len - dive;
  const k = ease(Math.min(1, tau / (travel * 0.85)));
  setRoute(from, dest, i > 0 ? k : 0);
  pin.position.copy(dest).setY(STATE_H);
  const pulse = (tau * 1.4) % 1;
  pinRing.scale.setScalar(1 + pulse * 2.2);
  pinRing.material.opacity = 1 - pulse;
  pin.scale.setScalar(i > 0 ? Math.min(1, Math.max(0, (tau - travel * 0.7) / 0.5)) || 0.001 : 1);

  const span = i > 0 ? from.distanceTo(dest) : 0;
  const high = i > 0 ? Math.min(820, Math.max(260, span * 1.25)) : 900;
  const look = i > 0 ? from.clone().lerp(dest, ease(Math.min(1, tau / travel))) : dest.clone().multiplyScalar(ease(Math.min(1, tau / travel)));
  let height = high, back = high * 0.55;
  if (tau > travel) {
    // The drone dive: down onto the pin, tilting towards the horizon.
    const d = ease((tau - travel) / dive);
    look.copy(dest);
    height = THREE.MathUtils.lerp(high, 14, d);
    back = THREE.MathUtils.lerp(high * 0.55, 30, d);
  }
  mapCam.position.set(look.x, STATE_H + height, look.z + back);
  mapCam.lookAt(look.x, STATE_H, look.z);
  mapCam.updateMatrixWorld();
  renderPass.scene = mapScene;
  renderPass.camera = mapCam;
  composer.render();
  renderPass.scene = scene;
  renderPass.camera = camera;
}

/* ---------- monuments ---------- */
// Built on demand and kept for a moment, since neighbouring frames usually share a monument.
const built = new Map();
function getBuilt(i) {
  if (!built.has(i)) {
    // Built at once from the builders imported up front (the site's build() loads them on demand).
    const r = BUILDERS[MONUMENTS[i].fn]();
    r.focus = r.focus || r.group;
    naturalize(r.group);
    separateCoplanar(r.group, 0.005);
    separateMerged(r.group);
    blendIntoLand(r);
    try {
      upgradeTrees(r.group, 650000);
      scatterGround(r, 650000);
    } catch {
      // safe fallback if a model has no foliage anchors
    }
    r.mirror = findMirror(r.group);
    r.home = computeHome(r);
    scene.add(r.group);
    // Compiling asks for the photo textures (js/surface.js requests them in onBeforeCompile), so
    // they load while the map flight plays instead of on the drone shot's first frame.
    renderer.compile(scene, camera);
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

// The site's home view (js/main.js): the monument as built (js/framing.js), and the builder's own
// preset where it gives one: view (the direction), zoom (closer than the whole site) and target
// (the point aimed at, for the view of a best-known photograph).
function computeHome(r) {
  const box = r.frame || frameBox(r.focus);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const radius = size.length() / 2;
  // The standard lens, not camera.fov: a monument is built during the map flight, while the camera
  // may still hold the last close-up's long lens.
  const vfov = THREE.MathUtils.degToRad(FOV), hfov = 2 * Math.atan(Math.tan(vfov / 2) * (W / H));
  const dist = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.1 * (r.zoom || 1);
  const target = r.target ? V(...r.target) : V(center.x, center.y * 0.95, center.z);
  return { target, dir: V(...(r.view || [0.9, 0.34, 1.25])).normalize(), dist, radius };
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
function ease(u) { return u * u * (3 - 2 * u); }
const up = V(0, 1, 0);
const clamp01 = (u) => Math.min(1, Math.max(0, u));
let shown = -1;

function slotAt(t) {
  let lo = 0, hi = SLOTS.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (SLOTS[mid].start <= t) lo = mid; else hi = mid - 1; }
  return lo;
}

// Close-ups through a long lens from outside the monument's box, so the camera never ends up inside
// a wall: the crown (domes, spires, chhatris), then the base (pillars, arches, carving).
function closeUp(r, which, u) {
  const box = r.frame || frameBox(r.focus);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const D = Math.max(r.home.dist * 0.95, Math.hypot(size.x, size.z) * 0.75);
  const crown = which === 'crown';
  const turn = THREE.MathUtils.degToRad(crown ? 28 : -32) + (u - 0.5) * THREE.MathUtils.degToRad(crown ? 10 : -12);
  const flat = r.home.dir.clone().setY(0).normalize().applyAxisAngle(up, turn);
  const target = crown
    ? V(c.x, box.max.y - size.y * 0.3, c.z)
    : V(c.x, box.min.y + size.y * 0.22, c.z);
  const frameH = crown
    ? Math.max(size.y * 0.66, Math.max(size.x, size.z) * 0.2)
    : Math.max(size.y * 0.5, Math.max(size.x, size.z) * 0.22);
  camera.position.copy(target).addScaledVector(flat, D);
  camera.position.y = crown ? target.y + D * 0.14 : Math.max(box.min.y + size.y * 0.06 + 1.6, target.y - D * 0.02);
  const zoom = 1 - 0.08 * ease(u); // a slow push in
  camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2 * Math.atan((frameH * 0.5) / D)) * zoom, 9, FOV);
  camera.updateProjectionMatrix();
  camera.lookAt(target);
  return target;
}

function renderAt(t) {
  const i = slotAt(Math.min(t, TOTAL - 0.001));
  const s = SLOTS[i], tau = t - s.start;
  const [, mapEnd] = s.shots.map, [, orbitEnd] = s.shots.orbit;
  // Built during the map flight, so its photo textures are loading before the drone arrives.
  const r = getBuilt(i);
  if (tau < mapEnd) { renderMap(i, tau, mapEnd); return; }

  if (i !== shown) {
    built.forEach((b, k) => { b.group.visible = k === i; });
    setEnvironment(r.home);
    renderer.shadowMap.needsUpdate = true;
    shown = i;
  }
  const { target, dir, dist } = r.home;
  let aim = target;
  if (tau < orbitEnd) {
    // The drone comes down out of the sky, then sweeps slowly round the monument.
    camera.fov = FOV;
    camera.updateProjectionMatrix();
    const u = clamp01((tau - mapEnd) / (orbitEnd - mapEnd));
    const descent = 1 - ease(clamp01((tau - mapEnd) / 3.2));
    const d = dir.clone().applyAxisAngle(up, (u - 0.5) * SWEEP);
    camera.position.copy(target).addScaledVector(d, dist * (1.06 - 0.12 * ease(u) + 0.45 * descent));
    camera.position.y += dist * 0.9 * descent * descent;
    camera.lookAt(target);
  } else {
    const half = (s.duration - orbitEnd) / 2, k = tau - orbitEnd;
    aim = k < half ? closeUp(r, 'crown', k / half) : closeUp(r, 'base', (k - half) / half);
  }
  camera.updateMatrixWorld();
  waterTime.value = skyMat.uniforms.time.value = t;
  sky.position.copy(camera.position);
  reflection.on.value = r.mirror ? 1 : 0;
  if (r.mirror) renderReflection(r.mirror, aim);
  composer.render();
}

window.addEventListener('hf-seek', (e) => renderAt(e.detail.time));
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
// Textures load on demand as models are built: build the first so the loading manager has work.
getBuilt(0);
window.__hf.buildReady.tour = texturesReady.then(() => renderAt(0));

const tl = gsap.timeline({ paused: true });
tl.to({}, { duration: TOTAL }, 0);
window.__timelines['tour'] = tl;
