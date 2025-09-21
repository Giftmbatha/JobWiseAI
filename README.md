# JobWiseAI

AI-Powered Job Portal

AI-Powered Job Portal, a modern **job portal web application** built with **React (Vite)** for the frontend and **FastAPI** for the backend.
The platform allows users to register, log in, and access their personalized dashboard.

---

## Features

- User authentication (JWT-based login & registration)
- Employer & Job Seeker roles
- Employers can create and manage job postings
- Job seekers can browse and apply for jobs
- Protected routes with role-based access
- React frontend with API integration

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

### 2. Create virtual environment & activate

```bash
python -m venv venv
source venv/bin/activate   # On Mac/Linux
venv\Scripts\activate      # On Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

If you don’t have `requirements.txt` yet, install manually:

```bash
pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-jose
```

### 4. Run backend server

```bash
uvicorn app.main:app --reload
```

Backend will run on:
[http://127.0.0.1:8000](http://127.0.0.1:8000)

Docs available at:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

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

## Authentication Flow

1. **Register** via `/auth/register` (choose role: `employer` or `seeker`)
2. **Login** via `/auth/login`

   * Returns `access_token`
3. Store `access_token` in **localStorage** (frontend)
4. Send token in **Authorization header** for protected requests:

   ```
   Authorization: Bearer <your_token>
   ```
=======

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


