import { supabase } from './supabase';
import { logSessionEvent, logAuthEvent, logError } from './logger';

/**
 * Initialize session from Supabase local storage
 * Logs user email if session exists, otherwise logs 'No user logged in'
 */
export async function initializeSessionFromStorage(): Promise<void> {
  try {
    logSessionEvent('Checking for existing session in local storage');
    
    // Get session from Supabase (automatically checks local storage)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logError('SESSION', 'Error retrieving session from Supabase', error);
      logAuthEvent('No user logged in - session retrieval failed');
      return;
    }

    if (session?.user?.email) {
      // Session exists - log user email
      logAuthEvent('User logged in from stored session', {
        email: session.user.email,
        userId: session.user.id,
        expiresAt: new Date(session.expires_at * 1000).toISOString(),
        sessionExpiry: new Date(session.expires_at * 1000).toLocaleString()
      }, session.user.id);
    } else {
      // No session found
      logAuthEvent('No user logged in - no stored session found');
    }
  } catch (error) {
    logError('SESSION', 'Failed to initialize session from storage', error as Error);
    logAuthEvent('No user logged in - initialization failed');
  }
}

/**
 * Set up auth state change listener
 */
export function setupAuthListener(): void {
  supabase.auth.onAuthStateChange((event, session) => {
    logAuthEvent('Auth state changed', { event }, session?.user?.id);
    
    if (session?.user?.email) {
      logAuthEvent('User session updated', {
        email: session.user.email,
        event,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      }, session.user.id);
    } else {
      logAuthEvent('No user logged in after auth state change', { event });
    }
  });
}