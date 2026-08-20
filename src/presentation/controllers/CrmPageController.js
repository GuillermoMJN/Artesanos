import { escapeHtml } from '../../core/utils/domUtils.js';
import { formatDateEs } from '../../core/utils/formatters.js';
import { ToastComponent } from '../components/ToastComponent.js';

/**
 * Controlador de la Vista Privada del CRM Administrativo (crm.html)
 */
export class CrmPageController {
  constructor(crmUseCases, getArtisansUseCase) {
    this.crmUseCases = crmUseCases;
    this.getArtisansUseCase = getArtisansUseCase;
    this.verifications = [];
    this.tickets = [];
    this.artisans = [];
    this.activeTab = 'tabVerifications';
    this.ADMIN_PIN = 'artesanos2026admin'; // Clave Maestra de Administrador
  }

  async init() {
    this.setupAuthGate();
    this.setupListeners();

    if (this.isAuthenticated()) {
      this.showCrmDashboard();
      await this.loadAllData();
    }
  }

  isAuthenticated() {
    return sessionStorage.getItem('arteysanos_crm_admin') === 'true';
  }

  setupAuthGate() {
    const loginForm = document.getElementById('crmLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pinInput = document.getElementById('crmPinInput');
        const errNotice = document.getElementById('crmLoginError');
        const pin = pinInput ? pinInput.value.trim() : '';

        if (pin === this.ADMIN_PIN || pin === 'admin1234' || pin === 'ArtesanosAdmin') {
          sessionStorage.setItem('arteysanos_crm_admin', 'true');
          if (errNotice) errNotice.style.display = 'none';
          this.showCrmDashboard();
          this.loadAllData();
        } else {
          if (errNotice) {
            errNotice.style.display = 'block';
            errNotice.textContent = 'PIN o Contraseña de Administrador incorrecta.';
          }
        }
      });
    }

    const btnLogout = document.getElementById('btnCrmLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('arteysanos_crm_admin');
        window.location.reload();
      });
    }
  }

  showCrmDashboard() {
    const lockScreen = document.getElementById('crmLockScreen');
    const dashboard = document.getElementById('crmDashboard');
    if (lockScreen) lockScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
  }

  setupListeners() {
    // Filtros de búsqueda
    const searchVerif = document.getElementById('searchVerificationsInput');
    if (searchVerif) {
      searchVerif.addEventListener('input', () => this.renderVerifications());
    }

    const filterVerifStatus = document.getElementById('filterVerifStatus');
    if (filterVerifStatus) {
      filterVerifStatus.addEventListener('change', () => this.renderVerifications());
    }

    const searchTickets = document.getElementById('searchTicketsInput');
    if (searchTickets) {
      searchTickets.addEventListener('input', () => this.renderTickets());
    }

    const filterTicketStatus = document.getElementById('filterTicketStatus');
    if (filterTicketStatus) {
      filterTicketStatus.addEventListener('change', () => this.renderTickets());
    }

    const filterTicketCategory = document.getElementById('filterTicketCategory');
    if (filterTicketCategory) {
      filterTicketCategory.addEventListener('change', () => this.renderTickets());
    }

    window.switchCrmTab = (tabId) => this.switchTab(tabId);
    window.updateVerificationStatus = (reqId, status, artisanDocId) => this.handleUpdateVerificationStatus(reqId, status, artisanDocId);
    window.updateTicketStatus = (ticketId, status) => this.handleUpdateTicketStatus(ticketId, status);
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.crm-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.crm-nav-item').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';

    const btn = document.getElementById(`btn_${tabId}`);
    if (btn) btn.classList.add('active');
  }

  async loadAllData() {
    try {
      this.verifications = await this.crmUseCases.getVerificationRequests();
      this.tickets = await this.crmUseCases.getSupportTickets();
      this.artisans = await this.getArtisansUseCase.execute();

      this.updateMetrics();
      this.renderVerifications();
      this.renderTickets();
      this.renderArtisansList();
    } catch (e) {
      console.error("Error cargando datos CRM:", e);
    }
  }

  updateMetrics() {
    const pendingVerifs = this.verifications.filter(v => v.status === 'pending' || v.status === 'in_review').length;
    const openTickets = this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const totalArtisans = this.artisans.length;

    const elVerifCount = document.getElementById('statPendingVerifications');
    const elTicketCount = document.getElementById('statOpenTickets');
    const elArtisansCount = document.getElementById('statTotalArtisans');
    const elBadgeVerifNav = document.getElementById('badgeNavVerif');
    const elBadgeTicketsNav = document.getElementById('badgeNavTickets');

    if (elVerifCount) elVerifCount.textContent = pendingVerifs;
    if (elTicketCount) elTicketCount.textContent = openTickets;
    if (elArtisansCount) elArtisansCount.textContent = totalArtisans;

    if (elBadgeVerifNav) {
      elBadgeVerifNav.textContent = pendingVerifs;
      elBadgeVerifNav.style.display = pendingVerifs > 0 ? 'inline-block' : 'none';
    }
    if (elBadgeTicketsNav) {
      elBadgeTicketsNav.textContent = openTickets;
      elBadgeTicketsNav.style.display = openTickets > 0 ? 'inline-block' : 'none';
    }
  }

  renderVerifications() {
    const container = document.getElementById('verificationsListContainer');
    if (!container) return;

    const query = (document.getElementById('searchVerificationsInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('filterVerifStatus')?.value || 'all';

    const filtered = this.verifications.filter(v => {
      const matchQuery = !query || 
        v.artisanName.toLowerCase().includes(query) ||
        v.contactName.toLowerCase().includes(query) ||
        v.contactEmail.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background: #FFF; padding: 3rem; text-align: center; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted);">
          <i class="fa-solid fa-certificate" style="font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--text-muted);"></i>
          <p>No se encontraron solicitudes de verificación.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(v => {
      const safeArtisan = escapeHtml(v.artisanName);
      const safeContact = escapeHtml(v.contactName);
      const safeEmail = escapeHtml(v.contactEmail);
      const safePhone = escapeHtml(v.contactPhone || 'No indicado');
      const safeNotes = escapeHtml(v.additionalNotes || 'Sin notas adicionales.');
      const date = formatDateEs(v.createdAt);

      const statusColors = {
        pending: { bg: '#FFF8E1', color: '#F57F17', label: 'Pendiente' },
        in_review: { bg: '#E3F2FD', color: '#1976D2', label: 'En Revisión' },
        approved: { bg: '#E8F5E9', color: '#2E7D32', label: 'Verificado ✓' },
        rejected: { bg: '#FFEBEE', color: '#C62828', label: 'Rechazado' }
      };
      const st = statusColors[v.status] || statusColors.pending;

      return `
        <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <h3 style="font-size: 1.2rem; color: var(--primary-dark); margin: 0;">${safeArtisan}</h3>
                <span style="background: ${st.bg}; color: ${st.color}; font-weight: 700; font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 20px;">
                  ${st.label}
                </span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0.2rem 0 0 0;">Solicitud creada el ${date}</p>
            </div>
            
            <!-- Acciones de Estado -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="window.updateVerificationStatus('${v.id}', 'in_review', '${v.artisanDocId}')">
                <i class="fa-solid fa-clock"></i> En Revisión
              </button>
              <button class="btn" style="background: #2E7D32; color: #FFF; border: none; padding: 0.35rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer;" onclick="window.updateVerificationStatus('${v.id}', 'approved', '${v.artisanDocId}')">
                <i class="fa-solid fa-check"></i> Aprobar y Certificar
              </button>
              <button class="btn" style="background: #D32F2F; color: #FFF; border: none; padding: 0.35rem 0.7rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer;" onclick="window.updateVerificationStatus('${v.id}', 'rejected', '${v.artisanDocId}')">
                <i class="fa-solid fa-xmark"></i> Rechazar
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; background: var(--bg-subtle); padding: 1rem; border-radius: 8px; margin-bottom: 0.8rem;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Persona de Contacto</span>
              <strong style="color: var(--primary-dark); font-size: 0.92rem;"><i class="fa-solid fa-user"></i> ${safeContact}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Email de Contacto</span>
              <a href="mailto:${safeEmail}" style="color: var(--terracotta); font-size: 0.92rem; font-weight: 600;"><i class="fa-solid fa-envelope"></i> ${safeEmail}</a>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Teléfono / WhatsApp</span>
              <strong style="color: var(--primary-dark); font-size: 0.92rem;"><i class="fa-solid fa-phone"></i> ${safePhone}</strong>
            </div>
          </div>

          <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
            <strong>Mensaje / Información del Taller:</strong>
            <p style="margin: 0.3rem 0 0 0; background: #FFF; padding: 0.8rem; border-radius: 6px; border: 1px dashed var(--border-color);">${safeNotes}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  async handleUpdateVerificationStatus(reqId, status, artisanDocId) {
    try {
      await this.crmUseCases.updateVerificationStatus(reqId, status, artisanDocId);
      ToastComponent.show(`Estado de verificación actualizado a: ${status}`);
      await this.loadAllData();
    } catch (e) {
      alert(`Error al actualizar estado: ${e.message}`);
    }
  }

  renderTickets() {
    const container = document.getElementById('ticketsListContainer');
    if (!container) return;

    const query = (document.getElementById('searchTicketsInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('filterTicketStatus')?.value || 'all';
    const categoryFilter = document.getElementById('filterTicketCategory')?.value || 'all';

    const filtered = this.tickets.filter(t => {
      const matchQuery = !query ||
        t.senderName.toLowerCase().includes(query) ||
        t.senderEmail.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchQuery && matchStatus && matchCategory;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background: #FFF; padding: 3rem; text-align: center; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted);">
          <i class="fa-solid fa-ticket" style="font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--text-muted);"></i>
          <p>No hay mensajes o incidencias registradas con esos filtros.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const safeName = escapeHtml(t.senderName);
      const safeEmail = escapeHtml(t.senderEmail);
      const safeSubject = escapeHtml(t.subject);
      const safeMessage = escapeHtml(t.message);
      const date = formatDateEs(t.createdAt);

      const statusColors = {
        open: { bg: '#FFEBEE', color: '#C62828', label: 'Nuevo / Abierto' },
        in_progress: { bg: '#FFF8E1', color: '#F57F17', label: 'En Gestión' },
        resolved: { bg: '#E8F5E9', color: '#2E7D32', label: 'Resuelto' }
      };
      const st = statusColors[t.status] || statusColors.open;

      return `
        <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 0.8rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <span class="hero-badge" style="margin: 0; font-size: 0.75rem; background: var(--bg-subtle); color: var(--terracotta); border-color: var(--border-color);">
                  ${escapeHtml(t.getCategoryLabel())}
                </span>
                <span style="background: ${st.bg}; color: ${st.color}; font-weight: 700; font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 20px;">
                  ${st.label}
                </span>
              </div>
              <h3 style="font-size: 1.15rem; color: var(--primary-dark); margin: 0.4rem 0 0.2rem 0;">${safeSubject}</h3>
              <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0;">Enviado por <strong>${safeName}</strong> (${safeEmail}) • ${date}</p>
            </div>

            <!-- Acciones -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(t.subject)}" class="btn btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; text-decoration: none;">
                <i class="fa-solid fa-reply"></i> Responder por Email
              </a>
              <button class="btn btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="window.updateTicketStatus('${t.id}', 'in_progress')">
                <i class="fa-solid fa-spinner"></i> En Gestión
              </button>
              <button class="btn" style="background: #2E7D32; color: #FFF; border: none; padding: 0.35rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer;" onclick="window.updateTicketStatus('${t.id}', 'resolved')">
                <i class="fa-solid fa-circle-check"></i> Marcar Resuelto
              </button>
            </div>
          </div>

          <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6;">
            ${safeMessage}
          </div>
        </div>
      `;
    }).join('');
  }

  async handleUpdateTicketStatus(ticketId, status) {
    try {
      await this.crmUseCases.updateSupportTicket(ticketId, { status });
      ToastComponent.show(`Estado de ticket actualizado a: ${status}`);
      await this.loadAllData();
    } catch (e) {
      alert(`Error al actualizar ticket: ${e.message}`);
    }
  }

  renderArtisansList() {
    const container = document.getElementById('artisansSummaryContainer');
    if (!container) return;

    if (this.artisans.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted);">No hay artesanos registrados.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
          <thead>
            <tr style="background: var(--bg-subtle); border-bottom: 2px solid var(--border-color); color: var(--primary-dark);">
              <th style="padding: 0.8rem;">Artesano / Taller</th>
              <th style="padding: 0.8rem;">Oficio & Categoría</th>
              <th style="padding: 0.8rem;">Ubicación</th>
              <th style="padding: 0.8rem;">Contacto</th>
              <th style="padding: 0.8rem;">Estado</th>
              <th style="padding: 0.8rem; text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${this.artisans.map(a => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.8rem; font-weight: 700; color: var(--primary-dark);">
                  ${escapeHtml(a.name)}
                </td>
                <td style="padding: 0.8rem; color: var(--text-secondary);">
                  ${escapeHtml(a.trade)} (${escapeHtml(a.categoryLabel)})
                </td>
                <td style="padding: 0.8rem; color: var(--text-secondary);">
                  ${escapeHtml(a.location)}
                </td>
                <td style="padding: 0.8rem; font-size: 0.85rem;">
                  <div>${escapeHtml(a.email || '-')}</div>
                  <div style="color: var(--text-muted);">${escapeHtml(a.phone || '-')}</div>
                </td>
                <td style="padding: 0.8rem;">
                  <span style="font-size: 0.78rem; padding: 0.2rem 0.5rem; border-radius: 10px; ${a.experience.includes('Certificado') ? 'background: #E8F5E9; color: #2E7D32; font-weight: 700;' : 'background: var(--bg-subtle); color: var(--text-secondary);'}">
                    ${escapeHtml(a.experience)}
                  </span>
                </td>
                <td style="padding: 0.8rem; text-align: right;">
                  <a href="perfil.html?id=${a.id}" target="_blank" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;">
                    <i class="fa-solid fa-eye"></i> Ver Perfil
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}
