// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message, 'from', sender.tab?.id);

    if (message.type === 'init') {
        const tabId = sender.tab?.id;
        if (tabId) {
            chrome.scripting.executeScript({
                target: { tabId, allFrames: true },
                func: () => {
                    window.alert = function (message) {
                        const event = new CustomEvent('alert', { detail: message });
                        window.dispatchEvent(event);
                    };
                },
                world: 'MAIN',
            });
        }
        sendResponse({ success: true });
    }

    // Return true to indicate async response
    return true;
});

console.log('Background service worker started');
