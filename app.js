// Configuración de Supabase (Sustituye con las llaves de tu proyecto en supabase.com)
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL.includes('https://') && !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID')) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Datos iniciales de artesanos (Fallback y semilla inicial)
const initialArtisans = [
  {
    id: 1,
    name: "Mateo & Elena Alarcón",
    trade: "Cerámica & Torneo de Barro",
    category: "ceramica",
    categoryLabel: "Cerámica",
    rating: 4.9,
    reviewsCount: 38,
    experience: "15 años de oficio",
    location: "Granada, España",
    address: "Callejon del Aire 14, Albaicín",
    phone: "+34 612 345 678",
    email: "taller@barroyalarcon.com",
    image: "images/ceramics_artisan_1786534790567.png",
    description: "Creamos vajillas, jarrones y piezas utilitarias moldeadas a mano en torno alfarero tradicional. Utilizamos esmaltes naturales formulados en nuestro propio taller con cenizas de olivo.",
    fullStory: "Nuestra historia comenzó en 2009 en el corazón del Albaicín granadino. Cada una de nuestras piezas conserva la marca única de las manos que la moldearon y las cenizas de la vegetación local.",
    hours: "Lunes a Viernes: 10:00 - 19:00",
    tags: ["Barro Esmaltado", "Torneo Manual", "Piezas Únicas"]
  },
  {
    id: 2,
    name: "Clara Mendoza",
    trade: "Tejedora & Tintes Naturales",
    category: "tejido",
    categoryLabel: "Tejido & Textil",
    rating: 5.0,
    reviewsCount: 42,
    experience: "12 años de oficio",
    location: "Oaxaca / Madrid",
    address: "Calle de los Artesanos 8",
    phone: "+34 622 987 654",
    email: "clara@hilosdelatierra.es",
    image: "images/textile_artisan_1786534801221.png",
    description: "Tejidos tradicionales elaborados en telar de madera utilizando lanas 100% orgánicas coloreadas con plantas, agallas de roble y cochinilla natural.",
    fullStory: "Rescatamos la herencia del tejido artesanal en telar de bajo lizo. No utilizamos químicos sintéticos en ningún proceso de teñido, garantizando mantas y tapices eternos.",
    hours: "Cita previa / Martes a Sábado: 11:00 - 18:00",
    tags: ["Telar de Madera", "Tintes Botánicos", "Lana Orgánica"]
  },
  {
    id: 3,
    name: "Ignacio 'Nacho' Forja",
    trade: "Herrería & Forja Tradicional",
    category: "herreria",
    categoryLabel: "Herrería & Metal",
    rating: 4.8,
    reviewsCount: 29,
    experience: "20 años de oficio",
    location: "Toledo, España",
    address: "Camino de la Fragua 3",
    phone: "+34 633 112 233",
    email: "contacto@forjatoledana.es",
    image: "images/blacksmith_artisan_1786534811595.png",
    description: "Escultura en hierro, portones ornamentales, cuchillería artesanal y restauración de elementos arquitectónicos de época a martillo y yunque.",
    fullStory: "Maestro forjador formado por tres generaciones. Moldeamos el acero candente utilizando el fuego de carbón de encina y las técnicas de la forja toledana de toda la vida.",
    hours: "Lunes a Viernes: 08:30 - 17:30",
    tags: ["Forja Tradicional", "Cuchillería", "Hierro Batido"]
  },
  {
    id: 4,
    name: "Aura Fine Line Tattoo",
    trade: "Tatuaje Artístico Botánico & Orgánico",
    category: "tatuaje",
    categoryLabel: "Tatuaje Artístico",
    rating: 4.9,
    reviewsCount: 64,
    experience: "8 años de experiencia",
    location: "Barcelona, España",
    address: "Carrer del Rec 22, El Born",
    phone: "+34 644 556 677",
    email: "booking@auratattoo.studio",
    image: "images/tattoo_artisan_1786534822293.png",
    description: "Estudio de tatuaje artesanal especializado en ilustración botánica, trazo fino customizado e tintas veganas de primera calidad en un ambiente sereno.",
    fullStory: "Entendemos el tatuaje como una experiencia ritual y artesanal. Cada diseño es dibujado a mano exclusivamente para la anatomía del cliente en nuestro estudio.",
    hours: "Martes a Sábado: 12:00 - 20:00 (Solo cita previa)",
    tags: ["Fine Line", "Diseño Exclusivo", "Tintas Veganas"]
  },
  {
    id: 5,
    name: "Masa & Masa Obrador",
    trade: "Panadería & Bollería de Masa Madre",
    category: "comida",
    categoryLabel: "Comida Artesana",
    rating: 5.0,
    reviewsCount: 110,
    experience: "7 años alimentando la ciudad",
    location: "Valencia, España",
    address: "Plaza del Mercado 12",
    phone: "+34 655 998 877",
    email: "hola@masaymasaobrador.es",
    image: "images/bakery_artisan_1786534832288.png",
    description: "Pan de masa madre con 48h de fermentación lenta, harinas de molino de piedra ecológicas y repostería artesanal recién horneada cada mañana.",
    fullStory: "Molemos grano seleccionado de pequeños agricultores locales. Nuestro horno de piedra no descansa de madrugada para ofrecer el aroma del pan de verdad a primera hora.",
    hours: "Martes a Domingo: 07:30 - 15:00",
    tags: ["Masa Madre", "Harina Ecológica", "Horno de Piedra"]
  }
];

