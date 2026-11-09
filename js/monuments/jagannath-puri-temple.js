import * as THREE from 'three';
import { M, flat, mesh, box, at, kalash, bell, shikhara, pidaRoof, flag, kalingaProfile } from '../helpers.js';
import { trabeateGate, wallWithGaps } from '../details/temples.js';
import { templeDoorway, grandStair } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { addDetails } from '../details/jagannath-puri-temple.js';

export function buildJagannath() {
  const m = M.puri, d = M.puriShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The inner enclosure (Kurma Bedha) is a terrace 4.5 m high, faced in stone, its wall standing
  // on it; the front of the wall is open where the Baisi Pahacha arrives.
  const B = 4.5, SW = 12;
  g.add(box(92, B, 120, d, 0, 0, 0), box(86, 0.1, 114, M.path, 0, B, 0));
  for (const [w, dd, x, z] of [[90, 2, 0, -59], [2, 120, -45, 0], [2, 120, 45, 0], [45 - SW, 2, -(SW + 45) / 2, 59], [45 - SW, 2, (SW + 45) / 2, 59]]) g.add(box(w, 5.5, dd, d, x, B, z));
  // The Baisi Pahacha: twenty-two broad steps, each about 21 m long, 1.8 m deep and 0.2 m high,
  // from inside the Lion Gate up to the terrace.
  const stair = grandStair(B, 21, d, m, { n: 22, tread: 1.8 });
  g.add(at(stair, 0, 0, 60));
  // The outer wall (Meghanada Pacheri) round the lower court, with a gate on each side: the Lion
  // Gate on the east (+z) at the foot of the steps, the Tiger Gate on the west, the Elephant Gate
  // on the north (+x) and the Horse Gate on the south.
  const GZ = 60 + stair.userData.run + 5.6, OX = 68, OZ = -84, ow = 2.4, oh = 7.5, len = GZ - OZ, cz = (GZ + OZ) / 2;
  g.add(box(OX * 2, 0.08, len, M.path, 0, 0, cz));
  g.add(wallWithGaps('x', OX * 2 + ow, oh, ow, d, [[0, 18]], 0, GZ), wallWithGaps('x', OX * 2 + ow, oh, ow, d, [[0, 14]], 0, OZ));
  for (const s of [-1, 1]) g.add(wallWithGaps('z', len, oh, ow, d, [[cz, 14]], s * OX, cz));
  const gateAt = (w, beasts, x, z, ry) => {
    const gt = new THREE.Group();
    gt.add(trabeateGate(w, 9, 10, 4.5, 6, { m, trim: d, beasts }));
    gt.add(at(pidaRoof(w, w * 0.4, 5, 0.9, m, d), 0, 9, 0));
    g.add(at(gt, x, 0, z).rotateY(ry));
  };
  gateAt(18, 'lion', 0, GZ, 0);
  gateAt(14, 'tiger', 0, OZ, Math.PI);
  gateAt(14, 'elephant', OX, cz, Math.PI / 2);
  gateAt(14, 'horse', -OX, cz, -Math.PI / 2);
  // Rekha deula (main sanctum tower)
  const dz = -30;
  f.add(box(22, 16, 22, m, 0, B, dz), box(26, 16, 14, m, 0, B, dz), box(14, 16, 26, m, 0, B, dz));
  f.add(box(27, 1, 27, d, 0, B + 15, dz));
  // The terrace raised the temple 3.3 m: the spire is that much shorter, so the top stays where it was.
  const TH = 36 - (B - 1.2);
  const tower = shikhara(24, TH, m, kalingaProfile, 20);
  f.add(at(tower, 0, B + 16, dz));
  const ty = B + 16 + tower.userData.top;
  const chakra = new THREE.Group();
  chakra.add(mesh(new THREE.TorusGeometry(2.4, 0.3, 8, 32), M.steel));
  for (let i = 0; i < 4; i++) chakra.add(box(0.2, 4.6, 0.2, M.steel, 0, -2.3, 0).rotateZ((i / 4) * Math.PI));
  f.add(at(chakra, 0, ty + 2.4, dz));
  f.add(at(flag(9, M.flagRed), 0, ty + 2, dz + 0.6));
  f.add(at(flag(7, M.saffron), 0.6, ty + 2, dz - 0.4).rotateY(Math.PI * 0.7));
  // Jagamohana, Natamandapa and Bhogamandapa with stepped pida roofs
  const halls = [[22, 13, 11, 24, 9, -5], [18, 9, 7, 19, 8.5, 15], [15, 8, 6, 16, 7, 31]];
  // The main doorway, at the front of the Bhogamandapa, and doors on the sides of the Natamandapa
  const doors = new THREE.Group();
  doors.add(at(templeDoorway(2, 4, { m, bands: 4 }), 0, B, 40.5));
  for (const s of [-1, 1]) doors.add(at(templeDoorway(1.8, 3.8, { m, guardians: false }), s * 11, B, 15).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(doors));
  for (const [w, h, n, w0, w1, z] of halls) {
    f.add(box(w, h, w, m, 0, B, z), box(w + 4, h, w * 0.6, m, 0, B, z), box(w * 0.6, h, w + 4, m, 0, B, z));
    const roof = pidaRoof(w0, w1, n, 1.2, m, d);
    f.add(at(roof, 0, B + h, z));
    const ry = B + h + roof.userData.top;
    f.add(at(bell(w1 * 0.55, m), 0, ry, z));
    const am = mesh(new THREE.SphereGeometry(w1 * 0.3, 24, 8), flat(m), 0, ry + w1 * 0.62, z);
    am.scale.y = 0.4;
    f.add(am);
    f.add(at(kalash(w1 * 0.35), 0, ry + w1 * 0.72, z));
  }
  addDetails(f, g, { B, TH, gateZ: GZ });
  return { group: g, focus: f, view: [1.05, 0.4, 1.05] };
}
