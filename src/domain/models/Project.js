/**
 * Entidad de Dominio: Project (Obra o Proyecto del Catálogo de un Artesano)
 */
export class Project {
  constructor({
    id,
    title = 'Trabajo Artesanal',
    category = 'Artesanía',
    date = 'Publicación reciente',
    price = '',
    materials = '',
    timeSpent = '',
    desc = '',
    mainImage = '',
    steps = []
  }) {
    this.id = id || `proj_${Date.now()}`;
    this.title = title;
    this.category = category;
    this.date = date;
    this.price = price;
    this.materials = materials;
    this.timeSpent = timeSpent;
    this.desc = desc;
    this.mainImage = mainImage;
    this.steps = Array.isArray(steps) ? steps : [];
  }

  hasPrice() {
    return !!(this.price && this.price.trim().length > 0);
  }

  hasTechSheet() {
    return this.hasPrice() || !!(this.materials && this.materials.trim().length > 0) || !!(this.timeSpent && this.timeSpent.trim().length > 0);
  }
}
