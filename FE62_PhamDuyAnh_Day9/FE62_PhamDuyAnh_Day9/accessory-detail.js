let currentAccessory = null;
let allAccessories = [];

function getAdminAccessoriesFromLocalStorageDetail() {
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

function isAccessoryProductDetail(item) {
    const category = String(item?.category || item?.categoryName || '').toLowerCase();
    const name = String(item?.name || '').toLowerCase();
    return category.includes('phu kien')
        || category.includes('accessory')
        || name.includes('tai nghe')
        || name.includes('op')
        || name.includes('sac')
        || name.includes('cap')
        || name.includes('pin du phong');
}

function normalizeAccessoryDetail(item) {
    if (!item || typeof item !== 'object') return null;
    const id = Number(item.id);
    if (!id || !item.name) return null;
    return {
        id,
        name: String(item.name),
        price: Number(item.price || 0),
        oldPrice: Number(item.oldPrice || item.price || 0),
        image: item.image || './img/no-image.png',
        brand: item.brand || 'Khác',
        category: item.category || item.categoryName || 'Phụ kiện',
        detailDescription: item.detailDescription || '',
        shortDescription: item.shortDescription || ''
    };
}

function mergeAccessoriesForDetail(apiItems) {
    const mapById = new Map();
    (Array.isArray(apiItems) ? apiItems : [])
        .filter(isAccessoryProductDetail)
        .forEach(item => {
            if (item?.id != null) mapById.set(Number(item.id), normalizeAccessoryDetail(item));
        });

    getAdminAccessoriesFromLocalStorageDetail()
        .map(normalizeAccessoryDetail)
        .filter(Boolean)
        .forEach(item => mapById.set(Number(item.id), item));

    return Array.from(mapById.values()).filter(Boolean);
}

document.addEventListener('DOMContentLoaded', function() {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    if (!id) {
        renderAccessoryNotFound();
        return;
    }
    loadAccessoryDetail(id);
});

function renderAccessoryNotFound() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="product-not-found">
            <i class="fas fa-box-open"></i>
            <h2>Không tìm thấy phụ kiện</h2>
            <p>Phụ kiện bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <a href="accessories.html" class="back-link">Quay lại trang phụ kiện</a>
        </div>
    `;
}

function renderAccessoryDetail(item) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;
    const oldPrice = Number(item.oldPrice || item.price || 0);
    const saveAmount = Math.max(0, oldPrice - item.price);
    const discountPercent = oldPrice > 0 ? Math.round((saveAmount / oldPrice) * 100) : 0;

    container.innerHTML = `
        <div class="product-detail-image">
            <div class="product-badge">${saveAmount > 0 ? 'OFF' : 'NEW'}</div>
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${item.name}</h1>
            <p class="product-detail-brand">Loại phụ kiện: <span>${item.category}</span></p>
            <div class="product-detail-pricing">
                <span class="price">${formatPrice(item.price)}</span>
                <span class="old-price">${formatPrice(oldPrice)}</span>
                <span class="save">Tiết kiệm - ${formatPrice(saveAmount)} (${discountPercent}%)</span>
            </div>
            <div class="product-detail-specs">
                <h3>Thông tin phụ kiện</h3>
                <div class="specs-grid">
                    <div class="spec-item"><i class="fas fa-tag"></i><div><strong>Thương hiệu:</strong><span>${item.brand}</span></div></div>
                    <div class="spec-item"><i class="fas fa-layer-group"></i><div><strong>Danh mục:</strong><span>${item.category}</span></div></div>
                    <div class="spec-item"><i class="fas fa-shield-alt"></i><div><strong>Bảo hành:</strong><span>12 tháng chính hãng</span></div></div>
                </div>
            </div>
            <div class="product-detail-actions">
                <button class="primary-btn" onclick="addAccessoryToCartFromDetail(${item.id})"><i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng</button>
                <button class="buy-now-btn" onclick="buyAccessoryNow(${item.id})"><i class="fas fa-bolt"></i> Mua ngay</button>
                <a href="accessories.html" class="secondary-btn"><i class="fas fa-arrow-left"></i> Quay lại phụ kiện</a>
            </div>
            <div class="product-detail-description">
                <h3>Mô tả chi tiết</h3>
                <p>${item.detailDescription || item.shortDescription || `${item.name} là phụ kiện chất lượng cao, tương thích tốt với nhiều dòng điện thoại và đáp ứng nhu cầu sử dụng hằng ngày.`}</p>
            </div>
        </div>
    `;
}

function renderRelatedAccessories(currentItem) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;
    const related = allAccessories
        .filter(item => item.id !== currentItem.id && item.category === currentItem.category)
        .slice(0, 4);

    if (related.length === 0) {
        relatedContainer.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>Hiện chưa có phụ kiện liên quan.</p></div>`;
        return;
    }

    relatedContainer.innerHTML = related.map(item => {
        const oldPrice = Number(item.oldPrice || item.price || 0);
        const saveAmount = Math.max(0, oldPrice - item.price);
        return `
            <div class="product-card" onclick="window.location.href='accessory-detail.html?id=${item.id}'" style="cursor:pointer;">
                <div class="product-badge">${saveAmount > 0 ? 'OFF' : 'NEW'}</div>
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">${formatPrice(item.price)}</p>
                <p class="old-price">${formatPrice(oldPrice)}</p>
                <p class="save">${saveAmount > 0 ? 'Tiết kiệm - ' + formatPrice(saveAmount) : ''}</p>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addAccessoryToCartFromDetail(${item.id})">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
            </div>
        `;
    }).join('');
}

function addAccessoryToCartFromDetail(id) {
    const item = allAccessories.find(p => Number(p.id) === Number(id));
    if (item && typeof addToCart !== 'undefined') {
        addToCart(item, 'accessory');
    }
}

function buyAccessoryNow(id) {
    addAccessoryToCartFromDetail(id);
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 300);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

async function loadAccessoryDetail(id) {
    try {
        const payload = await fetchProductsFromApi({ page: 0, size: 500, sortBy: 'createDate', direction: 'desc' });
        allAccessories = mergeAccessoriesForDetail(payload.items || []);
    } catch (error) {
        console.error(error);
        allAccessories = mergeAccessoriesForDetail([]);
    }

    currentAccessory = allAccessories.find(item => Number(item.id) === Number(id)) || null;
    if (!currentAccessory) {
        renderAccessoryNotFound();
        return;
    }
    renderAccessoryDetail(currentAccessory);
    renderRelatedAccessories(currentAccessory);
}
