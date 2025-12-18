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
    document.getElementById('cart-count').textContent = count || 0;
}

function buyNow(id) {
    fetch(`/api/pay/${id}`)
        .then(r=>r.json())
        .then(data=> {
            if(data.error) return alert(data.error);
            
            const options = {
                key: 'rzp_test_YOUR_KEY', // Replace with real key
                amount: data.amount,
                currency: 'INR',
                name: 'Harsh\'s Candle Empire',
                description: data.product.name,
                order_id: data.razorpay_order_id,
                handler: function(response) {
                    alert(`Payment SUCCESS! Order: ${response.razorpay_order_id}`);
                    // Send to backend for order confirmation
                },
                prefill: {
                    name: 'Harsh Kumar',
                    email: 'harsh@example.com'
                }
            };
            const rzp = new Razorpay(options);
            rzp.open();
        });
}

// Load on start
fetch('/api/products').then(r=>r.json()).then(loadProducts);
