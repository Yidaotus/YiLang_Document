import { IDocumentLink } from './Document';
import { notUndefined } from './Utility';
import { UUID } from './UUID';

export interface ITextPosition {
	start: number;
	end: number;
}

export interface ISource<T> {
	pos: ITextPosition;
	source: T;
}

export interface ISentence {
	content: string;
	translation: string;
}

export interface IDictionaryEntry {
	id: UUID;
	key: string;
	lang: string;
	translations: string[];
	firstSeen?: IDocumentLink;
	tags: UUID[];
	comment?: string;
	spelling?: string;
	root?: UUID;
	createdAt: Date;
}

export interface IDictionaryLookupSource {
	lang: string;
	name: string;
	source: string;
}

export interface IGrammarPoint {
	name: string;
	description: string;
	construction: string[];
}

export interface IDictionaryTag {
	id: UUID;
	name: string;
	lang: string;
	color?: string;
	grammarPoint?: IGrammarPoint; // Te versions are used for conjugation ect..
}

export type IDictionaryEntryResolved = Omit<
	IDictionaryEntry,
	'tags' | 'root'
> & {
	root?: IDictionaryEntryResolved;
	tags: IDictionaryTag[];
};

type UUIDRecord<T> = Partial<{ [key: string]: T }>;

const resolveEntry = ({
	entry,
	tags,
	dictionary,
}: {
	entry: IDictionaryEntry;
	tags: UUIDRecord<IDictionaryTag>;
	dictionary: UUIDRecord<IDictionaryEntry>;
}): IDictionaryEntryResolved => {
	let root: IDictionaryEntryResolved | undefined;
	if (entry.root) {
		const rootEntry = dictionary[entry.root];
		if (rootEntry) {
			const rootTags = rootEntry.tags
				.map((id) => tags[id])
				.filter(notUndefined);
			root = { ...rootEntry, tags: rootTags, root: undefined };
		}
	}
	const wordTags = entry.tags.map((id) => tags[id]).filter(notUndefined);
	const resolvedEntry = {
		...entry,
		root,
		tags: wordTags,
	};
	return resolvedEntry;
};

export { resolveEntry };
