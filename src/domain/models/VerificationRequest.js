/**
 * Entidad de Dominio: VerificationRequest (Solicitud de Verificación de Artesano)
 */
export class VerificationRequest {
  constructor({
    id,
    artisanId,
    artisanDocId = null,
    artisanName = 'Taller',
    contactName,
    contactEmail,
    contactPhone = '',
    additionalNotes = '',
    status = 'pending', // 'pending' | 'in_review' | 'approved' | 'rejected'
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || `verif_${Date.now()}`;
    this.artisanId = String(artisanId || '');
    this.artisanDocId = artisanDocId;
    this.artisanName = artisanName;
    this.contactName = contactName || '';
    this.contactEmail = contactEmail || '';
    this.contactPhone = contactPhone || '';
    this.additionalNotes = additionalNotes || '';
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isPending() {
    return this.status === 'pending';
  }

  isApproved() {
    return this.status === 'approved';
  }

  getStatusLabel() {
    const labels = {
      pending: 'Pendiente de Revisión',
      in_review: 'En Proceso de Verificación',
      approved: 'Aprobado / Verificado',
      rejected: 'Rechazado'
    };
    return labels[this.status] || 'Pendiente';
  }
}
