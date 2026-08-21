import { openModal, closeModal, escapeHtml } from '../../core/utils/domUtils.js';

/**
 * Componente / Controlador del Visor Lightbox para fotos y vídeos
 */
export class LightboxComponent {
  static open(mediaUrl, title = '', description = '') {
    const container = document.getElementById('lightboxMediaContainer');
    const overlayEl = document.getElementById('lightboxCaptionOverlay');
    const titleEl = document.getElementById('lightboxTitle');
    const descEl = document.getElementById('lightboxDescription');
    if (!container) return;

    const isVideo = (mediaUrl || '').endsWith('.mp4') || (mediaUrl || '').endsWith('.webm') || (mediaUrl || '').endsWith('.mov');

    if (isVideo) {
      container.innerHTML = `<video src="${mediaUrl}" controls autoplay style="max-width: 90vw; max-height: 82vh; border-radius: 12px; display: block;"></video>`;
    } else {
      container.innerHTML = `<img src="${mediaUrl}" alt="${escapeHtml(title || 'Foto')}" style="max-width: 90vw; max-height: 82vh; object-fit: contain; border-radius: 12px; display: block;">`;
    }

    const hasTitle = Boolean(title && title.trim().length > 0);
    const hasDesc = Boolean(description && description.trim().length > 0);

    if (overlayEl) {
      if (hasTitle || hasDesc) {
        overlayEl.style.display = 'block';
        if (titleEl) {
          titleEl.textContent = title || '';
          titleEl.style.display = hasTitle ? 'block' : 'none';
        }
        if (descEl) {
          descEl.textContent = description || '';
          descEl.style.display = hasDesc ? 'block' : 'none';
        }
      } else {
        overlayEl.style.display = 'none';
      }
    }

    openModal('lightboxModal');
  }

  static close() {
    closeModal('lightboxModal');
    const container = document.getElementById('lightboxMediaContainer');
    if (container) container.innerHTML = '';
  }
}

