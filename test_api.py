import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.append(".")

import pytest
from app import app, PRODUCTS

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_products(client):
    rv = client.get('/api/products')
    assert rv.status_code == 200
    data = rv.get_json()
    assert len(data) == 3

def test_get_product(client):
    rv = client.get('/api/products/candle_rosemary')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['name'] == 'Rosemary Butter Candle'

def test_health(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'healthy'
