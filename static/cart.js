// cart.js

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Product definitions (must match app.py)
const PRODUCTS = {
    candle_rosemary: {
        name: "🌿 Rosemary Aroma Candle",
        price: 299,
        image: "rosemary.jpg"
    },
    anime_goku: {
        name: "⚡ Goku Anime Candle",
        price: 399,
        image: "goku.jpg"
    },
    aroma_lavender: {
        name: "💜 Lavender Dream Candle",
        price: 249,
        image: "lavender.jpg"
    }
};

// ---------- HOME PAGE (index.html) ----------

function loadProducts() {
    const container = document.getElementById('products');
    if (!container) return;  // not on this page

    container.innerHTML = '';

    Object.entries(PRODUCTS).forEach(([id, product]) => {
        const qty = cart[id] || 0;
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5>${product.name}</h5>
                        <p class="text-success fw-bold fs-4">₹${product.price}</p>
                        <p class="text-muted">Cart: ${qty}</p>
                        <button class="btn btn-warning w-100 mt-auto mb-2"
                                onclick="addToCart('${id}')">
                            🛒 Add to Cart
                        </button>
                        <button class="btn btn-success w-100"
                                onclick="buyNow('${id}')">
                            💳 Buy Now ₹${product.price}
                        </button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += card;
    });

    updateCartCount();
}

// ---------- CART OPERATIONS ----------

function addToCart(id) {
    if (!PRODUCTS[id]) return;   // safety

    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // If on home page, refresh product cards
    const container = document.getElementById('products');
    if (container) loadProducts();

    alert('Added to cart!');
}

function buyNow(id) {
    // Add one item, then go to cart
    addToCart(id);
    window.location.href = '/cart';
}

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    const total = Object.values(cart).reduce((sum, q) => sum + q, 0);
    badge.textContent = total;
}

// ---------- CART PAGE (/cart) ----------

function loadCartPage() {
    const itemsDiv = document.getElementById('cart-items');
    const emptyDiv = document.getElementById('empty-cart');
    const totalItems = document.getElementById('cart-total-items');
    const totalPrice = document.getElementById('cart-total-price');

    if (!itemsDiv || !emptyDiv || !totalItems || !totalPrice) return; // not cart page

    let totalQty = 0;
    let totalAmount = 0;
    let html = '';

    Object.entries(cart).forEach(([id, qty]) => {
        if (!PRODUCTS[id] || qty <= 0) return;

        const product = PRODUCTS[id];
        const lineTotal = qty * product.price;
        totalQty += qty;
        totalAmount += lineTotal;

        html += `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-3">
                        <img src="/static/${product.image}" class="img-fluid rounded-start" alt="${product.name}">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <h5>${product.name}</h5>
                            <p>₹${product.price} × ${qty} = ₹${lineTotal}</p>
                            <div class="input-group w-50">
                                <button class="btn btn-outline-secondary"
                                        onclick="updateQty('${id}', -1)">-</button>
                                <input type="number" class="form-control" value="${qty}" readonly>
                                <button class="btn btn-outline-secondary"
                                        onclick="updateQty('${id}', 1)">+</button>
                            </div>
                            <button class="btn btn-danger btn-sm mt-2"
                                    onclick="removeItem('${id}')">Remove</button>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    if (totalQty === 0) {
        itemsDiv.style.display = 'none';
        emptyDiv.style.display = 'block';
    } else {
        itemsDiv.style.display = 'block';
        emptyDiv.style.display = 'none';
        itemsDiv.innerHTML = html;
    }

    totalItems.textContent = totalQty;
    totalPrice.textContent = `₹${totalAmount}`;
    window.CART_TOTAL = totalAmount;   // used by checkout
}

function updateQty(id, delta) {
    if (!cart[id]) return;
    cart[id] = Math.max(0, cart[id] + delta);
    if (cart[id] === 0) delete cart[id];

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartPage();
}

function removeItem(id) {
    delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartPage();
}

function clearCart() {
    cart = {};
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartPage();
}

function checkoutFromCart() {
    window.location.href = '/checkout';
}

// ---------- CHECKOUT PAGE (/checkout) ----------

function loadCheckoutPage() {
    const summaryDiv = document.getElementById('order-summary');
    const totalAmountEl = document.getElementById('total-amount');
    if (!summaryDiv || !totalAmountEl) return;  // not checkout page

    let html = '<h6>Your Cart:</h6>';
    let total = 0;

    Object.entries(cart).forEach(([id, qty]) => {
        if (!PRODUCTS[id] || qty <= 0) return;

        const product = PRODUCTS[id];
        const lineTotal = qty * product.price;
        total += lineTotal;
        html += `<p>${product.name} × ${qty} = ₹${lineTotal}</p>`;
    });

    summaryDiv.innerHTML = html;
    totalAmountEl.textContent = `₹${total}`;
    window.CART_TOTAL = total;
}

function processCheckout() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const customerData = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        city: document.getElementById('customer-city').value,
        state: document.getElementById('customer-state').value,
        pincode: document.getElementById('customer-pincode').value
    };

    initiatePayment(window.CART_TOTAL || 0, customerData);
}

// ---------- Razorpay Integration ----------

function initiatePayment(amount, customerData = {}) {
    if (!amount || amount <= 0) {
        alert('Cart is empty.');
        return;
    }

    const options = {
        key: "rzp_test_YOUR_KEY_ID_HERE",   // replace with real key
        amount: amount * 100,
        currency: "INR",
        name: "Harsh's Candle Empire",
        description: "Premium Aroma Candles",
        handler: function (response) {
            verifyPayment(response, customerData);
        },
        prefill: {
            name: customerData.name || "Customer",
            contact: customerData.phone || "9999999999"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function verifyPayment(response, customerData) {
    fetch('/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            amount: window.CART_TOTAL || 0,
            customer: customerData,
            items: cart
        })
    })
        .then(res => res.json())
        .then(data => {
            alert("✅ Order Confirmed! " + (data.message || 'Thank you!'));
            clearCart();
            window.location.href = '/';
        })
        .catch(() => alert('Payment verification failed.'));
}
