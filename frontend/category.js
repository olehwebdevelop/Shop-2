document.addEventListener('DOMContentLoaded', () => {
    const headers = document.querySelectorAll('.filter-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const block = header.closest('.filter-block');
            block.classList.toggle('collapsed');
        });
    });

    const mobileFilterOpen = document.getElementById("mobileFilterOpen");
    const mobileFilterClose = document.getElementById("mobileFilterClose");
    const filterSidebar = document.querySelector(".filter-sidebar");
    const filterReset = document.getElementById("filterReset");
    const filterResult = document.getElementById("filterResult");
    const mobileSortOpen = document.getElementById("mobileSortOpen");
    const mobileSortMenu = document.getElementById("mobileSortMenu");

    mobileFilterOpen?.addEventListener("click", () => {
        filterSidebar?.classList.add("mobile-filter-active");
        document.body.classList.add("mobile-filter-open");
    });

    function closeMobileFilter() {
        filterSidebar?.classList.remove("mobile-filter-active");
        document.body.classList.remove("mobile-filter-open");
    }

    mobileFilterClose?.addEventListener("click", closeMobileFilter);
    filterResult?.addEventListener("click", closeMobileFilter);

    filterReset?.addEventListener("click", () => {
        document.querySelectorAll(".filter-sidebar input[type='checkbox']").forEach(input => {
            input.checked = false;
        });

        document.querySelectorAll(".filter-sidebar .chip-btn.active").forEach(btn => {
            btn.classList.remove("active");
        });

        if (window.resetCategoryFilters) {
            window.resetCategoryFilters();
        }
    });

    mobileSortOpen?.addEventListener("click", (event) => {
        event.stopPropagation();
        mobileSortMenu?.classList.toggle("active");
    });

    document.querySelectorAll(".sort-option").forEach(option => {
        option.addEventListener("click", () => {
            document.querySelectorAll(".sort-option").forEach(item => item.classList.remove("active"));
            option.classList.add("active");
            mobileSortMenu?.classList.remove("active");
            if (window.sortCategoryProducts) {
                window.sortCategoryProducts(option.dataset.sort);
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (
            mobileSortMenu &&
            mobileSortMenu.classList.contains("active") &&
            !mobileSortMenu.contains(event.target) &&
            !mobileSortOpen.contains(event.target)
        ) {
            mobileSortMenu.classList.remove("active");
        }
    });

    const ybPrev = document.querySelector('.yb-arrow.prev');
    const ybNext = document.querySelector('.yb-arrow.next');
    const ybTrack = document.getElementById('ybSliderTrack');

    if (ybPrev && ybNext && ybTrack) {
        ybPrev.addEventListener('click', () => {
            ybTrack.scrollBy({ left: -320, behavior: 'smooth' });
        });
        ybNext.addEventListener('click', () => {
            ybTrack.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    initCategoryView();
});

let loadedProductsList = [];
let activeFilters = {
    devices: new Set(),
    models: new Set(),
    screens: new Set(),
    storages: new Set(),
    rams: new Set(),
    sims: new Set(),
    colors: new Set(),
    versions: new Set(),
    minPrice: null,
    maxPrice: null
};

const colorHexMap = {
    'Gold': '#d4af37',
    'Silver': '#e5e5e5',
    'White': '#ffffff',
    'Deep Blue': '#1f456e',
    'Space Gray': '#4b4b4d',
    'Matte Black': '#1b1b1b',
    'Midnight': '#191f28',
    'Standard': '#777777'
};

async function initCategoryView() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    const search = urlParams.get('search');

    const queryParams = new URLSearchParams();
    if (cat) queryParams.set('category', cat);
    if (search) queryParams.set('search', search);

    try {
        const res = await fetch(`/api/products?${queryParams.toString()}`);
        loadedProductsList = await res.json();

        renderTopSlider(loadedProductsList);
        setupSidebarFilters(loadedProductsList);
        renderFilteredProducts();
    } catch (err) {
        console.error('Error fetching category products:', err);
    }
}

function renderTopSlider(products) {
    const track = document.getElementById('ybSliderTrack');
    const sliderContainer = document.querySelector('.menu-container-slider');
    if (!track || !sliderContainer) return;

    if (!products || products.length === 0) {
        sliderContainer.style.display = 'none';
        return;
    }

    sliderContainer.style.display = 'block';
    track.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('a');
        card.href = `/product-page.html?slug=${product.slug}`;
        card.className = 'yb-card';
        card.innerHTML = `
            <div class="yb-card-img">
                <img src="${product.main_image}" alt="${product.name}">
            </div>
            <div class="yb-card-title">${product.name}</div>
        `;
        track.appendChild(card);
    });
}

function setupSidebarFilters(products) {
    const devices = new Set();
    const models = new Set();
    const screens = new Set();
    const storages = new Set();
    const rams = new Set();
    const sims = new Set();
    const colors = new Set();
    const versions = new Set();

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach(p => {
        if (p.price < minPrice) minPrice = p.price;
        if (p.price > maxPrice) maxPrice = p.price;

        if (p.specs) {
            if (p.specs.Device) devices.add(p.specs.Device);
            if (p.specs.Model) models.add(p.specs.Model);
            if (p.specs['Screen Size']) screens.add(p.specs['Screen Size']);
            if (p.specs.Storage) storages.add(p.specs.Storage);
            if (p.specs.RAM) rams.add(p.specs.RAM);
            if (p.specs['SIM Card Format']) sims.add(p.specs['SIM Card Format']);
            if (p.specs.Color) colors.add(p.specs.Color);
            if (p.specs.Version) versions.add(p.specs.Version);
        }
    });

    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === -Infinity) maxPrice = 2000;

    activeFilters.minPrice = minPrice;
    activeFilters.maxPrice = maxPrice;

    setupPriceRange(minPrice, maxPrice);

    renderCheckboxList('deviceListContainer', Array.from(devices), 'devices');
    renderCheckboxList('modelListContainer', Array.from(models), 'models');
    renderChipGrid('screenSizeGrid', Array.from(screens), 'screens');
    renderChipGrid('storageGrid', Array.from(storages), 'storages');
    renderChipGrid('ramGrid', Array.from(rams), 'rams');

    renderCheckboxList('simFormatContainer', Array.from(sims), 'sims');
    renderColorGrid('colorGrid', Array.from(colors), 'colors');
    renderChipGrid('versionGrid', Array.from(versions), 'versions');
}

