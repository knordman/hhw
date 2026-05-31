<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const color = ref('#222222')
const lineWidth = ref(3)

let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let lastX = 0
let lastY = 0

function getPos(e: PointerEvent) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function onPointerDown(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  const { x, y } = getPos(e)
  lastX = x
  lastY = y
  canvasRef.value!.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!drawing || !ctx) return
  const { x, y } = getPos(e)
  ctx.strokeStyle = color.value
  ctx.lineWidth = lineWidth.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}

function onPointerUp(e: PointerEvent) {
  drawing = false
  canvasRef.value?.releasePointerCapture(e.pointerId)
}

function clear() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  // Preserve current drawing across resize
  const snapshot = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null
  canvas.width = Math.floor(rect.width * dpr)
  canvas.height = Math.floor(rect.height * dpr)
  ctx = canvas.getContext('2d')
  if (snapshot && ctx) ctx.putImageData(snapshot, 0, 0)
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="draw-page">
    <header class="toolbar">
      <h1>HHW</h1>
      <label>
        Color
        <input type="color" v-model="color" />
      </label>
      <label>
        Size
        <input type="range" min="1" max="40" v-model.number="lineWidth" />
        <span>{{ lineWidth }}px</span>
      </label>
      <button @click="clear">Clear</button>
    </header>
    <canvas
      ref="canvasRef"
      class="canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
  </div>
</template>

<style scoped>
.draw-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar h1 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.toolbar label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.toolbar button {
  margin-left: auto;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
}

.canvas {
  flex: 1;
  width: 100%;
  background: #ffffff;
  cursor: crosshair;
  touch-action: none;
}
</style>
