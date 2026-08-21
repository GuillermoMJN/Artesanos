import { showConfirmModal } from './confirmModal.js';

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

/**
 * Comprueba si un modal contiene datos rellenados o modificados por el usuario
 * @param {HTMLElement|string} modalElOrId 
 * @returns {boolean}
 */
export function hasUnsavedModalChanges(modalElOrId) {
  const modalEl = typeof modalElOrId === 'string' ? document.getElementById(modalElOrId) : modalElOrId;
  if (!modalEl) return false;

  // Ignorar modales puramente informativos o visores de medios
  const infoOnlyModals = ['lightboxModal', 'detailModal', 'verificationSuccessModal'];
  if (infoOnlyModals.includes(modalEl.id)) {
    return false;
  }

  // 1. Text inputs (text, email, password, number, tel, url, etc.)
  const textInputs = modalEl.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="submit"]):not([type="button"]):not([type="reset"])');
  for (const input of textInputs) {
    if (input.disabled || input.readOnly) continue;
    const currentVal = (input.value || '').trim();
    const defVal = (input.defaultValue || '').trim();
    if (defVal === '' && currentVal.length > 0) return true;
    if (defVal !== '' && currentVal !== defVal) return true;
  }

  // 2. Textareas
  const textareas = modalEl.querySelectorAll('textarea');
  for (const ta of textareas) {
    if (ta.disabled || ta.readOnly) continue;
    const currentVal = (ta.value || '').trim();
    const defVal = (ta.defaultValue || '').trim();
    if (defVal === '' && currentVal.length > 0) return true;
    if (defVal !== '' && currentVal !== defVal) return true;
  }

  // 3. File inputs
  const fileInputs = modalEl.querySelectorAll('input[type="file"]');
  for (const fi of fileInputs) {
    if (fi.files && fi.files.length > 0) return true;
  }

  // 4. Checkbox / Radios
  const checkInputs = modalEl.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  for (const ci of checkInputs) {
    if (ci.disabled) continue;
    if (ci.checked !== ci.defaultChecked) return true;
  }

  // 5. Select dropdowns
  const selects = modalEl.querySelectorAll('select');
  for (const sel of selects) {
    if (sel.disabled) continue;
    let defSelected = 0;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].defaultSelected) {
        defSelected = i;
        break;
      }
    }
    if (sel.selectedIndex !== defSelected && sel.selectedIndex > 0) return true;
  }

  return false;
}

// Modales específicos que requieren confirmación antes de descartar cambios
const MODALS_REQUIRING_CONFIRMATION = [
  'shopManageModal',      // Gestión de tienda / perfil de taller
  'profileProjectModal',  // Crear / Editar nuevo proyecto desde el perfil
  'projectDetailModal'    // Detalle / Gestión de proyecto
];

/**
 * Cierra un modal. Si force = false y el modal está en la lista de confirmación y tiene cambios,
 * muestra un modal emergente personalizado de confirmación.
 * @param {string} modalId - ID del modal a cerrar
 * @param {boolean} force - Si es true, omite la confirmación (ej. tras guardar con éxito)
 * @returns {Promise<boolean>|boolean} - true si el modal se cerró, false si se canceló
 */
export async function closeModal(modalId, force = false) {
  const el = document.getElementById(modalId);
  if (!el) return false;

  // Solo pedir confirmación personalizada si es uno de los modales designados y tiene cambios
  if (!force && MODALS_REQUIRING_CONFIRMATION.includes(modalId) && hasUnsavedModalChanges(el)) {
    let title = '¿Seguro que quieres cerrar?';
    let message = 'Tienes información o cambios sin guardar en este formulario. Si cierras ahora, se perderán todos los datos no guardados.';
    
    if (modalId === 'profileProjectModal') {
      title = '¿Descartar este proyecto?';
      message = 'Las fotos y los detalles introducidos para esta obra se perderán si sales sin guardar.';
    } else if (modalId === 'shopManageModal') {
      title = '¿Cerrar Gestión de Tienda?';
      message = 'Hay cambios sin guardar en los datos o promociones de tu taller. ¿Deseas salir igualmente?';
    }

    const userConfirmed = await showConfirmModal({
      title,
      message,
      acceptText: 'Sí, Salir',
      cancelText: 'Seguir Editando'
    });

    if (!userConfirmed) {
      return false;
    }
  }

  el.classList.remove('active');

  const anyOpen = document.querySelector('.modal-overlay.active');
  if (!anyOpen) {
    document.body.style.overflow = '';
  }
  return true;
}

export function setupModalDismissListeners(onModalClosed = null) {
  // 1. Cerrar al hacer clic en el fondo exterior (backdrop) de cualquier modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    if (overlay.dataset.dismissSetup === 'true') return;
    overlay.dataset.dismissSetup = 'true';

    overlay.addEventListener('click', async (e) => {
      // Si el clic fue directamente en el overlay (fondo oscuro) y no en la tarjeta
      if (e.target === overlay) {
        const closed = await closeModal(overlay.id, false);
        if (closed && typeof onModalClosed === 'function') onModalClosed(overlay.id);
      }
    });
  });

  // 2. Cerrar al pulsar botones de cierre .modal-close o [data-modal-close]
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    if (btn.dataset.dismissSetup === 'true') return;
    btn.dataset.dismissSetup = 'true';

    btn.addEventListener('click', async (e) => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        e.preventDefault();
        e.stopPropagation();
        const closed = await closeModal(modal.id, false);
        if (closed && typeof onModalClosed === 'function') onModalClosed(modal.id);
      }
    });
  });

  // 3. Cerrar al pulsar la tecla Escape
  if (!window._modalEscapeListenerSetup) {
    window._modalEscapeListenerSetup = true;
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Escape') {
        const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active'));
        if (activeModals.length > 0) {
          // Tomar el modal superior
          const topModal = activeModals[activeModals.length - 1];
          const closed = await closeModal(topModal.id, false);
          if (closed && typeof onModalClosed === 'function') onModalClosed(topModal.id);
        }
      }
    });
  }
}

