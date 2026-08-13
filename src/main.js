import { FirebaseArtisanRepository, FirebaseAuthRepository } from './data/firebase/FirebaseArtisanRepository.js';
import { ArtisanCardComponent } from './presentation/components/ArtisanCardComponent.js';
import { ToastComponent } from './presentation/components/ToastComponent.js';

class AppController {
  constructor() {
    this.artisanRepo = new FirebaseArtisanRepository();
    this.authRepo = new FirebaseAuthRepository();
    this.artisans = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';
    this.currentUser = null;
    this.currentArtisanProfile = null;
  }

  async init() {
    this.playFirstTimeIntro();
    this.artisans = await this.artisanRepo.getAllArtisans();
    this.renderCategories();
    this.renderArtisans();
    this.setupEventListeners();
    this.setupHeaderScroll();

    this.authRepo.onAuthChange(async (user) => {
      this.currentUser = user;
      this.updateAuthUI(user);
      if (user) {
        this.currentArtisanProfile = await this.artisanRepo.getArtisanByOwnerId(user.uid);
      } else {
        this.currentArtisanProfile = null;
      }
    });
  }

  playFirstTimeIntro() {
    const hasVisited = sessionStorage.getItem('arteysanos_visited');
    const introOverlay = document.getElementById('introOverlay');

    if (hasVisited || !introOverlay) {
      // Si ya visitó la página en esta sesión, desactivar inmediatamente la animación
      document.body.classList.remove('intro-active');
      if (introOverlay) introOverlay.style.display = 'none';
      return;
    }

    // Marcar como visitado en esta sesión
    sessionStorage.setItem('arteysanos_visited', 'true');

    // 1. Esperar a que la línea vertical marrón termine de bajar (700ms)
    setTimeout(() => {
      const introLine = introOverlay.querySelector('.intro-line');

      // Quitar la animación para que el transition de CSS pueda actuar
      if (introLine) {
        introLine.style.animation = 'none';    // libera el control del keyframe
        introLine.style.transition = 'opacity 1s ease-out';
        introLine.style.opacity = '0';         // fade rápido a transparente
      }

      // 2. Abrir las cortinas inmediatamente en paralelo
      introOverlay.classList.add('open');
      document.body.classList.remove('intro-active');

      // 3. Ocultar el overlay al finalizar las transiciones
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 1200);
    }, 700);
  }

  updateAuthUI(user) {
    const navActions = document.getElementById('navAuthActions');
    if (!navActions) return;

    if (user) {
      navActions.innerHTML = `
        <button class="btn btn-primary" onclick="window.appUI.openShopManageModal()">
          <i class="fa-solid fa-store"></i> Mi Tienda
        </button>
        <button class="btn btn-secondary" onclick="window.appUI.handleLogout()">
          <i class="fa-solid fa-right-from-bracket"></i> Salir
        </button>
      `;
    } else {
      navActions.innerHTML = `
        <button class="btn btn-secondary" onclick="window.appUI.openLoginModal()">
          <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
        </button>
        <button class="btn btn-primary" onclick="window.appUI.openRegisterModal()">
          <i class="fa-solid fa-plus"></i> Crear Cuenta Artesano
        </button>
      `;
    }
  }

  renderCategories() {
    const categoryContainer = document.getElementById('categoryGrid');
    if (!categoryContainer) return;

    const categories = [
      { id: 'all', name: 'Todas', icon: 'fa-solid fa-border-all', count: this.artisans.length },
      { id: 'ceramica', name: 'Cerámica & Barro', icon: 'fa-solid fa-whiskey-glass', count: this.getCategoryCount('ceramica') },
      { id: 'tejido', name: 'Textil & Telar', icon: 'fa-solid fa-scroll', count: this.getCategoryCount('tejido') },
      { id: 'herreria', name: 'Herrería & Forja', icon: 'fa-solid fa-hammer', count: this.getCategoryCount('herreria') },
      { id: 'madera', name: 'Ebanistería & Madera', icon: 'fa-solid fa-tree', count: this.getCategoryCount('madera') },
      { id: 'cuero', name: 'Marroquinería & Cuero', icon: 'fa-solid fa-bag-shopping', count: this.getCategoryCount('cuero') },
      { id: 'joyeria', name: 'Joyería & Orfebrería', icon: 'fa-solid fa-gem', count: this.getCategoryCount('joyeria') },
      { id: 'tatuaje', name: 'Tatuaje Artístico', icon: 'fa-solid fa-pen-nib', count: this.getCategoryCount('tatuaje') },
      { id: 'comida', name: 'Comida & Obrador', icon: 'fa-solid fa-wheat-awn', count: this.getCategoryCount('comida') }
    ];

    categoryContainer.innerHTML = categories.map(cat => `
      <div class="category-card ${this.activeCategory === cat.id ? 'active' : ''}" onclick="window.appUI.filterByCategory('${cat.id}')">
        <div class="category-icon"><i class="${cat.icon}"></i></div>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.count} artesanos</div>
      </div>
    `).join('');
  }

  getCategoryCount(catId) {
    return this.artisans.filter(a => a.category === catId).length;
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

  renderArtisans() {
    const directoryGrid = document.getElementById('directoryGrid');
    const resultsCounter = document.getElementById('resultsCount');
    if (!directoryGrid) return;

    let filtered = this.artisans.filter(item => {
      const matchesCategory = this.activeCategory === 'all' || item.category === this.activeCategory;
      const matchesSearch = this.searchQuery === '' || 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.trade.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Lógica de ordenación
    if (this.sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.sortBy === 'reviews') {
      filtered.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (this.sortBy === 'newest') {
      filtered.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }

    if (resultsCounter) {
      resultsCounter.textContent = `Mostrando ${filtered.length} artesano(s)`;
    }

    if (filtered.length === 0) {
      directoryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="fa-solid fa-compass" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3 style="margin-bottom: 0.5rem; color: var(--primary-dark);">No encontramos artesanos con esa búsqueda</h3>
          <p style="color: var(--text-secondary);">Prueba con otra palabra clave o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    directoryGrid.innerHTML = filtered.map(artisan => ArtisanCardComponent.render(artisan)).join('');
  }

  setupEventListeners() {
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

    // Cerrar modales al hacer clic fuera (en el overlay)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id); // usa closeModal para restaurar body scroll
        }
      });
    });

    // Cerrar modales al pulsar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          this.closeModal(modal.id); // usa closeModal para restaurar body scroll
        });
      }
    });

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', (e) => this.handleNewArtisanSubmit(e));

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));

    const editShopForm = document.getElementById('editShopForm');
    if (editShopForm) editShopForm.addEventListener('submit', (e) => this.handleEditShopSubmit(e));

    const promoForm = document.getElementById('promoForm');
    if (promoForm) promoForm.addEventListener('submit', (e) => this.handlePromoSubmit(e));

    const galleryForm = document.getElementById('galleryForm');
    if (galleryForm) galleryForm.addEventListener('submit', (e) => this.handleGallerySubmit(e));
  }

  setupHeaderScroll() {
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  openArtisanModal(id) {
    const artisan = this.artisans.find(a => String(a.id) === String(id));
    if (!artisan) return;

    const modalContainer = document.getElementById('detailModal');
    const modalContent = document.getElementById('detailModalContent');

    modalContent.innerHTML = `
      <div class="modal-header-hero">
        <img src="${artisan.image}" alt="${artisan.name}">
        <div class="modal-header-overlay">
          <h2>${artisan.name}</h2>
          <p style="color: var(--beige-medium); font-weight: 500;">${artisan.trade}</p>
        </div>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          ${artisan.tags ? artisan.tags.map(t => `<span class="hero-badge" style="margin: 0; font-size: 0.8rem;">#${t}</span>`).join('') : ''}
        </div>

        ${artisan.promo && artisan.promo.active ? `
          <div style="background: rgba(197, 160, 89, 0.12); border: 1px solid var(--warm-gold); padding: 1.2rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
            <div style="color: var(--warm-gold-hover); font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
              <i class="fa-solid fa-gift"></i> Oferta Especial Activa: ${artisan.promo.title}
            </div>
            <p style="color: var(--text-primary); font-size: 0.95rem;">${artisan.promo.details || ''}</p>
          </div>
        ` : ''}

        <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">Sobre nuestro taller</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.7;">${artisan.fullStory || artisan.description}</p>

        ${artisan.gallery && artisan.gallery.length > 0 ? `
          <h4 style="margin-bottom: 0.8rem; font-size: 1.1rem;">Muestra de nuestros trabajos</h4>
          <div class="artisan-gallery-grid">
            ${artisan.gallery.map(imgUrl => `
              <div class="artisan-gallery-item">
                <img src="${imgUrl}" alt="Trabajo artesanal">
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="contact-info-box">
          <div class="contact-item">
            <i class="fa-solid fa-phone"></i>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Teléfono / WhatsApp</div>
              <strong style="color: var(--primary-dark); font-size: 0.95rem;">${artisan.phone}</strong>
            </div>
          </div>
          <div class="contact-item">
            <i class="fa-solid fa-envelope"></i>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Correo Electrónico</div>
              <strong style="color: var(--primary-dark); font-size: 0.95rem;">${artisan.email}</strong>
            </div>
          </div>
          ${artisan.website ? `
            <div class="contact-item">
              <i class="fa-solid fa-globe"></i>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Sitio Web / Tienda</div>
                <a href="${artisan.website}" target="_blank" style="color: var(--terracotta); font-weight: 700; font-size: 0.95rem; text-decoration: underline;">
                  Visitar Web Oficial <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem;"></i>
                </a>
              </div>
            </div>
          ` : ''}
          <div class="contact-item">
            <i class="fa-solid fa-location-dot"></i>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Dirección</div>
              <strong style="color: var(--primary-dark); font-size: 0.95rem;">${artisan.address} (${artisan.location})</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
          <a href="https://wa.me/${artisan.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-primary" style="flex: 1;">
            <i class="fa-brands fa-whatsapp"></i> Contactar por WhatsApp
          </a>
          ${artisan.website ? `
            <a href="${artisan.website}" target="_blank" class="btn btn-gold" style="flex: 1;">
              <i class="fa-solid fa-bag-shopping"></i> Comprar en su Web
            </a>
          ` : ''}
          <button class="btn btn-secondary" onclick="window.appUI.closeModal('detailModal')">Cerrar</button>
        </div>
      </div>
    `;

    document.body.style.overflow = 'hidden';
    modalContainer.classList.add('active');
  }

  openLoginModal() {
    document.body.style.overflow = 'hidden';
    document.getElementById('loginModal').classList.add('active');
  }
  openRegisterModal() {
    document.body.style.overflow = 'hidden';
    document.getElementById('registerModal').classList.add('active');
  }
  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Restaurar el scroll del body sólo si no queda ningún modal abierto
    const anyOpen = document.querySelector('.modal-overlay.active');
    if (!anyOpen) document.body.style.overflow = '';
  }

  openShopManageModal() {
    if (!this.currentUser) {
      this.openLoginModal();
      return;
    }

    document.body.style.overflow = 'hidden';

    if (this.currentArtisanProfile) {
      document.getElementById('editName').value = this.currentArtisanProfile.name || '';
      document.getElementById('editTrade').value = this.currentArtisanProfile.trade || '';
      document.getElementById('editPhone').value = this.currentArtisanProfile.phone || '';
      document.getElementById('editWebsite').value = this.currentArtisanProfile.website || '';
      document.getElementById('editAddress').value = this.currentArtisanProfile.address || '';
      document.getElementById('editDescription').value = this.currentArtisanProfile.description || '';

      this.renderGalleryPreviewGrid(this.currentArtisanProfile.gallery || []);
    }

    document.getElementById('shopManageModal').classList.add('active');
  }

  switchShopTab(tabId) {
    document.querySelectorAll('.shop-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId).style.display = 'block';
    if (tabId === 'tabGeneral') document.getElementById('btnTabGeneral').classList.add('active');
    if (tabId === 'tabPromos') document.getElementById('btnTabPromos').classList.add('active');
    if (tabId === 'tabGallery') document.getElementById('btnTabGallery').classList.add('active');
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const user = await this.authRepo.signIn(email, password);
      this.closeModal('loginModal');
      ToastComponent.show(`¡Bienvenido de nuevo, ${user.email}!`);
    } catch (err) {
      alert(`Error al iniciar sesión: ${err.message}`);
    }
  }

  async handleLogout() {
    await this.authRepo.logout();
    ToastComponent.show('Has cerrado sesión correctamente.');
  }

  async handleNewArtisanSubmit(e) {
    e.preventDefault();

    const authEmailInput = document.getElementById('inputAuthEmail');
    const authEmail = authEmailInput ? authEmailInput.value : document.getElementById('inputPhone').value + '@arteysanos.es';
    const authPasswordInput = document.getElementById('inputAuthPassword');
    const authPassword = authPasswordInput ? authPasswordInput.value : '12345678';
    
    const name = document.getElementById('inputName').value;
    const category = document.getElementById('inputCategory').value;
    const trade = document.getElementById('inputTrade').value;
    const location = document.getElementById('inputLocation').value;
    const address = document.getElementById('inputAddress').value;
    const phone = document.getElementById('inputPhone').value;
    const websiteInput = document.getElementById('inputWebsite');
    const website = websiteInput ? websiteInput.value : '';
    const description = document.getElementById('inputDescription').value;

    let createdUid = null;

    try {
      const user = await this.authRepo.signUp(authEmail, authPassword);
      createdUid = user.uid;
      ToastComponent.show('📩 Correo de verificación enviado a ' + authEmail);
    } catch (authErr) {
      console.warn('Info Auth:', authErr.message);
    }

    const newArtisan = await this.artisanRepo.createArtisan({
      id: Date.now(),
      ownerId: createdUid || (this.currentUser ? this.currentUser.uid : 'anonymous'),
      name,
      trade,
      category,
      location,
      address,
      phone,
      email: authEmail,
      website,
      description
    });

    this.artisans.unshift(newArtisan);
    this.renderCategories();
    this.renderArtisans();
    this.closeModal('registerModal');
    e.target.reset();

    ToastComponent.show(`¡Bienvenido, ${name}! Tu cuenta y tienda están listas.`);
  }

  async handleEditShopSubmit(e) {
    e.preventDefault();
    if (!this.currentUser || !this.currentArtisanProfile) return;

    const updatedData = {
      name: document.getElementById('editName').value,
      trade: document.getElementById('editTrade').value,
      phone: document.getElementById('editPhone').value,
      website: document.getElementById('editWebsite').value,
      address: document.getElementById('editAddress').value,
      description: document.getElementById('editDescription').value,
    };

    if (this.currentArtisanProfile.docId) {
      try {
        await this.artisanRepo.updateArtisan(this.currentArtisanProfile.docId, updatedData);
        this.currentArtisanProfile = { ...this.currentArtisanProfile, ...updatedData };
        this.artisans = await this.artisanRepo.getAllArtisans();
        this.renderArtisans();
        this.closeModal('shopManageModal');
        ToastComponent.show('¡Los datos de tu tienda han sido actualizados!');
      } catch (err) {
        alert(`Error guardando: ${err.message}`);
      }
    }
  }

  async handlePromoSubmit(e) {
    e.preventDefault();
    if (!this.currentUser || !this.currentArtisanProfile) return;

    const promoTitle = document.getElementById('promoTitle').value;
    const promoDetails = document.getElementById('promoDetails').value;

    const promoData = {
      promo: {
        title: promoTitle,
        details: promoDetails,
        active: true
      }
    };

    if (this.currentArtisanProfile.docId) {
      try {
        await this.artisanRepo.updateArtisan(this.currentArtisanProfile.docId, promoData);
        this.currentArtisanProfile.promo = promoData.promo;
        this.artisans = await this.artisanRepo.getAllArtisans();
        this.renderArtisans();
        this.closeModal('shopManageModal');
        ToastComponent.show('¡Promoción publicada con éxito!');
      } catch (err) {
        alert(`Error al guardar oferta: ${err.message}`);
      }
    }
  }

  async handleGallerySubmit(e) {
    e.preventDefault();
    if (!this.currentUser || !this.currentArtisanProfile) return;

    const imageUrl = document.getElementById('galleryImageUrl').value;
    const gallery = this.currentArtisanProfile.gallery || [];
    gallery.push(imageUrl);

    if (this.currentArtisanProfile.docId) {
      try {
        await this.artisanRepo.updateArtisan(this.currentArtisanProfile.docId, { gallery });
        this.currentArtisanProfile.gallery = gallery;
        this.renderGalleryPreviewGrid(gallery);
        this.artisans = await this.artisanRepo.getAllArtisans();
        this.renderArtisans();
        document.getElementById('galleryImageUrl').value = '';
        ToastComponent.show('¡Imagen añadida a la galería!');
      } catch (err) {
        alert(`Error al añadir imagen: ${err.message}`);
      }
    }
  }

  renderGalleryPreviewGrid(gallery) {
    const container = document.getElementById('galleryPreviewGrid');
    if (!container) return;

    container.innerHTML = gallery.map(url => `
      <div class="artisan-gallery-item">
        <img src="${url}" alt="Trabajo artesanal">
      </div>
    `).join('');
  }
}

// Inicializar Aplicación y exponarla globalmente para eventos en HTML
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
  window.appUI = app;
});
