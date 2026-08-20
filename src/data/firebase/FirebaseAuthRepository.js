import { 
  auth, 
  db,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updatePassword,
  updateEmail,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup
} from '../../config/firebase.config.js';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';
import { FirebaseArtisanRepository } from './FirebaseArtisanRepository.js';
import { FirebaseStorageRepository } from './FirebaseStorageRepository.js';

/**
 * Repositorio de Autenticación y Cuentas con Firebase Auth y Firestore
 */
export class FirebaseAuthRepository extends IAuthRepository {
  constructor() {
    super();
    this.artisanRepo = new FirebaseArtisanRepository();
    this.storageRepo = new FirebaseStorageRepository();
  }

  onAuthChange(callback) {
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        user.profile = userProfile;
      }
      callback(user);
    });
  }

  async getCurrentUser() {
    if (!auth || !auth.currentUser) return null;
    const user = auth.currentUser;
    user.profile = await this.getUserProfile(user.uid);
    return user;
  }

  async getUserProfile(uid) {
    if (!uid) return null;
    if (db) {
      try {
        const uSnap = await getDoc(doc(db, "users", uid));
        if (uSnap.exists()) {
          return uSnap.data();
        }
      } catch (e) {
        console.warn("No se pudo leer perfil en Firestore:", e.message);
      }
    }
    try {
      const localUsers = JSON.parse(localStorage.getItem('arteysanos_users') || '{}');
      return localUsers[uid] || null;
    } catch {
      return null;
    }
  }

  async saveUserProfile(uid, data) {
    if (!uid) return;
    if (db) {
      try {
        const uRef = doc(db, "users", uid);
        await updateDoc(uRef, { ...data, updatedAt: new Date() }).catch(async () => {
          await setDoc(uRef, { ...data, createdAt: new Date() });
        });
      } catch (e) {
        console.warn("Guardado de usuario en Firestore diferido:", e.message);
      }
    }
    try {
      const localUsers = JSON.parse(localStorage.getItem('arteysanos_users') || '{}');
      localUsers[uid] = { ...(localUsers[uid] || {}), ...data };
      localStorage.setItem('arteysanos_users', JSON.stringify(localUsers));
    } catch (e) {
      console.error(e);
    }
  }

  async signUp(email, password, displayName = '', role = 'artisan') {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    const profileData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || (role === 'artisan' ? 'Artesano' : 'Usuario'),
      role: role,
      createdAt: new Date().toISOString()
    };

    await this.saveUserProfile(user.uid, profileData);
    user.profile = profileData;

    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.warn("No se pudo enviar email de verificación:", e.message);
    }

    return user;
  }

  async signIn(email, password) {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    user.profile = await this.getUserProfile(user.uid);
    return user;
  }

  async signInWithGoogle(intendedRole = 'client') {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar si ya existe perfil del usuario
    let profile = await this.getUserProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || (intendedRole === 'artisan' ? 'Artesano' : 'Usuario'),
        photoURL: user.photoURL || '',
        role: intendedRole,
        createdAt: new Date().toISOString()
      };
      await this.saveUserProfile(user.uid, profile);
    }

    user.profile = profile;

    // Si es artesano y no tiene ficha de tienda aún, crearla automáticamente
    if (profile.role === 'artisan') {
      const existingArtisan = await this.artisanRepo.getArtisanByOwnerId(user.uid);
      if (!existingArtisan) {
        const artisanName = profile.displayName || user.displayName || 'Taller de Artesanía';
        await this.artisanRepo.createArtisan({
          id: Date.now(),
          ownerId: user.uid,
          name: artisanName,
          trade: 'Artesanía & Oficios',
          category: 'ceramica',
          categoryLabel: 'Cerámica & Barro',
          location: 'España',
          address: 'Taller Artesanal',
          phone: '',
          email: user.email || '',
          website: '',
          description: 'Taller artesanal en Arte y Sanos. Pulsa en "Gestionar mi tienda" para personalizar tu historia, oficio y catálogo.',
          image: profile.photoURL || user.photoURL || 'images/default_avatar.svg',
          acceptsCustomOrders: true,
          isVisitable: false
        });
      }
    }

    return user;
  }

  async logout() {
    if (!auth) return;
    await signOut(auth);
  }

  async changePassword(currentPassword, newPassword) {
    if (!auth || !auth.currentUser) throw new Error("No hay una sesión activa");
    if (!currentPassword) throw new Error("Debes indicar tu contraseña actual");
    if (!newPassword || newPassword.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres");

    // 1. Reautenticación por seguridad
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 2. Actualizar contraseña
    await updatePassword(user, newPassword);
  }

  async changeEmail(currentPassword, newEmail) {
    if (!auth || !auth.currentUser) throw new Error("No hay una sesión activa");
    if (!currentPassword) throw new Error("Debes indicar tu contraseña actual");
    if (!newEmail || !newEmail.includes('@')) throw new Error("Correo electrónico no válido");

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Actualizar en Firebase Auth
    await updateEmail(user, newEmail);

    // Actualizar en Firestore users
    await this.saveUserProfile(user.uid, { email: newEmail });

    // Actualizar en artisans si aplica
    if (db) {
      try {
        const artisan = await this.artisanRepo.getArtisanByOwnerId(user.uid);
        if (artisan && artisan.docId) {
          await this.artisanRepo.updateArtisan(artisan.docId, { email: newEmail });
        }
      } catch (e) {}
    }
  }

  async updateAvatar(file, artisanDocId = null) {
    if (!auth || !auth.currentUser) throw new Error("No hay una sesión activa");
    const user = auth.currentUser;
    const photoUrl = await this.storageRepo.uploadProfileImage(file, user.uid);

    await updateProfile(user, { photoURL: photoUrl });
    await this.saveUserProfile(user.uid, { photoURL: photoUrl });

    if (artisanDocId) {
      await this.artisanRepo.updateArtisan(artisanDocId, { image: photoUrl });
    }

    return photoUrl;
  }

  async updateDisplayName(displayName) {
    if (!auth || !auth.currentUser) throw new Error("No hay una sesión activa");
    const user = auth.currentUser;
    const cleanName = (displayName || '').trim();
    if (!cleanName) throw new Error("El nombre no puede estar vacío");

    await updateProfile(user, { displayName: cleanName });
    await this.saveUserProfile(user.uid, { displayName: cleanName });
    if (user.profile) user.profile.displayName = cleanName;
    return cleanName;
  }

  async deleteAccountCascade(currentPassword = null) {
    if (!auth || !auth.currentUser) throw new Error("No hay una sesión activa");
    const user = auth.currentUser;
    const uid = user.uid;
    const isGoogleAuth = user.providerData && user.providerData.some(p => p.providerId === 'google.com');

    // 1. Reautenticación de seguridad en Firebase Auth
    if (isGoogleAuth) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await reauthenticateWithPopup(user, provider);
    } else {
      if (!currentPassword) throw new Error("Debes ingresar tu contraseña actual para confirmar la eliminación de la cuenta");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    }

    // 2. Localizar y borrar artesano, proyectos, reseñas, comentarios y archivos en Storage
    try {
      const artisan = await this.artisanRepo.getArtisanByOwnerId(uid);
      if (artisan) {
        await this.artisanRepo.deleteArtisanCascade(artisan.docId, uid);
      }
    } catch (artErr) {
      console.warn("Error en borrado en cascada de artesano:", artErr);
    }

    // 3. Borrar perfil en colección 'users'
    if (db) {
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (uErr) {
        console.warn("Error borrando perfil de usuario en users:", uErr);
      }
    }

    // 4. Limpiar datos locales
    try {
      const localUsers = JSON.parse(localStorage.getItem('arteysanos_users') || '{}');
      delete localUsers[uid];
      localStorage.setItem('arteysanos_users', JSON.stringify(localUsers));
    } catch (e) {}

    // 5. Eliminar la cuenta del usuario en Firebase Authentication
    await deleteUser(user);
  }
}
