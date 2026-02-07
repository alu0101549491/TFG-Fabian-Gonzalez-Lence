<template>
  <div class="task-list">
    <TaskCard
      v-for="task in tasks"
      :key="task.getId()"
      :task="task"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type {Task} from '@domain/entities/Task';
import TaskCard from './TaskCard.vue';

interface Props {
  tasks: Task[];
}

defineProps<Props>();

defineEmits<{
  (e: 'select', task: Task): void;
}>();
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
