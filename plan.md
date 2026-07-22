# FarmFresh Implementation Plan

This plan is ordered for Claude Code to execute step-by-step. Each phase builds on the previous one. Do NOT skip phases.

---

## Phase 1: Database Models (Server)

Create Mongoose models for all entities. These are the foundation everything else depends on.

### 1.1 Product Model
**File**: `apps/server/models/productModel.js`

```
Schema fields:
- farmer (ObjectId, ref: User, required)
- name (String, required, trim)
- description (String, required)
- category (String, enum: ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"], required)
- price (Number, required, min: 0)
- unit (String, enum: ["kg", "lbs", "piece", "liter", "dozen", "bundle"], required)
- stock (Number, required, min: 0, default: 0)
- images (Array of { url: String, alt: String }, required, min: 1, max: 5)
- features (Array of String, enum: ["organic", "pesticide-free", "fresh", "non-gmo", "local", "sustainable", "fair-trade", "gluten-free"])
- farmLocation (String, required)
- harvestDate (Date)
- isPublished (Boolean, default: true)
- purchaseCount (Number, default: 0) — for "Featured Products" sorting
- timestamps: true
```

### 1.2 Cart Model
**File**: `apps/server/models/cartModel.js`

```
Schema fields:
- user (ObjectId, ref: User, required, unique)
- items (Array of {
    product (ObjectId, ref: Product, required),
    quantity (Number, required, min: 1, default: 1)
  })
- timestamps: true
```

### 1.3 Order Model
**File**: `apps/server/models/orderModel.js`

```
Schema fields:
- user (ObjectId, ref: User, required)
- orderNumber (String, auto-generated like "FB-YYYY-XXXXXX")
- items (Array of {
    product (ObjectId, ref: Product),
    productName (String),
    productImage (String),
    farmer (ObjectId, ref: User),
    price (Number),
    quantity (Number),
    unit (String)
  })
- deliveryAddress (String, required)
- deliveryDate (Date)
- status (String, enum: ["pending", "confirmed", "shipped", "delivered", "canceled"], default: "pending")
- paymentMethod (String, enum: ["card", "bkash", "nagad"])
- paymentDetails (Object: { cardLast4, transactionId })
- subtotal (Number)
- deliveryFee (Number, default: 50)
- serviceFee (Number, default: 25)
- totalAmount (Number)
- timestamps: true
```

### 1.4 Review Model
**File**: `apps/server/models/reviewModel.js`

```
Schema fields:
- user (ObjectId, ref: User, required)
- product (ObjectId, ref: Product, required)
- order (ObjectId, ref: Order, required) — link review to purchase
- rating (Number, required, min: 1, max: 5)
- comment (String, required, trim)
- timestamps: true
Indexes: compound unique on { user, product } — one review per user per product
```

### 1.5 Favorite Model
**File**: `apps/server/models/favoriteModel.js`

```
Schema fields:
- user (ObjectId, ref: User, required)
- product (ObjectId, ref: Product, required)
- timestamps: true
Indexes: compound unique on { user, product }
```

---

## Phase 2: Server Routes & Controllers

### 2.1 Auth Middleware
**File**: `apps/server/middleware/authMiddleware.js`

- Update to support access token verification
- Add role-based middleware: `farmerOnly`, `optionalAuth` (for pages that show different content for logged-in vs anonymous)
- Add refresh token logic (see 2.2)

### 2.2 Auth Enhancement — Access & Refresh Tokens
**File**: `apps/server/models/userModel.js`, `apps/server/controllers/userController.js`, `apps/server/routes/userRoute.js`

- Add `refreshToken` field to User model
- On login/register: generate access token (1h expiry) + refresh token (7d expiry, stored in DB)
- Add `POST /api/refresh-token` endpoint — validate refresh token, issue new access token
- Add `POST /api/logout` endpoint — clear refresh token from DB
- Return both tokens on login/register responses
- Update `authMiddleware.js` to verify access token only

### 2.3 Product Routes & Controller
**File**: `apps/server/routes/productRoute.js`, `apps/server/controllers/productController.js`

Endpoints:
- `GET /api/products` — List all published products (with search, category filter, sort, pagination)
  - Query params: `search`, `category`, `sort` (price-asc, price-desc, newest, rating, featured), `page`, `limit`
- `GET /api/products/featured` — Top 8 by purchaseCount, fallback to newest
- `GET /api/products/:id` — Single product with farmer info, avg rating, review count
- `POST /api/products` — Create product (farmer only, with image upload via Cloudinary)
- `PUT /api/products/:id` — Update product (farmer only, owner only)
- `PATCH /api/products/:id/publish` — Toggle publish/unpublish
- `DELETE /api/products/:id` — Delete product (farmer only, owner only)
- `GET /api/products/farmer/:farmerId` — Get all products by a specific farmer

