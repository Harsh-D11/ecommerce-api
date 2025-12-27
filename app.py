from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import json
import os
import random
from razorpay import Client
import uuid

app = Flask(__name__)
app.secret_key = 'your-super-secret-key-change-this'

# ⚠️ REPLACE WITH YOUR REAL RAZORPAY TEST KEYS
client = Client(
    auth=("rzp_test_YOUR_KEY_ID_HERE", "YOUR_KEY_SECRET_HERE")
)

# Products Data
PRODUCTS = {
    "candle_rosemary": {
        "name": "🌿 Rosemary Aroma Candle",
        "price": 299,
        "stock": 50,
        "image": "rosemary.jpg",
        "desc": "Relaxing herbal scent"
    },
    "anime_goku": {
        "name": "⚡ Goku Anime Candle",
        "price": 399,
        "stock": 30,
        "image": "goku.jpg", 
        "desc": "Dragon Ball power scent"
    },
    "aroma_lavender": {
        "name": "💜 Lavender Dream Candle",
        "price": 249,
        "stock": 75,
        "image": "lavender.jpg",
        "desc": "Calming floral bliss"
    }
}

@app.route('/')
def index():
    return render_template('index.html', products=PRODUCTS)

@app.route('/cart')
def cart_page():
    return render_template('cart.html')

@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/admin')
def admin():
    if not session.get('admin'):
        return redirect(url_for('login'))
    return render_template('admin.html')

@app.route('/create-order', methods=['POST'])
def create_order():
    data = request.json
    amount = int(data['amount']) * 100
    
    try:
        order = client.order.create({
            'amount': amount,
            'currency': 'INR',
            'receipt': f"order_{random.randint(1000,9999)}",
            'notes': {
                'customer_name': data.get('name', 'Guest'),
                'items': json.dumps(data.get('items', {}))
            }
        })
        return jsonify({
            'id': order['id'],
            'amount': order['amount'],
            'currency': order['currency']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    data = request.json
    
    order_data = {
        'id': str(uuid.uuid4()),
        'order_id': data['order_id'],
        'payment_id': data['payment_id'],
        'amount': data['amount'],
        'customer': data['customer'],
        'items': data['items'],
        'timestamp': str(random.randint(1000,9999))
    }
    
    with open('orders.json', 'a') as f:
        f.write(json.dumps(order_data) + '\n')
    
    return jsonify({'status': 'success', 'message': 'Order confirmed!'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)
