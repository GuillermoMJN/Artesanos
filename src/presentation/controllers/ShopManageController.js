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

    // Subida de foto de avatar/taller
    const inputAvatarFile = document.getElementById('inputAvatarFile') || document.getElementById('avatarFileInput');
    if (inputAvatarFile) inputAvatarFile.addEventListener('change', (e) => this.handleAvatarChange(e));

    const projectFilesInput = document.getElementById('projectMediaFiles');
    if (projectFilesInput) projectFilesInput.addEventListener('change', (e) => this.handleProjectFilesSelected(e));

    // Listeners dinámicos para los toggles de WhatsApp y Taller Visitable
    const toggleWhatsapp = document.getElementById('editAllowWhatsapp');
    if (toggleWhatsapp) {
      toggleWhatsapp.addEventListener('change', () => this.updateConditionalRequirements());
    }

    const toggleVisitable = document.getElementById('editIsVisitable');
    if (toggleVisitable) {
      toggleVisitable.addEventListener('change', () => this.updateConditionalRequirements());
    }
  }

  updateConditionalRequirements() {
    const editPhone = document.getElementById('editPhone');
    const labelPhone = document.getElementById('labelEditPhone');
    const toggleWhatsapp = document.getElementById('editAllowWhatsapp');

    const editAddress = document.getElementById('editAddress');
    const labelAddress = document.getElementById('labelEditAddress');
    const toggleVisitable = document.getElementById('editIsVisitable');

    // Teléfono obligatorio solo si el botón de WhatsApp está activo
    if (toggleWhatsapp && toggleWhatsapp.checked) {
      if (editPhone) editPhone.required = true;
      if (labelPhone) labelPhone.innerHTML = `Teléfono de Contacto (WhatsApp) <span style="color: #D32F2F;">*</span>`;
    } else {
      if (editPhone) editPhone.required = false;
      if (labelPhone) labelPhone.textContent = `Teléfono de Contacto (Opcional)`;
    }

    // Dirección obligatoria solo si se marca como Taller Visitable
    if (toggleVisitable && toggleVisitable.checked) {
      if (editAddress) editAddress.required = true;
      if (labelAddress) labelAddress.innerHTML = `Dirección Física del Taller <span style="color: #D32F2F;">*</span>`;
    } else {
      if (editAddress) editAddress.required = false;
      if (labelAddress) labelAddress.textContent = `Dirección Física del Taller (Opcional)`;
    }
  }

  setCurrentState(user, artisanProfile) {
    this.currentUser = user;
    this.currentArtisanProfile = artisanProfile;
  }

  async openShopManageModal() {
    if (!this.currentUser) {
      openModal('loginModal');
      return;
    }

    const isArtisan = (this.currentUser.profile && this.currentUser.profile.role === 'artisan') || !!this.currentArtisanProfile;
    if (!isArtisan) {
      ToastComponent.show('ℹ️ Tu cuenta está registrada como Usuario / Cliente. El panel de gestión está reservado para Comercios y Artesanos.');
      return;
    }

    // Si aún no ha cargado el perfil de artesano, lo forzamos (puede pasar si el usuario hace clic muy rápido)
    if (!this.currentArtisanProfile) {
      ToastComponent.show('⏳ Cargando los datos de tu taller, por favor espera...');
      try {
        this.currentArtisanProfile = await this.manageShopUseCases.artisanRepository.getArtisanByOwnerId(this.currentUser.uid);
      } catch (err) {
        console.error("Error al cargar perfil de artesano:", err);
      }
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

      this.updateConditionalRequirements();
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
      const artisanDocId = this.currentArtisanProfile ? (this.currentArtisanProfile.docId || this.currentArtisanProfile.id) : null;
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
    document.getElementById('projectEditorCard')?.classList.remove('hidden');
    document.getElementById('editingProjectId').value = '';
    document.getElementById('projectEditorTitle').innerHTML = `<i class="fa-solid fa-plus-circle"></i> Publicar Nueva Obra`;
    document.getElementById('projectEditorForm')?.reset();
    document.getElementById('projectStepsContainer').innerHTML = '';
    this.renderTempProjectMediaPreviews();
    document.getElementById('projectEditorCard')?.scrollIntoView({ behavior: 'smooth' });
  }

  hideProjectForm() {
    this.tempProjectFiles = [];
    document.getElementById('projectEditorCard')?.classList.add('hidden');
    document.getElementById('projectEditorForm')?.reset();
  }

  handleProjectFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(f => {
      this.tempProjectFiles.push({
        file: f,
        type: f.type.startsWith('video/') ? 'video' : 'image',
        name: f.name,
        url: URL.createObjectURL(f),
        caption: ''
      });
    });

    this.renderTempProjectMediaPreviews();
  }

  removeProjectMediaFile(idx) {
    if (this.tempProjectFiles[idx]) {
      this.tempProjectFiles.splice(idx, 1);
      this.renderTempProjectMediaPreviews();
    }
  }

  renderTempProjectMediaPreviews() {
    const container = document.getElementById('projectMediaPreviewList');
    if (!container) return;

    if (!this.tempProjectFiles.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.tempProjectFiles.map((m, i) => `
      <div style="position: relative; width: 85px; height: 85px; border-radius: 8px; overflow: hidden; border: 1.5px solid var(--border-color); background: #000; display: inline-block; margin-right: 0.5rem; margin-bottom: 0.5rem;">
        ${m.type === 'video' 
          ? `<video src="${m.url}" style="width: 100%; height: 100%; object-fit: cover;" muted></video><span style="position: absolute; bottom: 3px; left: 3px; background: rgba(0,0,0,0.6); color: #FFF; font-size: 0.65rem; padding: 1px 4px; border-radius: 3px;"><i class="fa-solid fa-play"></i> Video</span>`
          : `<img src="${m.url}" style="width: 100%; height: 100%; object-fit: cover;">`
        }
        <button type="button" onclick="window.appUI.removeProjectMediaFile(${i})" style="position: absolute; top: 3px; right: 3px; background: rgba(211,47,47,0.85); color: #FFF; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  renderProjectsManagerGrid() {
    const container = document.getElementById('shopProjectsListContainer');
    if (!container) return;

    const projects = (this.currentArtisanProfile && this.currentArtisanProfile.projects) || [];

    if (!projects.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: var(--bg-subtle); border-radius: 12px; border: 1px dashed var(--border-color); color: var(--text-muted); margin-top: 1rem;">
          <i class="fa-solid fa-photo-film" style="font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--text-muted);"></i>
          <p style="font-size: 0.95rem; margin-bottom: 0.8rem; font-weight: 500;">Aún no has añadido obras o proyectos a tu catálogo.</p>
          <button type="button" class="btn btn-primary" onclick="window.appUI.showNewProjectForm()" style="font-size: 0.85rem; padding: 0.45rem 1rem;">
            <i class="fa-solid fa-plus"></i> Publicar Mi Primera Obra
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-top: 1.2rem;">
        ${projects.map((proj, idx) => {
          const cover = proj.coverImage || (proj.media && proj.media[0] && proj.media[0].url) || 'images/default_avatar.svg';
          const stepsCount = (proj.steps && proj.steps.length) || 0;
          return `
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column;">
              <div style="position: relative; height: 140px; background: #222;">
                <img src="${cover}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover;">
                ${proj.price ? `<span style="position: absolute; top: 8px; left: 8px; background: var(--terracotta); color: #FFF; font-weight: 700; font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 6px;">${proj.price}</span>` : ''}
              </div>
              <div style="padding: 0.9rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 0.98rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.3rem;">${proj.title}</h4>
                  <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.6rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${proj.description || 'Sin descripción.'}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.6rem; font-size: 0.78rem;">
                  <span style="color: var(--text-muted);"><i class="fa-solid fa-list-check"></i> ${stepsCount} pasos</span>
                  <div style="display: flex; gap: 0.4rem;">
                    <button type="button" class="btn btn-secondary" onclick="window.appUI.editProject(${idx})" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="window.appUI.deleteProject(${idx})" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; color: #D32F2F;">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async handleProjectSave(e) {
    e.preventDefault();
    if (!this.currentUser || !this.currentArtisanProfile) return;

    const editingId = document.getElementById('editingProjectId').value;
    const title = document.getElementById('projTitle').value.trim();
    const description = document.getElementById('projDescription').value.trim();
    const price = document.getElementById('projPrice').value.trim();
    const materials = document.getElementById('projMaterials').value.trim();
    const duration = document.getElementById('projDuration').value.trim();
    const dimensions = document.getElementById('projDimensions').value.trim();

    const btnSubmit = document.getElementById('btnSaveProject');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;
    }

    try {
      const artisanDocId = this.currentArtisanProfile.docId || this.currentArtisanProfile.id;
      let mediaUrls = [];

      // Subir archivos multimedia temporales a Firebase Storage
      if (this.tempProjectFiles.length > 0) {
        for (const item of this.tempProjectFiles) {
          if (item.file) {
            const url = await this.manageShopUseCases.uploadMediaFile(item.file, artisanDocId);
            mediaUrls.push({
              url,
              type: item.type,
              caption: item.name
            });
          } else if (item.url) {
            mediaUrls.push({
              url: item.url,
              type: item.type,
              caption: item.caption || ''
            });
          }
        }
      }

      const projectData = {
        title,
        description,
        price,
        materials,
        duration,
        dimensions,
        coverImage: mediaUrls[0] ? mediaUrls[0].url : '',
        media: mediaUrls
      };

      if (editingId) {
        await this.manageShopUseCases.updateProject(editingId, projectData);
      } else {
        await this.manageShopUseCases.createProject(artisanDocId, projectData);
      }

      this.hideProjectForm();
      if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
      ToastComponent.show('✨ ¡Obra publicada con éxito en tu catálogo!');
    } catch (err) {
      alert(`Error al guardar obra: ${err.message}`);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Obra`;
      }
    }
  }

  editProject(idx) {
    const projects = (this.currentArtisanProfile && this.currentArtisanProfile.projects) || [];
    const proj = projects[idx];
    if (!proj) return;

    this.showNewProjectForm();
    document.getElementById('editingProjectId').value = proj.id || '';
    document.getElementById('projectEditorTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Obra`;
    document.getElementById('projTitle').value = proj.title || '';
    document.getElementById('projDescription').value = proj.description || '';
    document.getElementById('projPrice').value = proj.price || '';
    document.getElementById('projMaterials').value = proj.materials || '';
    document.getElementById('projDuration').value = proj.duration || '';
    document.getElementById('projDimensions').value = proj.dimensions || '';

    this.tempProjectFiles = (proj.media || []).map(m => ({ ...m }));
    this.renderTempProjectMediaPreviews();
    document.getElementById('projectEditorCard')?.scrollIntoView({ behavior: 'smooth' });
  }

  async deleteProject(idx) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta obra de tu catálogo?')) return;
    const projects = (this.currentArtisanProfile && this.currentArtisanProfile.projects) || [];
    const targetProj = projects[idx];
    if (!targetProj) return;

    const artisanDocId = this.currentArtisanProfile.docId || this.currentArtisanProfile.id;
    if (artisanDocId && targetProj.id) {
      try {
        await this.manageShopUseCases.deleteProject(artisanDocId, targetProj.id);
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
    if (!this.currentUser) return;

    const toggleWhatsapp = document.getElementById('editAllowWhatsapp');
    const isWhatsappActive = toggleWhatsapp ? toggleWhatsapp.checked : true;
    const editPhoneVal = document.getElementById('editPhone') ? document.getElementById('editPhone').value.trim() : '';

    const toggleVisitable = document.getElementById('editIsVisitable');
    const isVisitableActive = toggleVisitable ? toggleVisitable.checked : false;
    const editAddressVal = document.getElementById('editAddress') ? document.getElementById('editAddress').value.trim() : '';

    // Validaciones condicionales
    if (isWhatsappActive && !editPhoneVal) {
      alert("⚠️ Si activas el 'Botón de WhatsApp', debes introducir un número de teléfono de contacto.");
      document.getElementById('editPhone')?.focus();
      return;
    }

    if (isVisitableActive && !editAddressVal) {
      alert("⚠️ Si marcas tu taller como 'Taller Visitable', debes introducir la dirección física.");
      document.getElementById('editAddress')?.focus();
      return;
    }

    const categorySelect = document.getElementById('editCategory');
    const categoryVal = categorySelect ? categorySelect.value : (this.currentArtisanProfile ? this.currentArtisanProfile.category : 'ceramica');
    const categoryLabel = categorySelect && categorySelect.options[categorySelect.selectedIndex] ? categorySelect.options[categorySelect.selectedIndex].text : (this.currentArtisanProfile ? this.currentArtisanProfile.categoryLabel : 'Artesanía');

    const updatedData = {
      name: document.getElementById('editName') ? document.getElementById('editName').value.trim() : '',
      trade: document.getElementById('editTrade') ? document.getElementById('editTrade').value.trim() : '',
      category: categoryVal,
      categoryLabel: categoryLabel,
      location: document.getElementById('editLocation') ? document.getElementById('editLocation').value.trim() : '',
      phone: editPhoneVal,
      website: document.getElementById('editWebsite') ? document.getElementById('editWebsite').value.trim() : '',
      address: editAddressVal,
      description: document.getElementById('editDescription') ? document.getElementById('editDescription').value.trim() : '',
      allowWhatsapp: isWhatsappActive,
      acceptsCustomOrders: document.getElementById('editAcceptsCustomOrders') ? document.getElementById('editAcceptsCustomOrders').checked : true,
      isVisitable: isVisitableActive
    };

    const targetDocId = this.currentArtisanProfile ? (this.currentArtisanProfile.docId || this.currentArtisanProfile.id) : null;

    try {
      if (targetDocId) {
        await this.manageShopUseCases.updateShopProfile(targetDocId, updatedData);
        this.currentArtisanProfile = { ...this.currentArtisanProfile, ...updatedData };
      } else {
        // Si por alguna razón no existía perfil, crearlo
        const newArtisan = await this.manageShopUseCases.createShopProfile({
          id: Date.now(),
          ownerId: this.currentUser.uid,
          ...updatedData
        });
        this.currentArtisanProfile = newArtisan;
      }

      closeModal('shopManageModal', true);
      if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
      ToastComponent.show('💾 ¡Los datos de tu taller han sido actualizados con éxito!');
    } catch (err) {
      alert(`Error guardando datos del taller: ${err.message}`);
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

    const targetDocId = this.currentArtisanProfile.docId || this.currentArtisanProfile.id;
    if (targetDocId) {
      try {
        await this.manageShopUseCases.updatePromo(targetDocId, promoData);
        this.currentArtisanProfile.promo = promoData;
        closeModal('shopManageModal', true);
        if (typeof this.onShopUpdated === 'function') await this.onShopUpdated();
        ToastComponent.show('🏷️ ¡Promoción de tu taller actualizada!');
      } catch (err) {
        alert(`Error guardando promoción: ${err.message}`);
      }
    }
  }

  async handleChangeEmailSubmit(e) {
    e.preventDefault();
    const newEmail = document.getElementById('changeEmailInput').value.trim();
    const password = document.getElementById('changeEmailPassword').value;

    try {
      await this.authUseCases.updateEmail(newEmail, password);
      ToastComponent.show('✉️ Correo electrónico actualizado correctamente');
      document.getElementById('changeEmailForm').reset();
    } catch (err) {
      alert(`Error al actualizar email: ${err.message}`);
    }
  }

  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currentPass = document.getElementById('currentPasswordInput').value;
    const newPass = document.getElementById('newPasswordInput').value;
    const confirmPass = document.getElementById('confirmNewPasswordInput').value;

    if (newPass !== confirmPass) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      await this.authUseCases.updatePassword(currentPass, newPass);
      ToastComponent.show('🔑 Contraseña actualizada correctamente');
      document.getElementById('changePasswordForm').reset();
    } catch (err) {
      alert(`Error al cambiar contraseña: ${err.message}`);
    }
  }
}
