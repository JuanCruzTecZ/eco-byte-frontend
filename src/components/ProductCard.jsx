// En: src/components/ProductCard.jsx

import { MapPin, Trash2, Pencil } from "lucide-react"; // Importamos Pencil
import { ImageWithFallback } from "./ui/ImageWithFallback";

const getConditionColor = (condition) => {
  switch (condition) {
    case "Nuevo":
      return "bg-green-100 text-green-800 border-green-200";
    case "Funcional":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Para Repuestos":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// --- Recibimos la nueva prop 'onEdit' ---
export function ProductCard({ product, onClick, onDelete, onEdit }) {
  
  const handleDeleteClick = (e) => {
    e.stopPropagation(); 
    onDelete(product);
  };
  
  // --- NUEVO: Manejador de Edición ---
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(product);
  };
  
  return (
    <div
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-md border border-border relative"
      onClick={onClick}
    >
      {/* --- Contenedor de Botones de Acción --- */}
      {(onDelete || onEdit) && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          {/* Botón de Eliminar */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {/* Botón de Editar */}
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      <div className="aspect-square overflow-hidden bg-[#F5F5F5]">
        <ImageWithFallback
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-[#333333] line-clamp-2 mb-2">{product.title}</h3>
          <p className="text-primary">$ {product.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-sm text-xs font-semibold px-2.5 py-0.5 ${getConditionColor(product.condition)}`}
          >
            {product.condition}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{product.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}