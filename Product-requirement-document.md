# Product Requirements Document (PRD)

**Product working name:** [BigBiceps]
**Document status:** Draft v1 — for engineering use (including AI coding agents) as the source of truth for scope
**Owner:** Gyan
**Last updated:** 2026-09-08

> **How to use this document:** This PRD defines *what* to build and *why*, prioritized by phase. It intentionally does not specify implementation details (schemas, API contracts, library choices) — that lives in the companion TRD. When a feature described here is ambiguous, default to the simplest version that satisfies the acceptance criteria, and flag the ambiguity rather than guessing on scope.

---

## 1. Vision

A mobile app for people running a structured cut or bulk who are tired of (a) manually hunting through their camera roll to compare progress photos, (b) inaccurate or missing calorie data for home-cooked/served meals (especially Indian/South Asian food), and (c) bloated, ad-heavy, or upsell-driven fitness apps that bury the two things that actually matter: *am I visibly changing, and am I eating on plan.*

The product is not a general-purpose fitness app. It does one thing exceptionally well (automatic progress-photo tracking) and one thing well enough to be trustworthy (fast, accurate-enough food logging built around how people actually eat, including South Asian meals underserved by mainstream calorie apps). Everything else is deliberately minimal.

## 2. Problem Statement

Target users currently:
- Take progress photos on their phone but have no system to retrieve and compare an old photo against a new one — they manually search their gallery, export to third-party editors, and build comparison grids by hand.
- Log weight in a notes app with no trend visualization or pace guidance (are they losing/gaining too fast or too slow relative to their goal).
- Struggle to log calories/macros for home-cooked or served meals (e.g., Indian thali-style meals — dal, rice, roti, sabzi) because mainstream calorie databases are built around Western packaged and restaurant food. Users resort to guessing (e.g., "2 scoops of rice ≈ X calories" from a generic Google search).
- Have tried existing apps (MyFitnessPal, Cal AI, HealthifyMe, etc.) and abandoned them due to feature bloat, distracting upsells/paid coaching pushes, or subscription cost relative to perceived value.

## 3. Target Users

**Primary persona:** A gym-goer (student, young professional) in India or a South Asian person in the US, currently running a structured cut or bulk, budget-conscious, technically comfortable with apps, wants a lightweight tool — not a coach, not a social network.

**Explicitly not the target for V1:** casual users with no specific goal, bodybuilders needing competition-prep-grade tools, anyone wanting a full AI coaching/chat experience.

## 4. Goals & Success Metrics

| Goal | Metric | V1 target (12 months) |
|---|---|---|
| Retention via low-friction logging | D30 retention | Beat category median (~general fitness app benchmarks) |
| Hero feature adoption | % of active users with ≥2 progress photos logged | >50% of WAU |
| Monetization | Free-to-paid conversion | Meet or beat Health & Fitness category median (~2.9% D35) |
| Logging friction | Median time to log a meal (after onboarding) | <10 seconds for a "usual" meal |
| Retention resilience | % of users who resume after a missed-day gap (vs. permanently churning) | Track and improve over time — no fixed target for v1, establish baseline |

## 5. Competitive Positioning (context, not a spec)

Do not attempt to out-build MyFitnessPal (huge generic food database), Cal AI/MyFitnessPal (photo-AI calorie estimation — proven but ~33% error margin on mixed/served meals per independent testing), HealthifyMe (India-focused, strong food data + paid human coaching upsell), or Fitbod/Strong/Hevy/JEFIT (mature workout-logging and program-generation apps with years of data). This product's differentiation is the *combination* of (a) automatic progress-photo comparison done well, and (b) fast, accurate South-Asian-aware food logging, in a deliberately lightweight package — not breadth of features.

## 6. Scope — V1 (MVP) Features, Prioritized

### P0 — Must ship in V1

