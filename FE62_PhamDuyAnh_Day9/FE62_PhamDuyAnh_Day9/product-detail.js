let currentProduct = null;
let allProducts = [];
let currentSelectedImage = '';
let currentSelectedColorIndex = -1;
let currentSelectedStorageIndex = -1;
let currentSelectedPrice = 0;

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
    if (!id || !product.name) return null;

    const price = Number(product.price || 0);
    const oldPrice = Number(product.oldPrice || product.price || 0);

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
        galleryImages: Array.isArray(product.galleryImages)
            ? product.galleryImages.filter(Boolean).map(item => String(item))
            : [],
        colorOptions: Array.isArray(product.colorOptions)
            ? product.colorOptions
                .filter(option => option && option.image)
                .map(option => ({
                    name: String(option.name || 'Mặc định'),
                    image: String(option.image),
                    price: Number.isFinite(Number(option.price)) ? Number(option.price) : price
                }))
            : [],
        storageOptions: Array.isArray(product.storageOptions)
            ? product.storageOptions
                .filter(option => option && option.label)
                .map(option => ({
                    label: String(option.label || 'Mặc định'),
                    price: Number.isFinite(Number(option.price)) ? Number(option.price) : price
                }))
            : [],
        brand: product.brand || 'ShopPhone',
        categoryName: product.brand || '',
        detailDescription: product.detailDescription || '',
        shortDescription: product.shortDescription || ''
    };
}

function mergeApiAndAdminProducts(apiItems) {
    const mergedById = new Map();

    (Array.isArray(apiItems) ? apiItems : []).forEach(item => {
        if (item && item.id != null) {
            mergedById.set(Number(item.id), item);
        }
    });

    getAdminProductsFromLocalStorage()
        .map(normalizeAdminProduct)
        .filter(Boolean)
        .forEach(item => {
            mergedById.set(Number(item.id), item);
        });

    return Array.from(mergedById.values());
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);

    if (!id) {
        renderNotFound();
        return;
    }
    loadProductDetail(id);
});

