// Hero Banner Slider
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.banner-slider');

function showSlide(n) {
    currentSlideIndex = n;
    // In a real implementation, you would switch between different banner contents
}

function changeSlide(n) {
    currentSlideIndex += n;
    const dots = document.querySelectorAll('.slider-dots .dot');
    
    if (currentSlideIndex > dots.length - 1) {
        currentSlideIndex = 0;
    }
    if (currentSlideIndex < 0) {
        currentSlideIndex = dots.length - 1;
    }
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlideIndex);
    });
}

function currentSlide(n) {
    currentSlideIndex = n - 1;
    changeSlide(0);
}

// Auto slide hero banner (chỉ trang có slider)
if (document.querySelector('.slider-dots .dot')) {
    setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Products Carousel
function scrollProducts(direction) {
    const productsGrid = document.querySelector('.products-grid');
    const scrollAmount = 250;
    
    if (direction === 'left') {
        productsGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else {
        productsGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Accessories Carousel
function scrollAccessories(direction) {
    const accessoriesGrid = document.querySelector('.accessories-grid');
    if (!accessoriesGrid) return;
    
    const scrollAmount = 250;
    
    if (direction === 'left') {
        accessoriesGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else {
        accessoriesGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Brands Carousel
let currentBrandSlideIndex = 0;

function scrollBrands(direction) {
    const brandsGrid = document.querySelector('.brands-grid');
    const scrollAmount = 300;
    
    if (direction === 'left') {
        brandsGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
        currentBrandSlideIndex = Math.max(0, currentBrandSlideIndex - 1);
    } else {
        brandsGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
        currentBrandSlideIndex = Math.min(1, currentBrandSlideIndex + 1);
    }
    
    updateBrandDots();
}

function currentBrandSlide(n) {
    currentBrandSlideIndex = n - 1;
    const brandsGrid = document.querySelector('.brands-grid');
    const scrollAmount = 300;
    brandsGrid.scrollTo({
        left: currentBrandSlideIndex * scrollAmount * 2,
        behavior: 'smooth'
    });
    updateBrandDots();
}

function updateBrandDots() {
    const dots = document.querySelectorAll('.carousel-dots .dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentBrandSlideIndex);
    });
}

// Essentials Carousel
function scrollEssentials(direction) {
    const essentialsGrid = document.querySelector('.essentials-grid');
    const scrollAmount = 270;
    
    if (direction === 'left') {
        essentialsGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else {
        essentialsGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Add smooth scroll behavior for touch devices
document.querySelectorAll('.products-grid, .accessories-grid, .brands-grid, .essentials-grid').forEach(grid => {
    let isDown = false;
    let startX;
    let scrollLeft;

    grid.addEventListener('mousedown', (e) => {
        isDown = true;
        grid.style.cursor = 'grabbing';
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
    });

    grid.addEventListener('mouseleave', () => {
        isDown = false;
        grid.style.cursor = 'grab';
    });

    grid.addEventListener('mouseup', () => {
        isDown = false;
        grid.style.cursor = 'grab';
    });

    grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 2;
        grid.scrollLeft = scrollLeft - walk;
    });
});

// Cart functionality - redirect to cart page
document.querySelectorAll('.cart-icon, .cart-link').forEach(element => {
    element.addEventListener('click', (e) => {
        if (!element.href) {
            window.location.href = 'cart.html';
        }
    });
});

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartCount();
    }
    if (document.querySelector('.products-carousel .products-grid') || document.querySelector('.products-grid.accessories-grid')) {
        loadHomeDataFromApi();
    }
});

// Search functionality
const searchBtn = document.querySelector('.search-btn');
const searchInputEl = document.querySelector('.search-bar input');
if (searchBtn && searchInputEl) {
    searchBtn.addEventListener('click', () => {
        const query = searchInputEl.value.trim();
        if (query) {
            console.log('Searching for:', query);
        }
    });
    searchInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Auth Modal Functions
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    switchTab(tab);
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
}

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAuthModal();
    }
});

// Switch between Login and Register tabs
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.querySelectorAll('.auth-tab')[0];
    const registerTab = document.querySelectorAll('.auth-tab')[1];

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else if (tab === 'register') {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

// Toggle password visibility
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

// Handle Login Form Submission
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const identifier = formData.get('email');
    const password = formData.get('password');

    if (!identifier || !password) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    try {
        if (typeof loginCustomerToShopApi !== 'function') {
            alert('Thiếu api.js hoặc config.js.');
            return;
        }
        const { ok, data } = await loginCustomerToShopApi(String(identifier).trim(), password);
        if (!ok || !data.authenticated) {
            alert(data.message || 'Đăng nhập thất bại. Kiểm tra tài khoản / backend.');
            return;
        }
        const roles = Array.isArray(data.roles) ? data.roles : [];
        if (roles.includes('ADMIN')) {
            window.location.href = 'admin.html';
            return;
        }
        updateUserInterface(data.username || identifier);
        closeAuthModal();
        event.target.reset();
    } catch (e) {
        console.error(e);
        alert('Không kết nối được server. Kiểm tra SHOP_API_ORIGIN trong config.js và Spring Boot đang chạy.');
    }
}

// Handle Register Form Submission (backend: POST /api/auth/register)
async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const agreeTerms = formData.get('agreeTerms');

    if (!email || !phone || !password || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
    }

    if (password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    if (!agreeTerms) {
        alert('Vui lòng đồng ý với điều khoản và chính sách!');
        return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(String(phone).replace(/\s/g, ''))) {
        alert('Số điện thoại không hợp lệ!');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
        alert('Email không hợp lệ!');
        return;
    }

    try {
        if (typeof registerCustomerToShopApi !== 'function') {
            alert('Thiếu api.js hoặc config.js.');
            return;
        }
        const username = String(email).trim();
        const { ok, data } = await registerCustomerToShopApi({
            username,
            password,
            passwordRetype: confirmPassword,
            email: String(email).trim(),
            mobile: String(phone).replace(/\s/g, '')
        });
        if (!ok || data.success === false) {
            alert(data.message || 'Đăng ký thất bại.');
            return;
        }
        alert(data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
        switchTab('login');
        document.getElementById('loginEmail').value = username;
        event.target.reset();
    } catch (e) {
        console.error(e);
        alert('Không kết nối được server. Kiểm tra SHOP_API_ORIGIN trong config.js.');
    }
}

// Update UI after login (example)
function updateUserInterface(email) {
    const signInLink = document.querySelector('.sign-in-link');
    if (signInLink) {
        signInLink.textContent = email.split('@')[0];
        signInLink.onclick = function() {
            // Could show user menu instead
            alert('Bạn đã đăng nhập với: ' + email);
            return false;
        };
    }
}

// Social Login Buttons
document.addEventListener('DOMContentLoaded', function() {
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('google-btn') ? 'Google' : 'Facebook';
            alert(`Đăng nhập với ${provider} - Chức năng này cần tích hợp API của ${provider}`);
        });
    });

    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Chức năng quên mật khẩu - Vui lòng liên hệ support@megamart.com');
        });
    }
});

