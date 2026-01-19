"use client";

import { useState } from "react";
import axios from "axios";

export default function CreateForm({ usuario, alCrear }) {
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    latitud: "",
    longitud: "",
    vehiculo: "",
    fecha_hora: "",
    plazas: 4,
    precio: 10
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosEnviar = {
        ...formData,
        conductor: usuario,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        plazas: parseInt(formData.plazas),
        precio: parseFloat(formData.precio),
      };

      await axios.post("http://127.0.0.1:8000/trayectos", datosEnviar);
      alert("✅ ¡Viaje publicado con éxito!");
      
      setFormData({
        origen: "", destino: "", latitud: "", longitud: "",
        vehiculo: "", fecha_hora: "", plazas: 4, precio: 10
      });

      if (alCrear) alCrear();

    } catch (error) {
      console.error(error);
      alert("❌ Error al crear: Revisa los datos.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg mt-8 border-t-4 border-blue-500 mb-10">
      <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">🚗 Publicar un nuevo viaje</h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Origen y Destino */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad de Origen</label>
          <input name="origen" placeholder="Ej: Sevilla" onChange={handleChange} value={formData.origen} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad de Destino</label>
          <input name="destino" placeholder="Ej: Huelva" onChange={handleChange} value={formData.destino} className="border p-2 rounded w-full" required />
        </div>
        
        {/* Coordenadas */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Latitud (Mapa)</label>
          <input name="latitud" type="number" step="any" placeholder="Ej: 37.38" onChange={handleChange} value={formData.latitud} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Longitud (Mapa)</label>
          <input name="longitud" type="number" step="any" placeholder="Ej: -5.98" onChange={handleChange} value={formData.longitud} className="border p-2 rounded w-full" required />
        </div>
        
        {/* Detalles del coche y fecha */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Vehículo</label>
           <input name="vehiculo" placeholder="Ej: Seat Panda" onChange={handleChange} value={formData.vehiculo} className="border p-2 rounded w-full" required />
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Fecha y Hora de Salida</label>
           <input name="fecha_hora" type="datetime-local" onChange={handleChange} value={formData.fecha_hora} className="border p-2 rounded w-full" required />
        </div>

        {/* --- AQUÍ ESTÁN LOS CAMBIOS QUE PEDISTE --- */}
        <div className="flex gap-4 col-span-1 md:col-span-2">
          <div className="w-1/2">
            <label className="block text-sm font-bold text-blue-600 mb-1">Nº Plazas Libres</label>
            <input name="plazas" type="number" onChange={handleChange} value={formData.plazas} className="border p-2 rounded w-full font-bold text-center bg-blue-50" required />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-bold text-green-600 mb-1">Precio por persona (€)</label>
            <input name="precio" type="number" onChange={handleChange} value={formData.precio} className="border p-2 rounded w-full font-bold text-center bg-green-50" />
          </div>
        </div>

        <button type="submit" className="col-span-1 md:col-span-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
          Publicar Viaje Ahora
        </button>
      </form>
    </div>
  );
}