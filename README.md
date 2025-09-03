# JobWiseAI
AI-Powered Job Portal, a modern **job portal web application** built with **React (Vite)** for the frontend and **FastAPI** for the backend.
The platform allows users to register, log in, and access their personalized dashboard.

---

## Features

* **User Authentication** (Register & Login)
* **JWT-based Auth** with FastAPI
* **Protected Dashboard** for authenticated users
* **Responsive UI** built with **Tailwind CSS v4**
* **Reusable Components** (Login, Register, Dashboard)
* **RESTful API integration** with FastAPI backend

---

## 🛠️ Tech Stack

### Frontend

* [React 18](https://react.dev/) (with [Vite](https://vitejs.dev/))
* [Tailwind CSS v4](https://tailwindcss.com/)
* [Axios](https://axios-http.com/) (for API requests)
* [React Router DOM](https://reactrouter.com/)

### Backend

* [FastAPI](https://fastapi.tiangolo.com/)
* [SQLAlchemy](https://www.sqlalchemy.org/)
* [JWT Authentication](https://jwt.io/)
* [Passlib + Bcrypt](https://passlib.readthedocs.io/) (for password hashing)

---

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/jobwiseai-portal.git
cd jobwiseai-portal
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on:
 `http://localhost:5173`

---

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run on:
 `http://127.0.0.1:8000`

---

## 🔑 Authentication Flow

1. **Register** → User data stored in DB (hashed password).
2. **Login** → Backend returns **JWT access token**.
3. **Frontend** → Stores token in `localStorage`.
4. **Protected Routes** → Only accessible if token is valid.

---


