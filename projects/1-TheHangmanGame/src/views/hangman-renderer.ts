/**
 * Renders the hangman drawing on a canvas element.
 * Progressively draws body parts based on failed attempt count.
 *
 * @category View
 */
export class HangmanRenderer {
  /** Canvas element for drawing */
  private canvas: HTMLCanvasElement;

  /** 2D rendering context */
  private context: CanvasRenderingContext2D;

  /**
   * Creates a new HangmanRenderer instance.
   * @param canvasId - The ID of the canvas HTML element
   * @throws {Error} If the canvas element is not found or context cannot be obtained
   */
  constructor(canvasId: string) {
    const element = document.getElementById(canvasId);
    if (!element || !(element instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    this.canvas = element;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.context = ctx;
  }

  /**
   * Renders the hangman drawing based on number of failed attempts.
   * @param attempts - Number of failed attempts (0-6)
   */
  public render(attempts: number): void {
    // Clamp attempts to valid range
    const clampedAttempts = Math.min(Math.max(attempts, 0), 6);

    // Clear canvas and draw gallows
    this.clear();
    this.drawGallows();

    // Draw body parts based on attempts
    if (clampedAttempts >= 1) this.drawHead();
    if (clampedAttempts >= 2) this.drawBody();
    if (clampedAttempts >= 3) this.drawLeftArm();
    if (clampedAttempts >= 4) this.drawRightArm();
    if (clampedAttempts >= 5) this.drawLeftLeg();
    if (clampedAttempts >= 6) this.drawRightLeg();
  }

  /**
   * Clears the entire canvas.
   */
  public clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the gallows structure (base, post, beam, rope).
   * @private
   */
  private drawGallows(): void {
    // Set line style
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;
    this.context.lineCap = 'round';

    // Draw base (horizontal line at bottom)
    this.context.beginPath();
    this.context.moveTo(50, 350);
    this.context.lineTo(200, 350);
    this.context.stroke();

    // Draw post (vertical line from base)
    this.context.beginPath();
    this.context.moveTo(125, 350);
    this.context.lineTo(125, 50);
    this.context.stroke();

    // Draw beam (horizontal line from top of post)
    this.context.beginPath();
    this.context.moveTo(125, 50);
    this.context.lineTo(250, 50);
    this.context.stroke();

    // Draw rope (vertical line from beam)
    this.context.beginPath();
    this.context.moveTo(250, 50);
    this.context.lineTo(250, 100);
    this.context.stroke();
  }

  /**
   * Draws the head (1st failed attempt).
   * @private
   */
  private drawHead(): void {
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;

    // Draw circle for head
    this.context.beginPath();
    this.context.arc(250, 130, 30, 0, 2 * Math.PI);
    this.context.stroke();
  }

  /**
   * Draws the body (2nd failed attempt).
   * @private
   */
  private drawBody(): void {
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;

    // Draw vertical line for body
    this.context.beginPath();
    this.context.moveTo(250, 160);
    this.context.lineTo(250, 250);
    this.context.stroke();
  }

  /**
   * Draws the left arm (3rd failed attempt).
   * @private
   */
  private drawLeftArm(): void {
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;

    // Draw diagonal line for left arm
    this.context.beginPath();
    this.context.moveTo(250, 180);
    this.context.lineTo(210, 210);
    this.context.stroke();
  }

  /**
   * Draws the right arm (4th failed attempt).
   * @private
   */
  private drawRightArm(): void {
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;

    // Draw diagonal line for right arm
    this.context.beginPath();
    this.context.moveTo(250, 180);
    this.context.lineTo(290, 210);
    this.context.stroke();
  }

  /**
   * Draws the left leg (5th failed attempt).
   * @private
   */
  private drawLeftLeg(): void {
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;

    // Draw diagonal line for left leg
    this.context.beginPath();
    this.context.moveTo(250, 250);
    this.context.lineTo(220, 310);
    this.context.stroke();
  }

  /**
   * Draws the right leg (6th failed attempt).
   * @private
   */
  private drawRightLeg(): void {
    this.context.strokeStyle = '#363636';
    this.context.lineWidth = 4;

    // Draw diagonal line for right leg
    this.context.beginPath();
    this.context.moveTo(250, 250);
    this.context.lineTo(280, 310);
    this.context.stroke();
  }
}
