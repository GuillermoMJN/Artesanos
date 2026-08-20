/**
 * Casos de Uso para Reseñas y Comentarios
 */
export class ReviewUseCases {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async getArtisanReviews(artisanId) {
    return await this.reviewRepository.getArtisanReviews(artisanId);
  }

  async addReview(artisanId, { userId, userName, rating, comment }) {
    return await this.reviewRepository.addArtisanReview(artisanId, {
      userId,
      userName,
      rating,
      comment
    });
  }

  async replyToReview(reviewId, { artisanUid, artisanName, replyText }) {
    return await this.reviewRepository.replyToArtisanReview(reviewId, {
      artisanUid,
      artisanName,
      replyText
    });
  }

  async getProjectComments(projectId) {
    return await this.reviewRepository.getProjectComments(projectId);
  }

  async addProjectComment(projectId, artisanId, { userId, userName, comment }) {
    return await this.reviewRepository.addProjectComment(projectId, artisanId, {
      userId,
      userName,
      comment
    });
  }

  async replyToProjectComment(commentId, { artisanUid, artisanName, replyText }) {
    return await this.reviewRepository.replyToProjectComment(commentId, {
      artisanUid,
      artisanName,
      replyText
    });
  }
}
