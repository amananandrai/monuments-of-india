#!/usr/bin/env python3
"""Traces the princely states from a public-domain map into tools/data/princely-states-1914.geojson.

The map is plate 33, "The Indian Empire in 1914", of C. Joppen, Historical Atlas of India
(Longmans, 1914; printed by Justus Perthes, Gotha). It colours "territory under direct British
administration" pink and "protected states" grey-green. The scan is on archive.org:
  https://archive.org/details/historicalatlaso00jopprich   (PDF pages 176 and 177)

  pdftoppm -r 150 -png -f 176 -l 177 historicalatlaso00jopprich.pdf page
  (put the two pages side by side as one 2000 x 1559 image)
  python3 tools/trace-princely-states.py <that image> <folder with the Natural Earth files>

How it works. The plate is on a conic projection. The right page is fitted to its frame ticks
(meridians as straight lines through an apex, parallels as circles about it) and matches the
printed grid to within a few pixels. The left page shares that cone and scale, with an affine
correction fitted to 11 printed grid intersections (residuals under 5 px, about 10 km). The
binding hides a strip about 1.5 degrees wide along 80 E; there each row is filled from the nearest
traced cells on either side, so boundaries crossing that strip are interpolated, not traced. Each
0.05-degree cell of land is classed by the hue of the scan under it, the lines and lettering
are smoothed away with a majority filter, and the protected-state cells are joined into polygons.

The result is the plate's own boundary between British territory and the states, at about the
plate's accuracy (a few km to 15 km). Single small states merge with their neighbours, and states
smaller than about 15 km across are lost.
"""
import colorsys, json, math, os, sys
import numpy as np
from PIL import Image
from shapely.geometry import shape, box, mapping, Polygon, Point
from shapely.ops import unary_union

scan, ne = sys.argv[1], sys.argv[2]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'princely-states-1914.geojson')

# Conic fit per page: apex (ax, ay), rotation t0 at 80 E, radians per degree k, radius r0 at 25 N,
# pixels per degree of latitude m. Then, for the left page, an affine correction.
PAGE = {
    'R': (984.4361, -5906.8441, -0.004, 0.0066, 6619.1922, 48.0059),
    'L': (1113.6122, -6100.4725, -0.0121, 0.0066, 6826.9626, 48.0059),
}
LAFF = ((0.9681, 0.0039, 19.202), (0.0098, 0.9967, -8.1861))
GUTTER = 1000

def to_px(lon, lat):
    # The pixel under (lon, lat), or None in the strip along 80 E that the binding hides: the left
    # page ends near 79.5 E and the right page begins near 81 E (the scan reads "CEN AL PR NCES").
    ax, ay, t0, k, r0, m = PAGE['L']
    t, r = t0 + k * (lon - 80), r0 - m * (lat - 25)
    x, y = ax + r * math.sin(t), ay + r * math.cos(t)
    (a, b, c), (d, e, f) = LAFF
    x, y = a * x + b * y + c, d * x + e * y + f
    if x < GUTTER:
        return x, y
    ax, ay, t0, k, r0, m = PAGE['R']
    t, r = t0 + k * (lon - 80), r0 - m * (lat - 25)
    x, y = ax + r * math.sin(t), ay + r * math.cos(t)
    return (x, y) if x >= GUTTER else None

img = np.asarray(Image.open(scan).convert('RGB')).astype(float) / 255
H, W, _ = img.shape

def load(name):
    return json.load(open(os.path.join(ne, name)))['features']

countries = {f['properties']['ADM0_A3']: shape(f['geometry']).buffer(0) for f in load('ne_10m_admin_0_countries_ind.geojson')
             if f['properties']['ADM0_A3'] in ('IND', 'PAK', 'BGD')}
raj = unary_union(list(countries.values())).intersection(box(60, 5, 98, 37.5))

STEP = 0.05
LON0, LAT0, NX, NY = 60.0, 5.0, int(38 / STEP), int(32.5 / STEP)
# 0 = not land of the Raj, 1 = British, 2 = protected, 3 = unread (a line, a letter), 4 = in the gutter
cls = np.zeros((NY, NX), np.uint8)
from shapely import contains_xy
lons = LON0 + (np.arange(NX) + 0.5) * STEP
lats = LAT0 + (np.arange(NY) + 0.5) * STEP
LON, LAT = np.meshgrid(lons, lats)
inside = contains_xy(raj, LON, LAT)
for j in range(NY):
    for i in range(NX):
        if not inside[j, i]:
            continue
        xy = to_px(LON[j, i], LAT[j, i])
        if xy is None:
            cls[j, i] = 4
            continue
        x, y = int(round(xy[0])), int(round(xy[1]))
        if not (2 <= x < W - 2 and 2 <= y < H - 2):
            cls[j, i] = 3                     # beyond the plate's frame (the far north of Kashmir)
            continue
        votes = [0, 0]
        for r, g, b in img[y - 1:y + 2, x - 1:x + 2].reshape(-1, 3):
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            h *= 360
            if v < 0.3:
                continue                      # ink
            if 115 <= h <= 180 and s >= 0.06:
                votes[1] += 1                 # grey-green: protected state
            elif (h <= 38 or h >= 330) and s >= 0.15:
                votes[0] += 1                 # pink: British
        cls[j, i] = 3 if votes == [0, 0] else (2 if votes[1] > votes[0] else 1)

