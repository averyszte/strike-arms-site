# Catalogue import — Alan's real stock

Turns the seven stock emails Alan sent between 29 August and 1 September 2026 into a CSV the
admin importer accepts, with his photographs already in the `product-images` bucket.

**65 products. 64 have a price. 63 photographs, 62 of which match a product.**

| Page | Products | Photos |
| --- | --- | --- |
| Pistols (`Website Pages.eml`) | 13 | 13 |
| New rifles (`New Rifles.eml`) | 4 | 4 |
| Pre-loved (`Pre-Loved Page.eml`) | 14 | 14 |
| Consumables (`CONSUMABLES PAGE.eml`) | 12 | 11, one of which matches nothing |
| Batteries and chargers (`Batteries & Chargers.eml`) | 7 | 6 |
| Masks and goggles (`Masks and Goggles Page.eml`) | 8 | 8 |
| Jumble (`Our Jumble Page.eml`) | 7 | 7 |

## Files

- `catalogue-guns.mjs` · `catalogue-pre-loved.mjs` · `catalogue-consumables.mjs` ·
  `catalogue-gear.mjs` — batch 1 (emails of 31 Aug and 1 Sep 2026).
- `catalogue-magazines.mjs` · `catalogue-props-safety.mjs` · `catalogue-jumble-batch-2.mjs` —
  batch 2 (emails of 19 and 27 Sep 2026). Together these are Alan's stock, transcribed. **This is the source of truth, not the CSV.**
  When Alan answers a question, fix it here and rebuild.
- `catalogue.mjs` — assembles the pages and holds the two import defaults.
- `build-csv.mjs` — validates, then writes `products.csv`, or `products-batch-N.csv` with
  `--batch=N`.
- `build-safety-tags.mjs` — writes `safety-tags.csv`, a Slug and Tags only file that moves the
  live masks and goggles onto Safety Equipment without touching anything else about them.
- `upload-images.mjs` — pushes the photographs to the bucket, writes `image-urls.json`.
- `read-credentials.mjs` — finds the project URL and the service role key, or the public anon key
  for read-only scripts.
- `photo-framing.mjs` · `background-cleanup.mjs` — the shared image steps: trim, centre on white,
  WebP, and the white-sheet clean-up.
- `reframe-live-photos.mjs` — finds and re-frames badly lit photos already on the shop.
- `images/` — the photographs, extracted from the emails. Git-ignored: they are source material,
  not source code, and they are 9.4 MB.

The CSVs, `image-urls.json`, `images/` and `service-role-key.txt` are all git-ignored.

**Importing a later batch:** never re-import the full `products.csv` once Alan has published
anything, because its Published column says No for every row. Use `build-csv.mjs --batch=2`
instead: it carries only that round's pages. Every batch is validated against the whole catalogue,
so a slug clash with an earlier batch still stops the build.

## Running it

1. Open `scripts/catalogue-import/service-role-key.txt`, paste the Supabase service role key into
   it, and save. It is in the Supabase dashboard under Project Settings, API — the one marked
   `service_role`, not the anon key. The file is git-ignored and stays on the machine. The project
   URL is read from the app's `.env.local`, so there is nothing else to set.

   A file rather than an environment variable because PowerShell writes the command line to its
   history file, and a key set that way sits in it in plain text.

2. Upload the photographs:

```bash
node scripts/catalogue-import/upload-images.mjs
```

   Safe to re-run: anything already in `image-urls.json` is skipped, so a run that dies part way
   picks up where it stopped instead of leaving duplicate objects in the bucket.

3. Build the CSV:

```bash
node scripts/catalogue-import/build-csv.mjs
```

4. Open the admin, Products, Import, and choose `scripts/catalogue-import/products.csv`. Read the
   preview before confirming. Slug is the identity column: it matches existing rows and creates
   the rest.

5. When the import is done, delete `service-role-key.txt`.

## Photo sets (multiple images per product)

For replacing a product's images with a set of better photos, not for the first import.

1. Put the photos in `images/sets/` (any subfolders), named after the product with a number for
   the order: `Specna Arms Half Tan 3.webp`, `AKSU 74 (2).webp`. `photo-sets.mjs` maps names to
   slugs; add a line there for a new product. Photo 1 becomes the main image.
2. `node scripts/catalogue-import/process-photo-sets.mjs` trims, centres each photo on a white
   square (close-ups are centre-cropped instead), caps it at 1600px and writes WebP to
   `images/processed/`. Look at those before going on.
3. With the service role key pasted in as above,
   `node scripts/catalogue-import/upload-photo-sets.mjs` checks every slug against the live
   catalogue and prints the change. Add `--write` to upload and replace. The old images are
   queued for deletion by the migration 011 trigger and removed by `sweep-orphan-images`.
