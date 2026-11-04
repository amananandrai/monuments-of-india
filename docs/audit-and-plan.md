# Audit of every monument, and the plan from it

Every monument was checked one by one, by measurement and by eye. These are the findings, and the
plan of work that follows from them.

## How it was checked

- **Renders**: each monument drawn from the app's own home view (the same framing as
  `computeHome` in `js/main.js`, after the same `naturalize`, `separateCoplanar` and
  `blendIntoLand` passes, with the photo textures), and the renders reviewed one by one.
- **Framing**: the radius the camera frames (the whole focus group) against the radius of what is
  actually built there (meshes rising more than 2.5 m, without instanced trees and lamps). A ratio
  well above 1 means a long shot: lawns, plazas, water or distant outbuildings set the distance.
- **Scenery in the way**: 192 camera positions over the range a visitor can orbit and zoom (four
  distances up to 2.6 times the home distance, at the home elevation and near the horizon). Each
  counts as blocked if a ray to the monument meets scenery first, or as inside if the camera stands
  inside a hill, cliff or tree. This is what shows as "floating layers": the near plane slicing
  through a hill the camera has entered.
- **Flicker**: every pair of faces of different materials that lie in the same plane, face the same
  way and overlap by at least 0.02 m², after the app's own depth offsets. Faces nobody can see
  (backs against a wall, faces enclosed within 5 cm) are left out. The area is the total in m².
- **Triangles**: the cost of each monument (the budget is 300,000).

## What was found, across the monuments

1. **Long shots.** 16 monuments frame 1.3 to 4.8 times what is built, Charminar, Ram Mandir, the
   Shore Temple, Qutub Minar and Akbar's Tomb worst. The framing uses the box round everything in the
   focus group, lawns and plazas included.
2. **Hills in the orbit.** At Tirumala the Seshachalam hills stand 260 to 340 m out but are up to
   240 m wide, while the camera orbits about 220 m out and can zoom to 660 m: it passes through
   them, and the near plane cuts them into floating slices. The same happens with the hills or peaks
   of Mallikarjuna, Bhimashankar, Rumtek, Key, Thiksey, Tawang, Kedarnath, Kargil, Trimbakeshwar and
   Hazratbal, and the deodar forest at Hidimba.
3. **Flicker.** The large cases are shared parts: belt courses sunk into walls whose tops are flush
   with the wall top, arcade sills and fort-gate floors flush with the reveals beside them, door
   frames flush with gopuram passages, the lights of Gothic windows flush with their reveal; and a
   few builder bugs (the beach at Vivekananda Rock level with the sea, Kandariya's porch base flush
   with the platform, the rings on fort-gate towers flush with the tower tops).
4. **Flags.** Every flag is a flat board (the tricolours) or a flat triangle (the temple pennants):
   no cloth, no fold, and the Nishan Sahibs at the Golden Temple read as planks.
5. **Trees.** One kind of tree everywhere: a lobed ball on a stick. Monuments with triangles to spare
   can afford fuller trees.
6. **Thin detail on the most intricate monuments.** Rani ki Vav, the Hawa Mahal, the Sanchi stupa and
   the Ajanta caves are far richer in reality than their models.

## Per monument

Triangles; framing ratio (1 is tight); scenery (blocked / inside, of 192 views); flicker (m² of
visible coincident faces); notes.

