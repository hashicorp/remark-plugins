const remark = require('remark')
const html = require('remark-html')
const paragraphCustomAlerts = require('./index.js')

function remarkWithPlugin(markdown) {
  return remark()
    .use(paragraphCustomAlerts)
    .use(html)
    .processSync(markdown)
    .toString()
}

describe('paragraph-custom-alerts', () => {
  it('should render a success alert', () => {
    expect(remarkWithPlugin('=> this is a success paragraph')).toMatch(
      '<div class="alert alert-success g-type-body" role="alert"><p>this is a success paragraph</p></div>'
    )
  })

  it('should render an info alert', () => {
    expect(remarkWithPlugin('-> this is an info paragraph')).toMatch(
      '<div class="alert alert-info g-type-body" role="alert"><p>this is an info paragraph</p></div>'
    )
  })

  it('should render a warning alert', () => {
    expect(remarkWithPlugin('~> this is a warning paragraph')).toMatch(
      '<div class="alert alert-warning g-type-body" role="alert"><p>this is a warning paragraph</p></div>'
    )
  })

  it('should render a danger alert', () => {
    expect(remarkWithPlugin('!> this is a danger paragraph')).toMatch(
      '<div class="alert alert-danger g-type-body" role="alert"><p>this is a danger paragraph</p></div>'
    )
  })

  it('should handle multiple paragraph blocks', () => {
    const md = `this is a normal, non-alert paragraph

~> this is a warning block

this is another "normal" block

=> success block here! yeah!`
    expect(remarkWithPlugin(md)).toMatch(
      `<p>this is a normal, non-alert paragraph</p>
<div class="alert alert-warning g-type-body" role="alert"><p>this is a warning block</p></div>
<p>this is another "normal" block</p>
<div class="alert alert-success g-type-body" role="alert"><p>success block here! yeah!</p></div>`
    )
  })
})
