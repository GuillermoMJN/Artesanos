import { openModal, closeModal, escapeHtml } from '../../core/utils/domUtils.js';
import { ToastComponent } from '../components/ToastComponent.js';

/**
 * Controlador para la Asistencia/Contacto global y Solicitud de Verificación de Artesanos
 */
export class SupportController {
  constructor(crmUseCases, authUseCases) {
    this.crmUseCases = crmUseCases;
    this.authUseCases = authUseCases;
    this.currentUser = null;
    this.currentArtisan = null;
  }

  init() {
    this.setupListeners();
  }

  setCurrentState(user, artisan) {
    this.currentUser = user;
    this.currentArtisan = artisan;
  }

  setupListeners() {
    // Formulario de solicitud de verificación
    const verifForm = document.getElementById('artisanVerificationForm');
    if (verifForm) {
      verifForm.addEventListener('submit', (e) => this.handleVerificationSubmit(e));
    }

    // Formulario de soporte e incidencias
    const supportForm = document.getElementById('supportContactForm');
    if (supportForm) {
      supportForm.addEventListener('submit', (e) => this.handleSupportSubmit(e));
    }
  }

  openVerificationModal() {
    if (!this.currentArtisan) {
      ToastComponent.show('⚠️ Debes tener un taller registrado para solicitar la verificación de artesano.');
      return;
    }

    const nameInput = document.getElementById('verifContactName');
    const emailInput = document.getElementById('verifContactEmail');
    const phoneInput = document.getElementById('verifContactPhone');
    const workshopNameEl = document.getElementById('verifWorkshopNameDisplay');

    if (workshopNameEl) {
      workshopNameEl.textContent = this.currentArtisan.name;
    }

    if (nameInput && !nameInput.value) {
      nameInput.value = (this.currentUser && this.currentUser.profile && this.currentUser.profile.displayName) || '';
    }
    if (emailInput && !emailInput.value) {
      emailInput.value = (this.currentUser && this.currentUser.email) || this.currentArtisan.email || '';
    }
    if (phoneInput && !phoneInput.value) {
      phoneInput.value = this.currentArtisan.phone || '';
    }

    openModal('artisanVerificationModal');
  }

  async handleVerificationSubmit(e) {
    e.preventDefault();
    if (!this.currentArtisan) return;

    const contactName = document.getElementById('verifContactName').value.trim();
    const contactEmail = document.getElementById('verifContactEmail').value.trim();
    const contactPhone = document.getElementById('verifContactPhone').value.trim();
    const additionalNotes = document.getElementById('verifNotes') ? document.getElementById('verifNotes').value.trim() : '';

    const btnSubmit = document.getElementById('btnSubmitVerification');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enviando solicitud...`;
    }

    try {
      await this.crmUseCases.submitVerificationRequest({
        artisanId: this.currentArtisan.id,
        artisanDocId: this.currentArtisan.docId,
        artisanName: this.currentArtisan.name,
        contactName,
        contactEmail,
        contactPhone,
        additionalNotes
      });

      closeModal('artisanVerificationModal', true);
      e.target.reset();

      // Mostrar confirmación
      this.showVerificationSuccessModal(contactName, contactEmail);
    } catch (err) {
      alert(`Error al enviar solicitud de verificación: ${err.message}`);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar Solicitud de Verificación`;
      }
    }
  }

  showVerificationSuccessModal(contactName, contactEmail) {
    const detailEl = document.getElementById('verifSuccessDetailText');
    if (detailEl) {
      detailEl.innerHTML = `Hemos recibido tu solicitud para <strong>${escapeHtml(this.currentArtisan.name)}</strong>. Nos pondremos en contacto contigo lo antes posible a través de <strong>${escapeHtml(contactEmail)}</strong> para revisar y validar tu taller como <strong>Artesano Certificado</strong>.`;
    }
    openModal('verificationSuccessModal');
  }

  openSupportModal(category = 'incidencia') {
    const catSelect = document.getElementById('supportCategorySelect');
    const nameInput = document.getElementById('supportSenderName');
    const emailInput = document.getElementById('supportSenderEmail');

    if (catSelect && category) {
      catSelect.value = category;
    }

    // Dejar campos limpios para respetar privacidad y anonimato
    if (nameInput) {
      nameInput.value = '';
    }
    if (emailInput) {
      emailInput.value = '';
    }

    openModal('supportContactModal');
  }

  async handleSupportSubmit(e) {
    e.preventDefault();
    const form = e.target ? (e.target.closest ? e.target.closest('form') : e.target) : document.getElementById('supportContactForm');
    if (!form) return;

    const senderName = (form.querySelector('#supportSenderName') || document.getElementById('supportSenderName'))?.value.trim() || '';
    const senderEmail = (form.querySelector('#supportSenderEmail') || document.getElementById('supportSenderEmail'))?.value.trim() || '';
    const category = (form.querySelector('#supportCategorySelect') || document.getElementById('supportCategorySelect'))?.value || 'incidencia';
    const subject = (form.querySelector('#supportSubject') || document.getElementById('supportSubject'))?.value.trim() || 'Incidencia Web';
    const message = (form.querySelector('#supportMessage') || document.getElementById('supportMessage'))?.value.trim() || '';

    if (!senderName || !senderEmail || !message) {
      ToastComponent.show('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    const consentCheckbox = form.querySelector('#supportConsentCheckbox') || document.getElementById('supportConsentCheckbox');
    if (consentCheckbox && !consentCheckbox.checked) {
      ToastComponent.show('Debes aceptar la Política de Privacidad para continuar.', 'error');
      return;
    }

    const role = (this.currentUser && this.currentUser.profile && this.currentUser.profile.role) || (this.currentArtisan ? 'artisan' : (this.currentUser ? 'client' : 'guest'));

    const btnSubmit = form.querySelector('#btnSubmitSupport') || document.getElementById('btnSubmitSupport');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enviando...`;
    }

    try {
      await this.crmUseCases.submitSupportTicket({
        userId: this.currentUser ? this.currentUser.uid : 'anonymous',
        senderName,
        senderEmail,
        senderRole: role,
        category,
        subject,
        message
      });

      closeModal('supportContactModal', true);
      if (form && typeof form.reset === 'function') {
        form.reset();
      }

      ToastComponent.show('📨 ¡Mensaje de asistencia recibido! Nuestro equipo te responderá a la brevedad.');
    } catch (err) {
      alert(`Error al enviar mensaje: ${err.message}`);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar Mensaje`;
      }
    }
  }
}
