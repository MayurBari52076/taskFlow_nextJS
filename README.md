# TaskFlow

Collaborative task management platform — Next.js (App Router, JS, plain CSS) + Express/MongoDB backend.

## Getting started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in Mongo URI, JWT secrets, Cloudinary, SMTP
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

## Structure

- `frontend/` — Next.js App Router, `app/`, `components/`, `hooks/`, `context/`, `services/`, `styles/`, `utils/`
- `backend/` — Express, `controllers/`, `models/`, `routes/`, `middleware/`, `services/`, `sockets/`, `utils/`, `config/`

See `PROJECT_PROGRESS.md` for phase-by-phase status.
