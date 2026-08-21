import { escapeHtml } from '../../core/utils/domUtils.js';

/**
 * Controlador de la Cabecera de Navegación y Menú Móvil
 */
export class HeaderController {
  constructor({ onOpenLogin, onOpenRegister, onOpenShopManage, onOpenUserAccount, onLogout }) {
    this.onOpenLogin = onOpenLogin;
    this.onOpenRegister = onOpenRegister;
    this.onOpenShopManage = onOpenShopManage;
    this.onOpenUserAccount = onOpenUserAccount;
    this.onLogout = onLogout;
  }

  init() {
    this.setupScrollListener();
  }

  setupScrollListener() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
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

  updateAuthUI(user, artisanProfile = null) {
    const navActions = document.getElementById('navAuthActions');
    const mobileNavActions = document.getElementById('mobileNavAuthActions');

    if (user) {
      const isArtisan = (user.profile && user.profile.role === 'artisan') || !!artisanProfile;
      const rawName = (user.profile && user.profile.displayName) || (artisanProfile && artisanProfile.name) || (user.email ? user.email.split('@')[0] : 'Usuario');
      const displayName = escapeHtml(rawName);
      const shortName = escapeHtml(rawName.length > 12 ? rawName.slice(0, 12) + '…' : rawName);
      const artisanId = artisanProfile ? artisanProfile.id : null;
      const profileHref = artisanId ? `perfil.html?id=${artisanId}` : null;

      const nameChipDesktop = profileHref
        ? `<a href="${profileHref}" title="${displayName} — Ver perfil público" style="font-size: 0.85rem; color: var(--primary-dark); font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; background: var(--bg-subtle); padding: 0.5rem 0.9rem; border-radius: 20px; border: 1px solid var(--border-color); flex-shrink: 0; line-height: 1.2; text-decoration: none; transition: border-color 0.2s;">
            <i class="fa-solid ${isArtisan ? 'fa-store' : 'fa-user'}" style="color: var(--terracotta);"></i>
            ${shortName} <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">(${isArtisan ? 'Taller' : 'Cliente'})</span>
          </a>`
        : `<span title="${displayName}" style="font-size: 0.85rem; color: var(--primary-dark); font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; background: var(--bg-subtle); padding: 0.5rem 0.9rem; border-radius: 20px; border: 1px solid var(--border-color); flex-shrink: 0; line-height: 1.2;">
            <i class="fa-solid ${isArtisan ? 'fa-store' : 'fa-user'}" style="color: var(--terracotta);"></i>
            ${shortName} <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">(${isArtisan ? 'Taller' : 'Cliente'})</span>
          </span>`;

      const desktopHtml = `
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: nowrap; white-space: nowrap;">
          ${nameChipDesktop}
          ${isArtisan ? `
            <button class="btn btn-primary" onclick="window.appUI.openShopManageModal()" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0; white-space: nowrap; line-height: 1.2;">
              <i class="fa-solid fa-sliders"></i> Gestionar mi tienda
            </button>
          ` : `
            <button class="btn btn-primary" onclick="window.appUI.openUserAccountModal()" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0; white-space: nowrap; line-height: 1.2;">
              <i class="fa-solid fa-user-gear"></i> Mi Cuenta
            </button>
          `}
          <button class="btn btn-secondary" onclick="window.appUI.handleLogout()" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0; white-space: nowrap; line-height: 1.2;">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
          </button>
        </div>
      `;

      const mobileHtml = `
        ${profileHref
          ? `<a href="${profileHref}" onclick="window.appUI.toggleMobileMenu(false)" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 0.4rem; text-decoration: none;">`
          : `<div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 0.4rem;">`
        }
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <i class="fa-solid ${isArtisan ? 'fa-store' : 'fa-user'}" style="color: var(--terracotta); font-size: 1.1rem;"></i>
            <span style="font-weight: 700; color: var(--primary-dark); font-size: 0.95rem;">${displayName}</span>
          </div>
          <span style="font-size: 0.72rem; background: ${isArtisan ? 'var(--terracotta)' : 'var(--warm-gold)'}; color: #FFF; padding: 0.15rem 0.5rem; border-radius: 10px; font-weight: 600;">
            ${isArtisan ? 'Taller' : 'Cliente'}
          </span>
        ${profileHref ? `</a>` : `</div>`}
        ${isArtisan ? `
          <button class="btn btn-primary" onclick="window.appUI.toggleMobileMenu(false); window.appUI.openShopManageModal();" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-sliders"></i> Gestionar mi tienda
          </button>
        ` : `
          <button class="btn btn-primary" onclick="window.appUI.toggleMobileMenu(false); window.appUI.openUserAccountModal();" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-user-gear"></i> Mi Cuenta & Ajustes
          </button>
        `}
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
}
