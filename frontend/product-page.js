let baseProductPrice = 0;
let currentProductSlug = '';
let selectedReviewRating = 5;

document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-item');
    if (tab) {
        const parent = tab.closest('.product-tabs');
        if (parent) {
            parent.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
        }
        return;
    }

    const optBtn = e.target.closest('.opt-btn');
    if (optBtn) {
        const parent = optBtn.closest('.option-buttons');
        if (parent) {
            parent.querySelectorAll('.opt-btn').forEach(el => el.classList.remove('active'));
            optBtn.classList.add('active');
            recalculateTotalPrice();
        }
        return;
    }

    const colorDot = e.target.closest('.color-dot');
    if (colorDot) {
        const parent = colorDot.closest('.color-options');
        if (parent) {
            parent.querySelectorAll('.color-dot').forEach(el => el.classList.remove('active'));
            colorDot.classList.add('active');
        }
        return;
    }

    const thumb = e.target.closest('.thumb');
    if (thumb) {
        const parent = thumb.closest('.thumbnails-row');
        if (parent) {
            parent.querySelectorAll('.thumb').forEach(el => el.classList.remove('active'));
            thumb.classList.add('active');
            const mainImg = document.querySelector('.main-image-box img');
            const clickedImg = thumb.querySelector('img');
            if (mainImg && clickedImg) {
                mainImg.src = clickedImg.src;
            }
        }
        return;
    }
});

const descriptionBtn = document.getElementById("descriptionBtn");
const descriptionModal = document.getElementById("descriptionModal");
const descriptionClose = document.getElementById("descriptionClose");
const descriptionOverlay = document.querySelector(".description-overlay");

if (descriptionBtn && descriptionModal) {
    descriptionBtn.addEventListener("click", function (event) {
        event.preventDefault();
        descriptionModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    function closeDescriptionModal() {
        descriptionModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    descriptionClose?.addEventListener("click", closeDescriptionModal);
    descriptionOverlay?.addEventListener("click", closeDescriptionModal);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeDescriptionModal();
        }
    });
}

function showNotFoundScreen(queryText) {
    const productContainer = document.querySelector('.product-container');
    const bottomSection = document.querySelector('.bottom-section-layout');
    if (bottomSection) bottomSection.style.display = 'none';

    if (productContainer) {
        productContainer.innerHTML = `
            <div style="padding: 90px 20px; text-align: center; color: #ffffff;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="1.5" style="margin-bottom: 20px;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">Product Not Found</h1>
                <p style="color: #999; font-size: 16px; max-width: 500px; margin: 0 auto 30px;">
                    Sorry, the item <strong>"${queryText}"</strong> is currently out of stock or does not exist in our catalog.
                </p>
                <a href="/index.html" class="buy-btn" style="text-decoration: none; display: inline-block; padding: 12px 28px; font-size: 15px;">
                    Return to Catalog
                </a>
            </div>
        `;
    }
}

