export function gradingButtons() {
    // Look for the subjective score div
    const subjectiveScoreDiv = document.querySelector<HTMLDivElement>('#subjective_score');
    if (!subjectiveScoreDiv) return;

    // Check if we already added the button
    if (subjectiveScoreDiv.dataset['viceroy']) return;
    subjectiveScoreDiv.dataset['viceroy'] = 'true';

    // Find the required elements
    const pointsReceivedInput = subjectiveScoreDiv.querySelector<HTMLInputElement>('#points_received');
    const pointsPossibleInput = subjectiveScoreDiv.querySelector<HTMLInputElement>('#points_possible');
    const gradeButton = subjectiveScoreDiv.querySelector<HTMLInputElement>('input[type="button"][value="Grade"]');

    if (!pointsReceivedInput || !pointsPossibleInput || !gradeButton) return;

    // Create the auto-grade button
    const autoGradeButton = document.createElement('button');
    autoGradeButton.textContent = 'Correct (1/1)';
    autoGradeButton.className =
        // 'viceroy block px-4 py-3 bg-green-500 hover:bg-green-600 text-white border-none rounded cursor-pointer text-lg!';
        '!block btn btn-success !mb-4';

    // Add click handler
    autoGradeButton.addEventListener('click', (e) => {
        e.preventDefault();

        // Fill in the scores
        pointsReceivedInput.value = '1';
        pointsPossibleInput.value = '1';

        // Trigger input events to ensure any validation runs
        pointsReceivedInput.dispatchEvent(new Event('input', { bubbles: true }));
        pointsPossibleInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Click the grade button
        gradeButton.click();
    });

    // Insert the button after the grade button
    gradeButton.closest('.monarch-notice')?.insertAdjacentElement('afterbegin', autoGradeButton);
}
