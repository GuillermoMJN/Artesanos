/**
 * Sistema de Protección Global por PIN (Acceso Privado)
 * Bloquea index.html, perfil.html, etc. hasta ingresar el PIN correcto.
 */
(function () {
  const STORAGE_KEY = 'arteysanos_site_unlocked';
  const SITE_PINS = ['artesanos2026', 'arteysanos', 'admin1234', 'artesanos2026admin'];

  // Verificar si ya fue desbloqueado en esta sesión o dispositivo
  if (sessionStorage.getItem(STORAGE_KEY) === 'true' || localStorage.getItem(STORAGE_KEY) === 'true') {
    return; // Acceso concedido
  }

  // Ocultar de inmediato el contenido de la web para evitar parpadeos
  const hideStyle = document.createElement('style');
  hideStyle.id = 'siteLockHideStyle';
  hideStyle.innerHTML = `
    body > *:not(#siteLockScreenOverlay) {
      display: none !important;
    }
  `;
  document.head.appendChild(hideStyle);

  const renderLockScreen = () => {
    if (document.getElementById('siteLockScreenOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'siteLockScreenOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #FAF7F2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 99999999;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="background: #FFFFFF; border: 1px solid #E6DDD0; border-top: 5px solid #C06C4C; border-radius: 16px; max-width: 440px; width: 100%; padding: 2.8rem 2.2rem; text-align: center; box-shadow: 0 20px 60px rgba(62, 39, 35, 0.12); box-sizing: border-box;">
        
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #FAF7F2; color: #C06C4C; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.3rem;">
          <i class="fa-solid fa-lock"></i>
        </div>

        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 1.65rem; color: #3E2723; margin: 0 0 0.5rem 0;">
          Sitio en Construcción Privada
        </h2>
        
        <p style="color: #6B5B52; font-size: 0.9rem; line-height: 1.6; margin: 0 0 1.8rem 0;">
          El portal <strong>Arte y Sanos</strong> se encuentra actualmente en fase de desarrollo privado. Introduce el PIN de acceso para desbloquear el sitio.
        </p>

        <form id="siteLockForm" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: left;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #3E2723; display: block; margin-bottom: 0.4rem;">
              PIN / Clave de Acceso
            </label>
            <input 
              type="password" 
              id="sitePinInput" 
              placeholder="••••••••" 
              required 
              autofocus 
              style="width: 100%; padding: 0.75rem 1rem; border: 1px solid #E6DDD0; border-radius: 8px; font-size: 1.1rem; text-align: center; letter-spacing: 3px; font-family: inherit; box-sizing: border-box; outline: none; transition: border-color 0.2s;"
              onfocus="this.style.borderColor='#C06C4C'" 
              onblur="this.style.borderColor='#E6DDD0'"
            >
          </div>

          <div id="sitePinError" style="display: none; color: #D32F2F; font-size: 0.84rem; font-weight: 600; background: #FFEBEE; padding: 0.5rem; border-radius: 6px;">
            PIN incorrecto. Inténtalo de nuevo.
          </div>

          <button 
            type="submit" 
            style="background: #C06C4C; color: #FFFFFF; border: none; padding: 0.85rem 1.4rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: background 0.2s; box-shadow: 0 4px 12px rgba(192, 108, 76, 0.25);"
            onmouseover="this.style.background='#A85839'"
            onmouseout="this.style.background='#C06C4C'"
          >
            <i class="fa-solid fa-key"></i> Desbloquear y Acceder
          </button>
        </form>

        <div style="margin-top: 2rem; border-top: 1px solid #FAF7F2; padding-top: 1rem; font-size: 0.75rem; color: #9E8C81;">
          &copy; 2026 Arte y Sanos · Acceso restringido
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('siteLockForm')?.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = document.getElementById('sitePinInput')?.value.trim() || '';
      const err = document.getElementById('sitePinError');

      if (SITE_PINS.includes(val)) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        localStorage.setItem(STORAGE_KEY, 'true');
        overlay.remove();
        hideStyle.remove();
      } else {
        if (err) {
          err.style.display = 'block';
          document.getElementById('sitePinInput').value = '';
          document.getElementById('sitePinInput').focus();
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLockScreen);
  } else {
    renderLockScreen();
  }
})();
