<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { toPng } from 'html-to-image'
import { findFigure } from '../figures'
import Shirt, { type ShirtColors } from '../components/Shirt.vue'
import brushSrc from '../../graphics/brush.svg'

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

type Dirt = {
  id: number
  // Percentage of the figure-wrap so spots scale with the figure.
  xPct: number
  yPct: number
  size: number
  rotate: number
  color: string
}

const DIRT_COLORS = ['#5a3a1f', '#3e2a14', '#6b4a25', '#2f1f10', '#4a3520']

const dirts = ref<Dirt[]>([])
let nextDirtId = 1

function spawnDirt() {
  const count = 14 + Math.floor(Math.random() * 8)
  const spots: Dirt[] = []
  for (let i = 0; i < count; i++) {
    spots.push({
      id: nextDirtId++,
      xPct: 15 + Math.random() * 70,
      yPct: 25 + Math.random() * 65,
      size: 18 + Math.random() * 22,
      rotate: Math.random() * 360,
      color: DIRT_COLORS[Math.floor(Math.random() * DIRT_COLORS.length)],
    })
  }
  dirts.value = spots
}

function washFigure() {
  washing.value = !washing.value
  if (washing.value) {
    spawnDirt()
  } else {
    brushVisible.value = false
    dirts.value = []
  }
}

const brushVisible = ref(false)
const brushScrubbing = ref(false)
const brushPos = reactive({ x: 0, y: 0 })

// Radius around the brush tip (in px) that counts as scrubbing a dirt spot.
const SCRUB_RADIUS = 50

function updateBrushFromEvent(e: PointerEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  brushPos.x = e.clientX - rect.left
  brushPos.y = e.clientY - rect.top
  if (brushScrubbing.value) {
    scrubDirtAt(brushPos.x, brushPos.y, rect.width, rect.height)
  }
}

function scrubDirtAt(x: number, y: number, w: number, h: number) {
  if (!dirts.value.length) return
  const r2 = SCRUB_RADIUS * SCRUB_RADIUS
  dirts.value = dirts.value.filter((d) => {
    const dx = (d.xPct / 100) * w - x
    const dy = (d.yPct / 100) * h - y
    return dx * dx + dy * dy > r2
  })
}

function onScrubStart(e: PointerEvent) {
  if (!washing.value) return
  e.preventDefault()
  brushScrubbing.value = true
  brushVisible.value = true
  updateBrushFromEvent(e)
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onScrubMove(e: PointerEvent) {
  if (!brushScrubbing.value) return
  updateBrushFromEvent(e)
}

function onScrubEnd(e: PointerEvent) {
  if (!brushScrubbing.value) return
  brushScrubbing.value = false
  const target = e.currentTarget as HTMLElement
  if (target.hasPointerCapture(e.pointerId)) {
    target.releasePointerCapture(e.pointerId)
  }
}

function dressFigure() {
  dressing.value = !dressing.value
}

const sceneRef = useTemplateRef<HTMLElement>('sceneRef')
const downloading = ref(false)

async function downloadCanvas() {
  if (!sceneRef.value || downloading.value) return
  downloading.value = true
  try {
    const dataUrl = await toPng(sceneRef.value, {
      pixelRatio: 2,
      backgroundColor: '#fafafa',
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `hhw-${figure.value?.id ?? 'figure'}.png`
    a.click()
  } catch (err) {
    console.error('Download failed', err)
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="figure-page">
    <header class="toolbar">
      <RouterLink to="/" class="back">← Tillbaka</RouterLink>
      <button
        v-if="figure"
        class="download"
        :disabled="downloading"
        @click="downloadCanvas"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Ladda ner</span>
      </button>
    </header>
    <div class="stage">
      <div v-if="figure" ref="sceneRef" class="scene" :class="{ washing }">
        <div
          class="figure-wrap"
          :style="shirtStyle"
          @pointerdown="onScrubStart"
          @pointermove="onScrubMove"
          @pointerup="onScrubEnd"
          @pointercancel="onScrubEnd"
        >
          <img class="figure" :src="figure.src" alt="" draggable="false" />
          <Shirt v-if="dressing" class="shirt" :colors="shirtColors" />
          <span
            v-for="d in dirts"
            :key="d.id"
            class="dirt"
            :style="{
              left: d.xPct + '%',
              top: d.yPct + '%',
              width: d.size + 'px',
              height: d.size + 'px',
              background: d.color,
              transform: 'translate(-50%, -50%) rotate(' + d.rotate + 'deg)',
            }"
            aria-hidden="true"
          ></span>
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
          <img
            v-if="washing && brushVisible"
            class="brush"
            :class="{ scrubbing: brushScrubbing }"
            :src="brushSrc"
            :style="{ left: brushPos.x + 'px', top: brushPos.y + 'px' }"
            alt=""
            aria-hidden="true"
            draggable="false"
          />
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

.download {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  color: #333;
}

.download:hover:not(:disabled) {
  background: #f0f0f0;
}

.download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download svg {
  width: 18px;
  height: 18px;
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
  touch-action: none;
}

.figure {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
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

.dirt {
  position: absolute;
  z-index: 3;
  border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%;
  opacity: 0.85;
  pointer-events: none;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
}

.brush {
  position: absolute;
  width: 120px;
  height: auto;
  pointer-events: none;
  z-index: 4;
  /* Anchor: bristle tip near top-left of the brush image */
  transform: translate(-15%, -15%) rotate(-20deg);
  transform-origin: 15% 15%;
  user-select: none;
  -webkit-user-drag: none;
  transition: transform 0.08s ease;
}

.brush.scrubbing {
  transform: translate(-15%, -15%) rotate(-15deg);
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