| Monument | Tris | Framing | Scenery | Flicker | Notes |
| --- | --- | --- | --- | --- | --- |
| qutub-minar | 39k | 1.8 | 0/0 | 0 | Long shot: the lawns and ruins set the framing; frame the minar and the mosque ruins. |
| gateway-of-india | 101k | 1.22 | 0/0 | 24 | Good. Small hidden clash on the roof box. |
| taj-mahal | 177k | 1.19 | 0/0 | 0 | Good. |
| charminar | 108k | 4.81 | 0/0 | 0 | Very long shot (the asphalt square sets the framing); frame the building. Add the mosque on the top floor. |
| ram-mandir | 75k | 2.08 | 0/0 | 0 | Long shot (the lawns set the framing). |
| brihadeeswara-temple | 133k | 1.32 | 0/0 | 0 | Slightly long shot. Add the Nandi mandapa carving and gopurams of the outer court. |
| india-gate | 73k | 1.11 | 0/0 | 0 | Good. |
| statue-of-unity | 135k | 1 | 0/0 | 5 | Good. Detailed trees affordable. |
| howrah-bridge | 33k | 1 | 0/0 | 0 | Good. |
| jagannath-puri-temple | 179k | 1 | 0/0 | 8 | Good. The flags are flat triangles; make them cloth. |
| golden-temple | 46k | 1.04 | 4/0 | 5 | Shot favours the tank; frame the Harmandir closer. Nishan Sahib flags are flat boards; make them cloth on proper staffs. |
| hawa-mahal | 33k | 1.02 | 0/0 | 0 | Head-on long shot. Needs more: cusped arches, curved roofs mixed with domes, fluted pilasters, lotus finials, the side walls. |
| konark-sun-temple | 281k | 1.01 | 0/0 | 0 | Near the triangle budget. |
| meenakshi-temple | 297k | 1.09 | 0/0 | 25 | Long shot of the whole complex; near the budget. |
| lotus-temple | 62k | 1.38 | 0/0 | 0 | Long shot (gardens). Add the nine entrance canopies and the inner petal layer detail. |
| gol-gumbaz | 106k | 1.07 | 0/0 | 10 | Good. |
| mysore-palace | 169k | 1.07 | 0/0 | 11 | Good. |
| sanchi-stupa | 66k | 1.02 | 0/0 | 0 | Needs more: torana architraves with volutes and carved panels, elephant and lion capitals, the harmika railing and triple umbrella, the berm railing and stair balustrade. |
| mahabodhi-temple | 75k | 1.18 | 0/0 | 0 | Good. |
| red-fort | 44k | 1 | 0/0 | 2 | Good. Tricolour is a rigid board; make it cloth. |
| old-parliament-house | 135k | 1 | 0/0 | 0 | Good. |
| rashtrapati-bhavan | 45k | 1 | 4/0 | 62 | Good. Tricolour board. |
| humayuns-tomb | 129k | 1.04 | 0/0 | 22 | Good. |
| jama-masjid | 62k | 1.03 | 0/0 | 6 | Good. |
| new-parliament-house | 39k | 1 | 0/0 | 0 | Good. |
| dilwara-temples | 57k | 1.13 | 0/0 | 0 | Good. |
| akshardham | 197k | 1.03 | 0/0 | 13 | Good. |
| kandariya-mahadeva | 175k | 1.06 | 0/0 | 16 | Good (porch base clash fixed). |
| ranakpur-jain-temple | 113k | 1.09 | 0/0 | 3 | Good. |
| chennakesava-temple | 82k | 1.04 | 0/0 | 0 | Good. |
| victoria-memorial | 269k | 1.19 | 0/0 | 0 | Good. |
| csmt | 136k | 1.03 | 0/0 | 96 | Good (window reveal clash fixed). |
| kailasa-temple | 142k | 1.01 | 76/0 | 1 | The pit walls hide the temple from low angles (by design); start the view higher. |
| vittala-temple-hampi | 297k | 1 | 0/0 | 7 | At the budget; boulders fine. |
| padmanabhaswamy-temple | 72k | 1 | 0/0 | 2 | Good. |
| basilica-of-bom-jesus | 45k | 1.01 | 0/0 | 0 | Good. |
| kamakhya-temple | 46k | 1.07 | 0/0 | 0 | Good. |
| tawang-monastery | 59k | 1 | 7/41 | 1 | Mountains close behind: the camera enters them when zoomed out. |
| amber-fort | 142k | 1 | 32/0 | 0 | Hill terraces block low views; fine at the home view. |
| rani-ki-vav | 117k | 1.07 | 138/14 | 0 | Needs much more: carved pavilion pillars with brackets, tiers of sculpture panels on the side walls, the well shaft with its galleries, steps and landings. Start the view higher to see into the trench. |
| ramappa-temple | 52k | 1.78 | 0/0 | 0 | Long shot (the compound wall sets the framing). |
| kedarnath-temple | 59k | 1.09 | 0/61 | 0 | Massif close behind: the camera enters it when zoomed out. |
| hazratbal-shrine | 44k | 1.01 | 1/11 | 17 | Hills across the lake within zoom range. |
| shore-temple | 169k | 2.04 | 0/0 | 0 | Long shot (beach).  |
| gwalior-fort | 100k | 1 | 16/0 | 0 | Good. |
| nalanda-mahavihara | 29k | 1.19 | 0/0 | 0 | Good. |
| tirumala-venkateswara-temple | 72k | 1 | 15/100 | 9 | Hills only 260-340 m out but up to 240 m wide: the orbit passes through them (the floating layers reported). Move them out and shrink them. |
| capitol-complex | 15k | 1.02 | 0/0 | 0 | Long shot over the empty plaza. |
| hidimba-devi-temple | 42k | 1.46 | 41/125 | 0 | Deodars crowd the orbit: the camera passes through their crowns. |
| bandra-worli-sea-link | 26k | 1 | 2/5 | 0 | Skyline blocks a few views; fine. |
| buland-darwaza | 42k | 1.01 | 0/0 | 0 | Good. |
| panch-mahal | 21k | 1.18 | 0/0 | 0 | Good. |
| bara-imambara | 109k | 1.02 | 0/0 | 12 | Good. |
| rumi-darwaza | 33k | 1.01 | 0/0 | 3 | Good. |
| chota-imambara | 61k | 1.02 | 0/0 | 3 | Good. |
| itmad-ud-daulah | 51k | 1.79 | 0/0 | 3 | Slightly long shot (garden). |
| akbars-tomb | 199k | 1.46 | 0/0 | 31 | Long shot (the gateway 140 m away sets the framing). |
| agra-fort | 53k | 1.01 | 0/0 | 49 | Good. |
| bibi-ka-maqbara | 108k | 1.02 | 0/0 | 0 | Good. |
| safdarjung-tomb | 99k | 1.02 | 0/0 | 33 | Good. |
| somnath-temple | 121k | 1 | 0/0 | 0 | Good. |
| mallikarjuna-temple | 112k | 1 | 40/83 | 17 | Hills close round the temple: the orbit passes through them. |
| mahakaleshwar-temple | 121k | 1.36 | 0/0 | 0 | Slightly long shot. |
| omkareshwar-temple | 111k | 1.02 | 72/0 | 0 | The island hill blocks low views from the river side. |
| bhimashankar-temple | 92k | 1.09 | 30/130 | 0 | Hills and trees close round: the orbit passes through them. |
| kashi-vishwanath-temple | 117k | 1 | 0/0 | 0 | Good. |
| trimbakeshwar-temple | 135k | 1 | 4/9 | 0 | Brahmagiri plateau within zoom range. |
| baidyanath-temple | 128k | 1 | 0/0 | 16 | Good. |
| nageshwar-temple | 293k | 1.01 | 0/0 | 2 | Near the budget. |
| ramanathaswamy-temple | 141k | 1 | 0/0 | 7 | Good. |
| grishneshwar-temple | 129k | 1.01 | 0/0 | 2 | Good. |
| dhamek-stupa | 72k | 1.01 | 0/0 | 0 | Good. |
| ajanta-caves | 68k | 1 | 136/0 | 0 | Needs more: carved cave fronts (pillared verandahs with capitals and brackets, doorways, windows), sculpted chaitya facades, steps to each cave. |
| rumtek-monastery | 12k | 1.32 | 8/165 | 1 | Hills close round: the orbit passes through them. |
| thiksey-monastery | 21k | 1 | 23/78 | 0 | Peaks within zoom range. |
| key-monastery | 51k | 1 | 40/141 | 0 | Peaks within zoom range. |
| gommateshwara | 116k | 1.01 | 0/0 | 0 | Good. |
| palitana-temples | 207k | 1.02 | 0/0 | 0 | Good. |
| shikharji | 135k | 1.99 | 0/0 | 0 | Long shot along the ridge. |
| parshvanath-temple-khajuraho | 158k | 1.01 | 0/0 | 2 | Good. |
| soniji-ki-nasiyan | 121k | 1.01 | 0/0 | 0 | Good. |
| mehrangarh-fort | 38k | 1 | 0/0 | 0 | Good. |
| chittorgarh-fort | 43k | 1.33 | 0/0 | 0 | Slightly long shot along the plateau. |
| jaisalmer-fort | 168k | 1 | 0/0 | 70 | Good. |
| golconda-fort | 50k | 1 | 18/0 | 70 | Good. |
| daulatabad-fort | 32k | 1 | 61/0 | 89 | Good. |
| city-palace-udaipur | 131k | 1 | 0/0 | 0 | Good. |
| laxmi-vilas-palace | 200k | 1 | 0/0 | 19 | Good. |
| fort-aguada | 17k | 1 | 4/0 | 0 | Good. |
| bekal-fort | 45k | 1 | 0/0 | 55 | Good. |
| cooch-behar-palace | 163k | 1.01 | 0/0 | 9 | Good. |
| sher-shah-suri-tomb | 96k | 1 | 0/0 | 0 | Good. |
| cellular-jail | 71k | 1 | 0/0 | 0 | Good. Tricolour board. |
| shaheed-minar | 21k | 1.1 | 0/0 | 0 | Good. |
| tipu-sultan-gumbaz | 36k | 1.04 | 0/0 | 0 | Good. |
| qutb-shahi-tombs | 219k | 1.03 | 0/0 | 43 | Long shot of the whole necropolis. |
| vivekananda-rock-memorial | 115k | 1 | 0/0 | 72002 | Beach level with the sea (flicker); fixed. |
| jallianwala-bagh | 17k | 1.08 | 0/0 | 0 | Good. |
| kargil-war-memorial | 2k | 1.37 | 8/102 | 0 | Mountain close behind; big flag is a rigid board. |
| national-war-memorial | 20k | 1.94 | 0/0 | 0 | Long shot (the ring of trees sets the framing). |
| kirti-mandir | 28k | 1.09 | 0/0 | 2 | Good. |


