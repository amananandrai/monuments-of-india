import * as THREE from 'three';
import { M, flat, mesh, box, cyl, at, onFace, kalash, bell, shikhara, pidaRoof, flag, kalingaProfile } from '../helpers.js';
import { trabeateGate, wallWithGaps } from '../parts/temples.js';
import { templeDoorway } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE, SHADE, LATERITE } from '../details/lingaraja-temple.js';

// The Lingaraja at Bhubaneswar. East is +z and north +x, as at Puri and Konark: the four halls
// stand in a line from the rekha deul in the west to the bhogamandapa in the east, inside a
// laterite wall about 160 m east to west and 140 m north to south.
export function buildLingaraja() {
  const m = STONE, d = SHADE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The compound: its paving, and the laterite wall, 2.3 m thick, with the Lion Gate on the east
  // and smaller gates on the north and south.
  const X = 70, Z0 = -90, Z1 = 70, wh = 6, wt = 2.3, len = Z1 - Z0, cz = (Z0 + Z1) / 2;
  g.add(box(X * 2 + 40, 0.1, len + 40, M.path, 0, 0, cz), box(X * 2, 0.08, len, M.path, 0, 0.1, cz));
  g.add(wallWithGaps('x', X * 2 + wt, wh, wt, LATERITE, [[0, 13]], 0, Z1), box(X * 2 + wt, wh, wt, LATERITE, 0, 0, Z0));
  for (const s of [-1, 1]) g.add(wallWithGaps('z', len, wh, wt, LATERITE, [[10, 9]], s * X, cz));
  const gateAt = (w, h, beasts, x, z, ry) => {
    const gt = new THREE.Group();
    gt.add(trabeateGate(w, h, 7, w * 0.3, h * 0.62, { m, trim: d, beasts }));
    const roof = pidaRoof(w, w * 0.42, 5, 0.7, m, d);
    gt.add(at(roof, 0, h, 0), at(bell(w * 0.16, m), 0, h + roof.userData.top, 0), at(kalash(w * 0.1, m), 0, h + roof.userData.top + w * 0.17, 0));
    g.add(at(gt, x, 0, z).rotateY(ry));
  };
  gateAt(13, 8, 'lion', 0, Z1, 0);
  gateAt(9, 6.5, null, X, 10, Math.PI / 2);
  gateAt(9, 6.5, null, -X, 10, -Math.PI / 2);
  // The rekha deul (Sri Mandira): the walls (bada) rise 15 m on a five-faced plan, and over them
  // the tower (gandi) climbs almost upright for two thirds of its height before it curves in to
  // the neck, the great ribbed amalaka and the stone kalasha, 55 m above the court.
  const dz = -24, BH = 15, TH = 30;
  f.add(box(15.6, BH, 15.6, m, 0, 0, dz), box(17.4, BH, 10.6, m, 0, 0, dz), box(10.6, BH, 17.4, m, 0, 0, dz));
  f.add(box(16.4, 0.5, 16.4, d, 0, BH - 0.5, dz), box(18, 0.5, 11.2, d, 0, BH - 0.5, dz), box(11.2, 0.5, 18, d, 0, BH - 0.5, dz));
  const tower = shikhara(17, TH, m, kalingaProfile, 30, m, 0.42);
  f.add(at(tower, 0, BH, dz));
  const ty = BH + tower.userData.top;
  // On the kalasha, Shiva's trident, and the temple's flag.
  const tri = new THREE.Group();
  tri.add(cyl(0.07, 0.09, 2.6, M.steel, 0, 0, 0, 6), box(1.3, 0.1, 0.1, M.steel, 0, 1.6, 0));
  for (const s of [-1, 1]) tri.add(box(0.1, 0.9, 0.1, M.steel, s * 0.6, 1.6, 0));
  f.add(at(tri, 0, ty - 0.4, dz), at(flag(5, M.saffron), 0.3, ty - 0.6, dz - 0.3));
  // The jagamohana, a pidha deul 30 m high: its roof is a pyramid of stone slabs in two flights
  // (nine and seven), under a bell, an amalaka and a kalasha. The natamandira, open and flat
  // roofed, and the bhogamandapa under its own pyramid were added to the east of it.
  const halls = [
    // [width, wall height, z, flights of the roof as [w0, w1, slabs]]
    [19, 10, -5.5, [[21, 14.5, 5], [12.5, 7.5, 4]]],
    [15, 8, 11.5, null],
    [17, 8, 27.5, [[18.5, 8, 6]]],
  ];
  for (const [w, h, z, roofs] of halls) {
    f.add(box(w, h, w, m, 0, 0, z), box(w + 2.4, h, w * 0.56, m, 0, 0, z), box(w * 0.56, h, w + 2.4, m, 0, 0, z));
    let y = h;
    if (!roofs) {
      // The natamandira's flat roof: two sloping eaves and a low parapet.
      f.add(box(w + 3.4, 0.5, w + 3.4, d, 0, y, z), box(w + 1.6, 0.6, w + 1.6, m, 0, y + 0.5, z), box(w - 0.6, 0.7, w - 0.6, d, 0, y + 1.1, z));
      continue;
    }
    roofs.forEach(([w0, w1, n], i) => {
      const r = pidaRoof(w0, w1, n, 0.9, m, d);
      f.add(at(r, 0, y, z));
      y += r.userData.top;
      if (i < roofs.length - 1) { f.add(box(w1 - 2.6, 1.1, w1 - 2.6, d, 0, y, z)); y += 1.1; }
    });
    const w1 = roofs[roofs.length - 1][1], br = w1 * 0.5;
    f.add(cyl(br * 0.72, br * 0.72, 0.6, d, 0, y, z, 20), at(bell(br, m), 0, y + 0.6, z));
    const am = mesh(new THREE.SphereGeometry(br * 0.62, 24, 8), flat(m), 0, y + 0.6 + br * 1.05 + br * 0.24, z);
    am.scale.y = 0.4;
    f.add(am, at(kalash(br * 0.42, m), 0, y + 0.6 + br * 1.05 + br * 0.46, z));
  }
  // Doorways: the bhogamandapa's east door, and the jagamohana's on the south, which pilgrims use.
  const doors = new THREE.Group();
  doors.add(at(templeDoorway(2, 4, { m, bands: 4 }), 0, 0, 37.2));
  const sd = onFace(templeDoorway(1.8, 3.8, { m }), -Math.PI / 2, 10.72);
  sd.position.z += -5.5;
  doors.add(sd);
  for (const s of [-1, 1]) doors.add(at(templeDoorway(1.6, 3.4, { m, guardians: false }), s * 8.72, 0, 11.5).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(doors));
  addDetails(f, g, { BH, TH, dz, X, Z0, Z1 });
  // From the north-east, over the wall, as the temple is seen from the viewing platform.
  return { group: g, focus: f, view: [1.0, 0.36, 0.75] };
}
