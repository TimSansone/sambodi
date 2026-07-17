# Stream Scout — Next.js Version

A professional Next.js App Router rebuild for Vercel.

## Features

- Top 100 popular shows
- Trending-this-week view
- Search
- Streaming-provider filters
- Separate show detail routes
- Full synopsis and show facts
- Next or latest episode
- Seasons and episode summaries
- Cast, trailer, recommendations
- U.S. streaming providers
- Browser-based watchlist
- Mobile navigation

## Deploy to Vercel

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Import the repository into Vercel.
4. Add the environment variable:

```text
TMDB_API_TOKEN=your TMDb API Read Access Token
```

5. Redeploy.

For local development, copy `.env.example` to `.env.local` and add your token, then run:

```bash
npm install
npm run dev
```

## Important

Do not use the previous plain-HTML `api/tmdb.js` file with this project. Next.js API routes live under `app/api`.
