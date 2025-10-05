/**
 * Standard exit codes for the OpenAPI-to-MCP CLI
 * Following POSIX conventions
 */

export enum ExitCode {
  /**
   * Success - command completed successfully
   */
  SUCCESS = 0,

  /**
   * User error - invalid input, validation failure, file not found
   * Indicates the user can fix the issue
   */
  USER_ERROR = 1,

  /**
   * Internal error - unexpected failure, bug in the application
   * Indicates a problem with the tool itself
   */
  INTERNAL_ERROR = 2,
}

/**
 * Get appropriate exit code for an error
 */
export function getExitCode(error: unknown): number {
  if (!error) {
    return ExitCode.SUCCESS;
  }

  // Check if error has exitCode property
  if (typeof error === 'object' && 'exitCode' in error) {
    const exitCode = (error as { exitCode: unknown }).exitCode;
    if (typeof exitCode === 'number') {
      return exitCode;
    }
  }

  // Default to internal error for unknown errors
  return ExitCode.INTERNAL_ERROR;
}
