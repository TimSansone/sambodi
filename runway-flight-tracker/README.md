# Runway — Vercel edition

Runway is a responsive US airport arrival and departure board. Vercel hosts both the static website and its secure live-flight function from one GitHub repository.

## Deploy the complete app

1. Create an account with [Aviationstack](https://aviationstack.com/) and copy your API key.
2. Upload this entire folder to a GitHub repository. Keep the `api` folder and `vercel.json` at the repository root.
3. Sign in to [Vercel](https://vercel.com/) and select **Add New → Project**.
4. Import the GitHub repository.
5. Leave **Framework Preset** set to **Other**. Leave the root directory as `./` and do not enter a build command.
6. Open **Environment Variables** before deploying and add:

   - Name: `AVIATIONSTACK_API_KEY`
   - Value: your private Aviationstack key
   - Environments: Production and Preview

7. Select **Deploy**.

Vercel provides a public address when deployment finishes. Future pushes to the main GitHub branch automatically update the production website; other branches receive preview addresses.

## Important security rule

The Aviationstack key belongs only in Vercel's Environment Variables. Never place it in `config.js`, another source file, or GitHub.

If the environment variable is added or changed after deployment, use **Deployments → Redeploy** so the new value is available to the function.

## Project structure

```text
api/
  flights.js       Private live-flight endpoint
app.js             Flight board behavior and airport data
config.js          Optional advanced API override
index.html         Website
styles.css         Responsive design
vercel.json        Vercel and security configuration
README.md          Setup instructions
```

No local Node.js installation, package installation, or build command is required.

## Airline logos and data behavior

Recognized carriers use current SVG brand marks from the Simple Icons package through jsDelivr. Unknown carriers automatically use readable airline-code badges. Marks belong to their respective owners.

Successful flight responses are cached at Vercel's edge for 60 seconds. If the flight provider or API key is unavailable, the interface clearly switches to demonstration data. Aviationstack plan limits and data latency apply.
