document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.right-column .device-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const url = card.getAttribute('href');
            if (url) {
                e.preventDefault();
                window.location.href = url;
            }
        });
    });
});