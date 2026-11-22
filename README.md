# CatWalking

One-page interactive website for the cat datawalk project: **are all cats either black or orange?**

Live site (after GitHub Pages is switched on): `https://regitata.github.io/CatWalking/`

## Sections
1. **Opening**: walking into a Jabodetabek *gang*, with bobble-head cats. Moves on after 2 seconds or when you scroll.
2. **Cover**: "Did you know all cats are either black or orange?" (the footer appears from here on).
3. **Quote**: from Kaelin et al. (2025), *Current Biology*.
4. **We took a datawalk**: the route map, with cats you can tap.
5. **The Method**: three feeding approaches; tap a bubble to enlarge it and see the counts.
6. **Our Result**: black-or-orange pie (68% / 32%) and a colour-details pie, stats, and all 22 cats with their badges.
7. **Import The Cats**: visitors upload a cat photo, name it, and it moves into the gang. Cats can be dragged and removed, and the gang can be downloaded as a GIF, a landscape picture or a portrait picture (for IG stories).
8. **Let's do the Catwalk**: visitors enter their own survey and get a pie chart (downloadable as PNG).

## Editing
- **Text**: `index.html`
- **Data** (the 22 cats, categories, approaches, distance): `assets/js/data.js`
- **Colours, fonts, layout**: `assets/css/style.css`
- **Behaviour**: `assets/js/main.js`
- **Images**: `assets/img/`. The section art was exported from the Figma SVGs.
- **Gang illustration**: `tools/gang.py` generates it. To regenerate, run `python3 tools/gang.py && python3 tools/inject_gang.py`.

Visitor uploads and survey results are saved only in that visitor's browser (`localStorage`). They are not shared with other visitors.

## Download archive (Google Drive)
Each download also sends a landscape copy to a Google Apps Script web app that saves it to Drive. Set it up once with `tools/drive-archive.gs` (steps are inside the file), then put the web app URL in `archiveUrl` in `assets/js/data.js`. While `archiveUrl` is empty, nothing is sent and the notice under the download button stays hidden.

## Credits
- Fonts: Londrina Solid, DM Sans, Architects Daughter (SIL Open Font License, self-hosted)
- In-browser background removal: [@imgly/background-removal](https://github.com/imgly/background-removal-js), loaded from jsDelivr (AGPL-3.0 / commercial licence)
- GIF encoder: [gifenc](https://github.com/mattdesl/gifenc) 1.0.3 (MIT), in `assets/js/vendor/`
- Quote: Kaelin, C. B., et al. (2025). Molecular and genetic characterization of sex-linked orange coat color in the domestic cat. *Current Biology*, 35, 2826–2836. https://pubmed.ncbi.nlm.nih.gov/40378841/
