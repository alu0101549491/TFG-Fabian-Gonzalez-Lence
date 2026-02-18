<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
 
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/views/RegisterView.vue
  @desc Registration page view for new user account creation
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="register-view">
    <div class="register-container">
      <!-- Logo and Branding -->
      <div class="register-header">
        <div class="register-logo">
          <MapIcon class="register-logo-icon" />
        </div>
        <h1 class="register-title">Create Account</h1>
        <p class="register-subtitle">Join Cartographic Project Manager</p>
      </div>

      <!-- Registration Form -->
      <form class="register-form" @submit.prevent="handleRegister">
        <!-- Error Message -->
        <div v-if="error" class="register-error" role="alert">
          <AlertCircleIcon class="register-error-icon" />
          <span>{{ error }}</span>
        </div>

        <!-- Username Input -->
        <div class="register-field">
          <label for="username" class="register-label">Username *</label>
          <div class="register-input-wrapper">
            <UserIcon class="register-input-icon" />
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="register-input"
              placeholder="Choose a username"
              autocomplete="username"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Email Input -->
        <div class="register-field">
          <label for="email" class="register-label">Email *</label>
          <div class="register-input-wrapper">
            <MailIcon class="register-input-icon" />
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="register-input"
              placeholder="Enter your email"
              autocomplete="email"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="register-field">
          <label for="password" class="register-label">Password *</label>
          <div class="register-input-wrapper">
            <LockIcon class="register-input-icon" />
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="register-input"
              placeholder="Create a password"
              autocomplete="new-password"
              required
              minlength="8"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="register-password-toggle"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOffIcon v-if="showPassword" />
              <EyeIcon v-else />
            </button>
          </div>
          <p class="register-field-hint">Minimum 8 characters</p>
        </div>

        <!-- Confirm Password Input -->
        <div class="register-field">
          <label for="confirmPassword" class="register-label">Confirm Password *</label>
          <div class="register-input-wrapper">
            <LockIcon class="register-input-icon" />
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="register-input"
              placeholder="Confirm your password"
              autocomplete="new-password"
              required
              :disabled="isLoading"
            />
            <button
              type="button"
              class="register-password-toggle"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOffIcon v-if="showConfirmPassword" />
              <EyeIcon v-else />
            </button>
          </div>
        </div>

        <!-- Phone Input (Optional) -->
        <div class="register-field">
          <label for="phone" class="register-label">Phone (Optional)</label>
          <div class="register-input-wrapper">
            <PhoneIcon class="register-input-icon" />
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="register-input"
              placeholder="+34 123 456 789"
              autocomplete="tel"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- WhatsApp Notifications -->
        <div class="register-options">
          <label class="register-checkbox-label">
            <input
              v-model="form.whatsappEnabled"
              type="checkbox"
              class="register-checkbox"
            />
            <span>Enable WhatsApp notifications</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="register-submit"
          :disabled="isLoading || !isFormValid"
        >
          <LoadingSpinner v-if="isLoading" size="sm" color="white" />
          <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
        </button>

        <!-- Login Link -->
        <p class="register-login-link">
          Already have an account?
          <router-link to="/login" class="register-link">Sign In</router-link>
        </p>
      </form>

      <!-- Footer -->
      <p class="register-footer">
        © {{ currentYear }} Cartographic Project Manager
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed} from 'vue';
import {useAuth} from '@/presentation/composables';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import type {RegisterCredentialsDto} from '@/application/dto';
import {
  Map as MapIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-vue-next';

const {register, isLoading} = useAuth();

// State
const form = reactive<RegisterCredentialsDto & {confirmPassword: string}>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: null,
  whatsappEnabled: false,
});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const error = ref<string | null>(null);

const currentYear = new Date().getFullYear();

const isFormValid = computed(() => {
  return (
    form.username.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password.trim() !== '' &&
    form.confirmPassword.trim() !== '' &&
    form.password.length >= 8
  );
});

async function handleRegister() {
  error.value = null;

  // Client-side validation
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }

  try {
    const result = await register(form);

    if (!result.success) {
      error.value = result.error || 'Registration failed. Please try again.';
    }
    // Note: Redirect is handled by the register function in useAuth
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.';
  }
}
</script>

<style scoped>
.register-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--spacing-4);
}

.register-container {
  width: 100%;
  max-width: 500px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-8);
}

/* Header Section */
.register-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.register-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-4);
}

.register-logo-icon {
  width: 36px;
  height: 36px;
  color: white;
}

.register-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.register-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Form Section */
.register-form {
  margin-bottom: var(--spacing-6);
}

.register-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background-color: var(--color-error-50);
  color: var(--color-error-700);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-error-200);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
}

.register-error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Form Fields */
.register-field {
  margin-bottom: var(--spacing-4);
}

.register-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.register-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.register-input-icon {
  position: absolute;
  left: var(--spacing-3);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.register-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) var(--spacing-10);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: var(--transition-normal);
}

.register-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.register-input:disabled {
  background-color: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.register-password-toggle {
  position: absolute;
  right: var(--spacing-3);
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-password-toggle:hover {
  color: var(--color-text-primary);
}

.register-password-toggle svg {
  width: 20px;
  height: 20px;
}

.register-field-hint {
  margin: var(--spacing-1) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* Options */
.register-options {
  margin-bottom: var(--spacing-5);
}

.register-checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.register-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.register-checkbox:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Submit Button */
.register-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-normal);
  margin-bottom: var(--spacing-4);
}

.register-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.register-submit:active:not(:disabled) {
  transform: translateY(0);
}

.register-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Login Link */
.register-login-link {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.register-link {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: var(--transition-fast);
}

.register-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Footer */
.register-footer {
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .register-container {
    padding: var(--spacing-6);
  }

  .register-title {
    font-size: var(--font-size-xl);
  }
}
</style>
