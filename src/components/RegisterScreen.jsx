// En: src/components/RegisterScreen.jsx

import { useState } from "react";
import { Recycle, Mail, Lock, User } from "lucide-react";
// Importamos auth y db
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// Importamos 'doc' y 'setDoc' para Firestore
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export function RegisterScreen({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Actualizar el perfil de Auth (guardar nombre)
      await updateProfile(user, {
        displayName: formData.name,
      });

      // 3. Crear documento en Firestore ('users' collection)
      // Usamos el UID del usuario como ID del documento
      const userDocRef = doc(db, "users", user.uid);
      
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: formData.name,
        email: user.email,
        createdAt: serverTimestamp(),
        // Campos iniciales para el sistema de rating
        ratingCount: 0,
        ratingTotal: 0,
        ratingAvg: 0
      });

      setLoading(false);
      // (App.jsx detectará el login automáticamente)

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado.");
      } else {
        setError("Error al crear la cuenta.");
      }
      console.error("Error en registro: ", err);
      setLoading(false);
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
                <h3 className="text-2xl font-semibold text-[#333333]">Crear una Cuenta</h3>
                <p className="text-sm text-muted-foreground">
                  Únete a la comunidad de Eco Byte.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
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
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="px-6 text-sm font-medium text-red-500 text-center">{error}</p>
            )}

            <div className="flex flex-col items-center p-6 pt-4">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Cuenta"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="mt-4 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent"
                disabled={loading}
              >
                ¿Ya tienes cuenta? <span className="font-semibold ml-1">Inicia Sesión</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}