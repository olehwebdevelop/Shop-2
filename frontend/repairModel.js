document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('deviceId');
    const category = urlParams.get('category') || 'iphone';

    const btnBack = document.querySelector('.btn-back');
    const btnLinkChange = document.querySelector('.btn-link');
    const deviceImg = document.querySelector('.image-wrapper img');
    const deviceTitle = document.querySelector('.device-info h3');
    const servicesGrid = document.querySelector('.services-grid');
    const categoryFooter = document.querySelector('.category-footer span');

    const goBack = () => {
        window.location.href = `/repairCategory.html?category=${encodeURIComponent(category)}`;
    };

    btnBack?.addEventListener('click', goBack);
    btnLinkChange?.addEventListener('click', goBack);

    if (!deviceId) {
        goBack();
        return;
    }

    try {
        const res = await fetch(`/api/devices/${encodeURIComponent(deviceId)}/repairs`);
        if (!res.ok) throw new Error('Device not found');
        const data = await res.json();

        if (deviceImg) deviceImg.src = data.image || 'placeholderImg.png';
        if (deviceTitle) deviceTitle.textContent = data.name;
        if (categoryFooter) categoryFooter.textContent = data.categoryTitle || 'All categories';

        if (servicesGrid && data.services) {
            servicesGrid.innerHTML = '';
            data.services.forEach(service => {
                const card = document.createElement('div');
                card.className = 'service-card';
                card.innerHTML = `
                    <div class="service-icon" style="font-size: 26px;">
                        ${service.icon || '🛠️'}
                    </div>
                    <div class="service-details">
                        <h4 class="service-title" title="${service.title}">${service.title}</h4>
                        <p class="service-price">$${service.price}</p>
                    </div>
                    <button class="btn-order">Order</button>
                `;

                const orderBtn = card.querySelector('.btn-order');
                orderBtn.addEventListener('click', () => {
                    alert(`Order placed for ${data.name}: ${service.title} ($${service.price})`);
                });

                servicesGrid.appendChild(card);
            });
        }
    } catch (err) {
        console.error('Fetch error:', err);
        if (deviceTitle) deviceTitle.textContent = 'Device not found';
    }
});