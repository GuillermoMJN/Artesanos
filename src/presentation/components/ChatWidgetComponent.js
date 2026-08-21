import { escapeHtml } from '../../core/utils/domUtils.js';
import { ToastComponent } from './ToastComponent.js';

/**
 * Componente UI de Mensajería Instantánea Flotante y Modal de Chat en Tiempo Real
 */
export class ChatWidgetComponent {
  constructor(chatUseCases) {
    this.chatUseCases = chatUseCases;
    this.currentUser = null;
    this.activeConversationId = null;
    this.activeOtherParticipant = null;
    this.conversations = [];
    this.messages = [];
    this.unsubscribeConversations = null;
    this.unsubscribeMessages = null;
    this.isOpen = false;
  }

  init() {
    this.injectChatWidgetDOM();
    this.bindDOMEvents();
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (this.unsubscribeConversations) {
      this.unsubscribeConversations();
      this.unsubscribeConversations = null;
    }

    if (user && user.uid) {
      this.showChatFloatingButton(true);
      this.unsubscribeConversations = this.chatUseCases.subscribeUserConversations(user.uid, (convs) => {
        this.conversations = convs;
        this.updateBadgeCount();
        this.renderConversationsList();
      });
    } else {
      this.showChatFloatingButton(false);
      this.closeChat();
    }
  }

  injectChatWidgetDOM() {
    if (document.getElementById('chatWidgetRoot')) return;

    const root = document.createElement('div');
    root.id = 'chatWidgetRoot';
    root.innerHTML = `
      <!-- Botón Flotante de Mensajes -->
      <div id="chatFloatingButton" style="position: fixed; bottom: 2rem; right: 2rem; z-index: 4000; display: none;">
        <button id="btnToggleChat" type="button" aria-label="Abrir Mensajería Instantánea" style="position: relative; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #C06C4C 0%, #A05232 100%); color: #FFF; border: none; box-shadow: 0 10px 25px rgba(192, 108, 76, 0.45); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <i class="fa-solid fa-comments"></i>
          <span id="chatGlobalBadge" style="display: none; position: absolute; top: -3px; right: -3px; background: #D32F2F; color: #FFF; font-size: 0.72rem; font-weight: 700; min-width: 22px; height: 22px; border-radius: 11px; padding: 0 5px; border: 2px solid #FFF; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            0
          </span>
        </button>
      </div>

      <!-- Ventana Flotante del Chat -->
      <div id="chatWindowContainer" style="display: none; position: fixed; bottom: 6.2rem; right: 2rem; width: 380px; max-width: calc(100vw - 2.5rem); height: 530px; max-height: calc(100vh - 8rem); background: #FFFFFF; border-radius: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.22); z-index: 4000; overflow: hidden; flex-direction: column; border: 1px solid var(--border-color); animation: chatFadeIn 0.25s ease-out;">
        
        <!-- Cabecera del Chat -->
        <div id="chatHeader" style="background: linear-gradient(135deg, #2D251E 0%, #1A1410 100%); color: #FFFFFF; padding: 1rem 1.2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 0.8rem; overflow: hidden;">
            <button id="btnChatBack" type="button" style="display: none; background: transparent; border: none; color: #FFF; font-size: 1.1rem; cursor: pointer; padding: 0.2rem 0.4rem; margin-right: -0.2rem;">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div id="chatHeaderAvatarWrapper" style="position: relative; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #3E2723; flex-shrink: 0;">
              <img id="chatHeaderAvatar" src="images/default_avatar.svg" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="overflow: hidden;">
              <h4 id="chatHeaderTitle" style="margin: 0; font-size: 1.02rem; font-weight: 700; color: #FFF; font-family: 'Playfair Display', serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Mensajes</h4>
              <span id="chatHeaderSubtitle" style="font-size: 0.75rem; color: rgba(255,255,255,0.7); display: block;">Tus conversaciones en tiempo real</span>
            </div>
          </div>
          <button id="btnChatClose" type="button" aria-label="Cerrar Chat" style="background: rgba(255,255,255,0.15); border: none; color: #FFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Vista 1: Lista de Conversaciones -->
        <div id="chatConversationsView" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: #FAF7F2;">
          <div id="chatConversationsList" style="flex: 1; padding: 0.5rem 0;">
            <!-- Renderizado dinámico -->
          </div>
        </div>

        <!-- Vista 2: Mensajes de Conversación Activa -->
        <div id="chatMessagesView" style="display: none; flex: 1; flex-direction: column; background: #FAF7F2; overflow: hidden;">
          <!-- Lista de Mensajes con Scroll -->
          <div id="chatMessagesList" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <!-- Mensajes dinámicos -->
          </div>

          <!-- Input para Escribir Mensaje -->
          <form id="chatMessageForm" style="padding: 0.8rem; background: #FFFFFF; border-top: 1px solid var(--border-color); display: flex; gap: 0.5rem; align-items: center;">
            <input type="text" id="chatInputMessage" placeholder="Escribe un mensaje..." autocomplete="off" required style="flex: 1; border: 1px solid var(--border-color); border-radius: 24px; padding: 0.65rem 1rem; font-size: 0.9rem; outline: none; background: #FAF7F2;">
            <button type="submit" id="btnChatSendMessage" style="width: 40px; height: 40px; border-radius: 50%; background: var(--terracotta); color: #FFF; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: transform 0.15s;">
              <i class="fa-solid fa-paper-plane" style="font-size: 0.95rem;"></i>
            </button>
          </form>
        </div>

      </div>
    `;

    document.body.appendChild(root);

    // Añadir animación suave en CSS si no existe
    if (!document.getElementById('chatCustomKeyframes')) {
      const style = document.createElement('style');
      style.id = 'chatCustomKeyframes';
      style.textContent = `
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-conv-item:hover {
          background: rgba(192, 108, 76, 0.08) !important;
        }
        .chat-bubble-self {
          background: linear-gradient(135deg, #C06C4C 0%, #A05232 100%);
          color: #FFFFFF;
          border-radius: 16px 16px 2px 16px;
          align-self: flex-end;
        }
        .chat-bubble-other {
          background: #FFFFFF;
          color: var(--primary-dark);
          border-radius: 16px 16px 16px 2px;
          border: 1px solid var(--border-color);
          align-self: flex-start;
        }
      `;
      document.head.appendChild(style);
    }
  }

