// En: src/components/ChatScreen.jsx

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, User as UserIcon, CheckCircle } from "lucide-react";
// Importamos 'doc' y 'updateDoc'
import { db } from "../firebase";
import { collection, addDoc, query, onSnapshot, serverTimestamp, doc, updateDoc, setDoc } from "firebase/firestore";

export function ChatScreen({ 
  currentUser, 
  chatId, 
  chatInfo,
  product, 
  otherUser, 
  onNavigate, 
  onOpenRatingModal 
}) {
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  const isSeller = product && currentUser.uid === product.sellerId;
  const isSold = chatInfo && chatInfo.status === 'Sold';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Cargar mensajes Y Marcar como Leído ---
  useEffect(() => {
    if (!chatId || !currentUser) return;

    // 1. Marcar el chat como leído para mí
    (async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
          [`${currentUser.uid}_hasUnread`]: false
        });
      } catch (err) {
        console.error("Error al marcar chat como leído:", err);
      }
    })();

    // 2. Cargar mensajes
    setLoading(true);
    const messagesCol = collection(db, "chats", chatId, "messages");
    const q = query(messagesCol);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      loadedMessages.sort((a, b) => {
        const aTime = a.timestamp ? a.timestamp.toDate().getTime() : 0;
        const bTime = b.timestamp ? b.timestamp.toDate().getTime() : 0;
        return aTime - bTime;
      });
      setMessages(loadedMessages);
      setLoading(false);
    }, (err) => {
      console.error("Error al LEER mensajes:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [chatId, currentUser]); // Depende de currentUser ahora

  // --- Enviar mensaje (Actualizado) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (text === "" || !chatId || !currentUser) return;

    const currentInput = newMessage;
    setNewMessage(""); 

    try {
      // 1. Añadir el mensaje a la subcolección
      const messagesCol = collection(db, "chats", chatId, "messages");
      await addDoc(messagesCol, {
        text: text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp()
      });
      
      // 2. Actualizar el documento 'chat' (para notificaciones)
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessageText: text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
        // Marcar como 'no leído' para la OTRA persona
        [`${otherUser.uid}_hasUnread`]: true 
      });

    } catch (err) {
      console.error("Error al ENVIAR mensaje:", err);
      setNewMessage(currentInput);
    }
  };
  
  const otherUserName = otherUser?.name || "Usuario";
  const otherUserAvatar = otherUser?.avatar || null;
  const otherUserAvatarChar = otherUserName.charAt(0).toUpperCase();
  const productTitle = product?.title || "Producto no disponible";

  const renderMessages = () => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    if (messages.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Envía el primer mensaje.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {messages.map((message) => {
          const isUser = message.senderId === currentUser.uid;
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-[#F5F5F5] text-[#333333]"
                }`}
              >
                <p>{message.text}</p>
                <p
                  className={`text-xs mt-1 text-right ${
                    isUser ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '...'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => onNavigate(isSeller ? "profile" : "detail")}
              className="h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-gray-100 transition-colors -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </button>
            
            {isSeller && !isSold && (
              <button
                onClick={() => onOpenRatingModal({
                  mode: 'rateBuyer',
                  product: product,
                  buyer: otherUser,
                  chatId: chatId,
                  productTitle: productTitle
                })}
                className="h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Vendido
              </button>
            )}
            
            {isSold && (
              <div className="h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-100 text-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Venta Completada
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full">
              {otherUserAvatar ? (
                <img className="aspect-square h-full w-full" src={otherUserAvatar} alt={otherUserName} />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  {otherUserAvatarChar}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#333333]">{otherUserName}</h3>
              <p className="text-sm text-muted-foreground">{productTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center py-6">
        <div className="w-full max-w-4xl px-6">
          <div className="h-[600px] flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex-1 p-6 overflow-y-auto">
              {renderMessages()}
            </div>
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={loading || isSold}
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-10 w-10 inline-flex items-center justify-center"
                  disabled={!newMessage.trim() || loading || isSold}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}