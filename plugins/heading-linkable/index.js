exports.plugins = [
  require("remark-slug"),
  [
    require("remark-autolink-headings"),
    {
      behavior: "prepend",
      content: [{ type: "text", value: "»" }],
      linkProperties: {
        ariaHidden: true,
        className: ["anchor"]
      }
    }
  ]
];
