import source from './races.md?raw'
import { parseBlocks, slugify } from './markdown'

const raceImages = {
  1: 'au-ra.png',
  2: 'bangaa.png',
  3: 'burmeciano.png',
  4: 'galka.png',
  5: 'genomido.png',
  6: 'hume.png',
  7: 'moguri.png',
  8: 'lalafell.png',
  9: 'ronsho.png',
  10: 'viera.png',
}

function parseRaces(markdown) {
  const sections = markdown.split(/^#[ \t]+([^ \t\r\n].*?)\s*$/gm).slice(1)

  return Array.from({ length: Math.floor(sections.length / 2) }, (_, index) => {
    const name = sections[index * 2].trim()
    const sourceLines = sections[index * 2 + 1].trim().split(/\r?\n/)
    const imageId = sourceLines
      .find((line) => /^!\[\]\[image\d+\]/.test(line.trim()))
      ?.match(/image(\d+)/)?.[1]
    const id = slugify(name)
    const bodyLines = sourceLines.filter(
      (line) => !/^!\[\]\[image\d+\]/.test(line.trim()) && !/^#\s*$/.test(line.trim()),
    )

    return {
      id,
      name,
      image: raceImages[imageId],
      blocks: parseBlocks(bodyLines, `raza-${id}`),
      searchText: `${name} ${sourceLines.join(' ')}`.toLocaleLowerCase('es'),
    }
  }).filter((race) => race.id && race.name.toLocaleLowerCase('es') !== 'razas')
}

export const races = parseRaces(source)
