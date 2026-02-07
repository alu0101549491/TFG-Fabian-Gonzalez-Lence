<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <h3>{{ isEditing ? 'Edit Task' : 'New Task' }}</h3>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        required
      ></textarea>
    </div>
    <div class="form-group">
      <label for="priority">Priority</label>
      <select id="priority" v-model="form.priority" required>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
    </div>
    <div class="form-group">
      <label for="dueDate">Due Date</label>
      <input
        id="dueDate"
        v-model="form.dueDate"
        type="date"
        required
      />
    </div>
    <button type="submit">
      {{ isEditing ? 'Update' : 'Create' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import {ref} from 'vue';

interface Props {
  isEditing?: boolean;
}

withDefaults(defineProps<Props>(), {
  isEditing: false,
});

const form = ref({
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
});

const handleSubmit = (): void => {
  // TODO: Implement form submission
};
</script>

<style scoped>
.task-form {
  max-width: 600px;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}
</style>
