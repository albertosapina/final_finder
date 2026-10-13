export function slugify(value) {
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

export function parseBlocks(lines, idPrefix = 'habilidad') {
  const blocks = []
  const headingCounts = new Map()
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/)

    if (!trimmed) {
      index += 1
      continue
    }

    if (heading) {
      const title = heading[2]
      const slug = slugify(title)
      const count = (headingCounts.get(slug) ?? 0) + 1
      headingCounts.set(slug, count)
      blocks.push({
        type: 'heading',
        title,
        id: `${idPrefix}-${slug}${count > 1 ? `-${count}` : ''}`,
        level: heading[1].length,
      })
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
      !/^(?:#{2,3}\s+|\|)/.test(lines[index].trim()) &&
      !/^(?:\\-|-|\*)\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index])
      index += 1
    }

    blocks.push({ type: 'paragraph', html: renderInline(paragraph.join('\n')) })
  }

  return blocks
}
