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
| Color-blindness a11y (toggle + default signals) | ✅ DONE | `feature/a11y-colorblind` | Merged into `main` (commit `b26e36e`) |
| Watchlist DELETE / toggle / remove | ✅ DONE | `feature/watchlist-remove` | DELETE endpoint + WatchlistButton toggle + floating trash on `/watchlist` |
| RatingModal guest redirect (§10) | ✅ DONE | `chore/rating-guest-redirect` | Guests see "Sign in to rate" Link instead of 401 dead-end |

**Not done yet:** US7 (recommendations), US11 (mark as watched), US-swipe-filter (watched filtering), polish (Navbar cleanup, hero/cards dead buttons, navigation consistency), swipe page locale fetch (§11), demo video.

---

# Pending work

Sections are roughly ordered by **deadline urgency × user value**. The first three (color-blindness, watchlist-remove, US11) are the realistic pre-Friday candidates. US7 is the biggest remaining feature and likely slips to post-Friday polish since it's 8 SP and needs design work.

---

## 1. Color-blindness accessibility — AWAITING REVIEW

**Status:** ⚠️ AWAITING VISUAL REVIEW (branch pushed, **MR not yet opened**)
**Branch:** `feature/a11y-colorblind` (12 commits, 2026-05-27)
**Why:** PO mail 2026-05-26 — *"could be the feature that decides the investment"*. Hard deadline Friday.
**Approach taken:** both a palette-swap toggle (4 modes) AND default-accessible redundant signals (text labels, status icons, borders, fg tokens for icons). The toggle is the demo-visible feature; the default signals work even for users who never toggle.

### Before opening the MR (manual review required)
- [ ] Run `npm run dev` and click through every page **in each of the 4 modes** (Default / Red-green safe / Blue-yellow safe / High contrast). Toggle lives next to the language switcher in the navbar (eye icon).
- [ ] In Chrome DevTools → Rendering → **Emulate vision deficiencies**, set deuteranopia and verify the swipe Like/Skip buttons stay distinguishable in *Red-green safe* mode (this is the headline test)
- [ ] Same for tritanopia + *Blue-yellow safe* mode
- [ ] **High-contrast mode special check:** swipe Like/Skip icons must be visible (black on white / black on gray); MovieCard borders must be visible (white outline); all chrome elements should pop as plain B&W
- [ ] Sanity-check Arabic RTL — both switchers should render correctly in `/ar`
- [ ] Test mobile breakpoint — the navbar now has two icon buttons (color vision + language); verify no wrap/overflow
- [ ] Tweak palette overrides in `src/app/globals.css` `:root[data-cv-mode="..."]` if anything looks bad
- [x] ~~Verify form validation error contrast~~ — moot: login/register errors render via `toast.error()`, no inline red text exists. Collapsed into A3 check below.
- [x] Verify toast contrast on `bg-surface-card` per mode — Toaster uses `bg-surface-card` + `text-fg` → ~17:1 in default, ~19:1 in high-contrast. Icons stay ≥ 3:1 across all modes. Info also redundantly encoded in toast string.
- [ ] **⚠️ FINAL: Chrome DevTools → Rendering → Emulate vision deficiencies before clicking Merge in GitLab** — deuteranopia + Red-green safe, tritanopia + Blue-yellow safe, achromatopsia + High contrast
- [ ] Open MR with manual test plan pasted in the description

### What's already on the branch
- [x] `ColorVisionSwitcher` component + 5 TDD tests, toggle wired into the navbar (eye icon)
- [x] Persistence via `localStorage` under `BINGE_CV_MODE`
- [x] Pre-paint inline `<script>` in root `app/layout.tsx` so the saved palette applies before first paint (no flicker on reload)
- [x] Three CB-safe palette overrides in `globals.css`:
  - **Red-green safe:** Okabe-Ito blue/orange + cyan gold (deuteranopia + protanopia)
  - **Blue-yellow safe:** teal/magenta + coral gold (tritanopia)
  - **High contrast:** full grayscale, pure black bg + white fg (achromatopsia)
- [x] Switched `@theme inline` → `@theme` in `globals.css` — Tailwind utilities now compile to `var()` references instead of inlined literals, which is what makes `:root[data-cv-mode]` overrides actually work for `bg-success` / `bg-action` etc.
- [x] **A1.** Swipe Like/Skip text labels under buttons (+ `aria-label`) — TDD'd with 1 test
- [x] **A2.** `IoEllipse` status dot next to "Returning Series" — shape signal complements color
- [x] **A5.** Swipe button glow + ambient blurs use `color-mix(var(...))` instead of hardcoded RGB → they shift with the palette
- [x] New `--color-success-fg` / `--color-danger-fg` tokens (default white, black in high-contrast) → swipe icons stay visible on the now-white Like button in high-contrast
- [x] `MovieCard` got `border border-border` → cards stay visible against dark surface in high-contrast (matches the bright separator lines that already used border-border)
- [x] Dict keys `dict.a11y.colorMode.*` in EN/PL/AR
- [x] Toast colors auto-shift (Toaster already uses `var(--color-success/danger)`)
- [x] **RatingModal** status messages: discovered inline `color-danger`/`color-success` on text dropped to ~2.7:1 (red-green safe) / ~4.0:1 (blue-yellow safe) — below WCAG AA 4.5:1. Switched text to `text-fg`, prefixed with `IoCheckmarkCircle`/`IoCloseCircle` so the icon carries the semantic color (commit `e03e26f`).

