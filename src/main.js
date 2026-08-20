import { FirebaseArtisanRepository } from './data/firebase/FirebaseArtisanRepository.js';
import { FirebaseAuthRepository } from './data/firebase/FirebaseAuthRepository.js';
import { FirebaseStorageRepository } from './data/firebase/FirebaseStorageRepository.js';
import { GetArtisansUseCase } from './domain/usecases/GetArtisansUseCase.js';
import { AuthUseCases } from './domain/usecases/AuthUseCases.js';
import { ManageShopUseCases } from './domain/usecases/ManageShopUseCases.js';
import { HeaderController } from './presentation/controllers/HeaderController.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { DirectoryController } from './presentation/controllers/DirectoryController.js';
import { ShopManageController } from './presentation/controllers/ShopManageController.js';
import { UserAccountController } from './presentation/controllers/UserAccountController.js';
import { IntroAnimationComponent } from './presentation/components/IntroAnimationComponent.js';
import { setupModalDismissListeners, closeModal } from './core/utils/domUtils.js';

/**
 * Orquestador Principal de la Aplicación (index.html)
 */
class MainApp {
  constructor() {
    // 1. Capa de Datos (Data Layer)
    this.artisanRepo = new FirebaseArtisanRepository();
    this.authRepo = new FirebaseAuthRepository();
    this.storageRepo = new FirebaseStorageRepository();

    // 2. Capa de Dominio / Casos de Uso (Domain Use Cases)
    this.getArtisansUseCase = new GetArtisansUseCase(this.artisanRepo);
    this.authUseCases = new AuthUseCases(this.authRepo, this.artisanRepo);
    this.manageShopUseCases = new ManageShopUseCases(this.artisanRepo, this.storageRepo);

    // Estado centralizado
    this.currentUser = null;
    this.currentArtisanProfile = null;

    // 3. Capa de Presentación / Controladores (Presentation Controllers)
    this.headerController = new HeaderController({
      onOpenLogin: () => this.authController.openLoginModal(),
      onOpenRegister: () => this.authController.openRegisterModal(),
      onOpenShopManage: () => this.shopManageController.openShopManageModal(),
      onOpenUserAccount: () => this.userAccountController.openUserAccountModal(),
      onLogout: () => this.authController.logout()
    });

    this.directoryController = new DirectoryController(this.getArtisansUseCase);

    this.authController = new AuthController(
      this.authUseCases,
      this.manageShopUseCases,
      async (user) => this.onAuthStateUpdated(user)
    );

    this.shopManageController = new ShopManageController(
      this.manageShopUseCases,
      this.authUseCases,
      async () => {
        await this.refreshArtisansData();
      }
    );

    this.userAccountController = new UserAccountController(
      this.authUseCases,
      async () => {
        this.currentUser = null;
        this.currentArtisanProfile = null;
        await this.refreshArtisansData();
        this.headerController.updateAuthUI(null, null);
      },
      async (updatedUser) => {
        this.headerController.updateAuthUI(updatedUser, this.currentArtisanProfile);
      }
    );
  }

  async init() {
    IntroAnimationComponent.play();
    setupModalDismissListeners();

    this.headerController.init();
    this.authController.init();
    this.shopManageController.init();
    this.userAccountController.init();

    await this.directoryController.init();
    this.setupAuthObserver();
  }

  setupAuthObserver() {
    this.authUseCases.onAuthStateChanged(async (user) => {
      await this.onAuthStateUpdated(user);

      // Parámetros de URL
      const urlParams = new URLSearchParams(window.location.search);
      const isArtisan = (user && user.profile && user.profile.role === 'artisan') || !!this.currentArtisanProfile;

      if (urlParams.get('manage') === 'true' && user && isArtisan) {
        this.shopManageController.openShopManageModal();
      } else if (urlParams.get('account') === 'true' && user && !isArtisan) {
        this.userAccountController.openUserAccountModal();
      }
    });
  }

  async onAuthStateUpdated(user) {
    this.currentUser = user;
    if (user) {
      if (!user.profile) {
        user.profile = await this.authRepo.getUserProfile(user.uid);
      }
      const isArtisan = (user.profile && user.profile.role === 'artisan');
      if (isArtisan) {
        this.currentArtisanProfile = await this.artisanRepo.getArtisanByOwnerId(user.uid);
      } else {
        this.currentArtisanProfile = null;
      }
    } else {
      this.currentArtisanProfile = null;
    }

    this.shopManageController.setCurrentState(this.currentUser, this.currentArtisanProfile);
    this.userAccountController.setCurrentUser(this.currentUser);
    this.headerController.updateAuthUI(this.currentUser, this.currentArtisanProfile);
  }

  async refreshArtisansData() {
    await this.directoryController.loadArtisans();
    if (this.currentUser) {
      this.currentArtisanProfile = await this.artisanRepo.getArtisanByOwnerId(this.currentUser.uid);
      this.shopManageController.setCurrentState(this.currentUser, this.currentArtisanProfile);
    }
  }

  // --- FACHADA GLOBAL PARA VISTAS HTML (window.appUI) ---
  openLoginModal() { this.authController.openLoginModal(); }
  openRegisterModal() { this.authController.openRegisterModal(); }
  closeModal(id) { closeModal(id); }
  handleLogout() { this.authController.logout(); }
  selectRegisterRole(role) { this.authController.selectRegisterRole(role); }
  handleGoogleLogin(context) { this.authController.handleGoogleLogin(context); }

  toggleMobileMenu(forceState) { this.headerController.toggleMobileMenu(forceState); }

  filterByCategory(catId) { this.directoryController.filterByCategory(catId); }
  filterByLocation(loc) { this.directoryController.filterByLocation(loc); }

  openShopManageModal() { this.shopManageController.openShopManageModal(); }
  switchShopTab(tabId) { this.shopManageController.switchShopTab(tabId); }
  showNewProjectForm() { this.shopManageController.showNewProjectForm(); }
  hideProjectForm() { this.shopManageController.hideProjectForm(); }
  removeProjectMediaFile(idx) { this.shopManageController.removeProjectMediaFile(idx); }
  editProject(idx) { this.shopManageController.editProject(idx); }
  deleteProject(idx) { this.shopManageController.deleteProject(idx); }

  openUserAccountModal() { this.userAccountController.openUserAccountModal(); }
  switchUserTab(tabId) { this.userAccountController.switchUserTab(tabId); }
  openDeleteAccountModal() { this.userAccountController.openDeleteAccountModal(); }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  const app = new MainApp();
  app.init();
  window.appUI = app;
});
