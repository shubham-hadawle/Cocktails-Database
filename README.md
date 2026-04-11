# MixMaster 🍸

A platform-independent localhost web app using **React + Vite** for the frontend, **FastAPI** for the backend, and **MySQL** for the database.

## Project Structure

```text
frontend/   # React localhost app
backend/    # FastAPI API + MySQL connection
SQL queries/ # MySQL schema and seed data
```

## Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| FastAPI docs | `http://localhost:8000/docs` |
| MySQL | `localhost:3306` |

## 1) Start MySQL

### Option A — Docker Desktop
```bash
docker compose up -d
```

This uses `docker-compose.yml` and auto-loads the SQL files from `SQL queries/`.

### Option B — Local MySQL install
Run these files in order:
1. `SQL queries/cocktail_db_create_commands.sql`
2. `SQL queries/cocktail_db_datat_population_commands.sql`

## 2) Start the FastAPI backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

> The backend reads `backend/.env` for `DATABASE_URL`.

## 3) Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

The original Claude component is now used by `frontend/src/MixMasterApp.jsx`.

## Git / GitHub

```bash
git init
git add .
git commit -m "Set up MixMaster localhost app"
```

<img width="491" height="421" alt="Logical Design of database" src="https://github.com/user-attachments/assets/fc595566-fab5-4438-bce4-8ba7898799c6" />
