/**
 * Componente y Gestor del Banner de Cookies (LSSI-CE & AEPD)
 */
export class CookieBannerComponent {
  static STORAGE_KEY = 'arteysanos_cookie_consent';

  static init() {
    const consent = localStorage.getItem(CookieBannerComponent.STORAGE_KEY);
    if (!consent) {
      CookieBannerComponent.render();
    }
  }

  static render() {
    if (document.getElementById('cookieBannerOverlay')) return;

    const banner = document.createElement('div');
    banner.id = 'cookieBannerOverlay';
    banner.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      right: 1.5rem;
      max-width: 540px;
      margin-left: auto;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.6rem;
      box-shadow: 0 15px 45px rgba(62, 39, 35, 0.18);
      z-index: 99999;
      font-family: var(--font-body);
      animation: slideUpCookie 0.4s ease-out;
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 0.9rem; margin-bottom: 0.9rem;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-subtle); color: var(--terracotta); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
          <i class="fa-solid fa-cookie-bite"></i>
        </div>
        <div>
          <h4 style="margin: 0 0 0.3rem 0; font-size: 1.05rem; color: var(--primary-dark); font-weight: 700;">
            Valoramos tu privacidad
          </h4>
          <p style="margin: 0; font-size: 0.84rem; color: var(--text-secondary); line-height: 1.55;">
            Utilizamos cookies técnicas y de sesión necesarias para garantizar el acceso seguro a tu cuenta y el correcto funcionamiento del portal. Consulta nuestra 
            <a href="cookies.html" target="_blank" style="color: var(--terracotta); font-weight: 600; text-decoration: underline;">Política de Cookies</a> y 
            <a href="privacidad.html" target="_blank" style="color: var(--terracotta); font-weight: 600; text-decoration: underline;">Política de Privacidad</a>.
          </p>
        </div>
      </div>

      <div style="display: flex; gap: 0.6rem; justify-content: flex-end; flex-wrap: wrap; margin-top: 1.2rem; border-top: 1px solid var(--bg-subtle); padding-top: 1rem;">
        <button id="btnRejectCookies" style="background: none; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.5rem 0.9rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          Solo Esenciales
        </button>
        <button id="btnAcceptCookies" style="background: var(--terracotta); color: #FFF; border: none; padding: 0.5rem 1.2rem; border-radius: 20px; font-size: 0.82rem; font-weight: 700; cursor: pointer; box-shadow: var(--shadow-sm); transition: all 0.2s;">
          Aceptar Todas
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('btnAcceptCookies')?.addEventListener('click', () => {
      localStorage.setItem(CookieBannerComponent.STORAGE_KEY, 'all');
      CookieBannerComponent.dismiss();
    });

    document.getElementById('btnRejectCookies')?.addEventListener('click', () => {
      localStorage.setItem(CookieBannerComponent.STORAGE_KEY, 'essential');
      CookieBannerComponent.dismiss();
    });
  }

  static dismiss() {
    const banner = document.getElementById('cookieBannerOverlay');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      banner.style.transition = 'all 0.3s ease-out';
      setTimeout(() => banner.remove(), 300);
    }
  }
}
