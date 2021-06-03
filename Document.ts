import { DocumentBlock } from './Block';
import { IFragmentableRange } from './Fragment';
import { UUID } from './UUID';

export interface IDocument {
	createdAt: Date;
	updatedAt: Date;
	id: UUID;
	blocks: { [key: string]: DocumentBlock };
	positions: { [key: string]: number };
}

export enum HighlightStyle {
	DOTTED,
	UNDERLINE,
	HIGHLIGHT,
}

export interface IEntryType {
	name: string;
	color: string;
	highlightStyle: HighlightStyle;
	comment?: string; // Te versions are used for conjugation ect..
}

export interface IEntrySubType {
	name: string;
	root: IEntryType;
	comment?: string; // Te versions are used for conjugation ect..
}

export interface ITextChunk {
	text?: string;
}

export interface IRubyChunk {
	base: string;
	rt: string;
}

export interface IDocumentSelection {
	blockId: UUID;
	fragmentableId: UUID;
	fragmentableRange: IFragmentableRange;
}

export interface IDocumentIdentifier {
	blockId: UUID;
	fragmentableId: UUID;
	fragmentId: UUID;
}
