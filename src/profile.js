import { FirebaseArtisanRepository } from './data/firebase/FirebaseArtisanRepository.js';
import { FirebaseAuthRepository } from './data/firebase/FirebaseAuthRepository.js';
import { FirebaseStorageRepository } from './data/firebase/FirebaseStorageRepository.js';
import { FirebaseReviewRepository } from './data/firebase/FirebaseReviewRepository.js';
import { FirebaseChatRepository } from './data/firebase/FirebaseChatRepository.js';
import { GetArtisansUseCase } from './domain/usecases/GetArtisansUseCase.js';
import { AuthUseCases } from './domain/usecases/AuthUseCases.js';
import { ManageShopUseCases } from './domain/usecases/ManageShopUseCases.js';
import { ReviewUseCases } from './domain/usecases/ReviewUseCases.js';
import { ChatUseCases } from './domain/usecases/ChatUseCases.js';
import { ProfileController } from './presentation/controllers/ProfileController.js';
import { CookieBannerComponent } from './presentation/components/CookieBannerComponent.js';
import { ChatWidgetComponent } from './presentation/components/ChatWidgetComponent.js';
import { setupModalDismissListeners, closeModal } from './core/utils/domUtils.js';
import { injectAllModals } from './presentation/components/ModalsInjector.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { ShopManageController } from './presentation/controllers/ShopManageController.js';
import { UserAccountController } from './presentation/controllers/UserAccountController.js';

import { FirebaseCrmRepository } from './data/firebase/FirebaseCrmRepository.js';
import { CrmUseCases } from './domain/usecases/CrmUseCases.js';
import { SupportController } from './presentation/controllers/SupportController.js';

// Inicialización con Inyección de Dependencias
const artisanRepo = new FirebaseArtisanRepository();
const authRepo = new FirebaseAuthRepository();
const storageRepo = new FirebaseStorageRepository();
const reviewRepo = new FirebaseReviewRepository();
const chatRepo = new FirebaseChatRepository();
const crmRepo = new FirebaseCrmRepository();

const getArtisansUseCase = new GetArtisansUseCase(artisanRepo);
const authUseCases = new AuthUseCases(authRepo, artisanRepo);
const manageShopUseCases = new ManageShopUseCases(artisanRepo, storageRepo);
const reviewUseCases = new ReviewUseCases(reviewRepo);
const chatUseCases = new ChatUseCases(chatRepo);
const crmUseCases = new CrmUseCases(crmRepo, artisanRepo);

const chatWidget = new ChatWidgetComponent(chatUseCases);
window.chatWidgetUI = chatWidget;

// Inyectar todos los modales (Login, Registro, Shop Manage, User Account, Support, Verification, etc.)
injectAllModals();

// Crear controladores de modales
const authController = new AuthController(authUseCases, manageShopUseCases, () => {
  window.location.reload();
});
const shopManageController = new ShopManageController(manageShopUseCases, authUseCases, () => {
  window.location.reload();
});
const userAccountController = new UserAccountController(authUseCases, () => {
  window.location.href = 'index.html';
}, () => {
  window.location.reload();
});
const supportController = new SupportController(crmUseCases, authUseCases);

// Simular window.appUI para que los botones puedan abrir los modales localmente
window.appUI = {
  openLoginModal: () => authController.openLoginModal(),
  openRegisterModal: () => authController.openRegisterModal(),
  openShopManageModal: () => shopManageController.openShopManageModal(),
  openUserAccountModal: () => userAccountController.openUserAccountModal(),
  openSupportModal: (category) => supportController.openSupportModal(category),
  openVerificationModal: () => supportController.openVerificationModal(),
  closeModal: (modalId, force = false) => closeModal(modalId, force)
};

const profileController = new ProfileController(getArtisansUseCase, authUseCases, reviewUseCases, manageShopUseCases, chatWidget);

// Mantener los controladores de modales sincronizados con la sesión
authUseCases.onAuthStateChanged(async (user) => {
  if (userAccountController.setCurrentUser) {
    userAccountController.setCurrentUser(user);
  }
  if (supportController.setCurrentState) {
    supportController.setCurrentState(user, null);
  }
  if (user) {
    // Asignar el usuario inmediatamente para que openShopManageModal sepa que estamos logueados
    if (shopManageController.setCurrentState) {
      shopManageController.setCurrentState(user, null);
    }
    const artisanProfile = await artisanRepo.getArtisanByOwnerId(user.uid);
    if (shopManageController.setCurrentState) {
      shopManageController.setCurrentState(user, artisanProfile);
    }
    if (supportController.setCurrentState) {
      supportController.setCurrentState(user, artisanProfile);
    }
  } else {
    if (shopManageController.setCurrentState) {
      shopManageController.setCurrentState(null, null);
    }
    if (supportController.setCurrentState) {
      supportController.setCurrentState(null, null);
    }
  }
});

const startProfile = () => {
  CookieBannerComponent.init();
  setupModalDismissListeners();
  authController.init();
  shopManageController.init();
  userAccountController.init();
  supportController.init();
  chatWidget.init();
  profileController.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startProfile);
} else {
  startProfile();
}

