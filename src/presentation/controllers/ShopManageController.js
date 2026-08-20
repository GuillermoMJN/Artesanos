import { openModal, closeModal } from '../../core/utils/domUtils.js';
import { ToastComponent } from '../components/ToastComponent.js';

/**
 * Controlador del Panel de Gestión del Taller Artesanal (Modal)
 */
export class ShopManageController {
  constructor(manageShopUseCases, authUseCases, onShopUpdated) {
    this.manageShopUseCases = manageShopUseCases;
    this.authUseCases = authUseCases;
    this.onShopUpdated = onShopUpdated;
    this.currentArtisanProfile = null;
    this.currentUser = null;
    this.tempProjectFiles = [];
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
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

    const avatarInput = document.getElementById('avatarFileInput');
    if (avatarInput) avatarInput.addEventListener('change', (e) => this.handleAvatarChange(e));

    const projectFilesInput = document.getElementById('projectMediaFiles');
    if (projectFilesInput) projectFilesInput.addEventListener('change', (e) => this.handleProjectFilesSelected(e));
  }

  setCurrentState(user, artisanProfile) {
    this.currentUser = user;
    this.currentArtisanProfile = artisanProfile;
  }

  openShopManageModal() {
    if (!this.currentUser) {
      openModal('loginModal');
      return;
    }

    const isArtisan = (this.currentUser.profile && this.currentUser.profile.role === 'artisan') || !!this.currentArtisanProfile;
    if (!isArtisan) {
      ToastComponent.show('ℹ️ Tu cuenta está registrada como Usuario / Cliente. El panel de gestión está reservado para Comercios y Artesanos.');
      return;
    }

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

      const editAcceptsCustomOrders = document.getElementById('editAcceptsCustomOrders');
      if (editAcceptsCustomOrders) editAcceptsCustomOrders.checked = p.acceptsCustomOrders !== false;

      const editIsVisitable = document.getElementById('editIsVisitable');
      if (editIsVisitable) editIsVisitable.checked = p.isVisitable === true;

      if (editName) editName.value = p.name || '';
      if (editTrade) editTrade.value = p.trade || '';
      if (editCategory) editCategory.value = p.category || 'ceramica';
      if (editLocation) editLocation.value = p.location || '';
      if (editPhone) editPhone.value = p.phone || '';
      if (editWebsite) editWebsite.value = p.website || '';
      if (editAddress) editAddress.value = p.address || '';
      if (editDescription) editDescription.value = p.description || '';
      if (avatarPreview) avatarPreview.src = p.image || 'images/default_avatar.svg';

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
    }

