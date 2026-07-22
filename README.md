# FarmFresh

A marketplace connecting local farmers directly with customers — farmers list produce, customers browse, order, and pay. Full-stack monorepo built with Next.js and Express.

## Tech Stack

**Client** (`apps/client`)
- Next.js 15 (App Router, Turbopack)
- React 19, TypeScript
- Redux Toolkit + RTK Query (with automatic access-token refresh)
- Tailwind CSS 4
- jsPDF (invoice generation), react-hot-toast

**Server** (`apps/server`)
- Node.js + Express 5
- MongoDB + Mongoose
- TypeScript for all business logic (models/controllers/routes); the original auth stack (`userModel.js`, `authMiddleware.js`, `userRoute.js`, `index.js`) stays CommonJS JS
- JWT access + refresh tokens, bcrypt password hashing
- Cloudinary (product/profile image uploads), Resend (transactional email), helmet + rate limiting

**Tooling**
- Turborepo + pnpm workspaces
- ESLint + Prettier, `tsc --noEmit` type-checking on the server
- GitHub Actions CI (lint + build on every push/PR to `main`)

## Features

- **Auth**: register/login (customer or farmer), forgot/reset password, change password, JWT access + refresh tokens, login/register available as full pages or as modals (Next.js intercepting routes) from anywhere in the app
- **Products**: search, category/price/location/organic filters, sort, pagination; farmer product management (create/edit/publish/unpublish/delete) with Cloudinary image upload
- **Cart & checkout**: persistent cart, quantity controls, checkout flow supporting both "buy the whole cart" and "buy this one item now", card/bKash/Nagad payment (simulated — no real payment gateway)
- **Orders**: order history with status timeline, farmer order management with status updates, cancel (restocks), reorder, PDF invoice download, order confirmation email
- **Reviews**: one review per user per product, gated on having a delivered order, edit/delete your own review, paginated review list
- **Favorites**: toggle from any product card, dedicated favorites page
- **Farmers directory**: browse farmers, view their products, call via `tel:` link
- **SEO**: dynamic per-product `<title>`/description/Open Graph/Twitter card metadata
- **UX polish**: toast feedback on every mutation, global error boundary, loading/empty/404 states throughout, dark mode, responsive layout

## Project Structure

```
farmfresh/
├── apps/
│   ├── client/                # Next.js app
│   │   ├── app/
│   │   │   ├── (auth)/        # login, register, forgot/reset/change password
│   │   │   └── (main)/        # everything else, incl. @modal parallel route
│   │   │       └── @modal/(.)login, (.)register   # intercepted auth modals
│   │   ├── components/        # shared UI (ProductCard, Navbar, ReviewModal, forms...)
│   │   ├── hooks/
│   │   └── lib/
│   │       ├── api/           # RTK Query base API + one file per resource
│   │       └── generateInvoicePdf.ts
│   └── server/                 # Express API
│       ├── controllers/        # *.ts (new) + userController.js (existing, untouched)
│       ├── middleware/         # auth, upload
│       ├── models/             # *.ts (new) + userModel.js (existing, untouched)
│       ├── routes/
│       ├── scripts/seed.ts     # seeds farmers + realistic Bangladeshi products
│       └── utils/               # db, config (fail-fast env check), email, cloudinary
├── turbo.json
└── pnpm-workspace.yaml
```

## API Endpoints

All routes are prefixed with `/api`.

**Auth / Users**
`POST /register` · `POST /login` · `POST /refresh-token` · `POST /logout` · `POST /forgot-password` · `POST /reset-password` · `GET /farmers` · `GET /user/:id` · `PUT /user/:id` · `PUT /user/:id/password` · `DELETE /user/:id`

**Products**
`GET /products` (search/category/sort/pagination/price/location/organic/farmer filters) · `GET /products/featured` · `GET /products/farmer/:farmerId` · `GET /products/:id` · `POST /products` · `PUT /products/:id` · `PATCH /products/:id/publish` · `DELETE /products/:id`

**Cart**
`GET /cart` · `POST /cart` · `PUT /cart/:itemId` · `DELETE /cart/:itemId` · `DELETE /cart`

**Orders**
`POST /orders` · `GET /orders` · `GET /orders/farmer` · `GET /orders/:id` · `PATCH /orders/:id/status` · `PATCH /orders/:id/cancel`

**Reviews**
`GET /reviews/product/:productId` · `POST /reviews` · `PUT /reviews/:id` · `DELETE /reviews/:id` · `GET /reviews/user/:userId`

**Favorites**
`GET /favorites` · `POST /favorites` · `GET /favorites/check/:productId`

## Getting Started

**Prerequisites:** Node.js >= 18, pnpm 9, a MongoDB Atlas cluster.

```bash
pnpm install

# copy env templates and fill in real values
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env.local

# seed realistic demo data (Bangladeshi farmers + products)
cd apps/server && pnpm seed && cd ../..

pnpm dev
```

- Client: http://localhost:3000
- Server: http://localhost:8000 (health check at `/health`)

### Environment variables

`apps/server/.env` — `PORT`, `DB_USER`, `DB_PASS` (MongoDB Atlas), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL`. The server fails fast at startup if any of these are missing.

`apps/client/.env.local` — `NEXT_PUBLIC_API_URL`.

Real values are never committed — `.env` is gitignored, only `.env.example` templates are tracked.

## Available Scripts

Run from the repo root:

| Command | Description |
|---|---|
| `pnpm dev` | Run client + server in dev mode (Turborepo) |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm check-types` | Type-check the server (`tsc --noEmit`) |
| `pnpm format` | Format with Prettier |

Server-only: `pnpm seed` (from `apps/server`) re-seeds demo farmers/products.

## Known Gaps

- Google OAuth ("Continue with Google") is not implemented — it requires a real Google Cloud OAuth Client ID that wasn't available while building this. The dead button was removed rather than shipped non-functional.
- Order confirmation email is a rich HTML summary, not a PDF attachment — the app already provides an in-app PDF invoice download, so this avoids maintaining two invoice renderers for one document.
- Payment is fully simulated — no real payment gateway integration.

## License

MIT
