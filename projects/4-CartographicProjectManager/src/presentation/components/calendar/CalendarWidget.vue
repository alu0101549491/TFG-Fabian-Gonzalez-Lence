<!--
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 16, 2026
 * @file src/presentation/components/calendar/CalendarWidget.vue
 * @desc Calendar widget showing project delivery dates with status indicators
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
-->

<template>
  <div :class="['calendar-widget', `calendar-widget-${mode}`]">
    <!-- Header: Navigation -->
    <div v-if="showNavigation" class="calendar-header">
      <!-- Previous month -->
      <button
        type="button"
        class="calendar-nav-btn"
        aria-label="Previous month"
        @click="goToPreviousMonth"
      >
        <ChevronLeftIcon />
      </button>

      <!-- Month/Year display -->
      <div class="calendar-title">
        <button
          type="button"
          class="calendar-month-btn"
          @click="toggleMonthPicker"
        >
          {{ currentMonthName }}
        </button>
        <button
          type="button"
          class="calendar-year-btn"
          @click="toggleYearPicker"
        >
          {{ currentYear }}
        </button>
      </div>

      <!-- Next month -->
      <button
        type="button"
        class="calendar-nav-btn"
        aria-label="Next month"
        @click="goToNextMonth"
      >
        <ChevronRightIcon />
      </button>

      <!-- Today button -->
      <button
        v-if="showTodayButton && !isCurrentMonthDisplayed"
        type="button"
        class="calendar-today-btn"
        @click="goToToday"
      >
        Today
      </button>
    </div>

    <!-- Month picker dropdown -->
    <Transition name="dropdown">
      <div v-if="showMonthPicker" class="calendar-picker calendar-month-picker">
        <button
          v-for="(month, index) in monthNames"
          :key="index"
          type="button"
          :class="[
            'calendar-picker-item',
            {active: index === currentDate.getMonth()},
          ]"
          @click="selectMonth(index)"
        >
          {{ month }}
        </button>
      </div>
    </Transition>

    <!-- Year picker dropdown -->
    <Transition name="dropdown">
      <div v-if="showYearPicker" class="calendar-picker calendar-year-picker">
        <button
          v-for="year in yearRange"
          :key="year"
          type="button"
          :class="['calendar-picker-item', {active: year === currentYear}]"
          @click="selectYear(year)"
        >
          {{ year }}
        </button>
      </div>
    </Transition>

    <!-- Weekday headers -->
    <div class="calendar-weekdays">
      <div v-for="day in weekdayNames" :key="day" class="calendar-weekday">
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <!-- Loading overlay -->
      <div v-if="loading" class="calendar-loading">
        <LoadingSpinner size="md" />
      </div>

      <!-- Day cells -->
      <div
        v-for="day in calendarDays"
        :key="day.key"
        :class="[
          'calendar-day',
          {
            'calendar-day-today': day.isToday,
            'calendar-day-other-month': !day.isCurrentMonth,
            'calendar-day-weekend': day.isWeekend,
            'calendar-day-has-projects': day.projects.length > 0,
            'calendar-day-highlighted': isHighlighted(day.date),
            'calendar-day-selected': isSelected(day.date),
          },
        ]"
        @click="handleDayClick(day)"
      >
        <!-- Day number -->
        <button
          type="button"
          class="calendar-day-number"
          :tabindex="day.isCurrentMonth ? 0 : -1"
          :aria-label="getDayAriaLabel(day)"
          @click.stop="handleDayClick(day)"
        >
          {{ day.date.getDate() }}
        </button>

        <!-- Project and Task indicators (full mode) -->
        <div
          v-if="mode === 'full' && (day.projects.length > 0 || day.tasks.length > 0)"
          class="calendar-day-items"
        >
          <!-- Projects -->
          <button
            v-for="project in day.visibleProjects"
            :key="'p-' + project.id"
            type="button"
            :class="[
              'calendar-item',
              'calendar-project',
              `calendar-project-${getProjectStatusColor(project)}`,
              {'calendar-project-overdue': isProjectOverdue(project)},
            ]"
            :title="getProjectTooltip(project)"
            @click.stop="handleProjectClick(project)"
          >
            <span class="calendar-item-icon">📦</span>
            <span class="calendar-item-name">{{ project.code }}</span>
            <AlertCircleIcon
              v-if="isProjectOverdue(project) || project.hasPendingTasks"
              class="calendar-item-warning"
            />
          </button>

          <!-- Tasks -->
          <button
            v-for="task in day.visibleTasks"
            :key="'t-' + task.id"
            type="button"
            :class="[
              'calendar-item',
              'calendar-task',
              `calendar-task-priority-${task.priority.toLowerCase()}`,
              {'calendar-task-overdue': isTaskOverdue(task)},
            ]"
            :title="getTaskTooltip(task)"
            @click.stop="handleTaskClick(task)"
          >
            <span class="calendar-item-icon">✓</span>
            <span class="calendar-item-name">{{ truncateText(task.description, 20) }}</span>
            <AlertCircleIcon
              v-if="isTaskOverdue(task)"
              class="calendar-item-warning"
            />
          </button>

          <!-- More indicator -->
          <span
            v-if="day.moreCount > 0"
            class="calendar-day-more"
          >
            +{{ day.moreCount }} more
          </span>
        </div>

        <!-- Project and Task dots (mini mode) -->
        <div
          v-if="mode === 'mini' && (day.projects.length > 0 || day.tasks.length > 0)"
          class="calendar-day-dots"
        >
          <!-- Project dots -->
          <span
            v-for="project in day.projects.slice(0, 2)"
            :key="'p-' + project.id"
            :class="['calendar-dot', 'calendar-dot-project', `calendar-dot-${getProjectStatusColor(project)}`]"
            title="Project"
          />
          <!-- Task dots -->
          <span
            v-for="task in day.tasks.slice(0, Math.max(0, 3 - day.projects.length))"
            :key="'t-' + task.id"
            class="calendar-dot calendar-dot-task"
            title="Task"
          />
          <span
            v-if="(day.projects.length + day.tasks.length) > 3"
            class="calendar-dot calendar-dot-more"
          >
            +{{ (day.projects.length + day.tasks.length) - 3 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Selected day details (full mode) -->
    <Transition name="slide-up">
      <div
        v-if="mode === 'full' && selectedDay && (selectedDay.projects.length > 0 || selectedDay.tasks.length > 0)"
        class="calendar-details"
      >
        <div class="calendar-details-header">
          <h4 class="calendar-details-title">
            {{ formatSelectedDate(selectedDay.date) }}
          </h4>
          <span class="calendar-details-count">
            {{ selectedDay.projects.length }} project{{
              selectedDay.projects.length !== 1 ? 's' : ''
            }}, {{ selectedDay.tasks.length }} task{{
              selectedDay.tasks.length !== 1 ? 's' : ''
            }}
          </span>
          <button
            type="button"
            class="calendar-details-close"
            aria-label="Close details"
            @click="selectedDay = null"
          >
            <XIcon />
          </button>
        </div>

        <div class="calendar-details-list">
          <!-- Projects -->
          <div
            v-for="project in selectedDay.projects"
            :key="'p-' + project.id"
            :class="[
              'calendar-details-item',
              'calendar-details-project',
              `calendar-details-project-${getProjectStatusColor(project)}`,
            ]"
            @click="handleProjectClick(project)"
          >
            <div class="calendar-details-item-header">
              <span class="calendar-details-item-icon">📦</span>
              <span class="calendar-details-item-type">Project</span>
            </div>
            <div class="calendar-details-item-main">
              <span class="calendar-details-item-code">{{ project.code }}</span>
              <span class="calendar-details-item-name">{{ project.name }}</span>
            </div>
            <div class="calendar-details-item-meta">
              <span
                v-if="isProjectOverdue(project)"
                class="calendar-details-item-overdue"
              >
                Overdue
              </span>
              <span
                v-else-if="project.hasPendingTasks"
                class="calendar-details-item-tasks"
              >
                {{ project.pendingTasksCount }} pending task{{
                  project.pendingTasksCount !== 1 ? 's' : ''
                }}
              </span>
            </div>
          </div>

          <!-- Tasks -->
          <div
            v-for="task in selectedDay.tasks"
            :key="'t-' + task.id"
            :class="[
              'calendar-details-item',
              'calendar-details-task',
              `calendar-details-task-priority-${task.priority.toLowerCase()}`,
              {'calendar-details-task-overdue': isTaskOverdue(task)},
            ]"
            @click="handleTaskClick(task)"
          >
            <div class="calendar-details-item-header">
              <span class="calendar-details-item-icon">✓</span>
              <span class="calendar-details-item-type">Task</span>
            </div>
            <div class="calendar-details-item-main">
              <span class="calendar-details-item-description">{{ task.description }}</span>
            </div>
            <div class="calendar-details-item-meta">
              <span class="calendar-details-item-project">{{ task.projectCode }}</span>
              <span class="calendar-details-item-assignee">{{ task.assigneeName }}</span>
              <span
                v-if="isTaskOverdue(task)"
                class="calendar-details-item-overdue"
              >
                Overdue
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Legend (full mode) -->
    <div v-if="mode === 'full'" class="calendar-legend">
      <div class="calendar-legend-item">
        <span class="calendar-legend-dot calendar-legend-dot-green" />
        <span>On Track</span>
      </div>
      <div class="calendar-legend-item">
        <span class="calendar-legend-dot calendar-legend-dot-yellow" />
        <span>Approaching</span>
      </div>
      <div class="calendar-legend-item">
        <span class="calendar-legend-dot calendar-legend-dot-red" />
        <span>Overdue/Issues</span>
      </div>
      <div class="calendar-legend-item">
        <span class="calendar-legend-dot calendar-legend-dot-gray" />
        <span>Finalized</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import type {
  CalendarProjectDto,
  CalendarTaskDto,
  CalendarDayDto,
} from '@/application/dto';
import {addDays, isSameDay} from '@/shared/utils';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {ProjectStatus, TaskStatus} from '@/domain/enumerations';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AlertCircle as AlertCircleIcon,
  X as XIcon,
} from 'lucide-vue-next';

