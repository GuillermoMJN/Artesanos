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
import { setupModalDismissListeners } from './core/utils/domUtils.js';
import { injectAuthModals } from './presentation/components/AuthModalsInjector.js';
import { AuthController } from './presentation/controllers/AuthController.js';

// Inicialización con Inyección de Dependencias
const artisanRepo = new FirebaseArtisanRepository();
const authRepo = new FirebaseAuthRepository();
const storageRepo = new FirebaseStorageRepository();
const reviewRepo = new FirebaseReviewRepository();
const chatRepo = new FirebaseChatRepository();

const getArtisansUseCase = new GetArtisansUseCase(artisanRepo);
const authUseCases = new AuthUseCases(authRepo, artisanRepo);
const manageShopUseCases = new ManageShopUseCases(artisanRepo, storageRepo);
const reviewUseCases = new ReviewUseCases(reviewRepo);
const chatUseCases = new ChatUseCases(chatRepo);

const chatWidget = new ChatWidgetComponent(chatUseCases);
window.chatWidgetUI = chatWidget;

// Inyectar modales de auth (Login y Registro) dinámicamente
injectAuthModals();

// Crear controlador de auth
const authController = new AuthController(authUseCases, manageShopUseCases, () => {
  // Cuando inicie sesión, recargamos la página para actualizar la UI del perfil
  window.location.reload();
});

// Simular window.appUI para que ChatWidgetComponent y otros botones puedan abrir el login modal
window.appUI = {
  openLoginModal: () => authController.openLoginModal(),
  openRegisterModal: () => authController.openRegisterModal(),
  closeModal: (modalId) => {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('open');
  }
};

const profileController = new ProfileController(getArtisansUseCase, authUseCases, reviewUseCases, manageShopUseCases, chatWidget);

const startProfile = () => {
  CookieBannerComponent.init();
  setupModalDismissListeners();
  authController.init();
  chatWidget.init();
  profileController.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startProfile);
} else {
  startProfile();
}

