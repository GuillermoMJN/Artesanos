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
    isVisitable = false
  }) {
    this.id = id;
    this.docId = docId;
    this.ownerId = ownerId;
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
}
