# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Calendar Components

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── components/
│       │   ├── common/                     # ✅ Already implemented
│       │   ├── project/                    # ✅ Already implemented
│       │   ├── task/                       # ✅ Already implemented
│       │   ├── message/                    # ✅ Already implemented
│       │   ├── file/                       # ✅ Already implemented
│       │   ├── notification/               # ✅ Already implemented
│       │   └── calendar/
│       │       └── CalendarWidget.vue      # 🎯 TO IMPLEMENT
│       ├── composables/                    # ✅ Already implemented
│       ├── router/                         # ✅ Already implemented
│       ├── stores/                         # ✅ Already implemented
│       ├── styles/                         # ✅ Already implemented
│       ├── views/
│       │   └── ...
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. Project Calendar DTOs (Already Implemented)

```typescript
interface CalendarProjectDto {
  id: string;
  code: string;
  name: string;
  clientName: string;
  deliveryDate: Date;
  status: ProjectStatus;
  statusColor: 'red' | 'green' | 'yellow' | 'gray';
  isOverdue: boolean;
  daysUntilDelivery: number;
  hasPendingTasks: boolean;
  pendingTasksCount: number;
}

interface CalendarDayDto {
  date: Date;
  projects: CalendarProjectDto[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
}
```

## 2. Enumerations (Already Implemented)

```typescript
enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  FINALIZED = 'FINALIZED',
}
```

## 3. Composables (Already Implemented)

```typescript
// useProjects
const {
  calendarProjects,
  loadCalendarProjects,
} = useProjects();

// Calendar date utilities from shared/utils
function getMonthRange(date: Date): { start: Date; end: Date };
function addDays(date: Date, days: number): Date;
function formatDate(date: Date, format: string): string;
function isToday(date: Date): boolean;
function isSameDay(date1: Date, date2: Date): boolean;
```

## 4. Design Specifications

### CalendarWidget
- Monthly calendar grid view
- Navigation for previous/next month and year
- Today button to return to current date
- Day cells showing project delivery dates
- Color-coded project indicators by status
- Click on day to see projects due
- Click on project to navigate to details
- Highlight today's date
- Differentiate weekends
- Show overdue project warnings
- Responsive: full grid on desktop, compact on mobile
- Mini calendar variant for sidebar
- Loading state for data fetching

### Visual Elements
- Project status colors:
  - Red: Overdue or has pending tasks
  - Green: On track, no issues
  - Yellow: Approaching deadline (within 7 days)
  - Gray: Finalized
- Today: Highlighted background
- Weekends: Subtle different background
- Current month days: Full opacity
- Adjacent month days: Reduced opacity
- Project dots/chips in cells
- Tooltip on hover showing project details

---

# SPECIFIC TASK

Implement the Calendar Component for the Presentation Layer. This component provides a visual calendar for tracking project delivery dates.

## Files to implement:

### 1. **CalendarWidget.vue**

**Responsibilities:**
- Display monthly calendar grid
- Show project deliveries on their due dates
- Navigate between months/years
- Highlight today and weekends
- Color-code projects by status
- Click interactions for day and project
- Support mini (compact) and full modes
- Fetch calendar data when month changes
- Handle loading states

**Props:**

```typescript
interface CalendarWidgetProps {
  /** Projects with delivery dates for calendar display */
  projects?: CalendarProjectDto[];
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
  /** Maximum projects to show per day cell */
  maxProjectsPerDay?: number;
  /** First day of week (0 = Sunday, 1 = Monday) */
  firstDayOfWeek?: 0 | 1;
  /** Highlight specific dates */
  highlightedDates?: Date[];
}
```

**Emits:**

```typescript
interface CalendarWidgetEmits {
  (e: 'date-select', date: Date): void;
  (e: 'project-click', project: CalendarProjectDto): void;
  (e: 'month-change', date: Date): void;
  (e: 'day-click', day: CalendarDayDto): void;
}
```

**Template Structure:**

