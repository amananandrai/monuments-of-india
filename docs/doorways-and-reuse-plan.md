# Plan: real doorways, and reusing the detail parts across the site

Two problems, one plan:

1. **Entrances don't read.** Most temples are a solid block with no way in, and most Mughal and
   colonial buildings show a door as a flat black arch with no depth.
2. **The new detail parts serve five monuments only.** The Taj's iwans, kiosks and minarets, the
   Parliament's colonnade, eaves and jalis, and the rest of `js/details/` should be reused by every
   building of the same family.

Done already: the Taj Mahal is now white throughout. Its calligraphy frame and spandrel flowers
are white relief, the black inlay lines on the minarets, drum and alcoves are gone. Only the
doorways and the window behind the pishtaq screen stay dark.

## 1. What the site does today

A survey of the 101 builders in `js/monuments/`:

| How an entrance is drawn | Monuments | Why it looks wrong |
| --- | --- | --- |
| A flat `archPanel(…, M.recess)`, a dark arch 0.2–0.4 m thick stuck on the wall, used for doors (and in some files for windows and arcades too) | **32**: agra-fort, akbars-tomb, amber-fort, bara-imambara, bibi-ka-maqbara, bom-jesus, buland-darwaza, charminar, chittorgarh-fort, chota-imambara, city-palace-udaipur, cooch-behar-palace, csmt, gol-gumbaz, golconda-fort, hazratbal-shrine, humayuns-tomb, itmad-ud-daulah, jama-masjid, kashi-vishwanath-temple, kirti-mandir, laxmi-vilas-palace, mahabodhi-temple, mysore-palace, new-parliament-house, qutb-shahi-tombs, red-fort, rumi-darwaza, safdarjung-tomb, sher-shah-suri-tomb, soniji-ki-nasiyan, victoria-memorial | No reveal, no jambs, no threshold, no door. It is one flat colour, so from any angle it reads as a black sticker. |
| `nagaraTemple()` in `helpers.js`: halls are `box(hw, hh, hw)` | **13**: baidyanath, bhimashankar, grishneshwar, kashi-vishwanath, mahakaleshwar, nageshwar, omkareshwar, palitana, parshvanath-khajuraho, shikharji, somnath, soniji-ki-nasiyan, trimbakeshwar | The halls are solid cubes. Steps lead up to a blank wall. |
| `gopuram()` in `helpers.js`: the passage is `box(w * 0.2, …, M.recess)` | **5**: mallikarjuna, meenakshi, padmanabhaswamy, ramanathaswamy, tirumala | The gate tower's passage is a dark box, not a way through. |
| Porches and halls built by hand as boxes | about **20**: akshardham, brihadeeswara, chennakesava, dilwara, hidimba-devi, jagannath-puri, kailasa, kamakhya, kandariya-mahadeva (porch `box(10, 6, 6)`), kedarnath, konark, ramappa, ranakpur, shore-temple, vittala-hampi, golden-temple, the monasteries, and the forts' gates | Solid porches; forts' gates are flat panels on walls. |
| Real openings cut through a wall (`archWall`) | **6**: india-gate, gateway-of-india, charminar, ajanta-caves, golconda-fort, rumi-darwaza | These already read. The Taj's pishtaqs (`niche`) read too. |

So three helpers (`nagaraTemple`, `gopuram`, `archPanel` used as a door) account for about 50 of
the weak entrances. Fixing them fixes the most monuments for the least work.

## 2. How a doorway gets depth

Depth comes from geometry and light, not from colour. A doorway that reads has:

1. **A reveal:** side walls (jambs) and a soffit running back from the face, at least 0.6 m deep
   for a house door and 2–4 m for a gate or an iwan. They catch light on one side and shadow on
   the other, and ambient occlusion (GTAO) darkens the inner corners for free.
2. **Layers:** a frame proud of the wall, then one or more stepped frames, each a few centimetres
   further in. Temple doors (with three to seven bands, the *shakhas*) and Mughal iwans (an arch
   in an arch) both work this way.
3. **Something at the back:** door leaves, a screen, or a dim interior. A floor that runs in, and
   leaves standing ajar, show the space behind.
4. **A threshold and a way up:** a sill or a raised step, and stairs from the ground to the plinth.
5. **Shade from above:** a hood, an eave (`chhajja`), a half-dome or a porch roof throws a
   shadow into the opening.

