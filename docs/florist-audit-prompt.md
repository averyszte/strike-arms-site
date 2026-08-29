# Prompt: audit the florist site

Paste the block below into a Claude session opened on the **florist repository**
(the finished, live one). Its output gets merged into `feature-inventory.md`.

Written to target gaps: `ecommerce-playbook.md` already holds the distilled
florist knowledge, so this asks for what the playbook does not cover — order of
construction, production surprises, and the admin screens that turned out to
matter in daily use.

---

You are looking at a finished, production e-commerce site that is live and working.
I am building a second site (an airsoft retailer) on the same stack and the same
architecture, and I need a complete map of this one so I can build the new one
feature by feature without missing anything.

Survey the ENTIRE repository — public site, customer accounts, admin dashboard,
database, edge functions, scheduled jobs, email, storage, deploy config — and
produce an exhaustive feature inventory.

For EVERY feature and meaningful sub-feature, give me:
  1. What it does, in one line
  2. The files that implement it (paths, and which layer each sits in)
  3. The database tables, columns, RPCs and RLS policies it depends on
  4. Anything non-obvious about how it works — a decision that looks arbitrary
     until you know why, an ordering constraint, a race you had to close

Organise it under these headings so it lines up with my own list:
  A. Storefront — catalogue, category/filter/sort/pagination, product page,
     search, images, stock display
  B. Customer accounts — auth, verification, password reset, profile, order
     history, addresses, GDPR export/deletion
  C. Commerce — cart, checkout, payment, webhook, fulfilment, shipping, tax,
     refunds, discounts, gift cards, bot protection
  D. Admin dashboard — auth/2FA, every management screen, bulk operations,
     image upload, reporting
  E. Backend — schema, functions, triggers, scheduled jobs, storage buckets,
     email sending, rate limiting
  F. Deploy and operations — hosting, env vars, redirects, monitoring, backups

Then, separately and in detail, answer these — they are where I expect to get
this wrong:

  * ORDER OF CONSTRUCTION. If you rebuilt this from an empty repo, what order
    would you do it in, and which pieces had to exist before which others?
    Where did you build something and then have to tear it up because a
    dependency landed later?

  * MOCK-TO-REAL. Did the storefront ever run on mock/seed data? How did you
    cut over to the database, and what broke when you did?

  * EMAIL. Every transactional email that exists: trigger, recipient, contents.
    How they are queued and sent, how failures are retried, how you stopped
    duplicates. How the domain was verified. Whether Supabase Auth uses custom
    SMTP and why.

  * IMAGES. The full pipeline: upload UI, bucket layout, naming, resizing,
    formats, RLS on the bucket, how the public site serves them, what happens
    to orphans when a product is deleted.

  * ADMIN SCREENS. List every screen and every action on it. I want the ones
    that turned out to be essential in daily use but were not in the original
    plan.

  * THINGS THAT ONLY SURFACED IN PRODUCTION. Bugs, gaps and "we should have
    done that from the start" items discovered after launch.

  * WHAT YOU WOULD NOT BUILD AGAIN. Features that cost real effort and earn
    nothing.

Rules:
  - Be exhaustive over being brief. Long is fine.
  - Do NOT output any secret: no API keys, tokens, service-role keys, webhook
    signing secrets, passwords, or .env contents. Name the variables, never
    the values.
  - If something is half-built or known-broken in that repo, say so plainly.
    A wrong "it's done" costs me more than a gap.
  - Do not guess at the airsoft site's requirements. Describe what exists.
