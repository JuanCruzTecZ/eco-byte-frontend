// En: src/components/ui/ImageWithFallback.jsx

import { useState } from 'react';

export function ImageWithFallback({ src, alt, className }) {
  const [hasError, setHasError] = useState(false);

  // Si el 'src' está vacío o da error, muestra un placeholder
  if (hasError || !src) {
    return (
      <div 
        className={`flex items-center justify-center w-full h-full bg-gray-200 text-gray-400 ${className}`}
        // Removemos 'object-cover' y 'hover:scale' del placeholder
        style={{ objectFit: 'unset', transform: 'none' }} 
      >
        {/* Opcional: un ícono de placeholder */}
        <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.4,17.4H2.6c-0.9,0-1.6-0.7-1.6-1.6V4.1c0-0.9,0.7-1.6,1.6-1.6h14.8c0.9,0,1.6,0.7,1.6,1.6v11.7C19,16.7,18.3,17.4,17.4,17.4z M2.6,3.5c-0.3,0-0.6,0.3-0.6,0.6v11.7c0,0.3,0.3,0.6,0.6,0.6h14.8c0.3,0,0.6-0.3,0.6-0.6V4.1c0-0.3-0.3-0.6-0.6-0.6H2.6z M6.9,12.5l-3,3C3.8,15.6,3.6,15.7,3.5,15.7s-0.3,0-0.4-0.1c-0.2-0.2-0.2-0.5,0-0.7l3-3c0.2-0.2,0.5-0.2,0.7,0S7,12.3,6.9,12.5z M14,11c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S15.1,11,14,11z M14,8c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S14.6,8,14,8z M16.5,15.5H8.3c-0.3,0-0.5-0.2-0.5-0.5s0.2-0.5,0.5-0.5h8.3c0.3,0,0.5,0.2,0.5,0.5S16.8,15.5,16.5,15.5z M16.5,13.5H8.3c-0.3,0-0.5-0.2-0.5-0.5s0.2-0.5,0.5-0.5h8.3c0.3,0,0.5,0.2,0.5,0.5S16.8,13.5,16.5,13.5z"/>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)} // Si falla, activa el estado de error
    />
  );
}