export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private isFlushingLogs = false;
  private readonly maxBufferSize = 100;
  private readonly flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    // Start periodic log flushing
    this.startPeriodicFlush();
    
    // Flush logs before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushLogs();
      });
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    userId?: string,
    sessionId?: string,
    error?: Error
  ): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      category,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined,
      userId,
      sessionId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as any : undefined
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // If buffer is full or it's a critical error, flush immediately
    if (this.logBuffer.length >= this.maxBufferSize || entry.level >= LogLevel.ERROR) {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.isFlushingLogs || this.logBuffer.length === 0) {
      return;
    }

    this.isFlushingLogs = true;
    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Group logs by category for better organization
      const logsByCategory = logsToFlush.reduce((acc, log) => {
        if (!acc[log.category]) {
          acc[log.category] = [];
        }
        acc[log.category].push(log);
        return acc;
      }, {} as Record<string, LogEntry[]>);

      // Write logs to different files based on category
      for (const [category, logs] of Object.entries(logsByCategory)) {
        await this.writeLogsToFile(category, logs);
      }
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Put logs back in buffer if writing failed
      this.logBuffer.unshift(...logsToFlush);
    } finally {
      this.isFlushingLogs = false;
    }
  }

  private async writeLogsToFile(category: string, logs: LogEntry[]): Promise<void> {
    try {
      const logContent = logs.map(log => this.formatLogEntry(log)).join('\n') + '\n';
      const fileName = this.getLogFileName(category);
      
      // In a browser environment, we'll use localStorage as a fallback
      // In a Node.js environment, you would use fs.appendFile
      if (typeof window !== 'undefined') {
        await this.writeToLocalStorage(fileName, logContent);
      } else {
        // For Node.js environment (if running server-side)
        await this.writeToFile(fileName, logContent);
      }
    } catch (error) {
      console.error(`Failed to write logs for category ${category}:`, error);
    }
  }

  private async writeToLocalStorage(fileName: string, content: string): Promise<void> {
    try {
      const existingLogs = localStorage.getItem(fileName) || '';
      const maxLogSize = 1024 * 1024; // 1MB limit
      
      let newContent = existingLogs + content;
      
      // Rotate logs if they get too large
      if (newContent.length > maxLogSize) {
        const lines = newContent.split('\n');
        newContent = lines.slice(-1000).join('\n'); // Keep last 1000 lines
      }
      
      localStorage.setItem(fileName, newContent);
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
    }
  }

  private async writeToFile(fileName: string, content: string): Promise<void> {
    // This would be implemented for Node.js environment
    // For now, we'll use a mock implementation
    console.log(`Would write to file ${fileName}:`, content);
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    let formatted = `[${entry.timestamp}] [${levelName}] [${entry.category}] ${entry.message}`;
    
    if (entry.userId) {
      formatted += ` | User: ${entry.userId}`;
    }
    
    if (entry.sessionId) {
      formatted += ` | Session: ${entry.sessionId}`;
    }
    
    if (entry.data) {
      formatted += `\nData: ${entry.data}`;
    }
    
    if (entry.error) {
      formatted += `\nError: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return formatted;
  }

  private getLogFileName(category: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `logs_${category}_${date}.log`;
  }

  // Public logging methods
  public debug(category: string, message: string, data?: any, userId?: string, sessionId?: string): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, data, userId, sessionId);
    this.addToBuffer(entry);
  }

  public info(category: string, message: string, data?: any, userId?: string, sessionId?: string): void {
    const entry = this.createLogEntry(LogLevel.INFO, category, message, data, userId, sessionId);
    this.addToBuffer(entry);
  }

  public warn(category: string, message: string, data?: any, userId?: string, sessionId?: string): void {
    const entry = this.createLogEntry(LogLevel.WARN, category, message, data, userId, sessionId);
    this.addToBuffer(entry);
  }

  public error(category: string, message: string, error?: Error, data?: any, userId?: string, sessionId?: string): void {
    const entry = this.createLogEntry(LogLevel.ERROR, category, message, data, userId, sessionId, error);
    this.addToBuffer(entry);
  }

  public critical(category: string, message: string, error?: Error, data?: any, userId?: string, sessionId?: string): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, category, message, data, userId, sessionId, error);
    this.addToBuffer(entry);
  }

  // Session-specific logging methods
  public logSessionEvent(event: string, data?: any, userId?: string, sessionId?: string): void {
    this.info('SESSION', event, data, userId, sessionId);
  }

  public logAuthEvent(event: string, data?: any, userId?: string): void {
    this.info('AUTH', event, data, userId);
  }

  public logSecurityEvent(event: string, data?: any, userId?: string): void {
    this.warn('SECURITY', event, data, userId);
  }

  public logDatabaseEvent(event: string, data?: any, userId?: string): void {
    this.info('DATABASE', event, data, userId);
  }

  // Method to export logs (for admin purposes)
  public async exportLogs(category?: string): Promise<string> {
    if (typeof window !== 'undefined') {
      const allLogs: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('logs_')) {
          if (!category || key.includes(`logs_${category}_`)) {
            const logs = localStorage.getItem(key);
            if (logs) {
              allLogs.push(`\n=== ${key} ===\n${logs}`);
            }
          }
        }
      }
      
      return allLogs.join('\n');
    }
    
    return '';
  }

  // Method to clear logs (for admin purposes)
  public clearLogs(category?: string): void {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('logs_')) {
          if (!category || key.includes(`logs_${category}_`)) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  // Cleanup method
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushLogs();
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common logging patterns
export const logSessionEvent = (event: string, data?: any, userId?: string, sessionId?: string) => 
  logger.logSessionEvent(event, data, userId, sessionId);

export const logAuthEvent = (event: string, data?: any, userId?: string) => 
  logger.logAuthEvent(event, data, userId);

export const logSecurityEvent = (event: string, data?: any, userId?: string) => 
  logger.logSecurityEvent(event, data, userId);

export const logDatabaseEvent = (event: string, data?: any, userId?: string) => 
  logger.logDatabaseEvent(event, data, userId);

export const logError = (category: string, message: string, error?: Error, data?: any, userId?: string, sessionId?: string) => 
  logger.error(category, message, error, data, userId, sessionId);

export const logInfo = (category: string, message: string, data?: any, userId?: string, sessionId?: string) => 
  logger.info(category, message, data, userId, sessionId);

export const logWarn = (category: string, message: string, data?: any, userId?: string, sessionId?: string) => 
  logger.warn(category, message, data, userId, sessionId);