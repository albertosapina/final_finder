<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { races } from '../data/races'

const routeHash = ref(window.location.hash)
const searchQuery = ref('')
const baseUrl = import.meta.env.BASE_URL

function updateRoute() {
  routeHash.value = window.location.hash
}

function normalizeSearch(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  })
}

const currentRace = computed(() => {
  const match = routeHash.value.match(/^#razas\/([^/?#]+)/)
  if (!match) return null

  const id = decodeURIComponent(match[1])
  return races.find((race) => race.id === id) ?? null
})

const filteredRaces = computed(() => {
  const query = normalizeSearch(searchQuery.value)
  if (!query) return races

  return races.filter((race) => normalizeSearch(race.searchText).includes(query))
})

const sections = computed(
  () => currentRace.value?.blocks.filter((block) => block.type === 'heading') ?? [],
)

onMounted(() => window.addEventListener('hashchange', updateRoute))
onBeforeUnmount(() => window.removeEventListener('hashchange', updateRoute))
</script>

<template>
  <section id="razas" class="class-section race-section" aria-labelledby="race-section-title">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <a href="#inicio">Inicio</a>
      <span aria-hidden="true">›</span>
      <a href="#razas">Razas</a>
      <template v-if="currentRace">
        <span aria-hidden="true">›</span>
        <span aria-current="page">{{ currentRace.name }}</span>
      </template>
    </nav>

    <template v-if="currentRace">
      <header class="class-detail-heading race-detail-heading">
        <a class="class-back-link" href="#razas">← Índice de razas</a>
        <div class="race-hero-layout">
          <img
            class="race-portrait"
            :src="`${baseUrl}races/${currentRace.image}`"
            :alt="`Ilustración de ${currentRace.name}`"
            width="220"
            height="220"
          />
          <div>
            <p class="eyebrow section-eyebrow">Pueblos y linajes</p>
            <h1 id="race-section-title" class="class-detail-title">{{ currentRace.name }}</h1>
            <p class="race-detail-intro">
              Consulta la descripción y los rasgos que definen a este pueblo.
            </p>
          </div>
        </div>
      </header>

      <nav v-if="sections.length" class="ability-index" aria-label="Índice de la raza">
        <span class="ability-index-title">En esta raza</span>
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          @click.prevent="scrollToSection(section.id)"
        >
          {{ section.title }}
        </a>
      </nav>

      <article class="class-content race-content">
        <template v-for="(block, index) in currentRace.blocks" :key="`${block.type}-${index}`">
          <div v-if="block.type === 'table'" class="class-table-scroll" tabindex="0">
            <table class="class-progression">
              <thead>
                <tr>
                  <th v-for="(header, headerIndex) in block.headers" :key="headerIndex" scope="col">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2
            v-else-if="block.type === 'heading' && block.level === 2"
            :id="block.id"
            class="ability-heading"
          >
            {{ block.title }}
          </h2>
          <h3 v-else-if="block.type === 'heading'" :id="block.id" class="race-trait-heading">
            {{ block.title }}
          </h3>
          <ul v-else-if="block.type === 'list'" class="ability-list">
            <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item"></li>
          </ul>
          <p v-else class="ability-paragraph" v-html="block.html"></p>
        </template>
      </article>
    </template>

    <template v-else>
      <header class="class-index-heading">
        <div>
          <p class="eyebrow section-eyebrow">Guía de contenidos</p>
          <h1 id="race-section-title" class="class-index-title">Razas</h1>
          <p class="class-index-description">
            Descubre los pueblos, culturas y linajes que habitan este mundo.
          </p>
        </div>
        <label class="search-box class-search">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <span class="visually-hidden">Buscar una raza</span>
          <input v-model="searchQuery" type="search" placeholder="Buscar raza..." />
        </label>
      </header>

      <nav class="class-index-nav" aria-label="Índice de razas">
        <a
          v-for="race in filteredRaces"
          :key="race.id"
          class="class-index-card"
          :href="`#razas/${race.id}`"
        >
          <span class="class-index-number">{{ String(races.indexOf(race) + 1).padStart(2, '0') }}</span>
          <span class="class-index-name">{{ race.name }}</span>
          <img
            class="class-index-sprite race-index-image"
            :class="{ 'race-index-image-hume': race.id === 'hume' }"
            :src="`${baseUrl}races/${race.image}`"
            :alt="`Ilustración de ${race.name}`"
            width="44"
            height="44"
            loading="lazy"
          />
          <span class="class-index-arrow" aria-hidden="true">›</span>
        </a>
        <p v-if="filteredRaces.length === 0" class="empty-state class-empty-state">
          No hay razas que coincidan con «{{ searchQuery }}».
        </p>
      </nav>

      <p class="class-index-count">{{ filteredRaces.length }} de {{ races.length }} razas</p>
    </template>
  </section>
</template>
