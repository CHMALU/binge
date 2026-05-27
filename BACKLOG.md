# Backlog — Binge

> **Purpose of this file.** Living checklist of what's done, what's pending, and *how to do it*. Read this when picking up work or when an AI agent needs to know the current state. Tick `[ ]` → `[x]` as items land. Anything in **Status: DONE** is already on `main`.
>
> **For AI agents:** treat this file as ground truth for project state. Before starting any task here, verify the "Status" line against `git log` and `git diff` (status lines may go stale). File paths and code references are kept current — update them if the underlying code moves.

---

## ⏰ Hard deadlines

- **Friday 2026-05-29, 18:00 CEST** — second release cut-off (= **final** release, no third release per Wolfgang's mail on 2026-05-27). All approved MRs must be on `main` by this time. **EN + AR must work end-to-end.**
- **Wednesday 2026-06-03, 18:00 CEST** — 5-minute demo video uploaded to YouTube, **Arabic interface with English voice-over**, link submitted via TeachCenter.

---

## Status snapshot — what's already on `main` (2026-05-27)

| Feature | Status | Branch | Notes |
|---------|--------|--------|-------|
| US1 — Browse without account | ✅ DONE | (initial) | Popular/new releases via TMDb |
| US2 — Movie/series detail page | ✅ DONE | — | Description, length, genre, rating, year |
| US3 — Search via TMDb | ✅ DONE | — | Keyword matching included |
| US4 — Filter searches | ✅ DONE | — | Type, genre, mood, length, year |
| US5 — Swipe session (skeleton) | ⚠️ PARTIAL | `feature/us5-swipe-implementation` | UI works, **but only 5 movies, no persistence, no results** — see [US7](#us7--recommendations--finish-swipe-end-to-end) |
| US6 — Swipe left/right mechanic | ✅ DONE | — | Buttons + drag work; *what happens after* the swipe = US7 |
| US6-streaming — Streaming provider info | ✅ DONE | `feature/us6-streaming-provider-info` | On detail page |
| US-ratings — Rate movies/series | ✅ DONE | `feature/rating` | RatingModal on detail page, persisted via `POST /api/rating` |
| US8 — Auth + DB | ✅ DONE | `feature/us8-auth-db` | NextAuth v5, Neon, Prisma v6 |
| US9 — Save to watchlist | ✅ DONE | `feature/us9-watchlist-save` | `POST /api/watchlist` |
| US10 — View watchlist | ✅ DONE | `feature/us10-watchlist-view` | `/[lang]/watchlist` page |
| i18n EN/PL/AR + RTL | ✅ DONE | `feature/i18n-language-switcher` | URL-based routing |
| Cinema design system + color tokens | ✅ DONE | `refactor/cinema-design-system`, `refactor/styling-system` | 2-layer tokens |
| Icons sweep (no Unicode emojis) | ✅ DONE | `refactor/icons-react-icons-sweep` | All UI icons via `react-icons` |
| CI/CD pipeline (build/lint/typecheck/audit/tests) | ✅ DONE | `CI/CD-update` | 5 stages, restored typecheck job |
| Next.js 16.2.6 (security patches) | ✅ DONE | `CI/CD-update` | Patches 13× high-severity advisories |
| Watchlist link enabled in Navbar dropdown | ✅ DONE | `feature/us10-watchlist-view` | `Navbar.tsx:111` (Christoph's `[chore][CN] enabling watchlist UI button`) |

**Not done yet:** US7 (recommendations), US11 (mark as watched), US-swipe-filter (watched filtering), Watchlist DELETE/toggle, color-blindness a11y, polish (Navbar cleanup, hero/cards dead buttons), demo video.

---

# Pending work

Sections are roughly ordered by **deadline urgency × user value**. The first three (color-blindness, watchlist-remove, US11) are the realistic pre-Friday candidates. US7 is the biggest remaining feature and likely slips to post-Friday polish since it's 8 SP and needs design work.

---

## 1. Color-blindness accessibility (URGENT — pre-Friday)

**Status:** ⏳ NOT STARTED
**Why:** PO mail 2026-05-26 — *"could be the feature that decides the investment"*. Hard deadline Friday.
**Branch suggestion:** `feature/a11y-colorblind`
**Approach:** default-accessible UI, **no mode toggle** — bake non-color signals into the default. A toggle adds complexity and most users won't know to flip it.

### Audit pass (do first, 30–60 min)
- [ ] Walk every screen with Chrome DevTools → Rendering → **Emulate vision deficiencies** (`deuteranopia`, `protanopia`, `tritanopia`, `achromatopsia`)
- [ ] List every place where color *alone* conveys information — add to this checklist as findings

### Known places to fix
- [ ] **A1. Swipe like/reject buttons** — `src/components/MovieSwiper.tsx`. Currently green vs red bg + glow. `FaThumbsUp` / `FaThumbsDown` differ in shape (good) but glow + bg are color-only. **Fix:** add "Like" / "Skip" text labels under the buttons, OR thicker border on the "destructive" action, OR slightly larger icon for one side.
- [ ] **A2. Status badge on detail page** — `src/components/MovieDetail.tsx:135`. `Returning Series` renders with `text-success` (green); other statuses use neutral `text-fg`. Color is the only signal. **Fix:** prepend a small icon — `IoCheckmarkCircle` for ongoing, `IoPauseCircle` for ended — or wrap in a pill with distinct shape.
- [ ] **A3. Toast notifications** — `react-hot-toast` defaults green/red. Toast content already describes the action (we always pass a string), so info isn't lost, but **verify** that default toast bg/text meets WCAG AA contrast in both light/dark themes. Override via `toastOptions` in `<Toaster />` if not.
- [ ] **A4. Form validation errors** — login/register render text alongside red color. Probably fine but **verify** red text on `surface-card` background hits 4.5:1 contrast.
- [ ] **A5. Swipe page decorative blurs** — `bg-red-500/20` / `bg-green-500/20` glow on left/right sides of `/swipe`. Purely decorative atmosphere, not info-bearing. Low priority. Either leave as-is or shift to `bg-fg-subtle/20` if you want strict neutrality.

### Tools
- Chrome DevTools → Rendering panel → Emulate vision deficiencies (built-in)
- [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) (macOS) / [Color Oracle](https://colororacle.org/) (cross-platform)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Tests
Unit tests aren't useful here — it's a visual property. **Add a manual test plan to the PR description:**
> *Open swipe in deuteranopia mode → like vs skip distinguishable without color? Open detail of "Returning" series → status badge readable without color?*

**Estimated SP:** 3

---

## 2. Watchlist completion — DELETE / toggle / remove (pre-Friday)

**Status:** ⏳ NOT STARTED
**Why:** Builds on US9 + US10 (already on `main`). PO explicitly asked for the ability to remove. Without DELETE the watchlist is one-way and the "In watchlist" button has no toggle behaviour.
**Branch suggestion:** `feature/watchlist-remove`

### Steps
- [ ] **B1. `DELETE /api/watchlist` endpoint**
  - Add to `src/app/api/watchlist/route.ts` (already has GET + POST from US9/US10)
  - Body: `{ tmdbId: number, mediaType: "movie" | "tv" }`
  - 401 if no session, 400 on invalid body, 404 if no matching row, 200 on success
  - Use `prisma.watchlistItem.delete({ where: { userId_tmdbId_mediaType: {...} } })` (composite unique key already in schema)
- [ ] **B2. Extend the shared type contract**
  - In `src/types/watchlist.ts`, add `DeleteWatchlistRequest` + `DeleteWatchlistResponse`
- [ ] **B3. `WatchlistButton.tsx` becomes a toggle**
  - Current: "Add to watchlist" → POST → "In watchlist" (dead-end)
  - New: when in "In watchlist" state, click sends DELETE, flips back to "Add to watchlist"
  - State machine: `idle` ↔ `loading` ↔ `idle` (in opposite state)
  - Optimistic flip OK; on DELETE error roll back state and show error toast
- [ ] **B4. Remove button on each `/watchlist` page item**
  - In `src/app/[lang]/watchlist/page.tsx` (or whichever client component renders the list — check current structure first)
  - Per-item `IoTrash` icon button with `aria-label={dict.watchlist.remove}`
  - On click: DELETE then `router.refresh()` (server component refetches the list)
- [ ] **B5. Toasts**
  - `react-hot-toast` already wired (US9 uses it for errors)
  - Add success toast on add AND on remove
  - New dict keys: `dict.watchlist.addedToast`, `dict.watchlist.removedToast` — add to all three locales (EN/PL/AR)

### Tests (TDD — write the `[red]` commit first)
- [ ] DELETE: 401 unauthenticated / 200 success / 404 if missing / 400 on invalid body
- [ ] Toggle: rendering `WatchlistButton` in "in watchlist" state and clicking sends DELETE + flips visual state
- [ ] Remove button on the list page sends DELETE and the item disappears from the DOM
- [ ] Toast appears on successful add and successful remove

**Estimated SP:** 3

---

## 3. US11 — Mark titles as watched (pre-Friday stretch)

**Status:** ⏳ NOT STARTED
**Why:** Committed user story. Required for "watchlist → watched" flow. Watched list is a Phase-1 deliverable that hasn't shipped yet.
**Branch suggestion:** `feature/us11-mark-watched`

### Steps
- [ ] **C1. `POST /api/watched` endpoint**
  - Body: `{ tmdbId, mediaType, rating?: number | null }`
  - In ONE Prisma transaction: `create` a `WatchedItem` AND `delete` the matching `WatchlistItem` if present
  - 401/400/200 responses
  - Idempotent on duplicate: existing `WatchedItem` returns 200 with no-op
- [ ] **C2. "Mark as watched" button on watchlist rows**
  - Add to whichever component renders watchlist items
  - `IoCheckmarkCircle` icon, `aria-label={dict.watchlist.markWatched}`
  - On click → POST → success toast → `router.refresh()`
- [ ] **C3. `GET /api/watched` endpoint** — mirrors `GET /api/watchlist`
  - Returns the user's watched items sorted by `createdAt desc`
- [ ] **C4. `/[lang]/watched` page** — visually mirrors `/[lang]/watchlist` (poster grid, link to detail)
  - Server Component, reads session via `auth()`, fetches list, redirects to login if no session
- [ ] **C5. Enable `watched` link in Navbar dropdown**
  - `src/components/Navbar.tsx:112` — currently `disabled` prop set
  - Just remove the `disabled` and the link works
- [ ] **C6. Dict keys**
  - `dict.watched.title`, `dict.watched.empty`, `dict.watchlist.markWatched`, `dict.watchlist.markedToast`
  - Add to EN/PL/AR

### Schema note
`WatchedItem` model already exists in `prisma/schema.prisma` from US8 — no migration needed. It has `rating: Int? (nullable)` for the optional post-watch rating.

### Tests
- [ ] POST: 401 / 200 / watchlist row deleted in same transaction / idempotent on duplicate
- [ ] GET: 401 / 200 returns sorted list
- [ ] Watchlist row "Mark as watched" → row disappears from `/watchlist`, appears on `/watched`

**Estimated SP:** 3

---

## 4. US7 — Recommendations / finish swipe end-to-end (post-Friday probably)

**Status:** ⏳ NOT STARTED
**Why:** This is the **biggest remaining feature**. Right now `MovieSwiper.tsx` is a placeholder: only 5 hardcoded movies, swipes go nowhere, "Here should be the final result!" string is still on screen. The entire discover-and-recommend loop is unfinished. Without this, US5/US6 are technically "done" but functionally broken.
**Branch suggestion:** `feature/us7-recommendations`
**Estimated SP:** 8

### Steps

- [ ] **D1. Persist swipe decisions — schema change**
  - Add to `prisma/schema.prisma`:
    ```prisma
    model SwipeDecision {
      id         String   @id @default(cuid())
      userId     String
      tmdbId     Int
      mediaType  String   // "movie" | "tv"
      liked      Boolean
      createdAt  DateTime @default(now())
      user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      @@unique([userId, tmdbId, mediaType])
      @@index([userId])
    }
    ```
  - Add `swipeDecisions SwipeDecision[]` to `User`
  - Run `npx prisma db push` (or `migrate dev` if you want a real migration file)
  - Run `npx prisma generate`
  - **Guest user decision (see Open Question #5):** either store in `sessionStorage` and bulk-POST on login, OR don't persist for guests at all

- [ ] **D2. `POST /api/swipe` endpoint**
  - Body: `{ tmdbId, mediaType, liked }`
  - `upsert` to be idempotent — re-swiping the same title overwrites the decision
  - 401 if no session (or accept anonymous and skip — depends on D1 decision)

- [ ] **D3. Load 10–15 movies per session, not 5**
  - Currently `MovieSwiper.tsx` is hardcoded to 5 — grep for `slice(0, 5)` or wherever the deck is limited
  - Source: TMDb popular/upcoming combined, filtered by user filters from `FilterBar`
  - Filter out already-swiped IDs from the user's `SwipeDecision` set

- [ ] **D4. Recommendation algorithm**
  - Trigger when deck is empty (user has swiped all 10–15)
  - For each `liked: true` decision in the session: fetch TMDb `/movie/{id}/recommendations` or `/tv/{id}/recommendations` (ISR-cached, `{ next: { revalidate: 3600 } }`)
  - Score each candidate:
    - +N if genre overlap with liked titles
    - +N if also appears in `WatchedItem` with `rating ≥ 4` for this user
    - -∞ if already in `SwipeDecision` (with either liked value) — don't re-recommend
    - -∞ if already in `WatchedItem` — already seen
    - -N if in `WatchlistItem` — already saved, lower priority for recommendation
  - Return top 3–5

- [ ] **D5. Results screen at `/[lang]/swipe/results`**
  - New route, Server Component
  - Replaces the placeholder string in `MovieSwiper.tsx:52` (currently `"Here should be the final result!"`)
  - Poster grid of top matches, link to each detail page, "Add to watchlist" button per match (reuses `WatchlistButton`)
  - Empty state: "We couldn't find matches — try swiping more"

- [ ] **D6. Cleanup**
  - Remove `console.log("Positive!")`, `console.log("Negative!")`, `console.log("Show Final Result")` from `MovieSwiper.tsx`
  - Remove the literal `"Here should be the final result!"` once D5 ships

- [ ] **D7. Dict keys**
  - `dict.swipe.results.title`, `dict.swipe.results.empty`, `dict.swipe.results.addToWatchlist`
  - Add to EN/PL/AR

### Tests (TDD)
- [ ] Swipe right → `POST /api/swipe` called with `liked: true`
- [ ] Swipe left → `POST /api/swipe` called with `liked: false`
- [ ] After deck empty → recommendation endpoint called, results screen renders 3–5 posters
- [ ] Already-watched title excluded from candidates
- [ ] Already-swiped title excluded from candidates
- [ ] Empty state when no matches found

---

## 5. US-swipe-filter — Watched/swiped titles don't appear in swipe (post-Friday)

**Status:** ⏳ NOT STARTED, depends on US7 (`SwipeDecision` model) and US11 (`WatchedItem` populated)
**Why:** Once US7 lands, the swipe deck still re-shows things the user has already swiped, watched, or watchlisted. That's bad UX.
**Branch suggestion:** `feature/us-swipe-filter`

### Steps
- [ ] **E1.** In `src/app/[lang]/swipe/page.tsx` (Server Component), read session via `auth()`
- [ ] **E2.** If logged in: fetch the user's `SwipeDecision.tmdbId`, `WatchedItem.tmdbId`, `WatchlistItem.tmdbId` sets in parallel
- [ ] **E3.** Filter those IDs out of the TMDb popular list before passing to `MovieSwiper`
- [ ] **E4.** Guest users: skip the DB lookup, no filter
- [ ] **E5.** Note: this makes `/swipe` dynamic (SSR) for logged-in users — correct, personalized data shouldn't be statically cached

### Tests
- [ ] Logged-in user with 3 watched + 2 watchlisted items → those 5 IDs absent from deck
- [ ] Guest user → deck unchanged from current behaviour

**Estimated SP:** 5

---

## 6. Navbar cleanup (post-Friday polish)

**Status:** ⏳ NOT STARTED
**Why:** PO meeting feedback — sign-in icon + text are visually disjoint, and Movies/Series tabs link to the homepage so they're confusing.
**Branch suggestion:** `chore/navbar-cleanup`

### Steps
- [ ] **F1. Combine sign-in icon + text into one element when logged out**
  - `src/components/Navbar.tsx:76–97` currently has two clickable elements (text button + round avatar) both going to `/login`
  - Merge into one button: icon + label, single click target

- [ ] **F2. Remove dead "Movies" / "Series" tabs**
  - `Navbar.tsx:53–66` — both link to `/${lang}` (home), don't filter anything
  - Just remove the array entries. If filtering is wanted later, that's a US-filter task.
  - Keep "Discover" tab pointing to `/${lang}/swipe` until F3 is decided

- [ ] **F3. Discover/Swipe CTA placement** — ⚠️ **blocked on Open Question #1**

**Estimated SP:** 1

---

## 7. Hero & cards — dead buttons (post-Friday polish)

**Status:** ⏳ NOT STARTED, mostly blocked on decisions
**Why:** Multiple buttons on the homepage and cards don't do anything. Reviewers (and PO) noticed.
**Branch suggestions:** `feature/trailer-embed` (for G2 if "embed" path) + `chore/dead-buttons` (G3 + G4)

### Steps
- [ ] **G1. Main CTA "Start swipe session"** — blocked on Open Question #1 (where does Discover CTA live?)

- [ ] **G2. "Watch Trailer" — make it work or kill it**
  - `src/app/[lang]/page.tsx:89–91` — non-functional button
  - Options:
    - **A. Embed:** fetch from TMDb `/movie/{id}/videos` or `/tv/{id}/videos`, find official YouTube trailer, open in modal/lightbox. Caveat: TMDb doesn't guarantee a trailer exists for every title — need an empty state.
    - **B. Replace:** swap with something like "More like this" → swipe with similar genre
    - **C. Remove:** delete the button
  - **Blocked on Open Question #2**

- [ ] **G3. "See all" buttons next to category rails**
  - `src/app/[lang]/page.tsx:166–171` — all `href="#"`
  - Options: link to filtered view (US4's `FilterBar` already exists), or just remove
  - **Blocked on Open Question #3**

- [ ] **G4. MovieCard hover icons (plus, play)**
  - `src/components/MovieCard.tsx:43–49` — purely decorative, no onClick
  - Options: plus = "Add to watchlist" (consistent with `WatchlistButton`), play = ??? (trailer? swipe-preview?)
  - **Blocked on Open Question #4**

**Estimated SP:** ~5 (varies by decision)

---

## 8. Demo video (not coding)

**Status:** ⏳ NOT STARTED
**Why:** Mandatory deliverable. Hard deadline Wed 2026-06-03 18:00 CEST.
**Branch:** N/A — no code

### Steps
- [ ] **H1. Sketch flow within 5-min budget:** home → search → detail → add to watchlist → view watchlist → rate → swipe session → language switch (showcase RTL Arabic) → mention color-blindness work
- [ ] **H2. Switch UI to `/ar` for the recording.** Verify RTL layout is clean, Arabic strings render properly, no fallback text leaking
- [ ] **H3. Record screen silently** (OBS / QuickTime / equivalent)
- [ ] **H4. Record English voice-over separately** and sync in editor — safer than talking during the screen recording
- [ ] **H5. Upload to YouTube (unlisted OK), submit link via TeachCenter**

**Estimated effort:** ~2 hours, not SP

---

# Open Questions — block coding, need product/design decision

1. **Discover/Swipe CTA placement** (affects F3 + G1)
   - a) Replace `Discover` tab in navbar with bigger CTA button (gold "Swipe" button right of search)
   - b) Floating action button (bottom-right corner)
   - c) Hero section gets a third button below "More info"
   - d) Section header / banner above movie rails

2. **Trailer button — embed or kill?** (affects G2)
   - TMDb `/{type}/{id}/videos` provides `key` (YouTube ID), `site`, `type` — usable but not guaranteed to exist for every title
   - Embed path = bigger scope (modal, empty state, error handling)
   - Decision affects whether `feature/trailer-embed` branch exists at all

3. **"See all" buttons — filter page or remove?** (affects G3)
   - If filter page: hook into existing `FilterBar` (US4) — cheap
   - If remove: 30 seconds of work

4. **Card hover icons — function or remove?** (affects G4)
   - Plus = add to watchlist makes sense (matches `WatchlistButton`)
   - Play = ??? trailer? quick preview modal? something else?

5. **Guest swipe persistence — sessionStorage or skip?** (affects D1, D5)
   - Persist guest decisions in `sessionStorage`, bulk-POST on login when guest registers mid-session
   - OR don't persist for guests at all — they see results screen but decisions evaporate on refresh
   - First option = better UX but more code paths

---

# How to work this file

1. **Picking up a task:** find the section with `Status: NOT STARTED`, read the steps, create the branch named in the suggestion.
2. **Marking progress:** flip `[ ]` to `[x]` as substeps land. When a section is fully `[x]`, set the section's Status to `✅ DONE` and add a `Branch:` line pointing at the merged MR.
3. **Updating the file:** if reality diverges from the plan (e.g. you took a different branch name, the file path moved), edit this doc. It's only useful if it's true.
4. **For AI agents:** before suggesting an implementation, **verify the Status line by checking git log / reading the referenced files**. Status lines drift faster than code does.
