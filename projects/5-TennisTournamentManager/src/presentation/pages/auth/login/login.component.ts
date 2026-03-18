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
<div class="container">
  <div class="flex justify-center items-center" style="min-height: 80vh;">
    <div class="card" style="max-width: 400px; width: 100%;">
      <div class="card-header">
        <h2 class="card-title text-center">Login</h2>
        <p class="card-subtitle text-center">Sign in to your account</p>
      </div>

      <div class="card-body">
        @if (errorMessage()) {
          <div class="alert alert-error mb-md">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email" class="form-label form-label-required">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.form-control-error]="isFieldInvalid('email')"
              placeholder="Enter your email"
              autocomplete="email"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">{{ getFieldError('email') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="password" class="form-label form-label-required">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.form-control-error]="isFieldInvalid('password')"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            @if (isFieldInvalid('password')) {
              <span class="form-error">{{ getFieldError('password') }}</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span>Logging in...</span>
            } @else {
              <span>Login</span>
            }
          </button>
        </form>

        <div class="mt-md text-center">
          <p class="text-sm text-muted">
            Don't have an account?
            <a routerLink="/register" class="text-primary">Register here</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [],
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
