# MixMaster 🍸

A full-stack cocktail database web app built with **React + Vite** (frontend), **FastAPI** (backend), and **MySQL** (database) for a Cocktail database.

## Project Structure

```text
Cocktails-Database/
├── docker-compose.yml
├── SQL queries/
│   ├── cocktail_db_create_commands.sql      # DDL — creates 12 tables
│   └── cocktail_db_data_population_commands.sql  # DML — seeds all data
├── backend/
│   ├── .env                                 # MySQL connection string (you create this)
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── db.py                            # SQLAlchemy engine setup
│       └── main.py                          # FastAPI endpoints
├── frontend/
│   ├── vite.config.js                       # Dev proxy: /api → localhost:8000
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── MixMasterApp.jsx                 # Main React component
```

## Local URLs

| Service       | URL                           |
|---------------|-------------------------------|
| Frontend      | `http://localhost:3000`        |
| Backend API   | `http://localhost:8000`        |
| API Docs      | `http://localhost:8000/docs`   |
| MySQL         | `localhost:3306`              |

---

## Quick Start (Docker + Local App)

Use this path if you want the fastest setup (with Docker already installed).

1. Start database from project root:

```bash
docker compose up -d
docker compose ps
```

2. Start backend in a new terminal:

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. Start frontend in a new terminal:

```bash
cd frontend
npm install
npm run dev
```

4. Open:

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

Quick backend check:

```bash
curl http://localhost:8000/health
```

If `/health` returns `500`, run `pip install -r requirements.txt` again inside `backend`, then verify `backend/.env` points to the correct MySQL host/port and password.

---

## After Reboot (Fast Restart)

```bash
docker compose up -d
cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload
cd frontend && npm run dev
```

---

## Prerequisites

Make sure you have these installed before starting:

