# JobWiseAI

AI-Powered Job Portal, a modern **job portal web application** built with **React (Vite)** for the frontend and **FastAPI** for the backend.

---

## Tech Stack
**Backend**
- [FastAPI](https://fastapi.tiangolo.com/)
- SQLAlchemy (ORM)
- SQLite (default, can be swapped with PostgreSQL/MySQL)
- JWT authentication (`python-jose`)
- Password hashing with Passlib

**Frontend**
- React (with Vite or CRA, depending on setup)
- Fetch API / Axios for backend communication
- TailwindCSS (if enabled for styling)

---

### Backend Setup

```bash
python -m venv venv
source venv/bin/activate   # On Mac/Linux
venv\Scripts\activate      # On Windows
```

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run backend server

```bash
uvicorn app.main:app --reload
```

Backend will run on:
[http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## Frontend Setup

### 1. Navigate to frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Frontend will run on:
[http://localhost:5173](http://localhost:5173) (if using Vite)
[http://localhost:3000](http://localhost:3000) (if CRA)

---
