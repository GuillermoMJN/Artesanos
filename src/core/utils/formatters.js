/**
 * Utilidades de formateo para la interfaz de usuario
 */

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  return String(phone).replace(/[^0-9]/g, '');
}

export function renderStarRatingHtml(rating = 5.0) {
  const rounded = Math.round(Number(rating) || 5);
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      starsHtml += '<i class="fa-solid fa-star"></i>';
    } else {
      starsHtml += '<i class="fa-regular fa-star"></i>';
    }
  }
  return starsHtml;
}

export function formatDateEs(isoDateOrTimestamp) {
  if (!isoDateOrTimestamp) return 'Reciente';
  try {
    const d = new Date(isoDateOrTimestamp);
    if (isNaN(d.getTime())) return String(isoDateOrTimestamp);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return 'Reciente';
  }
}
