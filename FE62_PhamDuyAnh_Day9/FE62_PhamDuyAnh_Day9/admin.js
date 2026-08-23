// Admin Management System — gốc API: config.js đặt window.SHOP_API_ORIGIN

const ADMIN_API_BASE_URL =
    typeof window !== 'undefined' && window.SHOP_API_ORIGIN
        ? String(window.SHOP_API_ORIGIN).replace(/\/$/, '')
        : 'http://127.0.0.1:8080';

async function authRequest(path, options = {}) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
        credentials: 'include',
        ...options
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    return { response, payload };
}

// Check if user is logged in as admin
async function checkAdminAuth() {
    const currentPage = window.location.pathname.split('/').pop();

    try {
        const { response, payload } = await authRequest('/api/auth/me');
        const authenticated = response.ok && payload?.authenticated;
        const roles = Array.isArray(payload?.roles) ? payload.roles : [];
        const isAdminOrStaff = roles.includes('ADMIN') || roles.includes('STAFF');

        if (currentPage === 'admin-login.html') {
            if (authenticated && isAdminOrStaff) {
                window.location.href = 'admin.html';
            }
            return;
        }

        if (!authenticated || !isAdminOrStaff) {
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        window.location.href = 'admin-login.html';
    }
}

// Admin Login
document.addEventListener('DOMContentLoaded', async function() {
    // Check auth on admin pages
    if (window.location.pathname.includes('admin')) {
        await checkAdminAuth();
    }
    
    // Handle login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Load dashboard data
    if (window.location.pathname.includes('admin.html')) {
        loadDashboardData();
        initPromoManagement();
    }
    
    // Load products management
    if (window.location.pathname.includes('admin-products.html')) {
        // Initialize both products and accessories data if not in localStorage
        if (typeof productsData !== 'undefined' && !localStorage.getItem('admin_products')) {
            saveProducts(productsData);
        }
        if (typeof accessoriesData !== 'undefined' && !localStorage.getItem('admin_accessories')) {
            saveAccessories(accessoriesData);
        }
        
        loadProducts();
        // Set initial table header
        const thead = document.getElementById('tableHeader');
        if (thead) {
            thead.innerHTML = `
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Giá</th>
                <th>Giá cũ</th>
                <th>Tồn kho</th>
                <th>RAM</th>
                <th>Bộ nhớ</th>
                <th>Badge</th>
                <th>Thao tác</th>
            `;
        }
    }
    
    // Load orders management
    if (window.location.pathname.includes('admin-orders.html')) {
        loadOrders();
    }
});

async function handleAdminLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    try {
        const { response, payload } = await authRequest('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok || !payload?.authenticated) {
            throw new Error(payload?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
        }

        const roles = Array.isArray(payload?.roles) ? payload.roles : [];
        const isAdminOrStaff = roles.includes('ADMIN') || roles.includes('STAFF');
        if (!isAdminOrStaff) {
            throw new Error('Tài khoản không có quyền truy cập trang quản trị.');
        }

        localStorage.setItem('admin_username', payload.username || username);
        window.location.href = 'admin.html';
    } catch (error) {
        alert(error.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    }
}

async function logoutAdmin() {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) return;

    try {
        await authRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        // Continue local cleanup even if request fails.
    }

    localStorage.removeItem('admin_username');
    window.location.href = 'admin-login.html';
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Dashboard Functions
function loadDashboardData() {
    // Load products count
    const products = getProducts();
    document.getElementById('totalProducts').textContent = products.length;
    
    // Load orders count
    const orders = getOrders();
    document.getElementById('totalOrders').textContent = orders.length;
    
    // Calculate revenue
    const revenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = formatPrice(revenue);
    
    // Load users count (mock data)
    document.getElementById('totalUsers').textContent = '0';
    
    // Load recent orders
    loadRecentOrders();
    
    // Load top products
    loadTopProducts();
}

function loadRecentOrders() {
    const orders = getOrders().slice(0, 5);
    const tbody = document.getElementById('recentOrdersTable');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có đơn hàng nào</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customerName || 'Khách hàng'}</td>
            <td>${order.items.length} sản phẩm</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.date)}</td>
        </tr>
    `).join('');
}

function loadTopProducts() {
    const products = getProducts();
    const orders = getOrders();
    const tbody = document.getElementById('topProductsTable');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có dữ liệu</td></tr>';
        const totalImportedProductsEl = document.getElementById('totalImportedProducts');
        if (totalImportedProductsEl) {
            totalImportedProductsEl.textContent = '0';
        }
        return;
    }
    
    const soldByProductId = new Map();
    orders
        .filter(order => order && order.status !== 'cancelled')
        .forEach(order => {
            (Array.isArray(order.items) ? order.items : []).forEach(item => {
                const productId = Number(item?.id ?? item?.productId);
                const quantity = Number(item?.quantity || 0);
                if (!Number.isFinite(productId) || productId <= 0 || quantity <= 0) return;
                soldByProductId.set(productId, (soldByProductId.get(productId) || 0) + quantity);
            });
        });

    const topProducts = products
        .map(product => {
            const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0;
            const sold = soldByProductId.get(Number(product.id)) || 0;
            const imported = sold + stock;
            return { ...product, sold, stock, imported };
        })
        .sort((a, b) => b.sold - a.sold || Number(b.id) - Number(a.id))
        .slice(0, 5);

    const totalImportedProducts = products.reduce((sum, product) => {
        const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0;
        const sold = soldByProductId.get(Number(product.id)) || 0;
        return sum + stock + sold;
    }, 0);

    const totalImportedProductsEl = document.getElementById('totalImportedProducts');
    if (totalImportedProductsEl) {
        totalImportedProductsEl.textContent = totalImportedProducts;
    }

    tbody.innerHTML = topProducts.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.sold}</td>
            <td>${product.imported}</td>
            <td>${product.stock > 0 ? product.stock : 'Hết hàng'}</td>
        </tr>
    `).join('');
}

function getPromoCodes() {
    try {
        const stored = localStorage.getItem('admin_promo_codes');
        if (!stored) return {};
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Cannot parse admin_promo_codes:', error);
        return {};
    }
}

function savePromoCodes(codes) {
    localStorage.setItem('admin_promo_codes', JSON.stringify(codes || {}));
}

function getPromoExpiries() {
    try {
        const stored = localStorage.getItem('admin_promo_expiries');
        if (!stored) return {};
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Cannot parse admin_promo_expiries:', error);
        return {};
    }
}

function savePromoExpiries(expiries) {
    localStorage.setItem('admin_promo_expiries', JSON.stringify(expiries || {}));
}

async function syncPromoCodesFromApi() {
    if (typeof fetchPromoCodesFromApi !== 'function') return;
    const items = await fetchPromoCodesFromApi();
    const codes = {};
    const expiries = {};
    items.forEach(item => {
        const code = String(item?.code || '').toUpperCase().trim();
        const discountRate = Number(item?.discountRate);
        if (!code || !Number.isFinite(discountRate)) return;
        codes[code] = discountRate;
        if (item?.expiresAt) {
            expiries[code] = item.expiresAt;
        }
    });
    savePromoCodes(codes);
    savePromoExpiries(expiries);
}

function initPromoManagement() {
    const promoForm = document.getElementById('promoForm');
    if (!promoForm) return;

    promoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await addPromoCode();
    });

    syncPromoCodesFromApi()
        .catch(error => {
            console.error('Cannot sync promo codes from API:', error);
        })
        .finally(() => {
            renderPromoCodes();
        });
}

