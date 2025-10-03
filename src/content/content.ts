import './content.css';

console.log('🤖 Viceroy extension loaded on Monarch app!');

// Example: Add a simple indicator that the extension is active
const indicator = document.createElement('div');
indicator.textContent = '👑 Viceroy Active';
indicator.className = 'viceroy-indicator viceroy-fade-in';

// Add the indicator when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(indicator);
    });
} else {
    document.body.appendChild(indicator);
}
