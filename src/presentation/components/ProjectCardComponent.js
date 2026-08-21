import { escapeHtml } from '../../core/utils/domUtils.js';

/**
 * Componente para renderizar tarjetas de proyectos y pasos de galería
 */
export class ProjectCardComponent {
  static renderCard(project, index, isOwner = false) {
    const safeTitle = escapeHtml(project.title || 'Proyecto');
    const safeCategory = escapeHtml(project.category || 'Proyecto');
    const safeDesc = escapeHtml(project.desc || '');
    const hasPrice = project.price && project.price.trim().length > 0;
    const safePrice = hasPrice ? escapeHtml(project.price) : '';
    const numSteps = project.steps ? project.steps.length : 1;

    return `
      <div class="project-card" style="position: relative; display: flex; flex-direction: column;">
        ${isOwner ? `
          <div style="position: absolute; top: 0.8rem; left: 0.8rem; z-index: 10; display: flex; gap: 0.4rem;" onclick="event.stopPropagation();">
            <button type="button" onclick="window.profileEditProject(${index})" title="Editar Obra" style="background: rgba(255,255,255,0.95); color: var(--primary-dark); border: 1px solid var(--border-color); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); font-size: 0.85rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" onclick="window.profileDeleteProject(${index})" title="Eliminar Obra" style="background: rgba(255,255,255,0.95); color: #D32F2F; border: 1px solid #FFCDD2; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); font-size: 0.85rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        ` : ''}
        <div style="position: relative; cursor: pointer; background: #FFFFFF;" onclick="window.openLightboxForProject(${index})" title="Haz clic para ampliar la foto">
          <img src="${project.mainImage}" alt="${safeTitle}" class="project-media" loading="lazy" style="opacity: 0; transition: opacity 0.6s ease;" onload="this.style.opacity='1';">
          ${hasPrice ? `
            <span class="project-card-price-badge">
              <i class="fa-solid fa-tag"></i> ${safePrice}
            </span>
          ` : ''}
          <span class="hero-badge" style="position: absolute; bottom: 0.8rem; right: 0.8rem; background: rgba(0,0,0,0.72); color: #FFF; border: none; font-size: 0.78rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar Foto
          </span>
        </div>
        <div class="project-body" style="cursor: pointer; flex: 1; display: flex; flex-direction: column;" onclick="window.openProjectModal(${index})">
          <span style="font-size: 0.75rem; color: var(--terracotta); font-weight: 700; text-transform: uppercase;">${safeCategory}</span>
          <h3 class="project-title" style="margin-top: 0.2rem;">${safeTitle}</h3>
          <p class="project-desc">${safeDesc}</p>
          
          ${(project.materials || project.timeSpent) ? `
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.2rem;">
              ${project.materials ? `<span><i class="fa-solid fa-layer-group" style="color: var(--terracotta);"></i> ${escapeHtml(project.materials)}</span>` : ''}
              ${project.timeSpent ? `<span><i class="fa-solid fa-clock" style="color: var(--warm-gold-hover);"></i> ${escapeHtml(project.timeSpent)}</span>` : ''}
            </div>
          ` : ''}

          <div style="margin-top: auto; padding-top: 0.8rem; color: var(--warm-gold-hover); font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem;">
            Ver ficha técnica y detalles (${numSteps} fotos) <i class="fa-solid fa-arrow-right"></i>
          </div>
        </div>
      </div>
    `;
  }

  static renderStepCard(step, stepIdx = 0, projIdx = 0) {
    const safeTitle = escapeHtml(step.title || '');
    const safeDesc = escapeHtml(step.desc || '');
    const cleanImg = escapeHtml(step.img);

    return `
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04); display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s ease;" onclick="window.openLightboxStep(${projIdx}, ${stepIdx})" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        <div style="position: relative; height: 180px; overflow: hidden; background: #FAF7F2;">
          <img src="${cleanImg}" alt="${safeTitle || 'Foto'}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; bottom: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.7); color: #FFF; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;"><i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar</span>
        </div>
        ${(step.title || step.desc) ? `
          <div style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            ${step.title ? `<h4 style="font-size: 0.95rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.35rem; line-height: 1.3;">${safeTitle}</h4>` : ''}
            ${step.desc ? `<p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; margin: 0;">${safeDesc}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
}

