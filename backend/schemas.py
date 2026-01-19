# Convierte un trayecto individual de MongoDB a un diccionario limpio
def trayecto_schema(item) -> dict:
    return {
        "id": str(item["_id"]),
        "origen": item["origen"],
        "destino": item["destino"],
        "conductor": item["conductor"],
        "vehiculo": item["vehiculo"],
        "fecha_hora": item["fecha_hora"],
        "plazas": item["plazas"]
    }

# --- TRADUCTOR PARA UN SOLO TRAYECTO (SINGULAR) ---
# Recibe 1 viaje, devuelve 1 diccionario
def trayecto_schema(item) -> dict:
    return {
        "id": str(item["_id"]),
        "origen": item["origen"],
        "destino": item["destino"],
        "conductor": item["conductor"],
        "vehiculo": item["vehiculo"],
        "fecha_hora": item["fecha_hora"],
        "plazas": item["plazas"],
        # Usamos .get() para evitar errores si faltan coordenadas en viajes viejos
        "latitud": item.get("latitud"), 
        "longitud": item.get("longitud")
    }

# --- TRADUCTOR PARA LA LISTA DE TRAYECTOS (PLURAL) ---
# Recibe la "caja" (Cursor) y aplica la función anterior a cada elemento
def trayectos_schema(items) -> list:
    return [trayecto_schema(item) for item in items]

# Convierte un pasajero individual (reserva)
def pasajero_schema(item) -> dict:
    return {
        "id": str(item["_id"]),
        "id_trayecto": item["id_trayecto"],
        "id_pasajero": item["id_pasajero"]
    }

# Convierte una lista de pasajeros
def pasajeros_schema(items) -> list:
    return [pasajero_schema(item) for item in items]