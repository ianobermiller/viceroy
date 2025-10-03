import './content.css';

const indicator = document.createElement('div');
indicator.textContent = '🦋 Viceroy Active';
indicator.className =
    'fixed top-3 right-3 z-[10000] transition-all duration-300 shadow-lg rounded-md bg-indigo-600 px-3 py-2 text-white font-semibold font-sans hover:transform hover:-translate-y-0.5 hover:shadow-xl hover:bg-indigo-700 animate-in fade-in slide-in-from-top-2 duration-500';

// Add the indicator when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(indicator);
        initializeDragDrop();
        observePageChanges();
    });
} else {
    document.body.appendChild(indicator);
    initializeDragDrop();
    observePageChanges();
}

function checkAndMoveExistingTerms(table: Element) {
    const rows = table.querySelectorAll('tr');

    rows.forEach((row) => {
        const input = row.querySelector<HTMLInputElement>('input[name^="ans_"]:not([type="hidden"])');
        const matchingItem = row.querySelector<HTMLElement>('.matching_item');

        if (!input || !matchingItem || !input.value.trim()) return;

        // Get the 1-based index from the input and convert to 0-based
        const oneBasedIndex = parseInt(input.value.trim());
        if (isNaN(oneBasedIndex) || oneBasedIndex < 1) return;

        const termRowIndex = (oneBasedIndex - 1).toString();

        // Find the corresponding term
        const draggedTerm = table.querySelector<HTMLDivElement>(`div.word[data-row-index="${termRowIndex}"]`);

        if (!draggedTerm) return;

        const termText = draggedTerm.textContent.trim();

        // Create a visual term display
        const termDisplay = document.createElement('div');
        termDisplay.className =
            'bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded mr-2 shadow-sm cursor-grab select-none transition-all duration-200 hover:scale-105 hover:shadow-md active:cursor-grabbing active:scale-95';
        termDisplay.textContent = termText;
        termDisplay.draggable = true;

        // Store the term index as a data attribute for re-dragging
        termDisplay.setAttribute('data-term-index', termRowIndex);

        // Add drag events to the term display
        termDisplay.addEventListener('dragstart', (e) => {
            e.dataTransfer?.setData('text/plain', termRowIndex);
            termDisplay.style.opacity = '0.5';
            e.stopPropagation();
        });

        termDisplay.addEventListener('dragend', () => {
            termDisplay.style.opacity = '1';
        });

        // Insert the term display in the input's parent cell
        const parentCell = input.parentElement;
        if (parentCell) {
            parentCell.insertBefore(termDisplay, input);
        }

        // Hide the original term
        draggedTerm.classList.add('!cursor-not-allowed', '!line-through', '!opacity-10');
        draggedTerm.classList.remove('!cursor-grab');
        draggedTerm.draggable = false;

        // Mark this term as already processed to prevent duplicates
        draggedTerm.setAttribute('data-viceroy-moved', 'true');
    });
}

function initializeDragDrop() {
    // Find all matching exercises on the page
    const matchingTables = document.querySelectorAll('table');

    matchingTables.forEach((table) => {
        // Check if this table contains matching exercises
        const wordDivs = table.querySelectorAll('div.word');
        if (wordDivs.length === 0) return;

        // Skip if already processed
        if (table.classList.contains('viceroy-processed')) return;

        // Found matching exercise
        setupMatchingExercise(table);
        table.classList.add('viceroy-processed');
    });
}

function matchColumnWidths(table: Element) {
    // Find the first term cell to measure its width
    const firstTermCell = table.querySelector('td:has(div.word)');
    if (!firstTermCell) return;

    // Get the computed width of the term column
    const termColumnWidth = firstTermCell.getBoundingClientRect().width;

    const firstMatchingItemCell = table.querySelector<HTMLElement>('td.matching_item');
    if (!firstMatchingItemCell) return;

    firstMatchingItemCell.style.minWidth = `${termColumnWidth}px`;
}

