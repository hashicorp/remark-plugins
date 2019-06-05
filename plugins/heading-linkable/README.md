# Linkable Headings

This plugin utilizes two existing remark plugins:

- [`remark-slug`](https://github.com/remarkjs/remark-slug)
- [`remark-autolink-headings`](https://github.com/remarkjs/remark-autolink-headings)

The result is headings are automatically linked, similar to how GitHub handles its headings.

### Input:

```mdx
# First Level Heading

## Second Level Heading

Content here...
```

### Output:

```html
<h1 id="first-level-heading"><a href="#first-level-heading" aria-hidden class="anchor">»</a>First Level Heading</h1>
<h2 id="second-level-heading"><a href="#second-level-heading" aria-hidden class="anchor">»</a>Second Level Heading</h1>
<p>Content here...</p>
```
