# Temple specificity plan

This is the task list for making each sacred model match the building a photograph names, instead of a generic shrine with a new colour. It is written so an IDE or agent can carry out one task without the rest of the chat.

Status is `origin/main` at `fa85962` (pull requests 18 and 19). `docs/temple-bases-and-storeys-plan.md` records how the shared plinth, stair and storeyed hall were designed. When that file and this one disagree about **remaining** work, follow this file. Tick a box here when the task is on `main`.

Out of scope: forts, palaces, tombs, mosques, bridges and memorials. Their builders stay as they are.

## How to work

1. Take **one task**. Do not start the next until this one is checked in the browser.
2. Edit `js/` only. `video/site/` is a generated copy. `video/sync-site.mjs` copies `js/` into it when someone runs `npm run sync` inside `video/`. Never hand-edit `video/site/`.
3. There is no build step. From the repo root: `npx serve .` and open `http://127.0.0.1:3000/#<id>`. The id is the `id` field in `js/data.js`.
4. Orbit the front stair, one corner of the plinth, and the default view. The default camera is the `view` array returned by the builder.
5. Keep the overall height at the figure in `js/data.js` (`stat`). Take extra floors out of the spire rather than growing the monument past that height.
6. Stay under about 300,000 triangles. Return `budget: 500000` only when the new storeys need it, and `batch: true` when the model is many separate parts (`js/batch.js` merges them).
7. Do not give every temple the Ram Mandir’s 6.5 m plinth. A low forest shrine, a Dravidian courtyard and Kamakhya’s beehive are specific because they sit low.
8. One commit per temple. Leave the shared helper (task T0) in its own commit before the temples that use it.

## Repository

```
index.html              site shell; import map for three.js; hash routing is in js/main.js
css/style.css           layout only; these tasks do not change it
js/data.js              MONUMENTS[]: id, hash, facts, load(), fn
js/main.js              loads MONUMENTS[i].load(), calls exports[fn](), frames the group
js/detail.js            detail.low on phones; builders read it and thin carving
js/helpers.js           box, cyl, mesh, at, onFace, M (shared materials), shikhara, pidaRoof,
                        steppedPlan, planPrism, planBand
js/coplanar.js          separateCoplanar: overlapping faces flicker if two boxes share a plane
js/batch.js             batchStatic: monuments that return batch:true
js/monuments/<id>.js    massing. export function buildX()
js/details/<id>.js      carving and fittings. export function addDetails(...)
js/details/temples.js   nagaraTemple, storeyedHall, gopuram, trabeateGate, wallWithGaps
js/details/doorways.js  steps, grandStair, templeDoorway, templePorch
js/details/components.js mouldings, niches, cuspedArchGeo, mergeByMaterial
js/details/sculpture.js figures, kuta, shala, miniSpireGeo
docs/                   earlier notes; not loaded by the site
video/                  a film of the same models; do not edit video/site/
```

A monument is three pieces, wired by `id`:

| Piece | File | Role |
| --- | --- | --- |
| Catalogue | `js/data.js` | `id`, `load: () => import('./monuments/<id>.js')`, `fn: 'buildX'` |
| Massing | `js/monuments/<id>.js` | Walls, plinth, roofs, stairs. Calls `addDetails`. |
| Detail | `js/details/<id>.js` | Bands, niches, figures. Reads the same coordinates as the massing file. The comment at the top lists those dimensions. Update it when the massing moves. |

`buildX()` returns `{ group, focus?, view, budget?, batch?, zoom?, fog?, minElevation? }`. `focus` is the building; `group` includes ground, water and trees. `addDetails` is called with `(focus, group)` from the massing file. `js/main.js` passes `group` through `separateCoplanar` unless the parts were merged.

Materials come from `M` in `js/helpers.js` (granite, marble, pink sandstone, and so on). A one-off stone is `mat('#hex', roughness)` from the same module. Reuse `M` so the photo textures in `js/textures.js` and `js/surface.js` still apply.

