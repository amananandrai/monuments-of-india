import * as THREE from 'three';
import { M, box, cyl, at, onionDome, finial, archPanel, guldasta } from '../helpers.js';
import { pierced, cellRow } from '../parts/mughal.js';
import { chhajjaRing, archRing, arcadeScreen, placeAll, merlonGeo, aroundCircle, mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE, TRIM, SHADE } from '../details/mecca-masjid-hyderabad.js';

// The Mecca Masjid, Hyderabad, 1617–1694. From photographs and the published descriptions: a prayer
// hall of great granite blocks, about 67 m across, 54 m deep and 23 m high, three bays deep, its
// roof carried on fifteen arches: three rows of five, the first of them the east front, whose
// middle arch is a little wider and taller. The sides open in three arches. Over the arches runs a
// band of small arches between the brackets of a deep eave, then a plain parapet under a crest of
// merlons. Only the two ends of the east front carry minarets: massive octagonal shafts that stop
// at the parapet in an arcaded balcony, with a short arcaded stage, an eave and a dome above. The
// rear corners have only slender finials. Before it, a broad paved court with the pool for
// ablutions. It faces east (+z), so north is +x.
export const HW = 67, HD = 54, HH = 23;
// The wall's thickness; the height of the eave over the arches, and of the wall under the merlons.
export const D = 2.6, EAVE = 18.9, WALL = 21.2;
// The five arches of a row [cx, sill, width, crown], the middle one larger; three down each side.
export const FRONT = [[-24, 0, 8.6, 14], [-12, 0, 8.6, 14], [0, 0, 9.4, 14.9], [12, 0, 8.6, 14], [24, 0, 8.6, 14]];
export const SIDE = cellRow(3, 15.6, 0, 8.6, 14);

// A minaret of the east front, h high to the tip of its spike: the eight-sided shaft as high as
// the hall's wall, corbelled out to a balcony with an arcaded parapet; an open stage of eight
// arches, a sloping eave, a ring of merlons, and the dome on its drum.
function minaretTower(h) {
  const t = new THREE.Group(), r = 4, by = WALL + 0.6;
  t.add(cyl(r * 1.08, r * 1.12, 1.4, STONE, 0, 0, 0, 8), cyl(r, r, by - 2.6, STONE, 0, 0, 0, 8));
  for (const y of [6.5, 13, EAVE - 0.4]) t.add(cyl(r * 1.05, r * 1.05, 0.4, TRIM, 0, y, 0, 8));
  // The corbel swelling out under the balcony, in three moulded courses, and the balcony's floor.
  t.add(cyl(r * 1.1, r, 0.9, STONE, 0, by - 2.6, 0, 8), cyl(r * 1.24, r * 1.1, 0.9, TRIM, 0, by - 1.7, 0, 8), cyl(r * 1.36, r * 1.24, 0.8, STONE, 0, by - 0.8, 0, 8));
  t.add(cyl(r * 1.4, r * 1.4, 0.3, TRIM, 0, by, 0, 8));
  // Its parapet: on each of the eight sides a low screen of three small arches.
  const br = r * 1.36 * Math.cos(Math.PI / 8), side = 2 * r * 1.36 * Math.sin(Math.PI / 8);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, s = at(arcadeScreen(side, 1.3, 3, side * 0.2, 0.95, 0.22, TRIM), Math.sin(a) * br, by + 0.3, Math.cos(a) * br);
    s.rotation.y = a;
    t.add(s);
  }
  // The open stage: eight piers and arches round a dark core.
  const gy = by + 0.3, gh = 3.6, gr = r * 0.88;
  t.add(cyl(gr * 0.6, gr * 0.6, gh, M.recess, 0, gy, 0, 8), cyl(gr * 1.02, gr * 1.02, 0.5, TRIM, 0, gy + gh - 0.5, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    t.add(box(0.6, gh, 0.6, TRIM, Math.sin(a) * gr * 0.96, gy, Math.cos(a) * gr * 0.96));
    const b = a + Math.PI / 8, d = gr * Math.cos(Math.PI / 8);
    const rg = archRing(gr * 0.56, gh * 0.82, true, 0.22, 0.2, TRIM, false);
    rg.position.set(Math.sin(b) * (d - 0.2), gy, Math.cos(b) * (d - 0.2));
    rg.rotation.y = b;
    t.add(rg);
  }
  const ey = gy + gh;
  t.add(chhajjaRing(gr, gr * 1.32, ey + 0.35, 0.45, 0.14, TRIM, 8));
  // A low octagon with its ring of merlons, then the drum and the dome.
  t.add(cyl(gr * 0.98, gr * 0.98, 1.5, STONE, 0, ey, 0, 8), cyl(gr * 1.04, gr * 1.04, 0.25, TRIM, 0, ey + 1.5, 0, 8));
  t.add(placeAll(merlonGeo(0.55, 0.8, 0.2), aroundCircle(gr * 0.94, 16, ey + 1.75), TRIM));
  const dr = gr * 0.9, dy = ey + 1.75;
  t.add(cyl(dr * 0.88, dr * 0.9, 0.9, TRIM, 0, dy, 0, 24), at(onionDome(dr, TRIM), 0, dy + 0.9, 0));
  t.add(at(finial(h - (dy + 0.9 + dr * 1.85), TRIM), 0, dy + 0.9 + dr * 1.85, 0));
  return t;
}

