// Pictures of the shared parts, one each, for architecture.md, realism.md and
// components.md: a dome, a chhatri, a pillar, each kind of tree, a boat, and so on.
//   node shoot-components.mjs [name ...] [--size 640x420] [--out dir]
// Each part is built on its own, on a plain floor, framed by its own size and drawn by the plain
// renderer (a sun and a sky light, as shoot-views.mjs without --site). Written to img/<name>.jpg.
// Run it by hand when a shared part changes its look; no workflow runs it.
// A part that fails to build is reported and skipped, and the run exits 1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, PRELUDE } from './lib/browser.mjs';

const argv = process.argv.slice(2), opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const [W, H] = (opt('--size') || '640x420').split('x').map(Number);
const only = argv.filter((a, i) => !a.startsWith('--') && !['--size', '--out'].includes(argv[i - 1]));
const out = opt('--out') ? path.resolve(opt('--out')) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../img');
fs.mkdirSync(out, { recursive: true });

// The parts, in the page: name → a function returning an object, or [object, options]. Options:
// floor ('grass', 'sand', 'water' or 'stone'), view (the direction the camera stands in), fit (a
// margin on the camera's distance, 1.1 by default).
const PARTS = `
  const H = await import('/js/helpers.js'), C = await import('/js/details/components.js'), T = await import('/js/details/temples.js');
  const Mu = await import('/js/details/mughal.js'), Co = await import('/js/details/colonial.js'), D = await import('/js/details/doorways.js');
  const F = await import('/js/details/forts.js'), Tb = await import('/js/details/tibetan.js'), S = await import('/js/details/sculpture.js');
  const Fi = await import('/js/details/figures.js'), R = await import('/js/details/realism.js'), A = await import('/js/details/animals.js');
  const { M, mat, box, cyl, at, group, onFace } = H;
  detail.level = 'high';
  const full = (g) => { const w = new THREE.Group(); w.add(g); R.upgradeTrees(w, 1e9); return w; };
  const row = (kinds, gap, opts = {}) => group(...kinds.map((k, i) => full(R.trees([[i * gap, 0]], { kind: k, seed: 2, ...opts }))));
  const wall = (w, h, m) => box(w, h, 0.6, m, 0, 0, -0.3);
  const PARTS = {
    // ---- architecture
    'onion-dome': () => group(cyl(4.3, 4.3, 1.6, M.marble, 0, 0, 0, 40), at(H.onionDome(5, M.marble), 0, 1.6, 0), at(H.finial(4), 0, 1.6 + 5 * 1.78, 0)),
    'lotus-dome': () => group(cyl(4.2, 4.2, 1.6, M.marble, 0, 0, 0, 40), at(C.lotusDome(5, M.marble), 0, 1.6, 0), at(C.crescentFinial(4), 0, 1.6 + 5 * 1.8, 0)),
    'chhatri': () => H.chhatri(3, 8, M.red, M.marble),
    'mughal-chhatri': () => C.mughalChhatri(3, 8, M.marble),
    'guldasta': () => group(H.guldasta(9, 0.6, M.lime), at(H.guldasta(6, 0.45, M.lime), 2.6, 0, 0)),
    'minaret': () => H.minaret(30, 2, M.marble),
    'jharokha': () => group(wall(7, 7, M.hawa), at(C.jharokha(2.4, 3, M.hawaLight, { trim: M.hawa }), 0, 2.2, 0)),
    'column': () => group(Co.column(0.6, 7, M.cream), at(Co.column(0.6, 7, M.cream, { order: 'corinthian' }), 3.2, 0, 0)),
    'carved-pillar': () => group(T.carvedPillar(5, M.pink), at(T.carvedPillar(5, M.pink), 2.4, 0, 0)),
    'cluster-pillar': () => S.clusterPillar(5, M.granite, { figures: true }),
    'yali-pillar': () => S.yaliPillar(5, M.granite, { rich: true }),
    'column-trim': () => { const cols = [[0, 0, 0, 0.9, 6, 0.9], [3, 0, 0, 0.9, 6, 0.9], [6, 0, 0, 0.9, 6, 0.9]]; return group(H.inst(H.unitCyl(14), cols, M.buff), C.columnTrim(cols, M.buff), box(8, 0.7, 1.6, M.buff, 3, 6, 0)); },
    'arch': () => group(H.archWall(9, 8, 1.4, 4.4, 6, true, M.red), at(C.archRing(4.4, 6, true, 0.4, 0.14, M.marble), 0, 0, 0.7)),
    'iwan': () => Mu.iwan(6, 9, { m: M.red, trim: M.marble, shade: M.redLight }),
    'niche': () => group(wall(6, 6.5, M.buff), at(C.niche(2.2, 4, true, 0.4, M.buff), 0, 1, 0)),
    'window-jali': () => group(wall(6, 6, M.marble), at(C.windowFrame(2.4, 4, M.marble, { screen: C.jali(M.marble) }), 0, 1, 0)),
    'classical-door': () => group(wall(8, 7.5, M.cream), at(Co.classicalDoor(2.2, 4.4, { m: M.cream, trim: M.buff, columns: 1, top: 'pediment' }), 0, 0, 0)),
    'gothic-window': () => group(wall(6, 7.5, M.buff), at(Co.gothicWindow(2.2, 5, { m: M.buff }), 0, 1.2, 0)),
    'temple-doorway': () => group(wall(8, 6.5, M.pink), at(D.templeDoorway(1.8, 3.4, { m: M.pink }), 0, 0, 0)),
    'chhajja': () => group(wall(10, 5, M.cream), at(C.chhajja(10.6, 1.8, 0.7, 0.16, M.buff), 0, 4.6, 0), C.placeAll(C.bracketGeo(1.1, 1.6, 0.35), C.alongFace(0, 0, 9, 6, 4.5), M.buff)),
    'merlons': () => group(wall(12, 5, M.red), at(C.merlons(12, 1.1, 1.4, 0.5, M.red), 0, 5, -0.3)),
    'railing': () => C.railing(9, 1.3, 0.3, M.marble),
    'shikhara': () => group(box(7.4, 4, 7.4, M.pink), at(H.shikhara(7, 14, M.pink, H.nagaraProfile), 0, 4, 0)),
    'nagara-temple': () => T.nagaraTemple({ w: 9, h: 18, m: M.pink, shade: M.pinkShade }),
    'dravida-vimana': () => group(box(9, 4, 9, M.granite), at(T.dravidaVimana(9, 5, 2.2, M.granite, M.graniteDark), 0, 4, 0)),
    'gopuram': () => T.gopuram(16, 10, 26, 6, 3),
    'mandap': () => T.mandap(10, 4.5, 3, M.granite, M.graniteDark, [0]),
    'temple-niche': () => group(wall(5, 6, M.pink), at(C.templeNiche(1.6, 3, M.pink, { figure: C.idol(2.5, M.pink) }), 0, 1, 0)),
    'fort-gate': () => F.fortGate(16, 12, 8, 4.6, 8, { m: M.red, trim: M.redLight, towers: { r: 3, h: 14, cap: 'merlons', seg: 12 } }),
    'rampart': () => { const segs = [[-9, 0, 0, 9.2, 7, 2.4, 0], [0, 0, 0, 9.2, 7, 2.4, 0], [9, 0, 0, 9.2, 7, 2.4, 0]]; return group(H.inst(H.unitBox(), segs, M.buff), F.rampart(segs, M.buff, { centre: [0, -100] }), cyl(3.4, 3.8, 9.5, M.buff, 15, 0, 0, 16), F.bastionCrowns([[15, 9.5, 0, 3.4]], M.buff)); },
    'tibetan-houses': () => { const b = [[0, 0, 0, 8, 6.5, 7, 0], [10, 0, -1, 7, 5, 7, 0.2]]; return group(H.inst(H.unitBox(), b, H.TIBETAN.white), H.inst(H.unitBox(), b.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.3, 0.7, d + 0.3, ry]), H.TIBETAN.maroon), Tb.quarters(b)); },
    'dharma-wheel': () => group(Tb.dharmaWheel(4), at(Tb.gyaltsen(1.8), 3.4, 0, 0)),
    'grand-stair': () => group(box(14, 3, 6, M.pinkShade, 0, 0, -3), D.grandStair(3, 8, M.pinkShade, M.pink)),
    'figure-frieze': () => group(wall(9, 3.4, M.pink), at(S.figureFrieze(8.4, 1.6, M.pink, { kinds: ['standing', 'dancer', 'elephant'] }), 0, 0.9, 0)),
    'statue': () => group(S.statue(5, M.bronze, 'standing', M.granite), at(S.urn(1.6, M.marble), 3, 0, 0), at(S.pinnacle(2.4, M.buff), 5, 0, 0)),
    // ---- the setting
    'trees-broadleaf': [() => row(['neem', 'mango', 'jamun', 'tamarind', 'teak', 'sal'], 9), { floor: 'grass', view: [0, 0.12, 1] }],
    'trees-wide': [() => row(['banyan', 'peepal', 'chinar', 'willow'], 17), { floor: 'grass', view: [0, 0.12, 1] }],
    'trees-dry': [() => row(['ber', 'babul', 'khejri', 'dhok'], 7), { floor: 'sand', view: [0, 0.12, 1] }],
    'trees-columns': [() => row(['ashoka', 'poplar', 'cypress', 'casuarina', 'fir', 'deodar'], 9), { floor: 'grass', view: [0, 0.12, 1] }],
    'palms': [() => full(R.trees([[0, 0], [5, 2], [9, -1]], { kind: 'palm', seed: 3 })), { floor: 'sand' }],
    'shrubs': [() => group(R.shrubs(R.along(5, [0, 0], [8, 0]).map(([x, z]) => [x, z, 1.3])), R.shrubs(R.along(5, [0, 3], [8, 3]).map(([x, z]) => [x, z, 1.3]), { flowers: '#d0306f', seed: 5 }), R.shrubs(R.along(5, [0, 6], [8, 6]).map(([x, z]) => [x, z, 1.5]), { dry: true, seed: 7 })), { floor: 'grass' }],
    'lamp-posts': [() => group(R.lampPosts([[0, 0], [5, 0]]), R.benches([[2.5, 1.2, 0]]), R.bollards(R.along(5, [-1, 3.4], [6, 3.4]))), { floor: 'stone' }],
    'asi-board': [() => R.asiBoard('Qutub Minar', 0, 0, 0), { floor: 'grass' }],
    'fountains': [() => group(box(9, 0.4, 5, M.water), R.fountains([[-2.5, 0], [0, 0], [2.5, 0]], { y: 0.4 })), { floor: 'stone' }],
    'prayer-flags': [() => group(cyl(0.1, 0.12, 8, M.wood, -7, 0, 0, 8), cyl(0.1, 0.12, 5, M.wood, 7, 0, 0, 8), R.prayerFlags([-7, 8, 0], [7, 5, 0], { sag: 1.6, size: 0.6 })), { floor: 'sand' }],
    'flags': [() => group(H.tricolour(10), at(H.flag(6, M.saffron), 6, 0, 0)), { floor: 'grass' }],
    'garland': [() => group(box(0.5, 4, 0.5, M.pink, -2.5, 0, 0), box(0.5, 4, 0.5, M.pink, 2.5, 0, 0), box(5.5, 0.5, 0.5, M.pink, 0, 4, 0), R.garland([-2.2, 3.9, 0.3], [2.2, 3.9, 0.3], { sag: 0.7, strands: 3 })), { floor: 'stone' }],
    'boats': [() => group(R.boats([[0, 0, 0.3], [7, 3, 1.2]], { size: 1.8 }), R.boats([[-7, 4, -0.4]], { size: 2.2, canopy: true })), { floor: 'water' }],
    'launches': [() => R.launches([[0, 0, 0.4], [16, 8, 1.1]]), { floor: 'water' }],
    'ships': [() => R.ships([[0, 0, 0.3]]), { floor: 'water' }],
    'houseboats': [() => R.houseboats([[0, 0, 0.2], [14, 4, 0.5]]), { floor: 'water' }],
    'stalls': [() => group(R.stalls([[0, 0, 0], [4.5, 0, 0], [9, 0, 0]]), R.umbrellas([[13, 0], [15.5, 1]])), { floor: 'stone' }],
    'town-houses': [() => R.townHouses([[0, 0, 9, 11, 3, 0], [10.5, 0, 9, 11, 2, 0], [21, 0, 10, 11, 4, 0], [32, 0, 9, 11, 3, 0]], { seed: 4 }), { floor: 'stone' }],
    'traffic': [() => group(box(90, 0.2, 16, M.asphalt), R.traffic([[-5, 1], [-1.8, 1], [1.8, -1], [5, -1]], -40, 40, { y: 0.2, gap: 14, seed: 3, taxis: 0.3, buses: 0.2 })), { floor: 'stone', view: [0.5, 0.5, 1] }],
    'nandi': [() => group(box(4, 0.8, 6, M.granite), at(A.nandi(mat('#3b3936', 0.7), 0.7), 0, 0.8, 0)), { floor: 'stone', view: [1, 0.3, 0.8] }],
    'elephants': [() => group(at(A.elephant(M.granite, 1), 0, 0, 0), at(A.rideElephant(mat('#6f6a66', 0.85), 1), 7, 0, 0)), { floor: 'sand', view: [0.6, 0.25, 1] }],
    'horse-lion': [() => group(A.horse(mat('#6b4a33', 0.85)), at(A.lion(2.4, M.buff), 5, 0, 0)), { floor: 'sand', view: [0.6, 0.25, 1] }],
    'deer': [() => A.deer([[0, 0, 0.4], [3, 2, 1.6], [6, -1, 2.6], [8, 3, 0.2]]), { floor: 'grass', view: [0.5, 0.25, 1] }],
    'yaks-camels': [() => group(A.yaks([[0, 0, 0.5], [5, 2, 1.4]]), A.camels([[12, 0, -0.4], [17, 2, 0.3]])), { floor: 'sand', view: [0.5, 0.25, 1] }],
  };
`;

