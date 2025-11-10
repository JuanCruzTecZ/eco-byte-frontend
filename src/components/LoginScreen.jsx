// En: src/components/LoginScreen.jsx

import { useState } from "react";
import { Recycle, Mail, Lock } from "lucide-react";
// Importamos 'auth' y la función de login
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export function LoginScreen({ onNavigate }) {
  // Estados para el formulario controlado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos

    try {
      // Intentar iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Si tiene éxito, el 'onAuthStateChanged' en App.jsx
      // se encargará de redirigir al catálogo.
    } catch (err) {
      // Manejo de errores de Firebase
      console.error("Error de login:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError("Email o contraseña incorrectos.");
      } else {
        setError("Ocurrió un error. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Recycle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#333333]">Iniciar Sesión</h3>
                <p className="text-sm text-muted-foreground">
                  Accede para vender y comprar componentes.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                    value={email} // Controlado
                    onChange={(e) => setEmail(e.target.value)} // Controlado
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                    value={password} // Controlado
                    onChange={(e) => setPassword(e.target.value)} // Controlado
                  />
                </div>
              </div>
              
              {/* Mostrar errores de Firebase */}
              {error && (
                <p className="text-sm font-medium text-red-500 text-center">{error}</p>
              )}

            </div>

            <div className="flex flex-col items-center p-6 pt-0">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => onNavigate("register")}
                className="mt-4 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent"
              >
                ¿No tienes cuenta? <span className="font-semibold ml-1">Regístrate</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}