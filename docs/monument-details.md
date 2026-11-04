# Finer detail for the monuments

The plan, and what has been built, for a second layer of architectural detail. It was first built
for India Gate, Charminar, the Taj Mahal, the Gateway of India and the Old Parliament House (the
sections below), then carried to every other monument (see "The other monuments").

## Approach

Each monument keeps its massing in `js/monuments/<id>.js`. The finer detail lives in a matching file
in `js/details/`, which the builder calls once its walls are in place:

| Monument | Builder | Detail module | Entry point |
| --- | --- | --- | --- |
| India Gate | `js/monuments/india-gate.js` | `js/details/india-gate.js` | `addIndiaGateDetails`, `addCanopyDetails` |
| Charminar | `js/monuments/charminar.js` | `js/details/charminar.js` | `charminarMinaret`, `addCharminarDetails` |
| Taj Mahal | `js/monuments/taj-mahal.js` | `js/details/taj-mahal.js` | `addTajDetails`, `tajMinaret` |
| Gateway of India | `js/monuments/gateway-of-india.js` | `js/details/gateway-of-india.js` | `addGatewayDetails`, `gatewayTurret` |
| Old Parliament House | `js/monuments/old-parliament-house.js` | `js/details/old-parliament-house.js` | `addOldParliamentDetails` |

Parts used by more than one monument are in `js/details/components.js`:

- **Arches:** `archCurve` (the same curves as `helpers.archWall`), `archRing` (a moulded band round an
  arch), `archSlab`, `tympanum` (the head of an arch, for jali), `hood` (a half-dome) and `niche` (a
  framed niche with a hood and an inner ring: an arch within an arch), `keystone`.
- **Ornament:** `sunburst` (roundel with rays), `rosette`, `clockFace`, `lettering` (block capitals
  for inscriptions), `dentils`, `petalRing` (lotus petals), `lotusDome`, `crescentFinial`.
- **Structure:** `bracketGeo` (S-curved corbel), `chhajja` and `chhajjaRing` (sloping eaves),
  `railingRing` and `railing` (pierced balustrades), `arcadeScreen` (a screen of small arches),
  `merlons` (leaf-tipped kangura), `mughalChhatri` (an eight-column kiosk).
- **Materials:** `D` (black inlay, cut lettering, clock enamel, brass, pietra dura stones),
  `jali(m)` and `frieze(m)` (the same stone, pierced or carved, using the surface shader's lattice
  and frieze patterns).
- **`mergeByMaterial(group)`** bakes every plain mesh in a group into one mesh per material.

Rules the detail modules follow:

