import { useState, useEffect } from 'react';

export function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://apis.datos.gob.ar/georef/api/provincias');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta API Georef:', data);
        
        // La API devuelve: { cantidad, inicio, parametros, provincias: [{ id, nombre, centroide }], total }
        if (data.provincias && Array.isArray(data.provincias) && data.provincias.length > 0) {
          // Extraemos solo los nombres de las provincias
          const provincesList = data.provincias.map(prov => prov.nombre);
          
          // Ordenamos las provincias alfabéticamente
          const sortedProvinces = provincesList.sort((a, b) => a.localeCompare(b, 'es'));
          setProvinces(sortedProvinces);
          setError(null);
          console.log('Provincias cargadas exitosamente:', sortedProvinces.length);
        } else {
          throw new Error('No se encontraron provincias en la respuesta de la API');
        }
      } catch (err) {
        console.error('Error obteniendo provincias:', err);
        setError(err.message);
        // Fallback a provincias por defecto si falla la API
        const defaultProvinces = [
          "Buenos Aires",
          "Catamarca",
          "Chaco",
          "Chubut",
          "Córdoba",
          "Corrientes",
          "Entre Ríos",
          "Formosa",
          "Jujuy",
          "La Pampa",
          "La Rioja",
          "Mendoza",
          "Misiones",
          "Neuquén",
          "Río Negro",
          "Salta",
          "San Juan",
          "San Luis",
          "Santa Cruz",
          "Santa Fe",
          "Santiago del Estero",
          "Tierra del Fuego",
          "Tucumán"
        ];
        setProvinces(defaultProvinces);
        console.log('Usando provincias por defecto');
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return { provinces, loading, error };
}

