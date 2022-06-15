import type { RenderableTreeNode, ValidationType } from "../types";

export default class Tag<Type = Record<string, ValidationType>> {
	readonly $$mdtype = "Tag" as const;

	name: string;
	attributes: Type;
	children: RenderableTreeNode[];

	constructor(name = "div", attributes: Type = {} as Type, children: RenderableTreeNode[] = []) {
		this.name = name;
		this.attributes = attributes;
		this.children = children;
	}
}
