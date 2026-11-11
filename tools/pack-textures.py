#!/usr/bin/env python3
"""Fetch and pack the photo textures in assets/textures (CC0, from https://polyhaven.com).

    python3 tools/pack-textures.py [slug ...]        # default: every set in SETS below

For each Poly Haven texture `slug` this writes, into assets/textures/:
  <slug>.jpg      the 1K diffuse map (only if the file is not there yet)
  <slug>_nr.jpg   512 px: the OpenGL normal map's x and y in red and green, and the roughness map
                  in blue (the shader rebuilds the normal's z), saved without chroma subsampling so
                  the three channels stay independent
and prints the figures js/textures.js needs for the set: the diffuse map's average colour (linear)
and the roughness map's average. Needs Pillow, and network access to dl.polyhaven.org.
"""
import io, os, sys, urllib.request
from PIL import Image

SETS = ['marble_01', 'red_sandstone_wall', 'sandstone_blocks_08', 'plastered_stone_wall', 'plastered_wall_02',
        'granite_wall', 'rock_face_03', 'coral_fort_wall_03', 'stone_brick_wall_001', 'rough_block_wall',
        'concrete_wall_008', 'weathered_brown_planks']
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'textures')
URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{0}/{0}_{1}_1k.jpg'


def fetch(slug, kind):
    req = urllib.request.Request(URL.format(slug, kind), headers={'User-Agent': 'texture-fetch/1.0'})
    return Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read()))


def linear_mean(img):
    small = img.convert('RGB').resize((64, 64), Image.BOX)
    to_lin = lambda c: (c / 255 / 12.92) if c / 255 <= 0.04045 else ((c / 255 + 0.055) / 1.055) ** 2.4
    px = list(small.getdata())
    return [round(sum(to_lin(p[k]) for p in px) / len(px), 4) for k in range(3)]


for slug in sys.argv[1:] or SETS:
    diff_path = os.path.join(OUT, slug + '.jpg')
    if not os.path.exists(diff_path):
        fetch(slug, 'diff').convert('RGB').save(diff_path, quality=82, optimize=True)
    nor = fetch(slug, 'nor_gl').convert('RGB').resize((512, 512), Image.LANCZOS)
    rough = fetch(slug, 'rough').convert('L').resize((512, 512), Image.LANCZOS)
    r, g, _ = nor.split()
    Image.merge('RGB', (r, g, rough)).save(os.path.join(OUT, slug + '_nr.jpg'), quality=88, subsampling=0, optimize=True)
    rough_avg = round(sum(rough.resize((32, 32), Image.BOX).getdata()) / (32 * 32 * 255), 3)
    print(f"{slug}: avg {linear_mean(Image.open(diff_path))}, rough {rough_avg}")
