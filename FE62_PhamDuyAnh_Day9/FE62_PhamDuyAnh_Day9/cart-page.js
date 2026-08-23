// Cart Page Logic
let appliedPromoCode = null;
const defaultPromoCodes = {
    'WELCOME5': 0.05
};
const paymentMethodConfigs = {
    cod: {
        message: 'Bạn sẽ thanh toán tiền mặt trực tiếp khi nhận hàng.',
        note: 'Không cần quét QR cho phương thức COD.',
        requiresConfirmation: false
    },
    bank: {
        message: 'Vui lòng chuyển khoản đúng số tiền hiển thị trong đơn hàng.',
        requiresConfirmation: true
    },
    momo: {
        message: 'Vui lòng quét mã MoMo để hoàn tất thanh toán.',
        requiresConfirmation: true
    },
    vnpay: {
        message: 'Vui lòng quét mã VNPay để hoàn tất thanh toán.',
        requiresConfirmation: true
    }
};
const PAYMENT_QR_PATHS = {
    bank: './img/qr.jpg',
    momo: './img/qr.jpg',
    vnpay: './img/qr.jpg'
};

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    updateCartCount();
    
    // Load cart count on page load
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartCount();
    }
    initializePaymentMethodUI();
});

// Render cart items
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartLayout = document.querySelector('.cart-layout');
    const itemCount = document.getElementById('itemCount');
    const clearCartBtn = document.getElementById('clearCartBtn');
    
    if (!cartManager || cartManager.cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartLayout) cartLayout.style.display = 'none';
        if (itemCount) itemCount.textContent = '0';
        if (clearCartBtn) clearCartBtn.style.display = 'none';
        updateSummary();
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartLayout) cartLayout.style.display = 'grid';
    if (itemCount) itemCount.textContent = cartManager.getCount();
    if (clearCartBtn) clearCartBtn.style.display = 'flex';

    if (!cartItems) return;

    cartItems.innerHTML = '';

    cartManager.cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <span class="cart-item-type">${item.type === 'product' ? 'Điện thoại' : 'Phụ kiện'}</span>
                <div>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    ${item.oldPrice ? `<p class="cart-item-old-price">${formatPrice(item.oldPrice)}</p>` : ''}
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, '${item.type}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" 
                           onchange="updateItemQuantity(${item.id}, '${item.type}', parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, '${item.type}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <p class="item-total">${formatPrice(item.price * item.quantity)}</p>
                <button class="remove-item-btn" onclick="removeItem(${item.id}, '${item.type}')">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    updateSummary();
}

// Update item quantity
function updateItemQuantity(id, type, quantity) {
    if (quantity < 1) quantity = 1;
    cartManager.updateQuantity(id, type, quantity);
    renderCart();
}

// Remove item
function removeItem(id, type) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        cartManager.removeItem(id, type);
        renderCart();
    }
}

// Clear cart
function clearCart() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
        cartManager.clearCart();
        renderCart();
    }
}

// Update summary
function updateSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!cartManager || cartManager.cart.length === 0) {
        if (subtotalEl) subtotalEl.textContent = '0 VNĐ';
        if (discountEl) discountEl.textContent = '-0 VNĐ';
        if (totalEl) totalEl.textContent = '0 VNĐ';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    const subtotal = cartManager.getTotal();
    let discount = 0;

    if (appliedPromoCode) {
        discount = subtotal * appliedPromoCode;
    }

    const total = subtotal - discount;

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (discountEl) {
        discountEl.textContent = discount > 0 ? `-${formatPrice(discount)}` : '-0 VNĐ';
        discountEl.parentElement.style.display = discount > 0 ? 'flex' : 'none';
    }
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// Apply promo code
async function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    const promoMessage = document.getElementById('promoMessage');
    
    if (!promoInput || !promoMessage) return;

    const code = promoInput.value.toUpperCase().trim();

    if (!code) {
        promoMessage.textContent = 'Vui lòng nhập mã giảm giá';
        promoMessage.className = 'promo-message error';
        return;
    }

    const promoCodes = await getAvailablePromoCodes();

    if (promoCodes[code]) {
        appliedPromoCode = promoCodes[code];
        promoMessage.textContent = `Áp dụng thành công! Giảm ${(appliedPromoCode * 100).toFixed(0)}%`;
        promoMessage.className = 'promo-message success';
        updateSummary();
    } else {
        appliedPromoCode = null;
        promoMessage.textContent = 'Mã giảm giá không hợp lệ';
        promoMessage.className = 'promo-message error';
        updateSummary();
    }
}

