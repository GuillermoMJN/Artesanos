import { APP_CATEGORIES } from '../../core/utils/constants.js';
import { ArtisanCardComponent } from '../components/ArtisanCardComponent.js';

/**
 * Controlador de la Vista de Directorio y Exploración de Artesanos
 */
export class DirectoryController {
  constructor(getArtisansUseCase) {
    this.getArtisansUseCase = getArtisansUseCase;
    this.artisans = [];
    this.activeCategory = 'all';
    this.selectedLocation = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';
  }

  async init() {
    await this.loadArtisans();
    this.setupListeners();
  }

  async loadArtisans() {
    this.artisans = await this.getArtisansUseCase.execute();
    this.updateStatsCount();
    this.renderLocationFilterOptions();
    this.renderCategories();
    this.renderArtisans();
  }

  setupListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderArtisans();
      });
    }

    const sortBySelect = document.getElementById('sortBySelect');
    if (sortBySelect) {
      sortBySelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderArtisans();
      });
    }

    const locationSelect = document.getElementById('locationFilterSelect');
    if (locationSelect) {
      locationSelect.addEventListener('change', (e) => {
        this.filterByLocation(e.target.value);
      });
    }
  }

  updateStatsCount() {
    const el = document.getElementById('statArtisansCount');
    if (el) {
      el.textContent = `${this.artisans.length}`;
    }
  }

  renderCategories() {
    const categoryContainer = document.getElementById('categoryGrid');
    if (!categoryContainer) return;

    categoryContainer.innerHTML = APP_CATEGORIES.map(cat => {
      const count = cat.id === 'all'
        ? this.artisans.length
        : this.artisans.filter(a => a.category === cat.id).length;

      return `
        <div class="category-card ${this.activeCategory === cat.id ? 'active' : ''}" onclick="window.appUI.filterByCategory('${cat.id}')">
          <div class="category-icon"><i class="${cat.icon}"></i></div>
          <div class="category-name">${cat.name}</div>
          <div class="category-count">${count} artesanos</div>
        </div>
      `;
    }).join('');
  }

  filterByCategory(catId) {
    this.activeCategory = catId;
    this.renderCategories();
    this.renderArtisans();

    const directorySection = document.getElementById('directorio');
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  renderLocationFilterOptions() {
    const select = document.getElementById('locationFilterSelect');
    if (!select) return;

    const currentVal = this.selectedLocation || 'all';
    const locationsSet = new Set();

    this.artisans.forEach(a => {
      if (a.location && a.location.trim()) {
        locationsSet.add(a.location.trim());
      }
    });

    const sortedLocations = Array.from(locationsSet).sort((a, b) => a.localeCompare(b, 'es'));

    let html = `<option value="all" ${currentVal === 'all' ? 'selected' : ''}>Todas las ubicaciones (${this.artisans.length})</option>`;
    sortedLocations.forEach(loc => {
      const count = this.artisans.filter(a => a.location && a.location.trim().toLowerCase() === loc.toLowerCase()).length;
      html += `<option value="${loc}" ${currentVal === loc ? 'selected' : ''}>${loc} (${count})</option>`;
    });

    select.innerHTML = html;
  }

  filterByLocation(loc) {
    this.selectedLocation = loc || 'all';
    this.renderArtisans();
  }

  renderArtisans() {
    const directoryGrid = document.getElementById('directoryGrid');
    const resultsCounter = document.getElementById('resultsCount');
    if (!directoryGrid) return;

    const filtered = this.getArtisansUseCase.filterAndSort(this.artisans, {
      category: this.activeCategory,
      location: this.selectedLocation,
      query: this.searchQuery,
      sortBy: this.sortBy
    });

    if (resultsCounter) {
      resultsCounter.textContent = `Mostrando ${filtered.length} artesano(s)`;
    }

    if (filtered.length === 0) {
      directoryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="fa-solid fa-compass" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3 style="margin-bottom: 0.5rem; color: var(--primary-dark);">No encontramos artesanos con esa búsqueda o ubicación</h3>
          <p style="color: var(--text-secondary);">Prueba con otra palabra clave, cambia de ubicación o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    directoryGrid.innerHTML = filtered.map(artisan => ArtisanCardComponent.render(artisan)).join('');
  }
}
