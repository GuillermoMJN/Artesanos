import { openModal, closeModal } from '../../core/utils/domUtils.js';
import { ToastComponent } from '../components/ToastComponent.js';

/**
 * Controlador de Autenticación (Login, Registro y Google Auth)
 */
export class AuthController {
  constructor(authUseCases, manageShopUseCases, onAuthSuccess) {
    this.authUseCases = authUseCases;
    this.manageShopUseCases = manageShopUseCases;
    this.onAuthSuccess = onAuthSuccess;
  }

  init() {
    this.setupFormListeners();
  }

  setupFormListeners() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }
  }

  openLoginModal() {
    openModal('loginModal');
  }

  openRegisterModal() {
    openModal('registerModal');
  }

  selectRegisterRole(role) {
    const roleInput = document.getElementById('registerAccountRole');
    const roleBtnClient = document.getElementById('roleBtnClient');
    const roleBtnArtisan = document.getElementById('roleBtnArtisan');
    const extraFields = document.getElementById('artisanExtraFields');
    const btnSubmit = document.getElementById('btnSubmitRegister');
    const modalTitle = document.getElementById('registerModalTitle');
    const googleBtnLabel = document.getElementById('btnGoogleRegisterLabel');

    if (roleInput) roleInput.value = role;

    if (role === 'client') {
      if (roleBtnClient) {
        roleBtnClient.style.background = 'var(--terracotta)';
        roleBtnClient.style.color = '#FFF';
      }
      if (roleBtnArtisan) {
        roleBtnArtisan.style.background = 'transparent';
        roleBtnArtisan.style.color = 'var(--text-main)';
      }
      if (extraFields) extraFields.style.display = 'none';
      if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Crear Cuenta de Usuario';
      if (modalTitle) modalTitle.textContent = 'Crear Cuenta de Usuario';
      if (googleBtnLabel) googleBtnLabel.textContent = 'Registrarse como Cliente con Google';
    } else {
      if (roleBtnArtisan) {
        roleBtnArtisan.style.background = 'var(--terracotta)';
        roleBtnArtisan.style.color = '#FFF';
      }
      if (roleBtnClient) {
        roleBtnClient.style.background = 'transparent';
        roleBtnClient.style.color = 'var(--text-main)';
      }
      if (extraFields) extraFields.style.display = 'block';
      if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Crear Cuenta de Artesano';
      if (modalTitle) modalTitle.textContent = 'Crear Cuenta de Artesano';
      if (googleBtnLabel) googleBtnLabel.textContent = 'Registrarse como Artesano con Google';
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const user = await this.authUseCases.signIn(email, password);
      closeModal('loginModal');
      ToastComponent.show(`¡Bienvenido de nuevo, ${user.email}!`);
      if (typeof this.onAuthSuccess === 'function') await this.onAuthSuccess(user);
    } catch (err) {
      alert(`Error al iniciar sesión: ${err.message}`);
    }
  }

  async handleGoogleLogin(context = 'register') {
    try {
      let role = 'client';
      if (context === 'register') {
        role = (document.getElementById('registerAccountRole') && document.getElementById('registerAccountRole').value) || 'client';
      }
      const user = await this.authUseCases.signInWithGoogle(role);
      closeModal('loginModal');
      closeModal('registerModal');

      const name = (user.profile && user.profile.displayName) || user.displayName || user.email;
      const roleLabel = (user.profile && user.profile.role === 'artisan') ? 'Artesano / Taller' : 'Usuario / Cliente';
      ToastComponent.show(`¡Bienvenido, ${name}! Sesión iniciada como ${roleLabel}.`);

      if (typeof this.onAuthSuccess === 'function') await this.onAuthSuccess(user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      alert(`Error al conectar con Google: ${err.message}`);
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();

    const role = (document.getElementById('registerAccountRole') && document.getElementById('registerAccountRole').value) || 'client';
    const authEmail = document.getElementById('inputAuthEmail').value;
    const authPassword = document.getElementById('inputAuthPassword').value;
    const displayName = document.getElementById('inputDisplayName').value;

    let createdUser = null;

    try {
      createdUser = await this.authUseCases.signUp(authEmail, authPassword, displayName, role);
      ToastComponent.show('📩 Correo de verificación enviado a ' + authEmail);
    } catch (authErr) {
      alert('Error al registrar usuario: ' + authErr.message);
      return;
    }

    if (role === 'artisan') {
      const name = document.getElementById('inputName').value || displayName;
      const categorySelect = document.getElementById('inputCategory');
      const category = categorySelect ? categorySelect.value : 'ceramica';
      const categoryLabel = categorySelect && categorySelect.options[categorySelect.selectedIndex] ? categorySelect.options[categorySelect.selectedIndex].text : 'Artesanía';
      const trade = document.getElementById('inputTrade').value;
      const location = document.getElementById('inputLocation').value;
      const address = document.getElementById('inputAddress').value;
      const phone = document.getElementById('inputPhone').value;
      const websiteInput = document.getElementById('inputWebsite');
      const website = websiteInput ? websiteInput.value : '';
      const description = document.getElementById('inputDescription').value;
      const acceptsCustomOrders = document.getElementById('inputAcceptsCustomOrders') ? document.getElementById('inputAcceptsCustomOrders').checked : true;
      const isVisitable = document.getElementById('inputIsVisitable') ? document.getElementById('inputIsVisitable').checked : false;

      await this.manageShopUseCases.createArtisanProfile({
        id: Date.now(),
        ownerId: createdUser ? createdUser.uid : 'anonymous',
        name,
        trade,
        category,
        categoryLabel,
        location,
        address,
        phone,
        email: authEmail,
        website,
        description,
        acceptsCustomOrders,
        isVisitable,
        image: 'images/default_avatar.svg'
      });

      ToastComponent.show(`¡Bienvenido, ${name}! Tu cuenta y taller artesano están listos.`);
    } else {
      ToastComponent.show(`¡Bienvenido, ${displayName}! Tu cuenta de usuario está lista.`);
    }

    closeModal('registerModal');
    e.target.reset();
    if (typeof this.onAuthSuccess === 'function') await this.onAuthSuccess(createdUser);
  }

  async logout() {
    await this.authUseCases.logout();
    ToastComponent.show('Has cerrado sesión correctamente.');
    if (typeof this.onAuthSuccess === 'function') await this.onAuthSuccess(null);
  }
}