- **Python 3.10+** → [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18+** → [nodejs.org](https://nodejs.org/)

- **Docker Desktop** → [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) (recommended)

- **MySQL 8.0** (if not using Docker) → [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/)

To verify they're installed, run in your terminal:

```bash
python --version
node --version
npm --version
docker --version
docker compose version
```

---

## (Not using Docker) Step 1 — Set Up the MySQL Database

### Option A — Using MySQL Workbench (recommended for Windows)

1. Open **MySQL Workbench** and connect to your local MySQL server
2. Open a new query tab and run the following to create the database:

```sql
CREATE DATABASE IF NOT EXISTS cocktail_db;
USE cocktail_db;
```

3. Open the file `SQL queries/cocktail_db_create_commands.sql` → click the **Execute** button (⚡)
4. Open the file `SQL queries/cocktail_db_data_population_commands.sql` → click **Execute**

5. Verify everything loaded correctly:

```sql
USE cocktail_db;
SHOW TABLES;
SELECT COUNT(*) FROM cocktail;
```

You should see **12 tables** and a count of **7** cocktails.

## Step 2 — Create the Backend `.env` File

Create a file called `.env` inside the `backend/` folder with your MySQL connection string.

**On Mac/Linux:**

```bash
cd backend
echo 'DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/cocktail_db' > .env
```

**On Windows (PowerShell):**

```powershell
cd backend
"DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/cocktail_db" | Out-File -Encoding utf8 .env
```

> **Important:** Replace `YOUR_PASSWORD` with the actual root password you set during MySQL installation. For example, if your password is `MyPass123`:
> ```
> DATABASE_URL=mysql+pymysql://root:MyPass123@localhost:3306/cocktail_db
> ```
---

## Step 3 — Start the FastAPI Backend

Open a terminal and navigate to the `backend/` folder:

```bash
cd backend
```

Create and activate a Python virtual environment (first time only):

```bash
# Create virtual environment
python -m venv .venv

# Activate it
# Windows (PowerShell):
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
```

Install dependencies (first time only):

```bash
pip install -r requirements.txt
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Verify the backend is connected to MySQL:**

- Open `http://localhost:8000/health` in your browser → should return `{"status":"ok"}`
- Open `http://localhost:8000/api/cocktails` → should return a JSON array with 7 cocktails
- Open `http://localhost:8000/docs` → interactive Swagger API documentation

> **Troubleshooting:** If you see `Access denied for user 'root'@'localhost'`, your `.env` password is wrong. If you see `Unknown database 'cocktail_db'`, go back to Step 1 and run the SQL files.

---

## Step 4 — Start the React Frontend

Open a **new terminal window** (keep the backend running in the first one):

```bash
cd frontend
```

Install dependencies (first time only):

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

You should see:

```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

---

## Step 5 — Open the App

Go to **http://localhost:3000** in your browser.

**How to tell it's connected to MySQL:**

Look below the "Discover Your Next Cocktail" heading — you'll see a small status badge:

- 🟢 **"Connected to localhost FastAPI + MySQL"** → Everything is working. All data flows through your database.
- 🟡 **"Demo mode until backend is running"** → The backend isn't reachable. The app falls back to hardcoded demo data.

**Test the full CRUD flow:**

1. **Sign in** with username `mixmaster_mike` and password `admin`
2. **Browse** cocktails — data comes from MySQL via the API
3. **Favorite** a cocktail (click the heart icon) → inserts into `user_favorite` table
4. **Write a review** on a cocktail detail page → inserts into `review` table
5. **Edit** your review → updates the `review` table
6. **Delete** your review → deletes from the `review` table
7. **Refresh the page** → your favorites and reviews persist (stored in MySQL)

---

## API Endpoints

| Method   | Endpoint                              | Description                          |
|----------|---------------------------------------|--------------------------------------|
| `GET`    | `/health`                             | Health check (DB connection test)    |
| `GET`    | `/api/cocktails`                      | List all cocktails with full details |
| `GET`    | `/api/cocktails?q=mojito`             | Search cocktails by name/ingredient  |
| `GET`    | `/api/cocktails/{id}`                 | Get single cocktail by ID            |
| `GET`    | `/api/analytics/summary`              | Aggregate stats                      |
| `POST`   | `/api/reviews`                        | Submit a new review                  |
| `PUT`    | `/api/reviews/{review_id}`            | Edit a review                        |
| `DELETE` | `/api/reviews/{review_id}`            | Delete a review                      |
| `POST`   | `/api/auth/login`                     | User login                           |
| `POST`   | `/api/auth/register`                  | User registration                    |
| `GET`    | `/api/favorites/{user_id}`            | Get user's favorites                 |
| `POST`   | `/api/favorites`                      | Add to favorites                     |
| `DELETE` | `/api/favorites/{user_id}/{cocktail_id}` | Remove from favorites             |
| `GET`    | `/api/users`                          | List all users                       |

---

## Test User Accounts

| Username          | Password    |
|-------------------|-------------|
| `mixmaster_mike`  | `admin`     |
| `cocktail_carla`  | `Carla@456` |
| `shaker_sam`      | `Sam@789`   |
| `lime_lucy`       | `Lucy@321`  |
| `bourbon_ben`     | `Ben@654`   |
| `tiki_tara`       | `Tara@987`  |
| `neat_nina`       | `Nina@123`  |

---

## Database Schema

The database contains **12 tables** across 4 domains:

- **Cocktail data:** `cocktail`, `glass_type`, `flavor`, `cocktail_flavor`, `cocktail_tool`, `cocktail_ingredient`
- **Ingredients:** `ingredient`, `ingredient_type`
- **Bar tools:** `tool`
- **Users:** `app_user`, `review`, `user_favorite`


---

## Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | React 18, Vite, D3.js, Lucide Icons |
| Backend  | FastAPI, SQLAlchemy, PyMySQL |
| Database | MySQL 8.0                 |
| Styling  | Inline CSS, Google Fonts (Playfair Display, Outfit) |

---

## Team

**PhamJHadawleS** — CS5200 Database Management Systems · Northeastern University · 2026