function setupPriceRange(min, max) {
    const minInput = document.getElementById('rangeMin');
    const maxInput = document.getElementById('rangeMax');
    const priceFrom = document.getElementById('priceFrom');
    const priceTo = document.getElementById('priceTo');

    if (!minInput || !maxInput) return;

    minInput.min = min;
    minInput.max = max;
    minInput.value = min;

    maxInput.min = min;
    maxInput.max = max;
    maxInput.value = max;

    if (priceFrom) priceFrom.textContent = `$${min}`;
    if (priceTo) priceTo.textContent = `$${max}`;

    minInput.oninput = () => {
        let v1 = parseInt(minInput.value);
        let v2 = parseInt(maxInput.value);
        if (v1 > v2) {
            minInput.value = v2;
            v1 = v2;
        }
        if (priceFrom) priceFrom.textContent = `$${v1}`;
        activeFilters.minPrice = v1;
        renderFilteredProducts();
    };

    maxInput.oninput = () => {
        let v1 = parseInt(minInput.value);
        let v2 = parseInt(maxInput.value);
        if (v2 < v1) {
            maxInput.value = v1;
            v2 = v1;
        }
        if (priceTo) priceTo.textContent = `$${v2}`;
        activeFilters.maxPrice = v2;
        renderFilteredProducts();
    };
}

function renderCheckboxList(containerId, items, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const parentBlock = container.closest('.filter-block');

    if (items.length === 0) {
        if (parentBlock) parentBlock.style.display = 'none';
        return;
    }

    if (parentBlock) parentBlock.style.display = 'block';
    container.innerHTML = '';

    items.forEach(val => {
        const label = document.createElement('label');
        label.className = 'filter-item';
        label.innerHTML = `
            <span>${val}</span>
            <input type="checkbox" value="${val}">
            <span class="checkbox-custom"></span>
        `;

        label.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters[filterKey].add(val);
            } else {
                activeFilters[filterKey].delete(val);
            }
            renderFilteredProducts();
        });

        container.appendChild(label);
    });
}

function renderChipGrid(containerId, items, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const parentBlock = container.closest('.filter-block');

    if (items.length === 0) {
        if (parentBlock) parentBlock.style.display = 'none';
        return;
    }

    if (parentBlock) parentBlock.style.display = 'block';
    container.innerHTML = '';

    items.forEach(val => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn';
        btn.textContent = val;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                activeFilters[filterKey].add(val);
            } else {
                activeFilters[filterKey].delete(val);
            }
            renderFilteredProducts();
        });

        container.appendChild(btn);
    });
}

