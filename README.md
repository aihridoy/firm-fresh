# FarmFresh

A marketplace connecting local farmers directly with customers — farmers list produce, customers browse and buy. Built as a full-stack monorepo.

## Tech Stack

**Client** (`apps/client`)
- Next.js 15 (App Router, Turbopack)
- React 19
- Redux Toolkit + RTK Query
- Tailwind CSS 4

**Server** (`apps/server`)
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication, bcrypt password hashing
- Cloudinary (image uploads), Resend (transactional email)

**Tooling**
- Turborepo + pnpm workspaces
- ESLint + Prettier

## Project Structure

```
farmfresh/
├── apps/
│   ├── client/          # Next.js app
│   │   ├── app/         # routes: (auth) and (main) route groups
│   │   ├── components/  # shared UI components
│   │   ├── hooks/
│   │   └── lib/         # redux store + RTK Query API slices
│   └── server/           # Express API
│       ├── controllers/
│       ├── middleware/   # auth, upload
│       ├── models/       # Mongoose schemas
│       ├── routes/
│       └── utils/        # db connection, email, cloudinary, config
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting Started

**Prerequisites:** Node.js >= 18, pnpm 9, a MongoDB Atlas cluster.

```bash
pnpm install

# copy env templates and fill in real values
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env.local

pnpm dev
```

- Client: http://localhost:3000
- Server: http://localhost:8000 (health check at `/health`)

## Available Scripts

Run from the repo root:

| Command | Description |
|---|---|
| `pnpm dev` | Run client + server in dev mode (Turborepo) |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm format` | Format with Prettier |

## Status

Actively in development. Auth (register/login/forgot-reset/change password) is implemented end-to-end. Product listings, cart, bookings, and payment flows currently exist as client-side pages pending their backend implementation.

## License

MIT
