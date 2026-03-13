# UrbanPic — Prioritized Backlog

**Total items:** 27 | **Team:** nickaustinn (N), mollindabo (M)
**Points scale:** 1=trivial, 2=small, 3=medium, 5=large, 8=extra-large

---

## P0 — Must Have (Sprint 1–3)

| ID | Title | Type | Points | Assignee | Sprint |
|----|-------|------|--------|----------|--------|
| B-01 | Initialize Next.js project with Tailwind | setup | 1 | N | 1 |
| B-02 | Set up PostgreSQL + Prisma schema | setup | 2 | M | 1 |
| B-03 | Create Report and User Prisma models | backend | 2 | M | 1 |
| B-04 | Run initial Prisma migration | setup | 1 | M | 1 |
| B-05 | Build photo upload component (file input + preview) | frontend | 3 | N | 1 |
| B-06 | Integrate Claude Vision API endpoint | ai | 5 | N | 2 |
| B-07 | Parse Claude response: issue type, severity, description | ai | 3 | N | 2 |
| B-08 | Department routing logic (issue type → department map) | backend | 2 | M | 2 |
| B-09 | POST /api/reports endpoint | backend | 3 | M | 2 |
| B-10 | GET /api/reports endpoint | backend | 2 | M | 2 |
| B-11 | Multi-step submission form UI | frontend | 5 | N | 2 |
| B-12 | Review & edit AI output step in form | frontend | 3 | N | 2 |
| B-13 | Mapbox heat map page (/map) | frontend | 5 | M | 3 |
| B-14 | Seed DB with sample reports for demo | setup | 2 | M | 3 |
| B-15 | Submission success screen with report ID | frontend | 2 | N | 3 |

**P0 Total Points:** 41

---

## P1 — Should Have (Sprint 3–4)

| ID | Title | Type | Points | Assignee | Sprint |
|----|-------|------|--------|----------|--------|
| B-16 | JWT auth middleware | backend | 3 | M | 3 |
| B-17 | User registration endpoint POST /api/auth/register | backend | 2 | M | 3 |
| B-18 | User login endpoint POST /api/auth/login | backend | 2 | M | 3 |
| B-19 | Login / register page UI | frontend | 3 | N | 4 |
| B-20 | My Reports page (/my-reports) | frontend | 3 | N | 4 |
| B-21 | Image upload + local storage | backend | 3 | M | 4 |
| B-22 | Drag-and-drop photo upload enhancement | frontend | 2 | N | 4 |
| B-23 | Map filter chips by issue type | frontend | 3 | N | 4 |

**P1 Total Points:** 21

---

## P2 — Nice to Have (Sprint 4–5)

| ID | Title | Type | Points | Assignee | Sprint |
|----|-------|------|--------|----------|--------|
| B-24 | Report detail page (/reports/[id]) | frontend | 2 | N | 5 |
| B-25 | Status update endpoint PATCH /api/reports/:id | backend | 2 | M | 5 |
| B-26 | Mobile camera capture (capture="environment") | frontend | 2 | N | 5 |
| B-27 | Polish landing page + demo copy | frontend | 2 | N | 5 |

**P2 Total Points:** 8

---

## Summary

| Priority | Items | Points |
|----------|-------|--------|
| P0 | 15 | 41 |
| P1 | 8 | 21 |
| P2 | 4 | 8 |
| **Total** | **27** | **70** |

| Assignee | Items | Points |
|----------|-------|--------|
| nickaustinn (N) | 14 | 36 |
| mollindabo (M) | 13 | 34 |
