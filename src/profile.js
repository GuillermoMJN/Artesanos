import { FirebaseArtisanRepository } from './data/firebase/FirebaseArtisanRepository.js';
import { FirebaseAuthRepository } from './data/firebase/FirebaseAuthRepository.js';
import { FirebaseReviewRepository } from './data/firebase/FirebaseReviewRepository.js';
import { GetArtisansUseCase } from './domain/usecases/GetArtisansUseCase.js';
import { AuthUseCases } from './domain/usecases/AuthUseCases.js';
import { ReviewUseCases } from './domain/usecases/ReviewUseCases.js';
import { ProfileController } from './presentation/controllers/ProfileController.js';

// Inicialización con Inyección de Dependencias
const artisanRepo = new FirebaseArtisanRepository();
const authRepo = new FirebaseAuthRepository();
const reviewRepo = new FirebaseReviewRepository();

const getArtisansUseCase = new GetArtisansUseCase(artisanRepo);
const authUseCases = new AuthUseCases(authRepo, artisanRepo);
const reviewUseCases = new ReviewUseCases(reviewRepo);

const profileController = new ProfileController(getArtisansUseCase, authUseCases, reviewUseCases);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => profileController.init());
} else {
  profileController.init();
}
