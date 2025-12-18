from flask import Flask, jsonify, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import json

app = Flask(__name__)
app.secret_key = 'devops-ecommerce-2025-super-secret'

# In-memory data (SQLite later)
USERS = {
    'admin': {'password': generate_password_hash('admin123'), 'role': 'admin'},
    'customer': {'password': generate_password_hash('customer123'), 'role': 'customer'}
}

PRODUCTS = {
    "candle_rosemary": {"name": "Rosemary Butter Candle", "price": 299, "stock": 50},
    "anime_goku": {"name": "3D Goku Figurine", "price": 499, "stock": 25},
    "aroma_lavender": {"name": "Lavender Aroma Candle", "price": 199, "stock": 100}
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in USERS and check_password_hash(USERS[username]['password'], password):
            session['user'] = username
            session['role'] = USERS[username]['role']
            flash(f'Welcome {username}!', 'success')
            if USERS[username]['role'] == 'admin':
                return redirect('/admin')
            return redirect('/')
        flash('Invalid credentials!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully!', 'info')
    return redirect('/')

def login_required(role=None):
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                return redirect('/login')
            if role and session.get('role') != role:
                flash('Access denied!', 'error')
                return redirect('/')
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

@app.route('/admin')
@login_required('admin')
def admin():
    return render_template('admin.html')

@app.route('/profile')
@login_required()
def profile():
    role = session.get('role', 'guest')
    return render_template('profile.html', role=role)

@app.route('/api/products')
def api_products():
    return jsonify(PRODUCTS)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "user": session.get('user', 'guest')})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
