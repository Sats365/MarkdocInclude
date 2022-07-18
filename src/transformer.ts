import Tag from "./ast/tag";
import { Class } from "./schema-types/class";
import type { Config, Node, NodeType, Schema, RenderableTreeNode, RenderableTreeNodes, SchemaAttribute } from "./types";

type AttributesSchema = Schema["attributes"];

export const globalAttributes: AttributesSchema = {
	class: { type: Class, render: true },
	id: { type: String, render: true },
};

export interface Transformer {
	findSchema(node: Node, config: Config): Schema | undefined;
	node(node: Node, config: Config): RenderableTreeNodes;
	attributes(node: Node, config: Config): Record<string, any>;
	children(node: Node, config: Config): RenderableTreeNode[];
}

export default {
	findSchema(node: Node, { nodes = {}, tags = {} }: Config = {}): Schema {
		return node.tag ? tags[node.tag] : nodes[node.type as NodeType];
	},

	attributes(node: Node, config: Config = {}) {
		const schema = this.findSchema(node, config) ?? {};
		const output: Record<string, any> = {};

		const attrs = { ...globalAttributes, ...schema.attributes };
		for (const [key, attr] of Object.entries(attrs)) {
			if ((attr as SchemaAttribute).render == false) continue;

			const name = typeof (attr as SchemaAttribute).render === "string" ? (attr as SchemaAttribute).render : key;

			let value = node.attributes[key];
			if (typeof (attr as any).type === "function") {
				const instance: any = new (attr as any).type();
				if (instance.transform) {
					value = instance.transform(value, config);
				}
			}
			value = value === undefined ? (attr as SchemaAttribute).default : value;

			if (value === undefined) continue;
			output[name as string] = value;
		}
		return output;
	},

	children(node: Node, config: Config = {}) {
		return node.children.flatMap((child) => this.node(child, config, node));
	},

	node(node: Node, config: Config = {}, parent?: Node) {
		const schema = this.findSchema(node, config) ?? {};
		if (schema && schema.transform instanceof Function) {
			const tag = schema.transform(node, config, parent);
			return tag;
		}

		const children = this.children(node, config);
		if (!schema || !schema.render) return children;

		const attributes = this.attributes(node, config);
		return new Tag(schema.render, attributes, children);
	},
} as Transformer;
