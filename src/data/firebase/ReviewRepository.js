import { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from '../../config/firebase.config.js';

export class ReviewRepository {
  // Claves para fallback en localStorage
  static LOCAL_ARTISAN_REVIEWS = 'arteysanos_artisan_reviews';
  static LOCAL_PROJECT_COMMENTS = 'arteysanos_project_comments';

  /**
   * Obtiene todas las reseñas de un artesano específico
   */
  async getArtisanReviews(artisanId) {
    if (!artisanId) return [];

    let reviews = [];

    if (db) {
      try {
        const q = query(collection(db, "artisan_reviews"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => {
          const data = d.data();
          if (String(data.artisanId) === String(artisanId)) {
            reviews.push({ id: d.id, ...data });
          }
        });
      } catch (err) {
        console.warn("Error leyendo reseñas de Firebase, usando fallback local:", err.message);
        reviews = this._getLocalArtisanReviews(artisanId);
      }
    } else {
      reviews = this._getLocalArtisanReviews(artisanId);
    }

    return reviews;
  }

  /**
   * Añade una nueva reseña al artesano y recalcula su media
   */
  async addArtisanReview(artisanId, { userId, userName, rating, comment }) {
    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const newReview = {
      artisanId: String(artisanId),
      userId: userId || 'anonymous',
      userName: userName || 'Usuario Anónimo',
      rating: numRating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    let savedId = `rev_${Date.now()}`;

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "artisan_reviews"), {
          ...newReview,
          createdAt: new Date()
        });
        savedId = docRef.id;
      } catch (err) {
        console.warn("Error guardando reseña en Firebase, guardando en local:", err.message);
        this._saveLocalArtisanReview({ id: savedId, ...newReview });
      }
    } else {
      this._saveLocalArtisanReview({ id: savedId, ...newReview });
    }

    // Recalcular media del artesano
    const allReviews = await this.getArtisanReviews(artisanId);
    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;

    // Actualizar datos de rating en el documento del artesano en Firestore si existe
    if (db) {
      try {
        const artisanRef = doc(db, "artisans", String(artisanId));
        await updateDoc(artisanRef, {
          rating: averageRating,
          reviewsCount: totalReviews
        });
      } catch (e) {
        console.warn("No se pudo actualizar el rating en Firestore para el artesano:", e.message);
      }
    }

    return {
      review: { id: savedId, ...newReview },
      newRating: averageRating,
      newReviewsCount: totalReviews
    };
  }

  /**
   * Obtiene los comentarios de un proyecto específico
   */
  async getProjectComments(projectId) {
    if (!projectId) return [];

    let comments = [];

    if (db) {
      try {
        const q = query(collection(db, "project_comments"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => {
          const data = d.data();
          if (String(data.projectId) === String(projectId)) {
            comments.push({ id: d.id, ...data });
          }
        });
      } catch (err) {
        console.warn("Error leyendo comentarios de Firebase, usando local:", err.message);
        comments = this._getLocalProjectComments(projectId);
      }
    } else {
      comments = this._getLocalProjectComments(projectId);
    }

    return comments;
  }

  /**
   * Añade un comentario a un proyecto independiente (no afecta la media del artesano)
   */
  async addProjectComment(projectId, artisanId, { userId, userName, comment }) {
    const newComment = {
      projectId: String(projectId),
      artisanId: String(artisanId || ''),
      userId: userId || 'anonymous',
      userName: userName || 'Usuario Anónimo',
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    let savedId = `com_${Date.now()}`;

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "project_comments"), {
          ...newComment,
          createdAt: new Date()
        });
        savedId = docRef.id;
      } catch (err) {
        console.warn("Error guardando comentario en Firebase, guardando en local:", err.message);
        this._saveLocalProjectComment({ id: savedId, ...newComment });
      }
    } else {
      this._saveLocalProjectComment({ id: savedId, ...newComment });
    }

    return { id: savedId, ...newComment };
  }

  /**
   * Añade una respuesta del artesano a una reseña existente
   */
  async replyToArtisanReview(reviewId, { artisanUid, artisanName, replyText }) {
    if (!reviewId || !replyText) return null;

    const replyData = {
      artisanUid: artisanUid || 'artisan',
      artisanName: artisanName || 'Artesano',
      text: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    if (db) {
      try {
        const revRef = doc(db, "artisan_reviews", String(reviewId));
        await updateDoc(revRef, { reply: replyData });
      } catch (err) {
        console.warn("Error guardando respuesta en Firebase:", err.message);
      }
    }

    // Fallback local
    try {
      const data = JSON.parse(localStorage.getItem(ReviewRepository.LOCAL_ARTISAN_REVIEWS) || '[]');
      const target = data.find(r => String(r.id) === String(reviewId));
      if (target) {
        target.reply = replyData;
        localStorage.setItem(ReviewRepository.LOCAL_ARTISAN_REVIEWS, JSON.stringify(data));
      }
    } catch (e) {}

    return replyData;
  }

  /**
   * Añade una respuesta del artesano a un comentario de un proyecto
   */
  async replyToProjectComment(commentId, { artisanUid, artisanName, replyText }) {
    if (!commentId || !replyText) return null;

    const replyData = {
      artisanUid: artisanUid || 'artisan',
      artisanName: artisanName || 'Artesano',
      text: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    if (db) {
      try {
        const comRef = doc(db, "project_comments", String(commentId));
        await updateDoc(comRef, { reply: replyData });
      } catch (err) {
        console.warn("Error guardando respuesta a comentario en Firebase:", err.message);
      }
    }

    // Fallback local
    try {
      const data = JSON.parse(localStorage.getItem(ReviewRepository.LOCAL_PROJECT_COMMENTS) || '[]');
      const target = data.find(c => String(c.id) === String(commentId));
      if (target) {
        target.reply = replyData;
        localStorage.setItem(ReviewRepository.LOCAL_PROJECT_COMMENTS, JSON.stringify(data));
      }
    } catch (e) {}

    return replyData;
  }

  // --- MÉTODOS PRIVADOS LOCAL STORAGE FALLBACK ---

  _getLocalArtisanReviews(artisanId) {
    try {
      const data = JSON.parse(localStorage.getItem(ReviewRepository.LOCAL_ARTISAN_REVIEWS) || '[]');
      return data.filter(r => String(r.artisanId) === String(artisanId));
    } catch {
      return [];
    }
  }

  _saveLocalArtisanReview(review) {
    try {
      const data = JSON.parse(localStorage.getItem(ReviewRepository.LOCAL_ARTISAN_REVIEWS) || '[]');
      data.unshift(review);
      localStorage.setItem(ReviewRepository.LOCAL_ARTISAN_REVIEWS, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  _getLocalProjectComments(projectId) {
    try {
      const data = JSON.parse(localStorage.getItem(ReviewRepository.LOCAL_PROJECT_COMMENTS) || '[]');
      return data.filter(c => String(c.projectId) === String(projectId));
    } catch {
      return [];
    }
  }

  _saveLocalProjectComment(comment) {
    try {
      const data = JSON.parse(localStorage.getItem(ReviewRepository.LOCAL_PROJECT_COMMENTS) || '[]');
      data.push(comment);
      localStorage.setItem(ReviewRepository.LOCAL_PROJECT_COMMENTS, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }
}
