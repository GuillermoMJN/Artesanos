/**
 * Entidad de Dominio: SupportTicket (Incidencias, Contacto y Asistencia)
 */
export class SupportTicket {
  constructor({
    id,
    userId = 'anonymous',
    senderName = 'Usuario',
    senderEmail = '',
    senderRole = 'guest', // 'guest' | 'client' | 'artisan'
    category = 'incidencia', // 'incidencia' | 'consulta' | 'verificacion' | 'sugerencia'
    subject = '',
    message = '',
    status = 'open', // 'open' | 'in_progress' | 'resolved'
    adminNotes = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || `ticket_${Date.now()}`;
    this.userId = userId;
    this.senderName = senderName;
    this.senderEmail = senderEmail;
    this.senderRole = senderRole;
    this.category = category;
    this.subject = subject || 'Mensaje de Asistencia';
    this.message = message;
    this.status = status;
    this.adminNotes = adminNotes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getStatusLabel() {
    const labels = {
      open: 'Abierto / Nuevo',
      in_progress: 'En Gestión',
      resolved: 'Resuelto'
    };
    return labels[this.status] || 'Abierto';
  }

  getCategoryLabel() {
    const labels = {
      incidencia: '⚠️ Incidencia Técnica',
      consulta: '💬 Consulta General',
      verificacion: '🏅 Verificación',
      sugerencia: '💡 Sugerencia'
    };
    return labels[this.category] || 'Consulta';
  }
}
