// Harsh's E-commerce Cart System
let cart = JSON.parse(localStorage.getItem('cart')) || {};

function loadProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = ''; // Clear first
    
    Object.entries(products).forEach(([id, product]) => {
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="text-success fw-bold fs-4">₹${product.price}</p>
                        <p class="text-muted">Stock: ${product.stock}</p>
                        <button class="btn btn-warning add-to-cart w-100 mt-auto" 
                                onclick="addToCart('${id}', '${product.name}', ${product.price})">
                            🛒 Add to Cart
                        </button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += card;
    });
    updateCartCount();
}

function addToCart(id, name, price) {
    cart[id] = {name, price, qty: (cart[id]?.qty || 0) + 1};
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart! 🛍️`);
}

function updateCartCount() {
    const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

// Load products on page load
fetch('/api/products')
    .then(r => r.json())
    .then(loadProducts)
    .catch(e => console.error('Load failed:', e));
