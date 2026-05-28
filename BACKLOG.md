# Backlog — Binge

> **Purpose of this file.** Living checklist of what's done, what's pending, and *how to do it*. Read this when picking up work or when an AI agent needs to know the current state. Tick `[ ]` → `[x]` as items land. Anything in **Status: DONE** is already on `main`.
>
> **For AI agents:** treat this file as ground truth for project state. Before starting any task here, verify the "Status" line against `git log` and `git diff` (status lines may go stale). File paths and code references are kept current — update them if the underlying code moves.

---

## ⏰ Hard deadlines

- **Friday 2026-05-29, 18:00 CEST** — second release cut-off (= **final** release, no third release per Wolfgang's mail on 2026-05-27). All approved MRs must be on `main` by this time. **EN + AR must work end-to-end.**
- **Wednesday 2026-06-03, 18:00 CEST** — 5-minute demo video uploaded to YouTube, **Arabic interface with English voice-over**, link submitted via TeachCenter.

---

## Status snapshot — what's already on `main` (2026-05-28)

| Feature | Status | Branch | Notes |
|---------|--------|--------|-------|
| US1 — Browse without account | ✅ DONE | (initial) | Popular/new releases via TMDb |
| US2 — Movie/series detail page | ✅ DONE | — | Description, length, genre, rating, year |
| US3 — Search via TMDb | ✅ DONE | — | Keyword matching included |
| US4 — Filter searches | ✅ DONE | — | Type, genre, mood, length, year |
| US5 — Swipe session (skeleton) | ⚠️ PARTIAL | `feature/us5-swipe-implementation` | UI works, **but only 5 movies, no persistence, no results** — see [US7](#4-us7--recommendations--finish-swipe-end-to-end-post-friday-probably) |
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
| Color-blindness a11y (toggle + default signals) | ✅ DONE | `feature/a11y-colorblind` | Merged into `main` (commit `b26e36e`) |
| Watchlist DELETE / toggle / remove (§2) | ✅ DONE | `feature/watchlist-remove` | DELETE endpoint + WatchlistButton toggle + (later moved to CardActions trash) |
| RatingModal guest redirect (§10) | ✅ DONE | `chore/rating-guest-redirect` | Guests see "Sign in to rate" Link instead of 401 dead-end |
| Swipe page locale forwarding (§11) | ✅ DONE | `chore/rating-guest-redirect` | `getPopular*` now receive `lang` from URL → swipe deck localized |
| US11 — Mark titles as watched (§3) | ✅ DONE | `feature/us11-mark-watched` | POST/GET/DELETE `/api/watched`, `/[lang]/watched` page, MarkWatchedButton with toggle-to-Unmark, CardActions hover icons |
| Card hover icons live + remove floating overlay (§7 G4) | ✅ DONE | `feature/us11-mark-watched` | Plus = live "Add to watchlist" toggle, IoCheckmarkCircle = mark watched, IoCloseCircle = unmark on /watched, IoTrash = remove on /watchlist. RemoveFromWatchlistButton deleted. |
| Hover icons reflect actual DB state | ✅ DONE | `feature/us11-mark-watched` | `getUserItemSets()` helper feeds `initiallyInWatchlist` + `initiallyWatched` into every CardActions on home / watchlist / watched. Fixes the post-review bug where icons always defaulted to "not saved / not watched". |

**Not done yet:** US7 (recommendations), US-swipe-filter (watched filtering), navbar cleanup, remaining hero/cards dead buttons (G1–G3), navigation consistency, demo video, rating-storage consolidation (§12 tech-debt).

---

# Pending work

Sections retain their original numbers (gaps where a section was completed and removed — see snapshot table above for the history). Ordered roughly by **deadline urgency × user value**. US7 is the biggest remaining feature and likely slips to post-Friday since it's 8 SP and needs design work.

---

## 4. US7 — Recommendations / finish swipe end-to-end (post-Friday probably)

**Status:** ⏳ NOT STARTED — being picked up by Oxo (basic algo for Friday release; Claude's advanced hybrid plan in `/home/dawid/.claude/plans/elo-jedziemy-z-backlog-md-robust-rain.md` kept as "v2" reference)
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
- [ ] **E2.** If logged in: fetch the user's `SwipeDecision.tmdbId`, `WatchedItem.tmdbId`, `WatchlistItem.tmdbId` sets in parallel — reuse `getUserItemSets()` from `src/lib/userSets.ts` (already covers Watchlist + Watched; just extend it or add a swipe-decision twin).
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

**Status:** ⏳ NOT STARTED, mostly blocked on decisions (G4 already DONE — see §3 in snapshot table)
**Why:** Multiple buttons on the homepage and hero don't do anything. Reviewers (and PO) noticed.
**Branch suggestions:** `feature/trailer-embed` (for G2 if "embed" path) + `chore/dead-buttons` (G3)

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

- [x] ~~**G4. MovieCard hover icons (plus, play)**~~ — DONE on `feature/us11-mark-watched`. Plus is now a live add-to-watchlist toggle, mark-watched + trash + unmark icons added where contextually relevant. Play icon left as decorative fallback for home/swipe/search until a trailer decision is made (G2).

**Estimated SP:** ~4 (varies by decision; G4 already delivered)

---

## 8. Demo video (not coding)

**Status:** ⏳ NOT STARTED
**Why:** Mandatory deliverable. Hard deadline Wed 2026-06-03 18:00 CEST.
**Branch:** N/A — no code

### Steps
- [ ] **H1. Sketch flow within 5-min budget:** home → search → detail → add to watchlist → view watchlist → rate → mark as watched → /watched page → swipe session → language switch (showcase RTL Arabic) → mention color-blindness work
- [ ] **H2. Switch UI to `/ar` for the recording.** Verify RTL layout is clean, Arabic strings render properly, no fallback text leaking
- [ ] **H3. Record screen silently** (OBS / QuickTime / equivalent)
- [ ] **H4. Record English voice-over separately** and sync in editor — safer than talking during the screen recording
- [ ] **H5. Upload to YouTube (unlisted OK), submit link via TeachCenter**

**Estimated effort:** ~2 hours, not SP

---

## 9. Navigation consistency (post-Friday polish)

**Status:** ⏳ NOT STARTED
**Why:** Navigation chrome differs between pages and feels inconsistent. The swipe page has a text-link "← Back" in the top-left while the movie/tv detail pages have a clean floating round button. Also `/movie/[id]` and `/tv/[id]` don't render the `Navbar` at all — once a user is on a detail page they can't switch language, color vision mode, sign in, or get to their watchlist without going back first.
**Branch suggestion:** `chore/navigation-consistency`

### Steps

- [ ] **I1. Standardize the back button on `/swipe` to match the detail page style**
  - Current — `src/components/MovieSwiper.tsx:64–67`:
    ```tsx
    <div className="px-6 py-4">
      <Link href={`/${lang}`} className="text-sm text-fg-muted hover:text-fg ... inline-flex items-center gap-1">
        <IoArrowBack aria-hidden="true" /> {commonDict.back}
      </Link>
    </div>
    ```
  - Target — copy the pattern from `src/components/MovieDetail.tsx:57–65`:
    ```tsx
    <div className="fixed top-4 left-4 z-50">
      <Link href={`/${lang}`} className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-fg transition-colors bg-surface/80 backdrop-blur-md">
        <IoArrowBack size={20} aria-hidden="true" />
        <span className="sr-only">{commonDict.back}</span>
      </Link>
    </div>
    ```
  - RTL check: in `/ar` either keep top-left or flip to top-right consistently with the detail pages — pick whichever the detail page already does and match it

- [ ] **I2. Render Navbar on movie/tv detail pages**
  - `src/components/MovieDetail.tsx` currently doesn't render `<Navbar />` — the floating back button is the only chrome
  - Pages to update: `src/app/[lang]/movie/[id]/page.tsx` and `src/app/[lang]/tv/[id]/page.tsx`. Either inject `<Navbar />` in those pages, or have `MovieDetail` render it itself (the former is more flexible)
  - Props needed: `lang`, `dict.nav`, `dict.common`, `dict.a11y.colorMode`
  - **Design call:** keep the floating round back button on top of the navbar OR remove it now that the navbar provides a way home? Recommendation: **keep both** — the floating button is the primary affordance (positioned over the backdrop image so it pops), and the navbar adds general navigation. Two paths to home is not a bug, it's redundancy.
  - The navbar should sit at the very top, the backdrop pushes down below it. Verify the negative-margin layout (`-mt-[200px]` on the 3-column block) still looks good with a sticky navbar above.

### Tests
- Visual / manual — both items are layout polish, no behaviour tests

**Estimated SP:** 1

---

## 12. Tech-debt — consolidate rating storage (`WatchedItem.rating` vs `Rating.stars`)

**Status:** ⏳ NOT STARTED (post-Friday tech-debt cleanup)
**Why:** Surfaced while delivering US11 (§3). The schema currently has TWO places where the same user-rating-for-a-title can live:

- `WatchedItem.rating: Int?` — added by US8 (Dawid+Bernd) anticipating a "rate while marking as watched" flow
- `Rating { stars: Int }` — added by US-ratings (Christoph+Lucas) as a standalone model so users can rate from the detail page without marking as watched

Both have `@@unique([userId, tmdbId, mediaType])` and both can hold a non-null integer for the same row. Semantically they're the same fact ("user X gave title Z N stars") but no constraint enforces them to agree.

US11's `POST /api/watched` works around it by writing to BOTH inside a single Prisma transaction (`watchedItem.upsert` + `rating.upsert`). That keeps the two surfaces consistent today but the duplication itself is the smell.

`DELETE /api/watched` deliberately does NOT touch Rating — a user might want to keep their rating across an accidental mark-watched undo. That asymmetry is a clue the schema needs flattening.

### Steps (proposed)
- [ ] **L1. Pick the source of truth.** Most likely `Rating.stars` because it's the model already wired through `/api/rating` and the detail page RatingModal — touches less code.
- [ ] **L2. Migration.** Backfill existing `WatchedItem.rating` values into `Rating` (`UPSERT INTO Rating`), then drop `WatchedItem.rating` column.
- [ ] **L3. Update `POST /api/watched`** so it stops writing to `WatchedItem.rating` (transaction shrinks to 2 ops, or 1 if no rating provided).
- [ ] **L4. Update `/[lang]/watched/page.tsx`** to LEFT JOIN Rating per row when displaying the user's rating instead of reading `WatchedItem.rating`. Or fetch ratings in parallel and zip them on the server.
- [ ] **L5. Drop the now-dead WatchedItem.rating sync in DTO + types** (`WatchedItemDTO.rating` stays as a derived field, populated server-side from `Rating`).

### Risk
- Migration on Neon — backfill needs to run before column drop; can't be one `prisma db push`. Probably `prisma migrate dev` with a custom SQL step, or do it in two deploys (write to both → migrate → stop writing to old → drop).
- Existing rated rows on Vercel/staging need the backfill to not lose anyone's ratings.

**Estimated SP:** 3 (mostly the migration; the API/UI side is small)

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

4. ~~**Card hover icons — function or remove?**~~ — RESOLVED (see G4 above). Plus = add to watchlist; check = mark watched; trash on /watchlist, unmark on /watched. Play left decorative pending trailer decision.

5. **Guest swipe persistence — sessionStorage or skip?** (affects D1, D5)
   - Persist guest decisions in `sessionStorage`, bulk-POST on login when guest registers mid-session
   - OR don't persist for guests at all — they see results screen but decisions evaporate on refresh
   - First option = better UX but more code paths

---

# How to work this file

1. **Picking up a task:** find the section with `Status: NOT STARTED`, read the steps, create the branch named in the suggestion.
2. **Marking progress:** flip `[ ]` to `[x]` as substeps land. When a section is fully `[x]`, set the section's Status to `✅ DONE` and add a `Branch:` line pointing at the merged MR.
3. **Cleaning up:** once a section is fully DONE and merged, its body can be deleted — leave the row in the Status snapshot table at the top as the historical record. Numbering stays sparse (gaps where sections were removed) to avoid breaking cross-references.
4. **Updating the file:** if reality diverges from the plan (e.g. you took a different branch name, the file path moved), edit this doc. It's only useful if it's true.
5. **For AI agents:** before suggesting an implementation, **verify the Status line by checking git log / reading the referenced files**. Status lines drift faster than code does.
