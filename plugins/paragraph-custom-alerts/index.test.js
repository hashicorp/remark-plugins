const remark = require('remark')
const html = require('remark-html')
const paragraphCustomAlerts = require('./index.js')

describe('paragraph-custom-alerts', () => {
  it('should produce the expected html output', () => {
    expect(
      remark()
        .use(paragraphCustomAlerts)
        .use(html)
        .processSync(`=> this is a success paragraph`)
        .toString()
    ).toMatch(
      '<div class="alert alert-success" role="alert"><p>this is a success paragraph</p></div>'
    )
  })

  it('should handle multiple paragraph blocks', () => {
    const md = `this is a normal, non-alert paragraph

~> this is a warning block

this is another "normal" block

=> success block here! yeah!`
    expect(
      remark()
        .use(paragraphCustomAlerts)
        .use(html)
        .processSync(md)
        .toString()
    ).toMatch(
      `<p>this is a normal, non-alert paragraph</p>
<div class="alert alert-warning" role="alert"><p>this is a warning block</p></div>
<p>this is another "normal" block</p>
<div class="alert alert-success" role="alert"><p>success block here! yeah!</p></div>`
    )
  })
})
