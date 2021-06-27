import { useEffect, useState } from 'react';

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

const useDebounce = <T>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handle = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handle);
		};
	}, [delay, value]);

	return debouncedValue;
};

export { assertNever, ensureNever, notUndefined, useDebounce };
