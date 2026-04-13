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

## Key Notes

- Guest users can browse and swipe — no account required for core discovery
- Swipe decisions are stored and used to compute top matches
- Watchlist and watched-list features require a logged-in account
- Filters apply to both search and swipe session
