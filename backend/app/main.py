from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import usuarios, servicios, reservas

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MF Barber API",
    description="API REST para gestion de reservas de barberia MF Barber",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(servicios.router)
app.include_router(reservas.router)

@app.get("/")
def raiz():
    return {
        "mensaje": "MF Barber API v1.0.0",
        "docs": "/docs",
        "barbero": "James Mauricio Valencia Salamanca",
        "direccion": "Cra 17 #37-16, Barrio Gualanday, Neiva, Huila"
    }