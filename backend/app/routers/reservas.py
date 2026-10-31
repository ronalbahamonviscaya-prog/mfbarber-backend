from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app.models import Reserva, Usuario
from app.schemas import ReservaCrear, CambiarEstado
from datetime import datetime, timedelta

router = APIRouter(prefix="/reservas", tags=["Reservas"])

def ahora_colombia():
    # El servidor usa UTC; Colombia es UTC-5 todo el año
    return datetime.utcnow() - timedelta(hours=5)

def reserva_a_dict(r, db):
    cliente = db.query(Usuario).filter(Usuario.id == r.id_cliente).first()
    barbero = db.query(Usuario).filter(Usuario.id == r.id_barbero).first()
    return {
        "id": r.id,
        "id_cliente": r.id_cliente,
        "nombre_cliente": cliente.nombre if cliente else "—",
        "id_servicio": r.id_servicio,
        "id_barbero": r.id_barbero,
        "nombre_barbero": barbero.nombre if barbero else "—",
        "estado": r.estado,
        "fecha_reserva": str(r.fecha_reserva),
        "hora_reserva": str(r.hora_reserva),
        "comentario": r.comentario,
        "fecha_creacion": str(r.fecha_creacion) if r.fecha_creacion else None
    }

@router.get("/")
def listar(db: Session = Depends(get_db)):
    return [reserva_a_dict(r, db) for r in db.query(Reserva).all()]

# IMPORTANTE: /ocupadas debe ir ANTES de "/{id}"
@router.get("/ocupadas")
def horas_ocupadas(id_barbero: int, fecha: str, db: Session = Depends(get_db)):
    reservas = db.query(Reserva).filter(
        and_(
            Reserva.id_barbero == id_barbero,
            Reserva.fecha_reserva == fecha,
            Reserva.estado != "Cancelado"
        )
    ).all()
    return [str(r.hora_reserva)[:5] for r in reservas]

@router.get("/barbero/{id_barbero}")
def listar_por_barbero(id_barbero: int, db: Session = Depends(get_db)):
    reservas = db.query(Reserva).filter(Reserva.id_barbero == id_barbero).all()
    return [reserva_a_dict(r, db) for r in reservas]

@router.get("/cliente/{id_cliente}")
def listar_por_cliente(id_cliente: int, db: Session = Depends(get_db)):
    return [reserva_a_dict(r, db) for r in db.query(Reserva).filter(Reserva.id_cliente == id_cliente).all()]

@router.get("/{id}")
def obtener(id: int, db: Session = Depends(get_db)):
    r = db.query(Reserva).filter(Reserva.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva_a_dict(r, db)

@router.post("/", status_code=201)
def crear(datos: ReservaCrear, id_cliente: int, id_barbero: int, db: Session = Depends(get_db)):
    fecha_hora_str = f"{datos.fecha_reserva} {datos.hora_reserva}"
    try:
        fecha_hora = datetime.strptime(fecha_hora_str, "%Y-%m-%d %H:%M")
    except:
        raise HTTPException(status_code=400, detail="Formato de fecha u hora incorrecto")

    if fecha_hora <= ahora_colombia():
        raise HTTPException(status_code=400, detail="No puedes reservar en una fecha u hora pasada")

    reserva_pendiente = db.query(Reserva).filter(
        and_(Reserva.id_cliente == id_cliente, Reserva.estado == "Pendiente")
    ).first()
    if reserva_pendiente:
        raise HTTPException(status_code=400, detail="Ya tienes una reserva pendiente. Espera a que sea atendida.")

    conflicto = db.query(Reserva).filter(
        and_(
            Reserva.id_barbero == id_barbero,
            Reserva.fecha_reserva == datos.fecha_reserva,
            Reserva.hora_reserva == datos.hora_reserva,
            Reserva.estado != "Cancelado"
        )
    ).first()
    if conflicto:
        raise HTTPException(status_code=400, detail="Ese barbero ya tiene una cita a esa hora. Elige otra hora.")

    reserva = Reserva(
        id_cliente=id_cliente,
        id_servicio=datos.id_servicio,
        id_barbero=id_barbero,
        fecha_reserva=datos.fecha_reserva,
        hora_reserva=datos.hora_reserva,
        comentario=datos.comentario
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva_a_dict(reserva, db)

@router.patch("/{id}/estado")
def cambiar_estado(id: int, datos: CambiarEstado, db: Session = Depends(get_db)):
    r = db.query(Reserva).filter(Reserva.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    r.estado = datos.estado
    db.commit()
    db.refresh(r)
    return reserva_a_dict(r, db)

@router.delete("/{id}")
def cancelar(id: int, db: Session = Depends(get_db)):
    r = db.query(Reserva).filter(Reserva.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    r.estado = "Cancelado"
    db.commit()
    return {"mensaje": "Reserva cancelada"}