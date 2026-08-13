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
    gallery = []
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
  }

  getCategoryLabel(cat) {
    const labels = {
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
    const images = {
      ceramica: 'images/ceramics_artisan_1786534790567.png',
      tejido: 'images/textile_artisan_1786534801221.png',
      herreria: 'images/blacksmith_artisan_1786534811595.png',
      tatuaje: 'images/tattoo_artisan_1786534822293.png',
      comida: 'images/bakery_artisan_1786534832288.png'
    };
    return images[cat] || 'images/ceramics_artisan_1786534790567.png';
  }
}