async function addPromoCode() {
    const codeInput = document.getElementById('promoCodeInput');
    const percentInput = document.getElementById('promoPercentInput');
    const expiryInput = document.getElementById('promoExpiryInput');
    if (!codeInput || !percentInput || !expiryInput) return;

    const code = String(codeInput.value || '').toUpperCase().trim();
    const percent = Number(percentInput.value || 0);
    const expiryAt = String(expiryInput.value || '').trim();

    if (!code) {
        alert('Vui lòng nhập mã giảm giá!');
        return;
    }

    if (!Number.isFinite(percent) || percent < 1 || percent > 10) {
        alert('Phần trăm giảm chỉ được từ 1 đến 10.');
        return;
    }

    if (!expiryAt) {
        alert('Vui lòng chọn thời gian hết hạn.');
        return;
    }

    const expiryDate = new Date(expiryAt);
    if (Number.isNaN(expiryDate.getTime())) {
        alert('Thời gian hết hạn không hợp lệ.');
        return;
    }

    if (expiryDate.getTime() <= Date.now()) {
        alert('Thời gian hết hạn phải lớn hơn thời điểm hiện tại.');
        return;
    }

    try {
        if (typeof savePromoCodeToApi === 'function') {
            await savePromoCodeToApi({
                code,
                discountRate: percent / 100,
                expiresAt: expiryDate.toISOString()
            });
            await syncPromoCodesFromApi();
        } else {
            const currentCodes = getPromoCodes();
            const currentExpiries = getPromoExpiries();
            currentCodes[code] = percent / 100;
            currentExpiries[code] = expiryDate.toISOString();
            savePromoCodes(currentCodes);
            savePromoExpiries(currentExpiries);
        }

        renderPromoCodes();
        codeInput.value = '';
        percentInput.value = '';
        expiryInput.value = '';
    } catch (error) {
        alert(error.message || 'Không thể lưu mã giảm giá.');
    }
}

async function deletePromoCode(code) {
    const currentCodes = getPromoCodes();
    const currentExpiries = getPromoExpiries();
    if (!currentCodes[code]) return;

    if (!confirm(`Xóa mã giảm giá ${code}?`)) return;

    try {
        if (typeof deletePromoCodeFromApi === 'function') {
            await deletePromoCodeFromApi(code);
            await syncPromoCodesFromApi();
        } else {
            delete currentCodes[code];
            delete currentExpiries[code];
            savePromoCodes(currentCodes);
            savePromoExpiries(currentExpiries);
        }
        renderPromoCodes();
    } catch (error) {
        alert(error.message || 'Không thể xóa mã giảm giá.');
    }
}

function renderPromoCodes() {
    const tbody = document.getElementById('promoCodesTableBody');
    if (!tbody) return;

    const codes = getPromoCodes();
    const expiries = getPromoExpiries();
    const entries = Object.entries(codes);
    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chưa có mã giảm giá nào</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(([code, value]) => `
        <tr>
            <td>${code}</td>
            <td>${Math.round(Number(value) * 100)}%</td>
            <td>${formatPromoExpiry(expiries[code])}</td>
            <td>
                <button class="btn-danger" onclick="deletePromoCode('${code}')">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        </tr>
    `).join('');
}

// Products Management
let currentProductPage = 1;
const productsPerPage = 10;
let filteredProductsList = [];
let currentProductType = 'products'; // 'products' or 'accessories'

function normalizeProductImageInput(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) return './img/no-image.png';

    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    const normalized = value.replace(/\\/g, '/');

    // Absolute path on local machine is not usable from browser URL.
    if (/^[a-zA-Z]:\//.test(normalized)) {
        return './img/no-image.png';
    }

    if (normalized.startsWith('UploadFiles/')) {
        const origin = (window.SHOP_API_ORIGIN || 'http://127.0.0.1:8080').replace(/\/$/, '');
        return `${origin}/${normalized}`;
    }

    if (normalized.startsWith('/UploadFiles/')) {
        const origin = (window.SHOP_API_ORIGIN || 'http://127.0.0.1:8080').replace(/\/$/, '');
        return `${origin}${normalized}`;
    }

    if (normalized.startsWith('./') || normalized.startsWith('../') || normalized.startsWith('/')) {
        return normalized;
    }

    // If user enters "img/file.jpg", keep it as local relative path.
    if (normalized.startsWith('img/')) {
        return `./${normalized}`;
    }

    return normalized;
}

function parseGalleryImages(rawValue) {
    return String(rawValue || '')
        .split(/\r?\n/)
        .map(item => normalizeProductImageInput(item))
        .filter(Boolean);
}

function parseColorOptions(rawValue, fallbackPrice) {
    return String(rawValue || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const [nameRaw, imageRaw, priceRaw] = line.split('|').map(part => String(part || '').trim());
            const parsedPrice = Number.parseInt(priceRaw, 10);
            return {
                name: nameRaw || 'Mặc định',
                image: normalizeProductImageInput(imageRaw),
                price: Number.isFinite(parsedPrice) ? parsedPrice : fallbackPrice
            };
        })
        .filter(item => item.image);
}

