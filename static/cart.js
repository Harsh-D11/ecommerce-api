let cart = JSON.parse(localStorage.getItem('cart')) || {};

// ✅ PRODUCTS DATA (Fixes RED X error)
const PRODUCTS = {
    "candle_rosemary": { "name": "🌿 Rosemary Aroma Candle", "price": 299, "image": "rosemary.jpg" },
    "anime_goku": { "name": "⚡ Goku Anime Candle", "price": 399, "image": "goku.jpg" },
    "aroma_lavender": { "name": "💜 Lavender Dream Candle", "price": 249, "image": "lavender.jpg" }
};

function loadProducts(data) {
    const container = document.getElementById('products');
    if (!container) return;
    container.innerHTML = '';
    
    Object.entries(data).forEach(([id, product]) => {
        const qty = cart[id] || 0;
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5>${product.name}</h5>
                        <p class="text-success fw-bold fs-4">₹${product.price}</p>
                        <p class="text-muted">Stock: ${product.stock} | Cart: ${qty}</p>
                        <button class="btn btn-warning add-to-cart w-100 mt-auto mb-2" onclick="addToCart('${id}')">
                            🛒 Add to Cart (+${qty})
                        </button>
                        <button class="btn btn-success w-100" onclick="buyNow('${id}')">
                            💳 Buy Now ₹${product.price}
                        </button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += card;
    });
    updateCartCount();
}

function addToCart(id) {
    if (!cart[id]) cart[id] = 0;
    cart[id]++;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadProducts(PRODUCTS);
    alert(`Added! Cart: ${Object.values(cart).reduce((a,b)=>a+b,0)} items`);
}

function buyNow(id) {
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = '/cart';
}

function updateCartCount() {
    const count = document.getElementById('cart-count');
    if (count) {
        const total = Object.values(cart).reduce((a,b)=>a+b,0);
        count.textContent = total;
    }
}

function loadCartPage() {
    const itemsDiv = document.getElementById('cart-items');
    const emptyDiv = document.getElementById('empty-cart');
    const totalItems = document.getElementById('cart-total-items');
    const totalPrice = document.getElementById('cart-total-price');
    
    let totalQty = 0, totalAmount = 0;
    
    if (Object.keys(cart).length === 0) {
        itemsDiv.style.display = 'none';
        emptyDiv.style.display = 'block';
        return;
    }
    
    itemsDiv.style.display = 'block';
    emptyDiv.style.display = 'none';
    
    let html = '';
    Object.entries(cart).forEach(([id, qty]) => {
        if (qty > 0) {
            const product = PRODUCTS[id];
            totalQty += qty;
            totalAmount += qty * product.price;
            
            html += `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-3">
                            <img src="/static/${product.image}" class="img-fluid rounded-start" alt="${product.name}">
                        </div>
                        <div class="col-md-9">
                            <div class="card-body">
                                <h5>${product.name}</h5>
                                <p>₹${product.price} x ${qty} = ₹${qty * product.price}</p>
                                <div class="input-group w-50">
                                    <button class="btn btn-outline-secondary" onclick="updateQty('${id}', -1)">-</button>
                                    <input type="number" class="form-control" value="${qty}" readonly>
                                    <button class="btn btn-outline-secondary" onclick="updateQty('${id}', 1)">+</button>
                                </div>
                                <button class="btn btn-danger btn-sm mt-2" onclick="removeItem('${id}')">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    });
    
    itemsDiv.innerHTML = html;
    totalItems.textContent = totalQty;
    totalPrice.textContent = `₹${totalAmount}`;
}

function updateQty(id, change) {
    cart[id] = Math.max(0, (cart[id] || 0) + change);
    if (cart[id] === 0) delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartPage();
    updateCartCount();
}

function removeItem(id) {
    delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartPage();
    updateCartCount();
}

function clearCart() {
    cart = {};
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartPage();
    updateCartCount();
}

function checkoutFromCart() {
    window.location.href = '/checkout';
}

// Checkout Page
function loadCheckoutPage() {
    const summaryDiv = document.getElementById('order-summary');
    const totalAmount = document.getElementById('total-amount');
    
    let html = '<h6>Your Cart:</h6>';
    let total = 0;
    
    Object.entries(cart).forEach(([id, qty]) => {
        if (qty > 0) {
            const product = PRODUCTS[id];
            const itemTotal = qty * product.price;
            total += itemTotal;
            html += `<p>${product.name} x${qty} = ₹${itemTotal}</p>`;
        }
    });
    
    summaryDiv.innerHTML = html;
    totalAmount.textContent = `₹${total}`;
    window.CART_TOTAL = total;
}

function processCheckout() {
    const form = document.getElementById('checkout-form');
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
    
    initiatePayment(window.CART_TOTAL, customerData);
}

// Razorpay Payment
function initiatePayment(amount, customerData = {}) {
    const options = {
        key: "rzp_test_YOUR_KEY_ID_HERE",  // ⚠️ REPLACE WITH YOUR KEY
        amount: amount * 100,
        currency: "INR",
        name: "Harsh's Candle Empire",
        description: "Premium Aroma Candles",
        handler: function(response) {
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            amount: response.razorpay_amount,
            customer: customerData,
            items: cart
        })
    }).then(res => res.json())
      .then(data => {
          alert("✅ Order Confirmed! " + data.message);
          clearCart();
          window.location.href = '/';
      });
}