Phone mode: `detail.low` in `js/detail.js`. Gopurams already take `{ cheap: true }`. A new storey of figures should do the same, or the phone build will exceed its budget. Pass `?detail=low` to check.

## Shared parts already on main

Use these. Do not copy the Ram Mandir’s hall or stair into another file.

| Function | File | Use |
| --- | --- | --- |
| `nagaraTemple({...})` | `js/details/temples.js` | North Indian sanctum, spire and halls. Defaults: `base: { tiers: 2, cut: 0.8 }`, `stair: {}` (`grandStair`). `base: null` keeps one rectangular block. `stair: null` keeps plain `steps()`. `halls` entries are `[width, wallHeight, roofTiers, 'pida'\|'dome', storeys]`. `storeys > 1` builds `storeyedHall`. `sanctumStoreys` stacks balcony storeys under the spire. `spireBands` cuts the spire into horizontal floors. `userData.sy` is the spire’s foot, for anything placed on the spire afterwards. |
| `storeyedHall` | `js/details/temples.js` | Pillared floors, cusped arches, eaves, balcony rails, a stepped roof. The Ram Mandir’s `hall()` is this with `floors: 3`. |
| `grandStair(rise, width, m, sh, opts)` | `js/details/doorways.js` | About 0.2 m rises, side walls, optional landing. `opts`: `n`, `tread`, `landing`, `cheek`, `foot: 'elephant'`, `mid: 'lion'`, `top: true`. `userData.run` is the length along +z. The plinth face is at z = 0 and the stair runs towards +z. |
| `steps(width, rise, n, m, tread?)` | `js/details/doorways.js` | A short plain flight. Prefer this when the rise is about 1–2 m and the building has no ceremonial stair. |
| `gopuram(w, d, h, tiers, seed, palette, opts)` | `js/details/temples.js` | Dravidian gate tower. Already used by Meenakshi, Tirumala, Mallikarjuna, Ramanathaswamy, Padmanabhaswamy, Brihadisvara. |
| `trabeateGate`, `wallWithGaps` | `js/details/temples.js` | Post-and-lintel gate; a wall with openings where gates stand. |
| `planPrism`, `steppedPlan`, `planBand` | `js/helpers.js` | A plinth that follows a plan, with notched corners. The Ram Mandir plinth is `planPrism(plinthPlan(grow), y, h, m)` in `js/monuments/ram-mandir.js`. |
| `shikhara`, `pidaRoof` | `js/helpers.js` | Curved Nagara spire; stacked Kalinga or mandapa roof. A pidha is the wrong roof for a South Indian vimana (task T0). |
| `cuspedArchGeo`, `mergeByMaterial` | `js/details/components.js` | The five-lobed arch; bake a group into one mesh per material. |

`nagaraTemple` skips sanctum mouldings and bhumi-amalakas when `halls` is empty (`sanctumDetail` runs only if `placed.length`). Baidyanath’s ten small shrines pass `halls: []`, so they stay smooth. Task T8 fixes that.

Callers of `nagaraTemple` today: `js/monuments/somnath-temple.js`, `mahakaleshwar-temple.js`, `omkareshwar-temple.js`, `bhimashankar-temple.js`, `kashi-vishwanath-temple.js`, `trimbakeshwar-temple.js`, `baidyanath-temple.js`, `nageshwar-temple.js`, `grishneshwar-temple.js`, `palitana-temples.js`, `shikharji.js` (two shrines), `parshvanath-temple-khajuraho.js`, `soniji-ki-nasiyan.js`. They all inherit the two-tier plinth and `grandStair` unless they pass `base: null` or `stair: null`.

## Already done

Do not rebuild these.

