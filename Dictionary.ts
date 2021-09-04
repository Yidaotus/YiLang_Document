import { IDocumentLink } from './Document';
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

export type IDictionaryEntryResolved = Omit<IDictionaryEntry, 'tags'> & {
	tags: IDictionaryTag[];
};
