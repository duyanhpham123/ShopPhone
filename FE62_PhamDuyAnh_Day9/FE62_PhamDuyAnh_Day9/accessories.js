let currentPage = 1;
const itemsPerPage = 12;
let accessoriesData = [];
let filteredAccessories = [];

function getAdminAccessoriesFromLocalStorage() {
    try {
        const raw = localStorage.getItem('admin_accessories');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Cannot parse admin_accessories:', error);
        return [];
    }
}

function normalizeAdminAccessory(item) {
    if (!item || typeof item !== 'object') return null;
    const id = Number(item.id);
    if (!id || !item.name) return null;

    const price = Number(item.price || 0);
    const oldPrice = Number(item.oldPrice || item.price || 0);
    let image = String(item.image || '').trim();
    if (!image) image = './img/no-image.png';

    return {
        id,
        name: String(item.name),
        price,
        oldPrice,
        image,
        brand: item.brand || 'Khác',
        category: item.category || 'Phụ kiện',
        categoryName: item.category || 'Phụ kiện'
    };
}

function mergeAccessories(apiItems) {
    const mapById = new Map();

    (Array.isArray(apiItems) ? apiItems : []).forEach(item => {
        if (item && item.id != null) {
            mapById.set(Number(item.id), item);
        }
    });

    getAdminAccessoriesFromLocalStorage()
        .map(normalizeAdminAccessory)
        .filter(Boolean)
        .forEach(item => {
            mapById.set(Number(item.id), item);
        });

    return Array.from(mapById.values());
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadAccessories();
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
        filteredAccessories = accessoriesData.filter(accessory =>
            accessory.name.toLowerCase().includes(searchTerm) ||
            accessory.category.toLowerCase().includes(searchTerm) ||
            accessory.brand.toLowerCase().includes(searchTerm)
        );
    } else {
        applyFilters();
        return;
    }
    
    currentPage = 1;
    renderAccessories();
}

// Apply filters
function applyFilters() {
    const categoryCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value="Tai nghe"], .filter-group input[type="checkbox"][value="Ốp lưng"], .filter-group input[type="checkbox"][value="Sạc"], .filter-group input[type="checkbox"][value="Pin"], .filter-group input[type="checkbox"][value="Dán màn hình"], .filter-group input[type="checkbox"][value="Giá đỡ"], .filter-group input[type="checkbox"][value="Chuột"]');
    const priceRadios = document.querySelectorAll('input[name="price"]');
    const brandCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value="Apple"], .filter-group input[type="checkbox"][value="Samsung"], .filter-group input[type="checkbox"][value="Xiaomi"], .filter-group input[type="checkbox"][value="Khác"]');
    const sortSelect = document.getElementById('sortSelect');

    // Get selected categories
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Get selected price range
    const selectedPrice = Array.from(priceRadios)
        .find(radio => radio.checked)?.value;

    // Get selected brands
    const selectedBrands = Array.from(brandCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Filter accessories
    filteredAccessories = accessoriesData.filter(accessory => {
        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(accessory.category)) {
            return false;
        }

        // Price filter
        if (selectedPrice) {
            const priceInThousands = accessory.price / 1000;
            switch(selectedPrice) {
                case '0-100':
                    if (priceInThousands >= 100) return false;
                    break;
                case '100-300':
                    if (priceInThousands < 100 || priceInThousands >= 300) return false;
                    break;
                case '300-500':
                    if (priceInThousands < 300 || priceInThousands >= 500) return false;
                    break;
                case '500+':
                    if (priceInThousands < 500) return false;
                    break;
            }
        }

        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(accessory.brand)) {
            return false;
        }

        return true;
    });

    // Sort accessories
    const sortValue = sortSelect.value;
    switch(sortValue) {
        case 'price-asc':
            filteredAccessories.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredAccessories.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredAccessories.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredAccessories.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    currentPage = 1;
    renderAccessories();
}

// Clear all filters
function clearAllFilters() {
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-group input[type="radio"]').forEach(radio => radio.checked = false);
    document.getElementById('sortSelect').value = 'default';
    document.getElementById('searchInput').value = '';
    filteredAccessories = [...accessoriesData];
    currentPage = 1;
    renderAccessories();
}

