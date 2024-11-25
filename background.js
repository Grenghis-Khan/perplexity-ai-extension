// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchPerplexity",
    title: 'Search Perplexity AI for "%s"',
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "searchGoogle",
    title: 'Search Google for "%s"',
    contexts: ["selection"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchPerplexity") {
    chrome.tabs.create({
      url: `https://www.perplexity.ai/?q=${encodeURIComponent(
        info.selectionText
      )}`,
    });
  } else if (info.menuItemId === "searchGoogle") {
    chrome.tabs.create({
      url: `https://www.google.com/search?q=${encodeURIComponent(
        info.selectionText
      )}&source=perplexity_redirect`,
    });
  }
});

// Redirect logic
function isGoogleRedirectRequired(url) {
  try {
    const urlObj = new URL(url);

    if (
      ((urlObj.hostname === "www.google.com" ||
        urlObj.hostname === "google.com") &&
        urlObj.pathname === "/search" &&
        urlObj.searchParams.has("q")) ||
      urlObj.searchParams.has("sca_esv")
    ) {
      const query = urlObj.searchParams.get("q");

      // If query starts with "g ", modify URL and return null to indicate no redirect
      if (query.startsWith("g ")) {
        urlObj.searchParams.set("q", query.substring(2));
        urlObj.searchParams.set("source", "g_command"); // Add source parameter to prevent future redirects
        return urlObj.toString(); // Return the new URL instead of updating tab here
      }

      // Return false if source param exists or "sca_esv" (prevents redirect)
      if (
        urlObj.searchParams.has("source") ||
        urlObj.searchParams.has("sca_esv")
      ) {
        return false;
      }
      return true; // Redirect to Perplexity
    }
    return false;
  } catch (e) {
    return false;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    const redirectResult = isGoogleRedirectRequired(tab.url);
    if (redirectResult === true) {
      // Redirect to Perplexity
      const url = new URL(tab.url);
      const query = url.searchParams.get("q");
      chrome.tabs.update(tabId, {
        url: `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`,
      });
    } else if (typeof redirectResult === "string") {
      // Update Google URL with removed "g " prefix
      chrome.tabs.update(tabId, {
        url: redirectResult,
      });
    }
  }
});
