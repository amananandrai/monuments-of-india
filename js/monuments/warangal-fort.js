import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, kalash, photo } from '../helpers.js';
import { mergeByMaterial, frieze, rosette } from '../parts/components.js';
import { addDetails } from '../details/warangal-fort.js';

// The Kakatiyas' grey granite, and its darker weathered shade.
export const STONE = photo(mat('#a39b8d', 0.9), 'blocks');
export const SHADE = mat('#7f786c', 0.93);

// One Kakatiya Kala Thoranam: a free-standing gateway about 10 m high, its opening facing +z. Each
// is two frames one behind the other, 2.2 m apart: in each, two square pillars on moulded bases,
// carved in bands, with a capital block; angled brackets spring from the pillars on both sides to
// carry a long lintel; over the lintel a crest, a carved band with a raised panel in its middle
// (a medallion in it), and at its two ends the curled, upturned horns of makaras; a kalasha at the
// top. Cross-beams join the two frames over the pillars. On y = 0, centred.
export const PX = 2.35, PZ = 1.1, LIN = 6.6;
export function thorana() {
  const g = new THREE.Group(), S = STONE, Sd = SHADE;
  g.add(box(8.4, 0.45, 4.2, Sd), box(7.8, 0.2, 3.6, S, 0, 0.45));
  for (const x of [-PX, PX]) for (const z of [-PZ, PZ]) {
    // The pillar: a moulded base, a shaft square below and octagonal-cornered above, three carved
    // bands, a cushion and a capital block.
    g.add(box(1.35, 0.5, 1.35, Sd, x, 0.65, z), box(1.2, 0.3, 1.2, S, x, 1.15, z), box(1.0, 1.6, 1.0, S, x, 1.45, z));
    g.add(box(1.08, 0.5, 1.08, frieze(S), x, 3.05, z), box(0.96, 1.2, 0.96, S, x, 3.55, z), box(1.06, 0.45, 1.06, frieze(S), x, 4.75, z));
    g.add(box(0.92, 0.85, 0.92, S, x, 5.2, z), cyl(0.62, 0.5, 0.25, Sd, x, 6.05, z, 8), box(1.3, 0.3, 1.3, S, x, 6.3, z));
  }
  // The angled brackets (two per pillar, inward and outward) under the lintel.
  const brk = new THREE.Shape();
  brk.moveTo(0, 0); brk.lineTo(0, 1.2); brk.lineTo(1.25, 1.2); brk.lineTo(1.25, 0.95); brk.lineTo(0.32, 0); brk.closePath();
  const bg = new THREE.ExtrudeGeometry(brk, { depth: 0.6, bevelEnabled: false }).translate(0, 0, -0.3);
  for (const x of [-PX, PX]) for (const z of [-PZ, PZ]) for (const s of [-1, 1]) {
    const b = mesh(bg, S, x + s * 0.5, 5.4, z);
    if (s < 0) b.rotation.y = Math.PI;
    g.add(b);
  }
  // The lintels of the two frames, and the cross-beams over the pillars.
  for (const z of [-PZ, PZ]) g.add(box(8.6, 0.95, 1.05, S, 0, LIN, z), box(8.8, 0.2, 1.2, Sd, 0, LIN + 0.95, z));
  for (const x of [-PX, PX]) g.add(box(1.1, 0.9, 3.2, Sd, x, LIN + 0.02, 0));
  // The crests: a carved band, the raised middle panel and its medallion, the makara horns.
  const horn = new THREE.TorusGeometry(0.95, 0.3, 8, 14, Math.PI * 0.9);
  for (const z of [-PZ, PZ]) {
    const side = Math.sign(z);
    g.add(box(7.0, 0.8, 0.8, frieze(S), 0, LIN + 1.15, z), box(7.3, 0.15, 0.95, Sd, 0, LIN + 1.95, z));
    g.add(box(2.4, 1.45, 0.9, S, 0, LIN + 2.1, z), box(2.7, 0.2, 1.05, Sd, 0, LIN + 3.55, z));
    g.add(at(rosette(0.5, S, 12), 0, LIN + 2.82, z + side * 0.47).rotateY(side > 0 ? 0 : Math.PI));
    for (const s of [-1, 1]) {
      // The horn curls up and back in over the lintel's end, its tip turned inward.
      const h = mesh(horn, S, s * 3.2, LIN + 2.15, z);
      h.rotation.z = s > 0 ? -0.15 : Math.PI + 0.15;
      g.add(h, box(1.0, 0.55, 0.75, S, s * 3.55, LIN + 1.95, z));
    }
    g.add(at(kalash(0.9, S), 0, LIN + 3.75, z));
  }
  return mergeByMaterial(g);
}

// The four gateways stand R from the centre of the lost Swayambhu temple, facing the cardinal
// directions; between them the temple's plinth, and the carvings gathered from its ruins.
export const R = 42;

// Warangal Fort: the four Kala Thoranam around the site of the Swayambhu Shiva temple, at the
// heart of the Kakatiya capital.
export function buildWarangalFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const t = thorana();
    t.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    t.rotation.y = a;
    f.add(t);
  }
  // The temple's plinth: stepped courses on a cruciform plan, the rest of it gone.
  f.add(box(34, 0.5, 34, SHADE, 0, 0, 0), box(30, 0.6, 30, STONE, 0, 0.5, 0), box(20, 0.6, 36, STONE, 0, 0.5, 0), box(36, 0.6, 20, STONE, 0, 0.5, 0));
  f.add(box(16, 0.8, 16, STONE, 0, 1.1, -4), box(10, 0.6, 10, SHADE, 0, 1.9, -6));
  addDetails(f, g);
  // From the south-east, the south gateway in front and the other three beyond the plinth.
  return { group: g, focus: f, view: [0.5, 0.2, 1], zoom: 0.42, target: [0, 5, 10] };
}