function renderNotFound() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="product-not-found">
            <i class="fas fa-box-open"></i>
            <h2>Không tìm thấy sản phẩm</h2>
            <p>Sản phẩm bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <a href="products.html" class="back-link">Quay lại trang sản phẩm</a>
        </div>
    `;
}

function renderProductDetail(product) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const oldPrice = Number(product.oldPrice || product.price || 0);
    const saveAmount = Math.max(0, oldPrice - product.price);
    const discountPercent = oldPrice > 0 ? Math.round((saveAmount / oldPrice) * 100) : 0;
    const galleryImages = Array.isArray(product.galleryImages) ? product.galleryImages.filter(Boolean) : [];
    const colorOptions = Array.isArray(product.colorOptions) ? product.colorOptions.filter(item => item && item.image) : [];
    const storageOptions = Array.isArray(product.storageOptions) ? product.storageOptions.filter(item => item && item.label) : [];
    const imageCandidates = [product.image, ...galleryImages, ...colorOptions.map(item => item.image)]
        .filter(Boolean);
    currentSelectedImage = imageCandidates[0] || './img/no-image.png';
    currentSelectedColorIndex = colorOptions.length > 0 ? 0 : -1;
    currentSelectedStorageIndex = storageOptions.length > 0 ? 0 : -1;
    currentSelectedPrice = storageOptions.length > 0
        ? Number(storageOptions[0].price || product.price || 0)
        : Number(product.price || 0);

    // Tạo mô tả chi tiết dựa trên thương hiệu và thông số
    const getDetailedDescription = (product) => {
        const descriptions = {
            'Samsung': `${product.name} là flagship mới nhất từ Samsung với màn hình Dynamic AMOLED 2X sắc nét, chip xử lý mạnh mẽ và hệ thống camera chuyên nghiệp. Sản phẩm được trang bị công nghệ sạc nhanh, chống nước IP68 và hỗ trợ S Pen cho trải nghiệm sáng tạo tuyệt vời.`,
            'Apple': `${product.name} được trang bị chip A-series mới nhất, màn hình Super Retina XDR với công nghệ ProMotion, và hệ thống camera Pro với khả năng quay video chuyên nghiệp. Thiết kế cao cấp với khung viền titanium, pin lâu dài và hỗ trợ 5G tốc độ cao.`,
            'Xiaomi': `${product.name} mang đến hiệu năng mạnh mẽ với chip Snapdragon hàng đầu, màn hình AMOLED 120Hz mượt mà và hệ thống sạc siêu nhanh. Camera 108MP chụp ảnh cực nét, pin lớn 5000mAh và thiết kế hiện đại, sang trọng.`,
            'Realme': `${product.name} là smartphone tầm trung với hiệu năng cao, màn hình AMOLED sắc nét và camera chụp đêm ấn tượng. Sạc nhanh 65W, pin lớn và thiết kế trẻ trung, năng động phù hợp với giới trẻ.`,
            'Oppo': `${product.name} sở hữu thiết kế cao cấp với màn hình cong, camera Hasselblad chuyên nghiệp và chip xử lý mạnh mẽ. Sạc nhanh VOOC, pin lâu dài và nhiều tính năng thông minh cho trải nghiệm tuyệt vời.`
        };
        return descriptions[product.brand] || `${product.name} là mẫu smartphone hiện đại với hiệu năng mạnh mẽ, màn hình sắc nét và thời lượng pin ấn tượng, phù hợp cho cả công việc và giải trí hằng ngày.`;
    };

    container.innerHTML = `
        <div class="product-detail-image">
            <div class="product-badge">${product.badge}</div>
            <img id="mainProductImage" src="${currentSelectedImage}" alt="${product.name}">
            ${imageCandidates.length > 1 ? `
            <div class="product-gallery-thumbs">
                ${imageCandidates.map((img, index) => `
                    <button type="button" class="gallery-thumb-btn ${index === 0 ? 'active' : ''}" data-gallery-image="${img}">
                        <img src="${img}" alt="${product.name} ${index + 1}">
                    </button>
                `).join('')}
            </div>` : ''}
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${product.name}</h1>
            <p class="product-detail-brand">Danh mục: <span>${product.brand || 'ShopPhone'}</span></p>

            <div class="product-detail-pricing">
                <span class="price" id="productCurrentPrice">${formatPrice(currentSelectedPrice)}</span>
                <span class="old-price" id="productOldPrice">${formatPrice(oldPrice)}</span>
                <span class="save" id="productSaveText">Tiết kiệm - ${formatPrice(saveAmount)} (${discountPercent}%)</span>
            </div>
            ${storageOptions.length > 0 ? `
            <div class="product-color-options">
                <h3>Phiên bản dung lượng</h3>
                <div class="color-options-list">
                    ${storageOptions.map((option, index) => `
                        <button type="button" class="storage-option-btn ${index === 0 ? 'active' : ''}" data-storage-index="${index}">
                            <span class="color-name">${option.label}</span>
                            <span class="color-price">${formatPrice(option.price)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>` : ''}
            ${colorOptions.length > 0 ? `
            <div class="product-color-options">
                <h3>Màu sắc</h3>
                <div class="color-options-list">
                    ${colorOptions.map((option, index) => `
                        <label class="color-option-btn ${index === 0 ? 'active' : ''}">
                            <input type="radio" name="productColor" value="${index}" ${index === 0 ? 'checked' : ''}>
                            <span class="color-name">${option.name}</span>
                            <span class="color-price">${formatPrice(option.price)}</span>
                        </label>
                    `).join('')}
                </div>
            </div>` : ''}

            <div class="product-detail-specs">
                <h3>Thông số kỹ thuật</h3>
                <div class="specs-grid">
                    <div class="spec-item">
                        <i class="fas fa-memory"></i>
                        <div>
                            <strong>RAM:</strong>
                            <span>Cap nhat theo san pham</span>
                        </div>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-hdd"></i>
                        <div>
                            <strong>Bộ nhớ trong:</strong>
                            <span>Cap nhat theo san pham</span>
                        </div>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-mobile-alt"></i>
                        <div>
                            <strong>Màn hình:</strong>
                            <span>6.7 inch AMOLED</span>
                        </div>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-battery-full"></i>
                        <div>
                            <strong>Pin:</strong>
                            <span>5000 mAh</span>
                        </div>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-camera"></i>
                        <div>
                            <strong>Camera sau:</strong>
                            <span>108 MP</span>
                        </div>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-sim-card"></i>
                        <div>
                            <strong>Hỗ trợ:</strong>
                            <span>5G, NFC</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="product-detail-actions">
                <button class="primary-btn" onclick="addProductToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
                </button>
                <button class="buy-now-btn" onclick="buyNow(${product.id})">
                    <i class="fas fa-bolt"></i> Mua ngay
                </button>
                <a href="products.html" class="secondary-btn">
                    <i class="fas fa-arrow-left"></i> Xem thêm sản phẩm khác
                </a>
            </div>

            <div class="product-features">
                <h3>Ưu điểm nổi bật</h3>
                <ul class="features-list">
                    <li><i class="fas fa-check-circle"></i> Hiệu năng mạnh mẽ, xử lý mượt mà mọi tác vụ</li>
                    <li><i class="fas fa-check-circle"></i> Màn hình sắc nét, màu sắc chân thực</li>
                    <li><i class="fas fa-check-circle"></i> Camera chụp ảnh đẹp, quay video 4K</li>
                    <li><i class="fas fa-check-circle"></i> Pin lâu dài, sạc nhanh</li>
                    <li><i class="fas fa-check-circle"></i> Thiết kế cao cấp, sang trọng</li>
                    <li><i class="fas fa-check-circle"></i> Bảo hành chính hãng 12 tháng</li>
                </ul>
            </div>

            <div class="product-detail-description">
                <h3>Mô tả chi tiết</h3>
                <p>
                    ${product.detailDescription || getDetailedDescription(product)}
                </p>
                <p>
                    Sản phẩm được đóng gói đầy đủ phụ kiện gồm: máy, sạc, cáp, tai nghe, sách hướng dẫn và bảo hành chính hãng. 
                    Chúng tôi cam kết giao hàng nhanh chóng, đảm bảo chất lượng và hỗ trợ khách hàng tận tình.
                </p>
            </div>
        </div>
    `;

    bindProductInteractiveOptions(product);
    updatePriceBySelection(product, Number(currentSelectedPrice || product.price || 0));
}

function bindProductInteractiveOptions(product) {
    const mainImageEl = document.getElementById('mainProductImage');
    const galleryButtons = document.querySelectorAll('.gallery-thumb-btn');
    const colorInputs = document.querySelectorAll('input[name="productColor"]');
    const storageButtons = document.querySelectorAll('.storage-option-btn');

    galleryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextImage = this.dataset.galleryImage;
            if (!nextImage || !mainImageEl) return;
            currentSelectedImage = nextImage;
            mainImageEl.src = nextImage;
            galleryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    colorInputs.forEach(input => {
        input.addEventListener('change', function() {
            const index = Number.parseInt(this.value, 10);
            if (!Number.isFinite(index) || !Array.isArray(product.colorOptions) || !product.colorOptions[index]) return;

            const selected = product.colorOptions[index];
            currentSelectedColorIndex = index;
            updatePriceBySelection(product, Number(selected.price || product.price));

            if (selected.image && mainImageEl) {
                currentSelectedImage = selected.image;
                mainImageEl.src = selected.image;
                galleryButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.galleryImage === selected.image);
                });
            }

            document.querySelectorAll('.color-option-btn').forEach(label => label.classList.remove('active'));
            const optionLabel = this.closest('.color-option-btn');
            if (optionLabel) {
                optionLabel.classList.add('active');
            }
        });
    });

    storageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = Number.parseInt(this.dataset.storageIndex, 10);
            if (!Number.isFinite(index) || !Array.isArray(product.storageOptions) || !product.storageOptions[index]) return;
            const selected = product.storageOptions[index];
            currentSelectedStorageIndex = index;
            updatePriceBySelection(product, Number(selected.price || product.price));
            storageButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function updatePriceBySelection(product, selectedPrice) {
    const currentPriceEl = document.getElementById('productCurrentPrice');
    const oldPriceEl = document.getElementById('productOldPrice');
    const saveTextEl = document.getElementById('productSaveText');
    if (!currentPriceEl || !oldPriceEl || !saveTextEl) return;

    const oldPrice = Number(product.oldPrice || selectedPrice || 0);
    const saveAmount = Math.max(0, oldPrice - selectedPrice);
    const discountPercent = oldPrice > 0 ? Math.round((saveAmount / oldPrice) * 100) : 0;
    currentSelectedPrice = selectedPrice;

    currentPriceEl.textContent = formatPrice(selectedPrice);
    oldPriceEl.textContent = formatPrice(oldPrice);
    saveTextEl.textContent = `Tiết kiệm - ${formatPrice(saveAmount)} (${discountPercent}%)`;
}

