import { escapeHtml, openModal, closeModal } from '../../core/utils/domUtils.js';
import { cleanPhoneNumber, renderStarRatingHtml, formatDateEs } from '../../core/utils/formatters.js';
import { DEFAULT_AVATAR_PATH } from '../../core/utils/constants.js';
import { ToastComponent } from '../components/ToastComponent.js';
import { ReviewCardComponent } from '../components/ReviewCardComponent.js';
import { ProjectCardComponent } from '../components/ProjectCardComponent.js';
import { LightboxComponent } from '../components/LightboxComponent.js';

/**
 * Controlador de la Página de Perfil Público del Artesano (perfil.html)
 */
export class ProfileController {
  constructor(getArtisansUseCase, authUseCases, reviewUseCases) {
    this.getArtisansUseCase = getArtisansUseCase;
    this.authUseCases = authUseCases;
    this.reviewUseCases = reviewUseCases;
    this.artisan = null;
    this.currentLoggedUser = null;
    this.activeProjectIdForComments = null;
    this.currentProjects = [];
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const artisanId = urlParams.get('id');

    this.artisan = await this.getArtisansUseCase.getById(artisanId);

    if (!this.artisan) {
      this.renderNotFound();
      return;
    }

    this.setupAuthListener();
    this.renderHeaderAndHero();
    this.renderPromoBanner();
    this.renderProjectsGrid();
    this.renderContactInfo();
    this.setupProjectCommentForm();
    this.bindGlobalWindowMethods();
  }

