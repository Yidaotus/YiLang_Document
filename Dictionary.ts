import { notUndefined } from './Utility';
import { UUID } from './UUID';

export interface IDocumentLink {
	documentId: UUID;
	position: Array<number>;
	offset: number;
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
