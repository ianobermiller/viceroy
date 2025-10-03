// Content script for Viceroy Chrome extension
// Runs on https://monarch-app.aop.com/*

console.log('🤖 Viceroy extension loaded on Monarch app!');

// Example: Add a simple indicator that the extension is active
const indicator = document.createElement('div');
indicator.textContent = '👑 Viceroy Active';
indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4F46E5;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

// Add the indicator when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(indicator);
    });
} else {
    document.body.appendChild(indicator);
}
