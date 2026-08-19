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
    this.tempProjectFiles = [];
  }

  async init() {
    this.playFirstTimeIntro();
    this.artisans = await this.artisanRepo.getAllArtisans();
    this.updateStatsCount();
    this.renderCategories();
    this.renderArtisans();
    this.setupEventListeners();
    this.setupHeaderScroll();

    this.authRepo.onAuthChange(async (user) => {
      this.currentUser = user;
      if (user) {
        this.currentArtisanProfile = await this.artisanRepo.getArtisanByOwnerId(user.uid);
      } else {
        this.currentArtisanProfile = null;
      }
      this.updateAuthUI(user);

      // Si la URL contiene el parámetro ?manage=true y el usuario está logueado, abrir automáticamente el panel
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('manage') === 'true' && user) {
        this.openShopManageModal();
      }
    });
  }

  updateStatsCount() {
    const el = document.getElementById('statArtisansCount');
    if (el) {
      const count = this.artisans.length;
      el.textContent = `${count}`;
    }
  }

  playFirstTimeIntro() {
    const hasVisited = sessionStorage.getItem('arteysanos_visited');
    const introOverlay = document.getElementById('introOverlay');

    if (hasVisited || !introOverlay) {
      document.body.classList.remove('intro-active');
      if (introOverlay) introOverlay.style.display = 'none';
      return;
    }

    sessionStorage.setItem('arteysanos_visited', 'true');

    setTimeout(() => {
      const introLine = introOverlay.querySelector('.intro-line');
      if (introLine) {
        introLine.style.animation = 'none';
        introLine.style.transition = 'opacity 1s ease-out';
        introLine.style.opacity = '0';
      }

      introOverlay.classList.add('open');
      document.body.classList.remove('intro-active');

      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 1200);
    }, 700);
  }

  toggleMobileMenu(forceState) {
    const drawer = document.getElementById('mobileMenuDrawer');
    const icon = document.getElementById('mobileNavIcon');
    if (!drawer) return;

    const shouldOpen = typeof forceState === 'boolean' ? forceState : !drawer.classList.contains('active');
    if (shouldOpen) {
      drawer.classList.add('active');
      if (icon) icon.className = 'fa-solid fa-xmark';
    } else {
      drawer.classList.remove('active');
      if (icon) icon.className = 'fa-solid fa-bars';
    }
  }

  updateAuthUI(user) {
    const navActions = document.getElementById('navAuthActions');
    const mobileNavActions = document.getElementById('mobileNavAuthActions');

    if (user) {
      const displayName = (user.profile && user.profile.displayName) || (this.currentArtisanProfile && this.currentArtisanProfile.name) || user.email.split('@')[0];
      const isArtisan = user.profile ? user.profile.role === 'artisan' : !!this.currentArtisanProfile;
      const artisanId = this.currentArtisanProfile ? this.currentArtisanProfile.id : null;

      const desktopHtml = `
        <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <span style="font-size: 0.88rem; color: var(--primary-dark); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; background: var(--bg-subtle); padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid var(--border-color);">
            <i class="fa-solid ${isArtisan ? 'fa-hammer' : 'fa-user'}" style="color: var(--terracotta);"></i>
            ${displayName}
          </span>
          ${(isArtisan && artisanId) ? `
            <a href="perfil.html?id=${artisanId}" class="btn btn-secondary" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-eye"></i> Mi Perfil
            </a>
          ` : ''}
          <button class="btn btn-primary" onclick="window.appUI.openShopManageModal()" style="padding: 0.5rem 1rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-store"></i> ${isArtisan ? 'Gestionar mi tienda' : 'Mi Cuenta'}
          </button>
          <button class="btn btn-secondary" onclick="window.appUI.handleLogout()" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
          </button>
        </div>
      `;

      const mobileHtml = `
        <div style="display: flex; align-items: center; gap: 0.6rem; background: var(--bg-subtle); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 0.4rem;">
          <i class="fa-solid ${isArtisan ? 'fa-hammer' : 'fa-user'}" style="color: var(--terracotta); font-size: 1.1rem;"></i>
          <span style="font-weight: 700; color: var(--primary-dark); font-size: 0.95rem;">${displayName}</span>
        </div>
        ${(isArtisan && artisanId) ? `
          <a href="perfil.html?id=${artisanId}" class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="window.appUI.toggleMobileMenu(false)">
            <i class="fa-solid fa-eye"></i> Ver Mi Perfil Público
          </a>
        ` : ''}
        <button class="btn btn-primary" onclick="window.appUI.toggleMobileMenu(false); window.appUI.openShopManageModal();" style="width: 100%; justify-content: center;">
          <i class="fa-solid fa-store"></i> ${isArtisan ? 'Gestionar mi tienda' : 'Mi Cuenta'}
        </button>
        <button class="btn btn-secondary" onclick="window.appUI.toggleMobileMenu(false); window.appUI.handleLogout();" style="width: 100%; justify-content: center;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
        </button>
      `;

      if (navActions) navActions.innerHTML = desktopHtml;
      if (mobileNavActions) mobileNavActions.innerHTML = mobileHtml;
    } else {
      const desktopLoginHtml = `
        <button class="btn btn-secondary" onclick="window.appUI.openLoginModal()">
          <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
        </button>
        <button class="btn btn-primary" onclick="window.appUI.openRegisterModal()">
          <i class="fa-solid fa-user-plus"></i> Registrarse
        </button>
      `;
      const mobileLoginHtml = `
        <button class="btn btn-secondary" onclick="window.appUI.toggleMobileMenu(false); window.appUI.openLoginModal();" style="width: 100%; justify-content: center;">
          <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
        </button>
        <button class="btn btn-primary" onclick="window.appUI.toggleMobileMenu(false); window.appUI.openRegisterModal();" style="width: 100%; justify-content: center;">
          <i class="fa-solid fa-user-plus"></i> Registrarse
        </button>
      `;

      if (navActions) navActions.innerHTML = desktopLoginHtml;
      if (mobileNavActions) mobileNavActions.innerHTML = mobileLoginHtml;
    }
  }

  renderCategories() {
    const categoryContainer = document.getElementById('categoryGrid');
    if (!categoryContainer) return;

    const categories = [
      { id: 'all', name: 'Todas', icon: 'fa-solid fa-border-all', count: this.artisans.length },
      { id: 'pintura', name: 'Pintura & Ilustración', icon: 'fa-solid fa-palette', count: this.getCategoryCount('pintura') },
      { id: 'escultura', name: 'Escultura & Modelado', icon: 'fa-solid fa-monument', count: this.getCategoryCount('escultura') },
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

    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    // Cerrar modales al pulsar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          this.closeModal(modal.id);
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

    const projectEditorForm = document.getElementById('projectEditorForm');
    if (projectEditorForm) projectEditorForm.addEventListener('submit', (e) => this.handleProjectSave(e));

    const changeEmailForm = document.getElementById('changeEmailForm');
    if (changeEmailForm) changeEmailForm.addEventListener('submit', (e) => this.handleChangeEmailSubmit(e));

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) changePasswordForm.addEventListener('submit', (e) => this.handleChangePasswordSubmit(e));

    const confirmDeleteAccountForm = document.getElementById('confirmDeleteAccountForm');
    if (confirmDeleteAccountForm) confirmDeleteAccountForm.addEventListener('submit', (e) => this.handleDeleteAccountConfirm(e));
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
          ${(artisan.allowWhatsapp !== false && (artisan.phone || '').replace(/[^0-9]/g, '')) ? `
            <a href="https://wa.me/${(artisan.phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-primary" style="flex: 1;">
              <i class="fa-brands fa-whatsapp"></i> Contactar por WhatsApp
            </a>
          ` : ''}
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
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
    const anyOpen = document.querySelector('.modal-overlay.active');
    if (!anyOpen) document.body.style.overflow = '';
  }

  openShopManageModal() {
    if (!this.currentUser) {
      this.openLoginModal();
      return;
    }

    document.body.style.overflow = 'hidden';

    // Rellenar datos del artesano
    if (this.currentArtisanProfile) {
      const p = this.currentArtisanProfile;
      const editName = document.getElementById('editName');
      const editTrade = document.getElementById('editTrade');
      const editCategory = document.getElementById('editCategory');
      const editLocation = document.getElementById('editLocation');
      const editPhone = document.getElementById('editPhone');
      const editWebsite = document.getElementById('editWebsite');
      const editAddress = document.getElementById('editAddress');
      const editDescription = document.getElementById('editDescription');
      const avatarPreview = document.getElementById('avatarEditPreview');
      const btnViewProfile = document.getElementById('btnViewMyPublicProfile');

      const editAllowWhatsapp = document.getElementById('editAllowWhatsapp');
      if (editAllowWhatsapp) editAllowWhatsapp.checked = p.allowWhatsapp !== false;

      if (editName) editName.value = p.name || '';
      if (editTrade) editTrade.value = p.trade || '';
      if (editCategory) editCategory.value = p.category || 'ceramica';
      if (editLocation) editLocation.value = p.location || '';
      if (editPhone) editPhone.value = p.phone || '';
      if (editWebsite) editWebsite.value = p.website || '';
      if (editAddress) editAddress.value = p.address || '';
      if (editDescription) editDescription.value = p.description || '';
      if (avatarPreview) avatarPreview.src = p.image || 'images/artisan1.jpg';

      if (btnViewProfile) {
        btnViewProfile.href = `perfil.html?id=${p.id}`;
        btnViewProfile.style.display = 'inline-flex';
      }

      if (p.promo) {
        const promoTitle = document.getElementById('promoTitle');
        const promoDetails = document.getElementById('promoDetails');
        if (promoTitle) promoTitle.value = p.promo.title || '';
        if (promoDetails) promoDetails.value = p.promo.details || '';
      }

      this.renderProjectsManagerGrid();
    } else {
      const btnViewProfile = document.getElementById('btnViewMyPublicProfile');
      if (btnViewProfile) btnViewProfile.style.display = 'none';
    }

    // Por defecto ir a la primera pestaña
    this.switchShopTab('tabGeneral');
    document.getElementById('shopManageModal').classList.add('active');
  }

  async handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('avatarUploadStatus');
    const previewEl = document.getElementById('avatarEditPreview');

    // Previsualización instantánea local
    const reader = new FileReader();
    reader.onload = (re) => {
      if (previewEl) previewEl.src = re.target.result;
    };
    reader.readAsDataURL(file);

    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subiendo foto a Firebase Storage...`;

    try {
      const artisanDocId = this.currentArtisanProfile ? this.currentArtisanProfile.docId : null;
      const uploadedUrl = await this.authRepo.updateAvatar(file, artisanDocId);

      if (this.currentArtisanProfile) {
        this.currentArtisanProfile.image = uploadedUrl;
      }

      if (previewEl) previewEl.src = uploadedUrl;
      if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i> Foto actualizada correctamente`;

      // Refrescar artesanos en vista general
      this.artisans = await this.artisanRepo.getAllArtisans();
      this.renderArtisans();

      ToastComponent.show('📸 ¡Foto de perfil actualizada con éxito!');
    } catch (err) {
      if (statusEl) statusEl.innerHTML = `<span style="color: #D32F2F;">Error al subir foto</span>`;
      alert(`Error al actualizar la foto: ${err.message}`);
    }
  }

  showNewProjectForm() {
    this.tempProjectFiles = [];
    document.getElementById('editingProjectIdx').value = "-1";
    document.getElementById('projectFormTitle').textContent = "Añadir Nuevo Trabajo";
    document.getElementById('projectInputTitle').value = "";
    document.getElementById('projectInputDesc').value = "";
    document.getElementById('projectMediaPreviewList').innerHTML = "";
    document.getElementById('fileUploadStatus').textContent = "Formatos aceptados: JPG, PNG, WEBP, MP4, MOV...";
    document.getElementById('projectFormContainer').style.display = 'block';
  }

  hideProjectForm() {
    this.tempProjectFiles = [];
    document.getElementById('projectFormContainer').style.display = 'none';
  }

  async handleProjectFilesSelected(e) {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const statusEl = document.getElementById('fileUploadStatus');
    if (!this.tempProjectFiles) this.tempProjectFiles = [];

    statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subiendo ${files.length} archivo(s) a Firebase Storage...`;

    const artisanUid = (this.currentUser ? this.currentUser.uid : null) || (this.currentArtisanProfile ? this.currentArtisanProfile.ownerId : 'anon');
    const editingIdx = parseInt(document.getElementById('editingProjectIdx').value, 10);
    const projects = (this.currentArtisanProfile && this.currentArtisanProfile.projects) ? this.currentArtisanProfile.projects : [];
    const projectUid = (editingIdx >= 0 && projects[editingIdx]) ? projects[editingIdx].id : `proj_${Date.now()}`;

    for (const file of files) {
      try {
        const fileUrl = await this.artisanRepo.uploadFile(file, artisanUid, projectUid);
        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');

        this.tempProjectFiles.push({
          url: fileUrl,
          type: isVideo ? 'video' : 'image',
          title: file.name
        });
      } catch (err) {
        console.error("Error al subir archivo:", err);
      }
    }

    statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i> ${this.tempProjectFiles.length} archivo(s) listos`;
    this.renderProjectMediaPreviews();
    e.target.value = "";
  }

  renderProjectMediaPreviews() {
    const container = document.getElementById('projectMediaPreviewList');
    if (!container) return;

    if (!this.tempProjectFiles || this.tempProjectFiles.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.tempProjectFiles.map((fileObj, idx) => `
      <div style="position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); height: 90px; background: #000;">
        ${fileObj.type === 'video' ? `
          <video src="${fileObj.url}" style="width:100%; height:100%; object-fit:cover;"></video>
        ` : `
          <img src="${fileObj.url}" style="width:100%; height:100%; object-fit:cover;">
        `}
        <button type="button" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #FFF; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;" onclick="window.appUI.removeProjectMediaFile(${idx})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  removeProjectMediaFile(idx) {
    if (this.tempProjectFiles) {
      this.tempProjectFiles.splice(idx, 1);
      this.renderProjectMediaPreviews();
      const statusEl = document.getElementById('fileUploadStatus');
      if (statusEl) statusEl.textContent = `${this.tempProjectFiles.length} archivo(s) listos`;
    }
  }

  async handleProjectSave(e) {
    e.preventDefault();
    if (!this.currentArtisanProfile) return;

    const title = document.getElementById('projectInputTitle').value;
    const desc = document.getElementById('projectInputDesc').value;
    const editingIdx = parseInt(document.getElementById('editingProjectIdx').value, 10);

    const mediaFiles = this.tempProjectFiles || [];
    if (mediaFiles.length === 0) {
      alert("Por favor pulsa 'Añadir archivo' y sube al menos una fotografía o vídeo para este trabajo.");
      return;
    }

    const projects = this.currentArtisanProfile.projects || [];
    const mainImage = mediaFiles[0].url;
    const steps = mediaFiles.map((f, i) => ({
      title: f.title || `Paso #${i + 1}`,
      img: f.url,
      desc: desc || "Fotografía/Vídeo del proceso de trabajo."
    }));

    const projectData = {
      title,
      category: this.currentArtisanProfile.categoryLabel || "Artesanía",
      date: "Publicación reciente",
      mainImage,
      desc: desc || "Trabajo artesanal publicado desde la tienda.",
      steps
    };

    const btnSave = document.getElementById('btnSaveProject');
    if (btnSave) btnSave.disabled = true;

    try {
      if (this.currentArtisanProfile.docId) {
        if (editingIdx >= 0 && projects[editingIdx] && projects[editingIdx].id) {
          const existingId = projects[editingIdx].id;
          await this.artisanRepo.updateProject(existingId, projectData);
          projects[editingIdx] = { id: existingId, ...projectData };
        } else {
          const createdProj = await this.artisanRepo.createProject(this.currentArtisanProfile.docId, projectData);
          if (createdProj) projects.unshift(createdProj);
        }
      } else {
        if (editingIdx >= 0) {
          projects[editingIdx] = { id: `proj_${Date.now()}`, ...projectData };
        } else {
          projects.unshift({ id: `proj_${Date.now()}`, ...projectData });
        }
      }

      this.currentArtisanProfile.projects = projects;
      this.renderProjectsManagerGrid();
      this.hideProjectForm();

      this.artisans = await this.artisanRepo.getAllArtisans();
      this.renderArtisans();

      ToastComponent.show(editingIdx >= 0 ? "✨ ¡Trabajo actualizado con éxito!" : "✨ ¡Nuevo trabajo publicado con éxito!");
    } catch (err) {
      alert(`Error al guardar trabajo: ${err.message}`);
    } finally {
      if (btnSave) btnSave.disabled = false;
    }
  }

  renderProjectsManagerGrid() {
    const container = document.getElementById('projectsManagerGrid');
    if (!container || !this.currentArtisanProfile) return;

    const projects = this.currentArtisanProfile.projects || [];
    if (projects.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <i class="fa-solid fa-photo-film" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.8rem;"></i>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">Todavía no has creado ningún trabajo en tu catálogo.</p>
          <button type="button" class="btn btn-secondary" style="margin-top: 1rem;" onclick="window.appUI.showNewProjectForm()">
            <i class="fa-solid fa-plus"></i> Crear Mi Primer Trabajo
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map((proj, idx) => `
      <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
        <div>
          <div style="height: 140px; overflow: hidden; position: relative;">
            <img src="${proj.mainImage}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.65); color: #FFF; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">
              <i class="fa-solid fa-images"></i> ${proj.steps ? proj.steps.length : 1} archivo(s)
            </span>
          </div>
          <div style="padding: 1rem;">
            <h4 style="font-size: 1rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.3rem;">${proj.title}</h4>
            <p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${proj.desc || 'Sin descripción'}</p>
          </div>
        </div>
        <div style="padding: 0.8rem 1rem; background: var(--bg-subtle); border-top: 1px solid var(--border-color); display: flex; gap: 0.6rem; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="window.appUI.editProject(${idx})">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button type="button" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; color: #D32F2F;" onclick="window.appUI.deleteProject(${idx})">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }

  editProject(idx) {
    const projects = this.currentArtisanProfile.projects || [];
    const proj = projects[idx];
    if (!proj) return;

    this.showNewProjectForm();
    document.getElementById('editingProjectIdx').value = idx;
    document.getElementById('projectFormTitle').textContent = "Editar Trabajo";
    document.getElementById('projectInputTitle').value = proj.title;
    document.getElementById('projectInputDesc').value = proj.desc || "";

    if (proj.steps) {
      this.tempProjectFiles = proj.steps.map(s => ({
        url: s.img,
        type: (s.img.endsWith('.mp4') || s.img.endsWith('.mov')) ? 'video' : 'image',
        title: s.title
      }));
      this.renderProjectMediaPreviews();
    }
  }

  async deleteProject(idx) {
    if (!confirm("¿Seguro que deseas eliminar este trabajo de tu catálogo?")) return;

    const projects = this.currentArtisanProfile.projects || [];
    const targetProj = projects[idx];

    if (this.currentArtisanProfile.docId && targetProj && targetProj.id) {
      try {
        await this.artisanRepo.deleteProject(this.currentArtisanProfile.docId, targetProj.id);
      } catch (err) {
        console.warn("Error borrando documento de colección 'projects':", err);
      }
    }

    projects.splice(idx, 1);
    this.currentArtisanProfile.projects = projects;
    this.renderProjectsManagerGrid();

    try {
      this.artisans = await this.artisanRepo.getAllArtisans();
      this.renderArtisans();
    } catch (e) { }

    ToastComponent.show("🗑️ Trabajo eliminado de tu catálogo.");
  }

  switchShopTab(tabId) {
    document.querySelectorAll('.shop-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.style.display = 'block';

    if (tabId === 'tabGeneral') document.getElementById('btnTabGeneral')?.classList.add('active');
    if (tabId === 'tabGallery') document.getElementById('btnTabGallery')?.classList.add('active');
    if (tabId === 'tabPromos') document.getElementById('btnTabPromos')?.classList.add('active');
    if (tabId === 'tabSecurity') document.getElementById('btnTabSecurity')?.classList.add('active');
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

  async handleGoogleLogin() {
    try {
      const user = await this.authRepo.signInWithGoogle();
      this.closeModal('loginModal');
      this.closeModal('registerModal');
      const name = (user.profile && user.profile.displayName) || user.displayName || user.email;
      ToastComponent.show(`¡Bienvenido, ${name}! Sesión iniciada con Google.`);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      alert(`Error al conectar con Google: ${err.message}`);
    }
  }

  async handleLogout() {
    await this.authRepo.logout();
    this.currentUser = null;
    this.currentArtisanProfile = null;
    this.updateAuthUI(null);
    ToastComponent.show('Has cerrado sesión correctamente.');
  }

  selectRegisterRole(role) {
    const roleInput = document.getElementById('registerAccountRole');
    const roleBtnClient = document.getElementById('roleBtnClient');
    const roleBtnArtisan = document.getElementById('roleBtnArtisan');
    const extraFields = document.getElementById('artisanExtraFields');
    const btnSubmit = document.getElementById('btnSubmitRegister');
    const modalTitle = document.getElementById('registerModalTitle');

    if (roleInput) roleInput.value = role;

    if (role === 'client') {
      if (roleBtnClient) {
        roleBtnClient.style.background = 'var(--terracotta)';
        roleBtnClient.style.color = '#FFF';
      }
      if (roleBtnArtisan) {
        roleBtnArtisan.style.background = 'transparent';
        roleBtnArtisan.style.color = 'var(--text-main)';
      }
      if (extraFields) extraFields.style.display = 'none';
      if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Crear Cuenta de Usuario';
      if (modalTitle) modalTitle.textContent = 'Crear Cuenta de Usuario';
    } else {
      if (roleBtnArtisan) {
        roleBtnArtisan.style.background = 'var(--terracotta)';
        roleBtnArtisan.style.color = '#FFF';
      }
      if (roleBtnClient) {
        roleBtnClient.style.background = 'transparent';
        roleBtnClient.style.color = 'var(--text-main)';
      }
      if (extraFields) extraFields.style.display = 'block';
      if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Crear Cuenta de Artesano';
      if (modalTitle) modalTitle.textContent = 'Crear Cuenta de Artesano';
    }
  }

  async handleNewArtisanSubmit(e) {
    e.preventDefault();

    const role = (document.getElementById('registerAccountRole') && document.getElementById('registerAccountRole').value) || 'client';
    const authEmail = document.getElementById('inputAuthEmail').value;
    const authPassword = document.getElementById('inputAuthPassword').value;
    const displayName = document.getElementById('inputDisplayName').value;

    let createdUser = null;

    try {
      createdUser = await this.authRepo.signUp(authEmail, authPassword, displayName, role);
      ToastComponent.show('📩 Correo de verificación enviado a ' + authEmail);
    } catch (authErr) {
      alert('Error al registrar usuario: ' + authErr.message);
      return;
    }

    if (role === 'artisan') {
      const name = document.getElementById('inputName').value || displayName;
      const category = document.getElementById('inputCategory').value;
      const trade = document.getElementById('inputTrade').value;
      const location = document.getElementById('inputLocation').value;
      const address = document.getElementById('inputAddress').value;
      const phone = document.getElementById('inputPhone').value;
      const websiteInput = document.getElementById('inputWebsite');
      const website = websiteInput ? websiteInput.value : '';
      const description = document.getElementById('inputDescription').value;

      const newArtisan = await this.artisanRepo.createArtisan({
        id: Date.now(),
        ownerId: createdUser ? createdUser.uid : 'anonymous',
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
      this.currentArtisanProfile = newArtisan;
      this.renderCategories();
      this.renderArtisans();
      ToastComponent.show(`¡Bienvenido, ${name}! Tu cuenta y taller artesano están listos.`);
    } else {
      ToastComponent.show(`¡Bienvenido, ${displayName}! Tu cuenta de usuario está lista.`);
    }

    this.closeModal('registerModal');
    e.target.reset();
  }

  async handleEditShopSubmit(e) {
    e.preventDefault();
    if (!this.currentUser || !this.currentArtisanProfile) return;

    const categorySelect = document.getElementById('editCategory');
    const categoryVal = categorySelect ? categorySelect.value : (this.currentArtisanProfile.category || 'ceramica');
    const categoryLabel = categorySelect && categorySelect.options[categorySelect.selectedIndex] ? categorySelect.options[categorySelect.selectedIndex].text : (this.currentArtisanProfile.categoryLabel || 'Artesanía');

    const updatedData = {
      name: document.getElementById('editName').value,
      trade: document.getElementById('editTrade').value,
      category: categoryVal,
      categoryLabel: categoryLabel,
      location: document.getElementById('editLocation').value,
      phone: document.getElementById('editPhone').value,
      website: document.getElementById('editWebsite').value,
      address: document.getElementById('editAddress').value,
      description: document.getElementById('editDescription').value,
      allowWhatsapp: document.getElementById('editAllowWhatsapp') ? document.getElementById('editAllowWhatsapp').checked : true
    };

    if (this.currentArtisanProfile.docId) {
      try {
        await this.artisanRepo.updateArtisan(this.currentArtisanProfile.docId, updatedData);
        this.currentArtisanProfile = { ...this.currentArtisanProfile, ...updatedData };
        this.artisans = await this.artisanRepo.getAllArtisans();
        this.renderArtisans();
        this.closeModal('shopManageModal');
        ToastComponent.show('💾 ¡Los datos de tu taller han sido actualizados!');
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
        ToastComponent.show('🏷️ ¡Promoción publicada con éxito!');
      } catch (err) {
        alert(`Error al guardar oferta: ${err.message}`);
      }
    }
  }

  // --- SEGURIDAD: CAMBIAR CONTRASEÑA ---
  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currPass = document.getElementById('inputPasswordCurrent').value;
    const newPass = document.getElementById('inputPasswordNew').value;

    try {
      await this.authRepo.changePassword(currPass, newPass);
      e.target.reset();
      ToastComponent.show('🔑 ¡Contraseña cambiada con éxito!');
    } catch (err) {
      alert(`Error al cambiar contraseña: ${err.message}`);
    }
  }

  // --- SEGURIDAD: CAMBIAR CORREO ---
  async handleChangeEmailSubmit(e) {
    e.preventDefault();
    const newEmail = document.getElementById('inputNewEmail').value;
    const currPass = document.getElementById('inputEmailCurrentPassword').value;

    try {
      await this.authRepo.changeEmail(currPass, newEmail);
      e.target.reset();
      ToastComponent.show(`✉️ Correo electrónico actualizado a ${newEmail}`);
    } catch (err) {
      alert(`Error al actualizar correo: ${err.message}`);
    }
  }

  // --- ZONA DE PELIGRO: ELIMINAR CUENTA EN CASCADA ---
  openDeleteAccountModal() {
    document.getElementById('deleteAccountPasswordConfirm').value = '';
    document.getElementById('deleteAccountModal').classList.add('active');
  }

  async handleDeleteAccountConfirm(e) {
    e.preventDefault();
    const pass = document.getElementById('deleteAccountPasswordConfirm').value;
    const btnConfirm = document.getElementById('btnConfirmDeleteAccount');

    if (!pass) {
      alert('Debes ingresar tu contraseña actual.');
      return;
    }

    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Eliminando todos los registros...`;
    }

    try {
      await this.authRepo.deleteAccountCascade(pass);

      this.closeModal('deleteAccountModal');
      this.closeModal('shopManageModal');
      this.currentUser = null;
      this.currentArtisanProfile = null;

      // Actualizar listado de artesanos
      this.artisans = await this.artisanRepo.getAllArtisans();
      this.updateStatsCount();
      this.renderCategories();
      this.renderArtisans();
      this.updateAuthUI(null);

      ToastComponent.show('👋 Tu cuenta y todos los registros asociados han sido eliminados.');
    } catch (err) {
      alert(`Error al eliminar cuenta: ${err.message}`);
    } finally {
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = `<i class="fa-solid fa-trash"></i> Confirmar Eliminación`;
      }
    }
  }
}

// Inicializar Aplicación y exponerla globalmente
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
  window.appUI = app;
});

