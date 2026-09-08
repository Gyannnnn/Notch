# Technical Requirements Document (TRD)

**Companion to:** PRD.md v1
**Document status:** Draft v1 — for engineering use (including AI coding agents) as the source of truth for implementation
**Last updated:** 2026-09-08

> **How to use this document:** This TRD maps PRD features to concrete architecture, data models, and API contracts. Where a decision was made earlier in scoping (stack choices, third-party services), it is treated as fixed here, not re-litigated. Implementation details not specified here (exact function signatures, component structure) are left to standard engineering judgment during build — this document defines contracts and boundaries, not every line of code.

---

## 1. System Architecture Overview

```
┌─────────────────────┐        ┌──────────────────────┐
│  Expo / React Native │  HTTPS │   Express API server  │
│  (iOS + Android)     │◄──────►│   (Node.js + Prisma)  │
└──────────┬───────────┘        └───────────┬───────────┘
           │                                 │
           │ direct (signed URLs)            │
           ▼                                 ▼
   ┌───────────────┐                 ┌───────────────┐
   │ Cloudflare R2  │                 │  PostgreSQL    │
   │ (photos/media) │                 │  (Neon/Railway)│
   └───────────────┘                 └───────────────┘

  External services: Clerk (auth) · RevenueCat (subscriptions)
  · Open Food Facts / USDA FDC (packaged food data)
  · Gemini Flash 2.0 (optional photo-assist vision)
  · Expo Push + FCM (notifications) · PostHog (analytics) · Sentry (errors)
```

**Repo layout (Turborepo + npm workspaces):**

```
/apps
  /mobile          → Expo React Native app
  /api             → Express + Prisma backend
/packages
  /schemas         → Zod schemas shared between mobile and api (request/response contracts)
  /nutrition-data  → IFCT-derived recipe/preset data + lookup logic (pure TS, no framework deps)
  /ui              → shared design tokens / primitives (if needed beyond NativeWind config)
```

## 2. Confirmed Stack (from prior scoping — treat as fixed)

- **Mobile:** Expo (managed), NativeWind, Gluestack UI, Reanimated + Moti, Gesture Handler, Expo Router, Expo Camera/Image Picker
- **Backend:** Node.js + Express, Prisma ORM, Zod validation, deployed on Railway or Render (not Cloudflare Workers — see PRD/earlier scoping rationale: avoids edge-runtime Prisma/connection-pooling complexity for a solo dev)
- **Database:** PostgreSQL (Neon or Railway-managed)
- **Auth:** Clerk (RN SDK) — not Auth.js (web-only, wrong fit for RN client)
- **Storage:** Cloudflare R2 (S3-compatible API) + CDN, `sharp` for server-side resize/compression on upload
- **AI vision:** Gemini Flash 2.0 primary, GPT-4o-mini as fallback/alternative — called only for optional photo-assist, never mandatory per-meal
- **Subscriptions:** RevenueCat (App Store + Play Store)
- **Notifications:** Expo Notifications + Firebase Cloud Messaging
- **Analytics/Monitoring:** PostHog (product analytics), Sentry (crash/error tracking)
- **Widgets:** `expo-widgets` (iOS, alpha) + `react-native-android-widget` (Android) — two separate implementations, not shared code
- **Monorepo:** Turborepo + npm workspaces
- **CI/CD:** GitHub Actions (lint/typecheck/test) + EAS Build/Submit (mobile), Railway/Render auto-deploy on push (backend)

## 3. Core Data Model (Prisma schema — conceptual, not final field-level spec)

