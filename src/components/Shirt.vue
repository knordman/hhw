<script setup lang="ts">
import { computed } from 'vue'
import shirtSvgRaw from '../../graphics/shirt.svg?raw'

export type ShirtColors = {
  top: string
  center: string
  bottom: string
  left: string
  right: string
}

const props = defineProps<{ colors: ShirtColors }>()

type Part = {
  d: string
  label: 'top' | 'center' | 'bottom' | 'left' | 'right' | null
  isOutline: boolean
  rawStyle: string
}

const PATH_RE = /<path\b([^>]*?)\/>/g
const ATTR_RE = (name: string) =>
  new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`)

function parseParts(svg: string): Part[] {
  const parts: Part[] = []
  let m: RegExpExecArray | null
  while ((m = PATH_RE.exec(svg))) {
    const attrs = m[1]
    const d = ATTR_RE('d').exec(attrs)?.[1] ?? ''
    const label = ATTR_RE('inkscape:label').exec(attrs)?.[1] ?? ''
    const style = ATTR_RE('style').exec(attrs)?.[1] ?? ''
    if (!d) continue
    const known = ['top', 'center', 'bottom', 'left', 'right'] as const
    const matched = known.find((k) => k === label) ?? null
    parts.push({
      d,
      label: matched,
      isOutline: !matched,
      rawStyle: style,
    })
  }
  return parts
}

const parts = computed(() => parseParts(shirtSvgRaw))

function fillFor(part: Part): string {
  if (part.label) return props.colors[part.label]
  // Outline path — keep its original fill color from the SVG.
  const m = /fill\s*:\s*([^;"\s]+)/.exec(part.rawStyle)
  return m?.[1] ?? '#000000'
}
</script>

<template>
  <svg
    viewBox="0 0 771.12946 307.18765"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(-84.697827,-731.09816)">
      <path
        v-for="(part, i) in parts"
        :key="i"
        :d="part.d"
        :fill="fillFor(part)"
      />
    </g>
  </svg>
</template>
