<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
 
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/views/LoginView.vue
  @desc Login page view with authentication form
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Logo and Branding -->
      <div class="login-header">
        <div class="login-logo">
          <MapIcon class="login-logo-icon" />
        </div>
        <h1 class="login-title">Cartographic PM</h1>
        <p class="login-subtitle">Project Management System</p>
      </div>

      <!-- Login Form -->
      <form class="login-form" @submit.prevent="handleLogin">
        <h2 class="login-form-title">Sign In</h2>

        <!-- Development Info -->
        <div class="login-dev-info" v-if="isDevelopment">
          <p class="dev-info-title">🔧 Development Mode - Test Accounts:</p>
          <ul class="dev-info-list">
            <li><strong>Admin:</strong> admin@cartographic.com / admin123</li>
            <li><strong>Client:</strong> client@example.com / client123</li>
            <li><strong>Special:</strong> special@cartographic.com / special123</li>
          </ul>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="login-error" role="alert">
          <AlertCircleIcon class="login-error-icon" />
          <span>{{ error }}</span>
        </div>

        <!-- Email Input -->
        <div class="login-field">
          <label for="email" class="login-label">Email</label>
          <div class="login-input-wrapper">
            <MailIcon class="login-input-icon" />
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="login-input"
              placeholder="Enter your email"
              autocomplete="email"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="login-field">
          <label for="password" class="login-label">Password</label>
          <div class="login-input-wrapper">
            <LockIcon class="login-input-icon" />
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="login-input"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
              :disabled="isLoading"
            />
            <button
              type="button"
              class="login-password-toggle"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOffIcon v-if="showPassword" />
              <EyeIcon v-else />
            </button>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="login-options">
          <label class="login-remember">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              class="login-checkbox"
            />
            <span>Remember me</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="login-submit"
          :disabled="isLoading || !isFormValid"
        >
          <LoadingSpinner v-if="isLoading" size="sm" color="white" />
          <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
        </button>

        <!-- Register Link -->
        <p class="login-register-link">
          Don't have an account?
          <router-link to="/register" class="login-link">Sign Up</router-link>
        </p>
      </form>

      <!-- Footer -->
      <p class="login-footer">
        © {{ currentYear }} Cartographic Project Manager
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useAuth} from '@/presentation/composables';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {
  Map as MapIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const {login, isLoading} = useAuth();

// State
const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
});
const showPassword = ref(false);
const error = ref<string | null>(null);

const currentYear = new Date().getFullYear();
const isDevelopment = import.meta.env.DEV;

const isFormValid = computed(() => {
  return form.email.trim() !== '' && form.password.trim() !== '';
});

async function handleLogin() {
  error.value = null;

  try {
    const result = await login(
      form.email,
      form.password,
      form.rememberMe
    );

    if (!result.success) {
      error.value = result.error || 'Invalid email or password. Please try again.';
    }
    // Note: Redirect is handled by the login function in useAuth
  } catch (err: any) {
    error.value =
      err.message || 'Invalid email or password. Please try again.';
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--spacing-4);
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-8);
}

/* Header Section */
.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.login-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-4);
}

.login-logo-icon {
  width: 36px;
  height: 36px;
  color: white;
}

.login-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.login-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Form Section */
.login-form {
  margin-bottom: var(--spacing-6);
}

.login-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-6) 0;
  text-align: center;
}

.login-error {
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

.login-error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Development Info */
.login-dev-info {
  background-color: #e8f4fd;
  color: #014361;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid #90cdf4;
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
}

.dev-info-title {
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-2) 0;
}

.dev-info-list {
  margin: 0;
  padding-left: var(--spacing-5);
  list-style-type: disc;
}

.dev-info-list li {
  margin-bottom: var(--spacing-1);
}

.dev-info-list strong {
  font-weight: var(--font-weight-semibold);
}

/* Form Fields */
.login-field {
  margin-bottom: var(--spacing-4);
}

.login-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.login-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.login-input-icon {
  position: absolute;
  left: var(--spacing-3);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.login-input {
  width: 100%;
  height: var(--height-input);
  padding: var(--spacing-3) var(--spacing-4);
  padding-left: var(--spacing-10);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

.login-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.login-input:disabled {
  background-color: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.login-input::placeholder {
  color: var(--color-text-tertiary);
}

.login-password-toggle {
  position: absolute;
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: var(--transition-colors);
  padding: 0;
}

.login-password-toggle:hover {
  color: var(--color-text-primary);
}

.login-password-toggle svg {
  width: 20px;
  height: 20px;
}

/* Options Section */
.login-options {
  margin-bottom: var(--spacing-4);
}

.login-remember {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  user-select: none;
}

.login-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

/* Submit Button */
.login-submit {
  width: 100%;
  height: var(--height-button);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: white;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-all);
}

.login-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.login-submit:active:not(:disabled) {
  transform: translateY(0);
}

.login-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Register Link */
.login-register-link {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-4) 0 0 0;
}

.login-link {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: var(--transition-fast);
}

.login-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Footer */
.login-footer {
  text-align: center;
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-6);
  }

  .login-title {
    font-size: var(--font-size-xl);
  }

  .login-form-title {
    font-size: var(--font-size-lg);
  }
}
</style>
