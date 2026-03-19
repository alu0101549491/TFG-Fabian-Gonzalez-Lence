/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/auth/login/login.component.ts
 * @desc Login page for user authentication (NFR12).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthenticationService} from '@application/services';
import {AuthStateService} from '@presentation/services/auth-state.service';

/**
 * LoginComponent handles user authentication.
 * Provides a reactive form for email and password input with validation.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Hero Section with Gradient Background -->
    <div class="login-container">
      <div class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">Welcome Back</h1>
          <p class="hero-subtitle">Sign in to manage your tennis tournaments</p>
        </div>
      </div>

      <!-- Login Form Card -->
      <div class="form-section">
        <div class="form-wrapper">
          <div class="login-card">
            <div class="card-header-custom">
              <div class="icon-wrapper">
                <span class="tennis-icon">🎾</span>
              </div>
              <h2 class="form-title">Login</h2>
              <p class="form-subtitle">Sign in to your account</p>
            </div>

            <div class="card-body-custom">
              @if (errorMessage()) {
                <div class="alert alert-error mb-md">
                  <span class="alert-icon">⚠️</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
                <div class="form-group">
                  <label for="email" class="form-label form-label-required">Email</label>
                  <div class="input-wrapper">
                    <span class="input-icon">📧</span>
                    <input
                      type="email"
                      id="email"
                      formControlName="email"
                      class="form-control-enhanced"
                      [class.form-control-error]="isFieldInvalid('email')"
                      placeholder="Enter your email"
                      autocomplete="email"
                    />
                  </div>
                  @if (isFieldInvalid('email')) {
                    <span class="form-error">{{ getFieldError('email') }}</span>
                  }
                </div>

                <div class="form-group">
                  <label for="password" class="form-label form-label-required">Password</label>
                  <div class="input-wrapper">
                    <span class="input-icon">🔒</span>
                    <input
                      type="password"
                      id="password"
                      formControlName="password"
                      class="form-control-enhanced"
                      [class.form-control-error]="isFieldInvalid('password')"
                      placeholder="Enter your password"
                      autocomplete="current-password"
                    />
                  </div>
                  @if (isFieldInvalid('password')) {
                    <span class="form-error">{{ getFieldError('password') }}</span>
                  }
                </div>

                <button
                  type="submit"
                  class="btn-login"
                  [disabled]="isLoading()"
                  [class.btn-loading]="isLoading()"
                >
                  @if (isLoading()) {
                    <span class="spinner"></span>
                    <span>Logging in...</span>
                  } @else {
                    <span>Login</span>
                    <span class="arrow">→</span>
                  }
                </button>
              </form>

              <div class="divider">
                <span>or</span>
              </div>

              <div class="register-section">
                <p class="register-text">
                  Don't have an account?
                  <a routerLink="/register" class="register-link">Register here</a>
                </p>
              </div>
            </div>
          </div>

          <!-- Additional Info Card -->
          <div class="info-card">
            <div class="info-item">
              <span class="info-icon">⚡</span>
              <span class="info-text">Fast & Secure Login</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🏆</span>
              <span class="info-text">Tournament Management</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📊</span>
              <span class="info-text">Real-time Statistics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: var(--color-gray-50);
      display: flex;
      flex-direction: column;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #1976D2 100%);
      color: var(--color-white);
      padding: 3rem 0;
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><circle cx="200" cy="150" r="100" fill="rgba(255,255,255,0.05)"/><circle cx="1000" cy="400" r="150" fill="rgba(255,255,255,0.03)"/><circle cx="600" cy="250" r="80" fill="rgba(255,255,255,0.04)"/></svg>');
      background-size: cover;
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      text-align: center;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-white);
      text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.4),
        0 4px 8px rgba(0, 0, 0, 0.3),
        0 8px 16px rgba(0, 0, 0, 0.2);
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.2);
      font-weight: var(--font-weight-medium);
    }

    /* Form Section */
    .form-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem var(--spacing-lg);
      margin-top: -2rem;
      position: relative;
      z-index: 2;
    }

    .form-wrapper {
      width: 100%;
      max-width: 480px;
    }

    /* Login Card */
    .login-card {
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.07),
        0 10px 20px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: all 0.3s ease;
      margin-bottom: var(--spacing-xl);
    }

    .login-card:hover {
      box-shadow: 
        0 8px 12px rgba(0, 0, 0, 0.1),
        0 16px 32px rgba(0, 0, 0, 0.12),
        0 24px 48px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    .card-header-custom {
      padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
      text-align: center;
      border-bottom: 2px solid var(--color-gray-100);
    }

    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1B5E20, #2E7D32);
      border-radius: 50%;
      margin-bottom: var(--spacing-md);
      box-shadow: 0 8px 16px rgba(27, 94, 32, 0.3);
    }

    .tennis-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .form-title {
      font-size: 2rem;
      font-weight: var(--font-weight-bold);
      color: var(--color-gray-900);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .form-subtitle {
      font-size: var(--font-size-base);
      color: var(--color-gray-600);
      margin: 0;
    }

    .card-body-custom {
      padding: var(--spacing-xl);
    }

    /* Form Styles */
    .login-form {
      margin-bottom: var(--spacing-lg);
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: var(--spacing-md);
      font-size: 1.25rem;
      z-index: 1;
      pointer-events: none;
      opacity: 0.6;
    }

    .form-control-enhanced {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
      border: 2px solid var(--color-gray-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-base);
      transition: all 0.2s ease;
      background: var(--color-white);
    }

    .form-control-enhanced:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
    }

    .form-control-enhanced:hover {
      border-color: var(--color-gray-400);
    }

    .form-control-error {
      border-color: var(--color-error);
    }

    .form-control-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .form-error {
      display: block;
      color: var(--color-error);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
    }

    /* Login Button */
    .btn-login {
      width: 100%;
      padding: var(--spacing-md);
      background: linear-gradient(135deg, #1B5E20, #2E7D32);
      color: var(--color-white);
      border: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      box-shadow: 0 4px 8px rgba(27, 94, 32, 0.3);
    }

    .btn-login:hover:not(:disabled) {
      background: linear-gradient(135deg, #2E7D32, #388E3C);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(27, 94, 32, 0.4);
    }

    .btn-login:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-login:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-login .arrow {
      font-size: 1.25rem;
      transition: transform 0.3s ease;
    }

    .btn-login:hover:not(:disabled) .arrow {
      transform: translateX(4px);
    }

    /* Loading Spinner */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--color-white);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Divider */
    .divider {
      position: relative;
      text-align: center;
      margin: var(--spacing-xl) 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--color-gray-300);
    }

    .divider span {
      position: relative;
      display: inline-block;
      padding: 0 var(--spacing-md);
      background: var(--color-white);
      color: var(--color-gray-500);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    /* Register Section */
    .register-section {
      text-align: center;
    }

    .register-text {
      color: var(--color-gray-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .register-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: var(--font-weight-semibold);
      transition: all 0.2s ease;
    }

    .register-link:hover {
      color: #1B5E20;
      text-decoration: underline;
    }

    /* Info Card */
    .info-card {
      background: linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(25, 118, 210, 0.05));
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm);
      background: var(--color-white);
      border-radius: var(--border-radius-md);
      transition: all 0.2s ease;
    }

    .info-item:hover {
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .info-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .info-text {
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    /* Alert Styles */
    .alert {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--color-error-dark);
    }

    .alert-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .form-section {
        padding: 2rem var(--spacing-md);
        margin-top: -1.5rem;
      }

      .card-header-custom,
      .card-body-custom {
        padding: var(--spacing-lg);
      }

      .icon-wrapper {
        width: 60px;
        height: 60px;
      }

      .tennis-icon {
        font-size: 2rem;
      }

      .form-title {
        font-size: 1.5rem;
      }

      .info-card {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 2rem 0;
      }

      .form-section {
        padding: 1.5rem var(--spacing-sm);
      }

      .card-header-custom,
      .card-body-custom {
        padding: var(--spacing-md);
      }

      .hero-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  /** FormBuilder injected using inject() function */
  private readonly fb = inject(FormBuilder);
  
  /** Authentication service for login operations */
  private readonly authService = inject(AuthenticationService);
  
  /** Auth state service for managing session */
  private readonly authStateService = inject(AuthStateService);
  
  /** Router for navigation after successful login */
  private readonly router = inject(Router);

  /** Login form group with email and password controls */
  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Loading state signal */
  public isLoading = signal(false);

  /** Error message signal */
  public errorMessage = signal<string | null>(null);

  /**
   * Handles form submission and user authentication.
   * On success, stores auth state and navigates to tournaments.
   */
  public async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const {email, password} = this.loginForm.value;
      const response = await this.authService.login(email, password);
      
      this.authStateService.setAuth(response.token, response.user);
      await this.router.navigate(['/home']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Checks if a form field has errors and has been touched.
   *
   * @param fieldName - Name of the form field
   * @returns True if field is invalid and touched
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Gets error message for a specific field.
   *
   * @param fieldName - Name of the form field
   * @returns Error message string
   */
  public getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    
    return 'Invalid field';
  }
}
