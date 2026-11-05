import * as THREE from 'three';
import { M } from './helpers.js';
import { PHOTOS, photoLoaded } from './surface.js';

// CC0 photo textures from Poly Haven (https://polyhaven.com), 1K diffuse maps in assets/textures.
// scale is repeats per metre; mix is how strongly the photo detail shows over the model's colour;
// avg is the photo's average colour (linear), so it can be divided out and the model keep its own
// colour. avg is fixed for each file: it was measured once (by drawing the photo down to 16 × 16
// and averaging, in the browser), not on every visit, where it blocked the page for seconds.
// Measure it again if a file is replaced.
const SETS = {
  marble: { file: 'marble_01', scale: 1 / 5, mix: 0.3, avg: [0.4462, 0.3395, 0.1959] },
  redSandstone: { file: 'red_sandstone_wall', scale: 1 / 2.5, mix: 0.75, avg: [0.2748, 0.2129, 0.1548] },
  sandstone: { file: 'sandstone_blocks_08', scale: 1 / 2.4, mix: 0.75, avg: [0.3813, 0.2918, 0.1785] },
  plasterStone: { file: 'plastered_stone_wall', scale: 1 / 3, mix: 0.65, avg: [0.0567, 0.0512, 0.038] },
  plaster: { file: 'plastered_wall_02', scale: 1 / 3, mix: 0.55, avg: [0.4947, 0.44, 0.3699] },
  granite: { file: 'granite_wall', scale: 1 / 2.5, mix: 0.7, avg: [0.1708, 0.1182, 0.0693] },
  rock: { file: 'rock_face_03', scale: 1 / 14, mix: 0.85, avg: [0.2224, 0.1377, 0.0796] },
};

// The shared materials of the popular monuments: Taj Mahal, Red Fort, Qutub Minar, India Gate,
// Gateway of India, Charminar, Hawa Mahal, Golden Temple, Victoria Memorial and Mysore Palace.
// Other monuments that use the same stones pick the detail up too.
const ASSIGN = [
  [M.marble, 'marble'], [M.marbleShade, 'marble'], [M.lotus, 'marble'],
  [M.red, 'redSandstone'], [M.redLight, 'redSandstone'],
  [M.buff, 'sandstone'], [M.basalt, 'sandstone'],
  [M.plaster, 'plasterStone'],
  [M.hawa, 'plaster'], [M.hawaLight, 'plaster'], [M.mysoreRose, 'plaster'],
  [M.mysore, 'granite'],
];
for (const [m, key] of ASSIGN) m.userData.photoKey = key;

export function loadPhotoTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  for (const [key, set] of Object.entries(SETS)) {
    loader.load(`assets/textures/${set.file}.jpg`, (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      PHOTOS[key] = { texture: tex, avg: new THREE.Vector3(...set.avg), scale: set.scale, mix: set.mix };
      photoLoaded(key);
    });
  }
}
