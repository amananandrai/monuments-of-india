import * as THREE from 'three';
import { M } from './helpers.js';
import { PHOTOS, photoLoaded, photoRequest } from './surface.js';

// CC0 photo textures from Poly Haven (https://polyhaven.com) in assets/textures: for each set a 1K
// diffuse map and a 512 px map of its normals and roughness (<file>_nr.jpg; tools/pack-textures.py
// fetches and packs both, and prints avg and rough for a new set).
// scale is repeats per metre; mix is how strongly the photo detail shows over the model's colour;
// avg is the photo's average colour (linear), so it can be divided out and the model keep its own
// colour; rough is the roughness map's average, about which the material's roughness then varies.
// avg and rough are fixed for each file: measure them again if a file is replaced.
const SETS = {
  marble: { file: 'marble_01', scale: 1 / 5, mix: 0.3, avg: [0.4462, 0.3395, 0.1959], rough: 0.506 },
  redSandstone: { file: 'red_sandstone_wall', scale: 1 / 2.5, mix: 0.75, avg: [0.2748, 0.2129, 0.1548], rough: 0.837 },
  sandstone: { file: 'sandstone_blocks_08', scale: 1 / 2.4, mix: 0.75, avg: [0.3813, 0.2918, 0.1785], rough: 0.506 },
  plasterStone: { file: 'plastered_stone_wall', scale: 1 / 3, mix: 0.65, avg: [0.0567, 0.0512, 0.038], rough: 0.891 },
  plaster: { file: 'plastered_wall_02', scale: 1 / 3, mix: 0.55, avg: [0.4947, 0.44, 0.3699], rough: 0.906 },
  granite: { file: 'granite_wall', scale: 1 / 2.5, mix: 0.7, avg: [0.1708, 0.1182, 0.0693], rough: 0.839 },
  rock: { file: 'rock_face_03', scale: 1 / 14, mix: 0.85, avg: [0.2224, 0.1377, 0.0796], rough: 0.819 },
  // Laterite: the pitted, weathered face of a coastal fort's wall.
  laterite: { file: 'coral_fort_wall_03', scale: 1 / 3, mix: 0.55, avg: [0.1481, 0.1368, 0.125], rough: 0.727 },
  // Coursed blocks of dark stone: basalt, dolerite, khondalite and the Deccan's trap.
  blocks: { file: 'stone_brick_wall_001', scale: 1 / 2.6, mix: 0.7, avg: [0.0751, 0.0545, 0.03], rough: 0.838 },
  // Rough-dressed blocks laid in uneven courses: the walls of the hill forts.
  rubble: { file: 'rough_block_wall', scale: 1 / 3.2, mix: 0.7, avg: [0.238, 0.1974, 0.1319], rough: 0.927 },
  // Concrete cast against panels, with their joints and tie holes.
  concrete: { file: 'concrete_wall_008', scale: 1 / 4, mix: 0.7, avg: [0.266, 0.2369, 0.1617], rough: 0.737 },
  // Weathered planks.
  timber: { file: 'weathered_brown_planks', scale: 1 / 2, mix: 0.7, avg: [0.1187, 0.0723, 0.0427], rough: 0.654 },
};

// The shared materials of js/helpers.js that take a set. A monument's own materials name theirs
// with photo(material, key) where they are made.
const ASSIGN = [
  [M.marble, 'marble'], [M.marbleShade, 'marble'], [M.lotus, 'marble'],
  [M.red, 'redSandstone'], [M.redLight, 'redSandstone'],
  [M.buff, 'sandstone'], [M.basalt, 'sandstone'], [M.cream, 'sandstone'], [M.pink, 'sandstone'], [M.pinkShade, 'sandstone'], [M.sanchi, 'sandstone'], [M.bodh, 'sandstone'],
  [M.plaster, 'plasterStone'],
  [M.hawa, 'plaster'], [M.hawaLight, 'plaster'], [M.mysoreRose, 'plaster'], [M.lime, 'plaster'], [M.stucco, 'plaster'],
  [M.mysore, 'granite'], [M.granite, 'granite'], [M.graniteDark, 'granite'],
  [M.khond, 'blocks'], [M.khondDark, 'blocks'], [M.deccan, 'blocks'], [M.deccanLight, 'blocks'],
  [M.concrete, 'concrete'],
];
for (const [m, key] of ASSIGN) if (m) m.userData.photoKey = key;

// Sets load on demand: the first time a material that names one is drawn (js/surface.js asks
// through photoRequest), its diffuse map is fetched and, with `maps`, its normal-and-roughness map
// too; the material is then recompiled with them. A visit that opens one monument fetches only
// that monument's stones. maps: false on phones, which keep to the diffuse map (three texture
// reads a pixel instead of six).
export function loadPhotoTextures(renderer, { maps = true } = {}) {
  const loader = new THREE.TextureLoader(), asked = new Set();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const fetch = (file, colour) => new Promise((done, fail) => loader.load(`assets/textures/${file}.jpg`, (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = aniso;
    done(tex);
  }, undefined, fail));
  photoRequest.load = (key) => {
    const set = SETS[key];
    if (!set || asked.has(key)) return;
    asked.add(key);
    // A map that fails to load leaves the material as it was drawn without it.
    Promise.all([fetch(set.file, true), maps ? fetch(`${set.file}_nr`, false).catch(() => null) : null]).then(([texture, nr]) => {
      PHOTOS[key] = { texture, nr, rough: set.rough, avg: new THREE.Vector3(...set.avg), scale: set.scale, mix: set.mix };
      photoLoaded(key);
    }).catch(() => {});
  };
}