// Estado global de la aplicación
let artisans = [...initialArtisans];
let activeCategory = 'all';
let searchQuery = '';

// Configuración e Integración con Firebase Firestore
async function fetchArtisansFromFirebase() {
  if (!window.db || !window.firestoreModules) return;

  try {
    const { collection, getDocs, query, orderBy } = window.firestoreModules;
    const q = query(collection(window.db, "artisans"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const dbArtisans = [];
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        dbArtisans.push({
          id: doc.id,
          name: item.name,
          trade: item.trade,
          category: item.category,
          categoryLabel: item.categoryLabel || item.category,
          rating: item.rating || 5.0,
          reviewsCount: item.reviewsCount || 1,
          experience: item.experience || 'Artesano verificado',
          location: item.location,
          address: item.address,
          phone: item.phone,
          email: item.email,
          image: item.image || 'images/ceramics_artisan_1786534790567.png',
          description: item.description,
          fullStory: item.fullStory || item.description,
          hours: item.hours || 'Consultar al artesano',
          tags: item.tags || ['Artesanal', 'Hecho a mano']
        });
      });
      artisans = dbArtisans;
    }
  } catch (err) {
    console.warn('Error al cargar datos de Firebase Firestore:', err.message);
  }
}

// Elementos DOM
document.addEventListener('DOMContentLoaded', async () => {
  if (window.db) {
    await fetchArtisansFromFirebase();
  }
  renderCategories();
  renderArtisans();
  setupEventListeners();
  setupHeaderScroll();
});

// Renderizar Categorías
function renderCategories() {
  const categoryContainer = document.getElementById('categoryGrid');
  if (!categoryContainer) return;

  const categories = [
    { id: 'all', name: 'Todas', icon: 'fa-solid fa-border-all', count: artisans.length },
    { id: 'ceramica', name: 'Cerámica', icon: 'fa-solid fa-whiskey-glass', count: getCategoryCount('ceramica') },
    { id: 'tejido', name: 'Tejido & Textil', icon: 'fa-solid fa-scroll', count: getCategoryCount('tejido') },
    { id: 'herreria', name: 'Herrería & Metal', icon: 'fa-solid fa-hammer', count: getCategoryCount('herreria') },
    { id: 'tatuaje', name: 'Tatuaje Artístico', icon: 'fa-solid fa-pen-nib', count: getCategoryCount('tatuaje') },
    { id: 'comida', name: 'Comida Artesana', icon: 'fa-solid fa-wheat-awn', count: getCategoryCount('comida') }
  ];

  categoryContainer.innerHTML = categories.map(cat => `
    <div class="category-card ${activeCategory === cat.id ? 'active' : ''}" onclick="filterByCategory('${cat.id}')">
      <div class="category-icon">
        <i class="${cat.icon}"></i>
      </div>
      <div class="category-name">${cat.name}</div>
      <div class="category-count">${cat.count} artesanos</div>
    </div>
  `).join('');
}

function getCategoryCount(catId) {
  return artisans.filter(a => a.category === catId).length;
}

// Filtrar por categoría
function filterByCategory(catId) {
  activeCategory = catId;
  renderCategories();
  renderArtisans();
}

