# Components

Every shared part in pictures: what the buildings are made of, and what stands round them. Each
heading links to the guide that says what the part takes and where it lives.

The pictures are drawn by `node tools/shoot-components.mjs`, each part on its own in plain light.
On the site the same parts carry shadows, photo textures and weathering.

[Back to the README](README.md) · [States and monuments](monuments.md) · [How it is drawn](how-it-is-drawn.md)

## Architecture

From [architecture.md](architecture.md).

### [Domes](architecture.md#domes)

| ![Onion dome with its neck, lotus crown and finial](img/onion-dome.jpg) | ![Lotus dome: ribs, a cup of petals, a crescent](img/lotus-dome.jpg) |   |
| :---: | :---: | :---: |
| Onion dome with its neck, lotus crown and finial | Lotus dome: ribs, a cup of petals, a crescent |   |

### [Kiosks and turrets](architecture.md#kiosks-and-turrets)

| ![Chhatri](img/chhatri.jpg) | ![Mughal chhatri](img/mughal-chhatri.jpg) | ![Guldastas](img/guldasta.jpg) |
| :---: | :---: | :---: |
| Chhatri | Mughal chhatri | Guldastas |
| ![Minaret](img/minaret.jpg) | ![Jharokha](img/jharokha.jpg) | ![Copper and gilded-copper roofs](img/copper-roofs.jpg) |
| Minaret | Jharokha | Copper and gilded-copper roofs |
| ![Terracotta brick and plaques](img/terracotta.jpg) | ![Chadar (water cascade)](img/chadar.jpg) |   |
| Terracotta brick and plaques | Chadar (water cascade) |   |

### [Pillars and columns](architecture.md#pillars-and-columns)

| ![Classical columns, plain and Corinthian](img/column.jpg) | ![Carved temple pillars](img/carved-pillar.jpg) | ![Cluster pillar](img/cluster-pillar.jpg) |
| :---: | :---: | :---: |
| Classical columns, plain and Corinthian | Carved temple pillars | Cluster pillar |
| ![Yali pillar](img/yali-pillar.jpg) | ![Column trim on bare shafts](img/column-trim.jpg) |   |
| Yali pillar | Column trim on bare shafts |   |

### [Arches, doors and windows](architecture.md#arches-doors-and-windows)

| ![Arch wall with its ring](img/arch.jpg) | ![Iwan](img/iwan.jpg) | ![Niche](img/niche.jpg) |
| :---: | :---: | :---: |
| Arch wall with its ring | Iwan | Niche |
| ![Window with a jali screen](img/window-jali.jpg) | ![Classical door](img/classical-door.jpg) | ![Gothic window](img/gothic-window.jpg) |
| Window with a jali screen | Classical door | Gothic window |
| ![Temple doorway with carved jambs](img/temple-doorway.jpg) | ![Iwan with muqarnas and an inscription band](img/muqarnas.jpg) | ![Water spout (pranala)](img/pranala.jpg) |
| Temple doorway with carved jambs | Iwan with muqarnas and an inscription band | Water spout (pranala) |
| ![Louvred shutters](img/louvred-shutters.jpg) |   |   |
| Louvred shutters |   |   |

### [Walls, eaves and parapets](architecture.md#walls-eaves-and-parapets)

| ![Chhajja on brackets](img/chhajja.jpg) | ![Merlons](img/merlons.jpg) | ![Railing](img/railing.jpg) |
| :---: | :---: | :---: |
| Chhajja on brackets | Merlons | Railing |

### [Temples](architecture.md#temples-jsdetailstemplesjs)

| ![Shikhara](img/shikhara.jpg) | ![Nagara temple](img/nagara-temple.jpg) | ![Dravida vimana](img/dravida-vimana.jpg) |
| :---: | :---: | :---: |
| Shikhara | Nagara temple | Dravida vimana |
| ![Gopuram](img/gopuram.jpg) | ![Mandap](img/mandap.jpg) | ![Temple niche with an image](img/temple-niche.jpg) |
| Gopuram | Mandap | Temple niche with an image |
| ![Manastambha](img/manastambha.jpg) | ![Kerala gable](img/kerala-gable.jpg) | ![Inlaid border](img/inlay-border.jpg) |
| Manastambha | Kerala gable | Inlaid border |
| ![Deepmala](img/deepmala.jpg) | ![Nandi mandapa](img/nandi-mandapa.jpg) | ![Dravida hall dress](img/dravida-dress.jpg) |
| Deepmala | Nandi mandapa | Dravida hall dress |

