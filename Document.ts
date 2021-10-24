import { DocumentBlock } from './Block';
import { IDocumentLink } from './Dictionary';
import { IFragmentableRange } from './Fragment';
import { BlockRenderMap } from './RenderMap';

export interface IDocument {
	name?: string;
	createdAt: Date;
	updatedAt: Date;
	title: string;
	id: string;
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
	blockId: string;
	fragmentableId: string;
	fragmentableRange: IFragmentableRange;
}

export interface IDocumentIdentifier {
	blockId: string;
	fragmentableId: string;
	fragmentId: string;
}

export interface IExcerptedDocumentLink {
	link: IDocumentLink;
	excerpt: string;
}