## Plan

1. **Framing** (`js/main.js`): frame the built structure rather than the whole focus group, so
   ground-level lawns, plazas and water no longer set the distance; set tighter focus groups where
   outbuildings far from the monument do (Qutub Minar, Akbar's Tomb, the Capitol Complex), and a
   higher home view at Rani ki Vav, Kailasa and the Qutb Shahi tombs.
2. **Scenery** : move the hills, peaks and forests out of the orbit, and cap the zoom-out
   (`maxDistance`) so the camera stops short of any remaining scenery.
3. **Flicker**: fix the shared parts (belt courses stand 2 mm clear of the wall; sills, gate floors,
   door frames and window lights pulled a centimetre in) and the builder bugs, then re-run the check.
4. **Flags**: cloth flags with folds, hoisted on staffs with finials: the tricolours with the Ashoka
   Chakra on both faces, the temple pennants, the Nishan Sahibs.
5. **Trees**: a second, fuller tree (branching limbs, several leaf clumps, a fuller palm and deodar),
   used wherever the monument has triangles to spare; the plain tree stays elsewhere.
6. **Detail**: Rani ki Vav (pavilion pillars and brackets, tiers of sculpture on the walls, the
   well's galleries), the Hawa Mahal (cusped arches, curved and domed roofs, pilasters, finials),
   Sanchi (the toranas' carved architraves and capitals, the harmika and umbrellas, the berm railing
   and stair), Ajanta (pillared cave fronts, doorways and sculpted facades).

## Status

All six parts of the plan are built, and the checks were run again on every monument.

- **Framing**: the home view frames the monument as built (`js/framing.js`): lawns, plazas, paths,
  water and other ground-level things under 2.5 m, and the trees and lamps (marked as dressing),
  no longer set the distance, and the camera stands back 10% more so tall monuments are not
  clipped. Qutub Minar and Akbar's Tomb frame the monument rather than their outbuildings. A
  monument can ask for a closer view (`zoom`): the Hawa Mahal's flat facade, and Rani ki Vav, now
  seen down the trench from the top of the steps.
- **Scenery**: the hills, peaks and forests named above were moved out of the orbit, and the zoom-out
  stops short of any scenery that remains (`sceneryReach` in `js/main.js`). The camera now enters
  scenery in none of the 192 test views of any monument (it did at 14 monuments). Rani ki Vav and
  Kailasa, in a trench and a pit, keep the camera above a minimum elevation (`minElevation`). The
  views still counted as blocked are low views of monuments in pits or behind cliffs and hills
  (Kailasa, Rani ki Vav, Ajanta, Amber, Golconda, Daulatabad, Gwalior, Omkareshwar), where the
  ground itself hides them, as it does in reality.
- **Flicker**: the visible coincident faces fell from about 890 m² (and the whole beach at
  Vivekananda Rock) to 92 m² over all 101 monuments, none above 10 m².
- **Flags**: every flag is cloth (`clothGeometry` in `js/helpers.js`).
- **Trees**: `upgradeTrees` gives 75 monuments fuller trees; the rest keep the plain ones to stay
  within budget. Hidimba, Bhimashankar, the National War Memorial and Tipu Sultan's Gumbaz now plant
  the shared trees too.
- **Detail**: Rani ki Vav, the Hawa Mahal, the Sanchi gateways and the Ajanta cave fronts were carved
  as planned.

Every monument still builds within 300,000 triangles.

## Second pass: the photo fidelity review

A second review set each monument beside photographs: 75 read as the place, 24 come close, and 2
were stand-ins. The four richest temples also got a larger triangle budget. A builder may return
`budget` (the default is 300,000), which `main.js` passes to `upgradeTrees`.

Done in this pass:

| Monument | Change |
| --- | --- |
| Meenakshi (budget 500k) | 14 gopurams, not 8: the shrines of Sundareswarar and Meenakshi each get an enclosure with three small gopurams. The outer gopurams carry a figure every 1.6 m and a kudu over every bay; the inner ones carry a figure every 1.8 m (`gopuram(…, { pitch, kuduEvery })`). |
| Konark (budget 500k) | The 24 wheels are carved sundials: eight broad spokes with medallions, eight thin spokes, a beaded rim and a petalled hub (`carvedWheelGeo` in `sculpture.js`). The seven horses stand larger on pedestals either side of the stairs, with breast straps. |
| Vittala, Hampi (budget 500k) | The yali pillars stand on elephants and carry full carved riders (`yaliPillar(…, { rich })`). The chariot has carved wheels. The friezes are denser and the parapet's shrines finer. The Kalyana Mandapa's pillars carry dancers. |
| Nageshwar (budget 500k) | Two rings of minor spires, a domed hall before the sanctum, neem trees and palms. |
| Bandra–Worli Sea Link (stand-in) | The second, smaller inverted-Y pylon over the Worli channel, with its own cable fans. The home view is closer. |
| Mahakaleshwar (stand-in) | A Bhumija spire: rows of miniature spires between the central bands, in pale stone under a gilded kalash. The old town hems it in: houses of two to four storeys with balconies and water tanks, from the new `townHouses` helper. |
| Safdarjung | Weathered buff and brownish-red stone. The dome is a more bulbous profile of buff marble. |
| Somnath | A broad sabha mandap under a great stepped roof, and a taller spire. `nagaraTemple` takes an `apron`, so a broad hall fits on its plinth. |
| Red Fort | Inside the walls: the Naubat Khana, the Diwan-i-Aam, and along the river wall the white marble Diwan-i-Khas (four gilded kiosks), Rang Mahal, Khas Mahal with the Musamman Burj, Mumtaz Mahal, and the Moti Masjid's three domes. |
| Golden Temple | The Akal Takht, across the plaza from the Darshani Deori: marble arcades below, gilded storeys with bay windows, and a fluted golden dome. |
| India Gate | Netaji's statue under the canopy (a new `leader` pose for `figure`). |

Then the rest of the review's list (the Statue of Unity was left as it is, at the owner's request):

| Monument | Change |
| --- | --- |
| Taj Mahal | The red sandstone mosque and its twin the jawab, three domes each, on the terrace either side; the Yamuna behind a sandy bank. |
| Charminar | Slimmer minaret shafts and domes above the roof; the mosque on the roof's western side. |
| Lotus Temple | Nine leaf-shaped pools hugging the podium between the paths, in place of rectangles. |
| Mahabodhi | A chaitya-arch niche with a seated Buddha across every storey of the tower, as many as fit. |
| Hawa Mahal | Every upper window is a projecting half-octagon oriel with jali facets, dome and corbel: the honeycomb front. |
| Gol Gumbaz | Already has seven-storey octagonal corner towers with domes; unchanged. |
| Dilwara | The Ranga Mandapa's dome open from below: corbelled carved rings, sixteen bracket goddesses, the pendant. |
| Ranakpur | The hall opened on its east and south sides onto a forest of carved pillars round the shrine. |
| Ramappa | Madanika bracket figures in polished black stone leaning out from the outer pillars; the pale "floating brick" tower with miniature shrines on every ledge. |
| Mallikarjuna | Two bands of relief (processions of elephants and horses, figures) along the outer walls. |
| Omkareshwar | Mandhata island as terrain shaped like Om in plan, with painted houses on its slopes. |
| Bhimashankar | Forest crowding round the court; the great bell under a stone frame. |
| Trimbakeshwar | The Peshwa spire with rows of miniature spires and a gilded kalash; the Kushavarta tank with its steps, veranda and corner shrines. |
| Ramanathaswamy | Each corridor a long walkway between pillars on raised platforms, with bracket capitals and painted ceiling medallions. |
| Grishneshwar | The terraced Ellora scarp to the north, with cave mouths. |
| Parshvanath | New figure poses from Khajuraho's walls: mirror, thorn, fly-whisk. |
| Soniji ki Nasiyan | The gallery closed behind so the gilded city reads through its open front, with airships and elephants. |
| Gommateshwara | Anthills with snakes beside the legs; leaves on the creepers. |
| New Parliament | The National Emblem: four bronze lions on a wheeled abacus. |
| Victoria Memorial | The Angel of Victory with wings and trumpet; Queen Victoria enthroned in the forecourt. |
| CSMT | The statue of Progress, with torch and wheel, on the dome. |
| Rumtek | A two-tier gilded roof with a clerestory and a golden gyaltsen. |
| Key Monastery | The Spiti valley: banded, gullied mountain walls to snow, and a braided river on a gravel bed. |
| Nalanda | Continuous brick walls standing to ragged heights, broken through in places, with the cell walls. |
| Golconda | An irregular hill; the walls follow its contours with a broken parapet; roofless ruins on the slopes. |
| Gwalior | Pictures in the Man Mandir's tiles: ducks, elephants and banana trees. |
| Bara Imambara | The Bhool Bhulaiya: a maze of passages on the roof round the pavilions. |
| Capitol Complex | The Secretariat's brise-soleil: light egg-crate over dark glazing, double-height loggias at the ministers' block, two ramp towers, roof forms; the Secretariat moved back and west of the Assembly. |

New shared parts from this pass: `townHouses` (realism.js), `carvedWheelGeo` and the figure poses
`leader`, `enthroned`, `mirror`, `thorn` and `chauri` (sculpture.js), `bhumijaRows` (temples.js),
and options on `gopuram` (`pitch`, `kuduEvery`), `yaliPillar` (`rich`) and `nagaraTemple` (`apron`).

Still open: the Statue of Unity (left as it is); the distance between the Capitol's Assembly and
High Court, which is shorter than the real esplanade.
