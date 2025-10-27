# Ecommerce Implementation Plan

A high-level roadmap for adding a lightweight storefront that sells a small set of coloring products. The goal is to reuse the existing stack (Next.js + Sanity + MongoDB + Stripe) and get to a production-ready flow where customers can browse, buy, and receive digital goods or physical books.

---

## 1. Prerequisites & Setup
- **Stripe account**: Enable payments, configure business info, taxes/VAT, and create test products/prices.
- **Environment variables**: Extend `.env.local` with `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and any product IDs if using pre-created Stripe prices.
- **Sanity schema access**: Confirm ability to deploy schema changes (`sanity-studio/`).
- **MongoDB collections**: Reuse existing database; plan a new `orders` collection for receipts and fulfillment state.

---

## 2. Content & Catalog (Sanity)
1. **Define product document** (`sanity-studio/schemas/product.ts`):
   - Fields: title, slug, shortDescription, longDescription (PortableText), heroImage, gallery, price (numeric for display), stripePriceId, tags, productType (`digital` vs `physical`), availability flags, downloadAsset reference (for digital goods), printablePreview reference.
2. **Deploy schema** with `npm run deploy` in the studio and seed a few products.
3. **Update GROQ helpers** (`src/lib/sanity.ts`):
   - `getProducts()`, `getProduct(slug)`, `getFeaturedProducts(limit)`.
   - Align with existing image builders for consistent caching.
4. **Sanity preview** (optional): extend `VisualEditing` to support new document type.

---

## 3. Payment & Order Backend (Stripe + MongoDB)
1. **Stripe service wrapper** (`src/lib/stripe.ts`): instantiate Stripe SDK, expose helpers (`createCheckoutSession`, `retrieveSession`).
2. **Checkout endpoint** (`src/app/api/checkout/route.ts`):
   - Accept product slug/quantity, fetch product via Sanity to avoid tampering.
   - Create Checkout Session with success & cancel URLs, shipping options (if any), metadata (productId, userId).
   - Return session URL to the client.
3. **Webhook handler** (`src/app/api/stripe/webhook/route.ts`):
   - Verify signature, handle `checkout.session.completed`, `payment_intent.succeeded`.
   - On success, fetch product info and persist order in MongoDB (`orders` collection) with status, Stripe IDs, customer email, fulfillment data (download URL or shipping info).
   - Trigger follow-up actions: send receipt via Resend, unlock download links, decrement inventory if tracked.
4. **Order model utilities** (`models/order.ts`, `src/lib/orders.ts`):
   - Define TypeScript interfaces, `createOrder`, `updateOrderStatus`, `findOrdersByCustomer`.
5. **Authenticated order retrieval API** (`src/app/api/orders/route.ts`): optional but useful for a user dashboard; requires NextAuth session.
6. **Security & validation**:
   - Ensure only published products proceed to checkout.
   - Validate quantities, enforce digital goods at quantity 1 if needed.
   - Guard webhook route against unauthorized methods.

---

## 4. Frontend UI & Flows
1. **Product listing**:
   - New page (`/butik` or `/produkter`) using `getProducts()` to render cards (reuse `DrawingCard` patterns; add pricing CTA).
   - Highlight featured products on homepage hero or footer.
2. **Product detail page** (`src/app/produkter/[slug]/page.tsx`):
   - Show gallery, description, price, specs, suggested uses.
   - Include structured data (`Product` JSON-LD) for SEO.
3. **Checkout button component**:
   - Client component that calls `/api/checkout` and redirects to Stripe (handle loading/state, error toast via `sonner`).
   - Optionally differentiate between `digital` (instant download) and `physical` (collect shipping address).
4. **Success page** (`/checkout/success`):
   - Use `session_id` query param to confirm payment via Stripe API.
   - Show order summary, download links for digital goods, or shipping expectations for physical goods.
   - Offer CTA to create an account / view library if not already authenticated.
5. **Cancel page** (`/checkout/cancel`):
   - Graceful UX with product upsell.
6. **My orders / Library** (optional but recommended):
   - Auth-only page pulling from `orders` API to let customers redownload assets.
7. **Navigation updates**: add header/footer links to the store and account areas.
8. **Analytics**: fire GA events on checkout start, success, and refunds.

---

## 5. Fulfilment Logic
- **Digital goods**: store downloadable asset either in Sanity (file asset), Supabase, or S3. Webhook marks order `fulfilled` and either emails a signed URL or records asset for the dashboard.
- **Physical goods** (if applicable): add shipping address fields in Checkout, track fulfillment status (`pending`, `shipped`, `delivered`) in Mongo, and optionally integrate with a shipping provider.

---

## 6. Notifications & Communication
- **Order confirmation email** via existing Resend service: template with order summary, download links, and support contacts.
- **Admin alerts**: optional Slack/email when new purchase arrives.
- **Refund handling**: monitor Stripe dashboard; update Mongo order status via webhook events (`charge.refunded`).

---

## 7. Security & Compliance
- Enforce HTTPS (already handled in middleware) for checkout endpoints.
- Update privacy policy to include payment processing details.
- Store minimal PII; rely on Stripe for sensitive data.
- If selling to EU, configure VAT rates in Stripe and display tax-inclusive pricing as required.
- Ensure cookies/consent banner accounts for Stripe scripts if needed.

---

## 8. Testing & QA
- **Unit tests**: stripe service mocks, order helpers, Sanity queries.
- **Integration tests**: call `/api/checkout` with mocked Stripe, verify webhook handling using Stripe CLI (`stripe listen`).
- **Manual QA**: run through checkout (test mode), confirm emails, database entries, and download access.
- **Performance**: ensure store pages use ISR (set `revalidate`), optimize product imagery with existing `OptimizedImage`.

---

## 9. Deployment Checklist
- Populate Stripe products/prices for production.
- Deploy Sanity schema & revalidate site.
- Set environment variables on Vercel (or hosting provider) for Stripe keys & webhook secret.
- Add webhook endpoint in Stripe dashboard pointing to production URL.
- Migrate database (create `orders` collection, indexes on `customerEmail`, `createdAt`).
- Smoke test checkout in production test mode, then switch to live keys.

---

## 10. Future Enhancements
- Discount codes or bundles (Stripe coupons/promotion codes).
- Inventory tracking, low-stock alerts.
- Cross-selling digital coloring pages in the store.
- Customer reviews (Sanity document type with moderation).
- Subscription offerings for monthly coloring packs.

---

### Summary
By extending Sanity for product data, leveraging Stripe for payments, and persisting orders in MongoDB, the project can ship a minimal-yet-robust ecommerce module without major architectural changes. The steps above cover the full flow from catalog management to checkout, fulfillment, and user experience.
