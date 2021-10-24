export type Option<T> = T | null;

// Use of never is only to type check at compile time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ensureNever = (x: never): void => {};

const assertNever = (x: never): never => {
	throw new Error(`Unexpected object: ${x}`);
};

const notUndefined = <T>(value: T | undefined): value is T => {
	return value !== undefined;
};

const substringWithLength = ({
	root,
	length,
	index,
}: {
	root: string;
	length: number;
	index: number;
}): string => {
	const sideLength = length / 2;
	let indexLeft = index - sideLength;
	let indexRight = index + sideLength;
	if (indexLeft < 0) {
		indexRight = sideLength + indexLeft * -1;
	} else if (indexRight > root.length) {
		indexLeft -= indexRight - root.length;
	}
	const foundSubstring = root.substring(indexLeft, indexRight);
	const foundSubstringSplit = foundSubstring.split('\n');
	let currentSplitLength = 0;
	let currentSplitIndex = 0;
	while (
		index > currentSplitLength &&
		currentSplitIndex < foundSubstringSplit.length - 1
	) {
		currentSplitLength += foundSubstringSplit[currentSplitIndex].length;
		currentSplitIndex++;
	}
	return foundSubstringSplit[currentSplitIndex];
};

export { assertNever, ensureNever, notUndefined, substringWithLength };
