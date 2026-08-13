import { 
  db, 
  auth, 
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
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
  async uploadFile(file, artisanUid = 'anon', projectUid = 'default') {
    const safeArtisan = (artisanUid || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeProject = (projectUid || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `artesanos/${safeArtisan}/projects/${safeProject}/${safeFileName}`;

    if (storage) {
      try {
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (err) {
        console.warn("Subida Firebase Storage diferida, usando DataURL:", err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
  async getAllArtisans() {
    if (!db) return [];

    try {
      const q = query(collection(db, "artisans"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const artisans = [];
      for (const docSnap of querySnapshot.docs) {
        const item = docSnap.data();
        let loadedProjects = [];

        // Si el documento del artesano contiene array de referencias a proyectos (projectRefs o projectIds)
        const refList = item.projectRefs || item.projectIds || [];
        if (Array.isArray(refList) && refList.length > 0) {
          for (const projId of refList) {
            try {
              const pRef = doc(db, "projects", projId);
              const pSnap = await getDoc(pRef);
              if (pSnap.exists()) {
                loadedProjects.push({ id: pSnap.id, ...pSnap.data() });
              }
            } catch (pErr) {
              console.warn("Error leyendo proyecto referenciado:", projId, pErr);
            }
          }
        } else if (item.projects && Array.isArray(item.projects)) {
          // Soporte de compatibilidad
          loadedProjects = item.projects;
        }

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
          gallery: item.gallery,
          projectRefs: refList,
          projects: loadedProjects
        }));
      }

      return artisans;
    } catch (err) {
      console.warn('Error cargando artesanos desde Firestore:', err.message);
      return [];
    }
  }

  async getArtisanByOwnerId(uid) {
    if (!db) return null;
    try {
      const q = query(collection(db, "artisans"));
      const querySnapshot = await getDocs(q);
      let found = null;

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (data.ownerId === uid) {
          let loadedProjects = [];
          const refList = data.projectRefs || data.projectIds || [];

          if (Array.isArray(refList) && refList.length > 0) {
            for (const projId of refList) {
              try {
                const pRef = doc(db, "projects", projId);
                const pSnap = await getDoc(pRef);
                if (pSnap.exists()) {
                  loadedProjects.push({ id: pSnap.id, ...pSnap.data() });
                }
              } catch (e) {}
            }
          } else if (data.projects && Array.isArray(data.projects)) {
            loadedProjects = data.projects;
          }

          found = { docId: docSnap.id, ...data, projects: loadedProjects, projectRefs: refList };
          break;
        }
      }

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
          projectRefs: [],
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

  // --- MÉTODOS PARA LA COLECCIÓN INDEPENDIENTE 'projects' ---

  async createProject(artisanDocId, projectData) {
    if (!db) return null;

    try {
      // 1. Crear documento en la colección independiente 'projects'
      const projDocRef = await addDoc(collection(db, "projects"), {
        artisanDocId: artisanDocId,
        title: projectData.title,
        desc: projectData.desc || '',
        category: projectData.category || 'Artesanía',
        date: projectData.date || 'Reciente',
        mainImage: projectData.mainImage || '',
        steps: projectData.steps || [],
        createdAt: new Date()
      });

      const newProjectId = projDocRef.id;

      // 2. Añadir la referencia (ID) del proyecto al array 'projectRefs' en el documento del artesano
      const artisanRef = doc(db, "artisans", artisanDocId);
      await updateDoc(artisanRef, {
        projectRefs: arrayUnion(newProjectId)
      });

      return { id: newProjectId, ...projectData };
    } catch (err) {
      console.error("Error creando documento en colección 'projects':", err);
      throw err;
    }
  }

  async updateProject(projectId, projectData) {
    if (!db) return;

    try {
      const projRef = doc(db, "projects", projectId);
      await updateDoc(projRef, {
        title: projectData.title,
        desc: projectData.desc || '',
        category: projectData.category || 'Artesanía',
        mainImage: projectData.mainImage || '',
        steps: projectData.steps || [],
        updatedAt: new Date()
      });
    } catch (err) {
      console.error("Error actualizando documento en colección 'projects':", err);
      throw err;
    }
  }

  async deleteProject(artisanDocId, projectId) {
    if (!db) return;

    try {
      // 1. Eliminar el documento de la colección 'projects'
      const projRef = doc(db, "projects", projectId);
      await deleteDoc(projRef);

      // 2. Eliminar la referencia del array 'projectRefs' del documento del artesano
      const artisanRef = doc(db, "artisans", artisanDocId);
      await updateDoc(artisanRef, {
        projectRefs: arrayRemove(projectId)
      });
    } catch (err) {
      console.error("Error eliminando documento de colección 'projects':", err);
      throw err;
    }
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
