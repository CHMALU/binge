@AGENTS.md

# Binge — Project Overview

Movie/series discovery app — like Tinder for films. Data sourced from the **TMDb API**.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Data:** TMDb API
- **Auth:** TBD
- **Database:** TBD

## User Stories

| # | Feature | Story Points |
|---|---------|-------------|
| 1 | Browse without account (popular/new releases, no personalization) | 3 |
| 2 | Movie/series detail page (description, length, genre, rating, release year) | 5–8 |
| 3 | Search movies/series via TMDb endpoint + keyword matching | 3 |
| 4 | Filter searches (type, genre, mood, length, release year) | 5 |
| 5 | Swipe session — discover 10–15 titles based on filters | 8 |
| 6 | Swipe left (reject) / right (like) mechanic | 5 |
| 7 | Top 3–5 matches displayed after swipe session | 8 |
| 8 | User registration (email/phone), session persists after login | 3 |
| 9 | Add titles to watchlist (requires login, no duplicates) | 3 |
| 10 | View watchlist (title, cover, rating) | 3 |
| 11 | Mark titles as watched (moves from watchlist to watched) | 3 |

## Git Workflow

### Branches
- Every user story gets its own branch, named: `feature/us<N>-<short-description>` (e.g. `feature/us2-detail-page`)
- Branch off `main`, open a PR on GitLab when done
- **Do not delete branches after merge** (required for course evaluation)

### Commit prefixes (mandatory)
| Prefix | When to use |
|--------|-------------|
| `[red]` | Test-only commit — tests must fail without production code |
| `[green]` | Production code that makes the red tests pass |
| `[refactoring]` | Behavior-preserving cleanup |
| `[task]` | Config, tooling, setup (e.g. next.config, env, packages) |
| `[chore]` | Minor fixes — style issues, warnings |

### Pair credits
Add a trailer to each commit message listing the pair initials:
```
[green][AB,CD] Implement movie detail page
```

### Order within a PR
`[red]` → `[green]` → `[refactoring]` (optional)
Use `git rebase -i` to reorder commits if needed before opening a PR.

### Merging
- Merge via PR on GitLab — never push directly to `main`
- Do **not** squash merge — preserve individual commits

## Key Notes

- Guest users can browse and swipe — no account required for core discovery
- Swipe decisions are stored and used to compute top matches
- Watchlist and watched-list features require a logged-in account
- Filters apply to both search and swipe session

## Architecture

### Server vs Client components

Page routes (`app/[lang]/page.tsx`, `movie/[id]`, `tv/[id]`, `swipe`) are **Server Components** — they fetch data and pass it down as props. UI components with state or events are `"use client"` (Navbar, FilterBar, SearchBar, MovieSwiper, LanguageSwitcher).

`MovieCard` and `MovieDetail` are presentational — no state, no events — so they render server-side too.

### TMDb calls from the browser

`FilterBar` and `SearchBar` call `tmdb.ts` functions **directly from the browser** (not via API routes). This is intentional:
- `NEXT_PUBLIC_TMDB_API_KEY` is public by design — TMDb keys are rate-limited per IP, not secret
- Avoids server round-trip for interactive features (search, filter)
- Don't add an API route proxy — it adds latency and no real security benefit

### Caching / ISR

All `tmdbFetch` calls use `{ next: { revalidate: 3600 } }`. Home and swipe pages are pre-rendered at build time via `generateStaticParams` in `[lang]/layout.tsx`, then revalidated every hour in background (ISR). Movie/TV detail pages are dynamic (too many IDs to pre-render).

### No i18n library

Dictionaries are plain JSON loaded via dynamic `import()` in `dictionaries.ts` (server-only). No next-intl, no i18next — intentional to keep bundle small. Trade-off: no built-in formatters for dates/numbers, manual locale sync in LanguageSwitcher.

### Styling

