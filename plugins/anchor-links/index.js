const generateSlug = require('../../generate_slug')
const map = require('unist-util-map')
const is = require('unist-util-is')
const remark = require('remark')
const stringify = require('remark-stringify')

// This plugin adds anchor links to headlines and lists that begin with inline
// code blocks.
module.exports = function anchorLinksPlugin({
  compatibilitySlug,
  listWithInlineCodePrefix
} = {}) {
  return function transformer(tree) {
    // this array keeps track of existing slugs to prevent duplicates per-page
    const links = []

    return map(tree, node => {
      // since we are adding anchor links to two separate patterns: headings and
      // lists with inline code, we first sort into these categories.
      //
      // start with headings
      if (is(node, 'heading')) {
        return processHeading(node, compatibilitySlug, links)
      }

      // next we check for lists with inline code. specifically, we're looking for:
      // listItem -> paragraph -> [inlineCode, ...etc]
      const liNode = node
      if (!is(liNode, 'listItem') || !liNode.children) return node
      const pNode = liNode.children[0]
      if (!is(pNode, 'paragraph') || !pNode.children) return node
      const codeNode = pNode.children[0]
      if (!is(codeNode, 'inlineCode')) return node

      return processListWithInlineCode(
        liNode,
        pNode,
        codeNode,
        listWithInlineCodePrefix,
        links
      )
    })
  }
}

// make sure pure slug generation removed links

function processHeading(node, compatibilitySlug, links) {
  // a heading can contain multiple nodes including text, html, etc
  // we add all their values here to get the literal headline contents
  const text = node.children.reduce((m, i) => {
    if (i.value) m += i.value
    return m
  }, '')

  // generate the slug and add a target element to the headline
  const slug = generateSlug(text, links)
  node.children.unshift({
    type: 'html',
    value: `<a class="__target-h" id="${slug}" aria-hidden></a>`
  })

  // handle anchor link aliases
  const aliases = processAlias(node.children[1], 'h')
  if (aliases) node.children.unshift(...aliases)

  // if the compatibilitySlug option is present, we generate it and add to the
  // headline if it doesn't already match the existing slug
  if (compatibilitySlug) {
    const slug2 = compatibilitySlug(text)
    if (slug !== slug2) {
      node.children.unshift({
        type: 'html',
        value: `<a class="__target-h __compat" id="${slug2}" aria-hidden></a>`
      })
    }
  }

  // finally, we generate an "anchor" element that can be used to get a quick
  // anchor link for any given headline
  node.children.unshift({
    type: 'html',
    value: `<a class="__permalink-h" href="#${slug}" aria-label="${generateSlug.generateAriaLabel(
      text
    )} permalink">»</a>`
  })

  return node
}

function processListWithInlineCode(liNode, pNode, codeNode, prefix, links) {
  // construct an id/slug based on value of <code> node
  // if the prefix option is present, add it before the slug name
  const text = codeNode.value
  const slug = generateSlug(`${prefix ? `${prefix}-` : ''}${text}`, links)

  // handle anchor link aliases
  const nextNode = pNode.children[1]
  const aliases = processAlias(nextNode, 'lic')
  if (aliases) liNode.children.unshift(...aliases)

  // add slug to parent <li> node's id attribute
  // TODO - this needs to be an independent element for sticky navs
  liNode.children.unshift({
    type: 'html',
    value: `<a id="${slug}" class="__target-lic" aria-hidden></a>`
  })

  // wrap link element around child <code> node, so clicking will set the url
  // to the anchor link.
  pNode.children[0] = {
    type: 'link',
    url: `#${slug}`,
    data: {
      hProperties: {
        ariaLabel: `${generateSlug.generateAriaLabel(text)} permalink`,
        class: '__permalink-lic'
      }
    },
    children: [pNode.children[0]]
  }

  return liNode
}

function processAlias(node, id) {
  const aliasRegex = /\s*\(\((#.*?)\)\)/

  if (node && node.value && node.value.match(aliasRegex)) {
    const aliases = node.value
      .match(aliasRegex)[1]
      .split(',')
      .map(s => s.trim().replace(/^#/, ''))
    node.value = node.value.replace(aliasRegex, '')

    return aliases.map(alias => {
      return {
        type: 'html',
        value: `<a class="__target-${id} __compat" id="${alias}" aria-hidden></a>`
      }
    })
  }
}
