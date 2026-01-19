import { auth, signIn, signOut } from "@/auth";
import Dashboard from "@/components/Dashboard"; // ¡Mira qué limpio!

export default async function Home() {
  const session = await auth();

  // --- CASO 1: NO LOGUEADO ---
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">Join MyTrip</h1>
        <div className="bg-white p-8 rounded shadow-md text-center">
          <p className="mb-4 text-gray-700">Bienvenido. Inicia sesión para continuar.</p>
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            >
              Iniciar sesión con Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- CASO 2: LOGUEADO ---
  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
       {/* Barra superior con botón de salir (igual que tu ejemplo) */}
       <div className="w-full max-w-5xl mb-4 flex justify-end">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
            >
              Cerrar Sesión
            </button>
          </form>
       </div>

      {/* Cargamos el Dashboard que contiene el mapa */}
      <Dashboard session={session} />
    </main>
  );
}