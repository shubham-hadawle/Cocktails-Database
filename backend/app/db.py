import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

DEFAULT_DATABASE_URL = 'mysql+pymysql://root:root@localhost:3306/cocktail_db'
DATABASE_URL = os.getenv('DATABASE_URL', DEFAULT_DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)
