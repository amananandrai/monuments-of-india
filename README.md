# Monuments of India

**Live site: https://monuments-of-india-nu.vercel.app**

101 Indian landmarks modelled in interactive 3D with [three.js](https://threejs.org/):

Qutub Minar · Gateway of India · Taj Mahal · Charminar · Ram Mandir · Brihadeeswara Temple · India Gate · Statue of Unity · Howrah Bridge · Jagannath Puri Temple · Golden Temple · Hawa Mahal · Konark Sun Temple · Meenakshi Temple · Lotus Temple · Gol Gumbaz · Mysore Palace · Sanchi Stupa · Mahabodhi Temple · Red Fort · Old Parliament House · Rashtrapati Bhavan · Humayun’s Tomb · Jama Masjid · New Parliament House · Dilwara Temples · Swaminarayan Akshardham · Kandariya Mahadeva Temple · Ranakpur Jain Temple · Chennakesava Temple · Victoria Memorial · Chhatrapati Shivaji Maharaj Terminus · Kailasa Temple, Ellora · Vittala Temple, Hampi · Padmanabhaswamy Temple · Basilica of Bom Jesus · Kamakhya Temple · Tawang Monastery · Amber Fort · Rani ki Vav · Ramappa Temple · Kedarnath Temple · Hazratbal Shrine · Shore Temple · Gwalior Fort · Nalanda Mahavihara · Tirumala Venkateswara Temple · Capitol Complex, Chandigarh · Hidimba Devi Temple · Bandra–Worli Sea Link · Buland Darwaza · Panch Mahal · Bara Imambara · Rumi Darwaza · Chota Imambara · Itmad-ud-Daulah’s Tomb · Akbar’s Tomb · Agra Fort · Bibi Ka Maqbara · Safdarjung’s Tomb · Somnath Temple · Mallikarjuna Temple · Mahakaleshwar Temple · Omkareshwar Temple · Bhimashankar Temple · Kashi Vishwanath Temple · Trimbakeshwar Temple · Baidyanath Temple · Nageshwar Temple · Ramanathaswamy Temple · Grishneshwar Temple · Dhamek Stupa · Ajanta Caves · Rumtek Monastery · Thiksey Monastery · Key Monastery · Gommateshwara Statue · Palitana Temples · Shikharji · Parshvanath Temple, Khajuraho · Soniji Ki Nasiyan · Mehrangarh Fort · Chittorgarh Fort · Jaisalmer Fort · Golconda Fort · Daulatabad Fort · City Palace, Udaipur · Laxmi Vilas Palace · Fort Aguada · Bekal Fort · Cooch Behar Palace · Sher Shah Suri’s Tomb · Cellular Jail · Shaheed Minar · Tipu Sultan’s Gumbaz · Qutb Shahi Tombs · Vivekananda Rock Memorial · Jallianwala Bagh · Kargil War Memorial · National War Memorial · Kirti Mandir

The site opens on a map of India with a pin for every monument; numbered pins group nearby monuments and zoom in when selected. Pick a pin, or search the list grouped by state, to open its 3D model.

Every model is built procedurally from primitives at roughly real-world proportions, so there are no model files to download. Drag to orbit, scroll or pinch to zoom, and use ← → to switch monuments. Link to one directly with a hash, e.g. `#taj-mahal`.

## Rendering

Surfaces are generated in the shader (`js/surface.js`) from world position: sandstone and granite masonry with block joints, marble veining, brick courses, rock, earth, lattice screens and glazed tiles, each with a matching bump, grime near the ground, rain streaks and a slight per-piece tint. Lighting adds a sky environment map for reflections, ambient occlusion (desktop only) and bloom for lights at night.

## Map data

State boundaries and India's outline come from [Natural Earth](https://www.naturalearthdata.com) (public domain), using its India point-of-view boundaries, simplified into `js/india-map.js`.

## Run locally

It is a static site with no build step: `index.html`, `css/style.css` and ES modules in `js/` (one file per monument in `js/monuments/`), with three.js loaded from a CDN. Serve the folder with any static server:

```bash
npx serve .
```

## Deploy

Hosted on Vercel at https://monuments-of-india-nu.vercel.app as a static site with no build step. Every push to `main` deploys to production.
