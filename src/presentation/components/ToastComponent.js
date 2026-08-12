export class ToastComponent {
  static show(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: #4CAF50; font-size: 1.3rem;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.4s reverse forwards';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
}
