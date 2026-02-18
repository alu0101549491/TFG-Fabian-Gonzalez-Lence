<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
  
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/views/ForbiddenView.vue
  @desc 403 Forbidden error page
-->

<template>
  <div class="error-view">
    <div class="error-container">
      <div class="error-code">403</div>
      <h1>Access Forbidden</h1>
      <p class="error-message">
        You don't have permission to access this resource.
      </p>
      <p class="error-description">
        If you believe this is an error, please contact your administrator.
      </p>
      <button class="back-button" @click="goBack">
        Go Back
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  document.title = '403 Forbidden - Cartographic Project Manager';
});

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  color: white;
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.error-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-message {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  opacity: 0.95;
}

.error-description {
  font-size: 1rem;
  margin-bottom: 2rem;
  opacity: 0.85;
}

.back-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  color: #667eea;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.back-button:active {
  transform: translateY(0);
}
</style>
