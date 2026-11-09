// The style and material groups of the sidebar's filter chips. Each group tests a monument's
// `style` or `material` (js/data.js) against a pattern, and every monument falls into at least one
// group of each (`node tools/check-filters.mjs` checks this). A monument can fall into more than
// one: Amber Fort is both Rajput and Indo-Islamic, the Taj Mahal is both Marble and Sandstone.

export const STYLE_GROUPS = [
  // Temples of the south: Dravidian (Pallava, Chola, Rashtrakuta, Nayak, Vijayanagara, Kerala), and
  // the Vesara temples of the Hoysalas and Kakatiyas between south and north.
  { id: 'dravidian', label: 'Dravidian & Vesara', test: /dravidian|hoysala|kakatiya|vijayanagara/i },
  // Temples of the north: Nagara with its curved shikhara, and its regional forms (Chandela,
  // Kalinga, Bhumija, Maru-Gurjara and the Jain temples built in it, Maratha, Himalayan, Nilachal).
  { id: 'nagara', label: 'Nagara', test: /(?<!vijaya)nagara|kalinga|bhumija|maru-gurjara|nilachal|\bjain\b/i },
  // Stupas, viharas and cave halls, Mauryan to Pala, and the Tibetan monasteries.
  { id: 'buddhist', label: 'Buddhist', test: /buddhist|mauryan|gupta|pala\b/i },
  // Sultanate, Mughal, Deccan (Bahmani, Adil Shahi, Qutb Shahi), Sur and Awadhi (Nawabi) building.
  { id: 'indo-islamic', label: 'Indo-Islamic', test: /indo-islamic|mughal|deccan|adil shahi|qutb shahi|nawabi|indo-afghan/i },
  { id: 'rajput', label: 'Rajput', test: /rajput/i },
  // The British Raj's blend of Indian forms on European plans: Mysore, Laxmi Vilas, the Gateway.
  { id: 'indo-saracenic', label: 'Indo-Saracenic', test: /indo-saracenic/i },
  // European styles: Portuguese Goa, Gothic Revival, Renaissance, Baroque, Lutyens' Delhi.
  { id: 'european', label: 'Colonial & European', test: /gothic|baroque|portuguese|renaissance|lutyens|colonial|memorial arch/i },
  // Twentieth- and twenty-first-century buildings, memorials, statues and bridges.
  { id: 'modern', label: 'Modern', test: /contemporary|modernist|expressionist|modern memorial|monumental statue|cable-stayed|cantilever/i },
  // Styles of their own: Sikh, the Himalayan pagoda, Keladi forts, the Gommateshwara monolith and
  // the buildings that mix several traditions.
  { id: 'regional', label: 'Regional & mixed', test: /sikh|pagoda|keladi|monolithic|mixed/i },
];

export const MATERIAL_GROUPS = [
  { id: 'sandstone', label: 'Sandstone', test: /sandstone/i },
  { id: 'marble', label: 'Marble', test: /marble/i },
  { id: 'granite', label: 'Granite', test: /granite/i },
  // The Deccan's volcanic rock, and dolerite, its close kin.
  { id: 'basalt', label: 'Basalt', test: /basalt|dolerite/i },
  { id: 'laterite', label: 'Laterite', test: /laterite/i },
  // Brick, and the lime plaster and stucco that face it (lime alone, not limestone).
  { id: 'brick', label: 'Brick & lime', test: /brick|stucco|\blime\b/i },
  // Other stone: khondalite, soapstone, limestone, slabs of local stone, and stone not named further.
  { id: 'stone', label: 'Other stone', test: /khondalite|soapstone|limestone|\bstone\b/i },
  { id: 'timber', label: 'Timber', test: /timber|wood/i },
  { id: 'modern', label: 'Steel & concrete', test: /steel|concrete|bronze/i },
];

const find = (groups, id) => groups.find((g) => g.id === id);
export const styleMatches = (m, id) => !id || !!find(STYLE_GROUPS, id)?.test.test(m.style);
export const materialMatches = (m, id) => !id || !!find(MATERIAL_GROUPS, id)?.test.test(m.material);
