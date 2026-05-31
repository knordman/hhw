<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findFigure } from '../figures'

const route = useRoute()
const figure = computed(() => findFigure(route.params.id as string))
</script>

<template>
  <div class="figure-page">
    <header class="toolbar">
      <RouterLink to="/" class="back">← Tillbaka</RouterLink>
    </header>
    <div class="stage">
      <img v-if="figure" :src="figure.src" alt="" />
      <p v-else>Figuren finns inte.</p>
    </div>
  </div>
</template>

<style scoped>
.figure-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.back {
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
}

.back:hover {
  background: #e8e8e8;
}

.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fafafa;
}

.stage img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
