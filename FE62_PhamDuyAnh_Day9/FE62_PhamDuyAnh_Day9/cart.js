// Cart Management System
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartCount();
    }

    // Load cart from localStorage
    loadCart() {
        const cartData = localStorage.getItem('shopphone_cart');
        return cartData ? JSON.parse(cartData) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('shopphone_cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id && item.type === product.type);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification('Đã thêm vào giỏ hàng!');
        return this.cart;
    }

    // Remove item from cart
    removeItem(id, type) {
        this.cart = this.cart.filter(item => !(item.id === id && item.type === type));
        this.saveCart();
        if (typeof renderCart !== 'undefined') {
            renderCart();
        }
    }

    // Update item quantity
    updateQuantity(id, type, quantity) {
        const item = this.cart.find(item => item.id === id && item.type === type);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(id, type);
            } else {
                item.quantity = quantity;
                this.saveCart();
                if (typeof renderCart !== 'undefined') {
                    renderCart();
                }
            }
        }
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get cart count
    getCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        if (typeof renderCart !== 'undefined') {
            renderCart();
        }
    }

    // Update cart count in header
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCount();
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Show notification
    showNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Add to cart function (global)
function addToCart(product, type = 'product') {
    cartManager.addItem({ ...product, type });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

