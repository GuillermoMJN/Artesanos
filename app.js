// Datos iniciales de artesanos (Prototipo)
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

// Elementos DOM
document.addEventListener('DOMContentLoaded', () => {
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

  // Filtrado combinado (Categoría + Búsqueda)
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
          <button class="btn btn-secondary" style="width: 100%; font-size: 0.85rem;" onclick="openArtisanModal(${artisan.id})">
            Ver Negocio & Contacto <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
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

// Procesar formulario de nuevo artesano
function handleNewArtisanSubmit(e) {
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
