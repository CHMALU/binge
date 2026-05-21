@AGENTS.md

# Binge — Project Overview

Movie/series discovery app — like Tinder for films. Data sourced from the **TMDb API**.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Data:** TMDb API
- **Auth:** NextAuth.js v5 (Credentials + Google OAuth)
- **Database:** Neon PostgreSQL + Prisma v6 (driver adapter)

## Coding Principles

- Follow Clean Code: small focused functions, meaningful names, no magic values
- Prefer simple solutions over clever ones (XP: Simplicity)
- Do not add features, abstractions, or error handling beyond what is asked
- Do not create new files unless strictly necessary
- Read existing code before suggesting modifications
- Point out potential security issues (XSS, injection, exposed keys)

## Icons — NO text/Unicode emojis

- **Never use Unicode emoji or text-symbol glyphs as UI icons** — no `🎬`, `📺`, `★`, `☆`, `✕`, `▶`, `ℹ`, `→`, `●`, `⌘`, `+` etc. in buttons, badges, labels, anything user-facing.
- **Always import from `react-icons`** (already in `dependencies`). Default family is **Ionicons 5** (`react-icons/io5`) for consistency with `IoArrowBack`, `IoStar`, `IoFilm`, `IoTv`, `IoClose`, `IoPlay`, `IoAdd`, `IoInformationCircleOutline`, `IoArrowForward`, `IoEllipse`, `IoStarOutline`. Use Lucide (`react-icons/lu`) only when io5 has no equivalent (e.g. `LuCommand` for the ⌘ key).
- Decorative icons: pass `aria-hidden="true"`. Icon-only buttons: add an `aria-label`.
- Tests must query icon+text buttons by **role + accessible name** (`screen.getByRole("button", { name: /Movies/ })`), not by emoji string.

## Test-First Approach

- **Always write a `[red]` commit before `[green]`** — tests must fail without production code
- Before implementing a feature ask: what are the acceptance criteria and how do we test them?
- Suggest test cases for edge cases and acceptance criteria from user stories
- Do not skip tests or mark them as "to be done later"

## What NOT to Do

- Do not generate large amounts of boilerplate without being asked
- Do not rewrite code that wasn't asked to be changed
- Do not suggest architectural changes mid-feature
- Do not add comments to code that is already self-explanatory
- **Do not use Unicode emojis or text-symbol glyphs as UI icons** — always `react-icons` (see "Icons" section above)

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

### Styling — 2-layer color system

All design tokens live in `globals.css` inside a single `@theme inline` block. Two layers:

**Layer 1 — primitives** (scale-based, answer "what color is this?"):
- `neutral-50..950` (cool-tinted dark scale, with custom `neutral-850` step for cards)
- `gold-50..900` (brand primary, full scale)
- `crimson-400/500/600` (brand secondary, 3 shades)
- `--color-success`, `--color-success-hover`, `--color-danger` (status, single values)

**Layer 2 — semantic aliases** (role-based, answer "what is this for?"):
- Surfaces: `surface`, `surface-raised`, `surface-card`, `surface-hover`
- Foreground: `fg`, `fg-muted`, `fg-subtle`
- Borders: `border`, `border-strong`
- Action (gold CTA): `action`, `action-hover`, `action-fg`
- Accent (crimson featured): `accent`, `accent-hover`

**Usage rule:** ~90% semantic aliases (`bg-surface-card`, `text-fg-muted`, `bg-action`), primitives only when semantic doesn't fit (decorative gold text → `text-gold-400`, decorative bar → `bg-gold-400`). Status colors (`bg-success`, `bg-danger`) bypass action/accent because they signal intent, not brand.

Hover states use `onMouseEnter`/`onMouseLeave` inline handlers when conditional; otherwise `hover:bg-surface-card`-style Tailwind utilities. Dynamic colors in `style={{}}` use `var(--color-X)` directly (e.g. `var(--color-action)`).

### Swipe mechanic

`SwipeMechanism` exposes `swipeLeft()`/`swipeRight()` via `useImperativeHandle`. `MovieSwiper` calls these imperatively from button clicks. Framer Motion handles drag physics and exit animations. **Currently incomplete** — swipe results are logged but not persisted, "top matches" screen never triggers.

## Known Bugs

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

## Implemented: Auth + Database (US8)
<<<<<<< Updated upstream

Branch: `feature/us8-auth-db` (ready for MR)

