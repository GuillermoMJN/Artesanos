/**
 * Interfaz / Contrato para el Repositorio de Artesanos
 */
export class IArtisanRepository {
  async getAllArtisans() {
    throw new Error('Method not implemented.');
  }

  async getArtisanById(id) {
    throw new Error('Method not implemented.');
  }

  async getArtisanByOwnerId(ownerId) {
    throw new Error('Method not implemented.');
  }

  async createArtisan(artisanData) {
    throw new Error('Method not implemented.');
  }

  async updateArtisan(docId, updatedData) {
    throw new Error('Method not implemented.');
  }

  async deleteArtisan(docId) {
    throw new Error('Method not implemented.');
  }

  async createProject(artisanDocId, projectData) {
    throw new Error('Method not implemented.');
  }

  async updateProject(projectId, projectData) {
    throw new Error('Method not implemented.');
  }

  async deleteProject(artisanDocId, projectId) {
    throw new Error('Method not implemented.');
  }
}
