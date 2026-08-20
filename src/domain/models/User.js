import { DEFAULT_AVATAR_PATH } from '../../core/utils/constants.js';

/**
 * Entidad de Dominio: User (Usuario de la plataforma)
 */
export class User {
  constructor({
    uid,
    email,
    displayName,
    photoURL,
    role = 'client',
    provider = 'password',
    createdAt = new Date().toISOString()
  }) {
    this.uid = uid;
    this.email = email || '';
    this.displayName = displayName || (email ? email.split('@')[0] : 'Usuario');
    this.photoURL = photoURL || DEFAULT_AVATAR_PATH;
    this.role = role === 'artisan' ? 'artisan' : 'client';
    this.provider = provider;
    this.createdAt = createdAt;
  }

  isArtisan() {
    return this.role === 'artisan';
  }

  isClient() {
    return this.role === 'client';
  }
}
