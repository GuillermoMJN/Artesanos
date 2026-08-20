/**
 * Entidad de Dominio: Review (Opinión y Calificación de un Artesano)
 */
export class Review {
  constructor({
    id,
    artisanId,
    userId = 'anonymous',
    userName = 'Usuario Anónimo',
    rating = 5,
    comment = '',
    createdAt = new Date().toISOString(),
    reply = null
  }) {
    this.id = id;
    this.artisanId = String(artisanId);
    this.userId = userId;
    this.userName = userName;
    this.rating = Math.max(1, Math.min(5, Number(rating) || 5));
    this.comment = comment;
    this.createdAt = createdAt;
    this.reply = reply; // { artisanUid, artisanName, replyText, repliedAt }
  }

  hasReply() {
    return !!(this.reply && this.reply.replyText);
  }
}
