// Easter egg game logic for Feature Feud

document.addEventListener('keydown', (event) => {
    if (event.key === 'g') {
        const gameContainer = document.getElementById('feature-feud-game');
        if (!gameContainer) {
            console.error('Feature Feud game container is missing!');
            return;
        }
        gameContainer.style.display = 'block';

        // Dynamic greeting from the host
        const hostMessage = document.getElementById('host-message');
        hostMessage.textContent = "Welcome to Feature Feud! Let's have some fun ranking these features.";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.getElementById('close-game');
    const submitButton = document.getElementById('submit-ranking');

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const gameContainer = document.getElementById('feature-feud-game');
            if (gameContainer) {
                gameContainer.style.display = 'none';
            }
        });
    } else {
        console.error('Close button for the game is missing!');
    }

    if (submitButton) {
        submitButton.addEventListener('click', () => {
            const ranking = [
                document.getElementById('feature-1').value,
                document.getElementById('feature-2').value,
                document.getElementById('feature-3').value,
            ];

            const hostResponse = document.getElementById('host-response');
            hostResponse.textContent = `Interesting ranking! Looks like you're really into "${ranking[0]}". FeudBot approves.`;
        });
    } else {
        console.error('Submit button for the game is missing!');
    }
});
