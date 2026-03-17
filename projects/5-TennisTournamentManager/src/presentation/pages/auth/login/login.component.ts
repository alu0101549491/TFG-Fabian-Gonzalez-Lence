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

import {Component, signal} from '@angular/core';
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
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent {
  /** Login form group with email and password controls */
  public loginForm: FormGroup;

  /** Loading state signal */
  public isLoading = signal(false);

  /** Error message signal */
  public errorMessage = signal<string | null>(null);

  /**
   * Creates an instance of LoginComponent.
   *
   * @param fb - FormBuilder for creating reactive forms
   * @param authService - Authentication service for login operations
   * @param authStateService - Auth state service for managing session
   * @param router - Router for navigation after successful login
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly authStateService: AuthStateService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

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
      await this.router.navigate(['/tournaments']);
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
