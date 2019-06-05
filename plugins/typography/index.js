const visit = require('unist-util-visit')

module.exports = function hashicorpTypography() {
  return function transformer(ast) {
    // Add typography classes to headings
    visit(ast, 'heading', node => {
      const data = node.data || (node.data = {})
      const props = data.hProperties || (data.hProperties = {})

      if (node.depth === 1) {
        data.id = 'g-type-display-2'
        props.className = 'g-type-display-2'
      }
      if (node.depth === 2) {
        data.id = 'g-type-section-1'
        props.className = 'g-type-section-1'
      }
      if (node.depth === 3) {
        data.id = 'g-type-section-2'
        props.className = 'g-type-section-2'
      }
      if (node.depth === 4) {
        data.id = 'g-type-section-3'
        props.className = 'g-type-section-3'
      }
      if (node.depth === 5) {
        data.id = 'g-type-section-4'
        props.className = 'g-type-section-4'
      }
      if (node.depth === 6) {
        data.id = 'g-type-label'
        props.className = 'g-type-label'
      }
    })

    // Add typography classes to list items
    visit(ast, 'list', ast => {
      ast.children.map(li => {
        const data = li.data || (li.data = {})
        const props = data.hProperties || (data.hProperties = {})
        data.id = 'g-type-body'
        props.className = 'g-type-body'
      })
    })
  }
}