// Renderizar Tarjetas de Artesanos
function renderArtisans() {
  const directoryGrid = document.getElementById('directoryGrid');
  const resultsCounter = document.getElementById('resultsCount');
  if (!directoryGrid) return;

  const filtered = artisans.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  directoryGrid.innerHTML = filtered.map(artisan => `
    <div class="artisan-card">
      <div class="artisan-img-wrapper">
        <img src="${artisan.image}" alt="${artisan.name}" class="artisan-img" loading="lazy">
        <span class="artisan-badge">${artisan.categoryLabel}</span>
        <div class="artisan-rating">
          <i class="fa-solid fa-star"></i>
          <span>${artisan.rating}</span>
        </div>
        ${artisan.promo && artisan.promo.active ? `
          <div class="promo-badge">
            <i class="fa-solid fa-tag"></i> ${artisan.promo.title}
          </div>
        ` : ''}
      </div>
      <div class="artisan-body">
        <h3 class="artisan-name">${artisan.name}</h3>
        <div class="artisan-trade">${artisan.trade}</div>
        <p class="artisan-desc">${artisan.description}</p>
        <div class="artisan-meta">
          <span><i class="fa-solid fa-location-dot"></i> ${artisan.location}</span>
          <span><i class="fa-solid fa-certificate"></i> ${artisan.experience}</span>
        </div>
        <div class="artisan-footer">
          <button class="btn btn-secondary" style="width: 100%; font-size: 0.85rem;" onclick="openArtisanModal('${artisan.id}')">
            Ver Negocio & Ofertas <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Abrir modal de detalles de artesano
function openArtisanModal(id) {
  const artisan = artisans.find(a => String(a.id) === String(id));
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
        ${artisan.tags.map(t => `<span class="hero-badge" style="margin: 0; font-size: 0.8rem;">#${t}</span>`).join('')}
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
        <button class="btn btn-secondary" onclick="closeModal('detailModal')">Cerrar</button>
      </div>
    </div>
  `;

  modalContainer.classList.add('active');
}

// Búsqueda en tiempo real
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderArtisans();
    });
  }

  // Formulario de nuevo artesano
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleNewArtisanSubmit);
  }
}

// Scroll de header
function setupHeaderScroll() {
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Abrir modal de detalles de artesano
function openArtisanModal(id) {
  const artisan = artisans.find(a => a.id === id);
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
        ${artisan.tags.map(t => `<span class="hero-badge" style="margin: 0; font-size: 0.8rem;">#${t}</span>`).join('')}
      </div>

      <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">Sobre nuestro taller</h4>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.7;">${artisan.fullStory}</p>

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
        <div class="contact-item">
          <i class="fa-solid fa-location-dot"></i>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Dirección</div>
            <strong style="color: var(--primary-dark); font-size: 0.95rem;">${artisan.address} (${artisan.location})</strong>
          </div>
        </div>
        <div class="contact-item">
          <i class="fa-solid fa-clock"></i>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Horario de atención</div>
            <strong style="color: var(--primary-dark); font-size: 0.95rem;">${artisan.hours}</strong>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <a href="https://wa.me/${artisan.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-primary" style="flex: 1;">
          <i class="fa-brands fa-whatsapp"></i> Contactar por WhatsApp
        </a>
        <button class="btn btn-secondary" onclick="closeModal('detailModal')">Cerrar</button>
      </div>
    </div>
  `;

  modalContainer.classList.add('active');
}

// Abrir Modal de Registro
function openRegisterModal() {
  document.getElementById('registerModal').classList.add('active');
}

// Cerrar cualquier modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Estado de usuario autenticado
let currentUser = null;
let currentArtisanProfile = null;

// Observador del estado de Autenticación de Firebase
document.addEventListener('DOMContentLoaded', () => {
  if (window.auth && window.authModules) {
    const { onAuthStateChanged } = window.authModules;
    onAuthStateChanged(window.auth, async (user) => {
      currentUser = user;
      updateAuthUI(user);
      if (user) {
        await loadCurrentUserArtisanProfile(user.uid);
      } else {
        currentArtisanProfile = null;
      }
    });
  }

  // Formularios de Auth
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

  const editShopForm = document.getElementById('editShopForm');
  if (editShopForm) editShopForm.addEventListener('submit', handleEditShopSubmit);

  const promoForm = document.getElementById('promoForm');
  if (promoForm) promoForm.addEventListener('submit', handlePromoSubmit);

  const galleryForm = document.getElementById('galleryForm');
  if (galleryForm) galleryForm.addEventListener('submit', handleGallerySubmit);
});

// Actualizar botones del Header según Auth
function updateAuthUI(user) {
  const navActions = document.getElementById('navAuthActions');
  if (!navActions) return;

  if (user) {
    navActions.innerHTML = `
      <button class="btn btn-primary" onclick="openShopManageModal()">
        <i class="fa-solid fa-store"></i> Mi Tienda
      </button>
      <button class="btn btn-secondary" onclick="handleLogout()">
        <i class="fa-solid fa-right-from-bracket"></i> Salir
      </button>
    `;
  } else {
    navActions.innerHTML = `
      <button class="btn btn-secondary" onclick="openLoginModal()">
        <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
      </button>
      <button class="btn btn-primary" onclick="openRegisterModal()">
        <i class="fa-solid fa-plus"></i> Crear Cuenta Artesano
      </button>
    `;
  }
}

// Cargar perfil del artesano autenticado
async function loadCurrentUserArtisanProfile(uid) {
  if (!window.db || !window.firestoreModules) return;
  try {
    const { collection, getDocs, query } = window.firestoreModules;
    const q = query(collection(window.db, "artisans"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.ownerId === uid) {
        currentArtisanProfile = { docId: docSnap.id, ...data };
      }
    });
  } catch (err) {
    console.error('Error al cargar perfil del usuario:', err);
  }
}

// Abrir Modales de Auth
function openLoginModal() { document.getElementById('loginModal').classList.add('active'); }
function openRegisterModal() { document.getElementById('registerModal').classList.add('active'); }

// Iniciar Sesión
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!window.auth || !window.authModules) return;
  const { signInWithEmailAndPassword } = window.authModules;

  try {
    const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
    closeModal('loginModal');
    showToast(`¡Bienvenido de nuevo, ${userCredential.user.email}!`);
  } catch (err) {
    alert(`Error al iniciar sesión: ${err.message}`);
  }
}

// Cerrar Sesión
async function handleLogout() {
  if (!window.auth || !window.authModules) return;
  const { signOut } = window.authModules;
  await signOut(window.auth);
  showToast('Has cerrado sesión correctamente.');
}

// Abrir Modal de Gestión "Mi Tienda"
function openShopManageModal() {
  if (!currentUser) {
    openLoginModal();
    return;
  }

  if (currentArtisanProfile) {
    document.getElementById('editName').value = currentArtisanProfile.name || '';
    document.getElementById('editTrade').value = currentArtisanProfile.trade || '';
    document.getElementById('editPhone').value = currentArtisanProfile.phone || '';
    document.getElementById('editWebsite').value = currentArtisanProfile.website || '';
    document.getElementById('editAddress').value = currentArtisanProfile.address || '';
    document.getElementById('editDescription').value = currentArtisanProfile.description || '';

    // Renderizar Galería actual
    renderGalleryPreviewGrid(currentArtisanProfile.gallery || []);
  }

  document.getElementById('shopManageModal').classList.add('active');
}

// Cambiar Pestañas del Panel
function switchShopTab(tabId) {
  document.querySelectorAll('.shop-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(tabId).style.display = 'block';
  if (tabId === 'tabGeneral') document.getElementById('btnTabGeneral').classList.add('active');
  if (tabId === 'tabPromos') document.getElementById('btnTabPromos').classList.add('active');
  if (tabId === 'tabGallery') document.getElementById('btnTabGallery').classList.add('active');
}

// Guardar Cambios de la Tienda (General & Web)
async function handleEditShopSubmit(e) {
  e.preventDefault();
  if (!currentUser || !currentArtisanProfile) return;

  const updatedData = {
    name: document.getElementById('editName').value,
    trade: document.getElementById('editTrade').value,
    phone: document.getElementById('editPhone').value,
    website: document.getElementById('editWebsite').value,
    address: document.getElementById('editAddress').value,
    description: document.getElementById('editDescription').value,
  };

  if (window.db && window.firestoreModules && currentArtisanProfile.docId) {
    try {
      const { doc, updateDoc } = window.firestoreModules;
      const ref = doc(window.db, "artisans", currentArtisanProfile.docId);
      await updateDoc(ref, updatedData);

      currentArtisanProfile = { ...currentArtisanProfile, ...updatedData };
      await fetchArtisansFromFirebase();
      renderArtisans();
      closeModal('shopManageModal');
      showToast('¡Los datos de tu tienda han sido actualizados!');
    } catch (err) {
      alert(`Error guardando en Firestore: ${err.message}`);
    }
  }
}

// Publicar Promoción
async function handlePromoSubmit(e) {
  e.preventDefault();
  if (!currentUser || !currentArtisanProfile) return;

  const promoTitle = document.getElementById('promoTitle').value;
  const promoDetails = document.getElementById('promoDetails').value;

  const promoData = {
    promo: {
      title: promoTitle,
      details: promoDetails,
      active: true
    }
  };

  if (window.db && window.firestoreModules && currentArtisanProfile.docId) {
    try {
      const { doc, updateDoc } = window.firestoreModules;
      const ref = doc(window.db, "artisans", currentArtisanProfile.docId);
      await updateDoc(ref, promoData);

      currentArtisanProfile.promo = promoData.promo;
      await fetchArtisansFromFirebase();
      renderArtisans();
      closeModal('shopManageModal');
      showToast('¡Promoción publicada con éxito en tu ficha de artesano!');
    } catch (err) {
      alert(`Error al guardar la oferta: ${err.message}`);
    }
  }
}

// Añadir Foto a la Galería
async function handleGallerySubmit(e) {
  e.preventDefault();
  if (!currentUser || !currentArtisanProfile) return;

  const imageUrl = document.getElementById('galleryImageUrl').value;
  const gallery = currentArtisanProfile.gallery || [];
  gallery.push(imageUrl);

  if (window.db && window.firestoreModules && currentArtisanProfile.docId) {
    try {
      const { doc, updateDoc } = window.firestoreModules;
      const ref = doc(window.db, "artisans", currentArtisanProfile.docId);
      await updateDoc(ref, { gallery });

      currentArtisanProfile.gallery = gallery;
      renderGalleryPreviewGrid(gallery);
      await fetchArtisansFromFirebase();
      renderArtisans();
      document.getElementById('galleryImageUrl').value = '';
      showToast('¡Imagen añadida a la galería de tu taller!');
    } catch (err) {
      alert(`Error al añadir la imagen: ${err.message}`);
    }
  }
}

function renderGalleryPreviewGrid(gallery) {
  const container = document.getElementById('galleryPreviewGrid');
  if (!container) return;

  container.innerHTML = gallery.map(url => `
    <div class="artisan-gallery-item">
      <img src="${url}" alt="Trabajo artesanal">
    </div>
  `).join('');
}
  e.preventDefault();

  const name = document.getElementById('inputName').value;
  const category = document.getElementById('inputCategory').value;
  const trade = document.getElementById('inputTrade').value;
  const location = document.getElementById('inputLocation').value;
  const address = document.getElementById('inputAddress').value;
  const phone = document.getElementById('inputPhone').value;
  const email = document.getElementById('inputEmail').value;
  const description = document.getElementById('inputDescription').value;

  // Mapa de imágenes por categoría por defecto
  const defaultImages = {
    ceramica: 'images/ceramics_artisan_1786534790567.png',
    tejido: 'images/textile_artisan_1786534801221.png',
    herreria: 'images/blacksmith_artisan_1786534811595.png',
    tatuaje: 'images/tattoo_artisan_1786534822293.png',
    comida: 'images/bakery_artisan_1786534832288.png'
  };

  const categoryLabels = {
    ceramica: 'Cerámica',
    tejido: 'Tejido & Textil',
    herreria: 'Herrería & Metal',
    tatuaje: 'Tatuaje Artístico',
    comida: 'Comida Artesana'
  };

  const newArtisan = {
    id: Date.now(),
    name,
    trade,
    category,
    categoryLabel: categoryLabels[category] || 'Artesanía',
    rating: 5.0,
    reviewsCount: 1,
    experience: 'Nuevo en la plataforma',
    location,
    address,
    phone,
    email,
    image: defaultImages[category] || 'images/ceramics_artisan_1786534790567.png',
    description,
    fullStory: description,
    hours: 'Consultar al artesano',
    tags: ['Artesanal', 'Local', 'Hecho a Mano']
  };

  // Si Firebase está configurado, guardar en Firestore
  if (window.db && window.firestoreModules) {
    try {
      const { collection, addDoc } = window.firestoreModules;
      await addDoc(collection(window.db, "artisans"), {
        name: newArtisan.name,
        trade: newArtisan.trade,
        category: newArtisan.category,
        categoryLabel: newArtisan.categoryLabel,
        location: newArtisan.location,
        address: newArtisan.address,
        phone: newArtisan.phone,
        email: newArtisan.email,
        description: newArtisan.description,
        fullStory: newArtisan.fullStory,
        image: newArtisan.image,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error al guardar en Firebase Firestore:', err);
    }
  }

  artisans.unshift(newArtisan);
  renderCategories();
  renderArtisans();
  closeModal('registerModal');
  e.target.reset();

  showToast(`¡Bienvenido a la comunidad, ${name}! Tu negocio ha sido publicado con éxito.`);
}

// Notificación Toast
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color: #4CAF50; font-size: 1.3rem;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.4s reverse forwards';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
