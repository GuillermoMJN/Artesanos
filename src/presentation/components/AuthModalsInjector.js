
export function injectAuthModals() {
  if (document.getElementById('loginModal')) return;
  const container = document.createElement('div');
  container.innerHTML = `<div class="modal-overlay" id="loginModal">
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
  `;
  while (container.firstChild) {
    document.body.appendChild(container.firstChild);
  }
}
