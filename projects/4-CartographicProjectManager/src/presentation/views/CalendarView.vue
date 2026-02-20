<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/presentation/views/CalendarView.vue
  @desc Full-page calendar view displaying project delivery dates with
        interactive month navigation and project details.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/components/registration.html}
-->

<template>
  <div class="calendar-view">
    <LoadingSpinner v-if="isLoading" />

    <template v-else>
      <!-- Calendar Header -->
      <header class="calendar-header">
        <h1>Project Calendar</h1>
        <p class="calendar-subtitle">
          View all project delivery dates and deadlines
        </p>
      </header>

      <!-- Calendar Widget (Full Mode) -->
      <div class="calendar-container">
        <CalendarWidget
          :projects="calendarProjects"
          :mode="'full'"
          @project-click="handleProjectClick"
          @month-change="handleMonthChange"
          @date-click="handleDateClick"
        />
      </div>

      <!-- Selected Date Details -->
      <div v-if="selectedDate && projectsOnDate.length > 0" class="date-details">
        <div class="details-header">
          <h2>{{ formatSelectedDate }}</h2>
          <button
            @click="selectedDate = null"
            class="button-ghost button-sm"
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>

        <div class="projects-on-date">
          <ProjectCard
            v-for="project in projectsOnDate"
            :key="project.id"
            :project="project"
            @click="goToProject(project.id)"
          />
        </div>
      </div>

      <!-- Calendar Legend -->
      <aside class="calendar-legend" aria-label="Calendar legend">
        <h3>Legend</h3>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-indicator" style="background-color: var(--color-success)"></div>
            <span>Active Projects</span>
          </div>
          <div class="legend-item">
            <div class="legend-indicator" style="background-color: var(--color-warning)"></div>
            <span>Due Soon (≤ 7 days)</span>
          </div>
          <div class="legend-item">
            <div class="legend-indicator" style="background-color: var(--color-error)"></div>
            <span>Overdue</span>
          </div>
          <div class="legend-item">
            <div class="legend-indicator" style="background-color: var(--color-gray-400)"></div>
            <span>Finalized</span>
          </div>
        </div>
      </aside>

      <!-- No Projects State -->
      <div v-if="calendarProjects.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <h2>No Projects Scheduled</h2>
        <p>There are no projects with delivery dates in the current period.</p>
        <router-link to="/projects" class="button-primary">
          View All Projects
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useProjects} from '../composables/use-projects';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import CalendarWidget from '../components/calendar/CalendarWidget.vue';
import ProjectCard from '../components/project/ProjectCard.vue';
import type {Project} from '@/shared/models/project.model';

// Composables
const router = useRouter();
const {
  calendarProjects,
  isLoading,
  loadCalendarProjects,
} = useProjects();

// Local State
const selectedDate = ref<Date | null>(null);

// Computed Properties
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return '';
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const projectsOnDate = computed(() => {
  if (!selectedDate.value) return [];

  const targetDate = new Date(selectedDate.value);
  targetDate.setHours(0, 0, 0, 0);

  return calendarProjects.value.filter((project) => {
    const deliveryDate = new Date(project.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate.getTime() === targetDate.getTime();
  });
});

// Methods
/**
 * Navigate to project details page
 *
 * @param {string} projectId - Project identifier
 */
function goToProject(projectId: string): void {
  router.push({name: 'project-details', params: {id: projectId}});
}

/**
 * Handle project click event from calendar
 *
 * @param {string} projectId - Clicked project identifier
 */
function handleProjectClick(projectId: string): void {
  goToProject(projectId);
}

/**
 * Handle month change event from calendar
 *
 * @param {Date} date - New month date
 */
async function handleMonthChange(date: Date): Promise<void> {
  try {
    await loadCalendarProjects(date.getFullYear(), date.getMonth() + 1);
  } catch (error) {
    console.error('Failed to load calendar projects for new month:', error);
  }
}

/**
 * Handle date click event from calendar
 *
 * @param {Date} date - Clicked date
 */
function handleDateClick(date: Date): void {
  selectedDate.value = date;
}

// Lifecycle
onMounted(async () => {
  const today = new Date();
  try {
    await loadCalendarProjects(today.getFullYear(), today.getMonth() + 1);
  } catch (error) {
    console.error('Failed to load calendar projects:', error);
  }
});
</script>

<style scoped>
.calendar-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6);
}

.calendar-header {
  margin-bottom: var(--spacing-8);
}

.calendar-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.calendar-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.calendar-container {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.date-details {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-border);
}

.details-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.projects-on-date {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-4);
}

.calendar-legend {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.calendar-legend h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.legend-indicator {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.legend-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-16) var(--spacing-6);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-view {
    padding: var(--spacing-4);
  }

  .calendar-header h1 {
    font-size: var(--font-size-2xl);
  }

  .calendar-container {
    padding: var(--spacing-4);
  }

  .date-details {
    padding: var(--spacing-4);
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .projects-on-date {
    grid-template-columns: 1fr;
  }

  .legend-items {
    flex-direction: column;
    gap: var(--spacing-3);
  }
}

@media (max-width: 480px) {
  .calendar-header h1 {
    font-size: var(--font-size-xl);
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
