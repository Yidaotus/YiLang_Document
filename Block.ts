import { FragemntableStringNormalized } from 'store/editor/types';
import { UUID } from './UUID';
import { IFragmentableString } from './Fragment';

const blockTypes = [
	'Title',
	'DocumentTitle',
	'Paragraph',
	'Dialog',
	'Image',
] as const;
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

const isConfigurableBlock = (
	block: IDocumentBlock
): block is IConfigurableDocumentBlock<unknown> => {
	return (block as IConfigurableDocumentBlock<unknown>).config !== undefined;
};
export interface IConfigurableDocumentBlock<T> extends IDocumentBlock {
	config: T;
}

export interface IDocumentTitleBlock extends IDocumentBlock {
	type: 'DocumentTitle';
	content: ContentIdentifier;
}

export interface ITitleBlockConfig {
	size: number;
	subtitle: boolean;
}
export interface ITitleBlock
	extends IConfigurableDocumentBlock<ITitleBlockConfig> {
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

export interface IImageBlockConfig {
	alignment: 'center' | 'left' | 'right';
}
export interface IImageBlock
	extends IConfigurableDocumentBlock<IImageBlockConfig> {
	type: 'Image';
	source: string;
	title?: string;
}

export type DocumentBlock =
	| IImageBlock
	| IDialogBlock
	| ITitleBlock
	| IDocumentTitleBlock
	| IParagraphBlock;

export type ConfigurableBlock = IImageBlock | ITitleBlock;

const isBlockType =
	<T extends DocumentBlock['type']>(type: T) =>
	(block: DocumentBlock): block is Extract<DocumentBlock, { type: T }> => {
		return block.type === type;
	};

export type BlockConfigurator<
	T extends ConfigurableBlock,
	V extends keyof T['config']
> = {
	blockType: T['type'];
	title: string;
	icon: React.ReactNode;
	parameter: V;
	value: T['config'][V];
};

/* 
function notUndefined<T>(x: T | undefined): x is T {
	return x !== undefined;
}
*/

export { blockTypes, isConfigurableBlock, isBlockType };
