/**
 * pageTransition.js
 * Sistema global de transiciones suaves entre páginas.
 * Inyecta una pantalla blanca que hace fade-out al cargar,
 * y hace fade-in a blanco al hacer clic en enlaces internos.
 */

(function() {
  // Evitar doble inicialización
  if (window.__pageTransitionInitialized) return;
  window.__pageTransitionInitialized = true;

  // 1. Inyectar estilos
  const style = document.createElement('style');
  style.textContent = `
    #globalWhiteOverlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647; /* Máximo z-index posible */
      background: #FFFFFF;
      opacity: 1; /* Inicia opaco */
      transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none; /* No bloquear clics cuando sea transparente */
    }
    #globalWhiteOverlay.fade-out {
      opacity: 0;
    }
    #globalWhiteOverlay.fade-in {
      opacity: 1;
      pointer-events: all; /* Bloquear clics mientras transiciona */
    }
    
    /* Para perfil.html: mantenerlo opaco hasta que el JS diga que está listo */
    body.is-loading-async #globalWhiteOverlay {
      opacity: 1 !important;
      pointer-events: all !important;
    }
  `;
  document.head.appendChild(style);

  // 2. Inyectar overlay
  const overlay = document.createElement('div');
  overlay.id = 'globalWhiteOverlay';
  
  // Si la página se está abriendo, la mantenemos opaca inicialmente
  document.documentElement.appendChild(overlay);

  // 3. Lógica para desaparecer al cargar
  const fadeOut = () => {
    // Si la página declara que cargará datos asíncronos de forma manual, no hacer fadeOut automático
    if (document.body && document.body.classList.contains('is-loading-async')) {
      return;
    }
    requestAnimationFrame(() => {
      overlay.classList.add('fade-out');
      overlay.classList.remove('fade-in');
    });
  };

  // Exponer método para que páginas asíncronas (como perfil.html) lo llamen
  window.finishPageLoad = () => {
    if (document.body) {
      document.body.classList.remove('is-loading-async');
    }
    requestAnimationFrame(() => {
      overlay.classList.add('fade-out');
      overlay.classList.remove('fade-in');
    });
  };

  if (document.readyState === 'complete') {
    fadeOut();
  } else {
    window.addEventListener('load', fadeOut);
    document.addEventListener('DOMContentLoaded', () => {
      // Retraso ligero para asegurar que el renderizado ha ocurrido
      setTimeout(fadeOut, 50); 
    });
  }

  // 4. Interceptar navegación
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    
    let href = a.getAttribute('href');
    if (!href) return;
    
    // Ignorar links externos, abrir en nueva pestaña, anchors puros o descargas
    if (
      a.target === '_blank' || 
      href.startsWith('http') && !href.includes(window.location.host) ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      a.hasAttribute('download')
    ) {
      return;
    }
    
    // Tratar href vacío como recarga, y no interferir con anclas puras
    if (href === '#' || href === '') return;

    // Si es un anchor a la misma página (ej: index.html#directorio)
    const isSamePageAnchor = href.includes('#') && 
                             (href.split('#')[0] === '' || 
                              href.split('#')[0] === window.location.pathname.split('/').pop() ||
                              href.split('#')[0] === './' + window.location.pathname.split('/').pop());
    
    if (isSamePageAnchor) {
      return; // Dejar que el navegador haga el scroll
    }

    // Es un link interno normal: animar y navegar
    e.preventDefault();

    overlay.classList.remove('fade-out');
    overlay.classList.add('fade-in');

    setTimeout(() => {
      window.location.href = href;
    }, 450); // Mismo tiempo que la transición CSS
  });
})();
