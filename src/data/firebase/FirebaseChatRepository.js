import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from '../../config/firebase.config.js';

/**
 * Repositorio para la gestión de mensajería instantánea en Firestore con soporte en tiempo real
 */
export class FirebaseChatRepository {
  static LOCAL_CONVERSATIONS_KEY = 'arteysanos_chat_conversations';
  static LOCAL_MESSAGES_KEY = 'arteysanos_chat_messages';

  /**
   * Obtiene o crea una conversación entre un cliente y un artesano
   */
  async getOrCreateConversation({ clientUid, clientName, clientAvatar, artisanUid, artisanDocId, artisanName, artisanAvatar, initialContext = null }) {
    if (!clientUid || !artisanUid) {
      throw new Error("Se requieren los identificadores de cliente y artesano para iniciar una conversación.");
    }

    const conversationId = `conv_${[clientUid, artisanUid].sort().join('_')}`;

    if (db) {
      try {
        const convRef = doc(db, "conversations", conversationId);
        const convSnap = await getDoc(convRef);

        if (!convSnap.exists()) {
          const newConvData = {
            id: conversationId,
            participants: [clientUid, artisanUid],
            participantDetails: {
              [clientUid]: {
                name: clientName || 'Cliente',
                avatar: clientAvatar || 'images/default_avatar.svg',
                role: 'client'
              },
              [artisanUid]: {
                name: artisanName || 'Taller Artesanal',
                avatar: artisanAvatar || 'images/default_avatar.svg',
                role: 'artisan',
                docId: artisanDocId || null
              }
            },
            artisanDocId: artisanDocId || null,
            lastMessage: initialContext ? `Consulta sobre: ${initialContext}` : 'Conversación iniciada',
            lastMessageAt: new Date(),
            lastMessageSenderId: clientUid,
            unreadCount: {
              [clientUid]: 0,
              [artisanUid]: 1
            },
            createdAt: new Date()
          };

          await setDoc(convRef, newConvData);

          // Si hay contexto inicial (ej. una obra), enviar primer mensaje de sistema o contexto
          if (initialContext) {
            await addDoc(collection(db, "conversations", conversationId, "messages"), {
              senderId: clientUid,
              senderName: clientName || 'Cliente',
              text: `Hola, me pongo en contacto sobre la obra o trabajo: "${initialContext}".`,
              createdAt: new Date(),
              read: false
            });
          }

          return { id: conversationId, ...newConvData };
        } else {
          return { id: convSnap.id, ...convSnap.data() };
        }
      } catch (err) {
        console.warn("Error en Firestore getOrCreateConversation, usando fallback local:", err.message);
      }
    }

    // Fallback Local
    return this._getOrCreateLocalConversation({
      conversationId,
      clientUid,
      clientName,
      clientAvatar,
      artisanUid,
      artisanDocId,
      artisanName,
      artisanAvatar,
      initialContext
    });
  }

  /**
   * Suscribe en tiempo real a las conversaciones donde participa el usuario
   */
  subscribeUserConversations(userUid, callback) {
    if (!userUid) {
      if (typeof callback === 'function') callback([]);
      return () => {};
    }

    if (db) {
      try {
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", userUid)
        );

        return onSnapshot(q, (snapshot) => {
          const conversations = [];
          snapshot.forEach((d) => {
            conversations.push({ id: d.id, ...d.data() });
          });
          // Ordenar por fecha del último mensaje
          conversations.sort((a, b) => {
            const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : new Date(a.lastMessageAt || 0).getTime();
            const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : new Date(b.lastMessageAt || 0).getTime();
            return timeB - timeA;
          });
          if (typeof callback === 'function') callback(conversations);
        }, (err) => {
          console.warn("Error en listener de conversaciones:", err.message);
          if (typeof callback === 'function') callback(this._getLocalConversations(userUid));
        });
      } catch (err) {
        console.warn("Error suscribiendo a conversaciones:", err.message);
      }
    }