  bindDOMEvents() {
    const btnToggle = document.getElementById('btnToggleChat');
    const btnClose = document.getElementById('btnChatClose');
    const btnBack = document.getElementById('btnChatBack');
    const formMsg = document.getElementById('chatMessageForm');

    if (btnToggle) {
      btnToggle.addEventListener('click', () => this.toggleChat());
      btnToggle.addEventListener('mouseenter', () => btnToggle.style.transform = 'scale(1.08)');
      btnToggle.addEventListener('mouseleave', () => btnToggle.style.transform = 'scale(1)');
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeChat());
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => this.showConversationsView());
    }

    if (formMsg) {
      formMsg.addEventListener('submit', (e) => this.handleSendMessageSubmit(e));
    }
  }

  showChatFloatingButton(show) {
    const el = document.getElementById('chatFloatingButton');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    const container = document.getElementById('chatWindowContainer');
    if (!container) return;
    container.style.display = 'flex';
    this.isOpen = true;

    if (!this.activeConversationId) {
      this.showConversationsView();
    } else {
      this.showMessagesView();
    }
  }

  closeChat() {
    const container = document.getElementById('chatWindowContainer');
    if (!container) return;
    container.style.display = 'none';
    this.isOpen = false;
  }

  updateBadgeCount() {
    if (!this.currentUser) return;
    let totalUnread = 0;
    this.conversations.forEach(c => {
      if (c.unreadCount && c.unreadCount[this.currentUser.uid]) {
        totalUnread += c.unreadCount[this.currentUser.uid];
      }
    });

    const badge = document.getElementById('chatGlobalBadge');
    if (badge) {
      if (totalUnread > 0) {
        badge.textContent = totalUnread > 9 ? '9+' : totalUnread;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  showConversationsView() {
    this.activeConversationId = null;
    this.activeOtherParticipant = null;

    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = null;
    }

    const convView = document.getElementById('chatConversationsView');
    const msgView = document.getElementById('chatMessagesView');
    const btnBack = document.getElementById('btnChatBack');
    const headerTitle = document.getElementById('chatHeaderTitle');
    const headerSubtitle = document.getElementById('chatHeaderSubtitle');
    const headerAvatar = document.getElementById('chatHeaderAvatar');

    if (convView) convView.style.display = 'flex';
    if (msgView) msgView.style.display = 'none';
    if (btnBack) btnBack.style.display = 'none';
    if (headerTitle) headerTitle.textContent = 'Mensajes';
    if (headerSubtitle) headerSubtitle.textContent = 'Tus conversaciones en tiempo real';
    if (headerAvatar) headerAvatar.src = 'images/default_avatar.svg';

    this.renderConversationsList();
  }

  renderConversationsList() {
    const listEl = document.getElementById('chatConversationsList');
    if (!listEl) return;

    if (!this.currentUser) {
      listEl.innerHTML = `
        <div style="padding: 2.5rem 1.5rem; text-align: center; color: var(--text-secondary);">
          <i class="fa-solid fa-lock" style="font-size: 2rem; color: var(--warm-gold); margin-bottom: 0.8rem;"></i>
          <p style="font-size: 0.95rem; margin-bottom: 1rem;">Inicia sesión para chatear directamente con artesanos y clientes.</p>
          <button type="button" class="btn btn-primary" onclick="window.appUI ? window.appUI.openLoginModal() : window.location.href='index.html?login=true'" style="font-size: 0.85rem; padding: 0.5rem 1.2rem;">
            Iniciar Sesión
          </button>
        </div>
      `;
      return;
    }

    if (this.conversations.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 3rem 1.5rem; text-align: center; color: var(--text-secondary);">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.5rem; color: var(--border-color); margin-bottom: 0.8rem;"></i>
          <h5 style="color: var(--primary-dark); font-size: 1rem; margin-bottom: 0.4rem;">Sin mensajes todavía</h5>
          <p style="font-size: 0.85rem; margin: 0;">Entra al perfil de cualquier artesano y pulsa "Contactar por Chat" para consultar sobre piezas o encargos.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.conversations.map(conv => {
      const otherUid = conv.participants.find(p => p !== this.currentUser.uid) || this.currentUser.uid;
      const details = (conv.participantDetails && conv.participantDetails[otherUid]) || { name: 'Usuario', avatar: 'images/default_avatar.svg' };
      const safeName = escapeHtml(details.name || 'Usuario');
      const safeAvatar = details.avatar || 'images/default_avatar.svg';
      const safeLastMsg = escapeHtml(conv.lastMessage || 'Conversación iniciada');
      const unread = (conv.unreadCount && conv.unreadCount[this.currentUser.uid]) || 0;

      return `
        <div class="chat-conv-item" onclick="window.chatWidgetUI.openConversationById('${conv.id}', '${otherUid}')" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.85rem 1.2rem; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid rgba(0,0,0,0.04); background: ${unread > 0 ? 'rgba(192,108,76,0.06)' : 'transparent'};">
          <div style="position: relative; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #FFF; border: 1px solid var(--border-color); flex-shrink: 0;">
            <img src="${safeAvatar}" alt="${safeName}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
              <strong style="font-size: 0.92rem; color: var(--primary-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeName}</strong>
              ${unread > 0 ? `
                <span style="background: var(--terracotta); color: #FFF; font-size: 0.7rem; font-weight: 700; border-radius: 10px; padding: 0.15rem 0.5rem;">
                  ${unread} nuevo${unread > 1 ? 's' : ''}
                </span>
              ` : ''}
            </div>
            <p style="margin: 0; font-size: 0.82rem; color: ${unread > 0 ? 'var(--primary-dark)' : 'var(--text-secondary)'}; font-weight: ${unread > 0 ? '600' : '400'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${safeLastMsg}
            </p>
          </div>
        </div>
      `;
    }).join('');
  }

  async openConversationWithArtisan({ artisanUid, artisanDocId, artisanName, artisanAvatar, initialContext = null }) {
    if (!this.currentUser) {
      ToastComponent.show('Inicia sesión para enviar un mensaje directo al artesano.');
      if (window.appUI && typeof window.appUI.openLoginModal === 'function') {
        window.appUI.openLoginModal();
      }
      return;
    }

    if (this.currentUser.uid === artisanUid) {
      ToastComponent.show('Este es tu propio taller artesanal.');
      return;
    }

    try {
      const clientName = (this.currentUser.profile && this.currentUser.profile.displayName) || this.currentUser.displayName || this.currentUser.email;
      const clientAvatar = (this.currentUser.profile && this.currentUser.profile.photoURL) || this.currentUser.photoURL || 'images/default_avatar.svg';

      const conv = await this.chatUseCases.startOrOpenConversation({
        clientUid: this.currentUser.uid,
        clientName,
        clientAvatar,
        artisanUid,
        artisanDocId,
        artisanName,
        artisanAvatar,
        initialContext
      });

      this.openChat();
      this.openConversationById(conv.id, artisanUid);
    } catch (err) {
      ToastComponent.show(`Error al abrir chat: ${err.message}`, 'error');
    }
  }

  openConversationById(conversationId, otherUid) {
    this.activeConversationId = conversationId;
    const conv = this.conversations.find(c => c.id === conversationId);
    const details = conv && conv.participantDetails && conv.participantDetails[otherUid] ? conv.participantDetails[otherUid] : { name: 'Taller Artesanal', avatar: 'images/default_avatar.svg' };
    
    this.activeOtherParticipant = {
      uid: otherUid,
      name: details.name,
      avatar: details.avatar
    };

    // Marcar como leída
    if (this.currentUser) {
      this.chatUseCases.markAsRead(conversationId, this.currentUser.uid);
    }

    this.showMessagesView();
  }

  showMessagesView() {
    const convView = document.getElementById('chatConversationsView');
    const msgView = document.getElementById('chatMessagesView');
    const btnBack = document.getElementById('btnChatBack');
    const headerTitle = document.getElementById('chatHeaderTitle');
    const headerSubtitle = document.getElementById('chatHeaderSubtitle');
    const headerAvatar = document.getElementById('chatHeaderAvatar');

    if (convView) convView.style.display = 'none';
    if (msgView) msgView.style.display = 'flex';
    if (btnBack) btnBack.style.display = 'block';

    if (this.activeOtherParticipant) {
      if (headerTitle) headerTitle.textContent = this.activeOtherParticipant.name;
      if (headerSubtitle) headerSubtitle.textContent = 'En línea';
      if (headerAvatar) headerAvatar.src = this.activeOtherParticipant.avatar || 'images/default_avatar.svg';
    }

    // Suscribir a mensajes en tiempo real
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = null;
    }

    this.unsubscribeMessages = this.chatUseCases.subscribeMessages(this.activeConversationId, (msgs) => {
      this.messages = msgs;
      this.renderMessagesList();
    });

    const input = document.getElementById('chatInputMessage');
    if (input) setTimeout(() => input.focus(), 150);
  }

  renderMessagesList() {
    const listEl = document.getElementById('chatMessagesList');
    if (!listEl) return;

    if (this.messages.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 2rem 1rem; margin: auto;">
          <i class="fa-regular fa-paper-plane" style="font-size: 2rem; color: var(--warm-gold); margin-bottom: 0.6rem;"></i>
          <p style="font-size: 0.85rem; margin: 0;">Inicia la conversación. Las respuestas llegarán en tiempo real.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.messages.map(msg => {
      const isSelf = this.currentUser && msg.senderId === this.currentUser.uid;
      const safeText = escapeHtml(msg.text);
      let timeStr = '';
      if (msg.createdAt) {
        const d = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return `
        <div class="${isSelf ? 'chat-bubble-self' : 'chat-bubble-other'}" style="max-width: 80%; padding: 0.7rem 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); word-break: break-word;">
          <p style="margin: 0; font-size: 0.9rem; line-height: 1.45;">${safeText}</p>
          <span style="display: block; font-size: 0.68rem; margin-top: 0.3rem; opacity: 0.8; text-align: ${isSelf ? 'right' : 'left'};">
            ${timeStr} ${isSelf ? '<i class="fa-solid fa-check" style="font-size: 0.65rem; margin-left: 2px;"></i>' : ''}
          </span>
        </div>
      `;
    }).join('');

    // Auto scroll al último mensaje
    listEl.scrollTop = listEl.scrollHeight;
  }

  async handleSendMessageSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chatInputMessage');
    const text = input ? input.value : '';
    if (!text || !text.trim() || !this.activeConversationId || !this.currentUser) return;

    input.value = '';
    const otherUid = this.activeOtherParticipant ? this.activeOtherParticipant.uid : null;
    const senderName = (this.currentUser.profile && this.currentUser.profile.displayName) || this.currentUser.displayName || this.currentUser.email;

    try {
      await this.chatUseCases.sendMessage(this.activeConversationId, {
        senderUid: this.currentUser.uid,
        senderName,
        text,
        otherUid
      });
    } catch (err) {
      ToastComponent.show(`Error al enviar mensaje: ${err.message}`, 'error');
    }
  }
}
