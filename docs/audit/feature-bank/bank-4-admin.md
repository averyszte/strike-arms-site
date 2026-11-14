# Feature bank 4: admin dashboard

What this covers: every admin action. That means each button, field, filter, bulk action, status move, dialog and error, empty or loading state, plus the backend each one touches.

Purpose: to drive the pre-launch audits. The goal is that nothing Alan does in the admin can break the storefront, mis-state money, oversell stock, lose data or fail without saying so.

Method: I read the code only (worktree `confident-sammet-18385d`, 2026-11-14). I did not run the app. "Watch" notes are observations with file:line, not a full audit.

Paths:
- Frontend paths are relative to `artifacts/strike-arms/src/`.
- Backend paths are relative to `supabase/`.

Status key:
- **working**: the code path is complete and wired up.
- **partial**: it works, but has a gap I found.
- **stub**: present but not wired, or a placeholder.
- **unknown**: I did not trace it far enough to say.

Background that applies to every screen below:
- Every admin write is gated by RLS `is_admin_aal2()`, set up in migrations 022 and 023 and used throughout.
- A PostgREST update that RLS refuses returns success with zero rows. Only some repositories read the row back to catch this; see section L.
- Stock has been simple since 038. `products.in_stock` is a boolean set by hand, and nothing counts, reserves or decrements stock.

---

## A. Sign-in, MFA, password

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-001 | Sign in with email and password | pages/admin/LoginPage.tsx; components/admin/AdminAuthScreen.tsx; hooks/admin-auth-context.tsx | Supabase Auth | working | The password policy hint is shown under the sign-in field (LoginPage.tsx:76), which hints at the rules to an attacker. Cosmetic. |
| D-002 | A non-admin who signs in is signed straight out with "Access denied" | admin-auth-context.tsx:101-111 | is_admin() | working | none |
| D-003 | Connection error while resolving the session | admin-auth-context.tsx:55-67 | Auth and the profiles read | working | `recheck` does not set isLoading (97-99), so the screen can show stale state during a retry. |
| D-004 | AuthGuard route protection | components/admin/AuthGuard.tsx:49 | none | working | none |
| D-005 | MFA gate: enrol if no factor, challenge if one exists | MfaGate.tsx | Auth MFA | working | getMfaState swallows errors as 'none' (data/admin-mfa-repository.ts:25). A network fault can then push an already-enrolled admin to the enrolment screen. |
| D-006 | TOTP enrolment: QR code, manual secret, confirm code | MfaEnrolment.tsx | auth.mfa.enroll / verify | working | none |
| D-007 | TOTP challenge: 6-digit code, auto-submits, cleared when rejected | MfaChallenge.tsx; MfaCodeForm.tsx | auth.mfa.challenge / verify | working | none |
| D-008 | Recover from a lost authenticator | data/admin-mfa-repository.ts:82 `unenrollTotp` | none in the UI | **stub** | unenrollTotp has no callers. A lost or reset phone locks Alan out of the whole admin, so orders cannot be fulfilled or refunded until a developer removes the factor in the Supabase dashboard. |
| D-009 | Forgot password (redirects to /admin/reset-password) | ForgotPasswordPanel.tsx | auth.resetPasswordForEmail | working | Depends on the Supabase redirect allow-list containing the production domain. Hand-off to bank (deploy). |
| D-010 | Email-link landing (reset or invite): states checking, invalid, connection, not-admin, mfa, ready | EmailLinkScreen.tsx | Auth | working | none |
| D-011 | New password form: 12+ characters, lowercase, uppercase, digit; errors mapped for weak, pwned, same and insufficient_aal | NewPasswordForm.tsx | auth.updateUser | working | none |
| D-012 | Change password (signed in) | pages/admin/ChangePasswordPage.tsx | auth.updateUser (needs aal2) | partial | Does not ask for the current password. An unattended, unlocked admin tab is enough to take over the account. |
| D-013 | Sign out | AdminSidebar.tsx | auth.signOut | working | none |
| D-014 | Admin invites | migrations 024, 027 | invite flow | unknown | There is no invite UI in the admin. Invites are SQL or dashboard only. I did not trace the flow. |

