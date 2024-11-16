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

// Existing redirect logic
function isGoogleRedirectRequired(url) {
  try {
    const urlObj = new URL(url);

    if (
      (urlObj.hostname === "www.google.com" ||
        urlObj.hostname === "google.com") &&
      urlObj.pathname === "/search" &&
      urlObj.searchParams.has("q")
    ) {
      const query = urlObj.searchParams.get("q");

      if (query.startsWith("g ") || urlObj.searchParams.has("source")) {
        return false;
      }
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "loading" &&
    tab.url &&
    isGoogleRedirectRequired(tab.url)
  ) {
    const url = new URL(tab.url);
    const query = url.searchParams.get("q");

    chrome.tabs.update(tabId, {
      url: `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`,
    });
  }
});
