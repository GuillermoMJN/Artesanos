/**
 * Casos de Uso del CRM, Sistema de Verificación y Centro de Asistencia
 */
export class CrmUseCases {
  constructor(crmRepository, artisanRepository) {
    this.crmRepository = crmRepository;
    this.artisanRepository = artisanRepository;
  }

  async submitVerificationRequest({ artisanId, artisanDocId, artisanName, contactName, contactEmail, contactPhone, additionalNotes }) {
    return await this.crmRepository.createVerificationRequest({
      artisanId,
      artisanDocId,
      artisanName,
      contactName,
      contactEmail,
      contactPhone,
      additionalNotes,
      status: 'pending'
    });
  }

  async getVerificationRequests() {
    return await this.crmRepository.getVerificationRequests();
  }

  async getVerificationStatusForArtisan(artisanId) {
    return await this.crmRepository.getVerificationRequestByArtisanId(artisanId);
  }

  async updateVerificationStatus(requestId, status, artisanDocId = null) {
    const updated = await this.crmRepository.updateVerificationStatus(requestId, status, artisanDocId);
    
    // Si se aprueba la verificación, actualizar el campo `experience` o `verified` del artesano
    if (status === 'approved' && artisanDocId && this.artisanRepository) {
      try {
        await this.artisanRepository.updateArtisan(artisanDocId, {
          experience: 'Artesano Certificado ✓',
          isVerified: true
        });
      } catch (e) {
        console.warn("Error actualizando badge verificado del artesano:", e.message);
      }
    } else if (status === 'rejected' && artisanDocId && this.artisanRepository) {
      try {
        await this.artisanRepository.updateArtisan(artisanDocId, {
          experience: 'Artesano de la comunidad',
          isVerified: false
        });
      } catch (e) {}
    }

    return updated;
  }

  async submitSupportTicket({ userId, senderName, senderEmail, senderRole, category, subject, message }) {
    return await this.crmRepository.createSupportTicket({
      userId,
      senderName,
      senderEmail,
      senderRole,
      category,
      subject,
      message,
      status: 'open'
    });
  }

  async getSupportTickets() {
    return await this.crmRepository.getSupportTickets();
  }

  async updateSupportTicket(ticketId, { status, adminNotes }) {
    return await this.crmRepository.updateSupportTicket(ticketId, { status, adminNotes });
  }
}
