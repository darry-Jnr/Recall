/* global browser, chrome */
const api = typeof browser !== "undefined" ? browser : chrome;

api.storage.local.get({ pages: [] }).then((result) => {
  document.getElementById("status").textContent =
    `Tracking ${result.pages.length} page${result.pages.length !== 1 ? "s" : ""}`;
});
