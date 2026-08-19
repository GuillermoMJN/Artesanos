/**
 * Entidad de Dominio: Artisan (Artesano)
 * Define la estructura y lógica de negocio pura del artesano.
 */
export class Artisan {
  constructor({
    id,
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
    projects = [],
    allowWhatsapp = true,
    acceptsCustomOrders = true,
    isVisitable = false
  }) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.trade = trade;
    this.category = category;
    this.categoryLabel = categoryLabel || this.getCategoryLabel(category);
    this.rating = rating;
    this.reviewsCount = reviewsCount;
    this.experience = experience;
    this.location = location;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.image = image || this.getDefaultImage(category);
    this.description = description;
    this.fullStory = fullStory || description;
    this.hours = hours;
    this.tags = tags;
    this.promo = promo;
    this.gallery = gallery;
    this.projects = projects;
    this.allowWhatsapp = allowWhatsapp !== undefined ? allowWhatsapp : true;
    this.acceptsCustomOrders = acceptsCustomOrders !== undefined ? acceptsCustomOrders : true;
    this.isVisitable = isVisitable !== undefined ? isVisitable : false;
  }

  getCategoryLabel(cat) {
    const labels = {
      pintura: 'Pintura & Ilustración',
      escultura: 'Escultura & Modelado',
      ceramica: 'Cerámica & Barro',
      tejido: 'Textil & Telar',
      herreria: 'Herrería & Forja',
      madera: 'Ebanistería & Madera',
      cuero: 'Marroquinería & Cuero',
      joyeria: 'Joyería & Orfebrería',
      tatuaje: 'Tatuaje Artístico',
      comida: 'Comida & Obrador'
    };
    return labels[cat] || 'Artesanía';
  }

  getDefaultImage(cat) {
    return 'images/default_avatar.svg';
  }
}
