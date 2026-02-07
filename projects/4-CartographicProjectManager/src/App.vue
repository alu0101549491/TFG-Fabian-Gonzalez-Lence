<!--
  @module App
  @description Root Vue component. Provides the top-level layout
  (header, sidebar, main content area with router-view, footer).
  @category Presentation
-->
<template>
  <div id="cpm-app">
    <AppHeader v-if="showLayout" />
    <AppSidebar v-if="showLayout && showMobileSidebar" @close="showMobileSidebar = false" />
    
    <div class="app-layout" v-if="showLayout">
      <main class="app-main">
        <router-view />
      </main>
    </div>

    <router-view v-else />

    <AppFooter v-if="showLayout" />
  </div>
</template>

<script setup lang="ts">
/**
 * App - Root component of the Cartographic Project Manager.
 */
import {ref, computed, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useAuth} from './presentation/composables/use-auth';
import AppHeader from './presentation/components/common/AppHeader.vue';
import AppSidebar from './presentation/components/common/AppSidebar.vue';
import AppFooter from './presentation/components/common/AppFooter.vue';

const route = useRoute();
const {isAuthenticated} = useAuth();
const showMobileSidebar = ref(false);

// Show header/footer layout for authenticated routes only
const showLayout = computed(() => {
  return isAuthenticated.value && route.name !== 'Login';
});

// Set document title based on route
watch(() => route.meta.title, (title) => {
  document.title = title
    ? `${title} - Cartographic Project Manager`
    : 'Cartographic Project Manager';
}, {immediate: true});
</script>

<style scoped>
#cpm-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout {
  display: flex;
  flex: 1;
  margin-top: var(--header-height);
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 100%;
}

@media (max-width: 767px) {
  .app-layout {
    flex-direction: column;
  }
}
</style>