## B. Layout and shared pieces

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-015 | Sidebar navigation: Dashboard; Catalog (Products, Categories); Sales (Orders, Inquiries); footer Settings, Change password, Sign out | AdminSidebar.tsx; AdminLayout.tsx | none | working | There are no count badges, so new orders and inquiries are only visible by opening each screen. |
| D-016 | AdminLoadError with Retry (used on every list) | AdminLoadError.tsx | none | working | none |
| D-017 | AdminPager (prev/next, disabled while fetching) | AdminPager.tsx | none | working | none |
| D-018 | AdminSearchBox (300ms debounce) | AdminSearchBox.tsx | none | working | none |
| D-019 | URL-state params (setParam replaces history, drops defaults, resets page) | hooks/use-*-filters | none | working | none |
| D-020 | Invalid ?page= falls back to 1; page clamp to the last page | lib readPageParam; usePageClamp | none | working | none |
| D-021 | Row selection shared by orders and products (toggle, toggleMany, toggleAll, clear, groupState; intersected with the visible rows) | hooks/use-row-selection.ts | none | working | none |
| D-022 | Table scroll hint on narrow screens | TableScrollHint.tsx | none | working | none |
| D-023 | Contact links (mailto / tel) | contact-links.tsx | none | working | none |
| D-024 | CSV download helper (text/csv blob, anchor click) | hooks/use-csv-download.ts | none | working | none |
| D-025 | CSV writer: BOM, every cell quoted, formula-injection guard, CRLF | lib/csv-write | none | working | none |
| D-026 | CSV parser: RFC 4180, strips the BOM, undoes the apostrophe guard | lib/csv-parse | none | working | none |

## C. Dashboard

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-027 | Loading state; any query error shows AdminLoadError | pages/admin/DashboardPage.tsx:45-54 | orders, products | working | none |
| D-028 | Revenue cards | lib/admin-dashboard-metrics.ts:43-49, 81, 138 | orders | partial | Revenue counts `paid` only, so a partially_refunded order drops out entirely rather than being counted net. The figures are wrong after any partial refund. |
| D-029 | Orders today / this month | admin-dashboard-metrics.ts:55-56 | orders | partial | Counts unpaid, expired and abandoned checkouts as orders. |
| D-030 | "Open Deliveries" card | DashboardPage.tsx:82-86 | orders | partial | Labelled "awaiting collection" but counts every paid pending order, deliveries included. |
| D-031 | Top products | admin-dashboard-metrics.ts | order_items | partial | Ignores refunds. |
| D-032 | Operational alerts: cancelled but not refunded | lib/admin-alerts.ts:69-81 | orders | partial | The copy still says the admin "cannot do it yet", but refunds now exist. Fires only when refundCents === 0, so a part-refunded cancelled order is never flagged. |
| D-033 | Operational alerts: packed too long / uncollected | admin-alerts.ts | orders | partial | Ignores payment status. |
| D-034 | Migration alert (critical; links to Settings) | lib/migration-alerts.ts:27-59; hooks/use-migration-status.ts:33-38 | rpc applied_migrations (016) | working | Undefined on a query error, so a failed check shows no alert. This is deliberate, but it means the failure is silent on the dashboard. |
| D-035 | Unmatched payments card: list | components/admin/dashboard/UnmatchedPaymentsCard.tsx:30-35; hooks/use-payment-alerts.ts | payment_alerts (029) | partial | A read error renders nothing, so a webhook money alert can disappear silently. |
| D-036 | Unmatched payments: "Mark handled" | same; data/payment-alerts-repository.ts:34 | update resolved_at | partial | No confirmation, and no read-back, so a zero-row update reports success. |

