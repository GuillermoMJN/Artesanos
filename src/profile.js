import { FirebaseArtisanRepository } from './data/firebase/FirebaseArtisanRepository.js';
import { FirebaseAuthRepository } from './data/firebase/FirebaseAuthRepository.js';
import { FirebaseStorageRepository } from './data/firebase/FirebaseStorageRepository.js';
import { FirebaseReviewRepository } from './data/firebase/FirebaseReviewRepository.js';
import { GetArtisansUseCase } from './domain/usecases/GetArtisansUseCase.js';
import { AuthUseCases } from './domain/usecases/AuthUseCases.js';
import { ManageShopUseCases } from './domain/usecases/ManageShopUseCases.js';
import { ReviewUseCases } from './domain/usecases/ReviewUseCases.js';
import { ProfileController } from './presentation/controllers/ProfileController.js';
import { CookieBannerComponent } from './presentation/components/CookieBannerComponent.js';

// Inicialización con Inyección de Dependencias
const artisanRepo = new FirebaseArtisanRepository();
const authRepo = new FirebaseAuthRepository();
const storageRepo = new FirebaseStorageRepository();
const reviewRepo = new FirebaseReviewRepository();

const getArtisansUseCase = new GetArtisansUseCase(artisanRepo);
const authUseCases = new AuthUseCases(authRepo, artisanRepo);
const manageShopUseCases = new ManageShopUseCases(artisanRepo, storageRepo);
const reviewUseCases = new ReviewUseCases(reviewRepo);

const profileController = new ProfileController(getArtisansUseCase, authUseCases, reviewUseCases, manageShopUseCases);

const startProfile = () => {
  CookieBannerComponent.init();
  profileController.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startProfile);
} else {
  startProfile();
}