async function getAvailablePromoCodes() {
    try {
        let promoCodesFromApi = {};
        let promoExpiryFromApi = {};

        if (typeof fetchPromoCodesFromApi === 'function') {
            const items = await fetchPromoCodesFromApi();
            items.forEach(item => {
                const code = String(item?.code || '').toUpperCase().trim();
                const discountRate = Number(item?.discountRate);
                if (!code || !Number.isFinite(discountRate)) return;
                promoCodesFromApi[code] = discountRate;
                if (item?.expiresAt) {
                    promoExpiryFromApi[code] = item.expiresAt;
                }
            });
            localStorage.setItem('admin_promo_codes', JSON.stringify(promoCodesFromApi));
            localStorage.setItem('admin_promo_expiries', JSON.stringify(promoExpiryFromApi));
        } else {
            const stored = localStorage.getItem('admin_promo_codes');
            const expiryStored = localStorage.getItem('admin_promo_expiries');
            promoCodesFromApi = stored ? JSON.parse(stored) : {};
            promoExpiryFromApi = expiryStored ? JSON.parse(expiryStored) : {};
        }

        const merged = {
            ...defaultPromoCodes,
            ...(promoCodesFromApi && typeof promoCodesFromApi === 'object' ? promoCodesFromApi : {})
        };
        const now = Date.now();

        // Chỉ cho phép mã 1% -> 10%
        return Object.fromEntries(
            Object.entries(merged).filter(([code, value]) => {
                const num = Number(value);
                const expiryValue = promoExpiryFromApi && typeof promoExpiryFromApi === 'object' ? promoExpiryFromApi[code] : null;
                const expiryTime = expiryValue ? new Date(expiryValue).getTime() : null;
                const notExpired = !Number.isFinite(expiryTime) || expiryTime > now;
                return Number.isFinite(num) && num >= 0.01 && num <= 0.1 && notExpired;
            })
        );
    } catch (error) {
        console.error('Cannot read promo codes:', error);
        return { ...defaultPromoCodes };
    }
}