## D. Orders list, board, bulk, export

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-037 | Table / Board view toggle | OrdersToolbar.tsx; OrdersView.tsx | none | working | none |
| D-038 | Archived toggle | OrdersToolbar.tsx | orders.is_archived | working | none |
| D-039 | Payment tabs: All, Paid, Pending, Expired, Refunded | OrdersToolbar.tsx | orders.payment_status | partial | There are no tabs for partially_refunded, failed or abandoned. Those orders only show under All. |
| D-040 | Fulfilment filter select | OrdersToolbar.tsx | orders | working | none |
| D-041 | "Needs attention" toggle | lib/order-attention.ts | orders.attention_reason | partial | The flag is never cleared: needsAttention stays true until the order is fulfilled or cancelled. |
| D-042 | Search | OrdersToolbar.tsx; data/orders-repository.ts | orders ilike | working | none |
| D-043 | Pagination (25 per page) | OrdersTablePanel.tsx | range() | working | none |
| D-044 | Loading, error and empty states (filtered / none) | OrdersTablePanel.tsx | none | working | none |
| D-045 | Select all / per-row select | OrdersTable.tsx; use-row-selection.ts | none | working | none |
| D-046 | Inline fulfilment select per row | OrderFulfilmentSelect.tsx; orders-repository.ts:99-101 | guard_fulfillment_status (025) | working | Options are filtered by canMoveFulfillment, which mirrors the 025 guard. The DB is the backstop. |
| D-047 | Row archive / unarchive | OrdersTableRow.tsx; orders-repository.ts:130 | update is_archived | partial | One click, no confirmation, no read-back. A paid, unfulfilled order can be archived out of sight. |
| D-048 | Bulk "Set fulfilment" with AlertDialog | OrdersBulkBar.tsx; hooks/use-orders-actions.ts:74-84; orders-repository.ts:229 | guard trigger | partial | Offers every status without the per-order transition check. The DB rejects the bad ones, but the work is chunked, so it can partly succeed and the toast is generic. |
| D-049 | Bulk archive | OrdersBulkBar.tsx; orders-repository.ts:216 | update is_archived | partial | No confirmation. |
| D-050 | Export CSV (all filtered) / Export N selected | lib/orders-csv.ts; data/orders-export-repository.ts | orders, order_items | partial | "Net of VAT" = total − VAT, which includes shipping. Total is gross, not net of refunds. Created and Paid at are raw ISO UTC. Fine for a bookkeeper, misleading for Alan. |
| D-051 | Board columns per method (pickup / delivery / mixed lanes) | OrdersBoard.tsx; lib/order-board.ts | none | working | Cancelled orders are absent from every board. |
| D-052 | Board "unplaced" box for odd statuses | OrdersBoardPanel.tsx | none | working | none |
| D-053 | Board card advance button | OrderBoardCard.tsx; lib/order-board.ts:82-88 | guard trigger | working | Unpaid orders get no advance button (canMoveFulfillment). |
| D-054 | Open detail sheet from a row or card | OrdersView.tsx | orders, order_items | working | none |
| D-055 | Stripe dashboard link | lib/stripe-dashboard-link.ts | none | partial | Always builds the live-mode URL, so the link is wrong while test keys are in use. |
| D-056 | "New counter sale" button | OrdersToolbar.tsx | see section F | working | none |

