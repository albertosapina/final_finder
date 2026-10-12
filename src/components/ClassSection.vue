<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { classes } from '../data/classes'

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

function scrollToAbility(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  })
}

const currentClass = computed(() => {
  const match = routeHash.value.match(/^#clases\/([^/?#]+)/)
  if (!match) return null

  const id = decodeURIComponent(match[1])
  return classes.find((characterClass) => characterClass.id === id) ?? null
})

const filteredClasses = computed(() => {
  const query = normalizeSearch(searchQuery.value)
  if (!query) return classes

  return classes.filter((characterClass) => normalizeSearch(characterClass.searchText).includes(query))
})

const abilities = computed(
  () => currentClass.value?.blocks.filter((block) => block.type === 'heading') ?? [],
)

onMounted(() => window.addEventListener('hashchange', updateRoute))
onBeforeUnmount(() => window.removeEventListener('hashchange', updateRoute))
</script>

<template>
  <section id="clases" class="class-section" aria-labelledby="class-section-title">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <a href="#inicio">Inicio</a>
      <span aria-hidden="true">›</span>
      <a href="#clases">Clases</a>
      <template v-if="currentClass">
        <span aria-hidden="true">›</span>
        <span aria-current="page">{{ currentClass.name }}</span>
      </template>
    </nav>

    <template v-if="currentClass">
      <header class="class-detail-heading">
        <a class="class-back-link" href="#clases">← Índice de clases</a>
        <p class="eyebrow section-eyebrow">Compendio del aventurero</p>
        <h1 id="class-section-title" class="class-detail-title">{{ currentClass.name }}</h1>
        <span v-if="currentClass.wip" class="class-status class-status-wip">WIP</span>
        <div v-else class="class-facts">
          <span v-if="currentClass.hitDie"><strong>Dado de golpe</strong> {{ currentClass.hitDie }}</span>
          <span v-if="currentClass.skillPoints">
            <strong>Habilidades</strong> {{ currentClass.skillPoints }} por nivel
          </span>
        </div>
      </header>

      <div v-if="currentClass.wip" class="class-wip-panel">
        <span class="wip-sigil" aria-hidden="true">✧</span>
        <div>
          <h2>En desarrollo</h2>
          <p>Esta clase está en proceso de diseño. Su descripción y habilidades se añadirán más adelante.</p>
        </div>
        <span class="class-status class-status-wip">WIP</span>
      </div>

      <template v-else>
        <nav v-if="abilities.length" class="ability-index" aria-label="Índice de habilidades">
          <span class="ability-index-title">En esta clase</span>
          <a
            v-for="ability in abilities"
            :key="ability.id"
            :href="`#${ability.id}`"
            @click.prevent="scrollToAbility(ability.id)"
          >
            {{ ability.title }}
          </a>
        </nav>

        <article class="class-content">
          <template v-for="(block, index) in currentClass.blocks" :key="`${block.type}-${index}`">
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
            <h2 v-else-if="block.type === 'heading'" :id="block.id" class="ability-heading">
              {{ block.title }}
            </h2>
            <ul v-else-if="block.type === 'list'" class="ability-list">
              <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item"></li>
            </ul>
            <p v-else class="ability-paragraph" v-html="block.html"></p>
          </template>
        </article>
      </template>
    </template>

    <template v-else>
      <header class="class-index-heading">
        <div>
          <p class="eyebrow section-eyebrow">Guía de contenidos</p>
          <h1 id="class-section-title" class="class-index-title">Clases</h1>
          <p class="class-index-description">
            Explora las disciplinas y caminos disponibles para los aventureros.
          </p>
        </div>
        <label class="search-box class-search">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <span class="visually-hidden">Buscar una clase</span>
          <input v-model="searchQuery" type="search" placeholder="Buscar clase..." />
        </label>
      </header>

      <nav class="class-index-nav" aria-label="Índice de clases">
        <a
          v-for="characterClass in filteredClasses"
          :key="characterClass.id"
          class="class-index-card"
          :href="`#clases/${characterClass.id}`"
        >
          <span class="class-index-number">{{ String(classes.indexOf(characterClass) + 1).padStart(2, '0') }}</span>
          <span class="class-index-name">{{ characterClass.name }}</span>
          <span v-if="characterClass.wip" class="class-status class-status-wip">WIP</span>
          <img
            v-else-if="characterClass.sprite"
            class="class-index-sprite"
            :src="`${baseUrl}sprites/${characterClass.sprite}`"
            :alt="`Icono de ${characterClass.name}`"
            width="36"
            height="36"
            loading="lazy"
          />
          <span class="class-index-arrow" aria-hidden="true">›</span>
        </a>
        <p v-if="filteredClasses.length === 0" class="empty-state class-empty-state">
          No hay clases que coincidan con «{{ searchQuery }}».
        </p>
      </nav>

      <p class="class-index-count">
        {{ filteredClasses.length }} de {{ classes.length }} clases
      </p>
    </template>
  </section>
</template>
