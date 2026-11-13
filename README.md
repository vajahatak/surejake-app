# SureJake App

Working demo of the SureJake creator monetization app, built from the SJ Component Library and the UI Screens page in Figma (flows 01 to 13).

Live: https://vajahatak.github.io/surejake-app/

## Demo accounts

- **Jill Park** (fan): 1,820 J Coin to start.
- **Sam Delgado** (creator): Platinum, Fitness.

On desktop the controls sit next to the phone. On a phone, tap **DEMO** at the top to switch between Jill and Sam or reset the data.

## How it is built

- React + Vite. Styles in `src/styles.css` use the SJ Foundations tokens (colors, type, spacing, shadows) pulled from Figma.
- Screens live in `src/screens/`, one file per area: Onboarding (01 to 03), Fan (08, 09, 10.5 to 10.7, messages), Profile (04, 10, 12 brand), Wallet (11), Post (05), Radar (06), Tools (07, 13, 12.1).
- Data: Supabase (`supabase/migrations`). If the database cannot be reached the app falls back to the same data saved in the browser, so the demo always works.
- Payments are J Coin only and no card is charged. Phone codes are fake: any six digits work.

## Run locally

```
npm install
npm run dev
```

## Adding a flow

1. Add a screen component in `src/screens/`.
2. Add its route in `src/App.jsx`.
3. If it needs new data, add a table or function in a new file under `supabase/migrations/`, and the same logic in `src/data/store.js` for the in-browser fallback.

Pushing to `main` deploys automatically to GitHub Pages.
