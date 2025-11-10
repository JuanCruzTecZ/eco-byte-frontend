// En: src/components/ProfileScreen.jsx

import { useState } from 'react';
import { ArrowLeft, Star, Package, MessageSquare, User as UserIcon, Loader2, Award } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ImageWithFallback } from './ui/ImageWithFallback';

export function ProfileScreen({ 
  user, 
  userData,
  allProducts,
  userChats, 
  chatsLoading, 
  pendingRatings, // Recibimos este
  unreadChatCount, // Recibimos este
  onNavigate, 
  onProductClick,
  onChatClick,
  onDeleteMyProduct,
  onEditMyProduct,
  onOpenRatingModal
}) {
  const [activeTab, setActiveTab] = useState("publications");

  const myActiveProducts = allProducts.filter(product => 
    product.sellerId === user.uid && product.status !== 'Vendido'
  );

  if (!user || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const userName = userData.displayName || user.email || "Usuario";
  const userAvatarChar = userName.charAt(0).toUpperCase();

  const renderChatTab = () => {
    if (chatsLoading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto text-muted-foreground animate-spin mb-3" />
          <p className="text-muted-foreground">Cargando tus chats...</p>
        </div>
      );
    }
    if (userChats.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aún no tienes conversaciones.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {userChats.map(chat => {
          const otherUserId = chat.participantIds.find(id => id !== user.uid);
          const otherUser = chat.participantsInfo[otherUserId] || { name: "Usuario", avatar: "" };
          const otherUserName = otherUser.name || "Usuario";
          const otherUserAvatar = otherUser.avatar || null;
          const otherUserAvatarChar = otherUserName.charAt(0).toUpperCase();

          // Lógica de indicadores
          const isSold = chat.status === 'Sold';
          const isBuyer = !allProducts.some(p => p.id === chat.productId && p.sellerId === user.uid);
          const ratingPending = isBuyer && isSold && !chat.buyerRatedSeller;
          const hasUnread = chat[`${user.uid}_hasUnread`] === true;

          return (
            <div key={chat.id} className="p-4 border rounded-md bg-white shadow-sm">
              <button
                onClick={() => onChatClick(chat)} 
                className="flex items-center gap-4 w-full text-left"
              >
                <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  {otherUserAvatar ? (
                    <img className="aspect-square h-full w-full" src={otherUserAvatar} alt={otherUserName} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      {otherUserAvatarChar}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className={`font-semibold text-[#333333] truncate ${hasUnread ? 'font-bold' : ''}`}>
                    {otherUserName}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    Sobre: {chat.productTitle}
                  </p>
                  {ratingPending && (
                     <p className="text-xs font-medium text-red-600">¡Calificación pendiente!</p>
                  )}
                  {hasUnread && !ratingPending && (
                     <p className="text-xs font-medium text-blue-600">Mensaje nuevo</p>
                  )}
                </div>
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={chat.productImage} alt={chat.productTitle} className="w-full h-full object-cover" />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderPublicationsTab = () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#333333]">Componentes Publicados</h3>
        <span className="text-sm font-semibold border px-2.5 py-0.5 rounded-full">{myActiveProducts.length} activos</span>
      </div>
      {myActiveProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myActiveProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product.id)}
              onDelete={onDeleteMyProduct}
              onEdit={onEditMyProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No tienes componentes publicados</p>
          <button
            onClick={() => onNavigate("publish")}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md"
          >
            Publicar Componente
          </button>
        </div>
      )}
    </div>
  );

  const renderPendingRatingsTab = () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-xl font-semibold text-[#333333] mb-6">Calificaciones Pendientes</h3>
      {pendingRatings.length > 0 ? (
        <div className="space-y-4">
          {pendingRatings.map(chat => {
            const sellerId = chat.participantIds.find(id => id !== user.uid);
            const seller = chat.participantsInfo[sellerId];
            return (
              <div key={chat.id} className="flex items-center gap-4 p-4 border rounded-md">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={chat.productImage} alt={chat.productTitle} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-muted-foreground">Califica tu compra:</p>
                  <h4 className="font-semibold text-[#333333] truncate">{chat.productTitle}</h4>
                  <p className="text-sm text-muted-foreground">Vendedor: {seller.name || "Vendedor"}</p>
                </div>
                <button
                  onClick={() => onOpenRatingModal({
                    mode: 'rateSeller',
                    chatId: chat.id,
                    productTitle: chat.productTitle,
                    seller: { uid: sellerId, name: seller.name || "Vendedor" }
                  })}
                  className="h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Calificar
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No tienes calificaciones pendientes.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-6xl mx-auto px-6">
        <button
          onClick={() => onNavigate("catalog")}
          className="mb-6 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
        </button>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
              {user.photoURL ? (
                 <img className="aspect-square h-full w-full" src={user.photoURL} alt={userName} />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-4xl">
                  {userAvatarChar}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#333333] mb-2">{userName}</h1>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              
              {userData.ratingCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-[#333333]">{userData.ratingAvg.toFixed(1)}</span>
                  <span>({userData.ratingCount} calificaciones)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid w-full grid-cols-3 max-w-lg rounded-md bg-muted p-1">
            <button
              onClick={() => setActiveTab("publications")}
              className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium ${
                activeTab === "publications" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Mis Publicaciones
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium relative ${
                activeTab === "chat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Chats
              {/* Notificación de Chats No Leídos */}
              {unreadChatCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium relative ${
                activeTab === "pending" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Calificaciones
              {pendingRatings.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                  {pendingRatings.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "publications" && renderPublicationsTab()}
          {activeTab === "chat" && renderChatTab()}
          {activeTab === "pending" && renderPendingRatingsTab()}

        </div>
      </div>
    </div>
  );
}