const page = await openPage({ gl: true });
const names = await page.run(PRELUDE + PARTS + 'return Object.keys(PARTS);');
const failed = [];
for (const name of only.length ? only : names) {
  if (!names.includes(name)) { console.error(`\nno part named ${name}`); failed.push(name); continue; }
  try {
    const jpg = await page.run(PRELUDE + PARTS + `
      const entry = PARTS[args.name], [make, o] = Array.isArray(entry) ? entry : [entry, {}];
      const part = make();
      const scene = new THREE.Scene(); scene.background = new THREE.Color('#d6dfe8'); scene.add(part);
      scene.add(new THREE.HemisphereLight('#e6eeff', '#a08a6c', 1.25));
      const sun = new THREE.DirectionalLight('#fff3e0', 2.3); sun.position.set(-40, 70, 60); scene.add(sun);
      part.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(part), size = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      const floors = { grass: M.grass, sand: mat('#d9c49a', 0.95), stone: mat('#cfc8ba', 0.95), water: M.lake };
      const fm = floors[o.floor || 'stone'], r = Math.max(size.x, size.z) * 2.2 + 6;
      scene.add(at(H.cyl(r, r, 0.1, fm, 0, 0, 0, 48), c.x, Math.min(0, b.min.y) - 0.1, c.z));
      const ren = window.__ren || (window.__ren = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }));
      ren.setSize(args.W, args.H);
      const cam = new THREE.PerspectiveCamera(30, args.W / args.H, 0.1, 5000);
      const vf = THREE.MathUtils.degToRad(30), hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
      // Far enough to hold the part's width (seen cornerwise) and its height, with a margin.
      const dist = Math.max(Math.hypot(size.x, size.z) / 2 / Math.tan(hf / 2), size.y / 2 / Math.tan(vf / 2)) * (o.fit || 1.1) + Math.min(size.x, size.z) / 2;
      const dir = new THREE.Vector3(...(o.view || [0.7, 0.32, 1])).normalize();
      cam.position.copy(c).addScaledVector(dir, dist); cam.lookAt(c);
      ren.render(scene, cam); ren.render(scene, cam);
      return ren.domElement.toDataURL('image/jpeg', 0.86);
    `, { name, W, H });
    fs.writeFileSync(path.join(out, `${name}.jpg`), Buffer.from(jpg.split(',')[1], 'base64'));
    process.stdout.write('.');
  } catch (e) { failed.push(name); console.error(`\n${name}: ${String(e.message).split('\n')[0]}`); }
}
await page.close();
console.log(`\n${(only.length ? only : names).length - failed.length} pictures in ${out}`);
if (failed.length) { console.error(`Failed: ${failed.join(', ')}`); process.exit(1); }