## E. Order detail, refund, emails, tracking

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-057 | Detail sheet: loading, error, not-found | OrderDetailSheet.tsx | orders-repository.ts:71-72 | working | none |
| D-058 | Lines summary (name, qty, unit, subtotal, method) | OrderLinesSummary.tsx | order_items | working | none |
| D-059 | Delivery details block | OrderDeliveryDetails.tsx:49 | orders.shipping_* | working | Address lines are keyed by their text, so identical lines trigger a React key warning. Cosmetic. |
| D-060 | Attention notice | OrderAttentionNotice.tsx | orders.attention_reason | partial | Cannot be dismissed (see D-041). |
| D-061 | Fulfilment status change in the sheet | OrderFulfilmentSelect.tsx | 025 guard | working | Cancelling is allowed from pending, ready_for_pickup or packed with no confirmation that names the money. Cancelling a paid order does not refund it; that is a separate step. |
| D-062 | Status-email label ("will email the customer") | lib is-status-email-due mirror of 033 | 033 is_status_email_due | partial | The label ignores 033's "already emailed once" skip, so it can promise an email that will not be sent. |
| D-063 | Tracking number field (4-40 characters, A-Z, 0-9, space and hyphen; upper-cased; blank clears it; An Post link) | OrderTrackingNumberField.tsx; lib/tracking-number.ts; orders-repository.ts:112 | orders.tracking_number (033) | working | Read-back unknown. Check that line 112 selects the row. |
| D-064 | Order notes | orders-repository.ts:118 | orders.notes | partial | Shown read-only in the sheet. A setter exists in the repository but I found no UI for it, and it does no read-back. |
| D-065 | Order emails list and Resend | OrderEmailsSection.tsx; lib/order-email-display.ts; data/order-emails-repository.ts | notification_jobs (030/031) | partial | Resend is allowed for any email that is not pending, including ones already sent, with no confirmation. It sends a duplicate to the customer. |
| D-066 | Refund section (eligibility: Stripe, payment intent, paid or partially_refunded) | OrderRefundSection.tsx; lib refundEligibility | none | working | Counter sales (cash or card terminal) show no refund path. Alan has to refund at the till, and the order still reads paid. There is no "mark refunded off-Stripe". |
| D-067 | Refund dialog: amount (prefilled with the full balance), reason (requested_by_customer / duplicate / fraudulent) | OrderRefundDialog.tsx; lib parseRefundAmount | none | partial | The full balance is the default and there is no second confirmation, so one click refunds the whole order. |
| D-068 | Refund submit to the Edge Function | data/refunds-repository.ts; functions/refund-order/index.ts:63-85 | Stripe refunds.create; idempotency `refund:{order}:{attemptId}` | partial | refundableCents = total − refund_cents (load-order.ts:67), and refund_cents only moves when the webhook lands (record_refund, 025). Reopening the dialog gives a new attemptId, so a second refund can go out before the first is recorded. Stripe stops the total exceeding the charge, but two intended-once partial refunds can both succeed. |
| D-069 | Refund recorded by the webhook (never lowers refund_cents; refunded vs partially_refunded) | migrations/025 record_refund | service role | working | The order stays "paid" in the admin until the webhook arrives. If the webhook fails, the admin shows no refund at all. |
| D-070 | Print invoice / packing slip buttons | components/admin/print/print-actions.tsx | none | working | none |
| D-071 | Status history | lib/order-mappers.ts rowToOrderStatusLog | order_status_log | stub | The mapper exists but nothing displays it. Who changed what is invisible in the admin. |
| D-072 | Delete order | none | none | n/a | Not offered. Archive only. |

## F. Counter sale

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-073 | Sheet open, close and reset | CounterOrderSheet.tsx:97-106 | none | partial | Closing (Esc, overlay, Cancel) discards the whole basket with no "discard?" prompt. |
| D-074 | Product picker: search 2+ characters, 6 results, already-added disabled, archived excluded | CounterOrderProductPicker.tsx | useAdminProducts | working | Out-of-stock products are pickable ("Marked out of stock") by design; 038 says the item is on the counter. |
| D-075 | Catalogue load error notice | CounterOrderSheet.tsx:164-169 | products | working | none |
| D-076 | Line quantity | CounterOrderLines.tsx:54-65 | none | partial | No maximum. A mistyped 100 records a sale of 100 at once. A blank box becomes 1. |
| D-077 | Per-line Collect / Post toggle (Post disabled when not shippable) | CounterOrderLines.tsx:85-104 | none | working | none |
| D-078 | Remove line | CounterOrderLines.tsx:72-80 | none | working | none |
| D-079 | Customer name (2+ characters required) | CounterOrderCustomerFields.tsx; lib/counter-order-draft.ts:43 | none | working | none |
| D-080 | Email (required when posting) and phone | same; counter-order-draft.ts:55-72 | orders_customer_email_present (013) | working | none |
| D-081 | Channel (counter / phone) and payment method (cash / card terminal / bank transfer) | CounterOrderCustomerFields.tsx:77-110 | orders.channel, payment_method (013) | working | none |
| D-082 | Delivery address with Eircode regex (only when posting) | CounterOrderCustomerFields.tsx:115-156; counter-order-draft.ts:15 | orders.shipping_* | working | The address is dropped if every line is switched back to Collect (draft.ts:100-104). Good. |
| D-083 | Notes and "Age checked in person" | CounterOrderCustomerFields.tsx:159-176 | orders.notes, age_verified | partial | Age check is optional and unchecked by default. Whether it should be mandatory for RIFs is a compliance question. |
| D-084 | Totals preview: items, delivery, total, VAT, handover | lib/counter-order-totals.ts:87-117 | store-rates cache | working | Shows "Worked out on save" if the rates are missing. |
| D-085 | Record sale | hooks/use-create-counter-order.ts; migrations/038 create_counter_order | rpc (aal2; server prices every line) | partial | The success toast shows the client-side total (CounterOrderSheet.tsx:129), not the total the server saved. A stale price cache can show Alan a different figure from the one recorded. |
| D-086 | Counter sale and stock | 038 create_counter_order | none | working | Does not touch in_stock. Selling the last unit leaves it "In stock" on the website until Alan unticks it. See D-097. |

