// En: src/components/FilterSidebar.jsx

import { useState } from 'react';

export function FilterSidebar({ filters, onFilterChange }) {
  const categories = [
    "Todas las Categorías",
    "Placas Base",
    "Memoria RAM",
    "Tarjetas Gráficas",
    "Procesadores",
    "Almacenamiento",
    "Teclados",
    "Otros"
  ];

  const conditions = [
    { id: "nuevo", label: "Nuevo" },
    { id: "funcional", label: "Funcional" },
    { id: "repuestos", label: "Para Repuestos" }
  ];

  // --- ARREGLO AQUÍ ---
  const locations = [
    "Todas las Ubicaciones",
    "Córdoba, Capital",
    "Buenos Aires",
    "Rosario",
    "Mendoza",
    "Tucumán",
    "Jujuy"
  ];
  // --- FIN DE ARREGLO ---

  const handleCategoryChange = (value) => {
    onFilterChange({ ...filters, category: value });
  };

  const handleConditionChange = (conditionId, checked) => {
    const newConditions = checked
      ? [...filters.condition, conditionId]
      : filters.condition.filter(c => c !== conditionId);
    onFilterChange({ ...filters, condition: newConditions });
  };

  const handleLocationChange = (value) => {
    onFilterChange({ ...filters, location: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      category: "Todas las Categorías",
      condition: [],
      location: "Todas las Ubicaciones"
    });
  };

  return (
    <div className="w-72 p-8 bg-white border-r hidden lg:block flex-shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#333333]">Filtros</h3>
        <button
          className="h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          onClick={handleClearFilters}
        >
          Limpiar
        </button>
      </div>

      <hr className="border-t border-border/50" />

      <div className="space-y-3">
        <label className="text-sm font-medium text-[#333333]">Categoría Técnica</label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <input
                type="radio"
                id={category}
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="cursor-pointer"
              />
              <label htmlFor={category} className="cursor-pointer text-sm">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t border-border/50" />

      <div className="space-y-3">
        <label className="text-sm font-medium text-[#333333]">Estado del Componente</label>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <div key={condition.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={condition.id}
                checked={filters.condition.includes(condition.id)}
                onChange={(e) => handleConditionChange(condition.id, e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor={condition.id} className="cursor-pointer text-sm">
                {condition.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t border-border/50" />

      <div className="space-y-3">
        <label className="text-sm font-medium text-[#333333]">Ubicación</label>
        <div className="space-y-2">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <input
                type="radio"
                id={location}
                value={location}
                checked={filters.location === location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="cursor-pointer"
              />
              <label htmlFor={location} className="cursor-pointer text-sm">
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}