/**
 * CalendarWidget component props
 */
export interface CalendarWidgetProps {
  /** Projects with delivery dates for calendar display */
  projects?: CalendarProjectDto[];
  /** Tasks with due dates for calendar display */
  tasks?: CalendarTaskDto[];
  /** Initial date to display (defaults to today) */
  initialDate?: Date;
  /** Calendar display mode */
  mode?: 'full' | 'mini';
  /** Loading state */
  loading?: boolean;
  /** Show navigation controls */
  showNavigation?: boolean;
  /** Show today button */
  showTodayButton?: boolean;
  /** Maximum items (projects + tasks) to show per day cell */
  maxProjectsPerDay?: number;
  /** First day of week (0 = Sunday, 1 = Monday) */
  firstDayOfWeek?: 0 | 1;
  /** Highlight specific dates */
  highlightedDates?: Date[];
}

/**
 * CalendarWidget component emits
 */
export interface CalendarWidgetEmits {
  (e: 'date-select', date: Date): void;
  (e: 'project-click', project: CalendarProjectDto): void;
  (e: 'task-click', task: CalendarTaskDto): void;
  (e: 'month-change', date: Date): void;
  (e: 'day-click', day: CalendarDayDto): void;
}

const props = withDefaults(defineProps<CalendarWidgetProps>(), {
  projects: () => [],
  tasks: () => [],
  mode: 'full',
  loading: false,
  showNavigation: true,
  showTodayButton: true,
  maxProjectsPerDay: 3,
  firstDayOfWeek: 1, // Monday
  highlightedDates: () => [],
});

