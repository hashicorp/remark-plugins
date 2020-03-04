const flatMap = require('unist-util-flatmap')

module.exports = function headingLinkablePlugin() {
  return function transformer(tree) {
    const links = []
    return flatMap(tree, node => {
      if (node.type !== 'heading') return [node]
      const text = node.children.reduce((m, i) => {
        if (i.type === 'text') m += i.value
        return m
      }, '')
      const slug = generateSlug(links, text)
      node.children.unshift({
        type: 'html',
        value: `<a class="__target" id="${slug}" aria-hidden="true"></a>`
      })
      node.children.unshift({
        type: 'html',
        value: `<a class="anchor" href="#${slug}" aria-label="${generateAriaLabel(
          text
        )} permalink">»</a>`
      })
      return [node]
    })
  }
}

function generateSlug(links, headline) {
  let slug = headline
    .toLowerCase()
    .trim()
    .replace(/<\/?[^>]*>/g, '') // Strip links
    .replace(/\W+/g, '-') // Whitespace to '-'
    .replace(/^\-/g, '') // Remove leading '-'
    .replace(/-+/g, '-') // Collapse more than one '-'

  // count if there are any duplicates on the page
  const dupeCount = links.reduce((m, i) => {
    if (slug === i) m++
    return m
  }, 0)
  links.push(slug)

  // append the count to the end of the slug if necessary
  if (dupeCount > 0) slug = `${slug}-${dupeCount}`

  return slug
}

module.exports.generateSlug = generateSlug

function generateAriaLabel(headline) {
  return headline
    .toLowerCase()
    .replace(/<\/?[^>]*>/g, '') // Strip links
    .replace(/^\-/g, '') // Remove leading '-'
    .replace(/\W+/g, ' ') // Collapse whitespace
    .trim()
}

module.exports.generateAriaLabel = generateAriaLabel
