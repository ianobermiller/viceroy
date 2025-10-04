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
}
