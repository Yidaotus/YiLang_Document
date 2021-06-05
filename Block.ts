import { FragemntableStringNormalized } from 'store/editor/types';
import { UUID } from './UUID';
import { IFragmentableString } from './Fragment';

const blockTypes = ['Title', 'Paragraph', 'Dialog', 'Image'] as const;
export type BlockType = typeof blockTypes[number];

export interface IDialogLine {
	speaker: string;
	speech: FragemntableStringNormalized;
}

type ContentIdentifier = UUID;
export interface IDocumentBlock {
	id: ContentIdentifier;
	type: BlockType;
	fragmentables: Array<IFragmentableString>;
	position: number;
}

export interface ITitleBlock extends IDocumentBlock {
	type: 'Title';
	content: ContentIdentifier;
}

export interface IParagraphBlock extends IDocumentBlock {
	type: 'Paragraph';
	content: ContentIdentifier;
}

export interface IDialogBlockLine {
	speaker: string;
	speech: ContentIdentifier;
}

export interface IDialogBlock extends IDocumentBlock {
	lines: IDialogBlockLine[];
	type: 'Dialog';
}

export interface IImageBlock extends IDocumentBlock {
	type: 'Image';
	source: string;
	title?: string;
}

export type DocumentBlock =
	| IImageBlock
	| IDialogBlock
	| ITitleBlock
	| IParagraphBlock;

/* 
function notUndefined<T>(x: T | undefined): x is T {
	return x !== undefined;
}
*/

export { blockTypes };