```prisma
model User {
  id            String   @id @default(cuid())
  clerkId       String   @unique
  email         String   @unique
  createdAt     DateTime @default(now())
  goal          Goal     // CUT | BULK | MAINTAIN
  heightCm      Int
  currentWeightKg Float
  targetWeightKg  Float?
  activityLevel   ActivityLevel
  region          String   // for pricing tier + default food presets (IN | US | OTHER)

  weightEntries   WeightEntry[]
  progressPhotos  ProgressPhoto[]
  foodLogs        FoodLog[]
  streaks         StreakState?
  subscription    Subscription?
}

model WeightEntry {
  id        String   @id @default(cuid())
  userId    String
  weightKg  Float
  loggedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model ProgressPhoto {
  id          String   @id @default(cuid())
  userId      String
  storageKey  String   // R2 object key
  angle       PhotoAngle // FRONT | SIDE | BACK
  weightKgAtCapture Float?
  capturedAt  DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

model FoodItem {
  // Represents either a packaged product (from Open Food Facts/USDA) or a preset dish (from nutrition-data package)
  id            String   @id @default(cuid())
  source        FoodSource // BARCODE | PRESET | MANUAL | AI_ASSIST
  name          String
  caloriesPer100 Float
  proteinPer100  Float
  carbsPer100    Float
  fatPer100      Float
  barcodeUpc     String?  // if source = BARCODE
  presetSlug     String?  // if source = PRESET, references nutrition-data package
}

model FoodLog {
  id          String   @id @default(cuid())
  userId      String
  foodItemId  String
  portionGrams Float
  loggedAt    DateTime @default(now())
  mealSlot    MealSlot // BREAKFAST | LUNCH | DINNER | SNACK
  user        User     @relation(fields: [userId], references: [id])
  foodItem    FoodItem @relation(fields: [foodItemId], references: [id])
}

model StreakState {
  id              String   @id @default(cuid())
  userId          String   @unique
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  freezesRemaining Int     @default(2) // resets monthly
  lastActiveDate  DateTime?
  user            User     @relation(fields: [userId], references: [id])
}

model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  revenueCatId       String
  tier               Tier     // FREE | PRO
  expiresAt          DateTime?
  user               User     @relation(fields: [userId], references: [id])
}

model WorkoutLog {
  // P1 feature — lightweight, see PRD 6.P1. Not a program engine.
  id          String   @id @default(cuid())
  userId      String
  exerciseName String
  sets        Json     // [{ weightKg, reps }]
  loggedAt    DateTime @default(now())
}
```

## 4. API Design

Style: REST, JSON, Zod-validated request/response bodies shared via `packages/schemas`. Auth via Clerk-issued JWT verified on every request (middleware).

Core endpoint groups (not exhaustive — expand per feature during build):

**Auth/User**
- `GET /me` — current user profile + goal state
- `PATCH /me` — update goal, weight targets, activity level

**Weight**
- `POST /weight-entries` — log a weigh-in
- `GET /weight-entries?range=` — trend data for graphing (server computes rolling average for pace indicator, not raw points only)

**Progress Photos**
- `POST /progress-photos/upload-url` — returns a signed R2 upload URL (client uploads directly to R2, not through the API server, to avoid proxying large files through Express)
- `POST /progress-photos` — confirm upload, create DB record with metadata
- `GET /progress-photos/compare?fromId=&toId=` — returns both photo URLs + metadata for client-side comparison rendering (see §5 — comparison image composition happens client-side, not server-side)

**Food**
- `GET /food/barcode/:upc` — proxy/cache lookup against Open Food Facts + USDA FDC (server-side caching recommended to avoid redundant external calls for common items)
- `GET /food/presets?query=&region=` — search the curated dish preset library (from `packages/nutrition-data`)
- `GET /food/usuals` — user's frequently-logged items, ranked by recency + frequency, for one-tap re-log
- `POST /food/photo-assist` — accepts an image, returns AI best-guess food identification + portion estimate (rate-limited per user per day based on tier — enforce server-side, not just client-side, since this gates real API cost)
- `POST /food-logs` — log a food entry
- `GET /food-logs?date=` — daily log + computed totals vs. target

**Streaks**
- `GET /streaks` — current state
- (Streak increment logic is server-computed on any qualifying log action — not a separate client-triggered endpoint; see §6)

**Subscriptions**
- Webhook endpoint for RevenueCat events (`POST /webhooks/revenuecat`) to sync entitlement state into `Subscription` table — do not rely on the client to self-report subscription status.

## 5. Progress Photo Comparison — Technical Approach

Generate comparison views and shareable cards **client-side**, not server-side, to avoid building server-side image composition infrastructure:
- Photos are stored in R2; the app fetches both images via signed/CDN URLs and renders the comparison (side-by-side or slider/overlay) natively in React Native.
- For the shareable export card, use `react-native-view-shot` to capture the rendered comparison view (photos + branded overlay/stats) as a single image, which the user can then share via the native share sheet.
- This keeps the backend stateless with respect to image processing beyond upload resize/compression (`sharp`, applied once at upload time to control storage/bandwidth costs).

## 6. Streak & Notification Engine

- Streak state updates synchronously on the backend whenever a qualifying action is logged (food log, weigh-in, or photo) — check `lastActiveDate`, increment/maintain/reset `currentStreak` accordingly, consume a freeze if a gap exists and freezes remain.
- A daily scheduled job (cron on the backend host, or a lightweight scheduled function) computes, per user, their historical "usual" logging time window (e.g., most common hour they log breakfast/lunch/dinner over the trailing 2 weeks) and schedules the next behaviorally-timed push notification accordingly — recompute periodically (e.g., weekly), not on every single log event.
- Weekly streak-milestone triggers (§PRD 6.6) enqueue a job to pre-generate the physique-comparison prompt/notification, not the image itself (image generation stays client-side per §5 — the server just signals "your comparison is ready" and the client renders it on open).

