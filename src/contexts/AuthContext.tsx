import React, { createContext, useContext, useState, useEffect } from 'react';
import { sessionManager, SessionData } from '../lib/sessionManager';
import { initializeSessionFromStorage } from '../lib/simpleSessionInit';
import { User } from '../types';
import { logAuthEvent, logError } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  sessionInfo: {
    isAuthenticated: boolean;
    user: User | null;
    expiresAt: Date | null;
    lastActivity: Date | null;
    timeUntilExpiry: number | null;
    timeUntilInactivity: number | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook function - defined as a regular function to avoid Fast Refresh issues
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component - defined as a regular function component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session and set up listener
    const initializeAuth = async () => {
      try {
        logAuthEvent('AuthProvider: Initializing authentication');
        
        // Use the simple session initialization function
        await initializeSessionFromStorage();
        
        // Get initial session from session manager
        const currentUser = sessionManager.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser) {
          logAuthEvent('AuthProvider: User authenticated', { email: currentUser.email }, currentUser.id);
        } else {
          logAuthEvent('AuthProvider: No authenticated user');
        }
      } catch (error) {
        logError('AUTH', 'AuthProvider: Failed to initialize authentication', error as Error);
        setLoading(false);
      }
    };

    // Set up session listener
    const unsubscribe = sessionManager.addListener((session: SessionData | null) => {
      logAuthEvent('AuthProvider: Session changed', { 
        hasSession: !!session,
        userEmail: session?.user?.email 
      }, session?.user?.id);
      
      setUser(session?.user || null);
      setLoading(false);
      
      if (session?.user) {
        logAuthEvent('AuthProvider: User session active', { 
          email: session.user.email,
          role: session.user.role 
        }, session.user.id);
      } else {
        logAuthEvent('AuthProvider: No active session');
      }
    });

    initializeAuth();

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    logAuthEvent('AuthProvider: Attempting sign in', { email });
    setLoading(true);
    try {
      const result = await sessionManager.signIn(email, password);
      if (!result.error) {
        logAuthEvent('AuthProvider: Sign in successful', { email });
      } else {
        logAuthEvent('AuthProvider: Sign in failed', { email, error: result.error.message });
      }
      return result;
    } catch (error) {
      logError('AUTH', 'AuthProvider: Sign in error', error as Error, { email });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const userEmail = user?.email;
    const userId = user?.id;
    
    logAuthEvent('AuthProvider: Signing out user', { userEmail }, userId);
    setLoading(true);
    try {
      await sessionManager.signOut();
      logAuthEvent('AuthProvider: Sign out successful', { userEmail }, userId);
    } catch (error) {
      logError('AUTH', 'AuthProvider: Sign out error', error as Error, { userEmail }, userId);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string | string[]) => {
    return sessionManager.hasRole(role);
  };

  const value = {
    user,
    loading,
    isAuthenticated: sessionManager.isAuthenticated(),
    signIn,
    signOut,
    hasRole,
    sessionInfo: sessionManager.getSessionInfo(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export both as named exports
export { useAuth, AuthProvider };