from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Modelo para crear un Trayecto
# NO PONEMOS ID AQUÍ (MongoDB lo crea solo)
class Trayecto(BaseModel):
    origen: str
    destino: str
    latitud: float
    longitud: float
    conductor: EmailStr
    vehiculo: str
    fecha_hora: datetime
    plazas: int

# Modelo para registrar un Pasajero (Reserva)
class Pasajero(BaseModel):
    id_trayecto: str
    id_pasajero: EmailStr