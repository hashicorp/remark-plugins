const visit = require('unist-util-visit')

module.exports = function typographyPlugin() {
  return function transformer(tree) {
    // Add typography classes to headings
    visit(tree, 'heading', node => {
      const data = node.data || (node.data = {})
      const props = data.hProperties || (data.hProperties = {})

      if (node.depth === 1) {
        data.id = 'g-type-display-2'
        props.className = 'g-type-display-2'
      }
      if (node.depth === 2) {
        data.id = 'g-type-display-3'
        props.className = 'g-type-display-3'
      }
      if (node.depth === 3) {
        data.id = 'g-type-display-4'
        props.className = 'g-type-display-4'
      }
      if (node.depth === 4) {
        data.id = 'g-type-display-5'
        props.className = 'g-type-display-5'
      }
      if (node.depth === 5) {
        data.id = 'g-type-display-6'
        props.className = 'g-type-display-6'
      }
      if (node.depth === 6) {
        data.id = 'g-type-label'
        props.className = 'g-type-label'
      }
    })

    // Add typography classes to list items
    visit(tree, 'list', node => {
      node.children.map(li => {
        const data = li.data || (li.data = {})
        const props = data.hProperties || (data.hProperties = {})
        data.id = 'g-type-body'
        props.className = 'g-type-body'
      })
    })
  }
}