    this.switchShopTab('tabGeneral');
    openModal('shopManageModal');
  }

  switchShopTab(tabId) {
    document.querySelectorAll('.shop-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#shopManageModal .tab-btn').forEach(el => el.classList.remove('active'));

    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.style.display = 'block';

    if (tabId === 'tabGeneral') document.getElementById('btnTabGeneral')?.classList.add('active');
    if (tabId === 'tabGallery') document.getElementById('btnTabGallery')?.classList.add('active');
    if (tabId === 'tabPromos') document.getElementById('btnTabPromos')?.classList.add('active');
    if (tabId === 'tabSecurity') document.getElementById('btnTabSecurity')?.classList.add('active');
  }

  async handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('avatarUploadStatus');
    const previewEl = document.getElementById('avatarEditPreview');

    const reader = new FileReader();
    reader.onload = (re) => {
      if (previewEl) previewEl.src = re.target.result;
    };
    reader.readAsDataURL(file);

    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subiendo foto a Firebase Storage...`;

    try {
      const artisanDocId = this.currentArtisanProfile ? this.currentArtisanProfile.docId : null;
      const uploadedUrl = await this.authUseCases.updateAvatar(file, artisanDocId);

      if (this.currentArtisanProfile) {
        this.currentArtisanProfile.image = uploadedUrl;
      }

      if (previewEl) previewEl.src = uploadedUrl;
      if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i> Foto actualizada correctamente`;

      if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
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
    document.getElementById('projectInputPrice').value = "";
    document.getElementById('projectInputMaterials').value = "";
    document.getElementById('projectInputTimeSpent').value = "";
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
        const fileUrl = await this.manageShopUseCases.uploadProjectFile(file, artisanUid, projectUid);
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
    const price = (document.getElementById('projectInputPrice') && document.getElementById('projectInputPrice').value.trim()) || "";
    const materials = (document.getElementById('projectInputMaterials') && document.getElementById('projectInputMaterials').value.trim()) || "";
    const timeSpent = (document.getElementById('projectInputTimeSpent') && document.getElementById('projectInputTimeSpent').value.trim()) || "";
    const desc = document.getElementById('projectInputDesc').value;
    const editingIdx = parseInt(document.getElementById('editingProjectIdx').value, 10);

    const mediaFiles = this.tempProjectFiles || [];
    if (mediaFiles.length === 0) {
      alert("Por favor pulsa 'Seleccionar Archivos' y sube al menos una fotografía o vídeo para este trabajo.");
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
      price,
      materials,
      timeSpent,
      category: this.currentArtisanProfile.categoryLabel || "Artesanía",
      date: "Publicación reciente",
      mainImage,
      desc: desc || "Trabajo artesanal publicado desde la tienda.",
      steps
    };

    const btnSave = document.getElementById('btnSaveProject');
    if (btnSave) btnSave.disabled = true;

    try {
      const existingId = (editingIdx >= 0 && projects[editingIdx]) ? projects[editingIdx].id : null;
      const savedProj = await this.manageShopUseCases.saveProject(this.currentArtisanProfile.docId, projectData, existingId);

      if (editingIdx >= 0) {
        projects[editingIdx] = savedProj;
      } else {
        projects.unshift(savedProj);
      }

      this.currentArtisanProfile.projects = projects;
      this.renderProjectsManagerGrid();
      this.hideProjectForm();

      if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
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
    if (document.getElementById('projectInputPrice')) document.getElementById('projectInputPrice').value = proj.price || "";
    if (document.getElementById('projectInputMaterials')) document.getElementById('projectInputMaterials').value = proj.materials || "";
    if (document.getElementById('projectInputTimeSpent')) document.getElementById('projectInputTimeSpent').value = proj.timeSpent || "";
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
        await this.manageShopUseCases.deleteProject(this.currentArtisanProfile.docId, targetProj.id);
      } catch (err) {
        console.warn("Error borrando proyecto:", err);
      }
    }

    projects.splice(idx, 1);
    this.currentArtisanProfile.projects = projects;
    this.renderProjectsManagerGrid();

    if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
    ToastComponent.show("🗑️ Trabajo eliminado de tu catálogo.");
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
      allowWhatsapp: document.getElementById('editAllowWhatsapp') ? document.getElementById('editAllowWhatsapp').checked : true,
      acceptsCustomOrders: document.getElementById('editAcceptsCustomOrders') ? document.getElementById('editAcceptsCustomOrders').checked : true,
      isVisitable: document.getElementById('editIsVisitable') ? document.getElementById('editIsVisitable').checked : false
    };

    if (this.currentArtisanProfile.docId) {
      try {
        await this.manageShopUseCases.updateShopProfile(this.currentArtisanProfile.docId, updatedData);
        this.currentArtisanProfile = { ...this.currentArtisanProfile, ...updatedData };
        closeModal('shopManageModal');
        if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
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
      title: promoTitle,
      details: promoDetails,
      active: true
    };

    if (this.currentArtisanProfile.docId) {
      try {
        await this.manageShopUseCases.updatePromo(this.currentArtisanProfile.docId, promoData);
        this.currentArtisanProfile.promo = promoData;
        closeModal('shopManageModal');
        if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
        ToastComponent.show('🏷️ ¡Promoción publicada con éxito!');
      } catch (err) {
        alert(`Error al guardar oferta: ${err.message}`);
      }
    }
  }

  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currPass = document.getElementById('inputPasswordCurrent').value;
    const newPass = document.getElementById('inputPasswordNew').value;

    try {
      await this.authUseCases.changePassword(currPass, newPass);
      e.target.reset();
      ToastComponent.show('🔑 ¡Contraseña cambiada con éxito!');
    } catch (err) {
      alert(`Error al cambiar contraseña: ${err.message}`);
    }
  }

  async handleChangeEmailSubmit(e) {
    e.preventDefault();
    const newEmail = document.getElementById('inputNewEmail').value;
    const currPass = document.getElementById('inputEmailCurrentPassword').value;

    try {
      await this.authUseCases.changeEmail(currPass, newEmail);
      e.target.reset();
      ToastComponent.show(`✉️ Correo electrónico actualizado a ${newEmail}`);
    } catch (err) {
      alert(`Error al actualizar correo: ${err.message}`);
    }
  }
}
