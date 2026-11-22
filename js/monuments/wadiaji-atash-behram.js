import * as THREE from 'three';
import { box, at } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { bullColumn } from '../parts/sculpture.js';
import { addDetails, WHITE, CREAM, GREY, PORCH, COLUMN } from '../details/wadiaji-atash-behram.js';

// The Wadiaji Atash Behram, Mumbai, consecrated in 1830. From photographs: a pale, three-storey
// temple set back from Princess Street behind a railing and a gate. Like other Parsi fire temples of
// Bombay, its front borrows from ancient Persia: a portico of tall fluted columns crowned with
// paired bulls, after the palace at Persepolis, carries a deep entablature with the winged
// Faravahar at its middle and a parapet of stepped merlons; wings either side hold rows of tall
// windows behind shutters. It faces the street (+z).
export const FW = 28, FD = 22, FH = 15.5, P = 1.4;

export function buildWadiajiAtashBehram() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const d = new THREE.Group(), W = WHITE, C = CREAM;
  d.add(box(FW + 2, P, FD + 2, GREY, 0, 0, -FD / 2), box(FW + 2.3, 0.2, FD + 2.3, C, 0, P - 0.15, -FD / 2));
  // The body: the wings either side of a recessed middle, which stands behind the portico.
  const MW = 11, PD = 3.4;
  d.add(box(FW, FH, FD - PD, W, 0, P, -FD / 2 - PD / 2));
  for (const s of [-1, 1]) {
    const wing = (FW - MW) / 2;
    d.add(box(wing, FH, PD, W, s * (MW / 2 + wing / 2), P, -PD / 2));
    // Three storeys of tall windows in each wing: round-headed, closed by green shutters.
    for (const [y, h] of [[0.9, 3.4], [5.6, 3.2], [10.4, 3]]) d.add(at(arcadeSkin(wing - 0.4, h + 0.8, cellRow(3, (wing - 0.4) / 3, 0.3, 1.25, h), 0.3, W, { trim: C, fill: 'shutters', pointed: false }), s * (MW / 2 + wing / 2), P + y, 0));
    // Floor bands.
    for (const y of [5.2, 10]) d.add(box(wing + 0.2, 0.3, 0.2, C, s * (MW / 2 + wing / 2), P + y, 0.1));
  }
  // The middle: a door and windows on the back wall of the portico.
  d.add(at(arcadeSkin(MW, 8, [[0, 0, 2.6, 5.4, 'door'], [-3.6, 1.5, 1.4, 3.2, 'shutters'], [3.6, 1.5, 1.4, 3.2, 'shutters']], 0.3, PORCH, { trim: C, fill: 'door', pointed: false }), 0, P, -PD));
  d.add(at(arcadeSkin(MW, 4, cellRow(3, 3.4, 0.4, 1.4, 3), 0.3, PORCH, { trim: C, fill: 'shutters', pointed: false }), 0, P + 8.6, -PD));
  // The portico's floor and steps, its four columns, the beam and the entablature.
  const CH = 10.2;
  d.add(box(MW, 0.5, PD + 0.2, C, 0, P, -PD / 2));
  d.add(at(steps(MW - 2, P + 0.5, 5, GREY), 0, 0, 0.1));
  for (const x of [-4.2, -1.4, 1.4, 4.2]) d.add(at(bullColumn(CH, COLUMN, C), x, P + 0.5, -0.9));
  d.add(box(MW + 0.6, 1.0, PD + 0.3, C, 0, P + 0.5 + CH, -PD / 2 + 0.15), box(MW + 0.6, FH - CH - 1.5, 0.6, W, 0, P + 1.5 + CH, -0.15));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { FW, FD, FH, P, MW, CH });
  // From across the street, a little to the south-west.
  return { group: g, focus: f, view: [-0.3, 0.13, 1], zoom: 0.55, target: [0, 8, -4] };
}
