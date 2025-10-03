import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Definition, Term } from './MatchingExercise';
import { MatchingExercise } from './MatchingExercise';
import './content.css';

// Add the indicator when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    initializeDragDrop();
    observePageChanges();

    initializeGradingPage();
}

function initializeDragDrop() {
    // Find all matching exercises on the page
    const matchingTables = document.querySelectorAll<HTMLTableElement>('#problem_form .items > table');

    matchingTables.forEach(setupMatchingExercise);
}

function initializeGradingPage() {
    const theProblemsIframe = document.querySelector<HTMLIFrameElement>('iframe#the_problems');
    const thePresentationIframe = document.querySelector<HTMLIFrameElement>('iframe#the_presentation');
    if (thePresentationIframe && theProblemsIframe) {
        console.log({ thePresentationIframe, theProblemsIframe });
        // create a new root level div
        const rootDiv = document.createElement('div');
        rootDiv.className = 'viceroy w-screen h-screen bg-white flex pt-[38px]';
        theProblemsIframe.className = 'flex-1';
        thePresentationIframe.className = 'flex-1';
        rootDiv.appendChild(theProblemsIframe);
        rootDiv.appendChild(thePresentationIframe);
        document.body.appendChild(rootDiv);
    }
}

// Monitor for dynamically added content
function observePageChanges() {
    let reinitializeTimeout: null | number = null;

    const observer = new MutationObserver((mutations) => {
        let shouldReinitialize = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        if (node.tagName === 'TABLE' || node.querySelector('table')) {
                            shouldReinitialize = true;
                            break;
                        }
                    }
                }
                if (shouldReinitialize) break;
            }
        }

        if (shouldReinitialize) {
            // Clear any existing timeout to prevent multiple rapid calls
            if (reinitializeTimeout !== null) {
                clearTimeout(reinitializeTimeout);
            }

            // Debounce the reinitialization
            reinitializeTimeout = window.setTimeout(() => {
                initializeDragDrop();
                reinitializeTimeout = null;
            }, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function setupMatchingExercise(table: HTMLTableElement) {
    if (table.classList.contains('viceroy-processed')) return;
    table.classList.add('viceroy-processed');

    const terms: Term[] = [];
    const definitions: Definition[] = [];
    const inputElements: HTMLInputElement[] = [];

    const rows = table.querySelectorAll('tr');
    if (!rows.length) return;

    rows.forEach((row) => {
        const term = row.querySelector<HTMLElement>('matching_answer');
        const definition = row.querySelector<HTMLElement>('.matching_question');
        const input = row.querySelector<HTMLInputElement>('input[name^="ans_"]:not([type="hidden"])');

        if (term && definition && input) {
            terms.push({
                correctDefinitionIndex: Number(term.getAttribute('ident')),
                index: terms.length,
                text: term.textContent.trim(),
            });

            const currentValue = input.value.trim();
            const matchedTermIndex = currentValue ? parseInt(currentValue) - 1 : null;
            definitions.push({
                index: definitions.length,
                matchedTermIndex: matchedTermIndex !== null && !isNaN(matchedTermIndex) ? matchedTermIndex : null,
                text: definition.textContent.trim(),
            });

            inputElements.push(input);
        }
    });

    // Callback to update inputs
    const updateInput = (definitionIndex: number, termIndex: null | number) => {
        const input = inputElements[definitionIndex];
        if (input) {
            input.value = termIndex !== null ? (termIndex + 1).toString() : '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const reactContainer = document.createElement('div');
    reactContainer.className = 'viceroy';
    table.parentElement?.insertBefore(reactContainer, table.nextSibling);

    const root = createRoot(reactContainer);
    root.render(React.createElement(MatchingExercise, { definitions, onUpdateInput: updateInput, terms }));

    table.style.display = 'none';
}
