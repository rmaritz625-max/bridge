# Bridge — Superyacht Crew Operations Platform

## Project Overview
Single-file React JSX app for M/Y Tiberius crew operations.
Built by Reuben Maritz (Captain) with Claude.

## Tech Stack
- React 18 + Vite (no TypeScript)
- lucide-react@0.383.0 for icons
- SheetJS (xlsx) for spreadsheet export
- Claude API (claude-sonnet-4-6) for AI features
- Open-Meteo for weather data
- Netlify for hosting

## Key Files
- `src/bridge.jsx` — the entire app (~14,000 lines, single file)
- `index.html` — entry point
- `netlify.toml` — deployment config

## Architecture
Single-file artifact — all components, state, and logic in bridge.jsx.
No build step was used historically (ran as Claude artifact).
Now migrated to Vite for proper deployment.

## Colour Theme (GCY Light)
- Background: #f4f8fd
- Navy: #16315f
- Azure accent: #2f6fd0
- Gold: #e8c84a
- White cards with navy panels

## Vessel
M/Y Tiberius — 28m Motor Yacht, Dubai Marina
Captain: Reuben Maritz

## Crew
- Reuben Maritz — Captain (c1)
- Eoin Daly — Chief Engineer (c2)
- Anastasia Volkov — Chief Stewardess (c3)
- Luke Barnard — Deckhand (c4)
- Marco Bianchi — Head Chef (c5)

## API Keys needed (add to .env)
VITE_ANTHROPIC_API_KEY=your_key_here

## Commands
```bash
npm install        # install dependencies
npm run dev        # local dev server on port 3000
npm run build      # production build to /dist
netlify deploy --prod --dir=dist   # deploy to Netlify
```

## Known Issues to Fix
- Calendar module has a structural JSX error (orphaned code after saveProfile)
- Print/PDF export requires live deployment (blocked in dev sandboxes)
- Auth system not yet implemented (uses role switcher for testing)

## Deferred to Launch
- OneSignal push notifications
- PWA service worker
- Supabase auth (crew invite links)
- Onboarding tutorial
