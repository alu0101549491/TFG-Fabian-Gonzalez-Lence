<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since March 8, 2026
  @file src/presentation/components/common/AppFooter.vue
  @desc Application footer with basic copyright info
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://typescripttutorial.net}
-->
<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} Cartographic Project Manager. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  background: var(--color-bg-primary);
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-4) 0;
  margin-top: auto;
}

.footer-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.footer-content p {
  margin: 0;
}
</style>
