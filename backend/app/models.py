from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, DECIMAL, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    rol = Column(Enum("admin", "cliente", "barbero"), nullable=False)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    telefono = Column(String(20))
    direccion = Column(Text)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())
    foto = Column(String(255), nullable=True)
    reservas = relationship("Reserva", back_populates="cliente", foreign_keys="Reserva.id_cliente")

class Servicio(Base):
    __tablename__ = "servicios"
    id = Column(Integer, primary_key=True, index=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id"))
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    precio = Column(DECIMAL(10, 2), nullable=False)
    imagen = Column(String(255))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
    reservas = relationship("Reserva", back_populates="servicio")

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    activa = Column(Boolean, default=True)
    servicios = relationship("Servicio", back_populates="categoria")

Servicio.categoria = relationship("Categoria", back_populates="servicios")

class Reserva(Base):
    __tablename__ = "reservas"
    id = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_servicio = Column(Integer, ForeignKey("servicios.id"), nullable=False)
    id_barbero = Column(Integer, ForeignKey("usuarios.id"))
    estado = Column(Enum("Pendiente", "En Curso", "Listo", "Cancelado"), default="Pendiente")
    fecha_reserva = Column(String(20), nullable=False)
    hora_reserva = Column(String(10), nullable=False)
    comentario = Column(Text)
    fecha_creacion = Column(DateTime, server_default=func.now())
    cliente = relationship("Usuario", back_populates="reservas", foreign_keys=[id_cliente])
    servicio = relationship("Servicio", back_populates="reservas")