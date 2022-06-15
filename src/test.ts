type ValidationType =
	| typeof String
	| typeof Number
	| typeof Boolean
	| typeof Object
	| typeof Array
	| "String"
	| "Number"
	| "Boolean"
	| "Object"
	| "Array";

type SchemaAttribute = {
	type?: ValidationType;
};

export const attributes = {
	content: { type: String },
};

type T = keyof { [name: string]: SchemaAttribute };

type T2 = keyof typeof attributes;
