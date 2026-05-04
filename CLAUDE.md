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

## Implemented: Internationalization (i18n)

Branch: `refactor/cinema-design-system`

### How it works

- **URL-based locale routing:** all routes are prefixed with locale — `/en`, `/pl`, `/ar`
- **`src/proxy.ts`** — Next.js 16 proxy (equivalent of middleware in older versions). Intercepts every request without a locale prefix and redirects to `/en` (or the locale from cookie). Export name must be `proxy`, not `middleware`.
- **`src/app/[lang]/`** — all pages live here. The `[lang]` segment is a dynamic route parameter carrying the locale.
- **Cookie `BINGE_LOCALE`** — set on language switch, persists for 1 year (`max-age=31536000`). The proxy reads it on the next visit to restore the user's language.
- **Arabic RTL** — `src/app/[lang]/layout.tsx` injects an inline `<script>` that sets `document.documentElement.lang` and `document.documentElement.dir` synchronously before paint. No flicker.

### Files changed / created

| File | Role |
|------|------|
| `src/proxy.ts` | Locale redirect + cookie read |
| `src/app/[lang]/layout.tsx` | Nested layout — sets RTL via inline script |
| `src/app/[lang]/page.tsx` | Home page (replaces `app/page.tsx`) |
| `src/app/[lang]/movie/[id]/page.tsx` | Movie detail page |
| `src/app/[lang]/tv/[id]/page.tsx` | TV detail page |
| `src/app/[lang]/dictionaries.ts` | `getDictionary(locale)` — server-only |
| `src/app/dictionaries/en.json` | English strings |
| `src/app/dictionaries/pl.json` | Polish strings |
| `src/app/dictionaries/ar.json` | Arabic strings |
| `src/components/LanguageSwitcher.tsx` | Dropdown in Navbar — sets cookie + navigates |
| `src/components/Navbar.tsx` | Now accepts `lang` and `dict` props |
| `src/components/MovieCard.tsx` | Now accepts `lang?: string` (default `"en"`) — builds locale-prefixed hrefs |
| `src/components/MovieDetail.tsx` | Now accepts `lang` and `dict` — back button uses `/${lang}` |
| `src/components/FilterBar.tsx` | Now accepts `lang` and `dict` — passes `lang` to `MovieCard` |
| `src/app/page.tsx` | Fallback redirect to `/en` (proxy handles it normally) |

### Adding a new language

1. Add a new JSON file to `src/app/dictionaries/<code>.json` (copy `en.json` as template)
2. Register it in `src/app/[lang]/dictionaries.ts` — add to the `dictionaries` object
3. Add to `LOCALES` array in both `src/proxy.ts` and `src/components/LanguageSwitcher.tsx`
4. If RTL, `src/app/[lang]/layout.tsx` already handles it — just add the locale code to the `isRtl` check
