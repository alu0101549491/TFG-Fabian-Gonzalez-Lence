<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
  
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/views/SettingsView.vue
  @desc Settings page for user preferences and account management
-->

<template>
  <div class="settings-view">
    <div class="settings-container">
      <h1>Settings</h1>
      <p>Configure your preferences and account settings.</p>
      
      <div class="settings-sections">
        <section class="settings-section">
          <h2>Account</h2>
          <p>Manage your account information and preferences</p>
        </section>
        
        <section class="settings-section">
          <h2>Notifications</h2>
          <p>Configure notification preferences</p>
        </section>
        
        <section class="settings-section">
          <h2>Privacy</h2>
          <p>Manage your privacy settings</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Settings - Cartographic Project Manager';
});
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-container h1 {
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.settings-sections {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.settings-section h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.25rem;
}

.settings-section p {
  margin: 0;
  color: #666;
}
</style>