### [Forts](architecture.md#forts-jsdetailsfortsjs)

| ![Fort gate](img/fort-gate.jpg) | ![Rampart and a crowned bastion](img/rampart.jpg) | ![Machicolation](img/machicolation.jpg) |
| :---: | :---: | :---: |
| Fort gate | Rampart and a crowned bastion | Machicolation |

### [Tibetan monasteries](architecture.md#tibetan-monasteries-jsdetailstibetanjs)

| ![Monks' houses](img/tibetan-houses.jpg) | ![Dharma wheel and a victory banner](img/dharma-wheel.jpg) | ![Assembly hall](img/tibetan-hall.jpg) |
| :---: | :---: | :---: |
| Monks' houses | Dharma wheel and a victory banner | Assembly hall |
| ![Prayer wheels](img/mani-wheels.jpg) | ![Gilded roof](img/gilded-roof.jpg) |   |
| Prayer wheels | Gilded roof |   |

### [Stairs](architecture.md#stairs-jsdetailsdoorwaysjs)

| ![Grand stair](img/grand-stair.jpg) |   |   |
| :---: | :---: | :---: |
| Grand stair |   |   |

### [Sculpture](architecture.md#sculpture)

| ![Figure frieze](img/figure-frieze.jpg) | ![Statue, urn and pinnacle](img/statue.jpg) | ![Door guardian](img/guardian.jpg) |
| :---: | :---: | :---: |
| Figure frieze | Statue, urn and pinnacle | Door guardian |

### [Statues](architecture.md#sculpture)

The free-standing statues are sculpted as one continuous skin from a signed distance field and
meshed in the browser (`js/sdf.js`, `js/details/figures.js`, `js/details/animals.js`), each checked
against photographs. The four colossal ones are drawn first; the rest follow by monument.

| ![Statue of Unity](img/statue-patel.jpg) | ![Gommateshwara](img/statue-bahubali.jpg) | ![Thiruvalluvar](img/statue-thiruvalluvar.jpg) |
| :---: | :---: | :---: |
| Sardar Patel, Statue of Unity | Bahubali, Gommateshwara | Thiruvalluvar, Kanyakumari |
| ![Nageshwar Shiva](img/statue-shiva.jpg) | ![Adi Shankaracharya at Kedarnath](img/statue-shankaracharya.jpg) | ![Statue of Oneness](img/statue-oneness.jpg) |
| The seated Shiva, Nageshwar | Adi Shankaracharya, Kedarnath | Statue of Oneness, Omkareshwar |
| ![Netaji at India Gate](img/statue-netaji.jpg) | ![Shivaji at the Gateway of India](img/statue-shivaji.jpg) | ![Angel of Victory and Queen Victoria](img/statue-angel-victoria.jpg) |
| Netaji, India Gate | Shivaji, Gateway of India | Angel of Victory and Queen Victoria, Victoria Memorial |
| ![Allegories](img/statue-allegories.jpg) | ![Progress](img/statue-progress.jpg) | ![Commerce and Agriculture](img/statue-commerce-agriculture.jpg) |
| Allegories: Justice, Prudence, Motherhood, Learning, Britannia | Progress, Victoria Terminus | Commerce and Agriculture, Victoria Terminus |
| ![Gajalakshmi](img/statue-gajalakshmi.jpg) | ![Lion Capital, lion and tiger](img/statue-lions.jpg) |   |
| Gajalakshmi, Mysore Palace | The Lion Capital; the lion and tiger of Victoria Terminus |   |

| Statue | Monument | What it is | Built in |
| --- | --- | --- | --- |
| Sardar Patel | [Statue of Unity](https://monuments-of-india-nu.vercel.app/#statue-of-unity) | 182 m of bronze cast in plates: walking in dhoti, A-line kurta and bandi under a short square shawl, the sleeves and fists below its hem, the 1949 portrait's face, bowed a little; on its 58 m base | `patelBody` (figures), `patel()` (statue-of-unity) |
| Bahubali | [Gommateshwara](https://monuments-of-india-nu.vercel.app/#gommateshwara) | 17.4 m of granite in kayotsarga: column legs, long-fingered hands on the anthills, creepers rising up the thighs in a V and winding up the arms, curls, long earlobes, on a lotus | `bahubaliBody` (figures), `bahubali()` (gommateshwara) |
| Thiruvalluvar | [Vivekananda Rock Memorial](https://monuments-of-india-nu.vercel.app/#vivekananda-rock-memorial) | 29 m, built of granite blocks whose joints show: right hand raised with three fingers, left holding the palm-leaf book, the hips swaying, full beard and hair knot; on the Alankara Mandapam | `thiruvalluvarBody` (figures), `thiruvalluvar()` (vivekananda-rock-memorial) |
| Shiva | [Nageshwar Temple](https://monuments-of-india-nu.vercel.app/#nageshwar-temple) | 25 m of painted concrete in the half lotus: four arms with trishul, damru, Om on the raised palm; malas, cobra with its hood beside the ear, tiger skins, the band of ash and the third eye painted, combed jata with the crescent | `shivaBody` (figures), `mahayogiShiva()` (nageshwar-temple details) |
| Adi Shankaracharya | [Kedarnath Temple](https://monuments-of-india-nu.vercel.app/#kedarnath-temple) | 12 ft of black chlorite schist, seated cross-legged: long hair, three malas and armbands, the right hand in the gesture of teaching holding the flagged staff, the left on the knee with a palm-leaf book; on a lotus bud on a post in a pool | `crossLegged` (figures), `shankaracharya()` (kedarnath-temple) |
| Statue of Oneness | [Omkareshwar](https://monuments-of-india-nu.vercel.app/#omkareshwar-temple) | 108 ft of bronze: Shankaracharya as a boy of twelve, walking, the staff across him, the water pot in his left hand, mala and rudraksha bands, on an open lotus | `shankaraBody` (figures), `statueOfOneness()` (omkareshwar-temple details) |
| Netaji Subhas Chandra Bose | [India Gate](https://monuments-of-india-nu.vercel.app/#india-gate) | 28 ft of black granite under the canopy: saluting in INA uniform, side cap, round spectacles, belted tunic, flared breeches, knee boots | `netajiBody` (figures), `netaji()` (india-gate details) |
| Chhatrapati Shivaji | [Gateway of India](https://monuments-of-india-nu.vercel.app/#gateway-of-india) | Bronze, on a prancing horse (one foreleg raised): turban with plume, angarkha, shield on his back, the reins in his left hand and the sword low in his right; a stone pedestal with the shield and crossed swords, in a railed garden | `shivajiBody` (figures), `horse({ prance })` (animals), `shivajiStatue()` (gateway-of-india details) |
| Angel of Victory | [Victoria Memorial](https://monuments-of-india-nu.vercel.app/#victoria-memorial) | 4.9 m of bronze on a ball on the dome: winged, the robe blown back, a bugle to her lips and a wreath | `allegory` (figures), `angelOfVictory()` (victoria-memorial) |
| Queen Victoria | [Victoria Memorial](https://monuments-of-india-nu.vercel.app/#victoria-memorial) | Frampton's bronze: enthroned in the robes of the Star of India, crown and veil, sceptre and orb | `allegory` (figures), `queenVictoria()` (victoria-memorial) |
| The allegories | [Victoria Memorial](https://monuments-of-india-nu.vercel.app/#victoria-memorial), [Victoria Terminus](https://monuments-of-india-nu.vercel.app/#csmt) | Women in classical drapery, standing or seated, holding their attributes: Art, Architecture, Justice and Charity round the dome; Motherhood, Prudence and Learning over the porch; robed figures on the roofs; Britannia in the group of Commerce | `allegory`, `hold`, `attribute` (figures) |
| Progress | [Victoria Terminus](https://monuments-of-india-nu.vercel.app/#csmt) | Earp's marble on the dome: the copper-gilt torch aloft, her hand on a winged wheel, a star above her forehead | `allegory` (figures), `progress()` (csmt) |
| Commerce and Agriculture | [Victoria Terminus](https://monuments-of-india-nu.vercel.app/#csmt) | The groups over the forward wings' gables: a caduceus, a model ship, Britannia's trident and shield; a ploughshare, a cornucopia, a sickle and sheaf | `commerce()`, `agriculture()` (csmt details) |
| Gajalakshmi | [Mysore Palace](https://monuments-of-india-nu.vercel.app/#mysore-palace) | Gilt, in the gable under the red hood over the central bay: the crowned goddess cross-legged on a lotus with a lotus in each hand, between two elephants raising pots on their trunks | `crossLegged` (figures), `elephant({ raised })` (animals), `gajalakshmi()` (mysore-palace details) |
| Lion Capital | [National War Memorial](https://monuments-of-india-nu.vercel.app/#national-war-memorial) | Bronze on the obelisk: four lions back to back on the abacus with its wheels, over the lotus bell | `lionCapital` (animals) |
| Lion and tiger | [Victoria Terminus](https://monuments-of-india-nu.vercel.app/#csmt) | Earp's Bath stone, couchant on the gate piers: the lion for Britain with his mane, the tiger for India, striped | `couchant` (animals) |

On phones the colonial allegories are the light kit's robed figures and the great statues are meshed
on coarser cells (`js/detail.js`).

## The setting

From [realism.md](realism.md).

### [Trees](realism.md#trees)

| ![Broadleaf: neem, mango, jamun, tamarind, teak, sal](img/trees-broadleaf.jpg) | ![Wide: banyan, peepal, chinar, willow](img/trees-wide.jpg) | ![Dry: ber, babul, khejri, dhok](img/trees-dry.jpg) |
| :---: | :---: | :---: |
| Broadleaf: neem, mango, jamun, tamarind, teak, sal | Wide: banyan, peepal, chinar, willow | Dry: ber, babul, khejri, dhok |
| ![Columns and conifers: ashoka, poplar, cypress, casuarina, fir, deodar](img/trees-columns.jpg) | ![Coconut palms](img/palms.jpg) |   |
| Columns and conifers: ashoka, poplar, cypress, casuarina, fir, deodar | Coconut palms |   |

### [Shrubs, hedges and flower beds](realism.md#shrubs-hedges-and-flower-beds)

| ![Clipped, flowering and dry shrubs](img/shrubs.jpg) |   |   |
| :---: | :---: | :---: |
| Clipped, flowering and dry shrubs |   |   |

### [Lamps and street furniture](realism.md#lamps-and-street-furniture)

| ![Lamp posts, a bench, bollards with a chain](img/lamp-posts.jpg) | ![The ASI board](img/asi-board.jpg) | ![Fountain jets](img/fountains.jpg) |
| :---: | :---: | :---: |
| Lamp posts, a bench, bollards with a chain | The ASI board | Fountain jets |

### [Flags and garlands](realism.md#flags-and-garlands)

| ![Prayer flags](img/prayer-flags.jpg) | ![The tricolour and a saffron pennant](img/flags.jpg) | ![Marigold garlands](img/garland.jpg) |
| :---: | :---: | :---: |
| Prayer flags | The tricolour and a saffron pennant | Marigold garlands |

### [Boats](realism.md#boats)

| ![Country boats, one with a hood](img/boats.jpg) | ![Ferry launches](img/launches.jpg) | ![A cargo ship](img/ships.jpg) |
| :---: | :---: | :---: |
| Country boats, one with a hood | Ferry launches | A cargo ship |
| ![Houseboats](img/houseboats.jpg) |   |   |
| Houseboats |   |   |

### [Stalls](realism.md#stalls)

| ![Stalls and umbrellas](img/stalls.jpg) |   |   |
| :---: | :---: | :---: |
| Stalls and umbrellas |   |   |

### [Towns](realism.md#towns)

| ![Town houses](img/town-houses.jpg) |   |   |
| :---: | :---: | :---: |
| Town houses |   |   |

### [Traffic](realism.md#traffic)

| ![Traffic: cars, taxis, buses and trucks](img/traffic.jpg) |   |   |
| :---: | :---: | :---: |
| Traffic: cars, taxis, buses and trucks |   |   |

### [Animals](realism.md#animals)

| ![Nandi](img/nandi.jpg) | ![Elephants, plain and dressed](img/elephants.jpg) | ![Horse and lion](img/horse-lion.jpg) |
| :---: | :---: | :---: |
| Nandi | Elephants, plain and dressed | Horse and lion |
| ![Deer](img/deer.jpg) | ![Yaks and camels](img/yaks-camels.jpg) |   |
| Deer | Yaks and camels |   |