### Stack
- **Neon PostgreSQL** (Frankfurt) — `DATABASE_URL` (pooler) + `DATABASE_URL_UNPOOLED` (direct, for migrations)
- **Prisma v6** with `@prisma/adapter-neon` — schema in `prisma/schema.prisma`, client generated to `src/generated/prisma/` (gitignored)
- **NextAuth v5** — JWT strategy, Credentials (email+password) + Google OAuth (keys TODO)

### Key files
- `prisma/schema.prisma` — models: User, Account, Session, VerificationToken, WatchlistItem, WatchedItem
- `prisma.config.ts` — reads from `.env.local`, uses unpooled URL for `db push`
- `src/lib/prisma.ts` — PrismaClient singleton with Neon adapter
- `src/auth.ts` — NextAuth config (providers, JWT callbacks that expose `session.user.id`)
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `src/app/api/auth/register/route.ts` — POST endpoint for registration (bcrypt, 409 on duplicate)
- `src/components/auth/` — LoginForm, RegisterForm, AuthModal (intercepting route modal)
- `src/components/SessionProvider.tsx` — wraps app with NextAuth SessionProvider

### Schema notes
- Titles (name, poster) are NOT stored in DB — always fetched from TMDb by `tmdbId`
- `WatchlistItem` and `WatchedItem` have `@@unique([userId, tmdbId, mediaType])` — no duplicates
- `WatchedItem.rating` is nullable — rated after watching

### TODO before deploy
- Google OAuth: add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` to `.env.local` and Vercel. Redirect URI: `http://localhost:3000/api/auth/callback/google`
=======

Branch: `feature/us8-auth-db` (ready for MR)

### Stack
- **Neon PostgreSQL** (Frankfurt) — `DATABASE_URL` (pooler) + `DATABASE_URL_UNPOOLED` (direct, for migrations)
- **Prisma v6** with `@prisma/adapter-neon` — schema in `prisma/schema.prisma`, client generated to `src/generated/prisma/` (gitignored)
- **NextAuth v5** — JWT strategy, Credentials (email+password) + Google OAuth (keys TODO)

### Key files
- `prisma/schema.prisma` — models: User, Account, Session, VerificationToken, WatchlistItem, WatchedItem
- `prisma.config.ts` — reads from `.env.local`, uses unpooled URL for `db push`
- `src/lib/prisma.ts` — PrismaClient singleton with Neon adapter
- `src/auth.ts` — NextAuth config (providers, JWT callbacks that expose `session.user.id`)
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `src/app/api/auth/register/route.ts` — POST endpoint for registration (bcrypt, 409 on duplicate)

### Schema notes
- Titles (name, poster) are NOT stored in DB — always fetched from TMDb by `tmdbId`
- `WatchlistItem` and `WatchedItem` have `@@unique([userId, tmdbId, mediaType])` — no duplicates
- `WatchedItem.rating` is nullable — rated after watching

### TODO before deploy
- Google OAuth: add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` to `.env.local` and Vercel. Redirect URI: `http://localhost:3000/api/auth/callback/google`

## Planned (not yet started)

- When auth is added: Server Components on protected pages should read session via `auth()` from `src/auth.ts` — this will make those routes dynamic (SSR), which is correct for personalized data.
>>>>>>> Stashed changes

## Implemented: Internationalization (i18n)

Branch: `feature/i18n-language-switcher` (merged to main)

### How it works

- **URL-based locale routing:** all routes are prefixed with locale — `/en`, `/pl`, `/ar`
- **`src/proxy.ts`** — Next.js 16 proxy (equivalent of middleware in older versions). Intercepts every request without a locale prefix and redirects to `/en` (or the locale from cookie). Export name must be `proxy`, not `middleware`.
- **`src/app/[lang]/`** — all pages live here. The `[lang]` segment is a dynamic route parameter carrying the locale.
- **Cookie `BINGE_LOCALE`** — set on language switch via `useEffect` in `LanguageSwitcher`, persists for 1 year (`max-age=31536000`). The proxy reads it on the next visit to restore the user's language.
- **Arabic RTL** — `src/app/[lang]/layout.tsx` injects an inline `<script>` that sets `document.documentElement.lang` and `document.documentElement.dir` synchronously before paint. No flicker.

### Adding a new language

1. Add a new JSON file to `src/app/dictionaries/<code>.json` (copy `en.json` as template)
2. Register it in `src/app/[lang]/dictionaries.ts` — add to the `dictionaries` object
3. Add to `LOCALES` array in both `src/proxy.ts` and `src/components/LanguageSwitcher.tsx`
4. If RTL, `src/app/[lang]/layout.tsx` already handles it — just add the locale code to the `isRtl` check
