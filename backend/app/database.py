import os
import re
import tempfile
import textwrap
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


def normalizar_pem(texto):
    # Reconstruye el certificado aunque se hayan perdido los saltos de línea
    texto = texto.replace("\\n", "\n")
    cuerpo = re.sub(r"-----(BEGIN|END) CERTIFICATE-----", "", texto)
    cuerpo = re.sub(r"\s+", "", cuerpo)
    lineas = "\n".join(textwrap.wrap(cuerpo, 64))
    return f"-----BEGIN CERTIFICATE-----\n{lineas}\n-----END CERTIFICATE-----\n"


cert_content = os.getenv("DB_CA_CERT")
if cert_content:
    ca_path = os.path.join(tempfile.gettempdir(), "ca.pem")
    with open(ca_path, "w") as f:
        f.write(normalizar_pem(cert_content))
else:
    ca_path = os.getenv("DB_CA_PATH", "ca.pem")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"ssl": {"ca": ca_path}},
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