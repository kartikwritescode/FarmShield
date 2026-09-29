/**
 * FarmShield Authentication & Token Store
 * Provides centralized, non-React access to JWT Bearer tokens and session data
 * for HTTP interceptors, background services, and offline caching.
 */

export interface StoredUserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  role: 'farmer' | 'veterinarian' | 'vet' | 'admin' | string;
  state?: string;
  district?: string;
  farmId?: string;
  licenseNo?: string;
  farmType?: string;
  token?: string;
}

const TOKEN_KEY = 'farmshield_jwt_token';
const USER_KEY = 'vasudha_farmshield_user_session';
const COOKIE_NAME = 'farmshield_mock_auth';

class AuthStore {
  private memoryToken: string | null = null;
  private memoryUser: StoredUserProfile | null = null;
  private listeners: Set<(token: string | null) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.memoryToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          this.memoryUser = JSON.parse(storedUser);
          if (!this.memoryToken && this.memoryUser?.token) {
            this.memoryToken = this.memoryUser.token;
          }
        }
      } catch (err) {
        console.warn('AuthStore failed to load from localStorage:', err);
      }
    }
  }

  /**
   * Synchronously retrieve current JWT Bearer token
   */
  public getToken(): string | null {
    if (this.memoryToken) {
      return this.memoryToken;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          this.memoryToken = stored;
          return stored;
        }
        // Fallback: check stored user object
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            this.memoryToken = parsed.token;
            return parsed.token;
          }
        }
      } catch {}
    }
    return null;
  }

  /**
   * Update the active JWT Bearer token
   */
  public setToken(token: string | null): void {
    this.memoryToken = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {}
    }
    this.notifyListeners();
  }

  /**
   * Retrieve active user profile
   */
  public getUser(): StoredUserProfile | null {
    if (this.memoryUser) return this.memoryUser;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
          this.memoryUser = JSON.parse(stored);
          return this.memoryUser;
        }
      } catch {}
    }
    return null;
  }

  /**
   * Save user profile and optionally persist mock auth cookie for Next.js SSR middleware
   */
  public setUser(user: StoredUserProfile | null): void {
    this.memoryUser = user;
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          if (user.token) {
            this.setToken(user.token);
          }
          // Set cookie for middleware SSR compatibility
          const serialized = encodeURIComponent(JSON.stringify(user));
          document.cookie = `${COOKIE_NAME}=${serialized}; path=/; max-age=2592000; SameSite=Lax`;
        } else {
          localStorage.removeItem(USER_KEY);
          document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
          this.setToken(null);
        }
      } catch {}
    }
  }

  /**
   * Clear all auth session credentials
   */
  public clear(): void {
    this.memoryToken = null;
    this.memoryUser = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      } catch {}
    }
    this.notifyListeners();
  }

  /**
   * Subscribe to token changes
   */
  public subscribe(listener: (token: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.memoryToken);
      } catch (err) {
        console.error('Error in AuthStore listener:', err);
      }
    });
  }
}

export const authStore = new AuthStore();
