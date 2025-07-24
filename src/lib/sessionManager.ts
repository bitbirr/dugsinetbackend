import { supabase } from './supabase';
import { User } from '../types';
import { logger, logSessionEvent, logAuthEvent, logSecurityEvent, logError, logInfo, logWarn } from './logger';

export interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: number;
}

export interface SessionConfig {
  sessionTimeout: number; // in milliseconds
  refreshThreshold: number; // refresh token when this much time is left (in milliseconds)
  maxInactivity: number; // max inactivity time before auto-logout (in milliseconds)
  persistSession: boolean; // whether to persist session across browser restarts
}

class SessionManager {
  private config: SessionConfig;
  private sessionData: SessionData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private sessionKey = 'dugsi_session';
  private listeners: Array<(session: SessionData | null) => void> = [];

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      refreshThreshold: 5 * 60 * 1000, // 5 minutes
      maxInactivity: 2 * 60 * 60 * 1000, // 2 hours
      persistSession: true,
      ...config,
    };

    this.initializeSession();
    this.setupActivityTracking();
  }

  // Initialize session from storage or Supabase
  private async initializeSession(): Promise<void> {
    try {
      logSessionEvent('Initializing session from Supabase');
      
      // Get current session from Supabase (this checks local storage automatically)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logError('SESSION', 'Error getting session from Supabase', error);
        logAuthEvent('No user logged in - session initialization failed');
        return;
      }

      if (session?.user) {
        // Session exists - log user email
        logSessionEvent('Session found in Supabase', { userEmail: session.user.email }, session.user.id);
        
        // Load user profile and create session
        await this.createSessionFromSupabase(session);
      } else {
        // No session found
        logAuthEvent('No active session found in Supabase');
        
        if (this.config.persistSession) {
          // Try to restore from our custom local storage as fallback
          await this.restoreSessionFromStorage();
        }
      }
    } catch (error) {
      logError('SESSION', 'Failed to initialize session', error as Error);
      this.clearSession();
    }
  }

  // Create session from Supabase session
  private async createSessionFromSupabase(supabaseSession: any): Promise<void> {
    try {
      logSessionEvent('Creating session from Supabase data', { userEmail: supabaseSession.user.email }, supabaseSession.user.id);
      
      // Get user profile from database
      const { data: userProfileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseSession.user.id)
        .single();

      let userProfile: User;

      if (error) {
        logWarn('DATABASE', 'Could not load user profile from database', { error: error.message }, supabaseSession.user.id);
        // Use basic user info from auth if profile not found
        userProfile = {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email,
          full_name: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.email,
          role: 'user', // default role
          created_at: supabaseSession.user.created_at,
          updated_at: supabaseSession.user.updated_at,
        };
        logSessionEvent('Using fallback user profile', { userEmail: userProfile.email }, userProfile.id);
      } else {
        userProfile = userProfileData;
        logSessionEvent('User profile loaded from database', { userEmail: userProfile.email, role: userProfile.role }, userProfile.id);
      }

      const sessionData: SessionData = {
        user: userProfile,
        accessToken: supabaseSession.access_token,
        refreshToken: supabaseSession.refresh_token,
        expiresAt: new Date(supabaseSession.expires_at * 1000).getTime(),
        lastActivity: Date.now(),
      };

      this.setSession(sessionData);
      logSessionEvent('Session created successfully', { 
        userEmail: userProfile.email, 
        role: userProfile.role,
        expiresAt: new Date(sessionData.expiresAt).toISOString()
      }, userProfile.id, this.generateSessionId());
    } catch (error) {
      logError('SESSION', 'Failed to create session from Supabase', error as Error, undefined, supabaseSession?.user?.id);
      throw error;
    }
  }

  // Generate a unique session ID for tracking
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set session data and start timers
  private setSession(sessionData: SessionData): void {
    this.sessionData = sessionData;
    this.updateLastActivity();
    
    if (this.config.persistSession) {
      this.saveSessionToStorage();
    }
    
    this.startRefreshTimer();
    this.startActivityTimer();
    this.notifyListeners();
    
    logSessionEvent('Session data set and timers started', { 
      userEmail: sessionData.user.email 
    }, sessionData.user.id);
  }

  // Save session to local storage
  private saveSessionToStorage(): void {
    if (!this.sessionData) return;
    
    try {
      const encryptedSession = this.encryptSession(this.sessionData);
      localStorage.setItem(this.sessionKey, encryptedSession);
      logSessionEvent('Session saved to local storage', undefined, this.sessionData.user.id);
    } catch (error) {
      logError('SESSION', 'Failed to save session to storage', error as Error, undefined, this.sessionData.user.id);
    }
  }

  // Restore session from local storage
  private async restoreSessionFromStorage(): Promise<void> {
    try {
      const encryptedSession = localStorage.getItem(this.sessionKey);
      if (!encryptedSession) {
        logSessionEvent('No session found in local storage');
        return;
      }

      logSessionEvent('Attempting to restore session from local storage');
      const sessionData = this.decryptSession(encryptedSession);
      
      // Validate session is not expired
      if (this.isSessionExpired(sessionData)) {
        logSecurityEvent('Stored session has expired', { 
          userEmail: sessionData.user.email,
          expiresAt: new Date(sessionData.expiresAt).toISOString(),
          lastActivity: new Date(sessionData.lastActivity).toISOString()
        }, sessionData.user.id);
        this.clearSession();
        return;
      }

      // Validate session with Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || user.id !== sessionData.user.id) {
        logSecurityEvent('Stored session is invalid or user mismatch', { 
          error: error?.message,
          storedUserId: sessionData.user.id,
          currentUserId: user?.id
        }, sessionData.user.id);
        this.clearSession();
        return;
      }

      logSessionEvent('Session restored from storage', { 
        userEmail: sessionData.user.email 
      }, sessionData.user.id);
      this.setSession(sessionData);
    } catch (error) {
      logError('SESSION', 'Failed to restore session from storage', error as Error);
      this.clearSession();
    }
  }

  // Simple encryption for session data (in production, use proper encryption)
  private encryptSession(sessionData: SessionData): string {
    return btoa(JSON.stringify(sessionData));
  }

  // Simple decryption for session data
  private decryptSession(encryptedData: string): SessionData {
    return JSON.parse(atob(encryptedData));
  }

  // Check if session is expired
  private isSessionExpired(sessionData: SessionData): boolean {
    const now = Date.now();
    const isTokenExpired = now > sessionData.expiresAt;
    const isInactive = (now - sessionData.lastActivity) > this.config.maxInactivity;
    
    if (isTokenExpired || isInactive) {
      logSecurityEvent('Session expired', {
        userEmail: sessionData.user.email,
        isTokenExpired,
        isInactive,
        expiresAt: new Date(sessionData.expiresAt).toISOString(),
        lastActivity: new Date(sessionData.lastActivity).toISOString(),
        inactivityDuration: now - sessionData.lastActivity
      }, sessionData.user.id);
    }
    
    return isTokenExpired || isInactive;
  }

  // Start refresh timer
  private startRefreshTimer(): void {
    this.clearRefreshTimer();
    
    if (!this.sessionData) return;

    const timeUntilExpiry = this.sessionData.expiresAt - Date.now();
    const refreshTime = Math.max(0, timeUntilExpiry - this.config.refreshThreshold);

    this.refreshTimer = setTimeout(async () => {
      await this.refreshSession();
    }, refreshTime);
    
    logSessionEvent('Refresh timer started', { 
      refreshInMs: refreshTime,
      expiresAt: new Date(this.sessionData.expiresAt).toISOString()
    }, this.sessionData.user.id);
  }

  // Start activity timer
  private startActivityTimer(): void {
    this.clearActivityTimer();
    
    this.activityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.config.maxInactivity);
  }

  // Clear refresh timer
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Clear activity timer
  private clearActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
  }

  // Setup activity tracking
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });
    
    logSessionEvent('Activity tracking setup completed');
  }

  // Update last activity timestamp
  private updateLastActivity(): void {
    if (this.sessionData) {
      this.sessionData.lastActivity = Date.now();
      this.startActivityTimer();
      
      if (this.config.persistSession) {
        this.saveSessionToStorage();
      }
    }
  }

  // Handle inactivity timeout
  private handleInactivityTimeout(): void {
    if (this.sessionData) {
      logSecurityEvent('Session expired due to inactivity', {
        userEmail: this.sessionData.user.email,
        lastActivity: new Date(this.sessionData.lastActivity).toISOString(),
        maxInactivity: this.config.maxInactivity
      }, this.sessionData.user.id);
    }
    this.clearSession();
  }

  // Refresh session token
  private async refreshSession(): Promise<void> {
    try {
      const userId = this.sessionData?.user.id;
      logSessionEvent('Refreshing session token', undefined, userId);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        logSessionEvent('Session token refreshed successfully', undefined, userId);
        await this.createSessionFromSupabase(data.session);
      }
    } catch (error) {
      logError('SESSION', 'Failed to refresh session token', error as Error, undefined, this.sessionData?.user.id);
      this.clearSession();
    }
  }

  // Public methods

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ error: any }> {
    try {
      logAuthEvent('Attempting to sign in user', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logSecurityEvent('Sign in failed', { email, error: error.message });
        return { error };
      }

      if (data.session) {
        logAuthEvent('Sign in successful', { email }, data.session.user.id);
        await this.createSessionFromSupabase(data.session);
      }

      return { error: null };
    } catch (error) {
      logError('AUTH', 'Sign in error', error as Error, { email });
      return { error };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    const userId = this.sessionData?.user.id;
    const userEmail = this.sessionData?.user.email;
    
    try {
      logAuthEvent('Signing out user', { userEmail }, userId);
      await supabase.auth.signOut();
      logAuthEvent('User signed out from Supabase successfully', { userEmail }, userId);
    } catch (error) {
      logError('AUTH', 'Error signing out from Supabase', error as Error, { userEmail }, userId);
    } finally {
      this.clearSession();
    }
  }

  // Clear session
  clearSession(): void {
    const userId = this.sessionData?.user.id;
    const userEmail = this.sessionData?.user.email;
    
    if (this.sessionData) {
      logSessionEvent('Clearing session', { userEmail }, userId);
    }
    
    this.sessionData = null;
    this.clearRefreshTimer();
    this.clearActivityTimer();
    
    if (this.config.persistSession) {
      localStorage.removeItem(this.sessionKey);
      logSessionEvent('Session removed from local storage', { userEmail }, userId);
    }
    
    this.notifyListeners();
    logSessionEvent('Session cleared completely', { userEmail }, userId);
  }

  // Get current session
  getSession(): SessionData | null {
    if (!this.sessionData) return null;
    
    if (this.isSessionExpired(this.sessionData)) {
      this.clearSession();
      return null;
    }
    
    return this.sessionData;
  }

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // Check if user has specific role
  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const hasRequiredRole = Array.isArray(role) ? role.includes(user.role) : user.role === role;
    
    if (!hasRequiredRole) {
      logSecurityEvent('Role access denied', { 
        userEmail: user.email,
        userRole: user.role,
        requiredRole: role
      }, user.id);
    }
    
    return hasRequiredRole;
  }

  // Add session listener
  addListener(listener: (session: SessionData | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.sessionData);
      } catch (error) {
        logError('SESSION', 'Error in session listener', error as Error);
      }
    });
  }

  // Get session info for debugging
  getSessionInfo(): {
    isAuthenticated: boolean;
    user: User | null;
    expiresAt: Date | null;
    lastActivity: Date | null;
    timeUntilExpiry: number | null;
    timeUntilInactivity: number | null;
  } {
    const session = this.getSession();
    const now = Date.now();
    
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getCurrentUser(),
      expiresAt: session ? new Date(session.expiresAt) : null,
      lastActivity: session ? new Date(session.lastActivity) : null,
      timeUntilExpiry: session ? session.expiresAt - now : null,
      timeUntilInactivity: session ? this.config.maxInactivity - (now - session.lastActivity) : null,
    };
  }

  // Public method to manually initialize session (useful for testing)
  async manualInitializeSession(): Promise<void> {
    await this.initializeSession();
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

// Export for use in components
export default sessionManager;