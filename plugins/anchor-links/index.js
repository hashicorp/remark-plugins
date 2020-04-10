const generateSlug = require('../../generate_slug')
const map = require('unist-util-map')
const is = require('unist-util-is')
const remark = require('remark')
const stringify = require('remark-stringify')

// This plugin adds anchor links to headlines and lists that begin with inline
// code blocks.
module.exports = function anchorLinksPlugin({
  compatibilitySlug,
  listWithInlineCodePrefix,
} = {}) {
  return function transformer(tree) {
    // this array keeps track of existing slugs to prevent duplicates per-page
    const links = []

    return map(tree, (node) => {
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

function processHeading(node, compatibilitySlug, links) {
  const text = stringifyChildNodes(node)

  // generate the slug and add a target element to the headline
  const slug = generateSlug(text, links)
  node.children.unshift({
    type: 'html',
    value: `<a class="__target-h" id="${slug}" aria-hidden></a>`,
  })

  // handle anchor link aliases
  const aliases = processAlias(node, 'h', 1)
  if (aliases) node.children.unshift(...aliases)

  // if the compatibilitySlug option is present, we generate it and add to the
  // headline if it doesn't already match the existing slug
  if (compatibilitySlug) {
    const slug2 = compatibilitySlug(text)
    if (slug !== slug2) {
      node.children.unshift({
        type: 'html',
        value: `<a class="__target-h __compat" id="${slug2}" aria-hidden></a>`,
      })
    }
  }

  // finally, we generate an "permalink" element that can be used to get a quick
  // anchor link for any given headline
  node.children.unshift({
    type: 'html',
    value: `<a class="__permalink-h" href="#${slug}" aria-label="${generateSlug.generateAriaLabel(
      text
    )} permalink">»</a>`,
  })

  return node
}

function processListWithInlineCode(liNode, pNode, codeNode, prefix, links) {
  // construct an id/slug based on value of <code> node
  // if the prefix option is present, add it before the slug name
  const text = codeNode.value
  const slug = generateSlug(`${prefix ? `${prefix}-` : ''}${text}`, links)

  // handle anchor link aliases
  const aliases = processAlias(pNode, 'lic', 1)
  if (aliases) liNode.children.unshift(...aliases)

  // add the target element with the right slug
  liNode.children.unshift({
    type: 'html',
    value: `<a id="${slug}" class="__target-lic" aria-hidden></a>`,
  })

  // wrap permalink element around child <code> node, so clicking will set
  // the url to the anchor link.
  pNode.children[0] = {
    type: 'link',
    url: `#${slug}`,
    data: {
      hProperties: {
        ariaLabel: `${generateSlug.generateAriaLabel(text)} permalink`,
        class: '__permalink-lic',
      },
    },
    children: [pNode.children[0]],
  }

  return liNode
}

function processAlias(node, id, startIndex = 0) {
  // disqualify input that couldn't possibly be an alias
  if (
    !node ||
    !node.children ||
    !node.children.length ||
    node.children.length <= startIndex
  )
    return

  // we look for ((#foo)) or ((#foo, #bar))
  const aliasRegex = /\s*\(\((#.*?)\)\)/

  // it's possible that the pattern could be broken into multiple nodes
  // so we have to check serially. this happens, for example, if an alias
  // contains an underscore like ((#\_foo)), which has to be escaped, bc
  // markdown. our parser will split escaped characters into multiple nodes,
  // for some reason.
  //
  // the most common scenario, however, is that the first node will match the
  // entirely, so we check for that first.
  const firstNode = node.children[startIndex]
  if (firstNode.value && firstNode.value.match(aliasRegex)) {
    return _processAliases(firstNode, id, aliasRegex)
  }

  // next, we check for the more unusual scenario of the pattern being broken into
  // multiple nodes. the double parens are a "minimum viable match" so we'll look for
  // that in the first text node. if we match this, we can continue our search.
  const minimumViableRegex = /\s*\(\(/
  const endRegex = /\)\)/
  if (firstNode.value && firstNode.value.match(minimumViableRegex)) {
    // now we need to figure out where the end of our pattern, "))", is. we find
    // this, then squash the entire thing together into a single node. any unusual nodes
    // other than text will be discarded. we can't deal with that, honestly.
    const endIndex = node.children.findIndex(
      (node) => node.value && node.value.match(endRegex)
    )

    // If there is a "((" pattern without a closing, never mind
    if (endIndex < 0) return

    // we know where the beginning and end nodes containing our pattern are, so we combine
    // their values into a single string
    const combinedText = node.children
      .slice(startIndex, endIndex + 1)
      .reduce((m, s) => {
        if (s.value) m += s.value
        return m
      }, '')

    // now, we replace all of the old broken up pieces with a single, combined node containing
    // the full text of the alias
    node.children.splice(startIndex, endIndex + 1, {
      type: 'text',
      value: combinedText,
    })

    // and then proceed to process it as if none of this ever happened!
    return _processAliases(node.children[startIndex], id, aliasRegex)
  }
}

function _processAliases(node, id, aliasRegex) {
  // if we have a match, format into an array of slugs without the '#'
  const aliases = node.value
    .match(aliasRegex)[1]
    .split(',')
    .map((s) => s.trim().replace(/^#/, ''))

  // then remove the entire match from the element's actual text
  node.value = node.value.replace(aliasRegex, '')

  // finally we return an array of target elements using each alias given
  return aliases.map((alias) => {
    return {
      type: 'html',
      value: `<a class="__target-${id} __compat" id="${alias}" aria-hidden></a>`,
    }
  })
}

// a heading can contain multiple nodes including text, html, etc
// we try to stringify the node here to get its literal text contents
// if that fails due to nonstandard nodes etc. we take a simpler route
// for example, if using mdx, html nodes are encoded as "jsx" which is
// not a type that standard remark recognizes. we can't accommodate all
// types of custom remark setups, so we simply fall back if it doesn't work
function stringifyChildNodes(node) {
  let text
  try {
    text = remark().use(stringify).stringify(node)
  } catch (_) {
    text = node.children.reduce((m, s) => {
      if (s.value) m += s.value
      return m
    }, '')
  }
  return text
}

// check first node for at least ((
// if that matches,
