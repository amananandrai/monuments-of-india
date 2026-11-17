#!/usr/bin/env python3
"""Builds js/timeline-map.js: the base map and the border snapshots of the timeline page.

Sources checked against include C. Joppen, Historical Atlas of India (1914, public domain:
archive.org/details/historicalatlaso00jopprich), plates 2, 3, 5, 6, 18, 27 and 28.

The provinces and states of 1939, 1947, 1950, 1956 and today come from tools/data/state-snapshots.geojson
(see tools/build-state-maps.py).

Needs shapely, and four Natural Earth files (public domain) in the folder given as the argument:
  ne_50m_land.geojson, ne_50m_rivers_lake_centerlines.geojson, ne_10m_admin_0_countries_ind.geojson,
  ne_10m_admin_1_states_provinces.geojson (read by build-state-maps.py)
from https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

  python3 tools/build-timeline-map.py <folder with the Natural Earth files>

The historical borders below are drawn by eye, as rough rings of (longitude, latitude) that
overshoot the coast; the script cuts them to the land, and cuts neighbours of one snapshot apart
(CUT). They are approximate and are meant to be replaced by borders traced in a GIS. Each names
the evidence or the map it was drawn after.
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

# The other eras, drawn the same way. Where two powers of one snapshot meet, the rings overlap and
# CUT below gives the overlap to the first, so neighbours share one line.
ROUGH.update({
    # The spread of mature Harappan sites, c. 2600–1900 BCE: Sutkagen Dor on the Makran coast,
    # Manda on the Chenab, Alamgirpur in the Doab and Bhagatrav near the Narmada. Outliers such as
    # Shortugai on the Oxus and Daimabad in the Deccan (often given as the southern limit, but its
    # Harappan phase is late) are left out. A culture area, not a border.
    'harappan-2500bce': [(61.2, 24.9), (61.5, 25.9), (62.8, 26.5), (64.5, 27.7), (66.0, 28.9), (67.3, 30.0), (68.6, 31.3),
                         (70.0, 32.6), (71.5, 33.6), (72.8, 33.9), (74.2, 33.3), (75.2, 32.9), (76.4, 31.5), (77.3, 30.4),
                         (77.9, 29.3), (77.4, 28.4), (76.2, 27.8), (74.5, 27.6), (73.2, 27.2), (72.0, 26.6), (71.0, 25.8),
                         (71.4, 24.6), (72.5, 23.8), (73.2, 22.8), (73.4, 21.6), (72.5, 20.8), (71.0, 20.4), (69.0, 21.4),
                         (67.8, 22.8), (66.5, 24.3), (64.0, 24.8)],
    # The rivers of the Rigveda's river hymn (10.75), from the Kubha (Kabul) to the Ganga: the land
    # of the seven rivers.
    'rigvedic': [(68.6, 34.9), (71.0, 35.1), (73.5, 34.6), (75.5, 33.5), (77.0, 32.1), (78.3, 30.6), (78.5, 29.6), (77.6, 28.7),
                 (76.2, 28.8), (74.5, 29.1), (72.5, 28.9), (71.0, 28.5), (70.0, 29.4), (69.4, 31.4), (68.6, 33.0)],
    # Later Vedic texts: Kuru and Panchala in the Doab, Kosala, and Videha beyond the Sadanira
    # (Gandak), which the Shatapatha Brahmana tells Videgha Mathava crossed with Agni.
    'later-vedic': [(76.3, 30.9), (78.0, 30.5), (79.5, 29.5), (81.5, 28.6), (83.5, 27.7), (85.0, 27.4), (86.6, 26.9), (86.9, 26.0),
                    (85.8, 25.4), (84.0, 25.3), (82.5, 25.1), (81.0, 25.1), (79.5, 25.5), (78.0, 26.2), (76.8, 26.9), (75.8, 28.0),
                    (75.7, 29.6)],
    # Magadha under the Nandas, c. 325 BCE: the Prasii and Gangaridai of the Greek writers, east of
    # the Beas where Alexander's army turned back, with Kalinga (the Hathigumpha inscription speaks
    # of a Nanda canal there).
    'nanda-325bce': [(76.0, 30.8), (78.0, 30.4), (80.0, 29.0), (82.5, 27.8), (84.5, 27.4), (86.5, 26.9), (88.3, 26.4),
                     (89.2, 25.0), (89.2, 23.0), (89.0, 21.3), (87.0, 20.6), (86.0, 19.6), (84.8, 19.0), (84.0, 20.0),
                     (82.5, 21.4), (81.0, 22.4), (79.0, 22.7), (77.0, 22.2), (75.5, 22.2), (74.4, 23.0), (74.7, 24.5),
                     (75.4, 26.0), (75.3, 28.0), (75.5, 29.6)],
    # Alexander's conquests, 326–325 BCE: Gandhara, Taxila and Porus's kingdom up to the Beas, and
    # the Indus down to Patala at its delta (Arrian).
    'alexander-325bce': [(68.4, 35.4), (71.5, 36.0), (73.6, 35.0), (74.9, 33.5), (75.8, 32.2), (75.4, 31.0), (73.6, 30.0),
                         (72.0, 28.5), (71.0, 27.0), (70.1, 25.4), (69.3, 23.6), (67.0, 23.6), (67.0, 26.0), (67.8, 28.5),
                         (68.7, 30.5), (68.9, 32.5), (68.3, 34.0)],
    # c. 150 CE. The Kushans under Kanishka: finds from Peshawar, Mathura and Sarnath, and the cities
    # his Rabatak inscription names, Saketa, Kausambi and Pataliputra. Champa, which it also names,
    # may have lain just beyond his rule and is left out.
    'kushan-150': [(62.0, 32.0), (63.0, 36.0), (64.5, 39.6), (70.0, 39.6), (74.0, 38.0), (75.5, 36.5), (76.5, 34.6),
                   (77.6, 32.6), (78.6, 31.0), (80.0, 29.6), (82.0, 27.9), (84.0, 27.2), (85.7, 26.6), (85.8, 25.3),
                   (84.4, 24.9), (82.0, 24.7), (80.5, 24.9), (79.0, 25.4), (77.8, 26.1), (76.8, 26.4), (75.5, 26.9),
                   (74.0, 27.9), (73.0, 29.0), (71.8, 29.6), (70.5, 29.3), (69.3, 28.9), (68.0, 28.6), (66.8, 28.6),
                   (65.0, 29.4), (63.0, 30.4)],
    # The Western Satraps under Rudradaman: the lands his Junagadh inscription (150 CE) lists, from
    # Sindhu-Sauvira (the lower Indus, glossed as reaching towards Multan) and Kachchha to
    # Surashtra, Maru, Avanti, Anupa and Aparanta (the north Konkan).
    'satraps-150': [(66.5, 24.8), (66.6, 28.4), (68.5, 29.0), (70.0, 29.6), (71.6, 30.0), (73.3, 29.4), (73.8, 27.8),
                    (75.0, 26.6), (76.5, 25.5), (77.6, 24.5), (77.9, 23.3), (77.2, 22.0), (75.6, 21.3), (74.2, 20.6),
                    (73.6, 19.7), (72.4, 19.4), (70.0, 20.0), (68.0, 22.0), (67.0, 23.5)],
    # The Satavahanas after Gautamiputra Satakarni (Nasik inscription of Gautami Balashri): the
    # Deccan from Pratishthana to Amaravati and the Krishna delta, with Sannati and the Kolhapur coins
    # in the south-west. Banavasi, often shown as theirs, was the Chutus' capital and is left out.
    'satavahana-150': [(72.4, 19.4), (73.4, 20.5), (75.0, 21.2), (77.0, 21.8), (79.0, 22.1), (80.6, 21.6), (82.0, 20.5),
                       (83.4, 19.1), (84.6, 18.4), (83.0, 16.8), (81.5, 15.6), (80.4, 14.6), (79.0, 14.6), (77.6, 15.2),
                       (76.4, 15.6), (75.0, 15.6), (73.8, 15.8), (72.9, 16.8)],
    # c. 850: the three powers that the Arab merchant Sulaiman described in 851 and that fought over
    # Kannauj. The Pratiharas under Mihira Bhoja: the Himalayan foothills to the Narmada, east of the
    # Sutlej (inscriptions from Pehowa, Dausa and Gwalior). Saurashtra is shown as theirs, though
    # its feudatory grants date from his son Mahendrapala...
    'pratihara-850': [(72.6, 30.6), (75.5, 31.2), (77.0, 30.9), (78.6, 30.1), (80.6, 28.6), (82.6, 27.4), (84.1, 26.6),
                      (84.4, 25.5), (83.0, 24.4), (81.5, 23.9), (79.5, 23.7), (78.0, 22.9), (76.0, 22.4), (74.0, 21.9),
                      (72.6, 21.2), (71.5, 20.3), (69.5, 21.4), (68.8, 22.6), (70.0, 23.6), (71.0, 24.6), (71.0, 26.6),
                      (71.5, 28.6), (72.0, 30.0)],
    # ...the Palas of Bengal and Bihar under Devapala...
    'pala-850': [(83.5, 26.4), (85.5, 27.3), (87.0, 26.9), (88.5, 26.6), (89.9, 26.3), (90.6, 25.0), (91.2, 23.5),
                 (91.2, 21.8), (89.0, 21.2), (87.4, 21.2), (86.8, 22.0), (85.9, 22.8), (84.9, 23.4), (83.8, 24.0),
                 (83.2, 25.0)],
    # ...and the Rashtrakutas of Manyakheta under Amoghavarsha, with the Lata branch in south Gujarat.
    'rashtrakuta-850': [(72.4, 22.3), (74.0, 22.4), (76.0, 22.7), (78.0, 22.8), (80.0, 22.0), (81.2, 20.5), (81.2, 18.5),
                        (80.1, 17.0), (79.1, 15.5), (78.1, 14.0), (77.1, 12.8), (76.0, 12.5), (74.6, 12.8), (73.3, 15.5),
                        (72.4, 18.5), (72.1, 20.5)],
    # c. 1805, after the treaties of 1799–1805: Mysore partitioned, the Carnatic and Tanjore taken,
    # Awadh's cession (1801), Bassein (1802) and the Maratha war treaties of Deogaon and
    # Surji-Anjangaon (1803). The Company: Bengal, Bihar, Benares, the Doab, Delhi, Agra, part of
    # Bundelkhand and the Orissa coast; districts in Gujarat; and the Madras Presidency. Awadh and Mysore are cut out of it below.
    'company-1805': [
        [(76.8, 28.7), (77.3, 30.3), (78.0, 30.2), (79.0, 29.4), (80.2, 28.9), (81.0, 28.6), (82.0, 27.9), (83.5, 27.5),
         (84.3, 27.4), (85.5, 27.1), (86.8, 26.6), (88.0, 26.5), (89.0, 26.3), (89.9, 26.3), (90.5, 25.4), (91.8, 25.3),
         (92.5, 24.9), (92.4, 23.6), (92.4, 21.0), (90.0, 20.8), (88.0, 20.8), (87.0, 19.9), (86.0, 19.1), (85.0, 19.1),
         (84.9, 20.0), (85.3, 20.8), (85.7, 21.6), (86.2, 22.1), (85.2, 22.8), (84.0, 23.1), (83.4, 24.0), (82.4, 24.6), (81.8, 25.1),
         (81.6, 25.0), (80.8, 24.9), (80.0, 25.0), (79.3, 25.4), (79.0, 26.2), (78.0, 26.8), (77.4, 27.5),
         (76.9, 28.1)],
        # Broach, Surat and Kaira in Gujarat, from Surji-Anjangaon (1803) and the Gaekwad (1805).
        [(72.4, 23.1), (73.2, 23.0), (73.4, 22.2), (73.3, 21.0), (72.6, 20.9), (72.2, 21.6)],
        [(85.6, 19.0), (85.2, 19.3), (84.4, 19.3), (83.5, 18.8), (82.5, 18.3), (82.0, 17.7), (81.3, 17.3), (80.6, 16.8),
         (80.0, 16.3), (79.0, 15.9), (78.0, 15.9), (77.0, 16.0), (76.2, 15.5), (75.8, 14.9), (75.0, 14.8), (74.6, 15.0),
         (74.0, 15.1), (73.6, 14.8), (74.4, 12.5), (75.3, 10.6), (76.2, 10.3), (76.6, 10.3), (77.0, 9.6), (77.3, 8.8),
         (77.6, 8.1), (78.4, 8.2), (79.5, 9.8), (80.3, 11.0), (80.6, 13.0), (80.6, 15.0), (82.0, 16.2), (83.5, 17.3),
         (84.8, 18.6)],
    ],
    'awadh-1805': [(79.9, 27.3), (80.0, 28.6), (80.8, 29.2), (81.8, 28.6), (82.6, 27.7), (82.9, 26.9), (82.6, 26.2),
                   (81.7, 25.8), (80.8, 26.0), (80.2, 26.6)],
    'mysore-1805': [(75.3, 14.0), (76.0, 14.7), (77.3, 14.4), (78.4, 13.6), (78.5, 12.8), (77.8, 12.0), (77.0, 11.6),
                    (76.2, 11.8), (75.6, 12.3), (75.3, 13.0)],
    # The Maratha states (the Peshwa, Sindhia, Holkar, the Bhonsle of Nagpur and the Gaekwad, with
    # Kathiawar paying them tribute), drawn wide and cut by their neighbours.
    'maratha-1805': [(68.8, 22.4), (70.5, 23.3), (71.5, 24.1), (72.5, 24.5), (73.5, 24.3), (74.5, 24.1), (75.2, 24.7),
                     (76.0, 25.4), (77.0, 26.1), (78.1, 26.8), (79.0, 26.3), (79.3, 25.5), (80.0, 24.3), (81.0, 23.7),
                     (82.5, 23.7), (84.0, 23.2), (85.0, 22.2), (85.6, 21.0), (85.2, 20.0), (84.0, 19.2), (82.6, 18.4),
                     (81.5, 17.6), (80.6, 17.6), (78.0, 17.0), (76.6, 15.8), (76.0, 15.0), (74.4, 15.0), (73.8, 15.8),
                     (73.2, 16.5), (72.5, 18.5), (72.3, 20.5), (71.5, 20.5), (70.0, 20.5), (68.6, 21.8)],
    # The Nizam's dominions after ceding the Ceded Districts (1800) and gaining Berar (1803).
    'hyderabad-1805': [(75.4, 21.1), (76.0, 21.4), (77.5, 21.4), (78.8, 21.3), (79.0, 20.5), (79.2, 19.0), (80.5, 18.4),
                       (81.3, 17.6), (81.0, 17.0), (80.2, 16.5), (79.0, 15.9), (78.0, 15.9), (77.0, 16.0), (76.3, 16.0),
                       (76.4, 16.6), (76.0, 17.5), (75.3, 18.5), (74.6, 19.5), (74.8, 20.4)],
    # The Sikh states, from the Jhelum to the Yamuna, as Joppen's "India in 1805" (1914) colours
    # them: Ranjit Singh's kingdom west of the Sutlej, and the cis-Sutlej chiefs. Multan and
    # Kashmir were still Afghan, Bahawalpur independent.
    'sikh-1805': [(72.0, 33.3), (73.5, 33.3), (74.8, 32.8), (75.8, 32.2), (76.6, 31.2), (77.4, 30.6), (77.5, 29.9),
                  (76.5, 29.6), (75.5, 29.8), (74.4, 30.3), (73.4, 30.6), (72.5, 31.2), (71.8, 32.1)],
    # The Vakatakas under Prabhavatigupta, Chandragupta II's daughter, c. 400: Vidarbha and the
    # western Deccan as far as Ajanta.
    'vakataka-400': [(73.6, 21.8), (76.5, 22.8), (78.5, 23.0), (80.5, 23.2), (82.4, 22.2), (82.4, 20.3), (81.0, 18.6),
                     (79.2, 18.0), (77.5, 17.6), (75.8, 17.8), (74.2, 18.6), (73.4, 20.2)],
    # The Deccan sultanates in 1605, after Akbar took Khandesh, Berar and Ahmadnagar fort: Malik
    # Ambar's Nizam Shahi kingdom, Bijapur to the Tungabhadra, Golconda to the Godavari delta and
    # beyond. After the same Davies map of 1605.
    # Ahmadnagar is the narrow western remnant Joppen's "India in 1605" (1914) shows, the Mughals
    # holding the fort and its province.
    'ahmadnagar-1605': [(72.4, 20.3), (74.5, 20.6), (75.6, 20.3), (76.4, 19.4), (76.6, 18.4), (76.0, 17.8),
                        (74.8, 17.6), (73.8, 17.5), (72.6, 17.5)],
    'golconda-1605': [(77.3, 19.6), (79.5, 19.9), (81.0, 19.3), (82.5, 18.9), (84.7, 19.0), (84.7, 18.2), (83.5, 17.1),
                      (82.3, 16.2), (81.0, 15.3), (80.5, 15.4), (79.5, 15.6), (78.5, 15.9), (77.5, 16.2), (77.0, 16.8),
                      (76.9, 17.8)],
    'bijapur-1605': [(72.6, 17.8), (74.0, 18.0), (75.5, 18.0), (76.5, 18.6), (77.3, 18.6), (77.5, 18.0), (77.4, 17.2), (77.4, 16.2), (77.0, 15.4),
                     (76.0, 14.8), (75.0, 14.7), (74.0, 14.7), (73.4, 15.5), (72.8, 16.8)],
})

# What each shape gives up to the shapes it borders, and the holes cut in it.
CUT = {
    'later-vedic': ['rigvedic'],
    'alexander-325bce': ['nanda-325bce'],
    'satraps-150': ['kushan-150'],
    'satavahana-150': ['kushan-150', 'satraps-150'],
    'pala-850': ['pratihara-850'],
    'rashtrakuta-850': ['pratihara-850'],
    'company-1805': ['awadh-1805', 'mysore-1805'],
    'maratha-1805': ['company-1805', 'hyderabad-1805', 'awadh-1805', 'mysore-1805'],
    'hyderabad-1805': ['company-1805'],
    'sikh-1805': ['company-1805'],
    'vakataka-400': ['gupta-400'],
    'ahmadnagar-1605': ['mughal-1605'],
    'golconda-1605': ['mughal-1605', 'ahmadnagar-1605'],
    'bijapur-1605': ['mughal-1605', 'ahmadnagar-1605', 'golconda-1605'],
}

def smooth(ring, times=3):
    # Chaikin corner cutting: rounds the hand-drawn ring so it reads as a sketch, not a survey.
    for _ in range(times):
        nxt = []
        for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
            nxt += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
        ring = nxt
    return ring

def rings(v):
    # A shape is one ring, or a list of rings joined together.
    return v if isinstance(v[0], list) else [v]

geoms = {k: unary_union([Polygon(smooth(r)).buffer(0) for r in rings(v)]).intersection(land) for k, v in ROUGH.items()}
for k, others in CUT.items():
    for o in others:
        geoms[k] = geoms[k].difference(geoms[o])
HOLES = {'awadh-1805', 'mysore-1805'}       # only cut out of others, not drawn
shapes = {k: poly_d(g, 0.03) for k, g in geoms.items() if k not in HOLES}
# From Natural Earth's boundaries as India draws them. 1939 joins the three successor states:
# British India with the princely states, without Burma (separated in 1937).
shapes['india'] = poly_d(india)
shapes['pakistan'] = poly_d(countries['PAK'])
shapes['bangladesh'] = poly_d(countries['BGD'])
# Provinces and states at five dates, from tools/build-state-maps.py. Each unit gets a shape and a
# label point inside it (none for units too small to letter).
from shapely.ops import polylabel
snap_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'state-snapshots.geojson')
units = {}
# Where the point inside the largest piece reads badly, a label point (lat, lng) by hand.
LABEL_AT = {('1950', 'Punjab'): (31.3, 75.2), ('today', 'Jammu and Kashmir'): (33.25, 74.75), ('1950', 'Bombay'): (19.6, 74.4),
            ('1939', 'Baluchistan'): (29.9, 67.4), ('1939', 'North-West Frontier'): (34.0, 71.2), ('1947', 'North-West Frontier'): (34.0, 71.2),
            ('1947', 'West Punjab'): (30.4, 72.3), ('1939', 'Punjab'): (30.9, 73.2), ('today', 'Ladakh'): (34.4, 77.9), ('1947', 'Baluchistan'): (29.9, 67.4), ('1956', 'Bombay'): (20.6, 74.6)}
for n, f in enumerate(json.load(open(snap_file))['features']):
    p, g = f['properties'], shape(f['geometry']).buffer(0)
    key = f"u{n}"
    shapes[key] = poly_d(g, 0.035, 0.004)
    if not shapes[key]:
        del shapes[key]
        continue
    big = max(getattr(g, 'geoms', [g]), key=lambda q: q.area)
    at = LABEL_AT.get((p['snapshot'], p['name']))
    if at is None and big.area >= 0.3 and p['name'] != 'Princely states':   # the states are lettered by hand
        q = polylabel(big, 0.01)
        at = (q.y, q.x)
    units.setdefault(p['snapshot'], []).append([key, p['cls'], p['name'], p['note']] + ([round(at[0], 2), round(at[1], 2)] if at else []))

data = {
    'width': round(W, 1), 'height': round(H, 1), 'lon0': LON0, 'lat1': LAT1, 'kx': round(KX, 5), 'k': K,
    'land': poly_d(land, 0.05, 0.05),
    'rivers': line_d(rivers),
    'indiaToday': shapes['india'],
    'shapes': shapes,
    'units': units,
}
with open(out, 'w') as f:
    f.write('// The base map and border snapshots of the timeline page. Generated by tools/build-timeline-map.py.\n'
            '// Land, rivers and modern boundaries: Natural Earth (public domain), India point of view.\n'
            '// Historical borders: approximate, drawn by eye after the sources named in that script.\n'
            'export const TMAP = ' + json.dumps(data, separators=(',', ':')) + ';\n\n'
            'export const project = (lat, lng) => [(lng - TMAP.lon0) * TMAP.kx, (TMAP.lat1 - lat) * TMAP.k];\n')
print('wrote', os.path.normpath(out), os.path.getsize(out), 'bytes;', {k: len(v) for k, v in shapes.items()})
