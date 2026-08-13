export class ArtisanCardComponent {
  static render(artisan) {
    return `
      <div class="artisan-card" style="cursor: pointer;" onclick="window.open('perfil.html?id=${artisan.id}', '_blank')">
        <div class="artisan-img-wrapper">
          <img src="${artisan.image}" alt="${artisan.name}" class="artisan-img" loading="lazy">
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
