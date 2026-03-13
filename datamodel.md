# UrbanPic — Data Model

---

## Entities

### Report
Represents a single civic issue submitted by a user.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String? | FK → User (nullable for anonymous) |
| imageUrl | String | Path/URL to uploaded image |
| issueType | IssueType (enum) | AI-classified issue category |
| severity | Severity (enum) | AI-assessed severity: low/medium/high |
| description | String | AI-generated or user-edited 311 description |
| department | String | Routed city department name |
| latitude | Float | Decimal degrees |
| longitude | Float | Decimal degrees |
| address | String? | Reverse-geocoded street address |
| status | ReportStatus (enum) | pending / in_progress / resolved |
| aiRaw | Json? | Raw Claude API response (for debugging) |
| createdAt | DateTime | Submission timestamp |
| updatedAt | DateTime | Last modified timestamp |

### User
Registered account (stretch goal).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String | Unique, lowercase |
| passwordHash | String | bcrypt hash |
| name | String? | Display name |
| createdAt | DateTime | Registration timestamp |
| reports | Report[] | One-to-many relation |

---

## Enums

```prisma
enum IssueType {
  POTHOLE
  GRAFFITI
  BROKEN_STREETLIGHT
  ILLEGAL_DUMPING
  ABANDONED_VEHICLE
  DAMAGED_SIDEWALK
  FLOODING
  OTHER
}

enum Severity {
  LOW
  MEDIUM
  HIGH
}

enum ReportStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
}
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  reports      Report[]
}

model Report {
  id          String       @id @default(uuid())
  userId      String?
  user        User?        @relation(fields: [userId], references: [id])
  imageUrl    String
  issueType   IssueType
  severity    Severity     @default(MEDIUM)
  description String
  department  String
  latitude    Float
  longitude   Float
  address     String?
  status      ReportStatus @default(PENDING)
  aiRaw       Json?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([issueType])
  @@index([status])
  @@index([userId])
  @@index([latitude, longitude])
  @@index([createdAt])
}
```

---

## Department Routing Map

| Issue Type | Department | Notes |
|-----------|-----------|-------|
| POTHOLE | Department of Public Works | Street maintenance |
| GRAFFITI | Parks & Recreation / Public Works | Depends on surface |
| BROKEN_STREETLIGHT | Department of Transportation | Lighting division |
| ILLEGAL_DUMPING | Sanitation Department | Bulk waste pickup |
| ABANDONED_VEHICLE | Parking Enforcement | DMV cross-reference |
| DAMAGED_SIDEWALK | Department of Public Works | ADA compliance priority |
| FLOODING | Stormwater Management | Emergency line if severe |
| OTHER | City Services 311 | General queue |

---

## Database Indexes

| Index | Fields | Reason |
|-------|--------|--------|
| reports_issue_type | issueType | Filter by type on heat map |
| reports_status | status | Filter by status in admin/my-reports |
| reports_user_id | userId | Fast lookup for /my-reports |
| reports_geo | latitude, longitude | Spatial queries for map bounds |
| reports_created_at | createdAt | Chronological sorting |

---

## Seed Data

For demo purposes, seed 50 reports across all issue types and statuses, distributed across a realistic city bounding box. See `prisma/seed.ts`.