function recalculateTotalPrice() {
    let extraCost = 0;

    document.querySelectorAll('.options-matrix .opt-btn.active').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost || 0);
        extraCost += cost;
    });

    document.querySelectorAll('.addons-block input[type="checkbox"]:checked').forEach(cb => {
        const price = parseFloat(cb.dataset.price || 0);
        extraCost += price;
    });

    const finalPrice = Math.round(baseProductPrice + extraCost);

    document.querySelectorAll('.current-price, .sum-price-current').forEach(el => {
        el.textContent = `$${finalPrice.toLocaleString('en-US')}`;
    });
}

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const search = urlParams.get('search');

    if (!slug && !search) {
        showNotFoundScreen('Unknown');
        return;
    }

    try {
        let product = null;

        if (slug) {
            const res = await fetch(`/api/products/${slug}`);
            if (res.ok) product = await res.json();
        } else if (search) {
            const res = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const list = await res.json();
                if (list && list.length > 0) product = list[0];
            }
        }

        if (!product) {
            showNotFoundScreen(search || slug);
            return;
        }

        currentProductSlug = product.slug;
        baseProductPrice = parseFloat(product.price) || 0;

        document.title = `${product.name} | Shop`;

        document.querySelectorAll('.product-title, .summary-title, .product-name').forEach(el => {
            el.textContent = product.name;
        });

        const mainImg = document.querySelector('.main-image-box img');
        if (mainImg && product.main_image) {
            mainImg.src = product.main_image;
            mainImg.alt = product.name;
        }

        const summaryImg = document.querySelector('.summary-image img');
        if (summaryImg && product.main_image) {
            summaryImg.src = product.main_image;
            summaryImg.alt = product.name;
        }

        document.querySelectorAll('.thumbnails-row .thumb img').forEach(img => {
            if (product.main_image) img.src = product.main_image;
        });

        document.querySelectorAll('.old-price, .sum-price-old').forEach(el => {
            if (product.old_price) {
                el.textContent = `$${product.old_price.toLocaleString('en-US')}`;
                el.style.display = 'inline';
            } else {
                el.style.display = 'none';
            }
        });

        document.querySelectorAll('.discount-badge').forEach(el => {
            if (product.discount_label) {
                el.textContent = product.discount_label;
                el.style.display = 'inline-flex';
            } else if (product.old_price && product.old_price > product.price) {
                el.textContent = `-$${product.old_price - product.price}`;
                el.style.display = 'inline-flex';
            } else {
                el.style.display = 'none';
            }
        });

        const codeVal = (product._id || product.slug).slice(-6).toUpperCase();
        const skuEl = document.querySelector('.product-sku');
        const codeEl = document.querySelector('.product-code');
        if (skuEl) skuEl.textContent = `SKU: ${codeVal}`;
        if (codeEl) codeEl.textContent = `Code: ${codeVal}`;

        const stockBadge = document.querySelector('.stock-badge');
        if (stockBadge) {
            stockBadge.textContent = product.stock_status || 'In Stock';
        }

        document.querySelectorAll('.rating .count, .reviews-count').forEach(el => {
            el.textContent = `(${product.reviews_count || 0})`;
        });

        const modalTitle = document.getElementById('modalProductTitle');
        const modalDesc = document.getElementById('modalProductDesc');
        if (modalTitle) modalTitle.textContent = product.name;
        if (modalDesc && product.description) {
            modalDesc.innerHTML = `<p>${product.description}</p>`;
        }

        renderFeatures(product.features);
        renderServices();
        renderOptionsMatrix(product);
        renderAddons(product.addons);
        renderProductSpecifications(product.specs);
        renderProductReviews(product.reviews);
        setupReviewSystem();
        loadRecommendedAccessories(product);

        recalculateTotalPrice();

    } catch (error) {
        console.error('Failed to load product details:', error);
        showNotFoundScreen(search || slug || 'Unknown');
    }
}

function calculateCostForOption(val, index) {
    const v = String(val).toLowerCase();
    if (v.includes('256gb')) return 100;
    if (v.includes('512gb')) return 220;
    if (v.includes('1tb')) return 400;
    if (v.includes('2tb')) return 700;
    if (v.includes('12gb')) return 60;
    if (v.includes('16gb')) return 120;
    if (v.includes('32gb')) return 240;
    if (v.includes('65"')) return 300;
    if (v.includes('77"')) return 750;
    return index * 40;
}

function renderFeatures(features) {
    const container = document.querySelector('.features-grid');
    if (!container) return;

    const list = Array.isArray(features) && features.length > 0 ? features : [
        { icon: '⚙️', label: 'High Performance' },
        { icon: '🔋', label: 'Long Battery Life' },
        { icon: '✨', label: 'Premium Build' },
        { icon: '🛡️', label: '1-Year Warranty' }
    ];

    container.innerHTML = '';
    list.slice(0, 4).forEach(item => {
        const div = document.createElement('div');
        div.className = 'feature-item';
        div.innerHTML = `
            <div class="feature-icon">${item.icon}</div>
            <span>${item.label}</span>
        `;
        container.appendChild(div);
    });
}

function renderServices() {
    const container = document.querySelector('.services-grid');
    if (!container) return;

    const services = [
        { icon: '🚚', label: 'Free Delivery' },
        { icon: '💳', label: 'Instant Payment' },
        { icon: '🔄', label: '14-Day Return' },
        { icon: '🛡️', label: 'Official Support' }
    ];

    container.innerHTML = '';
    services.forEach(item => {
        const div = document.createElement('div');
        div.className = 'service-card';
        div.innerHTML = `
            <div class="service-icon">${item.icon}</div>
            <span>${item.label}</span>
        `;
        container.appendChild(div);
    });
}

