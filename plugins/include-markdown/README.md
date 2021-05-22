# Include Markdown Plugin

This plugin will transform a custom `@include "filename"` directive into the contents of the specified file, relative to the current file.

### Input

Your main markdown file:

```md
# My cool page

@include "disclaimer.md"

The rest of the content...
```

`disclaimer.md`, in the same directory:

```md
Disclaimer: This content is not guaranteed to be in any way useful or truthful.
```

### Output

```html
<h1>My cool page</h1>
<p>
  Disclaimer: This content is not guaranteed to be in any way useful or
  truthful.
</p>
<p>The rest of the content...</p>
```

### File Types

If you include a `.md` or `.mdx` file, its contents will be imported directly into the file, like a partial. If it has `@include` statements nested within it, they will all resolve recursively, as seen in the primary examples above

If any other file extension is included, it will be displayed as the contents of a code block, with the code block language tag set as the file extension. For example:

### Input

Your main markdown file:

```md
# My cool page

@include "test.js"

The rest of the content...
```

`test.js`, in the same directory:

```js
function sayHello(name) {
  console.log(`hello, ${name}!`)
}
```

### Output

```html
<h1>My cool page</h1>
<pre class="language-js">
  <code>
  function sayHello(name) {
    console.log(`hello, ${name}!`)
  }
  </code>
</pre>
<p>The rest of the content...</p>
```

### Options

This plugin accepts two optional config options: `resolveFrom` and `resolveMdx`.

#### `resolveFrom`

If you pass this option along with a path, all partials will resolve from the path that was passed in. For example:

```js
remark().use(includeMarkdown, { resolveFrom: path.join(__dirname, 'partials') })
```

With this config, you'd be able to put all your includes in a partials folder and require only based on the filename regardless of the location of your markdown file.

#### `resolveFrom`

If you pass a truthy value for this option, `.mdx` partials will be processed using [`remark-mdx`](https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx). This allows the use of custom components within partials. For example, with `next-mdx-remote`:

```js
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import CustomComponent from '../components/custom-component'

const components = { CustomComponent }

export default function TestPage({ source }) {
  return (
    <div className="wrapper">
      <MDXRemote {...source} components={components} />
    </div>
  )
}

export async function getStaticProps() {
  // Imagine "included-file.mdx" has <CustomComponent /> in it...
  // it will render as expected, since the @include extension
  // is .mdx and resolveMdx is true.
  const source = 'Some **mdx** text.\n\n@include "included-file.mdx"'
  const mdxSource = await serialize(source, {
    mdxOptions: {
      remarkPlugins: [[includeMarkdown, { resolveMdx: true }]],
    },
  })
  return { props: { source: mdxSource } }
}
```

**Note**: this option should only be used in MDX contexts. This option will likely break where `remark-stringify` is used as the stringify plugin, such as when using `remark` directly.

```js
// 🚨 DON'T DO THIS - it will likely just break.
// remark().use(includeMarkdown, { resolveMdx: true })
```

### Ordering

It's important to note that remark applies transforms in the order that they are called. If you want your other plugins to also apply to the contents of includeed files, you need to make sure that you apply the include content plugin **before all other plugins**. For example, let's say you have two plugins, one is this one to include markdown, and the other capitalizes all text, because yelling makes you more authoritative and also it's easier to read capitalized text. If you want to ensure that your includeed content is also capitalized, here's how you'd order your plugins:

```js
remark().use(includeMarkdown).use(capitalizeAllText)
```

If you order them the opposite way, like this:

```js
remark().use(capitalizeAllText).use(includeMarkdown)
```

...what will happen is that all your text will be capitalized _except_ for the text in included files. And on top of that, the include plugin wouldn't resolve the files properly, because it capitalized the word "include", which is the wrong syntax. So usually you want to make sure this plugin comes first in your plugin stack.
