# How it is drawn

How the site turns code into stone, light and landscape: surfaces, water, sculpture, lighting and
what changes between desktops and phones.

[Back to the README](../README.md) · [Architecture](architecture.md) · [The setting](realism.md) · [Components](components.md) · [States and monuments](monuments.md)

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
  - the trees and shrubs of its region, twenty-one kinds from one planter: neem, banyan, mango,
    ashoka, coconut palms, deodars and cypress avenues; jamun on Delhi's avenues, peepal at Bodh
    Gaya and Sarnath, chinar in Kashmir, poplar and willow in Ladakh, firs in the eastern
    Himalaya, teak and sal in the forests, tamarind in the south, casuarina on the coast, and
    the small dry trees of desert and scrub (ber, babul, khejri, dhok). The ceremonial lawns
    (India Gate, the Taj, Victoria, the National War Memorial, both Parliaments) stay mown;
    elsewhere low grass tufts and stones lie on the open ground. Where a monument has triangles
    to spare, `upgradeTrees` replants them as
    fuller trees: limbs with separate leaf clumps, palms with leafleted fronds, deodars in
    drooping tiers;
  - flags and garlands: the tricolour (a rippling cloth with the Ashoka Chakra), the Nishan Sahibs,
    saffron temple pennants, Tibetan prayer flags and marigold strings;
  - heritage lamp posts (lit at night), fountains and the blue boards of the Archaeological Survey
    of India;
  - boats, shikaras and houseboats on the water, and stalls outside the temple gates;
  - animals: temple elephants, the deer at Sarnath and Sikandra, yaks, camels and ponies.

  There are no people, and no motor vehicles except the traffic on the Howrah Bridge and the
  Bandra–Worli Sea Link, so the monument itself stays the subject. Everything is
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
