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
      <!-- Logo -->
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

        <!-- Error Message -->
        <div v-if="error" class="login-error" role="alert">
          <AlertCircleIcon class="login-error-icon" />
          <span>{{ error }}</span>
        </div>

        <!-- Email -->
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

        <!-- Password -->
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
            <input v-model="form.rememberMe" type="checkbox" class="login-checkbox" />
            <span>Remember me</span>
          </label>
        </div>

        <!-- Submit -->
        <button type="submit" class="login-submit" :disabled="isLoading || !isFormValid">
          <LoadingSpinner v-if="isLoading" size="sm" color="white" />
          <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="login-footer">© {{ currentYear }} Cartographic Project Manager</p>
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

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
});
const showPassword = ref(false);
const error = ref<string | null>(null);
const currentYear = new Date().getFullYear();

const isFormValid = computed(() => form.email.trim() !== '' && form.password.trim() !== '');

async function handleLogin() {
  error.value = null;
  try {
    await login({email: form.email, password: form.password, rememberMe: form.rememberMe});
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (err: any) {
    error.value = err.message || 'Invalid email or password. Please try again.';
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  padding: var(--spacing-4);
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
  color: white;
}

.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-3);
}

.login-logo-icon {
  width: 64px;
  height: 64px;
}

.login-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-1);
}

.login-subtitle {
  font-size: var(--font-size-sm);
  opacity: 0.8;
  margin: 0;
}

.login-form {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-xl);
}

.login-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-6);
  text-align: center;
}

.login-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background-color: var(--color-error-50);
  color: var(--color-error-700);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
}

.login-error-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.login-field {
  margin-bottom: var(--spacing-4);
}

.login-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.login-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.login-input-icon {
  position: absolute;
  left: var(--spacing-3);
  width: 18px;
  height: 18px;
  color: var(--color-gray-400);
  pointer-events: none;
}

.login-input {
  width: 100%;
  height: var(--height-input);
  padding: 0 var(--spacing-10) 0 var(--spacing-10);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
}

.login-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.login-input:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

.login-password-toggle {
  position: absolute;
  right: var(--spacing-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.login-password-toggle:hover {
  color: var(--color-gray-600);
}

.login-password-toggle svg {
  width: 18px;
  height: 18px;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-6);
}

.login-remember {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.login-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary-600);
}

.login-submit {
  width: 100%;
  height: var(--height-button-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.login-submit:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.login-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.6);
  margin-top: var(--spacing-6);
}
</style>
