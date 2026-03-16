/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/external/web-push-adapter.ts
 * @desc Web Push notification adapter implementing Observer Pattern channel
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Web Push notification adapter.
 * Implements an Observer Pattern notification channel for browser push notifications.
 * Uses the Web Push API and service workers to deliver notifications to browsers.
 */
export class WebPushAdapter {
  /**
   * Creates an instance of WebPushAdapter.
   */
  constructor() {}

  /**
   * Sends a push notification to a browser via service worker subscription.
   * @param subscription - The push subscription endpoint or subscription object
   * @param title - The notification title
   * @param body - The notification body content
   * @returns Promise resolving when the push notification is sent successfully
   */
  public async sendPush(subscription: string, title: string, body: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
