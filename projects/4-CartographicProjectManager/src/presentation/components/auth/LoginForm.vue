<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <h2>Login</h2>
    <div class="form-group">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="username"
        type="text"
        required
        placeholder="Enter your username"
      />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        placeholder="Enter your password"
      />
    </div>
    <ErrorMessage
      v-if="errorMessage"
      :message="errorMessage"
    />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useAuth} from '../../composables/useAuth';
import ErrorMessage from '../common/ErrorMessage.vue';

const {login} = useAuth();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async (): Promise<void> => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await login(username.value, password.value);
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}
</style>
