/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const generateSlug = require('../../generate_slug')
const map = require('unist-util-map')
const is = require('unist-util-is')

// This plugin adds anchor links to headlines and lists that begin with inline
// code blocks.
//
// NOTE: Some of the HTML code is duplicated in:
//       https://github.com/hashicorp/consul/blob/4f15f83dc64e2a9a95cb6b989719838b1f97015b/website/components/config-entry-reference/index.jsx#L84-L105
//       If updating the HTML code here, also update there.
module.exports = function anchorLinksPlugin({
  compatibilitySlug,
  listWithInlineCodePrefix,
  headings,
} = {}) {
  return function transformer(tree) {
    // this array keeps track of existing slugs to prevent duplicates per-page
    const links = []

    /**
     * Keep track of whether we're within <Tabs />.
     * If we're in tabbed sections, we may not want to show headings
     * in our table of contents.
     */
    let tabbedSectionDepth = 0

    return map(tree, (node) => {
      /**
       * Check if the lines in this node open and/or close <Tabs />.
       *  - If it opens <Tabs>, increase the tabbedSectionDepth.
       *  - If it closes </Tabs>, decrease the tabbedSectionDepth.
       *
       * NOTE: Some nodes are multiple lines and have also have multiple
       * opening/closing tags for <Tabs />.
       *
       * For example, here is a node that is 4 lines long, and each line must be
       * checked at individually:
       *
       *    </Tab>
       *    </Tabs>
       *    </Tab>
       *    </Tabs>
       *
       * Where this has happened in production:
       *
       * https://github.com/hashicorp/tutorials/blob/50b0284436561e6cbf402fb2aa25b5c0a15ef604/content/tutorials/terraform/aks.mdx?plain=1#L111-L114
       */
      const isHtmlOrJsxNode = node.type === 'html' || node.type === 'jsx'
      if (isHtmlOrJsxNode) {
        // Note that a single HTML node could potentially contain multiple tags
        const openTagMatches = node.value.match(/\<Tabs/g)
        const openTagCount = openTagMatches ? openTagMatches.length : 0
        tabbedSectionDepth += openTagCount
        const closeTagMatches = node.value.match(/\<\/Tabs/g)
        const closeTagCount = closeTagMatches ? closeTagMatches.length : 0
        tabbedSectionDepth -= closeTagCount
      }

      // since we are adding anchor links to two separate patterns: headings and
      // lists with inline code, we first sort into these categories.
      //
      // start with headings
      if (is(node, 'heading')) {
        return processHeading(
          node,
          compatibilitySlug,
          links,
          headings,
          tabbedSectionDepth
        )
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
        compatibilitySlug,
        listWithInlineCodePrefix,
        links
      )
    })
  }
}

