/**
 * Interfaz / Contrato para el Repositorio de Reseñas y Comentarios
 */
export class IReviewRepository {
  async getArtisanReviews(artisanId) {
    throw new Error('Method not implemented.');
  }

  async addArtisanReview(artisanId, { userId, userName, rating, comment }) {
    throw new Error('Method not implemented.');
  }

  async replyToArtisanReview(reviewId, { artisanUid, artisanName, replyText }) {
    throw new Error('Method not implemented.');
  }

  async getProjectComments(projectId) {
    throw new Error('Method not implemented.');
  }

  async addProjectComment(projectId, artisanId, { userId, userName, comment }) {
    throw new Error('Method not implemented.');
  }

  async replyToProjectComment(commentId, { artisanUid, artisanName, replyText }) {
    throw new Error('Method not implemented.');
  }
}