Register in `apps/server/index.js` as `app.use("/api", productRoutes)`

### 2.4 Cart Routes & Controller
**File**: `apps/server/routes/cartRoute.js`, `apps/server/controllers/cartController.js`

Endpoints:
- `GET /api/cart` — Get current user's cart (with populated product details)
- `POST /api/cart` — Add item to cart (or increment quantity if already in cart)
- `PUT /api/cart/:itemId` — Update item quantity
- `DELETE /api/cart/:itemId` — Remove item from cart
- `DELETE /api/cart` — Clear entire cart

All cart routes require auth.

### 2.5 Order Routes & Controller
**File**: `apps/server/routes/orderRoute.js`, `apps/server/controllers/orderController.js`

Endpoints:
- `POST /api/orders` — Create order from cart items (clears cart, decrements stock, increments product purchaseCount)
- `GET /api/orders` — Get current user's orders (for normal user view)
- `GET /api/orders/farmer` — Get all orders containing farmer's products (for farmer view)
- `GET /api/orders/:id` — Get single order details
- `PATCH /api/orders/:id/status` — Update order status (farmer only: pending→confirmed→shipped→delivered, or cancel)
- `PATCH /api/orders/:id/cancel` — Cancel order (user only, only if status is "pending")

Generate order number: `FB-YYYY-XXXXXX` (random 6-digit).

### 2.6 Review Routes & Controller
**File**: `apps/server/routes/reviewRoute.js`, `apps/server/controllers/reviewController.js`

