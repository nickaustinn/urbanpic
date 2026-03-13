# UrbanPic — Architecture

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Mobile                      │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  Upload     │   │  Submission  │   │   Heat Map      │  │
│  │  Component  │──▶│  Form Flow   │   │   Page (/map)   │  │
│  └─────────────┘   └──────┬───────┘   └────────┬────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │                     │
                    POST /api/reports      GET /api/reports
                            │                     │
┌───────────────────────────▼─────────────────────▼───────────┐
│                       Next.js API Routes                      │
│                                                              │
│  /api/classify    /api/reports    /api/auth/register         │
│  (Claude call)    (GET + POST)    /api/auth/login            │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
     ┌──────────▼──────────┐    ┌───────────▼──────────┐
     │   Anthropic API     │    │    PostgreSQL DB       │
     │  Claude Vision      │    │    (via Prisma ORM)    │
     │  claude-opus-4-6    │    │                       │
     └─────────────────────┘    └───────────────────────┘
                                          │
                                ┌─────────▼──────────┐
                                │   Mapbox GL JS     │
                                │   (client-side)    │
                                └────────────────────┘
```

---

## API Endpoints

### Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/reports | None | List all reports (for heat map) |
| POST | /api/reports | Optional | Submit a new report |
| GET | /api/reports/:id | None | Get single report detail |
| PATCH | /api/reports/:id | Required | Update report status |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/classify | None | Classify image with Claude Vision |

**Request body for POST /api/classify:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "issueType": "POTHOLE",
  "severity": "HIGH",
  "description": "Large pothole approximately 18 inches in diameter...",
  "department": "Department of Public Works",
  "confidence": "high"
}
```

**Request body for POST /api/reports:**
```json
{
  "imageUrl": "/uploads/abc123.jpg",
  "issueType": "POTHOLE",
  "severity": "HIGH",
  "description": "Large pothole approximately 18 inches...",
  "department": "Department of Public Works",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "address": "123 Market St, San Francisco, CA"
}
```

### Auth (Stretch)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | None | Create new user |
| POST | /api/auth/login | None | Login, receive JWT |
| GET | /api/auth/me | Required | Get current user |

---

## Component Tree

```
app/
├── layout.tsx                    # Root layout (nav, font, providers)
├── page.tsx                      # Landing page
│
├── report/
│   └── page.tsx                  # Multi-step submission flow
│       ├── StepUpload            # Step 1: photo capture/upload
│       ├── StepAnalyzing         # Step 2: loading while Claude runs
│       ├── StepReview            # Step 3: review + edit AI output
│       └── StepSuccess           # Step 4: confirmation screen
│
├── map/
│   └── page.tsx                  # Community heat map
│       ├── MapboxMap             # Mapbox GL JS wrapper
│       ├── FilterChips           # Issue type filter buttons
│       └── ReportPopup           # Click-to-open report detail
│
├── my-reports/
│   └── page.tsx                  # User's submission history (auth)
│       └── ReportCard            # Individual report list item
│
└── auth/
    ├── login/page.tsx            # Login form
    └── register/page.tsx         # Registration form

components/
├── ui/
│   ├── Button.tsx
│   ├── Badge.tsx
│   └── Spinner.tsx
├── PhotoUpload.tsx               # Reusable upload + preview
└── DepartmentBadge.tsx           # Show routed department

lib/
├── claude.ts                     # Anthropic SDK client + classify fn
├── prisma.ts                     # Prisma client singleton
├── routing.ts                    # Issue type → department map
└── auth.ts                       # JWT sign/verify helpers
```

---

## File Structure

```
urbanpic/
├── app/                          # Next.js App Router
├── components/                   # Reusable React components
├── lib/                          # Server-side utilities
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/                  # Local image storage (dev)
├── .env.local                    # Local secrets (gitignored)
├── .env.example                  # Template for env vars
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | API routes + SSR in one repo, fast setup |
| AI model | claude-opus-4-6 | Best vision accuracy; fall back to haiku if rate limited |
| Image passing | Base64 in request body | Simpler for hackathon vs. S3 pre-signed URL |
| Map library | Mapbox GL JS | Best clustering + styling, free tier sufficient |
| Auth | JWT in httpOnly cookie | Simple, stateless, no Redis needed |
| DB | PostgreSQL via Prisma | Type-safe queries, easy migrations |
| Deploy | Vercel + Supabase | Zero-config deploys, free Postgres |

---

## Claude Vision Prompt

```
You are a civic issue classifier for a 311 reporting system.

Analyze the provided image and respond with a JSON object containing:
- issueType: one of [POTHOLE, GRAFFITI, BROKEN_STREETLIGHT, ILLEGAL_DUMPING,
  ABANDONED_VEHICLE, DAMAGED_SIDEWALK, FLOODING, OTHER]
- severity: one of [LOW, MEDIUM, HIGH]
- description: a clear, professional 311 report description (1-3 sentences,
  max 300 chars) suitable for submission to a city department
- confidence: one of [low, medium, high]

Respond only with valid JSON. Do not include any explanation outside the JSON.
```
