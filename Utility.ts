export type Option<T> = T | null;

const assertNever = (x: never): never => {
	throw new Error(`Unexpected object: ${x}`);
};
export { assertNever };
