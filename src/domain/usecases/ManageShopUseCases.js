/**
 * Casos de Uso para la Administración del Taller Artesanal
 */
export class ManageShopUseCases {
  constructor(artisanRepository, storageRepository) {
    this.artisanRepository = artisanRepository;
    this.storageRepository = storageRepository;
  }

  async createArtisanProfile(artisanData) {
    return await this.artisanRepository.createArtisan(artisanData);
  }

  // Alias para compatibilidad
  async createShopProfile(artisanData) {
    return await this.artisanRepository.createArtisan(artisanData);
  }

  async updateShopProfile(docId, updatedData) {
    return await this.artisanRepository.updateArtisan(docId, updatedData);
  }

  async updatePromo(docId, promoData) {
    return await this.artisanRepository.updateArtisan(docId, { promo: promoData });
  }

  async createProject(artisanDocId, projectData) {
    return await this.artisanRepository.createProject(artisanDocId, projectData);
  }

  async updateProject(projectId, projectData) {
    return await this.artisanRepository.updateProject(projectId, projectData);
  }

  async saveProject(artisanDocId, projectData, existingProjectId = null) {
    if (existingProjectId) {
      await this.artisanRepository.updateProject(existingProjectId, projectData);
      return { id: existingProjectId, ...projectData };
    } else {
      return await this.artisanRepository.createProject(artisanDocId, projectData);
    }
  }

  async deleteProject(artisanDocId, projectId) {
    return await this.artisanRepository.deleteProject(artisanDocId, projectId);
  }

  async uploadProjectFile(file, artisanUid, projectUid) {
    return await this.storageRepository.uploadFile(file, artisanUid, projectUid);
  }

  async uploadMediaFile(file, artisanUid) {
    return await this.storageRepository.uploadFile(file, artisanUid);
  }
}