## G. Print documents

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-087 | Print page: loading, error, not-found, Back, Print | pages/admin/OrderPrintPage.tsx:27-86 | useOrder | working | none |
| D-088 | Invoice (goods, VAT, refunds, net) | components/admin/print/invoice.tsx:13-109 | none | partial | There is no seller VAT number (stated at 13-17), so it is not a compliant Irish VAT invoice. VAT shown is the original figure after a refund (line 99). Printable for unpaid orders (not checked). |
| D-089 | Packing slip (no prices) | print/packing-slip.tsx | none | working | none |
| D-090 | Document kind from ?kind= | lib/order-document.ts:16 | none | working | none |

## H. Products

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-091 | List: loading, error, empty (filtered / nothing archived / none yet) | ProductsTable.tsx | admin-products-repository listProducts | working | none |
| D-092 | Category accordion groups (all open) | ProductsGroups.tsx; ProductsTableGroup.tsx | none | working | none |
| D-093 | Pagination with page clamp | ProductsTable.tsx | range() | working | none |
| D-094 | Search: name, brand, tag or slug (?q=) | ProductsToolbar.tsx; admin-products-repository.ts | search_text ilike (015) with escapeSearchTerm | working | none |
| D-095 | Stock filter: Any / In / Out (?stock=) | ProductsToolbar.tsx | in_stock | working | none |
| D-096 | Archived toggle | hooks/use-products-filters.ts | is_archived | partial | Kept in local state, not the URL, so a reload drops back to live products. |
| D-097 | Row stock switch | ProductsTableRow.tsx; admin-products-repository.ts:181-193 | products.in_stock (038) | partial | The only thing that stops overselling. One click, no read-back. Nothing unticks it on a sale (ProductFormFields.tsx:29). |
| D-098 | Row status badge (Archived / Live / Draft); price with sale strikethrough | ProductsTableRow.tsx | none | working | none |
| D-099 | Row Edit | ProductsTableRow.tsx | none | working | none |
| D-100 | Row Archive / Restore | ProductsTableRow.tsx; setProductsArchived | is_archived, archived_at, is_published=false, is_featured=false (026) | partial | Archiving a live product needs one click with no confirmation, and it disappears from the shop immediately. Restore brings it back as a draft, not live. |
| D-101 | Bulk Publish (confirms only if any product has no image or price ≤ 0) | ProductsBulkBar.tsx; ProductsDialogs.tsx | bulkUpdateProducts | working | none |
| D-102 | Bulk Unpublish | ProductsBulkBar.tsx | is_published | partial | One click, no confirmation. Can take the whole catalogue off the shop at once. |
| D-103 | Bulk Feature / Unfeature | ProductsBulkBar.tsx | is_featured | working | none |
| D-104 | Bulk In stock / Out of stock | ProductsBulkBar.tsx | in_stock | partial | One click. |
| D-105 | Bulk Archive (AlertDialog) | ProductsBulkBar.tsx | 026 | working | none |
| D-106 | Bulk "Restore as drafts" (archived view) | ProductsBulkBar.tsx | 026 | working | No confirmation, but harmless. |
| D-107 | Bulk partial failure toast ("Not every selected product was changed") | hooks/use-products-actions.ts | chunked by ID_CHUNK | partial | Does not say which products failed. |
| D-108 | Cache invalidation after product mutations | hooks/use-admin-products.ts | none | working | Invalidates ['admin','products'], ['products'] and ['subcategories']. |
| D-109 | Add product sheet (defaults: rifles, new, in stock, not shippable, draft) | ProductFormSheet.tsx | createProduct | working | none |
| D-110 | Edit product sheet (full patch) | ProductFormSheet.tsx | updateProduct (.select() at 149) | partial | No unsaved-changes guard on Cancel or close. |
| D-111 | Name (min 2) | lib/product-form-schema.ts | none | working | none |
| D-112 | Slug (^[a-z0-9-]+$), editable after creation | ProductFormFields.tsx; product-form-schema.ts | products.slug | partial | Changing the slug of a live product breaks its storefront URL, links already shared and its SEO, and there is no redirect or warning. |
| D-113 | Category (6 fixed) and subcategory (cleared when the category changes; disabled if none) | ProductFormFields.tsx | subcategories | working | none |
| D-114 | Brand slug, condition (new / pre-loved) | ProductFormFields.tsx | none | working | none |
| D-115 | Price (> 0, at most 2 decimals, Math.round × 100) and sale price (< price) | product-form-schema.ts | price_cents, sale_price_cents | working | none |
| D-116 | Short description (5-200) and description (≤ 20000) | product-form-schema.ts | none | working | none |
| D-117 | Tags (comma-separated) | ProductFormFields.tsx | tags[] | working | none |
| D-118 | Checkboxes: In stock, Published, New, Featured, Can be posted | ProductFormFields.tsx | flags | partial | The form's Published checkbox has no readiness warning (no image / €0), unlike the bulk bar (D-101). |
| D-119 | Image upload (JPEG, PNG, WebP; several at once; 25MB source cap; resized in the browser to 1600px, JPEG 0.82) | ProductImagesField.tsx; data/storage-repository.ts:43-56 | product-images bucket, products/{year}/{uuid} | working | Shows a toast for each failed file. Save is disabled during upload. |
| D-120 | Reorder (main image) and remove image | ProductImagesField.tsx | none | working | none |
| D-121 | Image cleanup: uncommitted uploads deleted on cancel or remove; committed ones queued by trigger and swept | storage-repository.ts; migrations/011:132-197; functions/sweep-orphan-images | orphaned_images, storage | partial | Best effort: errors are swallowed, so orphans are possible. Removing an image from a product queues the file for permanent deletion. |
| D-122 | Save error toast | ProductFormSheet.tsx | none | working | Shows the raw err.message. |
| D-123 | Delete product | none | delete revoked (026) | n/a | Archive only. |
| D-124 | Export CSV (whole non-archived catalogue) | lib/products-csv.ts | listAllProducts (pageAll) | working | none |
| D-125 | Import CSV: pick file (4MB max; disabled until the catalogue loads) | ProductImportDialog.tsx | none | working | none |
| D-126 | Import preview: new / to update / already match / rejected; unknown columns; first 8 of each | ProductImportPreview.tsx; lib/product-import*.ts | none | working | none |
| D-127 | Import validation | lib/product-import*.ts | none | partial | parseEuros accepts 0, so the import can set €0.00 where the form needs more than 0. Image cells are not checked to be URLs. There is no check that the subcategory exists. There is no 200-character limit on the short description. Published=Yes has no readiness check. Archived products are matched and updated. |
| D-128 | Import matching on slug | lib/product-import*.ts | none | partial | A changed slug in the sheet creates a duplicate product instead of renaming. Duplicate slugs within the file are rejected. |
| D-129 | Import: only the columns present are written | lib/product-import*.ts | none | partial | An empty Images cell sets images [], so 011 queues every image file for deletion. One bad spreadsheet edit can wipe product photos permanently. |
| D-130 | Import run: inserts in batches of 50 with row-by-row fallback; updates one at a time; no transaction | data/products-import-repository.ts | products | partial | If it fails mid-run the catalogue is left half-imported. Caches are invalidated only onSuccess, so a thrown network error leaves the admin list stale. |
| D-131 | Import outcome: failures listed by slug; "The import stopped" toast | ProductImportDialog.tsx | none | working | none |