Endpoints:
- `GET /api/reviews/product/:productId` — Get reviews for a product (paginated, 5 at a time, logged-in user's review first)
- `POST /api/reviews` — Create review (requires: user has delivered order for that product, one review per user per product)
- `PUT /api/reviews/:id` — Edit review (owner only)
- `DELETE /api/reviews/:id` — Delete review (owner only)
- `GET /api/reviews/user/:userId` — Get user's reviews (for profile)

### 2.7 Favorite Routes & Controller
**File**: `apps/server/routes/favoriteRoute.js`, `apps/server/controllers/favoriteController.js`

Endpoints:
- `GET /api/favorites` — Get current user's favorites (with populated product details)
- `POST /api/favorites` — Toggle favorite (add if not favorited, remove if already favorited)
- `GET /api/favorites/check/:productId` — Check if product is favorited by current user

### 2.8 Update Server Entry Point
**File**: `apps/server/index.js`

Register all new route files. Ensure CORS allows the Next.js client origin.

---

## Phase 3: Client Redux & RTK Query Setup

### 3.1 Product API Slice
**File**: `apps/client/lib/api/endpoints/products.ts`

RTK Query endpoints:
- `getProducts` — GET /api/products (with query params for search, category, sort, page)
- `getFeaturedProducts` — GET /api/products/featured
- `getProductById` — GET /api/products/:id
- `createProduct` — POST /api/products (farmer only)
- `updateProduct` — PUT /api/products/:id
- `togglePublish` — PATCH /api/products/:id/publish
- `deleteProduct` — DELETE /api/products/:id
- `getFarmerProducts` — GET /api/products/farmer/:farmerId

Inject into base API in `lib/api/index.ts`.

### 3.2 Cart API Slice
**File**: `apps/client/lib/api/endpoints/cart.ts`

RTK Query endpoints:
- `getCart` — GET /api/cart
- `addToCart` — POST /api/cart
- `updateCartItem` — PUT /api/cart/:itemId
- `removeFromCart` — DELETE /api/cart/:itemId
- `clearCart` — DELETE /api/cart

### 3.3 Order API Slice
**File**: `apps/client/lib/api/endpoints/orders.ts`

RTK Query endpoints:
- `createOrder` — POST /api/orders
- `getUserOrders` — GET /api/orders
- `getFarmerOrders` — GET /api/orders/farmer
- `getOrderById` — GET /api/orders/:id
- `updateOrderStatus` — PATCH /api/orders/:id/status
- `cancelOrder` — PATCH /api/orders/:id/cancel

### 3.4 Review API Slice
**File**: `apps/client/lib/api/endpoints/reviews.ts`

RTK Query endpoints:
- `getProductReviews` — GET /api/reviews/product/:productId (with pagination)
- `createReview` — POST /api/reviews
- `updateReview` — PUT /api/reviews/:id
- `deleteReview` — DELETE /api/reviews/:id

### 3.5 Favorite API Slice
**File**: `apps/client/lib/api/endpoints/favorites.ts`

RTK Query endpoints:
- `getFavorites` — GET /api/favorites
- `toggleFavorite` — POST /api/favorites
- `checkFavorite` — GET /api/favorites/check/:productId

### 3.6 Update User Slice for Refresh Tokens
**File**: `apps/client/lib/api/endpoints/userSlice.ts`, `apps/client/lib/api/endpoints/users.ts`

- Store both `accessToken` and `refreshToken` in state and localStorage
- Add `refreshAccessToken` mutation endpoint
- Add token refresh interceptor — when access token expires, auto-refresh using refresh token
- Update `setCredentials` to store both tokens
- Update `logout` to call `POST /api/logout` before clearing state

### 3.7 Update Store
**File**: `apps/client/lib/store.ts`

Register all new API slices in the Redux store reducer.

---

## Phase 4: Wire Existing Pages to Real Data

### 4.1 Home Page — Featured Products & Categories
**File**: `apps/client/app/page.tsx`, `apps/client/components/FeaturedProducts.tsx`, `apps/client/components/Categories.tsx`

- FeaturedProducts: Fetch from `GET /api/products/featured`, display up to 8 products
- Categories: Each category click navigates to `/products?category=<name>`
- Each product card: Add to Cart button, Favorite toggle, click title to navigate to `/products/[id]`
- "View All" link navigates to `/products`

### 4.2 Products Page (Search Results)
**File**: `apps/client/app/(main)/products/page.tsx`

- Convert from static to dynamic client component
- Fetch products from API with search/category/sort/pagination query params
- Read URL search params to pre-fill filters
- **Fix UX issue**: Add a search bar at the top of the products page so users can search with a new keyword directly
- Category checkboxes in sidebar: read from URL params, pre-check selected category
- Price range filter, location filter, organic filter — all functional
- Sort dropdown: works with API
- Pagination: functional with API

### 4.3 Product Details Page
**File**: `apps/client/app/(main)/products/[id]/page.tsx`

- Convert from static to dynamic client component
- Fetch product by ID from API
- Display: gallery (with thumbnail switching), category, features (Organic, Fresh), product name, farmer name, rating (avg + count), description, quantity controls, stock
- Actions: Add to Cart, Toggle Favorite, Buy Now (navigates to `/payment-process`)
- Tabbed section: Description, Reviews (fetched from API), Farmer Info
- Related Products: Fetch products in same category

### 4.4 Cart Page
**File**: `apps/client/app/(main)/cart/page.tsx`

- Rewrite completely — remove hardcoded emoji items
- Fetch cart from API (requires auth)
- Display real product images, names, farmer names, prices
- Quantity increment/decrement (update via API)
- Remove item (delete via API)
- Order summary: subtotal, delivery fee (৳50), service fee (৳25), total
- "Proceed to Checkout" navigates to `/payment-process`
- Empty cart state with illustration

### 4.5 Farmers Page
**File**: `apps/client/app/(main)/farmers/page.tsx`

- Fetch farmers from `GET /api/farmers` (already exists)
- Display real farmer data: name, profile picture, farm details, specialization
- "View Products" navigates to `/products?farmer=<id>`

### 4.6 Add Product Page (Farmer Only)
**File**: `apps/client/app/(main)/add-product/page.tsx`

- Convert to client component with form state
- Form fields: name, category, description, price, unit, stock, images (Cloudinary upload), farm location, harvest date, features
- Submit creates product via `POST /api/products`
- Add auth guard: redirect if not farmer

### 4.7 Manage Products Page (Farmer Only)
**File**: `apps/client/app/(main)/manage-list/page.tsx`

- Fetch farmer's products from API
- Display with status badges (Active/Inactive/Out of Stock)
- Actions: Edit, Publish/Unpublish toggle, Delete
- Search and filter bar: functional
- "Add New Product" button navigates to `/add-product`

---

## Phase 5: Payment & Orders

### 5.1 Payment Process Page
**File**: `apps/client/app/(main)/payment-process/page.tsx`

- Dynamic order summary from cart or single product (Buy Now flow)
- Display: all cart items, delivery address (from user profile, editable), subtotal, delivery fee, service fee, total
- Payment form: card/bKash/Nagad selection, card details fields
- **Edit Order Details modal**: Design and implement a modal to update quantity or delivery address before payment
- On submit: create order via API, decrement stock, clear cart, redirect to success page
- Simulated payment — no real payment gateway

### 5.2 Success Page
**File**: `apps/client/app/(main)/success/page.tsx`

- Display order details from the created order (fetch by order ID passed via URL params or state)
- Payment summary with all breakdowns
- **PDF Invoice Download**: Generate PDF invoice with company info, order details, customer info, payment summary
  - Use `@react-pdf/renderer` or `jspdf` + `jspdf-autotable` (install as dependency)
- "View All Orders" navigates to `/bookings`
- Email invoice: trigger server to send PDF invoice via Resend email after order creation

### 5.3 Bookings Page
**File**: `apps/client/app/(main)/bookings/page.tsx`

- Dynamic order list from API
- **Normal User View**: Orders with status timeline, Download Invoice, Review button, Reorder button, Cancel button (if pending)
- **Farmer View**: All orders for their products, status update dropdown (Pending→Confirmed→Shipped→Delivered→Canceled)
- Role detection: check `user.userType` from Redux state
- Reorder flow: add all items from a previous order back to cart, navigate to cart
- Pagination for orders list

### 5.4 Server: Send Invoice Email
**File**: `apps/server/utils/email.js`

- Add `sendOrderConfirmationEmail(userEmail, order, pdfBuffer)` function
- Attach PDF invoice to the email
- Call this after successful order creation in `orderController.js`

---

## Phase 6: Authentication Enhancements

### 6.1 Google Social Login
**File**: `apps/server/controllers/userController.js`, `apps/client/app/(auth)/login/page.tsx`, `apps/client/app/(auth)/register/page.tsx`

- **Server**: Add `POST /api/auth/google` endpoint — accepts Google ID token, verifies it, creates/finds user, returns JWT + refresh token
- **Client**: Install `@react-oauth/google` or use Google Identity Services script
- Update both login and register pages: wire the "Continue with Google" button
- If user registers via Google for the first time, prompt for additional fields (phone, address, userType)
- Store both access and refresh tokens on successful Google auth

### 6.2 Parallel & Intercepting Routing for Login/Register
**File**: `apps/client/app/(main)/@modal/(.)login/page.tsx`, `apps/client/app/(main)/@modal/(.)register/page.tsx`, `apps/client/app/(main)/layout.tsx`

- Create `@modal` parallel route slot in `(main)/layout.tsx`
- Create intercepting routes: `(.)login` and `(.)register` inside `@modal/`
- These render login/register forms in a modal overlay
- On refresh: falls back to the standalone `/login` or `/register` pages (handled by Next.js default behavior)
- Close modal on successful auth or clicking outside

### 6.3 Profile Page
**File**: `apps/client/app/(main)/profile/page.tsx`

- Display user info: name, email, phone, address, profile picture, bio
- Farmer-specific: farm name, specialization, farm size
- Edit profile form with image upload
- Change password section

---

## Phase 7: Review System

### 7.1 Write Review
**File**: `apps/client/components/ReviewModal.tsx` (already exists, needs implementation)

- Modal with star rating selector (1-5) and comment textarea
- "Write a Review" button visible ONLY if user has a delivered order for that product
- One review per user per product — show "Edit Review" instead if already reviewed
- Logged-in user's review appears at top of list

### 7.2 Review Display
**File**: `apps/client/app/(main)/products/[id]/page.tsx` (tabbed section)

- Fetch reviews with pagination (5 per load)
- "Load More Reviews" button fetches next 5 and appends
- Each review shows: user avatar, name, rating stars, date, comment
- Owner of review sees Edit/Delete buttons

---

## Phase 8: Search & Navigation Fixes

### 8.1 Search Functionality
**File**: `apps/client/components/Navbar.tsx`

- Wire the search input in navbar: on Enter or submit, navigate to `/products?search=<query>`
- Mobile search: add search functionality to mobile menu

### 8.2 Fix Static HTML Links
**Files**: All static pages (`add-product`, `manage-list`, `farmers`, `success`, `bookings`, `products/[id]`)

- Replace all `href="index.html"` → `href="/"`
- Replace all `href="products.html"` → `href="/products"`
- Replace all `href="details.html"` → use proper Next.js Link with dynamic routes
- Replace all `href="bookings.html"` → `href="/bookings"`
- Replace all `href="manageList.html"` → `href="/manage-list"`
- Replace all `href="create.html"` → `href="/add-product"`
- Replace all `href="register.html"` → `href="/register"`
- Replace all `href="success.html"` → handle via router after order creation

### 8.3 Navbar Role-Based Updates
**File**: `apps/client/components/Navbar.tsx`

Current navbar already has basic role rendering. Enhance:
- **Unauthenticated**: Login & Signup buttons (already done)
- **Farmer**: Photo & Name, Home, Add Product, Manage Products, About, Logout (update links to match actual routes)
- **Normal User**: Photo & Name, Home, Products, Farmers, My Orders, About, Logout (update links)
- Cart icon should show actual cart item count from API (not hardcoded "3")
- Add Favorites link for logged-in users

---

## Phase 9: Favorites Page

### 9.1 Favorites Page
**File**: `apps/client/app/(main)/favorites/page.tsx` (NEW)

- Custom-designed page showing all favorited products
- Fetch from `GET /api/favorites`
- Each product card: same as products page cards
- Toggle favorite (remove from favorites)
- Add to Cart / Buy Now actions
- Empty state when no favorites

### 9.2 Add Route & Navigation
- Add favorites route to `(main)` route group
- Add "Favorites" link to navbar for logged-in users
- Add heart/favorite icon toggle to all product cards across the site

---

## Phase 10: SEO Optimization

### 10.1 Home Page SEO
**File**: `apps/client/app/page.tsx`

- Dynamic meta tags via Next.js `generateMetadata()` or `<Head>` component
- Title: "FarmFresh — Fresh Produce Direct from Local Farmers"
- Description: compelling meta description about fresh farm produce
- Open Graph tags with preview image

### 10.2 Product Details Page SEO
**File**: `apps/client/app/(main)/products/[id]/page.tsx`

- Dynamic meta tags based on product data
- Title: `<product name> — FarmFresh`
- Description: product description snippet
- Open Graph image: first product image
- Dynamic OG tags for social media sharing (Facebook, Twitter)
- Use `generateMetadata()` with product data from API

### 10.3 Server: SEO-friendly URLs
Ensure product URLs are clean: `/products/<id>` (already set up via Next.js dynamic routes)

---

## Phase 11: State & Error Handling

### 11.1 Loading States
**All pages**

- Add loading spinners/skeletons for all data-fetching pages
- Use Next.js `loading.tsx` files or inline loading states
- The existing `app/loading.tsx` can be used as fallback

### 11.2 Error States
**All pages**

- 404 page for invalid product IDs, order IDs
- Error boundaries for API failures
- Toast notifications for success/error feedback on actions (install `react-hot-toast` or `sonner`)

### 11.3 Form Validation
**All forms (login, register, add-product, payment, review)**

- Client-side validation already exists for auth forms
- Add validation to: add-product form, payment form, review form
- Show inline error messages

---

## Phase 12: Final Polish

### 12.1 README.md Documentation
**File**: `apps/client/README.md` or root `README.md`

- Document all custom features added beyond the base template
- API endpoint documentation
- Setup instructions
- Environment variables required
- Any bonus features implemented

### 12.2 .env File Verification
**CRITICAL**: Ensure `.env` files are committed to the repo

- `apps/server/.env` — must contain: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, RESEND_API_KEY, GOOGLE_CLIENT_ID (if implementing Google auth)
- `apps/client/.env.local` — must contain: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID (if implementing Google auth)
- Verify `.gitignore` does NOT exclude `.env` files (or add them explicitly)

### 12.3 Dark Mode Consistency
- Ensure all new components respect dark mode classes
- Test all pages in both light and dark themes

### 12.4 Mobile Responsiveness
- Test all pages on mobile viewport
- Ensure modals, forms, and navigation work on small screens

---

## Dependencies to Install

### Server
```bash
# No new dependencies needed — all required packages already installed
# (mongoose, bcrypt, jwt, cloudinary, multer, resend, etc.)
```

### Client
```bash
# For PDF invoice generation (pick ONE):
pnpm add @react-pdf/renderer
# OR
pnpm add jspdf jspdf-autotable

# For Google OAuth:
pnpm add @react-oauth/google

# For toast notifications:
pnpm add react-hot-toast
# OR
pnpm add sonner

# For icons (if needed beyond Font Awesome):
# Already using Font Awesome via CDN link in layout.tsx
```

---

## Execution Notes

1. **Start with Phase 1** — Models are the foundation. Don't skip.
2. **Phase 2** builds API endpoints that Phase 3+ depends on.
3. **Phase 3** creates the Redux/RTK layer that all client pages consume.
4. **Phase 4** is the largest phase — wiring static pages to real data.
5. **Phases 5-9** add features incrementally.
6. **Phase 10-12** are polish and can be done in parallel with later phases.
7. **Test each phase** before moving to the next — ensure API endpoints work before wiring them to the client.
8. **Keep .env files updated** as new services (Google OAuth, etc.) are configured.
