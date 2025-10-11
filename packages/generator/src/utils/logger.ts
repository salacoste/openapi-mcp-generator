/**
 * Verbose logging utility for generator package
 * Only outputs when VERBOSE environment variable is set to 'true'
 */

/**
 * Log a message with the [generator] prefix when verbose mode is enabled
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function log(message: string, ...args: unknown[]): void {
  if (process.env.VERBOSE === 'true') {
     
    console.log(`[generator] ${message}`, ...args);
  }
}