## I. Categories and subcategories

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-132 | List of the 6 fixed categories as accordions with subcategory counts | pages/admin/CategoriesPage.tsx:29-198 | subcategories | working | All accordions start closed (113). |
| D-133 | Loading and error (Retry) | CategoriesPage.tsx:101-111 | none | working | none |
| D-134 | Add subcategory (name; slug auto-generated) | components/admin/SubcategoryFormSheet.tsx:21-66 | insert subcategories (022 aal2) | partial | toSlug can produce leading or trailing hyphens. There is no regex check beyond stripping. sortOrder is always 0. |
| D-135 | Edit subcategory name (slug locked) | SubcategoryFormSheet.tsx:55, 104-110 | update with .select().single() | working | none |
| D-136 | Reorder subcategories | categories-repository.ts:46-67 (sortOrder patch) | sort_order | stub | No UI. The order is insertion order / 0. |
| D-137 | Delete subcategory (AlertDialog; refused if non-archived products use it) | CategoriesPage.tsx:61-75, 211-231; data/categories-repository.ts:69-72 | guard_subcategory_delete (026) | partial | Archived products under it are left stranded, and restoring one yields a product in a subcategory that no longer exists. The delete does not invalidate the product caches. |
| D-138 | Top-level categories | CATEGORY_ORDER constant | none | n/a | Fixed in code (and in the CSV import), not editable. |