CSS variables for all design tokens (`--bg`, `--gold`, `--crimson`, etc.) defined in `globals.css`. Tailwind for layout utilities only. Hover states use `onMouseEnter`/`onMouseLeave` inline handlers (not CSS pseudos) because inline `style` props with CSS vars don't support `:hover` in CSS.

### Swipe mechanic

`SwipeMechanism` exposes `swipeLeft()`/`swipeRight()` via `useImperativeHandle`. `MovieSwiper` calls these imperatively from button clicks. Framer Motion handles drag physics and exit animations. **Currently incomplete** — swipe results are logged but not persisted, "top matches" screen never triggers.

## Known Bugs

- **TV detail page** (`[lang]/tv/[id]/page.tsx`): `getTvDetails()` is called without the `lang` argument — TV detail pages are always in English regardless of locale. Fix: pass `lang` as second argument.
- **Swipe** (`MovieSwiper.tsx`): only loads 5 movies, no persistence of swipe decisions, no results screen.

## Team Assignments (Phase 1 & 2)

### Phase 1 — parallel

| Pair | US | Feature | Pts |
|------|----|---------|-----|
| Dawid + Bernd | US8 | Auth + DB setup ("create an account") — foundation for everything | 3 |
| Dawid + Bernd | US9 | Save titles to watchlist | 3 |
| Dawid + Bernd | US10 | View watchlist | 3 |
| Christoph + Lucas | US6-streaming | Streaming provider info on detail page — fully independent | 5 |
| Christoph + Lucas | US-ratings | Rate movies/series — **waits for DB from Dawid+Bernd** | 3 |

### Phase 2 — after Phase 1 DB is merged (pairs swap)

| Pair | US | Feature | Pts |
|------|----|---------|-----|
| Dawid + Lucas | US11 | Mark titles as watched | 3 |
| Dawid + Lucas | US-swipe-filter | Watched titles don't appear in swipe session | 5 |
| Bernd + Christoph | US7 | Recommendations based on swipes + ratings (= finishing swipe end-to-end) | 8 |

> Phase 2 implementation depends on Phase 1 DB being merged — don't start coding watchlist/swipe persistence before that lands.

## Planned (not yet started)

- **Auth** (US8): stack TBD — likely NextAuth.js or Lucia + DB session
- **Database** (US9–11): stack TBD — watchlist and watched list require persistent storage per user. Likely PostgreSQL (Vercel Postgres or Supabase) with an ORM (Prisma or Drizzle).
- When auth is added: Server Components on protected pages should read session via `cookies()` / `headers()` — this will make those routes dynamic (SSR), which is correct for personalized data.

## Implemented: Internationalization (i18n)

Branch: `feature/i18n-language-switcher` (pushed to GitLab + GitHub, pending MR to main)

### How it works

- **URL-based locale routing:** all routes are prefixed with locale — `/en`, `/pl`, `/ar`
- **`src/proxy.ts`** — Next.js 16 proxy (equivalent of middleware in older versions). Intercepts every request without a locale prefix and redirects to `/en` (or the locale from cookie). Export name must be `proxy`, not `middleware`.
- **`src/app/[lang]/`** — all pages live here. The `[lang]` segment is a dynamic route parameter carrying the locale.
- **Cookie `BINGE_LOCALE`** — set on language switch via `useEffect` in `LanguageSwitcher` (required by `react-hooks/immutability` rule), persists for 1 year (`max-age=31536000`). The proxy reads it on the next visit to restore the user's language.
- **Arabic RTL** — `src/app/[lang]/layout.tsx` injects an inline `<script>` that sets `document.documentElement.lang` and `document.documentElement.dir` synchronously before paint. No flicker.

### Adding a new language

1. Add a new JSON file to `src/app/dictionaries/<code>.json` (copy `en.json` as template)
2. Register it in `src/app/[lang]/dictionaries.ts` — add to the `dictionaries` object
3. Add to `LOCALES` array in both `src/proxy.ts` and `src/components/LanguageSwitcher.tsx`
4. If RTL, `src/app/[lang]/layout.tsx` already handles it — just add the locale code to the `isRtl` check
