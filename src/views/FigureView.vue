<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findFigure } from '../figures'
import Shirt, { type ShirtColors } from '../components/Shirt.vue'

const route = useRoute()
const figure = computed(() => findFigure(route.params.id as string))

const washing = ref(false)
const dressing = ref(false)

const shirtColors = reactive<ShirtColors>({
  top: '#536c5d',
  center: '#b7c8be',
  bottom: '#002b22',
  left: '#002b22',
  right: '#002b22',
})

const shirtParts: Array<{ key: keyof ShirtColors; label: string }> = [
  { key: 'top', label: 'Krage' },
  { key: 'left', label: 'Vänster' },
  { key: 'center', label: 'Mitten' },
  { key: 'right', label: 'Höger' },
  { key: 'bottom', label: 'Nere' },
]

type ShirtPlacement = { left: string; top: string; width: string }

const DEFAULT_SHIRT_PLACEMENT: ShirtPlacement = {
  left: '5%',
  top: '59%',
  width: '88%',
}

const SHIRT_PLACEMENTS: Record<string, Partial<ShirtPlacement>> = {
  yellow: { width: '98%', left: '0%', top: '57%' },
}

const shirtStyle = computed(() => {
  const id = figure.value?.id ?? ''
  const p = { ...DEFAULT_SHIRT_PLACEMENT, ...(SHIRT_PLACEMENTS[id] ?? {}) }
  return {
    '--shirt-left': p.left,
    '--shirt-top': p.top,
    '--shirt-width': p.width,
  }
})

function washFigure() {
  washing.value = !washing.value
}

function dressFigure() {
  dressing.value = !dressing.value
}
</script>

<template>
  <div class="figure-page">
    <header class="toolbar">
      <RouterLink to="/" class="back">← Tillbaka</RouterLink>
    </header>
    <div class="stage">
      <div v-if="figure" class="scene" :class="{ washing }">
        <div class="figure-wrap" :style="shirtStyle">
          <img class="figure" :src="figure.src" alt="" />
          <Shirt v-if="dressing" class="shirt" :colors="shirtColors" />
          <div v-if="washing" class="shower-bar" aria-hidden="true"></div>
          <div v-if="washing" class="drops" aria-hidden="true">
            <span
              v-for="i in 28"
              :key="i"
              class="drop"
              :style="{
                left: ((i - 1) * (100 / 27)) + '%',
                animationDelay: ((i * 97) % 160) / 100 + 's',
              }"
            ></span>
          </div>
        </div>
      </div>
      <p v-else>Figuren finns inte.</p>
    </div>
    <div v-if="figure && dressing" class="color-panel">
      <label v-for="part in shirtParts" :key="part.key" class="color-field">
        <span>{{ part.label }}</span>
        <input type="color" v-model="shirtColors[part.key]" />
      </label>
    </div>
    <footer class="actions" v-if="figure">
      <button
        class="action"
        :class="{ active: washing }"
        @click="washFigure"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.5c-.4 0-.8.2-1 .5-1.5 2-6 8.4-6 12.2a7 7 0 0 0 14 0c0-3.8-4.5-10.2-6-12.2-.2-.3-.6-.5-1-.5Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            d="M9 14.5c0 1.8 1.3 3.2 3 3.2"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <span>Tvätta figur</span>
      </button>
      <button
        class="action"
        :class="{ active: dressing }"
        @click="dressFigure"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 3.5 4 6l2 4 2-1v11.5h8V9l2 1 2-4-4-2.5-2 1.5h-4l-2-1.5Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
        <span>Klä på figur</span>
      </button>
    </footer>
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
  overflow: hidden;
}

.scene {
  position: relative;
  width: min(100%, 600px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.figure-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
}

.figure {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.shirt {
  position: absolute;
  /* Per-figure overrides via CSS variables on .figure-wrap */
  left: var(--shirt-left, 5%);
  top: var(--shirt-top, 59%);
  width: var(--shirt-width, 88%);
  height: auto;
  z-index: 2;
  pointer-events: none;
}

.shower-bar {
  position: absolute;
  left: 0;
  right: 0;
  top: -40px;
  height: 4px;
  background: #111;
  border-radius: 2px;
  z-index: 3;
  pointer-events: none;
}

.drops {
  position: absolute;
  left: 0;
  right: 0;
  top: -36px;
  bottom: 0;
  pointer-events: none;
  z-index: 3;
}

.drop {
  position: absolute;
  top: 0;
  width: 6px;
  height: 12px;
  margin-left: -3px;
  background: #4ab8ff;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 0;
  animation: fall 1.6s linear infinite;
}

@keyframes fall {
  0%   { top: 0;    transform: scaleY(0.6); opacity: 0; }
  8%   {                                    opacity: 1; }
  92%  {                                    opacity: 1; }
  100% { top: 100%; transform: scaleY(1.2); opacity: 0; }
}

.action {
  width: 110px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff;
  border: 1px solid #d8d8d8;
  border-radius: 12px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease;
}

.action:hover {
  transform: translateY(-2px);
  border-color: #b8b8b8;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

.action:active {
  transform: translateY(0);
}

.action.active {
  background: #e6f1ff;
  border-color: #6cb9ff;
  color: #1f6fc4;
}

.action svg {
  width: 40px;
  height: 40px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
}

.color-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: #fafafa;
  border-top: 1px solid #ddd;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.color-field input[type='color'] {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: none;
  cursor: pointer;
}
</style>
