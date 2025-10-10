// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message: { type: string }, sender, sendResponse) => {
    console.log('Message received in background:', message, 'from', sender.tab?.id);

    if (message.type === 'init') {
        const tabId = sender.tab?.id;
        if (tabId) {
            void chrome.scripting.executeScript({
                func: () => {
                    window.alert = function (message: string) {
                        const event = new CustomEvent('alert', { detail: message });
                        window.dispatchEvent(event);
                    };
                },
                target: { allFrames: true, tabId },
                world: 'MAIN',
            });
        }
        sendResponse({ success: true });
    }

    // Return true to indicate async response
    return true;
});

console.log('Background service worker started');
