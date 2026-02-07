<template>
  <form class="project-form" @submit.prevent="handleSubmit">
    <h3>{{ isEditing ? 'Edit Project' : 'New Project' }}</h3>
    <div class="form-group">
      <label for="projectCode">Code</label>
      <input id="projectCode" v-model="form.code" required />
    </div>
    <div class="form-group">
      <label for="projectName">Name</label>
      <input id="projectName" v-model="form.name" required />
    </div>
    <div class="form-group">
      <label for="projectType">Type</label>
      <select id="projectType" v-model="form.type" required>
        <option value="RESIDENTIAL">Residential</option>
        <option value="COMMERCIAL">Commercial</option>
        <option value="INDUSTRIAL">Industrial</option>
        <option value="PUBLIC">Public</option>
      </select>
    </div>
    <div class="form-group">
      <label for="startDate">Start Date</label>
      <input
        id="startDate"
        v-model="form.startDate"
        type="date"
        required
      />
    </div>
    <div class="form-group">
      <label for="deliveryDate">Delivery Date</label>
      <input
        id="deliveryDate"
        v-model="form.deliveryDate"
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
  code: '',
  name: '',
  type: 'RESIDENTIAL',
  startDate: '',
  deliveryDate: '',
});

const handleSubmit = (): void => {
  // TODO: Implement form submission
};
</script>

<style scoped>
.project-form {
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
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}
</style>
