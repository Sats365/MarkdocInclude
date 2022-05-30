import MarkdownIt from "markdown-it";
import type { RenderableTreeNodes } from "../types";
import ReactDOMServer from "react-dom/server";
const { escapeHtml } = MarkdownIt().utils;

// HTML elements that do not have a matching close tag
// Defined in the HTML standard: https://html.spec.whatwg.org/#void-elements
const voidElements = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

export default function render(node: RenderableTreeNodes, { components = {} } = {}): string {
	if (typeof node === "string") return escapeHtml(node);

	if (Array.isArray(node)) return node.map((node) => render(node, { components })).join("");

	if (node === null || typeof node !== "object") return "";

	const { name, attributes, children = [] } = node;

	if (!name) return render(children, { components });

	let output = "";
	if (components[name]) {
		console.log(components[name]);
		output = ReactDOMServer.renderToString(components[name](attributes));
	} else {
		output = `<${name}`;
		for (const [k, v] of Object.entries(attributes ?? {})) output += ` ${k}="${escapeHtml(String(v))}"`;
		output += ">";
	}

	if (voidElements.has(name)) return output;

	if (children.length) output += render(children, { components });
	if (!components[name]) output += `</${name}>`;

	return output;
}
