import { createRouter, createWebHashHistory } from 'vue-router'
import GalleryView from './views/GalleryView.vue'
import FigureView from './views/FigureView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'gallery', component: GalleryView },
    { path: '/figure/:id', name: 'figure', component: FigureView, props: true },
  ],
})
