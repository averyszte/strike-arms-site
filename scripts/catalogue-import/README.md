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
  `catalogue-gear.mjs` — Alan's stock, transcribed. **This is the source of truth, not the CSV.**
  When Alan answers a question, fix it here and rebuild.
- `catalogue.mjs` — assembles the pages and holds the two import defaults.
- `build-csv.mjs` — validates, then writes `products.csv`.
- `upload-images.mjs` — pushes the photographs to the bucket, writes `image-urls.json`.
- `read-credentials.mjs` — finds the project URL and the service role key.
- `images/` — the photographs, extracted from the emails. Git-ignored: they are source material,
  not source code, and they are 9.4 MB.

`products.csv`, `image-urls.json`, `images/` and `service-role-key.txt` are all git-ignored.

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

## Decisions taken, and why

- **Everything imports unpublished.** Sixty-four rows going live in one click, with 25 of them
  carrying an open question, is not a launch. Publish in batches once Alan has confirmed.
- **Everything imports as collect-in-store.** `docs/current-task.md` lists "which products are
  postable" as blocked on Alan, so nothing here guesses it. That does mean the delivery and
  mixed-basket checkout paths (C3.1, C3.2) still have nothing to test against — the tick list in
  `docs/alan-catalogue-questions.md` is the shortest way to unblock them.
- **Stock imports as zero,** because the importer always writes zero by design: stock moves
  through `adjust_stock` so the ledger can say who changed it and why. The pre-loved rows are
  one-offs and each needs an adjustment to 1.
- **Pre-loved products keep their real category** (`rifles/aeg-rifles` and so on) and carry the
  tags `pre-loved`, `secondhand` and `sold-as-seen`. Alan's "sold as seen … secondhand … will
  require batteries and a charger" is appended to every one of those descriptions rather than
  left to a page banner, because a customer arriving from search never sees the banner. A
  `/pre-loved` listing page filtered on the tag is a front-end job and is not built here.
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

The 25 flagged rows are listed in `docs/alan-catalogue-questions.md`, which is written to be
forwarded to Alan as it stands.
