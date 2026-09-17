# NutriTrack — standalone version

Your own cloud-backed nutrition tracker: real login, real per-user database (Supabase), hosted for free on Netlify. AI features (photo scanning, the coach) call Anthropic's API through a serverless function using **your own API key**, which is never exposed to the browser.

## What you need before you start
- A free [Supabase](https://supabase.com) account
- A free [Netlify](https://netlify.com) account
- An [Anthropic API key](https://console.anthropic.com) with billing enabled (only needed if you want the AI features — photo scan, coach's "Ask real AI," plan-building conversation)

## 1. Set up Supabase (your database + login system)
1. Create a new project at supabase.com (pick any name/region, save the database password somewhere).
2. Once it's ready, go to **SQL Editor → New query**, paste the entire contents of `supabase-schema.sql` from this project, and click **Run**. This creates the one table the app needs, with row-level security so every user can only ever see their own data.
3. Go to **Project Settings → API**. You'll need two values from here in a minute: the **Project URL** and the **anon public** key.
4. Optional but recommended for a personal app: go to **Authentication → Providers → Email** and turn off "Confirm email" if you don't want to deal with confirmation emails for a small number of users (you and your friends). Leave it on if you'd rather have that extra step.

## 2. Get an Anthropic API key (only if you want AI features)
1. Go to console.anthropic.com, create an API key.
2. This is a **separate account/billing** from your regular Claude.ai subscription — it's pay-per-use. Photo scans and coach replies are small requests, but real usage does cost real (small) amounts of money. Keep an eye on usage in the console if you're sharing this with friends.

## 3. Push this code to GitHub
Netlify deploys from a GitHub repo. If you don't already have one:
```bash
cd nutritrack-web
git init
git add .
git commit -m "Initial commit"
```
Then create a new empty repo on GitHub and follow its instructions to push this folder to it.

## 4. Deploy to Netlify
1. On netlify.com, click **Add new site → Import an existing project**, and connect the GitHub repo you just made.
2. Netlify should auto-detect the build settings from `netlify.toml` (build command `npm run build`, publish directory `dist`, functions directory `netlify/functions`) — you shouldn't need to change anything there.
3. Before deploying, go to **Site configuration → Environment variables** and add:
   - `VITE_SUPABASE_URL` — from Supabase step 1.3
   - `VITE_SUPABASE_ANON_KEY` — from Supabase step 1.3
   - `ANTHROPIC_API_KEY` — from step 2 (this one stays server-side, only used by the Netlify function — never add a `VITE_` prefix to it, or it would end up visible in the browser)
4. Deploy. Netlify gives you a live URL (something like `yourapp.netlify.app`) — that's the link you send to friends.

## 5. Try it
Open the Netlify URL, sign up with an email and password, and you should land on the same app you've been using — except this time your data lives in your own Supabase database, not tied to any Claude account.

## Local development (optional)
```bash
npm install
cp .env.example .env   # fill in your real Supabase URL/anon key
npm run dev
```
Note: the Netlify function (and therefore AI features) won't work with plain `npm run dev` — that only runs locally with the [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`netlify dev` instead of `npm run dev`), which emulates the serverless function locally too.

## If something's not working
- **Blank page / console errors about Supabase URL** — you forgot to set the Netlify environment variables, or set them but didn't trigger a redeploy afterward (env var changes need a new deploy to take effect).
- **AI features fail with a config error** — `ANTHROPIC_API_KEY` isn't set, or was set with a `VITE_` prefix by mistake.
- **Signed-up friend sees "check your email" and nothing happens** — Supabase's confirmation email may be landing in spam, or "Confirm email" is turned on in a way that's slower than expected. You can also manually confirm a user from Supabase's dashboard under Authentication → Users.
