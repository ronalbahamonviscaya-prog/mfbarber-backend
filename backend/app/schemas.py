from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UsuarioCrear(BaseModel):
    rol: str = "cliente"
    nombre: str
    email: str
    password: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    foto: Optional[str] = None

class BarberoEditar(BaseModel):
    nombre: str
    email: str
    telefono: Optional[str] = None
    foto: Optional[str] = None
    password: Optional[str] = None

class UsuarioRespuesta(BaseModel):
    id: int
    rol: str
    nombre: str
    email: str
    telefono: Optional[str] = None
    foto: Optional[str] = None
    activo: bool
    fecha_registro: Optional[datetime] = None
    class Config:
        from_attributes = True

class LoginDatos(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioRespuesta

class ServicioCrear(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    imagen: Optional[str] = None
    id_categoria: Optional[int] = 1

class ServicioRespuesta(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    imagen: Optional[str]
    activo: bool
    class Config:
        from_attributes = True

class ReservaCrear(BaseModel):
    id_servicio: int
    fecha_reserva: str
    hora_reserva: str
    comentario: Optional[str] = None

class ReservaRespuesta(BaseModel):
    id: int
    id_cliente: int
    id_servicio: int
    estado: str
    fecha_reserva: str
    hora_reserva: str
    comentario: Optional[str]
    fecha_creacion: Optional[datetime]
    class Config:
        from_attributes = True

class CambiarEstado(BaseModel):
    estado: str