**The constraint.** The walls are solid boxes and extrusions. Geometry set *behind* a box's front face
is hidden by that face, and there is no CSG in the project (and adding a CSG library is not worth
the cost). So a doorway gets its depth in one of three ways:

- **A. Proud surround (the default).** The frame, jambs and hood project 0.6–3 m from the wall,
  and the door sits at the wall face. No change to the base mass is needed. This is how the Taj's
  pishtaqs (`niche`) already work, and it suits iwans, temple doorframes, gates and porches.
- **B. Cut face.** Where the wall is already a thin face (`archWall`, gate passages, gopuram
  bases), build it as an extrusion with holes. The extrusion's hole sides become the reveals, and
  a door or interior goes behind. Use it where you should see *through* (gates, passages).
- **C. Porch.** For temples and Lutyens buildings, an open porch of columns and a roof, with the
  doorway at its back wall, gives depth by itself.

## 3. The doorway kit: `js/details/doorways.js`

New, shared parts, built from the existing components:

| Part | What it is | Built from |
| --- | --- | --- |
| `reveal(shape, depth, m)` | Jambs and soffit for any opening shape (rectangle, round, pointed, trefoil), seen from inside | `archCurve` and an extrusion of the outline |
| `doorLeaves(w, h, { ajar, studs, panels, m })` | Two timber leaves with raised panels, optional brass studs (instanced) and a chosen opening angle | boxes, `inst` |
| `interior(w, h, d)` | A short dim room behind an opening: floor, back wall and ceiling in a darkening stone, so an open door shows space instead of black | boxes with a darker variant of the body stone |
| `threshold(w, kind)` | A sill, a raised *udumbara* step, or a half-moon stone | box, lathe |
| `steps(w, rise, n)` | A flight of steps up a plinth, optionally with side walls | boxes |
| `templeDoorway(w, h, { shakhas, lintelFigure, guardians })` | A post-and-lintel temple door: stepped jamb bands, a lintel with a central figure, river goddesses or guardian figures at the foot, a threshold | `reveal`, `rosette`, the statue helpers (`capsule`, `face`) |
| `mughalDoorway(w, h, { jaliTransom, hood })` | A pointed-arch door in an iwan: rings, a screened transom, timber leaves | `niche`, `archRing`, `jali` |
| `gateway(w, h, depth, { doors, spikes })` | A fort or city gate: a passage with reveals, huge studded leaves (with the elephant spikes of Rajput and Mughal forts), and guard niches | `reveal`, `doorLeaves`, `niche` |
| `classicalDoor(w, h, { architrave, pediment, steps })` | A Lutyens or colonial door: architrave, a cornice or pediment, panelled leaves, steps | boxes, `dentils`, `keystone` |
| `porch(opts)` | Generalised from the Parliament porch: columns, an entablature, an eave, a parapet and a doorway at the back | the Parliament's porch, made parametric |

Rules: a dark colour is never used alone to stand for an opening. Every doorway has at least a
reveal and something at the back. Each part merges with `mergeByMaterial`.

## 4. Fixing entrances, family by family

**Phase 1: the shared helpers (about 20 monuments at once).**
- `nagaraTemple()`: give the front hall an open porch (an *ardhamandapa* of four or six columns
  with a small stepped roof), a `templeDoorway` at the back of the porch on the hall's axis, and
  `steps` up the plinth to it. Halls become pillared rooms with a low parapet seat
  (*kakshasana*) instead of cubes. This fixes the 13 temples listed above.
- `gopuram()`: replace the dark box with a real passage (method B) through the granite base. It
  gets jambs, a coffered ceiling and two tall studded doors standing open. This fixes 5 temples.
- `mandap()` (Ram Mandir): a `templeDoorway` on each open side.

**Phase 2: Mughal, Indo-Islamic, Nawabi, Qutb Shahi and Deccan (about 20 monuments).**
Replace each `archPanel(…, M.recess)` door with `mughalDoorway` inside an `iwan` (the Taj's
`pishtaq`, made parametric). The main ones:
- **Humayun's Tomb:** four iwans in red with white frames; real cells in the arcaded plinth
  (`niche` rows); stairs.
- **Safdarjung, Bibi ka Maqbara, Itmad-ud-Daulah, Akbar's Tomb, Sher Shah Suri:** iwans and
  doors; jali in the alcoves.
- **Jama Masjid, Buland Darwaza:** gate iwans over their great stairs (`steps`).
- **Bara Imambara, Chota Imambara, Rumi Darwaza, Qutb Shahi tombs, Gol Gumbaz, Hazratbal:** iwans
  or niches and doors.