```vue
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
            { active: index === currentDate.getMonth() }
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
          :class="[
            'calendar-picker-item',
            { active: year === currentYear }
          ]"
          @click="selectYear(year)"
        >
          {{ year }}
        </button>
      </div>
    </Transition>
    
    <!-- Weekday headers -->
    <div class="calendar-weekdays">
      <div
        v-for="day in weekdayNames"
        :key="day"
        class="calendar-weekday"
      >
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
        :key="day.date.toISOString()"
        :class="[
          'calendar-day',
          {
            'calendar-day-today': day.isToday,
            'calendar-day-other-month': !day.isCurrentMonth,
            'calendar-day-weekend': day.isWeekend,
            'calendar-day-has-projects': day.projects.length > 0,
            'calendar-day-highlighted': isHighlighted(day.date),
            'calendar-day-selected': isSelected(day.date),
          }
        ]"
        :tabindex="day.isCurrentMonth ? 0 : -1"
        role="button"
        :aria-label="getDayAriaLabel(day)"
        @click="handleDayClick(day)"
        @keydown.enter="handleDayClick(day)"
      >
        <!-- Day number -->
        <span class="calendar-day-number">{{ day.date.getDate() }}</span>
        
        <!-- Project indicators (full mode) -->
        <div v-if="mode === 'full' && day.projects.length > 0" class="calendar-day-projects">
          <button
            v-for="project in getVisibleProjects(day.projects)"
            :key="project.id"
            type="button"
            :class="[
              'calendar-project',
              `calendar-project-${project.statusColor}`,
              { 'calendar-project-overdue': project.isOverdue }
            ]"
            :title="getProjectTooltip(project)"
            @click.stop="handleProjectClick(project)"
          >
            <span class="calendar-project-name">{{ project.code }}</span>
            <AlertCircleIcon
              v-if="project.isOverdue || project.hasPendingTasks"
              class="calendar-project-warning"
            />
          </button>
          
          <!-- More indicator -->
          <span
            v-if="day.projects.length > maxProjectsPerDay"
            class="calendar-day-more"
          >
            +{{ day.projects.length - maxProjectsPerDay }} more
          </span>
        </div>
        
        <!-- Project dots (mini mode) -->
        <div v-if="mode === 'mini' && day.projects.length > 0" class="calendar-day-dots">
          <span
            v-for="(project, index) in day.projects.slice(0, 3)"
            :key="project.id"
            :class="['calendar-dot', `calendar-dot-${project.statusColor}`]"
          />
          <span v-if="day.projects.length > 3" class="calendar-dot calendar-dot-more">
            +{{ day.projects.length - 3 }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Selected day details (full mode) -->
    <Transition name="slide-up">
      <div
        v-if="mode === 'full' && selectedDay && selectedDay.projects.length > 0"
        class="calendar-details"
      >
        <div class="calendar-details-header">
          <h4 class="calendar-details-title">
            {{ formatDate(selectedDay.date, 'EEEE, MMMM d, yyyy') }}
          </h4>
          <span class="calendar-details-count">
            {{ selectedDay.projects.length }} project{{ selectedDay.projects.length !== 1 ? 's' : '' }}
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
          <div
            v-for="project in selectedDay.projects"
            :key="project.id"
            :class="[
              'calendar-details-project',
              `calendar-details-project-${project.statusColor}`
            ]"
            @click="handleProjectClick(project)"
          >
            <div class="calendar-details-project-main">
              <span class="calendar-details-project-code">{{ project.code }}</span>
              <span class="calendar-details-project-name">{{ project.name }}</span>
            </div>
            <div class="calendar-details-project-meta">
              <span class="calendar-details-project-client">{{ project.clientName }}</span>
              <span
                v-if="project.isOverdue"
                class="calendar-details-project-overdue"
              >
                Overdue
              </span>
              <span
                v-else-if="project.hasPendingTasks"
                class="calendar-details-project-tasks"
              >
                {{ project.pendingTasksCount }} pending task{{ project.pendingTasksCount !== 1 ? 's' : '' }}
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { CalendarProjectDto, CalendarDayDto } from '@/application/dto';
import { ProjectStatus } from '@/domain/enumerations';
import {
  formatDate,
  getMonthRange,
  addDays,
  isToday as checkIsToday,
  isSameDay,
} from '@/shared/utils';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AlertCircle as AlertCircleIcon,
  X as XIcon,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<CalendarWidgetProps>(), {
  projects: () => [],
  mode: 'full',
  loading: false,
  showNavigation: true,
  showTodayButton: true,
  maxProjectsPerDay: 3,
  firstDayOfWeek: 1, // Monday
  highlightedDates: () => [],
});

const emit = defineEmits<CalendarWidgetEmits>();

// State
const currentDate = ref(new Date(props.initialDate || new Date()));
const selectedDay = ref<CalendarDayDto | null>(null);
const showMonthPicker = ref(false);
const showYearPicker = ref(false);

// Month and weekday names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const weekdayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekdayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdayNamesMini = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Computed
const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()]);
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

// Generate calendar days for current month view
const calendarDays = computed<CalendarDayDto[]>(() => {
  const days: CalendarDayDto[] = [];
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Find start of calendar (may include days from previous month)
  let startDay = new Date(firstDay);
  const dayOfWeek = startDay.getDay();
  const daysToSubtract = props.firstDayOfWeek === 1
    ? (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    : dayOfWeek;
  startDay = addDays(startDay, -daysToSubtract);
  
  // Generate 6 weeks (42 days) to ensure consistent grid
  for (let i = 0; i < 42; i++) {
    const date = addDays(startDay, i);
    const isCurrentMonth = date.getMonth() === month;
    const dayOfWeekNum = date.getDay();
    const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
    
    // Find projects for this day
    const dayProjects = props.projects.filter(project => {
      const deliveryDate = new Date(project.deliveryDate);
      return isSameDay(deliveryDate, date);
    });
    
    days.push({
      date: new Date(date),
      projects: dayProjects,
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
    1
  );
  emit('month-change', currentDate.value);
}

function goToNextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
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
  return props.highlightedDates.some(d => isSameDay(d, date));
}

function isSelected(date: Date): boolean {
  return selectedDay.value ? isSameDay(selectedDay.value.date, date) : false;
}

function getVisibleProjects(projects: CalendarProjectDto[]): CalendarProjectDto[] {
  return projects.slice(0, props.maxProjectsPerDay);
}

function getProjectTooltip(project: CalendarProjectDto): string {
  let tooltip = `${project.code}: ${project.name}`;
  tooltip += `\nClient: ${project.clientName}`;
  
  if (project.isOverdue) {
    tooltip += '\n⚠️ Overdue';
  } else if (project.hasPendingTasks) {
    tooltip += `\n⚠️ ${project.pendingTasksCount} pending tasks`;
  }
  
  return tooltip;
}

function getDayAriaLabel(day: CalendarDayDto): string {
  const dateStr = formatDate(day.date, 'EEEE, MMMM d, yyyy');
  const projectCount = day.projects.length;
  
  if (projectCount === 0) {
    return dateStr;
  }
  
  return `${dateStr}, ${projectCount} project${projectCount !== 1 ? 's' : ''} due`;
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
watch(() => props.initialDate, (newDate) => {
  if (newDate) {
    currentDate.value = new Date(newDate);
  }
});
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
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
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

/* Projects in day cells (full mode) */
.calendar-day-projects {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
}

.calendar-project {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 2px 4px;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  color: white;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  transition: filter var(--duration-fast) ease;
}

.calendar-project:hover {
  filter: brightness(0.9);
}

.calendar-project-green { background-color: var(--color-success-500); }
.calendar-project-yellow { background-color: var(--color-warning-500); }
.calendar-project-red { background-color: var(--color-error-500); }
.calendar-project-gray { background-color: var(--color-gray-400); }

.calendar-project-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-project-warning {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.calendar-day-more {
  font-size: 10px;
  color: var(--color-text-secondary);
  padding: 2px;
}

/* Project dots (mini mode) */
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

.calendar-dot-green { background-color: var(--color-success-500); }
.calendar-dot-yellow { background-color: var(--color-warning-500); }
.calendar-dot-red { background-color: var(--color-error-500); }
.calendar-dot-gray { background-color: var(--color-gray-400); }

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

.calendar-details-project {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-3) var(--spacing-4);
  border-left: 3px solid;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.calendar-details-project:hover {
  background-color: var(--color-bg-primary);
}

.calendar-details-project-green { border-color: var(--color-success-500); }
.calendar-details-project-yellow { border-color: var(--color-warning-500); }
.calendar-details-project-red { border-color: var(--color-error-500); }
.calendar-details-project-gray { border-color: var(--color-gray-400); }

.calendar-details-project-main {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}

.calendar-details-project-code {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.calendar-details-project-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.calendar-details-project-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.calendar-details-project-overdue {
  color: var(--color-error-600);
  font-weight: var(--font-weight-medium);
}

.calendar-details-project-tasks {
  color: var(--color-warning-600);
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

.calendar-legend-dot-green { background-color: var(--color-success-500); }
.calendar-legend-dot-yellow { background-color: var(--color-warning-500); }
.calendar-legend-dot-red { background-color: var(--color-error-500); }
.calendar-legend-dot-gray { background-color: var(--color-gray-400); }

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
  transition: opacity var(--duration-fast) ease, transform var(--duration-fast) ease;
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
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x with Vue 3
- **Code style:** Google TypeScript Style Guide
- **Framework:** Vue 3 Composition API with `<script setup>`
- **Styling:** Scoped CSS using CSS variables from `variables.css`

## Mandatory best practices:
- **Accessibility:** ARIA labels, keyboard navigation, focus management
- **Type Safety:** Full props/emits interfaces
- **Responsiveness:** Mobile-friendly layout adjustments
- **Performance:** Efficient date calculations, minimal re-renders
- **Internationalization:** Configurable first day of week
- **Visual Clarity:** Clear status colors, proper contrast

## Component Design Principles:
- Clear month/year navigation
- Visual distinction for today, weekends, other months
- Color-coded project status indicators
- Tooltip information on hover
- Click interactions for drill-down
- Support both full and compact modes
- Smooth transitions and animations

## Calendar UX Patterns:
- Standard 7-column grid layout
- 6-week display for consistency
- Quick navigation to today
- Month/year picker dropdowns
- Details panel for selected day
- Legend explaining color codes

---

# DELIVERABLES

1. **Complete source code** for the file:
   - `CalendarWidget.vue`

2. **Component features:**
   - Full `<script setup>` with TypeScript
   - Props/Emits interfaces
   - Scoped CSS with CSS variables
   - Responsive design (full and mini modes)
   - Accessibility attributes

3. **Functionality:**
   - Monthly grid with navigation
   - Today highlighting and quick return
   - Project display with status colors
   - Day selection with details panel
   - Month/year picker dropdowns
   - Legend for color meanings
   - Loading state support
   - Mini mode for sidebar use

---

# OUTPUT FORMAT

```vue
<!-- src/presentation/components/calendar/CalendarWidget.vue -->
[Complete code]
```

**Design decisions made:**
- [Decision 1]
- [Decision 2]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
