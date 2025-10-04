import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Definition, Term } from './MatchingExercise';
import { MatchingExercise } from './MatchingExercise';

export function matchingLesson() {
    initializeDragDrop();
    observePageChanges();
}
function initializeDragDrop() {
    // Find all matching exercises on the page
    const matchingTables = document.querySelectorAll<HTMLTableElement>('#problem_form .items > table');

    matchingTables.forEach(setupMatchingExercise);
}
// Monitor for dynamically added content
function observePageChanges() {
    let reinitializeTimeout: null | number = null;

    const observer = new MutationObserver((mutations) => {
        const shouldReinitialize = mutations.some(
            (mutation) =>
                mutation.type === 'childList' &&
                Array.from(mutation.addedNodes).some(
                    (node) => node instanceof Element && (node.tagName === 'TABLE' || node.querySelector('table')),
                ),
        );

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
