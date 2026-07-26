/* global browser, chrome */
const api = typeof browser !== "undefined" ? browser : chrome;
console.log("[Recall content.js] ✅ Content script loaded, api:", typeof api);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data?.type?.startsWith("RECALL_")) return;

  console.log("[Recall content.js] 📨 Received message:", event.data?.type);

  if (event.data?.type === "RECALL_CHECK_INSTALLED") {
    console.log("[Recall content.js] 📤 Sending RECALL_INSTALLED");
    window.postMessage({ type: "RECALL_INSTALLED" }, "*");
    return;
  }

  if (event.data?.type !== "RECALL_REQUEST_DATA") return;

  console.log("[Recall content.js] 📡 Calling background via runtime.sendMessage...");
  try {
    const handleResponse = (response) => {
      console.log("[Recall content.js] ✅ Background responded:", response);
      window.postMessage(
        { type: "RECALL_RESPONSE_DATA", pages: response?.pages || [] },
        "*"
      );
    };

    const handleError = (err) => {
      console.error("[Recall content.js] ❌ runtime.sendMessage failed:", err);
      window.postMessage(
        { type: "RECALL_RESPONSE_DATA", error: "Extension not connected" },
        "*"
      );
    };

    api.runtime.sendMessage({ type: "RECALL_GET_PAGES" }, (response) => {
      if (api.runtime.lastError) {
        handleError(api.runtime.lastError);
      } else {
        handleResponse(response);
      }
    });
  } catch (err) {
    console.error("[Recall content.js] ❌ runtime.sendMessage threw:", err);
    window.postMessage(
      { type: "RECALL_RESPONSE_DATA", error: "Extension not connected" },
      "*"
    );
  }
});
