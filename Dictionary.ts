export interface IDocumentLink {
	documentId: string;
	position: Array<number>;
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
	id: string;
	key: string;
	lang: string;
	translations: string[];
	firstSeen?: IDocumentLink;
	tags: string[];
	comment?: string;
	spelling?: string;
	root?: string;
	createdAt: Date;
}

export interface IGrammarPoint {
	name: string;
	description: string;
	construction: string[];
}

export interface IDictionaryTag {
	id: string;
	name: string;
	lang: string;
	color?: string;
	grammarPoint?: IGrammarPoint; // Te versions are used for conjugation ect..
}

export type IDictionaryEntryResolved = Omit<IDictionaryEntry, 'tags'> & {
	tags: IDictionaryTag[];
};