// Hàm mua ngay
function buyNow(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product && typeof addToCart !== 'undefined') {
        addToCart(product, 'product');
        // Chuyển đến trang giỏ hàng sau khi thêm
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 500);
    }
}

function renderRelatedProducts(currentProduct) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;

    const related = allProducts
        .filter(p => p.id !== currentProduct.id && p.brand === currentProduct.brand)
        .slice(0, 4);

    relatedContainer.innerHTML = '';

    if (related.length === 0) {
        relatedContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>Hiện chưa có sản phẩm liên quan.</p>
            </div>
        `;
        return;
    }

    related.forEach(product => {
        const saveAmount = product.oldPrice - product.price;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = function() {
            window.location.href = 'product-detail.html?id=' + product.id;
        };

        card.innerHTML = `
            <div class="product-badge">${product.oldPrice > product.price ? 'OFF' : 'NEW'}</div>
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${formatPrice(product.price)}</p>
            <p class="old-price">${formatPrice(product.oldPrice)}</p>
            <p class="save">Tiết kiệm - ${formatPrice(saveAmount)}</p>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addProductToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
            </button>
        `;

        relatedContainer.appendChild(card);
    });
}

// Thêm sản phẩm vào giỏ từ trang chi tiết
function addProductToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product && typeof addToCart !== 'undefined') {
        const selectedColor = Array.isArray(product.colorOptions) && currentSelectedColorIndex >= 0
            ? product.colorOptions[currentSelectedColorIndex]
            : null;
        const selectedStorage = Array.isArray(product.storageOptions) && currentSelectedStorageIndex >= 0
            ? product.storageOptions[currentSelectedStorageIndex]
            : null;
        addToCart({
            ...product,
            price: Number(currentSelectedPrice || selectedStorage?.price || selectedColor?.price || product.price || 0),
            image: currentSelectedImage || selectedColor?.image || product.image,
            selectedColor: selectedColor?.name || null,
            selectedStorage: selectedStorage?.label || null
        }, 'product');
    }
}

// formatPrice dùng lại giống cart.js
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

async function loadProductDetail(id) {
    try {
        const productsPayload = await fetchProductsFromApi({ page: 0, size: 100, sortBy: 'createDate', direction: 'desc' });
        allProducts = mergeApiAndAdminProducts(productsPayload.items || []);
        currentProduct = allProducts.find(p => Number(p.id) === Number(id)) || null;

        if (!currentProduct) {
            renderNotFound();
            return;
        }

        renderProductDetail(currentProduct);
        renderRelatedProducts(currentProduct);
    } catch (error) {
        console.error(error);
        allProducts = mergeApiAndAdminProducts([]);
        currentProduct = allProducts.find(p => Number(p.id) === Number(id)) || null;

        if (!currentProduct) {
            renderNotFound();
            return;
        }

        renderProductDetail(currentProduct);
        renderRelatedProducts(currentProduct);
    }
}


