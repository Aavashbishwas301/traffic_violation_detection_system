# Traffic Violation Detection System (TVDS) - Context

This document provides instructional context and architectural overview for the TVDS project.

## 🏗️ Project Overview
TVDS is a comprehensive system designed to automate the detection, recording, and management of traffic violations. It integrates computer vision for detection with a robust web platform for management.

### Architecture
The project is divided into three main components:
1.  **AI Vision Core (`/ai`):** A Python-based FastAPI service that uses YOLOv8 for object detection (vehicles, persons, traffic lights) and EasyOCR for license plate recognition.
2.  **Backend (`/backend`):** A Node.js/Express REST API that manages the database (MongoDB), handles authentication (JWT), and orchestrates violation processing and payments.
3.  **Frontend (`/frontend`):** A React (Vite) application providing distinct dashboards for Traffic Police, Vehicle Owners, and Administrators, styled with Tailwind CSS.

## 🚀 Building and Running

### AI Service
- **Directory:** `/ai`
- **Setup:** `pip install -r requirements.txt`
- **Run:** `python main.py` (Default: `http://localhost:8000`)
- **Note:** Ensure `yolov8n.pt` is present in the `/ai` directory.

### Backend
- **Directory:** `/backend`
- **Setup:** `npm install`
- **Environment:** Requires a `.env` file with `MONGO_URI`, `JWT_SECRET`, and `AI_SERVICE_URL`.
- **Run:** `npm run dev` (Default: `http://localhost:5000`)
- **Seeding:** `node seeder.js` to populate initial users and sample data.

### Frontend
- **Directory:** `/frontend`
- **Setup:** `npm install`
- **Run:** `npm run dev` (Default: `http://localhost:5173`)

## 🛠️ Development Conventions

### Coding Standards
- **Backend:** Uses ES Modules (`type: "module"`). Follows a Controller-Route-Model pattern.
- **Frontend:** React 19+ with functional components and hooks. Tailwind CSS is used for all styling.
- **AI:** Python with FastAPI. Asynchronous endpoints for image processing.

### Testing
- **TODO:** Implement automated tests for backend routes and AI detection logic.

### File Handling
- Evidence images are uploaded via `multer` and stored in `/backend/uploads`.
- The backend serves these files statically at `/uploads`.

## 🔑 Key Files
- `ai/main.py`: Core AI logic and FastAPI endpoints.
- `backend/server.js`: Entry point for the Node.js API.
- `backend/models/`: Mongoose schemas for User, Vehicle, Violation, etc.
- `frontend/src/App.jsx`: Main routing and layout configuration.
- `frontend/src/context/AuthContext.jsx`: Authentication state management.

## 👥 User Roles & Access
- **Admin:** System management, user oversight, and global reporting.
- **Traffic Police:** Image/video upload for violation detection and verification.
- **Vehicle Owner:** Tracking of their own vehicle violations and payment status.