    // Fallback Local (polling suave)
    if (typeof callback === 'function') callback(this._getLocalConversations(userUid));
    const interval = setInterval(() => {
      if (typeof callback === 'function') callback(this._getLocalConversations(userUid));
    }, 4000);
    return () => clearInterval(interval);
  }

  /**
   * Suscribe en tiempo real a los mensajes de una conversación
   */
  subscribeMessages(conversationId, callback) {
    if (!conversationId) {
      if (typeof callback === 'function') callback([]);
      return () => {};
    }

    if (db) {
      try {
        const q = query(
          collection(db, "conversations", conversationId, "messages"),
          orderBy("createdAt", "asc")
        );

        return onSnapshot(q, (snapshot) => {
          const messages = [];
          snapshot.forEach((d) => {
            messages.push({ id: d.id, ...d.data() });
          });
          if (typeof callback === 'function') callback(messages);
        }, (err) => {
          console.warn("Error en listener de mensajes:", err.message);
          if (typeof callback === 'function') callback(this._getLocalMessages(conversationId));
        });
      } catch (err) {
        console.warn("Error suscribiendo a mensajes:", err.message);
      }
    }

    // Fallback Local
    if (typeof callback === 'function') callback(this._getLocalMessages(conversationId));
    const interval = setInterval(() => {
      if (typeof callback === 'function') callback(this._getLocalMessages(conversationId));
    }, 2000);
    return () => clearInterval(interval);
  }

  /**
   * Envía un mensaje en una conversación
   */
  async sendMessage(conversationId, { senderUid, senderName, text, otherUid }) {
    if (!conversationId || !senderUid || !text || !text.trim()) return null;

    const cleanText = text.trim();
    const messageData = {
      senderId: senderUid,
      senderName: senderName || 'Usuario',
      text: cleanText,
      createdAt: new Date(),
      read: false
    };

    if (db) {
      try {
        // 1. Guardar mensaje
        const msgRef = await addDoc(collection(db, "conversations", conversationId, "messages"), {
          ...messageData,
          createdAt: serverTimestamp ? serverTimestamp() : new Date()
        });

        // 2. Actualizar último mensaje de la conversación e incrementar no leídos para el otro participante
        const convRef = doc(db, "conversations", conversationId);
        const convSnap = await getDoc(convRef);
        
        let unreadCountUpdate = {};
        if (convSnap.exists() && otherUid) {
          const currentUnread = (convSnap.data().unreadCount && convSnap.data().unreadCount[otherUid]) || 0;
          unreadCountUpdate = {
            [`unreadCount.${otherUid}`]: currentUnread + 1,
            [`unreadCount.${senderUid}`]: 0
          };
        }

        await updateDoc(convRef, {
          lastMessage: cleanText,
          lastMessageAt: serverTimestamp ? serverTimestamp() : new Date(),
          lastMessageSenderId: senderUid,
          ...unreadCountUpdate
        });

        return { id: msgRef.id, ...messageData };
      } catch (err) {
        console.warn("Error enviando mensaje a Firestore, guardando en local:", err.message);
      }
    }

    // Fallback Local
    return this._saveLocalMessage(conversationId, messageData, otherUid);
  }

  /**
   * Marca una conversación como leída para un usuario
   */
  async markAsRead(conversationId, userUid) {
    if (!conversationId || !userUid) return;

    if (db) {
      try {
        const convRef = doc(db, "conversations", conversationId);
        await updateDoc(convRef, {
          [`unreadCount.${userUid}`]: 0
        });
      } catch (err) {
        // Silenciar error si offline
      }
    }

    this._markLocalAsRead(conversationId, userUid);
  }

  // --- MÉTODOS LOCALSTORAGE (OFFLINE FALLBACK) ---
  _getLocalConversations(userUid) {
    try {
      const data = localStorage.getItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY);
      const list = data ? JSON.parse(data) : [];
      return list.filter(c => c.participants && c.participants.includes(userUid));
    } catch {
      return [];
    }
  }

  _getOrCreateLocalConversation(data) {
    const list = this._getLocalConversations(data.clientUid);
    const existing = list.find(c => c.id === data.conversationId);
    if (existing) return existing;

    const newConv = {
      id: data.conversationId,
      participants: [data.clientUid, data.artisanUid],
      participantDetails: {
        [data.clientUid]: { name: data.clientName || 'Cliente', avatar: data.clientAvatar || 'images/default_avatar.svg', role: 'client' },
        [data.artisanUid]: { name: data.artisanName || 'Taller Artesanal', avatar: data.artisanAvatar || 'images/default_avatar.svg', role: 'artisan', docId: data.artisanDocId }
      },
      artisanDocId: data.artisanDocId,
      lastMessage: data.initialContext ? `Consulta sobre: ${data.initialContext}` : 'Conversación iniciada',
      lastMessageAt: new Date().toISOString(),
      unreadCount: { [data.clientUid]: 0, [data.artisanUid]: 1 }
    };

    try {
      const allConvs = JSON.parse(localStorage.getItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY) || '[]');
      allConvs.unshift(newConv);
      localStorage.setItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY, JSON.stringify(allConvs));
    } catch {}

    return newConv;
  }

  _getLocalMessages(conversationId) {
    try {
      const data = localStorage.getItem(`${FirebaseChatRepository.LOCAL_MESSAGES_KEY}_${conversationId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveLocalMessage(conversationId, msgData, otherUid) {
    const msgs = this._getLocalMessages(conversationId);
    const newMsg = { id: `local_msg_${Date.now()}`, ...msgData, createdAt: new Date().toISOString() };
    msgs.push(newMsg);
    try {
      localStorage.setItem(`${FirebaseChatRepository.LOCAL_MESSAGES_KEY}_${conversationId}`, JSON.stringify(msgs));
      
      const allConvs = JSON.parse(localStorage.getItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY) || '[]');
      const conv = allConvs.find(c => c.id === conversationId);
      if (conv) {
        conv.lastMessage = msgData.text;
        conv.lastMessageAt = new Date().toISOString();
        if (otherUid) {
          conv.unreadCount = conv.unreadCount || {};
          conv.unreadCount[otherUid] = (conv.unreadCount[otherUid] || 0) + 1;
        }
        localStorage.setItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY, JSON.stringify(allConvs));
      }
    } catch {}
    return newMsg;
  }

  _markLocalAsRead(conversationId, userUid) {
    try {
      const allConvs = JSON.parse(localStorage.getItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY) || '[]');
      const conv = allConvs.find(c => c.id === conversationId);
      if (conv && conv.unreadCount) {
        conv.unreadCount[userUid] = 0;
        localStorage.setItem(FirebaseChatRepository.LOCAL_CONVERSATIONS_KEY, JSON.stringify(allConvs));
      }
    } catch {}
  }
}
