const modules = import.meta.glob<{ default: string }>(
  '../graphics/*.png',
  { eager: true },
)

export type Figure = {
  id: string
  name: string
  src: string
}

const NON_FIGURE_IDS = new Set(['bathroom', 'wardrobe'])

export const figures: Figure[] = Object.entries(modules)
  .map(([path, mod]) => {
    const id = path.split('/').pop()!.replace(/\.png$/, '')
    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      src: mod.default,
    }
  })
  .filter((f) => !NON_FIGURE_IDS.has(f.id))
  .sort((a, b) => a.id.localeCompare(b.id))

export function findFigure(id: string): Figure | undefined {
  return figures.find((f) => f.id === id)
}
