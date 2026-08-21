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

const profileController = new ProfileController(getArtisansUseCase, authUseCases, reviewUseCases, manageShopUseCases, chatWidget);

const startProfile = () => {
  CookieBannerComponent.init();
  setupModalDismissListeners();
  chatWidget.init();
  profileController.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startProfile);
} else {
  startProfile();
}