- [x] **Shared plinth and stair.** `nagaraTemple` defaults to a two-tier plan-following plinth and `grandStair`. `storeyedHall` and `cuspedArchGeo` live in the shared files. The Ram Mandir imports them.
- [x] **Ram Mandir massing.** `js/monuments/ram-mandir.js` and `js/details/ram-mandir.js`. Three-tier plinth (`P = 6.5`) following `PLAN`, 32-step `grandStair` (elephants, lions, figures), porch, five halls of three storeys (`HALLS`), sanctum of three storeys, clustered spire, kalash at 49 m. Open `#ram-mandir`.
- [x] **Somnath.** `js/monuments/somnath-temple.js`: `base: { tiers: 3, cut: 1 }`, both halls `storeys: 2`, `spireBands: 7`, `stair: { width: 12 }`. Sea wall and Baan Stambh stay. Open `#somnath-temple`.
- [x] **Mahakaleshwar.** `sanctumStoreys: 2` in `js/monuments/mahakaleshwar-temple.js`. The third level is underground, so it is not a third exterior storey. Bhumija rows are placed at `t.userData.sy`. Colonnade, Koti Tirth and the town stay. Open `#mahakaleshwar-temple`.

## Dropped

Do not put these back.

- Ranakpur: no extra storey. The 1,444 pillars are an interior. `#ranakpur-jain-temple`
- Brihadisvara: no mandapa stair. The 13 talas and the courtyard approach are the building. `#brihadeeswara-temple`
- Omkareshwar: no five-storey sanctum. The island photograph is a cluster of white spires (task T9).
- Kamakhya: no Nagara plinth and no talas. The beehive in `js/monuments/kamakhya-temple.js` is the right silhouette.
- A 6.5 m Ram-style plinth on Bhimashankar, Grishneshwar, Nageshwar or the Kashi chowk. If the new default plinth looks too big there, pass `base: null` in that monument file.

## Tasks

Do T0 before T5, T6 and T16. The other tasks are independent.

### T0. One Dravidian vimana

- [ ] Add `dravidaVimana(w, tiers, tierH, m, shade)` to `js/details/temples.js`, next to `gopuram`.
- Copy the tier loop, corner `kuta`s and side `shala`s from the local `vimana()` in `js/monuments/kailasa-temple.js` (the Shore Temple’s `vimana()` in `js/monuments/shore-temple.js` is the same idea with a steeper taper). Export it. Leave Kailasa and the Shore Temple calling their local functions until a later cleanup, so this task does not change their silhouette.
- A vimana is square tiers (a wall course and a cornice), miniature shrines on the ledge, then an octagonal or round cap and a kalash. It is not `pidaRoof`.
- Done when Tirumala, Meenakshi and Mallikarjuna can import it without each growing a private copy.

### T1. Ram Mandir: gate, wall, corner shrines

Files: `js/monuments/ram-mandir.js`, `js/details/ram-mandir.js`. Hash: `#ram-mandir`.

The stair, plinth and five halls are built. `HALLS` in the details file is Gudh on axis, Kirtan and Prarthana at the sides, then Rang and Nritya. Keep that arrangement.

- [ ] Add the Singh Dwar as a gatehouse at the head of the existing 32-step stair (the stair’s comment already says it climbs to the Singh Dwar; the gate itself is missing). Use `trabeateGate` or the porch already returned by `porch()` in the details file, and do not add a second stair.
- [ ] Add the parkota, a rectangular enclosure around the plinth.
- [ ] Add four small shrines at the corners, for Surya, Bhagwati, Ganesh and Shiva. A short `nagaraTemple` or a `shikhara` on a cell is enough. Do not give each one the main temple’s three storeys.
- [ ] Keep the kalash at 49 m (`js/data.js` height).

### T2. Jagannath: the 22 steps and the outer wall

Files: `js/monuments/jagannath-puri-temple.js`, `js/details/jagannath-puri-temple.js`. Hash: `#jagannath-puri-temple`.

Today: one enclosure, Lion Gate (`trabeateGate` with `lions: true`) at `z = 59`, temple floor `B = 1.2`, rekha `shikhara` and three pidha halls. The Aruna Stambha is already added in the details file, in front of the gate. Keep the deul, the three halls, the Lion Gate and Aruna.

