"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import CreateForm from "./CreateForm"; // Ya lo tenías importado, bien hecho.

// Importamos el mapa dinámicamente
const Map = dynamic(() => import("./Map"), { ssr: false });

export default function Dashboard({ session }) {
  const [trayectos, setTrayectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // 1. Carga inicial de TODOS los trayectos
  const cargarTrayectos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/trayectos");
      setTrayectos(response.data);
    } catch (error) {
      console.error("Error cargando trayectos:", error);
    }
  };

  useEffect(() => {
    cargarTrayectos();
  }, []);

  // 2. Función para BUSCAR por ciudad
  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda) return;

    try {
      const response = await axios.get(`http://127.0.0.1:8000/buscar/origen/${busqueda}`);
      setTrayectos(response.data);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("No se encontraron viajes o hubo un error.");
    }
  };

  // 3. Función para LIMPIAR
  const handleLimpiar = () => {
    setBusqueda("");
    cargarTrayectos();
  };

  return (
    <div className="w-full max-w-5xl mb-10">
      {/* Cabecera Usuario */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow">
        <div>
          <p className="font-bold text-gray-800">Hola, {session?.user?.name}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
      </div>

      {/* --- BLOQUE DEL MAPA Y BUSCADOR --- */}
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Mapa de Trayectos</h2>
        
        {/* Barra de Búsqueda */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Buscar por ciudad de origen (ej: Madrid)..."
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-blue-500"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button 
            onClick={handleBuscar}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-bold"
          >
            Buscar
          </button>
          
          <button 
            onClick={handleLimpiar}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Ver Todos
          </button>
        </div>

        <p className="text-gray-500 mb-4">
          Resultados: <strong>{trayectos.length}</strong> trayectos encontrados.
        </p>
        
        {/* Mapa */}
        <Map trayectos={trayectos} usuario={session?.user?.email} />
      </div>

      {/* --- AQUÍ ES DONDE FALTABA EL FORMULARIO --- */}
      {/* Lo añadimos debajo del mapa */}
      <CreateForm usuario={session?.user?.email} alCrear={cargarTrayectos} />

    </div>
  );
}