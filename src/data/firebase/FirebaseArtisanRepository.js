import { 
  db, 
  auth, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from '../../config/firebase.config.js';
import { Artisan } from '../../domain/models/Artisan.js';
import { initialArtisansSeed } from '../mock/initialArtisansData.js';

export class FirebaseArtisanRepository {
  async getAllArtisans() {
    if (!db) return initialArtisansSeed.map(item => new Artisan(item));

    try {
      const q = query(collection(db, "artisans"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return initialArtisansSeed.map(item => new Artisan(item));
      }

      const artisans = [];
      querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        artisans.push(new Artisan({
          id: docSnap.id,
          ownerId: item.ownerId,
          name: item.name,
          trade: item.trade,
          category: item.category,
          categoryLabel: item.categoryLabel,
          rating: item.rating || 5.0,
          reviewsCount: item.reviewsCount || 12,
          experience: item.experience || 'Artesano verificado',
          location: item.location,
          address: item.address,
          phone: item.phone,
          email: item.email,
          website: item.website,
          image: item.image,
          description: item.description,
          fullStory: item.fullStory,
          hours: item.hours,
          tags: item.tags,
          promo: item.promo,
          gallery: item.gallery
        }));
      });

      // Incluir también los datos semilla para que haya ejemplos visibles en todas las categorías
      const seedArtisans = initialArtisansSeed.map(item => new Artisan(item));
      return [...artisans, ...seedArtisans];
    } catch (err) {
      console.warn('Fallback a datos locales:', err.message);
      return initialArtisansSeed.map(item => new Artisan(item));
    }
  }

  async getArtisanByOwnerId(uid) {
    if (!db) return null;
    try {
      const q = query(collection(db, "artisans"));
      const querySnapshot = await getDocs(q);
      let found = null;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.ownerId === uid) {
          found = { docId: docSnap.id, ...data };
        }
      });
      return found;
    } catch (err) {
      console.error('Error buscando artesano por ownerId:', err);
      return null;
    }
  }

  async createArtisan(artisanData) {
    const newArtisan = new Artisan(artisanData);
    if (db) {
      try {
        const docRef = await addDoc(collection(db, "artisans"), {
          ownerId: newArtisan.ownerId,
          name: newArtisan.name,
          trade: newArtisan.trade,
          category: newArtisan.category,
          categoryLabel: newArtisan.categoryLabel,
          location: newArtisan.location,
          address: newArtisan.address,
          phone: newArtisan.phone,
          email: newArtisan.email,
          website: newArtisan.website,
          description: newArtisan.description,
          fullStory: newArtisan.fullStory,
          image: newArtisan.image,
          createdAt: new Date()
        });
        newArtisan.id = docRef.id;
      } catch (err) {
        console.error('Error al guardar artesano en Firestore:', err);
      }
    }
    return newArtisan;
  }

  async updateArtisan(docId, updatedData) {
    if (!db) return;
    const ref = doc(db, "artisans", docId);
    await updateDoc(ref, updatedData);
  }
}

export class FirebaseAuthRepository {
  onAuthChange(callback) {
    if (!auth) return;
    onAuthStateChanged(auth, callback);
  }

  async signUp(email, password) {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential.user;
  }

  async signIn(email, password) {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  async logout() {
    if (!auth) return;
    await signOut(auth);
  }
}
