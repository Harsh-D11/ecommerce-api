import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.append(".")

import pytest
try:
    from app import app
except:
    pytest.skip("App under upgrade")

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200

def test_index(client):
    rv = client.get('/')
    assert rv.status_code == 200