export function buildMeccaMasjidHyderabad() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const P = 1.2, hz = -HD / 2;
  // The plinth under hall and court.
  f.add(box(HW + 8, P, HD + 6, STONE, 0, 0, hz), box(HW + 9, 0.3, HD + 7, TRIM, 0, P - 0.3, hz));
  // The hall, hollow: the east front and the two rows of arches behind it, a bay apart; the side
  // walls with three arches each; the qibla wall with its mihrab; the flat roof.
  const bay = (HD - D) / 3;
  f.add(at(pierced(HW, WALL, FRONT, D, STONE), 0, P, -D));
  for (const k of [1, 2]) f.add(at(pierced(HW - 2 * D, EAVE, FRONT, 2, SHADE), 0, P, -D - k * bay));
  for (const s of [-1, 1]) {
    const side = at(pierced(HD - D, WALL, SIDE, D, STONE), s * (HW / 2 - D), P, hz - D / 2);
    side.rotation.y = s * Math.PI / 2;
    f.add(side);
  }
  f.add(box(HW - 2 * D, WALL, 1.6, STONE, 0, P, -HD + 0.8), box(HW - 2 * D, 1, HD - D - 1.6, STONE, 0, P + EAVE - 0.4, hz - D / 2 + 0.8));
  // Inside, out of the sun: the floor, the ceiling and the face of the qibla wall.
  f.add(box(HW - 2 * D, 0.06, HD - D - 1.6, SHADE, 0, P, hz - D / 2 + 0.8), box(HW - 2 * D, 0.06, HD - D - 1.6, SHADE, 0, P + EAVE - 0.47, hz - D / 2 + 0.8), box(HW - 2 * D, EAVE - 0.5, 0.06, SHADE, 0, P + 0.03, -HD + 1.63));
  f.add(at(archPanel(4.6, 8.5, true, M.recess, 0.1), 0, P, -HD + 1.7), at(archRing(4.6, 8.5, true, 0.3, 0.14, TRIM), 0, P, -HD + 1.7));
  // The band between the arches and the eave on all three open faces: small blind arches, one
  // between each pair of the eave's brackets (the brackets and the eave are in the details).
  const band = new THREE.Group(), strip = (len, n) => {
    const s = new THREE.Group();
    for (let k = 0; k < n; k++) {
      const x = -len / 2 + ((k + 0.5) / n) * len;
      s.add(at(archPanel(1.25, 1.7, true, M.recess, 0.06), x, 0, 0.02), at(archRing(1.25, 1.7, true, 0.12, 0.1, TRIM), x, 0, 0.02));
    }
    return s;
  };
  band.add(at(strip(HW - 9.6, 26), 0, P + EAVE - 2.3, 0));
  for (const s of [-1, 1]) band.add(at(strip(HD - 6, 22), s * HW / 2, P + EAVE - 2.3, hz - 3).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(band));
  // The two minarets at the ends of the east front, engaged in its corners; slender finials at
  // the rear corners and along the sides' parapets.
  for (const s of [-1, 1]) f.add(at(minaretTower(35), s * (HW / 2 - 1.4), P, -1.8));
  for (const s of [-1, 1]) for (const z of [-HD + 1, -HD * 0.66, -HD * 0.33]) f.add(at(guldasta(z < -HD + 2 ? 5 : 3.2, 0.42, TRIM), s * (HW / 2 - 0.9), P + WALL, z));
  addDetails(f, g, { P, HW, HD, HH, D, EAVE, WALL, FRONT, SIDE });
  // From the court, a little to the north-east, the five arches full on.
  return { group: g, focus: f, view: [0.45, 0.15, 1], zoom: 0.44, target: [-4, 12, -10] };
}
