<!--
  @module presentation/views/LoginView
  @description Login page view component.
  Provides the authentication form with credential validation
  and error feedback. Entry point for unauthenticated users.
  @category Presentation
-->
<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Logo and Branding -->
      <div class="login-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill="var(--color-primary)" />
            <path d="M24 12L32 20L24 28L16 20L24 12Z" fill="white" />
            <path d="M12 24H36M24 12V36" stroke="white" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h1>Cartographic Project Manager</h1>
        <p class="subtitle">Professional project management for cartographers</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Error Message -->
        <div v-if="error" class="error-message" role="alert">
          {{ error }}
        </div>

        <!-- Username/Email Input -->
        <div class="form-group">
          <label for="username">Username or Email</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your username"
            autocomplete="username"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
              :disabled="isLoading"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="rememberMe" :disabled="isLoading" />
            <span>Remember me</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="button-primary submit-button" :disabled="isLoading || !isFormValid">
          <span v-if="!isLoading">Log In</span>
          <span v-else>Logging in...</span>
        </button>
      </form>

      <!-- Footer Links -->
      <div class="login-footer">
        <p>&copy; 2025 Cartographic Project Manager. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {useAuth} from '../composables/use-auth';

const {login, isLoading, error: authError} = useAuth();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const error = computed(() => authError.value);

const isFormValid = computed(() => {
  return username.value.trim().length > 0 && password.value.length > 0;
});

async function handleLogin() {
  if (!isFormValid.value) return;

  try {
    await login(username.value.trim(), password.value);
  } catch (err: any) {
    console.error('Login failed:', err);
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

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.logo {
  display: inline-block;
  margin-bottom: var(--spacing-4);
}

.login-header h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.login-form {
  margin-bottom: var(--spacing-6);
}

.error-message {
  background-color: #FEE2E2;
  color: var(--color-text-error);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: var(--spacing-12);
}

.toggle-password {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2);
  font-size: var(--font-size-lg);
}

.toggle-password:hover {
  opacity: 0.7;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.submit-button {
  width: 100%;
  margin-top: var(--spacing-4);
}

.login-footer {
  text-align: center;
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.login-footer p {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin: 0;
}

@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-6);
  }

  .login-header h1 {
    font-size: var(--font-size-xl);
  }
}
</style>