**6.1 Automatic Progress Photo Tracking (Hero Feature)**
- User captures a photo (front/side/back, user's choice of angle(s)) tagged with date and body weight at time of capture.
- App automatically surfaces a comparison against a prior photo (configurable: 2 weeks ago, 1 month ago, "oldest available," or user-selected date) — no manual search through camera roll required.
- Side-by-side or overlay comparison view, generated automatically without the user exporting to a third-party app.
- Shareable export: a branded comparison card (before/after, date range, optional stats overlay) sized for Instagram/WhatsApp Status sharing.
- Photos stored privately by default; sharing is an explicit user action per photo/comparison, never automatic.

**Acceptance criteria:** A user with 2+ photos taken at least a week apart can view an auto-generated comparison within 2 taps of opening the app, with no manual file search. A share card can be generated and exported as an image in under 5 seconds.

**6.2 Food Logging**
- **Packaged food:** barcode scan → lookup against Open Food Facts / USDA FoodData Central → auto-fill calories/macros/serving size.
- **Served/home-cooked meals (priority: Indian/South Asian, secondary: general):** preset-based quick log — common dishes (dal, rice, roti, sabzi, etc.) with standard portion units (katori, roti count, cup) mapped to a nutrition data layer built on IFCT2017 + a custom recipe layer (dish = ingredients + typical oil/ghee + portion). Not a full recipe-building tool in V1 — a curated preset library covering the most common dishes, expandable over time.
- **"Usual meals":** after a user logs the same meal 2+ times, it's surfaced as a one-tap "log again" suggestion at the relevant time of day.
- **Optional photo-assist:** user may photograph a meal to get an AI best-guess pre-fill (via a low-cost vision model), which the user then confirms/adjusts against the preset system — not presented as a fully automated, trust-it-blindly calorie count. Rate-limited on the free tier.
- **Manual fallback:** always available — search/enter a food and its macros directly.

**Acceptance criteria:** A returning user logging a previously-eaten meal can complete the log in ≤2 taps. A new packaged food item can be logged via barcode scan in <10 seconds including scan time. Indian meal presets cover at minimum: rice, roti/chapati, dal (2-3 common variants), 5 common sabzi/curry types, common proteins (egg, chicken, paneer) — expand post-launch based on usage data.

**6.3 Weight Tracking**
- Quick daily/periodic weight entry (minimal taps).
- Trend graph over time, not just raw data points (smooths day-to-day water-weight noise).
- Pace indicator against the user's stated goal (cutting/bulking/maintaining): visual (color-coded) signal for "on pace," "too fast" (risk of muscle loss on a cut, excess fat gain on a bulk), or "too slow."

**Acceptance criteria:** Weight entry takes ≤2 taps from app open. Pace indicator updates automatically as new weigh-ins are logged, using a rolling average (not single-day swings) to avoid noisy false signals.

**6.4 Goal Setting & Onboarding**
- User selects a goal: cut, bulk, or maintain.
- User inputs height, current weight, target weight (optional), and activity level, used to calculate a starting calorie/macro target.
- Onboarding includes a quick "tell us roughly what you usually eat" pass to avoid a completely empty dashboard on day one (does not need to be precise — directional).
- No mandatory account creation friction beyond what's needed for data persistence (support Apple/Google sign-in via Clerk to minimize signup friction).

**6.5 Analytics Dashboard**
- Daily calorie/macro summary vs. target, with a simple visual indicator (e.g., red/yellow/green) for whether the day is on track, over, or under.
- Weekly/monthly trend views for weight and calorie adherence.
- Must be glanceable — a user should understand their status in under 3 seconds of looking at the home screen, without needing to interpret raw numbers.

**6.6 Streak & Engagement System**
- Streak counts any single logging action per day (food log, weigh-in, or photo) — intentionally a low bar, not "perfect" adherence, to avoid punishing normal variation and causing abandonment after one missed day.
- Streak milestones (e.g., every 7-day streak) trigger an automatic physique-comparison card generation as the "reward" moment.
- Forgiveness mechanic: a limited number of "streak freezes" per month so a single missed day doesn't reset progress to zero. Missing a freeze-eligible day should never delete or hide historical logged data.
- No manipulative dark-pattern language. Reminder copy should feel supportive, not guilt-inducing (explicit design constraint, not just a suggestion).

**6.7 Home Screen Widget**
- iOS and Android widget showing: current streak count + a one-tap "log now" action. Nothing else — deliberately minimal (avoid cramming macros/stats onto it).

**6.8 Notifications**
- Behaviorally-timed reminders (based on the user's own historical logging times), not fixed generic schedule for all users.
- Frequency capped and tone kept supportive — see 6.6 constraint on manipulative patterns.

### P1 — Fast follow (post-launch, not blocking V1 ship)

- Lightweight manual workout log (exercise name, sets, reps, weight) — purely to answer "did I train this week" alongside the photo timeline. **Explicitly not** a program-generation engine (see Out of Scope).
- Steps integration via Apple Health / Google Fit (read-only) — do not build a custom pedometer.
- Expanded Indian/South Asian dish preset library based on real usage data (which meals users are manually searching for most).
- Regional pricing refinement (US vs. India tiers via App Store/Play regional pricing).

### P2 — Later / exploratory

- Additional cuisine preset libraries beyond Indian (e.g., other underserved cuisines, based on user demand signal).
- Community/social features (only if data shows organic demand — not a default assumption).

## 7. Explicitly Out of Scope for V1 (and the reasoning, so it isn't silently reconsidered)

- **Full personalized workout program generation** ("proven plans," periodization, 1RM-based progression) — this is Fitbod's core product, built on 400M+ logged workouts; a new entrant cannot credibly claim "proven" without years of outcome data. Not worth the build cost relative to differentiation value.
- **Exercise GIF/video demo library** — table stakes in the workout-app category already; adds licensing/production cost with zero differentiation value for this product's positioning.
- **Calorie-burned-from-lifting calculation** — MET-based estimates for resistance training carry large, inherent error margins regardless of input data granularity; not a solvable "accuracy" problem, and not what serious lifters actually track.
- **AI coaching chat / conversational nutrition coach** — this is HealthifyMe's Ria AI positioning; building a credible one requires ongoing human-quality-control overhead this product isn't structured for.
- **Ads as a monetization channel** — explicitly rejected; contradicts the "not distracting" positioning that is core to user acquisition (the founder's own reason for abandoning competitor apps).
- **Full recipe-building / custom recipe database tool** — V1 ships with curated presets, not a build-your-own-recipe system.

## 8. Monetization

- Freemium subscription model. No ads.
- Free tier: core logging (packaged + preset-based), basic weight tracking, limited photo-AI assist calls per month.
- Paid tier (~$4.99–6.99/month or ~$39–49/year US; ~₹199–299/month India, via platform regional pricing): unlimited photo-AI assist, full progress-photo comparison history/exports, unlimited streak freezes, priority access to expanded preset libraries.
- Subscription management via RevenueCat (App Store + Play Store).

## 9. Non-Functional Requirements

- **Privacy:** photos and weight data are private by default; sharing is always an explicit, per-item user action. No data sold to third parties. Clear account deletion path that removes photos and logs.
- **Performance:** primary logging actions (food quick-log, weigh-in, photo capture) must feel instant (<1s perceived latency) even on mid-range Android devices common in the Indian market.
- **Offline tolerance:** photo capture and basic logging should queue and sync when connectivity returns rather than failing outright (relevant for hostel/variable-connectivity environments).
- **Accessibility:** standard mobile accessibility support (readable contrast, scalable text) — not a differentiator, but not to be skipped.
- **Cost discipline:** AI vision calls must remain rate-limited/optional by design (see 6.2) to keep unit economics sound at scale — this is a product requirement, not just a technical one.

## 10. Design Principles (binding on all features, not just guidelines)

1. **Silent, not forceful.** Passive/ambient signals (widget, in-app streak display) are preferred over push notifications. When notifications are used, they must be behaviorally timed and supportively worded.
2. **Confirm, don't compose.** Wherever possible, logging should be picking from a small set of known-good defaults (usuals, presets) rather than free-form data entry.
3. **No guilt mechanics.** Missed days must never feel like failure states or erase prior progress/data.
4. **No bloat.** Before adding any feature, ask whether it serves the two core jobs (progress-photo tracking, accurate low-friction food logging) or whether it's scope creep toward competing on breadth against incumbents. Default to "no" unless clearly justified.

## 11. Open Questions (need a decision before or during build — not blocking document delivery)

- Final product name/brand.
- Exact list of launch-day Indian dish presets (needs a first pass based on the founder's own eating patterns + a small user survey).
- Whether Android widget parity ships simultaneously with iOS or slightly staggered (given `expo-widgets` is iOS-only and in alpha, and Android uses a separate library — see TRD for technical risk detail).
- Exact free-tier photo-AI assist call limit per month (needs cost modeling once real usage data exists).