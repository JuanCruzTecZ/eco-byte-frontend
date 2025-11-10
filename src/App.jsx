// En: src/App.jsx

import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth'; 
import { collection, query, onSnapshot, doc, setDoc, getDoc, serverTimestamp, where } from 'firebase/firestore'; 

import { Header } from './components/Header';
import { CatalogScreen } from './components/CatalogScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { ChatScreen } from './components/ChatScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { PublishScreen } from './components/PublishScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { RatingModal } from './components/RatingModal';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null); 
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [userChats, setUserChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentScreen, setCurrentScreen] = useState('catalog'); 
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [productToEditId, setProductToEditId] = useState(null);
  const [ratingModalInfo, setRatingModalInfo] = useState(null); 
  const [filters, setFilters] = useState({
    category: "Todas las Categorías",
    condition: [],
    location: "Todas las Ubicaciones"
  });

  useEffect(() => {
    let userDataUnsubscribe = null;
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); 
      setAuthLoading(false); 
      
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        userDataUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUserData(docSnap.data());
          } else {
            (async () => {
              try {
                await setDoc(userDocRef, {
                  uid: user.uid,
                  displayName: user.displayName || user.email,
                  email: user.email,
                  createdAt: serverTimestamp(),
                  ratingCount: 0,
                  ratingTotal: 0,
                  ratingAvg: 0
                });
              } catch (err) {
                console.error("Error al migrar usuario antiguo:", err);
              }
            })();
          }
        });

        user.getIdTokenResult().then(idTokenResult => {
          setIsAdmin(!!idTokenResult.claims.admin);
        });
        
      } else {
        setIsAdmin(false);
        setCurrentUserData(null);
        setCurrentScreen('catalog');
        setUserChats([]); 
        if (userDataUnsubscribe) {
          userDataUnsubscribe();
        }
      }
    });
    return () => {
      authUnsubscribe();
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    setProductsLoading(true);
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setProductsLoading(false);
    }, (err) => {
      console.error("Error leyendo productos:", err);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setChatsLoading(false);
      return;
    }
    setChatsLoading(true);
    const q = query(
      collection(db, "chats"), 
      where("participantIds", "array-contains", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserChats(chatsData);
      setChatsLoading(false);
    }, (err) => {
      console.error("Error cargando la lista de chats:", err);
      setChatsLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleNavigate = (screen) => {
    window.scrollTo(0, 0); 
    if (screen === 'catalog') {
      setSelectedProductId(null);
      setSelectedChatId(null);
    }
    if (screen === 'detail' && selectedChatId) {
       setSelectedChatId(null);
    } else {
       setSelectedChatId(null);
    }
    if (screen === 'publish') {
      setProductToEditId(null);
    }
    setCurrentScreen(screen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setSelectedChatId(null);
    setCurrentScreen('detail');
    window.scrollTo(0, 0);
  };
  
  const handleChatClick = (chat) => {
    setSelectedChatId(chat.id);
    setSelectedProductId(chat.productId);
    setCurrentScreen('chat');
  };

  // --- Manejador para Iniciar Chat (Actualizado) ---
  const handleStartChat = async (product) => {
    if (!currentUser) {
      setCurrentScreen('login');
      return;
    }
    const buyerName = currentUser.displayName || currentUser.email || "Comprador";
    const sellerName = product.sellerName || "Vendedor";
    const chatId = `${product.id}_${currentUser.uid}`;
    
    // --- Lógica de Notificaciones de Chat ---
    // (Creamos los campos 'hasUnread' al crear el chat)
    const buyerId = currentUser.uid;
    const sellerId = product.sellerId;
    
    try {
      const chatRef = doc(db, "chats", chatId);
      await setDoc(chatRef, {
        productId: product.id,
        productTitle: product.title,
        productImage: product.image,
        participantIds: [buyerId, sellerId],
        participantsInfo: {
          [buyerId]: { name: buyerName, avatar: currentUser.photoURL || '' },
          [sellerId]: { name: sellerName, avatar: product.sellerAvatar || '' }
        },
        status: 'Active',
        sellerRatedBuyer: false,
        buyerRatedSeller: false,
        updatedAt: serverTimestamp(),
        // --- NUEVO: Campos de Notificación ---
        // (El 'true' es para que el vendedor vea el chat nuevo)
        [`${sellerId}_hasUnread`]: true, 
        [`${buyerId}_hasUnread`]: false
      }, { merge: true }); 
      
      setSelectedChatId(chatId);
      setCurrentScreen('chat');
    } catch (err) {
      console.error("Error al crear/abrir el chat:", err);
    }
  };

  const handleAdminDelete = async (product) => {
    if (!isAdmin || !currentUser) return;
    const confirmation = prompt(`ADMIN: Escribe BORRAR para confirmar la eliminación de "${product.title}"`);
    if (confirmation !== "BORRAR") return;
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/admin/delete_product/${product.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.success);
        handleNavigate('catalog');
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error de conexión con el servidor de administración:", err);
    }
  };
  
  const handleDeleteMyProduct = async (product) => {
    if (!currentUser) return;
    const confirmation = prompt(`Escribe BORRAR para confirmar la eliminación de "${product.title}"`);
    if (confirmation !== "BORRAR") return;
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/user/delete_product/${product.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.success);
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error de conexión con el servidor de administración:", err);
    }
  };

  const handleEditMyProduct = (product) => {
    setProductToEditId(product.id);
    setCurrentScreen('publish');
    window.scrollTo(0, 0);
  };
  
  const handleOpenRatingModal = (modalInfo) => {
    setRatingModalInfo(modalInfo);
  };

  const handleCloseRatingModal = () => {
    setRatingModalInfo(null);
  };

  const handleRateBuyer = async (productId, buyerId, rating) => {
    if (!currentUser) throw new Error("No estás autenticado.");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/user/complete_sale`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          productId, 
          buyerId, 
          rating,
          chatId: selectedChatId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al completar la venta");
      
      console.log(data.success);
      handleCloseRatingModal();
      handleNavigate('profile'); 
    } catch (err) {
      console.error("Error al llamar a complete_sale:", err);
      throw err; 
    }
  };

  const handleRateSeller = async (chatId, sellerId, rating) => {
    if (!currentUser) throw new Error("No estás autenticado.");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/user/rate_seller`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId, sellerId, rating })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al calificar");

      console.log(data.success);
      handleCloseRatingModal();
    } catch (err) {
      console.error("Error al llamar a rate_seller:", err);
      throw err;
    }
  };

  // --- Lógica de Renderizado ---
  
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const productToEdit = products.find(p => p.id === productToEditId);
  const availableProducts = products.filter(p => p.status !== 'Vendido');

  // --- CÁLCULO DE NOTIFICACIONES ---
  let pendingRatings = [];
  let unreadChatCount = 0;
  if (currentUser) {
    // 1. Calificaciones pendientes
    pendingRatings = userChats.filter(chat => {
      const product = products.find(p => p.id === chat.productId);
      if (!product) return false;
      const isBuyer = product.sellerId !== currentUser.uid;
      const isSold = chat.status === 'Sold';
      const notYetRated = !chat.buyerRatedSeller;
      return isBuyer && isSold && notYetRated;
    });
    
    // 2. Chats no leídos
    unreadChatCount = userChats.filter(chat => 
      chat[`${currentUser.uid}_hasUnread`] === true
    ).length;
  }
  const totalNotifications = pendingRatings.length + unreadChatCount;
  // --- FIN DE CÁLCULO ---


  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F5F5]">
        <p className="text-xl text-muted-foreground">Cargando Eco Byte...</p>
      </div>
    );
  }

  const renderScreen = () => {
    if (currentScreen === 'login') {
      if (currentUser) { setCurrentScreen('catalog'); return null; }
      return <LoginScreen onNavigate={handleNavigate} />;
    }
    if (currentScreen === 'register') {
      if (currentUser) { setCurrentScreen('catalog'); return null; }
      return <RegisterScreen onNavigate={handleNavigate} />;
    }

    if (currentScreen === 'profile' || currentScreen === 'publish' || currentScreen === 'chat') {
      if (!currentUser || !currentUserData) {
        setCurrentScreen('login');
        return null;
      }
      
      switch (currentScreen) {
        case 'profile':
          return (
            <ProfileScreen
              user={currentUser}
              userData={currentUserData} 
              allProducts={products}
              userChats={userChats}
              chatsLoading={chatsLoading}
              pendingRatings={pendingRatings}
              unreadChatCount={unreadChatCount} // Pasamos el nuevo count
              onNavigate={handleNavigate}
              onProductClick={handleProductClick}
              onChatClick={handleChatClick}
              onDeleteMyProduct={handleDeleteMyProduct}
              onEditMyProduct={handleEditMyProduct}
              onOpenRatingModal={handleOpenRatingModal} 
            />
          );
        case 'publish':
          return (
            <PublishScreen
              user={currentUser}
              onNavigate={handleNavigate}
              productToEdit={productToEdit}
            />
          );
        case 'chat':
          const chatProduct = products.find(p => p.id === selectedProductId);
          const chatInfo = userChats.find(c => c.id === selectedChatId);

          if (selectedChatId && chatProduct && chatInfo) { 
            const otherUserId = chatInfo.participantIds.find(id => id !== currentUser.uid);
            const otherUser = chatInfo.participantsInfo[otherUserId];

            return (
              <ChatScreen
                currentUser={currentUser}
                chatId={selectedChatId}
                chatInfo={chatInfo}
                product={chatProduct}
                otherUser={{...otherUser, uid: otherUserId}}
                onNavigate={handleNavigate}
                onOpenRatingModal={handleOpenRatingModal}
              />
            );
          }
          setCurrentScreen('catalog');
          return null;
      }
    }

    if (currentScreen === 'detail' && selectedProduct) {
      return (
        <ProductDetailScreen
          product={selectedProduct}
          onNavigate={handleNavigate}
          onStartChat={handleStartChat}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onAdminDelete={handleAdminDelete}
        />
      );
    }

    return (
      <CatalogScreen
        products={availableProducts}
        productsLoading={productsLoading}
        onProductClick={handleProductClick}
        searchQuery={searchQuery}
        filters={filters}
        onFilterChange={setFilters}
      />
    );
  };

  return (
    <div>
      <Header
        isLoggedIn={!!currentUser}
        notificationCount={totalNotifications} // Pasamos el total
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      
      <main>
        {renderScreen()}
      </main>

      {ratingModalInfo && (
        <RatingModal
          modalInfo={ratingModalInfo}
          onClose={handleCloseRatingModal}
          onRateBuyer={handleRateBuyer}
          onRateSeller={handleRateSeller}
        />
      )}
    </div>
  );
}

export default App;