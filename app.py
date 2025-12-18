from flask import Flask, jsonify, render_template, request
app = Flask(__name__, static_folder='static', template_folder='templates')

PRODUCTS = {
    "candle_rosemary": {"name": "Rosemary Butter Candle", "price": 299, "stock": 50},
    "anime_goku": {"name": "3D Goku Figurine", "price": 499, "stock": 25},
    "aroma_lavender": {"name": "Lavender Aroma Candle", "price": 199, "stock": 100}
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/api/products')
def get_products():
    return jsonify(PRODUCTS)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