The published Baisi Pahacha is 22 steps, each about 70 feet long (about 21 m), 6 feet deep (about 1.8 m) and 8 inches high (about 0.2 m). Twenty-two such rises are about 4.5 m, so a flight sitting on the current 1.2 m floor is the wrong height.

- [ ] Raise the temple onto a terrace whose top is about 4.5 m. Keep the Lion Gate at court level.
- [ ] Run `grandStair(4.5, 21, m, d, { n: 22, tread: 1.8 })` from inside the gate up to that terrace. Reuse `grandStair`; do not invent another stair helper.
- [ ] Add the outer Meghanada wall, and three gates on it: tigers on the west, elephants on the north, horses on the south. `trabeateGate` already accepts `lions`; follow that pattern for the other animals (`js/details/animals.js`) rather than a new gate type.
- [ ] Keep the tower height at 65 m in `js/data.js`.

### T3. Kedarnath: steps and a coursed tower

Files: `js/monuments/kedarnath-temple.js`, `js/details/kedarnath-temple.js`. Hash: `#kedarnath-temple`.

Today: a 2 m platform (`box(22, 2, 34)`), sanctum and hall on it, porch and doorway at `y = 2` with no treads, a curved `shikhara`, Nandi, the 2013 boulder, mountains from `js/details/terrain.js`.

- [ ] Add a broad grey stair from the ground to the porch. The rise is 2 m, so this is about ten treads (`steps` or `grandStair` with `n` near 10). No elephants and no 32-step flight.
- [ ] Replace the curved `shikhara` with a near-straight pyramidal tower of horizontal courses. A profile close to `(k) => 1 - 0.5 * k`, or explicit ledges, matches the stone courses in photographs. Keep the grey materials.
- [ ] Add a small Bhairavanath shrine and the samadhi behind the temple.
- [ ] Keep the platform, porch, Nandi and boulder.

### T4. Kailasa and Vittala: stairs up to doors that open in the air

**Kailasa.** `js/monuments/kailasa-temple.js`, `js/details/kailasa-temple.js`. Hash: `#kailasa-temple`.

The doorway is at `y = 8` on the elephant plinth (`box(40, 8, 62)`). Nothing climbs to it. The main vimana is `vimana(19, 4, 3.4, ...)`.

- [ ] Add a stair on each side of the mandapa from the court floor to that door. Two calls to `grandStair` or `steps`, rotated onto the sides. Keep the elephant plinth, the Nandi bridge and the two victory pillars.
- [ ] Change the main vimana from 4 tiers to 3. Leave the small Nandi-pavilion vimana (`vimana(8, 2, ...)`) as it is.

**Vittala.** `js/monuments/vittala-temple-hampi.js`, `js/details/vittala-temple-hampi.js`. Hash: `#vittala-temple-hampi`.

`pillaredHall` puts its floor at 2.6 m. Doorways open there. The chariot and the ruined east gopuram are already built. Details already add plinth friezes.

- [ ] Add an east flight to each hall and a flight up to the stone chariot, so no door opens in mid-air.
- [ ] Elephant balustrades on the maha-mandapa stairs. Use `elephant` from `js/details/animals.js` beside `steps` or `grandStair`. Keep the musical pillars and the ruined brick gopuram.

### T5. Tirumala: the Ananda Nilayam

Files: `js/monuments/tirumala-temple.js`, `js/details/tirumala-temple.js`. Hash: `#tirumala-venkateswara-temple`.

Depends on T0. Today the sanctum is `box(12, 7, 12)` at `y = 0` plus `pidaRoof(12, 6, 3, ...)`, a hemisphere and a kalash, in `M.gild`. Two `gopuram`s are already correct. Leave them, and leave the sanctum at ground level.

- [ ] Replace the pidha and hemisphere with `dravidaVimana` in gold, enough tiers that it reads as a vimana rather than a mandapa roof, and a prominent kalash.
- [ ] Add a tall dwajasthambha (a gold-tipped mast) in front of the sanctum. A shaft, a small platform and a finial are enough.

