const is = require("unist-util-is");
const visit = require("unist-util-visit");

const sigils = {
    "=>": "success",
    "->": "info",
    "~>": "warning",
    "!>": "danger",
};

module.exports = () => tree => {
    visit(tree, "paragraph", (pNode, _, parent) => {
        visit(pNode, "text", textNode => {
            Object.keys(sigils).forEach(symbol => {
                if (textNode.value.startsWith(`${symbol} `)) {
                    // Remove the literal sigil symbol from string contents
                    textNode.value = textNode.value.replace(`${symbol} `, "");

                    // Wrap matched nodes with <div> (containing proper attributes)
                    parent.children = parent.children.map(node => {
                        return is(node, pNode)
                            ? {
                                  type: "div",
                                  children: [node],
                                  data: {
                                      hProperties: {
                                          className: [
                                              "alert",
                                              `alert-${sigils[symbol]}`,
                                          ],
                                          role: "alert",
                                      },
                                  },
                              }
                            : node;
                    });
                }
            });
        });
    });
};
