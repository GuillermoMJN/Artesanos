/**
 * Interfaz / Contrato para el Repositorio de Almacenamiento Multimedia
 */
export class IStorageRepository {
  async uploadProfileImage(file, artisanUid) {
    throw new Error('Method not implemented.');
  }

  async uploadFile(file, artisanUid, projectUid) {
    throw new Error('Method not implemented.');
  }
}
