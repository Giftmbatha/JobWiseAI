# JobWiseAI
AI-Powered Job Portal

A full-stack job portal application built with **FastAPI (backend)** and **React (frontend)**.  
Employers can post jobs, and job seekers can browse and apply.  
Authentication is powered by JWT tokens.

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


