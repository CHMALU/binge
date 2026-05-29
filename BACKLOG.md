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
| §6 — Navbar cleanup | ✅ DONE (PR pending) | `feature/ui-redesign-visual` | Dead Movies/Series tabs removed; Sign-in merged into one `IoLogIn` target; logged-out avatar dropped; SwipeFab floating gold CTA (collapses to circle on scroll). |
| §7 — Hero trailer + dead buttons | ✅ DONE (PR pending) | `feature/ui-redesign-visual` | `getTrailerKey()` from TMDb `/videos` (en-US fallback for AR); `HeroTrailer` YouTube lightbox (Esc/overlay/close, button hidden when no trailer); "See all" rails → quiet `{n} titles` counter. |
| §9 — Navigation consistency | ✅ DONE (PR pending) | `feature/ui-redesign-visual` | Shared `BackButton` (logical `start-6`, `rtl:scale-x-[-1]`); detail pages now render `Navbar` (back button drops to `top-20`); swipe is immersive (no navbar, floating back at `top-6`). |
| Detail action-panel redesign | ✅ DONE (PR pending) | `feature/ui-redesign-visual` | One gold CTA (Add to watchlist), Mark-watched = secondary, IMDb/Official → tertiary ghost links; provider logos w92→w185 + 4-col grid + "+N"; `DetailActions` wrapper coordinates watchlist↔watched (hides watchlist once watched, mirrors home cards). |

**Not done yet:** US7 (recommendations — Christoph, in progress), US-swipe-filter (watched filtering — Lucas, §5), demo video (§8), rating-storage consolidation (§12 tech-debt), two new polish ideas (§13 rating-once, §14 card play+trailer).

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

## 6. Navbar cleanup — ✅ DONE on `feature/ui-redesign-visual` (PR pending)

Dead Movies/Series tabs removed (F2); logged-out "Sign in" + duplicate avatar merged into one `IoLogIn` link (F1); logged-out avatar dropped. Discover/Swipe CTA (F3) resolved as a floating gold `SwipeFab` (`src/components/SwipeFab.tsx`) that collapses to a circle on scroll. Also removed the logged-in watchlist eye-icon — it clashed with the colour-vision eye; watchlist lives in the avatar dropdown.

---

## 7. Hero & cards — dead buttons — ✅ DONE on `feature/ui-redesign-visual` (PR pending)

- **G1** (swipe CTA): delivered as the floating `SwipeFab` (see §6).
- **G2** (Watch Trailer): chose the **embed** path. `getTrailerKey()` in `src/lib/tmdb.ts` pulls the best YouTube trailer from `/{type}/{id}/videos` (with en-US fallback so AR still gets a trailer). New `src/components/HeroTrailer.tsx` opens a 16:9 YouTube lightbox (Esc / overlay / close); the button is **hidden when the title has no trailer** (no dead-end empty state needed).
- **G3** ("See all"): removed — rail headers now show a quiet `{n} titles` counter (`dict.sections.titles`) instead of the dead `href="#"`.
- **G4** (card hover icons): already done earlier on `feature/us11-mark-watched`.

> Note: card play icon is still decorative — wiring it to the trailer is the new §14 idea below (now feasible since we already fetch trailers).

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

## 9. Navigation consistency — ✅ DONE on `feature/ui-redesign-visual` (PR pending)

- **I1:** swipe back button replaced by the shared `src/components/BackButton.tsx` (floating round, 44px, blur, logical `start-6`, `rtl:scale-x-[-1]` so the arrow mirrors in `/ar`). Same component now used by `MovieDetail`.
- **I2:** `Navbar` now rendered on `/movie/[id]` and `/tv/[id]`. Because the navbar is sticky, the detail back button uses `belowNav` (`top-20`) to clear it; both paths-to-home kept by design. The swipe page is intentionally **immersive** (no navbar — the floating back at `top-6` is the only chrome), matching the focused-session feel.

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

## 13. Rate-once UX — collapse "Rate this Movie" after rating (quick polish, grab if bored)

**Status:** ⏳ NOT STARTED — easy morning task
**Why:** On the detail page you can hit "Rate this Movie" and submit a rating infinitely; nothing reflects that you already rated it. After rating, the button should disappear and be replaced by a read-out like "Your rating: ★★★★☆" (with an edit/change affordance optional).
**Branch suggestion:** `feature/rate-once`

### Steps
- [ ] On the detail page (`src/components/MovieDetail.tsx` rating box + `src/components/RatingModal.tsx`), fetch the user's existing rating for this title (extend the server fetch in `movie/[id]`/`tv/[id]` pages — they already read watchlist/watched; add the `Rating` row).
- [ ] If a rating exists: render "Your rating: N★" instead of the "Rate this Movie" trigger. Optionally a small "Change" link reopens the modal.
- [ ] After a successful submit in `RatingModal`, flip local state to the read-out (no full reload needed) so it collapses immediately.
- [ ] Keep guest behaviour as-is (sign-in link).

### Tests (TDD)
- [ ] Title with an existing rating → renders "Your rating" read-out, no "Rate this Movie" trigger.
- [ ] After submitting a rating → trigger is replaced by the read-out without reload.

**Estimated SP:** 2

---

## 14. Card play button → wire to trailer (quick polish, grab if bored)

**Status:** ⏳ NOT STARTED — feasible now that trailers are fetched (see §7 G2)
**Why:** The movie tiles still have a decorative play icon. Now that `getTrailerKey()` exists, bring the play button back, lay it out cleanly, and make it actually open the trailer.
**Branch suggestion:** `feature/card-trailer`

### Steps
- [ ] In the card hover actions (`src/components/CardActions.tsx` / `MovieCard.tsx`), put the **play button on the left** and move the save/watched icons to the **right**.
- [ ] Wire the play button to the trailer: reuse `getTrailerKey()` + the `HeroTrailer` lightbox pattern (`src/components/HeroTrailer.tsx`). Fetching per-card on the server rail is expensive — prefer lazy: fetch the trailer key on click (client) or hide the play button when no trailer (consistent with the hero rule).
- [ ] If no trailer for that title → don't show the play button (same rule as the hero).

### Tests (TDD)
- [ ] Card with a trailer → play button opens the lightbox with the right YouTube key.
- [ ] Card without a trailer → no play button rendered.

**Estimated SP:** 3

---

# Open Questions — block coding, need product/design decision

1. ~~**Discover/Swipe CTA placement**~~ — RESOLVED: option (b) floating action button (`SwipeFab`).

2. ~~**Trailer button — embed or kill?**~~ — RESOLVED: embed (YouTube lightbox via `HeroTrailer`); button hidden when no trailer exists.

3. ~~**"See all" buttons — filter page or remove?**~~ — RESOLVED: removed, replaced by a `{n} titles` counter on rail headers.

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
