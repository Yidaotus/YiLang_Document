import { IDocument } from './Document';
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
	sourceDocument?: ISource<IDocument>;
	firstSeen?: ISource<ISentence>;
	tags: UUID[];
	// type: IEntryType;
	comment?: string;
	spelling?: string;
	variations: IDictionaryVariant[];
}

export interface IDictionaryVariant {
	key: string;
	tags?: UUID[];
	comment: string;
	spelling?: string;
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
