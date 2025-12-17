let cart = JSON.parse(localStorage.getItem('cart')) || {};

function loadProducts(products) {
    const container = document.getElementById('products');
    Object.entries(products).forEach(([id, product]) => {
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card product-card">
                    <div class="card-body">
                        <h5>${product.name}</h5>
                        <p class="text-success fw-bold">₹${product.price}</p>
                        <p>Stock: ${product.stock}</p>
                        <button class="btn btn-warning add-to-cart w-100" 
                                onclick="addToCart('${id}', ${product.price})">
                            Add to Cart 🛒
                        </button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += card;
    });
    updateCartCount();
}

function addToCart(id, price) {
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart! 🛍️');
}

function updateCartCount() {
    const count = Object.values(cart).reduce((a,b)=>a+b, 0);
    document.getElementById('cart-count').textContent = count;
}
