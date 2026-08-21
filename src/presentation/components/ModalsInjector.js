
export function injectAllModals() {
  if (document.getElementById('loginModal')) return;
  const container = document.createElement('div');
  container.innerHTML = `<!-- Modal Detalle Artesano -->
  <div class="modal-overlay" id="detailModal">
    <div class="modal-card">
      <button class="modal-close" onclick="window.appUI.closeModal('detailModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div id="detailModalContent">
        <!-- Renderizado dinámicamente con JS -->
      </div>
    </div>
  </div>

  <!-- Modal Iniciar Sesión Artesano -->
  <div class="modal-overlay" id="loginModal">
    <div class="modal-card" style="max-width: 480px;">
      <button class="modal-close" onclick="window.appUI.closeModal('loginModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body">
        <div style="text-align: center; margin-bottom: 2rem;">
          <span class="hero-badge"><i class="fa-solid fa-user-lock"></i> Área de Artesanos</span>
          <h2 style="font-size: 2rem; margin-top: 0.5rem;">Iniciar Sesión</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Accede para gestionar tu taller, promociones y productos.</p>
        </div>

        <form id="loginForm">
          <div class="form-group">
            <label class="form-label">Correo Electrónico *</label>
            <input type="email" id="loginEmail" class="form-input" placeholder="tu@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña *</label>
            <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.8rem;">
            <i class="fa-solid fa-right-to-bracket"></i> Entrar a mi Tienda
          </button>
        </form>

        <div style="display: flex; align-items: center; gap: 0.8rem; margin: 1.2rem 0;">
          <hr style="flex: 1; border: 0; border-top: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">o continúa con</span>
          <hr style="flex: 1; border: 0; border-top: 1px solid var(--border-color);">
        </div>

        <button type="button" class="btn btn-secondary" onclick="window.appUI.handleGoogleLogin('login')" style="width: 100%; justify-content: center; gap: 0.7rem; border-color: #DADCE0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Formulario "Registro de Cuenta (Cliente o Artesano)" -->
  <div class="modal-overlay" id="registerModal">
    <div class="modal-card">
      <button class="modal-close" onclick="window.appUI.closeModal('registerModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span class="hero-badge"><i class="fa-solid fa-user-plus"></i> Únete a Arte y Sanos</span>
          <h2 style="font-size: 1.8rem; margin-top: 0.5rem;" id="registerModalTitle">Crear Cuenta</h2>
          <p style="color: var(--text-secondary); font-size: 0.92rem;">Elige tu tipo de perfil para comenzar en la plataforma.</p>
        </div>

        <!-- Selector de Tipo de Cuenta -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.5rem; background: var(--bg-subtle); padding: 0.4rem; border-radius: 12px;">
          <button type="button" id="roleBtnClient" class="btn" style="background: var(--terracotta); color: #FFF; font-size: 0.9rem; padding: 0.6rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s;" onclick="window.appUI.selectRegisterRole('client')">
            <i class="fa-solid fa-user"></i> Soy Usuario / Cliente
          </button>
          <button type="button" id="roleBtnArtisan" class="btn" style="background: transparent; color: var(--text-main); font-size: 0.9rem; padding: 0.6rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s;" onclick="window.appUI.selectRegisterRole('artisan')">
            <i class="fa-solid fa-hammer"></i> Soy Artesano
          </button>
        </div>

        <form id="registerForm">
          <input type="hidden" id="registerAccountRole" value="client">

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre Completo o Alias *</label>
              <input type="text" id="inputDisplayName" class="form-input" placeholder="ej. Carmen Ruiz" required>
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico *</label>
              <input type="email" id="inputAuthEmail" class="form-input" placeholder="tu@email.com" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña de acceso *</label>
            <input type="password" id="inputAuthPassword" class="form-input" placeholder="Mínimo 6 caracteres" minlength="6" required>
          </div>

          <!-- Campos Específicos para Artesanos (Ocultos para Clientes) -->
          <div id="artisanExtraFields" style="display: none;">
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0;">
            <h4 style="color: var(--primary-dark); font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-store" style="color: var(--terracotta);"></i> Información del Taller / Negocio
            </h4>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre del Taller o Marca *</label>
                <input type="text" id="inputName" class="form-input" placeholder="ej. Taller Cerámico El Crisol">
              </div>
              <div class="form-group">
                <label class="form-label">Categoría Principal *</label>
                <select id="inputCategory" class="form-select">
                  <option value="pintura">Pintura & Ilustración</option>
                  <option value="escultura">Escultura & Modelado</option>
                  <option value="ceramica">Cerámica</option>
                  <option value="tejido">Tejido & Textil</option>
                  <option value="herreria">Herrería & Metal</option>
                  <option value="madera">Ebanistería & Madera</option>
                  <option value="cuero">Marroquinería & Cuero</option>
                  <option value="joyeria">Joyería & Orfebrería</option>
                  <option value="tatuaje">Tatuaje Artístico</option>
                  <option value="comida">Comida Artesana</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Especialidad u Oficio *</label>
                <input type="text" id="inputTrade" class="form-input" placeholder="ej. Alfarería tradicional en torno">
              </div>
              <div class="form-group">
                <label class="form-label">Ciudad / Provincia *</label>
                <input type="text" id="inputLocation" class="form-input" placeholder="ej. Granada, España">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Dirección Completa del Taller *</label>
              <input type="text" id="inputAddress" class="form-input" placeholder="ej. Callejón del Aire 14, Albaicín">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono / WhatsApp de Contacto *</label>
                <input type="tel" id="inputPhone" class="form-input" placeholder="ej. +34 600 000 000">
              </div>
              <div class="form-group">
                <label class="form-label">Sitio Web / Red Social (Opcional)</label>
                <input type="url" id="inputWebsite" class="form-input" placeholder="https://mitaller.com">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción de tu trabajo e Historia *</label>
              <textarea id="inputDescription" class="form-textarea" rows="3" placeholder="Cuéntanos qué haces, qué materiales utilizas y qué hace especial a tu negocio..."></textarea>
            </div>

            <!-- Opciones extra del taller -->
            <div style="background: var(--bg-subtle); padding: 0.9rem; border-radius: 10px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.8rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; color: var(--primary-dark); font-weight: 600;">
                <input type="checkbox" id="inputAcceptsCustomOrders" checked style="width: 16px; height: 16px; accent-color: var(--terracotta); cursor: pointer;">
                <span>✨ <strong>Acepto Encargos Personalizados</strong> (Piezas y trabajos a medida bajo petición)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; color: var(--primary-dark); font-weight: 600;">
                <input type="checkbox" id="inputIsVisitable" style="width: 16px; height: 16px; accent-color: var(--terracotta); cursor: pointer;">
                <span>🏛️ <strong>Taller Visitable</strong> (Espacio físico abierto al público o visitas concertadas)</span>
              </label>
            </div>
          </div>

          <!-- Casilla de Consentimiento RGPD / LOPDGDD Obligatoria -->
          <div style="margin-top: 1.2rem; padding: 0.8rem; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color);">
            <label style="display: flex; align-items: flex-start; gap: 0.6rem; cursor: pointer; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
              <input type="checkbox" id="registerConsentCheckbox" required style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--terracotta); cursor: pointer; flex-shrink: 0;">
              <span>He leído y acepto la <a href="privacidad.html" target="_blank" style="color: var(--terracotta); font-weight: 600; text-decoration: underline;">Política de Privacidad</a> y los <a href="terminos.html" target="_blank" style="color: var(--terracotta); font-weight: 600; text-decoration: underline;">Términos y Condiciones de Uso</a>. *</span>
            </label>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.3rem;">
            <button type="submit" id="btnSubmitRegister" class="btn btn-primary" style="flex: 1;">
              <i class="fa-solid fa-check"></i> Crear Cuenta de Usuario
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.appUI.closeModal('registerModal')">
              Cancelar
            </button>
          </div>
        </form>

        <div style="display: flex; align-items: center; gap: 0.8rem; margin: 1.2rem 0;">
          <hr style="flex: 1; border: 0; border-top: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">o regístrate con</span>
          <hr style="flex: 1; border: 0; border-top: 1px solid var(--border-color);">
        </div>

        <button type="button" class="btn btn-secondary" onclick="window.appUI.handleGoogleLogin('register')" style="width: 100%; justify-content: center; gap: 0.7rem; border-color: #DADCE0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
          <span id="btnGoogleRegisterLabel">Registrarse como Cliente con Google</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Panel "Gestionar Mi Perfil & Tienda" (Escala 85% Compacta & Dashboard) -->
  <div class="modal-overlay" id="shopManageModal">
    <div class="modal-card">
      <button class="modal-close" onclick="window.appUI.closeModal('shopManageModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span class="hero-badge" style="margin: 0; padding: 0.25rem 0.75rem; font-size: 0.75rem;"><i class="fa-solid fa-sliders"></i> Panel de Control</span>
              <span id="verificationStatusBadge" class="hero-badge" style="background: rgba(76, 175, 80, 0.1); color: #4CAF50; border-color: rgba(76, 175, 80, 0.25); margin: 0; padding: 0.25rem 0.75rem; font-size: 0.75rem;">
                <i class="fa-solid fa-circle-check"></i> Taller Verificado
              </span>
            </div>
            <h2 style="font-size: 1.7rem; font-family: 'Playfair Display', serif; color: var(--primary-dark); margin: 0;" id="shopManageTitle">Gestionar Mi Perfil & Tienda</h2>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem; margin-bottom: 0;">Administra tu catálogo de obras, información pública de contacto y seguridad de tu cuenta.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <a href="#" id="btnViewMyPublicProfile" target="_blank" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.4rem; border-radius: 8px; font-weight: 600;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Mi Perfil Público
            </a>
          </div>
        </div>

        <!-- Banner de Verificación de Artesano -->
        <div id="artisanVerificationBanner" style="background: linear-gradient(135deg, rgba(197,160,89,0.15), rgba(192,108,76,0.1)); border: 1.5px solid var(--warm-gold); border-radius: 12px; padding: 1rem 1.4rem; margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.9rem;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--warm-gold); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 4px 10px rgba(197,160,89,0.3);">
              <i class="fa-solid fa-certificate"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <strong style="color: var(--primary-dark); font-size: 0.98rem;">Insignia de Artesano Certificado</strong>
                <span id="shopVerifBadgeStatus" style="font-size: 0.72rem; background: var(--warm-gold); color: #FFF; padding: 0.15rem 0.5rem; border-radius: 10px; font-weight: 700;">Oficio Registrado</span>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.82rem; margin: 0.1rem 0 0 0; line-height: 1.4;">
                Aumenta la confianza de tus clientes solicitando la verificación oficial de tu taller artesanal.
              </p>
            </div>
          </div>
          <button type="button" class="btn btn-gold" onclick="window.appUI.openVerificationModal()" style="font-size: 0.85rem; padding: 0.5rem 1.1rem; display: inline-flex; align-items: center; gap: 0.4rem; border-radius: 8px;">
            <i class="fa-solid fa-shield-check"></i> Verificar Cuenta
          </button>
        </div>

        <!-- Pestañas del Panel (Barra Segmentada) -->
        <div class="shop-tabs-nav">
          <button class="tab-btn active" onclick="window.appUI.switchShopTab('tabGeneral')" id="btnTabGeneral">
            <i class="fa-solid fa-store"></i> Información & Foto
          </button>
          <button class="tab-btn" onclick="window.appUI.switchShopTab('tabPromos')" id="btnTabPromos">
            <i class="fa-solid fa-tags"></i> Promociones & Ofertas
          </button>
          <button class="tab-btn" onclick="window.appUI.switchShopTab('tabSecurity')" id="btnTabSecurity">
            <i class="fa-solid fa-shield-halved"></i> Seguridad & Mi Cuenta
          </button>
        </div>

        <!-- Tab 1: General & Foto de Perfil -->
        <div id="tabGeneral" class="shop-tab-content">
          <!-- Subida / Cambio de Foto de Perfil / Taller -->
          <div class="dashboard-card" style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
            <div style="position: relative; width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid var(--warm-gold); box-shadow: 0 3px 12px rgba(62, 39, 35, 0.1); flex-shrink: 0; background: #FFF;">
              <img id="avatarEditPreview" src="images/artisan1.jpg" alt="Foto de Perfil" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1; min-width: 220px;">
              <h4 style="font-size: 1.05rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.2rem;">Foto de Perfil / Imagen Principal del Taller</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.8rem; line-height: 1.4;">Esta fotografía se mostrará en tu tarjeta del directorio, la cabecera de tu tienda y en tus obras publicadas.</p>
              <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
                <label class="btn btn-secondary" style="cursor: pointer; padding: 0.45rem 1rem; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.4rem; margin: 0; border-radius: 8px;">
                  <i class="fa-solid fa-camera"></i> Subir Nueva Foto
                  <input type="file" id="inputAvatarFile" accept="image/*" style="display: none;" onchange="window.appUI.handleAvatarChange(event)">
                </label>
                <span id="avatarUploadStatus" style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-regular fa-image"></i> Formatos JPG, PNG o WEBP</span>
              </div>
            </div>
          </div>

          <form id="editShopForm" class="dashboard-card">
            <h4 class="dashboard-card-title">
              <i class="fa-solid fa-address-card" style="color: var(--terracotta);"></i> Datos Principales del Taller
            </h4>

            <div class="form-row" style="margin-bottom: 0.8rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Nombre Comercial o del Artesano *</label>
                <input type="text" id="editName" class="form-input" placeholder="ej. Taller Cerámica Albaicín" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Especialidad u Oficio Artesanal *</label>
                <input type="text" id="editTrade" class="form-input" placeholder="ej. Torneado de Barro & Cerámica" required>
              </div>
            </div>

            <div class="form-row" style="margin-bottom: 0.8rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Categoría de Artesanía *</label>
                <select id="editCategory" class="form-select">
                  <option value="pintura">Pintura & Ilustración</option>
                  <option value="escultura">Escultura & Modelado</option>
                  <option value="ceramica">Cerámica & Barro</option>
                  <option value="tejido">Textil & Telar</option>
                  <option value="herreria">Herrería & Forja</option>
                  <option value="madera">Ebanistería & Madera</option>
                  <option value="cuero">Marroquinería & Cuero</option>
                  <option value="joyeria">Joyería & Orfebrería</option>
                  <option value="tatuaje">Tatuaje Artístico</option>
                  <option value="comida">Comida & Obrador</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Ciudad / Provincia / Región *</label>
                <input type="text" id="editLocation" class="form-input" placeholder="ej. Granada, España" required>
              </div>
            </div>

            <div class="form-row" style="margin-bottom: 0.8rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" id="labelEditPhone">Teléfono de Contacto (Opcional)</label>
                <input type="tel" id="editPhone" class="form-input" placeholder="+34 600 000 000">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Sitio Web / Tienda Online Oficial (Opcional)</label>
                <input type="url" id="editWebsite" class="form-input" placeholder="https://mi-tienda-artesanal.com">
              </div>
            </div>

            <!-- Ajustes destacados del Taller -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem; margin-bottom: 1.1rem;">
              <!-- Toggle WhatsApp -->
              <div style="background: rgba(37, 211, 102, 0.08); border: 1.5px solid rgba(37, 211, 102, 0.25); border-radius: 10px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div style="width: 30px; height: 30px; border-radius: 50%; background: #25D366; color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0;">
                    <i class="fa-brands fa-whatsapp"></i>
                  </div>
                  <div>
                    <strong style="color: var(--primary-dark); font-size: 0.82rem; display: block;">Botón de WhatsApp</strong>
                    <span style="color: var(--text-secondary); font-size: 0.74rem;">Contacto directo a tu app.</span>
                  </div>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" id="editAllowWhatsapp" checked style="width: 17px; height: 17px; accent-color: #25D366; cursor: pointer;">
                </label>
              </div>

              <!-- Toggle Encargos a Medida -->
              <div style="background: rgba(197, 160, 89, 0.1); border: 1.5px solid rgba(197, 160, 89, 0.3); border-radius: 10px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--warm-gold); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div>
                    <strong style="color: var(--primary-dark); font-size: 0.82rem; display: block;">Encargos a Medida</strong>
                    <span style="color: var(--text-secondary); font-size: 0.74rem;">Aceptas piezas personalizadas.</span>
                  </div>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" id="editAcceptsCustomOrders" checked style="width: 17px; height: 17px; accent-color: var(--warm-gold); cursor: pointer;">
                </label>
              </div>

              <!-- Toggle Taller Visitable -->
              <div style="background: rgba(192, 108, 76, 0.08); border: 1.5px solid rgba(192, 108, 76, 0.25); border-radius: 10px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--terracotta); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">
                    <i class="fa-solid fa-store"></i>
                  </div>
                  <div>
                    <strong style="color: var(--primary-dark); font-size: 0.82rem; display: block;">Taller Visitable</strong>
                    <span style="color: var(--text-secondary); font-size: 0.74rem;">Abierto a visitas con cita o tienda.</span>
                  </div>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" id="editIsVisitable" style="width: 17px; height: 17px; accent-color: var(--terracotta); cursor: pointer;">
                </label>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" id="labelEditAddress">Dirección Física del Taller (Opcional)</label>
              <input type="text" id="editAddress" class="form-input" placeholder="Calle / Plaza, Número, Barrio o Polígono">
            </div>

            <div class="form-group" style="margin-bottom: 1.3rem;">
              <label class="form-label">Historia, Filosofía y Técnicas del Taller (Opcional)</label>
              <textarea id="editDescription" class="form-textarea" rows="3" placeholder="Explica la historia de tu taller, los materiales nobles que utilizas, el proceso artesanal..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary" style="padding: 0.7rem 1.6rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios de Perfil
              </button>
            </div>
          </form>
        </div>

        <!-- Tab 2: Promociones -->
        <div id="tabPromos" class="shop-tab-content" style="display: none;">
          <div class="dashboard-card">
            <h4 class="dashboard-card-title">
              <i class="fa-solid fa-tag" style="color: var(--warm-gold-hover);"></i> Publicar Promoción u Oferta Destacada
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.2rem; line-height: 1.5;">
              Las promociones activas aparecen de forma destacada en la cabecera de tu perfil público y muestran una etiqueta especial en el directorio principal.
            </p>

            <form id="promoForm">
              <div class="form-group">
                <label class="form-label">Título de la Oferta o Descuento *</label>
                <input type="text" id="promoTitle" class="form-input" placeholder="ej. 15% de Descuento con código ARTESANO15 o 2x1 en talleres" required>
              </div>
              <div class="form-group" style="margin-bottom: 1.3rem;">
                <label class="form-label">Condiciones o Instrucciones para Canjear</label>
                <textarea id="promoDetails" class="form-textarea" rows="2" placeholder="Válido mostrando este perfil en el taller o contactando por WhatsApp."></textarea>
              </div>
              <div style="display: flex; justify-content: flex-end;">
                <button type="submit" class="btn btn-gold" style="padding: 0.65rem 1.6rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px;">
                  <i class="fa-solid fa-plus"></i> Publicar Promoción Destacada
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tab 4: Seguridad & Mi Cuenta -->
        <div id="tabSecurity" class="shop-tab-content" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.3rem; margin-bottom: 1.5rem;" class="form-row">
            
            <!-- Cambiar Correo Electrónico -->
            <div class="dashboard-card" style="margin-bottom: 0;">
              <h4 style="font-size: 1.05rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-envelope" style="color: var(--terracotta);"></i> Cambiar Correo Electrónico
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.1rem;">Actualiza el correo con el que inicias sesión.</p>

              <form id="changeEmailForm">
                <div class="form-group">
                  <label class="form-label">Nuevo Correo Electrónico *</label>
                  <input type="email" id="inputNewEmail" class="form-input" placeholder="nuevo@correo.com" required>
                </div>
                <div class="form-group" style="margin-bottom: 1.1rem;">
                  <label class="form-label">Contraseña Actual *</label>
                  <input type="password" id="inputEmailCurrentPassword" class="form-input" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-secondary" style="font-weight: 600; font-size: 0.82rem; width: 100%; border-radius: 7px;">
                  <i class="fa-solid fa-check"></i> Actualizar Correo
                </button>
              </form>
            </div>

            <!-- Cambiar Contraseña -->
            <div class="dashboard-card" style="margin-bottom: 0;">
              <h4 style="font-size: 1.05rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-key" style="color: var(--warm-gold);"></i> Cambiar Contraseña
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.1rem;">Establece una nueva clave de acceso segura.</p>

              <form id="changePasswordForm">
                <div class="form-group">
                  <label class="form-label">Contraseña Actual *</label>
                  <input type="password" id="inputPasswordCurrent" class="form-input" placeholder="••••••••" required>
                </div>
                <div class="form-group" style="margin-bottom: 1.1rem;">
                  <label class="form-label">Nueva Contraseña (mín. 6 caracteres) *</label>
                  <input type="password" id="inputPasswordNew" class="form-input" placeholder="••••••••" minlength="6" required>
                </div>
                <button type="submit" class="btn btn-secondary" style="font-weight: 600; font-size: 0.82rem; width: 100%; border-radius: 7px;">
                  <i class="fa-solid fa-shield-halved"></i> Guardar Contraseña
                </button>
              </form>
            </div>

          </div>

          <!-- ZONA DE PELIGRO: Eliminar Cuenta & Todos los Registros -->
          <div style="background: #FFF5F5; border: 1.5px solid #FFCDD2; padding: 1.4rem 1.6rem; border-radius: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #FFEBEE; color: #D32F2F; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div style="flex: 1; min-width: 240px;">
                <h4 style="color: #C62828; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.2rem;">Zona de Peligro: Eliminar Cuenta Permanentemente</h4>
                <p style="color: #5D4037; font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.9rem;">
                  Esta acción es <strong>irreversible</strong>. Se eliminarán de forma definitiva tu perfil de artesano, todos los proyectos publicados, las fotografías y vídeos de Firebase Storage, las reseñas, comentarios y tu cuenta de acceso.
                </p>
                <button type="button" class="btn" style="background: #D32F2F; color: #FFF; border: none; font-weight: 700; padding: 0.6rem 1.3rem; font-size: 0.82rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="window.appUI.openDeleteAccountModal()">
                  <i class="fa-solid fa-trash-can"></i> Eliminar mi Cuenta y Todos mis Datos
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Modal Panel "Mi Cuenta de Usuario" (Exclusivo para Clientes / Compradores) -->
  <div class="modal-overlay" id="userAccountModal">
    <div class="modal-card" style="max-width: 650px;">
      <button class="modal-close" onclick="window.appUI.closeModal('userAccountModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span class="hero-badge" style="margin: 0; padding: 0.25rem 0.75rem; font-size: 0.75rem;"><i class="fa-solid fa-user-gear"></i> Perfil de Usuario</span>
              <span class="hero-badge" style="background: rgba(197, 160, 89, 0.15); color: #7D5C14; border-color: rgba(197, 160, 89, 0.4); margin: 0; padding: 0.25rem 0.75rem; font-size: 0.75rem;">
                <i class="fa-solid fa-user"></i> Cliente
              </span>
            </div>
            <h2 style="font-size: 1.7rem; font-family: 'Playfair Display', serif; color: var(--primary-dark); margin: 0;">Mi Cuenta & Ajustes</h2>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem; margin-bottom: 0;">Administra tu nombre público, avatar y la seguridad de tu cuenta.</p>
          </div>
        </div>

        <!-- Pestañas del Panel de Usuario -->
        <div class="shop-tabs-nav" style="margin-bottom: 1.2rem;">
          <button class="tab-btn active" onclick="window.appUI.switchUserTab('userTabProfile')" id="btnUserTabProfile">
            <i class="fa-solid fa-user"></i> Datos & Avatar
          </button>
          <button class="tab-btn" onclick="window.appUI.switchUserTab('userTabSecurity')" id="btnUserTabSecurity">
            <i class="fa-solid fa-shield-halved"></i> Seguridad & Acceso
          </button>
        </div>

        <!-- Tab 1: Datos & Foto de Perfil -->
        <div id="userTabProfile" class="user-tab-content">
          <div class="dashboard-card" style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.2rem;">
            <div style="position: relative; width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid var(--warm-gold); box-shadow: 0 3px 12px rgba(62, 39, 35, 0.1); flex-shrink: 0; background: #FFF;">
              <img id="userAvatarEditPreview" src="images/default_avatar.svg" alt="Avatar de Usuario" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1; min-width: 220px;">
              <h4 style="font-size: 1.05rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.2rem;">Foto de Perfil / Avatar</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.8rem; line-height: 1.4;">Esta foto aparecerá junto a tus opiniones y comentarios en las fichas de los artesanos.</p>
              <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
                <label class="btn btn-secondary" style="cursor: pointer; padding: 0.45rem 1rem; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.4rem; margin: 0; border-radius: 8px;">
                  <i class="fa-solid fa-camera"></i> Subir Avatar
                  <input type="file" id="inputUserAvatarFile" accept="image/*" style="display: none;" onchange="window.appUI.handleUserAvatarChange(event)">
                </label>
                <span id="userAvatarUploadStatus" style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-regular fa-image"></i> JPG, PNG o WEBP</span>
              </div>
            </div>
          </div>

          <form id="editUserProfileForm" class="dashboard-card">
            <h4 class="dashboard-card-title">
              <i class="fa-solid fa-id-card" style="color: var(--terracotta);"></i> Información Personal
            </h4>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label">Nombre Completo o Alias Público *</label>
              <input type="text" id="inputUserDisplayName" class="form-input" placeholder="Tu nombre o alias" required>
            </div>

            <div class="form-group" style="margin-bottom: 1.2rem;">
              <label class="form-label">Correo Electrónico (Registrado)</label>
              <input type="email" id="inputUserEmailDisplay" class="form-input" disabled style="background: var(--bg-subtle); color: var(--text-muted);">
            </div>

            <button type="submit" class="btn btn-primary" style="font-weight: 700; padding: 0.6rem 1.4rem; font-size: 0.88rem; border-radius: 8px;">
              <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
            </button>
          </form>
        </div>

        <!-- Tab 2: Seguridad & Contraseña & Zona de Peligro -->
        <div id="userTabSecurity" class="user-tab-content" style="display: none;">
          <div id="userPasswordFormsSection" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem;">
            
            <!-- Cambiar Correo -->
            <div class="dashboard-card" style="margin-bottom: 0;">
              <h4 style="font-size: 0.95rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-envelope" style="color: var(--terracotta);"></i> Cambiar Correo
              </h4>
              <form id="changeUserEmailForm">
                <div class="form-group" style="margin-bottom: 0.6rem;">
                  <label class="form-label" style="font-size: 0.78rem;">Contraseña actual *</label>
                  <input type="password" id="inputUserEmailCurrentPassword" class="form-input" placeholder="••••••••" required>
                </div>
                <div class="form-group" style="margin-bottom: 0.9rem;">
                  <label class="form-label" style="font-size: 0.78rem;">Nuevo correo *</label>
                  <input type="email" id="inputUserNewEmail" class="form-input" placeholder="nuevo@email.com" required>
                </div>
                <button type="submit" class="btn btn-secondary" style="font-weight: 600; font-size: 0.82rem; width: 100%; border-radius: 7px;">
                  <i class="fa-solid fa-arrows-rotate"></i> Actualizar Correo
                </button>
              </form>
            </div>

            <!-- Cambiar Contraseña -->
            <div class="dashboard-card" style="margin-bottom: 0;">
              <h4 style="font-size: 0.95rem; color: var(--primary-dark); font-weight: 700; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-key" style="color: var(--warm-gold);"></i> Cambiar Contraseña
              </h4>
              <form id="changeUserPasswordForm">
                <div class="form-group" style="margin-bottom: 0.6rem;">
                  <label class="form-label" style="font-size: 0.78rem;">Contraseña actual *</label>
                  <input type="password" id="inputUserPasswordCurrent" class="form-input" placeholder="••••••••" required>
                </div>
                <div class="form-group" style="margin-bottom: 0.9rem;">
                  <label class="form-label" style="font-size: 0.78rem;">Nueva contraseña *</label>
                  <input type="password" id="inputUserPasswordNew" class="form-input" placeholder="••••••••" minlength="6" required>
                </div>
                <button type="submit" class="btn btn-secondary" style="font-weight: 600; font-size: 0.82rem; width: 100%; border-radius: 7px;">
                  <i class="fa-solid fa-shield-halved"></i> Guardar Contraseña
                </button>
              </form>
            </div>

          </div>

          <!-- Aviso si es cuenta de Google -->
          <div id="userGoogleAuthNotice" class="dashboard-card" style="display: none; margin-bottom: 1.5rem; background: var(--bg-subtle);">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <i class="fa-brands fa-google" style="color: #4285F4; font-size: 1.4rem;"></i>
              <div>
                <strong style="color: var(--primary-dark); font-size: 0.95rem;">Cuenta conectada con Google</strong>
                <p style="color: var(--text-secondary); font-size: 0.82rem; margin: 0;">Tu acceso y seguridad están administrados por tu cuenta de Google.</p>
              </div>
            </div>
          </div>

          <!-- ZONA DE PELIGRO: Eliminar Cuenta de Usuario -->
          <div style="background: #FFF5F5; border: 1.5px solid #FFCDD2; padding: 1.4rem 1.6rem; border-radius: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #FFEBEE; color: #D32F2F; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div style="flex: 1; min-width: 240px;">
                <h4 style="color: #C62828; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.2rem;">Zona de Peligro: Eliminar Mi Cuenta</h4>
                <p style="color: #5D4037; font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.9rem;">
                  Esta acción es <strong>irreversible</strong>. Se eliminará tu cuenta de usuario, tus datos personales y tu acceso a la plataforma.
                </p>
                <button type="button" class="btn" style="background: #D32F2F; color: #FFF; border: none; font-weight: 700; padding: 0.6rem 1.3rem; font-size: 0.82rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="window.appUI.openDeleteAccountModal()">
                  <i class="fa-solid fa-trash-can"></i> Eliminar mi Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Modal Confirmación para Eliminar Cuenta -->
  <div class="modal-overlay" id="deleteAccountModal" style="z-index: 5000;">
    <div class="modal-card" style="max-width: 520px; border-top: 5px solid #D32F2F;">
      <button class="modal-close" onclick="window.appUI.closeModal('deleteAccountModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body" style="text-align: center; padding: 2rem;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: #FFEBEE; color: #D32F2F; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.2rem;">
          <i class="fa-solid fa-skull-crossbones"></i>
        </div>
        <h3 style="font-size: 1.5rem; color: #B71C1C; margin-bottom: 0.5rem;">¿Eliminar Cuenta Definitivamente?</h3>
        <p id="deleteAccountNoticeText" style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">
          Esta acción <strong>borrará todos tus registros</strong> en la plataforma. Para confirmar la eliminación:
        </p>

        <form id="confirmDeleteAccountForm">
          <div id="deletePasswordGroup" class="form-group" style="text-align: left; margin-bottom: 1.5rem;">
            <label class="form-label">Introduce tu Contraseña para confirmar *</label>
            <input type="password" id="deleteAccountPasswordConfirm" class="form-input" placeholder="Tu contraseña actual">
          </div>

          <div style="display: flex; gap: 0.8rem; justify-content: center;">
            <button type="button" class="btn btn-secondary" onclick="window.appUI.closeModal('deleteAccountModal')" style="flex: 1;">
              Cancelar
            </button>
            <button type="submit" id="btnConfirmDeleteAccount" class="btn" style="flex: 1.3; background: #D32F2F; color: #FFF; border: none; font-weight: 700; cursor: pointer;">
              <i class="fa-solid fa-trash"></i> Confirmar Eliminación
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Botón Flotante de Asistencia / Incidencias -->
  <button id="btnFloatingSupport" onclick="window.appUI.openSupportModal()" aria-label="Asistencia y Contacto">
    <i class="fa-solid fa-headset" style="color: var(--warm-gold); font-size: 1.1rem;"></i> Asistencia & Contacto
  </button>

  <!-- Modal 1: Formulario de Solicitud de Verificación de Artesano -->
  <div class="modal-overlay" id="artisanVerificationModal" style="z-index: 5100;">
    <div class="modal-card" style="max-width: 580px; border-top: 5px solid var(--warm-gold);">
      <button class="modal-close" onclick="window.appUI.closeModal('artisanVerificationModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body" style="padding: 2.2rem;">
        <div style="display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1.2rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(197,160,89,0.18); color: var(--warm-gold-hover); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">
            <i class="fa-solid fa-certificate"></i>
          </div>
          <div>
            <h3 style="font-size: 1.35rem; color: var(--primary-dark); margin: 0; font-family: 'Playfair Display', serif;">Solicitar Verificación de Taller</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Taller: <strong id="verifWorkshopNameDisplay" style="color: var(--terracotta);">Mi Taller</strong></span>
          </div>
        </div>

        <div style="background: var(--bg-subtle); border-left: 3px solid var(--warm-gold); padding: 0.9rem 1.1rem; border-radius: 0 8px 8px 0; font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem;">
          <i class="fa-solid fa-circle-info" style="color: var(--warm-gold);"></i> 
          Al solicitar la verificación, nuestro equipo revisará tu oficio, piezas artesanales y autenticidad para otorgarte la insignia de <strong>Artesano Certificado ✓</strong>.
        </div>

        <form id="artisanVerificationForm">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Nombre y Apellidos de la persona de contacto *</label>
            <input type="text" id="verifContactName" class="form-input" placeholder="ej. María Carmen Delgado Navarro" required>
          </div>

          <div class="form-row" style="margin-bottom: 1rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Correo Electrónico de Contacto *</label>
              <input type="email" id="verifContactEmail" class="form-input" placeholder="contacto@tallerartesano.es" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Teléfono / WhatsApp *</label>
              <input type="tel" id="verifContactPhone" class="form-input" placeholder="+34 600 000 000" required>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1.2rem;">
            <label class="form-label">Detalles adicionales o trayectoria artesanal (Opcional)</label>
            <textarea id="verifNotes" class="form-textarea" rows="3" placeholder="Cuéntanos brevemente sobre tus años de oficio, técnicas tradicionales que empleas, certificados o enlaces adicionales..."></textarea>
          </div>

          <!-- Consentimiento RGPD Verificación -->
          <div style="margin-bottom: 1.2rem; padding: 0.8rem; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color);">
            <label style="display: flex; align-items: flex-start; gap: 0.6rem; cursor: pointer; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
              <input type="checkbox" id="verifConsentCheckbox" required style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--terracotta); cursor: pointer; flex-shrink: 0;">
              <span>Acepto el tratamiento de mis datos de contacto para la gestión de la solicitud conforme a la <a href="privacidad.html" target="_blank" style="color: var(--terracotta); font-weight: 600; text-decoration: underline;">Política de Privacidad</a>. *</span>
            </label>
          </div>

          <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="window.appUI.closeModal('artisanVerificationModal')">
              Cancelar
            </button>
            <button type="submit" id="btnSubmitVerification" class="btn btn-gold" style="font-weight: 700; padding: 0.7rem 1.4rem;">
              <i class="fa-solid fa-paper-plane"></i> Enviar Solicitud de Verificación
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal 2: Confirmación Exitosa de Solicitud de Verificación -->
  <div class="modal-overlay" id="verificationSuccessModal" style="z-index: 5200;">
    <div class="modal-card" style="max-width: 500px; text-align: center; border-top: 5px solid #2E7D32;">
      <div class="modal-body" style="padding: 2.5rem 2rem;">
        <div style="width: 65px; height: 65px; border-radius: 50%; background: #E8F5E9; color: #2E7D32; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.2rem;">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--primary-dark); margin-bottom: 0.6rem;">¡Solicitud Enviada con Éxito!</h3>
        <p id="verifSuccessDetailText" style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.8rem;">
          Nos pondremos en contacto contigo lo antes posible para gestionar la verificación de tu cuenta como <strong>Artesano Certificado</strong>.
        </p>
        <button type="button" class="btn btn-primary" onclick="window.appUI.closeModal('verificationSuccessModal')" style="width: 100%; justify-content: center; padding: 0.8rem;">
          <i class="fa-solid fa-check"></i> Entendido
        </button>
      </div>
    </div>
  </div>

  <!-- Modal 3: Centro de Asistencia, Contacto e Incidencias -->
  <div class="modal-overlay" id="supportContactModal" style="z-index: 5100;">
    <div class="modal-card" style="max-width: 580px; border-top: 5px solid var(--terracotta);">
      <button class="modal-close" onclick="window.appUI.closeModal('supportContactModal')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body" style="padding: 2.2rem;">
        <div style="display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1.2rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(192,108,76,0.15); color: var(--terracotta); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">
            <i class="fa-solid fa-headset"></i>
          </div>
          <div>
            <h3 style="font-size: 1.35rem; color: var(--primary-dark); margin: 0; font-family: 'Playfair Display', serif;">Centro de Asistencia & Contacto</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Estamos aquí para ayudarte a resolver cualquier duda o incidencia.</span>
          </div>
        </div>

        <form id="supportContactForm">
          <div class="form-row" style="margin-bottom: 1rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Tu Nombre *</label>
              <input type="text" id="supportSenderName" class="form-input" placeholder="ej. David García">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Tu Correo Electrónico *</label>
              <input type="email" id="supportSenderEmail" class="form-input" placeholder="tu@correo.com">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Tipo de Consulta / Asistencia *</label>
            <select id="supportCategorySelect" class="form-select">
              <option value="incidencia">⚠️ Incidencia Técnica o Problema en la Web</option>
              <option value="consulta">💬 Consulta General sobre la Plataforma</option>
              <option value="verificacion">🏅 Duda sobre Verificación de Artesano</option>
              <option value="sugerencia">💡 Sugerencia o Idea de Mejora</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Asunto *</label>
            <input type="text" id="supportSubject" class="form-input" placeholder="ej. Problema al subir fotos de un trabajo">
          </div>

          <div class="form-group" style="margin-bottom: 1.2rem;">
            <label class="form-label">Describe tu mensaje o incidencia *</label>
            <textarea id="supportMessage" class="form-textarea" rows="4" placeholder="Explica detalladamente lo que ocurre para poder ayudarte lo antes posible..."></textarea>
          </div>

          <!-- Consentimiento RGPD Soporte -->
          <div style="margin-bottom: 1.2rem; padding: 0.8rem; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color);">
            <label style="display: flex; align-items: flex-start; gap: 0.6rem; cursor: pointer; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
              <input type="checkbox" id="supportConsentCheckbox" style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--terracotta); cursor: pointer; flex-shrink: 0;">
              <span>He leído y acepto la <a href="privacidad.html" target="_blank" style="color: var(--terracotta); font-weight: 600; text-decoration: underline;">Política de Privacidad</a> para la gestión y respuesta de mi consulta. *</span>
            </label>
          </div>

          <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="window.appUI.closeModal('supportContactModal')">
              Cancelar
            </button>
            <button type="button" id="btnSubmitSupport" class="btn btn-primary" style="font-weight: 700; padding: 0.7rem 1.4rem;" onclick="window.appUI.supportController.handleSupportSubmit(event)">
              <i class="fa-solid fa-paper-plane"></i> Enviar Mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  `;
  while (container.firstChild) {
    document.body.appendChild(container.firstChild);
  }
}