### T6. Meenakshi: tank steps and vimanas

Files: `js/monuments/meenakshi-temple.js`, `js/details/meenakshi-temple.js`. Hash: `#meenakshi-temple`.

Depends on T0. All 14 `gopuram`s stay, including their `detail.low` options. The Golden Lotus Tank is a water box at `(-86, 0, 10)` inside a cloister, with a small gilt pavilion. The two shrine roofs are `pidaRoof` plus a hemisphere.

- [ ] Step the tank on all four sides: a flight down from the cloister walk to the water, on each side. `steps` or a ring of treads. Keep the central pavilion.
- [ ] Replace both gold pidha roofs with `dravidaVimana` in `M.gild`. The gopurams remain the tall masses; these vimanas stay small.
- [ ] Meenakshi is near the 500,000 triangle budget (`budget: 500000` in the builder). Count triangles before adding figures.

### T7. Mallikarjuna: vimanas only

Files: `js/monuments/mallikarjuna-temple.js`, `js/details/mallikarjuna-temple.js`. Hash: `#mallikarjuna-temple`.

Depends on T0. Four `gopuram`s stay. Two shrines use `pidaRoof` and sit at `y = 0`.

- [ ] Replace those two roofs with `dravidaVimana`.
- [ ] Leave the shrines at courtyard level. Do not add a Nagara plinth.

### T8. Baidyanath: the other temples in the court

Files: `js/monuments/baidyanath-temple.js`, `js/details/baidyanath-temple.js`, and the `halls: []` branch of `nagaraTemple` in `js/details/temples.js`. Hash: `#baidyanath-temple`.

The main shrine already has the shared plinth and stair, and a five-point crown (`panchashula`). Ten satellites are `nagaraTemple({ w: 5, h: 9, halls: [], ... })` at `spots`.

- [ ] Make a hall-less sanctum run the same base mouldings and bhumi-amalakas as a sanctum with halls. Do it inside `nagaraTemple`, so the skip cannot come back.
- [ ] Vary the satellite heights. Add more simple shrines so the walled court reads as the group of 22 published for Deoghar. They can share one or two sizes. Keep the main spire and the panchashula as the tallest.
- [ ] Add an east gate in the existing wall if the court still reads as a closed box.

### T9. Omkareshwar: a cluster, not five storeys

Files: `js/monuments/omkareshwar-temple.js`, `js/details/omkareshwar-temple.js`. Hash: `#omkareshwar-temple`.

Keep the Om-shaped island (`islandGeo`), the Narmada sheet and the eight ghat terraces. The single `nagaraTemple` at `(0, 8, -18)` now has the shared plinth and stair. Do not set `sanctumStoreys: 5`.

- [ ] Replace that one shrine with a cluster of white shikharas of different heights on the ghat. One of them is the jyotirlinga and can stay a full `nagaraTemple`.
- [ ] Add a smaller shrine on the south bank for Mamleshwar.

### T10. Palitana: the pilgrim stair

Files: `js/monuments/palitana-temples.js`, `js/details/palitana-temples.js`. Hash: `#palitana-temples`.

Adinath is one `nagaraTemple` and already inherits the shared plinth and stair. The hill path is a loop of 30 boxes. The details comment cites about 3,800 steps. Do not model every step.

- [ ] Replace the 30 blocks with a switchback of many more visible treads, enough that the climb is the subject and the white city is at the top.
- [ ] Vary the heights of the instanced mini-spires. Leave Adinath as the one fully built temple.

### T11. Gommateshwara: the same kind of stair

Files: `js/monuments/gommateshwara.js`, `js/details/gommateshwara.js`. Hash: `#gommateshwara`.

The colossus and the hilltop cloister stay. The climb is 24 boxes (`for k in 0..23`).

