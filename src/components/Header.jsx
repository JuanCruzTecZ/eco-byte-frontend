// En: src/components/Header.jsx

import { Search, User, Plus, Recycle } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export function Header({ isLoggedIn, notificationCount, onNavigate, onSearch, searchQuery }) {
  
  const handleLogout = () => {
    signOut(auth).catch((err) => {
      console.error("Error al cerrar sesión: ", err);
    });
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          
          <button
            onClick={() => onNavigate("catalog")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#333333]">Eco Byte</span>
          </button>

          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar componentes electrónicos..."
              className="pl-10 bg-[#F5F5F5] border-0 rounded-md h-10 w-full" 
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate("publish")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-10 px-4 py-2 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => onNavigate("profile")}
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-10 w-10 flex items-center justify-center"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {/* El punto rojo (ahora es el total) */}
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center border-2 border-white">
                      {notificationCount}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-4 py-2"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-4 py-2"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-10 px-4 py-2"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}