  renderNotFound() {
    document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 2rem;">
        <h2 style="color: #3E2723; margin-bottom: 0.5rem;">Artesano no encontrado</h2>
        <p style="color: #6D4C41; margin-bottom: 1.5rem;">No pudimos cargar la información de este taller artesanal.</p>
        <a href="index.html" class="btn btn-primary" style="text-decoration: none; padding: 0.8rem 1.6rem; background: #C06C4C; color: #FFF; border-radius: 8px;">← Volver al Directorio</a>
      </div>
    `;
  }

  isOwnerUser() {
    if (!this.currentLoggedUser || !this.artisan) return false;
    return this.currentLoggedUser.uid === this.artisan.ownerId || 
      (this.artisan.ownerId && this.artisan.ownerId.includes(this.currentLoggedUser.uid));
  }

  setupAuthListener() {
    this.authUseCases.onAuthStateChanged(async (user) => {
      this.currentLoggedUser = user;
      const navContainer = document.getElementById('perfilNavAuth');
      const authorInput = document.getElementById('reviewAuthorName');
      const projAuthorInput = document.getElementById('projectCommentAuthor');
      const btnOwnerManage = document.getElementById('btnOwnerManage');

      if (user) {
        const isArtisan = (user.profile && user.profile.role === 'artisan');
        const name = (user.profile && user.profile.displayName) || (user.email ? user.email.split('@')[0] : 'Usuario');

        if (authorInput) {
          authorInput.value = name;
          authorInput.disabled = true;
        }
        if (projAuthorInput) {
          projAuthorInput.value = name;
          projAuthorInput.disabled = true;
        }

        if (navContainer) {
          navContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <span style="font-size: 0.88rem; color: var(--primary-dark); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; background: var(--bg-subtle); padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid var(--border-color);">
                <i class="fa-solid ${isArtisan ? 'fa-store' : 'fa-user'}" style="color: var(--terracotta);"></i> ${escapeHtml(name)}
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">(${isArtisan ? 'Taller' : 'Cliente'})</span>
              </span>
              ${isArtisan ? `
                <a href="index.html?manage=true" class="btn btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
                  <i class="fa-solid fa-sliders"></i> Gestionar mi tienda
                </a>
              ` : `
                <a href="index.html?account=true" class="btn btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
                  <i class="fa-solid fa-user-gear"></i> Mi Cuenta
                </a>
              `}
              <button class="btn btn-secondary" id="btnPerfilLogout" style="padding: 0.45rem 0.8rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
              </button>
            </div>
          `;

          const logoutBtn = document.getElementById('btnPerfilLogout');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
              await this.authUseCases.logout();
              window.location.reload();
            });
          }
        }

        if (btnOwnerManage && this.isOwnerUser()) {
          btnOwnerManage.style.display = 'inline-block';
        }
      }

      await this.renderReviewsSection();
    });
  }

  renderHeaderAndHero() {
    const a = this.artisan;
    const safeName = escapeHtml(a.name);
    const safeImage = a.image || DEFAULT_AVATAR_PATH;
    const cleanPhone = cleanPhoneNumber(a.phone);
    const isWhatsappAllowed = a.allowWhatsapp !== false && cleanPhone.length > 0;

    document.title = `${safeName} | Perfil de Artesano`;
    const avatarEl = document.getElementById('profileAvatar');
    const bgEl = document.getElementById('profileBg');
    const nameEl = document.getElementById('profileName');
    const tradeEl = document.getElementById('profileTrade');
    const catEl = document.getElementById('profileCategory');
    const descEl = document.getElementById('profileDesc');
    const locEl = document.getElementById('profileLocation');
    const expEl = document.getElementById('profileExperience');

    if (avatarEl) avatarEl.src = safeImage;
    if (bgEl) bgEl.style.backgroundImage = `url('${safeImage}')`;
    if (nameEl) nameEl.textContent = a.name;
    if (tradeEl) tradeEl.textContent = a.trade || 'Artesanía';
    if (catEl) catEl.textContent = a.categoryLabel || 'Artesano verificado';
    if (descEl) descEl.textContent = a.description || '';
    if (locEl) locEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(a.location || 'España')}`;
    if (expEl) expEl.innerHTML = `<i class="fa-solid fa-certificate"></i> ${escapeHtml(a.experience || 'Artesano verificado')}`;

    // Insignias meta chips
    const chipsContainer = document.querySelector('.profile-meta-chips');
    if (chipsContainer) {
      let extraChips = '';
      if (a.acceptsCustomOrders !== false) {
        extraChips += `<span class="profile-chip badge-custom-orders" style="background: rgba(197, 160, 89, 0.2); border-color: var(--warm-gold); color: #FFF;"><i class="fa-solid fa-wand-magic-sparkles"></i> Encargos a Medida</span>`;
      }
      if (a.isVisitable === true) {
        extraChips += `<span class="profile-chip badge-visitable" style="background: rgba(192, 108, 76, 0.25); border-color: var(--terracotta); color: #FFF;"><i class="fa-solid fa-store"></i> Taller Visitable</span>`;
      }
      if (extraChips) {
        chipsContainer.insertAdjacentHTML('beforeend', extraChips);
      }
    }

    this.updateRatingUI(a.rating, a.reviewsCount || 0);

    // Botón WhatsApp
    const btnWa = document.getElementById('btnWhatsapp');
    if (btnWa) {
      if (isWhatsappAllowed) {
        const defaultMsg = `¡Hola! He visto tu taller "${a.name}" en Arte y Sanos y me gustaría pedirte información o consultar por tus trabajos.`;
        btnWa.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;
        btnWa.style.display = 'inline-block';
      } else {
        btnWa.style.display = 'none';
      }
    }

    // Botón Web Oficial
    const btnWeb = document.getElementById('btnWebsite');
    if (btnWeb) {
      if (a.website) {
        btnWeb.href = a.website;
        btnWeb.style.display = 'inline-block';
      } else {
        btnWeb.style.display = 'none';
      }
    }
  }

  updateRatingUI(rating, count) {
    const num = Number(rating || 5.0).toFixed(1);
    const scoreNum = document.getElementById('summaryScoreNum');
    const scoreCount = document.getElementById('summaryScoreCount');
    const profileRating = document.getElementById('profileRating');
    const scoreStars = document.getElementById('summaryScoreStars');

    if (profileRating) {
      profileRating.innerHTML = `<i class="fa-solid fa-star" style="color: var(--warm-gold);"></i> ${num} (${count} opiniones)`;
    }
    if (scoreNum) scoreNum.textContent = num;
    if (scoreCount) scoreCount.textContent = `Basado en ${count} opinión(es)`;
    if (scoreStars) scoreStars.innerHTML = renderStarRatingHtml(rating);
  }

  renderPromoBanner() {
    const promo = this.artisan.promo;
    const promoBox = document.getElementById('promoBannerContainer');
    if (!promoBox) return;

    if (promo && promo.active) {
      const cleanPhone = cleanPhoneNumber(this.artisan.phone);
      const isWhatsappAllowed = this.artisan.allowWhatsapp !== false && cleanPhone.length > 0;

      promoBox.style.display = 'block';
      promoBox.innerHTML = `
        <div style="background: rgba(197, 160, 89, 0.15); border: 1px solid var(--warm-gold); padding: 1.5rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="color: var(--warm-gold-hover); font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; gap: 0.6rem;">
              <i class="fa-solid fa-tag"></i> Promoción Activa: ${escapeHtml(promo.title)}
            </div>
            <p style="color: var(--text-primary); font-size: 1rem; margin-top: 0.3rem;">${escapeHtml(promo.details || '')}</p>
          </div>
          ${isWhatsappAllowed ? `
            <a href="https://wa.me/${cleanPhone}?text=Hola,%20quisiera%20aprovechar%20la%20oferta:%20${encodeURIComponent(promo.title)}" target="_blank" class="btn btn-gold">
              Reclamar Oferta por WhatsApp
            </a>
          ` : ''}
        </div>
      `;
    } else {
      promoBox.style.display = 'none';
    }
  }

  renderProjectsGrid() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    let projectItems = [];
    if (this.artisan.projects && this.artisan.projects.length > 0) {
      projectItems = this.artisan.projects;
    } else if (this.artisan.gallery && this.artisan.gallery.length > 0) {
      projectItems = this.artisan.gallery.map((g, i) => ({
        id: `g_${i}`,
        title: g.title || `Proyecto #${i + 1}`,
        category: this.artisan.categoryLabel || 'Artesanía',
        date: "Ficha del Taller",
        mainImage: g.url || this.artisan.image,
        desc: g.desc || "Fotografía original del taller y piezas elaboradas a mano.",
        steps: [
          { title: "Detalle del Proceso", img: g.url || this.artisan.image, desc: g.desc || "Elaboración en taller artesanal." }
        ]
      }));
    } else {
      projectItems = [{
        id: "p_default",
        title: "Proceso de Elaboración Artesanal",
        category: this.artisan.categoryLabel || 'Artesanía',
        date: "Reciente",
        mainImage: this.artisan.image,
        desc: "Muestra de técnicas manuales aplicadas en la creación de cada obra.",
        steps: [{ title: "Fase de Creación", img: this.artisan.image, desc: "Trabajo minucioso hecho a mano." }]
      }];
    }

    this.currentProjects = projectItems;
    window.currentArtisanProjects = projectItems;

    projectsGrid.innerHTML = projectItems.map((proj, idx) => ProjectCardComponent.renderCard(proj, idx)).join('');
  }

  async openProjectModal(idx) {
    const proj = this.currentProjects[idx];
    if (!proj) return;

    this.activeProjectIdForComments = proj.id || `proj_${idx}`;

    const safeTitle = escapeHtml(proj.title || 'Proyecto');
    const safeCategory = escapeHtml(proj.category || 'Proyecto');
    const hasPrice = proj.price && proj.price.trim().length > 0;
    const hasMaterials = proj.materials && proj.materials.trim().length > 0;
    const hasTime = proj.timeSpent && proj.timeSpent.trim().length > 0;

    document.getElementById('modalProjTitle').textContent = proj.title || 'Proyecto';
    document.getElementById('modalProjCategory').innerHTML = `<i class="fa-solid fa-folder"></i> ${safeCategory}`;
    document.getElementById('modalProjDate').innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${proj.date || 'Reciente'}`;
    document.getElementById('modalProjDesc').textContent = proj.desc || '';

    // Precio badge
    const priceBadge = document.getElementById('modalProjPriceBadge');
    if (priceBadge) {
      if (hasPrice) {
        priceBadge.innerHTML = `<i class="fa-solid fa-tag"></i> ${escapeHtml(proj.price)}`;
        priceBadge.style.display = 'inline-flex';
      } else {
        priceBadge.style.display = 'none';
      }
    }

    // Ficha Técnica
    const techSheet = document.getElementById('modalProjTechSheet');
    const itemPrice = document.getElementById('techItemPrice');
    const itemMaterials = document.getElementById('techItemMaterials');
    const itemTime = document.getElementById('techItemTime');

    if (hasPrice || hasMaterials || hasTime) {
      techSheet.style.display = 'block';
      if (itemPrice) {
        itemPrice.style.display = hasPrice ? 'flex' : 'none';
        document.getElementById('modalProjPrice').textContent = proj.price || '';
      }
      if (itemMaterials) {
        itemMaterials.style.display = hasMaterials ? 'flex' : 'none';
        document.getElementById('modalProjMaterials').textContent = proj.materials || '';
      }
      if (itemTime) {
        itemTime.style.display = hasTime ? 'flex' : 'none';
        document.getElementById('modalProjTimeSpent').textContent = proj.timeSpent || '';
      }
    } else {
      techSheet.style.display = 'none';
    }

    // WhatsApp para esta pieza
    const cleanPhone = cleanPhoneNumber(this.artisan.phone);
    const isWhatsappAllowed = this.artisan.allowWhatsapp !== false && cleanPhone.length > 0;
    const waContainer = document.getElementById('modalProjWhatsappContainer');
    const waBtn = document.getElementById('modalProjWhatsappBtn');
    if (waContainer && waBtn) {
      if (isWhatsappAllowed) {
        const pieceMsg = `¡Hola! He visto tu trabajo "${proj.title}" en Arte y Sanos y me gustaría pedirte información o consultar presupuesto.`;
        waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pieceMsg)}`;
        waContainer.style.display = 'block';
      } else {
        waContainer.style.display = 'none';
      }
    }

    // Pasos del proyecto
    const stepsContainer = document.getElementById('modalProjSteps');
    stepsContainer.style.display = 'grid';
    stepsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
    stepsContainer.style.gap = '1.2rem';

    if (proj.steps && proj.steps.length > 0) {
      stepsContainer.innerHTML = proj.steps.map(step => ProjectCardComponent.renderStepCard(step)).join('');
    } else {
      stepsContainer.innerHTML = `
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; cursor: pointer;" onclick="window.openLightboxModal('${proj.mainImage}', '${safeTitle.replace(/'/g, "\\'")}')">
          <img src="${proj.mainImage}" alt="${safeTitle}" style="width: 100%; height: 200px; object-fit: cover;">
        </div>
      `;
    }

    await this.renderProjectComments(this.activeProjectIdForComments);
    openModal('projectDetailModal');
  }

  closeProjectModal() {
    closeModal('projectDetailModal');
  }

  async renderProjectComments(projectId) {
    const listContainer = document.getElementById('projectCommentsList');
    if (!listContainer) return;

    let comments = [];
    try {
      comments = await this.reviewUseCases.getProjectComments(projectId);
    } catch (e) {
      comments = [];
    }

    if (comments.length === 0) {
      listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.88rem; margin: 0.5rem 0;">Aún no hay comentarios sobre esta obra. ¡Sé el primero en consultar!</p>`;
      return;
    }

    const isOwner = this.isOwnerUser();

    listContainer.innerHTML = comments.map(c => {
      const safeAuthor = escapeHtml(c.userName || 'Usuario');
      const safeText = escapeHtml(c.comment || '');
      const dateFormatted = formatDateEs(c.createdAt);

      let replyHtml = '';
      if (c.reply && c.reply.replyText) {
        const safeReplyAuthor = escapeHtml(c.reply.artisanName || 'Taller');
        const safeReplyText = escapeHtml(c.reply.replyText);
        const replyDate = formatDateEs(c.reply.repliedAt);

        replyHtml = `
          <div style="margin-top: 0.6rem; padding: 0.6rem 0.9rem; background: #FFF; border-left: 3px solid var(--terracotta); border-radius: 4px; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
              <strong style="color: var(--primary-dark); font-size: 0.82rem;"><i class="fa-solid fa-reply"></i> ${safeReplyAuthor}</strong>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${replyDate}</span>
            </div>
            <p style="color: var(--text-secondary); margin: 0; line-height: 1.4;">${safeReplyText}</p>
          </div>
        `;
      }

      let replyBtnHtml = '';
      if (isOwner && (!c.reply || !c.reply.replyText)) {
        replyBtnHtml = `
          <div style="margin-top: 0.4rem; text-align: right;">
            <button type="button" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="window.toggleProjectCommentReplyForm('${c.id}')">
              <i class="fa-solid fa-reply"></i> Responder consulta
            </button>
          </div>
        `;
      }

      return `
        <div style="background: #FFF; padding: 0.9rem 1.1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.6rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
            <strong style="color: var(--primary-dark); font-size: 0.9rem;">${safeAuthor}</strong>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${dateFormatted}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0; line-height: 1.4;">${safeText}</p>
          ${replyHtml}
          ${replyBtnHtml}
          <div id="replyCommentForm_${c.id}" style="display: none; margin-top: 0.6rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
            <form onsubmit="window.handleSendCommentReply(event, '${c.id}')">
              <input type="text" id="replyCommentInput_${c.id}" class="form-input" placeholder="Escribe tu respuesta a esta consulta..." required style="margin-bottom: 0.5rem; font-size: 0.85rem; padding: 0.5rem 0.8rem;">
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="window.toggleProjectCommentReplyForm('${c.id}')">Cancelar</button>
                <button type="submit" class="btn btn-primary" style="padding: 0.25rem 0.7rem; font-size: 0.75rem;">
                  <i class="fa-solid fa-paper-plane"></i> Responder
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
    }).join('');
  }

  setupProjectCommentForm() {
    const form = document.getElementById('projectCommentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.activeProjectIdForComments) return;

      const isOwner = this.isOwnerUser();
      const author = isOwner
        ? `${this.artisan.name} (Taller)`
        : ((this.currentLoggedUser && this.currentLoggedUser.profile && this.currentLoggedUser.profile.displayName) || document.getElementById('projectCommentAuthor').value);
      
      const textInput = document.getElementById('projectCommentText');
      const text = textInput.value;

      try {
        await this.reviewUseCases.addProjectComment(this.activeProjectIdForComments, this.artisan.id, {
          userId: this.currentLoggedUser ? this.currentLoggedUser.uid : 'anon',
          userName: author,
          comment: text
        });

        textInput.value = '';
        ToastComponent.show(isOwner ? '💬 Aclaración del taller añadida al proyecto' : '💬 Comentario añadido al proyecto');
        await this.renderProjectComments(this.activeProjectIdForComments);
      } catch (err) {
        alert('Error al publicar comentario: ' + err.message);
      }
    });
  }

  async renderReviewsSection() {
    const listContainer = document.getElementById('reviewsListContainer');
    const newReviewBox = document.getElementById('newReviewBox');
    if (!listContainer) return;

    const isOwner = this.isOwnerUser();

    if (newReviewBox) {
      if (isOwner) {
        newReviewBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(192, 108, 76, 0.15); color: var(--terracotta); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
              <i class="fa-solid fa-store"></i>
            </div>
            <div style="flex: 1;">
              <h4 style="color: var(--primary-dark); font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;">Eres el titular de este taller artesanal</h4>
              <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0; line-height: 1.5;">
                Las valoraciones de estrellas están reservadas para tus clientes. Como artesano, puedes <strong>responder a los comentarios y opiniones</strong> que te dejen a continuación.
              </p>
            </div>
          </div>
        `;
      } else {
        const defaultName = (this.currentLoggedUser && this.currentLoggedUser.profile && this.currentLoggedUser.profile.displayName) || '';
        newReviewBox.innerHTML = `
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--primary-dark); margin-bottom: 1.2rem;">
            <i class="fa-solid fa-comment-dots" style="color: var(--terracotta);"></i> Deja tu Valoración y Comentario
          </h3>

          <form id="artisanReviewForm">
            <div style="margin-bottom: 1.2rem;">
              <label class="form-label" style="margin-bottom: 0.4rem;">Tu Puntuación General *</label>
              <div class="star-rating-select" id="starRatingSelect">
                <i class="fa-solid fa-star active" data-value="1"></i>
                <i class="fa-solid fa-star active" data-value="2"></i>
                <i class="fa-solid fa-star active" data-value="3"></i>
                <i class="fa-solid fa-star active" data-value="4"></i>
                <i class="fa-solid fa-star active" data-value="5"></i>
              </div>
              <input type="hidden" id="reviewRatingInput" value="5">
            </div>

            <div id="guestReviewerFields" class="form-row" style="margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label">Tu Nombre o Alias *</label>
                <input type="text" id="reviewAuthorName" class="form-input" placeholder="ej. Lucía Morales" value="${escapeHtml(defaultName)}" ${this.currentLoggedUser ? 'disabled' : ''} required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label">Tu Opinión sobre el Artesano *</label>
              <textarea id="reviewCommentText" class="form-textarea" rows="4" placeholder="Describe tu experiencia, calidad del trabajo, trato recibido, etc..." required></textarea>
            </div>

            <button type="submit" id="btnSubmitReview" class="btn btn-primary">
              <i class="fa-solid fa-paper-plane"></i> Publicar Reseña
            </button>
          </form>
        `;

        this.setupStarRatingEvents();
        this.setupReviewFormEvent();
      }
    }

    let reviews = [];
    try {
      reviews = await this.reviewUseCases.getArtisanReviews(this.artisan.id);
    } catch (e) {
      reviews = [];
    }

    if (reviews.length === 0) {
      listContainer.innerHTML = `
        <div style="background: #FFFFFF; padding: 2rem; text-align: center; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted);">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; margin-bottom: 0.6rem; color: var(--terracotta);"></i>
          <p>Aún no hay opiniones para este artesano. ¡Sé el primero en calificarlo!</p>
        </div>
      `;
      return;
    }

    const total = reviews.length;
    const avg = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / total;
    this.updateRatingUI(avg, total);

    listContainer.innerHTML = reviews.map(r => ReviewCardComponent.render(r, {
      isOwner,
      currentUserId: this.currentLoggedUser ? this.currentLoggedUser.uid : null
    })).join('');
  }

  setupStarRatingEvents() {
    const starContainer = document.getElementById('starRatingSelect');
    const ratingInput = document.getElementById('reviewRatingInput');
    if (!starContainer || !ratingInput) return;

    const stars = starContainer.querySelectorAll('i');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'), 10);
        ratingInput.value = val;
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-value'), 10);
          if (sVal <= val) {
            s.className = 'fa-solid fa-star active';
          } else {
            s.className = 'fa-regular fa-star';
          }
        });
      });
    });
  }

  setupReviewFormEvent() {
    const form = document.getElementById('artisanReviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = document.getElementById('reviewRatingInput').value;
      const comment = document.getElementById('reviewCommentText').value;
      const author = (this.currentLoggedUser && this.currentLoggedUser.profile && this.currentLoggedUser.profile.displayName) || document.getElementById('reviewAuthorName').value;

      const btn = document.getElementById('btnSubmitReview');
      if (btn) btn.disabled = true;

      try {
        const res = await this.reviewUseCases.addReview(this.artisan.id, {
          userId: this.currentLoggedUser ? this.currentLoggedUser.uid : 'anon',
          userName: author,
          rating,
          comment
        });

        ToastComponent.show('✨ ¡Gracias por tu valoración!');
        form.reset();
        await this.renderReviewsSection();
      } catch (err) {
        alert('Error al enviar opinión: ' + err.message);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  renderContactInfo() {
    const a = this.artisan;
    const fullStoryEl = document.getElementById('profileFullStory');
    const phoneEl = document.getElementById('contactPhone');
    const emailEl = document.getElementById('contactEmail');
    const addressEl = document.getElementById('contactAddress');
    const hoursEl = document.getElementById('contactHours');
    const tagsEl = document.getElementById('profileTags');

    if (fullStoryEl) fullStoryEl.textContent = a.fullStory || a.description || 'Sin historia detallada registrada.';
    if (phoneEl) phoneEl.textContent = a.phone || 'No especificado';
    if (emailEl) emailEl.textContent = a.email || 'No especificado';
    if (addressEl) addressEl.textContent = `${a.address || 'Taller artesanal'} (${a.location || 'España'})`;
    if (hoursEl) hoursEl.textContent = a.hours || 'Consultar con el artesano';

    if (tagsEl && a.tags) {
      tagsEl.innerHTML = a.tags.map(t => `<span class="hero-badge" style="margin:0;">#${escapeHtml(t)}</span>`).join('');
    }
  }

  bindGlobalWindowMethods() {
    window.openProjectModal = (idx) => this.openProjectModal(idx);
    window.closeProjectModal = () => this.closeProjectModal();
    window.openLightboxModal = (url, cap) => LightboxComponent.open(url, cap);
    window.closeLightboxModal = () => LightboxComponent.close();

    window.toggleReviewReplyForm = (revId) => {
      const el = document.getElementById(`replyFormContainer_${revId}`);
      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    };

    window.handleSendReviewReply = async (e, revId) => {
      e.preventDefault();
      const input = document.getElementById(`replyInput_${revId}`);
      const text = input ? input.value : '';
      if (!text) return;

      try {
        const artisanName = (this.currentLoggedUser && this.currentLoggedUser.profile && this.currentLoggedUser.profile.displayName) || this.artisan.name;
        await this.reviewUseCases.replyToReview(revId, {
          artisanUid: this.currentLoggedUser ? this.currentLoggedUser.uid : this.artisan.ownerId,
          artisanName,
          replyText: text
        });

        ToastComponent.show('💬 Respuesta enviada con éxito');
        await this.renderReviewsSection();
      } catch (err) {
        alert('Error al responder: ' + err.message);
      }
    };

    window.toggleProjectCommentReplyForm = (comId) => {
      const el = document.getElementById(`replyCommentForm_${comId}`);
      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    };

    window.handleSendCommentReply = async (e, comId) => {
      e.preventDefault();
      const input = document.getElementById(`replyCommentInput_${comId}`);
      const text = input ? input.value : '';
      if (!text) return;

      try {
        const artisanName = (this.currentLoggedUser && this.currentLoggedUser.profile && this.currentLoggedUser.profile.displayName) || this.artisan.name;
        await this.reviewUseCases.replyToProjectComment(comId, {
          artisanUid: this.currentLoggedUser ? this.currentLoggedUser.uid : this.artisan.ownerId,
          artisanName,
          replyText: text
        });

        ToastComponent.show('💬 Respuesta publicada para el comentario');
        if (this.activeProjectIdForComments) {
          await this.renderProjectComments(this.activeProjectIdForComments);
        }
      } catch (err) {
        alert('Error al responder comentario: ' + err.message);
      }
    };
  }
}