4. Re-processing after uploading is safe: `photo-set-urls.json` records each upload against a
   hash of the file, so a changed photo is uploaded again and an unchanged one is re-used.

## Re-framing photos already on the shop

For live photos shot on a white sheet under poor light: a grey, patchy background inside the
site's white box, or an item sitting small in a landscape strip.

1. `node scripts/catalogue-import/reframe-live-photos.mjs --find` lists every product whose main
   image has a border that is not pure white, or is not square. It prints the slugs on the last
   line. Read-only, using the public anon key.
2. `node scripts/catalogue-import/reframe-live-photos.mjs <slug> <slug> ...` downloads each of
   those products' images and writes cleaned copies to `images/reframed/`. A grey border is
   evened out towards white and the sheet and shadows are faded to pure white
   (`background-cleanup.mjs`); every photo is then trimmed and centred on a white square, never
   cropped. Products with clear packaging or a visor touching the sheet are listed in
   `SHEET_KEPT`, which keeps the lighting fix but skips the fade, so the plastic is not erased.
   Another shop's watermark is painted white first by listing its corner in `ERASE_REGIONS`.
3. `node scripts/catalogue-import/upload-photo-sets.mjs --dir=reframed` checks, and adding
   `--write` uploads and replaces, exactly as for photo sets.

## Decisions taken, and why

- **Everything imports unpublished.** Sixty-four rows going live in one click, with 25 of them
  carrying an open question, is not a launch. Publish in batches once Alan has confirmed.
- **Everything imports as collect-in-store.** `docs/current-task.md` lists "which products are
  postable" as blocked on Alan, so nothing here guesses it. That does mean the delivery and
  mixed-basket checkout paths (C3.1, C3.2) still have nothing to test against — the tick list in
  `docs/alan-catalogue-questions.md` is the shortest way to unblock them.
- **Stock:** batch 1 imported at zero. Since then the importer takes a Stock column for new rows
  only, and books it through `adjust_stock` as "Opening stock (import)", so the ledger still says
  where it came from. Batch 2 opens jumble and wallhanger one-offs at 1. Where Alan listed an
  item twice (B7/B8, C16/C17, C23/C24) they are two designs, so two products. Magazines and gloves open at 0: Alan gave no quantities.
- **Batch 2 shelves:** jumble rows carry the `jumble` tag (shown on `/jumble`, kept off
  `/pre-loved`); gloves and masks carry `safety` (`/safety-equipment`); wallhangers sit in
  `more/wallhangers-props` with the `wallhanger` tag and Alan's non-firing wording as the page
  intro. Jumble items Alan calls used or pre-owned import as pre-loved; the rest as new.
- **Gloves are one product per size,** because the shop has no size picker: the customer pays for
  the size they chose and stock is counted per size.
- **Pre-loved products keep their real category** (`rifles/aeg-rifles` and so on), carry the
  tags `pre-loved`, `secondhand` and `sold-as-seen`, and set the `Condition` column to
  `Pre-loved`. The column is what the shop reads: migration 018 made `condition` a real column,
  and the storefront prints the badge, the sold-as-seen notice and the `/pre-loved` page off it.
  Alan's "sold as seen … secondhand … will require batteries and a charger" used to be appended
  to each description instead; it is not any more, because descriptions are not rendered on the
  storefront at all. The wording now lives in `src/lib/product-condition.ts`.
- **Jumble products keep their real category too** and carry a `jumble` tag, for the same reason.
  Alan's own words: "I was thinking to lump them all together as a Miscellaneous page and call it
  our jumble page."
- **Unknown makers are branded `Unbranded`,** not guessed. Three pre-loved rifles, the batteries,
  the masks, and four jumble items are in that state.
- **Four names were corrected** where the email plainly had a typo and leaving it would break
  search: `CZ PO9` to `CZ P-09`, `AAOP-A1` to `AAP-01` (twice), and `3-9-40` to `3-9x40`.
  Everything else is Alan's wording.
- **Mesh half masks are filed under `gear/headwear`,** because `taxonomy.ts` has no face
  protection subcategory. Adding one is a code change and a decision, so it is a question, not a
  quiet edit.

## Still open

The 25 flagged batch 1 rows are listed in `docs/alan-catalogue-questions.md`, which is written to
be forwarded to Alan as it stands. Batch 2 flags print when `build-csv.mjs --batch=2` runs. Batch 2
questions were answered on 27 Sep 2026. Still open: no photos came for the 12 wallhangers, and
Books & Manuals is still to come. Alan said "75 extra items" but listed 73 (no C9); we list what
was sent.
