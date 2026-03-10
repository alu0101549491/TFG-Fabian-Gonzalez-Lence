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
          :tasks="calendarTasks"
          :mode="'full'"
          @project-click="handleProjectClick"
          @task-click="handleTaskClick"
          @month-change="handleMonthChange"
          @date-select="handleDateClick"
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
import {useTaskStore} from '../stores';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import CalendarWidget from '../components/calendar/CalendarWidget.vue';
import ProjectCard from '../components/project/ProjectCard.vue';
import type {CalendarTaskDto, CalendarProjectDto} from '@/application/dto';
import type {ProjectSummaryViewModel} from '@/presentation/view-models/project.view-model';

// Composables
const router = useRouter();
const {
  projects,
  fetchProjects,
  calendarProjects,
  isLoading,
  loadCalendarProjects,
} = useProjects();
const taskStore = useTaskStore();

// Local State
const selectedDate = ref<Date | null>(null);

// Computed - Convert all project tasks to CalendarTaskDto format
const calendarTasks = computed<CalendarTaskDto[]>(() => {
  const allTasks: CalendarTaskDto[] = [];
  
  // Get all tasks from all loaded projects
  for (const [, tasks] of taskStore.tasksByProject.entries()) {
    for (const task of tasks) {
      allTasks.push({
        id: task.id,
        description: task.description,
        projectId: task.projectId,
        projectCode: task.projectCode,
        projectName: task.projectName,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assigneeName: task.assigneeName,
      });
    }
  }
  
  return allTasks;
});

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

const projectsOnDate = computed<ProjectSummaryViewModel[]>(() => {
  if (!selectedDate.value) return [];

  const targetDate = new Date(selectedDate.value);
  targetDate.setHours(0, 0, 0, 0);

  return projects.value.filter((project) => {
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
 * @param {CalendarProjectDto} project - Clicked project
 */
function handleProjectClick(project: CalendarProjectDto): void {
  goToProject(project.id);
}

/**
 * Handle task click event from calendar
 *
 * @param {CalendarTaskDto} task - Clicked task
 */
function handleTaskClick(task: CalendarTaskDto): void {
  // Navigate to the project with query params to open the specific task
  router.push({
    name: 'project-details',
    params: {id: task.projectId},
    query: {tab: 'tasks', taskId: task.id},
  });
}

/**
 * Handle month change event from calendar
 *
 * @param {Date} date - New month date
 */
async function handleMonthChange(date: Date): Promise<void> {
  try {
    // Get first day of the month
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    // Get last day of the month
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    console.log(`[CalendarView] Loading projects for ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    await loadCalendarProjects(startDate, endDate);
    
    // Load tasks for all projects in the calendar
    await loadTasksForProjects();
  } catch (error) {
    console.error('Failed to load calendar data for new month:', error);
  }
}

/**
 * Load tasks for all projects in calendar
 */
async function loadTasksForProjects(): Promise<void> {
  const projects = [...calendarProjects.value];
  if (projects.length === 0) {
    return;
  }

  const concurrency = 5;
  let nextIndex = 0;

  const workers = Array.from({length: Math.min(concurrency, projects.length)}, async () => {
    while (nextIndex < projects.length) {
      const project = projects[nextIndex];
      nextIndex += 1;

      try {
        await taskStore.fetchTasksByProject(project.id);
      } catch (error) {
        console.warn(`Failed to load tasks for project ${project.code}:`, error);
      }
    }
  });

  await Promise.all(workers);
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
  // Ensure we have full project summaries for the ProjectCard list
  await fetchProjects().catch(() => null);

  const today = new Date();
  // Get first day of current month
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  // Get last day of current month
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  console.log(`[CalendarView] Initial load: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
  
  try {
    await loadCalendarProjects(startDate, endDate);
    console.log(`[CalendarView] Loaded ${calendarProjects.value.length} projects`);
    
    // Load tasks for all projects
    await loadTasksForProjects();
    console.log(`[CalendarView] Loaded ${calendarTasks.value.length} tasks`);
  } catch (error) {
    console.error('Failed to load calendar data:', error);
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

/* Button Styles */
.button-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  text-decoration: none;
}

.button-primary:hover {
  background-color: var(--color-primary-700);
}

.button-primary:active {
  background-color: var(--color-primary-800);
}

.button-primary:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
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