**Phase 3: forts and gates.** Red Fort (Lahori Gate), Agra Fort (Amar Singh Gate), Golconda,
Amber, Chittorgarh, Mehrangarh, Gwalior, Jaisalmer, Daulatabad, Bekal, Fort Aguada: a `gateway`
through the wall between the bastions, with studded and spiked leaves, guard niches and a
ramp or steps.

**Phase 4: hand-built temples, one at a time.** Each needs its own porch and door:
- **Kandariya Mahadeva:** the `box(10, 6, 6)` porch becomes an open porch with a *makara* arch.
- **Konark:** doors on three sides of the hall.
- **Kedarnath:** a front porch.
- **Brihadeeswara, Shore Temple, Kailasa:** sanctum doors flanked by guardian figures.
- **Chennakesava:** star-plan doorways with a lintel.
- **Dilwara, Ranakpur:** columned entrance halls.
- **Ramappa, Vittala, Jagannath, Kamakhya, Mahabodhi:** porch and doorway.
- **Golden Temple:** the Darshani Deori gate on the causeway.
- **The monasteries:** a painted door under a curtain and a pillared porch.

**Phase 5: colonial and Indo-Saracenic.** Victoria Memorial, CSMT, Mysore Palace, Laxmi Vilas,
Cooch Behar Palace, Bom Jesus, Cellular Jail: `classicalDoor` and `porch`. CSMT gets a Gothic
pointed door with tracery. Bom Jesus gets its Baroque portal.

## 5. Reusing the detail parts

### What there is to reuse

| Source | Part (today) | Becomes (shared, in `components.js`) |
| --- | --- | --- |
| Taj Mahal | `pishtaq()` | `iwan({ w, h, depth, frame, body, trim })`: niche, half-dome, rings, door, transom, relief frame, guldastas, merlons |
| Taj Mahal | `alcoves()` | `alcoveStack({ w, storeys, jali })` |
| Taj Mahal | `guldasta()` | `pinnacle(h, r, m)` (named to avoid the Lucknow `guldasta` in `helpers.js`) |
| Taj Mahal | `parapet()` | `merlonParapet(outline, m)` for any square, chamfered or polygonal roof |
| Taj Mahal | `tajMinaret()` | `mughalMinaret({ h, r, balconies, top: 'chhatri', m })` |
| Taj Mahal | plinth arcade | `blindArcade(len, n, m)` |
| Charminar | `charminarMinaret()` | `deccanMinaret({ flutes, balconies, windows, petals })` |
| Charminar, Gateway | `arcadeScreen`, `railingRing`, `clockFace`, `chhajja`, `bracketGeo` | already shared |
| Gateway of India | `gatewayTurret()`, `spandrels()` | `octTurret({ r, h, balcony, kiosk })`, `spandrelScreen()` |
| Old Parliament | column bases and capitals, the eave, the jali, screened windows, `porch()` | `colonnade({ path: ring or line, n, order })`, `eaveWithBrackets(path)`, `screenedWindows(path, n)`, `porch(opts)` |
| India Gate | `lettering`, `sunburst`, `dentils`, `keystone`, `archRing` | already shared; add more letters to `GLYPHS` as inscriptions need them |

Two changes make this reuse work:

- **Palette:** each part takes `{ body, trim, carve, screen, dark, metal }` instead of the hard-coded
  `MB`, `STUCCO`, `CARVE` and `CREAM` constants in the detail files. Humayun's Tomb can then pass red
  sandstone with white trim, and Bibi ka Maqbara white plaster with a marble dome.
- **Paths:** colonnades, eaves, railings and merlon parapets take a path (a line, a rectangle, a
  chamfered square or a circle), so one function serves a round Parliament and a rectangular
  Rashtrapati Bhavan.

### Mughal family: parts from the Taj

