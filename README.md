# Patient Visit Tracker

Internal web app for managing clinicians, patients, and wound-care visits. Users can record visits, filter the schedule, and update visit status (scheduled, completed, cancelled).

**Stack:** React (Vite) · Tailwind CSS · Node.js · Express · PostgreSQL (Neon)

## Setup

**Prerequisites:** Node.js 18+, PostgreSQL database

```bash
npm run install:all
cp .env.example server/.env   # add DATABASE_URL, PORT, JWT_SECRET
npm run db:init               # create tables + seed data
npm run dev                   # client :5173, API :3001
```

| | |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:3001 |
| Login | `admin@woundtech.net` / `woundtech123` |

Other scripts: `npm run db:reset` (wipe + reseed), `npm run db:check-schema` (verify DB matches schema file).

## Features

- CRUD for clinicians and patients
- Create, edit, and delete visits (linked to clinician + patient)
- Visit list sorted newest first, with filters by clinician, patient, date, and status
- Complete, cancel, and reschedule visits
- JWT login for internal access

## Structure

```
client/src/           React UI, forms, hooks
server/routes/        REST API per resource
server/db/            Connection pool, init/seed, schema
server/middleware/    JWT auth
```

Schema is defined in `server/db/schema/tables.json` (`users`, `clinicians`, `patients`, `visits`).

## Approach

Monorepo with a single `npm run dev` so the reviewer can run everything locally without extra steps.

`tables.json` is the source of truth for the database shape — init and reset scripts build from it, and `db:check-schema` confirms the live DB matches.

Backend uses one Express router per resource with straightforward SQL. Auth is JWT + bcrypt; no session store for this scope.

Frontend loads data once after login. Visit filters are client-side for instant response. Mutations use optimistic UI with rollback on failure. Clinicians and patients use card grids; visits use a table suited to scanning a schedule.

Forms use React Hook Form and Yup for validation.
