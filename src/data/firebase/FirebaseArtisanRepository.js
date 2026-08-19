import { 
  db, 
  auth, 
  storage,
  ref,
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  listAll,
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  arrayUnion, 
  arrayRemove, 
  query, 
  where,
  orderBy,
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
import { Artisan } from '../../domain/models/Artisan.js';

export class FirebaseArtisanRepository {
  async uploadProfileImage(file, artisanUid = 'anon') {
    const safeArtisan = (artisanUid || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `avatar_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `artesanos/${safeArtisan}/avatar/${safeFileName}`;

    if (storage) {
      try {
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
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
    let artisans = [];

    if (db) {
      try {
        let querySnapshot;
        try {
          const q = query(collection(db, "artisans"), orderBy("createdAt", "desc"));
          querySnapshot = await getDocs(q);
        } catch (e) {
          const q = query(collection(db, "artisans"));
          querySnapshot = await getDocs(q);
        }

        if (!querySnapshot.empty) {
          for (const docSnap of querySnapshot.docs) {
            const item = docSnap.data();
            let loadedProjects = [];

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
              projects: loadedProjects,
              allowWhatsapp: item.allowWhatsapp !== undefined ? item.allowWhatsapp : true
            }));
          }
        }
      } catch (err) {
        console.warn('Error cargando artesanos desde Firestore:', err.message);
      }
    }

    return artisans;
  }

  async getArtisanById(artisanId) {
    if (!artisanId) return null;

    const all = await this.getAllArtisans();
    const found = all.find(a => String(a.id) === String(artisanId) || (a.docId && String(a.docId) === String(artisanId)));
    if (found) return found;

    if (db) {
      try {
        const docRef = doc(db, "artisans", String(artisanId));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const item = docSnap.data();
          let loadedProjects = [];
          const refList = item.projectRefs || item.projectIds || [];
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
          } else if (item.projects && Array.isArray(item.projects)) {
            loadedProjects = item.projects;
          }

          return new Artisan({
            id: docSnap.id,
            docId: docSnap.id,
            ...item,
            projects: loadedProjects,
            allowWhatsapp: item.allowWhatsapp !== undefined ? item.allowWhatsapp : true
          });
        }
      } catch (err) {
        console.warn("Error buscando artesano por id:", artisanId, err);
      }
    }

    return null;
  }

  async getArtisanByOwnerId(uid) {
    if (!db || !uid) return null;
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

          found = { docId: docSnap.id, id: docSnap.id, ...data, projects: loadedProjects, projectRefs: refList, allowWhatsapp: data.allowWhatsapp !== undefined ? data.allowWhatsapp : true };
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
          allowWhatsapp: newArtisan.allowWhatsapp !== false,
          projectRefs: [],
          createdAt: new Date()
        });
        newArtisan.id = docRef.id;
        newArtisan.docId = docRef.id;
      } catch (err) {
        console.error('Error al guardar artesano en Firestore:', err);
      }
    }
    return newArtisan;
  }

  async updateArtisan(docId, updatedData) {
    if (!db || !docId) return;
    const refDoc = doc(db, "artisans", docId);
    await updateDoc(refDoc, updatedData);
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
    if (!db || !projectId) return;

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
      if (projectId) {
        const projRef = doc(db, "projects", projectId);
        await deleteDoc(projRef);
      }

      // 2. Eliminar la referencia del array 'projectRefs' del documento del artesano
      if (artisanDocId && projectId) {
        const artisanRef = doc(db, "artisans", artisanDocId);
        await updateDoc(artisanRef, {
          projectRefs: arrayRemove(projectId)
        });
      }
    } catch (err) {
      console.error("Error eliminando documento de colección 'projects':", err);
      throw err;
    }
  }

  // --- BORRADO EN CASCADA COMPLETO DEL ARTESANO Y ARCHIVOS ---
  async deleteArtisanCascade(artisanDocId, artisanUid) {
    if (!db && !storage) return;

    console.log(`Iniciando borrado en cascada para artesano ${artisanDocId} (UID: ${artisanUid})`);

    // 1. Eliminar todos los proyectos asociados en 'projects'
    try {
      if (artisanDocId) {
        const projSnap = await getDocs(query(collection(db, "projects")));
        for (const pDoc of projSnap.docs) {
          const pData = pDoc.data();
          if (pData.artisanDocId === artisanDocId) {
            await deleteDoc(doc(db, "projects", pDoc.id)).catch(e => console.warn("Error borrando proyecto:", e));
          }
        }
      }
    } catch (err) {
      console.warn("Error en borrado en cascada de proyectos:", err);
    }

    // 2. Eliminar reseñas asociadas en 'artisan_reviews'
    try {
      if (artisanDocId) {
        const revSnap = await getDocs(query(collection(db, "artisan_reviews")));
        for (const rDoc of revSnap.docs) {
          const rData = rDoc.data();
          if (String(rData.artisanId) === String(artisanDocId) || (artisanUid && rData.userId === artisanUid)) {
            await deleteDoc(doc(db, "artisan_reviews", rDoc.id)).catch(e => console.warn("Error borrando reseña:", e));
          }
        }
      }
    } catch (err) {
      console.warn("Error borrando reseñas asociadas:", err);
    }

    // 3. Eliminar comentarios asociados en 'project_comments'
    try {
      if (artisanDocId) {
        const comSnap = await getDocs(query(collection(db, "project_comments")));
        for (const cDoc of comSnap.docs) {
          const cData = cDoc.data();
          if (String(cData.artisanId) === String(artisanDocId) || (artisanUid && cData.userId === artisanUid)) {
            await deleteDoc(doc(db, "project_comments", cDoc.id)).catch(e => console.warn("Error borrando comentario:", e));
          }
        }
      }
    } catch (err) {
      console.warn("Error borrando comentarios asociados:", err);
    }

    // 4. Eliminar archivos en Firebase Storage bajo 'artesanos/{safeArtisan}/'
    if (storage && artisanUid) {
      try {
        const safeArtisan = artisanUid.replace(/[^a-zA-Z0-9_-]/g, '_');
        await this._deleteStorageFolder(`artesanos/${safeArtisan}`);
      } catch (stErr) {
        console.warn("Error eliminando archivos de Storage:", stErr);
      }
    }

    // 5. Eliminar el documento principal del artesano en 'artisans'
    try {
      if (artisanDocId) {
        await deleteDoc(doc(db, "artisans", artisanDocId));
      }
    } catch (artErr) {
      console.warn("Error eliminando documento de artesano:", artErr);
    }
  }

  async _deleteStorageFolder(folderPath) {
    if (!storage) return;
    try {
      const folderRef = ref(storage, folderPath);
      const res = await listAll(folderRef);

      // Eliminar archivos
      for (const itemRef of res.items) {
        try {
          await deleteObject(itemRef);
        } catch (e) {}
      }

      // Recursividad en subcarpetas
      for (const prefixRef of res.prefixes) {
        await this._deleteStorageFolder(prefixRef.fullPath);
      }
    } catch (e) {
      // Ignorar si la carpeta no existe o no tiene elementos
    }
  }
}

export class FirebaseAuthRepository {
  onAuthChange(callback) {
    if (!auth) return;
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        user.profile = userProfile;
      }
      callback(user);
    });
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
      const artisanRepo = new FirebaseArtisanRepository();
      const existingArtisan = await artisanRepo.getArtisanByOwnerId(user.uid);
      if (!existingArtisan) {
        const artisanName = profile.displayName || user.displayName || 'Taller de Artesanía';
        await artisanRepo.createArtisan({
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

  // --- MÉTODOS DE SEGURIDAD Y GESTIÓN DE CUENTA ---

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
        const artisanRepo = new FirebaseArtisanRepository();
        const artisan = await artisanRepo.getArtisanByOwnerId(user.uid);
        if (artisan && artisan.docId) {
          await artisanRepo.updateArtisan(artisan.docId, { email: newEmail });
        }
      } catch (e) {}
    }
  }

  async updateAvatar(file, artisanDocId = null) {
    if (!auth || !auth.currentUser) throw new Error("No hay una sesión activa");
    const user = auth.currentUser;
    const artisanRepo = new FirebaseArtisanRepository();
    const photoUrl = await artisanRepo.uploadProfileImage(file, user.uid);

    await updateProfile(user, { photoURL: photoUrl });
    await this.saveUserProfile(user.uid, { photoURL: photoUrl });

    if (artisanDocId) {
      await artisanRepo.updateArtisan(artisanDocId, { image: photoUrl });
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
    const artisanRepo = new FirebaseArtisanRepository();
    try {
      const artisan = await artisanRepo.getArtisanByOwnerId(uid);
      if (artisan) {
        await artisanRepo.deleteArtisanCascade(artisan.docId, uid);
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
