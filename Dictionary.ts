import { DictionaryEntryID, DictionaryTagID, Ephemeral } from './Utility';

export interface IDocumentLink {
	documentId: string;
	position: Array<number>;
	sentenceId: string;
	offset: number;
}

export interface IDictionarySentence {
	id: string;
	content: string;
	translation: string;
	lang: string;
	source?: IDocumentLink;
}

export interface IDictionaryEntry {
	id: DictionaryEntryID;
	key: string;
	lang: string;
	translations: string[];
	firstSeen?: IDocumentLink;
	tags: DictionaryTagID[];
	comment?: string;
	spelling?: string;
	roots: DictionaryEntryID[];
	createdAt: Date;
}
export type IDictionaryEntryEphemeral = Ephemeral<IDictionaryEntry>;

export interface IGrammarPoint {
	name: string;
	description: string;
	construction: string[];
}

export interface IDictionaryTag {
	id: DictionaryTagID;
	name: string;
	lang: string;
	color?: string;
	grammarPoint?: IGrammarPoint;
}
export type IDictionaryTagEphemeral = Ephemeral<IDictionaryTag>;

export type IDictionaryEntryResolved = Omit<
	IDictionaryEntry,
	'tags' | 'roots'
> & { tags: Array<IDictionaryTag>; roots: Array<IDictionaryEntry> };