- [ ] Lengthen that climb into a switchback that reads as the Vindhyagiri stair. Leave the figure unstoreyed.

### T12. Dilwara: a flight at the door

Files: `js/monuments/dilwara-temples.js`, `js/details/dilwara-temples.js`. Hash: `#dilwara-temples`.

The exterior is plain on purpose. The doorway sits at `y = 2.5` with no flight. The open dome and its pendant stay.

- [ ] Add a short `steps` flight from the court up to that door.
- [ ] Optional, after the flight: a second, simpler compound for Luna Vasahi, so the site is not only Vimal Vasahi. Keep its outer wall plain.

### T13. Soniji ki Nasiyan: the street front

Files: `js/monuments/soniji-ki-nasiyan.js`, `js/details/soniji-ki-nasiyan.js`. Hash: `#soniji-ki-nasiyan`.

The golden model city inside the hall is the right interior. The outside is still a `nagaraTemple` (now with the shared plinth and stair).

- [ ] Replace that free-standing spire temple with a two-storey red sandstone street front (walls, jharokhas from `js/details/components.js`, a door) and only a small spire on the roof.
- [ ] Keep the golden city inside.

### T14. Kandariya: a real stair

Files: `js/monuments/kandariya-mahadeva.js`, `js/details/kandariya-mahadeva.js`. Hash: `#kandariya-mahadeva`.

The jagati, three pidha halls and urushringas stay. The approach is four boxes (`for k in 0..3`, each rise about 0.75 m) plus `steps(8, 2, 5)`.

- [ ] Replace the four boxes with `grandStair`, about 15 rises and side walls, up to the porch. Keep the sculpture bands.

### T15. Signatures, one object each

Each of these is a single change. Do not rebuild the massing.

- [ ] **Kashi Vishwanath** `#kashi-vishwanath-temple`, `js/monuments/kashi-vishwanath-temple.js`. The corridor, ghats and gate stay. If the new two-tier plinth crowds the chowk, pass `base: null`. Shrink the gold spire so it sits among the arcades, add horizontal bands (`spireBands`), and add a smaller Annapurna spire beside it.
- [ ] **Parshvanath** `#parshvanath-temple-khajuraho`, `js/monuments/parshvanath-temple-khajuraho.js`. The 3 m podium now carries the shared plinth and stair. Add the balcony rail Kandariya uses, and a seated tirthankara in the niches instead of the Shaiva guardian.
- [ ] **Grishneshwar** `#grishneshwar-temple`, `js/monuments/grishneshwar-temple.js`. The five-band profile is `(k) => 1 - 0.55 * Math.floor(k * 5) / 5 - 0.08 * k`. Deepen those ledges so five storeys read against the cliff. Keep it small.
- [ ] **Trimbakeshwar** `#trimbakeshwar-temple`, `js/monuments/trimbakeshwar-temple.js`. Keep the black Bhumija spire and the Kushavarta kund. Add steps through the south gate (`box(20, 9, 8)` at `z = 45`). The three-faced lingam stays inside.
- [ ] **Nageshwar** `#nageshwar-temple`, `js/monuments/nageshwar-temple.js`. The 25 m Shiva (`mahayogiShiva` in the details file) is the subject. Pass `base: null` if the new plinth makes the pink temple compete with the statue.
- [ ] **Shikharji** `#shikharji`, `js/monuments/shikharji.js`. Keep the domed tonks. Vary the twenty summit shrines (height or dome size) so they are not one repeated mesh. Do not turn them into shikharas. The two `nagaraTemple` shrines can keep the shared plinth.
- [ ] **Konark** `#konark-sun-temple`, `js/monuments/konark-sun-temple.js`, `js/details/konark-sun-temple.js`. Keep the chariot plinth, 24 wheels, seven horses, pidha roofs and the ruined deul. Add stairs on the other open sides of the jagamohana, with elephant and horse guardians.
- [ ] **Akshardham** `#akshardham`, `js/monuments/akshardham.js`. Keep the elephant plinth, the five-block stair and the nine domes. Add a ring of miniature shikharas on the mandapa roofs (`miniSpireGeo` in `js/details/sculpture.js`).
- [ ] **Golden Temple** `#golden-temple`, `js/monuments/golden-temple.js`, `js/details/golden-temple.js`. Keep both storeys, the level causeway and the five-storey Akal Takht. Cut a few ghats from the marble parikrama down to the pool.
- [ ] **Padmanabhaswamy** `#padmanabhaswamy-temple`, `js/monuments/padmanabhaswamy-temple.js`. Keep the seven-tier `gopuram` and the copper hip roof. Add a tall gold-tipped dwajasthambha in front of the gopuram.
- [ ] **Ramanathaswamy** `#ramanathaswamy-temple`, `js/monuments/ramanathaswamy-temple.js`. Keep the nested corridors (`PH = 1.3`). After T0, replace the two `pidaRoof` shrine roofs with `dravidaVimana`.
- [ ] **Chennakesava** `#chennakesava-temple`. The pin in `js/data.js` is Somanathapura (1258, three star shrines). The three `stellateTower`s, the star jagati and the four steps in `js/monuments/chennakesava-temple.js` are right for that temple. `js/details/chennakesava-temple.js` still says Belur and describes Belur’s lost vimana and lamp pillar. Rewrite those comments to Somanathapura, and remove the Belur-only lamp pillar if it is only there because of that misreading. Do not remove the three towers.
- [ ] **Sanchi** `#sanchi-stupa`, `js/monuments/sanchi-stupa.js`, `js/details/sanchi-stupa.js`. Keep the drum, the south stair, the harmika and the three umbrellas. The remaining work is torana carving: elephants, riders, yakshi brackets, in the details file.
- [ ] **Ajanta** `#ajanta-caves`, `js/monuments/ajanta-caves.js`. Three caves are full halls. Give the other mouths alternating chaitya arches and vihara porches so they are not identical dark boxes.
- [ ] **Dhamek** `#dhamek-stupa`, `js/monuments/dhamek-stupa.js`, `js/details/dhamek-stupa.js`. Keep the drum and the brick cylinder. Deepen the carving on the eight projecting faces.