// Render accessories
function renderAccessories() {
    const accessoriesGrid = document.getElementById('accessoriesGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!accessoriesGrid) return;

    // Update results count
    if (resultsCount) {
        resultsCount.textContent = filteredAccessories.length;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAccessories = filteredAccessories.slice(startIndex, endIndex);

    // Clear grid
    accessoriesGrid.innerHTML = '';

    // Show empty state if no accessories
    if (paginatedAccessories.length === 0) {
        accessoriesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy phụ kiện</h3>
                <p>Vui lòng thử lại với bộ lọc khác</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // Render accessories
    paginatedAccessories.forEach(accessory => {
        const oldPrice = Number(accessory.oldPrice || accessory.price || 0);
        const saveAmount = Math.max(0, oldPrice - accessory.price);
        const accessoryCard = document.createElement('div');
        accessoryCard.className = 'product-card';
        accessoryCard.style.cursor = 'pointer';
        accessoryCard.onclick = function() {
            viewAccessoryDetail(accessory.id);
        };
        accessoryCard.innerHTML = `
            <div class="product-badge">${saveAmount > 0 ? 'OFF' : 'NEW'}</div>
            <img src="${accessory.image}" alt="${accessory.name}">
            <h3>${accessory.name}</h3>
            <p class="price">${formatPrice(accessory.price)}</p>
            <p class="old-price">${formatPrice(oldPrice)}</p>
            <p class="save">${saveAmount > 0 ? 'Tiết kiệm - ' + formatPrice(saveAmount) : ''}</p>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addAccessoryToCart(${accessory.id})">
                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
            </button>
        `;
        accessoriesGrid.appendChild(accessoryCard);
    });

    // Render pagination
    renderPagination();
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredAccessories.length / itemsPerPage);
    
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
    const totalPages = Math.ceil(filteredAccessories.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderAccessories();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

// Add accessory to cart by ID
function addAccessoryToCart(accessoryId) {
    const accessory = accessoriesData.find(a => a.id === accessoryId);
    if (accessory && typeof addToCart !== 'undefined') {
        addToCart(accessory, 'accessory');
    }
}

function viewAccessoryDetail(accessoryId) {
    window.location.href = `accessory-detail.html?id=${accessoryId}`;
}

function isAccessoryProduct(p) {
    const category = (p.categoryName || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    return category.includes('phu kien')
        || category.includes('accessory')
        || name.includes('op')
        || name.includes('tai nghe')
        || name.includes('cap')
        || name.includes('sac')
        || name.includes('pin du phong');
}

async function loadAccessories() {
    // Ưu tiên dữ liệu phụ kiện từ nguồn riêng (admin_accessories).
    // Nếu chưa có dữ liệu, mới fallback sang API products (nếu backend đang chạy).
    try {
        const fromAdmin = mergeAccessories([])
            .map(item => ({
                ...item,
                category: item.category || item.categoryName || 'Phụ kiện'
            }));

        if (fromAdmin.length > 0) {
            accessoriesData = fromAdmin;
            filteredAccessories = [...accessoriesData];
            renderAccessories();
            return;
        }

        // Fallback: backend có thể chưa có endpoint phụ kiện riêng,
        // nên tạm lấy từ products API và lọc phụ kiện.
        const payload = await fetchProductsFromApi({ page: 0, size: 500, sortBy: 'createDate', direction: 'desc' });
        accessoriesData = mergeAccessories(payload.items || [])
            .filter(isAccessoryProduct)
            .map(item => ({
                ...item,
                category: item.category || item.categoryName || 'Phụ kiện'
            }));

        filteredAccessories = [...accessoriesData];
        renderAccessories();
    } catch (error) {
        console.error(error);
        accessoriesData = mergeAccessories([])
            .map(item => ({
                ...item,
                category: item.category || item.categoryName || 'Phụ kiện'
            }));
        filteredAccessories = [...accessoriesData];
        renderAccessories();

        // Nếu vẫn rỗng thì hiển thị trạng thái "chưa có", không báo lỗi API.
        const accessoriesGrid = document.getElementById('accessoriesGrid');
        if (accessoriesGrid && filteredAccessories.length === 0) {
            accessoriesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>Chưa có phụ kiện</h3>
                    <p>Hãy thêm phụ kiện trong trang quản trị hoặc bật backend để lấy dữ liệu.</p>
                </div>
            `;
        }
    }
}