| Monument | Parts to apply |
| --- | --- |
| Bibi ka Maqbara | Almost the Taj set as it is: `iwan`, `alcoveStack`, `mughalMinaret`, `mughalChhatri`, `lotusDome`, `crescentFinial`, `merlonParapet`, `blindArcade` (plaster body, marble dome) |
| Humayun's Tomb | `iwan` in red with white trim, `mughalChhatri` in red and white, `merlonParapet`, `blindArcade` cells on the plinth, a stacked-bulb finial |
| Safdarjung's Tomb | `iwan`, `octTurret` corner towers with kiosks, `merlonParapet`, `lotusDome` crown |
| Itmad-ud-Daulah | `alcoveStack` with jali, short `mughalMinaret`s with kiosks, `merlonParapet` |
| Akbar's Tomb | `mughalMinaret` ×4 on the gate, `iwan`, rows of `mughalChhatri` on the terraces |
| Jama Masjid | `mughalMinaret` with balconies, the central `iwan`, `lotusDome` crowns, `merlonParapet` along the courtyard walls, `steps` |
| Buland Darwaza | A 40 m `iwan` with its half-dome, a row of `mughalChhatri` along the top, `merlonParapet`, `steps` |
| Red Fort, Agra Fort | Gate `iwan`s, `mughalChhatri` on the gates and bastions, `merlonParapet` along the walls, jharokha balconies |
| Panch Mahal, Sher Shah Suri | `mughalChhatri` (a whole storey of them for Panch Mahal), `lotusDome` |
| Qutb Shahi tombs, Gol Gumbaz, Golconda | `petalRing` cups at the dome bases (as at Charminar), `deccanMinaret`, `arcadeScreen` parapets, `merlons` |
| Bara Imambara, Chota Imambara, Rumi Darwaza | `iwan`/`niche`, `arcadeScreen`, `merlonParapet`, the existing Lucknow `guldasta` |

### Delhi and Lutyens: parts from the Old Parliament House and India Gate

| Monument | Parts to apply |
| --- | --- |
| Rashtrapati Bhavan | `colonnade` along the Durbar Hall portico and wings, with a new "Delhi Order" capital (Lutyens's bells); `eaveWithBrackets` along the long chhajja; jali `railing` on the roof and a `railingRing` round the dome's drum (the Sanchi rail); `mughalChhatri` with a plain spike for the roof kiosks; `screenedWindows`; `steps` and `porch` |
| New Parliament House | jali `railing` panels on the facades, `colonnade` at the entrances, `porch`, `screenedWindows` |
| National War Memorial | `lettering` at small size, or the existing incised-names surface, on the concentric walls |
| India Gate canopy | done |
| Lutyens bungalows and other civic buildings, if added later | the same `colonnade`, `eaveWithBrackets`, `railing` and `classicalDoor` |

### Other families

| Family | Source | Monuments |
| --- | --- | --- |
| Indo-Saracenic | Gateway of India: `octTurret`, `spandrelScreen`, eaves, attic arcade | Mysore Palace, Laxmi Vilas Palace, Victoria Memorial (corner kiosks), CSMT (with `clockFace` on its tower) |
| Rajput | a new `jharokha` (a bracketed balcony with a curved *bangaldar* roof) from `bracketGeo`, `chhajja` and `jali` | Hawa Mahal, City Palace, Amber, Mehrangarh, Jaisalmer, Chittorgarh; with `merlons` on the walls and `mughalChhatri` |
| Temples | `petalRing` and `lotusDome` for amalakas and lotus ceilings; `railing` for verandah rails; `templeDoorway` | all Nagara, Kalinga, Maru-Gurjara and Jain temples |
| Buddhist | `railingRing` for the vedika round a stupa; the existing `torana` | Sanchi, Dhamek, Mahabodhi |

## 6. Order of work and checks

| Phase | Work | Monuments improved |
| --- | --- | --- |
| 0 | Doorway kit; promote `iwan`, `mughalMinaret`, `pinnacle`, `merlonParapet`, `octTurret`, `colonnade`, `porch` into `components.js` with palettes and paths (no visual change to the five finished monuments) | foundation |
| 1 | `nagaraTemple`, `gopuram`, `mandap` | ~20 |
| 2 | Mughal family: doors and reuse together | ~20 |
| 3 | Forts and gates | ~11 |
| 4 | Delhi/Lutyens and Indo-Saracenic reuse | ~8 |
| 5 | Hand-built temples, then Rajput, colonial, Buddhist | the rest |

Each phase is done when:
- all 101 monuments still build;
- each changed monument is rendered from the default view, a close view of its entrance and a
  street-level view, and compared with the render from before the change;
- there is no flicker, since every detail stands 1–3 cm off the surface it decorates;
- each monument stays under about 200,000 triangles and a few dozen draw calls after merging;
- night mode shows nothing broken.

The headless render script used for this work can live in `tools/` so these checks can be
re-run.
