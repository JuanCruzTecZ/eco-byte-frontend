// En: src/components/PublishScreen.jsx

import { useState, useEffect } from "react";
import { Upload, ArrowLeft, Check, Loader2 } from "lucide-react";
import { db, storage, auth } from "../firebase";
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function PublishScreen({ user, onNavigate, productToEdit }) {
  
  const isEditMode = !!productToEdit;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && productToEdit) {
      setFormData({
        title: productToEdit.title,
        description: productToEdit.description,
        price: productToEdit.price.toString(),
        category: productToEdit.category,
        condition: productToEdit.condition,
        location: productToEdit.location,
      });
      setImagePreview(productToEdit.image);
    }
  }, [isEditMode, productToEdit]); 

  const categories = ["Placas Base", "Memoria RAM", "Tarjetas Gráficas", "Procesadores", "Almacenamiento", "Teclados", "Otros"];
  const conditions = ["Nuevo", "Funcional", "Para Repuestos"];
  // --- ARREGLO AQUÍ ---
  const locations = ["Córdoba, Capital", "Buenos Aires", "Rosario", "Mendoza", "Tucumán", "Jujuy"];
  // --- FIN DE ARREGLO ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("No estás autenticado.");
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      if (isEditMode) {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://localhost:5000/user/update_product/${productToEdit.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData) 
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error al actualizar");
        }
        console.log(data.success);
        onNavigate("profile"); 
        
      } else {
        if (!imageFile) {
          setError("Por favor, selecciona una imagen.");
          setIsUploading(false);
          return;
        }
        
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "products"), {
          ...formData,
          price: Number(formData.price),
          image: downloadURL,
          images: [downloadURL],
          sellerId: user.uid,
          sellerName: user.displayName || user.email,
          sellerAvatar: user.photoURL || '',
          createdAt: serverTimestamp(),
          status: 'Disponible'
        });

        console.log("Componente publicado");
        onNavigate("catalog");
      }
    } catch (err) {
      console.error("Error al procesar:", err);
      setError(err.message || "Error al procesar. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    if (isEditMode) return; 
    
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="text-sm font-medium">Título del Componente *</label>
              <input id="title" name="title" placeholder="Ej: Placa Base HP Pavilion G6" value={formData.title} onChange={handleFormChange} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">Descripción *</label>
              <textarea id="description" name="description" placeholder="Describe las características y estado del componente..." value={formData.description} onChange={handleFormChange} className="mt-2 min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="price" className="text-sm font-medium">Precio (ARS) *</label>
              <input id="price" name="price" type="number" placeholder="15000" value={formData.price} onChange={handleFormChange} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="text-sm font-medium">Categoría Técnica *</label>
              <select id="category" name="category" value={formData.category} onChange={handleFormChange} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="text-sm font-medium">Estado del Componente *</label>
              <select id="condition" name="condition" value={formData.condition} onChange={handleFormChange} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="" disabled>Selecciona el estado</option>
                {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="text-sm font-medium">Ubicación *</label>
              <select id="location" name="location" value={formData.location} onChange={handleFormChange} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="" disabled>Selecciona tu ubicación</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">Imágenes del Componente</label>
              <input 
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                className="hidden"
                disabled={isEditMode}
              />
              <label 
                htmlFor={isEditMode ? '' : 'file-upload'}
                className={`mt-2 border-2 border-dashed rounded-md p-8 text-center transition-colors ${isEditMode ? 'cursor-not-allowed bg-gray-100' : 'hover:border-primary cursor-pointer'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="w-full h-48 object-contain rounded-md" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-1">Haz clic para subir una imagen</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG hasta 10MB</p>
                  </>
                )}
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-900">
                <strong>{isEditMode ? "Info:" : "Consejo:"}</strong> 
                {isEditMode ? " La edición de la imagen principal no está disponible." : " Incluye fotos claras desde diferentes ángulos."}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  const totalSteps = isEditMode ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-6">
          <button
            onClick={() => onNavigate(isEditMode ? "profile" : "catalog")} 
            className="mb-4 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-4xl font-bold text-[#333333]">{isEditMode ? "Editar Componente" : "Publicar Componente"}</h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? "Actualiza los detalles de tu publicación." : "Ayuda a reducir el E-Waste vendiendo tus componentes."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {[...Array(totalSteps)].map((_, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${ s === step ? 'bg-primary border-primary text-white' : s < step ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-400' }`}>
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < totalSteps && (<div className={`w-16 h-0.5 ${s < step ? 'bg-primary' : 'bg-gray-300'}`} />)}
              </div>
            )
          })}
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#33333E5] mb-1">
                {step === 1 && "Información Básica"}
                {step === 2 && "Clasificación"}
                {step === 3 && "Imágenes"}
              </h3>
              <p className="text-sm text-muted-foreground">Paso {step} de {totalSteps}</p>
            </div>

            {renderStep()}

            {error && (
              <p className="text-sm font-medium text-red-500 text-center mt-4">{error}</p>
            )}

            <div className="flex justify-between mt-8">
              <button type="button" className="h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input" onClick={handleBack} disabled={step === 1 || isUploading}>
                Anterior
              </button>
              {step < totalSteps ? (
                <button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md">
                  Siguiente
                </button>
              ) : (
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md w-48" disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isEditMode ? "Actualizar Publicación" : "Publicar Componente"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}