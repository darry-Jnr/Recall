/* global browser, chrome */
const api = typeof browser !== "undefined" ? browser : chrome;

const MAX_PAGES = 5000;

const SEARCH_ENGINE_PATTERNS = [
  "google.com/search", "bing.com/search", "duckduckgo.com",
  "search.yahoo.com", "ask.com", "baidu.com/s",
];

function isSearchEngineUrl(url) {
  return SEARCH_ENGINE_PATTERNS.some((d) => url.includes(d));
}

// One-time cleanup: remove old search engine referrer pages from storage
api.storage.local.get({ pages: [], _cleanedSearchEngines: false }, (result) => {
  if (result._cleanedSearchEngines) return;
  const cleaned = result.pages.filter((p) => !isSearchEngineUrl(p.url));
  api.storage.local.set({ pages: cleaned, _cleanedSearchEngines: true });
  console.log(`[Recall] Cleaned ${result.pages.length - cleaned.length} search engine pages from storage`);
});

api.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url || !tab.title) return;
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("about:")
  ) return;

  if (isSearchEngineUrl(tab.url)) return;

  try {
    const results = await api.scripting.executeScript({
      target: { tabId },
      func: extractPageData,
    });
    if (results?.[0]?.result) {
      await storePageVisit(results[0].result);
    }
  } catch {
    // tab may have navigated away or restricted URL
  }
});

function extractPageData() {
  const getMeta = (name) => {
    const el =
      document.querySelector(`meta[name="${name}"]`) ||
      document.querySelector(`meta[property="og:${name}"]`);
    return el ? el.getAttribute("content") || "" : "";
  };

  const h1 = document.querySelector("h1")?.innerText || "";
  const bodyText = document.body?.innerText || "";
  const first500Chars = bodyText.slice(0, 500);

  const title = document.title || "";
  const headerText = [h1, getMeta("description")].join(" ");
  const raw = `${title} ${headerText}`.toLowerCase();
  const keywords = [
    ...new Set(
      raw
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    ),
  ];

  return {
    pageTitle: title,
    url: window.location.href,
    metaDescription: getMeta("description"),
    h1,
    first500Chars,
    domain: window.location.hostname,
    visitedTime: new Date().toISOString(),
    timeSpentSec: 0,
    keywords,
  };
}

async function storePageVisit(pageVisit) {
  const result = await api.storage.local.get({ pages: [] });
  const pages = result.pages;
  const existing = pages.findIndex((p) => p.url === pageVisit.url);
  if (existing !== -1) {
    pages[existing] = pageVisit;
  } else {
    pages.unshift(pageVisit);
  }
  if (pages.length > MAX_PAGES) pages.length = MAX_PAGES;
  await api.storage.local.set({ pages });
}

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RECALL_GET_PAGES") {
    api.storage.local.get({ pages: [] }).then((result) => {
      sendResponse({ pages: result.pages || [] });
    });
    return true;
  }

  if (msg.type === "RECALL_DELETE_PAGES") {
    const urls = msg.urls || [];
    (async () => {
      const result = await api.storage.local.get({ pages: [] });
      const pages = result.pages.filter((p) => !urls.includes(p.url));
      await api.storage.local.set({ pages });
      for (const url of urls) {
        try {
          await api.history.deleteUrl({ url });
        } catch {
          // URL may not exist in Chrome history
        }
      }
      sendResponse({ deleted: urls.length });
    })();
    return true;
  }
});
