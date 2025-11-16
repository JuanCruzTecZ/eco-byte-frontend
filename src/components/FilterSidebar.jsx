// En: src/components/FilterSidebar.jsx

import { useState } from 'react';
import { useProvinces } from '../hooks/useProvinces';

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

  // Provincias desde la API (o fallback interno del hook)
  const { provinces } = useProvinces();

  // Estado para buscar ubicaciones
  const [locationQuery, setLocationQuery] = useState("");

  // Ubicaciones: si la API responde usamos provincias; si no, los valores anteriores
  const baseLocations = provinces.length > 0
    ? provinces
    : ["Córdoba, Capital", "Buenos Aires", "Rosario", "Mendoza", "Tucumán", "Jujuy"];

  const locations = [
    "Todas las Ubicaciones",
    ...baseLocations
  ];

  const filteredLocations = locations.filter((loc) =>
    loc === "Todas las Ubicaciones" ||
    loc.toLowerCase().includes(locationQuery.toLowerCase())
  );

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
        {/* Buscador de ubicaciones */}
        <input
          type="text"
          placeholder="Buscar provincia..."
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-surface px-3 py-1 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {/* Lista con scroll */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {filteredLocations.map((location) => (
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