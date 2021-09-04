import { UUID, getUUID } from './UUID';

export const FRAGMENTABLETYPEID = 'fragmentedstring';
export const FRAGMENTTYPEID = 'fragment';
export const FILLERFRAGMENTTYPEID = 'filler-fragment';

export interface IFragmentableRange {
	start: number;
	end: number;
}

export interface IFragmentIntersectResult {
	fragment: Fragment;
	intersectType: IntersectType;
	children?: IFragmentIntersectResult[];
}

export type FragmentSelectionResult = IFragmentIntersectResult & {
	children?: IFragmentIntersectResult[];
};

// Fragments and RenderableFragments are seperated because the process
// of craeting fragments usually is done in two steps.
// 1.) Creating a fragment without knowing where to place it yet
// 2.) Getting the information of locality and place it into a RenderableString
const fragmentTypes = [
	'Mark',
	'Sentence',
	'Word',
	'Note',
	'Highlight',
	'Background',
] as const;
export type FragmentType = typeof fragmentTypes[number];

export interface IFragmentData {
	type: FragmentType;
}

export interface ISimpleFragmentData extends IFragmentData {
	type: 'Highlight' | 'Background';
}

export interface IMarkFragmentData extends IFragmentData {
	type: 'Mark';
	color: string;
	comment?: string;
}

export interface IWordFragmentData extends IFragmentData {
	type: 'Word';
	dictId: UUID;
}

export interface ISentenceFragmentData extends IFragmentData {
	type: 'Sentence';
	translation: string;
	words: Array<IFragment<IWordFragmentData>>;
}

export interface INoteFragmentData extends IFragmentData {
	type: 'Note';
	note: string;
}

export type FragmentData =
	| INoteFragmentData
	| ISentenceFragmentData
	| IWordFragmentData
	| IMarkFragmentData
	| ISimpleFragmentData;

export interface IFragment<T extends IFragmentData> {
	id: UUID;
	range: IFragmentableRange;
	// Not yet used. Helpfull when different fragments overlap and get
	// fragmented themselves
	fragmented?: 'left' | 'right';
	type: T['type'];
	data: T;
}

export type Fragment =
	| IFragment<IWordFragmentData>
	| IFragment<ISimpleFragmentData>
	| IFragment<ISentenceFragmentData>
	| IFragment<IMarkFragmentData>
	| IFragment<INoteFragmentData>;

export type ResolvedFragment<T extends IFragmentData> = IFragment<T> & {
	value: string;
};
export interface IFragmentableString {
	id: UUID;
	root: string;
	fragments: Array<Fragment>;
	showSpelling: boolean;
	highlightedFragment?: UUID;
}

const FragmentableString = (initial?: string): IFragmentableString => ({
	id: getUUID(),
	root: initial || '',
	fragments: [],
	showSpelling: true,
});

/**
 * Check if the target is between the given range
 *
 * @param {number} positions.target The target position to check
 * @param {IFragmentableRange} positions.range The range to check the target against
 * @returns {boolean} If the target is between the range
 */
const isBetween = ({
	target,
	range,
}: {
	target: number;
	range: IFragmentableRange;
}): boolean => {
	const { start, end } = range;
	return target >= start && target < end;
};

const normalizeRange = ({
	normalizer,
	target,
}: {
	normalizer: IFragmentableRange;
	target: IFragmentableRange;
}): IFragmentableRange => ({
	start: target.start - normalizer.start,
	end: target.end - normalizer.start,
});

// Helper to generate a type guard for a fragment type

function isFragmentDataType<T extends FragmentData['type']>(t: T) {
	return (x: FragmentData): x is Extract<FragmentData, { type: T }> => {
		return x.type === t;
	};
}

function isFragmentType<T extends Fragment['type']>(t: T) {
	return (x: Fragment): x is Extract<Fragment, { type: T }> => {
		return x.type === t;
	};
}

const intersectTypes = [
	'leftAnchor',
	'inside',
	'enclosed',
	'rightAnchor',
] as const;
export type IntersectType = typeof intersectTypes[number];

const checkFragmentInRange = ({
	range,
	fragment,
}: {
	range: IFragmentableRange;
	fragment: Fragment;
}): boolean => {
	return (
		isBetween({ target: fragment.range.start, range }) ||
		isBetween({ target: fragment.range.end - 1, range })
	);
};

/**
 * Returns every fragment in fragments with type of filter if they collide with the provided range.
 * @param range The text range to check if fragments are selected
 * @param fragments Array of fragments to check the range against
 * @param filter Type of fragments to consider while checking in range
 * @returns Every fragment in range of range and type of filter
 */