function parseStorageOptions(rawValue, fallbackPrice) {
    return String(rawValue || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const [labelRaw, priceRaw] = line.split('|').map(part => String(part || '').trim());
            const parsedPrice = Number.parseInt(priceRaw, 10);
            return {
                label: labelRaw || 'Mặc định',
                price: Number.isFinite(parsedPrice) ? parsedPrice : fallbackPrice
            };
        })
        .filter(item => item.label);
}

function syncColorRowsToHiddenInput() {
    const hiddenInput = document.getElementById('productColors');
    const rows = document.querySelectorAll('#productColorsList .color-row-item');
    if (!hiddenInput || !rows.length) {
        if (hiddenInput) hiddenInput.value = '';
        return;
    }

    hiddenInput.value = Array.from(rows)
        .map(row => {
            const name = row.querySelector('.color-name-input')?.value?.trim() || '';
            const image = row.querySelector('.color-image-input')?.value?.trim() || '';
            const price = row.querySelector('.color-price-input')?.value?.trim() || '';
            if (!name && !image && !price) return '';
            return `${name}|${image}|${price}`;
        })
        .filter(Boolean)
        .join('\n');
}

function addColorRow(colorData = null) {
    const list = document.getElementById('productColorsList');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'color-row-item';
    row.innerHTML = `
        <label class="color-default-radio">
            <input type="radio" name="adminColorDefault">
        </label>
        <input type="text" class="color-name-input" placeholder="Tên màu" value="${colorData?.name || ''}">
        <input type="text" class="color-image-input" placeholder="./img/sp-cam.jpg" value="${colorData?.image || ''}">
        <input type="number" class="color-price-input" placeholder="Giá" min="0" value="${Number.isFinite(Number(colorData?.price)) ? Number(colorData.price) : ''}">
        <button type="button" class="btn-danger color-remove-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', syncColorRowsToHiddenInput);
    });

    row.querySelector('.color-remove-btn')?.addEventListener('click', function() {
        row.remove();
        const firstRadio = document.querySelector('#productColorsList input[type="radio"]');
        if (firstRadio && !document.querySelector('#productColorsList input[type="radio"]:checked')) {
            firstRadio.checked = true;
        }
        syncColorRowsToHiddenInput();
    });

    const radio = row.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = list.children.length === 0;
        radio.addEventListener('change', syncColorRowsToHiddenInput);
    }

    list.appendChild(row);
    syncColorRowsToHiddenInput();
}

function renderColorRows(rawValue) {
    const list = document.getElementById('productColorsList');
    if (!list) return;
    list.innerHTML = '';

    const parsed = parseColorOptions(rawValue, 0);
    if (parsed.length === 0) {
        addColorRow();
        return;
    }

    parsed.forEach(item => addColorRow(item));
}

function getProducts() {
    const stored = localStorage.getItem('admin_products');
    if (stored) {
        return JSON.parse(stored).map(item => ({
            ...item,
            stock: Number.isFinite(Number(item?.stock)) ? Number(item.stock) : 0
        }));
    }
    // Load from products.js if available
    if (typeof productsData !== 'undefined') {
        saveProducts(productsData);
        return productsData;
    }
    return [];
}

function getAccessories() {
    const stored = localStorage.getItem('admin_accessories');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(item => ({
                    ...item,
                    stock: Number.isFinite(Number(item?.stock)) ? Number(item.stock) : 0
                }));
            }
        } catch (e) {
            console.error('Error parsing accessories from localStorage:', e);
        }
    }
    // Load from accessories.js if available
    if (typeof accessoriesData !== 'undefined' && Array.isArray(accessoriesData) && accessoriesData.length > 0) {
        saveAccessories(accessoriesData);
        return accessoriesData;
    }
    return [];
}

function saveProducts(products) {
    localStorage.setItem('admin_products', JSON.stringify(products));
    // Also update products.js data if available
    if (typeof productsData !== 'undefined') {
        productsData.length = 0;
        productsData.push(...products);
    }
}

function saveAccessories(accessories) {
    localStorage.setItem('admin_accessories', JSON.stringify(accessories));
    // Also update accessories.js data if available
    if (typeof accessoriesData !== 'undefined') {
        accessoriesData.length = 0;
        accessoriesData.push(...accessories);
    }
}

function switchProductType(type) {
    currentProductType = type;
    currentProductPage = 1;
    
    // Update tabs
    document.getElementById('tabProducts').classList.toggle('active', type === 'products');
    document.getElementById('tabAccessories').classList.toggle('active', type === 'accessories');
    
    // Show/hide category filter
    const categoryFilterBox = document.getElementById('categoryFilterBox');
    categoryFilterBox.style.display = type === 'accessories' ? 'block' : 'none';
    
    // Clear search and filters
    document.getElementById('productSearch').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    
    // Load appropriate data
    if (type === 'products') {
        loadProducts();
    } else {
        loadAccessories();
    }
}

function loadProducts() {
    // Initialize products data if not in localStorage
    if (typeof productsData !== 'undefined' && !localStorage.getItem('admin_products')) {
        saveProducts(productsData);
    }
    
    const products = getProducts();
    filteredProductsList = products;
    currentProductPage = 1;
    renderProducts();

    // Sync products from backend API so admin can manage DB data too.
    syncProductsFromApi().catch(error => {
        console.error('Cannot sync products from API:', error);
    });
}

async function syncProductsFromApi() {
    if (typeof fetchProductsFromApi !== 'function') return;
    const payload = await fetchProductsFromApi({ page: 0, size: 500, sortBy: 'createDate', direction: 'desc' });
    const apiProducts = (payload.items || []).map(item => ({
        id: Number(item.id),
        name: item.name || 'Sản phẩm',
        brand: item.categoryName || 'Khác',
        price: Number(item.price || 0),
        oldPrice: Number(item.oldPrice || item.price || 0),
        stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 0,
        ram: Number.isFinite(Number(item.ram)) ? Number(item.ram) : 0,
        storage: Number.isFinite(Number(item.storage)) ? Number(item.storage) : 0,
        image: item.image || './img/no-image.png',
        badge: item.badge || 'OFF'
    }));

    const localProducts = getProducts();
    const mapById = new Map();
    localProducts.forEach(product => mapById.set(Number(product.id), product));
    apiProducts.forEach(product => {
        if (!product.id) return;
        mapById.set(Number(product.id), {
            ...product,
            ...(mapById.get(Number(product.id)) || {})
        });
    });

    const merged = Array.from(mapById.values()).sort((a, b) => Number(b.id) - Number(a.id));
    saveProducts(merged);
    filteredProductsList = merged;
    currentProductPage = 1;
    renderProducts();
}

function loadAccessories() {
    // Initialize accessories data if not in localStorage
    if (typeof accessoriesData !== 'undefined') {
        const stored = localStorage.getItem('admin_accessories');
        if (!stored || stored === '[]' || JSON.parse(stored).length === 0) {
            saveAccessories(accessoriesData);
        }
    }
    
    const accessories = getAccessories();
    filteredProductsList = accessories;
    currentProductPage = 1;
    renderProducts();
}

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const thead = document.getElementById('tableHeader');
    const totalProducts = filteredProductsList.length;
    
    // Calculate pagination
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentProductPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProductsList.slice(startIndex, endIndex);
    
    // Update info text
    if (document.getElementById('totalProductsCount')) {
        document.getElementById('totalProductsCount').textContent = totalProducts;
        document.getElementById('showingFrom').textContent = totalProducts > 0 ? startIndex + 1 : 0;
        document.getElementById('showingTo').textContent = Math.min(endIndex, totalProducts);
    }
    
    // Render table header based on type
    if (currentProductType === 'products') {
        thead.innerHTML = `
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Thương hiệu</th>
            <th>Giá</th>
            <th>Giá cũ</th>
            <th>Tồn kho</th>
            <th>RAM</th>
            <th>Bộ nhớ</th>
            <th>Badge</th>
            <th>Thao tác</th>
        `;
    } else {
        thead.innerHTML = `
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Giá</th>
            <th>Giá cũ</th>
            <th>Tồn kho</th>
            <th>Badge</th>
            <th>Thao tác</th>
        `;
    }
    
    if (paginatedProducts.length === 0) {
        const colspan = currentProductType === 'products' ? 11 : 10;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">Chưa có sản phẩm nào</td></tr>`;
        renderPagination();
        return;
    }
    
    if (currentProductType === 'products') {
        tbody.innerHTML = paginatedProducts.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}"></td>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${formatPrice(product.oldPrice)}</td>
                <td>${Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0}</td>
                <td>${product.ram || '-'} GB</td>
                <td>${product.storage || '-'} GB</td>
                <td><span class="status-badge">${product.badge || 'OFF'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-success" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn-danger" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = paginatedProducts.map(accessory => `
            <tr>
                <td>${accessory.id}</td>
                <td><img src="${accessory.image}" alt="${accessory.name}"></td>
                <td>${accessory.name}</td>
                <td>${accessory.category || '-'}</td>
                <td>${accessory.brand}</td>
                <td>${formatPrice(accessory.price)}</td>
                <td>${formatPrice(accessory.oldPrice)}</td>
                <td>${Number.isFinite(Number(accessory.stock)) ? Number(accessory.stock) : 0}</td>
                <td><span class="status-badge">${accessory.badge || 'OFF'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-success" onclick="editProduct(${accessory.id})">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn-danger" onclick="deleteProduct(${accessory.id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProductsList.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" onclick="changeProductPage(${currentProductPage - 1})" ${currentProductPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Trước
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentProductPage - 1 && i <= currentProductPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentProductPage ? 'active' : ''}" onclick="changeProductPage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentProductPage - 2 || i === currentProductPage + 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" onclick="changeProductPage(${currentProductPage + 1})" ${currentProductPage === totalPages ? 'disabled' : ''}>
            Sau <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changeProductPage(page) {
    const totalPages = Math.ceil(filteredProductsList.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentProductPage = page;
    renderProducts();
    
    // Scroll to top of table
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openAddProductModal() {
    const title = currentProductType === 'products' ? 'Thêm điện thoại mới' : 'Thêm phụ kiện mới';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productGallery').value = '';
    document.getElementById('productColors').value = '';
    document.getElementById('productStorageOptions').value = '';
    renderColorRows('');
    
    // Show/hide appropriate fields
    const productSpecsRow = document.getElementById('productSpecsRow');
    const storageOptionsRow = document.getElementById('storageOptionsRow');
    const accessoryCategoryRow = document.getElementById('accessoryCategoryRow');
    
    if (currentProductType === 'products') {
        productSpecsRow.style.display = 'flex';
        storageOptionsRow.style.display = 'flex';
        accessoryCategoryRow.style.display = 'none';
        document.getElementById('productRAM').required = true;
        document.getElementById('productStorage').required = true;
        document.getElementById('productCategory').required = false;
    } else {
        productSpecsRow.style.display = 'none';
        storageOptionsRow.style.display = 'none';
        accessoryCategoryRow.style.display = 'flex';
        document.getElementById('productRAM').required = false;
        document.getElementById('productStorage').required = false;
        document.getElementById('productCategory').required = true;
    }
    
    document.getElementById('productModal').classList.add('show');
}

function editProduct(id) {
    let item = null;
    if (currentProductType === 'products') {
        const products = getProducts();
        item = products.find(p => p.id === id);
    } else {
        const accessories = getAccessories();
        item = accessories.find(a => a.id === id);
    }
    
    if (!item) return;
    
    const title = currentProductType === 'products' ? 'Sửa điện thoại' : 'Sửa phụ kiện';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('productId').value = item.id;
    document.getElementById('productName').value = item.name;
    document.getElementById('productBrand').value = item.brand;
    document.getElementById('productPrice').value = item.price;
    document.getElementById('productOldPrice').value = item.oldPrice;
    document.getElementById('productStock').value = Number.isFinite(Number(item.stock)) ? Number(item.stock) : 0;
    document.getElementById('productImage').value = item.image;
    document.getElementById('productBadge').value = item.badge || 'OFF';
    document.getElementById('productGallery').value = Array.isArray(item.galleryImages)
        ? item.galleryImages.join('\n')
        : '';
    document.getElementById('productColors').value = Array.isArray(item.colorOptions)
        ? item.colorOptions
            .map(option => `${option?.name || ''}|${option?.image || ''}|${Number(option?.price || item.price || 0)}`)
            .join('\n')
        : '';
    renderColorRows(document.getElementById('productColors').value);
    document.getElementById('productStorageOptions').value = Array.isArray(item.storageOptions)
        ? item.storageOptions
            .map(option => `${option?.label || ''}|${Number(option?.price || item.price || 0)}`)
            .join('\n')
        : '';
    
    // Show/hide appropriate fields
    const productSpecsRow = document.getElementById('productSpecsRow');
    const storageOptionsRow = document.getElementById('storageOptionsRow');
    const accessoryCategoryRow = document.getElementById('accessoryCategoryRow');
    
    if (currentProductType === 'products') {
        productSpecsRow.style.display = 'flex';
        storageOptionsRow.style.display = 'flex';
        accessoryCategoryRow.style.display = 'none';
        document.getElementById('productRAM').value = item.ram || '';
        document.getElementById('productStorage').value = item.storage || '';
        document.getElementById('productRAM').required = true;
        document.getElementById('productStorage').required = true;
        document.getElementById('productCategory').required = false;
    } else {
        productSpecsRow.style.display = 'none';
        storageOptionsRow.style.display = 'none';
        accessoryCategoryRow.style.display = 'flex';
        document.getElementById('productCategory').value = item.category || '';
        document.getElementById('productRAM').required = false;
        document.getElementById('productStorage').required = false;
        document.getElementById('productCategory').required = true;
    }
    
    document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
        if (currentProductType === 'products' && typeof deleteProductFromApi === 'function') {
            await deleteProductFromApi(id);
        }
    } catch (error) {
        alert(error.message || 'Không thể xóa sản phẩm trên hệ thống.');
        return;
    }

    if (currentProductType === 'products') {
        const products = getProducts();
        const filtered = products.filter(p => p.id !== id);
        saveProducts(filtered);
    } else {
        const accessories = getAccessories();
        const filtered = accessories.filter(a => a.id !== id);
        saveAccessories(filtered);
    }
    
    // Reload filtered list
    filterProducts();
    alert('Đã xóa sản phẩm thành công!');
}

// Handle product form submission
document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
});

function saveProduct() {
    syncColorRowsToHiddenInput();
    const formData = new FormData(document.getElementById('productForm'));
    const id = parseInt(formData.get('id'));
    const currentPrice = parseInt(formData.get('price'), 10);
    const oldPriceRaw = String(formData.get('oldPrice') || '').trim();
    const oldPriceValue = oldPriceRaw === '' ? currentPrice : parseInt(oldPriceRaw, 10);
    const stockValue = parseInt(formData.get('stock'), 10);
    const galleryImages = parseGalleryImages(formData.get('gallery'));
    const colorOptions = parseColorOptions(formData.get('colors'), currentPrice);
    const storageOptions = parseStorageOptions(formData.get('storageOptions'), currentPrice);
    
    if (currentProductType === 'products') {
        const products = getProducts();
        const productData = {
            id: id || (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1),
            name: formData.get('name'),
            brand: formData.get('brand'),
            price: currentPrice,
            oldPrice: Number.isFinite(oldPriceValue) ? oldPriceValue : currentPrice,
            stock: Number.isFinite(stockValue) && stockValue >= 0 ? stockValue : 0,
            ram: parseInt(formData.get('ram')),
            storage: parseInt(formData.get('storage')),
            image: normalizeProductImageInput(formData.get('image')),
            badge: formData.get('badge') || 'OFF',
            galleryImages,
            colorOptions,
            storageOptions
        };
        
        if (id) {
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            products.push(productData);
        }
        
        saveProducts(products);
    } else {
        const accessories = getAccessories();
        const accessoryData = {
            id: id || (accessories.length > 0 ? Math.max(...accessories.map(a => a.id)) + 1 : 1),
            name: formData.get('name'),
            category: formData.get('category'),
            brand: formData.get('brand'),
            price: currentPrice,
            oldPrice: Number.isFinite(oldPriceValue) ? oldPriceValue : currentPrice,
            stock: Number.isFinite(stockValue) && stockValue >= 0 ? stockValue : 0,
            image: normalizeProductImageInput(formData.get('image')),
            badge: formData.get('badge') || 'OFF',
            galleryImages,
            colorOptions,
            storageOptions
        };
        
        if (id) {
            const index = accessories.findIndex(a => a.id === id);
            if (index !== -1) {
                accessories[index] = accessoryData;
            }
        } else {
            accessories.push(accessoryData);
        }
        
        saveAccessories(accessories);
    }
    
    // Reload filtered list and reset to page 1
    filterProducts();
    closeProductModal();
    alert(id ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm thành công!');
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const brandFilter = document.getElementById('brandFilter').value;
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    let items = [];
    if (currentProductType === 'products') {
        items = getProducts();
    } else {
        items = getAccessories();
    }
    
    filteredProductsList = items.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchTerm);
        const matchBrand = !brandFilter || item.brand === brandFilter;
        const matchCategory = !categoryFilter || (item.category && item.category === categoryFilter);
        return matchSearch && matchBrand && matchCategory;
    });
    
    currentProductPage = 1;
    renderProducts();
}

// Orders Management
function getOrders() {
    const stored = localStorage.getItem('admin_orders');
    return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
    localStorage.setItem('admin_orders', JSON.stringify(orders));
}

function loadOrders() {
    const orders = getOrders();
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Chưa có đơn hàng nào</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customerName || 'Khách hàng'}</td>
            <td>${order.items.map(item => item.name).join(', ')}</td>
            <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="status-badge">${getPaymentStatusText(order.paymentStatus)} - ${order.paymentMethodLabel || getPaymentMethodText(order.paymentMethod)}</span></td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-success" onclick="viewOrderDetail(${order.id})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn-primary" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-edit"></i> Cập nhật
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewOrderDetail(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailContent');
    
    content.innerHTML = `
        <div class="order-detail">
            <div class="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <p><strong>Mã đơn:</strong> #${order.id}</p>
                <p><strong>Ngày đặt:</strong> ${formatDate(order.date)}</p>
                <p><strong>Trạng thái:</strong> <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></p>
                <p><strong>Tổng tiền:</strong> ${formatPrice(order.total)}</p>
                <p><strong>Thanh toán:</strong> ${getPaymentStatusText(order.paymentStatus)} - ${order.paymentMethodLabel || getPaymentMethodText(order.paymentMethod)}</p>
            </div>
            
            <div class="detail-section">
                <h3>Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> ${order.customerName || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                <p><strong>Điện thoại:</strong> ${order.customerPhone || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${order.customerAddress || 'N/A'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Sản phẩm</h3>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>${formatPrice(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('show');
}

function updateOrderStatus(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    
    if (!order) return;
    
    const currentStatus = order.status;
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statuses.indexOf(currentStatus);
    
    if (currentIndex < statuses.length - 1) {
        order.status = statuses[currentIndex + 1];
    } else {
        order.status = statuses[0];
    }
    
    saveOrders(orders);
    loadOrders();
    alert('Đã cập nhật trạng thái đơn hàng!');
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const orders = getOrders();
    
    const filtered = orders.filter(order => {
        const matchSearch = 
            order.id.toString().includes(searchTerm) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm));
        const matchStatus = !statusFilter || order.status === statusFilter;
        return matchSearch && matchStatus;
    });
    
    const tbody = document.getElementById('ordersTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Không tìm thấy đơn hàng</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customerName || 'Khách hàng'}</td>
            <td>${order.items.map(item => item.name).join(', ')}</td>
            <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="status-badge">${getPaymentStatusText(order.paymentStatus)} - ${order.paymentMethodLabel || getPaymentMethodText(order.paymentMethod)}</span></td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-success" onclick="viewOrderDetail(${order.id})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn-primary" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-edit"></i> Cập nhật
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'shipped': 'Đã giao hàng',
        'delivered': 'Đã nhận hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getPaymentStatusText(paymentStatus) {
    const paymentStatusMap = {
        paid: 'Đã thanh toán',
        pending: 'Chờ chuyển khoản',
        cod_pending: 'Thu tiền khi giao',
        failed: 'Thanh toán lỗi'
    };
    return paymentStatusMap[paymentStatus] || 'Chưa xác định';
}

function getPaymentMethodText(paymentMethod) {
    const paymentMethodMap = {
        cod: 'COD',
        bank: 'Chuyển khoản',
        momo: 'MoMo',
        vnpay: 'VNPay'
    };
    return paymentMethodMap[paymentMethod] || 'Khác';
}

function formatPromoExpiry(expiry) {
    if (!expiry) return 'Không có';
    const date = new Date(expiry);
    if (Number.isNaN(date.getTime())) return 'Không hợp lệ';
    return date.toLocaleString('vi-VN');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}
