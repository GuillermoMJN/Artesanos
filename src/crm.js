import { FirebaseCrmRepository } from './data/firebase/FirebaseCrmRepository.js';
import { FirebaseArtisanRepository } from './data/firebase/FirebaseArtisanRepository.js';
import { CrmUseCases } from './domain/usecases/CrmUseCases.js';
import { GetArtisansUseCase } from './domain/usecases/GetArtisansUseCase.js';
import { CrmPageController } from './presentation/controllers/CrmPageController.js';

// Inicialización de Dependencias del CRM
const crmRepo = new FirebaseCrmRepository();
const artisanRepo = new FirebaseArtisanRepository();

const crmUseCases = new CrmUseCases(crmRepo, artisanRepo);
const getArtisansUseCase = new GetArtisansUseCase(artisanRepo);

const crmController = new CrmPageController(crmUseCases, getArtisansUseCase);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => crmController.init());
} else {
  crmController.init();
}
