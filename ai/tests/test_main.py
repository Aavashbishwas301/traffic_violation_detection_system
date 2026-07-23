import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "TVDS AI Engine is running"}

def test_detect_no_file():
    # Test that /detect correctly rejects requests without a file
    response = client.post("/detect")
    assert response.status_code == 422 # Unprocessable Entity (Missing field)

# We can mock YOLO model or other things here, but a basic health check and validation check
# is a good start for testing the API surface.
