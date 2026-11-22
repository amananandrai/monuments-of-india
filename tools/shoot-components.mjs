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
  const H = await import('/js/helpers.js'), C = await import('/js/parts/components.js'), T = await import('/js/parts/temples.js');
  const Mu = await import('/js/parts/mughal.js'), Co = await import('/js/parts/colonial.js'), D = await import('/js/parts/doorways.js');
  const F = await import('/js/parts/forts.js'), Tb = await import('/js/parts/tibetan.js'), S = await import('/js/parts/sculpture.js');
  const Fi = await import('/js/parts/figures.js'), R = await import('/js/parts/realism.js'), A = await import('/js/parts/animals.js'), Tr = await import('/js/parts/transport.js');
  const Sk = await import('/js/parts/sikh.js');
  const { M, mat, box, cyl, at, group, onFace } = H;
  // The statues: each monument's own builder for them.
  const SoU = await import('/js/monuments/statue-of-unity.js'), Gom = await import('/js/monuments/gommateshwara.js'), Viv = await import('/js/monuments/vivekananda-rock-memorial.js');
  const Nag = await import('/js/details/nageshwar-temple.js'), Ked = await import('/js/monuments/kedarnath-temple.js'), Omk = await import('/js/details/omkareshwar-temple.js');
  const IG = await import('/js/details/india-gate.js'), GoI = await import('/js/details/gateway-of-india.js'), VM = await import('/js/monuments/victoria-memorial.js');
  const Cs = await import('/js/monuments/csmt.js'), CsD = await import('/js/details/csmt.js'), Mys = await import('/js/details/mysore-palace.js');
  // Allegories in a row, each with what it holds: [opts, [[side, kind, holdOpts]]].
  const allegories = (list, m, gap = 1.6) => group(...list.map(([key, o, held], i) => { const a = Fi.allegory(key, o, m), g = new THREE.Group(); g.add(a.mesh); for (const [sd, k, ho] of held) Fi.hold(g, a, sd, k, m, ho); return at(g, i * gap, 0, 0); }));
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
    'muqarnas': [() => Mu.iwan(10, 14, { m: M.red, trim: M.marble, shade: M.redLight, depth: 2.6, frame: 2.4, top: 2.4, script: true, rosettes: true }), { view: [0.35, 0.1, 1] }],
    'niche': () => group(wall(6, 6.5, M.buff), at(C.niche(2.2, 4, true, 0.4, M.buff), 0, 1, 0)),
    'window-jali': () => group(wall(6, 6, M.marble), at(C.windowFrame(2.4, 4, M.marble, { screen: C.jali(M.marble) }), 0, 1, 0)),
    'classical-door': () => group(wall(8, 7.5, M.cream), at(Co.classicalDoor(2.2, 4.4, { m: M.cream, trim: M.buff, columns: 1, top: 'pediment' }), 0, 0, 0)),
    'gothic-window': () => group(wall(6, 7.5, M.buff), at(Co.gothicWindow(2.2, 5, { m: M.buff }), 0, 1.2, 0)),
    'temple-doorway': () => group(wall(8, 6.5, M.pink), at(D.templeDoorway(1.8, 3.4, { m: M.pink }), 0, 0, 0)),
    'pranala': [() => group(box(4, 3, 1, M.granite, 0, 0, -0.5), at(D.pranala(2.2, M.granite, { drop: 1.6 }), 0, 1.6, 0)), { view: [0.9, 0.35, 0.6] }],
    'louvred-shutters': [() => group(C.louvredShutter(1.4, 2.4), at(C.louvredShutter(1.4, 2.4), 2, 0, 0), box(4.4, 3, 0.4, M.brick || M.red, 1, -0.2, -0.2)), { view: [0.4, 0.1, 1] }],
    'copper-roofs': [() => group(at(H.hipRoof(10, 8, 3.2, H.surface(mat('#b0773f', 0.45, 0.4), 'copper')), 0, 0, 0), at(C.banglaRoof(7, 5, 2.2, H.surface(mat('#d9a93a', 0.32, 0.8), 'giltsheet')), 11, 0, -2.5)), { view: [0.5, 0.45, 1] }],
    'terracotta': [() => group(box(6, 3.2, 1, H.surface(mat('#8c5d49', 0.95), 'terracotta'), 0, 0, -0.5), box(6.04, 1.44, 1.04, H.surface(mat('#b0714f', 0.9), 'plaques'), 0, 0.6, -0.5)), { view: [0.35, 0.15, 1], fit: 0.8 }],
    'chadar': [() => group(box(6, 2.4, 3, M.marble, 0, 0, -1.5), at(C.chadar(3, 5, 1.8), 0, 0.6, 0)), { floor: 'grass', view: [0.6, 0.5, 1] }],
    'chhajja': () => group(wall(10, 5, M.cream), at(C.chhajja(10.6, 1.8, 0.7, 0.16, M.buff), 0, 4.6, 0), C.placeAll(C.bracketGeo(1.1, 1.6, 0.35), C.alongFace(0, 0, 9, 6, 4.5), M.buff)),
    'merlons': () => group(wall(12, 5, M.red), at(C.merlons(12, 1.1, 1.4, 0.5, M.red), 0, 5, -0.3)),
    'railing': () => C.railing(9, 1.3, 0.3, M.marble),
    'shikhara': () => group(box(7.4, 4, 7.4, M.pink), at(H.shikhara(7, 14, M.pink, H.nagaraProfile), 0, 4, 0)),
    'nagara-temple': () => T.nagaraTemple({ w: 9, h: 18, m: M.pink, shade: M.pinkShade }),
    'dravida-vimana': () => group(box(9, 4, 9, M.granite), at(T.dravidaVimana(9, 5, 2.2, M.granite, M.graniteDark), 0, 4, 0)),
    'gopuram': () => T.gopuram(16, 10, 26, 6, 3),
    'mandap': () => T.mandap(10, 4.5, 3, M.granite, M.graniteDark, [0]),
    'temple-niche': () => group(wall(5, 6, M.pink), at(C.templeNiche(1.6, 3, M.pink, { figure: C.idol(2.5, M.pink) }), 0, 1, 0)),
    'manastambha': () => T.manastambha(12, M.marble, { images: true }),
    'deepmala': () => T.deepmala(9),
    'dravida-dress': () => group(box(14, 6, 10, M.granite), T.dravidaDress(14, 10, 6, M.granite, { eaveM: M.graniteDark, haraM: M.stucco })),
    'nandi-mandapa': () => T.nandiMandapa(7, 4.4, M.granite, M.graniteDark),
    'kerala-gable': [() => group(box(9, 1.2, 4, M.granite, 0, 0, -2), at(T.keralaGable(6, 2.6, 3.6, mat('#b0773f', 0.45, 0.4), mat('#5a3a24', 0.7)), 0, 1.2, 0)), { view: [0.15, 0.5, 1] }],
    'inlay-border': () => group(wall(7, 8, M.red), at(C.inlayBorder(5, 6.4, 0.4, M.marble, C.D.ink), 0, 0.8, 0)),
    'fort-gate': () => F.fortGate(16, 12, 8, 4.6, 8, { m: M.red, trim: M.redLight, box: true, towers: { r: 3, h: 14, cap: 'merlons', seg: 12 } }),
    'rampart': () => { const segs = [[-9, 0, 0, 9.2, 7, 2.4, 0], [0, 0, 0, 9.2, 7, 2.4, 0], [9, 0, 0, 9.2, 7, 2.4, 0]]; return group(H.inst(H.unitBox(), segs, M.buff), F.rampart(segs, M.buff, { centre: [0, -100], boxes: 2 }), cyl(3.4, 3.8, 9.5, M.buff, 15, 0, 0, 16), F.bastionCrowns([[15, 9.5, 0, 3.4]], M.buff)); },
    'machicolation': [() => group(box(8, 6, 2, M.buff, 0, 0, -1), F.machicolations([[0, 4.4, 0, 0, 1.2]], M.buff, M.redLight)), { view: [0.6, 0.15, 1] }],
    'tibetan-houses': () => { const b = [[0, 0, 0, 8, 6.5, 7, 0], [10, 0, -1, 7, 5, 7, 0.2]]; return group(H.inst(H.unitBox(), b, H.TIBETAN.white), H.inst(H.unitBox(), b.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.3, 0.7, d + 0.3, ry]), H.TIBETAN.maroon), Tb.quarters(b)); },
    'dharma-wheel': () => group(Tb.dharmaWheel(4), at(Tb.gyaltsen(1.8), 3.4, 0, 0)),
    'tibetan-hall': [() => Tb.hall(16, 9, 10, { floors: 2, door: 0, doorW: 2, bay: 3.4 }), { view: [0.5, 0.25, 1] }],
    'mani-wheels': [() => Tb.maniWheels(8, { back: true }), { floor: 'stone', view: [0.5, 0.3, 1] }],
    'gilded-roof': () => group(box(10.3, 0.7, 10.3, H.TIBETAN.maroon), at(H.hipRoof(11, 11, 3, M.gild), 0, 0.7, 0), at(Tb.ganjira(2.4), 0, 3.55, 0), at(Tb.roofCorners(11, 11), 0, 0.7, 0)),
    'grand-stair': () => group(box(14, 3, 6, M.pinkShade, 0, 0, -3), D.grandStair(3, 8, M.pinkShade, M.pink)),
    'figure-frieze': () => group(wall(9, 3.4, M.pink), at(S.figureFrieze(8.4, 1.6, M.pink, { kinds: ['standing', 'dancer', 'elephant'] }), 0, 0.9, 0)),
    'statue': () => group(S.statue(5, M.bronze, 'standing', M.granite), at(S.urn(1.6, M.marble), 3, 0, 0), at(S.pinnacle(2.4, M.buff), 5, 0, 0)),
    // Parts from the monuments added later: gurdwaras, Kerala, the early temples, churches and forts.
    'sikh-dome': () => group(cyl(3.6, 3.6, 1.4, M.marble, 0, 0, 0, 32), at(Sk.sikhDome(4, Sk.GILT), 0, 1.4, 0)),
    'nishan-sahib': () => Sk.nishanSahib(14),
    'sikh-storeys': () => group(Sk.arcadeStorey(16, 6, 5, M.marble, { trim: Sk.GILT, centre: 'door' }), at(Sk.parapetDomes(16, 0, 5, Sk.GILT), 0, 6, 0), at(Sk.rectStorey(12, 9, 4.5, 3, M.marble, { fill: 'jali', front: 'door' }), 0, 6, 0)),
    'gold-roof-tiers': () => group(box(20, 6, 14, H.TIBETAN.white), at(Tb.goldRoof(20, 14), 0, 6, 0)),
    'pear-dome': () => group(cyl(3.2, 3.2, 3, M.marble, 0, 0, 0, 40), at(Mu.pearDome(4, M.marble), 0, 3, 0), at(H.finial(3), 0, 3 + 8.1, 0)),
    'battered-wall': () => H.inst(F.batteredGeo(), [[0, 0, 0, 30, 12, 8]], M.buff),
    'arrow-bastion': () => { const P = [[-30, 20], [30, 20], [30, -20], [-30, -20]]; return group(H.planPrism(P, 0, 5, M.buff), ...P.map((_, i) => H.planPrism(F.arrowBastion(P, i, { flank: 6, shoulder: 4, point: 11 }), 0, 6, M.buff))); },
    'ring-roof': () => group(box(22, 4, 22, M.cream, 0, 0, 0), at(T.ringRoof(22, 22, 6, 1.2, 3.6, mat('#8e4630', 0.82)), 0, 4, 0)),
    'kerala-gopuram': () => T.keralaGopuram(16, 11),
    'chandrashala': () => group(wall(9, 7, M.buff), at(T.chandrashala(1.6, M.buff), -2, 3.6, 0), at(T.gavaksha(2.2, mat('#9a5640', 0.93), mat('#5e3326', 0.95)), 2.4, 2.2, 0)),
    'wagon-roof': () => group(box(11, 4, 4.4, M.granite, 0, 0, 0), at(T.wagonRoof(11, 4.4, M.granite), 0, 4, 0)),
    'spire-canopy': () => { const s = H.shikhara(5, 7, M.buff, H.nagaraProfile, 16, M.buff, 0.3); return group(s, at(T.spireCanopy(3, M.buff), 0, s.userData.top - 0.8, 0)); },
    'broken-spire': () => group(T.brokenSpire(5, 9, 0.55, M.buff), at(T.brokenSpire(5, 9, 1, M.buff), 6.5, 0, 0)),
    'apse': () => group(H.planPrism(T.apsePlan(10, -8, 6), 0, 1.2, M.buff), H.planPrism(T.apsePlan(8, -7, 6), 1.2, 4, M.buff)),
    'kakatiya-thorana': () => T.kakatiyaThorana(mat('#a39b8d', 0.9), mat('#7f786c', 0.93)),
    'chaitya-doorway': () => group(wall(12, 6.5, M.granite), at(D.chaityaDoorway(M.granite), -2.5, 0, 0), at(D.mauryanDoor(1.15, 2.1, M.granite), 3.5, 0, 0)),
    'gable-roof': () => group(box(8, 5, 14, M.cream), at(C.gableRoof(9, 14.6, 4, mat('#9a4a32', 0.8)), 0, 5, 0), box(4, 3, 14, M.cream, 6, 0, 0), at(C.leanTo(4.4, 14.6, 2.2, mat('#9a4a32', 0.8), 1), 4, 3, 0)),
    'meitei-roof': () => group(box(8, 3, 10, M.cream), at(C.meiteiRoof(8, 10, 6, mat('#8d2f2a', 0.6)), 0, 3, 0)),
    'tree-jali': [() => group(wall(9, 6.5, M.buff), at(C.treeJali(3.6, 5.2, 'tree'), -2.1, 0.6, 0.05), at(C.treeJali(3.6, 5.2, 'branches'), 2.1, 0.6, 0.05)), { view: [0, 0.1, 1] }],
    'persian-ornament': () => group(wall(12, 7, M.cream), at(C.faravahar(5.4, M.cream), 0, 3, 0.05), at(C.steppedMerlons(12, 0.8, 1.2, M.cream), 0, 7, -0.3)),
    'pierced-wall': () => C.piercedWall(16, 10, 0.8, [[-4, 7, 2.2], [4, 7, 2.2], ['arch', -4, 0, 1.6, 2.6], ['arch', 4, 0, 1.6, 2.6]], mat('#a0573c', 0.9)),
    'trishul': () => C.trishul(8),
    'gothic-turret': () => group(Co.gothicTurret(1.2, 10, M.cream, M.buff, 5), at(Co.gothicTurret(0.8, 7, M.cream, M.buff, 3.2), 3.5, 0, 0)),
    'tower-clock': () => group(wall(4, 5, M.cream), at(Co.towerClock(1.5), 0, 3, 0.02)),
    'elephant-pillar': () => group(S.elephantPillar(7, M.buff), at(S.elephantPillar(7, M.buff), 2.6, 0, 0)),
    'bull-column': () => group(S.bullColumn(9, M.cream, M.buff), at(S.bullColumn(9, M.cream, M.buff), 4, 0, 0)),
    'ashokan-pillar': [() => A.ashokanPillar(), { view: [-1, 0.25, 0.4] }],
    // ---- the statues
    'statue-patel': [() => SoU.patel(H.surface(mat('#7b6a48', 0.62, 0.45), 'plates')), { view: [0.35, 0.08, 1], fit: 1.15 }],
    'statue-bahubali': [() => Gom.bahubali(), { view: [0.25, 0.1, 1], fit: 1.1 }],
    'statue-thiruvalluvar': [() => Viv.thiruvalluvar(), { floor: 'water', view: [-0.2, 0.15, 1], fit: 0.9 }],
    'statue-shiva': [() => Nag.mahayogiShiva(), { floor: 'sand', view: [0.25, 0.12, 1], fit: 0.85 }],
    'statue-shankaracharya': [() => Ked.shankaracharya(), { view: [0.3, 0.12, 1], fit: 0.85 }],
    'statue-oneness': [() => Omk.statueOfOneness(), { floor: 'grass', view: [0.3, 0.12, 1], fit: 0.85 }],
    'statue-netaji': [() => IG.netaji(), { view: [0.3, 0.08, 1], fit: 1.1 }],
    'statue-shivaji': [() => GoI.shivajiStatue(), { floor: 'grass', view: [1, 0.12, 0.55], fit: 0.6 }],
    'statue-angel-victoria': [() => group(VM.angelOfVictory(), at(VM.queenVictoria(), 7, 0, 0)), { view: [0.3, 0.12, 1], fit: 0.9 }],
    'statue-allegories': [() => allegories([
      ['justice', { right: 'down', left: 'raised' }, [['r', 'sword', { axis: [0, 1, 0.15] }], ['l', 'scales', {}]]],
      ['prudence', { right: 'forward', left: 'down' }, [['r', 'mirror', { axis: [0, 0.6, 1] }]]],
      ['motherhood', { seated: true, child: true, baby: true, right: 'lap', left: 'cradle' }, []],
      ['learning', { right: 'chest', left: 'chest', free: -1 }, [['r', 'book', { axis: [0, 1, 0.5], offset: [0.08, 0.02, 0.03] }]]],
      ['britannia', { seated: true, head: 'helmet', right: 'holdUp', left: 'lap' }, [['r', 'trident', {}]]],
    ], M.marbleShade, 1.5), { view: [0.15, 0.12, 1], fit: 0.95 }],
    'statue-progress': [() => Cs.progress(), { view: [0.3, 0.1, 1], fit: 0.85 }],
    'statue-commerce-agriculture': [() => group(CsD.commerce(), at(CsD.agriculture(), 7, 0, 0)), { view: [0.15, 0.1, 1], fit: 0.85 }],
    'statue-gajalakshmi': [() => Mys.gajalakshmi(), { view: [0.15, 0.1, 1], fit: 0.85 }],
    'statue-lions': [() => group(A.lionCapital(M.bronze, 1), at(A.couchant(M.cream), 3.6, 0, 0), at(A.couchant(M.cream, { tiger: true }), 7.2, 0, 0)), { floor: 'sand', view: [0.6, 0.2, 1] }],
    'kangla-sha': () => A.kanglaSha(),
    'trimurti': () => S.trimurti(M.buff),
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
    'traffic': [() => group(box(40, 0.2, 14, M.asphalt), R.traffic([[-4.6, 1], [-1.6, 1], [1.6, -1], [4.6, -1]], -18, 18, { y: 0.2, gap: 9, seed: 3, taxis: 0.3, buses: 0.15, trucks: 0.15 })), { floor: 'stone', view: [0.6, 0.45, 1], fit: 0.8 }],
    'trains': [() => group(at(Tr.track(70), 0, 0, 5), at(Tr.train(2, { livery: 'blue' }), 0, Tr.RAIL_TOP, 5), at(Tr.overhead(70, { span: 35 }), 0, 0, 5), at(Tr.track(70), 0, 0, -1), at(Tr.train(3, { livery: 'vande' }), 0, Tr.RAIL_TOP, -1), at(Tr.track(70), 0, 0, -7), at(Tr.train(3, { livery: 'emu' }), 0, Tr.RAIL_TOP, -7)), { floor: 'stone', view: [0.5, 0.5, 1], fit: 0.6 }],
    'platform': [() => group(at(Tr.platform(60, 9), 0, 0, 0), at(Tr.track(60), 0, 0, 7), at(Tr.track(60), 0, 0, -7), at(Tr.train(2, { livery: 'red', loco: false }), 0, Tr.RAIL_TOP, 7)), { floor: 'stone', view: [0.8, 0.4, 1], fit: 0.75 }],
    'airliners': [() => group(Tr.airliner({ size: 'wide', tail: '#c8102e' }), at(Tr.airliner({ tail: '#1f2f8f', belly: '#1f2f8f' }), 0, 0, 50), at(Tr.jetBridge(26), 5, 0, 24).rotateY(Math.PI / 2)), { floor: 'stone', view: [0.8, 0.4, 1], fit: 0.8 }],
    'guardian': [() => group(box(1.6, 0.4, 1.2, M.granite), at(Fi.guardian(1.8, M.granite), 0, 0.4, 0)), { floor: 'stone', view: [0.3, 0.15, 1], fit: 0.9 }],
    'nandi': [() => group(box(4, 0.8, 6, M.granite), at(A.nandi(mat('#3b3936', 0.7), 0.7), 0, 0.8, 0)), { floor: 'stone', view: [1, 0.3, 0.8] }],
    'elephants': [() => group(at(A.elephant(M.granite, 1), 0, 0, 0), at(A.rideElephant(mat('#6f6a66', 0.85), 1), 7, 0, 0), at(A.rideElephant(mat('#5e5650', 0.9), 1, { cloth: '#b3262e', howdah: false }), 14, 0, 0)), { floor: 'sand', view: [0.6, 0.25, 1] }],
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