function renderOptionsMatrix(product) {
    const container = document.querySelector('.options-matrix');
    if (!container) return;
    container.innerHTML = '';

    const options = Array.isArray(product.options) && product.options.length > 0 ? product.options : [];

    options.forEach(opt => {
        const row = document.createElement('div');
        row.className = 'option-row';
        const btnsHTML = opt.values.map((val, index) => {
            const cost = calculateCostForOption(val, index);
            return `<button class="opt-btn ${val === opt.active ? 'active' : ''}" data-cost="${cost}">${val}</button>`;
        }).join('');

        row.innerHTML = `
            <label class="option-label">${opt.label}:</label>
            <div class="option-buttons">${btnsHTML}</div>
        `;
        container.appendChild(row);
    });

    const colorVal = (product.specs && product.specs.Color) ? product.specs.Color : 'Standard';
    const colorRow = document.createElement('div');
    colorRow.className = 'option-row';
    colorRow.innerHTML = `
        <label class="option-label">Color: <strong style="color:#fff;margin-left:4px;">${colorVal}</strong></label>
        <div class="color-options">
            <span class="color-dot active" style="background-color: #3b5998;"></span>
            <span class="color-dot" style="background-color: #222;"></span>
            <span class="color-dot" style="background-color: #e5e5e5;"></span>
        </div>
    `;
    container.appendChild(colorRow);
}

function renderAddons(addons) {
    const container = document.querySelector('.addons-block');
    if (!container) return;

    if (!Array.isArray(addons) || addons.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `<div class="addons-heading">Addons:</div>`;

    addons.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'addon-item';
        row.innerHTML = `
            <div class="addon-left">
                <label class="switch-addon">
                    <input type="checkbox" id="addon_cb_${index}" data-price="${item.price}">
                    <span class="slider-addon"></span>
                </label>
                <span class="addon-title">${item.title}</span>
            </div>
            <span class="addon-price">+$${item.price}</span>
        `;

        row.querySelector('input').addEventListener('change', recalculateTotalPrice);
        container.appendChild(row);
    });
}

function renderProductSpecifications(specs) {
    const specsContainer = document.getElementById('spec-cont');
    if (!specsContainer) return;

    if (!specs || Object.keys(specs).length === 0) {
        specsContainer.style.display = 'none';
        return;
    }

    specsContainer.style.display = 'block';
    const specsList = specsContainer.querySelector('.specs-list');
    if (!specsList) return;

    specsList.innerHTML = '';
    Object.entries(specs).forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'specs-row';
        row.innerHTML = `
            <span class="specs-label">${label}</span>
            <div class="specs-value-wrapper">
                <span class="specs-value">${value}</span>
            </div>
        `;
        specsList.appendChild(row);
    });
}

