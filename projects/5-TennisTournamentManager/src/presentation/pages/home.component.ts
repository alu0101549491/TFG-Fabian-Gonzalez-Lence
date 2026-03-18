/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/home.component.ts
 * @desc Home/landing page component with professional tennis-themed design and inline template.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, inject, computed} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {AuthStateService} from '@presentation/services/auth-state.service';

/**
 * HomeComponent - Landing page with comprehensive feature presentation
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="tennis-icon">🎾</span>
          </div>
          <h1 class="hero-title">Tennis Tournament Manager</h1>
          
          @if (isAuthenticated()) {
            <p class="hero-subtitle">
              Welcome back, {{ currentUser()?.firstName || 'Player' }}! 
              Your tournaments and matches are ready to manage.
            </p>
            
            <div class="cta-buttons">
              <button (click)="goToBrowseTournaments()" class="btn btn-primary">
                <span class="btn-icon">🏆</span>
                <span>Browse Tournaments</span>
              </button>
              <a routerLink="/profile" class="btn btn-secondary">
                <span class="btn-icon">👤</span>
                <span>My Profile</span>
              </a>
            </div>
          } @else {
            <p class="hero-subtitle">
              Complete management platform for tennis tournaments with real-time tracking,
              automated draws, and multichannel notifications
            </p>
            
            <div class="cta-buttons">
              <a routerLink="/login" class="btn btn-primary">
                <span class="btn-icon">🔐</span>
                <span>Sign In</span>
              </a>
              <a routerLink="/register" class="btn btn-secondary">
                <span class="btn-icon">📝</span>
                <span>Get Started</span>
              </a>
            </div>
          }

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-value">3</div>
              <div class="stat-label">Draw Types</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">12</div>
              <div class="stat-label">Match States</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">9</div>
              <div class="stat-label">Entry States</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="section-header">
          <h2>Comprehensive Tournament Management</h2>
          <p>Everything you need to organize and manage professional tennis tournaments</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon primary">🏆</div>
            <h3>Tournament Creation</h3>
            <p>Create multiple simultaneous tournaments with complete configuration: Round Robin, Knockout, and Match Play formats</p>
            <ul class="feature-list">
              <li>Singles & doubles support</li>
              <li>Category & level management</li>
              <li>Court availability tracking</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon secondary">📊</div>
            <h3>Automated Draws & Seeding</h3>
            <p>Generate professional draws automatically with intelligent seeding based on player rankings</p>
            <ul class="feature-list">
              <li>Multiple tiebreak criteria</li>
              <li>Consolation brackets</li>
              <li>Bye management</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon success">⚡</div>
            <h3>Real-time Results</h3>
            <p>Live score entry with automatic standings calculation and instant notifications</p>
            <ul class="feature-list">
              <li>Result confirmation system</li>
              <li>Match state tracking</li>
              <li>Dispute resolution</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon warning">📅</div>
            <h3>Order of Play</h3>
            <p>Smart scheduling considering court availability, player readiness, and estimated match duration</p>
            <ul class="feature-list">
              <li>Automatic generation</li>
              <li>Real-time updates</li>
              <li>Court reassignment</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon info">🔔</div>
            <h3>Multichannel Notifications</h3>
            <p>Keep everyone informed with intelligent notifications across multiple platforms</p>
            <ul class="feature-list">
              <li>Email & in-app alerts</li>
              <li>Telegram integration</li>
              <li>Web push notifications</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon error">📈</div>
            <h3>Statistics & Rankings</h3>
            <p>Comprehensive statistics with ELO ratings, personal records, and tournament analytics</p>
            <ul class="feature-list">
              <li>Global player rankings</li>
              <li>Historical data tracking</li>
              <li>ITF & TODS export</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Roles Section -->
      <section class="roles-section">
        <div class="section-header">
          <h2>Designed for Every Role</h2>
          <p>Tailored experiences for administrators, players, and spectators</p>
        </div>

        <div class="roles-grid">
          <div class="role-card">
            <div class="role-icon">👨‍💼</div>
            <h3>System Administrator</h3>
            <p>Full platform control with global tournament management and user permission handling</p>
          </div>

          <div class="role-card">
            <div class="role-icon">🎯</div>
            <h3>Tournament Administrator</h3>
            <p>Complete tournament management including draws, results validation, and announcements</p>
          </div>

          <div class="role-card">
            <div class="role-icon">🎾</div>
            <h3>Registered Player</h3>
            <p>Tournament registration, result entry, personal statistics, and notifications</p>
          </div>

          <div class="role-card">
            <div class="role-icon">👁️</div>
            <h3>Public Viewer</h3>
            <p>Access to public tournaments, live results, standings, and player profiles</p>
          </div>
        </div>
      </section>

      <!-- CTA Footer -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to organize your tournament?</h2>
          <p>Join the platform and start managing professional tennis tournaments today</p>
          <div class="cta-buttons">
            <a routerLink="/register" class="btn btn-light">
              <span>Create Account</span>
            </a>
            <a routerLink="/tournaments" class="btn btn-outline-light">
              <span>Browse Tournaments</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Container */
    .home-container {
      min-height: 100vh;
      background: var(--color-white);
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-secondary) 100%);
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.05)"/><circle cx="900" cy="400" r="120" fill="rgba(255,255,255,0.03)"/><circle cx="1100" cy="150" r="60" fill="rgba(255,255,255,0.04)"/></svg>');
      background-size: cover;
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: var(--spacing-2xl);
      max-width: 900px;
      color: var(--color-white);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      backdrop-filter: blur(10px);
      margin-bottom: var(--spacing-xl);
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .tennis-icon {
      font-size: 3.5rem;
    }

    .hero-title {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-md);
      letter-spacing: -0.02em;
      color: var(--color-white);
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--spacing-2xl);
      opacity: 0.95;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      color: var(--color-white);
    }

    .cta-buttons {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: var(--spacing-3xl);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .btn-primary {
      background: var(--color-white);
      color: var(--color-primary);
      box-shadow: var(--shadow-lg);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
      background: var(--color-gray-100);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: var(--color-white);
      border-color: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: var(--color-white);
      transform: translateY(-2px);
    }

    .btn-outline-light {
      background: transparent;
      color: var(--color-white);
      border-color: var(--color-white);
    }

    .btn-outline-light:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .btn-light {
      background: var(--color-white);
      color: var(--color-primary);
    }

    .btn-light:hover {
      background: var(--color-gray-100);
      transform: translateY(-2px);
    }

    .btn-icon {
      font-size: 1.25rem;
    }

    .hero-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xl);
      margin-top: var(--spacing-2xl);
      padding: var(--spacing-xl);
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-lg);
      backdrop-filter: blur(10px);
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-white);
    }

    .stat-label {
      font-size: var(--font-size-sm);
      opacity: 0.9;
      margin-top: var(--spacing-xs);
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
    }

    /* Sections */
    .features-section,
    .roles-section {
      padding: var(--spacing-3xl) var(--spacing-xl);
      max-width: 1400px;
      margin: 0 auto;
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--spacing-3xl);
    }

    .section-header h2 {
      font-size: var(--font-size-3xl);
      color: var(--color-gray-900);
      margin-bottom: var(--spacing-md);
    }

    .section-header p {
      font-size: var(--font-size-lg);
      color: var(--color-gray-700);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: var(--spacing-xl);
    }

    .feature-card {
      background: var(--color-white);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      border: 2px solid var(--color-gray-200);
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--color-primary-light);
    }

    .feature-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: var(--border-radius-lg);
      font-size: 2rem;
      margin-bottom: var(--spacing-lg);
    }

    .feature-icon.primary {
      background: var(--color-primary-alpha);
      color: var(--color-primary);
    }

    .feature-icon.secondary {
      background: rgba(25, 118, 210, 0.1);
      color: var(--color-secondary);
    }

    .feature-icon.success {
      background: rgba(76, 175, 80, 0.1);
      color: var(--color-success);
    }

    .feature-icon.warning {
      background: rgba(245, 124, 0, 0.1);
      color: var(--color-warning);
    }

    .feature-icon.info {
      background: rgba(2, 136, 209, 0.1);
      color: var(--color-info);
    }

    .feature-icon.error {
      background: rgba(211, 47, 47, 0.1);
      color: var(--color-error);
    }

    .feature-card h3 {
      font-size: var(--font-size-xl);
      color: var(--color-gray-900);
      margin-bottom: var(--spacing-sm);
    }

    .feature-card p {
      font-size: var(--font-size-base);
      color: var(--color-gray-700);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--spacing-md);
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-list li {
      padding: var(--spacing-xs) 0;
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
    }

    .feature-list li::before {
      content: '✓';
      color: var(--color-success);
      font-weight: var(--font-weight-bold);
      margin-right: var(--spacing-sm);
    }

    /* Roles Section */
    .roles-section {
      background: var(--color-gray-100);
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
    }

    .role-card {
      background: var(--color-white);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      text-align: center;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .role-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary);
      box-shadow: var(--shadow-lg);
    }

    .role-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .role-card h3 {
      font-size: var(--font-size-lg);
      color: var(--color-gray-900);
      margin-bottom: var(--spacing-sm);
    }

    .role-card p {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      line-height: var(--line-height-relaxed);
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      padding: var(--spacing-3xl) var(--spacing-xl);
      text-align: center;
    }

    .cta-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: var(--font-size-3xl);
      color: var(--color-white);
      margin-bottom: var(--spacing-md);
    }

    .cta-content p {
      font-size: var(--font-size-lg);
      color: var(--color-white);
      opacity: 0.95;
      margin-bottom: var(--spacing-xl);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: var(--font-size-2xl);
      }

      .hero-subtitle {
        font-size: var(--font-size-base);
      }

      .hero-stats {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .stat-divider {
        width: 40px;
        height: 1px;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `],
})
export class HomeComponent {
  /** Auth state service for checking authentication status */
  private readonly authStateService = inject(AuthStateService);

  /** Router for navigation */
  private readonly router = inject(Router);
  
  /** Computed signal indicating if user is authenticated */
  public readonly isAuthenticated = computed(() => this.authStateService.isAuthenticated());
  
  /** Computed signal with current user data */
  public readonly currentUser = computed(() => this.authStateService.getCurrentUser());
  
  /**
   * Navigates to browse tournaments page.
   */
  public goToBrowseTournaments(): void {
    void this.router.navigate(['/tournaments']);
  }
}
