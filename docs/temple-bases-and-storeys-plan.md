# Temple bases, stairs and storeys: plan

The Ram Mandir now has a plinth that follows the building's plan, a 32-step stair and three
storeys of pillared galleries (see `js/details/ram-mandir.js`). This plan looks at the other
temples and lists which ones should also get a different base, a proper stair or more floors.
It also says where each change goes.

Facts marked *(verify)* come from general knowledge, not from a photo checked in this pass.
Look at photographs before building them, as was done for the Ram Mandir.

## What the temples share today

Thirteen temples are built by `nagaraTemple()` in `js/details/temples.js`: Somnath,
Mahakaleshwar, Omkareshwar, Bhimashankar, Kashi Vishwanath, Trimbakeshwar, Baidyanath,
Nageshwar, Grishneshwar, Palitana, Shikharji (two shrines), Parshvanath (Khajuraho) and Soniji
ki Nasiyan. Whatever the real temple looks like, every one of them gets:

- **One rectangular block as its plinth:** `box(sw + apron, plinth, …)`, with no offsets, tiers or
  mouldings round it.
- **One straight stair at the front:** `steps(stairW, plinth, ceil(plinth / 0.42))`. It has
  rises of up to 0.42 m, no landing and no side walls. There are also small side flights to the
  first hall.
- **Single-storey halls:** each is a box with a stepped roof (`pidaRoof`) or a dome, and a figure
  frieze. No hall has a gallery, a balcony or an upper floor.
- **A sanctum of one storey:** its wall is `w * 0.7` high under the spire.

The other temples have their own builders. Most already model their base well: the star
platforms of Ramappa and Chennakesava, Konark's chariot plinth, the elephant plinths of Kailasa
and Akshardham, and Kandariya's high platform. A few still simplify the real temple's stairs or
storeys.

## Parts the Ram Mandir work made, to reuse

| Part | Where now | Use |
| --- | --- | --- |
| `steppedPlan`, `offsetPlan`, `planPrism`, `planBand` | `js/helpers.js` | A plinth that follows the building, with notched corners, in tiers, with moulded bands |
| `stair()` (32 steps, landing, side walls, guardians) | `js/monuments/ram-mandir.js` | Move to `js/details/doorways.js` as `grandStair()` |
| `hall()` (storeys of pillars, cusped arches, chhajja, railings, roof with tier spires) | `js/details/ram-mandir.js` | Move to `js/details/temples.js` as `storeyedHall()` |
| `cuspedArchGeo()`, `tierSpires()` | `js/details/ram-mandir.js` | Move to `js/details/components.js` with `storeyedHall` |
| `carvedPillar()` | `js/details/temples.js` (exported) | Already shared |

## Phase 0: shared changes (every Nagara temple benefits)

1. **Move the parts** in the table above into the shared files. Have the Ram Mandir import them
   from there. It should look exactly as it does now.
2. **Give `nagaraTemple()` new options.** Each one defaults to today's behaviour, so a temple
   changes only when its builder asks for it.
   - `base: { tiers, cut, bands }`: build the plinth with `planPrism` on a `steppedPlan`. The plan
     runs narrow round the sanctum and widens round each hall (the hall widths are already in
     `placed`). Each lower tier stands out further, corners are cut back `cut`, and `planBand`
     courses run round each tier. The side-door steps start from the new plinth edge.
   - `stair: { rise, landing, cheeks, guards }`: use `grandStair()` in place of `steps()`. Rises
     are about 0.2 m. A landing goes in when the plinth is over about 3 m high. The stair gets
     side walls, and the guardians can be `'elephant'`, `'lion'` or none.
   - `storeys` on a hall (a fifth entry in `halls`, `[hw, hh, tiers, kind, storeys]`): build the
     hall with `storeyedHall()` in place of a box when it is greater than 1.
   - `sanctumStoreys`: repeat the sanctum's mouldings and niches on each floor and raise the spire
     to suit. The spire's height should be fixed so the flag top stays at the height given in
     `js/data.js`.
3. **Turn on the shared defaults** for all thirteen temples at once: `base: { tiers: 2, cut: 0.8 }`
   and a stair with rises of about 0.2 m. Each temple's own section below adds anything further.

## Phase 1: temples that need more floors or a different base

