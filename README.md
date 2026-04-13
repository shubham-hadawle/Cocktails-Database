# MixMaster 🍸

A full-stack cocktail database web app built with **React + Vite** (frontend), **FastAPI** (backend), and **MySQL** (database) for a Cocktail database.

## Project Structure

```text
Cocktails-Database/
├── docker-compose.yml
├── SQL queries/
│   ├── cocktail_db_create_commands.sql      # DDL — creates 13 tables
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

## Prerequisites

Make sure you have these installed before starting:

- **Python 3.10+** → [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18+** → [nodejs.org](https://nodejs.org/)
- **MySQL 8.0** → [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/) (install MySQL Server + MySQL Workbench)

To verify they're installed, run in your terminal:

```bash
python --version
node --version
npm --version
mysql --version
```

---

## Step 1 — Set Up the MySQL Database

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

You should see **13 tables** and a count of **7** cocktails.

### Option B — Using Docker Desktop

```bash
docker compose up -d
```

This starts MySQL 8.0 on port 3306 and auto-runs the SQL files from `SQL queries/`.

Verify with:

```bash
docker exec -it mixmaster-mysql mysql -uroot -proot -e "USE cocktail_db; SHOW TABLES;"
```

---

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
> If you used Docker (Option B above), the password is `root`.

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
pip install cryptography
```

> The `cryptography` package is required because MySQL 8 uses `caching_sha2_password` authentication.

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
| `POST`   | `/api/auth/login`                     | User login                           |
| `POST`   | `/api/auth/register`                  | User registration                    |
| `GET`    | `/api/users`                          | List all users                       |
| `POST`   | `/api/reviews`                        | Submit a new review                  |
| `PUT`    | `/api/reviews/{id}`                   | Edit a review                        |
| `DELETE` | `/api/reviews/{id}`                   | Delete a review                      |
| `GET`    | `/api/favorites/{user_id}`            | Get user's favorites                 |
| `POST`   | `/api/favorites`                      | Add to favorites                     |
| `DELETE` | `/api/favorites/{user_id}/{cocktail_id}` | Remove from favorites             |

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

The database contains **13 tables** across 4 domains:

- **Cocktail data:** `recipe`, `cocktail`, `glass_type`, `flavor`, `cocktail_flavor`, `recipe_tool`, `recipe_ingredient`
- **Ingredients:** `ingredient`, `ingredient_type`
- **Bar tools:** `tool`
- **Users:** `app_user`, `review`, `user_favorite`

<img width="491" height="421" alt="Logical Design of database" src="https://github.com/user-attachments/assets/fc595566-fab5-4438-bce4-8ba7898799c6" />

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
