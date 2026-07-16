# Stream Scout for Vercel

Stream Scout automatically loads the current Top 100 popular TV shows, weekly trending shows, and U.S. streaming-provider availability.

## Project structure

```text
stream-scout-vercel/
├── api/
│   └── tmdb.js
├── index.html
├── package.json
└── vercel.json
```

## TMDb setup

1. Create or sign in to a TMDb account.
2. Request API access in your TMDb account settings.
3. Copy the **API Read Access Token** (the long bearer token, not the short API key).

## Deploy on Vercel

1. Upload this project to a GitHub repository.
2. Import that repository into Vercel.
3. In Vercel, open **Project Settings → Environment Variables**.
4. Add:
   - Name: `TMDB_API_TOKEN`
   - Value: your TMDb API Read Access Token
   - Environments: Production, Preview, and Development
5. Redeploy the project.

Do not put the token in `index.html`, GitHub, or any browser-side JavaScript.

## Features

- Automatic Top 100 popular shows
- Weekly trending shows
- U.S. streaming subscription providers
- Provider-logo filters
- Search
- Follow/unfollow watchlist
- Mobile-first layout
- Local browser storage
- JustWatch attribution

## Notes

Provider availability comes from JustWatch through TMDb and can change. TMDb's provider API does not guarantee direct links to every streaming app.
