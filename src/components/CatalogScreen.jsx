// En: src/components/CatalogScreen.jsx

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { Loader2 } from "lucide-react"; // Importamos un ícono de carga

export function CatalogScreen({ 
  products, 
  productsLoading, // Recibimos el estado de carga
  onProductClick, 
  searchQuery, 
  filters, 
  onFilterChange 
}) {

  const filteredProducts = products.filter(product => {
    // (Lógica de filtros... igual que antes)
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.category !== "Todas las Categorías" && product.category !== filters.category) {
      return false;
    }
    if (filters.condition.length > 0) {
      const conditionMap = { "nuevo": "Nuevo", "funcional": "Funcional", "repuestos": "Para Repuestos" };
      const matchesCondition = filters.condition.some(c => conditionMap[c] === product.condition);
      if (!matchesCondition) return false;
    }
    if (filters.location !== "Todas las Ubicaciones" && product.location !== filters.location) {
      return false;
    }
    return true;
  });

  // --- Renderizado de Contenido ---
  const renderContent = () => {
    // 1. Si está cargando
    if (productsLoading) {
      return (
        <div className="text-center py-16 flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando componentes...</p>
        </div>
      );
    }
    
    // 2. Si no hay resultados (después de cargar)
    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No se encontraron componentes.
          </p>
        </div>
      );
    }

    // 3. Si hay resultados
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product} // Pasa el producto real
            onClick={() => onProductClick(product.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <FilterSidebar filters={filters} onFilterChange={onFilterChange} />
      
      <div className="flex-1 p-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#333333] mb-2">Componentes Disponibles</h2>
            {!productsLoading && (
              <p className="text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              </p>
            )}
          </div>
          
          {/* Renderiza el contenido (Loader, Vacío o Grilla) */}
          {renderContent()}

        </div>
      </div>
    </div>
  );
}