## 7. Widget Data Sync

- **iOS (`expo-widgets`):** data shared via App Group container, populated by the main app on relevant state changes (streak update, new photo). Given alpha status, treat this as a technical risk — validate feasibility with a spike before committing to launch-day iOS widget parity (see PRD Open Questions).
- **Android (`react-native-android-widget`):** data shared via native module bridge/SharedPreferences equivalent, updated the same way.
- Widget should be able to render from last-synced cached data without requiring a live network call on every home-screen render (avoid battery/performance issues).

## 8. Third-Party Integration Notes

| Service | Purpose | Key technical constraint |
|---|---|---|
| Open Food Facts | Packaged food lookup | Free, crowdsourced — cache results server-side, handle missing-data gracefully (fall back to manual entry prompt) |
| USDA FoodData Central | Packaged/branded US food | Free, government — use as secondary source when Open Food Facts has no match |
| IFCT2017 (`packages/nutrition-data`) | Indian raw-ingredient base data | Static dataset bundled/synced into the package; the recipe/preset layer (dish = ingredients + oil/ghee + portion) is custom-built on top, not sourced externally |
| Gemini Flash 2.0 | Photo-assist food identification | Server-side call only (never expose API key to client); enforce per-user daily rate limit server-side tied to subscription tier |
| Clerk | Auth | Client SDK handles sign-in; backend verifies JWT on every request via middleware |
| RevenueCat | Subscription entitlement | Source of truth for tier status is the webhook-synced `Subscription` table, not client-reported state |
| Cloudflare R2 | Photo/media storage | Client uploads directly via signed URL (not proxied through API server) to avoid backend bandwidth/latency cost |

## 9. Environments & Deployment

- **Environments:** local (Docker Compose: Postgres + API), staging, production.
- **Backend:** Railway or Render, auto-deploy from `main` (staging) and a `production` branch/tag (prod) — exact branching model to be finalized at repo setup, but must have a staging environment before any production deploy step ships food-data or payment-related changes.
- **Mobile:** EAS Build for iOS/Android binaries, EAS Submit for store submission, EAS Update for OTA JS-only patches (does not cover the widget native code — those changes require a full store resubmission).
- **Secrets:** environment variables per environment via the hosting platform's secret manager (or Doppler if managing across Railway/EAS becomes unwieldy) — never commit API keys (Gemini, RevenueCat, Clerk, R2) to the repo.

## 10. Testing Strategy (pragmatic, solo-dev scope)

- Unit tests (Jest) for business-logic-heavy, bug-costly code: streak increment/freeze logic, weight pace-indicator calculation, calorie/macro totals aggregation, food preset portion math. These are the places a silent bug would misinform a user's health decisions — prioritize test coverage here over UI tests.
- Shared `packages/schemas` Zod validators double as a testing safety net for API contract drift between mobile and backend.
- Manual QA for UI flows pre-launch; defer automated E2E (Detox or similar) until post-launch if time-constrained — not a blocker for shipping V1 as a solo builder.

## 11. Non-Functional Implementation Notes (mapping PRD §9 to tech decisions)

- **AI cost discipline:** rate-limit `/food/photo-assist` server-side per user per day (free vs. paid tier limits), not just as a UI suggestion — this is what keeps unit economics sound at scale (see earlier cost modeling).
- **Offline tolerance:** queue food logs and photo captures locally (e.g., via a local SQLite/AsyncStorage queue) when network is unavailable, sync on reconnect — relevant given variable connectivity in hostel/budget-device contexts.
- **Performance on mid-range Android:** avoid heavy client-side image processing beyond what's needed for the view-shot export; keep list views (food search, logs) paginated/virtualized.

## 12. Known Technical Risks (carry these forward, don't let them surprise you mid-build)

1. `expo-widgets` is alpha — iOS widget implementation may hit undocumented breaking changes; timebox a spike early rather than assuming it "just works."
2. Photo-based food-AI accuracy is inherently limited for mixed/occluded dishes (industry-wide, not a bug you'll fully solve) — product copy and UX must set expectations accordingly (assist, not authority).
3. IFCT2017 preset/recipe layer is a genuine data-engineering effort, not a quick integration — budget real time for building and validating the initial dish library, not just wiring up an API call.
4. RevenueCat webhook reliability — build idempotent webhook handling (a replayed/duplicate event must not double-grant or corrupt entitlement state).