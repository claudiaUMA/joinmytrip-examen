from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from database import trayectos_collection, pasajeros_collection
from models import Trayecto, Pasajero
from schemas import trayecto_schema, trayectos_schema, pasajeros_schema

app = FastAPI()

# Configuración de CORS (Vital para que el frontend pueda conectarse luego)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción esto se cambia, pero para el examen "*" está bien
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensaje": "Backend Join MyTrip funcionando"}

# --- FUNCIONALIDAD BÁSICA (A) ---

# 1. Obtener todos los trayectos (ordenados por fecha)
@app.get("/trayectos")
def obtener_trayectos():
    # .sort("fecha_hora", 1) ordena de más antiguo a más futuro
    datos = trayectos_collection.find().sort("fecha_hora", 1)
    return trayectos_schema(datos)

# --- FUNCIONALIDAD AVANZADA (EXAMEN PARCIAL 2) ---

@app.get("/trayectos/compartidos")
def buscar_trayectos_compartidos(email1: str, email2: str):
    """
    Busca trayectos donde dos personas han coincidido, ya sea:
    1. Uno conduce y el otro es pasajero.
    2. Ambos son pasajeros en el mismo viaje.
    """
    
    # PASO 1: Obtener todos los IDs de trayectos donde 'email1' estuvo presente
    # A) Como conductor
    ids_1 = set() # Usamos un conjunto (set) para no tener duplicados
    trayectos_conductor_1 = trayectos_collection.find({"conductor": email1})
    for t in trayectos_conductor_1:
        ids_1.add(str(t["_id"]))
        
    # B) Como pasajero
    reservas_1 = pasajeros_collection.find({"id_pasajero": email1})
    for r in reservas_1:
        ids_1.add(r["id_trayecto"])

    # PASO 2: Obtener todos los IDs de trayectos donde 'email2' estuvo presente
    ids_2 = set()
    # A) Como conductor
    trayectos_conductor_2 = trayectos_collection.find({"conductor": email2})
    for t in trayectos_conductor_2:
        ids_2.add(str(t["_id"]))
    
    # B) Como pasajero
    reservas_2 = pasajeros_collection.find({"id_pasajero": email2})
    for r in reservas_2:
        ids_2.add(r["id_trayecto"])

    # PASO 3: Calcular la INTERSECCIÓN (Los IDs que están en ambos conjuntos)
    ids_compartidos = ids_1.intersection(ids_2)
    
    if not ids_compartidos:
        return [] # No han compartido coche nunca

    # PASO 4: Recuperar los datos completos de esos trayectos
    # Convertimos los IDs de string a ObjectId para buscar en Mongo
    object_ids = [ObjectId(id_str) for id_str in ids_compartidos]
    
    # Buscamos en la base de datos usando el operador $in (buscar varios IDs a la vez)
    resultados = trayectos_collection.find({"_id": {"$in": object_ids}})
    
    return trayectos_schema(resultados)

# 2. Obtener un trayecto por ID
@app.get("/trayectos/{id}")
def obtener_trayecto(id: str):
    try:
        dato = trayectos_collection.find_one({"_id": ObjectId(id)})
        if not dato:
            raise HTTPException(status_code=404, detail="Trayecto no encontrado")
        return trayecto_schema(dato)
    except:
        raise HTTPException(status_code=400, detail="ID no válido")

# 3. Crear un trayecto
@app.post("/trayectos")
def crear_trayecto(trayecto: Trayecto):
    # Convertimos el modelo a diccionario
    nuevo_trayecto = trayecto.dict()
    # Lo guardamos en MongoDB
    id_insertado = trayectos_collection.insert_one(nuevo_trayecto).inserted_id
    return {"id": str(id_insertado), "mensaje": "Trayecto creado correctamente"}

# 4. Reservar plaza
# Esto es especial: crea pasajero Y resta una plaza al trayecto
@app.post("/reservar")
def reservar_plaza(reserva: Pasajero):
    # Primero buscamos el trayecto
    trayecto_db = trayectos_collection.find_one({"_id": ObjectId(reserva.id_trayecto)})
    
    if not trayecto_db:
        raise HTTPException(status_code=404, detail="El trayecto no existe")
    
    # Comprobamos si quedan plazas
    if trayecto_db["plazas"] <= 0:
        raise HTTPException(status_code=400, detail="No quedan plazas disponibles")

    # Si todo ok:
    # 1. Guardamos al pasajero
    pasajeros_collection.insert_one(reserva.dict())
    
    # 2. Restamos 1 a las plazas del trayecto
    nuevas_plazas = trayecto_db["plazas"] - 1
    trayectos_collection.update_one(
        {"_id": ObjectId(reserva.id_trayecto)},
        {"$set": {"plazas": nuevas_plazas}}
    )
    
    return {"mensaje": "Reserva realizada y plaza descontada"}

# 5. Mostrar pasajeros de un trayecto
@app.get("/trayectos/{id_trayecto}/pasajeros")
def ver_pasajeros(id_trayecto: str):
    datos = pasajeros_collection.find({"id_trayecto": id_trayecto})
    return pasajeros_schema(datos)

# --- FUNCIONALIDAD ESPECÍFICA PARCIAL 2 (B) ---

# 6. Modificar plazas manualmente
@app.put("/trayectos/{id}/plazas")
def modificar_plazas(id: str, plazas: int):
    trayectos_collection.update_one(
        {"_id": ObjectId(id)}, 
        {"$set": {"plazas": plazas}}
    )
    return {"mensaje": "Plazas actualizadas"}

# 7. Eliminar trayecto
@app.delete("/trayectos/{id}")
def eliminar_trayecto(id: str):
    trayectos_collection.delete_one({"_id": ObjectId(id)})
    return {"mensaje": "Trayecto eliminado"}

# 8. Buscar por Origen con plazas disponibles
@app.get("/buscar/origen/{ciudad}")
def buscar_por_origen(ciudad: str):
    # Filtro: ciudad coincide Y plazas mayor que 0 ($gt: 0)
    datos = trayectos_collection.find({
        "origen": ciudad,
        "plazas": {"$gt": 0}
    }).sort("fecha_hora", 1)
    return trayectos_schema(datos)