function renderColorGrid(containerId, items, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const parentBlock = container.closest('.filter-block');

    if (items.length === 0) {
        if (parentBlock) parentBlock.style.display = 'none';
        return;
    }

    if (parentBlock) parentBlock.style.display = 'block';
    container.innerHTML = '';

    items.forEach(val => {
        const hex = colorHexMap[val] || '#888888';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn';
        btn.innerHTML = `
            <span class="color-dot" style="background-color: ${hex}; border: 1px solid #444;"></span>
            ${val}
        `;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                activeFilters[filterKey].add(val);
            } else {
                activeFilters[filterKey].delete(val);
            }
            renderFilteredProducts();
        });

        container.appendChild(btn);
    });
}

function renderFilteredProducts() {
    const container = document.getElementById('productGrid') || document.querySelector('.product-grid');
    if (!container) return;

    const filtered = loadedProductsList.filter(p => {
        if (activeFilters.minPrice !== null && p.price < activeFilters.minPrice) return false;
        if (activeFilters.maxPrice !== null && p.price > activeFilters.maxPrice) return false;

        if (activeFilters.devices.size > 0 && (!p.specs || !activeFilters.devices.has(p.specs.Device))) return false;
        if (activeFilters.models.size > 0 && (!p.specs || !activeFilters.models.has(p.specs.Model))) return false;
        if (activeFilters.screens.size > 0 && (!p.specs || !activeFilters.screens.has(p.specs['Screen Size']))) return false;
        if (activeFilters.storages.size > 0 && (!p.specs || !activeFilters.storages.has(p.specs.Storage))) return false;
        if (activeFilters.rams.size > 0 && (!p.specs || !activeFilters.rams.has(p.specs.RAM))) return false;
        if (activeFilters.sims.size > 0 && (!p.specs || !activeFilters.sims.has(p.specs['SIM Card Format']))) return false;
        if (activeFilters.colors.size > 0 && (!p.specs || !activeFilters.colors.has(p.specs.Color))) return false;
        if (activeFilters.versions.size > 0 && (!p.specs || !activeFilters.versions.has(p.specs.Version))) return false;

        return true;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 50px 20px; text-align: center; color: #fff;">
                <h3 style="font-size: 22px; margin-bottom: 12px;">No matching products</h3>
                <p style="color: #888;">Try adjusting or clearing your filters.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(product => {
        const discountBadgeHTML = product.discount_label ? `<div class="discount-badge">${product.discount_label}</div>` : '';
        const oldPriceHTML = product.old_price ? `<span class="price-old" style="text-decoration: line-through; color: #888; margin-left: 8px;">$${product.old_price}</span>` : '';

        const productHTML = `
            <div class="product-card">
                ${discountBadgeHTML}
                <div class="product-img-wrapper">
                    <img src="${product.main_image}" alt="${product.name}">
                </div>
                <div class="product-rating">
                    <span class="stars">★★★★★</span>
                    <span class="review-count">(${product.reviews_count || 0})</span>
                </div>
                <a href="/product-page.html?slug=${product.slug}" class="product-title">${product.name}</a>
                <div class="card-footer">
                    <button class="buy-btn" onclick="location.href='/product-page.html?slug=${product.slug}'">Buy</button>
                    <span class="price">$${product.price} ${oldPriceHTML}</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}

window.resetCategoryFilters = () => {
    activeFilters.devices.clear();
    activeFilters.models.clear();
    activeFilters.screens.clear();
    activeFilters.storages.clear();
    activeFilters.rams.clear();
    activeFilters.sims.clear();
    activeFilters.colors.clear();
    activeFilters.versions.clear();

    const minInput = document.getElementById('rangeMin');
    const maxInput = document.getElementById('rangeMax');
    if (minInput && maxInput) {
        minInput.value = minInput.min;
        maxInput.value = maxInput.max;
        activeFilters.minPrice = parseInt(minInput.min);
        activeFilters.maxPrice = parseInt(maxInput.max);
        document.getElementById('priceFrom').textContent = `$${minInput.min}`;
        document.getElementById('priceTo').textContent = `$${maxInput.max}`;
    }

    renderFilteredProducts();
};

window.sortCategoryProducts = (sortType) => {
    if (sortType === 'price-asc') {
        loadedProductsList.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price-desc') {
        loadedProductsList.sort((a, b) => b.price - a.price);
    } else if (sortType === 'popular') {
        loadedProductsList.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
    }
    renderFilteredProducts();
};