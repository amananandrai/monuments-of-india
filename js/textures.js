import * as THREE from 'three';
import { M } from './helpers.js';
import { PHOTOS, photoLoaded } from './surface.js';

// CC0 photo textures from Poly Haven (https://polyhaven.com), 1K diffuse maps in assets/textures.
// scale is repeats per metre; mix is how strongly the photo detail shows over the model's colour.
const SETS = {
  marble: { file: 'marble_01', scale: 1 / 5, mix: 0.3 },
  redSandstone: { file: 'red_sandstone_wall', scale: 1 / 2.5, mix: 0.75 },
  sandstone: { file: 'sandstone_blocks_08', scale: 1 / 2.4, mix: 0.75 },
  plasterStone: { file: 'plastered_stone_wall', scale: 1 / 3, mix: 0.65 },
  plaster: { file: 'plastered_wall_02', scale: 1 / 3, mix: 0.55 },
  granite: { file: 'granite_wall', scale: 1 / 2.5, mix: 0.7 },
  rock: { file: 'rock_face_03', scale: 1 / 14, mix: 0.85 },
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

// Average colour of an image (linear), so the photo can be divided out and the model keep its own colour.
function averageColor(image) {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const ctx = c.getContext('2d');
  ctx.drawImage(image, 0, 0, 16, 16);
  const d = ctx.getImageData(0, 0, 16, 16).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4;
  const col = new THREE.Color().setRGB(r / n / 255, g / n / 255, b / n / 255, THREE.SRGBColorSpace);
  return new THREE.Vector3(col.r, col.g, col.b);
}

export function loadPhotoTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  for (const [key, set] of Object.entries(SETS)) {
    loader.load(`assets/textures/${set.file}.jpg`, (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      PHOTOS[key] = { texture: tex, avg: averageColor(tex.image), scale: set.scale, mix: set.mix };
      photoLoaded(key);
    });
  }
}
