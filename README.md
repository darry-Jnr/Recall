# Recall

### Your Second Brain for the Web

**Local AI Browser History Intelligence**

> Recall remembers every page you visit so you never lose track. Search your browsing history with AI, filter and delete what you don't need, visualize your productivity — all kept 100% private and locally stored.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-blue?logo=google-chrome)](https://developer.chrome.com/docs/extensions/mv3/)
[![Local AI](https://img.shields.io/badge/AI-Groq_Llama_3.3-purple?logo=brain)](https://groq.com)

---

## Download & Install

> **[Download the latest Recall extension](https://github.com/darry-Jnr/Recall/releases/latest)** — or visit the [install guide](https://recall-web.vercel.app/install) for step-by-step instructions.

---

## Features

- **Local AI Search** — Ask natural language questions about your browsing history. Recall uses Groq-powered Llama 3.3 to find exactly what you visited, when, and why.

- **Privacy First & Local Storage** — All browsing data is stored locally in your browser via `chrome.storage.local`. Nothing is sent to external servers except the AI chat queries (with your page data for context).

- **Filter & Delete (Surgical Purge)** — Tell Recall to delete pages by category (e.g., "delete all betting sites"). The AI identifies matching pages, shows them for confirmation, then removes them from both Recall storage and Chrome browsing history.

- **Productivity Analytics** — Visualize your browsing activity with interactive charts. See time spent per domain, activity by hour of day, and filter by date ranges (Today, Yesterday, Last 7 Days).

- **Search Engine Referrer Filter** — Automatically excludes Google, Bing, DuckDuckGo, and other search engine result pages from being stored. Only real website visits are tracked.

- **Smart Deduplication** — Visiting the same URL again replaces the previous entry with fresh metadata, keeping your history clean without duplicates.

- **Auto-Capture** — The extension silently captures page data (title, URL, domain, description, keywords) every time you navigate to a new page.

---

## How to Install the Extension (Unpacked)

### Step 1: Download & Extract

Download `Recall-Extension.zip` from the [Releases page](https://github.com/darry-Jnr/Recall/releases/latest) and extract the zip folder onto your computer.

### Step 2: Enable Developer Mode

Open `chrome://extensions` in a new tab and toggle **Developer Mode** ON in the top-right corner.

### Step 3: Load Unpacked

Click **Load unpacked** in the top-left corner and select the extracted `extension/` folder.

> **Note:** The Recall icon will appear in your Chrome toolbar. Navigate to any page to start capturing history.

---

## Local Development Guide

### Prerequisites

- Node.js 18+
- npm or bun
- A Groq API key (for AI chat features)

### Setup

```bash
# Clone the repository
git clone https://github.com/darry-Jnr/Recall.git
cd Recall

# Install web app dependencies
cd web
npm install

# Create your environment file
cp .env.example .env.local
```

Add your Groq API key to `.env.local`:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Run the Web App

```bash
cd web
npm run dev
```

The app will be available at `http://localhost:3000`.

### Load the Extension

Follow the [install steps](#how-to-install-the-extension-unpacked) above, pointing to the `extension/` folder in this repo.

---

## Architecture

```
Recall/
├── web/                    # Next.js 16 web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── search/page.tsx     # Chat + analytics interface
│   │   │   ├── install/page.tsx    # Extension install guide
│   │   │   └── api/
│   │   │       ├── groq-chat/      # AI chat endpoint
│   │   │       └── classify-pages/ # Delete classification endpoint
│   │   ├── components/
│   │   │   ├── landing/            # Landing page components
│   │   │   └── search/             # Chat, ExtensionBridge, AnalyticsModal
│   │   └── lib/
│   │       ├── groq.ts             # Groq AI integration
│   │       └── types.ts            # TypeScript types
│   └── public/
│       └── demo.mp4                # Landing page demo video
│
├── extension/              # Chrome Extension (Manifest V3)
│   ├── manifest.json       # Extension configuration
│   ├── background.js       # Service worker — captures & stores pages
│   ├── content.js          # Content script — message bridge
│   ├── popup.html/js       # Extension popup
│   └── icons/              # Extension icons
│
└── README.md
```

### How It Works

1. **Extension captures** page data (title, URL, domain, keywords, etc.) via `chrome.scripting.executeScript` on every navigation.
2. **Data is stored** in `chrome.storage.local` under a single `pages` key (capped at 5,000 entries).
3. **Web app fetches** pages from the extension via `window.postMessage` through a content script bridge.
4. **AI chat** sends all pages as context to Groq's Llama 3.3 model for natural language search.
5. **Delete flow** uses Groq to classify pages by category, then removes them from both Recall storage and Chrome browsing history via `chrome.history.deleteUrl`.

---

## Privacy

**Your data never leaves your device.**

- All browsing data is stored locally in `chrome.storage.local`
- No analytics, no tracking, no external databases
- The only network calls are to the Groq API during chat (your page data is sent as context for AI queries, not stored externally)
- You can delete any or all data at any time through the chat interface or Chrome's built-in storage tools

> Recall is built on the principle that your browsing history is **yours**. Not ours. Not anyone else's.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web App | Next.js 16, React 19, Tailwind CSS 4 |
| AI | Groq API (Llama 3.3 70B Versatile) |
| Extension | Chrome Extension Manifest V3, Vanilla JS |
| Charts | Recharts |
| Hosting | Vercel |

---

## License

MIT

---

Built with ♥ for a hackathon
