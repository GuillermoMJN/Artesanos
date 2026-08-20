/**
 * Utilidades para manipulación segura y accesible del DOM
 */

export function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.remove('active');
  }
  const anyOpen = document.querySelector('.modal-overlay.active');
  if (!anyOpen) {
    document.body.style.overflow = '';
  }
}

export function setupModalDismissListeners(onModalClosed = null) {
  // Cerrar al hacer click fuera del contenido del modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
        if (typeof onModalClosed === 'function') onModalClosed(overlay.id);
      }
    });
  });

  // Cerrar al pulsar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        closeModal(modal.id);
        if (typeof onModalClosed === 'function') onModalClosed(modal.id);
      });
    }
  });
}
