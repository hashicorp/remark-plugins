const remark = require("remark");
const html = require("remark-html");
const headingLinkable = require("./index.js");

describe("heading-linkable", () => {
  it("produces expected html output", () => {
    expect(
      remark()
        .use(headingLinkable)
        .use(html)
        .processSync("# hello world")
        .toString()
    ).toMatch(
      '<h1 id="hello-world"><a href="#hello-world" aria-hidden class="anchor">»</a>hello world</h1>'
    );
  });
});
