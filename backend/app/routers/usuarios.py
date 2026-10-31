from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario
from app.schemas import UsuarioCrear, UsuarioRespuesta, LoginDatos, Token
from werkzeug.security import generate_password_hash, check_password_hash
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

SECRET_KEY = "mfbarber_secreto_2025"
ALGORITHM = "HS256"

def crear_token(data: dict):
    datos = data.copy()
    expira = datetime.utcnow() + timedelta(minutes=60)
    datos.update({"exp": expira})
    return jwt.encode(datos, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/registro", response_model=UsuarioRespuesta, status_code=201)
def registrar(datos: UsuarioCrear, db: Session = Depends(get_db)):
    existente = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    password_hash = generate_password_hash(datos.password)
    usuario = Usuario(
        rol=datos.rol,
        nombre=datos.nombre,
        email=datos.email,
        password=password_hash,
        telefono=datos.telefono,
        direccion=datos.direccion
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

@router.post("/login", response_model=Token)
def login(datos: LoginDatos, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(
        Usuario.email == datos.email,
        Usuario.activo == True
    ).first()
    if not usuario or not check_password_hash(usuario.password, datos.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = crear_token({"sub": str(usuario.id), "rol": usuario.rol})
    return {"access_token": token, "token_type": "bearer", "usuario": usuario}

@router.get("/", response_model=list[UsuarioRespuesta])
def listar(db: Session = Depends(get_db)):
    return db.query(Usuario).all()

# IMPORTANTE: las rutas /barberos deben ir ANTES de "/{id}"
@router.get("/barberos", response_model=list[UsuarioRespuesta])
def listar_barberos(db: Session = Depends(get_db)):
    return db.query(Usuario).filter(
        Usuario.rol == "barbero",
        Usuario.activo == True
    ).all()

@router.post("/barberos", response_model=UsuarioRespuesta, status_code=201)
def crear_barbero(datos: UsuarioCrear, db: Session = Depends(get_db)):
    existente = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    barbero = Usuario(
        rol="barbero",
        nombre=datos.nombre,
        email=datos.email,
        password=generate_password_hash(datos.password),
        telefono=datos.telefono,
        direccion=datos.direccion
    )
    db.add(barbero)
    db.commit()
    db.refresh(barbero)
    return barbero

@router.delete("/barberos/{id}")
def desactivar_barbero(id: int, db: Session = Depends(get_db)):
    barbero = db.query(Usuario).filter(
        Usuario.id == id,
        Usuario.rol == "barbero"
    ).first()
    if not barbero:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    barbero.activo = False
    db.commit()
    return {"mensaje": "Barbero desactivado"}

@router.get("/{id}", response_model=UsuarioRespuesta)
def obtener(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario