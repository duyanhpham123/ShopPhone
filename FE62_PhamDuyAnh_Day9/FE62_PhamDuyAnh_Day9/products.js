let currentPage = 1;
const itemsPerPage = 12;
let productsData = [];
let filteredProducts = [];

function getAdminProductsFromLocalStorage() {
    try {
        const raw = localStorage.getItem('admin_products');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Cannot parse admin_products from localStorage:', error);
        return [];
    }
}

function normalizeAdminProduct(product) {
    if (!product || typeof product !== 'object') return null;

    const id = Number(product.id);
    const price = Number(product.price || 0);
    const oldPrice = Number(product.oldPrice || product.price || 0);

    if (!id || !product.name) return null;

    let image = String(product.image || '').trim();
    if (!image) {
        image = './img/no-image.png';
    } else if (/^[a-zA-Z]:[\\/]/.test(image)) {
        image = './img/no-image.png';
    }

    return {
        id,
        name: String(product.name),
        price,
        oldPrice,
        image,
        brand: product.brand || 'ShopPhone',
        categoryName: product.brand || '',
        detailDescription: product.detailDescription || '',
        shortDescription: product.shortDescription || '',
        ram: product.ram != null ? Number(product.ram) : null,
        storage: product.storage != null ? Number(product.storage) : null
    };
}

function mergeApiAndAdminProducts(apiItems) {
    const mergedById = new Map();

    (Array.isArray(apiItems) ? apiItems : []).forEach(item => {
        if (item && item.id != null) {
            mergedById.set(Number(item.id), item);
        }
    });

    const adminProducts = getAdminProductsFromLocalStorage()
        .map(normalizeAdminProduct)
        .filter(Boolean);

    // Admin data overrides same id from API so user sees latest edits.
    adminProducts.forEach(item => {
        mergedById.set(Number(item.id), item);
    });

    return Array.from(mergedById.values());
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    setupSearch();
});

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm) {
        filteredProducts = productsData.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            (product.brand || '').toLowerCase().includes(searchTerm)
        );
    } else {
        applyFilters();
        return;
    }
    
    currentPage = 1;
    renderProducts();
}

// Apply filters
function applyFilters() {
    const brandCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value="Samsung"], .filter-group input[type="checkbox"][value="Apple"], .filter-group input[type="checkbox"][value="Xiaomi"], .filter-group input[type="checkbox"][value="Realme"], .filter-group input[type="checkbox"][value="Oppo"]');
    const priceRadios = document.querySelectorAll('input[name="price"]');
    const ramCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value="4"], .filter-group input[type="checkbox"][value="6"], .filter-group input[type="checkbox"][value="8"], .filter-group input[type="checkbox"][value="12"]');
    const storageCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value="64"], .filter-group input[type="checkbox"][value="128"], .filter-group input[type="checkbox"][value="256"], .filter-group input[type="checkbox"][value="512"]');
    const sortSelect = document.getElementById('sortSelect');

    // Get selected brands
    const selectedBrands = Array.from(brandCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Get selected price range
    const selectedPrice = Array.from(priceRadios)
        .find(radio => radio.checked)?.value;

    // Get selected RAM
    const selectedRAM = Array.from(ramCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));

    // Get selected storage
    const selectedStorage = Array.from(storageCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));

    // Filter products
    filteredProducts = productsData.filter(product => {
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
            return false;
        }

        // Price filter
        if (selectedPrice) {
            const priceInMillions = product.price / 1000000;
            switch(selectedPrice) {
                case '0-10':
                    if (priceInMillions >= 10) return false;
                    break;
                case '10-20':
                    if (priceInMillions < 10 || priceInMillions >= 20) return false;
                    break;
                case '20-30':
                    if (priceInMillions < 20 || priceInMillions >= 30) return false;
                    break;
                case '30-50':
                    if (priceInMillions < 30 || priceInMillions >= 50) return false;
                    break;
                case '50+':
                    if (priceInMillions < 50) return false;
                    break;
            }
        }

        // RAM filter
        // RAM/Storage fields are optional when loading from API, skip strict filtering.

        return true;
    });

    // Sort products
    const sortValue = sortSelect.value;
    switch(sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    currentPage = 1;
    renderProducts();
}

// Clear all filters
function clearAllFilters() {
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-group input[type="radio"]').forEach(radio => radio.checked = false);
    document.getElementById('sortSelect').value = 'default';
    document.getElementById('searchInput').value = '';
    filteredProducts = [...productsData];
    currentPage = 1;
    renderProducts();
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!productsGrid) return;

    // Update results count
    if (resultsCount) {
        resultsCount.textContent = filteredProducts.length;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Clear grid
    productsGrid.innerHTML = '';

    // Show empty state if no products
    if (paginatedProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Vui lòng thử lại với bộ lọc khác</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // Render products
    paginatedProducts.forEach(product => {
        const oldPrice = Number(product.oldPrice || product.price || 0);
        const saveAmount = Math.max(0, oldPrice - product.price);
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-badge">${saveAmount > 0 ? 'OFF' : 'NEW'}</div>
            <div class="product-info" onclick="viewProductDetail(${product.id})">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                <p class="old-price">${formatPrice(oldPrice)}</p>
                <p class="save">${saveAmount > 0 ? 'Tiết kiệm - ' + formatPrice(saveAmount) : ''}</p>
            </div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addProductToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
            </button>
        `;
        productsGrid.appendChild(productCard);
    });

    // Render pagination
    renderPagination();
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }

    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

// Add product to cart by ID
function addProductToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product && typeof addToCart !== 'undefined') {
        addToCart(product, 'product');
    }
}

async function loadProducts() {
    try {
        const payload = await fetchProductsFromApi({ page: 0, size: 200, sortBy: 'createDate', direction: 'desc' });
        productsData = mergeApiAndAdminProducts(payload.items || []);
        filteredProducts = [...productsData];
        renderProducts();
    } catch (error) {
        console.error(error);
        productsData = mergeApiAndAdminProducts([]);
        filteredProducts = [...productsData];

        if (productsData.length > 0) {
            renderProducts();
            return;
        }

        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><h3>Không tải được sản phẩm từ API</h3></div>`;
        }
    }
}

// Xem chi tiết sản phẩm
function viewProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}


