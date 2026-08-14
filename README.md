# Pasumai Tamilagam (பசுமை தமிழகம்) — Tamil Nadu Tree Mission

A full-stack web platform for tracking a statewide, citizen-driven tree-planting mission across Tamil Nadu. Citizens register the trees they plant with GPS-tagged photo evidence, government admins verify submissions, and the public can explore verified plantings on an interactive map and district leaderboard.

Bilingual (English / Tamil) UI throughout the public-facing site.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Authentication & Roles](#authentication--roles)
- [Deployment (Render)](#deployment-render)
- [Image Uploads](#image-uploads)

---

## Features

### Public
- Landing page with live statewide stats (total/verified trees, participants, districts covered, species catalog)
- Stylized 3D Tamil Nadu map (real state + district boundaries) plotting verified trees at their true GPS location, plus a "Live Map" toggle to a real interactive OpenStreetMap/Leaflet view
- District leaderboard ranked by verified tree count
- Interactive tree map with filters (district, species, tree type, date range)
- English / Tamil language toggle, persisted per-visitor

### Citizens (registered users)
- Register an account, log in, manage profile (including profile photo)
- Register a planted tree: species, tree type, planting date, GPS location, district/area, description, and a **live camera photo** (gallery upload is blocked on mobile — camera opens directly, to keep submissions authentic)
- Personal dashboard: submission stats and full tree inventory with status tracking
- Achievement badge system (Sapling Starter → Grove Builder → Forest Guardian → Green Champion → Eco Warrior → Tree Mission Legend) based on verified tree count, with progress bar to the next tier

### Admins
- Dedicated admin console (separate layout, guarded routes)
- Dashboard with aggregated stats and charts (verification distribution, monthly registrations, trees by district)
- Verification queue: approve/reject pending tree submissions with notes and rejection reasons, with full audit history per tree
- Full tree management (search/filter/paginate all submissions)
- User management (block/unblock accounts, per-user tree stats)
- Tree species catalog management (create/update/delete)
- Analytics and CSV report export
- Admin-only interactive map view of all submissions

---

## Tech Stack

**Frontend** — `frontend/`
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Leaflet / React-Leaflet (interactive maps)
- Chart.js / react-chartjs-2 (admin analytics)
- Lucide React (icons)
- canvas-confetti

**Backend** — `backend/`
- Node.js + Express
- MongoDB + Mongoose (hosted on MongoDB Atlas)
- JWT authentication, bcryptjs password hashing
- Multer (in-memory) + Cloudinary (image storage/CDN)
- compression, cors

---

## Project Structure

```
Pasumai Tamilagam/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, cloudinary.js
│   │   ├── controllers/     # authController, treeController, adminController, publicController
│   │   ├── middleware/      # auth.js (JWT guards), upload.js (multer)
│   │   ├── models/          # User, Tree, District, TreeSpecies
│   │   ├── routes/          # authRoutes, treeRoutes, adminRoutes, publicRoutes
│   │   ├── utils/           # storage.js (Cloudinary upload/delete)
│   │   ├── seed.js          # seeds districts, species, and the default admin account
│   │   └── index.js         # Express app entrypoint
│   └── uploads/             # legacy local file fallback (pre-Cloudinary)
└── frontend/
    └── src/
        ├── components/      # Navbar, Footer, TamilNaduTreeMap, TreeMarkerMap, TreeBadge, route guards
        ├── context/         # AuthContext, LanguageContext
        ├── pages/           # public + user pages
        │   └── Admin/       # admin console pages
        ├── services/        # api.js (fetch wrapper)
        ├── translations/    # en/ta dictionary
        ├── utils/           # imageUrl.js, badges.js
        └── config.js        # API_BASE_URL (env-driven)
```

---

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or any MongoDB instance) — with your IP allowlisted in Network Access
- A Cloudinary account (cloud name, API key, API secret) for image storage

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see [Environment Variables](#environment-variables) below), then seed the database with districts, tree species, and a default admin account:

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

The app runs on `http://localhost:5173` by default (Vite's default port) and talks to the backend at the URL in `VITE_API_BASE_URL`.

---

## Environment Variables

`backend/.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `NODE_ENV` | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | *(optional)* Deployed frontend origin, restricts CORS in production. Omit/leave blank to allow all origins. |

`frontend/.env`:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend origin — no trailing slash, no `/api` suffix (e.g. `http://localhost:5000` locally, your Render backend URL in production) |

> `backend/.env`, `frontend/.env`, and `backend/uploads/` are gitignored — never commit real credentials. Use the committed `.env.example` files as templates.

---

## Available Scripts

**Backend** (`backend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start the API with nodemon (auto-restart on change) |
| `npm start` | Start the API with plain Node (production) |
| `npm run seed` | Seed districts, tree species catalog, and the default admin user |

**Frontend** (`frontend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `frontend/dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

---

## Data Models

**User** — `name`, `email` (unique), `phone`, `passwordHash`, `district`, `profileImage`, `role` (`USER` \| `ADMIN`), `status` (`ACTIVE` \| `BLOCKED`)

**Tree** — `treeId` (auto-generated, e.g. `TN-TREE-000001`), `user` (ref), `species`, `treeType` (`Native` \| `Fruit` \| `Shade` \| `Timber` \| `Other`), `plantingDate`, `latitude`/`longitude`, `district`, `area`, `description`, `photoUrl`, `status` (`PENDING_VERIFICATION` \| `VERIFIED` \| `REJECTED`), `rejectionReason`, `verifiedAt`, `verifiedBy`, and a full `verificationHistory` audit trail (indexed on `user`, `status`, `district`, `species`)

**District** — `name` (unique)

**TreeSpecies** — `name` (unique), `tamilName`, `category`, `active`

---

## API Reference

Base URL: `/api`

### Public — `/api/public`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/statistics` | Landing page stats + recent verified trees |
| GET | `/districts` | List of districts |
| GET | `/tree-map` | Verified tree markers (GPS-obfuscated), filterable by district/species/treeType/date |
| GET | `/leaderboard` | Districts ranked by verified tree count |
| GET | `/species` | Active tree species catalog |

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Log in, returns JWT |
| GET | `/me` | Required | Current user profile + tree stats |
| PUT | `/profile` | Required | Update profile (multipart, optional `profileImage`) |

### Trees — `/api/trees`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Required | Register a new tree (multipart, `photo` required) |
| GET | `/my` | Required | Current user's tree submissions |
| GET | `/:id` | Optional | Tree details — full detail for owner/admin, privacy-obfuscated for public |

### Admin — `/api/admin` (all routes require an authenticated `ADMIN`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Aggregated stats + chart data |
| GET | `/trees/pending` | Trees awaiting verification |
| PUT | `/trees/:id/approve` | Approve a submission |
| PUT | `/trees/:id/reject` | Reject a submission (reason required) |
| GET | `/trees` | All trees, filterable + paginated |
| GET | `/users` | All users with per-user tree stats |
| PUT | `/users/:id/status` | Block/unblock a user |
| GET | `/analytics` | Analytics data |
| GET | `/reports` | CSV report export |
| GET/POST/PUT/DELETE | `/species` | Tree species catalog CRUD |

---

## Authentication & Roles

- JWT bearer tokens (`Authorization: Bearer <token>`), issued on login/register.
- `protect` middleware verifies the token and rejects `BLOCKED` accounts.
- `admin` middleware additionally requires `role: 'ADMIN'`.
- `optionalProtect` attaches `req.user` if a valid token is present, without requiring one — used on the tree-details endpoint to show full data to the owner/admin and a privacy-obfuscated view to everyone else.

Default seeded admin (change the password after first login):
- **Email:** `admin@treemission.tn.gov.in`
- Password is set/rotated via `backend/src/seed.js`.

---

## Image Uploads

Tree and profile photos are uploaded via Multer (in-memory buffer) and streamed directly to Cloudinary (`backend/src/utils/storage.js`), which returns a permanent HTTPS URL stored on the record. The frontend's `getImageUrl()` helper (`frontend/src/utils/imageUrl.js`) transparently supports both Cloudinary URLs and legacy local `/uploads/...` paths.

Tree photo capture uses `capture="environment"` on the file input so mobile browsers open the camera directly instead of the photo gallery, keeping on-site submissions authentic. This is a browser-level hint honored by mobile browsers; desktop browsers fall back to a normal file picker.

---

## Deployment (Render)

This repo includes a [`render.yaml`](render.yaml) Blueprint that provisions both services:

- **`pasumai-tamilagam-backend`** — Node web service, root directory `backend`, build `npm install`, start `npm start`.
- **`pasumai-tamilagam-frontend`** — static site, root directory `frontend`, build `npm install && npm run build`, publish directory `dist`, with a SPA rewrite (`/*` → `/index.html`) and a long-lived `Cache-Control` header on hashed `/assets/*` files.

> **If you created the services manually through the dashboard instead of via the Blueprint, `render.yaml` is not read at all** — its `routes:`/`headers:` config only applies to Blueprint-deployed services. You must add these yourself: frontend service → **Settings → Redirects/Rewrites** → add `Source: /*`, `Destination: /index.html`, `Action: Rewrite`. Without this, every client-side route (`/dashboard`, `/profile`, `/tree/:id`, etc.) 404s on a real page load — refresh, reopening a tab, a mobile browser reloading a backgrounded tab — even though in-app navigation between them works fine, since that never leaves the already-loaded page. The committed `frontend/public/_redirects` file is a Netlify-style convention kept as a harmless fallback, but don't rely on it alone — verify directly (`curl -I https://<your-frontend>.onrender.com/dashboard` should return `200`, not `404`) after deploying either way.

### Steps

1. **Push to GitHub** (or GitLab) — Render deploys from a connected repo.
2. **Atlas network access** — in MongoDB Atlas, allow the connection (Render's outbound IPs are dynamic on the free plan, so either allow `0.0.0.0/0` or use Atlas's Render-specific network peering).
3. **Cloudinary** — have your cloud name, API key, and API secret ready.
4. **New → Blueprint** in the Render dashboard, point it at this repo. Render reads `render.yaml` and creates both services.
5. Fill in the secret env vars Render prompts for (marked `sync: false` in the blueprint — never committed):
   - Backend: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Frontend: `VITE_API_BASE_URL` — set once the backend service exists and you have its URL (e.g. `https://pasumai-tamilagam-backend.onrender.com`)
6. Once the frontend has deployed and you have *its* URL, set the backend's `CLIENT_URL` to that origin (e.g. `https://pasumai-tamilagam-frontend.onrender.com`) and redeploy the backend — this locks CORS down to your actual frontend instead of allowing all origins.
7. **Seed the database once**, from the backend service's Render Shell (or by running locally against the same `MONGO_URI`):
   ```bash
   npm run seed
   ```
   This creates the districts, tree species catalog, and the default admin account.
8. Visit the frontend URL, log in with the seeded admin account, and change its password immediately.

### Notes

- No custom domain or SSL setup is required to get started — Render provides HTTPS `*.onrender.com` URLs for both services out of the box.
- The free plan spins down the backend after inactivity; the first request after idling will be slow (cold start) — expected, not a bug. The frontend shows a "waking up the server" notice on slow login/register attempts to make this less confusing.
- Prefer manual setup over the Blueprint? Create the two services yourself in the Render dashboard using the same root directories / build / start commands listed above, set the same env vars, **and manually add the rewrite rule and cache header described above** — neither is applied automatically outside the Blueprint flow.
