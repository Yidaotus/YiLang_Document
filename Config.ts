export interface IDictionaryLookupSource {
	priority: number;
	name: string;
	source: string;
}

export interface ILanguageConfig {
	id: string;
	name: string;
	lookupSources: Array<IDictionaryLookupSource>;
}

export interface IEditorConfig {
	autoSave: boolean;
	saveEveryNActions: number;
}

export interface IConfig {
	languageConfigs: Array<ILanguageConfig>;
	activeLanguage: string | null;
	editorConfig: IEditorConfig;
}