# Majority filter: unread cells take the commonest class around them, then each cell takes the
# majority of its 5 x 5 neighbourhood, which removes rivers, lettering and the coloured border bands.
def neighbourhood_counts(a, value, r):
    m = (a == value).astype(np.int32)
    p = np.pad(m, r)
    c = np.zeros_like(m)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            c += p[r + dy:r + dy + a.shape[0], r + dx:r + dx + a.shape[1]]
    return c
# Up to 80 passes, so that land beyond the frame or left as bare paper (the Karakoram, Aksai
# Chin) takes the class of the land next to it: Jammu and Kashmir in the north.
for _ in range(80):
    unread = cls == 3
    if not unread.any():
        break
    b, p = neighbourhood_counts(cls, 1, 2), neighbourhood_counts(cls, 2, 2)
    cls[unread & (b + p > 0)] = np.where(p > b, 2, 1)[unread & (b + p > 0)]
cls[cls == 3] = 1
# The gutter strip: each row takes the class of the nearest read cell on either side, meeting halfway.
for j in range(NY):
    row = cls[j]
    gap = np.flatnonzero(row == 4)
    if not len(gap):
        continue
    read = np.flatnonzero((row == 1) | (row == 2))
    for i in gap:
        left, right = read[read < i], read[read > i]
        cands = ([(i - left[-1], row[left[-1]])] if len(left) else []) + ([(right[0] - i, row[right[0]])] if len(right) else [])
        row[i] = min(cands)[1] if cands else 1
for _ in range(2):
    land = cls > 0
    b, p = neighbourhood_counts(cls, 1, 2), neighbourhood_counts(cls, 2, 2)
    cls[land] = np.where(p > b, 2, 1)[land]

# Join protected cells: horizontal runs into boxes, boxes into polygons.
boxes = []
for j in range(NY):
    row = cls[j] == 2
    i = 0
    while i < NX:
        if row[i]:
            k = i
            while k < NX and row[k]:
                k += 1
            boxes.append(box(LON0 + i * STEP, LAT0 + j * STEP, LON0 + k * STEP, LAT0 + (j + 1) * STEP))
            i = k
        else:
            i += 1
states = unary_union(boxes).buffer(0.03).buffer(-0.03).intersection(raj)
# Holes are British enclaves: Ajmer-Merwara, Peshawar and Mardan, the Kaghan valley. Holes left by
# the plate's lettering are filled, as are enclaves too small to show.
LETTERING = [(72.1, 28.5)]   # "BAHAWALPUR"
def fill_holes(p):
    keep = [r for r in p.interiors if Polygon(r).area >= 0.05 and not any(Polygon(r).contains(Point(q)) for q in LETTERING)]
    return Polygon(p.exterior, keep)
polys = [fill_holes(p) for p in getattr(states, 'geoms', [states]) if p.area >= 0.02]
states = unary_union(polys).simplify(0.02, preserve_topology=True)

os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump({'type': 'FeatureCollection', 'features': [{
    'type': 'Feature',
    'properties': {
        'name': 'Protected (princely) states, 1914',
        'source': 'C. Joppen, Historical Atlas of India (1914), plate 33, "The Indian Empire in 1914". Public domain. '
                  'https://archive.org/details/historicalatlaso00jopprich',
        'method': 'tools/trace-princely-states.py: georeferenced to the printed graticule, classed by colour, '
                  'clipped to the outer boundary of India, Pakistan and Bangladesh (Natural Earth). '
                  'A strip along 80 E hidden by the binding, and land beyond the frame, are filled from the neighbouring cells.',
    },
    'geometry': mapping(states),
}]}, open(out, 'w'), separators=(',', ':'))
print('wrote', os.path.normpath(out), os.path.getsize(out), 'bytes;', len(polys), 'polygons, area', round(states.area, 1), 'sq deg')