| Temple | The real temple *(verify where marked)* | Change | Files |
| --- | --- | --- | --- |
| **Somnath** | Rebuilt in 1951 in the Chalukya (Maru-Gurjara) style. The sabha mandap has an upper storey of projecting balconies, and the temple stands on a moulded plinth with offsets, with steps at the east *(verify)* | Plinth with `base: { tiers: 3 }` and carved bands. Sabha mandap and front hall with `storeys: 2` (balconies on the upper floor). `grandStair` with lions | `js/monuments/somnath-temple.js`, `js/details/somnath-temple.js` |
| **Mahakaleshwar** | Three levels of shrines, one above another: Mahakaleshwar at the bottom, Omkareshwar above it, Nagchandreshwar at the top | `sanctumStoreys: 3`, with niches and a chhajja on each floor, the Bhumija spire on top. Hall with `storeys: 2` | `js/monuments/mahakaleshwar-temple.js`, `js/details/mahakaleshwar-temple.js` |
| **Omkareshwar** | Usually described as five storeys, each with its own shrine, on the island's slope | `sanctumStoreys` of up to 5. As the floors rise they would step back like terraces. Keep the spire top at the height in `data.js` | `js/monuments/omkareshwar-temple.js`, `js/details/omkareshwar-temple.js` |
| **Ranakpur** | A four-faced (chaturmukha) temple on a high plinth with stairs to all four entrances (already modelled). Its upper floors carry shrines and domed halls above the ground floor *(verify how many)* | Add a storey of galleries and corner shrines above the 12 m roof, between the domes, using `storeyedHall`'s gallery part. Plinth in tiers with `planBand` | `js/monuments/ranakpur-jain-temple.js`, `js/details/ranakpur-jain-temple.js` |
| **Jagannath, Puri** | The *Baisi Pahacha*, 22 steps, rises from the Lion Gate to the temple's terrace | A raised terrace round the temple, with the 22-step `grandStair` from the Singhadwara | `js/monuments/jagannath-puri-temple.js`, `js/details/jagannath-puri-temple.js` |

## Phase 2: stairs and plinth finish on temples with their own builders

| Temple | Today | Change | Files |
| --- | --- | --- | --- |
| **Kandariya Mahadeva** | A 3 m platform (jagati) climbed by 4 boxes, so each rise is about 0.75 m | `grandStair` with about 15 rises and side walls. Notched corners on the jagati, where the subsidiary shrines stood *(verify)* | `js/monuments/kandariya-mahadeva.js`, `js/details/kandariya-mahadeva.js` |
| **Parshvanath, Khajuraho** | `nagaraTemple` on a 3 m jagati | Follows from Phase 0, plus a stair up to the jagati | its two files |
| **Brihadeeswara** | Sanctum walls of one storey (`box(29, 12, 29)`) with one row of niches. No steps up to the mandapa | The vimana's wall in two storeys of niches (talas), with a cornice between them *(verify)*. Steps up to the mukha-mandapa | `js/monuments/brihadeeswara-temple.js`, `js/details/brihadeeswara-temple.js` |
| **Vittala, Hampi** | Plinth friezes, but no stairs | Stairs to the maha-mandapa with elephant balustrades on their side walls *(verify which entrances)* | `js/details/vittala-temple-hampi.js` |
| **Konark** | The chariot plinth with elephants and one stair | Stairs to the jagamohana on its three open sides *(verify)* | `js/details/konark-sun-temple.js` |
| **Trimbakeshwar, Grishneshwar, Baidyanath, Bhimashankar, Nageshwar, Soniji ki Nasiyan** | Shared defaults | Phase 0 only; tune `tiers` and `cut` to each temple's photographs | their monument files |
| **Palitana, Shikharji** | Hilltop shrines | Phase 0 for the shrines. Optionally, stepped terraces with stair paths between the shrine groups (tuks) | their monument and detail files |

## No change planned

Ramappa and Chennakesava already have star platforms with steps. Kailasa and Akshardham have
elephant plinths. Kedarnath, Hidimba, Kamakhya, Dilwara and the Shore Temple are low or single
storey. The Dravidian enclosure temples (Meenakshi, Ramanathaswamy, Mallikarjuna, Padmanabhaswamy)
are defined by their walls and gopurams, not their plinths. The Golden Temple, Lotus Temple,
mosques, church, stupas and monasteries are not temples of this kind.

