# UrbanPic — User Stories

**12 user stories across 5 epics**

---

## Epic 1: Photo Capture

### US-01 — Upload a photo from device
**As a** resident,
**I want to** upload a photo from my phone or computer,
**So that** I can document a civic issue without typing anything.

**Acceptance Criteria:**
- [ ] File input accepts JPEG, PNG, HEIC, WebP up to 10MB
- [ ] Drag-and-drop supported on desktop
- [ ] Image preview displayed before submission
- [ ] Error shown if file is too large or unsupported format

---

### US-02 — Capture photo with device camera
**As a** mobile user,
**I want to** take a photo directly in the app,
**So that** I can report issues on the spot without switching apps.

**Acceptance Criteria:**
- [ ] Camera capture button visible on mobile devices
- [ ] Uses `capture="environment"` to open rear camera
- [ ] Photo preview shown after capture
- [ ] Falls back gracefully if camera permission denied

---

### US-03 — See AI classification of my photo
**As a** resident,
**I want to** see what type of issue Claude detected in my photo,
**So that** I can confirm or correct it before submitting.

**Acceptance Criteria:**
- [ ] Loading spinner shown while Claude processes the image
- [ ] Issue type displayed (e.g., "Pothole", "Graffiti", "Broken Streetlight")
- [ ] Confidence level shown (high/medium/low)
- [ ] User can select a different category from a dropdown if AI is wrong
- [ ] Processing completes within 5 seconds

---

## Epic 2: Location

### US-04 — Pin the location of an issue
**As a** resident,
**I want to** mark where the issue is on a map,
**So that** the city knows exactly where to send crews.

**Acceptance Criteria:**
- [ ] Mini Mapbox map shown in submission flow
- [ ] Default pin placed at user's current location (with permission)
- [ ] User can drag pin to adjust location
- [ ] Latitude/longitude saved with report
- [ ] Address reverse-geocoded and shown as confirmation

---

### US-05 — Auto-detect my location
**As a** mobile user,
**I want to** have my location detected automatically,
**So that** I don't have to manually find my position on the map.

**Acceptance Criteria:**
- [ ] Browser geolocation API requested when submission starts
- [ ] Map centers on user location if permission granted
- [ ] Graceful fallback to city center if permission denied
- [ ] Location accuracy indicator shown

---

## Epic 3: Report Submission

### US-06 — Review and edit the AI-generated report
**As a** resident,
**I want to** review and optionally edit the AI-generated 311 description,
**So that** I can ensure the report is accurate before it's sent.

**Acceptance Criteria:**
- [ ] AI-generated description displayed in editable textarea
- [ ] Character count shown (max 500 chars)
- [ ] Original AI text preserved; user edits tracked separately
- [ ] "Reset to AI suggestion" button available

---

### US-07 — Submit a report and receive confirmation
**As a** resident,
**I want to** submit my report and get a confirmation,
**So that** I know it was received and can reference it later.

**Acceptance Criteria:**
- [ ] Submit button triggers POST /api/reports
- [ ] Loading state shown during submission
- [ ] Success screen shows report ID and estimated response time
- [ ] Error message shown if submission fails with retry option
- [ ] Report saved to database with `pending` status

---

### US-08 — See which department will handle my report
**As a** resident,
**I want to** know which city department will receive my report,
**So that** I understand the routing and have appropriate expectations.

**Acceptance Criteria:**
- [ ] Department name shown in review step (e.g., "Department of Public Works")
- [ ] Department determined by AI-classified issue type
- [ ] Routing map covers all 8 issue categories
- [ ] User can see department contact info on success screen

---

## Epic 4: Community Heat Map

### US-09 — View a community heat map of all reports
**As a** resident,
**I want to** see a map of all reported issues in the city,
**So that** I can understand where problems are concentrated.

**Acceptance Criteria:**
- [ ] Mapbox map renders on `/map` page
- [ ] All reports shown as clustered markers
- [ ] Clusters expand on zoom
- [ ] Map loads in < 2 seconds with up to 500 reports
- [ ] Works on mobile viewport

---

### US-10 — Filter the heat map by issue type
**As a** resident,
**I want to** filter the map to show only specific issue types,
**So that** I can find patterns relevant to my neighborhood.

**Acceptance Criteria:**
- [ ] Filter chips for each issue category shown above map
- [ ] Selecting a filter updates map markers in real time
- [ ] Multiple filters can be active simultaneously
- [ ] "All" option resets to showing everything
- [ ] Active filter count shown in UI

---

## Epic 5: User Accounts (Stretch)

### US-11 — Create an account and log in
**As a** returning user,
**I want to** create an account and log in,
**So that** my reports are saved to my profile.

**Acceptance Criteria:**
- [ ] Registration form with email + password
- [ ] Password hashed with bcrypt before storage
- [ ] JWT issued on login, stored in httpOnly cookie
- [ ] Auth state persists across page refreshes
- [ ] Logout clears session

---

### US-12 — View my past submissions
**As a** logged-in user,
**I want to** see all the reports I've submitted,
**So that** I can track their status over time.

**Acceptance Criteria:**
- [ ] `/my-reports` page lists user's reports newest-first
- [ ] Each item shows: photo thumbnail, issue type, date, status badge
- [ ] Status values: pending, in_progress, resolved
- [ ] Empty state shown if no reports yet
- [ ] Page requires authentication (redirect to login if unauthenticated)
