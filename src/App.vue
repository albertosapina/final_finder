<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ClassSection from './components/ClassSection.vue'

const sections = [
  {
    id: 'clases',
    title: 'Clases',
    icon: '✧',
    description: 'Descubre los caminos y disciplinas que dan forma a cada aventurero.',
  },
  {
    id: 'reglas-especiales',
    title: 'Reglas especiales',
    icon: '❖',
    description: 'Consulta las reglas que amplían las posibilidades de cada partida.',
  },
  {
    id: 'razas',
    title: 'Razas',
    icon: '◈',
    description: 'Conoce los pueblos y linajes que habitan este mundo.',
  },
  {
    id: 'equipamiento',
    title: 'Equipamiento',
    icon: '⚒',
    description: 'Prepara tu viaje con armas, armaduras y objetos de aventura.',
  },
  {
    id: 'magia',
    title: 'Magia',
    icon: '✴',
    description: 'Explora los misterios arcanos y las artes de lo sobrenatural.',
  },
]

const searchQuery = ref('')
const routeHash = ref(window.location.hash)
const baseUrl = import.meta.env.BASE_URL
const filteredSections = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es')
  if (!query) return sections

  return sections.filter((section) =>
    `${section.title} ${section.description}`.toLocaleLowerCase('es').includes(query),
  )
})

const isClassPage = computed(() => routeHash.value.startsWith('#clases'))

function updateRoute() {
  routeHash.value = window.location.hash
}

onMounted(() => window.addEventListener('hashchange', updateRoute))
onBeforeUnmount(() => window.removeEventListener('hashchange', updateRoute))
</script>

<template>
  <div id="inicio" class="site-shell">
    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="Final Finder, inicio">
        <img class="brand-mark" :src="`${baseUrl}logo-crest.svg`" alt="" />
        <span class="brand-name"><span>Final</span> Finder</span>
      </a>

      <nav class="main-nav" aria-label="Secciones principales">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          @click="searchQuery = ''"
        >
          {{ section.title }}
        </a>
      </nav>

      <span class="edition-label"><span aria-hidden="true"></span> Compendio del aventurero</span>
    </header>

    <main v-if="isClassPage">
      <ClassSection />
    </main>

    <main v-else>
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <a href="#inicio">Inicio</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Compendio</span>
      </nav>

      <section class="welcome" aria-labelledby="welcome-title">
        <div class="welcome-copy">
          <p class="eyebrow">El compendio del aventurero</p>
          <h1 id="welcome-title" class="hero-logo" aria-label="Final Finder">
            <span class="logo-word">Final</span>
            <img class="logo-crest" :src="`${baseUrl}logo-crest.svg`" alt="" />
            <span class="logo-word logo-word-accent">Finder</span>
          </h1>
          <p class="welcome-text">
            Tu guía para explorar las reglas, los pueblos y los caminos de tu mundo.
          </p>
          <a class="explore-link" href="#secciones">
            Explorar el compendio <span aria-hidden="true">⌄</span>
          </a>
        </div>

        <div class="welcome-art" aria-hidden="true">
          <div class="art-orbit orbit-outer"></div>
          <div class="art-orbit orbit-inner"></div>
          <img class="art-sigil" :src="`${baseUrl}logo-crest.svg`" alt="" />
          <span class="art-star star-one">✧</span>
          <span class="art-star star-two">✦</span>
          <span class="art-star star-three">·</span>
          <div class="art-caption">Compendio del aventurero</div>
        </div>
      </section>

      <section id="secciones" class="section-index" aria-labelledby="sections-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow section-eyebrow">Guía de contenidos</p>
            <h2 id="sections-title">Explora el compendio</h2>
          </div>
          <label class="search-box">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <span class="visually-hidden">Buscar una sección</span>
            <input v-model="searchQuery" type="search" placeholder="Buscar sección..." />
          </label>
        </div>

        <div class="section-grid">
          <component
            :is="section.id === 'clases' ? 'a' : 'article'"
            v-for="(section, index) in filteredSections"
            :id="section.id"
            :key="section.id"
            :href="section.id === 'clases' ? '#clases' : undefined"
            class="section-card"
            :class="`section-card-${index + 1}`"
          >
            <span class="card-topline">
              <span class="card-icon" aria-hidden="true">{{ section.icon }}</span>
              <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
            </span>
            <span class="card-title">{{ section.title }}</span>
            <span class="card-description">{{ section.description }}</span>
            <span class="card-bottom">
              <span>Consultar contenido</span>
              <span class="card-arrow" aria-hidden="true">›</span>
            </span>
          </component>
          <p v-if="filteredSections.length === 0" class="empty-state">
            No hay secciones que coincidan con «{{ searchQuery }}».
          </p>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span class="footer-brand">
        <img class="footer-mark" :src="`${baseUrl}logo-crest.svg`" alt="" />
        <span>FINAL FINDER</span>
      </span>
      <span class="footer-divider" aria-hidden="true">✦</span>
      <span>El comienzo de una gran aventura</span>
    </footer>
  </div>
</template>
