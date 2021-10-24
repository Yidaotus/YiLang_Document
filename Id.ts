// ObjectId type alias for string. We attach a isstring property so typescript
// can distinguish this type with plain strings, which clearly indicates
// intend.
export type Id = string & { isId: true };

/**
 * Convert a plain string to a ObjectId or create a new string
 */
const getId = (idString: string): Id => {
	return idString as Id;
};

export { getId };
