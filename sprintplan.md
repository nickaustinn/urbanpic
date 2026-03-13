# UrbanPic — Sprint Plan

**Duration:** 2 days (Saturday–Sunday)
**Team:** nickaustinn (N), mollindabo (M)
**Goal:** Working demo by Sunday 4pm

---

## Sprint 1 — Project Foundation
**Time:** Saturday 9:00–11:30am
**Goal:** Repo live, database connected, basic UI scaffold

| Task | ID | Assignee | Points |
|------|----|----------|--------|
| Initialize Next.js project with Tailwind | B-01 | N | 1 |
| Set up PostgreSQL + Prisma schema | B-02 | M | 2 |
| Create Report and User Prisma models | B-03 | M | 2 |
| Run initial Prisma migration | B-04 | M | 1 |
| Build photo upload component (file input + preview) | B-05 | N | 3 |

**Sprint 1 Total:** 9 points
**Checkpoint:** Photo upload renders, DB tables created, app boots locally

---

## Sprint 2 — Core AI & API
**Time:** Saturday 11:30am–3:00pm
**Goal:** Claude Vision classifies images, reports saved to DB

| Task | ID | Assignee | Points |
|------|----|----------|--------|
| Integrate Claude Vision API endpoint | B-06 | N | 5 |
| Parse Claude response: issue type, severity, description | B-07 | N | 3 |
| Department routing logic | B-08 | M | 2 |
| POST /api/reports endpoint | B-09 | M | 3 |
| GET /api/reports endpoint | B-10 | M | 2 |
| Multi-step submission form UI | B-11 | N | 5 |

**Sprint 2 Total:** 20 points
**Checkpoint:** Can upload photo → get AI classification → save report to DB

---

## Sprint 3 — Submission Flow + Heat Map
**Time:** Saturday 3:00–6:30pm
**Goal:** Full user-facing submission flow and map visible

| Task | ID | Assignee | Points |
|------|----|----------|--------|
| Review & edit AI output step in form | B-12 | N | 3 |
| Mapbox heat map page (/map) | B-13 | M | 5 |
| JWT auth middleware | B-16 | M | 3 |
| User registration endpoint | B-17 | M | 2 |
| User login endpoint | B-18 | M | 2 |
| Submission success screen | B-15 | N | 2 |
| Seed DB with sample reports | B-14 | M | 2 |

**Sprint 3 Total:** 19 points
**Checkpoint:** End-to-end flow: photo → classify → submit → appears on map

---

## Sprint 4 — Auth UI + Enhancements
**Time:** Sunday 9:00am–12:00pm
**Goal:** Auth working, map filters, my reports page

| Task | ID | Assignee | Points |
|------|----|----------|--------|
| Login / register page UI | B-19 | N | 3 |
| My Reports page (/my-reports) | B-20 | N | 3 |
| Image upload + local storage | B-21 | M | 3 |
| Drag-and-drop upload enhancement | B-22 | N | 2 |
| Map filter chips by issue type | B-23 | N | 3 |

**Sprint 4 Total:** 14 points
**Checkpoint:** Auth flow complete, map filterable, user can see past reports

---

## Sprint 5 — Polish & Demo Prep
**Time:** Sunday 12:00–4:00pm
**Goal:** Demo-ready, seeded with realistic data, no broken states

| Task | ID | Assignee | Points |
|------|----|----------|--------|
| Report detail page | B-24 | N | 2 |
| Status update endpoint | B-25 | M | 2 |
| Mobile camera capture | B-26 | N | 2 |
| Polish landing page + demo copy | B-27 | N | 2 |

**Sprint 5 Total:** 8 points
**Checkpoint:** Polished demo, all P0+P1 items working, realistic seed data

---

## Demo Checklist

- [ ] Upload a photo live during demo
- [ ] Show Claude classification appearing in < 5s
- [ ] Submit report and show it appear on heat map
- [ ] Show map clustered markers
- [ ] Show department routing result
- [ ] Login as demo user and show My Reports

---

## Risk Buffer

If behind schedule by Sprint 4, cut:
1. My Reports page (B-20)
2. Drag-and-drop (B-22)
3. Report detail page (B-24)

Core demo only needs B-01 through B-15.