const emit = defineEmits<CalendarWidgetEmits>();

type CalendarDayViewModel = CalendarDayDto & {
  key: string;
  visibleProjects: CalendarProjectDto[];
  visibleTasks: CalendarTaskDto[];
  moreCount: number;
};

// State
const currentDate = ref(new Date(props.initialDate || new Date()));
const selectedDay = ref<CalendarDayDto | null>(null);
const showMonthPicker = ref(false);
const showYearPicker = ref(false);

// Month and weekday names
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekdayNamesFull = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const weekdayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdayNamesMini = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Computed
const currentMonthName = computed(
  () => monthNames[currentDate.value.getMonth()],
);
const currentYear = computed(() => currentDate.value.getFullYear());

const weekdayNames = computed(() => {
  const names = props.mode === 'mini' ? weekdayNamesMini : weekdayNamesShort;

  if (props.firstDayOfWeek === 1) {
    // Start from Monday
    return [...names.slice(1), names[0]];
  }
  return names;
});

const yearRange = computed(() => {
  const current = currentYear.value;
  const years = [];
  for (let i = current - 5; i <= current + 5; i++) {
    years.push(i);
  }
  return years;
});

const isCurrentMonthDisplayed = computed(() => {
  const today = new Date();
  return (
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
  );
});

/**
 * Check if a date is today
 */
function checkIsToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const projectsByDayKey = computed(() => {
  const map = new Map<string, CalendarProjectDto[]>();

  for (const project of props.projects) {
    const deliveryDate = new Date(project.deliveryDate);
    if (!Number.isFinite(deliveryDate.getTime())) {
      continue;
    }

    const key = getLocalDateKey(deliveryDate);
    const existing = map.get(key);
    if (existing) {
      existing.push(project);
    } else {
      map.set(key, [project]);
    }
  }

  return map;
});

const tasksByDayKey = computed(() => {
  const map = new Map<string, CalendarTaskDto[]>();

  for (const task of props.tasks) {
    const dueDate = new Date(task.dueDate);
    if (!Number.isFinite(dueDate.getTime())) {
      continue;
    }

    const key = getLocalDateKey(dueDate);
    const existing = map.get(key);
    if (existing) {
      existing.push(task);
    } else {
      map.set(key, [task]);
    }
  }

  return map;
});

// Generate calendar days for current month view
const calendarDays = computed<CalendarDayViewModel[]>(() => {
  const days: CalendarDayViewModel[] = [];
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);

  // Find start of calendar (may include days from previous month)
  let startDay = new Date(firstDay);
  const dayOfWeek = startDay.getDay();
  const daysToSubtract =
    props.firstDayOfWeek === 1 ? (dayOfWeek === 0 ? 6 : dayOfWeek - 1) : dayOfWeek;
  startDay = addDays(startDay, -daysToSubtract);

  // Generate 6 weeks (42 days) to ensure consistent grid
  for (let i = 0; i < 42; i++) {
    const date = addDays(startDay, i);
    const key = getLocalDateKey(date);
    const isCurrentMonth = date.getMonth() === month;
    const dayOfWeekNum = date.getDay();
    const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;

    const dayProjects = projectsByDayKey.value.get(key) ?? [];
    const dayTasks = tasksByDayKey.value.get(key) ?? [];

    const maxItems = props.maxProjectsPerDay;
    const visibleProjects = dayProjects.slice(0, maxItems);
    const remainingBudget = Math.max(0, maxItems - visibleProjects.length);
    const visibleTasks = dayTasks.slice(0, remainingBudget);
    const moreCount = Math.max(0, dayProjects.length + dayTasks.length - maxItems);

    days.push({
      key,
      date: new Date(date),
      projects: dayProjects,
      tasks: dayTasks,
      visibleProjects,
      visibleTasks,
      moreCount,
      items: [], // Will be computed from projects and tasks
      isToday: checkIsToday(date),
      isCurrentMonth,
      isWeekend,
    });
  }

  return days;
});

// Navigation methods
function goToPreviousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1,
  );
  emit('month-change', currentDate.value);
}

function goToNextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1,
  );
  emit('month-change', currentDate.value);
}

function goToToday() {
  currentDate.value = new Date();
  emit('month-change', currentDate.value);
}

function toggleMonthPicker() {
  showMonthPicker.value = !showMonthPicker.value;
  showYearPicker.value = false;
}

function toggleYearPicker() {
  showYearPicker.value = !showYearPicker.value;
  showMonthPicker.value = false;
}

function selectMonth(monthIndex: number) {
  currentDate.value = new Date(currentYear.value, monthIndex, 1);
  showMonthPicker.value = false;
  emit('month-change', currentDate.value);
}