### Stack at end of branch
74/74 tests passing, lint clean, typecheck clean, `npm run build` clean.

### Deferred / explicitly NOT done yet
- [x] **A3. Toast contrast WCAG verification** — measured. Toast bg `surface-card` + text `fg` → ~17:1 default, ~19:1 high-contrast. Worst icon contrast is ~2.9:1 (red-green safe success) but icon is non-text (3:1 threshold) and toast text always describes the action so meaning isn't lost.
- [x] **A4. Form validation error contrast** — N/A: no inline red text exists. Auth forms render errors via `toast.error()` (covered by A3). RatingModal had the only inline color-on-text instance and is now fixed (see "What's already on the branch" above).

**Estimated SP:** 3 (delivered as planned, plus extra polish: palette toggle wasn't in original scope)

---

## 2. Watchlist completion — DELETE / toggle / remove (pre-Friday)

**Status:** ✅ DONE
**Branch:** `feature/watchlist-remove`
**Why:** Builds on US9 + US10 (already on `main`). PO explicitly asked for the ability to remove. Without DELETE the watchlist is one-way and the "In watchlist" button has no toggle behaviour.

### Steps
- [x] **B1. `DELETE /api/watchlist` endpoint**
  - Added to `src/app/api/watchlist/route.ts` alongside existing GET + POST
  - Body: `{ tmdbId: number, mediaType: "movie" | "tv" }`
  - 401 / 400 / 404 (Prisma P2025) / 200 on success
  - Uses `prisma.watchlistItem.delete({ where: { userId_tmdbId_mediaType: {...} } })`
- [x] **B2. Extended the shared type contract**
  - `DeleteWatchlistRequest` + `DeleteWatchlistResponse` in `src/types/watchlist.ts`
- [x] **B3. `WatchlistButton.tsx` becomes a toggle**
  - "In watchlist" button is now enabled; click sends DELETE, optimistic flip + rollback on error
  - State machine: `idle ↔ loading ↔ idle` (in opposite state) — implemented
  - On DELETE error: rollback state + `toast.error(removeError)`
- [x] **B4. Remove button on each `/watchlist` page item**
  - New `src/components/RemoveFromWatchlistButton.tsx` (client component)
  - Floating `IoTrash` top-right of each poster (`absolute top-2 end-2`, RTL-friendly)
  - DELETE → `router.refresh()` (server component re-fetches the list)
  - Rendered inside a `relative` wrapper next to each MovieCard
- [x] **B5. Toasts**
  - Success toasts on add AND on remove via `react-hot-toast`
  - New dict keys (EN/PL/AR): `remove`, `addedToast`, `removedToast`, `removeError`

### Tests (TDD — `[red]` first, then `[green]`)
- [x] DELETE: 401 / 400 invalid JSON / 400 invalid body / 400 missing field / 404 P2025 / 200 success + composite-key call
- [x] Toggle: rendering `WatchlistButton` in "in watchlist" state is enabled; click → DELETE + flips visual state
- [x] DELETE failure rolls back state + error toast (WatchlistButton)
- [x] `RemoveFromWatchlistButton`: aria-label / DELETE body / success path (toast + router.refresh) / error path (toast, no refresh)
- [x] Toast appears on successful add (`addedToast`) and successful remove (`removedToast`)

### Stack at end of branch
86/86 tests passing (15 watchlist route + 7 WatchlistButton + 4 RemoveFromWatchlistButton + 5 watchlist page + the rest of the suite). Lint clean, typecheck clean, `npm run build` clean.

**Estimated SP:** 3 (delivered)

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
  - Props needed: `lang`, `dict.nav`, `dict.common`, and once `feature/a11y-colorblind` is merged also `dict.a11y.colorMode`
  - **Design call:** keep the floating round back button on top of the navbar OR remove it now that the navbar provides a way home? Recommendation: **keep both** — the floating button is the primary affordance (positioned over the backdrop image so it pops), and the navbar adds general navigation. Two paths to home is not a bug, it's redundancy.
  - The navbar should sit at the very top, the backdrop pushes down below it. Verify the negative-margin layout (`-mt-[200px]` on the 3-column block) still looks good with a sticky navbar above.

### Tests
- Visual / manual — both items are layout polish, no behaviour tests

**Estimated SP:** 1

---

## 10. RatingModal — guest users get a dead-end error instead of redirect

**Status:** ✅ DONE
**Branch:** `chore/rating-guest-redirect`
**Why:** Bug spotted 2026-05-28. Guest clicks "Rate Movie" → modal opens → picks stars → submits → `POST /api/rating` returns 401 with `"Not authenticated. Please log in to submit a rating."` (`src/app/api/rating/route.ts:24`) → RatingModal renders the message as text and stops. User has to manually navigate to `/login` afterwards. Bad UX: same shape as WatchlistButton's old behaviour before US9 fixed it.

### Steps
- [x] **J1. Pass `isAuthed` prop into `RatingModal`** — mirror `WatchlistButton` pattern
  - `src/components/RatingModal.tsx` now accepts `isAuthed: boolean` and `lang: string`
  - `src/components/MovieDetail.tsx` passes `isAuthed ?? false` and `lang` through (line ~214)
- [x] **J2. Render a "Sign in to rate" link when guest**
  - When `!isAuthed`: early return a `<Link href={\`/${lang}/login\`}>` with `IoStar` + `dict.signInToRate`, styled like the rating trigger
  - Same UX pattern as `WatchlistButton.tsx:39-49`
- [x] **J3. 401 handling in submitRating left as a fallback**
  - Guests no longer reach the submit step, so the `data.error` branch in `submitRating` only fires on genuine server errors — stays as a defensive fallback
- [x] **J4. Dict key `signInToRate`** added to `detail` block in EN/PL/AR

### Tests (TDD)
- [x] Rendering `RatingModal` with `isAuthed={false}` → shows a `<Link>` with the new dict text, no rating button visible
- [x] Rendering with `isAuthed={false}` + `lang="ar"` → link href is `/ar/login` (locale-aware regression guard)
- [x] Rendering with `isAuthed={true}` → existing button + modal behaviour unchanged (regression guard against breaking authed flow)
- [x] Existing 2 RatingModal tests still pass (don't break the modal contract)

**Estimated SP:** 1 (delivered)

---

## 11. Swipe page ignores locale when fetching TMDb data

**Status:** ⏳ NOT STARTED
**Why:** Bug spotted 2026-05-28. On the home page (`/[lang]`), the `lang` URL segment is passed through to TMDb so posters/titles/overviews come back localized (e.g. `/pl` → Polish strings). On the swipe page, the same fetches are called **without** the locale, so the deck always shows English data even when the surrounding UI is Polish or Arabic. Inconsistent with the rest of the app and visible to anyone testing in `/pl` or `/ar` (which is the demo locale per the Wed 2026-06-03 deliverable — see hard deadlines).
**Branch suggestion:** `chore/swipe-locale-fetch`

### Root cause

`src/app/[lang]/swipe/page.tsx:17-18`:
```ts
const [moviesData, seriesData] = await Promise.all([
  getPopularMovies(),
  getPopularSeries(),
]);
```
No `lang` passed. Compare with the home page (`src/app/[lang]/page.tsx:27-28`):
```ts
getPopularMovies(lang),
getPopularSeries(lang),
```
The `tmdb.ts` helpers (`src/lib/tmdb.ts:137-142`) already accept an optional locale (`tmdbFetch<...>("/movie/popular", { language: tmdbLang(locale) })`) — they just default to `en-US` when the arg is missing.

### Steps
- [ ] **K1.** Pass `lang` into `getPopularMovies` / `getPopularSeries` on `src/app/[lang]/swipe/page.tsx`. Two-line change.
- [ ] **K2.** Verify whether any *other* call into `tmdb.ts` in the swipe path also drops locale — e.g. if US7 (recommendations) ships later it must do the same. Grep `getPopular`, `getNowPlaying`, `getOnAir`, `tmdbFetch` under `src/app/[lang]/swipe/` and any swipe-related lib helpers.
- [ ] **K3.** Manually verify in `/pl/swipe` and `/ar/swipe` that overview/title strings come back in the target locale (TMDb falls back to English for titles where no localized version exists — that's expected, not a bug).

### Tests
- [ ] Server-component-style test: render the swipe page with `lang="pl"`, mock `getPopularMovies` / `getPopularSeries`, assert each was called with `"pl"`. Mirror the pattern in `src/app/[lang]/watchlist/page.test.tsx:140-141` (`toHaveBeenCalledWith(27205, "en")` etc.).

### Notes
- This is independent of US7 (recommendations) — even with the current 5-hardcoded-movies deck, the items shown should respect locale.
- `MovieSwiper.tsx` itself is a client component and doesn't fetch — it only renders what the server page passes in, so no change needed there.

**Estimated SP:** 1

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
