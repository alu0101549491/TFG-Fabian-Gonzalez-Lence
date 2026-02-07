<template>
  <div class="task-history">
    <h4>Task History</h4>
    <ul>
      <li
        v-for="entry in history"
        :key="entry.getId()"
        class="history-entry"
      >
        <span class="timestamp">
          {{ entry.getTimestamp().toLocaleString() }}
        </span>
        <span class="action">{{ entry.getAction() }}</span>
        <span class="values">
          {{ entry.getPreviousValue() }} &rarr;
          {{ entry.getNewValue() }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type {
  TaskHistory as TaskHistoryEntity,
} from '@domain/entities/TaskHistory';

interface Props {
  history: TaskHistoryEntity[];
}

defineProps<Props>();
</script>

<style scoped>
.task-history {
  padding: 1rem;
}

.history-entry {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.timestamp {
  color: var(--text-secondary);
  font-size: 0.75rem;
}
</style>
