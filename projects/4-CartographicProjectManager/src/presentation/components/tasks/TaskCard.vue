<template>
  <div
    class="task-card"
    :class="priorityClass"
    @click="$emit('select', task)"
  >
    <div class="task-header">
      <span class="task-status">{{ task.getStatus() }}</span>
      <span class="task-priority">{{ task.getPriority() }}</span>
    </div>
    <p class="task-description">{{ task.getDescription() }}</p>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {Task} from '@domain/entities/Task';
import {TaskPriority} from '@domain/enums/TaskPriority';

interface Props {
  task: Task;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'select', task: Task): void;
}>();

const priorityClass = computed(() => {
  const priority = props.task.getPriority();
  return {
    'priority-low': priority === TaskPriority.LOW,
    'priority-medium': priority === TaskPriority.MEDIUM,
    'priority-high': priority === TaskPriority.HIGH,
    'priority-urgent': priority === TaskPriority.URGENT,
  };
});
</script>

<style scoped>
.task-card {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.task-description {
  margin: 0;
  font-size: 0.875rem;
}
</style>
