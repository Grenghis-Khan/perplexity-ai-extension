document.addEventListener("keydown", function (event) {
  // Send key state to background script
  chrome.runtime.sendMessage({
    type: "keyEvent",
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  });
});
