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
  templateUrl: './register.component.html',
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