function selectYear(year: number) {
  currentDate.value = new Date(year, currentDate.value.getMonth(), 1);
  showYearPicker.value = false;
  emit('month-change', currentDate.value);
}

// Day interactions
function handleDayClick(day: CalendarDayDto) {
  selectedDay.value = day;
  emit('day-click', day);
  emit('date-select', day.date);
}

function handleProjectClick(project: CalendarProjectDto) {
  emit('project-click', project);
}

// Helper functions
function isHighlighted(date: Date): boolean {
  return props.highlightedDates.some((d) => isSameDay(d, date));
}

function isSelected(date: Date): boolean {
  return selectedDay.value ? isSameDay(selectedDay.value.date, date) : false;
}

function isProjectOverdue(project: CalendarProjectDto): boolean {
  const deliveryDate = new Date(project.deliveryDate);
  if (!Number.isFinite(deliveryDate.getTime())) return false;
  return deliveryDate < new Date() && project.status !== ProjectStatus.FINALIZED;
}

function getProjectStatusColor(project: CalendarProjectDto): string {
  if (project.status === ProjectStatus.FINALIZED) return 'gray';
  if (isProjectOverdue(project)) return 'red';
  if (project.hasPendingTasks) return 'yellow';
  return 'green';
}

function isTaskOverdue(task: CalendarTaskDto): boolean {
  const dueDate = new Date(task.dueDate);
  if (!Number.isFinite(dueDate.getTime())) return false;
  return dueDate < new Date() && task.status !== TaskStatus.COMPLETED;
}

function getProjectTooltip(project: CalendarProjectDto): string {
  let tooltip = `${project.code}: ${project.name}`;
  tooltip += `\nClient: ${project.clientName}`;

  if (isProjectOverdue(project)) {
    tooltip += '\n⚠️ Overdue';
  } else if (project.hasPendingTasks) {
    tooltip += `\n⚠️ ${project.pendingTasksCount} pending tasks`;
  }

  return tooltip;
}


function getTaskTooltip(task: CalendarTaskDto): string {
  let tooltip = `Task: ${task.description}`;
  tooltip += `\nProject: ${task.projectCode} - ${task.projectName}`;
  tooltip += `\nAssigned to: ${task.assigneeName}`;
  tooltip += `\nPriority: ${task.priority}`;

  if (isTaskOverdue(task)) {
    tooltip += '\n⚠️ Overdue';
  }

  return tooltip;
}

