import source from './classes.md?raw'

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function unescapeMarkdown(value) {
  return value.replace(/\\([\\`*_{}\[\]()#+.!|>-])/g, '$1')
}

function renderInline(value) {
  let html = escapeHtml(unescapeMarkdown(value))

  html = html
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/ {2,}\n/g, '<br>')
    .replace(/\n/g, ' ')

  return html
}

function parseTable(lines) {
  const rows = lines
    .filter((line) => !/^\s*\|[\s:|-]+\|\s*$/.test(line))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => unescapeMarkdown(cell.trim())),
    )

  return {
    headers: rows[0] ?? [],
    rows: rows.slice(1),
  }
}

function parseBlocks(lines) {
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace(/^##\s+/, '')
      const id = slugify(title)
      blocks.push({ type: 'heading', title, id: `habilidad-${id}` })
      index += 1
      continue
    }

    if (trimmed.startsWith('|')) {
      const tableLines = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index])
        index += 1
      }
      blocks.push({ type: 'table', ...parseTable(tableLines) })
      continue
    }

    if (/^(?:\\-|-|\*)\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^(?:\\-|-|\*)\s+/.test(lines[index].trim())) {
        items.push(renderInline(lines[index].trim().replace(/^(?:\\-|-|\*)\s+/, '')))
        index += 1
      }
      blocks.push({ type: 'list', items })
      continue
    }

    const paragraph = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('## ') &&
      !lines[index].trim().startsWith('|') &&
      !/^(?:\\-|-|\*)\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index])
      index += 1
    }

    blocks.push({ type: 'paragraph', html: renderInline(paragraph.join('\n')) })
  }

  return blocks
}

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