## J. Inquiries

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-139 | Status tabs: All, New, Replied, Archived | components/admin/InquiriesTable.tsx:26-75 | inquiries.status | working | none |
| D-140 | Loading, error (Retry), empty "No inquiries found" | InquiriesTable.tsx:78-147 | none | working | none |
| D-141 | "Load more" (raises the limit; shows N of total) | InquiriesTable.tsx:154-168; data/inquiries-repository.ts:47-61 | range(0, limit) with count exact | working | none |
| D-142 | Inline status select per row | InquiriesTable.tsx:122-137 | update with .select().single() (036) | working | The error toast is generic. |
| D-143 | Detail sheet: from, contact links, message, source page | components/admin/InquiryDetailSheet.tsx | none | working | none |
| D-144 | Status change in the detail sheet | InquiryDetailSheet.tsx:31-38, 69-83 | same | partial | The sheet holds a snapshot of the inquiry (InquiriesTable.tsx:36, 108), so after a change the select keeps showing the old status until the sheet is reopened. |
| D-145 | Search inquiries | none | none | n/a | Not offered. |
| D-146 | Delete inquiry (GDPR erasure) | none | none | n/a | Not offered. Erasure requests need SQL. |
| D-147 | Inquiry notifications to the owner | migrations/039 | notification_jobs | unknown | Not traced. |

## K. Settings

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-148 | Rates load: loading, error (no fallback rates shown) | pages/admin/SettingsPage.tsx:22-39; data/settings-repository.ts:12-27 | store_settings row 1 (010) | working | none |
| D-149 | Delivery charge (euro, at most 2 decimals) | components/admin/StoreRatesForm.tsx:52-66; lib/store-rates-form.ts:17, 53-55 | shipping_flat_cents | working | none |
| D-150 | Free delivery threshold (0 = every delivery free) | StoreRatesForm.tsx:69-83 | free_shipping_threshold_cents | partial | Help text says "at or above"; the SQL is `< threshold`, which is consistent. But 0 makes all delivery free with no confirmation. |
| D-151 | VAT rate % (0-100, at most 2 decimals) | StoreRatesForm.tsx:87-99; store-rates-form.ts:61-64 | vat_rate_basis_points | partial | 0% or a typo (e.g. 2.3) is accepted with no confirmation, and it changes the VAT recorded on every future order. The help text warns, but nothing stops it. |
| D-152 | Save rates: "Nothing to save" for no change; read-back catches an RLS no-op; the cache is replaced immediately | StoreRatesForm.tsx:27-47; settings-repository.ts:38-63; hooks/use-store-rates.ts:29-35 | update with select | working | Other open tabs and carts keep their 10-minute cache, but the checkout re-reads the rates on the server. |
| D-153 | Migration status panel: in sync / pending list / unexpected list / check-missing / error | components/admin/MigrationStatusPanel.tsx; data/migrations-repository.ts; lib/migration-status.ts | rpc applied_migrations (016) | working | Cached for 30 minutes with no refetch on focus. After a `db push` Alan has to reload. |

