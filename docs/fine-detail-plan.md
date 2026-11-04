# Plan: sculpture and fine detail for every monument

The Taj Mahal, India Gate and the Old Parliament House set the level. Their facades are built from
real parts: arches inside arches, roundels, cut lettering, coffers, brackets, railings, capitals on
every column. Most other monuments now have a first layer of detail (see
[`monument-details.md`](monument-details.md)). But in many places a plain block still stands in for
sculpture. This plan names those places and says what replaces each one.

## 1. Where blocks still stand in for sculpture

| Monument | Stand-in today | Replacement |
| --- | --- | --- |
| Kandariya Mahadeva, Parshvanath, Grishneshwar | rows of flat boxes for the bands of figures | instanced carved figures (standing, dancing, seated) |
| Ramappa | black boxes for the bracket figures (madanikas) | leaning dancer figures in polished stone |
| Gopurams (Meenakshi, Mallikarjuna, Padmanabhaswamy, Ramanathaswamy, Tirumala) | painted boxes for the stucco figures | painted carved figures, pilasters and kudu arches on every storey |
| Akshardham, Kailasa | boxes for the elephant friezes | instanced elephants |
| Konark | boxes for the musicians on the roof tiers | musician figures |
| Brihadeeswara, Kailasa, Shore Temple | cubes for the miniature shrines on the vimana | domed kutas at the corners and barrel-roofed shalas between them |
| Dilwara, Ranakpur, Palitana | four-sided pyramids for the small spires | small curved spires with an amalaka and kalash |
| Vittala, Hampi | plain round pillars, a plain box base, a box chariot body | see section 3 |

## 2. Shared parts to build (`js/details/sculpture.js`, new)

- **Instanced figures**: carved figures in three poses: standing, dancing (the tribhanga
  hip-sway, one arm raised) and seated. Each is merged into one geometry of unit size, so it can
  replace `unitBox()` in an instanced row with no other change.
- **Instanced elephant and horse**: low-poly animals of unit size for friezes.
- **Figure frieze**: a sunk band with a row of instanced figures, for temple plinths and walls.
- **Dravidian miniature shrines**: `kuta` (square, domed), `shala` (oblong, barrel-roofed, with a
  kudu on each end) and `haraRow`, the ring of them along a storey's edge.
- **Yali pillar**: a pillar with a rearing yali (a lion-like beast) and its rider carved against it,
  as on the halls of Vijayanagara.
- **Classical kit**: Corinthian capitals (rings of acanthus leaves under a volute abacus), an
  entablature (architrave fascias, frieze, dentils and modillions under the cornice), standing
  statues on pedestals, urns and obelisk pinnacles.
- **Glyphs**: H, S, R, P, G, L and the other letters the inscriptions need, added to `lettering`.

## 3. Hampi, Vittala temple

- The main hall's outer pillars become yali pillars; the inner pillars keep their clusters of
  colonnettes, now with carved bands across their shafts.
- The hall's base gets mouldings and friezes of horses, elephants and dancers.
- A parapet of miniature shrines (kutas and shalas) runs round the hall's roof.
- The sanctum walls get pot-pilasters (kumbha-panjaras) and niches; miniature shrines run along
  the storeys of its tower.
- The stone chariot gets friezes on its base, a carved panel on each side, and miniature shrines on
  its upper storey.
- The ruined brick gopuram gets pilasters, niches with stucco figures and a kudu cornice.
- The Kalyana Mandapa (the hall at the front left) gets yali pillars all round.

## 4. Colonial buildings

- **Victoria Memorial**: Corinthian capitals on the porch and drum columns, a full entablature, a
  statue group on each corner pavilion and on the porch, a lantern with an oculus band on the dome,
  and ribs on the dome.
- **CSMT**: the lion and the tiger on the gate piers, gabled dormers round the dome, crocketed ribs
  on the dome, an arcade along the ground floor, and statues in niches on the central gable.
- **Rashtrapati Bhavan**: the Jaipur Column's capital (a bronze lotus with a glass star), the roof
  basins (Lutyens' fountains), stone elephants on the wings' piers, and an entablature on the portico.
- **Basilica of Bom Jesus**: the IHS emblem in letters, obelisk pinnacles along the tiers, statues in
  niches, scrolls on the pediment, and buttresses along the nave.
- **Cooch Behar Palace**: Corinthian capitals on the porch columns, urns on the balustrade, a ribbed
  lantern on the dome, and pediments over the upper windows.
- **Laxmi Vilas Palace**: a row of jharokhas on the wings, domed kiosks along the roof, and a domed
  lantern on the tower.
- **Mysore Palace**: the Gajalakshmi relief in the central arch, cusped (multi-foiled) arches in the
  arcade, and carved capitals on the piers.
- **Cellular Jail**: keystones and impost bands on the arcades.

## 5. Other temples with plain masses

- **Jagannath**: niches, pilasters and figure friezes on the walls of the three halls.
- **Ram Mandir**: carved pillars (bases, banded shafts, bracket capitals) in place of plain cylinders.
- **Chennakesava**: rows of small shrines on its star-shaped towers.
- **Mahakaleshwar, Somnath, Trimbakeshwar** (through `nagaraTemple`): bands of figures on the
  sanctum walls between the mouldings.

## 6. Order of work and checks

1. Build `sculpture.js`, and swap the block stand-ins for its parts in the builders (section 1).
2. Hampi (section 3).
3. Colonial buildings (section 4).
4. Other temples (section 5).
5. Build every monument in the Node test (no errors, each under 300,000 triangles), render the
   changed ones, and update `monument-details.md` and the README.
