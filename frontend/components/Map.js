"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import axios from "axios";

const CENTER = [40.4168, -3.7038]; 

export default function Map({ trayectos, usuario }) {

  // --- 1. FUNCIÓN RESERVAR ---
  const handleReservar = async (trayectoId) => {
    if (!usuario) {
      alert("⚠️ Error: No se detecta tu usuario.");
      return;
    }
    if (!confirm("¿Confirmar reserva?")) return;

    try {
      await axios.post("http://127.0.0.1:8000/reservar", {
        id_trayecto: trayectoId,
        id_pasajero: usuario 
      });
      alert("✅ ¡Reserva realizada!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.response?.data?.detail || "Fallo al reservar"));
    }
  };

  // --- 2. FUNCIÓN VER PASAJEROS (NUEVA) ---
  const handleVerPasajeros = async (trayectoId) => {
    try {
      // Llamamos al endpoint de tu backend que lista los pasajeros
      const response = await axios.get(`http://127.0.0.1:8000/trayectos/${trayectoId}/pasajeros`);
      const lista = response.data;

      if (lista.length === 0) {
        alert("ℹ️ Aún no hay pasajeros en este viaje.");
      } else {
        // Sacamos solo los emails de la lista
        const emails = lista.map(p => "👤 " + p.id_pasajero).join("\n");
        alert("📋 LISTA DE PASAJEROS:\n\n" + emails);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error al cargar pasajeros.");
    }
  };

  // --- 3. FUNCIÓN BORRAR VIAJE (NUEVA) ---
  const handleBorrar = async (trayectoId) => {
    if (!confirm("🚨 ¿Seguro que quieres ELIMINAR este viaje? Esta acción no se puede deshacer.")) return;

    try {
      await axios.delete(`https://joinmytrip-backend.onrender.com/trayectos/${trayectoId}`);
      alert("🗑️ Viaje eliminado correctamente.");
      window.location.reload(); // Recargamos para que desaparezca la chincheta
    } catch (error) {
      console.error(error);
      alert("❌ Error al borrar el viaje.");
    }
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200 mt-6">
      <MapContainer center={CENTER} zoom={6} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {trayectos && trayectos.map((t) => {
          if (!t.latitud || !t.longitud) return null;

          // Comprobamos si YO soy el conductor de este viaje
          const soyConductor = usuario === t.conductor;

          return (
            <Marker key={t.id} position={[t.latitud, t.longitud]}>
              <Popup>
                <div className="text-center p-2 min-w-[200px]">
                  <h3 className="font-bold text-blue-600 text-lg mb-2">
                    {t.origen} ➝ {t.destino}
                  </h3>
                  
                  <div className="text-sm text-gray-700 mb-4 space-y-1 text-left bg-gray-50 p-2 rounded">
                    <p>🚗 <b>Conductor:</b> {soyConductor ? <span className="text-green-600 font-bold">(TÚ)</span> : t.conductor}</p>
                    <p>📅 <b>Fecha:</b> {t.fecha_hora}</p>
                    <p>💺 <b>Plazas:</b> {t.plazas}</p> 
                    {t.precio && <p>💰 <b>Precio:</b> {t.precio} €</p>}
                  </div>

                  {/* --- BOTONES DE ACCIÓN --- */}
                  <div className="flex flex-col gap-2">
                    
                    {/* Botón 1: Reservar (Solo si NO eres el conductor y hay plazas) */}
                    {!soyConductor && t.plazas > 0 && (
                      <button onClick={() => handleReservar(t.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded shadow">
                        Reservar Plaza
                      </button>
                    )}

                    {/* Aviso si está lleno */}
                    {!soyConductor && t.plazas <= 0 && (
                      <button disabled className="bg-gray-400 text-white font-bold py-1 px-4 rounded cursor-not-allowed">
                        ⛔ Completo
                      </button>
                    )}

                    {/* Botón 2: Ver Pasajeros (Para todos) */}
                    <button onClick={() => handleVerPasajeros(t.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded shadow">
                      👥 Ver Pasajeros
                    </button>

                    {/* Botón 3: Borrar (SOLO si eres el conductor) */}
                    {soyConductor && (
                      <button onClick={() => handleBorrar(t.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded shadow border border-red-700">
                        🗑️ Borrar Viaje
                      </button>
                    )}
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}