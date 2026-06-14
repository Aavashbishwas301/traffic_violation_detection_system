# Traffic Violation Detection System (TVDS)

Automated detection, recording, and management of traffic rule violations.

## Project Structure
- `frontend/`: React + Vite + Tailwind CSS (Web UI)
- `backend/`: Node.js + Express + MongoDB (REST API)
- `ai/`: Python + FastAPI + YOLOv8 (AI Detection Service)

## Setup & Running

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (running locally or URI in `.env`)

### 2. AI Service
```bash
cd ai
# If venv not created: python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt # Or manual install based on the steps
python main.py
```
*Runs on http://localhost:8000*

### 3. Backend
```bash
cd backend
npm install
# Ensure .env is configured (PORT, MONGO_URI, JWT_SECRET, AI_SERVICE_URL)
npm run dev
```
*Runs on http://localhost:5000*

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:5173*

## User Roles
- **Traffic Police:** Upload evidence (images/videos) and verify violations.
- **Vehicle Owner:** View violation history and fine status.
- **Admin:** Manage users and view analytics.

## Initial Login (Seed or Register)
Use the register endpoint `POST /api/users` or implement a seed script to create the first Admin/Police user.
