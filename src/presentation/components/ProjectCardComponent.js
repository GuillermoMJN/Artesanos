import { escapeHtml } from '../../core/utils/domUtils.js';

/**
 * Componente para renderizar tarjetas de proyectos y pasos de galería
 */
export class ProjectCardComponent {
  static renderCard(project, index) {
    const safeTitle = escapeHtml(project.title || 'Proyecto');
    const safeCategory = escapeHtml(project.category || 'Proyecto');
    const safeDesc = escapeHtml(project.desc || '');
    const hasPrice = project.price && project.price.trim().length > 0;
    const safePrice = hasPrice ? escapeHtml(project.price) : '';
    const numSteps = project.steps ? project.steps.length : 1;

    return `
      <div class="project-card" onclick="window.openProjectModal(${index})" style="cursor: pointer; position: relative;">
        <div style="position: relative;">
          <img src="${project.mainImage}" alt="${safeTitle}" class="project-media" loading="lazy">
          ${hasPrice ? `
            <span class="project-card-price-badge">
              <i class="fa-solid fa-tag"></i> ${safePrice}
            </span>
          ` : ''}
          <span class="hero-badge" style="position: absolute; bottom: 0.8rem; right: 0.8rem; background: rgba(0,0,0,0.65); color: #FFF; border: none; font-size: 0.75rem;">
            <i class="fa-solid fa-expand"></i> Ver Detalles
          </span>
        </div>
        <div class="project-body">
          <span style="font-size: 0.75rem; color: var(--terracotta); font-weight: 700; text-transform: uppercase;">${safeCategory}</span>
          <h3 class="project-title" style="margin-top: 0.2rem;">${safeTitle}</h3>
          <p class="project-desc">${safeDesc}</p>
          
          ${(project.materials || project.timeSpent) ? `
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.2rem;">
              ${project.materials ? `<span><i class="fa-solid fa-layer-group" style="color: var(--terracotta);"></i> ${escapeHtml(project.materials)}</span>` : ''}
              ${project.timeSpent ? `<span><i class="fa-solid fa-clock" style="color: var(--warm-gold-hover);"></i> ${escapeHtml(project.timeSpent)}</span>` : ''}
            </div>
          ` : ''}

          <div style="margin-top: 0.8rem; color: var(--warm-gold-hover); font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem;">
            Ver fotos del desarrollo (${numSteps} imágenes) <i class="fa-solid fa-arrow-right"></i>
          </div>
        </div>
      </div>
    `;
  }

  static renderStepCard(step) {
    const safeTitle = escapeHtml(step.title || 'Paso');
    const safeDesc = escapeHtml(step.desc || '');
    const cleanImg = escapeHtml(step.img);

    return `
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04); display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s ease;" onclick="window.openLightboxModal('${cleanImg}', '${safeTitle.replace(/'/g, "\\'")}')">
        <div style="position: relative; height: 160px; overflow: hidden;">
          <img src="${cleanImg}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; bottom: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.65); color: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;"><i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar</span>
        </div>
        <div style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <h4 style="font-size: 0.95rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.4rem; line-height: 1.3;">${safeTitle}</h4>
          <p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; margin: 0;">${safeDesc}</p>
        </div>
      </div>
    `;
  }
}
