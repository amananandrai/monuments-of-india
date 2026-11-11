# Monuments of India

**Live site: https://monuments-of-india-nu.vercel.app**

101 Indian landmarks across 26 states and union territories, modelled in interactive 3D with
[three.js](https://threejs.org/). Every model is built in code at roughly real-world proportions,
from simple shapes, carved detail and sculpted figures: there are no model files or scans to
download.

## Using the site

- **Map:** the site opens on a map of India with a pin for every monument, coloured by kind
  (temples and shrines, forts and palaces, tombs and memorials, civic and engineering). Numbered pins
  group monuments that sit close together and zoom in when selected.
- **List and search:** the sidebar lists every monument by state, with a search box. On a phone it
  becomes a strip you swipe along under the model.
- **Filters:** chips under the search box narrow the list and the map's pins by architectural style
  and by main material; the two combine, with the search too. Every monument belongs to at least
  one group of each, and some to more than one (Amber Fort is Rajput and Indo-Islamic; the Taj
  Mahal is marble and sandstone). Hover over a chip to see how many monuments it holds. The groups
  are defined in `js/filters.js`:
  - **Style:** Dravidian & Vesara, Nagara (with its regional forms: Chandela, Kalinga, Bhumija,
    Maru-Gurjara and Jain), Buddhist, Indo-Islamic, Rajput, Indo-Saracenic, Colonial & European,
    Modern, and Regional & mixed (Sikh, the Himalayan pagoda, Keladi, Gommateshwara and the
    buildings that mix traditions).
  - **Material:** sandstone, marble, granite, basalt, laterite, brick & lime, other stone
    (khondalite, soapstone, limestone and local stone), timber, and steel & concrete.
- **3D view:** drag to orbit, scroll or pinch to zoom, and use ← → to move between monuments. The
  plaque gives the place, dates, style and a few facts; on a phone it folds into a bar under the model.
- **Day and night:** the scene follows your device's dark mode until you press the Night button, then
  remembers your choice. At night, floodlights and festival lights come on and stars fill the sky.
- **Links:** open any monument directly with its hash, for example
  [`#taj-mahal`](https://monuments-of-india-nu.vercel.app/#taj-mahal).

## States and monuments

Each entry gives the place, the dates, the architectural style and the main material, as shown on
the monument's plaque and used by the filters (all from `js/data.js`).

### Andaman and Nicobar (1)

- **Cellular Jail**, Port Blair, Andaman Islands · 1896–1906 · Colonial prison · Brick · [view](https://monuments-of-india-nu.vercel.app/#cellular-jail)

### Andhra Pradesh (2)

- **Mallikarjuna Temple**, Srisailam, Andhra Pradesh · Expanded 14th–16th c. · Dravidian · Stone · [view](https://monuments-of-india-nu.vercel.app/#mallikarjuna-temple)
- **Tirumala Venkateswara Temple**, Tirumala, Andhra Pradesh · Expanded 9th–16th c. · Dravidian · Granite with gilded copper · [view](https://monuments-of-india-nu.vercel.app/#tirumala-venkateswara-temple)

### Arunachal Pradesh (1)

- **Tawang Monastery**, Tawang, Arunachal Pradesh · 1680–1681 · Tibetan Buddhist · Stone, timber and lime · [view](https://monuments-of-india-nu.vercel.app/#tawang-monastery)

### Assam (1)

- **Kamakhya Temple**, Nilachal Hill, Guwahati · Rebuilt 1565 · Nilachal · Stone · [view](https://monuments-of-india-nu.vercel.app/#kamakhya-temple)

### Bihar (3)

- **Mahabodhi Temple**, Bodh Gaya, Bihar · 5th–6th c. CE · Gupta-era brick · Brick with stucco · [view](https://monuments-of-india-nu.vercel.app/#mahabodhi-temple)
- **Nalanda Mahavihara**, Nalanda, Bihar · 5th–12th c. · Gupta and Pala brick · Brick · [view](https://monuments-of-india-nu.vercel.app/#nalanda-mahavihara)
- **Sher Shah Suri’s Tomb**, Sasaram, Bihar · 1540–1545 · Indo-Afghan (Sur) · Red sandstone · [view](https://monuments-of-india-nu.vercel.app/#sher-shah-suri-tomb)

### Chandigarh (1)

- **Capitol Complex, Chandigarh**, Sector 1, Chandigarh · 1951–1965 · Modernist · Raw concrete · [view](https://monuments-of-india-nu.vercel.app/#capitol-complex)

### Delhi (12)

- **Humayun’s Tomb**, Nizamuddin, New Delhi · 1565–1572 · Mughal · Red sandstone and white marble · [view](https://monuments-of-india-nu.vercel.app/#humayuns-tomb)
- **India Gate**, Kartavya Path, New Delhi · 1921–1931 · Memorial arch · Red and buff Bharatpur sandstone · [view](https://monuments-of-india-nu.vercel.app/#india-gate)
- **Jama Masjid**, Chandni Chowk, Old Delhi · 1650–1656 · Mughal · Red sandstone and white marble · [view](https://monuments-of-india-nu.vercel.app/#jama-masjid)
- **Lotus Temple**, Kalkaji, New Delhi · 1980–1986 · Expressionist · Greek Pentelic marble on concrete · [view](https://monuments-of-india-nu.vercel.app/#lotus-temple)
- **National War Memorial**, Kartavya Path, New Delhi · 2019 · Modern memorial · Granite · [view](https://monuments-of-india-nu.vercel.app/#national-war-memorial)
- **New Parliament House**, Sansad Marg, New Delhi · 2020–2023 · Contemporary · Red and buff sandstone · [view](https://monuments-of-india-nu.vercel.app/#new-parliament-house)
- **Old Parliament House**, Sansad Marg, New Delhi · 1921–1927 · Lutyens’ Delhi · Red and buff sandstone · [view](https://monuments-of-india-nu.vercel.app/#old-parliament-house)
- **Qutub Minar**, Mehrauli, Delhi · 1199–1220 · Indo-Islamic · Red sandstone and marble · [view](https://monuments-of-india-nu.vercel.app/#qutub-minar)
- **Rashtrapati Bhavan**, Raisina Hill, New Delhi · 1912–1929 · Lutyens’ Delhi · Cream and red Dholpur sandstone · [view](https://monuments-of-india-nu.vercel.app/#rashtrapati-bhavan)
- **Red Fort**, Old Delhi · 1639–1648 · Mughal · Red sandstone · [view](https://monuments-of-india-nu.vercel.app/#red-fort)
- **Safdarjung’s Tomb**, Lodhi Road, New Delhi · 1754 · Late Mughal · Red and buff sandstone, marble · [view](https://monuments-of-india-nu.vercel.app/#safdarjung-tomb)
- **Swaminarayan Akshardham**, New Delhi · 2000–2005 · Maru-Gurjara · Pink sandstone and Italian marble · [view](https://monuments-of-india-nu.vercel.app/#akshardham)

### Goa (2)

- **Basilica of Bom Jesus**, Old Goa, Goa · 1594–1605 · Baroque · Laterite and basalt · [view](https://monuments-of-india-nu.vercel.app/#basilica-of-bom-jesus)
- **Fort Aguada**, Candolim, Goa · 1612 · Portuguese · Laterite · [view](https://monuments-of-india-nu.vercel.app/#fort-aguada)

### Gujarat (7)

- **Kirti Mandir**, Porbandar, Gujarat · 1947–1950 · Mixed · Stone · [view](https://monuments-of-india-nu.vercel.app/#kirti-mandir)
- **Laxmi Vilas Palace**, Vadodara, Gujarat · 1878–1890 · Indo-Saracenic · Sandstone and marble · [view](https://monuments-of-india-nu.vercel.app/#laxmi-vilas-palace)
- **Nageshwar Temple**, Dwarka, Gujarat · Rebuilt 1990s · Nagara · Pink stone · [view](https://monuments-of-india-nu.vercel.app/#nageshwar-temple)
- **Palitana Temples**, Shatrunjaya hill, Gujarat · 11th–20th c. · Maru-Gurjara · Marble · [view](https://monuments-of-india-nu.vercel.app/#palitana-temples)
- **Rani ki Vav**, Patan, Gujarat · 11th century · Maru-Gurjara · Sandstone · [view](https://monuments-of-india-nu.vercel.app/#rani-ki-vav)
- **Somnath Temple**, Prabhas Patan, Gujarat · Rebuilt 1951 · Maru-Gurjara (Chalukya) · Sandstone · [view](https://monuments-of-india-nu.vercel.app/#somnath-temple)
- **Statue of Unity**, Ekta Nagar, Gujarat · 2013–2018 · Monumental statue · Bronze cladding over steel and concrete · [view](https://monuments-of-india-nu.vercel.app/#statue-of-unity)

### Himachal Pradesh (2)

- **Hidimba Devi Temple**, Manali, Himachal Pradesh · 1553 · Himalayan pagoda · Stone and deodar wood · [view](https://monuments-of-india-nu.vercel.app/#hidimba-devi-temple)
- **Key Monastery**, Spiti Valley, Himachal Pradesh · Founded c. 11th c. · Tibetan Buddhist · Stone and mud brick · [view](https://monuments-of-india-nu.vercel.app/#key-monastery)

### Jammu and Kashmir (1)

- **Hazratbal Shrine**, Srinagar, Jammu and Kashmir · 1968–1979 · Mughal-inspired · White marble · [view](https://monuments-of-india-nu.vercel.app/#hazratbal-shrine)

### Jharkhand (2)

- **Baidyanath Temple**, Deoghar, Jharkhand · 16th c. (present form) · Nagara · Stone and lime plaster · [view](https://monuments-of-india-nu.vercel.app/#baidyanath-temple)
- **Shikharji**, Parasnath Hill, Jharkhand · 18th c. onward · Jain · Marble and stone · [view](https://monuments-of-india-nu.vercel.app/#shikharji)

### Karnataka (6)

- **Chennakesava Temple**, Somanathapura, Karnataka · 1258 · Hoysala · Soapstone · [view](https://monuments-of-india-nu.vercel.app/#chennakesava-temple)
- **Gol Gumbaz**, Vijayapura, Karnataka · 1626–1656 · Deccan (Adil Shahi) · Dark basalt with lime plaster · [view](https://monuments-of-india-nu.vercel.app/#gol-gumbaz)
- **Gommateshwara Statue**, Shravanabelagola, Karnataka · c. 983 CE · Monolithic statue · Granite · [view](https://monuments-of-india-nu.vercel.app/#gommateshwara)
- **Mysore Palace**, Mysuru, Karnataka · 1897–1912 · Indo-Saracenic · Grey granite with pink marble domes · [view](https://monuments-of-india-nu.vercel.app/#mysore-palace)
- **Tipu Sultan’s Gumbaz**, Srirangapatna, Karnataka · 1782–1784 · Indo-Islamic · Lime plaster and granite · [view](https://monuments-of-india-nu.vercel.app/#tipu-sultan-gumbaz)
- **Vittala Temple, Hampi**, Hampi, Karnataka · 15th–16th c. · Vijayanagara · Granite · [view](https://monuments-of-india-nu.vercel.app/#vittala-temple-hampi)

### Kerala (2)

- **Bekal Fort**, Kasaragod, Kerala · c. 1650 · Keladi · Laterite · [view](https://monuments-of-india-nu.vercel.app/#bekal-fort)
- **Padmanabhaswamy Temple**, Thiruvananthapuram, Kerala · 16th–18th c. · Dravidian and Kerala · Granite · [view](https://monuments-of-india-nu.vercel.app/#padmanabhaswamy-temple)

### Ladakh (2)

- **Kargil War Memorial**, Dras, Ladakh · Opened 2004 · Modern memorial · Pink sandstone · [view](https://monuments-of-india-nu.vercel.app/#kargil-war-memorial)
- **Thiksey Monastery**, Near Leh, Ladakh · 15th century · Tibetan Buddhist (Gelug) · Stone, mud brick and timber · [view](https://monuments-of-india-nu.vercel.app/#thiksey-monastery)

### Madhya Pradesh (6)

- **Gwalior Fort**, Gwalior, Madhya Pradesh · 8th–16th c. · Rajput (Tomar) · Sandstone with glazed tiles · [view](https://monuments-of-india-nu.vercel.app/#gwalior-fort)
- **Kandariya Mahadeva Temple**, Khajuraho, Madhya Pradesh · c. 1030 CE · Nagara (Chandela) · Sandstone · [view](https://monuments-of-india-nu.vercel.app/#kandariya-mahadeva)
- **Mahakaleshwar Temple**, Ujjain, Madhya Pradesh · Rebuilt 18th c. · Bhumija and Maratha · Stone · [view](https://monuments-of-india-nu.vercel.app/#mahakaleshwar-temple)
- **Omkareshwar Temple**, Mandhata island, Madhya Pradesh · Rebuilt 18th c. · Nagara · Stone · [view](https://monuments-of-india-nu.vercel.app/#omkareshwar-temple)
- **Parshvanath Temple, Khajuraho**, Khajuraho, Madhya Pradesh · c. 950–970 CE · Nagara (Chandela) · Sandstone · [view](https://monuments-of-india-nu.vercel.app/#parshvanath-temple-khajuraho)
- **Sanchi Stupa**, Sanchi, Madhya Pradesh · 3rd c. BCE · Buddhist (Mauryan) · Sandstone · [view](https://monuments-of-india-nu.vercel.app/#sanchi-stupa)

### Maharashtra (10)

- **Ajanta Caves**, Ajanta, Maharashtra · 2nd c. BCE–c. 480 CE · Rock-cut Buddhist · Basalt · [view](https://monuments-of-india-nu.vercel.app/#ajanta-caves)
- **Bandra–Worli Sea Link**, Mumbai, Maharashtra · 2000–2009 · Cable-stayed bridge · Steel and concrete · [view](https://monuments-of-india-nu.vercel.app/#bandra-worli-sea-link)
- **Bhimashankar Temple**, Sahyadri hills, Maharashtra · 13th–18th c. · Nagara · Black basalt · [view](https://monuments-of-india-nu.vercel.app/#bhimashankar-temple)
- **Bibi Ka Maqbara**, Chhatrapati Sambhajinagar, Maharashtra · 1660s · Mughal · Marble, basalt and lime plaster · [view](https://monuments-of-india-nu.vercel.app/#bibi-ka-maqbara)
- **Chhatrapati Shivaji Maharaj Terminus**, Fort, Mumbai · 1878–1888 · Victorian Gothic · Sandstone and limestone · [view](https://monuments-of-india-nu.vercel.app/#csmt)
- **Daulatabad Fort**, Near Chhatrapati Sambhajinagar, Maharashtra · 12th–15th c. · Deccan · Stone · [view](https://monuments-of-india-nu.vercel.app/#daulatabad-fort)
- **Gateway of India**, Apollo Bunder, Mumbai · 1913–1924 · Indo-Saracenic · Yellow basalt and concrete · [view](https://monuments-of-india-nu.vercel.app/#gateway-of-india)
- **Grishneshwar Temple**, Verul, near Ellora · 18th century · Nagara (Maratha) · Red basalt · [view](https://monuments-of-india-nu.vercel.app/#grishneshwar-temple)
- **Kailasa Temple, Ellora**, Ellora, Maharashtra · 8th century · Dravidian (Rashtrakuta) · Basalt, carved from one rock · [view](https://monuments-of-india-nu.vercel.app/#kailasa-temple)
- **Trimbakeshwar Temple**, Trimbak, Nashik · 1755–1786 · Nagara · Black basalt · [view](https://monuments-of-india-nu.vercel.app/#trimbakeshwar-temple)

### Odisha (2)

- **Jagannath Puri Temple**, Puri, Odisha · 12th century · Kalinga · Khondalite stone · [view](https://monuments-of-india-nu.vercel.app/#jagannath-puri-temple)
- **Konark Sun Temple**, Konark, Odisha · c. 1250 CE · Kalinga · Khondalite stone · [view](https://monuments-of-india-nu.vercel.app/#konark-sun-temple)

### Punjab (2)

- **Golden Temple**, Amritsar, Punjab · 1581–1604 · Sikh · Marble and gilded copper · [view](https://monuments-of-india-nu.vercel.app/#golden-temple)
- **Jallianwala Bagh**, Amritsar, Punjab · Memorial 1961 · Modern memorial · Red sandstone · [view](https://monuments-of-india-nu.vercel.app/#jallianwala-bagh)

### Rajasthan (9)

- **Amber Fort**, Amer, Jaipur · 16th–18th c. · Rajput and Mughal · Sandstone and marble · [view](https://monuments-of-india-nu.vercel.app/#amber-fort)
- **Chittorgarh Fort**, Chittorgarh, Rajasthan · 7th–16th c. · Rajput · Stone · [view](https://monuments-of-india-nu.vercel.app/#chittorgarh-fort)
- **City Palace, Udaipur**, Udaipur, Rajasthan · From 1559 · Rajput · Granite and marble · [view](https://monuments-of-india-nu.vercel.app/#city-palace-udaipur)
- **Dilwara Temples**, Mount Abu, Rajasthan · 11th–13th c. · Jain (Maru-Gurjara) · White marble · [view](https://monuments-of-india-nu.vercel.app/#dilwara-temples)
- **Hawa Mahal**, Jaipur, Rajasthan · 1799 · Rajput · Red and pink sandstone · [view](https://monuments-of-india-nu.vercel.app/#hawa-mahal)
- **Jaisalmer Fort**, Jaisalmer, Rajasthan · From 1156 · Rajput · Yellow sandstone · [view](https://monuments-of-india-nu.vercel.app/#jaisalmer-fort)
- **Mehrangarh Fort**, Jodhpur, Rajasthan · From 1459 · Rajput · Red sandstone · [view](https://monuments-of-india-nu.vercel.app/#mehrangarh-fort)
- **Ranakpur Jain Temple**, Ranakpur, Rajasthan · 15th century · Jain (Maru-Gurjara) · Light marble · [view](https://monuments-of-india-nu.vercel.app/#ranakpur-jain-temple)
- **Soniji Ki Nasiyan**, Ajmer, Rajasthan · 1864–1895 · Jain · Red sandstone and gilded wood · [view](https://monuments-of-india-nu.vercel.app/#soniji-ki-nasiyan)

### Sikkim (1)

- **Rumtek Monastery**, Near Gangtok, Sikkim · 1960s · Tibetan Buddhist · Stone, timber and gilt · [view](https://monuments-of-india-nu.vercel.app/#rumtek-monastery)

### Tamil Nadu (5)

- **Brihadeeswara Temple**, Thanjavur, Tamil Nadu · 1003–1010 CE · Dravidian (Chola) · Granite · [view](https://monuments-of-india-nu.vercel.app/#brihadeeswara-temple)
- **Meenakshi Temple**, Madurai, Tamil Nadu · 16th–17th c. · Dravidian (Nayak) · Granite and painted stucco · [view](https://monuments-of-india-nu.vercel.app/#meenakshi-temple)
- **Ramanathaswamy Temple**, Rameswaram, Tamil Nadu · 12th–17th c. · Dravidian · Granite · [view](https://monuments-of-india-nu.vercel.app/#ramanathaswamy-temple)
- **Shore Temple**, Mahabalipuram, Tamil Nadu · c. 700–728 CE · Dravidian (Pallava) · Granite · [view](https://monuments-of-india-nu.vercel.app/#shore-temple)
- **Vivekananda Rock Memorial**, Kanyakumari, Tamil Nadu · 1970 · Mixed Indian temple styles · Stone · [view](https://monuments-of-india-nu.vercel.app/#vivekananda-rock-memorial)

### Telangana (4)

- **Charminar**, Hyderabad, Telangana · 1591 · Qutb Shahi · Granite, limestone and lime mortar · [view](https://monuments-of-india-nu.vercel.app/#charminar)
- **Golconda Fort**, Hyderabad, Telangana · 13th–17th c. · Deccan · Granite · [view](https://monuments-of-india-nu.vercel.app/#golconda-fort)
- **Qutb Shahi Tombs**, Hyderabad, Telangana · 16th–17th c. · Qutb Shahi · Granite and lime plaster · [view](https://monuments-of-india-nu.vercel.app/#qutb-shahi-tombs)
- **Ramappa Temple**, Palampet, Telangana · 1213 CE · Kakatiya · Sandstone, dolerite and light brick · [view](https://monuments-of-india-nu.vercel.app/#ramappa-temple)

### Uttar Pradesh (12)

- **Agra Fort**, Agra, Uttar Pradesh · 1565–1573 · Mughal · Red sandstone and white marble · [view](https://monuments-of-india-nu.vercel.app/#agra-fort)
- **Akbar’s Tomb**, Sikandra, Agra · 1605–1613 · Mughal · Red sandstone and white marble · [view](https://monuments-of-india-nu.vercel.app/#akbars-tomb)
- **Bara Imambara**, Lucknow, Uttar Pradesh · 1784–1791 · Nawabi (Awadhi) · Lakhauri brick and lime plaster · [view](https://monuments-of-india-nu.vercel.app/#bara-imambara)
- **Buland Darwaza**, Fatehpur Sikri, Uttar Pradesh · c. 1575–1601 · Mughal · Red sandstone and white marble · [view](https://monuments-of-india-nu.vercel.app/#buland-darwaza)
- **Chota Imambara**, Lucknow, Uttar Pradesh · 1837–1838 · Nawabi (Awadhi) · Brick and lime plaster · [view](https://monuments-of-india-nu.vercel.app/#chota-imambara)
- **Dhamek Stupa**, Sarnath, Uttar Pradesh · c. 500 CE · Gupta · Stone and brick · [view](https://monuments-of-india-nu.vercel.app/#dhamek-stupa)
- **Itmad-ud-Daulah’s Tomb**, Agra, Uttar Pradesh · 1622–1628 · Mughal · White marble with pietra dura · [view](https://monuments-of-india-nu.vercel.app/#itmad-ud-daulah)
- **Kashi Vishwanath Temple**, Varanasi, Uttar Pradesh · 1780 · Nagara · Stone with gold plating · [view](https://monuments-of-india-nu.vercel.app/#kashi-vishwanath-temple)
- **Panch Mahal**, Fatehpur Sikri, Uttar Pradesh · 1570s · Mughal · Red sandstone · [view](https://monuments-of-india-nu.vercel.app/#panch-mahal)
- **Ram Mandir**, Ayodhya, Uttar Pradesh · 2020–2024 · Nagara · Pink Bansi Paharpur sandstone · [view](https://monuments-of-india-nu.vercel.app/#ram-mandir)
- **Rumi Darwaza**, Lucknow, Uttar Pradesh · 1784 · Nawabi (Awadhi) · Brick and lime plaster · [view](https://monuments-of-india-nu.vercel.app/#rumi-darwaza)
- **Taj Mahal**, Agra, Uttar Pradesh · 1632–1653 · Mughal · White Makrana marble · [view](https://monuments-of-india-nu.vercel.app/#taj-mahal)

### Uttarakhand (1)

- **Kedarnath Temple**, Kedarnath, Uttarakhand · 8th c. (by tradition) · Himalayan Nagara · Grey stone slabs · [view](https://monuments-of-india-nu.vercel.app/#kedarnath-temple)

### West Bengal (4)

- **Cooch Behar Palace**, Cooch Behar, West Bengal · 1887 · Italian Renaissance · Brick · [view](https://monuments-of-india-nu.vercel.app/#cooch-behar-palace)
- **Howrah Bridge**, Kolkata, West Bengal · 1936–1943 · Cantilever truss · Riveted high-tensile steel · [view](https://monuments-of-india-nu.vercel.app/#howrah-bridge)
- **Shaheed Minar**, Maidan, Kolkata · 1828 · Mixed (Egyptian, Syrian, Turkish) · Stone · [view](https://monuments-of-india-nu.vercel.app/#shaheed-minar)
- **Victoria Memorial**, Maidan, Kolkata · 1906–1921 · Indo-Saracenic · White Makrana marble · [view](https://monuments-of-india-nu.vercel.app/#victoria-memorial)

## How it's drawn

- **Stone, brick and earth:** surfaces are generated in the shader from world position
  (`js/surface.js`): masonry with block joints, marble veining, brick courses, rock, earth, carved
  friezes, incised names, pierced jali screens and glazed tiles, each with bump, weathering and a
  slight per-piece tint. Most stones also carry CC0 photo detail, projected triplanar and tinted to
  each model's own colour, with the photo's normal and roughness maps on desktops, so the stone
  catches the light as a rough surface (`js/textures.js`). Each set of maps is fetched the first
  time a monument that uses it is opened.
- **Landscape:** a sky with haze, distant hills, the sun and drifting clouds, and land that runs out to
  the horizon. Each monument's lawns and pavements fade into the land at their open edges, and seas
  and long rivers carry on to the horizon (`js/landscape.js`). Where a site's outer ground is
  natural (a lawn, a meadow, a forested or rocky hill), the open land round it takes that colour
  (`siteLand`), so a green site does not end on a sandy plain; paved and sandy sites keep the sandy
  land.
- **Water:** seas, rivers, lakes and pools have their own colours and moving ripples, and on desktop
  they reflect the monument.
- **Nature and figures:** rocks, hills, mountains and trees are sculpted with noise
  (`js/naturalize.js`). The statues and temple animals are each sculpted as one continuous skin
  from a signed distance field and meshed in the browser (`js/sdf.js`, `js/details/animals.js`,
  `js/details/figures.js`), so limbs grow out of bodies as in a carving. Examples are Patel in his
  dhoti and shawl, the Nageshwar Shiva, Bahubali, Thiruvalluvar, the Nandis, elephants, Konark's
  horses, temple lions and door guardians. Their crevices are darkened, dark stone is polished,
  and faces and hands are sculpted. The 25 m Shiva at Nageshwar is the most detailed: matted
  locks with the crescent moon and the Ganga, the third eye, rudraksha malas, the serpent Vasuki
  round the neck, a tiger-skin cloth, and the trishul with its damaru
  (`js/details/nageshwar-temple.js`).
- **Fine detail:** every monument carries a second layer of architectural detail from
  `js/details/`. India Gate, Charminar, the Taj Mahal, the Gateway of India and the Old Parliament
  House have the most: roundels and lettering, nested arches and half-domes, bracketed balconies,
  jalis, eaves, merlons, lotus-petal domes and finials. The rest have the carving of their own
  tradition: base mouldings, image niches and amalakas on the temples, banded and slit bastions and
  jharokhas on the forts, stacked iwans and inlaid stars on the Mughal tombs, capitals, balustrades
  and eaves on the colonial buildings, and the Dharma wheel and victory banners on the monasteries.
  Sculpture is modelled rather than blocked in: carved figures and elephants in the temple friezes
  and on the gopurams, kutas and shalas on the vimanas, yali pillars at Hampi, and Corinthian
  orders and statues on the colonial buildings (`js/details/sculpture.js`). The parts are shared
  (`js/details/components.js`, `forts.js`, `temples.js`, `tibetan.js`, `sculpture.js`) and merged
  or instanced into a few meshes per monument.
- **Entrances:** the Nagara temples, Ram Mandir's halls and the South Indian gopurams have
  doorways with depth from `js/details/doorways.js`. They have stepped frames, timber doors
  standing open onto a lamp-lit sanctum, thresholds, guardians, porches and steps, and real
  passages through the gopurams. The Mughal, Nawabi, Qutb Shahi and Deccan buildings have iwans
  with half-domes and doors, and arcades of real arched cells, from `js/details/mughal.js`. The
  forts' gates are passages through their gatehouses, with guard niches and doors spiked against
  elephants, from `js/details/forts.js`. The other temples have their own porches and doorways,
  gates on post-and-lintel lines (one with its two lions), and the monasteries have painted
  Tibetan doors and pillared porticoes. The colonial, Gothic Revival, Baroque and Indo-Saracenic
  buildings have their doors from `js/details/colonial.js`: porches of paired columns, arched doors
  with fanlights, a Gothic portal with a crocketed gable, a Baroque portal, sash and two-light
  windows in stone surrounds, and arcades with real depth.
- **Setting:** every monument has its own file in `js/details/` (named after it, as in
  `js/details/taj-mahal.js`) that adds what stands round it, built from a shared kit
  (`js/details/realism.js`):
  - the trees and shrubs of its region: neem, banyan, mango, ashoka, coconut palms, deodars and
    cypress avenues. Where a monument has triangles to spare, `upgradeTrees` replants them as
    fuller trees: limbs with separate leaf clumps, palms with leafleted fronds, deodars in
    drooping tiers;
  - flags and garlands: the tricolour (a rippling cloth with the Ashoka Chakra), the Nishan Sahibs,
    saffron temple pennants, Tibetan prayer flags and marigold strings;
  - heritage lamp posts (lit at night), fountains and the blue boards of the Archaeological Survey
    of India;
  - boats, shikaras and houseboats on the water, and stalls outside the temple gates;
  - animals: temple elephants, the deer at Sarnath and Sikandra, yaks, camels and ponies.

  There are no people or motor vehicles, so the monument itself stays the subject. Everything is
  instanced, so a garden of fifty trees costs a few draw calls.
- **Budget:** each monument stays under 650,000 triangles on desktops and 300,000 on phones
  (`js/detail.js`). Repeated parts are instanced, carved parts are merged by material, and a
  monument is built only when first opened, then cached.
- **Loading:** the map needs only the list of monuments (`js/data.js`); each monument's code is
  fetched when it is first opened, and that of its neighbours in the list (and of whatever the
  pointer rests on) just before. Monuments of very many parts (`batch: true`: Howrah Bridge,
  Meenakshi, the Red Fort, the Golden Temple, Ram Mandir) have them merged into a few draw calls once built
  (`js/batch.js`). On larger screens the slowest sculpted figures are meshed while the map sits
  idle (`js/warmup.js`). Shadows are drawn once per monument, not every frame.
- **No flicker:** faces that share a plane get depth offsets (`js/coplanar.js`: `separateCoplanar`,
  and `separateMerged` for faces within one merged mesh), and curved walls and cliffs are built as
  single continuous bands, so surfaces don't shimmer as the camera moves.
- **Camera:** the home view frames the monument as built (`js/framing.js`), not the lawns, plazas
  and water round it, and the zoom-out stops short of the hills and forests round a monument, so
  the camera never enters them. Fifteen monuments open on the view of their best-known photograph,
  set by `view`, `zoom` and `target` in their builders: the Taj Mahal down its garden, the Red
  Fort's Lahori Gate, Meenakshi's south gopuram, Hawa Mahal's street front and others.
- **Atmosphere:** a haze in the sky's horizon colour thickens with distance, so far hills fade as
  they do in a photograph, and each builder may set its own sun.
- **Heights:** 33 monuments carry their real height, with its source where known, in `refs` in
  `js/data.js`, and the models are checked against it (see Checks below).
- **Desktops:** antialiasing (SMAA), a 4096 shadow map, a gentle warm colour grade, grass tufts and
  stones scattered over open lawns, fuller trees where a monument has triangles to spare, and
  extra carving on the richest monuments (Laxmi Vilas Palace's multifoil arches, chhajjas,
  jharokhas and rooftop chhatris among them).
- **Phones and small screens:** below 760 px wide, ambient occlusion and reflections are skipped to
  keep the frame rate up. Phones also build the models at a lower detail level: plain trees, no
  ground scatter, and lighter carving and statues on the heaviest monuments (`js/detail.js`;
  `?detail=high` or `?detail=low` in the address to choose).

## Checks

`tools/` holds headless checks that build every model in Chromium as the site does: triangle
budgets, flicker, heights against `refs`, the filter groups, and renders of the home views. See
[`tools/README.md`](tools/README.md).

## Video

`video/` holds a [HyperFrames](https://hyperframes.heygen.com) project that renders all 101
monuments, five seconds each, as an 8 min 25 s film at 1920×1080, using the site's own models. See
[`video/README.md`](video/README.md) to render it.

## Run locally

It's a static site with no build step: `index.html`, `css/style.css` and ES modules in `js/`, one file
per monument in `js/monuments/` and one for its setting and finer detail in `js/details/`, with
three.js 0.160 loaded from a CDN. Serve the folder with any static server:

```bash
npx serve .
```

## Deploy

Hosted on Vercel at https://monuments-of-india-nu.vercel.app as a static site. Every push to `main`
deploys to production.

## Credits

- **Photo textures** in `assets/textures` are from [Poly Haven](https://polyhaven.com) (CC0):
  marble_01, red_sandstone_wall, sandstone_blocks_08, plastered_stone_wall, plastered_wall_02,
  granite_wall, rock_face_03, coral_fort_wall_03, stone_brick_wall_001, rough_block_wall,
  concrete_wall_008 and weathered_brown_planks. `tools/pack-textures.py` fetches them and packs
  each one's normal and roughness maps into `<name>_nr.jpg`.
- **Map data:** state boundaries and India's outline come from
  [Natural Earth](https://www.naturalearthdata.com) (public domain), using its India point-of-view
  boundaries, simplified into `js/india-map.js`.
- **Fonts:** Rozha One and Hind on the site; the video adds Noto faces for each Indian script (all
  SIL Open Font License).
