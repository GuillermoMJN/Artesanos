/**
 * Interfaz / Contrato para el Repositorio de CRM, Verificaciones y Soporte
 */
export class ICrmRepository {
  async createVerificationRequest(data) {
    throw new Error('Method not implemented.');
  }

  async getVerificationRequests() {
    throw new Error('Method not implemented.');
  }

  async getVerificationRequestByArtisanId(artisanId) {
    throw new Error('Method not implemented.');
  }

  async updateVerificationStatus(requestId, status, artisanDocId) {
    throw new Error('Method not implemented.');
  }

  async createSupportTicket(data) {
    throw new Error('Method not implemented.');
  }

  async getSupportTickets() {
    throw new Error('Method not implemented.');
  }

  async updateSupportTicket(ticketId, { status, adminNotes }) {
    throw new Error('Method not implemented.');
  }
}
