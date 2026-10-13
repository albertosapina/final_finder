import source from './classes.md?raw'
import { parseBlocks, slugify } from './markdown'

function parseClasses(markdown) {
  const classSections = markdown.split(/^#\s+(.+)$/m).slice(1)

  return Array.from({ length: Math.floor(classSections.length / 2) }, (_, index) => {
    const name = classSections[index * 2].trim()
    const sourceLines = classSections[index * 2 + 1].trim().split(/\r?\n/)
    const wip = sourceLines.some((line) => line.trim().toLocaleUpperCase('es') === 'WIP')
    const hitDie = sourceLines.find((line) => /^DG:\s*/i.test(line))?.replace(/^DG:\s*/i, '').trim()
    const skillPoints = sourceLines
      .find((line) => /^Habilidades:\s*/i.test(line))
      ?.replace(/^Habilidades:\s*/i, '')
      .replace(/\\\+/g, '+')
      .trim()
    const sprite = sourceLines
      .find((line) => /^sprite:\s*/i.test(line))
      ?.replace(/^sprite:\s*/i, '')
      .trim()
    const bodyLines = sourceLines.filter(
      (line) =>
        !/^DG:\s*/i.test(line) &&
        !/^Habilidades:\s*/i.test(line) &&
        !/^sprite:\s*/i.test(line),
    )

    return {
      id: slugify(name),
      name,
      wip,
      hitDie,
      skillPoints,
      sprite,
      blocks: wip ? [] : parseBlocks(bodyLines),
      searchText: `${name} ${sourceLines.join(' ')}`.toLocaleLowerCase('es'),
    }
  })
}

export const classes = parseClasses(source)
