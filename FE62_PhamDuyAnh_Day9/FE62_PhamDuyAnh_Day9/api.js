const API_ORIGIN =
    typeof window !== 'undefined' && window.SHOP_API_ORIGIN
        ? String(window.SHOP_API_ORIGIN).replace(/\/$/, '')
        : 'http://127.0.0.1:8080';
const API_BASE_URL = `${API_ORIGIN}/api/shopphone`;

function formatPriceVND(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' VNĐ';
}

function mapApiProductToFrontend(product) {
    const salePrice = Number(product.salePrice || 0);
    const price = Number(product.price || 0);
    const finalPrice = salePrice > 0 ? salePrice : price;
    return {
        id: product.id,
        name: product.name,
        price: finalPrice,
        oldPrice: price,
        image: product.avatarUrl || './img/no-image.png',
        brand: product.categoryName || 'ShopPhone',
        categoryName: product.categoryName || '',
        detailDescription: product.detailDescription || '',
        shortDescription: product.shortDescription || ''
    };
}

async function fetchProductsFromApi(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.size != null) searchParams.set('size', String(params.size));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.direction) searchParams.set('direction', params.direction);
    if (params.keyword) searchParams.set('keyword', params.keyword);

    const url = `${API_BASE_URL}/products?${searchParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Cannot load products');
    const payload = await response.json();
    return {
        ...payload,
        items: (payload.items || []).map(mapApiProductToFrontend)
    };
}

async function fetchProductDetailFromApi(productId) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error('Product not found');
    const payload = await response.json();
    return mapApiProductToFrontend(payload);
}

async function checkoutOrderToApi(order) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Checkout failed');
    }
    return payload;
}

async function fetchPromoCodesFromApi() {
    const response = await fetch(`${API_BASE_URL}/promo-codes`, { credentials: 'include' });
    if (!response.ok) throw new Error('Cannot load promo codes');
    const payload = await response.json();
    return Array.isArray(payload.items) ? payload.items : [];
}

async function savePromoCodeToApi({ code, discountRate, expiresAt }) {
    const response = await fetch(`${API_BASE_URL}/promo-codes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, discountRate, expiresAt })
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Cannot save promo code');
    }
    return payload.item || null;
}

async function deletePromoCodeFromApi(code) {
    const response = await fetch(`${API_BASE_URL}/promo-codes/${encodeURIComponent(code)}/delete`, {
        method: 'POST',
        credentials: 'include'
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Cannot delete promo code');
    }
    return true;
}

async function deleteProductFromApi(productId) {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/delete`, {
        method: 'POST',
        credentials: 'include'
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Cannot delete product');
    }
    return true;
}

function getShopBackendOrigin() {
    if (typeof window !== 'undefined' && window.SHOP_API_ORIGIN) {
        return String(window.SHOP_API_ORIGIN).replace(/\/$/, '');
    }
    return API_ORIGIN;
}

async function loginCustomerToShopApi(username, password) {
    const res = await fetch(`${getShopBackendOrigin()}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: String(username || '').trim(), password: password || '' })
    });
    let data = {};
    try {
        data = await res.json();
    } catch (e) { /* noop */ }
    return { ok: res.ok, data };
}

async function registerCustomerToShopApi({ username, password, passwordRetype, email, mobile }) {
    const res = await fetch(`${getShopBackendOrigin()}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: String(username || '').trim(),
            password,
            passwordRetype,
            email: String(email || '').trim(),
            mobile: mobile != null ? String(mobile).trim() : ''
        })
    });
    let data = {};
    try {
        data = await res.json();
    } catch (e) { /* noop */ }
    return { ok: res.ok, data };
}
