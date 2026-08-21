/**
 * Casos de Uso para la Mensajería Instantánea entre Clientes y Artesanos
 */
export class ChatUseCases {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async startOrOpenConversation({ clientUid, clientName, clientAvatar, artisanUid, artisanDocId, artisanName, artisanAvatar, initialContext }) {
    return await this.chatRepository.getOrCreateConversation({
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

  subscribeUserConversations(userUid, callback) {
    return this.chatRepository.subscribeUserConversations(userUid, callback);
  }

  subscribeMessages(conversationId, callback) {
    return this.chatRepository.subscribeMessages(conversationId, callback);
  }

  async sendMessage(conversationId, { senderUid, senderName, text, otherUid }) {
    return await this.chatRepository.sendMessage(conversationId, {
      senderUid,
      senderName,
      text,
      otherUid
    });
  }

  async markAsRead(conversationId, userUid) {
    return await this.chatRepository.markAsRead(conversationId, userUid);
  }
}
