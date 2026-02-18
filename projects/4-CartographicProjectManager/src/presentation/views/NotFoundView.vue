<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
  
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/views/NotFoundView.vue
  @desc 404 Not Found error page
-->

<template>
  <div class="error-view">
    <div class="error-container">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p class="error-message">
        The page you're looking for doesn't exist.
      </p>
      <p class="error-description">
        It might have been moved or deleted, or you may have mistyped the URL.
      </p>
      <div class="actions">
        <button class="back-button" @click="goBack">
          Go Back
        </button>
        <button class="home-button" @click="goHome">
          Go Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  document.title = '404 Not Found - Cartographic Project Manager';
});

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.back-button,
.home-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.back-button {
  color: #f5576c;
  background: white;
}

.home-button {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
}

.back-button:hover,
.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.back-button:active,
.home-button:active {
  transform: translateY(0);
}
</style>
