import { 
  db, 
  storage,
  ref,
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
  query,
  where,
  limit,
  orderBy
} from '../../config/firebase.config.js';
import { Artisan } from '../../domain/models/Artisan.js';
import { IArtisanRepository } from '../../domain/repositories/IArtisanRepository.js';
import { FirebaseStorageRepository } from './FirebaseStorageRepository.js';

export class FirebaseArtisanRepository extends IArtisanRepository {
  constructor() {
    super();
    this.storageRepo = new FirebaseStorageRepository();
  }

  async uploadProfileImage(file, artisanUid = 'anon') {
    return await this.storageRepo.uploadProfileImage(file, artisanUid);
  }

  async uploadFile(file, artisanUid = 'anon', projectUid = 'default') {
    return await this.storageRepo.uploadFile(file, artisanUid, projectUid);
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

        querySnapshot.forEach((docSnapshot) => {
          artisans.push(new Artisan({ docId: docSnapshot.id, ...docSnapshot.data() }));
        });
      } catch (err) {
        console.warn("Lectura de Firestore no disponible, usando almacenamiento local:", err.message);
        artisans = this._getLocalArtisans();
      }
    } else {
      artisans = this._getLocalArtisans();
    }

    if (artisans.length === 0) {
      artisans = this._getLocalArtisans();
    }

    return artisans;
  }

  async getArtisanById(id) {
    if (!id) return null;
    const strId = String(id).trim();

    // 1. Comprobar primero en caché local para respuesta rápida
    const localArtisans = this._getLocalArtisans();
    const localFound = localArtisans.find(a => String(a.docId) === strId || String(a.id) === strId);

    if (db) {
      try {
        // Intento 1: por document ID directo de Firestore (la forma más rápida)
        const docRef = doc(db, "artisans", strId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const art = new Artisan({ docId: docSnap.id, ...docSnap.data() });
          this._updateLocalArtisan(docSnap.id, art);
          return art;
        }
      } catch (err) {
        console.warn("Búsqueda por docId falló:", err.message);
      }

      try {
        // Intento 2: buscar por campo 'id' numérico
        const numId = Number(strId);
        if (!isNaN(numId)) {
          const q = query(collection(db, "artisans"), where("id", "==", numId), limit(1));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const d = qSnap.docs[0];
            const art = new Artisan({ docId: d.id, ...d.data() });
            this._updateLocalArtisan(d.id, art);
            return art;
          }
        }
      } catch (err) {
        console.warn("Búsqueda por campo id numérico falló:", err.message);
      }

      try {
        // Intento 3: buscar por campo 'id' como string
        const qStr = query(collection(db, "artisans"), where("id", "==", strId), limit(1));
        const qStrSnap = await getDocs(qStr);
        if (!qStrSnap.empty) {
          const d = qStrSnap.docs[0];
          const art = new Artisan({ docId: d.id, ...d.data() });
          this._updateLocalArtisan(d.id, art);
          return art;
        }
      } catch (err) {
        console.warn("Búsqueda por campo id string falló:", err.message);
      }

      try {
        // Último recurso: recorrer todos (solo si todo lo anterior falla)
        const allSnap = await getDocs(collection(db, "artisans"));
        for (const d of allSnap.docs) {
          const data = d.data();
          if (d.id === strId || String(data.id) === strId) {
            const art = new Artisan({ docId: d.id, ...data });
            this._updateLocalArtisan(d.id, art);
            return art;
          }
        }
      } catch (err) {
        console.warn("Búsqueda completa en colección falló:", err.message);
      }
    }

    return localFound ? new Artisan(localFound) : null;
  }

  async getArtisanByOwnerId(ownerId) {
    if (!ownerId) return null;

    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, "artisans"));
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          if (data.ownerId === ownerId) {
            return new Artisan({ docId: docSnapshot.id, ...data });
          }
        }
      } catch (err) {
        console.warn("Error buscando por ownerId en Firestore:", err.message);
      }
    }

    const localArtisans = this._getLocalArtisans();
    const found = localArtisans.find(a => a.ownerId === ownerId);
    return found ? new Artisan(found) : null;
  }

  async createArtisan(artisanData) {
    let savedArtisan = { ...artisanData, createdAt: new Date().toISOString() };

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "artisans"), {
          ...savedArtisan,
          createdAt: new Date()
        });
        savedArtisan.docId = docRef.id;
      } catch (err) {
        console.warn("No se pudo guardar en Firestore, guardando en local:", err.message);
      }
    }

    this._saveLocalArtisan(savedArtisan);
    return new Artisan(savedArtisan);
  }

  async updateArtisan(docId, updatedData) {
    if (db && docId) {
      try {
        const artisanRef = doc(db, "artisans", docId);
        await updateDoc(artisanRef, {
          ...updatedData,
          updatedAt: new Date()
        });
      } catch (err) {
        console.warn("No se pudo actualizar en Firestore, actualizando local:", err.message);
      }
    }

    this._updateLocalArtisan(docId, updatedData);
    return true;
  }

  async deleteArtisan(docId) {
    if (db && docId) {
      try {
        await deleteDoc(doc(db, "artisans", docId));
      } catch (err) {
        console.warn("Error borrando de Firestore:", err.message);
      }
    }
    this._deleteLocalArtisan(docId);
    return true;
  }

  async createProject(artisanDocId, projectData) {
    const projectWithMeta = {
      ...projectData,
      id: `proj_${Date.now()}`,
      artisanDocId: artisanDocId || null,
      createdAt: new Date().toISOString()
    };

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "projects"), {
          ...projectWithMeta,
          createdAt: new Date()
        });
        projectWithMeta.id = docRef.id;
      } catch (err) {
        console.warn("No se pudo crear en colección 'projects', guardando en array del artesano:", err.message);
      }

      if (artisanDocId) {
        try {
          const artisanSnap = await getDoc(doc(db, "artisans", artisanDocId));
          if (artisanSnap.exists()) {
            const artData = artisanSnap.data();
            const projects = artData.projects || [];
            projects.unshift(projectWithMeta);
            await updateDoc(doc(db, "artisans", artisanDocId), { projects });
          }
        } catch (err) {
          console.warn("Error actualizando array 'projects' del artesano en Firestore:", err.message);
        }
      }
    }

    return projectWithMeta;
  }

  async updateProject(projectId, projectData) {
    if (db && projectId) {
      try {
        const projRef = doc(db, "projects", projectId);
        await updateDoc(projRef, {
          ...projectData,
          updatedAt: new Date()
        });
      } catch (err) {
        console.warn("No se pudo actualizar proyecto en Firestore 'projects':", err.message);
      }
    }
    return projectData;
  }

  async deleteProject(artisanDocId, projectId) {
    if (!projectId) return;

    if (db) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
      } catch (err) {
        console.warn("Error borrando proyecto de colección 'projects':", err.message);
      }

      if (artisanDocId) {
        try {
          const artisanRef = doc(db, "artisans", artisanDocId);
          const snap = await getDoc(artisanRef);
          if (snap.exists()) {
            const data = snap.data();
            const filteredProjects = (data.projects || []).filter(p => p.id !== projectId);
            await updateDoc(artisanRef, { projects: filteredProjects });
          }
        } catch (err) {
          console.warn("Error eliminando proyecto del array del artesano:", err.message);
        }
      }
    }
  }

  async deleteArtisanCascade(artisanDocId, artisanUid) {
    if (!db && !storage) return;

    // 1. Eliminar proyectos asociados en 'projects'
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

      for (const itemRef of res.items) {
        try {
          await deleteObject(itemRef);
        } catch (e) {}
      }

      for (const prefixRef of res.prefixes) {
        await this._deleteStorageFolder(prefixRef.fullPath);
      }
    } catch (e) {
      // Silenciar si no existe
    }
  }

  // --- Fallback en LocalStorage ---
  _getLocalArtisans() {
    try {
      const data = localStorage.getItem('arteysanos_artisans');
      return data ? JSON.parse(data).map(a => new Artisan(a)) : [];
    } catch {
      return [];
    }
  }

  _saveLocalArtisan(artisan) {
    const list = this._getLocalArtisans();
    list.unshift(artisan);
    localStorage.setItem('arteysanos_artisans', JSON.stringify(list));
  }

  _updateLocalArtisan(docIdOrId, updatedData) {
    const list = this._getLocalArtisans();
    const idx = list.findIndex(a => a.docId === docIdOrId || String(a.id) === String(docIdOrId));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedData };
      localStorage.setItem('arteysanos_artisans', JSON.stringify(list));
    }
  }

  _deleteLocalArtisan(docIdOrId) {
    const list = this._getLocalArtisans();
    const filtered = list.filter(a => a.docId !== docIdOrId && String(a.id) !== String(docIdOrId));
    localStorage.setItem('arteysanos_artisans', JSON.stringify(filtered));
  }
}

// Re-exportar FirebaseAuthRepository para compatibilidad retroactiva
export { FirebaseAuthRepository } from './FirebaseAuthRepository.js';
