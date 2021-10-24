import { DocumentBlock } from './Block';
import { IDocumentLink } from './Dictionary';
import { IFragmentableRange } from './Fragment';
import { BlockRenderMap } from './RenderMap';
import { UUID } from './UUID';

export interface IDocument {
	name?: string;
	createdAt: Date;
	updatedAt: Date;
	title: string | null;
	id: UUID;
	blocks: Array<DocumentBlock>;
	renderMap: BlockRenderMap;
	lang: string;
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

export interface IExcerptedDocumentLink {
	link: IDocumentLink;
	excerpt: string;
}
