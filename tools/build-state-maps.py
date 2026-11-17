#!/usr/bin/env python3
"""Builds tools/data/state-snapshots.geojson: the provinces and states of India at five dates, for
the timeline page. tools/build-timeline-map.py turns it into map shapes and label points.

  1939       British provinces and princely states
  1947       15 August 1947: the provinces of the two dominions and the princely states
  1950       26 January 1950: Part A, B, C and D states of the Constitution
  1956       1 November 1956: states and union territories after the States Reorganisation Act
  today      28 states and 8 union territories (since January 2020)

Each unit is a union of 2011 census districts, which follow the old boundaries closely, since most
districts were carried over whole from the provinces and states:
  DataMeet India community, Census 2011 district boundaries (CC BY 4.0),
  https://github.com/datameet/maps (Districts/Census_2011/2011_Dist.*)
Pakistan's provinces, Bangladesh's Sylhet division, and Kashmir beyond the Indian-administered
districts come from Natural Earth's admin-1 layer and its India point-of-view country layer (public
domain). Inside the 1939 and 1947 provinces, the patchwork of princely states comes from
tools/data/princely-states-1914.geojson (traced from Joppen's atlas by tools/trace-princely-states.py);
everything that is not a province is a state.

Known simplifications, from districts that straddle old lines: Charkhi Dadri (Jind state) and
Kalsia are left in the Punjab; Abu stays in Rajasthan; Kollegal stays in Mysore; Bhadrachalam
stays in Hyderabad; the Purulia and Islampur transfers of 1956 are shown only as Purulia.

  python3 tools/build-state-maps.py <DataMeet district folder> <Natural Earth folder>
"""
import json, os, sys
import shapefile
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
from shapely.validation import make_valid

dm, ne = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'data', 'state-snapshots.geojson')

def clean(g):
    g = make_valid(g)
    if g.geom_type == 'GeometryCollection':
        g = unary_union([p for p in g.geoms if p.geom_type in ('Polygon', 'MultiPolygon')])
    return g.buffer(0)

# ---------- sources ----------
dist = {}
r = shapefile.Reader(os.path.join(dm, '2011_Dist'))
for sr in r.iterShapeRecords():
    st, name = sr.record['ST_NM'], sr.record['DISTRICT']
    g = clean(shape(sr.shape.__geo_interface__))
    key = (st, name)
    dist[key] = unary_union([dist[key], g]) if key in dist else g
states_2011 = sorted({st for st, _ in dist})

def D(st, *names):
    missing = [n for n in names if (st, n) not in dist]
    assert not missing, (st, missing)
    return unary_union([dist[(st, n)] for n in names])

def S(*sts):
    for st in sts:
        assert st in states_2011, st
    return unary_union([g for (st, _), g in dist.items() if st in sts])

def load(name):
    return json.load(open(os.path.join(ne, name)))['features']

adm1 = {(f['properties']['adm0_a3'], f['properties']['name']): clean(shape(f['geometry'])) for f in load('ne_10m_admin_1_states_provinces.geojson')
        if f['properties']['adm0_a3'] in ('IND', 'PAK', 'BGD')}
ind_pov = {f['properties']['ADM0_A3']: clean(shape(f['geometry'])) for f in load('ne_10m_admin_0_countries_ind.geojson')
           if f['properties']['ADM0_A3'] in ('IND', 'PAK', 'BGD')}
princely = clean(shape(json.load(open(os.path.join(here, 'data', 'princely-states-1914.geojson')))['features'][0]['geometry']))

# ---------- building blocks ----------
TELANGANA = D('Andhra Pradesh', 'Adilabad', 'Nizamabad', 'Karimnagar', 'Medak', 'Hyderabad', 'Rangareddy', 'Mahbubnagar',
              'Nalgonda', 'Warangal', 'Khammam')
ANDHRA = S('Andhra Pradesh').difference(TELANGANA)
MARATHWADA = D('Maharashtra', 'Aurangabad', 'Bid', 'Hingoli', 'Jalna', 'Latur', 'Nanded', 'Osmanabad', 'Parbhani')
VIDARBHA = D('Maharashtra', 'Akola', 'Amravati', 'Bhandara', 'Buldana', 'Chandrapur', 'Garhchiroli', 'Gondiya', 'Nagpur',
             'Wardha', 'Washim', 'Yavatmal')
