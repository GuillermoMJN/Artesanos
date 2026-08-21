/**
 * Modal personalizado para confirmaciones del sistema
 * Sustituye los alerts y confirm() nativos del navegador por un modal con la estética de la app.
 */
import { openModal, closeModal } from './domUtils.js';

let confirmResolve = null;

export function ensureConfirmModalInDom() {
  if (document.getElementById('customConfirmModal')) return;

  const modalHtml = `
  <div class="modal-overlay" id="customConfirmModal" style="z-index: 10000; backdrop-filter: blur(8px);">
    <div class="modal-card" style="max-width: 460px; border-radius: 20px; box-shadow: 0 25px 60px rgba(62,39,35,0.3); border: 1.5px solid var(--border-color); overflow: hidden; padding: 0;">
      <div class="modal-body" style="padding: 2.2rem 2rem 1.8rem; text-align: center;">
        <div id="customConfirmIconWrapper" style="width: 60px; height: 60px; border-radius: 50%; background: rgba(192,108,76,0.12); color: var(--terracotta); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.2rem;">
          <i id="customConfirmIcon" class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 id="customConfirmTitle" style="font-family: 'Playfair Display', serif; font-size: 1.45rem; color: var(--primary-dark); margin: 0 0 0.6rem 0;">
          ¿Descartar cambios?
        </h3>
        <p id="customConfirmMessage" style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.55; margin: 0 0 1.8rem 0;">
          Tienes cambios sin guardar en este formulario. Si cierras ahora, se perderá la información introducida.
        </p>
        <div style="display: flex; gap: 0.9rem; justify-content: center;">
          <button type="button" id="customConfirmCancelBtn" class="btn btn-secondary" style="flex: 1; padding: 0.75rem 1.2rem; font-size: 0.9rem; font-weight: 600; border-radius: 10px;">
            Seguir Editando
          </button>
          <button type="button" id="customConfirmAcceptBtn" class="btn btn-primary" style="flex: 1; padding: 0.75rem 1.2rem; font-size: 0.9rem; font-weight: 700; border-radius: 10px; background: #C06C4C;">
            Sí, Salir
          </button>
        </div>
      </div>
    </div>
  </div>`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper.firstElementChild);

  const confirmModal = document.getElementById('customConfirmModal');
  const cancelBtn = document.getElementById('customConfirmCancelBtn');
  const acceptBtn = document.getElementById('customConfirmAcceptBtn');

  const handleResolve = (value) => {
    confirmModal.classList.remove('active');
    const remainingOpen = document.querySelector('.modal-overlay.active');
    if (!remainingOpen) {
      document.body.style.overflow = '';
    }
    if (confirmResolve) {
      const cb = confirmResolve;
      confirmResolve = null;
      cb(value);
    }
  };

  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleResolve(false);
  });

  acceptBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleResolve(true);
  });

  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      handleResolve(false);
    }
  });
}

/**
 * Muestra el diálogo de confirmación personalizado de Arte y Sanos
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} options.acceptText
 * @param {string} options.cancelText
 * @param {string} options.iconClass
 * @returns {Promise<boolean>}
 */
export function showConfirmModal({
  title = '¿Cerrar sin guardar?',
  message = 'Tienes datos o cambios introducidos. Si sales ahora, se perderán.',
  acceptText = 'Sí, Cerrar',
  cancelText = 'Seguir Editando',
  iconClass = 'fa-solid fa-triangle-exclamation'
} = {}) {
  ensureConfirmModalInDom();

  const titleEl = document.getElementById('customConfirmTitle');
  const messageEl = document.getElementById('customConfirmMessage');
  const acceptBtn = document.getElementById('customConfirmAcceptBtn');
  const cancelBtn = document.getElementById('customConfirmCancelBtn');
  const iconEl = document.getElementById('customConfirmIcon');

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
  if (acceptBtn) acceptBtn.textContent = acceptText;
  if (cancelBtn) cancelBtn.textContent = cancelText;
  if (iconEl) iconEl.className = iconClass;

  const modalEl = document.getElementById('customConfirmModal');
  if (modalEl) {
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  return new Promise((resolve) => {
    confirmResolve = resolve;
  });
}
