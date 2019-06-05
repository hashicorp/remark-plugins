# Linkable Inline Code Blocks

This plugin links to any [`InlineCode` Node](https://github.com/syntax-tree/mdast#inlinecode) that appears within a [`ListItem` Node](https://github.com/syntax-tree/mdast#listitem)

### Input

```mdx
- First item
- Second item
- `Third` item contains code
```

### Output

```html
<ul>
  <li>First item</li>
  <li>Second item</li>
  <li id="inlinecode-third">
    <a href="#inlinecode-third"><code>Third</code></a>
    item contains code
  </li>
</ul>
```
