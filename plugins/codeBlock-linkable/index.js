const is = require("unist-util-is");
const visit = require("unist-util-visit");
const slugger = require("github-slugger")();

module.exports = () => (tree, file) => {
    visit(tree, "listItem", liNode => {
        visit(liNode, "paragraph", pNode => {
            visit(pNode, "inlineCode", codeNode => {
                // Construct an id/slug based on value of <code> node
                const codeSlug = slugger.slug(`inlineCode-${codeNode.value}`);

                // Add slug to parent <li> node's id attribute
                const data = liNode.data || (liNode.data = {});
                const props = data.hProperties || (data.hProperties = {});
                props.id = codeSlug;

                // Wrap link element around child <code> node
                pNode.children = pNode.children.map(node => {
                    return is(node, codeNode)
                        ? {
                              type: "link",
                              url: `#${codeSlug}`,
                              title: null,
                              children: [node],
                          }
                        : node;
                });
            });
        });
    });
};