## L. Backend behaviour behind admin actions

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| D-154 | Fulfilment transition guard (lanes per method; cancelled is final; cancel only before handover; moving forward needs payment) | migrations/025:38-99 | trigger | working | Within a method, any lane can move to any other, backwards included. Moving a "delivered" order back to pending is allowed. |
| D-155 | Status log changed_by = auth.uid() | 025:151-152 | order_status_log | working | Not displayed (D-071). |
| D-156 | record_refund never lowers refund_cents | 025:173-199 | service role | working | none |
| D-157 | Counter order function: server-priced, aal2, shares the order number sequence, paid immediately | 038:154-318 | rpc | working | The 038 version dropped the `for update` row lock from 013. Harmless now that nothing counts stock. |
| D-158 | Product delete revoked; archived-not-published constraint | 026:32-41 | constraint | working | none |
| D-159 | Subcategory delete guard | 026:53-83 | trigger | working | See D-137. |
| D-160 | Simple stock: reserve_order_stock only checks in_stock; confirm_order_paid no longer takes stock | 038:77-150 | rpc | working | By design, two customers can both buy the last item. Overselling is prevented only by Alan unticking In stock. |
| D-161 | Writes that do not read the row back (an RLS or zero-row no-op reports success) | admin-products-repository.ts:181, 193; orders-repository.ts:118, 130, 216, 229; payment-alerts-repository.ts:34; categories-repository.ts:70 | PostgREST | partial | settings-repository.ts:29-37 documents exactly this trap and guards against it. These do not. Low risk behind the MFA gate, but a deleted or already-changed row fails silently. |
| D-162 | Storage policies for product images (admin aal2 insert, update and delete; public read) | migrations/011:55-80 | storage.objects | working | none |
| D-163 | Orphaned-image sweeper | functions/sweep-orphan-images; 011:132-197; 012 | cron | unknown | I did not check the grace period or the schedule. |

---

## Cross-area hand-offs

These need checking from the area named, not from the admin:

- **Storefront / catalogue bank.** Slug edits (D-112) and import slug changes (D-128) break live product URLs with no redirect.
  - Check whether the storefront 404s gracefully and whether the sitemap regenerates.
  - Also check that archived and unpublished products vanish from listings, search, the sitemap and cached pages (D-100, D-102).
- **Checkout / Stripe bank.**
  - Overselling relies on the hand-set in_stock flag (D-097, D-160). There is no automatic out-of-stock after the last sale, for web or counter.
  - Confirm that the cart's 10-minute rates cache (D-152) cannot disagree with the amount create-checkout-session charges.
- **Webhook / payments bank.**
  - Refunds show only after `charge.refunded` lands (D-068, D-069). Verify that the webhook writes refund_cents, and that a failed webhook raises a payment alert.
  - Also: the double partial refund window (D-068), the live-only Stripe link (D-055), and what happens on the order when a refund is made in the Stripe dashboard directly.
- **Notifications bank.**
  - Resend of a sent email duplicates it (D-065).
  - The status-email label versus 033's once-only rule (D-062).
  - Inquiry notifications (D-147).
- **Auth / security bank.**
  - No MFA recovery UI (D-008).
  - Changing the password does not need the current one (D-012).
  - Invites are SQL only (D-014).
  - Redirect allow-list for reset links (D-009).
- **Data and storage bank.**
  - A CSV import with blank Images permanently deletes photos through the 011 queue and the sweeper (D-129, D-163).
  - Sweeper grace period.
  - Stranded archived products after a subcategory delete (D-137).
- **Reporting / accounts.**
  - The dashboard drops partially refunded orders from revenue (D-028) and counts abandoned checkouts as orders (D-029).
  - The CSV "Net of VAT" includes shipping (D-050).
  - The invoice has no VAT number and does not adjust VAT after a refund (D-088).
  - Counter-sale refunds have no record path (D-066).
- **Compliance / GDPR.**
  - No inquiry deletion (D-146).
  - The age check on counter sales is optional (D-083).
- **Deploy / ops.**
  - The migration panel caches for 30 minutes (D-153).
  - The dashboard shows nothing when the migration check itself errors (D-034).
