import { CATEGORY_LABELS, DEFAULT_AVATAR_PATH } from '../../core/utils/constants.js';

/**
 * Entidad de Dominio: Artisan (Artesano)
 * Modela la información de negocio y reglas de un taller o artesano.
 */
export class Artisan {
  constructor({
    id,
    docId = null,
    ownerId = 'anonymous',
    name,
    trade,
    category,
    categoryLabel,
    rating = 5.0,
    reviewsCount = 1,
    experience = 'Artesano verificado',
    location,
    address,
    phone,
    email,
    website = '',
    image,
    description,
    fullStory,
    hours = 'Consultar al artesano',
    tags = ['Artesanal', 'Hecho a mano'],
    promo = null,
    gallery = [],
    projects = [],
    allowWhatsapp = true,
    acceptsCustomOrders = true,
    isVisitable = false,
    createdAt = null
  }) {
    this.id = id;
    this.docId = docId;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.name = name || 'Taller Artesanal';
    this.trade = trade || 'Oficio Artesano';
    this.category = category || 'ceramica';
    this.categoryLabel = categoryLabel || this.getCategoryLabel(this.category);
    this.rating = Number(rating) || 5.0;
    this.reviewsCount = Number(reviewsCount) || 0;
    this.experience = experience || 'Artesano verificado';
    this.location = location || 'España';
    this.address = address || '';
    this.phone = phone || '';
    this.email = email || '';
    this.website = website || '';
    this.image = image || DEFAULT_AVATAR_PATH;
    this.description = description || '';
    this.fullStory = fullStory || description || '';
    this.hours = hours || 'Consultar al artesano';
    this.tags = Array.isArray(tags) ? tags : ['Artesanal', 'Hecho a mano'];
    this.promo = promo || null;
    this.gallery = Array.isArray(gallery) ? gallery : [];
    this.projects = Array.isArray(projects) ? projects : [];
    this.allowWhatsapp = allowWhatsapp !== false;
    this.acceptsCustomOrders = acceptsCustomOrders !== false;
    this.isVisitable = isVisitable === true;
  }

  getCategoryLabel(cat) {
    return CATEGORY_LABELS[cat] || 'Artesanía';
  }

  hasActivePromo() {
    return !!(this.promo && this.promo.active && this.promo.title);
  }

  hasWhatsApp() {
    return this.allowWhatsapp && (this.phone || '').replace(/[^0-9]/g, '').length > 0;
  }

  getCleanPhone() {
    return (this.phone || '').replace(/[^0-9]/g, '');
  }

  isNew() {
    if (!this.createdAt) {
      // Si el id es numérico tradicional (ej: 1, 2, 3...) son los artesanos base fundadores
      // Si es un timestamp numérico largo o string reciente, comprobar
      if (typeof this.id === 'number' && this.id < 100) return false;
      if (typeof this.id === 'string' && /^\d+$/.test(this.id) && Number(this.id) < 100) return false;
      return false;
    }

    try {
      let createdTime = 0;
      if (this.createdAt && typeof this.createdAt.toDate === 'function') {
        createdTime = this.createdAt.toDate().getTime();
      } else if (this.createdAt && this.createdAt.seconds) {
        createdTime = this.createdAt.seconds * 1000;
      } else if (typeof this.createdAt === 'string' || typeof this.createdAt === 'number') {
        createdTime = new Date(this.createdAt).getTime();
      }

      if (!createdTime || isNaN(createdTime)) return false;

      const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000; // 14 días en milisegundos
      const now = Date.now();
      return (now - createdTime) >= 0 && (now - createdTime) <= TWO_WEEKS_MS;
    } catch (e) {
      return false;
    }
  }
}
