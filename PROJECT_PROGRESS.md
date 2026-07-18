# TaskFlow — Project Progress

Tracks completion against the 16-phase development strategy in the master spec.

| # | Phase | Status |
|---|-------|--------|
| 1 | Initialize Next.js | ✅ Done |
| 2 | Initialize Express | ✅ Done |
| 3 | Configure MongoDB | ✅ Done (connection config ready; needs a running Mongo instance + `MONGO_URI`) |
| 4 | Authentication | ✅ Backend (register/login/refresh/logout) + frontend login/register pages |
| 5 | Dashboard | ✅ Protected layout, sidebar nav, stat cards, activity placeholder |
| 6 | Task CRUD | ✅ Backend routes/controller (ownership + role checks) + frontend list, create/edit modal, task cards |
| 7 | Subtasks | ✅ Backend (unlimited nesting, recursive delete, auto progress rollup) + frontend recursive tree UI |
| 8 | Search / Filter / Sort | ✅ Backend query support (search incl. subtasks, status/priority/overdue filters, 4 sort modes) + frontend toolbar with debounce |
| 9 | Collaboration | ✅ Backend (invite by email, secure token links, email-match acceptance, roles) + frontend invite modal & accept-invite flow |
| 10 | Chat | ✅ Backend (persisted messages, access-checked Socket.IO, read receipts) + frontend ChatModal (typing, presence, quick emoji) |
| 11 | File Upload | ✅ Backend (Multer + Cloudinary, mime allowlist, 25MB cap, per-task repository, notifications) + frontend FilesModal (upload/preview/download/delete) |
| 12 | Notifications | ✅ Backend (list/mark-read/mark-all-read + task_completed trigger added) + frontend live NotificationBell in dashboard header |
| 13 | Analytics | ✅ Backend (stats, priority breakdown, 14-day trend) + frontend Chart.js (line + doughnut) — Dashboard stat cards now use real data too |
| — | Activity Timeline | ✅ New `/api/v1/activity` module (not in original 9, added to cover the spec's Activity Timeline section) + frontend feed page |
| — | Settings | ✅ Backend (`PATCH /users/me`, `PATCH /users/me/password`) + frontend page: profile name, notification prefs, theme toggle, password change |
| 14 | Theme | ✅ Design tokens + ThemeContext scaffolded |
| 15 | Testing | ⬜ Not started |
| 16 | Deployment | ⬜ Not started |

## What's in place after scaffolding

- Full `frontend/` and `backend/` folder structure per spec
- Backend: Express server with security middleware (Helmet, CORS, rate limiting), Socket.IO wired with JWT auth, error handler, all 8 Mongoose models, stub routes/controllers for all 9 API modules
- Frontend: Next.js App Router structure, global CSS design tokens (light/dark), ThemeContext, AuthContext, Axios instance with interceptors, Socket.IO client service, placeholder landing page

## Next up

Phase 15 — Testing (unit/integration tests for auth, tasks, subtasks, invitations).
Phase 16 — Deployment (env-specific configs, CI, hosting docs).

These two are process/infrastructure phases rather than features — worth discussing target hosting (Vercel + Render/Railway? Docker?) and testing framework preference (Jest? Vitest?) before building them out, since the "right" answer depends on choices only you can make.

## Known gaps carried over
- `task_assigned` notification type has no trigger (see note above — no direct-assignment flow exists yet, only invite-and-accept)
- Avatar upload (mentioned in Register + Settings) isn't wired — the File Sharing Cloudinary pipeline could be reused for it
- No automated tests yet (Phase 15)
