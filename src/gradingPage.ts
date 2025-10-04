export function gradingPage() {
    const theProblemsIframe = document.querySelector<HTMLIFrameElement>('iframe#the_problems');
    const thePresentationIframe = document.querySelector<HTMLIFrameElement>('iframe#the_presentation');
    if (thePresentationIframe && theProblemsIframe) {
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
