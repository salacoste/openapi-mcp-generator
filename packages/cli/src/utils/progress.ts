/**
 * Progress reporting utility for CLI operations
 * Shows generation progress in interactive terminals
 */

import cliProgress from 'cli-progress';

export class ProgressReporter {
  private progressBar: cliProgress.SingleBar | null = null;
  private isTTY: boolean;
  private currentStage: string = '';
  private currentValue: number = 0;
  private totalValue: number = 0;

  constructor() {
    // Only show progress bar in interactive terminals
    this.isTTY = process.stdout.isTTY || false;
  }

  /**
   * Start progress reporting
   */
  start(totalItems: number, initialStage: string = 'Starting...'): void {
    if (!this.isTTY) {return;}

    this.totalValue = totalItems;
    this.currentStage = initialStage;

    this.progressBar = new cliProgress.SingleBar(
      {
        format: 'Progress [{bar}] {percentage}% | {stage}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
        clearOnComplete: false,
        stopOnComplete: true,
      },
      cliProgress.Presets.shades_classic
    );

    this.progressBar.start(totalItems, 0, { stage: initialStage });
  }

  /**
   * Update progress
   */
  update(current: number, stage: string): void {
    if (!this.isTTY || !this.progressBar) {return;}

    this.currentValue = current;
    this.currentStage = stage;
    this.progressBar.update(current, { stage });
  }

  /**
   * Increment progress by 1
   */
  increment(stage?: string): void {
    const newValue = this.currentValue + 1;
    this.update(newValue, stage || this.currentStage);
  }

  /**
   * Complete and stop progress bar
   */
  complete(): void {
    if (!this.isTTY || !this.progressBar) {return;}

    this.progressBar.update(this.totalValue, { stage: 'Complete' });
    this.progressBar.stop();
  }

  /**
   * Stop progress bar (on error)
   */
  stop(): void {
    if (!this.isTTY || !this.progressBar) {return;}

    this.progressBar.stop();
  }

  /**
   * Check if running in TTY mode
   */
  isInteractive(): boolean {
    return this.isTTY;
  }
}

/**
 * Example usage:
 *
 * const progress = new ProgressReporter();
 * progress.start(100, 'Parsing...');
 *
 * for (let i = 0; i < 100; i++) {
 *   // Do work
 *   progress.update(i + 1, `Processing item ${i}`);
 * }
 *
 * progress.complete();
 */
