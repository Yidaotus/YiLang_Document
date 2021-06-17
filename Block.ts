import { FragmentableStringNormalized } from 'store/editor/types';
import { UUID } from './UUID';
import { IFragmentableString } from './Fragment';

const blockTypes = ['Title', 'Paragraph', 'Dialog', 'List', 'Image'] as const;
export type BlockType = typeof blockTypes[number];

export interface IDialogLine {
	speaker: string;
	speech: FragmentableStringNormalized;
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

/* export interface IDocumentTitleBlock extends IDocumentBlock {
	type: 'DocumentTitle';
	content: ContentIdentifier;
} */

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
	title?: ContentIdentifier;
}

export interface IListBlockConfig {
	style: 'ordered' | 'unordered';
}
export interface IListBlock
	extends IConfigurableDocumentBlock<IListBlockConfig> {
	type: 'List';
	items: ContentIdentifier[];
}

export type DocumentBlock =
	| IImageBlock
	| IDialogBlock
	| ITitleBlock
	| IListBlock
	| IParagraphBlock;

export type ConfigurableBlockList<T> =
	T extends IConfigurableDocumentBlock<unknown> ? T : never;

export type ConfigurableBlock = ConfigurableBlockList<DocumentBlock>;

const isBlockType =
	<T extends DocumentBlock['type']>(type: T) =>
	(block: DocumentBlock): block is Extract<DocumentBlock, { type: T }> => {
		return block.type === type;
	};

export type ConfigForType<T extends BlockType> = Extract<
	ConfigurableBlock,
	{ type: T }
>['config'];

export { blockTypes, isConfigurableBlock, isBlockType };
