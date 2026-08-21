import { escapeHtml } from '../../core/utils/domUtils.js';
import { DEFAULT_AVATAR_PATH } from '../../core/utils/constants.js';

/**
 * Componente para renderizar la tarjeta de un artesano en el directorio
 */
export class ArtisanCardComponent {
  static render(artisan) {
    const hasCustomOrders = artisan.acceptsCustomOrders !== false;
    const isVisitable = artisan.isVisitable === true;
    const safeName = escapeHtml(artisan.name);
    const safeTrade = escapeHtml(artisan.trade);
    const safeCategory = escapeHtml(artisan.categoryLabel);
    const safeDesc = escapeHtml(artisan.description);
    const safeLocation = escapeHtml(artisan.location || 'España');
    const safeExperience = artisan.experience || '';
    const isCertified = safeExperience.toLowerCase().includes('certificado');
    const imageSrc = artisan.image || DEFAULT_AVATAR_PATH;
    const ratingDisplay = Number(artisan.rating || 5.0).toFixed(1);
    const isNew = typeof artisan.isNew === 'function' ? artisan.isNew() : false;

    return `
      <div class="artisan-card" style="cursor: pointer;" onclick="window.open('perfil.html?id=${artisan.id}', '_blank')">
        <div class="artisan-img-wrapper" style="background: #FFFFFF;">
          <img src="${imageSrc}" alt="${safeName}" class="artisan-img" loading="lazy" style="opacity: 0; transition: opacity 0.6s ease;" onload="this.style.opacity='1';">
          <span class="artisan-badge">${safeCategory}</span>
          ${isNew ? `
            <span class="artisan-new-badge" title="Artesano incorporado en las últimas 2 semanas">
              <i class="fa-solid fa-sparkles"></i> Nuevo
            </span>
          ` : ''}
          <div class="artisan-rating">
            <i class="fa-solid fa-star"></i>
            <span>${ratingDisplay}</span>
          </div>
          ${artisan.promo && artisan.promo.active ? `
            <div class="promo-badge">
              <i class="fa-solid fa-tag"></i> ${escapeHtml(artisan.promo.title)}
            </div>
          ` : ''}
        </div>
        <div class="artisan-body">
          <h3 class="artisan-name">${safeName}</h3>
          <div class="artisan-trade">${safeTrade}</div>
          
          <div class="artisan-badges-row" style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.6rem;">
            ${hasCustomOrders ? `
              <span class="badge-feature badge-custom-orders" title="Este artesano realiza piezas personalizadas y trabajos a medida">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Encargos a Medida
              </span>
            ` : ''}
            ${isVisitable ? `
              <span class="badge-feature badge-visitable" title="Taller con espacio físico abierto o visitable">
                <i class="fa-solid fa-store"></i> Taller Visitable
              </span>
            ` : ''}
          </div>

          <p class="artisan-desc">${safeDesc}</p>
          <div class="artisan-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${safeLocation}</span>
            ${isCertified ? `<span><i class="fa-solid fa-certificate" style="color: var(--warm-gold);"></i> ${escapeHtml(safeExperience)}</span>` : ''}
          </div>
          <div class="artisan-footer">
            <a href="perfil.html?id=${artisan.id}" target="_blank" class="btn btn-secondary" style="width: 100%; font-size: 0.85rem; text-decoration: none; text-align: center; display: block;" onclick="event.stopPropagation();">
              Ver Perfil Completo & Proyectos <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
