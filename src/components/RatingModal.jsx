// En: src/components/RatingModal.jsx

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";

export function RatingModal({ modalInfo, onClose, onRateBuyer, onRateSeller }) {
  const { mode, product, buyer, seller, chatId, productTitle } = modalInfo;
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- LÓGICA DE TEXTOS A PRUEBA DE FALLOS ---
  // Fallbacks para evitar crashes si 'product' o 'buyer' son undefined
  const safePTitle = product?.title || productTitle || "este producto";
  const safeBName = buyer?.name || "el comprador";
  const safeSName = seller?.name || "el vendedor";
  
  const texts = {
    rateBuyer: {
      title: "Venta Completada",
      subtitle: `Vas a marcar <span class="font-medium text-primary">${safePTitle}</span> como vendido.`,
      prompt: `Por favor, califica tu experiencia con <span class="font-medium text-primary">${safeBName}</span>.`,
      button: "Completar Venta y Calificar"
    },
    rateSeller: {
      title: "Calificar Vendedor",
      subtitle: `Califica tu compra del producto <span class="font-medium text-primary">${safePTitle}</span>.`,
      prompt: `Por favor, califica tu experiencia con <span class="font-medium text-primary">${safeSName}</span>.`,
      button: "Enviar Calificación"
    }
  };
  
  const currentTexts = texts[mode] || texts['rateBuyer']; // Fallback por si el 'mode' es inválido

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor, selecciona una calificación.");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'rateBuyer') {
        // Asegurarse de que product y buyer existan antes de llamar
        if (product?.id && buyer?.uid) {
          await onRateBuyer(product.id, buyer.uid, rating);
        } else {
          throw new Error("Datos de comprador o producto no válidos.");
        }
      } else if (mode === 'rateSeller') {
        // Asegurarse de que chatId y seller existan
        if (chatId && seller?.uid) {
          await onRateSeller(chatId, seller.uid, rating);
        } else {
          throw new Error("Datos de chat o vendedor no válidos.");
        }
      }
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo enviar la calificación.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#333333]">{currentTexts.title}</h2>
          <p 
            className="text-muted-foreground mt-2"
            dangerouslySetInnerHTML={{ __html: currentTexts.subtitle }}
          />
          <p 
            className="text-muted-foreground mt-1"
            dangerouslySetInnerHTML={{ __html: currentTexts.prompt }}
          />
        </div>

        <div className="flex justify-center gap-2 my-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-10 h-10 cursor-pointer ${
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm font-medium text-red-500 text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            currentTexts.button
          )}
        </button>
      </div>
    </div>
  );
}