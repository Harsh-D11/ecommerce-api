let cart = JSON.parse(localStorage.getItem('cart')) || {};

function loadProducts(data) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    
    Object.entries(data).forEach(function(id_product) {
        let id = id_product[0];
        let product = id_product[1];
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="text-success fw-bold fs-4">₹${product.price}</p>
                        <p class="text-muted">Stock: ${product.stock}</p>
                        <button class="btn btn-warning add-to-cart w-100 mt-auto mb-2" 
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

function addToCart(id) {
    if (!cart[id]) cart[id] = 0;
    cart[id]++;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart! 🛍️');
}

function updateCartCount() {
    let count = 0;
    for (let id in cart) {
        count += cart[id];
    }
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function buyNow(id) {
    alert('Buy Now clicked! 💳 Razorpay coming soon');
}

function checkout() {
    const cartCount = document.getElementById('cart-count').textContent;
    if (cartCount == '0') return alert('🛒 Cart is empty!');
    
    const pincode = prompt('Enter PINCODE for delivery (226001 Lucknow):');
    if (!pincode || pincode.length !== 6) {
        return alert('❌ Valid 6-digit PINCODE required');
    }
    
    const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    alert(`✅ Order placed successfully!\n\n📦 Items: ${total}\n🚚 Shipping to: ${pincode}\n💰 Payment: Razorpay\n⏱️ ETA: 2-3 days`);
    
    localStorage.setItem('cart', JSON.stringify({})); // Clear cart
    updateCartCount();
    location.reload();
}

// Load products
fetch('/api/products')
    .then(function(r) { return r.json(); })
    .then(loadProducts)
    .catch(function(e) { console.error('Load failed:', e); });
