import * as THREE from 'three';
import { mat, mesh, box, at, onFace, FACES, aroundRect, inst, unitBox, strut } from '../helpers.js';
import { mouldings, frieze, chhajja, bracketGeo, placeAll, templeNiche, mergeByMaterial } from './components.js';
import { boats, lampPosts, along } from './realism.js';

// The Vivekananda Rock Memorial, finer detail. From photographs of the mandapam (built in 1970 in a
// blend of temple styles from across India): its platform is moulded and carved in a band; the
// pillars of its colonnade stand on bases and carry bracket capitals under a deep sloping eave; and
// the small Shripada Mandapam has a niche in each side wall. Dimensions follow
// js/monuments/vivekananda-rock-memorial.js: the platform 34 × 44 from T = 8.8, the colonnade round
// a 22 m square at z = 4 from T + 1.4 to T + 9.4.
const STONE = mat('#c9a98a', 0.85), SHADE = mat('#9c7e62', 0.9);
function architecture(f) {
  const d = new THREE.Group(), T = 8.8, bases = [], caps = [], br = [];
  d.add(at(mouldings(34, 44, [[0.15, 0.4, 0.12, frieze(STONE)], [1.0, 0.4, 0.2]], SHADE), 0, T, 0));
  for (const [x, z, a] of aroundRect(22, 22, 2.6)) {
    bases.push([x, T + 1.4, z + 4, 1.7, 0.5, 1.7]);
    caps.push([x, T + 8.7, z + 4, 1.7, 0.7, 1.7]);
    const o = a + Math.PI;
    br.push([x + Math.sin(o) * 0.6, T + 8.7, z + 4 + Math.cos(o) * 0.6, o]);
  }
  d.add(placeAll(bracketGeo(1.0, 0.9, 0.5), br, SHADE));
  const roof = at(new THREE.Group(), 0, 0, 4);
  for (const a of FACES) roof.add(onFace(at(chhajja(27, 1.6, 0.7, 0.16, SHADE), 0, T + 10.4, 0), a, 13));
  d.add(roof);
  for (const a of [Math.PI / 2, -Math.PI / 2, Math.PI]) {
    const n = onFace(at(templeNiche(1.4, 2.6, STONE), 0, T + 2.2, 0), a, a === Math.PI ? 5 : 6);
    n.position.z += -16;
    d.add(n);
  }
  mergeByMaterial(d);
  f.add(d, inst(unitBox(), bases, SHADE), inst(unitBox(), caps, SHADE));
}

// The glass bridge (opened at the end of 2024) between the memorial's rock and the Thiruvalluvar
// rock: a level deck with a glass walkway down its middle, glass balustrades, and a pair of white
// steel bowstring arches carrying it on hangers, set on an abutment on each rock. In the model it
// runs from the edge of the memorial platform (x -18) to just short of the statue's pedestal.
const GLASS = mat('#bfe3ec', 0.05, 0.1, { transparent: true, opacity: 0.45 }), STEEL = mat('#eceae4', 0.4, 0.5), CONC = mat('#b8b2a8', 0.9);
function glassBridge() {
  const A = [-18, 4.3], B = [-63, 15], Y = 7.2, W = 9, Ha = 8;
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), b = new THREE.Group();
  b.add(box(L, 0.5, W, CONC, L / 2, Y - 0.5, 0), box(L, 0.08, 3.2, GLASS, L / 2, Y, 0));
  for (const s of [-1, 1]) {
    b.add(box(L, 0.7, 0.6, STEEL, L / 2, Y - 0.6, s * (W / 2 - 0.3)), box(L, 1.2, 0.06, GLASS, L / 2, Y, s * (W / 2 - 0.7)));
    const pts = [];
    for (let k = 0; k <= 24; k++) pts.push(new THREE.Vector3((L * k) / 24, Y + Ha * Math.sin((Math.PI * k) / 24), s * (W / 2 - 0.3)));
    b.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.35, 8, false), STEEL));
    for (let k = 2; k < 24; k += 2) b.add(strut(new THREE.Vector3(pts[k].x, Y, pts[k].z), pts[k], 0.06, STEEL));
  }
  // Abutments down into the rock at each end.
  for (const x of [0, L]) b.add(box(4, Y, W + 1, CONC, x, 0, 0));
  b.rotation.y = Math.atan2(-(B[1] - A[1]), B[0] - A[0]);
  return at(b, A[0], 0, A[1]);
}

// The Vivekananda Rock Memorial off Kanyakumari: the glass bridge to the Thiruvalluvar rock, the
// ferries out from the shore, fishing boats in the bay, and lamps along the promenade.
export function addDetails(f, g) {
  architecture(f);
  f.add(glassBridge());
  g.add(boats([[20, 80, 0.2], [-20, 170, 3.3], [30, 260, 0.1]], { y: 0.3, size: 3.4, canopy: true, colours: ['#f4f1ea', '#2f5d9a', '#f4f1ea'] }));
  g.add(boats([[-200, 200, 1.2], [180, 150, 2.4], [260, 300, 0.6], [-260, 280, 2.9]], { y: 0.3, size: 1.8, colours: ['#2f5d9a', '#c2512a', '#f2d23a'] }));
  g.add(lampPosts(along(14, [-200, 362], [200, 362]), { y: 0.3 }));
}