// Monitor for dynamically added content
function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
        let shouldReinitialize = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        if (node.tagName === 'TABLE' || node.querySelector('table')) {
                            shouldReinitialize = true;
                        }
                    }
                }
            }
        }

        if (shouldReinitialize) {
            setTimeout(initializeDragDrop, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function setupMatchingExercise(table: Element) {
    // Make all div.word elements draggable
    const wordDivs = table.querySelectorAll<HTMLDivElement>('div.word');

    // Measure the width of the term column and apply it to matching_item columns
    matchColumnWidths(table);

    wordDivs.forEach((wordDiv, index) => {
        const matchingAnswer = wordDiv.querySelector('matching_answer');

        if (!matchingAnswer) return;

        // Skip if this term has already been moved to prevent duplicates
        if (wordDiv.getAttribute('data-viceroy-moved') === 'true') return;

        wordDiv.draggable = true;
        wordDiv.style.cursor = 'grab';
        wordDiv.classList.add(
            '!rounded',
            '!p-3',
            '!transition-all',
            '!duration-200',
            '!bg-indigo-50',
            '!border',
            '!border-indigo-300',
            '!mr-4',
            'hover:!bg-indigo-100',
            'hover:!border-indigo-500',
            'hover:!scale-105',
            'active:!cursor-grabbing',
        );

        // Store the row index as a data attribute for easy access
        wordDiv.setAttribute('data-row-index', index.toString());

        wordDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer?.setData('text/plain', index.toString());
            wordDiv.style.opacity = '0.5';
            // Dragging term
        });

        wordDiv.addEventListener('dragend', () => {
            wordDiv.style.opacity = '1';
        });
    });

    // Make definition rows accept drops
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
        const definition = row.querySelector<HTMLElement>('.matching_question');
        const matchingItem = row.querySelector<HTMLElement>('.matching_item');
        const input = row.querySelector<HTMLInputElement>('input[name^="ans_"]:not([type="hidden"])');

        if (!definition || !matchingItem || !input) return;

        // Make both definition and matching_item cells drop zones
        const dropZones = [definition, matchingItem];

        dropZones.forEach((dropZone) => {
            dropZone.classList.add(
                '!transition-all',
                '!duration-200',
                '!rounded',
                '!p-3',
                '!m-0.5',
                'hover:!bg-sky-50',
                'hover:!cursor-pointer',
            );
        });

        // Add event listeners to both drop zones
        dropZones.forEach((dropZone) => {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('!bg-sky-100', '!border-2', '!border-dashed', '!border-sky-500');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('!bg-sky-100', '!border-2', '!border-dashed', '!border-sky-500');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                const termRowIndex = e.dataTransfer?.getData('text/plain');

                if (termRowIndex) {
                    // Check if this definition already has a term and move it back
                    const inputCell = input.parentElement;
                    const currentTermDisplay = inputCell?.querySelector('[data-term-index]');
                    if (currentTermDisplay) {
                        const currentTermIndex = currentTermDisplay.getAttribute('data-term-index');
                        if (currentTermIndex) {
                            // Restore the displaced term to the original list
                            const displacedTerm = table.querySelector<HTMLDivElement>(
                                `div.word[data-row-index="${currentTermIndex}"]`,
                            );
                            if (displacedTerm) {
                                displacedTerm.classList.remove('!opacity-10', '!line-through', '!cursor-not-allowed');
                                displacedTerm.classList.add('!cursor-grab');
                                displacedTerm.draggable = true;

                                // Remove the moved marker so it can be dragged again
                                displacedTerm.removeAttribute('data-viceroy-moved');
                            }
                        }
                        currentTermDisplay.remove();
                    }

                    // Check if this term is already placed somewhere else and remove it
                    const existingTermDisplay = table.querySelector(`[data-term-index="${termRowIndex}"]`);
                    if (existingTermDisplay?.closest('td')) {
                        // Remove from previous location
                        const previousInput = existingTermDisplay.parentElement?.querySelector<HTMLInputElement>(
                            'input[name^="ans_"]:not([type="hidden"])',
                        );
                        if (previousInput) {
                            previousInput.value = '';
                            previousInput.style.display = '';
                            previousInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        existingTermDisplay.remove();
                    }

                    // Populate the input with 1-based index (termRowIndex + 1)
                    const oneBasedIndex = (parseInt(termRowIndex) + 1).toString();
                    input.value = oneBasedIndex;
                    input.dispatchEvent(new Event('input', { bubbles: true }));

                    // Hide the input field
                    // input.style.display = 'none';

                    // Find the term text from the original term element
                    const draggedTerm = table.querySelector<HTMLDivElement>(
                        `div.word[data-row-index="${termRowIndex}"]`,
                    );
                    const termText = draggedTerm?.textContent.trim() || '';

                    // Create a visual term display
                    const termDisplay = document.createElement('div');
                    termDisplay.className =
                        'bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded mr-2 shadow-sm cursor-grab select-none transition-all duration-200 hover:scale-105 hover:shadow-md active:cursor-grabbing active:scale-95 animate-in fade-in duration-300';
                    termDisplay.textContent = termText;
                    termDisplay.draggable = true;

                    // Store the term index as a data attribute for re-dragging
                    termDisplay.setAttribute('data-term-index', termRowIndex);

                    // Add drag events to the term display
                    termDisplay.addEventListener('dragstart', (e) => {
                        e.dataTransfer?.setData('text/plain', termRowIndex);
                        termDisplay.style.opacity = '0.5';
                        e.stopPropagation();
                    });

                    termDisplay.addEventListener('dragend', () => {
                        termDisplay.style.opacity = '1';
                    });

                    // Insert the term display in the input's parent cell
                    const parentCell = input.parentElement;
                    if (parentCell) {
                        parentCell.insertBefore(termDisplay, input);
                    }

                    // Add success animation to both drop zones
                    dropZones.forEach((zone) => zone.classList.add('!bg-green-100'));
                    setTimeout(() => {
                        dropZones.forEach((zone) => zone.classList.remove('!bg-green-100'));
                    }, 500);

                    // Hide the original term completely (only if it's not already hidden)
                    if (draggedTerm) {
                        const draggedTermElement = draggedTerm;
                        draggedTermElement.classList.add('!cursor-not-allowed', '!line-through', '!opacity-10');
                        draggedTermElement.classList.remove('!cursor-grab');
                        draggedTermElement.draggable = false;

                        // Mark this term as moved to prevent duplicates
                        draggedTermElement.setAttribute('data-viceroy-moved', 'true');
                    }

                    // Dropped term successfully
                }

                // Reset visual feedback
                dropZone.classList.remove('!bg-sky-100', '!border-2', '!border-dashed', '!border-sky-500');
            });
        });
    });

    // Check for existing values in inputs and move terms accordingly
    checkAndMoveExistingTerms(table);
}