function renderProductReviews(reviews) {
    const publishedContainer = document.querySelector('.published-review-block');
    if (!publishedContainer) return;

    if (!Array.isArray(reviews) || reviews.length === 0) {
        publishedContainer.innerHTML = '<p style="color:#777; padding: 15px 0;">No reviews yet. Be the first to leave one!</p>';
        return;
    }

    publishedContainer.style.display = 'block';
    publishedContainer.innerHTML = '';

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    reviews.forEach(review => {
        const rating = Math.min(5, Math.max(1, review.rating || 5));
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const reviewId = review._id || review.id;

        const isMyReview = token && (
            (currentUser.id && review.userId && String(review.userId) === String(currentUser.id)) ||
            (currentUser.nickname && review.author === currentUser.nickname) ||
            (currentUser.email && review.author === currentUser.email.split('@')[0])
        );

        const deleteBtnHTML = (isMyReview && reviewId) 
            ? `<button type="button" class="btn-delete-review" data-id="${reviewId}" style="background: none; border: none; color: #ff4d4f; font-size: 13px; cursor: pointer; margin-left: 14px; text-decoration: underline;">Delete</button>` 
            : '';

        const item = document.createElement('div');
        item.style.marginBottom = '25px';
        item.innerHTML = `
            <div class="review-author-name">
                ${review.author || 'Customer'}
                <span style="font-size: 12px; color: #777; font-weight: normal; margin-left: 8px;">${review.date || ''}</span>
                ${deleteBtnHTML}
            </div>
            <div class="review-stars-given" style="color: #f5a623; margin: 4px 0;">${stars}</div>
            <div class="review-content" style="color: #ddd; margin-top: 6px;">${review.text}</div>
            <hr class="review-divider" style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 15px;">
        `;
        publishedContainer.appendChild(item);
    });

    publishedContainer.querySelectorAll('.btn-delete-review').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Are you sure you want to delete your review?')) return;

            const reviewId = btn.dataset.id;
            try {
                const res = await fetch(`/api/products/${currentProductSlug}/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(data.error || 'Failed to delete review');
                    return;
                }

                renderProductReviews(data.reviews);

                document.querySelectorAll('.reviews-count, .rating .count').forEach(el => {
                    el.textContent = `(${data.reviews_count})`;
                });

                const starsFilled = document.querySelector('.stars-filled');
                if (starsFilled) {
                    const rounded = Math.round(data.rating || 5);
                    starsFilled.textContent = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
                }

            } catch (err) {
                console.error('Error deleting review:', err);
                alert('Connection error');
            }
        });
    });
}

function setupReviewSystem() {
    const reviewForm = document.querySelector('.review-form');
    if (!reviewForm) return;

    const starsContainer = reviewForm.querySelector('.stars-empty');
    if (starsContainer) {
        starsContainer.style.cursor = 'pointer';
        starsContainer.style.fontSize = '20px';
        starsContainer.style.color = '#f5a623';

        const updateStarsDisplay = (count) => {
            starsContainer.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.textContent = i <= count ? '★' : '☆';
                star.dataset.star = i;
                star.style.marginRight = '2px';
                starsContainer.appendChild(star);
            }
        };

        updateStarsDisplay(selectedReviewRating);

        starsContainer.addEventListener('click', (e) => {
            const targetStar = e.target.closest('span');
            if (targetStar && targetStar.dataset.star) {
                selectedReviewRating = parseInt(targetStar.dataset.star);
                updateStarsDisplay(selectedReviewRating);
            }
        });
    }

    const nameInput = reviewForm.querySelector('input[name="user_name"]');
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (nameInput && savedUser.nickname) {
        nameInput.value = savedUser.nickname;
    }

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            const loginModal = document.getElementById('log-in');
            if (loginModal) {
                loginModal.classList.add('active');
            } else {
                alert('Please log in to leave a review.');
            }
            return;
        }

        const textarea = reviewForm.querySelector('textarea[name="user_review"]');
        const text = textarea?.value?.trim();
        if (!text) return;

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const res = await fetch(`/api/products/${currentProductSlug}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: selectedReviewRating,
                    text
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to submit review');
                return;
            }

            textarea.value = '';
            renderProductReviews(data.reviews);

            document.querySelectorAll('.reviews-count, .rating .count').forEach(el => {
                el.textContent = `(${data.reviews_count})`;
            });

            const starsFilled = document.querySelector('.stars-filled');
            if (starsFilled) {
                const rounded = Math.round(data.rating || 5);
                starsFilled.textContent = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
            }

            alert('Thank you! Your review has been published.');
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Connection error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

async function loadRecommendedAccessories(currentProduct) {
    const container = document.querySelector('.acc-grid-container');
    if (!container) return;

    try {
        const res = await fetch('/api/products');
        if (!res.ok) return;

        const all = await res.json();
        const related = all.filter(p => p.slug !== currentProduct.slug).slice(0, 4);

        container.innerHTML = '';
        related.forEach(acc => {
            const card = document.createElement('div');
            card.className = 'acc-card';
            card.innerHTML = `
                <div class="acc-image"><img src="${acc.main_image}" alt="${acc.name}"></div>
                <div class="acc-info">
                    <div class="acc-title">${acc.name}</div>
                    <div class="acc-price-block">
                        <div class="acc-price-current">$${acc.price}</div>
                        ${acc.old_price ? `<div class="acc-price-old">$${acc.old_price}</div>` : ''}
                    </div>
                    <button class="btn-acc-add" onclick="location.href='/product-page.html?slug=${acc.slug}'">View</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error('Error loading accessories:', e);
    }
}

const accPrev = document.querySelector('.acc-products-carousel .carousel-nav.prev');
const accNext = document.querySelector('.acc-products-carousel .carousel-nav.next');
const accGrid = document.querySelector('.acc-grid-container');

accPrev?.addEventListener('click', () => {
    accGrid?.scrollBy({ left: -260, behavior: 'smooth' });
});
accNext?.addEventListener('click', () => {
    accGrid?.scrollBy({ left: 260, behavior: 'smooth' });
});

loadProductDetails();