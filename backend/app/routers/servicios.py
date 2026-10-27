from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Servicio
import shutil
import os
import uuid

router = APIRouter(prefix="/servicios", tags=["Servicios"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "frontend", "img")

def asegurar_carpeta():
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def listar(db: Session = Depends(get_db)):
    return [{"id": s.id, "nombre": s.nombre, "descripcion": s.descripcion, "precio": float(s.precio), "imagen": s.imagen, "activo": s.activo} for s in db.query(Servicio).filter(Servicio.activo == True).all()]

@router.get("/{id}")
def obtener(id: int, db: Session = Depends(get_db)):
    s = db.query(Servicio).filter(Servicio.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"id": s.id, "nombre": s.nombre, "descripcion": s.descripcion, "precio": float(s.precio), "imagen": s.imagen, "activo": s.activo}

@router.post("/", status_code=201)
async def crear(
    nombre: str = Form(...),
    precio: float = Form(...),
    descripcion: str = Form(""),
    id_categoria: int = Form(1),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    nombre_imagen = None
    if imagen and imagen.filename:
        asegurar_carpeta()
        extension = imagen.filename.split(".")[-1]
        nombre_imagen = f"corte_{uuid.uuid4().hex[:8]}.{extension}"
        ruta = os.path.join(UPLOAD_DIR, nombre_imagen)
        with open(ruta, "wb") as f:
            shutil.copyfileobj(imagen.file, f)
    servicio = Servicio(nombre=nombre, descripcion=descripcion, precio=precio, imagen=nombre_imagen, id_categoria=id_categoria, activo=True)
    db.add(servicio)
    db.commit()
    db.refresh(servicio)
    return {"id": servicio.id, "nombre": servicio.nombre, "descripcion": servicio.descripcion, "precio": float(servicio.precio), "imagen": servicio.imagen, "activo": servicio.activo}

@router.put("/{id}")
async def actualizar(
    id: int,
    nombre: str = Form(...),
    precio: float = Form(...),
    descripcion: str = Form(""),
    id_categoria: int = Form(1),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    servicio = db.query(Servicio).filter(Servicio.id == id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    if imagen and imagen.filename:
        asegurar_carpeta()
        extension = imagen.filename.split(".")[-1]
        nombre_imagen = f"corte_{uuid.uuid4().hex[:8]}.{extension}"
        ruta = os.path.join(UPLOAD_DIR, nombre_imagen)
        with open(ruta, "wb") as f:
            shutil.copyfileobj(imagen.file, f)
        servicio.imagen = nombre_imagen
    servicio.nombre = nombre
    servicio.descripcion = descripcion
    servicio.precio = precio
    db.commit()
    db.refresh(servicio)
    return {"id": servicio.id, "nombre": servicio.nombre, "descripcion": servicio.descripcion, "precio": float(servicio.precio), "imagen": servicio.imagen, "activo": servicio.activo}

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db)):
    s = db.query(Servicio).filter(Servicio.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    s.activo = False
    db.commit()
    return {"mensaje": "Servicio eliminado"}