#!/usr/bin/env python3
"""Builds js/timeline-map.js: the base map and the border snapshots of the timeline page.

Needs shapely, and three Natural Earth files (public domain) in the folder given as the argument:
  ne_50m_land.geojson, ne_50m_rivers_lake_centerlines.geojson, ne_10m_admin_0_countries_ind.geojson
from https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

  python3 tools/build-timeline-map.py <folder with the Natural Earth files>

The historical borders below are drawn by eye, as rough rings of (longitude, latitude) that
overshoot the coast; the script cuts them to the land. They are approximate and are meant to be
replaced by borders traced in a GIS. Each names the source it was drawn after.
"""
import json, math, os, sys
from shapely.geometry import shape, box, Polygon, MultiPolygon, LineString, MultiLineString
from shapely.ops import unary_union

src = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'js', 'timeline-map.js')

LON0, LON1, LAT0, LAT1 = 59.0, 99.5, 4.5, 39.0
K = 20.0                                   # units per degree of latitude
KX = K * math.cos(math.radians(22.0))      # and of longitude, true at 22° N
W, H = (LON1 - LON0) * KX, (LAT1 - LAT0) * K
frame = box(LON0, LAT0, LON1, LAT1)
# The land runs past the frame on every side, so a wide or tall window shows more map, not an edge.
wide = box(LON0 - 45, LAT0 - 25, LON1 + 45, LAT1 + 25)

def load(name):
    return json.load(open(os.path.join(src, name)))['features']

def xy(lon, lat):
    return (lon - LON0) * KX, (LAT1 - lat) * K

def ring_d(coords):
    pts = []
    for lon, lat in coords:
        x, y = xy(lon, lat)
        p = f'{x:.1f} {y:.1f}'
        if not pts or pts[-1] != p:
            pts.append(p)
    return 'M' + 'L'.join(pts) + 'Z' if len(pts) > 2 else ''

def poly_d(g, tol=0.03, min_area=0.02):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if isinstance(g, Polygon) else [p for p in getattr(g, 'geoms', []) if isinstance(p, Polygon)]
    d = ''
    for p in polys:
        if p.area < min_area:
            continue
        d += ring_d(p.exterior.coords)
        for i in p.interiors:
            if Polygon(i).area >= min_area:
                d += ring_d(i.coords)
    return d

def line_d(g, tol=0.04):
    g = g.simplify(tol)
    lines = [g] if isinstance(g, LineString) else [l for l in getattr(g, 'geoms', []) if isinstance(l, LineString)]
    d = ''
    for l in lines:
        pts = [f'{x:.1f} {y:.1f}' for x, y in (xy(*c[:2]) for c in l.coords)]
        if len(pts) > 1:
            d += 'M' + 'L'.join(pts)
    return d

land = unary_union([shape(f['geometry']) for f in load('ne_50m_land.geojson')]).intersection(wide)

countries = {}
for f in load('ne_10m_admin_0_countries_ind.geojson'):
    a = f['properties']['ADM0_A3']
    if a in ('IND', 'PAK', 'BGD', 'NPL', 'BTN', 'LKA', 'MMR', 'AFG'):
        countries[a] = shape(f['geometry']).buffer(0).intersection(frame)
# The mainland and Sri Lanka only: the island groups are too small to read at this scale and
# would carry the fill of whichever polity is drawn.
india = max(countries['IND'].geoms, key=lambda p: p.area) if isinstance(countries['IND'], MultiPolygon) else countries['IND']

RIVERS = ['Indus', 'Ganges', 'Brahmaputra', 'Dihang', 'Yarlung', 'Yamuna', 'Narmada', 'Krishna', 'Sutlej', 'Chenab']
rivers = unary_union([shape(f['geometry']) for f in load('ne_50m_rivers_lake_centerlines.geojson')
                      if f['properties'].get('name') in RIVERS]).intersection(frame)

# Rough rings, clockwise from the north-west. Points at sea only need to clear the coast.
ROUGH = {
    # After "Asoka's Empire (250 B.C.)", C. Collin Davies, An Historical Atlas of the Indian
    # Peninsula (1949), checked against the find-spots of the rock and pillar edicts.
    'maurya-250bce': [(62.0, 24.5), (62.5, 29.5), (63.5, 32.0), (65.5, 34.0), (68.5, 35.6), (71.5, 36.0), (74.5, 35.8),
                      (77.0, 34.5), (78.5, 32.0), (80.5, 30.3), (82.5, 29.3), (85.0, 28.3), (87.0, 27.6), (88.6, 27.0),
                      (89.6, 26.2), (89.8, 24.5), (90.6, 23.0), (90.5, 21.0), (88.0, 18.0), (84.0, 14.0), (82.5, 14.0),
                      (80.2, 14.2), (78.5, 14.3), (77.0, 14.2), (75.8, 14.3), (74.6, 14.2), (74.0, 14.3), (72.0, 14.0),
                      (71.0, 18.0), (68.0, 20.0), (67.0, 22.5), (65.0, 23.5)],
    # After "The Gupta Empire at the close of the fourth century" (probable boundary under
    # Chandragupta II), the same atlas.
    'gupta-400': [(68.2, 23.0), (69.5, 24.8), (70.5, 27.0), (71.8, 29.5), (73.5, 31.5), (75.5, 32.3), (77.5, 30.8),
                  (79.5, 29.3), (81.0, 28.3), (83.5, 27.5), (85.5, 26.8), (87.5, 26.5), (88.7, 26.2), (89.3, 25.0),
                  (88.8, 23.5), (88.3, 22.0), (88.0, 21.2), (87.3, 21.0), (87.6, 21.9), (86.0, 22.0), (84.0, 22.6),
                  (82.0, 22.8), (80.5, 22.6), (78.5, 22.3), (76.5, 21.9), (74.5, 21.5), (73.0, 21.2), (72.6, 21.0),
                  (72.0, 20.7), (70.0, 20.0), (68.3, 21.5)],
    # After "India in 1236" (the Sultanate of Delhi under Iltutmish), the same atlas.
    'sultanate-1236': [(67.0, 24.0), (66.8, 26.0), (67.5, 28.5), (69.5, 31.0), (70.5, 33.0), (71.0, 34.3), (72.8, 34.5),
                       (74.5, 33.2), (76.0, 32.0), (77.8, 30.5), (79.8, 29.0), (82.0, 27.8), (84.5, 27.0), (87.0, 26.5),
                       (89.0, 26.3), (90.0, 25.3), (90.4, 23.8), (90.3, 22.3), (89.8, 21.3), (88.0, 21.3), (87.5, 22.5),
                       (86.5, 24.0), (84.0, 24.3), (82.0, 24.5), (80.3, 24.6), (79.0, 24.0), (78.2, 23.2), (76.5, 22.9),
                       (75.2, 23.6), (75.6, 24.8), (76.3, 25.8), (74.5, 26.0), (72.5, 25.5), (70.5, 24.7), (69.0, 24.2),
                       (68.0, 23.6)],
    # After "The Mughal Empire at the death of Akbar (1605)", the same atlas. Gondwana's
    # independent and tributary chiefs are left out, as that map leaves them.
    'mughal-1605': [(64.5, 25.2), (64.0, 28.5), (65.0, 31.5), (66.5, 33.5), (68.0, 35.2), (70.5, 35.8), (73.0, 36.0),
                    (75.5, 35.5), (77.5, 34.5), (78.5, 32.5), (79.5, 30.8), (81.5, 29.3), (84.0, 28.0), (86.5, 27.2),
                    (88.5, 26.8), (89.8, 26.2), (90.8, 25.2), (91.8, 24.3), (91.8, 22.8), (91.3, 22.0), (90.0, 21.0),
                    (87.5, 20.5), (86.5, 19.3), (85.0, 19.3), (84.2, 19.8), (84.6, 21.0), (85.6, 21.8), (86.3, 22.6),
                    (84.5, 23.6), (82.5, 23.9), (80.5, 23.6), (79.3, 22.8), (78.8, 21.8), (79.5, 20.6), (78.5, 19.8),
                    (76.8, 19.6), (75.5, 19.9), (74.2, 20.2), (73.2, 20.2), (72.8, 20.2), (72.0, 20.0), (70.0, 20.0),
                    (68.0, 21.5), (66.5, 23.5), (64.5, 24.5)],
}

def smooth(ring, times=3):
    # Chaikin corner cutting: rounds the hand-drawn ring so it reads as a sketch, not a survey.
    for _ in range(times):
        nxt = []
        for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
            nxt += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
        ring = nxt
    return ring

shapes = {k: poly_d(Polygon(smooth(v)).buffer(0).intersection(land), 0.03) for k, v in ROUGH.items()}
# From Natural Earth's boundaries as India draws them. 1939 joins the three successor states:
# British India with the princely states, without Burma (separated in 1937).
shapes['india'] = poly_d(india)
shapes['pakistan'] = poly_d(countries['PAK'])
shapes['bangladesh'] = poly_d(countries['BGD'])
shapes['british-india-1939'] = poly_d(unary_union([india, countries['PAK'], countries['BGD']]).buffer(0.02).buffer(-0.02))

data = {
    'width': round(W, 1), 'height': round(H, 1), 'lon0': LON0, 'lat1': LAT1, 'kx': round(KX, 5), 'k': K,
    'land': poly_d(land, 0.05, 0.05),
    'rivers': line_d(rivers),
    'indiaToday': shapes['india'],
    'shapes': shapes,
}
with open(out, 'w') as f:
    f.write('// The base map and border snapshots of the timeline page. Generated by tools/build-timeline-map.py.\n'
            '// Land, rivers and modern boundaries: Natural Earth (public domain), India point of view.\n'
            '// Historical borders: approximate, drawn by eye after the sources named in that script.\n'
            'export const TMAP = ' + json.dumps(data, separators=(',', ':')) + ';\n\n'
            'export const project = (lat, lng) => [(lng - TMAP.lon0) * TMAP.kx, (TMAP.lat1 - lat) * TMAP.k];\n')
print('wrote', os.path.normpath(out), os.path.getsize(out), 'bytes;', {k: len(v) for k, v in shapes.items()})