// Checkout - Open payment modal
function checkout() {
    if (!cartManager || cartManager.cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }

    // Display order summary in modal
    displayCheckoutSummary();
    const paymentMethodSelect = document.getElementById('paymentMethod');
    updatePaymentMethodUI(paymentMethodSelect ? paymentMethodSelect.value : '');
    
    // Show checkout modal
    document.getElementById('checkoutModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('show');
    document.body.style.overflow = '';
}

function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutOrderSummary');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const discountRow = document.getElementById('checkoutDiscountRow');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (!summaryContainer || !cartManager) return;
    
    // Display items
    summaryContainer.innerHTML = cartManager.cart.map(item => `
        <div class="order-summary-item">
            <div class="order-summary-item-info">
                <div class="order-summary-item-name">${item.name}</div>
                <div class="order-summary-item-details">
                    ${item.type === 'product' ? 'Điện thoại' : 'Phụ kiện'} • Số lượng: ${item.quantity}
                </div>
            </div>
            <div class="order-summary-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cartManager.getTotal();
    const discount = appliedPromoCode ? subtotal * appliedPromoCode : 0;
    const total = subtotal - discount;
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (discountEl) discountEl.textContent = `-${formatPrice(discount)}`;
    if (discountRow) discountRow.style.display = discount > 0 ? 'flex' : 'none';
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// Handle checkout form submission
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment();
        });
    }
    
    // Close modal when clicking outside
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('click', function(e) {
            if (e.target === checkoutModal) {
                closeCheckoutModal();
            }
        });
    }
});

function initializePaymentMethodUI() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (!paymentMethodSelect) return;

    paymentMethodSelect.addEventListener('change', function(e) {
        updatePaymentMethodUI(e.target.value);
    });
}

function updatePaymentMethodUI(method) {
    const infoBox = document.getElementById('paymentMethodInfo');
    const messageEl = document.getElementById('paymentMethodMessage');
    const noteEl = document.getElementById('paymentMethodNote');
    const qrWrapper = document.getElementById('paymentQrWrapper');
    const qrImage = document.getElementById('paymentQrImage');
    const confirmGroup = document.getElementById('paymentConfirmGroup');
    const confirmCheckbox = document.getElementById('paymentConfirmed');

    if (!infoBox || !messageEl || !noteEl || !qrWrapper || !qrImage || !confirmGroup || !confirmCheckbox) {
        return;
    }

    if (!method || !paymentMethodConfigs[method]) {
        infoBox.style.display = 'none';
        confirmCheckbox.checked = false;
        return;
    }

    const config = paymentMethodConfigs[method];
    infoBox.style.display = 'block';
    messageEl.textContent = config.message;
    noteEl.textContent = config.note;
    confirmCheckbox.checked = false;

    if (config.requiresConfirmation) {
        const qrSrc = PAYMENT_QR_PATHS[method] || '';
        if (qrSrc) {
            qrImage.src = qrSrc;
            qrImage.onerror = function() {
                qrWrapper.style.display = 'none';
                noteEl.textContent = 'Chưa tìm thấy ảnh QR. Vui lòng cập nhật đúng đường dẫn file QR trong PAYMENT_QR_PATHS.';
            };
            qrWrapper.style.display = 'block';
        } else {
            qrWrapper.style.display = 'none';
        }
        confirmGroup.style.display = 'block';
    } else {
        qrWrapper.style.display = 'none';
        confirmGroup.style.display = 'none';
    }
}

function processPayment() {
    if (!cartManager || cartManager.cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    // Get form data
    const formData = new FormData(document.getElementById('checkoutForm'));
    const customerName = formData.get('customerName');
    const customerPhone = formData.get('customerPhone');
    const customerEmail = formData.get('customerEmail');
    const customerAddress = formData.get('customerAddress');
    const customerCity = formData.get('customerCity');
    const customerDistrict = formData.get('customerDistrict');
    const paymentMethod = formData.get('paymentMethod');
    const paymentConfirmed = formData.get('paymentConfirmed');
    
    // Validate
    if (!customerName || !customerPhone || !customerEmail || !customerAddress || !customerCity || !customerDistrict || !paymentMethod) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const localOrder = createLocalAdminOrder({
        customerName,
        customerPhone,
        customerEmail,
        customerAddress: `${customerAddress}, ${customerDistrict}, ${customerCity}`,
        paymentMethod,
        paymentConfirmed
    });

    checkoutOrderToApi({
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        customerAddress: `${customerAddress}, ${customerDistrict}, ${customerCity}`,
        paymentMethod: paymentMethod,
        items: cartManager.cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }))
    })
    .then(order => {
        localOrder.orderCode = order.orderCode || localOrder.orderCode;
        saveOrderToAdminLocal(localOrder);
        cartManager.clearCart();
        appliedPromoCode = null;
        document.getElementById('promoCode').value = '';
        document.getElementById('promoMessage').textContent = '';
        closeCheckoutModal();
        alert(`Đặt hàng thành công!\n\nMã đơn hàng: ${localOrder.orderCode}\n\nCảm ơn bạn đã mua sắm tại ShopPhone!`);
        renderCart();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    })
    .catch(error => {
        // Vẫn tạo đơn local để admin có thể xử lý thủ công.
        saveOrderToAdminLocal(localOrder);
        cartManager.clearCart();
        appliedPromoCode = null;
        document.getElementById('promoCode').value = '';
        document.getElementById('promoMessage').textContent = '';
        closeCheckoutModal();
        alert(`Đơn đã được ghi nhận thành công trên trang admin.\n\nLưu ý kết nối API: ${error.message || 'không xác định'}`);
        renderCart();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    });
}

function getPaymentMethodLabel(method) {
    const labels = {
        cod: 'COD',
        bank: 'Chuyển khoản',
        momo: 'MoMo',
        vnpay: 'VNPay'
    };
    return labels[method] || 'Khác';
}

function createLocalAdminOrder({ customerName, customerPhone, customerEmail, customerAddress, paymentMethod, paymentConfirmed }) {
    const subtotal = cartManager.getTotal();
    const discount = appliedPromoCode ? subtotal * appliedPromoCode : 0;
    const total = subtotal - discount;
    const now = new Date();
    const orderCode = `SP${now.getTime()}`;
    const isOnlineMethod = paymentMethod !== 'cod';

    return {
        id: now.getTime(),
        orderCode,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        paymentMethod,
        paymentMethodLabel: getPaymentMethodLabel(paymentMethod),
        paymentStatus: isOnlineMethod ? (paymentConfirmed ? 'paid' : 'pending') : 'cod_pending',
        status: 'pending',
        date: now.toISOString(),
        total,
        items: cartManager.cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            type: item.type
        }))
    };
}

function saveOrderToAdminLocal(order) {
    try {
        const raw = localStorage.getItem('admin_orders');
        const orders = raw ? JSON.parse(raw) : [];
        orders.unshift(order);
        localStorage.setItem('admin_orders', JSON.stringify(orders));
    } catch (e) {
        console.error('Cannot save admin_orders:', e);
    }
}

// Orders management functions (shared with admin)
function getOrders() { return []; }
function saveOrders() {}

// Update cart count
function updateCartCount() {
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartCount();
    }
}

