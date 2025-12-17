from flask import Flask, jsonify, render_template

app = Flask(__name__, static_folder='static', template_folder='templates')

PRODUCTS = {
    "candle_rosemary": {"name": "Rosemary Butter Candle", "price": 299, "stock": 50},
    "anime_goku": {"name": "3D Goku Figurine", "price": 499, "stock": 25},
    "aroma_lavender": {"name": "Lavender Aroma Candle", "price": 199, "stock": 100}
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cart')
def cart():
    return '<h1>Shopping Cart</h1><p>Coming soon!</p>'  # Temporary

@app.route('/api/products')
def get_products():
    return jsonify(PRODUCTS)

@app.route('/api/products/<product_id>')
def get_product(product_id):
    if product_id in PRODUCTS:
        return jsonify(PRODUCTS[product_id])
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "products_count": len(PRODUCTS)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
