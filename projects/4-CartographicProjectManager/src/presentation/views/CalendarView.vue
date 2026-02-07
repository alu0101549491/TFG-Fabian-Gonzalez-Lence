<!--
  @module presentation/views/CalendarView
  @description Calendar view displaying project delivery dates
  with color-coded status indicators.
  @category Presentation
-->
<template>
  <div class="calendar-view">
    <div class="container">
      <div class="calendar-header">
        <h1>Calendar</h1>
        <div class="month-navigation">
          <button @click="previousMonth" class="nav-btn">‹</button>
          <span class="current-month">{{ currentMonthName }} {{ currentYear }}</span>
          <button @click="nextMonth" class="nav-btn">›</button>
        </div>
      </div>

      <div class="calendar-legend">
        <div class="legend-item">
          <div class="legend-color" style="background: var(--color-success)"></div>
          <span>Active Projects</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: var(--color-warning)"></div>
          <span>Deadline Soon</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: var(--color-text-tertiary)"></div>
          <span>Finalized</span>
        </div>
      </div>

      <div class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="calendar-header-cell">
          {{ day }}
        </div>
        
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-events': day.projects.length > 0,
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.date }}</div>
          <div v-if="day.projects.length > 0" class="day-events">
            <div 
              v-for="project in day.projects.slice(0, 2)" 
              :key="project.id"
              class="event-dot"
              :style="{background: getProjectColor(project)}"
              :title="project.name"
            ></div>
            <span v-if="day.projects.length > 2" class="more-events">
              +{{ day.projects.length - 2 }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="selectedDay && selectedDay.projects.length > 0" class="selected-day-panel">
        <h2>{{ formatSelectedDate(selectedDay) }}</h2>
        <div class="projects-list">
          <div 
            v-for="project in selectedDay.projects" 
            :key="project.id"
            class="project-item"
            @click="navigateToProject(project.id)"
          >
            <div class="project-indicator" :style="{background: getProjectColor(project)}"></div>
            <div class="project-info">
              <h3>{{ project.name }}</h3>
              <p>{{ project.code }} - {{ project.status }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedDay" class="empty-state">
        <p>No projects scheduled for this day.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjects } from '../composables/use-projects';

const router = useRouter();
const { projects, loadProjects } = useProjects();

const currentDate = ref(new Date());
const selectedDay = ref<any>(null);

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long' });
});

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayProjects = projects.value.filter(project => {
      if (!project.deadline) return false;
      const deadline = new Date(project.deadline);
      return (
        deadline.getFullYear() === date.getFullYear() &&
        deadline.getMonth() === date.getMonth() &&
        deadline.getDate() === date.getDate()
      );
    });
    
    days.push({
      date: date.getDate(),
      fullDate: new Date(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.getTime() === today.getTime(),
      projects: dayProjects,
    });
  }
  
  return days;
});

function previousMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  selectedDay.value = null;
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  selectedDay.value = null;
}

function selectDay(day: any) {
  selectedDay.value = day;
}

function getProjectColor(project: any): string {
  if (project.status === 'FINALIZED') {
    return 'var(--color-text-tertiary)';
  }
  
  if (project.deadline) {
    const daysUntil = Math.ceil(
      (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 7 && daysUntil >= 0) {
      return 'var(--color-warning)';
    }
  }
  
  return 'var(--color-success)';
}

function formatSelectedDate(day: any): string {
  return day.fullDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function navigateToProject(projectId: string) {
  router.push(`/projects/${projectId}`);
}

onMounted(async () => {
  await loadProjects();
});
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  padding: var(--spacing-8) 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.calendar-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.nav-btn {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 36px;
  height: 36px;
  font-size: var(--font-size-xl);
  cursor: pointer;
  transition: var(--transition-fast);
}

.nav-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.current-month {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  min-width: 180px;
  text-align: center;
}

.calendar-legend {
  display: flex;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: white;
  border-radius: var(--radius-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-6);
}

.calendar-header-cell {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-3);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.calendar-day {
  background: white;
  min-height: 100px;
  padding: var(--spacing-2);
  cursor: pointer;
  transition: var(--transition-fast);
}

.calendar-day:hover {
  background: var(--color-primary-light);
}

.calendar-day.other-month {
  background: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
}

.calendar-day.today {
  background: var(--color-accent);
}

.day-number {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.more-events {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.selected-day-panel {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.selected-day-panel h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-4);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.project-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.project-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.project-info h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);
}

.project-info p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-8);
  background: white;
  border-radius: var(--radius-md);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

@media (max-width: 767px) {
  .calendar-header {
    flex-direction: column;
    gap: var(--spacing-4);
  }
  
  .calendar-legend {
    flex-wrap: wrap;
  }
  
  .calendar-day {
    min-height: 80px;
    font-size: var(--font-size-sm);
  }
}
</style>
