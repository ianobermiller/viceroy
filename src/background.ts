// Background service worker for Viceroy extension

// Listen for extension installation or update
// chrome.runtime.onInstalled.addListener((details) => {
//     console.log('Viceroy extension installed/updated', details.reason);

//     if (details.reason === 'install') {
//         console.log('Extension installed for the first time');
//     } else if (details.reason === 'update') {
//         console.log('Extension updated to version', chrome.runtime.getManifest().version);
//     }
// });

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message, 'from', sender.tab?.id);

    // Example: Handle different message types
    if (message.type === 'alert') {
        console.log('Alert message:', message.data);
        sendResponse({ success: true });
    }

    // Return true to indicate async response
    return true;
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('monarch-app.aop.com')) {
        console.log('Monarch app page loaded:', tab.url);

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
});

console.log('Background service worker started');
