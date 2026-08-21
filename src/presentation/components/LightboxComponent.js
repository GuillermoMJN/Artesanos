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
    if (!container || !mediaUrl) return;

    const isVideo = String(mediaUrl).endsWith('.mp4') || String(mediaUrl).endsWith('.webm') || String(mediaUrl).endsWith('.mov');

    const hasTitle = Boolean(title && String(title).trim().length > 0);
    const hasDesc = Boolean(description && String(description).trim().length > 0);
    const hasText = hasTitle || hasDesc;
    const mediaMaxHeight = hasText ? '68vh' : '82vh';
    const mediaBorderRadius = hasText ? '14px 14px 0 0' : '14px';

    if (isVideo) {
      container.innerHTML = `<video src="${mediaUrl}" controls autoplay style="max-width: 90vw; max-height: ${mediaMaxHeight}; border-radius: ${mediaBorderRadius}; display: block; object-fit: contain;"></video>`;
    } else {
      container.innerHTML = `<img src="${mediaUrl}" alt="${escapeHtml(title || 'Fotografía Artesanal')}" style="max-width: 90vw; max-height: ${mediaMaxHeight}; object-fit: contain; border-radius: ${mediaBorderRadius}; display: block;">`;
    }

    if (overlayEl) {
      if (hasText) {
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


