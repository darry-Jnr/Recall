# Recall — Project Summary

## What is Recall?

Recall is a **local-first browser history search tool**. It consists of two parts:
1. A **Chrome/Firefox extension** that captures every page you visit (metadata only, no content scraping)
2. A **Next.js web app** where you search your browsing history using natural language powered by Groq AI

**No cloud databases. No Supabase. No Firebase. All data stays on your PC.**

---

## Architecture

```
Recall/
├── extension/                  # Chrome/Firefox extension (Manifest V3)
│   ├── manifest.json          # Extension config, permissions, content script injection
│   ├── background.js          # Service worker: captures pages on tab navigation
│   ├── content.js             # Bridge: relays postMessage between web app ↔ extension
│   ├── popup.html/css/js      # Minimal popup showing page count
│   └── icons/                 # Extension icons (placeholder, needs real PNGs)
│
└── web/                        # Next.js 16 app
    └── src/
        ├── app/
        │   ├── layout.tsx         # Root layout (Sora + Inter fonts, dark theme)
        │   ├── page.tsx           # Landing page (/)
        │   ├── globals.css        # Tailwind v4 theme (dark canvas, blue accent)
        │   ├── search/
        │   │   └── page.tsx       # Main search page (/search)
        │   └── api/
        │       └── groq-search/
        │           └── route.ts   # POST /api/groq-search — sends candidates to Groq
        ├── components/
        │   ├── landing/           # Navbar, Hero, Footer, Landing
        │   └── search/
        │       ├── ExtensionBridge.tsx  # Two-phase extension detection + data bridge
        │       ├── SearchBar.tsx        # Google-like search input
        │       └── SearchResults.tsx    # Result cards with relevance scores
        └── lib/
            ├── types.ts           # Shared TypeScript types (PageVisit, GroqSearchResult, etc.)
            └── groq.ts            # Groq API helper (llama-3.3-70b-versatile)
```

---

## Data Flow

### Extension captures pages
1. `background.js` listens to `chrome.tabs.onUpdated`
2. On each completed page load, executes `extractPageData()` in the tab
3. Extracts: `pageTitle`, `url`, `metaDescription`, `h1`, `first500Chars`, `domain`, `visitedTime`, `keywords`
4. Stores in `chrome.storage.local` (capped at 5000 pages, deduplicates by URL)

### Web app communicates with extension
1. `ExtensionBridge.tsx` sends `RECALL_CHECK_INSTALLED` via `window.postMessage`
2. `content.js` (injected into localhost:3000 and *.vercel.app) replies with `RECALL_INSTALLED`
3. Bridge then sends `RECALL_REQUEST_DATA`
4. `content.js` calls `api.runtime.sendMessage()` to background, gets pages from storage
5. Background returns `{ pages: [...] }`, content script posts `RECALL_RESPONSE_DATA` back to window

### Search flow
1. User types query in SearchBar
2. Web app sends `{ query, candidates }` to `/api/groq-search`
3. API route calls Groq API (`llama-3.3-70b-versatile`) with system prompt to rank pages
4. Groq returns ranked results with `relevanceScore` and `summary`
5. Results rendered as cards in SearchResults

---

## Key Implementation Details

### Extension — Cross-browser compatibility
- All JS files use `const api = typeof browser !== "undefined" ? browser : chrome;` for Firefox/Chrome compat
- All API calls are **promise-based** (Firefox `browser.*` returns promises, Chrome `chrome.*` also supports promises in MV3)
- `manifest.json` has dual background config: `"scripts": ["background.js"]` (Firefox) + `"service_worker": "background.js"` (Chrome)
- `host_permissions`: `http://localhost:3000/*` and `https://*.vercel.app/*`
- Content script runs at `document_start` for early injection

### Extension — Communication bridge
- Content script listens for `window.postMessage` events from the web app
- `RECALL_CHECK_INSTALLED` → replies `RECALL_INSTALLED` (no background needed)
- `RECALL_REQUEST_DATA` → calls background via `api.runtime.sendMessage()` → replies `RECALL_RESPONSE_DATA`
- `api.runtime.sendMessage()` is wrapped in both `.catch()` AND `try/catch` for robustness

### Web app — Two-phase detection (ExtensionBridge)
- **Phase 1 (0–1.5s):** Send `RECALL_CHECK_INSTALLED`, wait for `RECALL_INSTALLED`
  - If timeout: show "extension not detected" message
  - If received: proceed to Phase 2
- **Phase 2 (after Phase 1):** Send `RECALL_REQUEST_DATA`, wait for `RECALL_RESPONSE_DATA` (5s timeout)
  - This phase depends on the background script responding
  - Even if Phase 2 fails, Phase 1 success means extension is installed (just background may be sleeping)

### Web app — Next.js 16 specifics
- App Router with `app/` directory
- All components are `"use client"` (need state/effects/browser APIs)
- Route handlers in `app/api/*/route.ts` — export named async functions (GET, POST, etc.)
- `params` and `searchParams` must be awaited (breaking change from v15)
- Turbopack is the default bundler
- `next lint` removed — use ESLint directly
- Middleware renamed to `proxy` (not used in this project)

### Web app — Theme & Styling
- Tailwind CSS v4 with `@theme` directive in `globals.css`
- Dark theme: canvas `#0F0F10`, surfaces `#161618`–`#26262A`, blue accent `#3A7BFD`
- Fonts: Sora (headings) + Inter (body) via `next/font/google`

---

## Environment Variables

In `web/.env.local`:
```
GROQ_API_KEY=groq-your-api-key-here
```
- Server-only (NOT `NEXT_PUBLIC_`), used only in `/api/groq-search` route
- Get a free key at https://console.groq.com

---

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing page with "Search History" button |
| `/search` | Static | Main search page with extension bridge |
| `/api/groq-search` | Dynamic | POST endpoint for AI-powered search |

---

## How to Run

### Web app
```bash
cd web
# Set your Groq API key in .env.local
bun install
bun dev
# Opens at http://localhost:3000
```

### Extension (Chrome)
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `extension/` folder
4. Visit `http://localhost:3000/search`

### Extension (Firefox)
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on" → select `extension/manifest.json`
3. Visit `http://localhost:3000/search`

**Important:** Reload the page after installing the extension so the content script gets injected.

---

## What's NOT implemented yet (future work)

- **Time-spent tracking**: `timeSpentSec` is always 0. Need to track tab active time via background script timers.
- **Extension popup toggle**: Pause/resume capture from popup.
- **Advanced filtering UI**: Filter by date range, domain, etc.
- **Keyboard shortcuts**: Cmd+K for search, etc.
- **Extension icons**: `extension/icons/` has placeholder directory but needs actual PNG files (16x16, 48x48, 128x128).
- **Real-time updates**: Currently requires page reload to see new captured pages in the web app.
- **Delete/edit captured pages**: No UI to manage stored history.
- **Export/import data**: No way to export browsing data.

---

## Lint & Build

```bash
cd web
npx eslint src/          # Lint (no errors expected)
npx next build           # Build (should pass clean)
```

---

## File Ownership Timeline

1. Started as "FlameTrak3D" — a wildfire tracking 3D map project with Mapbox
2. Renamed to "Recall" — removed Mapbox, env files, cleaned project
3. Built extension + web app for local browsing history search
4. Added cross-browser support (Firefox MV3 compatibility)
5. Fixed extension detection with two-phase bridge (RECALL_CHECK_INSTALLED → RECALL_REQUEST_DATA)
6. Hardened content.js with try-catch for robust message handling
