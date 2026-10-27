import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", ""))
DB_NAME = os.getenv("DB_NAME", "defaultdb")

# Truco: Si existe la variable con el texto del certificado, crea el archivo ca.pem automáticamente al iniciar
cert_content = os.getenv("DB_CA_CERT")
ca_path = "ca.pem"

if cert_content and not os.path.exists(ca_path):
    with open(ca_path, "w") as f:
        f.write(cert_content)

DB_CA_PATH = os.getenv("DB_CA_PATH", ca_path)

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"ssl": {"ca": DB_CA_PATH}},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()