import './content.css';
import { gradingButtons } from './gradingButtons';
import { gradingPage } from './gradingPage';
import { matchingLesson } from './matchingLesson';

// Add the indicator when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    matchingLesson();
    gradingPage();
    gradingButtons();

    alertAsEvent();
}

// Inject a script into the page that will override window.alert to bubble up as an event instead that can be listened
// to by the content script.
function alertAsEvent() {
    window.addEventListener('alert', (event) => {
        console.log('got an alert in content script', event);
    });
}