HYD_KARNATAKA = D('Karnataka', 'Gulbarga', 'Yadgir', 'Bidar', 'Raichur', 'Koppal')
BOMBAY_KARNATAKA = D('Karnataka', 'Belgaum', 'Bijapur', 'Bagalkot', 'Dharwad', 'Gadag', 'Haveri', 'Uttara Kannada')
OLD_MYSORE = D('Karnataka', 'Bangalore', 'Bangalore Rural', 'Ramanagara', 'Chikkaballapura', 'Kolar', 'Tumkur', 'Chitradurga',
               'Davanagere', 'Shimoga', 'Chikmagalur', 'Hassan', 'Mandya', 'Mysore', 'Chamrajnagar')
MADRAS_KARNATAKA = D('Karnataka', 'Dakshina Kannada', 'Udupi', 'Bellary')
COORG = D('Karnataka', 'Kodagu')
MALABAR = D('Kerala', 'Kasaragod', 'Kannur', 'Wayanad', 'Kozhikode', 'Malappuram', 'Palakkad')
TRAVANCORE_COCHIN = S('Kerala').difference(MALABAR).union(D('Tamil Nadu', 'Kanniyakumari'))
SAURASHTRA = D('Gujarat', 'Amreli', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Porbandar', 'Rajkot', 'Surendranagar')
KUTCH = D('Gujarat', 'Kachchh')
CP_MP = D('Madhya Pradesh', 'Balaghat', 'Betul', 'Chhindwara', 'Damoh', 'Dindori', 'East Nimar', 'Burhanpur', 'Harda',
          'Hoshangabad', 'Jabalpur', 'Katni', 'Mandla', 'Narsimhapur', 'Sagar', 'Seoni')
MADHYA_BHARAT = D('Madhya Pradesh', 'Alirajpur', 'Ashoknagar', 'Barwani', 'Bhind', 'Dewas', 'Dhar', 'Guna', 'Gwalior', 'Indore',
                  'Jhabua', 'Mandsaur', 'Morena', 'Neemuch', 'Rajgarh', 'Ratlam', 'Shajapur', 'Sheopur', 'Shivpuri', 'Ujjain',
                  'Vidisha', 'West Nimar')
VINDHYA = D('Madhya Pradesh', 'Anuppur', 'Chhatarpur', 'Datia', 'Panna', 'Rewa', 'Satna', 'Shahdol', 'Sidhi', 'Singrauli',
            'Tikamgarh', 'Umaria')
BHOPAL = D('Madhya Pradesh', 'Bhopal', 'Raisen', 'Sehore')
PEPSU = D('Punjab', 'Patiala', 'Sangrur', 'Barnala', 'Bathinda', 'Mansa', 'Faridkot', 'Kapurthala', 'Fatehgarh Sahib').union(
        D('Haryana', 'Jind', 'Mahendragarh'))
PUNJAB_HILLS = D('Himachal Pradesh', 'Kangra', 'Kullu', 'Lahul & Spiti', 'Una', 'Hamirpur')     # to Himachal in 1966
HIMACHAL_1950 = D('Himachal Pradesh', 'Chamba', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Kinnaur')
BILASPUR = D('Himachal Pradesh', 'Bilaspur')
PURULIA = D('West Bengal', 'Puruliya')
AJMER = D('Rajasthan', 'Ajmer')
NORTHEAST = S('Assam', 'Meghalaya', 'Nagaland', 'Mizoram', 'Arunanchal Pradesh')
PORTUGUESE = S('Goa', 'Daman & Diu', 'Dadara & Nagar Havelli')
FRENCH = S('Puducherry')

# Jammu and Kashmir as India draws it: the Indian-administered districts, Azad Kashmir and
# Gilgit-Baltistan, and Aksai Chin (what India's outline holds beyond every other district).
jk_d = S('Jammu & Kashmir')
others = unary_union([g for (st, _), g in dist.items() if st != 'Jammu & Kashmir'])
aksai = ind_pov['IND'].difference(others.buffer(0.05)).difference(jk_d).intersection(box(77.5, 34.0, 80.6, 36.3))
KASHMIR = unary_union([jk_d, adm1[('PAK', 'Azad Kashmir')], adm1[('PAK', 'Northern Areas')], adm1[('IND', 'Jammu and Kashmir')],
                       adm1[('IND', 'Ladakh')], aksai]).buffer(0.01).buffer(-0.01)
LADAKH = KASHMIR.difference(unary_union([adm1[('IND', 'Jammu and Kashmir')], adm1[('PAK', 'Azad Kashmir')],
                                         D('Jammu & Kashmir', *[n for (st, n) in dist if st == 'Jammu & Kashmir' and n not in ('Leh (ladakh)', 'Kargil')])]))
JK_UT = KASHMIR.difference(LADAKH)

W_PUNJAB = unary_union([adm1[('PAK', 'Punjab')], adm1[('PAK', 'F.C.T.')]])
NWFP = unary_union([adm1[('PAK', 'K.P.')], adm1[('PAK', 'F.A.T.A.')]])
SIND = adm1[('PAK', 'Sind')]
BALUCHISTAN = adm1[('PAK', 'Baluchistan')]
SYLHET = adm1[('BGD', 'Sylhet')]
EAST_BENGAL = unary_union([g for (a, _), g in adm1.items() if a == 'BGD'])

# ---------- the provinces of British India ----------
PUNJAB_1947_IN = unary_union([S('Punjab', 'Haryana', 'Chandigarh'), PUNJAB_HILLS])
PROV_COMMON = {
    'Delhi': S('NCT of Delhi'),
    'United Provinces': S('Uttar Pradesh', 'Uttarakhand'),
    'Bihar': unary_union([S('Bihar', 'Jharkhand'), PURULIA]),
    'Orissa': S('Odisha'),
    'Central Provinces and Berar': unary_union([S('Chhattisgarh'), CP_MP, VIDARBHA]),
    'Bombay': unary_union([S('Gujarat'), S('Maharashtra').difference(MARATHWADA).difference(VIDARBHA), BOMBAY_KARNATAKA]),
    'Madras': unary_union([S('Tamil Nadu').difference(D('Tamil Nadu', 'Kanniyakumari')), ANDHRA, MALABAR, MADRAS_KARNATAKA,
                           S('Lakshadweep')]),
    'Ajmer-Merwara': AJMER,
    'Coorg': COORG,
    'Andaman and Nicobar': S('Andaman & Nicobar Island'),
}
PROV_1939 = dict(PROV_COMMON, **{
    'Punjab': unary_union([PUNJAB_1947_IN, W_PUNJAB]),
    'North-West Frontier': NWFP,
    'Sind': SIND,
    'Baluchistan': BALUCHISTAN,
    'Bengal': unary_union([S('West Bengal').difference(PURULIA), EAST_BENGAL.difference(SYLHET)]),
    'Assam': unary_union([NORTHEAST, SYLHET]),
})
PROV_1947_IN = dict(PROV_COMMON, **{
    'East Punjab': PUNJAB_1947_IN,
    'West Bengal': S('West Bengal').difference(PURULIA),
    'Assam': NORTHEAST,
})
PROV_1947_PK = {'West Punjab': W_PUNJAB, 'North-West Frontier': NWFP, 'Sind': SIND, 'Baluchistan': BALUCHISTAN,
                'East Bengal': EAST_BENGAL}

ALL_INDIA = unary_union([g for (st, _), g in dist.items()] + [KASHMIR])
RAJ = unary_union([ALL_INDIA.difference(PORTUGUESE).difference(FRENCH), W_PUNJAB, NWFP, SIND, BALUCHISTAN, EAST_BENGAL])

features = []
def add(snapshot, name, cls, geom, note=''):
    geom = geom.buffer(0)
    if geom.is_empty:
        return
    features.append({'type': 'Feature', 'properties': {'snapshot': snapshot, 'name': name, 'cls': cls, 'note': note},
                     'geometry': rounded(mapping(geom.simplify(0.015, preserve_topology=True)))})

def rounded(g):
    # Coordinates to 0.001 degrees (about 100 m), far finer than the page draws.
    def r(c):
        return [round(c[0], 3), round(c[1], 3)] if isinstance(c[0], float) else [r(x) for x in c]
    return {'type': g['type'], 'coordinates': r(g['coordinates'])}

def provinces_and_states(snapshot, provinces, pk=None):
    trimmed = {n: g.difference(princely) for n, g in provinces.items()}
    pk_trimmed = {n: g.difference(princely) for n, g in (pk or {}).items()}
    held = unary_union(list(trimmed.values()) + list(pk_trimmed.values()))
    for n, g in trimmed.items():
        add(snapshot, n, 'a', g, 'Province')
    for n, g in pk_trimmed.items():
        add(snapshot, n, 'c', g, 'Province of Pakistan')
    add(snapshot, 'Princely states', 'b', RAJ.difference(held).difference(S('Sikkim')) if snapshot == '1947' else RAJ.difference(held), 'Princely states')

provinces_and_states('1939', PROV_1939)
provinces_and_states('1947', PROV_1947_IN, PROV_1947_PK)

# ---------- 26 January 1950 ----------
P1950 = {
    'a': {
        'Assam': NORTHEAST, 'Bihar': unary_union([S('Bihar', 'Jharkhand'), PURULIA]),
        'Bombay': unary_union([S('Gujarat').difference(SAURASHTRA).difference(KUTCH),
                               S('Maharashtra').difference(MARATHWADA).difference(VIDARBHA), BOMBAY_KARNATAKA]),
        'Madhya Pradesh': unary_union([S('Chhattisgarh'), CP_MP, VIDARBHA]),
        'Madras': PROV_COMMON['Madras'], 'Orissa': S('Odisha'),
        'Punjab': PUNJAB_1947_IN.difference(PEPSU), 'Uttar Pradesh': S('Uttar Pradesh', 'Uttarakhand'),
        'West Bengal': S('West Bengal').difference(PURULIA),
    },
    'b': {
        'Hyderabad': unary_union([TELANGANA, MARATHWADA, HYD_KARNATAKA]), 'Jammu and Kashmir': KASHMIR,
        'Madhya Bharat': MADHYA_BHARAT, 'Mysore': OLD_MYSORE, 'PEPSU': PEPSU,
        'Rajasthan': S('Rajasthan').difference(AJMER), 'Saurashtra': SAURASHTRA, 'Travancore-Cochin': TRAVANCORE_COCHIN,
    },
    'c': {
        'Ajmer': AJMER, 'Bhopal': BHOPAL, 'Bilaspur': BILASPUR, 'Coorg': COORG, 'Delhi': S('NCT of Delhi'),
        'Himachal Pradesh': HIMACHAL_1950, 'Kutch': KUTCH, 'Manipur': S('Manipur'), 'Tripura': S('Tripura'),
        'Vindhya Pradesh': VINDHYA,
    },
    'd': {'Andaman and Nicobar': S('Andaman & Nicobar Island')},
}
PART = {'a': 'Part A state', 'b': 'Part B state', 'c': 'Part C state', 'd': 'Part D territory'}
for cls, units in P1950.items():
    for n, g in units.items():
        add('1950', n, cls, g, PART[cls])

# ---------- 1 November 1956 ----------
S1956 = {
    'Andhra Pradesh': S('Andhra Pradesh'), 'Assam': NORTHEAST, 'Bihar': S('Bihar', 'Jharkhand'),
    'Bombay': S('Gujarat', 'Maharashtra'), 'Jammu and Kashmir': KASHMIR, 'Kerala': S('Kerala'),
    'Madhya Pradesh': S('Madhya Pradesh', 'Chhattisgarh'), 'Madras': S('Tamil Nadu'), 'Mysore': S('Karnataka'),
    'Orissa': S('Odisha'), 'Punjab': PUNJAB_1947_IN, 'Rajasthan': S('Rajasthan'),
    'Uttar Pradesh': S('Uttar Pradesh', 'Uttarakhand'), 'West Bengal': S('West Bengal'),
}
U1956 = {
    'Delhi': S('NCT of Delhi'), 'Himachal Pradesh': unary_union([HIMACHAL_1950, BILASPUR]), 'Manipur': S('Manipur'),
    'Tripura': S('Tripura'), 'Andaman and Nicobar': S('Andaman & Nicobar Island'), 'Laccadive Islands': S('Lakshadweep'),
}
for n, g in S1956.items():
    add('1956', n, 'a', g, 'State')
for n, g in U1956.items():
    add('1956', n, 'c', g, 'Union territory')

# ---------- today ----------
TODAY = {n: S(n) for n in ('Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                           'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                           'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Tripura', 'Uttar Pradesh',
                           'Uttarakhand', 'West Bengal')}
TODAY['Arunachal Pradesh'] = S('Arunanchal Pradesh')
TODAY['Andhra Pradesh'] = ANDHRA
TODAY['Telangana'] = TELANGANA
UT_TODAY = {
    'Jammu and Kashmir': JK_UT, 'Ladakh': LADAKH, 'Delhi': S('NCT of Delhi'), 'Chandigarh': S('Chandigarh'),
    'Dadra and Nagar Haveli and Daman and Diu': S('Dadara & Nagar Havelli', 'Daman & Diu'), 'Puducherry': S('Puducherry'),
    'Lakshadweep': S('Lakshadweep'), 'Andaman and Nicobar': S('Andaman & Nicobar Island'),
}
assert len(TODAY) == 28 and len(UT_TODAY) == 8
for n, g in TODAY.items():
    add('today', n, 'a', g, 'State')
for n, g in UT_TODAY.items():
    add('today', n, 'c', g, 'Union territory')

os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump({'type': 'FeatureCollection', 'features': features}, open(out, 'w'), separators=(',', ':'))
print('wrote', os.path.normpath(out), os.path.getsize(out), 'bytes;',
      {s: sum(1 for f in features if f['properties']['snapshot'] == s) for s in ('1939', '1947', '1950', '1956', 'today')})
