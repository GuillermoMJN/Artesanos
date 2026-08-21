import { openModal, closeModal } from '../../core/utils/domUtils.js';
import { ToastComponent } from '../components/ToastComponent.js';

/**
 * Controlador de la Cuenta de Usuario / Cliente (Modal)
 */
export class UserAccountController {
  constructor(authUseCases, onAccountDeleted, onUserUpdated) {
    this.authUseCases = authUseCases;
    this.onAccountDeleted = onAccountDeleted;
    this.onUserUpdated = onUserUpdated;
    this.currentUser = null;
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    const editUserProfileForm = document.getElementById('editUserProfileForm');
    if (editUserProfileForm) editUserProfileForm.addEventListener('submit', (e) => this.handleEditUserProfileSubmit(e));

    const changeUserPasswordForm = document.getElementById('changeUserPasswordForm');
    if (changeUserPasswordForm) changeUserPasswordForm.addEventListener('submit', (e) => this.handleChangeUserPasswordSubmit(e));

    const changeUserEmailForm = document.getElementById('changeUserEmailForm');
    if (changeUserEmailForm) changeUserEmailForm.addEventListener('submit', (e) => this.handleChangeUserEmailSubmit(e));

    const confirmDeleteAccountForm = document.getElementById('confirmDeleteAccountForm');
    if (confirmDeleteAccountForm) confirmDeleteAccountForm.addEventListener('submit', (e) => this.handleDeleteAccountConfirm(e));

    const userAvatarInput = document.getElementById('userAvatarFileInput');
    if (userAvatarInput) userAvatarInput.addEventListener('change', (e) => this.handleUserAvatarChange(e));
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  openUserAccountModal() {
    if (!this.currentUser) {
      openModal('loginModal');
      return;
    }

    const u = this.currentUser;
    const displayName = (u.profile && u.profile.displayName) || u.displayName || (u.email ? u.email.split('@')[0] : 'Usuario');
    const photo = (u.profile && u.profile.photoURL) || u.photoURL || 'images/default_avatar.svg';

    const inputName = document.getElementById('inputUserDisplayName');
    const inputEmail = document.getElementById('inputUserEmailDisplay');
    const avatarPreview = document.getElementById('userAvatarEditPreview');
    const googleNotice = document.getElementById('userGoogleAuthNotice');
    const passwordForms = document.getElementById('userPasswordFormsSection');

    if (inputName) inputName.value = displayName;
    if (inputEmail) inputEmail.value = u.email || '';
    if (avatarPreview) avatarPreview.src = photo;

    const isGoogleAuth = u.providerData && u.providerData.some(p => p.providerId === 'google.com');
    if (isGoogleAuth) {
      if (googleNotice) googleNotice.style.display = 'block';
      if (passwordForms) passwordForms.style.display = 'none';
    } else {
      if (googleNotice) googleNotice.style.display = 'none';
      if (passwordForms) passwordForms.style.display = 'grid';
    }

    this.switchUserTab('userTabProfile');
    openModal('userAccountModal');
  }

  switchUserTab(tabId) {
    document.querySelectorAll('.user-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#userAccountModal .tab-btn').forEach(el => el.classList.remove('active'));

    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.style.display = 'block';

    if (tabId === 'userTabProfile') document.getElementById('btnUserTabProfile')?.classList.add('active');
    if (tabId === 'userTabSecurity') document.getElementById('btnUserTabSecurity')?.classList.add('active');
  }

  async handleUserAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('userAvatarUploadStatus');
    const previewEl = document.getElementById('userAvatarEditPreview');

    const reader = new FileReader();
    reader.onload = (re) => {
      if (previewEl) previewEl.src = re.target.result;
    };
    reader.readAsDataURL(file);

    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subiendo avatar...`;

    try {
      const uploadedUrl = await this.authUseCases.updateAvatar(file, null);
      if (this.currentUser) {
        if (!this.currentUser.profile) this.currentUser.profile = {};
        this.currentUser.profile.photoURL = uploadedUrl;
      }
      if (previewEl) previewEl.src = uploadedUrl;
      if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i> Avatar actualizado`;

      if (typeof this.onUserUpdated === 'function') await this.onUserUpdated(this.currentUser);
      ToastComponent.show('📸 ¡Foto de avatar actualizada con éxito!');
    } catch (err) {
      if (statusEl) statusEl.innerHTML = `<span style="color: #D32F2F;">Error al subir foto</span>`;
      alert(`Error al actualizar avatar: ${err.message}`);
    }
  }

  async handleEditUserProfileSubmit(e) {
    e.preventDefault();
    if (!this.currentUser) return;

    const newName = document.getElementById('inputUserDisplayName').value;
    try {
      await this.authUseCases.updateDisplayName(newName);
      closeModal('userAccountModal', true);
      if (typeof this.onUserUpdated === 'function') await this.onUserUpdated(this.currentUser);
      ToastComponent.show(`👤 Perfil actualizado: ${newName}`);
    } catch (err) {
      alert(`Error al actualizar perfil: ${err.message}`);
    }
  }

  async handleChangeUserPasswordSubmit(e) {
    e.preventDefault();
    const currPass = document.getElementById('inputUserPasswordCurrent').value;
    const newPass = document.getElementById('inputUserPasswordNew').value;

    try {
      await this.authUseCases.changePassword(currPass, newPass);
      e.target.reset();
      ToastComponent.show('🔑 ¡Contraseña cambiada con éxito!');
    } catch (err) {
      alert(`Error al cambiar contraseña: ${err.message}`);
    }
  }

  async handleChangeUserEmailSubmit(e) {
    e.preventDefault();
    const newEmail = document.getElementById('inputUserNewEmail').value;
    const currPass = document.getElementById('inputUserEmailCurrentPassword').value;

    try {
      await this.authUseCases.changeEmail(currPass, newEmail);
      e.target.reset();
      const inputEmail = document.getElementById('inputUserEmailDisplay');
      if (inputEmail) inputEmail.value = newEmail;
      ToastComponent.show(`✉️ Correo actualizado a ${newEmail}`);
    } catch (err) {
      alert(`Error al actualizar correo: ${err.message}`);
    }
  }

  openDeleteAccountModal() {
    const u = this.currentUser;
    const isGoogleAuth = u && u.providerData && u.providerData.some(p => p.providerId === 'google.com');
    const pwdGroup = document.getElementById('deletePasswordGroup');
    const noticeText = document.getElementById('deleteAccountNoticeText');
    const pwdInput = document.getElementById('deleteAccountPasswordConfirm');

    if (pwdInput) pwdInput.value = '';

    if (isGoogleAuth) {
      if (pwdGroup) pwdGroup.style.display = 'none';
      if (pwdInput) pwdInput.removeAttribute('required');
      if (noticeText) noticeText.textContent = 'Esta acción eliminará de forma irreversible tu cuenta y todos tus datos. Al pulsar en Confirmar Eliminación, Google te solicitará verificar tu identidad.';
    } else {
      if (pwdGroup) pwdGroup.style.display = 'block';
      if (pwdInput) pwdInput.setAttribute('required', 'true');
      if (noticeText) noticeText.textContent = 'Esta acción es irreversible. Se eliminará tu cuenta y todos tus datos en la plataforma. Para continuar, introduce tu contraseña actual:';
    }

    openModal('deleteAccountModal');
  }

  async handleDeleteAccountConfirm(e) {
    e.preventDefault();
    const u = this.currentUser;
    const isGoogleAuth = u && u.providerData && u.providerData.some(p => p.providerId === 'google.com');
    const pass = document.getElementById('deleteAccountPasswordConfirm').value;
    const btnConfirm = document.getElementById('btnConfirmDeleteAccount');

    if (!isGoogleAuth && !pass) {
      alert('Debes ingresar tu contraseña actual.');
      return;
    }

    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Eliminando cuenta...`;
    }

    try {
      await this.authUseCases.deleteAccountCascade(isGoogleAuth ? null : pass);

      closeModal('deleteAccountModal', true);
      closeModal('shopManageModal', true);
      closeModal('userAccountModal', true);

      if (typeof this.onAccountDeleted === 'function') await this.onAccountDeleted();
      ToastComponent.show('👋 Tu cuenta y todos los datos asociados han sido eliminados.');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      alert(`Error al eliminar cuenta: ${err.message}`);
    } finally {
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = `<i class="fa-solid fa-trash"></i> Confirmar Eliminación`;
      }
    }
  }
}
