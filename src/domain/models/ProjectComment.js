/**
 * Entidad de Dominio: ProjectComment (Comentario sobre una pieza específica)
 */
export class ProjectComment {
  constructor({
    id,
    projectId,
    artisanId,
    userId = 'anonymous',
    userName = 'Usuario Anónimo',
    comment = '',
    createdAt = new Date().toISOString(),
    reply = null
  }) {
    this.id = id;
    this.projectId = projectId;
    this.artisanId = artisanId;
    this.userId = userId;
    this.userName = userName;
    this.comment = comment;
    this.createdAt = createdAt;
    this.reply = reply; // { artisanUid, artisanName, replyText, repliedAt }
  }

  hasReply() {
    return !!(this.reply && this.reply.replyText);
  }
}
