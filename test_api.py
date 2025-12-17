import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.append(".")

import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_products(client):
    rv = client.get('/api/products')
    assert rv.status_code == 200
    data = rv.get_json()
    assert len(data) >= 3  # Now dynamic

def test_health(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'healthy'

def test_index_html(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b'<title>Harsh\'s Candle' in rv.data  # Tests new HTML!

def test_api_products_json(client):
    rv = client.get('/api/products/candle_rosemary')
    assert rv.status_code == 200
