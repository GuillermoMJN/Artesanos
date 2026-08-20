/**
 * Componente de animación de bienvenida (intro) para primera visita de la sesión
 */
export class IntroAnimationComponent {
  static play() {
    const hasVisited = sessionStorage.getItem('arteysanos_visited');
    const introOverlay = document.getElementById('introOverlay');

    if (hasVisited || !introOverlay) {
      document.body.classList.remove('intro-active');
      if (introOverlay) introOverlay.style.display = 'none';
      return;
    }

    introOverlay.style.display = 'flex';
    document.body.classList.add('intro-active');
    sessionStorage.setItem('arteysanos_visited', 'true');

    setTimeout(() => {
      const introLine = introOverlay.querySelector('.intro-line');
      if (introLine) {
        introLine.style.animation = 'none';
        introLine.style.transition = 'opacity 1s ease-out';
        introLine.style.opacity = '0';
      }

      introOverlay.classList.add('open');
      document.body.classList.remove('intro-active');

      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 1200);
    }, 700);
  }
}
