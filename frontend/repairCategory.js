document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'iphone';

    const CATEGORY_IMAGES = {
        'iphone': 'IphoneRepair.png',
        'ipad': 'IpadRepair.png',
        'apple-watch': 'AppleWatchRepair.png',
        'mac': 'MacRepairl.png',
        'google-pixel': 'PixelRepair.png',
        'samsung-galaxy': 'SamsRepair.png',
        'xiaomi-poco': 'XiaomiRepair.png',
        'laptops': 'LaptopsRepair.png',
        'dyson': 'DysonRepair.png',
        'playstation': 'PSRepair.png',
        'robot-vacuums': 'RoboRepair.png',
        'power-stations': 'PowerRepair.png'
    };

    let currentPage = 1;
    const limit = 12;

    const backBtn = document.getElementById('back-btn');
    const container = document.querySelector('.right-column');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const headerTitle = document.querySelector('.top-header h2');
    const bannerImage = document.querySelector('.banner-image');

    backBtn?.addEventListener('click', () => {
        window.location.href = '/repair.html';
    });

    if (headerTitle) {
        headerTitle.textContent = `Select ${category.replace(/-/g, ' ').toUpperCase()} model`;
    }

    if (bannerImage) {
        bannerImage.src = CATEGORY_IMAGES[category] || 'placeholderImg.png';
        bannerImage.alt = category;
        bannerImage.onerror = () => {
            bannerImage.style.display = 'none';
        };
    }

    const initialCards = container.querySelectorAll('.device-card');
    initialCards.forEach(c => c.remove());

    async function loadDevices() {
        try {
            loadMoreBtn.textContent = 'Loading...';
            const response = await fetch(`/api/devices?category=${encodeURIComponent(category)}&page=${currentPage}&limit=${limit}`);
            const data = await response.json();
            const devices = data.devices || data;

            loadMoreBtn.textContent = 'More models';

            if (!devices || devices.length === 0) {
                if (currentPage === 1) {
                    container.insertAdjacentHTML('afterbegin', '<p style="color:#888; grid-column: 1/-1; padding:20px; text-align:center;">No models found</p>');
                }
                loadMoreBtn.style.display = 'none';
                return;
            }

            devices.forEach(device => {
                const card = document.createElement('div');
                card.className = 'device-card';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <img src="${device.image || 'placeholderImg.png'}" alt="${device.name}">
                    <span>${device.name}</span>
                `;

                card.addEventListener('click', () => {
                    window.location.href = `/repairModel.html?deviceId=${encodeURIComponent(device.id)}&category=${encodeURIComponent(category)}`;
                });

                container.insertBefore(card, loadMoreBtn);
            });

            if (devices.length < limit) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }

            currentPage++;
        } catch (error) {
            console.error('Fetch error:', error);
            loadMoreBtn.textContent = 'Error loading';
        }
    }

    loadMoreBtn?.addEventListener('click', loadDevices);
    loadDevices();
});