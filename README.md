# Binge

Movie/series discovery app — like Tinder for films. Built with Next.js and the TMDb API.

## Setup

### 1. Clone the repo

```bash
git clone git@gitlab.tugraz.at:asd26-ss/team_01.git
cd team_01
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your TMDb API key

Create a `.env.local` file based on the template:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and replace `your_api_key_here` with your actual TMDb API key.
Get one for free at [themoviedb.org](https://www.themoviedb.org/settings/api) — takes about a minute.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
