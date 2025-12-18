let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = {};

function loadProducts(data) {
    products = data;
    const container = document.getElementById('products');
    container.innerHTML = '';
    
    Object.entries(data).forEach(([id, product]) => {
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
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart! 🛍️');
}

function updateCartCount() {
    const count = Object.values(cart).reduce((a,b)=>a+b, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count || 0;
}

function buyNow(id) {
    alert(`Buy Now clicked for ${products[id]?.name || id}! 💳\n(Full Razorpay needs API key)`);
}

// Load products
fetch('/api/products')
    .then(r => r.json())
    .then(loadProducts)
    .catch(e => console.error('Load failed:', e));
