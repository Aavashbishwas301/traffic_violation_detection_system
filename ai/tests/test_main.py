import pytest
import os
from fastapi.testclient import TestClient

# Set mock API key for testing before importing app
os.environ["AI_API_KEY"] = "test-api-key"

from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {'service': 'TVDS AI Vision Core', 'status': 'operational'}

def test_detect_unauthorized():
    response = client.post("/detect")
    assert response.status_code == 401

def test_detect_no_file():
    # Test that /detect correctly rejects requests without a file but with auth
    response = client.post("/detect", headers={"Authorization": "Bearer test-api-key"})
    assert response.status_code == 422 # Unprocessable Entity (Missing field)