1. **Draw calls:** build the parts of a monument into one group and merge it, so hundreds of
   brackets, rays and petals cost a few draw calls. Repeated identical parts in large numbers
   (the Parliament's 144 column bases and capitals) are instanced instead.
2. **No flicker:** merged meshes are not seen by `coplanar.js`, so every detail stands at least
   1–3 cm off the surface it decorates, and no two detail faces share a plane where they overlap.
3. **Budget:** under about 300,000 triangles per monument. Small domes, petals, rosettes and arch
   curves use fewer segments the smaller they are.
4. **Materials:** reuse the shared stones from `helpers.M`, so the photo textures and weathering
   still apply; a carved variant is a shade lighter so it reads against the wall.
5. **No `flatShading`** on cylinders, cones or spheres: `naturalize.js` would sculpt them into rocks.

## Per monument

Status: everything listed under "Built" is in place. "Later" lists what was considered and left out.

### India Gate

References: the arch rises in stages to a cornice over a frieze of Imperial suns; INDIA is cut in
the attic of both long faces between MCMXIV and MCMXIX; the dedication is cut above the arch; the
arch is coffered; a stone ornament sits over each side arch; a shallow bowl crowns the top; the
canopy east of the arch is a domed sandstone pavilion.

Built:
- Two large sunburst roundels on each long face, one either side of the main arch (the circles on
  the front on both sides), and one over each side arch.
- Archivolt and wedge keystone on all four arches.
- The dedication panel above the main arch in a moulded frame.
- A frieze of 26 small Imperial suns under the cornice, a fillet below it, dentils under the cornice
  and a lip along its edge.
- INDIA, MCMXIV and MCMXIX in raised letters on both attic faces, reading correctly from either
  side, in a sunk-panel frame.
- A coffered soffit in the main vault: transverse and longitudinal ribs with a rosette per coffer.
- A base moulding round the piers; a rolled rim on the bowl.
- Canopy: stepped base, column caps and bases, a sloping eave on each side, corner pinnacles, a
  drum and a ribbed dome with a lotus crown.

Later: the Netaji Subhas Chandra Bose statue (2022) under the canopy; the full dedication text.

### Charminar

References: four minarets built into the corners, each rising above the roof in two storeys with
balconies and a bulbous dome on a petal base; a profusion of stucco, balustrades and balconies; two
galleries one over another and a roof terrace bordered by a balcony; four clocks added in 1889.

Built:
- New minarets (`charminarMinaret`): fluted shafts in four stages, three balconies on 16 brackets
  each with a pierced railing, arched windows framed in mouldings on every storey (on the lower
  shaft only where it stands clear of the building), moulded rings between them, an eave, a drum, a
  ribbed onion dome in a cup of lotus petals, an inverted lotus at its tip and the spike.
- A moulded ring round each great arch and a second, finer ring outside it; stucco rosettes in the
  spandrels.
- The clocks: enamel dials with hour marks and hands in a brass bezel and a stucco frame.
- The first-floor gallery on brackets with an arcaded balustrade; moulded frames and pilasters for
  the arched openings behind; a second bracketed cornice and balustrade; frames for the top-floor
  arcade; the crowning parapet of small arches with merlons.

Later: the small mosque on the western side of the top floor; the flat-domed vault inside.

### Taj Mahal

References: each face centred on a pishtaq 32.6 m high, framed in Quranic calligraphy with
guldastas at its edges and a floral band at the top; stacked arched alcoves either side and on the
chamfers; a carved dado; muqarnas in the iwan heads; a lotus at the top of the dome and a gilded
finial; chhatris on slender columns with cusped arches; minarets with three balconies, a door onto
each, topped with a chhatri; a moulded edge along the top of the plinth.

Built:
- Pishtaqs cut 2.6 m deep with a half-dome hood, so the face reads as curves inside curves: the
  outer pointed arch, its ring, a blind arch on the back wall, the door and a screened window above
  it, each in its own ring.
- The calligraphy frame as a raised white band and bead round each pishtaq; carved white flowers
  in the spandrels; a carved band and merlons along the top; guldastas at both edges. The Taj is
  kept white throughout: no black inlay lines.
- Two storeys of alcoves either side and on every chamfer, as niches with hoods, jali screens and
  inner rings.
- A carved dado, a chamfered parapet (the old square band overhung the chamfers) with merlons, and
  guldastas where each face meets a chamfer.
- The drum ringed by a blind arcade between two moulded rings; a moulded ring at the foot of the dome;
  an inverted lotus at its crown; a gilded finial of stacked bulbs ending in a crescent.
- Chhatris with eight columns, pointed arches, an eave, a ribbed dome in a lotus cup and a crescent.
- Minarets (`tajMinaret`): square and octagonal base, three tapering stages with moulded rings
  (the ridges up the towers), three balconies with stepped corbelling,
  brackets and pierced railings, a door onto each, and a chhatri on top.
- A blind arcade of 88 arches round the plinth and a carved edge along its top.

Later: the minarets' slight outward lean; muqarnas cells inside the half-domes; the mosque and
jawab either side.

### Gateway of India

References: a triumphal arch in yellow basalt with 16th-century Gujarati detail: four turrets,
intricate stone latticework, carved brackets; a central hall with a 15 m dome, flanked by side halls
whose arches match the smaller arches of the long sides.

Built:
- The great arch in two moulded orders, with pierced jali spandrels over a dark backing and a
  moulding along their top.
- Two tiers of screened windows on the piers, each on a bracketed sill.
- A sloping eave on brackets under the attic on all four sides; a blind arcade of screened niches
  along the attic; a pierced parapet with kalash pinnacles along the roof.
- New octagonal turrets (`gatewayTurret`): banded shafts with two tiers of niches, a bracketed
  balcony with a railing, and an open domed kiosk; smaller ones at the outer corners of the side
  halls.
- Jali in the heads of the central hall's side arches and of the side halls' pointed arches,
  moulded rings round those arches, and their own eaves and parapets.

Later: the steps down to the water behind the arch; the carved friezes inside the central hall.

### Old Parliament House

References: circular, 170 m across; an open first-floor verandah with 144 cream sandstone columns
8.23 m high; chhajjas and jalis among the Indian features; sandstone railings round the estate.

Built:
- Moulded bases on square plinths and capitals with an abacus for all 144 columns (instanced), and
  a pierced balustrade between them; the verandah's back wall in shade so the columns read.
- A sloping eave over the colonnade on 144 brackets; a red jali along the roof.
- Every ground-floor window screened with jali between a sill and a lintel, pilasters between them
  and a string course on top.
- Porches with steps, an arched doorway and a screened window, paired columns under an entablature,
  an eave and an arcaded parapet.
- The Central Hall's drum ringed with 24 screened windows, 16 ribs on the shallow dome and a finial;
  clerestory windows along the three chambers.
- The estate railing with 24 gate piers.

Later: the real count of twelve gates (the model keeps six porches); the chambers' roofs.

## The other monuments

Every other monument now has the same kind of layer. Each `js/details/<id>.js` has an
`architecture()` function, called first from its `addDetails`, that adds the carving, mouldings and
fittings in one merged group. Its comment says what it adds and which builder dimensions it follows.
The rules above still apply.

### Shared parts added

- `components.js`: `beltCourse` and `mouldings` (courses round a block, as a temple's adhishthana or
  a plinth), `pilasters`, `windowFrame` (a framed window, optionally screened), `jharokha` (an oriel
  on brackets) with `banglaRoof`, `templeNiche` (a devakoshtha with its image and pediment), `panel`
  (a framed sunk panel), `idol` (a cheap standing image for rows of niches), `star` (inlaid stars),
  `fishPair` (the fish of Awadh) and `medallion` (a cheap roundel where there are hundreds).
- `forts.js`: `towerDetail` (banded, slit round or polygonal towers) and `slitRow` (loopholes).
- `tibetan.js` (new): `dharmaWheel` (the wheel between two deer), `gyaltsen` (victory banners),
  `shabkhep` (window awnings) and `parapetDiscs`.

### Detail in the shared builders

- `nagaraTemple` (Baidyanath, Bhimashankar, Grishneshwar, Kashi Vishwanath, Mahakaleshwar,
  Nageshwar, Omkareshwar, Palitana, Parshvanath, Shikharji, Somnath, Soniji ki Nasiyan,
  Trimbakeshwar): base mouldings and a cornice on the sanctum, an image niche on each of its three
  outer faces (smaller empty niches beside it on large temples), and bhumi-amalakas on the corners of
  the spire's storeys.
- `gopuram` (Meenakshi, Mallikarjuna, Padmanabhaswamy, Ramanathaswamy, Tirumala): plinth mouldings,
  niches with images between pilasters on the granite base either side of the passage, and kudu
  gables and windows on the crowning vault.

### Per monument

- Forts: Agra (wall courses and loopholes, banded bastions, the Amar Singh Gate's panels, the Khas
  Mahal's screened arches and eaves, the Musamman Burj's jalis, the Diwan-i-Am's arches); Red Fort
  (courses, loopholes, the Lahori Gate's panels and arcaded parapet, windows in the towers); Amber
  (jharokhas on the palace fronts and the Ganesh Pol, the Diwan-i-Aam's brackets and eaves); Bekal
  (loopholes at three levels); Chittorgarh (the Vijay and Kirti Stambhs' friezes, pilasters and
  balconies, Padmini's palace); Daulatabad (the Chand Minar's bracketed balconies and railings);
  Aguada (cordon and embrasures, the lighthouse gallery); Golconda (medallions on the Fateh Darwaza,
  the Bala Hissar's eaves and parapet); Gwalior (jharokhas and tower balconies on the Man Mandir, the
  Teli ka Mandir's niches); Jaisalmer (merlons on all 99 bastions, tiers of jharokhas); Mehrangarh
  (the Phool Mahal's bracketed eave, jharokhas). All banded and slit their towers with `towerDetail`.
- Mughal, Deccan and Nawabi: stacked iwans on the face strips of Humayun's and Safdarjung's tombs and
  Bibi ka Maqbara; inlaid stars (Humayun, Safdarjung, Akbar's tomb and gateway, Buland Darwaza, Jama
  Masjid); calligraphy bands (Buland Darwaza, Chota Imambara, Jama Masjid, Qutub Minar); merlons,
  guldastas, lotus crowns, bracketed balconies on the minarets; jali on Akbar's top terrace and on
  Itmad-ud-Daulah's pavilion, with coloured inlay panels; the Gol Gumbaz's bracketed cornice and
  tower windows; arcaded parapets on the Qutb Shahi tombs; the fish of Awadh at the Imambaras;
  Qutub Minar's muqarnas brackets; Panch Mahal's capitals, eaves and railings; the Hawa Mahal's sill
  brackets; jharokhas on the City Palace and arcades on the Lake Palace; the Golden Temple's inlay and
  embossed bands and bay windows.
- Colonial and modern: Bom Jesus (pilaster capitals, volutes, dentils, belfry windows); Cooch Behar
  (roof balustrade, drum windows); CSMT (pierced parapets, pinnacles, roundels, a clock); Laxmi Vilas
  (clock dials, tower windows and balconies, merlons); Victoria Memorial (balustrades, pavilion
  windows, drum column capitals); Rashtrapati Bhavan (Delhi Order bell capitals, chhajjas on
  brackets, jali windows, the Sanchi-style railing round the dome); Mysore Palace (rosettes, eave,
  merlons, tower balconies, lotus cups); Kirti Mandir; the new Parliament House (jali windows, a carved
  band); the Cellular Jail (string courses, tower windows); Howrah Bridge (gusset plates, tower caps,
  deck railings); the Bandra–Worli Sea Link (cross-beam, aviation light, cable anchors); the Capitol
  Complex (the enamelled door, brise-soleil); the memorials (lettered tablets and bronze murals,
  bullet marks at Jallianwala Bagh); the Statue of Unity's relief panels and railings.
- Temples: Akshardham, Brihadeeswara (adhishthana, kudus, hall niches), Chennakesava (star friezes,
  madanikas, screens), Dilwara (the dome's pendant), Hidimba (carved bands, eave pendants, horns),
  Jagannath (pabhaga, niches, amalakas, lions on the tower), Kailasa, Kamakhya, Kandariya (kakshasana
  balconies), Kedarnath, Konark (friezes, niches, gajasimhas), the Lotus Temple (stairs), Mahabodhi
  (tower niches, railing medallions), the Ram Mandir, Ramappa (madanikas), Ranakpur, the Shore Temple
  (pilasters, kudus, vyalas) and Vittala (clustered musical pillars, eaves); Rani ki Vav (an image in
  every niche, friezes, brackets); Gommateshwara (the manastambha).
- Buddhist: Dhamek (the carved band and niche images), Sanchi (railing medallions, stairway, yakshi
  brackets), Nalanda (stucco niches on Temple 3), Ajanta (the chaitya facades' horseshoe arches,
  kudus and Buddhas, beams over the other caves), and the monasteries (Key, Rumtek, Tawang, Thiksey)
  with the Dharma wheel and deer, victory banners, awnings and parapet discs.

Later: the interiors (the forest of pillars at Ranakpur, the Dilwara ceilings); figure sculpture in
place of the simple `idol`; the roofscape of Jaisalmer's havelis.

## Checking a change

There is no build step. To see a detail module's effect, serve the folder (`npx serve .`) and open
the monument's hash, for example `#taj-mahal`. A quick check of cost is the number of meshes and
triangles in the built group, which should stay within the budget above. Every monument builds
within it: the largest is Konark at about 270,000 triangles.

## Sources

Consulted through web search (the pages themselves could not be opened from the environment the
work was done in, so details were checked against search summaries of them):
- India Gate: [Victorian Web](https://victorianweb.org/art/architecture/lutyens/12.html),
  [Britannica](https://www.britannica.com/topic/India-Gate), [Lutyens Trust catalogue](https://catalogue.lutyenstrustamerica.com/project/all-india-war-memorial-arch/).
- Charminar: [Wikipedia](https://en.wikipedia.org/wiki/Charminar), [Archnet](https://archnet.org/sites/5850),
  [Telangana Tourism](https://telanganatourism.gov.in/blog/20-08-charminar.html),
  [Telangana Today on the clocks](https://telanganatoday.com/hyderabad-three-generations-keep-charminar-clocks-alive-and-ticking).
- Taj Mahal: [tajmahal.gov.in, exterior decoration](https://tajmahal.gov.in/the-taj-exteriors.aspx),
  [Archnet](https://www.archnet.org/sites/1557), [New World Encyclopedia](https://www.newworldencyclopedia.org/entry/Taj_Mahal).
- Gateway of India: [Britannica](https://britannica.com/topic/Gateway-of-India),
  [Victorian Web](https://victorianweb.org/art/architecture/wittet/1.html),
  [CyArk 3D scan on Google Arts & Culture](https://artsandculture.google.com/asset/3d-model-of-gateway-of-india-india-cyark/JAE__LXR9I6lkA).
- Old Parliament House: [Wikipedia](https://en.wikipedia.org/wiki/Old_Parliament_House,_New_Delhi),
  [Parliament House Estate booklet](https://sansad.in/uploads/Parliament_House_estate_d61e51bdfd.pdf).
- 3D model listings found (not opened, downloaded or copied; no free Sketchfab model turned up):
  CGTrader listings for
  [India Gate](https://www.cgtrader.com/3d-models/architectural/engineering/the-india-gate) and
  [Gateway of India](https://cgtrader.com/3d-models/architectural/other/gateway-of-india-3d-model).
