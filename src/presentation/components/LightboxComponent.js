import { openModal, closeModal } from '../../core/utils/domUtils.js';

/**
 * Componente / Controlador del Visor Lightbox para fotos y vídeos
 */
export class LightboxComponent {
  static open(mediaUrl, caption = '') {
    const container = document.getElementById('lightboxMediaContainer');
    const captionEl = document.getElementById('lightboxCaption');
    if (!container) return;

    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov');

    if (isVideo) {
      container.innerHTML = `<video src="${mediaUrl}" controls autoplay style="max-width: 90vw; max-height: 80vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"></video>`;
    } else {
      container.innerHTML = `<img src="${mediaUrl}" alt="${caption}" style="max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
    }

    if (captionEl) captionEl.textContent = caption;
    openModal('lightboxModal');
  }

  static close() {
    closeModal('lightboxModal');
    const container = document.getElementById('lightboxMediaContainer');
    if (container) container.innerHTML = '';
  }
}
