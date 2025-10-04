import { createRoot } from 'react-dom/client';

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

    // Callback to handle grade button clicks
    const onGradeClick = (points: number) => {
        pointsReceivedInput.value = points.toString();
        pointsReceivedInput.dispatchEvent(new Event('input', { bubbles: true }));

        pointsPossibleInput.value = points.toString();
        pointsPossibleInput.dispatchEvent(new Event('input', { bubbles: true }));

        gradeButton.click();
    };

    // Create React container and render component
    const reactContainer = document.createElement('div');
    reactContainer.className = 'viceroy';
    const noticeElement = gradeButton.closest('.monarch-notice');
    noticeElement?.insertAdjacentElement('afterbegin', reactContainer);

    const root = createRoot(reactContainer);
    root.render(
        <div className='mb-4 flex gap-2'>
            {[1, 10].map((points) => (
                <button className='btn btn-success' key={points} onClick={() => onGradeClick(points)} type='button'>
                    Correct ({points}/{points})
                </button>
            ))}
        </div>,
    );
}