const getIntersectingFragments = ({
	range,
	fragments,
	filter,
}: {
	range: IFragmentableRange;
	fragments: Fragment[];
	filter?: FragmentType;
}): IFragmentIntersectResult[] => {
	const intersectedFragments: IFragmentIntersectResult[] = [];
	const targetFragments = filter
		? fragments.filter((fragment) => fragment.type === filter)
		: fragments;

	for (const fragment of targetFragments) {
		const rangeLeftInFragment = isBetween({
			target: range.start,
			range: fragment.range,
		});
		const rangeRightInFragment = isBetween({
			target: range.end - 1,
			range: fragment.range,
		});
		const enclosed = checkFragmentInRange({ range, fragment });

		if (rangeLeftInFragment || rangeRightInFragment || enclosed) {
			let intersectType: IntersectType;
			if (!rangeLeftInFragment && rangeRightInFragment)
				intersectType = 'leftAnchor';
			else if (rangeLeftInFragment && rangeRightInFragment)
				intersectType = 'inside';
			else if (rangeLeftInFragment && !rangeRightInFragment)
				intersectType = 'rightAnchor';
			else if (enclosed) intersectType = 'enclosed';
			else intersectType = 'inside';
			intersectedFragments.push({
				fragment,
				intersectType,
			});
		}
	}

	return intersectedFragments;
};

const getFragmentsInRange = ({
	range,
	fragments,
}: {
	range: IFragmentableRange;
	fragments: Fragment[];
}): FragmentSelectionResult[] => {
	const selectionResult: FragmentSelectionResult[] = [];
	const intersectResults = getIntersectingFragments({
		range,
		fragments,
	});

	for (const intersectResult of intersectResults) {
		const fragmentSelection: FragmentSelectionResult = {
			...intersectResult,
		};
		selectionResult.push(fragmentSelection);
		if (fragmentSelection.fragment.type === 'Sentence') {
			const currentRange = range;
			const normalizedRange = normalizeRange({
				normalizer: fragmentSelection.fragment.range,
				target: currentRange,
			});
			const activeInnerFragments: FragmentSelectionResult[] =
				getIntersectingFragments({
					range: normalizedRange,
					fragments: fragmentSelection.fragment.data.words,
					filter: 'Word',
				}).map((res) => ({
					...res,
					type: 'nested',
					parent: fragmentSelection,
				}));
			fragmentSelection.children = activeInnerFragments;
		}
	}
	return selectionResult;
};

const getFragmentTypesInSelection = (
	selectedFrgments: Array<FragmentSelectionResult>
): Array<FragmentType> => {
	const foundTypes = new Set<FragmentType>();

	for (const fragmentResult of selectedFrgments) {
		foundTypes.add(fragmentResult.fragment.type);
		if (fragmentResult.children) {
			for (const childFragmentResult of fragmentResult.children) {
				foundTypes.add(childFragmentResult.fragment.type);
			}
		}
	}

	return [...foundTypes];
};

const checkSelectionForType = ({
	type,
	selectedFragments,
}: {
	type: FragmentType;
	selectedFragments: FragmentSelectionResult[];
}): boolean => {
	return !!selectedFragments.find((f) => {
		if (f.fragment.type === type) {
			return true;
		}
		if (f.children) {
			return f.children.find((cf) => cf.fragment.type === type);
		}
		return false;
	});
};

/**
 * Checks if the target intersects with any other range and returns a new fragment array:
 *
 * containing the new range if it does not intersect or
 * not containing the new range if it does intersect with any other fragment
 *
 * @param target the target to be checked and pushed
 * @param fragments the fragments to check the target against
 * @returns the newly created fragments
 */
const pushFragment = ({
	target,
	fragments,
}: {
	target: Fragment;
	fragments: Fragment[];
}): Fragment[] => {
	const intersections = getIntersectingFragments({
		range: target.range,
		fragments,
	});
	if (intersections.length > 0) {
		for (const intersection of intersections) {
			switch (intersection.intersectType) {
				case 'leftAnchor': {
					const leftFragment = {
						...target,
						range: {
							start: target.range.start,
							end: intersection.fragment.range.start,
						},
					};
					const rightFragment: Fragment = {
						...target,
						range: {
							start: intersection.fragment.range.end,
							end: target.range.end,
						},
					};
					return [...fragments, leftFragment, rightFragment];
				}
				case 'rightAnchor': {
					const leftFragment = {
						...target,
						range: {
							start: target.range.start,
							end: intersection.fragment.range.start,
						},
					};
					const rightFragment: Fragment = {
						...target,
						range: {
							start: intersection.fragment.range.end,
							end: target.range.end,
						},
					};
					return [...fragments, leftFragment, rightFragment];
				}
				default:
					return [...fragments, target];
			}
		}
	}

	return [...fragments, target];
};

/**
 * Returns every fragment in fragments with type filter which are NOT intersecting with the provided range.
 * @param range The text range to check if fragments are selected
 * @param fragments Array of fragments to check the range against
 * @param filter Type of fragments to consider while checking in range
 * @returns Every fragment not in range of range and type of filter
 */
const removeFragmentsInRange = ({
	range,
	fragments,
	filter,
}: {
	range: IFragmentableRange;
	fragments: Fragment[];
	filter?: FragmentType;
}): Fragment[] => {
	const inRangeFragments = getIntersectingFragments({
		range,
		fragments,
		filter,
	}).map((rangeFrag) => rangeFrag.fragment);
	return fragments.filter(
		(fragment) => inRangeFragments.indexOf(fragment) === -1
	);
};

export {
	FragmentableString,
	checkFragmentInRange,
	isBetween,
	isFragmentType,
	isFragmentDataType,
	removeFragmentsInRange,
	pushFragment,
	getIntersectingFragments,
	getFragmentsInRange,
	checkSelectionForType,
	normalizeRange,
	getFragmentTypesInSelection,
};
