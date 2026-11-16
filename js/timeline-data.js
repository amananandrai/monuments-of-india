// The timeline page's eras and border snapshots (timeline.html). Years below zero are BCE.
//
// An era's `map` says what is drawn for it: `fills` are shapes from js/timeline-map.js, `labels` are
// names placed at [lat, lng]. `kind` picks a label's look: 'in' a region inside the main power,
// 'out' a neighbour, 'city' a capital or site with a dot ('city-left' puts its name on the left). An era without `map` has no borders yet.
// The histories are short summaries from general reference works; the borders are approximate.

export const ERAS = [
  {
    id: 'indus', name: 'Indus Valley Civilisation', short: 'Indus Valley', start: -3300, end: -1500, span: 'c. 3300–1300 BCE',
    powers: 'A society of cities with no known kings: Harappa, Mohenjo-daro, Dholavira, Rakhigarhi and Lothal.',
    change: 'Planned cities rise along the Indus and the Ghaggar-Hakra, with grid streets, covered drains, standard weights and a script nobody has yet read.',
    dates: ['Cities at their height c. 2600–1900 BCE', 'Cities abandoned by c. 1300 BCE'],
    lead: null, leadNote: 'No 3D model yet. Planned: the Great Bath of Mohenjo-daro.',
    map: {
      title: 'Major Harappan cities', certainty: 'Sites from excavation reports; no borders are known.',
      fills: [],
      labels: [
        ['Harappa', 30.63, 72.86, 'city'], ['Mohenjo-daro', 27.33, 68.14, 'city'], ['Dholavira', 23.89, 70.21, 'city'],
        ['Lothal', 22.52, 72.25, 'city'], ['Rakhigarhi', 29.29, 76.11, 'city'], ['Kalibangan', 29.47, 74.13, 'city-left'],
      ],
    },
  },
  {
    id: 'vedic', name: 'Vedic period', short: 'Vedic', start: -1500, end: -600, span: 'c. 1500–600 BCE',
    powers: 'Herding clans at first, then the kingdoms of the Kurus and the Panchalas.',
    change: 'Settlement moves from the Punjab to the plain between the Ganga and the Yamuna. Iron tools and rice farming spread east.',
    dates: ['Rigveda composed c. 1500–1000 BCE', 'Later Vedic texts and early Upanishads c. 1000–600 BCE'],
    lead: null, leadNote: 'No 3D model yet. Planned: a falcon-shaped fire altar, rebuilt from the ritual texts.',
    map: {
      title: 'Regions named in the Vedic texts', certainty: 'Regions placed roughly; no borders are known.',
      fills: [],
      labels: [
        ['Sapta Sindhu', 31.0, 73.3, 'in'], ['Kuru', 29.2, 77.0, 'in'], ['Panchala', 28.0, 79.5, 'in'],
        ['Kosala', 27.0, 82.4, 'in'], ['Videha', 26.4, 85.8, 'in'],
      ],
    },
  },
  {
    id: 'mahajanapada', name: 'Mahajanapadas', short: 'Mahajanapadas', start: -600, end: -321, span: 'c. 600–321 BCE',
    powers: 'Sixteen great states. Magadha rises under Bimbisara and Ajatashatru, and the Nandas follow.',
    change: 'Magadha absorbs its neighbours. Persia holds Gandhara and the Indus. The Buddha and Mahavira teach in the eastern plain.',
    dates: ['The Buddha and Mahavira, 6th–5th c. BCE', 'Alexander in the Punjab, 327–325 BCE'],
    lead: null, leadNote: 'No 3D model yet. Planned: the cyclopean walls of Rajagriha, Magadha’s first capital.',
    map: {
      title: 'The sixteen great states, c. 500 BCE', certainty: 'Names placed after the “Ancient India c. 500 B.C.” map in Davies’ atlas; borders are not drawn.',
      fills: [],
      labels: [
        ['Gandhara', 34.0, 72.5, 'in'], ['Kamboja', 35.3, 70.3, 'in'], ['Kuru', 29.2, 77.0, 'in'], ['Matsya', 27.1, 76.0, 'in'],
        ['Surasena', 27.6, 77.9, 'in'], ['Panchala', 28.3, 79.6, 'in'], ['Kosala', 27.6, 81.8, 'in'], ['Malla', 27.2, 84.3, 'in'],
        ['Vajji', 26.2, 86.0, 'in'], ['Kasi', 24.9, 83.1, 'in'], ['Vatsa', 25.7, 81.0, 'in'], ['Chedi', 24.4, 79.2, 'in'],
        ['Avanti', 23.2, 75.8, 'in'], ['Magadha', 24.3, 85.6, 'in'], ['Anga', 25.3, 87.6, 'in'], ['Asmaka', 19.3, 77.5, 'in'],
      ],
    },
  },
  {
    id: 'maurya', name: 'Maurya Empire', short: 'Maurya', start: -321, end: -185, span: '321–185 BCE',
    powers: 'Chandragupta, Bindusara and Ashoka, ruling from Pataliputra.',
    change: 'The first empire over most of the subcontinent, from Afghanistan to Karnataka. Ashoka’s rock and pillar edicts mark how far it reached.',
    dates: ['Chandragupta takes Magadha, c. 321 BCE', 'Kalinga war, c. 261 BCE', 'Last Maurya killed, 185 BCE'],
    lead: 'sanchi-stupa',
    map: {
      title: 'Ashoka’s empire, 250 BCE', certainty: 'Approximate. Drawn by eye after “Asoka’s Empire (250 B.C.)” in Davies’ atlas, which marks its own boundary as probable.',
      fills: [['maurya-250bce', 'a', 'Maurya Empire']],
      labels: [
        ['Maurya Empire', 23.6, 78.6, 'main'], ['Pataliputra', 25.61, 85.14, 'city'], ['Gandhara', 33.9, 72.2, 'in'], ['Kalinga', 20.2, 84.6, 'in'],
        ['Cholas', 11.8, 79.5, 'out'], ['Pandyas', 9.3, 78.1, 'out'], ['Keralaputra', 10.4, 75.5, 'out'], ['Satiyaputra', 13.0, 75.2, 'out'],
        ['Tamraparni', 7.8, 80.7, 'out'],
      ],
    },
  },
  {
    id: 'kushan', name: 'Kushans, Satraps and Satavahanas', short: 'Kushans & Satavahanas', start: -185, end: 320, span: 'c. 185 BCE–320 CE',
    powers: 'Shungas, Indo-Greeks and Sakas; the Kushans under Kanishka; the Satavahanas; Cholas, Cheras and Pandyas in the south.',
    change: 'The north-west passes to dynasties from Central Asia. The Deccan unites under the Satavahanas. Sea trade with Rome grows.',
    dates: ['Kanishka’s reign, c. 127–150 CE'],
    lead: 'ajanta-caves',
  },
  {
    id: 'gupta', name: 'Gupta Empire', short: 'Gupta', start: 320, end: 550, span: 'c. 320–550 CE',
    powers: 'Chandragupta I, Samudragupta and Chandragupta II; the Vakatakas in the Deccan.',
    change: 'The Ganga plain is one state again. Samudragupta campaigns down the east coast, the Western Satraps fall, and Huna invasions bring the empire down.',
    dates: ['Chandragupta I crowned, c. 320', 'Western Satraps conquered, c. 400', 'Aryabhata writes, 499'],
    lead: 'mahabodhi-temple',
    map: {
      title: 'The Gupta Empire, c. 400 CE', certainty: 'Approximate. Drawn by eye after “The Gupta Empire at the close of the fourth century” in Davies’ atlas (probable boundary under Chandragupta II).',
      fills: [['gupta-400', 'a', 'Gupta Empire']],
      labels: [
        ['Gupta Empire', 25.0, 79.6, 'main'], ['Pataliputra', 25.61, 85.14, 'city'], ['Ujjain', 23.18, 75.78, 'city'],
        ['Vakatakas', 20.2, 78.4, 'out'], ['Pallavas', 12.9, 79.4, 'out'], ['Kamarupa', 26.3, 91.8, 'out'], ['Kashmir', 34.2, 75.0, 'out'],
        ['Nepal', 28.0, 85.2, 'out'], ['Cholas', 11.6, 79.6, 'out'], ['Pandyas', 9.3, 78.1, 'out'], ['Cheras', 10.5, 75.7, 'out'], ['Simhala', 7.8, 80.7, 'out'],
      ],
    },
  },
  {
    id: 'regional', name: 'Regional kingdoms', short: 'Regional kingdoms', start: 550, end: 1206, span: 'c. 550–1206',
    powers: 'Harsha at Kannauj; Chalukyas, Pallavas, Rashtrakutas, Palas and Pratiharas; the Cholas under Rajaraja I and Rajendra I.',
    change: 'No single empire. Three powers contest Kannauj, the Cholas hold the south and Sri Lanka, and Ghaznavid and Ghurid armies enter from the north-west.',
    dates: ['Harsha’s reign, 606–647', 'Mahmud of Ghazni’s raids, 1000–1027', 'Second battle of Tarain, 1192'],
    lead: 'brihadeeswara-temple',
  },
  {
    id: 'sultanate', name: 'Delhi Sultanate', short: 'Delhi Sultanate', start: 1206, end: 1526, span: '1206–1526',
    powers: 'The Mamluk, Khalji, Tughlaq, Sayyid and Lodi dynasties.',
    change: 'Delhi’s rule spreads south to its widest under Muhammad bin Tughlaq, then breaks into Bengal, Gujarat, Malwa, the Bahmani kingdom and Vijayanagara.',
    dates: ['Vijayanagara founded, 1336', 'Timur sacks Delhi, 1398', 'First battle of Panipat, 1526'],
    lead: 'qutub-minar',
    map: {
      title: 'The Sultanate under Iltutmish, 1236', certainty: 'Approximate. Drawn by eye after “India in 1236” in Davies’ atlas.',
      fills: [['sultanate-1236', 'a', 'Sultanate of Delhi']],
      labels: [
        ['Sultanate of Delhi', 26.4, 81.8, 'main'], ['Delhi', 28.61, 77.21, 'city'], ['Yadavas', 19.9, 75.6, 'out'], ['Kakatiyas', 17.9, 79.6, 'out'],
        ['Hoysalas', 13.1, 76.2, 'out'], ['Cholas', 11.2, 79.2, 'out'], ['Pandyas', 9.5, 78.0, 'out'], ['Gujarat', 22.9, 72.0, 'out'],
        ['Orissa', 20.6, 85.2, 'out'], ['Kashmir', 34.2, 75.2, 'out'], ['Mongols', 33.6, 67.0, 'out'],
      ],
    },
  },
  {
    id: 'mughal', name: 'Mughals, the Deccan and Vijayanagara', short: 'Mughals', start: 1526, end: 1707, span: '1526–1707',
    powers: 'Babur, Akbar, Jahangir, Shah Jahan and Aurangzeb; the Deccan sultanates; Shivaji.',
    change: 'Akbar builds the empire province by province. Vijayanagara collapses, Aurangzeb takes Bijapur and Golconda, and the Marathas rise.',
    dates: ['First battle of Panipat, 1526', 'Battle of Talikota, 1565', 'Shivaji crowned, 1674', 'Death of Aurangzeb, 1707'],
    lead: 'taj-mahal',
    map: {
      title: 'The Mughal Empire at the death of Akbar, 1605', certainty: 'Approximate. Drawn by eye after “The Mughal Empire at the death of Akbar (1605)” in Davies’ atlas.',
      fills: [['mughal-1605', 'a', 'Mughal Empire']],
      labels: [
        ['Mughal Empire', 26.6, 77.6, 'main'], ['Agra', 27.18, 78.01, 'city'], ['Kabul', 34.53, 69.17, 'city'], ['Bengal', 24.0, 89.2, 'in'],
        ['Gujarat', 22.7, 72.2, 'in'], ['Gondwana', 21.4, 81.6, 'out'], ['Ahmadnagar', 18.8, 75.2, 'out'], ['Bijapur', 16.6, 75.8, 'out'],
        ['Golconda', 17.1, 79.1, 'out'], ['Polygars', 10.6, 78.2, 'out'], ['Goa (Portuguese)', 15.3, 73.3, 'out'],
      ],
    },
  },
  {
    id: 'company', name: 'Marathas and the East India Company', short: 'Marathas & Company', start: 1707, end: 1858, span: '1707–1857',
    powers: 'The Maratha Peshwas, the Nizam, Mysore under Haidar Ali and Tipu Sultan, Ranjit Singh, and the East India Company.',
    change: 'Mughal power shrinks to Delhi. The Company grows from Bengal to the whole subcontinent through war, treaty and annexation.',
    dates: ['Battle of Plassey, 1757', 'Third battle of Panipat, 1761', 'Fall of Mysore, 1799', 'Punjab annexed, 1849', 'Revolt of 1857'],
    lead: 'trimbakeshwar-temple',
  },
  {
    id: 'crown', name: 'British Crown rule', short: 'Crown rule', start: 1858, end: 1947, span: '1858–1947',
    powers: 'Viceroys and about 565 princely states; the Indian National Congress and the Muslim League.',
    change: 'Borders are mostly fixed, with British provinces and princely states side by side, while the freedom movement grows.',
    dates: ['Congress founded, 1885', 'Capital moved to Delhi, 1911', 'Salt March, 1930', 'Quit India, 1942'],
    lead: 'csmt',
    map: {
      title: 'British India and the princely states, 1939', certainty: 'Outer boundary only, from the modern borders of India, Pakistan and Bangladesh. Provinces and princely states are not drawn.',
      fills: [['british-india-1939', 'a', 'British India and the princely states']],
      labels: [
        ['British India and the princely states', 23.2, 79.0, 'main'], ['New Delhi', 28.61, 77.21, 'city'], ['Nepal', 28.2, 84.2, 'out'], ['Bhutan', 27.45, 90.5, 'out'],
        ['Burma', 21.5, 96.2, 'out'], ['Ceylon', 7.8, 80.7, 'out'], ['Afghanistan', 33.6, 66.0, 'out'], ['Tibet', 31.5, 87.0, 'out'],
      ],
    },
  },
  {
    id: 'partition', name: 'Independence and Partition', short: 'Independence', start: 1947, end: 1950, span: '1947–1950',
    powers: 'Nehru, Patel, Jinnah and Mountbatten.',
    change: 'British India is divided into India and Pakistan along the Radcliffe Line, and the princely states join one or the other.',
    dates: ['Independence, 15 August 1947', 'Hyderabad joins India, 1948', 'Constitution in force, 26 January 1950'],
    lead: 'red-fort',
    map: {
      title: 'The Indian Union and Pakistan, 1947', certainty: 'Modern boundaries as India draws them (Natural Earth), not the lines of 1947: princely states were still joining.',
      fills: [['india', 'a', 'India'], ['pakistan', 'b', 'Pakistan'], ['bangladesh', 'b', 'East Pakistan']],
      labels: [
        ['India', 22.6, 79.0, 'main'], ['West Pakistan', 29.3, 68.3, 'main'], ['East Pakistan', 24.3, 90.2, 'in'], ['New Delhi', 28.61, 77.21, 'city'],
        ['Karachi', 24.86, 67.01, 'city'], ['Nepal', 28.2, 84.2, 'out'], ['Bhutan', 27.45, 90.5, 'out'], ['Burma', 21.5, 96.2, 'out'], ['Ceylon', 7.8, 80.7, 'out'],
      ],
    },
  },
  {
    id: 'republic', name: 'Republic of India', short: 'Republic', start: 1950, end: new Date().getFullYear(), span: '1950–today',
    powers: 'Elected governments under the Constitution.',
    change: 'States are redrawn on language lines, Goa and Sikkim join, and new states are carved out of old ones.',
    dates: ['States Reorganisation Act, 1956', 'Goa joins, 1961', 'Bangladesh independent, 1971', 'Telangana formed, 2014', 'Ladakh a union territory, 2019'],
    lead: 'capitol-complex',
    map: {
      title: 'India and its neighbours today', certainty: 'Modern boundaries as India draws them (Natural Earth). State borders are not drawn.',
      fills: [['india', 'a', 'India'], ['pakistan', 'b', 'Pakistan'], ['bangladesh', 'c', 'Bangladesh']],
      labels: [
        ['India', 22.6, 79.0, 'main'], ['Pakistan', 29.3, 68.3, 'main'], ['Bangladesh', 24.3, 90.2, 'in'], ['New Delhi', 28.61, 77.21, 'city'],
        ['Nepal', 28.2, 84.2, 'out'], ['Bhutan', 27.45, 90.5, 'out'], ['Myanmar', 21.5, 96.2, 'out'], ['Sri Lanka', 7.8, 80.7, 'out'],
      ],
    },
  },
];

export const formatYear = (y) => (y < 0 ? `${-y} BCE` : y < 1000 ? `${y} CE` : `${y}`);
