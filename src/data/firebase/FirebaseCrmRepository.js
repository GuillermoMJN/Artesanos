import { 
  db, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from '../../config/firebase.config.js';
import { ICrmRepository } from '../../domain/repositories/ICrmRepository.js';
import { VerificationRequest } from '../../domain/models/VerificationRequest.js';
import { SupportTicket } from '../../domain/models/SupportTicket.js';

export class FirebaseCrmRepository extends ICrmRepository {
  static LOCAL_VERIFICATIONS_KEY = 'arteysanos_verifications';
  static LOCAL_TICKETS_KEY = 'arteysanos_support_tickets';

  // --- SOLICITUDES DE VERIFICACIÓN ---

  async createVerificationRequest(data) {
    const newRequest = {
      ...data,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let savedId = `verif_${Date.now()}`;

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "verification_requests"), {
          ...newRequest,
          createdAt: new Date()
        });
        savedId = docRef.id;
      } catch (err) {
        console.warn("Error guardando verificación en Firestore, guardando en local:", err.message);
        this._saveLocalVerification({ id: savedId, ...newRequest });
      }
    } else {
      this._saveLocalVerification({ id: savedId, ...newRequest });
    }

    return new VerificationRequest({ id: savedId, ...newRequest });
  }

  async getVerificationRequests() {
    let requests = [];

    if (db) {
      try {
        let q;
        try {
          q = query(collection(db, "verification_requests"), orderBy("createdAt", "desc"));
        } catch {
          q = collection(db, "verification_requests");
        }
        const snap = await getDocs(q);
        snap.docs.forEach(d => {
          requests.push(new VerificationRequest({ id: d.id, ...d.data() }));
        });
      } catch (e) {
        console.warn("Lectura de verificaciones en Firestore falló, usando local:", e.message);
        requests = this._getLocalVerifications();
      }
    } else {
      requests = this._getLocalVerifications();
    }

    return requests;
  }

  async getVerificationRequestByArtisanId(artisanId) {
    if (!artisanId) return null;
    const all = await this.getVerificationRequests();
    return all.find(v => String(v.artisanId) === String(artisanId)) || null;
  }

  async updateVerificationStatus(requestId, status, artisanDocId = null) {
    const updatedAt = new Date().toISOString();

    if (db && requestId) {
      try {
        const reqRef = doc(db, "verification_requests", requestId);
        await updateDoc(reqRef, {
          status,
          updatedAt: new Date()
        });
      } catch (e) {
        console.warn("No se pudo actualizar verificación en Firestore:", e.message);
      }
    }

    const localList = this._getLocalVerifications();
    const target = localList.find(v => v.id === requestId);
    if (target) {
      target.status = status;
      target.updatedAt = updatedAt;
      localStorage.setItem(FirebaseCrmRepository.LOCAL_VERIFICATIONS_KEY, JSON.stringify(localList));
    }

    return { id: requestId, status, updatedAt };
  }

  // --- TICKETS DE SOPORTE E INCIDENCIAS ---

  async createSupportTicket(data) {
    const newTicket = {
      ...data,
      status: data.status || 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let savedId = `ticket_${Date.now()}`;

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "support_tickets"), {
          ...newTicket,
          createdAt: new Date()
        });
        savedId = docRef.id;
      } catch (err) {
        console.warn("Error guardando ticket en Firestore, guardando local:", err.message);
        this._saveLocalTicket({ id: savedId, ...newTicket });
      }
    } else {
      this._saveLocalTicket({ id: savedId, ...newTicket });
    }

    return new SupportTicket({ id: savedId, ...newTicket });
  }

  async getSupportTickets() {
    let tickets = [];

    if (db) {
      try {
        const snap = await getDocs(collection(db, "support_tickets"));
        snap.docs.forEach(d => {
          tickets.push(new SupportTicket({ id: d.id, ...d.data() }));
        });
      } catch (e) {
        console.warn("Lectura de tickets en Firestore falló, usando local:", e.message);
        tickets = this._getLocalTickets();
      }
    } else {
      tickets = this._getLocalTickets();
    }

    // Ordenar siempre por fecha descendente de forma segura (los más nuevos arriba)
    tickets.sort((a, b) => {
      const getTime = (val) => {
        if (!val) return 0;
        if (val.toMillis && typeof val.toMillis === 'function') return val.toMillis();
        if (val.seconds) return val.seconds * 1000;
        return new Date(val).getTime() || 0;
      };
      return getTime(b.createdAt) - getTime(a.createdAt);
    });

    return tickets;
  }

  async updateSupportTicket(ticketId, { status, adminNotes }) {
    const updatedAt = new Date().toISOString();
    const updatePayload = {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      updatedAt: new Date()
    };

    if (db && ticketId) {
      try {
        const tRef = doc(db, "support_tickets", ticketId);
        await updateDoc(tRef, updatePayload);
      } catch (e) {
        console.warn("No se pudo actualizar ticket en Firestore:", e.message);
      }
    }

    const localList = this._getLocalTickets();
    const target = localList.find(t => t.id === ticketId);
    if (target) {
      if (status) target.status = status;
      if (adminNotes !== undefined) target.adminNotes = adminNotes;
      target.updatedAt = updatedAt;
      localStorage.setItem(FirebaseCrmRepository.LOCAL_TICKETS_KEY, JSON.stringify(localList));
    }

    return { id: ticketId, status, adminNotes, updatedAt };
  }

  // --- MÉTODOS LOCALES AUXILIARES ---

  _getLocalVerifications() {
    try {
      const data = JSON.parse(localStorage.getItem(FirebaseCrmRepository.LOCAL_VERIFICATIONS_KEY) || '[]');
      return data.map(v => new VerificationRequest(v));
    } catch {
      return [];
    }
  }

  _saveLocalVerification(item) {
    const list = this._getLocalVerifications();
    list.unshift(item);
    localStorage.setItem(FirebaseCrmRepository.LOCAL_VERIFICATIONS_KEY, JSON.stringify(list));
  }

  _getLocalTickets() {
    try {
      const data = JSON.parse(localStorage.getItem(FirebaseCrmRepository.LOCAL_TICKETS_KEY) || '[]');
      return data.map(t => new SupportTicket(t));
    } catch {
      return [];
    }
  }

  _saveLocalTicket(item) {
    const list = this._getLocalTickets();
    list.unshift(item);
    localStorage.setItem(FirebaseCrmRepository.LOCAL_TICKETS_KEY, JSON.stringify(list));
  }
}
