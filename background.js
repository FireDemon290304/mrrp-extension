chrome.action.onClicked.addListener((tab) => {
    // Send a message to the content script to enable sound
    chrome.tabs.sendMessage(tab.id, { action: "enableSound" });
});