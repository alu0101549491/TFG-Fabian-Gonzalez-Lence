/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/auth/register/register.component.ts
 * @desc Registration page for new users.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthenticationService} from '@application/services';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {type RegisterUserDto} from '@application/dto';

/**
 * RegisterComponent handles new user registration.
 * Provides a reactive form with validation for creating user accounts.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="container">
  <div class="flex justify-center items-center" style="min-height: 80vh;">
    <div class="card" style="max-width: 600px; width: 100%;">
      <div class="card-header">
        <h2 class="card-title text-center">Create Account</h2>
        <p class="card-subtitle text-center">Register for a new account</p>
      </div>

      <div class="card-body">
        @if (errorMessage()) {
          <div class="alert alert-error mb-md">
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="alert alert-success mb-md">
            {{ successMessage() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
            <div class="form-group">
              <label for="firstName" class="form-label form-label-required">First Name</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="form-control"
                [class.form-control-error]="isFieldInvalid('firstName')"
                placeholder="John"
              />
              @if (isFieldInvalid('firstName')) {
                <span class="form-error">{{ getFieldError('firstName') }}</span>
              }
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label form-label-required">Last Name</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="form-control"
                [class.form-control-error]="isFieldInvalid('lastName')"
                placeholder="Doe"
              />
              @if (isFieldInvalid('lastName')) {
                <span class="form-error">{{ getFieldError('lastName') }}</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label for="username" class="form-label form-label-required">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control"
              [class.form-control-error]="isFieldInvalid('username')"
              placeholder="johndoe"
            />
            @if (isFieldInvalid('username')) {
              <span class="form-error">{{ getFieldError('username') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="email" class="form-label form-label-required">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.form-control-error]="isFieldInvalid('email')"
              placeholder="john.doe@example.com"
              autocomplete="email"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">{{ getFieldError('email') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">Phone (optional)</label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              class="form-control"
              [class.form-control-error]="isFieldInvalid('phone')"
              placeholder="+1234567890"
            />
            @if (isFieldInvalid('phone')) {
              <span class="form-error">{{ getFieldError('phone') }}</span>
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
              placeholder="Minimum 8 characters"
              autocomplete="new-password"
            />
            @if (isFieldInvalid('password')) {
              <span class="form-error">{{ getFieldError('password') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label form-label-required">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="form-control"
              [class.form-control-error]="isFieldInvalid('confirmPassword') || passwordsMismatch"
              placeholder="Re-enter your password"
              autocomplete="new-password"
            />
            @if (passwordsMismatch) {
              <span class="form-error">Passwords do not match</span>
            }
          </div>

          <div class="form-group">
            <div class="form-check">
              <input
                type="checkbox"
                id="gdprConsent"
                formControlName="gdprConsent"
                class="form-check-input"
              />
              <label for="gdprConsent" class="form-check-label">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            @if (isFieldInvalid('gdprConsent')) {
              <span class="form-error">{{ getFieldError('gdprConsent') }}</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span>Creating account...</span>
            } @else {
              <span>Create Account</span>
            }
          </button>
        </form>

        <div class="mt-md text-center">
          <p class="text-sm text-muted">
            Already have an account?
            <a routerLink="/login" class="text-primary">Login here</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [],
})
export class RegisterComponent {
  /** Registration form group */
  public registerForm: FormGroup;

  /** Loading state signal */
  public isLoading = signal(false);

  /** Error message signal */
  public errorMessage = signal<string | null>(null);

  /** Success message signal */
  public successMessage = signal<string | null>(null);

  /**
   * Creates an instance of RegisterComponent.
   *
   * @param fb - FormBuilder for creating reactive forms
   * @param authService - Authentication service for registration
   * @param authStateService - Auth state service for managing session
   * @param router - Router for navigation after registration
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly authStateService: AuthStateService,
    private readonly router: Router,
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.pattern('^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$')]],
      gdprConsent: [false, [Validators.requiredTrue]],
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Custom validator to check if password and confirmPassword match.
   *
   * @param formGroup - The form group to validate
   * @returns Validation errors or null
   */
  private passwordMatchValidator(formGroup: FormGroup): {[key: string]: boolean} | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Handles form submission and user registration.
   * On success, automatically logs in and navigates to tournaments.
   */
  public async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.registerForm.value;
      const registerDto: RegisterUserDto = {
        username: formValue.username,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        password: formValue.password,
        phone: formValue.phone || undefined,
        gdprConsent: formValue.gdprConsent,
      };

      const response = await this.authService.register(registerDto);
      
      this.successMessage.set('Registration successful! Logging you in...');
      this.authStateService.setAuth(response.token, response.user);
      
      setTimeout(() => {
        void this.router.navigate(['/tournaments']);
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
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
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Gets error message for a specific field.
   *
   * @param fieldName - Name of the form field
   * @returns Error message string
   */
  public getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['requiredTrue']) return 'You must accept the terms';
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    if (field.errors['pattern']) return 'Invalid format';
    
    return 'Invalid field';
  }

  /**
   * Checks if passwords match.
   *
   * @returns True if passwords do not match
   */
  public get passwordsMismatch(): boolean {
    return !!this.registerForm.errors?.['passwordMismatch'] && 
           !!this.registerForm.get('confirmPassword')?.touched;
  }
}
