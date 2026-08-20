/**
 * Casos de Uso relacionados con la Autenticación y Cuentas de Usuario
 */
export class AuthUseCases {
  constructor(authRepository, artisanRepository) {
    this.authRepository = authRepository;
    this.artisanRepository = artisanRepository;
  }

  onAuthStateChanged(callback) {
    return this.authRepository.onAuthChange(callback);
  }

  async signIn(email, password) {
    return await this.authRepository.signIn(email, password);
  }

  async signUp(email, password, displayName, role) {
    return await this.authRepository.signUp(email, password, displayName, role);
  }

  async signInWithGoogle(role) {
    return await this.authRepository.signInWithGoogle(role);
  }

  async logout() {
    return await this.authRepository.logout();
  }

  async updateDisplayName(displayName) {
    return await this.authRepository.updateDisplayName(displayName);
  }

  async updateAvatar(file, artisanDocId = null) {
    return await this.authRepository.updateAvatar(file, artisanDocId);
  }

  async changePassword(currentPassword, newPassword) {
    return await this.authRepository.changePassword(currentPassword, newPassword);
  }

  async changeEmail(currentPassword, newEmail) {
    return await this.authRepository.changeEmail(currentPassword, newEmail);
  }

  async deleteAccountCascade(currentPassword) {
    return await this.authRepository.deleteAccountCascade(currentPassword);
  }

  async getUserArtisanProfile(user) {
    if (!user) return null;
    return await this.artisanRepository.getArtisanByOwnerId(user.uid);
  }
}