## Rules for every change

- **Height:** keep each temple's overall height at the figure in `js/data.js`. Taking the extra
  floors from the spire's height is the usual fix.
- **Triangle budget:** stay under 300,000 triangles. A temple may return `budget: 500000` only when
  its storeys need it, as Meenakshi does. Return `batch: true` for temples built from many parts.
- **Flickering faces:** keep floor slabs and roof courses as separate boxes, not merged, so
  `separateCoplanar` can keep their shared surfaces from flickering. Merge only pillars, arches
  and railings.
- **Checking:** for each temple, take the screenshots described in
  `docs/monument-details.md` (Checking a change): the default view, the front stair and one
  corner of the plinth. Count the triangles before committing.

## Progress

- Phase 0, steps 1 to 3: done. `sanctumStoreys` was added in Phase 1, with Mahakaleshwar.
- Phase 1, Somnath: done. Three-tier plinth, both halls in two storeys with an upper gallery of
  balconies, the spire banded into seven storeys (`spireBands: 7`, after Sompura's note of a Maha
  Meru Prasad of seven floors) and a 12 m east stair (`stair.width`). No guardians on the stair:
  none could be confirmed from sources.
- Phase 1, Mahakaleshwar: done. Of its three levels the lowest is underground, so the model has two
  storeys above ground (`sanctumStoreys: 2`), the upper one with a balcony, niches and an eave.
  Its halls stay single storey.

## From the review of all 42 sacred models

A later review compared every sacred model with photographs and published sources. Its notes on
the Ram Mandir describe the model before this work: the 32-step stair, the three-storey halls and
the stepped plinth are now built. It changes this plan as follows.

Dropped from the plan:
- **Ranakpur:** the exterior massing already matches the chaumukha. The 1,444 pillars are an
  interior, so no extra storey.
- **Brihadeeswara:** its 13 talas already match the vimana, and visitors cross a courtyard, not a
  temple stair.
- **Omkareshwar:** on hold. The review reads the island photograph as a cluster of white spires
  over the Narmada ghat, with one shrine standing in for the group, and does not support five
  storeys.
- **Small temples:** don't use a Ram-style plinth on them. The shared default keeps each temple's
  plinth height and only divides it into tiers that follow the plan. Kashi Vishwanath (inside its
  courtyard), Bhimashankar and Nageshwar can switch it off (`base: null`) if it reads as too much.

Added to the plan:

| Temple | Next change from the photographs |
| --- | --- |
| Ram Mandir | The Singh Dwar gate at the head of the stair, the parkota (enclosure wall) and its corner shrines to Surya, Bhagwati, Ganesh and Shiva |
| Jagannath | The Baisi Pahacha: 22 steps, each about 21 m wide, 1.8 m deep and 0.2 m high. The tiger, elephant and horse gates and the outer Meghanada wall |
| Kedarnath | Broad grey steps from the platform up to the door; the tower cut into horizontal stone courses |
| Kailasa | The two stair flights beside the sabha-mandapa, up to the doorway 8 m above the court |
| Vittala | Steps on the east of each hall, and up to the stone chariot |
| Dilwara | A short flight up to the door, keeping the exterior plain |
| Palitana, Gommateshwara | A longer zigzag pilgrim stair, so that the climb reads |
| Baidyanath | Base mouldings and bhumi-amalakas on the ten satellite spires |
| Tirumala | The gold Ananda Nilayam as a Dravidian vimana with a stupi |
| Meenakshi | The Golden Lotus Tank stepped on all four sides |
| Mallikarjuna | Dravidian talas on the two vimanas |
| Parshvanath | The balcony rail (kakshasana) that Kandariya has |
| Kashi Vishwanath, Grishneshwar | Bands on the gold spire; deeper ledges on the five tiers |

## Order of work

1. Phase 0, steps 1 and 2: move the shared parts and add the options. The Ram Mandir must look
   unchanged, and every other temple identical until it opts in.
2. Phase 0, step 3: the shared defaults for the thirteen Nagara temples, in one change with
   screenshots.
3. Phase 1, one temple per change: Somnath, Mahakaleshwar, Omkareshwar, Ranakpur, Jagannath.
4. Phase 2, in any order.
