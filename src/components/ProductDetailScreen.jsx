import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, MessageCircle, Star, ChevronLeft, ChevronRight, User as UserIcon, Trash2, Loader2 } from "lucide-react";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import { db } from "../firebase"; // Importamos db
import { doc, getDoc } from "firebase/firestore"; // Importamos getDoc

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

export function ProductDetailScreen({ product, onNavigate, onStartChat, currentUser, isAdmin, onAdminDelete }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sellerData, setSellerData] = useState(null); // Estado para el perfil del vendedor
  const [loadingSeller, setLoadingSeller] = useState(true);
  
  const images = product.images?.length > 0 ? product.images : [product.image];

  // --- Cargar datos del vendedor ---
  useEffect(() => {
    if (!product.sellerId) return;
    
    setLoadingSeller(true);
    const sellerDocRef = doc(db, "users", product.sellerId);
    
    getDoc(sellerDocRef).then(docSnap => {
      if (docSnap.exists()) {
        setSellerData(docSnap.data());
      } else {
        console.warn("No se encontró el documento del vendedor.");
      }
      setLoadingSeller(false);
    }).catch(err => {
      console.error("Error cargando datos del vendedor:", err);
      setLoadingSeller(false);
    });

  }, [product.sellerId]); // Se ejecuta cuando el producto (o su sellerId) cambia

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isMyProduct = currentUser && currentUser.uid === product.sellerId;

  // Fallbacks para el nombre (del producto)
  const sellerName = product.sellerName || "Vendedor";
  const sellerAvatar = product.sellerAvatar || null;
  const sellerAvatarChar = sellerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => onNavigate("catalog")}
            className="h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Catálogo
          </button>
          
          {isAdmin && !isMyProduct && (
             <button
              onClick={() => onAdminDelete(product)}
              className="h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Borrar (Admin)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div>
            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="relative aspect-square bg-[#F5F5F5]">
                <ImageWithFallback
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white h-10 w-10 inline-flex items-center justify-center border border-input"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white h-10 w-10 inline-flex items-center justify-center border border-input"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${product.title} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-2xl font-bold text-[#333333] flex-1">{product.title}</h1>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-sm ${getConditionColor(product.condition)}`}
                    >
                      {product.condition}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-primary">$ {product.price.toLocaleString()}</p>
                </div>

                <hr className="border-t border-border/50" />

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{product.location}</span>
                </div>

                <hr className="border-t border-border/50" />

                {product.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#333333] mb-2">Descripción</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.specifications && (
                  <>
                    <hr className="border-t border-border/50" />
                    <div>
                      <h3 className="text-lg font-semibold text-[#333333] mb-3">Especificaciones Técnicas</h3>
                      <div className="space-y-2">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground">{key}</span>
                            <span className="text-[#333333]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* --- Bloque de Vendedor (Actualizado) --- */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#333333] mb-4">Información del Vendedor</h3>
              {loadingSeller ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      {sellerData?.photoURL ? (
                        <img className="aspect-square h-full w-full" src={sellerData.photoURL} alt={sellerData.displayName} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                          {sellerData?.displayName?.charAt(0).toUpperCase() || <UserIcon />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-[#333333]">{sellerData?.displayName || "Vendedor"}</p>
                      {/* Mostramos el Rating del Vendedor */}
                      {sellerData && sellerData.ratingCount > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{sellerData.ratingAvg.toFixed(1)}</span>
                          <span>({sellerData.ratingCount} calificaciones)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isMyProduct ? (
                    <button
                      onClick={() => onStartChat(product)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-10 px-4 py-2 flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chatear con Vendedor
                    </button>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground p-2 border rounded-md">
                      Esta es tu publicación.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
