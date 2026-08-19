export class ArtisanCardComponent {
  static render(artisan) {
    const hasCustomOrders = artisan.acceptsCustomOrders !== false;
    const isVisitable = artisan.isVisitable === true;

    return `
      <div class="artisan-card" style="cursor: pointer;" onclick="window.open('perfil.html?id=${artisan.id}', '_blank')">
        <div class="artisan-img-wrapper">
          <img src="${artisan.image || 'images/default_avatar.svg'}" alt="${artisan.name}" class="artisan-img" loading="lazy">
          <span class="artisan-badge">${artisan.categoryLabel}</span>
          <div class="artisan-rating">
            <i class="fa-solid fa-star"></i>
            <span>${artisan.rating}</span>
          </div>
          ${artisan.promo && artisan.promo.active ? `
            <div class="promo-badge">
              <i class="fa-solid fa-tag"></i> ${artisan.promo.title}
            </div>
          ` : ''}
        </div>
        <div class="artisan-body">
          <h3 class="artisan-name">${artisan.name}</h3>
          <div class="artisan-trade">${artisan.trade}</div>
          
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

          <p class="artisan-desc">${artisan.description}</p>
          <div class="artisan-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${artisan.location}</span>
            <span><i class="fa-solid fa-certificate"></i> ${artisan.experience}</span>
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

