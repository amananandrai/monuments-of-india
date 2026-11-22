import * as THREE from 'three';
import { M, box, cyl, at, onionDome, finial, archPanel } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { chhajjaRing, archRing, mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE, TRIM } from '../details/mecca-masjid-hyderabad.js';

// The Mecca Masjid, Hyderabad, 1617–1694. From photographs: a prayer hall of great granite blocks,
// about 67 m across, 54 m deep and 23 m high, its east front opening in five tall pointed arches
// (five more down each side); over the arches a band of small arched panels and a parapet of
// little arches with merlons; at each corner an octagonal tower rising above the roof to an open
// arched gallery under an eave and a small onion dome. Before it, a broad paved court with the
// pool for ablutions. It faces east (+z).
export const HW = 67, HD = 54, HH = 23;

// A corner tower h high: an eight-sided shaft with moulded rings, then an open gallery of eight
// arches, an eave, a drum, an onion dome and a spike.
function cornerTower(h) {
  const t = new THREE.Group(), r = 2.6, sh = h - 9;
  t.add(cyl(r * 1.12, r * 1.18, 1.2, STONE, 0, 0, 0, 8), cyl(r, r * 1.04, sh, STONE, 0, 0, 0, 8));
  for (const y of [HH - 4, HH, sh]) t.add(cyl(r * 1.1, r * 1.1, 0.4, TRIM, 0, y - 0.4, 0, 8));
  // The gallery: eight posts and arches round a solid core.
  const gy = sh, gh = 3.6, gr = r * 0.95;
  t.add(cyl(gr * 0.55, gr * 0.55, gh, M.recess, 0, gy, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    t.add(box(0.5, gh, 0.5, TRIM, Math.sin(a) * gr, gy, Math.cos(a) * gr));
    const b = a + Math.PI / 8, d = gr * Math.cos(Math.PI / 8);
    const rg = archRing(gr * 0.72, gh * 0.92, true, 0.16, 0.12, TRIM, false);
    rg.position.set(Math.sin(b) * d, gy, Math.cos(b) * d);
    rg.rotation.y = b;
    t.add(rg);
  }
  t.add(chhajjaRing(gr * 0.9, gr * 1.35, gy + gh + 0.5, 0.4, 0.14, TRIM, 16));
  t.add(cyl(gr * 0.85, gr * 0.85, 0.9, TRIM, 0, gy + gh + 0.5, 0, 16));
  t.add(at(onionDome(gr * 0.85, TRIM), 0, gy + gh + 1.4, 0), at(finial(1.8, TRIM), 0, gy + gh + 1.4 + gr * 0.85 * 1.8, 0));
  return t;
}

export function buildMeccaMasjidHyderabad() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const P = 1.2, D = 2.4, hz = -HD / 2;
  // The plinth under hall and court.
  f.add(box(HW + 8, P, HD + 6, STONE, 0, 0, hz), box(HW + 9, 0.3, HD + 7, TRIM, 0, P - 0.3, hz));
  // The hall: a solid block behind an arcade D deep on its front and sides.
  f.add(box(HW - 2 * D, HH, HD - D, STONE, 0, P, hz - D / 2));
  const arches = (len) => cellRow(5, len / 5.4, 0, len / 5.4 * 0.62, 15.5);
  f.add(at(arcadeSkin(HW, HH - 4.5, arches(HW), D, STONE, { trim: TRIM, fill: 'room' }), 0, P, -D));
  for (const s of [-1, 1]) {
    const side = at(arcadeSkin(HD - D, HH - 4.5, arches(HD - D), D, STONE, { trim: TRIM, fill: 'room' }), s * (HW / 2 - D), P, hz - D / 2);
    side.rotation.y = s * Math.PI / 2;
    f.add(side);
  }
  // The band above the arches: a moulded course, a row of small blind arches and the parapet.
  const top = P + HH - 4.5;
  f.add(box(HW + 0.4, 0.6, HD + 0.4, TRIM, 0, top, hz), box(HW, 3.9, HD, STONE, 0, top + 0.6, hz));
  const band = new THREE.Group();
  for (let k = 0; k < 22; k++) band.add(at(archPanel(1.5, 2.4, true, M.recess, 0.08), -HW / 2 + 1.52 + k * (HW - 3) / 21, top + 1.1, 0.02));
  for (let k = 0; k < 22; k++) band.add(at(archRing(1.5, 2.4, true, 0.12, 0.08, TRIM), -HW / 2 + 1.52 + k * (HW - 3) / 21, top + 1.1, 0.04));
  f.add(mergeByMaterial(band));
  f.add(box(HW + 0.8, 0.5, HD + 0.8, TRIM, 0, P + HH, hz));
  // The roof gallery along the front: a low arcade of small arches.
  f.add(at(arcadeSkin(HW - 8, 2.8, cellRow(17, (HW - 8) / 17, 0.3, 2, 2.2), 0.4, TRIM, { trim: TRIM, fill: 'room' }), 0, P + HH + 0.5, -1.6));
  f.add(box(HW - 8, 2.8, 1.2, TRIM, 0, P + HH + 0.5, -2.2), box(HW - 7.6, 0.35, 2, TRIM, 0, P + HH + 3.3, -1.8));
  // The four corner towers.
  for (const x of [-1, 1]) for (const z of [0, -HD]) f.add(at(cornerTower(35), x * (HW / 2 + 0.6), P, z + (z ? 0.6 : -0.6)));
  addDetails(f, g, { P, HW, HD, HH });
  // From the court, a little to the south-east, the five arches full on.
  return { group: g, focus: f, view: [0.4, 0.17, 1], zoom: 0.55, target: [0, 13, -18] };
}