function handleTaskClick(task: CalendarTaskDto) {
  emit('task-click', task);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function getDayAriaLabel(day: CalendarDayDto): string {
  const weekday = weekdayNamesFull[day.date.getDay()];
  const month = monthNames[day.date.getMonth()];
  const dayNum = day.date.getDate();
  const year = day.date.getFullYear();
  const dateStr = `${weekday}, ${month} ${dayNum}, ${year}`;

  const projectCount = day.projects.length;
  const taskCount = day.tasks.length;

  if (projectCount === 0 && taskCount === 0) {
    return dateStr;
  }

  const parts = [];
  if (projectCount > 0) {
    parts.push(`${projectCount} project${projectCount !== 1 ? 's' : ''}`);
  }
  if (taskCount > 0) {
    parts.push(`${taskCount} task${taskCount !== 1 ? 's' : ''}`);
  }

  return `${dateStr}, ${parts.join(', ')}`;
}

/**
 * Format selected date for details panel
 */
function formatSelectedDate(date: Date): string {
  const weekday = weekdayNamesFull[date.getDay()];
  const month = monthNames[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${dayNum}, ${year}`;
}

// Close pickers on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.calendar-title')) {
    showMonthPicker.value = false;
    showYearPicker.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for initialDate changes
watch(
  () => props.initialDate,
  (newDate) => {
    if (newDate) {
      currentDate.value = new Date(newDate);
    }
  },
);

</script>

<style scoped>
.calendar-widget {
  position: relative;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

.calendar-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-gray-600);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.calendar-nav-btn:hover {
  color: var(--color-gray-900);
  background-color: var(--color-gray-200);
}

.calendar-nav-btn svg {
  width: 20px;
  height: 20px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.calendar-month-btn,
.calendar-year-btn {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background: none;
  border: none;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.calendar-month-btn:hover,
.calendar-year-btn:hover {
  background-color: var(--color-gray-200);
}

.calendar-today-btn {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.calendar-today-btn:hover {
  background-color: var(--color-primary-100);
}

/* Pickers */
.calendar-picker {
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-dropdown);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2);
}

.calendar-month-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-1);
  width: 240px;
}

.calendar-year-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-1);
  width: 200px;
  max-height: 200px;
  overflow-y: auto;
}

.calendar-picker-item {
  padding: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.calendar-picker-item:hover {
  background-color: var(--color-gray-100);
}

.calendar-picker-item.active {
  color: white;
  background-color: var(--color-primary-600);
}

/* Weekdays */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: 1px solid var(--color-border-primary);
}

.calendar-weekday {
  text-align: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Grid */
.calendar-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: var(--spacing-2);
  gap: 1px;
  background-color: var(--color-border-primary);
}

.calendar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 5;
}

/* Day cells */
.calendar-day {
  display: flex;
  flex-direction: column;
  min-height: 80px;
  padding: var(--spacing-1);
  background-color: var(--color-bg-primary);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.calendar-day:hover {
  background-color: var(--color-gray-50);
}

.calendar-day:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -2px;
  z-index: 1;
}

.calendar-day-today {
  background-color: var(--color-primary-50);
}

.calendar-day-today:hover {
  background-color: var(--color-primary-100);
}

.calendar-day-other-month {
  opacity: 0.4;
}

.calendar-day-weekend {
  background-color: var(--color-gray-50);
}

.calendar-day-weekend.calendar-day-today {
  background-color: var(--color-primary-50);
}

.calendar-day-highlighted {
  box-shadow: inset 0 0 0 2px var(--color-warning-400);
}

.calendar-day-selected {
  box-shadow: inset 0 0 0 2px var(--color-primary-500);
}

.calendar-day-number {
  /* Reset button styles */
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  /* Custom styles */
  display: inline-block;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
  text-align: center;
}

.calendar-day-number:hover {
  opacity: 0.8;
}

.calendar-day-number:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.calendar-day-today .calendar-day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: white;
  background-color: var(--color-primary-600);
  border-radius: var(--radius-full);
}

/* Projects and Tasks in day cells (full mode) */
.calendar-day-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
}

/* Common item styles */
.calendar-item {
  /* Reset button styles */
  padding: 2px 4px;
  background: none;
  cursor: pointer;
  line-height: 1;
  /* Custom styles */
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  color: white;
  border-radius: var(--radius-sm);
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  transition: filter var(--duration-fast) ease;
}

.calendar-item:hover {
  filter: brightness(0.9);
}

.calendar-item-icon {
  flex-shrink: 0;
  font-size: 10px;
}

.calendar-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-item-warning {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* Project styles */
.calendar-project-green {
  background-color: var(--color-success-500) !important;
}
.calendar-project-yellow {
  background-color: var(--color-warning-500) !important;
}
.calendar-project-red {
  background-color: var(--color-error-500) !important;
}
.calendar-project-gray {
  background-color: var(--color-gray-400) !important;
}

/* Task styles - priority based colors */
.calendar-task-priority-low {
  background-color: var(--color-info-500) !important;
}
.calendar-task-priority-medium {
  background-color: var(--color-primary-500) !important;
}
.calendar-task-priority-high {
  background-color: var(--color-warning-600) !important;
}
.calendar-task-priority-urgent {
  background-color: var(--color-error-600) !important;
}

.calendar-task-overdue {
  background-color: var(--color-error-700) !important;
}

.calendar-day-more {
  font-size: 10px;
  color: var(--color-text-secondary);
  padding: 2px;
}

/* Dots (mini mode) */
.calendar-day-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: auto;
}

.calendar-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

/* Project dots */
.calendar-dot-project.calendar-dot-green {
  background-color: var(--color-success-500);
}
.calendar-dot-project.calendar-dot-yellow {
  background-color: var(--color-warning-500);
}
.calendar-dot-project.calendar-dot-red {
  background-color: var(--color-error-500);
}
.calendar-dot-project.calendar-dot-gray {
  background-color: var(--color-gray-400);
}

/* Task dots */
.calendar-dot-task {
  background-color: var(--color-primary-500);
  border: 1px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}

.calendar-dot-more {
  width: auto;
  height: auto;
  font-size: 8px;
  color: var(--color-text-tertiary);
  background: none;
}

/* Details panel */
.calendar-details {
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

.calendar-details-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.calendar-details-title {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.calendar-details-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.calendar-details-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.calendar-details-close:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-200);
}

.calendar-details-close svg {
  width: 16px;
  height: 16px;
}

.calendar-details-list {
  max-height: 200px;
  overflow-y: auto;
}

/* Common item styles in details */
.calendar-details-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-3) var(--spacing-4);
  border-left: 3px solid;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.calendar-details-item:hover {
  background-color: var(--color-bg-primary);
}

.calendar-details-item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.calendar-details-item-icon {
  font-size: var(--font-size-xs);
}

.calendar-details-item-type {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

/* Project specific styles */
.calendar-details-project {
  /* border-left color set by status */
}

.calendar-details-project-green {
  border-color: var(--color-success-500);
}
.calendar-details-project-yellow {
  border-color: var(--color-warning-500);
}
.calendar-details-project-red {
  border-color: var(--color-error-500);
}
.calendar-details-project-gray {
  border-color: var(--color-gray-400);
}

.calendar-details-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-details-item-code {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.calendar-details-item-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.calendar-details-item-description {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.calendar-details-item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.calendar-details-item-project {
  font-weight: var(--font-weight-medium);
}

.calendar-details-item-assignee {
  /* Base styles */
}

.calendar-details-item-overdue,calendar-details-item-tasks {
  color: var(--color-error-600);
  font-weight: var(--font-weight-medium);
}

/* Task specific styles */
.calendar-details-task-priority-low {
  border-color: var(--color-info-500);
}
.calendar-details-task-priority-medium {
  border-color: var(--color-primary-500);
}
.calendar-details-task-priority-high {
  border-color: var(--color-warning-600);
}
.calendar-details-task-priority-urgent {
  border-color: var(--color-error-600);
}

.calendar-details-task-overdue {
  border-color: var(--color-error-700);
}

/* Legend */
.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

.calendar-legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.calendar-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}

.calendar-legend-dot-green {
  background-color: var(--color-success-500);
}
.calendar-legend-dot-yellow {
  background-color: var(--color-warning-500);
}
.calendar-legend-dot-red {
  background-color: var(--color-error-500);
}
.calendar-legend-dot-gray {
  background-color: var(--color-gray-400);
}

/* Mini mode adjustments */
.calendar-widget-mini {
  max-width: 280px;
}

.calendar-widget-mini .calendar-header {
  padding: var(--spacing-2);
}

.calendar-widget-mini .calendar-nav-btn {
  width: 28px;
  height: 28px;
}

.calendar-widget-mini .calendar-month-btn,
.calendar-widget-mini .calendar-year-btn {
  font-size: var(--font-size-sm);
}

.calendar-widget-mini .calendar-weekdays {
  padding: var(--spacing-1) var(--spacing-2);
}

.calendar-widget-mini .calendar-weekday {
  font-size: 10px;
}

.calendar-widget-mini .calendar-grid {
  padding: var(--spacing-1);
}

.calendar-widget-mini .calendar-day {
  min-height: 36px;
  padding: 2px;
  align-items: center;
}

.calendar-widget-mini .calendar-day-number {
  font-size: var(--font-size-xs);
  margin-bottom: 0;
}

.calendar-widget-mini .calendar-day-today .calendar-day-number {
  width: 20px;
  height: 20px;
  font-size: 10px;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity var(--duration-fast) ease,
    transform var(--duration-fast) ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--duration-normal) ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-widget-full .calendar-day {
    min-height: 60px;
  }

  .calendar-project {
    font-size: 9px;
    padding: 1px 3px;
  }

  .calendar-legend {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
}

@media (max-width: 480px) {
  .calendar-widget-full {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .calendar-header {
    flex-wrap: wrap;
  }

  .calendar-today-btn {
    order: 3;
    width: 100%;
    margin-top: var(--spacing-2);
  }
}
</style>
