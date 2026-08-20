import { 
  storage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from '../../config/firebase.config.js';
import { IStorageRepository } from '../../domain/repositories/IStorageRepository.js';

/**
 * Repositorio de Almacenamiento en Firebase Storage
 */
export class FirebaseStorageRepository extends IStorageRepository {
  async uploadProfileImage(file, artisanUid = 'anon') {
    const safeArtisan = (artisanUid || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `avatar_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `artesanos/${safeArtisan}/avatar/${safeFileName}`;

    if (storage) {
      try {
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn("Subida de avatar a Firebase Storage diferida, usando DataURL:", err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  async uploadFile(file, artisanUid = 'anon', projectUid = 'default') {
    const safeArtisan = (artisanUid || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeProject = (projectUid || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `artesanos/${safeArtisan}/projects/${safeProject}/${safeFileName}`;

    if (storage) {
      try {
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn("Subida a Firebase Storage diferida, usando DataURL:", err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
}
