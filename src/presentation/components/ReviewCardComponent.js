import { escapeHtml } from '../../core/utils/domUtils.js';
import { renderStarRatingHtml, formatDateEs } from '../../core/utils/formatters.js';

/**
 * Componente para renderizar reseñas de clientes y respuestas de talleres
 */
export class ReviewCardComponent {
  static render(review, { isOwner = false, currentUserId = null } = {}) {
    const safeAuthor = escapeHtml(review.userName || 'Usuario Anónimo');
    const safeComment = escapeHtml(review.comment || '');
    const dateFormatted = formatDateEs(review.createdAt);
    const starsHtml = renderStarRatingHtml(review.rating);

    let replyHtml = '';
    if (review.reply && review.reply.replyText) {
      const safeReplyAuthor = escapeHtml(review.reply.artisanName || 'Taller Artesanal');
      const safeReplyText = escapeHtml(review.reply.replyText);
      const replyDateFormatted = formatDateEs(review.reply.repliedAt);

      replyHtml = `
        <div style="margin-top: 1rem; padding: 1rem 1.2rem; background: var(--bg-subtle); border-left: 3px solid var(--terracotta); border-radius: 0 8px 8px 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem;">
            <strong style="color: var(--primary-dark); font-size: 0.88rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-store" style="color: var(--terracotta);"></i> Respuesta de ${safeReplyAuthor}
            </strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${replyDateFormatted}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0; line-height: 1.5;">${safeReplyText}</p>
        </div>
      `;
    }

    let replyActionHtml = '';
    if (isOwner && (!review.reply || !review.reply.replyText)) {
      replyActionHtml = `
        <div style="margin-top: 0.8rem; text-align: right;">
          <button type="button" class="btn btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.7rem;" onclick="window.toggleReviewReplyForm('${review.id}')">
            <i class="fa-solid fa-reply"></i> Responder como Taller
          </button>
        </div>
        <div id="replyFormContainer_${review.id}" style="display: none; margin-top: 0.8rem; background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <form onsubmit="window.handleSendReviewReply(event, '${review.id}')">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.3rem;">Tu respuesta a este cliente:</label>
            <input type="text" id="replyInput_${review.id}" class="form-input" placeholder="Escribe un agradecimiento o aclaración..." required style="margin-bottom: 0.5rem; font-size: 0.88rem;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" style="padding: 0.3rem 0.7rem; font-size: 0.78rem;" onclick="window.toggleReviewReplyForm('${review.id}')">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.78rem;">
                <i class="fa-solid fa-paper-plane"></i> Publicar Respuesta
              </button>
            </div>
          </form>
        </div>
      `;
    }

    return `
      <div class="review-card" style="background: #FFF; padding: 1.4rem 1.6rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 0.2rem;">${safeAuthor}</h4>
            <div style="color: var(--warm-gold); font-size: 0.85rem; display: flex; gap: 0.2rem;">
              ${starsHtml}
            </div>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${dateFormatted}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin: 0;">${safeComment}</p>
        ${replyHtml}
        ${replyActionHtml}
      </div>
    `;
  }
}
