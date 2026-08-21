/**
 * Transición de entrada suave: pantalla blanca que desaparece al cargar
 */
export class IntroAnimationComponent {
  static play() {
    const introOverlay = document.getElementById('introOverlay');
    if (!introOverlay) return;

    // Pantalla blanca simple con fade-out inmediato al cargar
    introOverlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: #FFFFFF; opacity: 1;
      transition: opacity 0.45s ease; pointer-events: none;
    `;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        introOverlay.style.opacity = '0';
        setTimeout(() => introOverlay.remove(), 500);
      });
    });
  }
}
