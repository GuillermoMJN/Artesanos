/**
 * Interfaz / Contrato para el Repositorio de Autenticación y Cuentas
 */
export class IAuthRepository {
  onAuthChange(callback) {
    throw new Error('Method not implemented.');
  }

  async getCurrentUser() {
    throw new Error('Method not implemented.');
  }

  async getUserProfile(uid) {
    throw new Error('Method not implemented.');
  }

  async signIn(email, password) {
    throw new Error('Method not implemented.');
  }

  async signUp(email, password, displayName, role) {
    throw new Error('Method not implemented.');
  }

  async signInWithGoogle(role) {
    throw new Error('Method not implemented.');
  }

  async logout() {
    throw new Error('Method not implemented.');
  }

  async updateDisplayName(displayName) {
    throw new Error('Method not implemented.');
  }

  async changePassword(currentPassword, newPassword) {
    throw new Error('Method not implemented.');
  }

  async changeEmail(currentPassword, newEmail) {
    throw new Error('Method not implemented.');
  }

  async deleteAccountCascade(currentPassword) {
    throw new Error('Method not implemented.');
  }
}
