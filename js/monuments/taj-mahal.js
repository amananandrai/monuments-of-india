import * as THREE from 'three';
import { M, mesh, box, cyl, at, onionDome } from '../helpers.js';
import { addTajDetails } from '../details/taj-mahal.js';
import { addDetails } from '../details/taj-mahal.js';

export function buildTaj() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(118, 1.5, 118, M.red));
  f.add(box(95, 6, 95, M.marble, 0, 1.5));
  const P = 7.5;
  const s = 28.5, c = 9.5, H = 30;
  const sh = new THREE.Shape();
  sh.moveTo(-s + c, -s); sh.lineTo(s - c, -s); sh.lineTo(s, -s + c); sh.lineTo(s, s - c);
  sh.lineTo(s - c, s); sh.lineTo(-s + c, s); sh.lineTo(-s, s - c); sh.lineTo(-s, -s + c); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  f.add(mesh(geo, M.marble, 0, P, 0));
  const top = P + H;
  f.add(cyl(14, 14, 7, M.marble, 0, top, 0, 48));
  f.add(cyl(14.6, 14.6, 0.8, M.marbleShade, 0, top + 6.2, 0, 48));
  f.add(at(onionDome(14.5, M.marble), 0, top + 7, 0));
  // The pishtaqs, alcoves, calligraphy, inlay, parapets, guldastas, lotus crown and finial, the
  // chhatris and the minarets: see js/details/taj-mahal.js.
  addTajDetails(f, { P, s, c, H });
  // The charbagh: a square garden about 300 m a side between the terrace and the great gate,
  // quartered by water channels on raised walks, each quarter split again into four beds, with the
  // raised marble pool (al-Hawd al-Kawthar) where the channels cross.
  const G0 = 60, GL = 300, GW = 300, gc = G0 + GL / 2;
  // The lawn runs 40 m past the side walls, so its fade into the open land happens outside them.
  g.add(box(GW + 80, 0.15, GL, M.grass, 0, 0, gc));
  // The cross channel sits 2 cm lower than the long one, so their walks and water never share a
  // plane: the coplanar pass would otherwise lift one walk over the other channel's water.
  for (const [w, d, x, z, dy] of [[12, GL, 0, gc, 0], [GW, 12, 0, gc, -0.02]]) g.add(box(w, 0.3 + dy, d, M.path, x, 0, z), box(w > d ? w : w - 4, 0.35 + dy, w > d ? d - 4 : d, M.water, x, 0, z));
  for (const q of [-1, 1]) {
    g.add(box(6, 0.25, GL, M.path, q * GW / 4, 0, gc), box(GW, 0.25, 6, M.path, 0, 0, gc + q * GL / 4));
  }
  for (const s of [-1, 1]) g.add(box(GW, 0.25, 5, M.path, 0, 0, G0 + 2.5 + (s > 0 ? GL - 5 : 0)), box(5, 0.25, GL, M.path, s * (GW / 2 - 2.5), 0, gc));
  g.add(box(30, 1.4, 30, M.marble, 0, 0, gc), box(24, 1.5, 24, M.water, 0, 0, gc));
  addDetails(f, g, { G0, GL, GW });
  return { group: g, focus: f };
}
