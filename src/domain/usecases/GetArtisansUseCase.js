/**
 * Caso de Uso: Obtención y filtrado de artesanos
 */
export class GetArtisansUseCase {
  constructor(artisanRepository) {
    this.artisanRepository = artisanRepository;
  }

  async execute() {
    return await this.artisanRepository.getAllArtisans();
  }

  async getById(id) {
    return await this.artisanRepository.getArtisanById(id);
  }

  filterAndSort(artisans, { category = 'all', location = 'all', query = '', sortBy = 'featured', onlyNew = false }) {
    const cleanQuery = (query || '').trim().toLowerCase();
    const cleanLocation = (location || 'all').trim().toLowerCase();
    const cleanCategory = (category || 'all').toLowerCase();

    let filtered = artisans.filter(item => {
      const itemCategory = (item.category || '').toLowerCase();
      const itemLocation = (item.location || '').toLowerCase();
      const itemName = (item.name || '').toLowerCase();
      const itemTrade = (item.trade || '').toLowerCase();
      const itemDesc = (item.description || '').toLowerCase();

      const matchesCategory = cleanCategory === 'all' || itemCategory === cleanCategory;
      const matchesLocation = cleanLocation === 'all' || itemLocation.includes(cleanLocation);
      const matchesSearch = cleanQuery === '' ||
        itemName.includes(cleanQuery) ||
        itemTrade.includes(cleanQuery) ||
        itemLocation.includes(cleanQuery) ||
        itemDesc.includes(cleanQuery);
      const matchesOnlyNew = !onlyNew || (typeof item.isNew === 'function' && item.isNew());

      return matchesCategory && matchesLocation && matchesSearch && matchesOnlyNew;
    });

    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }

    return filtered;
  }
}