function processHeading(
  node,
  compatibilitySlug,
  links,
  headings,
  tabbedSectionDepth
) {
  const text = stringifyChildNodes(node)
  const level = node.depth
  const title = text
    .replace(/<\/?[^>]*>/g, '') // Strip html
    .replace(/\(\(#.*?\)\)/g, '') // Strip anchor link aliases
    .replace(/»/g, '') // Safeguard against double-running this plugin
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()

  // generate the slug and use it as the headline's id property
  const slug = generateSlug(text, links)
  node.data = {
    ...node.data,
    hProperties: { ...node.data?.hProperties, id: slug },
  }

  /**
   * Handle anchor link aliases
   *
   * Note: depends on children of heading element! Expects first child,
   * at index 0, to be the text element. As well, aliases must be attached
   * to separate __target-h elements.
   */
  const aliases = processAlias(node, 0)
  if (aliases.length) node.children.unshift(...aliasesToNodes(aliases, 'h'))

  // if the compatibilitySlug option is present, we generate it and add it
  // if it doesn't already match the existing slug
  let slug2
  if (compatibilitySlug) {
    slug2 = compatibilitySlug(text)
    if (slug !== slug2) {
      node.children.unshift({
        type: 'html',
        value: `<a class="__target-h __compat" id="${slug2}" aria-hidden="true"></a>`,
      })
    }
  }

  // - if an alias is defined, use that
  // - if not, if a compatibilitySlug is defined, use that
  // - otherwise use the auto-generated slug
  const permalinkSlug =
    aliases && aliases.length ? aliases[0] : compatibilitySlug ? slug2 : slug

  // finally, we generate an "permalink" element that can be used to get a quick
  // anchor link for any given headline
  node.children.unshift({
    type: 'html',
    value: `<a class="__permalink-h" href="#${permalinkSlug}" aria-label="${generateSlug.generateAriaLabel(
      text
    )} permalink">»</a>`,
  })

  const headingData = {
    aliases,
    level,
    permalinkSlug,
    slug,
    title,
    tabbedSectionDepth,
  }
  headings?.push(headingData)

  return node
}

function processListWithInlineCode(
  liNode,
  pNode,
  codeNode,
  compatibilitySlug,
  prefix,
  links
) {
  // construct an id/slug based on value of <code> node
  // if the prefix option is present, add it before the slug name
  const text = codeNode.value
  const slug = generateSlug(`${prefix ? `${prefix}-` : ''}${text}`, links)

  // handle anchor link aliases
  const aliases = processAlias(pNode, 1)
  if (aliases.length) liNode.children.unshift(...aliasesToNodes(aliases, 'lic'))

  // if the compatibilitySlug option is present, we generate it and add it
  // if it doesn't already match the existing slug
  let slug2
  if (compatibilitySlug) {
    slug2 = compatibilitySlug(text)
    if (slug !== slug2) {
      liNode.children.unshift({
        type: 'html',
        value: `<a class="__target-h __compat" id="${slug2}" aria-hidden="true"></a>`,
      })
    }
  }

  // add the target element with the right slug
  liNode.children.unshift({
    type: 'html',
    value: `<a id="${slug}" class="__target-lic" aria-hidden="true"></a>`,
  })

  // - if an alias is defined, use that
  // - if not, if a compatibilitySlug is defined, use that
  // - otherwise use the auto-generated slug
  const permalinkSlug =
    aliases && aliases.length ? aliases[0] : compatibilitySlug ? slug2 : slug

  // wrap permalink element around child <code> node, so clicking will set
  // the url to the anchor link.
  pNode.children[0] = {
    type: 'link',
    url: `#${permalinkSlug}`,
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

function processAlias(node, startIndex = 0) {
  // disqualify input that couldn't possibly be an alias
  if (
    !node ||
    !node.children ||
    !node.children.length ||
    node.children.length <= startIndex
  )
    return []

  // with the below regex, we look for ((#foo)) or ((#foo, #bar))
  //
  // NOTE: There is a potential improvement in the fidelity of this regex, but it's
  // an edge case and would make the code more complex, so skipping until we need it.
  // Will detail here in case its ever needed in the future though.
  //
  // Headline nodes include the headline and alias, like "foo ((#bar))", where inline
  // lists that start with code only include the content directly after the code, like
  // " ((#bar)) other text". Because of this difference in behavior, this regex does
  // not make assumptions about *where* the anchor link alias sits in the string. That
  // means that something like "# foo ((#bar)) baz" would still work for a headline, and
  // something like "- `foo` some text ((#bar)) more text" would still work for an inline
  // list with code. This behavior should not be permitted -- the alias should sit directly
  // _after_ the headline or inline code.
  //
  // It could be enforced by differentiating the regexes that the two types use, such that
  // the inline list code uses `/^\s*\(\((#.*?)\)\)/` and headline uses `/\s*\(\((#.*?)\)\)$/`
  // but at the moment this seems like unnecessary complexity.
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
    return _processAliases(firstNode, aliasRegex)
  }

  // next, we check for the more unusual scenario of the pattern being broken into
  // multiple nodes. the double parens are a "minimum viable match" so we'll look for
  // that in the first text node. if we match this, we can continue our search.
  const minimumViableRegex = /\s*\(\(#/
  const endRegex = /\)\)/
  if (firstNode.value && firstNode.value.match(minimumViableRegex)) {
    // now we need to figure out where the end of our pattern, "))", is. we find
    // this, then squash the entire thing together into a single node. any unusual nodes
    // other than text will be discarded. we can't deal with that, honestly.
    const endIndex = node.children.findIndex(
      (node) => node.value && node.value.match(endRegex)
    )

    // If there is a "((" pattern without a closing, never mind
    if (endIndex < 0) {
      return []
    }

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
    const deleteCount = endIndex - startIndex + 1
    node.children.splice(startIndex, deleteCount, {
      type: 'text',
      value: combinedText,
    })

    // and then proceed to process it as if none of this ever happened!
    return _processAliases(node.children[startIndex], aliasRegex)
  }

  return []
}

function _processAliases(node, aliasRegex) {
  // if we have a match, format into an array of slugs without the '#'
  const aliases = node.value
    .match(aliasRegex)[1]
    .split(',')
    .map((s) => s.trim().replace(/^#/, ''))

  // then remove the entire match from the element's actual text
  node.value = node.value.replace(aliasRegex, '')

  // and return the aliases
  return aliases || []
}

// This converts a raw array of aliases to html "target" nodes
function aliasesToNodes(aliases, id) {
  return aliases.map((alias) => {
    return {
      type: 'html',
      value: `<a class="__target-${id} __compat" id="${alias}" aria-hidden="true"></a>`,
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
  return getChildNodesText(node)
}

/**
 * Collect text from children nodes. This will visit
 * nodes recursively via "depth-first" strategy.
 *
 * @param {import('unist').Parent | import('unist').Node} node
 * @returns {string}
 */
function getChildNodesText(node) {
  const text = node.children.reduce((acc, child) => {
    if ('children' in child) {
      acc += getChildNodesText(child)
    } else if ('value' in child) {
      acc += child.value
    }
    return acc
  }, '')

  return text
}