// Xem chi tiết sản phẩm
function viewProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function isAccessoryProduct(p) {
    const category = (p.categoryName || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    return category.includes('phu kien')
        || category.includes('accessory')
        || name.includes('tai nghe')
        || name.includes('op')
        || name.includes('sac')
        || name.includes('cap')
        || name.includes('pin du phong');
}

function isSaleProduct(item) {
    const price = Number(item?.price || 0);
    const oldPrice = Number(item?.oldPrice || price || 0);
    const badge = String(item?.badge || '').trim().toUpperCase();
    return oldPrice > price || badge === 'OFF' || badge === 'SALE';
}

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

function getAdminProductsFromLocalStorage() {
    try {
        const raw = localStorage.getItem('admin_products');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Cannot parse admin_products:', error);
        return [];
    }
}

function normalizeAdminProduct(item) {
    if (!item || typeof item !== 'object') return null;
    const id = Number(item.id);
    if (!id || !item.name) return null;
    return {
        id,
        name: String(item.name),
        price: Number(item.price || 0),
        oldPrice: Number(item.oldPrice || item.price || 0),
        image: item.image || './img/no-image.png',
        brand: item.brand || 'Khac',
        categoryName: item.categoryName || item.brand || '',
        badge: item.badge || ''
    };
}

function normalizeAdminAccessory(item) {
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
        categoryName: item.category || 'Phụ kiện'
    };
}

function mergeApiProductsWithAdminAccessories(apiItems) {
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

    getAdminProductsFromLocalStorage()
        .map(normalizeAdminProduct)
        .filter(Boolean)
        .forEach(item => {
            mapById.set(Number(item.id), item);
        });

    return Array.from(mapById.values());
}

async function loadHomeDataFromApi() {
    try {
        const payload = await fetchProductsFromApi({ page: 0, size: 60, sortBy: 'createDate', direction: 'desc' });
        const products = mergeApiProductsWithAdminAccessories(payload.items || []);
        const phoneProducts = products.filter(p => !isAccessoryProduct(p));
        const bestSellerPhones = phoneProducts.filter(isSaleProduct);
        const phones = (bestSellerPhones.length > 0 ? bestSellerPhones : phoneProducts).slice(0, 8);
        // Homepage accessories MUST come from accessories source (admin_accessories),
        // not from product list (to avoid mixing with phone products API).
        const accessoriesFromAdmin = getAdminAccessoriesFromLocalStorage()
            .map(normalizeAdminAccessory)
            .filter(Boolean)
            .slice(0, 8);
        const accessories = accessoriesFromAdmin.length > 0
            ? accessoriesFromAdmin
            : products.filter(isAccessoryProduct).slice(0, 8);
        renderHomeSection('.products-carousel .products-grid', phones, 'product');
        renderHomeSection('.products-grid.accessories-grid', accessories, 'accessory');
    } catch (error) {
        console.error('Cannot load homepage data', error);
    }
}

function renderHomeSection(selector, items, type) {
    const grid = document.querySelector(selector);
    if (!grid || !Array.isArray(items) || items.length === 0) return;
    grid.innerHTML = items.map(item => {
        const oldPrice = Number(item.oldPrice || item.price || 0);
        const saveAmount = Math.max(0, oldPrice - item.price);
        const clickHandler = type === 'accessory'
            ? `window.location.href='accessory-detail.html?id=${item.id}'`
            : `viewProductDetail(${item.id})`;
        return `
            <div class="product-card" onclick="${clickHandler}" style="cursor: pointer;">
                <div class="product-badge">${saveAmount > 0 ? 'OFF' : 'NEW'}</div>
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">${formatPrice(item.price)}</p>
                <p class="old-price">${formatPrice(oldPrice)}</p>
                <p class="save">${saveAmount > 0 ? 'Save - ' + formatPrice(saveAmount) : ''}</p>
                <button class="add-to-cart-btn"
                    onclick="event.stopPropagation(); addToCart({id:${item.id}, name:${JSON.stringify(item.name)}, price:${item.price}, oldPrice:${oldPrice}, image:${JSON.stringify(item.image)}}, '${type}')">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
            </div>
        `;
    }).join('');
}

