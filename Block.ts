import { UUID } from './UUID';
import { IFragmentableString } from './Fragment';

/*
const blockTypes = [
	'Title',
	'Paragraph',
	'Dialog',
	'List',
	'Image',
	'Subtitle',
] as const;
export type BlockType = typeof blockTypes[number];
*/
type ContentIdentifier = UUID;

export interface IDialogLine {
	speaker: string;
	speech: ContentIdentifier;
}

export interface IDocumentBlock<T extends BlockType, C = undefined> {
	id: ContentIdentifier;
	type: T;
	fragmentables: Array<IFragmentableString>;
	position: number;
	config: C;
}

/* export interface IDocumentTitleBlock extends IDocumentBlock {
	type: 'DocumentTitle';
	content: ContentIdentifier;
} */

export interface ITitleBlockConfig {
	size: number;
	subtitle: boolean;
}
export interface ITitleBlock
	extends IDocumentBlock<'Title', ITitleBlockConfig> {
	content: ContentIdentifier;
}

export interface IParagraphBlock extends IDocumentBlock<'Paragraph'> {
	content: ContentIdentifier;
}

export interface IDialogBlockLine {
	speaker: string;
	speech: ContentIdentifier;
}

export interface IDialogBlock extends IDocumentBlock<'Dialog'> {
	lines: IDialogBlockLine[];
}

export interface IImageBlockConfig {
	alignment: 'center' | 'left' | 'right';
}
export interface IImageBlock
	extends IDocumentBlock<'Image', IImageBlockConfig> {
	source: string;
	title?: ContentIdentifier;
}

export interface IListBlockConfig {
	style: 'ordered' | 'unordered';
}
export interface IListBlock extends IDocumentBlock<'List', IListBlockConfig> {
	items: ContentIdentifier[];
}

export type DocumentBlock =
	| IImageBlock
	| IDialogBlock
	| IListBlock
	| ITitleBlock
	| IParagraphBlock;

export type BlockType = DocumentBlock['type'];

const isBlockType =
	<T extends DocumentBlock['type']>(type: T) =>
	(block: DocumentBlock): block is Extract<DocumentBlock, { type: T }> => {
		return block.type === type;
	};

export type ConfigForType<T extends BlockType> = Extract<
	DocumentBlock,
	{ type: T }
>['config'];

export { isBlockType };