## Leave the massing

| Monument | Hash | Why it stays |
| --- | --- | --- |
| Bhimashankar | `#bhimashankar-temple` | Low basalt shrine, shared stair already applied, bell frame beside it. `base: null` only if the new plinth looks too tall. |
| Ranakpur | `#ranakpur-jain-temple` | 5 m plinth, stairs on four faces, dome forest, shikhara. |
| Brihadisvara | `#brihadeeswara-temple` | 13 talas, Nandi, two granite gopurams, courtyard entry. |
| Kamakhya | `#kamakhya-temple` | Beehive sanctum and curved roofs. |
| Lotus Temple | `#lotus-temple` | Two-tier podium, nine stairs, nine pools, petals. |
| Mahabodhi | `#mahabodhi-temple` | Terrace, ten steps, niches, Bodhi tree, railing. |
| Ramappa | `#ramappa-temple` | Two-tier star platform, seven steps, seven brick tiers. |
| Shore Temple | `#shore-temple` | Two vimanas (5 and 4 storeys) and a flat shrine between them. |
| Hidimba | `#hidimba-devi-temple` | Stone base, three steps, three pagoda roofs. |
| Nalanda, Temple 3 | `#nalanda-mahavihara` | Five terraces and the east ramp. |

## Checking a task

From `docs/monument-details.md`:

1. `npx serve .` at the repo root.
2. Open the hash in the task. Reset the view. Look at the stair from the front and at one corner of the base.
3. Confirm the new part is the part named in the task, and that a finished neighbour (Somnath, the Ram Mandir, a gopuram) did not change.
4. If the builder returns a budget, stay inside it. Merged detail goes through `mergeByMaterial`. Floor slabs that touch each other stay as separate boxes so `js/coplanar.js` can separate them.
