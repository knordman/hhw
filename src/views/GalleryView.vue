<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { figures } from '../figures'
</script>

<template>
  <div class="gallery">
    <header class="toolbar">
      <h1>Välj figur</h1>
    </header>
    <div class="grid">
      <RouterLink
        v-for="figure in figures"
        :key="figure.id"
        :to="{ name: 'figure', params: { id: figure.id } }"
        class="card"
      >
        <img :src="figure.src" :alt="figure.name" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.toolbar {
  padding: 1rem 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card img {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: contain;
}
</style>
